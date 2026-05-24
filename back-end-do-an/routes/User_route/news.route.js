const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/User_controller/news.ctrl.js');

router.get('/', newsController.getAllNews);
module.exports = router;