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

// 1. API Lấy dữ liệu (Public - Ai cũng xem được để load giao diện)
router.get('/', setting_Controller.lay_toan_bo_cai_dat);

// ==========================================
// CÁC API CẬP NHẬT (Chỉ Admin mới có quyền)
// ==========================================

// 2. Cập nhật các cài đặt dạng VĂN BẢN (Tên shop, hotline, email...) - Không cần Multer
router.put('/update_text', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    setting_Controller.cap_nhat_van_ban
);

// 3. Cập nhật LOGO HEADER (Logo ngang - dạng 1 file)
router.put('/update_logo_header', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadLogoHeader.single('logo_header'), // Tên trường gửi từ Frontend phải là 'logo_header'
    setting_Controller.cap_nhat_file_don
);

// 4. Cập nhật LOGO FAVICON (Logo vuông nhỏ - dạng 1 file)
router.put('/update_logo_favicon', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadLogo.single('logo_favicon'), 
    setting_Controller.cap_nhat_file_don
);

// 5. Cập nhật ẢNH NỀN ĐĂNG NHẬP (Dạng 1 file)
router.put('/update_login_bg', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadLoginSlider.single('login_bg', 5), 
    setting_Controller.cap_nhat_mang_file
);

// 6. Cập nhật BANNER TRANG CHỦ (Dạng mảng nhiều file - ví dụ tối đa 5 ảnh)
router.put('/update_home_banner', 
    authMiddleware.verifyToken, 
    authMiddleware.verifyAdmin, 
    uploadHomeSlider.array('home_banner', 5), // Tên trường 'home_banner', nhận tối đa 5 file
    setting_Controller.cap_nhat_mang_file
);

// Xuất thẳng router ra ngoài
module.exports = router;