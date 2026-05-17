const express = require('express');
const router = express.Router();
const adminReviewController = require('../../controllers/Admin_controller/review.ctrl.js');
const verifyToken = require('../../middlewares/auth.middleware.js');

router.get('/list', verifyToken, adminReviewController.getAllReviewsAdmin);
router.put('/:MaDG', verifyToken, adminReviewController.moderateReview);

module.exports = router;