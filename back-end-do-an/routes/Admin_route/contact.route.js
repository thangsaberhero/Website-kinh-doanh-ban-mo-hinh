const express = require('express');
const router = express.Router();
const adminContactController = require('../../controllers/Admin_controller/contact.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.get('/list', authMiddleware.verifyToken, authMiddleware.verifyStaff, adminContactController.getAllContactsAdmin);
router.put('/reply/:MaLH', authMiddleware.verifyToken, authMiddleware.verifyStaff, adminContactController.replyContact)

module.exports = router;