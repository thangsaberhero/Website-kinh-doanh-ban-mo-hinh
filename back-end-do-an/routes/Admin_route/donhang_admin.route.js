const express = require('express');
const router = express.Router();
const donhang_admin_Controller = require('../../controllers/Admin_controller/donhang_admin.ctrl');
const bao_cao_ctrl = require('../../controllers/Admin_controller/bao_cao.ctrl');
const authMiddleware = require('../../middlewares/auth.middleware.js');
// Tạo một API mới. LƯU Ý DÙNG GET ĐỂ FRONTEND DỄ DOWNLOAD

router.post('/add', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.tao_don_hang_ngoai);
router.post('/fix', authMiddleware.verifyToken, authMiddleware.verifyAdmin, donhang_admin_Controller.sua_thong_tin_don_hang);
router.post('/hoan_hang', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.hoan_tra_don_hang);
router.post('/update', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.cap_nhat_trang_thai_don_hang);
router.post('/huy', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.huy_don_hang);

router.get('/export-excel', authMiddleware.verifyToken, authMiddleware.verifyAdmin, bao_cao_ctrl.xuat_bao_cao_excel);

router.get('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.liet_ke_don_hang);
router.get('/:MaDH', authMiddleware.verifyToken, authMiddleware.verifyStaff, donhang_admin_Controller.xem_chi_tiet_don_hang);



module.exports = router;