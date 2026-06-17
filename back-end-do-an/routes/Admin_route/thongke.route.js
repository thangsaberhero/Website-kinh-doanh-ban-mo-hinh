const express = require('express');
const router = express.Router();
const thongkeController = require('../../controllers/Admin_controller/thongke.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.verifyAdmin);

router.get('/doanhthu', thongkeController.thongkedoanhthu);
router.get('/sanpham', thongkeController.thongkesanpham);
router.get('/donhang', thongkeController.thongkedonhang);
router.get('/khachhang', thongkeController.thongkekhachhang);
router.get('/khuyenmai', thongkeController.thongkehieuquakhuyenmai);
router.get('/bieudo', thongkeController.thongkebieudo);
router.get('/bosung', thongkeController.thongkebosung);
router.get('/top-san-pham', thongkeController.topsanpham);
router.get('/xuatExcelDoanhThu', thongkeController.xuatExcelDoanhThu);
router.get('/xuatExcelDashboard', thongkeController.xuatExcelDashboard);
router.get('/xuat-excel-tuy-chinh', thongkeController.xuatExcelTuyChinh);

module.exports = router;