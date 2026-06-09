const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/User_controller/contact.ctrl.js');

router.post('/submit', contactController.submitContact);

module.exports = router;