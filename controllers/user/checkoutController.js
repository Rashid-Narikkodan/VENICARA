const Address = require("../../models/Address");
const Cart = require("../../models/Cart");
const PaymentMethod = require("../../models/PaymentMethod");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Coupon = require("../../models/Coupon");
const generateOrderId = require('../../helpers/orderID');

const handleError =require('../../helpers/handleError')

const showAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.session.user.id });
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    }).populate("productId").lean();

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
    const paymentMethods = await PaymentMethod.find({});
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    }).populate("productId").lean();

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
  } catch (error) {
    handleError(res, "showPaymentMethods", error);
  }
};

const handlePlaceOrder = async (req, res) => {
  try {
    const { user, address } = req.session;
    const { paymentMethod, code } = req.body;

    if (!user?.id) return res.status(401).json({ status: false, message: "Unauthenticated" });
    if (!address) return res.status(400).json({ status: false, message: "Shipping address not selected" });

    const cartItems = await Cart.find({ userId: user.id, status: "active" })
      .populate("productId")
      .lean();
    if (!cartItems.length) return res.status(400).json({ status: false, message: "No items in cart" });

    const coupon = code ? await Coupon.findOne({ code }) : null;
    if (code && !coupon) return res.status(400).json({ status: false, message: "Invalid coupon code" });

    const payment =
      paymentMethod === "wallet"
        ? { method: "wallet", status: "paid", provider: "InAppWallet", transactionId: null, paidAt: new Date() }
        : paymentMethod === "online"
        ? { method: "online", status: "pending", provider: null, transactionId: null, paidAt: new Date() }
        : { method: "cod", status: "pending" };

    let totalAmount = 0;
    const products = [];
    for (const item of cartItems) {
      const variant = item.productId?.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant) throw new Error(`Variant not found for product ${item.productId?._id}`);

      if (variant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productId.name} (${variant.volume}ml)`);
      }

      const image = item.productId.images[0];
      const subtotal = Number(variant.discount - 1) * item.quantity;
      totalAmount += subtotal;

      products.push({
        productId: item.productId._id,
        variantId: item.variantId,
        productName: item.productId.name,
        originalPrice: Number(variant.basePrice),
        discountPrice: Number(variant.discount),
        quantity: item.quantity,
        subtotal,
        volume: variant.volume,
        image,
      });
    }

    if (coupon) totalAmount -= coupon?.discount;
    totalAmount = parseFloat(totalAmount.toFixed(2));

    const orderId = await generateOrderId();

    await Order.create({
      userId: user.id,
      orderId,
      products,
      shippingAddress: address,
      payment,
      couponApplied: coupon?._id || null,
      totalAmount,
    });

    // Update stock for each product
    for (const prod of products) {
      const product = await Product.findById(prod.productId);
      if (product) {
        const variant = product.variants.id(prod.variantId);
        if (variant) {
          variant.stock -= prod.quantity;
          await product.save();
        }
      }
    }

    await Cart.deleteMany({ userId: user.id, status: "active" });

    return res.json({ status: true, message: "Order placed successfully", orderId });
  } catch (error) {
    handleError(res, "handlePlaceOrder", error);
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
  handlePlaceOrder,
  showPlaceOrder,
};
