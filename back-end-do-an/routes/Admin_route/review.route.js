const express = require('express');
const router = express.Router();
const adminReviewController = require('../../controllers/Admin_controller/review.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.get('/list', authMiddleware.verifyToken, adminReviewController.getAllReviewsAdmin);
router.put('/:MaDG', authMiddleware.verifyToken, adminReviewController.moderateReview);

module.exports = router;