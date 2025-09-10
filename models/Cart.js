const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true, // points to product.variants._id
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "saved", "ordered"],
      default: "active",
    },
    lineTotal:{type:Number}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
