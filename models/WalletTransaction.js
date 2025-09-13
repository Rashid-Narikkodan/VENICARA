const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  razorpayId:{type:String},
  amount: { type: Number, required: true }, // store in paise
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  lastBalance:{type:Number}
}, { timestamps: true });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
