const express = require('express');
const router = express.Router();
const info_userController = require('../controllers/info_user.ctrl.js');

router.post('/change_info', info_userController.capnhatthongtin);
router.post('/change_password', info_userController.doi_mat_khau);

module.exports = router;