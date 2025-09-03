const Address = require("../../models/Address");
const Cart = require("../../models/Cart");
const PaymentMethod = require("../../models/PaymentMethod");
const Order = require("../../models/Order");
const Coupon = require("../../models/Coupon");
const { nanoid } = require("nanoid");

const showAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.session.user.id });
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
    res.render("userPages/selectAddress", { addresses, items });
  } catch (error) {
    console.error("Error in showAddress:", error);
    res.status(500).send(`from showAddress: ${error.message}`);
  }
};
const showAddAddress = (req, res) => {
  try {
    res.render("userPages/checkoutAddressAdd");
  } catch (er) {
    console.log(er.message);
    res.status(500).send("showNewAddress :- " + er.message);
  }
};
const handleAddAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile, // from form -> user mobile number
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
      userId: req.session.user.id, // assuming logged-in user is available
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
  } catch (er) {
    console.log(er.message);
    res.status(500).send("handleNewAddress :- " + er.message);
  }
};

const showEditAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    res.render("userPages/checkoutAddressEdit", { address });
  } catch (er) {
    console.log(er.message);
    res.status(500).send("showEditAddess :- " + er.message);
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
      fullName: fullName ? fullName : addressById.fullName,
      mobile: mobile ? mobile : addressById.mobile,
      pin: pin ? pin : addressById.pin,
      street: street ? street : addressById.street,
      address: address ? address : addressById.address,
      city: city ? city : addressById.city,
      state: state ? state : addressById.state,
      landmark: landmark ? landmark : addressById.landmark,
      alternateMobile: alternateMobile
        ? alternateMobile
        : addressById.alternateMobile,
      type: type ? type : addressById.type,
    };

    await Address.findByIdAndUpdate(req.params.id, update, { new: true });

    req.flash("success", "Address updated successfully");
    res.redirect("/checkout/address");
  } catch (err) {
    console.error("handleEditAddress Error:", err.message);
    res.status(500).send("handleEditAddress :- " + err.message);
  }
};
const showPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({});
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
    res.render("userPages/payment", { paymentMethods, items });
  } catch (er) {
    console.log(er.message);
    res.status(500).send("showEditAddess :- " + er.message);
  }
};
const handlePlaceOrder = async (req, res) => {
  try {
    const { user, address } = req.session;
    const { paymentMethod, code } = req.body;

    if (!user?.id) return res.status(401).json({ status: false, message: "Unauthenticated" });
    if (!address) return res.status(400).json({ status: false, message: "Shipping address not selected" });

    // Get cart items
    const cartItems = await Cart.find({ userId: user.id, status: "active" })
      .populate("productId")
      .lean();
    if (!cartItems.length) return res.status(400).json({ status: false, message: "No items in cart" });

    // Check coupon
    const coupon = code ? await Coupon.findOne({ code }) : null;
    if (code && !coupon) return res.status(400).json({ status: false, message: "Invalid coupon code" });

    // Payment object
    const payment =
      paymentMethod === "wallet"
        ? { method: "wallet", status: "paid", provider: "InAppWallet", transactionId: null, paidAt: new Date() }
        : paymentMethod === "online"
        ? { method: "online", status: "pending", provider: null, transactionId: null }
        : { method: "cod", status: "pending" };

    // Build products + total
    let totalAmount = 0;
    const products = cartItems.map((item) => {
      const variant = item.productId?.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant) throw new Error(`Variant not found for product ${item.productId?._id}`);

      const subtotal = Number(variant.discount-1) * item.quantity;
      totalAmount += subtotal;

      return {
        productId: item.productId._id,
        variantId: item.variantId,
        productName: item.productId.name,
        originalPrice: Number(variant.basePrice),
        discountPrice: Number(variant.discount),
        quantity: item.quantity,
        subtotal,
      };
    });

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // Save order
    const newOrder = await Order.create({
      userId: user.id,
      orderId: `ORD-${nanoid(6).toUpperCase()}`,
      products,
      shippingAddress: address,
      payment,
      couponApplied: coupon?._id || null,
      totalAmount,
    });

    // Clear cart
    await Cart.deleteMany({ userId: user.id, status: "active" });

    return res.json({ status: true, message: "Order placed successfully", orderId: newOrder.orderId });
  } catch (error) {
    console.error("handlePlaceOrder error:", error);
    return res.status(500).json({ status: false, message: `handlePlaceOrder :- ${error.message}` });
  }
};

const showPlaceOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    res.render("userPages/placeOrder", { orderId });
  } catch (error) {
    res.status(500).send("showPlaceOrder :- " + error.message);
  }
};

const handleSelectAddress = (req, res) => {
  try {
    console.log(req.body.selectedAddress);
    req.session.address = req.body.selectedAddress;
    return res.status(200).json({ status: true });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
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
  handlePlaceOrder,
  showPlaceOrder,
};
