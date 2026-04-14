const express = require('express');
const router = express.Router();
const account_Controller = require('../../controllers/Admin_controller/account_admin.ctrl');

router.post('/add', account_Controller.them_tai_khoan);
router.post('/fix', account_Controller.sua_thong_tin_tai_khoan);
router.post('/lock', account_Controller.thay_doi_khoa_tai_khoan);

router.get('/', account_Controller.liet_ke_tai_khoan);
router.get('/:MaTK',account_Controller.xem_thong_tin_tai_khoan);

module.exports = router;