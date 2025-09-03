const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  type: { type: String, enum: ["payment", "refund"], required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
