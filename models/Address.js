const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // FK → users._id
    },
    fullName: {
      type: String,
      required: true, // recipient name
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // 10-digit mobile number
    },
    pin: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/, // if it's Indian PIN code (adjust if global)
    },
    street: {
      type: String,
      trim: true, // locality
    },
    address: {
      type: String,
      required: true,
      trim: true, // area + city
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    alternateMobile: {
      type: String,
      match: /^[0-9]{10}$/,
    },
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    isDefault:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true } // includes createdAt, updatedAt
);

module.exports = mongoose.model("Address", addressSchema);
