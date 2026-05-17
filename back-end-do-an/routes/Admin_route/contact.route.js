const express = require('express');
const router = express.Router();
const adminContactController = require('../../controllers/Admin_controller/contact.ctrl.js');
const verifyToken = require('../../middlewares/auth.middleware.js');

router.get('/list', verifyToken, adminContactController.getAllContactsAdmin);
router.put('/reply/:MaLH', verifyToken, adminContactController.replyContact)

module.exports = router;