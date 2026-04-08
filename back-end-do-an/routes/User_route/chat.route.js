const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../../controllers/User_controller/chatbot.ctrl.js');

router.post('/', chatWithAI);

module.exports = router;