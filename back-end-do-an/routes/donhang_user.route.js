const express = require('express');
const router = express.Router();
const donhang_userController = require('../controllers/donhang_user.ctrl.js');
// Nhập khẩu ông bảo vệ vừa tạo
//const verifyToken = require('../middlewares/auth.middleware.js'); 


router.post('/add', donhang_userController.them_hang_vao_gio);
router.post('/update', donhang_userController.cap_nhat_gio_hang);
router.post('/delete', donhang_userController.xoa_hang_trong_gio);
router.post('/xacnhan',donhang_userController.xac_nhan_don_hang);
router.get('/watch/:MaKH',donhang_userController.xem_hang_trong_gio);
router.get('/watch_order/:MaKH', donhang_userController.xem_don_hang);
router.get('/watch_detail_order/:MaKH/:MaDH', donhang_userController.xem_hang_trong_don_hang);


//Muốn có nâng cao đăng nhập thì để verifyToken vào giữa (đang thử nghiệm)
module.exports = router;