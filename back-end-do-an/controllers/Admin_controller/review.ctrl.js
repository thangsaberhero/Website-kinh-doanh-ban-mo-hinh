const db = require('../../config/db');

const adminReviewController = {
    getAllReviewsAdmin: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
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

            const countSql = `SELECT COUNT(*) as total FROM DanhGia dg 
                             JOIN KhachHang kh ON dg.MaKH = kh.MaKH 
                             JOIN MoHinh mh ON dg.MaMH = mh.MaMoHinh 
                             WHERE ${whereClause}`;
            const [countResult] = await db.query(countSql, params);
            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            const dataSql = `SELECT dg.*, kh.TenKH, tk.AnhDaiDien, mh.TenMH, pl.ChiTietPhanLoai 
                            FROM DanhGia dg
                            JOIN KhachHang kh ON dg.MaKH = kh.MaKH
                            JOIN MoHinh mh ON dg.MaMH = mh.MaMoHinh
                            LEFT JOIN TaiKhoan tk ON tk.MaTK = kh.MaTK
                            LEFT JOIN PhanLoai pl ON dg.MaPhanLoai = pl.MaPhanLoai
                            WHERE ${whereClause}
                            ORDER BY dg.ThoiGianDG DESC
                            LIMIT ? OFFSET ?`;
            
            const [result] = await db.query(dataSql, [...params, limit, offset]);
            
            const processedReviews = result.map(item => {
                let parsedImages = [];
                if (item.HinhAnh && item.HinhAnh !== '[]' && item.HinhAnh !== 'null') {
                    try {
                        const imgArr = typeof item.HinhAnh === 'string' ? JSON.parse(item.HinhAnh) : item.HinhAnh;
                        parsedImages = imgArr.map(img => `http://localhost:3000/Images_review/${img}`);
                    } catch (e) { console.error(e); }
                }
                return { ...item, HinhAnh: parsedImages };
            });

            const statsSql = `SELECT ROUND(AVG(SoSao), 1) as avgRating,
                            SUM(CASE WHEN SoSao <= 2 AND PhanHoiShop IS NULL THEN 1 ELSE 0 END) as badReviews,
                            SUM(CASE WHEN MONTH(ThoiGianDG) = MONTH(CURRENT_DATE()) AND YEAR(ThoiGianDG) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as newThisMonth,
                            SUM(CASE WHEN MONTH(ThoiGianDG) = MONTH(CURRENT_DATE()) AND YEAR(ThoiGianDG) = YEAR(CURRENT_DATE()) AND PhanHoiShop IS NOT NULL THEN 1 ELSE 0 END) as repliedThisMonth
                            FROM DanhGia`;
            const [statsResult] = await db.query(statsSql);
            const globalStats = statsResult[0];

            res.status(200).json({ 
                success: true,
                data: processedReviews,
                pagination: { totalItems, totalPages, currentPage: page, limit },
                stats: globalStats // Trả thêm cục stats này về cho UI
            });
        } catch(error) {
            console.error("Lỗi API getAllReviewsAdmin: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
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
    }
};
module.exports = adminReviewController;