const express = require('express');
const controller = require('../controllers/productController');
const { admin, protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', controller.getProducts);
router.get('/:id', controller.getProduct);
router.post('/', protect, admin, upload.array('images', 8), controller.createProduct);
router.put('/:id', protect, admin, upload.array('images', 8), controller.updateProduct);
router.delete('/:id', protect, admin, controller.deleteProduct);

module.exports = router;
