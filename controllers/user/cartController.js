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
        finalAmount: 0,
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

    let total=0;
    cartItems.forEach((item) => {
       let lineTotal = (item.variant.finalAmount)* item.quantity;
       item.lineTotal=lineTotal
        total += lineTotal;
    })
const carts = await Cart.find({ userId: req.session.user.id }); // no .lean()
for (const doc of carts) {
  const variant = doc.productId?.variants?.find(v => 
    v._id.toString() === doc.variantId?.toString()
  );
  if (variant) {
    doc.lineTotal = variant.finalAmount * doc.quantity;
    await doc.save(); // save one document at a time
  }
}


    res.render("userPages/cart", { items: cartItems,total});
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
    const price = variant.finalAmount || variant.basePrice; // safer: fallback to price
    const lineTotal = price * cartItem.quantity;

    // calculate cart total
    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const itemVariant = item.productId.variants.find(
        (v) => v._id.toString() === item.variantId.toString()
      );
      const itemPrice = itemVariant?.finalAmount || itemVariant?.price || 0;
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
    const lineTotal = (variant?.finalAmount) * cartItem.quantity;

    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const itemVariant = item.productId.variants.find(v => v._id.toString() === item.variantId.toString());
      return sum + ((itemVariant?.finalAmount || 0)) * item.quantity;
    }, 0);

    res.json({ success: true, newQuantity: cartItem.quantity, lineTotal, total, decreased: cartItem.quantity > 0 });
  } catch (err) {
    handleError(res, "decreaseQuantity", err);
  }
};


module.exports = {
  showCart,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
};
