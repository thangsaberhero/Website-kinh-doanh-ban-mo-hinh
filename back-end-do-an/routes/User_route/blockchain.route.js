const express = require('express');
const router = express.Router();
const blockchainController = require('../../controllers/Staff_controller/blockchain.controller.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

// Dành cho Admin gọi từ trang quản trị
router.post('/mint', authMiddleware.verifyToken, authMiddleware.verifyStaff, blockchainController.mintProduct);
router.post('/update', authMiddleware.verifyToken, authMiddleware.verifyStaff, blockchainController.updateProductStatus);
router.get('/get-serials', authMiddleware.verifyToken, authMiddleware.verifyStaff, blockchainController.getValidSerials);

// Dành cho Web hiển thị cho khách
router.get('/history/:serialNumber', blockchainController.truyXuatNguonGoc);
// Tạo mã QR dựa trên Serial (Bổ sung mới)
router.get('/generate-qr/:serialNumber', blockchainController.generateProductQR);

module.exports = router;