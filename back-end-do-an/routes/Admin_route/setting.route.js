const express = require('express');
const router = express.Router();
const setting_Controller = require('../../controllers/Admin_controller/setting.ctrl.js');
// Chúng ta đã import uploadProduct sẵn ở đây rồi, giờ đem ra dùng thôi!
const { uploadHomeSlider, uploadLoginSlider, uploadRegisterSlider, uploadLogoHeader, uploadLogo} = require('../../middlewares/upload.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

const setting = {

}

module.exports = setting;