const Order = require("../../models/Order");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const WalletTransaction = require("../../models/WalletTransaction");
const Product = require("../../models/Product"); // ✅ Need this for stock update
const handleError = require("../../helpers/handleError");
const Coupon = require("../../models/Coupon");
// SHOW ALL ORDERS (with pagination + search)
const showOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim() || "";
    const sortOption = req.query.sort?.trim() || "";

    const filter = {};

    // Search by orderId or email
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ orderId: { $regex: escaped, $options: "i" } }];

      const users = await User.find(
        { email: { $regex: escaped, $options: "i" } },
        { _id: 1 }
      ).lean();

      if (users.length) {
        filter.$or.push({ userId: { $in: users.map((u) => u._id) } });
      }
    }

    if (status) {
      filter.status = status;
    }

    let sortQuery = { createdAt: -1 };
    switch (sortOption) {
      case "date_asc":
        sortQuery = { createdAt: 1 };
        break;
      case "date_desc":
        sortQuery = { createdAt: -1 };
        break;
      case "amount_asc":
        sortQuery = { totalAmount: 1 };
        break;
      case "amount_desc":
        sortQuery = { totalAmount: -1 };
        break;
    }

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("userId", "email")
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalOrders / limit);

    return res.render("adminPages/orders", {
      page: "orders",
      orders,
      currentPage: page,
      totalPages,
      limit,
      search,
      status,
      sort: sortOption,
      count: (page - 1) * limit,
    });
  } catch (error) {
    handleError(res, "showOrders", error);
  }
};

// SHOW ORDER DETAILS
const showOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId")
      .populate("shippingAddress")
      .populate("couponApplied")
      .lean();

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    return res.render("adminPages/orderDetails", {
      page: "orders",
      order,
      count: 0,
    });
  } catch (error) {
    handleError(res, "showOrderDetails", error);
  }
};

/// HANDLE INDIVIDUAL PRODUCT STATUS
const handleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { index } = req.query;
    const { status } = req.body;

    // 1. Find order
    const order = await Order.findById(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    // 2. Validate product index
    const product = order.products[index];
    if (!product) {
      req.flash("error", "Invalid product index");
      return res.redirect(`/admin/order/${id}`);
    }

    const userId = order.userId;

    // 3. Handle stock & refund if returned
    if (status === "returned") {
      product.isRequested = false;

      // Restore stock
      await Product.findOneAndUpdate(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );

      if (["WALLET", "RAZORPAY"].includes(order.payment.method)) {
        let refundAmount = product.subtotal;
        // === Coupon Handling ===
        let coupon = null;
        if (order.couponApplied) {
          coupon = order.couponApplied;
          // Remaining total after excluding this product
          const remainingTotal = order.products.reduce((sum, p, i) => {
            if (i == index || ["returned", "cancelled"].includes(p.status))
              return sum;
            return sum + p.subtotal;
          }, 0);

          // Case 1: Coupon becomes invalid
          if (remainingTotal < order.couponApplied.minPrice) {
            // Deduct full coupon discount from this refund
            refundAmount =
              product.subtotal -
              Math.floor((order.totalOrderPrice * order.couponDiscount) / 100);

            // Remove coupon from order
            order.couponApplied = null;
            order.couponDiscount = 0;
            order.finalAmount = remainingTotal;
          } else {
            // Case 2: Coupon still valid → refund proportional share
            const orderTotalBeforeDiscount = order.products.reduce(
              (sum, p) =>
                ["returned", "cancelled"].includes(p.status)
                  ? sum
                  : sum + p.subtotal,
              0
            );
            refundAmount = Math.round(
              (product.subtotal / orderTotalBeforeDiscount) * order.finalAmount
            );
          }
        }

        // === Wallet Update ===
        const wallet = await Wallet.findOne({ userId });
        wallet.balance += refundAmount;
        await wallet.save();

        await WalletTransaction.create({
          userId,
          type: "credit",
          status: "success",
          amount: refundAmount * 100, // in paise
          lastBalance: wallet.balance,
        });
      }
    }

    // 4. Update product status
    product.status = status;

    // 5. Update order status based on all products
    const allSameStatus = order.products.every(
      (p) =>
        p.status === status && !["returned", "cancelled"].includes(p.status)
    );
    if (allSameStatus) order.status = status;

    if (status === "returned") {
      const allReturned = order.products.every((p) => p.status === "returned");
      if (allReturned) order.status = "returned";
    }
    if (status === "cancelled") {
      const allCancelled = order.products.every(
        (p) => p.status === "cancelled"
      );
      if (allCancelled) order.status = "cancelled";
    }
    if (status === "delivered") {
      product.return.returnTimeLimit = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 5000
      ); // 2 days from now
    }

    // Save order updates

    await order.save();

    if (order.status === "delivered") {
      order.return.returnTimeLimit = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 5000
      );
      await order.save();
    }

    // 6. Response
    req.flash("success", "Product status updated successfully");
    return res.redirect(`/admin/order/${id}`);
  } catch (error) {
    handleError(res, "handleProductStatus", error);
  }
};

