const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const demoStore = require('../utils/demoStore');

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function matchesQuery(product, query = {}) {
  const category = typeof product.category === 'object' ? product.category?.name : product.category;
  const search = String(query.search || '').trim().toLowerCase();
  return (!query.category || category === query.category)
    && (!search || `${product.name || ''} ${product.brand || ''} ${category || ''} ${product.description || ''}`.toLowerCase().includes(search));
}

exports.getProducts = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.json(demoStore.listProducts().filter((product) => matchesQuery(product, req.query)));
    const filter = {};
    if (req.query.category) {
      const category = await Category.findOne({ name: req.query.category }).select('_id');
      if (!category) return res.json([]);
      filter.category = category._id;
    }
    if (req.query.search) {
      const search = { $regex: req.query.search, $options: 'i' };
      filter.$or = [{ name: search }, { brand: search }, { description: search }];
    }
    const products = await Product.find(filter).populate('category').sort('-createdAt');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const product = demoStore.listProducts().find((item) => String(item._id || item.id) === String(req.params.id));
      return product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Product not found' });
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    if (!isMongoReady()) return res.status(201).json(demoStore.createProduct(req.body));
    const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];
    const product = await Product.create({ ...req.body, images });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const product = demoStore.updateProduct(req.params.id, req.body);
      return product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
    }
    const images = req.files?.length ? req.files.map((file) => `/uploads/${file.filename}`) : undefined;
    const product = await Product.findByIdAndUpdate(req.params.id, { ...req.body, ...(images && { images }) }, { new: true, runValidators: true });
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
