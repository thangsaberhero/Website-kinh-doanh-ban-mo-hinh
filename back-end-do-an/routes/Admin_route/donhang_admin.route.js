const express = require('express');
const router = express.Router();
const donhang_admin_Controller = require('../../controllers/Admin_controller/donhang_admin.ctrl');
const authMiddleware = require('../../middlewares/auth.middleware.js');

// ==========================================
// 1. NHÓM LẤY DỮ LIỆU VÀ BÁO CÁO (GET)
// ==========================================
// Đưa TẤT CẢ các route tĩnh lên trên cùng
router.get('/export-excel', authMiddleware.verifyToken, authMiddleware.verifyAdmin, donhang_admin_Controller.xuatExcelDonHang);
router.get('/print/:MaDH', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.in_hoa_don);
router.get('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.liet_ke_don_hang);
router,get('/search-products',authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.lietketimkiem);

// CHỐT CHẶN CUỐI CÙNG: Route chứa tham số động (/:MaDH) phải ở ĐÁY của nhóm GET
router.get('/:MaDH', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xem_chi_tiet_don_hang);

// ==========================================
// 2. NHÓM TẠO MỚI DỮ LIỆU (POST)
// ==========================================
router.post('/add', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.tao_don_hang_ngoai);

// ĐỔI TỪ PUT SANG POST: Để khớp 100% với hàm fetch() ở Frontend Vue.js
router.post('/update', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.cap_nhat_trang_thai_don_hang);
router.post('/huy', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.huy_don_hang);

// ==========================================
// 3. NHÓM CẬP NHẬT/THAY ĐỔI DỮ LIỆU (PUT)
// ==========================================
// Đổi về verifyStaff để nhân viên trực page có thể sửa địa chỉ cho khách
router.put('/fix', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.sua_thong_tin_don_hang);
router.put('/hoan_hang', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.hoan_tra_don_hang);

// API Mới: Xác nhận thanh toán (Thu tiền COD, Chuyển khoản...)
//router.put('/payment-status', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xac_nhan_thanh_toan);

module.exports = router;