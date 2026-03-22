const express = require('express');
const router = express.Router();
const homeviewController = require('../controllers/donhang_user.ctrl.js');

router.get('/', homeviewController.getAllProduct);

router.get('/:id', homeviewController.getProductById);

module.exports = router;