const express = require('express');
const router = express.Router();
const info_userController = require('../../controllers/User_controller/info_user.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

const { uploadUser } = require('../../middlewares/upload.js');

router.get('/laythongtin', authMiddleware.verifyToken, info_userController.laythongtin);
router.post('/change_info', authMiddleware.verifyToken, uploadUser.single('avatar'), info_userController.capnhatthongtin);
router.post('/change_password', authMiddleware.verifyToken, info_userController.doi_mat_khau);

module.exports = router;