const express = require('express');
const router = express.Router();
const donhang_admin_Controller = require('../../controllers/Admin_controller/donhang_admin.ctrl');
const bao_cao_ctrl = require('../../controllers/Admin_controller/bao_cao.ctrl');

// Tạo một API mới. LƯU Ý DÙNG GET ĐỂ FRONTEND DỄ DOWNLOAD

router.post('/add', donhang_admin_Controller.tao_don_hang);
router.post('/fix', donhang_admin_Controller.sua_thong_tin_don_hang);
router.post('/hoan_hang', donhang_admin_Controller.hoan_tra_don_hang);
router.post('/update',donhang_admin_Controller.cap_nhat_trang_thai_don_hang);
router.post('/huy',donhang_admin_Controller.huy_don_hang);

router.get('/export-excel', bao_cao_ctrl.xuat_bao_cao_excel);

router.get('/', donhang_admin_Controller.liet_ke_don_hang);
router.get('/:MaDH',donhang_admin_Controller.xem_chi_tiet_don_hang);



module.exports = router;