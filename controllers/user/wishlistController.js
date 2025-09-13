const Wishlist = require("../../models/Wishlist");
const Product = require("../../models/Product");
const handleError = require('../../helpers/handleError')
const Cart=require('../../models/Cart')

const show = async (req, res) => {
  try {
    const wishlistDocs = await Wishlist.find({ userId: req.session.user.id })
      .populate("productId", "name price variants images") // only bring what you need
      .sort({ createdAt: -1 });

    const wishlistItems = wishlistDocs.map(doc => ({
      _id: doc._id,
      product: doc.productId,
      variant: doc.productId?.variants?.id(doc.variantId) || null,
      createdAt:doc.createdAt
    }));

    res.render("userPages/wishlist", { items: wishlistItems });
  } catch (err) {
    handleError(res, "showWishlist", err);
  }
};

const add = async (req, res) => {
  try {
    const productId = req.params.id;
    const {variantId,source} = req.body
    const userId = req.session.user.id;
    redirectUrl=source=='details'?`/products/${productId}`:'/shop'
    if (!userId) {
      req.flash("error", "User should be Authenticated to Add to Wishlist");
      return res.redirect(redirectUrl);
    }

    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect(redirectUrl);
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      req.flash("error", "Variant not found");
      return res.redirect(redirectUrl);
    }

    let existingWishlistItem = await Wishlist.findOne({
      userId,
      productId,
      variantId,
    });

    if (existingWishlistItem) {
      req.flash('error','You already wished to buy this product')
      return res.redirect(redirectUrl)
    } 
      const newItem = new Wishlist({
        userId,
        productId,
        variantId,
      });
      await newItem.save();

    req.flash("success", "Product added to wishlist");
    res.redirect(redirectUrl);
  } catch (err) {
    handleError(res, "addTowishlist", err);
  }
};


const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const wishlist = await Wishlist.findById(id);
    if (!wishlist) {
      console.log('error-1')
      res.json({status:false,message: "wishlist item not found"});
      return
    }

    await Wishlist.findByIdAndDelete(id);

      res.json({status:true,message:"Product removed from wishlist"})
  } catch (err) {
    console.log(err)
    handleError(res, "remove", err);
  }
};


const addToCart = async (req, res) => {
  try {
    const wishlistId = req.params.id; 
    const userId = req.session.user?.id;

    if (!userId) {
      return res.json({ success: false, message: "User must be authenticated to add to cart" });
    }

    const wishedItem = await Wishlist.findById(wishlistId).populate("productId");
    if (!wishedItem) return res.json({ success: false, message: "Wishlist item not found" });
    

    const product = wishedItem.productId;
    const variantId = wishedItem.variantId;

    if (!product) return res.json({ success: false, message: "Product not found" });
    

    const variant = product.variants.id(variantId);
    if (!variant) return res.json({ success: false, message: "Variant not found" });
    

    if (variant.stock <= 0) return res.json({ success: false, message: "Out of stock" });
    

    let existingCartItem = await Cart.findOne({
      userId,
      productId: product._id,
      variantId,
      status: "active",
    });

    if (existingCartItem) {
      if (existingCartItem.quantity >= variant.stock) return res.json({ success: false, message: "Not enough stock available" });
      

      if (existingCartItem.quantity >= 5) return res.json({ success: false, message: "Quantity limit exceeded" });
      
      existingCartItem.quantity += 1;
      await existingCartItem.save();

      await Wishlist.findByIdAndDelete(wishlistId);

      return res.json({
        success: true,
        message: "Product quantity updated in cart, wishlist item removed",
        cartItem: existingCartItem,
      });
    }

    const newItem = new Cart({
      userId,
      productId: product._id,
      variantId,
      quantity: 1,
      status: "active",
    });
    await newItem.save();

    await Wishlist.findByIdAndDelete(wishlistId);

    return res.json({
      success: true,
      message: "Product added to cart, wishlist item removed",
      cartItem: newItem,
    });
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const { variantId } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.json({ status: false, message: "User must be authenticated to add to wishlist" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ status: false, message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.json({ status: false, message: "Variant not found" });
    }

    let existingWishlistItem = await Wishlist.findOne({
      userId,
      productId,
      variantId,
    });

    if (existingWishlistItem) {
      return res.json({ status: false, message: "You already wished to buy this product" });
    }

    const newItem = new Wishlist({
      userId,
      productId,
      variantId,
    });
    await newItem.save();

    return res.json({ status: true, message: "Product added to wishlist", item: newItem });
  } catch (err) {
    console.error("addToWishlist error:", err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};


module.exports = {
  show,
  add,
  remove,
  addToCart,
  addToWishlist,
};
