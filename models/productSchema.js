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
      basePrice: { type: Number, required: true },
      discount: { type: Number, required: true },
      stock: { type: Number, default: 0 },
    }
  ],
  isAvailable: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
