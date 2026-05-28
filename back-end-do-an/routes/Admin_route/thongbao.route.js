const express = require('express');
const router = express.Router();
const thongBaoController = require('../../controllers/Admin_controller/thongbao.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.get('/', authMiddleware.verifyToken, thongBaoController.lay_danh_sach);
router.put('/read-all', authMiddleware.verifyToken, thongBaoController.danh_dau_tat_ca);
router.get('/all-page', authMiddleware.verifyToken, thongBaoController.lay_tat_ca_full_page);
router.delete('/delete-read', authMiddleware.verifyToken, thongBaoController.xoa_thong_bao_da_doc);
router.put('/read/:id', authMiddleware.verifyToken, thongBaoController.danh_dau_da_doc);
router.delete('/delete/:id', authMiddleware.verifyToken, thongBaoController.xoa_thong_bao);

module.exports = router;