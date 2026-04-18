const db = require('../../config/db');

const reviewController = {
    getReviewsByProduct: async(req, res) => {
        try{
            const { id } = req.params;
            const sql = `SELECT dg.*, kh.TenKH, tk.AnhDaiDien, pl.ChiTietPhanLoai
                        FROM DanhGia dg
                        INNER JOIN KhachHang kh ON kh.MaKH = dg.MaKH
                        LEFT JOIN TaiKhoan tk ON tk.MaTK = kh.MaTK
                        LEFT JOIN PhanLoai pl ON pl.MaPhanLoai = dg.MaPhanLoai
                        WHERE dg.MaMoHinh = ? AND dg.TrangThai = 1
                        ORDER BY dg.ThoiGianDG DESC`;
            const [result] = await db.query(sql, [id]);
            const processedReviews = result.map(item => ({
                ...item, HinhAnh: item.HinhAnh ? JSON.parse(item.HinhAnh) : []
            }));
            res.status(200).json({
                message: "Tải dữ liệu đánh giá thành công",
                data: processedReviews
            });
        }
        catch(error){
            console.error("Lỗi API getReviewsByProduct: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ khi lấy đánh giá",
                error: error.message
            });
        }
    },
    createReview: async(req, res) => {
        try{
            const MaTK = req.user.id; 
            const [khachHang] = await db.query('SELECT MaKH FROM KhachHang WHERE MaTK = ?', [MaTK]);
            
            if (khachHang.length === 0) {
                return res.status(400).json({ message: "Lỗi: Không tìm thấy thông tin Khách hàng!" });
            }
            const MaKH = khachHang[0].MaKH;
            const { MaMoHinh, MaPhanLoai, NoiDung, SoSao, HinhAnh } = req.body;
            const imageJson = JSON.stringify(HinhAnh || []);
            const sql = `INSERT INTO DanhGia(MaKH, MaMoHinh, MaPhanLoai, NoiDung, SoSao, HinhAnh, TrangThai, ThoiGianDG) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`;
            await db.query(sql, [MaKH, MaMoHinh, MaPhanLoai, NoiDung, SoSao, imageJson]);
            res.status(200).json({
                message: "Tạo đánh giá thành công"
            });
        }
        catch(error){
            console.error("Lỗi API createReview: ", error);
            res.status(500).json({
                message:"Lỗi máy chủ khi tạo đánh giá",
                error: error.message
            });
        }
    },
    moderateReview: async(req, res) => {
        try{
            const { MaDG } = req.params;
            const { TrangThai, PhanHoiShop } = req.body;
            const sql = `UPDATE DanhGia SET TrangThai = COALESCE(?, TrangThai), PhanHoiShop = COALESCE(?, PhanHoiShop) WHERE MaDG = ?`;
            await db.query(sql, [TrangThai, PhanHoiShop, MaDG]);
            res.status(200).json({
                message: "Cập nhật đánh giá thành công"
            });
        }
        catch(error){
            console.error("Lỗi API moderateReview: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ khi admin cập nhật đánh giá",
                error: error.message
            });
        }
    },
    checkPurchaseStatus: async(req, res) => {
        try{
            const MaTK = req.user.id; 
            const [khachHang] = await db.query('SELECT MaKH FROM KhachHang WHERE MaTK = ?', [MaTK]);
            if (khachHang.length === 0) return res.status(200).json({ canReview: false });
            
            const MaKH = khachHang[0].MaKH;
            const { MaMoHinh } = req.query;
            const sql = `SELECT dh.MaDH
                        FROM DonHang dh
                        JOIN ChiTietDonHang ctdh ON ctdh.MaDH = dh.MaDH
                        JOIN PhanLoai pl ON pl.MaPhanLoai = ctdh.MaMoHinh
                        JOIN ChiTietTrangThai cttt ON cttt.MaDH = dh.MaDH
                        JOIN TrangThai tt ON tt.MaTrangThai = cttt.MaTrangThai
                        WHERE dh.MaKH = ? AND pl.MaMoHinh = ? AND tt.TenTrangThai = 'Đã giao'`;
            const [result] = await db.query(sql, [MaKH, MaMoHinh]);
            res.status(200).json({
                canReview: result.length > 0
            });
        }
        catch(error){
            console.error("Lỗi API checkPurchaseStatus: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message
            });
        }
    }
};
module.exports = reviewController;