const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/chatbot.ctrl.js');

router.post('/', chatWithAI);

module.exports = router;