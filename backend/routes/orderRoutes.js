const express = require('express');
const controller = require('../controllers/orderController');
const { admin, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, controller.createOrder);
router.get('/', protect, controller.getOrders);
router.put('/:id/status', protect, admin, controller.updateOrderStatus);

module.exports = router;
