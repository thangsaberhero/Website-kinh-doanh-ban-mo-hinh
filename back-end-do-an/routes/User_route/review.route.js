const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/User_controller/review.ctrl.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');
const { uploadReview } = require('../../middlewares/upload.js');

// Các API lấy dữ liệu
router.get('/check-purchase-status', authMiddleware.verifyToken, reviewController.checkPurchaseStatus);
router.get('/product/:maMH', reviewController.getReviewsByProduct);

router.post('/upload', authMiddleware.verifyToken, uploadReview.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy file tải lên" });
        }
        
        // 💡 BÍ KÍP DEBUG: In ra console để xem Cloudinary thực sự trả về những gì
        console.log("Dữ liệu file từ Cloudinary:", req.files);

        // 🔴 ĐÃ SỬA: Bao phủ mọi tên biến mà Cloudinary hoặc Local Disk có thể trả về
        const fileNames = req.files.map(file => file.secure_url || file.url || file.path || file.filename);
        
        // 🔴 TẤM KHIÊN 1: Lọc bỏ các phần tử undefined/null (nếu có)
        const validFileNames = fileNames.filter(link => link != null);

        res.status(200).json({ images: validFileNames });
    } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lưu ảnh" });
    }
});

router.post('/create', authMiddleware.verifyToken, reviewController.createReview);

module.exports = router;