const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  images: { type: [String], default: [] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: { type: [String], default: [] },
  variants: [
    {
      volume: { type: String, required: true },
      stock: { type: Number, default: 0 },
      basePrice: { type: Number, required: true },
      productDiscount:{ type: Number,  },
      productDiscountPerc:{type:Number,},
      finalDiscount:{type:Number},
      finalDiscountPerc:{type:Number}
    }
  ],
  isAvailable: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
