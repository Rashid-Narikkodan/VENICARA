const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // ensures consistency
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0 // can be % or flat depending on your business logic
  },
  limit: {
    type: Number,
    default: 0 // global maximum usage count (0 = unlimited)
  },
  used: {
    type: Number,
    default: 0 // how many times used globally
  },
  minPrice: {
    type: Number,
    default: 0 // minimum order/cart value to apply coupon
  },
  activeDate: {
    type: Date,
    required: true
  },
  expireDate: {
    type: Date,
    required: true
  },

  // Per-user usage tracking
  usersUsed: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      count: {
        type: Number,
        default: 1 // how many times this user has applied the coupon
      }
    }
  ]
}, { 
  timestamps: true // auto adds createdAt and updatedAt
});

module.exports = mongoose.model('Coupon', couponSchema);
