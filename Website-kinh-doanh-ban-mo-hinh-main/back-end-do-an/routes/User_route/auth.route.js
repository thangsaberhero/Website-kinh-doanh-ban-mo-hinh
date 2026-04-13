const express = require('express');
const router = express.Router();
const authController = require('../../controllers/User_controller/auth.ctrl.js');

//back-end-do-an\controllers\User_controller\auth.ctrl.js
//back-end-do-an\routes\User_route\auth.route.js
//D:\Dai_hoc\Chuong_trinh_do_an\back-end-do-an\controllers\User_controller\auth.ctrl.js
//D:\Dai_hoc\Chuong_trinh_do_an\back-end-do-an\routes\User_route\auth.route.js

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

module.exports = router;