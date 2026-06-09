const db = require('../../config/db');

const reviewController = {
    getReviewsByProduct: async(req, res) => {
        try {
            const { maMH } = req.params;
            const parsedId = Number(maMH);
            if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                return res.status(400).json({ success: false, message: "Mã sản phẩm không hợp lệ!" });
            }

            // 1. LẤY THAM SỐ PHÂN TRANG & BỘ LỌC TỪ QUERY
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.max(parseInt(req.query.limit) || 5, 5);
            const offset = (page - 1) * limit;
            const filter = req.query.filter || 'all'; // các giá trị: 'all', 'withImage', '5', '4', '3', '2', '1'

            let whereConditions = ["dg.MaMH = ?", "dg.TrangThai = 1"];
            let params = [parsedId];

            // Xử lý bộ lọc động dưới Database
            if (filter === 'withImage') {
                whereConditions.push("dg.HinhAnh IS NOT NULL AND dg.HinhAnh != '[]' AND dg.HinhAnh != 'null'");
            } else if (filter !== 'all') {
                const starLevel = parseInt(filter);
                if (!isNaN(starLevel)) {
                    whereConditions.push("dg.SoSao = ?");
                    params.push(starLevel);
                }
            }

            const whereClause = whereConditions.join(" AND ");

            // Câu lệnh 1: Đếm tổng số dòng thỏa mãn bộ lọc hiện tại
            const countSql = `SELECT COUNT(*) as total FROM DanhGia dg WHERE ${whereClause}`;
            
            // Câu lệnh 2: Lấy dữ liệu phân trang (Giới hạn bằng LIMIT và OFFSET)
            const dataSql = `
                SELECT dg.*, kh.TenKH, tk.AnhDaiDien, pl.ChiTietPhanLoai
                FROM DanhGia dg
                INNER JOIN KhachHang kh ON kh.MaKH = dg.MaKH
                LEFT JOIN TaiKhoan tk ON tk.MaTK = kh.MaTK
                LEFT JOIN PhanLoai pl ON pl.MaPhanLoai = dg.MaPhanLoai
                WHERE ${whereClause}
                ORDER BY dg.ThoiGianDG DESC
                LIMIT ? OFFSET ?
            `;

            // Câu lệnh 3: Lấy thống kê toàn cục cho sản phẩm (Bất chấp bộ lọc phân trang đang chọn)
            const statsSql = `
                SELECT 
                    COALESCE(ROUND(AVG(SoSao), 1), 0) as avgRating,
                    COUNT(*) as totalCount,
                    SUM(CASE WHEN SoSao = 5 THEN 1 ELSE 0 END) as star5,
                    SUM(CASE WHEN SoSao = 4 THEN 1 ELSE 0 END) as star4,
                    SUM(CASE WHEN SoSao = 3 THEN 1 ELSE 0 END) as star3,
                    SUM(CASE WHEN SoSao = 2 THEN 1 ELSE 0 END) as star2,
                    SUM(CASE WHEN SoSao = 1 THEN 1 ELSE 0 END) as star1,
                    SUM(CASE WHEN HinhAnh IS NOT NULL AND HinhAnh != '[]' AND HinhAnh != 'null' THEN 1 ELSE 0 END) as withImageCount
                FROM DanhGia
                WHERE MaMH = ? AND TrangThai = 1
            `;

            // 2. ÉP XUNG HIỆU NĂNG: Chạy 3 câu lệnh song song
            const [[countResult], [result], [statsResult]] = await Promise.all([
                db.query(countSql, params),
                db.query(dataSql, [...params, limit, offset]),
                db.query(statsSql, [parsedId])
            ]);

            const totalItems = countResult[0].total;

            const processedReviews = result.map(item => {
                let hinhAnhArr = [];
                try {
                    if (item.HinhAnh) {
                        hinhAnhArr = typeof item.HinhAnh === 'string' ? JSON.parse(item.HinhAnh) : item.HinhAnh;
                        if (typeof hinhAnhArr === 'string') hinhAnhArr = JSON.parse(hinhAnhArr);
                    }
                } catch (e) {
                    hinhAnhArr = [];
                }
                return {
                    ...item,
                    HinhAnh: Array.isArray(hinhAnhArr) ? hinhAnhArr.filter(img => img) : []
                };
            });

            // 3. TRẢ VỀ DỮ LIỆU KÈM METADATA PHÂN TRANG VÀ THỐNG KÊ
            res.status(200).json({
                success: true,
                message: "Tải dữ liệu đánh giá thành công",
                data: processedReviews,
                pagination: { totalItems, currentPage: page, limit },
                stats: statsResult[0]
            });
        } catch(error) {
            console.error("Lỗi API getReviewsByProduct: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy đánh giá", error: error.message });
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