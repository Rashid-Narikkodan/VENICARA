const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productVariantId: { type: mongoose.Schema.Types.ObjectId, required: true } // points to product.variants._id
}, { timestamps: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
