const express = require('express');
const router = express.Router();
const adminInfoController = require('../../controllers/Admin_controller/admin_info.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

// Nhập cấu hình Cloudinary thay vì Multer local
const { uploadUser } = require('../../middlewares/upload.js'); 

// ==========================================
// CÁC ROUTE LẤY VÀ SỬA THÔNG TIN ADMIN
// ==========================================
router.get('/laythongtin', authMiddleware.verifyToken, authMiddleware.verifyStaff, adminInfoController.laythongtin);

// Thay thế upload.single('avatar') bằng uploadUser.single('avatar')
router.post('/change_info', authMiddleware.verifyToken, authMiddleware.verifyStaff, uploadUser.single('avatar'), adminInfoController.capnhatthongtin);

router.post('/change_password', authMiddleware.verifyToken, authMiddleware.verifyStaff, adminInfoController.doi_mat_khau);

module.exports = router;