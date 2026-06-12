const express = require('express');
const router = express.Router();
const donhang_admin_Controller = require('../../controllers/Admin_controller/donhang_admin.ctrl');
const authMiddleware = require('../../middlewares/auth.middleware.js');

// ==========================================
// 1. NHÓM LẤY DỮ LIỆU VÀ BÁO CÁO (GET)
// ==========================================
// Đưa TẤT CẢ các route tĩnh lên trên cùng
router.get('/get_magg', authMiddleware.verifyToken, authMiddleware.verifyAdmin, donhang_admin_Controller.liet_ke_maGG_tai_quay)
router.get('/export-excel', authMiddleware.verifyToken, authMiddleware.verifyAdmin, donhang_admin_Controller.xuatExcelDonHang);
router.get('/print/:MaDH', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.in_hoa_don);
router.get('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.liet_ke_don_hang);
router.get('/search-products',authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.liet_ke_san_pham);
router.get('/payment', authMiddleware.verifyToken, authMiddleware.verifyAdmin, donhang_admin_Controller.liet_ke_giao_dich);
router.get('/payment/export', authMiddleware.verifyToken, authMiddleware.verifyAdmin, donhang_admin_Controller.xuat_excel_giao_dich);
router.get('/:MaDH', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xem_chi_tiet_don_hang);

// ==========================================
// 2. NHÓM TẠO MỚI DỮ LIỆU (POST)
// ==========================================
router.post('/add', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.tao_don_hang_ngoai);
router.post('/update', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.cap_nhat_trang_thai_don_hang);
router.post('/huy', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.huy_don_hang);

// ==========================================
// 3. NHÓM CẬP NHẬT/THAY ĐỔI DỮ LIỆU (PUT)
// ==========================================
router.put('/fix', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.sua_thong_tin_don_hang);
router.put('/update-shipping', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.sua_thong_tin_van_chuyen);
router.put('/hoan_hang', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.hoan_tra_don_hang);

router.put('/payment-status', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xac_nhan_thanh_toan);
router.put('/refund-status', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xac_nhan_hoan_tien);

module.exports = router;