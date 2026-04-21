const express = require('express');
const router = express.Router();
const { uploadNews } = require('../../middlewares/upload.js');

// Dùng upload.single('image') vì FormData của TinyMCE gửi lên key là 'image'
router.post('/', uploadNews.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }
  const imageUrl = `http://localhost:3000/Images_news/${req.file.filename}`;
  res.json({ location: imageUrl }); 
});

module.exports = router;