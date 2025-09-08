const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, 
    },
    pin: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/,
    },
    street: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
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
    },
    isDeleted:{type:Boolean,default:false}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
