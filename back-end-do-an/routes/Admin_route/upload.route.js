const express = require('express');
const router = express.Router();
const { uploadNews } = require('../../middlewares/upload.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

router.post('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, uploadNews.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }
  const imageUrl = req.file.path;
  res.json({ location: imageUrl }); 
});

module.exports = router;