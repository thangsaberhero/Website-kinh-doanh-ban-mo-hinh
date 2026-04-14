const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/Admin_controller/news.ctrl.js');
const upload = require('../../middlewares/upload.js');

router.get('/admin/list', newsController.getAdminNews);
router.get('/admin/stats', newsController.getAdminStats);
router.post('/', upload.single('thumbnail'), newsController.createNews);
router.get('/', newsController.getAllNews);
router.patch('/:id/view', newsController.incrementView);
router.get('/:id/related', newsController.getRelatedNews);

router.get('/:id', newsController.getNewsById);
router.put('/:id', upload.single('thumbnail'), newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;