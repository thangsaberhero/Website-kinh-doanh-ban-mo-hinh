const express = require('express');
const router = express.Router();
const blockchainController = require('../../controllers/Staff_controller/blockchain.controller.js');

// Dành cho Web hiển thị cho khách
router.get('/history/:serialNumber', blockchainController.truyXuatNguonGoc);

// Dành cho Admin gọi từ trang quản trị
router.post('/mint', blockchainController.mintProduct);
router.post('/update-status', blockchainController.updateProductStatus);

// Tạo mã QR dựa trên Serial (Bổ sung mới)
router.get('/generate-qr/:serialNumber', blockchainController.generateProductQR);

router.get('/get-serials', blockchainController.getValidSerials);
module.exports = router;