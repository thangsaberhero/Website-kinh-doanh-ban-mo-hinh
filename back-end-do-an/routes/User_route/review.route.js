const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/User_controller/review.ctrl.js');
const verifyToken = require('../../middlewares/auth.middleware.js');
const { uploadReview } = require('../../middlewares/upload.js');

router.get('/product/:id', reviewController.getReviewsByProduct);
router.post('/create', verifyToken, reviewController.createReview);
router.get('/check-purchase-status', verifyToken, reviewController.checkPurchaseStatus);

router.post('/upload', verifyToken, uploadReview.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy file tải lên" });
        }
        const fileNames = req.files.map(file => file.filename);
        res.status(200).json({ images: fileNames });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi lưu ảnh" });
    }
});
module.exports = router;