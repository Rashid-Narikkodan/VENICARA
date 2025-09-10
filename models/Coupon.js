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
    uppercase: true, 
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0 
  },
  limit: {
    type: Number,
    default: 0 
  },
  used: {
    type: Number,
    default: 0 
  },
  minPrice: {
    type: Number,
    default: 0 
  },
  expireAt: {
    type: Date,
    required: true
  },
  isDeleted:{
    type:Boolean,
    default:false
  },
usedBy: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Coupon', couponSchema);
