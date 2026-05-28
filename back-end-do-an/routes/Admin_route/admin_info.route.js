const express = require('express');
const router = express.Router();
const adminInfoController = require('../../controllers/Admin_controller/admin_info.ctrl.js');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../../middlewares/auth.middleware.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/Images_user/');
  },
  filename: (req, file, cb) => {
    const maTK = req.body.MaTK || 'admin_unknown'; 
    const fileExt = path.extname(file.originalname);
    const newFileName = `avatar_TK${maTK}_${Date.now()}${fileExt}`;
    cb(null, newFileName); 
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.get('/laythongtin', authMiddleware.verifyToken, authMiddleware.verifyStaff, adminInfoController.laythongtin);
router.post('/change_info', authMiddleware.verifyToken, authMiddleware.verifyStaff, upload.single('avatar'), adminInfoController.capnhatthongtin);
router.post('/change_password', authMiddleware.verifyToken, authMiddleware.verifyStaff, adminInfoController.doi_mat_khau);

module.exports = router;