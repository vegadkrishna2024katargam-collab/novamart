const express = require('express');
const Category = require('../models/Category');
const { admin, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await Category.find().sort('name'));
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, admin, async (req, res, next) => {
  try {
    res.status(201).json(await Category.create(req.body));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
