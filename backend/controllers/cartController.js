const Cart = require('../models/Cart');

exports.addToCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $push: { items: { product: req.body.productId, quantity: req.body.quantity || 1 } } },
      { new: true, upsert: true }
    ).populate('items.product');
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { product: req.params.id } } }, { new: true }).populate('items.product');
    res.json(cart);
  } catch (error) {
    next(error);
  }
};
