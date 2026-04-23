const express = require('express');
const router = express.Router();
// Trỏ tới file controller bạn vừa tạo
const blockchainController = require('../../controllers/Staff_controller/blockchain.controller');

// Dành cho Web hiển thị cho khách
router.get('/history/:serialNumber', blockchainController.truyXuatNguonGoc);

// Dành cho Admin gọi từ trang quản trị
router.post('/mint', blockchainController.mintProduct);
router.post('/update-status', blockchainController.updateProductStatus);

module.exports = router;