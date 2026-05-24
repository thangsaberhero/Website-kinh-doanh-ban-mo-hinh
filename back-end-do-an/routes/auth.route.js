const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.ctrl.js');
const verifyToken = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', verifyToken, authController.change_password);
module.exports = router;