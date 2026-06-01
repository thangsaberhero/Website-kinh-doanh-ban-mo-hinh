const express = require('express');
const router = express.Router();
const donhang_userController = require('../../controllers/User_controller/donhang_user.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.post('/add', authMiddleware.verifyToken, donhang_userController.them_hang_vao_gio);
router.post('/update', authMiddleware.verifyToken, donhang_userController.cap_nhat_gio_hang);
router.post('/delete', authMiddleware.verifyToken, donhang_userController.xoa_hang_trong_gio);
router.post('/xacnhan', authMiddleware.verifyToken,donhang_userController.xac_nhan_don_hang);
router.post('/deleteAll', authMiddleware.verifyToken, donhang_userController.xoa_het_hang_trong_gio);

router.post('/payment/momo/create', authMiddleware.verifyToken, donhang_userController.tao_link_momo_mock);
router.post('/payment/momo/confirm', authMiddleware.verifyToken, donhang_userController.xac_nhan_momo_mock);

router.get('/watch', authMiddleware.verifyToken,donhang_userController.xem_hang_trong_gio);
router.get('/watch_order', authMiddleware.verifyToken, donhang_userController.xem_don_hang);
router.get('/get_magg', authMiddleware.verifyToken, donhang_userController.liet_ke_maGG)
router.get('/watch_detail_order/:MaDH', authMiddleware.verifyToken, donhang_userController.xem_hang_trong_don_hang);

module.exports = router;