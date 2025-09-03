const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Coupon = require('../../models/Coupon')

const showCart = async (req, res) => {
  try {
    const cartDocs = await Cart.find({
      userId: req.session.user.id,
      status: "active",
    }).populate("productId")
      .lean();

    const cartItems = cartDocs.map(doc => {
      const variant = doc.productId?.variants.find(
        v => v._id.toString() === doc.variantId.toString()
      );

      return {
        cartId: doc._id,
        quantity: doc.quantity,
        product: doc.productId,
        status:doc.status,
        variant,
      };
    });
    res.render("userPages/cart", { items: cartItems });
  } catch (err) {
    console.error("Error in showCart:", err.message);
    res.status(500).send("from showCart :- " + err.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const variantId = req.body.variantId;
    const productId = req.params.id;
    const userId = req.session.user.id;
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect(`/products/${userId}`);
    }
    const variant = product.variants.id(variantId);
    if (!variant) {
      req.flash("error", "Variant not found");
      return res.redirect(`/products/${userId}`);
    }
    if(variant.stock<=0){
    req.flash("error", "Product is Out of stock");
    return res.redirect(`/products/${req.params.id}`);
    }
    let existingCartItem = await Cart.findOne({
      userId,
      productId,
      variantId,
      status: "active",
    });
    let newItem;
    if (existingCartItem) {
      if (existingCartItem.quantity < variant.stock) {
        existingCartItem.quantity += 1;
        await existingCartItem.save();
      } else {
        return res.status(400).send("Stock limit reached");
      }
    } else {
     newItem = new Cart({
        userId,
        productId,
        variantId,
        quantity: 1,
        status: "active",
      });
      await newItem.save()
    }
    req.flash("success", "Product added to cart list");
    res.redirect(`/products/${req.params.id}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("from addTocart :- " + err.message);
  }
};

const removeFromCart=async(req,res)=>{
    try {
    const id=req.params.id
    await Cart.findByIdAndDelete(id)
    req.flash('success','Item removed from cart')
    return res.redirect('/cart')
  } catch (err) {
    console.error("remove cart :", err.message);
    res.status(500).send("from removeCart :- " + err.message);
  }
}

const increaseQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cartItem = await Cart.findById(cartId).populate("productId");
    if (!cartItem) return res.status(404).json({ success: false, message: "Item not found" });

    const variant = cartItem.productId.variants.find(v => v._id.toString() === cartItem.variantId.toString());
    if (!variant) return res.status(400).json({ success: false, message: "Variant not found" });

    // check stock
    if (cartItem.quantity < variant.stock) {
      cartItem.quantity += 1;
      await cartItem.save();
    }

    const lineTotal = (variant.discount - 1) * cartItem.quantity;

    // recalculate total
    const cartItems = await Cart.find({ userId: cartItem.userId }).populate("productId");
    const total = cartItems.reduce((sum, item) => {
      const itemVariant = item.productId.variants.find(v => v._id.toString() === item.variantId.toString());
      return sum + ((itemVariant?.discount || 0) - 1) * item.quantity;
    }, 0);

    res.json({ success: true, newQuantity: cartItem.quantity, lineTotal, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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

    res.json({ success: true, newQuantity: cartItem.quantity, lineTotal, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//not completed
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

    const userId = req.session.user.id; // adjust to your session object
    const userUsage = coupon.usersUsed.find(u => u.userId.toString() === userId);

    if (userUsage && userUsage.count >= 1) { // or >= per-user-limit
      return res.status(400).json({ success: false, message: "You have already used this coupon" });
    }

    return res.json({ success: true, coupon });

  } catch (error) {
    res.status(500).send(`from applyCoupon ${error}`);
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
