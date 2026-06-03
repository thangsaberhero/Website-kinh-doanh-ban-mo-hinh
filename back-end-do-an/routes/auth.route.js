const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.ctrl.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng thử lại sau 5 phút!"
    },
    standardHeaders: true,
    legacyHeaders: false, 
});

router.post('/pre-register', otpLimiter, authController.preRegister);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authMiddleware.verifyToken, authController.change_password);
router.post('/google', authController.googleLogin);
router.post('/facebook', authController.facebookLogin);
module.exports = router;