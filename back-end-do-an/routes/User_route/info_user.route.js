const express = require('express');
const router = express.Router();
const info_userController = require('../../controllers/User_controller/info_user.ctrl.js');

const multer = require('multer');
const path = require('path');


// 1. Định nghĩa nơi lưu và cách đổi tên ảnh
const storage = multer.diskStorage({
  // Nơi cất ảnh
  destination: (req, file, cb) => {
    cb(null, 'public/Images_user/'); // Cất vào thư mục public/Images_user/
  },
  // Cách đổi tên ảnh để KHÔNG BAO GIỜ bị trùng: avatar_[MaTK]_[timestamp].[ext]
  filename: (req, file, cb) => {
    // Lấy Mã Tài Khoản từ req.body (Vì FormData gửi xuống)
    const maTK = req.body.MaTK || 'unknown'; 
    // Lấy đuôi file ảnh (VD: .jpg, .png)
    const fileExt = path.extname(file.originalname);
    // Ghép tên mới
    const newFileName = `avatar_TK${maTK}_${Date.now()}${fileExt}`;
    cb(null, newFileName); // Báo cho Multer tên mới này
  }
});

// 2. Tạo Middleware upload với giới hạn 5MB
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});
// === KẾT THÚC CẤU HÌNH MULTER ===


// 3. Sửa Route: Thêm middleware 'upload.single('avatar')' vào giữa
// 'avatar' là cái tên bạn đặt ở FormData bên Frontend nhé
router.get('/laythongtin/:MaTK', info_userController.laythongtin);
router.post('/change_info', upload.single('avatar'), info_userController.capnhatthongtin);
router.post('/change_password', info_userController.doi_mat_khau);

module.exports = router;