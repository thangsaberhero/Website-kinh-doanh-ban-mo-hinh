const express = require('express');
const router = express.Router();
const { uploadNews } = require('../../middlewares/upload.js');

router.post('/', uploadNews.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên" });
  }
  const imageUrl = req.file.path;
  res.json({ location: imageUrl }); 
});

module.exports = router;