const express = require('express');
const router = express.Router();
const homeviewController = require('../controllers/homeview.ctrl.js');

router.get('/', homeviewController.getAllProduct);

router.get('/search', homeviewController.searchProducts);

router.get('/:id', homeviewController.getProductById);

module.exports = router;