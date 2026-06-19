const express = require('express');
const router = express.Router();
const setting_Controller = require('../../controllers/Admin_controller/setting.ctrl.js');
const { 
    uploadHomeSlider, 
    uploadLoginSlider, 
    uploadRegisterSlider, 
    uploadLogoHeader, 
    uploadLogo
} = require('../../middlewares/upload.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.get('/', setting_Controller.lay_toan_bo_cai_dat);

// Cập nhật các cài đặt dạng VĂN BẢN (Tên shop, hotline, email...)
router.put('/update_text', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    setting_Controller.cap_nhat_van_ban
);

// Cập nhật LOGO HEADER
router.put('/update_logo_header', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadLogoHeader.single('logo_header'),
    setting_Controller.cap_nhat_file_don
);

// Cập nhật LOGO FAVICON (Logo vuông nhỏ)
router.put('/update_logo_favicon', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadLogo.single('logo_favicon'), 
    setting_Controller.cap_nhat_file_don
);

// Cập nhật ẢNH NỀN ĐĂNG NHẬP
router.put('/update_login_bg', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadLoginSlider.array('login_bg', 5), 
    setting_Controller.cap_nhat_mang_file
);

// Cập nhật BANNER TRANG CHỦ
router.put('/update_home_banner', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadHomeSlider.array('home_banner', 5), 
    setting_Controller.cap_nhat_mang_file
);
router.get('/payment-methods', authMiddleware.verifyToken, authMiddleware.verifyAdmin, setting_Controller.lay_phuong_thuc_thanh_toan);
router.put('/payment-methods/toggle', authMiddleware.verifyToken, authMiddleware.verifyAdmin, setting_Controller.toggle_phuong_thuc);
router.get('/public-payment-methods', setting_Controller.lay_phuong_thuc_thanh_toan);

module.exports = router;