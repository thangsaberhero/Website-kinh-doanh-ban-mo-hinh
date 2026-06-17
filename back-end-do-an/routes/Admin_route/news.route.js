const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const newsController = require('../../controllers/Admin_controller/news.ctrl.js');
const { uploadNews } = require('../../middlewares/upload.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

const viewLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { 
        success: false, 
        message: "Hệ thống phát hiện lượt xem tăng bất thường. Vui lòng thử lại sau ít phút!" 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/admin/list', authMiddleware.verifyToken, authMiddleware.verifyStaff, newsController.getAdminNews);
router.get('/admin/stats', authMiddleware.verifyToken, authMiddleware.verifyStaff, newsController.getAdminStats);
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, uploadNews.single('thumbnail'), newsController.createNews);
router.get('/', newsController.getAllNews);
router.patch('/:id/view', viewLimiter, newsController.incrementView)
router.get('/:id/related', newsController.getRelatedNews);

router.get('/:id', newsController.getNewsById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyStaff, uploadNews.single('thumbnail'), newsController.updateNews);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyStaff, newsController.deleteNews);

module.exports = router;