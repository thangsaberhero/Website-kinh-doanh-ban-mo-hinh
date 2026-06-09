const db = require('../../config/db');

const adminReviewController = {
    getAllReviewsAdmin: async(req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.max(parseInt(req.query.limit) || 5, 5);
            const offset = (page - 1) * limit;
            
            const search = req.query.search || '';
            const star = req.query.star || 'all';
            const unreplied = req.query.unreplied === 'true';

            let whereConditions = ["1=1"]; 
            let params = [];

            if (search) {
                whereConditions.push("(kh.TenKH LIKE ? OR mh.TenMH LIKE ? OR dg.NoiDung LIKE ?)");
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            if (star !== 'all') {
                if (star === '1-2') {
                    whereConditions.push("dg.SoSao <= 2");
                } else {
                    whereConditions.push("dg.SoSao = ?");
                    params.push(parseInt(star));
                }
            }
            if (unreplied) {
                whereConditions.push("dg.PhanHoiShop IS NULL");
            }

            const whereClause = whereConditions.join(" AND ");

            // 1. CHUẨN BỊ 3 CÂU QUERY
            const countSql = `
                SELECT COUNT(*) as total 
                FROM DanhGia dg 
                JOIN KhachHang kh ON dg.MaKH = kh.MaKH 
                JOIN MoHinh mh ON dg.MaMH = mh.MaMoHinh 
                WHERE ${whereClause}
            `;

            const dataSql = `
                SELECT dg.*, kh.TenKH, tk.AnhDaiDien, mh.TenMH, pl.ChiTietPhanLoai, nv.TenNV as TenNVPhanHoi 
                FROM DanhGia dg
                JOIN KhachHang kh ON dg.MaKH = kh.MaKH
                JOIN MoHinh mh ON dg.MaMH = mh.MaMoHinh
                LEFT JOIN TaiKhoan tk ON tk.MaTK = kh.MaTK
                LEFT JOIN PhanLoai pl ON dg.MaPhanLoai = pl.MaPhanLoai
                LEFT JOIN NhanVien nv ON dg.MaNV_PhanHoi = nv.MaNV
                WHERE ${whereClause}
                ORDER BY dg.ThoiGianDG DESC
                LIMIT ? OFFSET ?
            `;

            // TỐI ƯU SARGable: Dùng DATE_FORMAT để tính toán ngày đầu tháng hiện tại
            const statsSql = `
                SELECT 
                    ROUND(AVG(SoSao), 1) as avgRating,
                    SUM(CASE WHEN SoSao <= 2 AND PhanHoiShop IS NULL THEN 1 ELSE 0 END) as badReviews,
                    SUM(CASE WHEN ThoiGianDG >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01') THEN 1 ELSE 0 END) as newThisMonth,
                    SUM(CASE WHEN ThoiGianDG >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01') AND PhanHoiShop IS NOT NULL THEN 1 ELSE 0 END) as repliedThisMonth
                FROM DanhGia
            `;

            // 2. TỐI ƯU HIỆU NĂNG: Chạy 3 luồng song song (Ép xung x3 tốc độ)
            const [[countResult], [result], [statsResult]] = await Promise.all([
                db.query(countSql, params),
                db.query(dataSql, [...params, limit, offset]),
                db.query(statsSql)
            ]);

            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            // 3. XỬ LÝ ẢNH
            const processedReviews = result.map(item => {
                let parsedImages = [];
                if (item.HinhAnh && item.HinhAnh !== '[]' && item.HinhAnh !== 'null') {
                    try {
                        const imgArr = typeof item.HinhAnh === 'string' ? JSON.parse(item.HinhAnh) : item.HinhAnh;
                        imageArr = Array.isArray(parsed) ? parsed.filter(img => img) : [];
                    } catch (e) { 
                        console.error("Lỗi parse JSON ảnh đánh giá:", e); 
                    }
                }
                return { ...item, HinhAnh: parsedImages };
            });

            res.status(200).json({ 
                success: true,
                data: processedReviews,
                pagination: { totalItems, totalPages, currentPage: page, limit },
                stats: statsResult[0] 
            });
        } catch(error) {
            console.error("Lỗi API getAllReviewsAdmin: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
        }
    },
    moderateReview: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDG } = req.params;
            const TrangThai = req.body.TrangThai !== undefined ? req.body.TrangThai : null;
            const PhanHoiShop = req.body.PhanHoiShop !== undefined ? req.body.PhanHoiShop : null;

            // 1. KIỂM TRA TỒN TẠI
            const [check] = await connection.query(`SELECT MaKH, MaMH, MaPhanLoai FROM DanhGia WHERE MaDG = ?`, [MaDG]);
            if (check.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Không tồn tại đánh giá để phản hồi!"
                });
            }

            // 2. LẤY MÃ NHÂN VIÊN THỰC HIỆN
            const MaTK = req.user.id; 
            // FIX LỖI: Chuyển db.query thành connection.query
            const [nv] = await connection.query('SELECT MaNV FROM NhanVien WHERE MaTK = ?', [MaTK]);
            const MaNV = nv.length > 0 ? nv[0].MaNV : null;

            // 3. CẬP NHẬT ĐÁNH GIÁ (Chỉ cập nhật người phản hồi nếu có nội dung phản hồi)
            const sql = `
                UPDATE DanhGia 
                SET TrangThai = COALESCE(?, TrangThai), 
                    PhanHoiShop = COALESCE(?, PhanHoiShop),
                    MaNV_PhanHoi = COALESCE(?, MaNV_PhanHoi) 
                WHERE MaDG = ?
            `;
            const nvUpdate = PhanHoiShop ? MaNV : null;
            // FIX LỖI: Chuyển db.query thành connection.query
            await connection.query(sql, [TrangThai, PhanHoiShop, nvUpdate, MaDG]);
            
            // 4. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            
            // FIX LỖI: Sửa lại nội dung log cho chuẩn nghiệp vụ
            const noiDungLog = `Kiểm duyệt / Phản hồi đánh giá #${MaDG}`;
            // FIX LỖI: Chuyển db.query thành connection.query
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'REVIEW_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            // FIX LỖI: Bổ sung lệnh commit để lưu dữ liệu
            await connection.commit();

            res.status(200).json({
                success: true,
                message: "Cập nhật đánh giá thành công"
            });
        }
        catch(error) {
            await connection.rollback();
            console.error("Lỗi API moderateReview: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi admin cập nhật đánh giá",
                error: error.message
            });
        }
        finally {
            if (connection) connection.release();
        }
    }
};
module.exports = adminReviewController;