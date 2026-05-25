const express = require('express');
const router = express.Router();
const donhang_admin_Controller = require('../../controllers/Admin_controller/donhang_admin.ctrl');
const bao_cao_ctrl = require('../../controllers/Admin_controller/bao_cao.ctrl');
const authMiddleware = require('../../middlewares/auth.middleware.js');

// ==========================================
// 1. NHÓM LẤY DỮ LIỆU VÀ BÁO CÁO (GET)
// ==========================================
router.get('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.liet_ke_don_hang);
router.get('/:MaDH', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xem_chi_tiet_don_hang);

// API Mới: Lấy dữ liệu để in hóa đơn / mã vận đơn
router.get('/print/:MaDH', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.in_hoa_don);

// API Xuất Excel (Đặc quyền Admin)
router.get('/export-excel', authMiddleware.verifyToken, authMiddleware.verifyAdmin, bao_cao_ctrl.xuat_bao_cao_excel);

// ==========================================
// 2. NHÓM TẠO MỚI DỮ LIỆU (POST)
// ==========================================
router.post('/add', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.tao_don_hang_ngoai);

// ==========================================
// 3. NHÓM CẬP NHẬT/THAY ĐỔI DỮ LIỆU (PUT)
// ==========================================
// Đổi về verifyStaff để nhân viên trực page có thể sửa địa chỉ cho khách
router.put('/fix', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.sua_thong_tin_don_hang);

// Các thao tác luồng trạng thái
router.put('/update', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.cap_nhat_trang_thai_don_hang);
router.put('/huy', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.huy_don_hang);
router.put('/hoan_hang', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.hoan_tra_don_hang);

// API Mới: Xác nhận thanh toán (Thu tiền COD, Chuyển khoản...)
//router.put('/payment-status', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xac_nhan_thanh_toan);

module.exports = router;