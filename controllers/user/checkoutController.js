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

/**
 * Show addresses for checkout
 */
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

    req.session.order = {};
    let totalCartAmount = 0;
    // Update line totals for cart items
    for (const p of cartDocs) {
      const variant = p.productId?.variants.find(
        (v) => v._id.toString() === p.variantId.toString()
      );

      p.lineTotal = Math.round(variant.finalAmount * p.quantity);
      await p.save();
      totalCartAmount += variant?.finalAmount * p.quantity;
      if (variant.stock < p.quantity) {
        console.log("adgaergerg");
        req.flash("error", "Remove those out of stock products from cart");
        return res.redirect("/cart");
      }
    }
    // Calculate delivery charge based on total
    req.session.order.deliveryCharge = totalCartAmount > 7000 ? 0 : 500;

    // Prepare items for checkout
    let items = cartDocs
      .map((doc) => {
        const variant = doc.productId?.variants.find(
          (v) => v._id.toString() === doc.variantId.toString()
        );
        if (!variant) return null;
        return {
          cartId: doc._id,
          quantity: doc.quantity,
          product: doc.productId,
          status: doc.status,
          variant,
        };
      })
      .filter(Boolean); // remove nulls

    res.render("userPages/checkoutAddress", {
      addresses,
      items,
      deliveryCharge: req.session.order.deliveryCharge,
    });
  } catch (error) {
    handleError(res, "showAddress", error);
  }
};

/**
 * Show add address page
 */
const showAddAddress = (req, res) => {
  try {
    res.render("userPages/checkoutAddressAdd");
  } catch (error) {
    handleError(res, "showAddAddress", error);
  }
};

/**
 * Add new address
 */
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

/**
 * Show edit address page
 */
const showEditAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    res.render("userPages/checkoutAddressEdit", { address });
  } catch (error) {
    handleError(res, "showEditAddress", error);
  }
};

/**
 * Edit existing address
 */
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

/**
 * Select shipping address
 */
const handleSelectAddress = (req, res) => {
  try {
    req.session.address = req.body.selectedAddress;
    return res.status(200).json({ status: true });
  } catch (error) {
    handleError(res, "handleSelectAddress", error);
  }
};

/**
 * Show payment methods
 */
const showPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ isActive: true });
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    })
      .populate("productId")
      .lean();

      delete req.session?.coupon

    let items = cartDocs
      .map((doc) => {
        const variant = doc.productId?.variants.find(
          (v) => v._id.toString() === doc.variantId.toString()
        );
        if (!variant) return null;
        return {
          cartId: doc._id,
          quantity: doc.quantity,
          product: doc.productId,
          status: doc.status,
          variant,
        };
      })
      .filter(Boolean);



    // 🔴 Check stock for all items
    const invalidItems = items.filter(
      (item) => item.variant.stock < item.quantity
    );

    if (invalidItems.length > 0) {
      const names = invalidItems.map((i) => i.product.name).join(", ");
      req.flash("error", `Some products are out of stock: ${names}`);
      return res.redirect("/cart");
    }

    // Calculate total & line totals
    let total = 0;
    for (const item of items) {
      item.lineTotal = item.variant.finalAmount * item.quantity;
      total += item.lineTotal;
    }

    const deliveryCharge = req.session.order?.deliveryCharge || 0;
    total += deliveryCharge;

    // Get valid coupons
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

/**
 * Apply coupon
 */
const applyCoupon = async (req, res) => {
  try {
    // clear any old coupon
    delete req.session.coupon;

    const { code } = req.body;

    // find coupon
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

    // store coupon in session
    req.session.coupon = coupon._id;

    // fetch cart items
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    })
      .populate("productId")
      .lean();

    let lineTotal = 0;

    for (const doc of cartDocs) {
      const variant = doc.productId?.variants.find(
        (v) => v._id.toString() === doc.variantId.toString()
      );

      if (!variant) continue;

      // 🔴 STOCK CHECK
      if (variant.stock < doc.quantity) {
        return res.status(400).json({
          status: false,
          message: `Some Products are Out of Stock, please check...`,
        });
      }

      // accumulate totals
      lineTotal += variant.finalAmount * doc.quantity;
    }

    // calculate discount & final total
    let discPerc = coupon.discount
    const discount = Math.min(parseFloat(((lineTotal * coupon.discount) / 100).toFixed(2)),coupon.maxDiscountAmount);
    const deliveryCharge = req.session.order?.deliveryCharge || 0;
    if(discount == coupon.maxDiscountAmount){
      discPerc = parseFloat(discount/lineTotal*100).toFixed(2)
    }
    const finalAmount = parseFloat(lineTotal - discount + deliveryCharge);

    // send response
    res.json({
      status: true,
      message: "Applied",
      discount,
      finalAmount,
      discPerc,
      actualDiscount:coupon.discount
    });
  } catch (error) {
    handleError(res, "applyCoupon", error);
  }
};

/**
 * Cancel coupon
 */
const cancelCoupon = (req, res) => {
  try {
    delete req.session.coupon;
    res.json({ status: true, message: "Coupon cancelled" });
  } catch (error) {
    handleError(res, "cancelCoupon", error);
  }
};

