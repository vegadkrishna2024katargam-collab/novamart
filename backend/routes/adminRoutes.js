const express = require('express');
const controller = require('../controllers/adminController');
const { admin, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', controller.dashboard);

router.get('/products', controller.listProducts);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

router.get('/orders', controller.listOrders);
router.put('/orders/:id', controller.updateOrder);

router.get('/users', controller.listUsers);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);

router.get('/categories', controller.listCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

router.get('/coupons', controller.listCoupons);
router.post('/coupons', controller.createCoupon);
router.put('/coupons/:id', controller.updateCoupon);
router.delete('/coupons/:id', controller.deleteCoupon);

router.get('/reviews', controller.listReviews);
router.put('/reviews/:id', controller.updateReview);
router.delete('/reviews/:id', controller.deleteReview);

router.get('/settings', controller.getSettings);
router.put('/settings/:section', controller.updateSettings);

module.exports = router;
