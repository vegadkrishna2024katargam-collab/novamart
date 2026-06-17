const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { buildAddress, hasAddress, mergeSavedAddresses } = require('./addressUtils');

const usersByEmail = new Map();
const usersById = new Map();
const orders = [];
const cartsByUserId = new Map();
const wishlistsByUserId = new Map();
const categories = [
  { _id: 'cat-fashion', name: 'Fashion', description: 'Clothing and accessories', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
  { _id: 'cat-electronics', name: 'Electronics', description: 'Electronics and gadgets', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
  { _id: 'cat-mobiles', name: 'Mobiles', description: 'Smartphones and mobile accessories', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
  { _id: 'cat-furniture', name: 'Furniture', description: 'Home and office furniture', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
  { _id: 'cat-beauty', name: 'Beauty', description: 'Beauty and personal care', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
  { _id: 'cat-shoes', name: 'Shoes', description: 'Footwear', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
  { _id: 'cat-grocery', name: 'Grocery', description: 'Daily grocery products', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
  { _id: 'cat-books', name: 'Books', description: 'Books and stationery', status: 'active', productsCount: 0, createdAt: new Date().toISOString() },
];
function loadDemoProducts() {
  const fallback = [
    { _id: 'prod-1', id: 'prod-1', name: 'Nike Air Pulse Runner', description: 'Responsive everyday running shoes.', category: 'Shoes', brand: 'Nike', price: 129, oldPrice: 179, countInStock: 42, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'], colors: ['Black', 'White'], sizes: ['7', '8', '9'], status: 'active', rating: 4.8, badge: '28% off', createdAt: new Date().toISOString() },
    { _id: 'prod-2', id: 'prod-2', name: 'Apple Studio Watch', description: 'Smart wearable with health and fitness tracking.', category: 'Electronics', brand: 'Apple', price: 399, oldPrice: 459, countInStock: 18, images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=80'], colors: ['Silver', 'Black'], sizes: ['Standard'], status: 'active', rating: 4.9, badge: 'New', createdAt: new Date().toISOString() },
    { _id: 'prod-3', id: 'prod-3', name: 'Aurora Lounge Chair', description: 'Modern lounge seating with durable fabric.', category: 'Furniture', brand: 'Aurora', price: 249, oldPrice: 319, countInStock: 12, images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=900&q=80'], colors: ['Grey', 'Tan'], sizes: ['Standard'], status: 'active', rating: 4.6, badge: 'Sale', createdAt: new Date().toISOString() },
  ];

  try {
    const demoDataPath = path.join(__dirname, '..', '..', 'src', 'data', 'demoData.js');
    const source = fs.readFileSync(demoDataPath, 'utf8');

    // Extract the exported products array from the ESM file without importing it.
    const marker = 'export const products = [';
    const start = source.indexOf(marker);
    if (start === -1) return fallback;

    const arrayStart = source.indexOf('[', start);
    let depth = 0;
    let end = arrayStart;
    for (; end < source.length; end += 1) {
      const char = source[end];
      if (char === '[') depth += 1;
      if (char === ']') {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }

    const arrayText = source.slice(arrayStart, end);

    // demoData.js is a JS module with object literals, so Function() works here.
    const parsed = Function(`"use strict"; return (${arrayText});`)();

    // Ensure all products have images[] (frontend expects images array via productUtils)
    return parsed.map((product, idx) => {
      const images = Array.isArray(product.images)
        ? product.images
        : typeof product.image === 'string' && product.image
          ? [product.image]
          : [];

      const id = product.id || product._id || `prod-${idx + 1}`;

      return {
        ...product,
        _id: product._id || id,
        id,
        images: images.length ? images : [fallback[0].images[0]],
        countInStock: Number(product.countInStock ?? product.stock ?? 25),
        // backend supports both brand and category
        brand: product.brand || product.brandName || product.seller || product.name.split(' ')[0] || '',
        numReviews: Number(product.numReviews ?? product.reviewCount ?? product.reviews ?? 120),
        status: product.status || 'active',
        colors: Array.isArray(product.colors) ? product.colors : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      };
    });
  } catch (error) {
    return fallback;
  }
}


const products = loadDemoProducts();
const coupons = [
  { _id: 'coupon-1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minimumPurchase: 500, maximumDiscount: 300, usageLimit: 100, expiresAt: '2026-12-31', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'coupon-2', code: 'SAVE500', discountType: 'fixed', discountValue: 500, minimumPurchase: 3000, maximumDiscount: 500, usageLimit: 50, expiresAt: '2026-12-31', isActive: true, createdAt: new Date().toISOString() },
];
const reviews = [
  { _id: 'review-1', customerName: 'Demo User', productName: 'Nike Air Pulse Runner', rating: 5, comment: 'Comfortable and lightweight.', approved: true, images: [], createdAt: new Date().toISOString() },
  { _id: 'review-2', customerName: 'Retail Buyer', productName: 'Apple Studio Watch', rating: 4, comment: 'Good design and battery life.', approved: false, images: [], createdAt: new Date().toISOString() },
];
const settings = {
  general: { websiteName: 'NovaMart', logo: '', favicon: '', contactEmail: 'support@novamart.local', phoneNumber: '+91 90000 00000', address: 'Mumbai, India' },
  payment: { razorpay: true, stripe: true, paypal: false, cashOnDelivery: true },
  shipping: { shippingCharges: 12, freeShippingLimit: 50, deliveryAreas: 'India' },
  email: { smtpHost: '', smtpPort: '587', emailUsername: '', emailPassword: '' },
  seo: { metaTitle: 'NovaMart', metaDescription: 'Modern e-commerce store', keywords: 'shopping,ecommerce,novamart' },
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function indexUser(user) {
  usersById.set(user._id, user);
  if (user.email) usersByEmail.set(normalizeEmail(user.email), user);
}

function publicUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profileImage: user.profileImage,
    defaultAddress: user.defaultAddress || null,
    savedAddresses: Array.isArray(user.savedAddresses) ? user.savedAddresses : [],
    lastLoginAt: user.lastLoginAt || null,
    loginCount: Number(user.loginCount || 0),
  };
}

async function hashPassword(password) {
  if (!password) return undefined;
  return bcrypt.hash(password, 12);
}

async function upsertUser({ id, _id, name, email, phone, role = 'user', password, defaultAddress, savedAddresses }) {
  const normalizedEmail = normalizeEmail(email);
  let user = usersById.get(id || _id) || usersByEmail.get(normalizedEmail);

  if (!user) {
    user = {
      _id: id || _id || crypto.randomUUID(),
      name: name || normalizedEmail.split('@')[0] || 'User',
      email: normalizedEmail,
      phone,
      role,
      savedAddresses: [],
      createdAt: now(),
    };
    indexUser(user);
  }

  if (name) user.name = name;
  if (normalizedEmail && normalizedEmail !== user.email) {
    if (user.email) usersByEmail.delete(normalizeEmail(user.email));
    user.email = normalizedEmail;
    usersByEmail.set(normalizedEmail, user);
  }
  if (phone) user.phone = phone;
  if (hasAddress(defaultAddress)) {
    user.defaultAddress = buildAddress(defaultAddress);
    user.savedAddresses = mergeSavedAddresses(user.savedAddresses, defaultAddress);
  }
  if (Array.isArray(savedAddresses)) user.savedAddresses = savedAddresses.map(buildAddress).filter(hasAddress);
  if (password) user.passwordHash = await hashPassword(password);

  return user;
}

function findUserById(id) {
  return usersById.get(id) || null;
}

function findUserByEmail(email) {
  return usersByEmail.get(normalizeEmail(email)) || null;
}

async function verifyPassword(user, password) {
  if (!user?.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

async function setPassword(user, password) {
  user.passwordHash = await hashPassword(password);
  return user;
}

function recordLogin(user) {
  if (!user) return null;
  user.lastLoginAt = now();
  user.loginCount = Number(user.loginCount || 0) + 1;
  return user;
}

function updateUserProfile(id, updates = {}) {
  const user = findUserById(id);
  if (!user) return null;
  if (updates.name) user.name = updates.name;
  if (updates.email) {
    const normalizedEmail = normalizeEmail(updates.email);
    if (normalizedEmail !== user.email) {
      if (user.email) usersByEmail.delete(normalizeEmail(user.email));
      user.email = normalizedEmail;
      usersByEmail.set(normalizedEmail, user);
    }
  }
  if (updates.phone !== undefined) user.phone = updates.phone;
  if (updates.profileImage !== undefined) user.profileImage = updates.profileImage;
  const address = updates.defaultAddress || updates.shippingAddress;
  if (address) {
    user.defaultAddress = buildAddress(address);
    user.savedAddresses = mergeSavedAddresses(user.savedAddresses, address);
  }
  if (Array.isArray(updates.savedAddresses)) {
    user.savedAddresses = updates.savedAddresses.map(buildAddress).filter(hasAddress);
  }
  return user;
}

async function changeUserPassword(id, currentPassword, newPassword) {
  const user = findUserById(id);
  if (!user) return { user: null, valid: false };
  if (user.passwordHash && !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return { user, valid: false };
  }
  await setPassword(user, newPassword);
  return { user, valid: true };
}

function saveUserAddress(id, address) {
  const user = findUserById(id);
  if (!user || !hasAddress(address)) return user;
  user.defaultAddress = buildAddress(address);
  user.savedAddresses = mergeSavedAddresses(user.savedAddresses, address);
  return user;
}

function createOrder(payload) {
  const order = {
    ...payload,
    _id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

function findOrdersForUser(user) {
  if (user.role === 'admin') return orders;
  return orders.filter((order) => order.user === user._id);
}

function productById(id) {
  return products.find((product) => String(product._id || product.id) === String(id));
}

function getCart(userId) {
  const items = cartsByUserId.get(String(userId)) || [];
  return {
    user: userId,
    items: items.map((item) => ({ ...item, product: productById(item.product) || item.product })),
  };
}

function addToCart(userId, productId, quantity = 1) {
  const key = String(userId);
  const items = cartsByUserId.get(key) || [];
  const existing = items.find((item) => String(item.product) === String(productId));
  if (existing) existing.quantity += Math.max(1, Number(quantity || 1));
  else items.push({ product: productId, quantity: Math.max(1, Number(quantity || 1)) });
  cartsByUserId.set(key, items);
  return getCart(userId);
}

function removeFromCart(userId, productId) {
  const key = String(userId);
  const items = (cartsByUserId.get(key) || []).filter((item) => String(item.product) !== String(productId));
  cartsByUserId.set(key, items);
  return getCart(userId);
}

function getWishlist(userId) {
  return {
    user: userId,
    products: (wishlistsByUserId.get(String(userId)) || []).map((id) => productById(id)).filter(Boolean),
  };
}

function toggleWishlist(userId, productId) {
  const key = String(userId);
  const ids = wishlistsByUserId.get(key) || [];
  const exists = ids.some((id) => String(id) === String(productId));
  wishlistsByUserId.set(key, exists ? ids.filter((id) => String(id) !== String(productId)) : [...ids, productId]);
  return getWishlist(userId);
}

function updateOrderStatus(id, update) {
  const order = orders.find((item) => item._id === id);
  if (!order) return null;
  Object.assign(order, update, { updatedAt: new Date().toISOString() });
  return order;
}

function now() {
  return new Date().toISOString();
}

function matchesId(item, id) {
  return String(item._id || item.id) === String(id);
}

function listProducts() {
  return products;
}

function createProduct(payload = {}) {
  const product = {
    _id: crypto.randomUUID(),
    id: crypto.randomUUID(),
    name: payload.name || 'New Product',
    description: payload.description || '',
    category: payload.category || 'General',
    brand: payload.brand || '',
    price: Number(payload.price || 0),
    oldPrice: Number(payload.oldPrice || payload.discountPrice || 0),
    countInStock: Number(payload.countInStock || payload.stock || payload.stockQuantity || 0),
    images: Array.isArray(payload.images) ? payload.images : String(payload.images || '').split(',').map((item) => item.trim()).filter(Boolean),
    colors: Array.isArray(payload.colors) ? payload.colors : String(payload.colors || '').split(',').map((item) => item.trim()).filter(Boolean),
    sizes: Array.isArray(payload.sizes) ? payload.sizes : String(payload.sizes || '').split(',').map((item) => item.trim()).filter(Boolean),
    status: payload.status || 'active',
    createdAt: now(),
    updatedAt: now(),
  };
  products.unshift(product);
  return product;
}

function updateProduct(id, payload = {}) {
  const product = products.find((item) => matchesId(item, id));
  if (!product) return null;
  if (payload.name !== undefined) product.name = payload.name;
  if (payload.description !== undefined) product.description = payload.description;
  if (payload.category !== undefined) product.category = payload.category;
  if (payload.brand !== undefined) product.brand = payload.brand;
  if (payload.price !== undefined) product.price = Number(payload.price || 0);
  if (payload.oldPrice !== undefined || payload.discountPrice !== undefined) product.oldPrice = Number(payload.oldPrice || payload.discountPrice || 0);
  if (payload.countInStock !== undefined || payload.stockQuantity !== undefined || payload.stock !== undefined) product.countInStock = Number(payload.countInStock || payload.stockQuantity || payload.stock || 0);
  if (payload.images !== undefined) product.images = Array.isArray(payload.images) ? payload.images : String(payload.images || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (payload.colors !== undefined) product.colors = Array.isArray(payload.colors) ? payload.colors : String(payload.colors || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (payload.sizes !== undefined) product.sizes = Array.isArray(payload.sizes) ? payload.sizes : String(payload.sizes || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (payload.status !== undefined) product.status = payload.status;
  product.updatedAt = now();
  return product;
}

function deleteProduct(id) {
  const index = products.findIndex((item) => matchesId(item, id));
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

function listCategories() {
  return categories.map((category) => ({ ...category, productsCount: products.filter((product) => product.category === category.name || product.category?._id === category._id).length }));
}

function createCategory(payload = {}) {
  const category = { _id: crypto.randomUUID(), name: payload.name || 'New Category', description: payload.description || '', image: payload.image || '', banner: payload.banner || payload.categoryBanner || '', status: payload.status || 'active', createdAt: now(), updatedAt: now() };
  categories.unshift(category);
  return category;
}

function updateCategory(id, payload = {}) {
  const category = categories.find((item) => matchesId(item, id));
  if (!category) return null;
  Object.assign(category, payload, { updatedAt: now() });
  return category;
}

function deleteCategory(id) {
  const index = categories.findIndex((item) => matchesId(item, id));
  if (index === -1) return false;
  categories.splice(index, 1);
  return true;
}

function listCoupons() {
  return coupons;
}

function createCoupon(payload = {}) {
  const coupon = { _id: crypto.randomUUID(), code: String(payload.code || 'NEWCODE').toUpperCase(), discountType: payload.discountType || 'percentage', discountValue: Number(payload.discountValue || 0), minimumPurchase: Number(payload.minimumPurchase || 0), maximumDiscount: Number(payload.maximumDiscount || 0), usageLimit: Number(payload.usageLimit || 0), expiresAt: payload.expiresAt || payload.expiryDate || '', isActive: payload.isActive !== false && payload.status !== 'inactive', createdAt: now(), updatedAt: now() };
  coupons.unshift(coupon);
  return coupon;
}

function updateCoupon(id, payload = {}) {
  const coupon = coupons.find((item) => matchesId(item, id));
  if (!coupon) return null;
  Object.assign(coupon, payload, { code: String(payload.code || coupon.code).toUpperCase(), updatedAt: now() });
  return coupon;
}

function deleteCoupon(id) {
  const index = coupons.findIndex((item) => matchesId(item, id));
  if (index === -1) return false;
  coupons.splice(index, 1);
  return true;
}

function listReviews() {
  return reviews;
}

function updateReview(id, payload = {}) {
  const review = reviews.find((item) => matchesId(item, id));
  if (!review) return null;
  Object.assign(review, payload, { updatedAt: now() });
  return review;
}

function deleteReview(id) {
  const index = reviews.findIndex((item) => matchesId(item, id));
  if (index === -1) return false;
  reviews.splice(index, 1);
  return true;
}

function listUsers() {
  const orderCounts = orders.reduce((acc, order) => ({ ...acc, [order.user]: (acc[order.user] || 0) + 1 }), {});
  return Array.from(usersById.values()).map((user) => ({ ...publicUser(user), ordersCount: orderCounts[user._id] || 0, status: user.isBlocked ? 'blocked' : 'active', createdAt: user.createdAt || now() }));
}

function userStatistics() {
  const users = Array.from(usersById.values()).filter((user) => user.role === 'user');
  return {
    registeredUsers: users.length,
    loggedInUsers: users.filter((user) => user.lastLoginAt).length,
    activeUsers: users.filter((user) => !user.isBlocked).length,
    blockedUsers: users.filter((user) => user.isBlocked).length,
    generatedAt: now(),
  };
}

function updateUserByAdmin(id, payload = {}) {
  const user = findUserById(id);
  if (!user) return null;
  if (payload.name) user.name = payload.name;
  if (payload.email) {
    if (user.email) usersByEmail.delete(normalizeEmail(user.email));
    user.email = normalizeEmail(payload.email);
    usersByEmail.set(user.email, user);
  }
  if (payload.phone !== undefined) user.phone = payload.phone;
  if (payload.status) user.isBlocked = payload.status === 'blocked';
  if (payload.isBlocked !== undefined) user.isBlocked = Boolean(payload.isBlocked);
  return { ...publicUser(user), status: user.isBlocked ? 'blocked' : 'active' };
}

function deleteUser(id) {
  const user = findUserById(id);
  if (!user) return false;
  usersById.delete(id);
  if (user.email) usersByEmail.delete(normalizeEmail(user.email));
  return true;
}

function getSettings() {
  return settings;
}

function updateSettings(section, payload = {}) {
  settings[section] = { ...(settings[section] || {}), ...payload };
  return settings;
}

function adminSummary() {
  const salesOrders = orders.filter((order) => !['cancelled', 'refunded'].includes(order.orderStatus));
  const revenue = salesOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingOrders = orders.filter((order) => ['placed', 'pending', 'confirmed'].includes(order.orderStatus || 'placed')).length;
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (5 - index), 1));
    return {
      key: date.toISOString().slice(0, 7),
      month: date.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
    };
  });
  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: Array.from(usersById.values()).filter((user) => user.role === 'user').length,
    totalCategories: categories.length,
    totalRevenue: revenue,
    pendingOrders,
    salesOverview: months.map(({ key, month }) => {
      const matchingOrders = salesOrders.filter((order) => String(order.createdAt || '').slice(0, 7) === key);
      return { month, revenue: matchingOrders.reduce((sum, order) => sum + Number(order.total || 0), 0), orders: matchingOrders.length };
    }),
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  addToCart,
  createOrder,
  changeUserPassword,
  findOrdersForUser,
  findUserByEmail,
  findUserById,
  getCart,
  getWishlist,
  adminSummary,
  createCategory,
  createCoupon,
  createProduct,
  publicUser,
  recordLogin,
  deleteCategory,
  deleteCoupon,
  deleteProduct,
  deleteReview,
  deleteUser,
  getSettings,
  listCategories,
  listCoupons,
  listProducts,
  listReviews,
  listUsers,
  saveUserAddress,
  setPassword,
  updateCategory,
  updateCoupon,
  updateProduct,
  updateReview,
  updateSettings,
  updateUserByAdmin,
  updateUserProfile,
  userStatistics,
  updateOrderStatus,
  upsertUser,
  verifyPassword,
  removeFromCart,
  toggleWishlist,
};
