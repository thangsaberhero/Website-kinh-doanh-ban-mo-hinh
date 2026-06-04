const db = require('../../config/db');

const newsController = {
    getAllNews: async (req, res) => {
        try{
            const sqlLatest = `SELECT t.MaTT, t.TieuDe, t.TomTat, t.TheLoai, t.Tags, t.NgayDang, t.LuotXem, 
                                nv.TenNV AS TacGia, 
                                CEIL((LENGTH(t.NoiDung) - LENGTH(REPLACE(REPLACE(t.NoiDung, '&nbsp;', ' '), ' ', '')) + 1) / 200) AS ThoiGianDoc,
                                t.AnhThumbnail
                                FROM TinTuc t
                                LEFT JOIN NhanVien nv ON t.MaNV = nv.MaNV
                                WHERE t.TrangThai = 'Đã duyệt'
                                ORDER BY t.NgayDang DESC`;
            const sqlTrending = `SELECT t.MaTT, t.TieuDe, t.TheLoai, t.NgayDang, t.LuotXem, t.AnhThumbnail
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
                success: true,
                message: "Tải dữ liệu tin tức thành công",
                latestList: latestList,
                trendingList: trendingList,
                popularList: popularList
            })
        } catch(error){
            console.error("Lỗi API getAllNews: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ nội bộ",
                error: error.message
            })
        }
    },
    getNewsById: async(req, res) =>{
        try{
            const newsId = req.params.id;
        
            const sql = `SELECT t.*, nv.TenNV AS TacGia
                        FROM TinTuc t
                        INNER JOIN NhanVien nv ON nv.MaNV = t.MaNV
                        WHERE t.MaTT = ?
                        LIMIT 1`;
            const [rows] = await db.query(sql, [newsId]);
            if(rows.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài viết"
                });
            }
            res.status(200).json({
                success: true,
                message: "Tải dữ liệu tin tức thành công",
                data: rows[0]
            })
        }
        catch(error){
            console.error("Lỗi API getNewsById: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message
            })
        }
    },
    getRelatedNews: async(req, res) => {
        try{
            const newsId = req.params.id;
            const sql = `SELECT t.*
                        FROM TinTuc t
                        WHERE t.TheLoai = (SELECT TheLoai FROM TinTuc WHERE MaTT = ?)
                        AND MaTT != ? AND t.TrangThai = 'Đã duyệt'
                        ORDER BY t.NgayDang DESC
                        LIMIT 3`;
            const [rows] = await db.query(sql, [newsId, newsId]);
            if(rows.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài viết"
                });
            }
            res.status(200).json({
                success: true,
                message: "Tải tin tức liên quan thành công",
                data: rows
            })
        }
        catch(error){
            console.error("Lỗi API getRelatedNews: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy tin tức liên quan",
                error: error.message
            })
        }
    },
    getAdminNews: async(req, res) =>{
        try{
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.max(parseInt(req.query.limit) || 5, 5);
            const offset = (page - 1) * limit;
            const search = req.query.search || '';
            const status = req.query.status || '';
            
            let whereClause = 'WHERE 1=1';
            let queryParams = [];

            if(search){
                whereClause += ' AND (t.TieuDe LIKE ? OR nv.TenNV LIKE ?)';
                queryParams.push(`%${search}%`, `%${search}%`);
            }
            if(status){
                whereClause += ' AND t.TrangThai = ?';
                queryParams.push(status);
            }

            const sqlData = `SELECT t.*, nv.TenNV as TacGia
                            FROM TinTuc t
                            INNER JOIN NhanVien nv ON nv.MaNV = t.MaNV
                            ${whereClause}
                            ORDER BY NgayDang DESC
                            LIMIT ? OFFSET ?`;
            const dataParams = [...queryParams, limit, offset];
            const sqlCount = `SELECT COUNT(MaTT) AS TotalCount FROM TinTuc t ${whereClause}`;

            const [[dataRows], [countRows]] = await Promise.all([
                db.query(sqlData, dataParams),
                db.query(sqlCount, queryParams)
            ]);
            const totalItems = countRows[0].TotalCount;
            res.status(200).json({
                data: dataRows,
                pagination: {
                    totalItems: totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                    currentPage: page,
                    limit: limit
                }
            })
        }
        catch(error){
            console.error("Lỗi API getAdminNews: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message
            })
        }
    },
    getAdminStats: async(req, res) =>{
        try{
            const sql = `SELECT COUNT(MaTT) AS TotalCount,
                        SUM(CASE WHEN TrangThai = 'Đã duyệt' THEN 1 ELSE 0 END) AS PublishedCount,
                        SUM(CASE WHEN TrangThai = 'Bản nháp' THEN 1 ELSE 0 END) AS DraftCount,
                        SUM(LuotXem) AS TotalViews
                        FROM TinTuc`;
            const [row] = await db.query(sql);
            const data = row[0];

            res.status(200).json({
                total: data.TotalCount || 0,
                published: data.PublishedCount || 0,
                drafts: data.DraftCount || 0,
                views: data.TotalViews || 0
            })
        }
        catch(error){
            console.error("Lỗi API getAdminStats", error);
            res.status(500).json({
                message: "Lỗi máy chủ",
                error: error.message
            })
        }
    },
    createNews: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const { TieuDe, NoiDung, TheLoai, TomTat, TrangThai, Tags } = req.body;
            const file = req.file;
            const MaTK = req.user.id;
            const [truyvan] = await connection.query(`Select MaNV from NhanVien where MaTK = ?`,[MaTK]);
            if (truyvan.length === 0) {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    message: "Lỗi phân quyền: Tài khoản của bạn chưa được liên kết với hồ sơ Nhân viên để đăng bài!"
                });
            }

            // 3. TRÍCH XUẤT AN TOÀN
            const MaNV = truyvan[0].MaNV;
            const [check] = await connection.query(`Select MaTT from TinTuc where TieuDe = ?`, [TieuDe]);
            if(check.length > 0){
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Đã có tin tức trùng tiêu đề!"
                })
            }

            const imageUrl = file ? (file.path || file.secure_url || file.url || file.filename) : null;
            const sqlInsertNews = `INSERT INTO TinTuc (TieuDe, NoiDung, TheLoai, TomTat, TrangThai, NgayDang, LuotXem, MaNV, Tags, AnhThumbnail)
                                    VALUES (?, ?, ?, ?, ?, Now(), 0, ?, ?, ?)`;
            const [result] = await connection.query(sqlInsertNews, [TieuDe, NoiDung, TheLoai, TomTat, TrangThai, MaNV, Tags, imageUrl]);
            const newNewsId = result.insertId;

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            const noiDungLog = `Tạo tin tức mới #${newNewsId} tiêu đề: ${TieuDe}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'NEWS_CREATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.query(`
                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                VALUES (?, ?, ?, ?)
            `, [
                "Bài viết mới", 
                `Bài viết "${TieuDe}" vừa được tạo thành công trên hệ thống.`, 
                "HeThong", 
                `/admin/news/edit/${newNewsId}`
            ]);
            
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Tạo bài viết thành công!",
                dataId: newNewsId
            });
        }
        catch(error){
            console.error("Lỗi API createNews: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo bài viết",
                error: error.message
            })
        }
        finally{
            connection.release();
        }
    },
    updateNews: async(req, res) => {
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const newsId = req.params.id;
            const MaTK = req.user.id;
            const { TieuDe, NoiDung, TheLoai, TomTat, TrangThai, Tags } = req.body;
            const file = req.file;

            // 1. KIỂM TRA BÀI VIẾT CÓ TỒN TẠI HAY KHÔNG
            const [check] = await connection.query(`SELECT TieuDe FROM TinTuc WHERE MaTT = ?`, [newsId]);
            if(check.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tin tức cần sửa!"
                });
            }

            // 2. KIỂM TRA TRÙNG TIÊU ĐỀ VỚI BÀI VIẾT *KHÁC*
            // Chỉ tìm những bài có cùng TieuDe nhưng khác MaTT hiện tại
            const [checkDuplicate] = await connection.query(`SELECT MaTT FROM TinTuc WHERE TieuDe = ? AND MaTT != ?`, [TieuDe, newsId]);
            if(checkDuplicate.length > 0) { 
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Tiêu đề này đã được sử dụng ở bài viết khác, vui lòng chọn tiêu đề khác!"
                });
            }

            if (file) {
                const imageUrl = file.path || file.secure_url || file.url || file.filename; 
                const sqlUpdateNews = `UPDATE TinTuc
                                        SET TieuDe = ?, NoiDung = ?, TheLoai = ?, TomTat = ?, TrangThai = ?, Tags = ?, AnhThumbnail = ?
                                        WHERE MaTT = ?`;
                await connection.query(sqlUpdateNews, [TieuDe, NoiDung, TheLoai, TomTat, TrangThai, Tags, imageUrl, newsId]);
            } 
            else {
                const sqlUpdateNews = `UPDATE TinTuc
                                        SET TieuDe = ?, NoiDung = ?, TheLoai = ?, TomTat = ?, TrangThai = ?, Tags = ?
                                        WHERE MaTT = ?`;
                await connection.query(sqlUpdateNews, [TieuDe, NoiDung, TheLoai, TomTat, TrangThai, Tags, newsId]);
            }

            // 5. GHI LOG HỆ THỐNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            
            const noiDungLog = `Sửa tin tức #${newsId} tiêu đề: "${TieuDe}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'NEWS_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Cập nhật tin tức thành công"
            });
        }
        catch(error){
            await connection.rollback();
            console.error("Lỗi API updateNews: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi cập nhật bài viết",
                error: error.message
            });
        }
        finally{
            if (connection) connection.release();
        }
    },
    deleteNews: async(req, res) => {
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const newsId = req.params.id;
            const MaTK = req.user.id;
            const [check] = await connection.query(`Select TieuDe from TinTuc where MaTT = ?`, [newsId]);
            if(check.length === 0){
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tin tức cần xóa!"
                })
            }
            const TieuDe = check[0].TieuDe;

            const sqlDeleteNews = `DELETE FROM TinTuc WHERE MaTT = ?`;
            const [result] = await connection.query(sqlDeleteNews, [newsId]);

            if(result.affectedRows == 0){
                return res.status(404).json({
                    message: "Không tìm thấy bài viết để xóa"
                });
            }
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            const noiDungLog = `Xoá tin tức #${newsId} tiêu đề: ${TieuDe}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'NEWS_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Xóa bài viết thành công"
            });
        }
        catch(error){
            await connection.rollback();
            console.error("Lỗi API deleteNews: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi xóa bài viết",
                error: error.message
            })
        }
        finally{
            connection.release();
        }
    },
    incrementView: async(req, res) => {
        try{
            const newsId = req.params.id;
            const sql = `UPDATE TinTuc SET LuotXem = LuotXem + 1 WHERE MaTT = ?`;
            const [result] = await db.query(sql, [newsId]);

            if(result.affectedRows === 0){
                return res.status(404).json({
                    message: "Không tìm thấy bài viết"
                });
            }
            res.status(200).json({
                message: "Đã tăng lượt xem"
            });
        }
        catch(error){
            console.error("Lỗi API increaseView: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ khi tăng lượt xem",
                error: error.message
            })
        }
    }
}
module.exports = newsController;