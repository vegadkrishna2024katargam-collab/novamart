const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/me', protect, controller.getMe);
router.put('/me', protect, upload.single('profileImage'), controller.updateMe);
router.put('/me/password', protect, controller.changePassword);

module.exports = router;
