const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/User_controller/review.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');
const { uploadReview } = require('../../middlewares/upload.js');

router.get('/check-purchase-status', authMiddleware.verifyToken, reviewController.checkPurchaseStatus);
router.get('/product/:maMH', reviewController.getReviewsByProduct);

// CHỈ GIỮ LẠI ĐÚNG 1 ROUTER NÀY
router.post('/create', 
    authMiddleware.verifyToken, 
    uploadReview.array('HinhAnh', 5), 
    reviewController.createReview
);

module.exports = router;