const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
  provider: { type: String, required: true, unique: true }, // e.g. COD, UPI, CARD
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
