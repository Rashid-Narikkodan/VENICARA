const Address = require("../../models/Address");
const Cart = require("../../models/Cart");
const PaymentMethod = require("../../models/PaymentMethod");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Coupon = require("../../models/Coupon");
const generateOrderId = require("../../helpers/orderID");
const handleError = require("../../helpers/handleError");
const razorpay = require("../../config/payment");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const WalletTransaction = require("../../models/WalletTransaction");
const crypto = require("crypto");

const showAddress = async (req, res) => {
  try {
    const addresses = await Address.find({
      userId: req.session.user.id,
      isDeleted: false,
    });
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    }).populate("productId");

    req.session.order={}

    for (const p of cartDocs) {
      const variant = p.productId?.variants.find(
        (v) => v._id.toString() === p.variantId.toString()
      );
      if (variant) {
        p.lineTotal = Math.round(variant.finalAmount * p.quantity);
        await p.save();
      }
    }

    const items = cartDocs.map((doc) => {
      const variant = doc.productId?.variants.find(
        (v) => v._id.toString() === doc.variantId.toString()
      );
      return {
        cartId: doc._id,
        quantity: doc.quantity,
        product: doc.productId,
        status: doc.status,
        variant,
      };
    });

    items.forEach((item) => {
      if (item.variant == undefined) {
        items.splice(items.indexOf(item), 1);
      }
    });
    const totalCartAmount=items.reduce((sum,p)=>{
      console.log(p.variant.finalAmount)
      return sum+p.variant.finalAmount
    },0)
    req.session.order.deliveryCharge = totalCartAmount>3000?0:200

    res.render("userPages/checkoutAddress", { addresses, items,deliveryCharge:req.session.order.deliveryCharge });
  } catch (error) {
    handleError(res, "showAddress", error);
  }
};

const showAddAddress = (req, res) => {
  try {
    res.render("userPages/checkoutAddressAdd");
  } catch (error) {
    handleError(res, "showAddAddress", error);
  }
};

const handleAddAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    } = req.body;

    const newAddress = new Address({
      userId: req.session.user.id,
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    });

    await newAddress.save();
    req.flash("success", "New address added");
    res.redirect("/checkout/address");
  } catch (error) {
    handleError(res, "handleAddAddress", error);
  }
};

const showEditAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    res.render("userPages/checkoutAddressEdit", { address });
  } catch (error) {
    handleError(res, "showEditAddress", error);
  }
};

const handleEditAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    } = req.body;

    const addressById = await Address.findById(req.params.id);
    if (!addressById) {
      req.flash("error", "Address not found");
      return res.redirect("/profile/address");
    }

    const update = {
      fullName: fullName || addressById.fullName,
      mobile: mobile || addressById.mobile,
      pin: pin || addressById.pin,
      street: street || addressById.street,
      address: address || addressById.address,
      city: city || addressById.city,
      state: state || addressById.state,
      landmark: landmark || addressById.landmark,
      alternateMobile: alternateMobile || addressById.alternateMobile,
      type: type || addressById.type,
    };

    await Address.findByIdAndUpdate(req.params.id, update, { new: true });
    req.flash("success", "Address updated successfully");
    res.redirect("/checkout/address");
  } catch (error) {
    handleError(res, "handleEditAddress", error);
  }
};

const showPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ isActive: true });
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    })
      .populate("productId")
      .lean();

    const items = cartDocs.map((doc) => {
      const variant = doc.productId?.variants.find(
        (v) => v._id.toString() === doc.variantId.toString()
      );
      return {
        cartId: doc._id,
        quantity: doc.quantity,
        product: doc.productId,
        status: doc.status,
        variant,
      };
    });

    items.forEach((item) => {
      if (item.variant == undefined) {
        items.splice(items.indexOf(item), 1);
      }
    });

    let total = 0;
    items.forEach((item) => {
      let lineTotal = item.variant.finalAmount * item.quantity;
      item.lineTotal = lineTotal;
      total += lineTotal;
    });
    const deliveryCharge = req.session.order.deliveryCharge
    total+=deliveryCharge

    const coupons = await Coupon.find({
      minPrice: { $lte: total },
      expireAt: { $gte: new Date() },
      usedBy: { $nin: [req.session.user.id] },
      isDeleted: false,
      $expr: { $lt: ["$used", "$limit"] },
    });
    const user = await User.findById(req.session.user.id);
    res.render("userPages/checkoutPayment", {
      paymentMethods,
      items,
      coupons,
      total,
      deliveryCharge,
      user,
    });
  } catch (error) {
    handleError(res, "showPaymentMethods", error);
  }
};

