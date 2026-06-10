const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/signup', upload.single('profileImage'), body('email').isEmail(), body('password').isLength({ min: 6 }), controller.signup);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = router;
