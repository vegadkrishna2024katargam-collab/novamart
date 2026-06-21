const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { buildAddress, hasAddress, mergeSavedAddresses } = require('../utils/addressUtils');
const demoStore = require('../utils/demoStore');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

async function sendOrderEmailSafely(user, order) {
  try {
    await sendOrderConfirmationEmail(user, order);
  } catch (error) {
    console.error(`Order confirmation email failed for order ${order._id}:`, error.message);
  }
}

exports.createOrder = async (req, res, next) => {
  try {
    const paidMethods = ['upi', 'card', 'stripe', 'razorpay'];
    const paymentStatus = paidMethods.includes(req.body.paymentMethod) ? 'paid' : 'pending';
    const shippingAddress = buildAddress(req.body.shippingAddress || {});

    // Log auth context for production debugging
    if (!req.user) {
      console.error('[createOrder] Missing req.user. authHeader=', req.headers.authorization);
    } else {
      console.error('[createOrder] req.user=', { id: req.user._id || req.user.id, role: req.user.role });
    }

    if (!isMongoReady()) {
      const user = (req.user && req.user._id) ? (demoStore.saveUserAddress(req.user._id, shippingAddress) || req.user) : req.user;
      const order = demoStore.createOrder({ ...req.body, shippingAddress, paymentStatus, user: req.user?._id });
      sendOrderEmailSafely(user, order);
      return res.status(201).json(order);
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (hasAddress(shippingAddress)) {
      user.defaultAddress = shippingAddress;
      user.savedAddresses = mergeSavedAddresses(user.savedAddresses, shippingAddress);
      await user.save();
    }

    const order = await Order.create({ ...req.body, shippingAddress, paymentStatus, user: req.user._id });
    sendOrderEmailSafely(user, order);
    return res.status(201).json(order);
  } catch (error) {
    console.error('[createOrder] error=', error);
    const status = error?.statusCode || error?.status || 400;
    return res.status(status).json({ message: error?.message || 'Order could not be placed' });
  }
};


exports.getOrders = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.findOrdersForUser(req.user));
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    const orders = await Order.find(query).populate('user', 'name email').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const order = demoStore.updateOrderStatus(req.params.id, { orderStatus: req.body.orderStatus, paymentStatus: req.body.paymentStatus });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      return res.json(order);
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus, paymentStatus: req.body.paymentStatus }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};
