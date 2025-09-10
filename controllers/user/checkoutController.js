const Address = require("../../models/Address");
const Cart = require("../../models/Cart");
const PaymentMethod = require("../../models/PaymentMethod");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Coupon = require("../../models/Coupon");
const generateOrderId = require("../../helpers/orderID");

const handleError = require("../../helpers/handleError");

const showAddress = async (req, res) => {
  try {
    const addresses = await Address.find({
      userId: req.session.user.id,
      isDeleted: false,
    });
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    })
      .populate("productId")

      for (const p of cartDocs) {
      const variant = p.productId?.variants.find(
        (v) => v._id.toString() === p.variantId.toString()
      );
      if (variant) {
        p.lineTotal = Math.round(variant.finalDiscount * p.quantity);
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

    res.render("userPages/checkoutAddress", { addresses, items });
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

        let total=0;
    items.forEach((item) => {
       let lineTotal = (item.variant.finalDiscount)* item.quantity;
       item.lineTotal=lineTotal
        total += lineTotal;
    })

      const coupons=await Coupon.find({
        expireAt: { $gte: new Date() },
        usedBy: { $nin: [req.session.user.id] },
        isDeleted:false,
        $expr:{$lt:['$used','$limit']}
      })
    res.render("userPages/checkoutPayment", { paymentMethods, items, coupons,total });
  } catch (error) {
    handleError(res, "showPaymentMethods", error);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, isDeleted: false, expireAt: { $gte: new Date() } });
    
    if (!coupon) {
      return res.status(400).json({ status: false, message: "Invalid or expired coupon" });
    }
    req.session.coupon = coupon._id;
    const cartItems = await Cart.find({ userId: req.session.user.id }).populate("productId");

    const lineTotal = cartItems.reduce((ac, cu) => ac + (cu.lineTotal || 0), 0);
    const discount = Math.round((lineTotal * coupon.discount) / 100);
    const finalAmount = lineTotal - discount;
    const discPerc = coupon.discount
    res.json({ status: true, message: "Applied", discount, finalAmount,discPerc });
  } catch (error) {
    handleError(res, "applyCoupon", error);
  }
};


const handlePlaceOrder = async (req, res) => {
  try {
    const { user, address } = req.session;
    const { paymentMethod} = req.body;

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


    const payment =
      paymentMethod === "wallet"
        ? {
            method: "wallet",
            status: "paid",
            provider: "InAppWallet",
            transactionId: null,
            paidAt: new Date(),
          }
        : paymentMethod === "online"
        ? {
            method: "online",
            status: "pending",
            provider: null,
            transactionId: null,
            paidAt: new Date(),
          }
        : { method: "cod", status: "pending" };

    let totalAmount = 0;
    const products = [];
    for (const item of cartItems) {
      const variant = item.productId?.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      if (!variant) continue;

      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productId.name} (${variant.volume}ml)`
        );
      }

      const image = item.productId.images[0];
      const subtotal = Number(variant.finalDiscount) * item.quantity;
      totalAmount += subtotal;

      products.push({
        productId: item.productId._id,
        variantId: item.variantId,
        productName: item.productId.name,
        basePrice: Number(variant.basePrice),
        finalDiscount: Number(variant.finalDiscount),
        finalDiscountPerc: Number(variant.finalDiscountPerc),
        quantity: item.quantity,
        subtotal,
        volume: variant.volume,
        image,
      });
    }
    const coupon = await Coupon.findById(req.session.coupon)
    let totalDiscountPerc=0;
    if (coupon){
      totalAmount -= (coupon?.discount / 100) * totalAmount;
      totalDiscountPerc=coupon.discount
    } 
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
      totalDiscountPerc,
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
    if (coupon) {
      if (!coupon.usedBy.includes(req.session.user.id)) {
        coupon.usedBy.push(req.session.user.id);
        coupon.used += 1;
        await coupon.save();
      }else{
        throw new Error('Already used coupon code!!')
      }
    }
    
    await Cart.deleteMany({ userId: user.id, status: "active" });
    
    
    return res.json({
      status: true,
      message: "Order placed successfully",
      orderId,
    });
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
  applyCoupon,
  handlePlaceOrder,
  showPlaceOrder,
};
