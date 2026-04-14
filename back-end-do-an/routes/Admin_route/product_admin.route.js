const express = require('express');
const router = express.Router();
const product_Controller = require('../../controllers/Admin_controller/product_admin.ctrl');

// ==========================================
// NHÓM POST: THÊM MỚI & SỬA ĐỔI DỮ LIỆU
// ==========================================
router.post('/add_product', product_Controller.them_mat_hang_moi);
router.post('/add_variant', product_Controller.them_danh_muc_moi);
router.post('/add_product_variant', product_Controller.them_phan_loai_cho_san_pham);

// SỬA LỖI: Thêm chi tiết danh mục phải là POST vì nó đưa dữ liệu mới vào DB
router.post('/add_detail_variant', product_Controller.them_chi_tiet_danh_muc_moi);

router.post('/fix_info', product_Controller.sua_thong_tin_mat_hang);
router.post('/fix_invisible', product_Controller.thay_doi_hien_thi_mat_hang);

// SỬA LỖI: Ẩn phân loại là hành động thay đổi trạng thái, phải dùng POST
router.post('/an_phan_loai', product_Controller.An_phan_loai); 

// SỬA LỖI: Xóa dữ liệu tuyệt đối không dùng GET. Dùng POST (hoặc DELETE)
router.post('/delete_detail_variant/:MaChiTietDM', product_Controller.xoa_chi_tiet_danh_muc);
router.post('/delete_detail/:MaDM', product_Controller.xoa_danh_muc);


// ==========================================
// NHÓM GET: CHỈ DÙNG ĐỂ TRUY VẤN XEM DỮ LIỆU
// ==========================================
router.get('/', product_Controller.liet_ke_mat_hang);
router.get('/getvariant', product_Controller.getAllvariant);
router.get('/getdetailvariant', product_Controller.getAlldetailvariant);
router.get('/watch/:MaMH', product_Controller.xem_thong_tin_san_pham);

module.exports = router;