//  WHANDLEHOLE ORDER STATUS
const handleOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    const userId = order.userId;
    order.status = status;

    if (status === "returned" || status === "cancelled") {
      order.isRequested = false;
      order.products.forEach(async (p) => {
        await Product.findOneAndUpdate(
          { _id: p.productId, "variants._id": p.variantId },
          { $inc: { "variants.$.stock": p.quantity } }
        );
      });
    }
    const totalToWallet = order.finalAmount;

    if (status === "returned") {
      if (["WALLET", "RAZORPAY"].includes(order.payment.method)) {
        const wallet = await Wallet.findOne({ userId });
        wallet.balance += totalToWallet;
        await wallet.save();
        await WalletTransaction.create({
          userId,
          type: "credit",
          status: "success",
          amount: 100 * totalToWallet,
          lastBalance: wallet.balance,
        });
      }
    }

    // change per product status
    order.products.forEach((p) => {
      if (p.status !== "cancelled" && p.status !== "returned") {
        p.status = status;

        if (status === "delivered") {
          p.return.returnTimeLimit = new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          );
        }
      }
    });

    if (status === "delivered") {
      order.return.returnTimeLimit = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 5000
      ); // 2 days from now
      order.payment.status = "paid";
    }

    await order.save();

    return res.redirect(`/admin/order/${id}`);
  } catch (error) {
    handleError(res, "handleOrderStatus", error);
  }
};

const rejectReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { index } = req.query;
    const { rejectReason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    if (index !== undefined) {
      const productIndex = parseInt(index, 10);

      if (
        isNaN(productIndex) ||
        productIndex < 0 ||
        productIndex >= order.products.length
      ) {
        req.flash("error", "Invalid product index");
        return res.redirect(`/admin/order/${orderId}`);
      }

      // Product-level reject
      order.products[productIndex].return.isRequested = false;
      order.products[productIndex].return.status = "rejected";
      order.products[productIndex].return.adminReason = rejectReason;
    } else {
      // Order-level reject
      order.return.isRequested = false;
      order.return.status = "rejected";
      order.return.adminReason = rejectReason;
    }

    await order.save();
    req.flash("success", "Return request rejected");
    return res.redirect(`/admin/order/${orderId}`);
  } catch (error) {
    handleError(res, "rejectOrderReturn", error);
  }
};

const approveReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { index } = req.query;
    const order = await Order.findById(orderId);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/admin/orders");
    }

    const userId = order.userId;

    if (index !== undefined) {
      const productIndex = parseInt(index, 10);
      if (
        isNaN(productIndex) ||
        productIndex < 0 ||
        productIndex >= order.products.length
      ) {
        req.flash("error", "Product not found");
        return res.redirect(`/admin/order/${orderId}`);
      }

      const product = order.products[productIndex];
      if (!product) {
        req.flash("error", "No products exists");
        return res.redirect(`/admin/order/${orderId}`);
      }
      if(product.status !== 'delivered'){
        req.flash("error", "Delivered products can only return");
        return res.redirect(`/admin/order/${orderId}`);
      }

      // Product-level approve
      product.status = "returned";
      product.return.isRequested = false;
      product.return.status = "approved";

      //stock restore
      await Product.updateOne(
        { _id: product.productId, "variants._id": product.variantId },
        { $inc: { "variants.$.stock": product.quantity } }
      );

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) wallet = new Wallet.create({ userId, balance: 0 });

      let refundAmount = parseFloat(product.subtotal.toFixed(2));

      //refund logic if coupon applied
      if (order.couponApplied) {
        const coupon = await Coupon.findById(order.couponApplied);
        const { minPrice: minPurchase } = coupon;

        const newTotalPrice =
          order.totalOrderPrice - (order.refundAmount + product.subtotal);

        if (newTotalPrice < minPurchase) {
          const discount = (order.totalOrderPrice * order.couponDiscount) / 100;
          refundAmount = parseFloat((product.subtotal - discount).toFixed(2));
          order.couponApplied = null;
          order.couponDiscount = 0;
        }

        order.finalAmount =
          newTotalPrice -
          ((newTotalPrice * order.couponDiscount) / 100).toFixed(2);
      } else {
        order.finalAmount -= refundAmount;
      }

      wallet.balance += parseFloat(refundAmount.toFixed(2));
      await wallet.save();
      await WalletTransaction.create({
        userId,
        orderId,
        productId: product.productId,
        type: "credit",
        amount: refundAmount * 100,
        status: "success",
        lastBalance: wallet.balance,
      });
      order.refundAmount += refundAmount;

      const allReturned = order.products.every((p) => p.status === "returned");
      if (allReturned) order.status = "returned";
    }

    //Order level Return Approve Logics
    else {
      order.status = "returned";
      order.return.isRequested = false;
      order.return.status = "approved";
      for (const p of order.products) {
        if (p.status === "delivered") {
          p.status = "returned";
          p.return.isRequested = false;
          p.return.status = "approved";

          await Product.updateOne(
            { _id: p.productId, "variants._id": p.variantId },
            { $inc: { "variants.$.stock": p.quantity } }
          );
        }
      }

      //refund for all COD,RAZORPAY,WALLET
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) wallet = new Wallet.create({ userId, balance: 0 });

      let refundAmount = parseFloat(order.finalAmount.toFixed(2));

      if (order.couponApplied) {
        const totalRefund = order.refundAmount + order.finalAmount;
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

      wallet.balance += parseFloat(refundAmount.toFixed(2));
      await wallet.save();
      await WalletTransaction.create({
        userId,
        orderId,
        type: "credit",
        amount: refundAmount * 100,
        status: "success",
        lastBalance: wallet.balance,
      });
      order.finalAmount = 0;
      order.refundAmount += refundAmount;
      order.payment.status = "refunded";
    }
    await order.save();
    return res
      .status(200)
      .json({ success: true, message: "Return request approved" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error approving return request" });
  }
};

module.exports = {
  showOrders,
  showOrderDetails,
  handleProductStatus,
  handleOrderStatus,
  rejectReturn,
  approveReturn,
};
