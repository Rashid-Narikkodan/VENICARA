const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const handleError = require('../../helpers/handleError');

// Show Cart Page
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
        v => v._id.toString() === doc.variantId?.toString()
      );


      const safeVariant = variant || {
        _id: null,
        name: "Default Variant",
        finalAmount: 0,
        stock: 0,
      };

      const price = safeVariant.finalAmount || 0;
      const lineTotal = price * doc.quantity;

      return {
        _id: doc._id,
        quantity: doc.quantity,
        product: doc.productId,
        variant: safeVariant,
        lineTotal,
      };
    });

    const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

    res.render("userPages/cart", { items: cartItems, total });
  } catch (err) {
    handleError(res, "showCart", err);
  }
};

// Add to Cart
const addToCart = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { variantId } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({status:false,message:"User must be logged in to add to cart"});
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({status:false,message:"Product not found"});
    }
    
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({status:false,message:"Variant not found"});
    }
    
    if (variant.stock <= 0) {
      return res.status(400).json({status:false,message:"Out of stock"});
    }

    const existingCartItem = await Cart.findOne({
      userId,
      productId,
      variantId,
      status: "active",
    });
    
    const maxQty = Math.min(5, variant.stock);

    if (existingCartItem) {
      if (existingCartItem.quantity >= maxQty) {
        return res.status(400).json({status:false,message:"Quantity limit reached or not enough stock"});
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

    return res.status(200).json({status:true,message:"Product added to Cart"});
  } catch (err) {
    return res.status(500).json({status:false,message:"Server Error"});
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    await Cart.findByIdAndDelete(id);
    res.status(200).json({status:true,message: "Item removed from cart"})
  } catch (err) {
    res.status(500).json({status:false,message:"serevr error"});
  }
};

// Increase Quantity
const increaseQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cartItem = await Cart.findById(cartId).populate("productId");
    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });

    const variant = cartItem.productId.variants.find(v => v._id.toString() === cartItem.variantId.toString());
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    const maxQty = Math.min(5, variant.stock);
    if (cartItem.quantity >= maxQty) {
      return res.json({ success: false, message: "Quantity limit reached", newQuantity: cartItem.quantity });
    }

    cartItem.quantity += 1;
    await cartItem.save();

    const price = variant.finalAmount || 0;
    const lineTotal = price * cartItem.quantity;

    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const v = item.productId.variants.find(vv => vv._id.toString() === item.variantId.toString());
      return sum + ((v?.finalAmount || 0) * item.quantity);
    }, 0);

    res.json({ success: true, newQuantity: cartItem.quantity, lineTotal, total });
  } catch (err) {
    handleError(res, "increaseQuantity", err);
  }
};

// Decrease Quantity
const decreaseQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cartItem = await Cart.findById(cartId).populate("productId");
    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });
    const product = await Product.findById(cartItem.productId)

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    }

    const variant = product.variants.find(v => v._id.toString() === cartItem.variantId.toString());
    const price = variant?.finalAmount || 0;
    const lineTotal = price * cartItem.quantity;
    const stock = variant.stock


    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const v = item.productId.variants.find(vv => vv._id.toString() === item.variantId.toString());
      return sum + ((v?.finalAmount || 0) * item.quantity);
    }, 0);



    res.json({ success: true, newQuantity: cartItem.quantity, stock, lineTotal, total });
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
