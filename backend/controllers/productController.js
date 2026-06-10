const Product = require('../models/Product');
const mongoose = require('mongoose');

function isMongoConfigured() {
  const uri = process.env.MONGO_URI;
  return Boolean(uri && uri !== 'your_mongodb_connection');
}

exports.getProducts = async (req, res, next) => {
  try {
    if (!isMongoConfigured()) return res.json([]);
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const products = await Product.find(filter).populate('category').sort('-createdAt');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    if (!isMongoConfigured()) return res.status(404).json({ message: 'Product not found' });
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
    const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];
    const product = await Product.create({ ...req.body, images });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
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
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
