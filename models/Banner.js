const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  imageUrl: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);
