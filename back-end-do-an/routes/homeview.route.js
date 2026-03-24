const express = require('express');
const router = express.Router();
const product_view = require('../controllers/homeview.ctrl.js');

router.get('/', product_view.getAllProduct);

router.get('/:id', product_view.getProductById);

router.get('/variants/:id', product_view.getVariantProductById);

router.get('/danhmuc', product_view.getAllvariant);
router.get('/danhmuc/:maDM/chitiet', product_view.getAlldetailvariant);
router.get('/danhmuc/:maDM/products', product_view.getProductsByVariant);
router.get('/chitietdm/:maCTDM/products', product_view.getProductsByDetailVariant);
router.get('/search/:thongtin', product_view.getProductsBySearch);

module.exports = router;