const db = require('../../config/db');

const reviewController = {
    getReviewsByProduct: async(req, res) => {
        try{
            const { id } = req.params;
            const parsedId = Number(id);
            if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã sản phẩm không hợp lệ!"
                });
            }
            const sql = `SELECT dg.*, kh.TenKH, tk.AnhDaiDien, pl.ChiTietPhanLoai
                        FROM DanhGia dg
                        INNER JOIN KhachHang kh ON kh.MaKH = dg.MaKH
                        LEFT JOIN TaiKhoan tk ON tk.MaTK = kh.MaTK
                        LEFT JOIN PhanLoai pl ON pl.MaPhanLoai = dg.MaPhanLoai
                        WHERE dg.MaMH = ? AND dg.TrangThai = 1
                        ORDER BY dg.ThoiGianDG DESC`;
            const [result] = await db.query(sql, [parsedId]);
            const processedReviews = result.map(item => ({
                ...item, HinhAnh: item.HinhAnh ? JSON.parse(item.HinhAnh) : []
            }));
            res.status(200).json({
                success: true,
                message: "Tải dữ liệu đánh giá thành công",
                data: processedReviews
            });
        }
        catch(error){
            console.error("Lỗi API getReviewsByProduct: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy đánh giá",
                error: error.message
            });
        }
    },
    createReview: async(req, res) => {
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const MaTK = req.user.id; 
            const [khachHang] = await connection.query('SELECT MaKH FROM KhachHang WHERE MaTK = ?', [MaTK]);
            
            if (khachHang.length === 0) {
                return res.status(400).json({ message: "Lỗi: Không tìm thấy thông tin Khách hàng!" });
            }
            const MaKH = khachHang[0].MaKH;
            const { MaMoHinh, MaPhanLoai, NoiDung, SoSao, HinhAnh } = req.body;
            const imageJson = JSON.stringify(HinhAnh || []);
            const sql = `INSERT INTO DanhGia(MaKH, MaMH, MaPhanLoai, NoiDung, SoSao, HinhAnh, TrangThai, ThoiGianDG) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`;
            await connection.query(sql, [MaKH, MaMoHinh, MaPhanLoai, NoiDung, SoSao, imageJson]);

            let tittleReview = SoSao <= 3 ? `Đánh giá thấp (${SoSao} sao)` : `Đánh giá mới (${SoSao} sao)`;
            await connection.query(`
                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                VALUES (?, ?, ?, ?)
            `, [
                tittleReview, 
                `Sản phẩm (Mã MH: ${MaMoHinh}) vừa nhận được một đánh giá từ khách hàng.`, 
                "HeThong", 
                `/admin/support?tab=reviews`
            ]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Tạo đánh giá thành công"
            });
        }
        catch(error){
            await connection.rollback();
            console.error("Lỗi API createReview: ", error);
            res.status(500).json({
                success: false,
                message:"Lỗi máy chủ khi tạo đánh giá",
                error: error.message
            });
        }
        finally{
            connection.release();
        }
    },  
    checkPurchaseStatus: async(req, res) => {
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
        try{
            const MaTK = req.user.id; 
            const [khachHang] = await db.query('SELECT MaKH FROM KhachHang WHERE MaTK = ?', [MaTK]);
            if (khachHang.length === 0) return res.status(200).json({ canReview: false });
            
            const MaKH = khachHang[0].MaKH;
            const { MaMoHinh } = req.query;
            const sql = `SELECT dh.MaDH
                        FROM DonHang dh
                        JOIN ChiTietDonHang ctdh ON ctdh.MaDH = dh.MaDH
                        JOIN PhanLoai pl ON pl.MaPhanLoai = ctdh.MaPhanLoai
                        JOIN ChiTietTrangThai cttt ON cttt.MaDH = dh.MaDH
                        WHERE dh.MaKH = ? AND pl.MaMoHinh = ? AND cttt.MaTrangThai = 4
                        ORDER BY cttt.ThoiGian DESC
                        LIMIT 1`;
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