const applyCoupon = async (req, res) => {
  try {
    delete req.session.coupon;
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code,
      isDeleted: false,
      expireAt: { $gte: new Date() },
    });

    if (!coupon) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired coupon" });
    }
    req.session.coupon = coupon._id;
    const cartItems = await Cart.find({ userId: req.session.user.id }).populate(
      "productId"
    );

    const lineTotal = cartItems.reduce((ac, cu) => ac + (cu.lineTotal || 0), 0);
    const discount = Math.round((lineTotal * coupon.discount) / 100);
    const finalAmount = (lineTotal - discount) + req.session.order.deliveryCharge;
    const discPerc = coupon.discount;
    res.json({
      status: true,
      message: "Applied",
      discount,
      finalAmount,
      discPerc,
      
    });
  } catch (error) {
    handleError(res, "applyCoupon", error);
  }
};

const cancelCoupon = (req, res) => {
  try {
    delete req.session.coupon;
    res.json({ status: true, message: "coupon cancelled" });
  } catch (error) {
    handleError(res, "cancelCoupon", error);
  }
};

const handlePlaceOrder = async (req, res) => {
  try {
    const { user, address } = req.session;
    const { paymentMethod } = req.body;

    if (!user?.id)
      return res
        .status(401)
        .json({ status: false, message: "Unauthenticated" });
    if (!address)
      return res
        .status(400)
        .json({ status: false, message: "Shipping address not selected" });

    const cartItems = await Cart.find({ userId: user.id, status: "active" })
      .populate("productId")
      .lean();

    if (!cartItems.length)
      return res
        .status(400)
        .json({ status: false, message: "No items in cart" });

    // Prepare products & calculate total
    let totalOrderPrice = 0;
    const products = [];
    for (const item of cartItems) {
      const variant = item.productId?.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant) continue;

      if (variant.stock < item.quantity)
        return res.status(400).json({
          status: false,
          message: `Insufficient stock for ${item.productId.name} (${variant.volume}ml)`,
        });

      const subtotal = Number(variant.finalAmount) * item.quantity;
      totalOrderPrice += subtotal;

      products.push({
        productId: item.productId._id,
        variantId: item.variantId,
        productName: item.productId.name,
        basePrice: Number(variant.basePrice),
        finalAmount: Number(variant.finalAmount),
        discount: Number(variant.finalDiscount || 0),
        quantity: item.quantity,
        subtotal,
        volume: variant.volume,
        image: item.productId.images[0],
      });
    }

    // Apply coupon if exists
    let couponDiscount = 0;
    let couponAmount = 0;
    let coupon = null;
    let finalAmount = totalOrderPrice;
    if (req.session.coupon) {
      coupon = await Coupon.findById(req.session.coupon);
      if (coupon && coupon.usedBy.includes(user.id))
        return res
          .status(400)
          .json({ status: false, message: "Coupon already used" });

      if (coupon) {
        couponDiscount = coupon.discount;
        couponAmount = Math.floor((coupon.discount / 100) * totalOrderPrice) || 0;
        finalAmount-=couponAmount;

        await Coupon.updateOne(
          { _id: coupon._id, usedBy: { $ne: user.id } },
          { $push: { usedBy: user.id }, $inc: { used: 1 } }
        );
      }
    }
    finalAmount = parseFloat((finalAmount+req.session.order.deliveryCharge).toFixed(2));
    

    // Payment placeholder
    let payment = {
      method: paymentMethod,
      status: "pending",
      transactionId: null,
    };
    let razorpayOrderId = null;

    if (paymentMethod === "RAZORPAY") {
      const options = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        payment_capture: 1,
      };
      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    } else if (paymentMethod === "WALLET") {
      const wallet = await Wallet.findOne({ userId: req.session.user.id });
      if (!wallet || wallet?.balance < finalAmount) {
        await WalletTransaction.create({
          userId: req.session.user.id,
          type: "debit",
          amount: finalAmount * 100, // store in paise
          status: "failed",
          lastBalance: wallet?.balance,
        });
        return res.json({ status: false, message: "Insufficient balance" });
      }
      let lastBalance = (wallet.balance -= finalAmount);
      await wallet.save();
      await WalletTransaction.create({
        userId: req.session.user.id,
        type: "debit",
        amount: finalAmount * 100, // store in paise
        status: "success",
        lastBalance,
      });
      payment.status = "paid";
      payment.method = "WALLET";
      payment.paidAt = new Date();
    } else if (paymentMethod === "COD") {
      payment.status = "pending";
    }

    const orderId = await generateOrderId();

    await Order.create({
      userId: user.id,
      orderId,
      products,
      shippingAddress: address,
      payment,
      couponApplied: coupon?._id || null,
      totalOrderPrice,
      couponDiscount,
      deliveryCharge:req.session.order.deliveryCharge,
      finalAmount,
      status: "pending",
      razorpayOrderId,
    });

    delete req.session.coupon;

    for (const item of cartItems) {
      await Product.updateOne(
        { _id: item.productId._id, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }

    if (paymentMethod !== "RAZORPAY")
      await Cart.deleteMany({ userId: req.session.user.id });

    return res.json({
      status: true,
      message: "Order created successfully",
      orderId,
      razorpayOrderId,
      finalAmount,
    });
  } catch (error) {
    handleError(res, "handlePlaceOrder", error);
  }
};

