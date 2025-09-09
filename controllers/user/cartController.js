const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Coupon = require('../../models/Coupon');
const handleError = require('../../helpers/handleError')

const showCart = async (req, res) => {
  try {
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    })
      .populate("productId")
      .sort({ createdAt: -1 })
      .lean();

    const cartItems = cartDocs.map(doc => {
      const variant = doc.productId?.variants?.find(
        v => v._id.toString() === (doc.variantId?.toString() || "")
      ) || {
        _id: null,
        name: "Default Variant",
        discount: 1,
        price: doc.productId?.price || 0
      };

      return {
        _id: doc._id,
        quantity: doc.quantity,
        product: doc.productId,
        status: doc.status,
        variant,
      };
    });

    res.render("userPages/cart", { items: cartItems });
  } catch (err) {
    handleError(res, "showCart", err);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantId = req.body.variantId;
    const userId = req.session.user?.id;

    if (!userId) {
      req.flash("error", "User should be Authenticated to Add to cart");
      return res.redirect(`/products/${productId}`);
    }

    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect(`/products/${productId}`);
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      req.flash("error", "Variant not found");
      return res.redirect(`/products/${productId}`);
    }

    // 🚨 stock check
    if (variant.stock <= 0) {
      req.flash("error", "Out of stock");
      return res.redirect(`/products/${productId}`);
    }

    let existingCartItem = await Cart.findOne({
      userId,
      productId,
      variantId,
      status: "active",
    });

    if (existingCartItem) {
      // 🚨 stock check for increment
      if (existingCartItem.quantity >= variant.stock) {
        req.flash("error", "Not enough stock available");
        return res.redirect(`/products/${productId}`);
      }

      if (existingCartItem.quantity >= 5) {
        req.flash("error", "Quantity limit exceeded");
        return res.redirect(`/products/${productId}`);
      }

      existingCartItem.quantity += 1;
      await existingCartItem.save();
    } else {
      const newItem = new Cart({
        userId,
        productId,
        variantId,
        quantity: 1,
        status: "active",
      });
      await newItem.save();
    }

    req.flash("success", "Product added to cart list");
    res.redirect(`/products/${productId}`);
  } catch (err) {
    handleError(res, "addToCart", err);
  }
};


const removeFromCart = async (req, res) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id);
    if (!cart) {
      req.flash("error", "Cart item not found");
      return res.redirect("/cart");
    }

    await Cart.findByIdAndDelete(id);

    req.flash("success", "Item removed from cart");
    return res.redirect("/cart");
  } catch (err) {
    handleError(res, "removeFromCart", err);
  }
};

const increaseQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cartItem = await Cart.findById(cartId).populate("productId");
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    const variant = cartItem.productId.variants.find(
      (v) => v._id.toString() === cartItem.variantId.toString()
    );

    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // 🚨 stock check
    if (variant.stock <= cartItem.quantity) {
      return res.json({
        success: false,
        message: "Not enough stock available",
        newQuantity: cartItem.quantity,
      });
    }

    // 🚨 max 5 limit check
    if (cartItem.quantity >= 5) {
      return res.json({
        success: false,
        message: "Quantity limit reached",
        newQuantity: cartItem.quantity,
      });
    }

    // increment
    cartItem.quantity += 1;
    await cartItem.save();

    // calculate line total
    const price = variant.discount || variant.price; // safer: fallback to price
    const lineTotal = price * cartItem.quantity;

    // calculate cart total
    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const itemVariant = item.productId.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      const itemPrice = itemVariant?.discount || itemVariant?.price || 0;
      return sum + itemPrice * item.quantity;
    }, 0);

    res.json({
      success: true,
      newQuantity: cartItem.quantity,
      lineTotal,
      total,
      increased: true,
    });
  } catch (err) {
    handleError(res, "increaseQuantity", err);
  }
};


const decreaseQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cartItem = await Cart.findById(cartId).populate("productId");
    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    }

    const variant = cartItem.productId.variants.find(v => v._id.toString() === cartItem.variantId.toString());
    const lineTotal = (variant?.discount - 1) * cartItem.quantity;

    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const itemVariant = item.productId.variants.find(v => v._id.toString() === item.variantId.toString());
      return sum + ((itemVariant?.discount || 0) - 1) * item.quantity;
    }, 0);

    res.json({ success: true, newQuantity: cartItem.quantity, lineTotal, total, decreased: cartItem.quantity > 0 });
  } catch (err) {
    handleError(res, "decreaseQuantity", err);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }

    const now = new Date();
    if (now < coupon.activeDate || now > coupon.expireDate) {
      return res.status(400).json({ success: false, message: "Coupon is not active or expired" });
    }

    if (coupon.limit > 0 && coupon.used >= coupon.limit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    const userId = req.session.user.id;
    const userUsage = coupon.usersUsed.find(u => u.userId.toString() === userId);

    if (userUsage && userUsage.count >= 1) {
      return res.status(400).json({ success: false, message: "You have already used this coupon" });
    }

    return res.json({ success: true, coupon });
  } catch (err) {
    handleError(res, "applyCoupon", err);
  }
};

module.exports = {
  showCart,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  applyCoupon,
};
