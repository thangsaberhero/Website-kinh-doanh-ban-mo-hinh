const express = require('express');
const router = express.Router();
const donhang_userController = require('../../controllers/User_controller/donhang_user.ctrl.js');

router.post('/add', donhang_userController.them_hang_vao_gio);
router.post('/update', donhang_userController.cap_nhat_gio_hang);
router.post('/delete', donhang_userController.xoa_hang_trong_gio);
router.post('/xacnhan',donhang_userController.xac_nhan_don_hang);

router.post('/payment/momo/create', donhang_userController.tao_link_momo_mock);
router.post('/payment/momo/confirm', donhang_userController.xac_nhan_momo_mock);

router.get('/watch/:MaKH',donhang_userController.xem_hang_trong_gio);
router.get('/watch_order/:MaKH', donhang_userController.xem_don_hang);
router.get('/watch_detail_order/:MaKH/:MaDH', donhang_userController.xem_hang_trong_don_hang);

module.exports = router;