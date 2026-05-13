const express = require('express');
const router = express.Router();
const product_view = require('../../controllers/User_controller/products.ctrl.js');

router.post('/add_remove_favorite', product_view.toggle_favorite_product);
router.get('/check_favorite/:MaKH/:MaMoHinh', product_view.check_favorite_product);
router.get('/list_favorite/:MaKH', product_view.watch_favorite_product);

router.get('/', product_view.getAllProduct);

router.get('/search', product_view.getProductsBySearch);

router.get('/danhmuc', product_view.getAllvariant);
router.get('/hsx', product_view.getAllbrand);
router.get('/danhmuc/:maDM/chitiet', product_view.getAlldetailvariant);
router.get('/danhmuc/:maDM/products', product_view.getProductsByVariant);
router.get('/chitietdm/:maCTDM/products', product_view.getProductsByDetailVariant);
router.get('/variants/:id', product_view.getVariantProductById);
router.get('/:id', product_view.getProductById);
router.get('/related/:id', product_view.getRelatedProducts);

module.exports = router;