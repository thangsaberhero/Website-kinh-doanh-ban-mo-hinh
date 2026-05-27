const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const product_Controller = require('../../controllers/Admin_controller/product_admin.ctrl');
const { uploadProduct, uploadBrand } = require('../../middlewares/upload.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');

//Lưu ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Lưu ảnh vào thư mục Images_product (Bạn nhớ tạo thư mục này trong dự án nhé!)
        cb(null, 'public/Images_product'); 
    },
    filename: function (req, file, cb) {
        // Đổi tên file để tránh trùng lặp (Thêm timestamp vào trước tên gốc)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// ==========================================
// NHÓM POST: THÊM MỚI & SỬA ĐỔI DỮ LIỆU
// ==========================================
router.post('/add_product', upload.fields([
    { name: 'AnhDaiDien', maxCount: 1 },
    { name: 'BoSuuTapAnh', maxCount: 10 }
]), authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.them_mat_hang_moi);

router.post('/add_brand', authMiddleware.verifyToken, authMiddleware.verifyAdmin, uploadBrand.single('Logo'), product_Controller.them_hang_san_xuat_moi);
router.put('/fix_brand/:id', uploadBrand.single('Logo'), authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.sua_thong_tin_HSX);

router.post('/add_variant', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.them_danh_muc_moi);
router.post('/add_product_variant', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.them_phan_loai_cho_san_pham);

// router.post('/add_detail_variant', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.them_chi_tiet_danh_muc_moi);

router.put('/fix_info/:id', upload.fields([
    { name: 'AnhDaiDien', maxCount: 1 },
    { name: 'BoSuuTapAnhMoi', maxCount: 10 }
]), authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.sua_thong_tin_mat_hang);

router.put('/toggle_visibility/:id', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.thay_doi_hien_thi_mat_hang);

router.post('/an_phan_loai', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.An_phan_loai); 



router.delete('/delete_brand/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.xoa_HSX);
router.put('/fix_cate/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.sua_thong_tin_danh_muc);

router.delete('/delete_detail/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.xoa_danh_muc);
router.delete('/delete_detail_variant/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.xoa_chi_tiet_danh_muc);


// ==========================================
// NHÓM GET:
// ==========================================
router.get('/', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.liet_ke_mat_hang);
router.get('/get_brand', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.get_brand);
router.get('/get_all_brand', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.liet_ke_brand);
router.get('/get_all_cate', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.liet_ke_danh_muc);
router.get('/getvariant', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.getAllvariant);
router.get('/getdetailvariant/:MaDM', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.getAlldetailvariant);
router.get('/watch/:MaMH', authMiddleware.verifyToken, authMiddleware.verifyStaff, product_Controller.xem_thong_tin_san_pham);

router.get('/thong_ke_hsx', authMiddleware.verifyToken, authMiddleware.verifyAdmin, product_Controller.thong_ke_hang_san_xuat);

module.exports = router;