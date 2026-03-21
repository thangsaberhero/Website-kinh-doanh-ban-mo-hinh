const express = require('express');
const router = express.Router();
const homeviewController = require('../controllers/homeview.ctrl.js');

router.get('/', homeviewController.getAllProduct);

module.exports = router;