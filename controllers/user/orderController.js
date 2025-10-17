const Order = require("../../models/Order");
const Product = require("../../models/Product");
const handleError = require("../../helpers/handleError");
const generateInvoice = require("../../helpers/generateInvoice");
const Coupon = require("../../models/Coupon");
const Wallet = require("../../models/Wallet");
const WalletTransaction = require("../../models/WalletTransaction");
const Review = require("../../models/Review");
const User = require("../../models/User");
const razorpay = require("../../config/payment");
const crypto = require("crypto");

const showOrders = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) return res.redirect("/login");
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 6);

    const user = await User.findById(userId);

    const orders = await Order.find({ userId })
      .populate("products.productId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments({ userId });
    const totalPages = totalOrders / limit;

    res.render("userPages/orders", {
      orders,
      user,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    handleError(res, "showOrders", error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const userId = req.session.user.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order)
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });

    if (["delivered", "shipped"].includes(order.status))
      return res.json({
        status: false,
        message: "cannot cancel the order in this stage",
      });

    for (const product of order.products) {
      if (product.status !== "confirmed") continue;
      // Restore stock
      await Product.updateOne(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );
      product.status = "cancelled";
    }

    // Refund to wallet if prepaid
    if (["WALLET", "RAZORPAY"].includes(order.payment.method)) {
      if (order.payment.status === "pending") {
        order.status = "cancelled";
        await order.save();
        return res.status(200).json({
          status: true,
          message:
            "Order cancelled successfully, No refunds since you didn't paid Amount",
        });
      }

      let wallet = await Wallet.findOne({ userId });
      if (!wallet) wallet = new Wallet({ userId, balance: 0 });

      let refundAmount = parseFloat(order.finalAmount.toFixed(2));

      if (order.couponApplied) {
        const totalRefund = parseFloat(
          (order.refundAmount + order.finalAmount).toFixed(2)
        );
        const orginalAmount =
          order.totalOrderPrice -
          ((order.totalOrderPrice * order.couponDiscount) / 100).toFixed(2);
        if (totalRefund > orginalAmount) {
          const extraMoney = totalRefund - orginalAmount;
          refundAmount -= extraMoney;
          order.couponApplied = null;
          order.couponDiscount = 0;
        }
      }

      wallet.balance = parseFloat((wallet.balance + refundAmount).toFixed(2));
      await wallet.save();

      await WalletTransaction.create({
        userId,
        orderId,
        type: "credit",
        amount: refundAmount * 100,
        status: "success",
        lastBalance: wallet.balance,
        note: "Refund for cancelled order",
      });

      order.payment.status = "refunded";
      order.refundAmount += refundAmount;
      order.finalAmount = 0;
    }

    order.status = "cancelled";
    await order.save();
    return res
      .status(200)
      .json({ status: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong" });
  }
};

const returnProductRequest = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { index } = req.query;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });

    const product = order.products[index];
    if (!product)
      return res
        .status(400)
        .json({ status: false, message: "Invalid product index" });

    let cleanReason = reason
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    product.return.isRequested = true;
    product.return.reason = cleanReason;

    await order.save();

    res
      .status(200)
      .json({ status: true, message: "Return request submitted for product" });
  } catch (error) {
    handleError(res, "returnProductRequest", error);
  }
};

