const express = require('express');
const router = express.Router();
const account_Controller = require('../../controllers/Admin_controller/account_admin.ctrl');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.post('/add', authMiddleware.verifyToken, account_Controller.them_tai_khoan);
router.post('/lock', authMiddleware.verifyToken, account_Controller.thay_doi_khoa_tai_khoan);
router.get('/', authMiddleware.verifyToken, account_Controller.liet_ke_tai_khoan);
router.get('/stats', authMiddleware.verifyToken, account_Controller.thong_ke_tai_khoan);
router.get('/export', authMiddleware.verifyToken, account_Controller.xuat_bao_cao_tai_khoan);
router.get('/logs/recent', authMiddleware.verifyToken, account_Controller.lay_nhat_ky_hoat_dong);
router.get('/logs/all', authMiddleware.verifyToken, account_Controller.lay_tat_ca_log_phan_trang);

router.get('/:MaTK', authMiddleware.verifyToken, account_Controller.xem_thong_tin_tai_khoan);
router.put('/update/:MaTK', authMiddleware.verifyToken, account_Controller.sua_thong_tin_tai_khoan);
router.put('/reset-password/:MaTK', authMiddleware.verifyToken, account_Controller.dat_lai_mat_khau);

module.exports = router;