const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const product_Controller = require('../../controllers/Admin_controller/product_admin.ctrl');

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
    { name: 'AnhDaiDien', maxCount: 1 },    // Đón tối đa 1 file ảnh đại diện
    { name: 'BoSuuTapAnh', maxCount: 10 }   // Đón tối đa 10 file cho bộ sưu tập
]), product_Controller.them_mat_hang_moi);


router.post('/add_variant', product_Controller.them_danh_muc_moi);
router.post('/add_product_variant', product_Controller.them_phan_loai_cho_san_pham);

router.post('/add_detail_variant', product_Controller.them_chi_tiet_danh_muc_moi);

router.put('/fix_info/:id', upload.fields([
    { name: 'AnhDaiDien', maxCount: 1 },    // Đón tối đa 1 file ảnh đại diện
    { name: 'BoSuuTapAnhMoi', maxCount: 10 }   // Đón tối đa 10 file cho bộ sưu tập
]), product_Controller.sua_thong_tin_mat_hang);

router.post('/fix_invisible', product_Controller.thay_doi_hien_thi_mat_hang);

router.post('/an_phan_loai', product_Controller.An_phan_loai); 

router.delete('/delete_detail/:id', product_Controller.xoa_danh_muc);
router.delete('/delete_detail_variant/:id', product_Controller.xoa_chi_tiet_danh_muc);

router.post('/delete_brand', product_Controller.xoa_HSX);
router.post('/add_brand', product_Controller.them_hang_san_xuat_moi);
router.put('/fix_brand/:id', product_Controller.sua_thong_tin_HSX);
router.put('/fix_cate/:id', product_Controller.sua_thong_tin_danh_muc);


// ==========================================
// NHÓM GET: CHỈ DÙNG ĐỂ TRUY VẤN XEM DỮ LIỆU
// ==========================================
router.get('/', product_Controller.liet_ke_mat_hang);
router.get('/get_brand', product_Controller.get_brand);
router.get('/get_all_brand', product_Controller.liet_ke_brand);
router.get('/get_all_cate',product_Controller.liet_ke_danh_muc);
router.get('/getvariant', product_Controller.getAllvariant);
router.get('/getdetailvariant/:MaDM', product_Controller.getAlldetailvariant);
router.get('/watch/:MaMH', product_Controller.xem_thong_tin_san_pham);

router.get('/thong_ke_hsx', product_Controller.thong_ke_hang_san_xuat);

module.exports = router;