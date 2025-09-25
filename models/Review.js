const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model('Review', reviewSchema);
