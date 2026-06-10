const mongoose = require('mongoose');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Setting = require('../models/Setting');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');
const { serializeUser } = require('../utils/userSerializer');

const settingsStore = {
  general: { websiteName: 'NovaMart', logo: '', favicon: '', contactEmail: 'support@novamart.local', phoneNumber: '+91 90000 00000', address: 'Mumbai, India' },
  payment: { razorpay: true, stripe: true, paypal: false, cashOnDelivery: true },
  shipping: { shippingCharges: 12, freeShippingLimit: 50, deliveryAreas: 'India' },
  email: { smtpHost: '', smtpPort: '587', emailUsername: '', emailPassword: '' },
  seo: { metaTitle: 'NovaMart', metaDescription: 'Modern e-commerce store', keywords: 'shopping,ecommerce,novamart' },
};

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function productPayload(body = {}) {
  return {
    name: body.name,
    description: body.description || '',
    brand: body.brand || '',
    price: Number(body.price || 0),
    oldPrice: Number(body.oldPrice || body.discountPrice || 0),
    countInStock: Number(body.countInStock || body.stock || body.stockQuantity || 0),
    images: toArray(body.images),
    colors: toArray(body.colors),
    sizes: toArray(body.sizes),
    status: body.status || 'active',
  };
}

async function resolveCategory(category) {
  if (!category) return undefined;
  if (mongoose.isValidObjectId(category)) return category;
  const doc = await Category.findOneAndUpdate(
    { name: category },
    { $setOnInsert: { name: category, status: 'active' } },
    { upsert: true, new: true },
  );
  return doc._id;
}

exports.dashboard = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.adminSummary());
    const [totalProducts, totalOrders, totalUsers, totalCategories, orders, recentUsers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Category.countDocuments(),
      Order.find().populate('user', 'name email').sort('-createdAt').limit(50),
      User.find({ role: 'user' }).select('-password').sort('-createdAt').limit(5),
    ]);
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingOrders = orders.filter((order) => ['placed', 'pending', 'confirmed'].includes(order.orderStatus)).length;
    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalCategories,
      totalRevenue,
      pendingOrders,
      salesOverview: [{ month: 'Jan', revenue: totalRevenue * 0.2 }, { month: 'Feb', revenue: totalRevenue * 0.3 }, { month: 'Mar', revenue: totalRevenue * 0.5 }],
      ordersOverview: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => ({ status, count: orders.filter((order) => order.orderStatus === status).length })),
      topSellingProducts: [],
      recentOrders: orders.slice(0, 5),
      recentUsers: recentUsers.map(serializeUser),
    });
  } catch (error) {
    next(error);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.listProducts());
    res.json(await Product.find().populate('category').sort('-createdAt'));
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.status(201).json(demoStore.createProduct(req.body));
    const payload = productPayload(req.body);
    const category = await resolveCategory(req.body.category);
    res.status(201).json(await Product.create({ ...payload, category }));
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const product = demoStore.updateProduct(req.params.id, req.body);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      return res.json(product);
    }
    const payload = productPayload(req.body);
    const category = await resolveCategory(req.body.category);
    const product = await Product.findByIdAndUpdate(req.params.id, { ...payload, ...(category && { category }) }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    if (!isMongoReady()) return demoStore.deleteProduct(req.params.id) ? res.json({ message: 'Product deleted' }) : res.status(404).json({ message: 'Product not found' });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.findOrdersForUser({ role: 'admin' }));
    res.json(await Order.find().populate('user', 'name email phone').sort('-createdAt'));
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
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

exports.listUsers = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.listUsers());
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    const counts = await Order.aggregate([{ $group: { _id: '$user', ordersCount: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.ordersCount]));
    res.json(users.map((user) => ({ ...serializeUser(user), ordersCount: countMap.get(String(user._id)) || 0, status: user.isBlocked ? 'blocked' : 'active', createdAt: user.createdAt })));
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const user = demoStore.updateUserByAdmin(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.status) user.isBlocked = req.body.status === 'blocked';
    await user.save();
    res.json({ ...serializeUser(user), status: user.isBlocked ? 'blocked' : 'active' });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (!isMongoReady()) return demoStore.deleteUser(req.params.id) ? res.json({ message: 'User deleted' }) : res.status(404).json({ message: 'User not found' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.listCategories());
    const categories = await Category.find().sort('name');
    const counts = await Product.aggregate([{ $group: { _id: '$category', productsCount: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.productsCount]));
    res.json(categories.map((category) => ({ ...category.toObject(), productsCount: countMap.get(String(category._id)) || 0 })));
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.status(201).json(demoStore.createCategory(req.body));
    res.status(201).json(await Category.create(req.body));
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const category = demoStore.updateCategory(req.params.id, req.body);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      return res.json(category);
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    if (!isMongoReady()) return demoStore.deleteCategory(req.params.id) ? res.json({ message: 'Category deleted' }) : res.status(404).json({ message: 'Category not found' });
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

exports.listCoupons = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.listCoupons());
    res.json(await Coupon.find().sort('-createdAt'));
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.status(201).json(demoStore.createCoupon(req.body));
    res.status(201).json(await Coupon.create(req.body));
  } catch (error) {
    next(error);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const coupon = demoStore.updateCoupon(req.params.id, req.body);
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
      return res.json(coupon);
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    if (!isMongoReady()) return demoStore.deleteCoupon(req.params.id) ? res.json({ message: 'Coupon deleted' }) : res.status(404).json({ message: 'Coupon not found' });
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

exports.listReviews = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.listReviews());
    const reviews = await Review.find().populate('user', 'name email').populate('product', 'name').sort('-createdAt');
    res.json(reviews.map((review) => ({ ...review.toObject(), customerName: review.user?.name, productName: review.product?.name })));
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const review = demoStore.updateReview(req.params.id, req.body);
      if (!review) return res.status(404).json({ message: 'Review not found' });
      return res.json(review);
    }
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    if (!isMongoReady()) return demoStore.deleteReview(req.params.id) ? res.json({ message: 'Review deleted' }) : res.status(404).json({ message: 'Review not found' });
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getSettings = (req, res) => {
  if (!isMongoReady()) return res.json(demoStore.getSettings());
  Setting.find().then((docs) => {
    const settings = docs.reduce((acc, doc) => ({ ...acc, [doc.section]: { ...(settingsStore[doc.section] || {}), ...(doc.values || {}) } }), { ...settingsStore });
    res.json(settings);
  }).catch((error) => res.status(500).json({ message: error.message }));
};

exports.updateSettings = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.updateSettings(req.params.section, req.body));
    const section = req.params.section;
    const values = { ...(settingsStore[section] || {}), ...req.body };
    await Setting.findOneAndUpdate({ section }, { section, values }, { upsert: true, new: true });
    const docs = await Setting.find();
    const settings = docs.reduce((acc, doc) => ({ ...acc, [doc.section]: { ...(settingsStore[doc.section] || {}), ...(doc.values || {}) } }), { ...settingsStore });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};