const cancelProduct = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { index } = req.query;
    const userId = req.session.user.id;

    const [order, wallet] = await Promise.all([
      Order.findOne({ _id: orderId, userId }),
      Wallet.findOne({ userId }),
    ]);
    if (!order)
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });
    if (!wallet) wallet = new Wallet({ userId, balance: 0 });

    const product = order.products[index];
    if (!product)
      return res
        .status(400)
        .json({ status: false, message: "Invalid product index" });
    if (product.status === "cancelled")
      return res
        .status(400)
        .json({ status: false, message: "Already cancelled" });
    if (["cancelled", "returned"].includes(product.status))
      return res
        .status(400)
        .json({ status: false, message: "Product already cancelled/returned" });
    if (["delivered", "shipped", "Out of delivery"].includes(product.status))
      return res
        .status(400)
        .json({ status: false, message: "Cannot cancel at this stage" });

    await Product.updateOne(
      { _id: product.productId, "variants._id": product.variantId },
      { $inc: { "variants.$.stock": product.quantity } }
    );
    product.status = "cancelled";

    if (["RAZORPAY", "WALLET"].includes(order.payment.method)) {
      const couponId = order.couponApplied;
      let refundAmount = 0;

      if (couponId) {
        const coupon = await Coupon.findById(couponId).lean();
        const discountPercent = order.couponDiscount;

        if (order.couponAmount < coupon.maxDiscountAmount) {
          let productPaid = parseFloat(
            (
              product.subtotal -
              product.subtotal * (discountPercent / 100)
            ).toFixed(2)
          );
          const amount = parseFloat(
            (order.finalAmount - productPaid).toFixed(2)
          );

          if (amount < coupon.minPrice) {
            const remainings = order.products.filter(
              (p, i) =>
                i !== index && !["cancelled", "returned"].includes(p.status)
            );
            const remainingsTotal = remainings.reduce(
              (sum, p) => sum + p.subtotal * (discountPercent / 100),
              0
            );
            productPaid -= parseFloat(remainingsTotal.toFixed(2));
            order.couponApplied = null;
          }
          refundAmount = productPaid;
        } else {
          const totalSubtotal = order.totalOrderPrice;
          const totalDiscount = order.couponAmount;
          const productShare = parseFloat(
            (product.subtotal / totalSubtotal).toFixed(2)
          );
          const productDiscount = parseFloat(
            (totalDiscount * productShare).toFixed(2)
          );
          let productPaid = parseFloat(
            (product.subtotal - productDiscount).toFixed(2)
          );
          const amount = parseFloat(
            (order.finalAmount - productPaid).toFixed(2)
          );

          if (amount < coupon.minPrice) {
            const remainings = order.products.filter(
              (p, i) => i !== index && p.status === "confirmed"
            );
            const remainingsTotal = remainings.reduce((sum, p) => {
              const share = parseFloat((p.subtotal / totalSubtotal).toFixed(2));
              const discount = parseFloat((totalDiscount * share).toFixed(2));
              return sum + discount;
            }, 0);
            productPaid -= parseFloat(remainingsTotal.toFixed(2));
            order.couponApplied = null;
          }
          refundAmount = productPaid;
        }
      } else {
        refundAmount = parseFloat(product.subtotal.toFixed(2));
      }

      const totalPaid = order.totalOrderPrice - (order.couponAmount || 0);
      const totalRefunded = order.refundAmount || 0;
      if (totalRefunded + refundAmount > totalPaid)
        refundAmount = parseFloat((totalPaid - totalRefunded).toFixed(2));

      order.finalAmount = parseFloat(
        (order.finalAmount - refundAmount).toFixed(2)
      );
      if (!order.refundAmount) order.refundAmount = 0;
      product.refundAmount = parseFloat(refundAmount.toFixed(2));
      order.refundAmount += parseFloat(refundAmount.toFixed(2));

      wallet.balance = parseFloat((wallet.balance + refundAmount).toFixed(2));
      await wallet.save();

      await WalletTransaction.create({
        userId,
        type: "credit",
        amount: refundAmount * 100,
        status: "success",
        lastBalance: wallet.balance,
      });
    }

    if (order.products.every((p) => p.status === "cancelled"))
      order.status = "cancelled";
    else if (order.products.every((p) => p.status === "returned")) {
      order.status = "returned";
      order.payment.status = "refunded";
    }

    await order.save();
    res
      .status(200)
      .json({ status: true, message: "Product cancelled successfully" });
  } catch (error) {
    console.error("cancelProduct error:", error);
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};

