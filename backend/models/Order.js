const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: String,
    name: String,
    image: String,
    category: String,
    quantity: Number,
    price: Number,
    color: String,
    size: String,
  }],
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: { type: String, enum: ['stripe', 'razorpay', 'cod', 'upi', 'card'], default: 'cod' },
  paymentDetails: mongoose.Schema.Types.Mixed,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'pending', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'refunded'], default: 'placed' },
  subtotal: Number,
  shipping: Number,
  couponDiscount: { type: Number, default: 0 },
  tax: Number,
  total: Number,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