/**
 * Place order
 */
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

    // Prepare products
    let totalOrderPrice = 0;
    const products = [];

    for (const item of cartItems) {
      const variant = item.productId?.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant) continue;

      if (variant.stock < item.quantity) {
        return res
          .status(400)
          .json({
            status: false,
            message: `Insufficient stock for ${item.productId.name} (${variant.volume}ml)`,
          });
      }

      const subtotal = Number(variant.finalAmount) * item.quantity;
      totalOrderPrice += subtotal;

      products.push({
        productId: item.productId._id,
        variantId: item.variantId,
        productName: item.productId.name,
        basePrice: Number(variant.basePrice),
        finalAmount: parseFloat(variant.finalAmount),
        discount: Number(variant.finalDiscount || 0),
        quantity: item.quantity,
        subtotal,
        volume: variant.volume,
        status:paymentMethod==="RAZORPAY"?'pending':'confirmed',
        image: item.productId.images[0].url,
      });
    }

    // Apply coupon
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
        couponAmount = Math.min(parseFloat(((coupon.discount / 100) * totalOrderPrice).toFixed(2))||0,coupon.maxDiscountAmount)
        if(couponAmount === coupon.maxDiscountAmount){
          couponDiscount = 0
        }
        finalAmount -= couponAmount;

        await Coupon.updateOne(
          { _id: coupon._id, usedBy: { $ne: user.id } },
          { $push: { usedBy: user.id }, $inc: { used: 1 } }
        );

      }
    }

    finalAmount = parseFloat((finalAmount + req.session.order.deliveryCharge).toFixed(2));

    // Payment handling
    let payment = {
      method: paymentMethod,
      status: "pending",
      transactionId: null,
    };
    let razorpayOrderId = null;

    if (paymentMethod === "RAZORPAY") {
      const MAX_AMOUNT = 50000000; // In paise, for ₹5,00,000
      if (finalAmount*100 > MAX_AMOUNT) {
        return res.status(400).json({status: false,
          message: "Amount exceeds maximum allowed in Razorpay Test Mode."
        });
      }

      const options = {
        amount: parseInt(finalAmount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        payment_capture: 1,
      };
      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    } else if (paymentMethod === "WALLET") {
      const wallet = await Wallet.findOne({ userId: user.id });
      if (!wallet || wallet?.balance < finalAmount) {
        await WalletTransaction.create({
          userId: user.id,
          type: "debit",
          amount: finalAmount * 100,
          status: "failed",
          lastBalance: wallet?.balance,
        });
        if (req.session.coupon) {
          coupon = await Coupon.findById(req.session.coupon);
          if (coupon) {
            await Coupon.updateOne(
              { _id: coupon._id },
              { $pull: { usedBy: user.id }, $inc: { used: -1 } }
            );
          }
        }

        return res.json({ status: false, message: "Insufficient balance" });
      }
      wallet.balance = parseFloat((wallet.balance - finalAmount).toFixed(2));
      await wallet.save();
      await WalletTransaction.create({
        userId: user.id,
        type: "debit",
        amount: finalAmount * 100,
        status: "success",
        lastBalance: wallet.balance,
      });
      payment.status = "paid";
      payment.method = "WALLET";
      payment.paidAt = new Date();
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
      couponAmount,
      deliveryCharge: req.session.order.deliveryCharge,
      finalAmount,
      status: paymentMethod==='RAZORPAY'?'pending':'confirmed',
      razorpayOrderId,
    });

    // Reduce stock
    for (const item of cartItems) {
      await Product.updateOne(
        { _id: item.productId._id, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
    }

    // Clear cart (if not Razorpay)
    if (paymentMethod !== "RAZORPAY")
      await Cart.deleteMany({ userId: user.id });

    delete req.session.coupon;

    return res.json({
      status: true,
      message: "Order created successfully",
      orderId,
      razorpayOrderId,
      finalAmount,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: false,
      message: `${error}`,
    });
  }
};

/**
 * Razorpay success callback
 */
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
      prod.status = 'confirmed'
      await Product.updateOne(
        { _id: prod.productId, "variants._id": prod.variantId },
        { $inc: { "variants.$.stock": -prod.quantity } }
      );
      await order.save();

    }

    // Mark coupon as used
    if (order.couponApplied) {
      await Coupon.updateOne(
        { _id: order.couponApplied, usedBy: { $ne: order.userId } },
        { $push: { usedBy: order.userId }, $inc: { used: 1 } }
      );
    }

    delete req.session?.coupon;

    // Clear cart
    await Cart.deleteMany({ userId: order.userId, status: "active" });
    
    res.json({ status: true, message: "Payment verified and order completed" });
  } catch (err) {
    console.error("Razorpay success handler error:", err);
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
};

const handleRazorpayFailed = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.session.user.id;
    
    const order = await Order.findOne({ orderId });
    await Cart.deleteMany({ userId: order.userId, status: "active" });
    
    res.json({
      status: true,
      message: "Payment failed, Order placed as pending, Pleas Retry....",
    });
    delete req.session?.coupon;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        status: false,
        message: "Server error in handling razorpay failed",
      });
  }
};

/**
 * Show place order page
 */
const showPlaceOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    res.render("userPages/placeOrder", { orderId });
  } catch (error) {
    handleError(res, "showPlaceOrder", error);
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
  handlePlaceOrder,
  handleRazorpaySuccess,
  handleRazorpayFailed,
  showPlaceOrder,
};
