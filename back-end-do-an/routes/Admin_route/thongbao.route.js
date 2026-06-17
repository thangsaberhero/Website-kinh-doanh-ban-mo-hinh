const express = require('express');
const router = express.Router();
const thongBaoController = require('../../controllers/Admin_controller/thongbao.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.verifyStaff); 

router.get('/', thongBaoController.lay_danh_sach);
router.put('/read-all', thongBaoController.danh_dau_tat_ca);
router.get('/all-page', thongBaoController.lay_tat_ca_full_page);
router.delete('/delete-read', thongBaoController.xoa_thong_bao_da_doc);
router.put('/read/:id', thongBaoController.danh_dau_da_doc);
router.delete('/delete/:id', thongBaoController.xoa_thong_bao);

module.exports = router;