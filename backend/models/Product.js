const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: Number,
  images: [String],
  brand: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  countInStock: { type: Number, default: 0 },
  colors: [String],
  sizes: [String],
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
