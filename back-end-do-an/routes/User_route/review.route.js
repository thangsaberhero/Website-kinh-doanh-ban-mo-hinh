const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/User_controller/review.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');
const { uploadReview } = require('../../middlewares/upload.js');

// Các API lấy dữ liệu
router.get('/check-purchase-status', authMiddleware.verifyToken, reviewController.checkPurchaseStatus);
router.get('/product/:maMH', reviewController.getReviewsByProduct);

// ============================================================
// API 1: NHẬN ẢNH VÀ ĐẨY LÊN CLOUDINARY/LOCAL (DÙNG MULTER)
// ============================================================
router.post('/upload', authMiddleware.verifyToken, uploadReview.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy file tải lên" });
        }
        
        // Lấy link ảnh từ Multer (Cloudinary dùng path, Local dùng filename)
        const fileNames = req.files.map(file => file.path || file.filename);
        
        res.status(200).json({ images: fileNames });
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi lưu ảnh" });
    }
});

// ============================================================
// API 2: LƯU JSON ĐÁNH GIÁ (TEXT + MẢNG LINK ẢNH) VÀO DATABASE
// ============================================================
// Lưu ý: KHÔNG dùng middleware uploadReview ở đây nữa
router.post('/create', authMiddleware.verifyToken, reviewController.createReview);

module.exports = router;