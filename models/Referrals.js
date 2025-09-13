const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // the one who referred
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending','claim', 'claimed'],
      default: 'pending',
    },
    referralCodeUsed: {
      type: String, 
      required: true,
    },
    PaidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

referralSchema.index({ referrerUserId: 1 });

module.exports = mongoose.model('Referral', referralSchema);
