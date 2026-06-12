const express = require('express');
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/authMiddleware');
const demoStore = require('../utils/demoStore');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json(demoStore.getWishlist(req.user._id));
    res.json(await Wishlist.findOne({ user: req.user._id }).populate('products') || { products: [] });
  } catch (error) {
    next(error);
  }
});

router.post('/toggle', protect, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json(demoStore.toggleWishlist(req.user._id, req.body.productId));
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(201).json(await Wishlist.create({ user: req.user._id, products: [req.body.productId] }));
    const exists = wishlist.products.some((id) => id.toString() === req.body.productId);
    wishlist.products = exists ? wishlist.products.filter((id) => id.toString() !== req.body.productId) : wishlist.products.concat(req.body.productId);
    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
