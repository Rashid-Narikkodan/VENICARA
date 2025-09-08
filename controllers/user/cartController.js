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
      .lean();

    const cartItems = cartDocs.map(doc => {
      const variant = doc.productId?.variants?.find(
        v => v._id.toString() === (doc.variantId?.toString() || "") && v.stock > 0
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
    const product = await Product.findById(productId);
    const variant = product.variants.id(variantId);

    if (!userId) {
      req.flash('error', 'User should be Authenticated to Add to cart');
      return res.redirect(`/products/${productId}`);
    }

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect(`/products/${productId}`);
    }

    if (!variant) {
      req.flash("error", "Variant not found");
      return res.redirect(`/products/${productId}`);
    }

    if (variant.stock <= 0) {
      req.flash("error", "Product is Out of stock");
      return res.redirect(`/products/${req.params.id}`);
    }

    let existingCartItem = await Cart.findOne({
      userId,
      productId,
      variantId,
      status: "active",
    });

    if (existingCartItem?.quantity >= 5) {
      req.flash("error", "Quantity limit exceeded");
      return res.redirect(`/products/${req.params.id}`);
    }

    let newItem;
    if (existingCartItem) {
      if (existingCartItem.quantity < variant.stock) {
        existingCartItem.quantity += 1;
        await existingCartItem.save();
      } else {
        req.flash('error', 'Stock limit is reached');
        return res.redirect(`/products/${req.params.id}`);
      }
    } else {
      newItem = new Cart({
        userId,
        productId,
        variantId,
        quantity: 1,
        status: "active",
      });
      await newItem.save();
    }

    product.variants.id(variantId).stock -= 1;
    await product.save();

    req.flash("success", "Product added to cart list");
    res.redirect(`/products/${req.params.id}`);
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

    const product = await Product.findById(cart.productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/cart");
    }

    const variant = product.variants.id(cart.variantId);
    if (!variant) {
      req.flash("error", "Product variant not found");
      return res.redirect("/cart");
    }

    variant.stock += cart.quantity;
    await product.save();

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
    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });

    const variant = cartItem.productId.variants.find(v => v._id.toString() === cartItem.variantId.toString());
    if (!variant) return res.status(400).json({ success: false, message: "Variant not found" });

    if (cartItem.quantity < variant.stock) {
      cartItem.quantity += 1;
      await cartItem.save();
    }

    const lineTotal = (variant.discount - 1) * cartItem.quantity;

    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const itemVariant = item.productId.variants.find(v => v._id.toString() === item.variantId.toString());
      return sum + ((itemVariant?.discount || 0) - 1) * item.quantity;
    }, 0);

    const product = await Product.findById(cartItem.productId);
    product.variants.id(cartItem.variantId).stock -= 1;
    await product.save();

    res.json({ success: true, newQuantity: cartItem.quantity, lineTotal, total });
  } catch (err) {
    handleError(res, "increaseQuantity", err);
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cartItem = await Cart.findById(cartId).populate("productId");
    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });

    const variant = cartItem.productId.variants.find(v => v._id.toString() === cartItem.variantId.toString());
    if (!variant) return res.status(400).json({ success: false, message: "Variant not found" });

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    }

    const lineTotal = (variant.discount - 1) * cartItem.quantity;

    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const itemVariant = item.productId.variants.find(v => v._id.toString() === item.variantId.toString());
      return sum + ((itemVariant?.discount || 0) - 1) * item.quantity;
    }, 0);

    const product = await Product.findById(cartItem.productId);
    product.variants.id(cartItem.variantId).stock += 1;
    await product.save();

    res.json({ success: true, newQuantity: cartItem.quantity, lineTotal, total });
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
