const express = require('express');
const router = express.Router();
const khuyenmaiController = require('../../controllers/Admin_controller/khuyen_mai.ctrl.js');

router.get('/', khuyenmaiController.liet_ke_chuong_trinh_khuyen_mai);

module.exports = router;