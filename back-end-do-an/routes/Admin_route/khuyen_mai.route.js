const express = require('express');
const router = express.Router();
const khuyenmaiController = require('../../controllers/Admin_controller/khuyen_mai.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.get('/search/products', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.tim_kiem_san_pham);
router.get('/dashboard/stats', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.thong_ke_khuyen_mai);
router.get('/logs/recent', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.lay_nhat_ky_hoat_dong);
router.get('/logs/all', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.lay_tat_ca_log_phan_trang);

router.get('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, khuyenmaiController.liet_ke_chuong_trinh_khuyen_mai);
router.get('/:MaKM', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xem_chi_tiet_khuyen_mai);
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.them_chuong_trinh_khuyen_mai);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.sua_chuong_trinh_khuyen_mai);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xoa_chuong_trinh_khuyen_mai);

router.get('/vouchers/list', authMiddleware.verifyToken, authMiddleware.verifyStaff, khuyenmaiController.liet_ke_ma_giam_gia);
router.get('/vouchers/:MaGG', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xem_chi_tiet_ma_giam_gia);
router.post('/vouchers/create', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.them_ma_giam_gia);
router.put('/vouchers/update/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.sua_ma_giam_gia);
router.delete('/vouchers/delete/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xoa_ma_giam_gia);

router.post('/:id/products', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.them_sp_km);
router.delete('/:id/products/:maPhanLoai', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xoa_sp_km);
router.get('/export/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xuat_bao_cao_khuyen_mai);

router.post('/vouchers/:id/products', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.them_sp_voucher);
router.delete('/vouchers/:id/products/:maPhanLoai', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xoa_sp_voucher);
router.get('/vouchers/export/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, khuyenmaiController.xuat_bao_cao_voucher);

module.exports = router;