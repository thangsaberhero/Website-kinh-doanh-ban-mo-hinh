const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/User_controller/review.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');
const { uploadReview } = require('../../middlewares/upload.js');


router.post('/create', 
    authMiddleware.verifyToken, 
    uploadReview.array('HinhAnh', 5), // 'HinhAnh' là key mà Frontend dùng để append file
    reviewController.createReview
);

router.get('/check-purchase-status', authMiddleware.verifyToken, reviewController.checkPurchaseStatus);
router.get('/product/:maMH', reviewController.getReviewsByProduct);
module.exports = router;