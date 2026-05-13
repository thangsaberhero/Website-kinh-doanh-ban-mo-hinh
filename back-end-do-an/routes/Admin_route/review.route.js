const express = require('express');
const router = express.Router();
const adminReviewController = require('../../controllers/Admin_controller/review.ctrl.js');

router.get('/list', adminReviewController.getAllReviewsAdmin);
router.put('/:MaDG', adminReviewController.moderateReview);

module.exports = router;