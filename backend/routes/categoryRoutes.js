const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const { admin, protect } = require('../middleware/authMiddleware');
const demoStore = require('../utils/demoStore');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json(demoStore.listCategories());
    res.json(await Category.find().sort('name'));
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, admin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(201).json(demoStore.createCategory(req.body));
    res.status(201).json(await Category.create(req.body));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
