const db = require('../../config/db');

const newsController = {
    getAllNews: async (req, res) => {
        try{
            const sqlLatest = `SELECT t.MaTT, t.TieuDe, t.TomTat, t.TheLoai, t.NgayDang, t.LuotXem,
                                nv.TenNV AS TacGia,
                                (SELECT LinkAnh FROM AnhTinTuc a WHERE a.MaTT = t.MaTT LIMIT 1) AS AnhDaiDien
                                FROM TinTuc t
                                LEFT JOIN NhanVien nv ON t.MaNV = nv.MaNV
                                WHERE t.TrangThai = 'Đã duyệt'
                                ORDER BY t.NgayDang DESC`;
            const sqlTrending = `SELECT t.MaTT, t.TieuDe, t.TheLoai, t.NgayDang, t.LuotXem,
                                (SELECT LinkAnh FROM AnhTinTuc a WHERE a.MaTT = t.MaTT LIMIT 1) AS AnhDaiDien
                                FROM TinTuc t
                                WHERE t.TrangThai = 'Đã duyệt' 
                                AND t.NgayDang >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                                ORDER BY t.LuotXem DESC
                                LIMIT 4`;
            const sqlPopular = `SELECT t.MaTT, t.TieuDe, t.NgayDang, t.LuotXem
                                FROM TinTuc t
                                WHERE t.TrangThai = 'Đã duyệt'
                                ORDER BY t.LuotXem DESC
                                LIMIT 3`;
            const [[latestList], [trendingList], [popularList]] = await Promise.all([db.query(sqlLatest), db.query(sqlTrending), db.query(sqlPopular)]);
            
            res.status(200).json({
                message: "Tải dữ liệu tin tức thành công",
                latestList: latestList,
                trendingList: trendingList,
                popularList: popularList
            })
        } catch(error){
            console.error("Lỗi API getAllNews: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ nội bộ",
                error: error.message
            })
        }
    }
}
module.exports = newsController;