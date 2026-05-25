const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/Admin_controller/news.ctrl.js');
const { uploadNews } = require('../../middlewares/upload.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.get('/admin/list', authMiddleware.verifyToken, authMiddleware.verifyStaff, newsController.getAdminNews);
router.get('/admin/stats', authMiddleware.verifyToken, authMiddleware.verifyStaff, newsController.getAdminStats);
router.post('/', uploadNews.single('thumbnail'), authMiddleware.verifyToken, authMiddleware.verifyStaff, newsController.createNews);
router.get('/', newsController.getAllNews);
router.patch('/:id/view', newsController.incrementView);
router.get('/:id/related', newsController.getRelatedNews);

router.get('/:id', newsController.getNewsById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.verifyStaff, uploadNews.single('thumbnail'), newsController.updateNews);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyStaff, newsController.deleteNews);

module.exports = router;