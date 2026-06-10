const express = require('express');
const controller = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', protect, controller.addToCart);
router.get('/', protect, controller.getCart);
router.delete('/remove/:id', protect, controller.removeFromCart);

module.exports = router;