const returnOrderRequest = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });

    let cleanReason = reason
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    order.return.isRequested = true;
    order.return.reason = cleanReason;
    order.save();

    res
      .status(200)
      .json({ status: true, message: "Return request submitted for order" });
  } catch (error) {
    handleError(res, "returnOrderRequest", error);
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.session.user?.id;

    if (!userId) {
      req.flash("error", "Login required");
      return res.redirect("/login");
    }

    // Fetch order and populate required fields
    const order = await Order.findOne({ _id: orderId, userId })
      .populate("userId", "name email") // Get user details
      .populate("shippingAddress") // Get full shipping address
      .lean();

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    const discountAmount = order.products.reduce(
      (acc, p) => acc + (p.discountAmount || 0),
      0
    );

    // Ensure all necessary fields exist for the PDF
    const populatedOrder = {
      ...order,
      orderId: order.orderId || order._id,
      userId: {
        name: order.userId?.name || "N/A",
        email: order.userId?.email || "N/A",
      },
      shippingAddress: {
        fullName: order.shippingAddress?.fullName || "N/A",
        street: order.shippingAddress?.street || "N/A",
        city: order.shippingAddress?.city || "N/A",
        state: order.shippingAddress?.state || "N/A",
        pin: order.shippingAddress?.pin || "N/A",
        mobile: order.shippingAddress?.mobile || "N/A",
      },
      products: order.products?.map((p) => ({
        productName: p.productName || "N/A",
        volume: p.volume || "-",
        quantity: p.quantity || 0,
        discountPrice: p.finalDiscount || 0,
        subtotal: p.subtotal || 0,
        createdAt: order.createdAt || new Date(),
        finalAmount: p.finalAmount || 0,
        discountAmount: p.discountAmount || 0,
      })),
      totalAmount: order.totalAmount || 0,
      payment: {
        method: order.payment?.method || "N/A",
      },
      status: order.status || "N/A",
    };

    console.log(populatedOrder);
    // Generate the invoice PDF
    generateInvoice(populatedOrder, res);
  } catch (error) {
    handleError(res, "downloadInvoice", error);
  }
};

const orderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { index } = req.query;

    // Fetch order
    const order = await Order.findById(id).populate("shippingAddress");
    if (!order) {
      return res.status(404).send("Order not found");
    }
    const product = order.products[index];
    res.render("userPages/orderDetails", {
      order,
      product,
      payment: order.payment,
      shippedAddress: order.shippingAddress,
    });
  } catch (error) {
    handleError(res, "orderDetails", error);
  }
};
const addReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { name, rating, message } = req.body;

    if (!rating || !message || !name || !productId) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    const existingReview = await Review.findOne({
      userId: req.session.user.id,
      productId: productId,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.message = message;
      existingReview.name = name;
      await existingReview.save();
    } else {
      await Review.create({
        name,
        rating,
        message,
        userId: req.session.user.id,
        productId,
      });
    }

    res
      .status(201)
      .json({ status: true, message: "Review added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    const MAX_AMOUNT = 50000000; // In paise, for ₹5,00,000
    if (order.finalAmount * 100 > MAX_AMOUNT) {
      return res.status(400).json({
        status: false,
        message: "Amount exceeds maximum allowed in Razorpay.",
      });
    }

    const options = {
      amount: order.finalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    const razorpayOrderId = razorpayOrder.id;

    res.status(200).json({
      status: true,
      orderId: order.orderId,
      razorpayOrderId,
      finalAmount: order.finalAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

const retryPaymentSuccess = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res
        .status(400)
        .json({ status: false, message: "Payment verification failed" });

    const order = await Order.findOne({ orderId });
    if (!order)
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });

    order.payment.status = "paid";
    order.payment.transactionId = razorpay_payment_id;
    order.payment.paidAt = new Date();
    order.status = "confirmed";
    await order.save();

    // Reduce stock
    for (const prod of order.products) {
      prod.status = "confirmed";
      await order.save();
    }

    // Mark coupon as used
    if (order.couponApplied) {
      await Coupon.updateOne(
        { _id: order.couponApplied, usedBy: { $ne: order.userId } },
        { $push: { usedBy: order.userId }, $inc: { used: 1 } }
      );
    }
    res.json({ status: true, message: "Payment verified and order completed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal error" });
  }
};
module.exports = {
  showOrders,
  cancelOrder,
  returnOrderRequest,
  cancelProduct,
  returnProductRequest,
  downloadInvoice,
  orderDetails,
  addReview,
  retryPayment,
  retryPaymentSuccess,
};
