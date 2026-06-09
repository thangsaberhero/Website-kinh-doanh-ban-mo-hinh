const db = require('../../config/db');

const reviewController = {
    getReviewsByProduct: async(req, res) => {
        try{
            const { maMH } = req.params;
            const parsedId = Number(maMH);
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
            const processedReviews = result.map(item => {
                let hinhAnhArr = [];
                try {
                    if (item.HinhAnh) {
                        hinhAnhArr = JSON.parse(item.HinhAnh);
                        // Đề phòng trường hợp chuỗi bị stringify 2 lần
                        if (typeof hinhAnhArr === 'string') {
                            hinhAnhArr = JSON.parse(hinhAnhArr);
                        }
                    }
                } catch (e) {
                    console.error(`Lỗi parse HinhAnh đơn ${item.MaDG}:`, e);
                    hinhAnhArr = []; // Nếu lỗi thì trả về mảng rỗng, không làm sập cả API
                }

                return {
                    ...item,
                    HinhAnh: hinhAnhArr
                };
            });
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
        // Chặn quyền Admin/Staff
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }

        // 🔴 BỔ SUNG: Validation dữ liệu đầu vào trước khi mở kết nối Database
        const { MaMoHinh, MaPhanLoai, NoiDung, SoSao, HinhAnh } = req.body;
        
        if (!MaMoHinh || !NoiDung || !SoSao) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ thông tin: Mã mô hình, Nội dung và Số sao đánh giá!"
            });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaTK = req.user.id; 
            const [khachHang] = await connection.query('SELECT MaKH FROM KhachHang WHERE MaTK = ?', [MaTK]);
            
            if (khachHang.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Lỗi: Không tìm thấy thông tin Khách hàng!" });
            }
            
            const MaKH = khachHang[0].MaKH;

            const [checkReview] = await connection.query('SELECT MaDG FROM DanhGia WHERE MaMH = ? AND MaKH = ?', [MaMoHinh, MaKH]);
            if (checkReview.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Lỗi: Bạn đã đánh giá sản phẩm này rồi!" });
            }

            // =========================================================
            // LỚP LỌC 2: KIỂM TRA ĐÃ MUA VÀ NHẬN HÀNG THÀNH CÔNG CHƯA?
            // (Thêm MaMoHinh và Trạng Thái = 4)
            // =========================================================
            const sqlCheckPurchase = `
                SELECT dh.MaDH 
                FROM DonHang dh
                INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH
                INNER JOIN PhanLoai pl ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN ChiTietTrangThai cttt ON cttt.MaDH = dh.MaDH
                WHERE dh.MaKH = ? AND pl.MaMoHinh = ? AND cttt.MaTrangThai = 4
                LIMIT 1
            `;
            const [checkPurchase] = await connection.query(sqlCheckPurchase, [MaKH, MaMoHinh]);
            
            // Nếu độ dài === 0 nghĩa là chưa từng mua hoặc chưa nhận hàng
            if (checkPurchase.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Lỗi: Bạn cần mua và nhận hàng thành công mới được đánh giá!" });
            }
            
            const safeImages = Array.isArray(HinhAnh) ? HinhAnh.filter(img => img != null) : [];
            const imageJson = JSON.stringify(safeImages);
            
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
        catch(error) {
            await connection.rollback();
            console.error("Lỗi API createReview: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo đánh giá",
                error: error.message
            });
        }
        finally {
            if (connection) connection.release();
        }
    },
    checkPurchaseStatus: async(req, res) => {
        // Chặn quyền Admin/Staff
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
        try {
            const MaTK = req.user.id; 
            const [khachHang] = await db.query('SELECT MaKH FROM KhachHang WHERE MaTK = ?', [MaTK]);
            if (khachHang.length === 0) return res.status(200).json({ canReview: false });
            
            const MaKH = khachHang[0].MaKH;
            const { MaMoHinh } = req.query;

            // =========================================================
            // LỚP LỌC 1: KIỂM TRA KHÁCH HÀNG ĐÃ ĐÁNH GIÁ SẢN PHẨM NÀY CHƯA?
            // =========================================================
            const sqlCheckReview = `SELECT MaDG FROM DanhGia WHERE MaKH = ? AND MaMH = ? LIMIT 1`;
            const [existingReview] = await db.query(sqlCheckReview, [MaKH, MaMoHinh]);

            if (existingReview.length > 0) {
                // Nếu tìm thấy lịch sử đánh giá -> Khóa quyền luôn, không cần check đơn hàng nữa
                return res.status(200).json({
                    canReview: false,
                    message: "Bạn đã đánh giá sản phẩm này rồi!"
                });
            }

            // =========================================================
            // LỚP LỌC 2: NẾU CHƯA ĐÁNH GIÁ -> KIỂM TRA ĐÃ MUA & NHẬN HÀNG CHƯA?
            // =========================================================
            const sqlCheckPurchase = `SELECT dh.MaDH
                                      FROM DonHang dh
                                      JOIN ChiTietDonHang ctdh ON ctdh.MaDH = dh.MaDH
                                      JOIN PhanLoai pl ON pl.MaPhanLoai = ctdh.MaPhanLoai
                                      JOIN ChiTietTrangThai cttt ON cttt.MaDH = dh.MaDH
                                      WHERE dh.MaKH = ? AND pl.MaMoHinh = ? AND cttt.MaTrangThai = 4
                                      ORDER BY cttt.ThoiGian DESC
                                      LIMIT 1`;
            const [purchaseResult] = await db.query(sqlCheckPurchase, [MaKH, MaMoHinh]);
            
            if (purchaseResult.length > 0) {
                // Đã nhận hàng + Chưa đánh giá -> Cho phép (Mở khóa Form)
                return res.status(200).json({
                    canReview: true
                });
            } else {
                // Chưa mua hoặc đơn hàng chưa giao thành công
                return res.status(200).json({
                    canReview: false,
                    message: "Bạn cần mua và nhận hàng thành công để đánh giá!"
                });
            }
        }
        catch(error) {
            console.error("Lỗi API checkPurchaseStatus: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message
            });
        }
    }
};
module.exports = reviewController;