const handleRazorpaySuccess = async (req, res) => {
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
    console.log(razorpay_signature === expectedSignature);

    if (expectedSignature !== razorpay_signature)
      return res
        .status(400)
        .json({ status: false, message: "Payment verification failed" });

    // Update order
    const order = await Order.findOne({ orderId });
    if (!order)
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });

    order.payment.status = "paid";
    order.payment.transactionId = razorpay_payment_id;
    order.payment.paidAt = new Date();
    order.status = "pending";

    await order.save();

    // Reduce stock
    for (const prod of order.products) {
      await Product.updateOne(
        { _id: prod.productId, "variants._id": prod.variantId },
        { $inc: { "variants.$.stock": -prod.quantity } }
      );
    }

    // Mark coupon as used
    if (order.couponApplied) {
      await Coupon.updateOne(
        { _id: order.couponApplied, usedBy: { $ne: order.userId } },
        { $push: { usedBy: order.userId }, $inc: { used: 1 } }
      );
    }

    // Clear cart
    await Cart.deleteMany({ userId: order.userId, status: "active" });

    res.json({ status: true, message: "Payment verified and order completed" });
  } catch (err) {
    console.error("Razorpay success handler error:", err);
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};


const showPlaceOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    res.render("userPages/placeOrder", { orderId });
  } catch (error) {
    handleError(res, "showPlaceOrder", error);
  }
};

const handleSelectAddress = (req, res) => {
  try {
    req.session.address = req.body.selectedAddress;
    return res.status(200).json({ status: true });
  } catch (error) {
    handleError(res, "handleSelectAddress", error);
  }
};

module.exports = {
  showAddress,
  showAddAddress,
  handleAddAddress,
  showEditAddress,
  handleEditAddress,
  handleSelectAddress,
  showPaymentMethods,
  applyCoupon,
  cancelCoupon,
  handleRazorpaySuccess,
  handlePlaceOrder,
  showPlaceOrder,
};
