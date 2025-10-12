const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true, // points to product.variants._id
        },
        productName: { type: String, required: true }, // snapshot
        variantName: { type: String }, // e.g. "500ml"
        basePrice: { type: Number, required: true },
        finalAmount: { type: Number, required: true },
        discount:{type:Number,required:true},
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true }, // discountPrice * quantity
        volume:{type:Object,required:true},
        status: {
          type: String,
          enum: ["pending",'confirmed', "shipped", 'Out of delivery', "delivered", "cancelled", "returned"],
          default: "pending",
        },
        image:String,
        return:{
          isRequested:{type:Boolean,default:false},
          reason:String,
          returnTimeLimit:{type:Date},
          adminReason:String,
          status:{type:String,enum:["pending","approved","rejected"],default:"pending"}
        },
        refundAmount: { type: Number, default: 0 }
      },
    ],

    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending",'confirmed', "shipped", 'Out of delivery', "delivered", "cancelled", "returned"],
      default: "pending",
    },

    payment: {
      method: {
        type: String,
        enum: ["COD", "RAZORPAY", "WALLET"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paidAt: Date,
    },

    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    totalOrderPrice: { type: Number, required: true },
    couponDiscount:{type:Number,default:0},//percentage discount
    couponAmount:{type:Number,default:0},//amount discount
    finalAmount: { type: Number, required: true }, // totalOrderPrice - couponDiscount
    deliveryCharge:{ type:Number},
    orderId:{type:String,required:true},
    return:{
      isRequested:{type:Boolean,default:false},
      reason:String,
      returnTimeLimit:{type:Date},
      adminReason:String,
      status:{type:String,enum:["pending","approved","rejected"],default:"pending"}
    },
    refundAmount: { type: Number, default: 0 },
    deliveryCharge:{type:Number,default:200}
  },
  { timestamps: true } // handles createdAt & updatedAt automatically
);

module.exports = mongoose.model("Order", orderSchema);
