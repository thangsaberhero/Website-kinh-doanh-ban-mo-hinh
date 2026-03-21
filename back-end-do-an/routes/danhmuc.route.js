const express = require('express');
const router = express.Router();
const danhMucController = require('../controllers/danhmuc.ctrl.js');

// Định nghĩa các endpoint (VD: localhost:3000/api/danhmuc/...)
router.get('/', danhMucController.getAll);
router.post('/', danhMucController.create);

module.exports = router;