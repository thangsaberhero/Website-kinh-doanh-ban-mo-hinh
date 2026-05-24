const express = require('express');
const router = express.Router();
const khuyenmaiController = require('../../controllers/Admin_controller/khuyen_mai.ctrl.js');
const verifyToken = require('../../middlewares/auth.middleware.js');

router.get('/search/products', verifyToken, khuyenmaiController.tim_kiem_san_pham);
router.get('/dashboard/stats', verifyToken, khuyenmaiController.thong_ke_khuyen_mai);

router.get('/', khuyenmaiController.liet_ke_chuong_trinh_khuyen_mai);
router.get('/:MaKM', verifyToken, khuyenmaiController.xem_chi_tiet_khuyen_mai);
router.post('/', verifyToken, khuyenmaiController.them_chuong_trinh_khuyen_mai);
router.put('/:id', verifyToken, khuyenmaiController.sua_chuong_trinh_khuyen_mai);
router.delete('/:id', verifyToken, khuyenmaiController.xoa_chuong_trinh_khuyen_mai);

router.get('/vouchers/list', verifyToken, khuyenmaiController.liet_ke_ma_giam_gia);
router.get('/vouchers/:MaGG', verifyToken, khuyenmaiController.xem_chi_tiet_ma_giam_gia);
router.post('/vouchers/create', verifyToken, khuyenmaiController.them_ma_giam_gia);
router.put('/vouchers/update/:id', verifyToken, khuyenmaiController.sua_ma_giam_gia);
router.delete('/vouchers/delete/:id', verifyToken, khuyenmaiController.xoa_ma_giam_gia);

router.post('/:id/products', verifyToken, khuyenmaiController.them_sp_km);
router.delete('/:id/products/:maPhanLoai', verifyToken, khuyenmaiController.xoa_sp_km);

router.post('/vouchers/:id/products', verifyToken, khuyenmaiController.them_sp_voucher);
router.delete('/vouchers/:id/products/:maPhanLoai', verifyToken, khuyenmaiController.xoa_sp_voucher);

module.exports = router;