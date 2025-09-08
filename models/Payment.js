const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: String,
  method: String,
  transactionId: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  rawResponse: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
