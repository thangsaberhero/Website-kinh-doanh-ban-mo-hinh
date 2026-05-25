const db = require('../../config/db');
const excel = require('exceljs');

const khuyenmai = {
    liet_ke_chuong_trinh_khuyen_mai: async(req, res) => {
        try {
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            if (!page || isNaN(page) || page < 1) page = 1;
            if (!limit || isNaN(limit) || limit < 1) limit = 10;
            if (limit > 50) limit = 50; // Nên nới lỏng ra để Admin dễ xem trên màn hình lớn

            const offset = (page - 1) * limit;

            const { keyword, trangthai } = req.query;
            
            let condition = [];
            let value = [];

            if (keyword) {
                // Chỉ định rõ bảng km.TenKM để tránh lỗi Ambiguous nếu sau này JOIN nhiều bảng
                condition.push("km.TenKM COLLATE utf8mb4_unicode_ci LIKE ?"); 
                value.push(`%${keyword}%`);
            }

            // ĐÃ TỐI ƯU LOGIC: Kết hợp cả thời gian VÀ cờ bật/tắt (TrangThaiHoatDong)
            if (trangthai) {
                if (trangthai === 'DangChay') {
                    condition.push("km.ThoiGianBD <= NOW() AND km.ThoiGianKT >= NOW() AND km.TrangThaiHoatDong = 1");
                } else if (trangthai === 'SapToi') {
                    condition.push("km.ThoiGianBD > NOW() AND km.TrangThaiHoatDong = 1");
                } else if (trangthai === 'HetHan') {
                    condition.push("km.ThoiGianKT < NOW()"); // Đã qua ngày kết thúc thì không cần xét cờ bật tắt
                } else if (trangthai === 'TamDung') {
                    condition.push("km.TrangThaiHoatDong = 0 AND km.ThoiGianKT >= NOW()"); // Bị tắt bằng tay nhưng chưa hết hạn
                }
            }
            
            let whereClause = condition.length > 0 ? "WHERE " + condition.join(" AND ") : "";
            
            const sql_core = `
                SELECT 
                    km.MaKM, km.TenKM, km.ThoiGianBD, km.ThoiGianKT, km.TrangThaiHoatDong, 
                    COUNT(log.MaLichSu) AS SoLuotDung
                FROM KhuyenMai km
                LEFT JOIN LogSuDungKhuyenMai log ON km.MaKM = log.MaKM
                ${whereClause}
                GROUP BY km.MaKM
            `;
            
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count, value);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);
            
            // Xóa ThoiGianBD DESC đi vì MaKM tự tăng đã bao hàm thời gian rồi, tránh MySQL phải sort 2 lần
            const sql_ds = `
                ${sql_core}
                ORDER BY km.MaKM DESC 
                LIMIT ? OFFSET ?
            `;

            const sql_params = [...value, limit, offset];
            const [chuongtrinh] = await db.query(sql_ds, sql_params);

            // TÍNH NĂNG MỚI: Thống kê số lượng từng trạng thái để Frontend vẽ Tab/Badge
            const sql_summary = `
                SELECT 
                    SUM(CASE WHEN ThoiGianBD <= NOW() AND ThoiGianKT >= NOW() AND TrangThaiHoatDong = 1 THEN 1 ELSE 0 END) AS DangChay,
                    SUM(CASE WHEN ThoiGianBD > NOW() AND TrangThaiHoatDong = 1 THEN 1 ELSE 0 END) AS SapToi,
                    SUM(CASE WHEN ThoiGianKT < NOW() THEN 1 ELSE 0 END) AS HetHan,
                    SUM(CASE WHEN TrangThaiHoatDong = 0 AND ThoiGianKT >= NOW() THEN 1 ELSE 0 END) AS TamDung,
                    COUNT(*) as TatCa
                FROM KhuyenMai
            `;
            const [summaryResult] = await db.query(sql_summary);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách chương trình khuyến mãi thành công!",
                data: chuongtrinh,
                summary: summaryResult[0], // Trả thêm cục này về cho Frontend
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });

        } catch (error) {
            console.error("Xảy ra lỗi khi lấy danh sách chương trình khuyến mãi: ", error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy dữ liệu từ máy chủ!"
            });
        }
    },

    xem_chi_tiet_khuyen_mai: async(req, res) =>{
        try{
            const MaKM = req.params.MaKM;
            
            // ==========================================
            // 1. LẤY THÔNG TIN CHUNG CỦA KHUYẾN MÃI
            // ==========================================
            const sql_tt = `SELECT * FROM KhuyenMai WHERE MaKM = ?`;
            const [result_tt] = await db.query(sql_tt, [MaKM]);

            if(result_tt.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy chương trình khuyến mãi!" });
            }

            const sql_roi = `SELECT COUNT(DISTINCT log.MaDH) as TongSoDonHang,
                            IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam,
                            IFNULL(SUM(dh.ThanhTien), 0) as TongDoanhThuMangLai
                            FROM LogSuDungKhuyenMai log
                            INNER JOIN DonHang dh ON log.MaDH = dh.MaDH
                            WHERE log.MaKM = ? AND dh.TrangThaiThanhToan = 'Đã thanh toán'`;
            const [result_roi] = await db.query(sql_roi, [MaKM]);
            const thongTinChung = {
                ...result_tt[0],
                TongSoDonHang: result_roi[0].TongSoDonHang,
                TongTienDaGiam: result_roi[0].TongTienDaGiam,
                TongDoanhThuMangLai: result_roi[0].TongDoanhThuMangLai
            };

            // ==========================================
            // 2. LẤY DANH SÁCH SẢN PHẨM ÁP DỤNG (CÓ PHÂN TRANG)
            // ==========================================
            let page_sp = parseInt(req.query.page_sp) || 1;
            let limit_sp = parseInt(req.query.limit_sp) || 10;
            if (!page_sp || isNaN(page_sp) || page_sp < 1) page_sp = 1;
            if (!limit_sp || isNaN(limit_sp) || limit_sp < 1) limit_sp = 10;
            if (limit_sp > 20) limit_sp = 20;
            const offset_sp = (page_sp - 1) * limit_sp;

            const {keyword_sp, keyword_kh, ma_kh, ma_dh, tu_ngay, den_ngay} = req.query;
            
            let condition_sp = ["ctkm.MaKM = ? "];
            let value_sp = [MaKM];

            if(keyword_sp){
                condition_sp.push("mh.TenMH COLLATE utf8mb4_unicode_ci like ?");
                value_sp.push(`%${keyword_sp}%`);
            }

            let whereClause_sp = condition_sp.length > 0 ? "where " + condition_sp.join(" and ") : "";
            const sql_chi_tiet = `
                SELECT ctkm.MaPhanLoai, ctkm.LoaiGiamGia, ctkm.ChietKhau, ctkm.GiaTriGiamToiDa, ctkm.SoLuongKM,
                       pl.ChiTietPhanLoai, mh.MaMoHinh, mh.TenMH, pl.DonGia,
                       (pl.DonGia - CASE
                           WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                           WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl.DonGia))
                           ELSE 0
                       END) AS DonGiaKhuyenMai
                FROM ChiTietKhuyenMai ctkm
                INNER JOIN PhanLoai pl ON pl.MaPhanLoai = ctkm.MaPhanLoai
                INNER JOIN MoHinh mh ON mh.MaMoHinh = pl.MaMoHinh
                ${whereClause_sp}
            `;
            
            const sql_count_sp = `SELECT COUNT(*) AS total FROM (${sql_chi_tiet}) as temptable`;
            const [countResult_sp] = await db.query(sql_count_sp, [...value_sp]);
            const totalItems_sp = countResult_sp[0].total;
            const totalPage_sp = Math.ceil(totalItems_sp / limit_sp);

            const sql_ds_sp = `
                ${sql_chi_tiet}
                ORDER BY ctkm.MaPhanLoai ASC
                LIMIT ? OFFSET ?
            `;
            const [result_detail] = await db.query(sql_ds_sp, [...value_sp, limit_sp, offset_sp]);

            // ==========================================
            // 3. LẤY LỊCH SỬ SỬ DỤNG (CÓ PHÂN TRANG)
            // ==========================================
            let page_log = parseInt(req.query.page_log) || 1;
            let limit_log = parseInt(req.query.limit_log) || 10;
            if (!page_log || isNaN(page_log) || page_log < 1) page_log = 1;
            if (!limit_log || isNaN(limit_log) || limit_log < 1) limit_log = 10;
            if (limit_log > 20) limit_log = 20;
            const offset_log = (page_log - 1) * limit_log;

            let condition_log = ["log.MaKM = ? "];
            let value_log = [MaKM];

            if(keyword_kh){
                condition_log.push("kh.TenKH COLLATE utf8mb4_unicode_ci like ?");
                value_log.push(`%${keyword_kh}%`);
            }

            if(ma_kh){
                condition_log.push("log.MaKH = ?")
                value_log.push(ma_kh);
            }

            if(ma_dh){
                condition_log.push("(log.MaDH = ? OR dh.MaDonHangHienThi LIKE ?)")
                value_log.push(ma_dh, `%${ma_dh}%`);
            }

            if(tu_ngay){
                condition_log.push("log.ThoiGianSuDung >= ?")
                value_log.push(`${tu_ngay} 00:00:00`);
            }

            if(den_ngay){
                condition_log.push("log.ThoiGianSuDung <= ?")
                value_log.push(`${den_ngay} 23:59:59`);
            }

            let whereClause_log = condition_log.length > 0 ? "where " + condition_log.join(" and ") : "";

            const sql_log_core = `
                SELECT log.MaLichSu, log.MaKH, COALESCE(kh.TenKH, dh.TenNguoiNhan), 
                log.MaDH, log.SoTienDaGiam, log.ThoiGianSuDung
                FROM LogSuDungKhuyenMai log
                inner join DonHang dh on dh.MaDH = log.MaDH
                left join KhachHang kh on kh.MaKH = log.MaKH
                ${whereClause_log}
            `;
            
            const sql_count_log = `SELECT COUNT(*) AS total FROM (${sql_log_core}) as temptable`;
            const [countResult_log] = await db.query(sql_count_log, [...value_log]);
            const totalItems_log = countResult_log[0].total;
            const totalPage_log = Math.ceil(totalItems_log / limit_log);

            const sql_ds_log = `
                ${sql_log_core}
                ORDER BY log.ThoiGianSuDung DESC
                LIMIT ? OFFSET ?
            `;

            const [result_log] = await db.query(sql_ds_log, [...value_log, limit_log, offset_log]);

            // ==========================================
            // 4. TRẢ VỀ KẾT QUẢ
            // ==========================================
            res.status(200).json({
                success: true,
                message: "Lấy thông tin chương trình khuyến mãi thành công!",
                data: {
                    tt: thongTinChung, 
                    detail: result_detail,
                    log: result_log
                },
                pagination_sp: {
                    currentPage: page_sp,
                    limit: limit_sp,
                    totalItems: totalItems_sp,
                    totalPage: totalPage_sp
                },
                pagination_log: {
                    currentPage: page_log,
                    limit: limit_log,
                    totalItems: totalItems_log,
                    totalPage: totalPage_log
                }
            });

        }
        catch (error){
            console.error("Xảy ra lỗi khi lấy thông tin chương trình khuyến mãi: ", error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy thông tin chương trình khuyến mãi!"
            });
        }
    },

    them_chuong_trinh_khuyen_mai: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong} = req.body;
            const MaTK = req.user.id; // Lấy ID thực tế từ Token thay vì lấy tên

            // 1. VALIDATION BẮT BUỘC
            if (!TenKM || !ThoiGianBD || !ThoiGianKT) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ tên và thời gian chương trình!" });
            }

            if (new Date(ThoiGianBD) >= new Date(ThoiGianKT)) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Lỗi logic: Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!" });
            }

            // 2. TẠO CHƯƠNG TRÌNH KHUYẾN MÃI
            const isVisible = (TrangThaiHoatDong === 1 || TrangThaiHoatDong === '1' || TrangThaiHoatDong === true) ? 1 : 0;
            
            const sql_them_khuyen_mai = `INSERT INTO KhuyenMai(TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong) VALUES(?, ?, ?, ?)`;
            const [them_khuyen_mai] = await connection.query(sql_them_khuyen_mai, [TenKM, ThoiGianBD, ThoiGianKT, isVisible]);
            const maKM = them_khuyen_mai.insertId;

            // 4. GHI LOG BẢO MẬT (Dùng lại bảng LogHoatDongTaiKhoan chuẩn)
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Tạo mới chương trình khuyến mãi #${maKM}: "${TenKM}"`;
            
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'PROMOTION_CREATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm chương trình khuyến mãi mới thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thao tác thêm chương trình khuyến mãi: ", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi thêm chương trình khuyến mãi!" });
        } finally {
            if (connection) connection.release();
        }
    },

    sua_chuong_trinh_khuyen_mai: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaKM = req.params.id;
            const { TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong} = req.body;
            const MaTK = req.user.id;

            if (!TenKM || !ThoiGianKT) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ Tên và Thời gian kết thúc!" });
            }

            // 1. LẤY THÔNG TIN KM HIỆN TẠI TỪ DATABASE (Cột mốc sự thật)
            const [check] = await connection.query(`SELECT MaKM, ThoiGianBD FROM KhuyenMai WHERE MaKM = ?`, [MaKM]);
            if (check.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy chương trình khuyến mãi cần sửa!" });
            }

            // Lấy thời gian gốc trong Database để so sánh, KHÔNG dùng thời gian từ Frontend
            const db_ThoiGianBD = check[0].ThoiGianBD; 
            const isStarted = new Date(db_ThoiGianBD) <= new Date();

            // 2. GIẢI QUYẾT XUNG ĐỘT THỜI GIAN BẮT ĐẦU
            let final_ThoiGianBD = ThoiGianBD;

            if (isStarted) {
                // CHỐT CHẶN VÀNG: Đã chạy rồi thì cấm đổi giờ bắt đầu. Ép dùng lại giờ cũ của DB!
                final_ThoiGianBD = db_ThoiGianBD; 
            } else if (!ThoiGianBD) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng chọn Thời gian bắt đầu!" });
            }

            // 3. KIỂM TRA LOGIC THỜI GIAN MỚI NHẤT
            if (new Date(final_ThoiGianBD) >= new Date(ThoiGianKT)) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Lỗi logic: Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!" });
            }

            // 4. CẬP NHẬT THÔNG TIN CHUNG
            const isVisible = (TrangThaiHoatDong === 1 || TrangThaiHoatDong === '1' || TrangThaiHoatDong === true) ? 1 : 0;
            const sql_sua_khuyen_mai = `
                UPDATE KhuyenMai 
                SET TenKM = ?, ThoiGianBD = ?, ThoiGianKT = ?, TrangThaiHoatDong = ?
                WHERE MaKM = ?
            `;
            // Truyền final_ThoiGianBD vào để cập nhật
            await connection.query(sql_sua_khuyen_mai, [TenKM, final_ThoiGianBD, ThoiGianKT, isVisible, MaKM]);

            // 6. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Cập nhật thông tin chương trình khuyến mãi #${MaKM}: "${TenKM}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'PROMOTION_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Cập nhật chương trình khuyến mãi thành công!"
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thao tác sửa thông tin chương trình khuyến mãi: ", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi sửa chương trình khuyến mãi!" });
        }
        finally {
            if (connection) connection.release();
        }
    },

    liet_ke_ma_giam_gia: async(req, res) =>{
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!page || isNaN(page) || page < 1) page = 1;
            if (!limit || isNaN(limit) || limit < 1) limit = 5;
            if (limit > 10) limit = 10;
            const offset = (page - 1) * limit;

            const {keyword, 
                trangthai, ma
            } = req.query;
            
            let condition = [];
            let value = [];

            if(keyword){
                condition.push("gg.TenMaGiamGia COLLATE utf8mb4_unicode_ci like ?");
                value.push(`%${keyword}%`);
            }

            if (trangthai) {
                if (trangthai === 'DangChay') {
                    condition.push("gg.ThoiGianBD <= NOW() AND gg.ThoiGianKT >= NOW() AND gg.TrangThaiHoatDong = 1");
                } else if (trangthai === 'SapToi') {
                    condition.push("gg.ThoiGianBD > NOW() AND gg.TrangThaiHoatDong = 1");
                } else if (trangthai === 'HetHan') {
                    condition.push("gg.ThoiGianKT < NOW()"); // Đã qua ngày kết thúc thì không cần xét cờ bật tắt
                } else if (trangthai === 'TamDung') {
                    condition.push("gg.TrangThaiHoatDong = 0 AND gg.ThoiGianKT >= NOW()"); // Bị tắt bằng tay nhưng chưa hết hạn
                }
            }

            if(ma){
                condition.push("gg.MaVoucher like ?");
                value.push(`%${ma}%`);
            }

            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";
            const sql_core = `
                SELECT gg.* FROM MaGiamGia gg 
                ${whereClause}
            `;
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count,value);
            const totalItems = countResult[0].total;
            //Làm tròn lên
            const totalPage = Math.ceil(totalItems/limit);
            const sql_ds = `${sql_core}
                order by gg.MaGG DESC
                Limit ? offset ?`;


            const sql_params = [...value, limit, offset]
            const [chuongtrinh] = await db.query(sql_ds, sql_params);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách mã giảm giá thành công!",
                data: chuongtrinh,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });

        }
        catch (error){
            console.error("Xảy ra lỗi khi lấy danh sách mã giảm giá: " + error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy danh sách mã giảm giá!"
            });
        }
    },

    xem_chi_tiet_ma_giam_gia: async(req, res) =>{
        try{
            const MaGG = req.params.MaGG;
            
            // ==========================================
            // 1. LẤY THÔNG TIN CHUNG CỦA KHUYẾN MÃI
            // ==========================================
            const sql_tt = `SELECT * FROM MaGiamGia WHERE MaGG = ?`;
            const [result_tt] = await db.query(sql_tt, [MaGG]);

            if(result_tt.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy chương trình khuyến mãi!" });
            }

            const sql_roi = `SELECT COUNT(DISTINCT log.MaDH) as TongSoDonHang,
                            IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam,
                            IFNULL(SUM(dh.ThanhTien), 0) as TongDoanhThuMangLai
                            FROM LogSuDungMaGiamGia log
                            INNER JOIN DonHang dh ON log.MaDH = dh.MaDH
                            WHERE log.MaGG = ? AND dh.TrangThaiThanhToan = 'Đã thanh toán'`;
            const [result_roi] = await db.query(sql_roi, [MaGG]);
            const thongTinChung = {
                ...result_tt[0],
                TongSoDonHang: result_roi[0].TongSoDonHang,
                TongTienDaGiam: result_roi[0].TongTienDaGiam,
                TongDoanhThuMangLai: result_roi[0].TongDoanhThuMangLai
            };

            // ==========================================
            // 2. LẤY DANH SÁCH SẢN PHẨM ÁP DỤNG (CÓ PHÂN TRANG)
            // ==========================================
            let page_sp = parseInt(req.query.page_sp) || 1;
            let limit_sp = parseInt(req.query.limit_sp) || 10;
            if (isNaN(page_sp) || page_sp < 1) page_sp = 1;
            if (isNaN(limit_sp) || limit_sp < 1) limit_sp = 10;
            const offset_sp = (page_sp - 1) * limit_sp;
            const {keyword_sp, keyword_kh, ma_kh, ma_dh, tu_ngay, den_ngay} = req.query;
            let condition_sp = ["ctgg.MaGG = ? "];
            let value_sp = [MaGG];

            if(keyword_sp){
                condition_sp.push("mh.TenMH COLLATE utf8mb4_unicode_ci like ?");
                value_sp.push(`%${keyword_sp}%`);
            }
            let whereClause_sp = condition_sp.length > 0 ? "where " + condition_sp.join(" and ") : "";
            const sql_chi_tiet = `
                SELECT gg.MaGG, ctgg.MaPhanLoai,
                       pl.ChiTietPhanLoai, mh.MaMoHinh, mh.TenMH, pl.DonGia,
                       (pl.DonGia - CASE
                           WHEN gg.LoaiGiamGia = 'TienMat' THEN gg.ChietKhau
                           WHEN gg.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl.DonGia * gg.ChietKhau / 100), COALESCE(gg.GiaTriGiamToiDa, pl.DonGia))
                           ELSE 0
                       END) AS DonGiaKhuyenMai
                FROM ChiTietMaGiamGia ctgg
                inner join MaGiamGia gg on gg.MaGG = ctgg.MaGG
                INNER JOIN PhanLoai pl ON pl.MaPhanLoai = ctgg.MaPhanLoai
                INNER JOIN MoHinh mh ON mh.MaMoHinh = pl.MaMoHinh
                ${whereClause_sp}
            `;
            
            const sql_count_sp = `SELECT COUNT(*) AS total FROM (${sql_chi_tiet}) as temptable`;
            const [countResult_sp] = await db.query(sql_count_sp, [...value_sp  ]);
            const totalItems_sp = countResult_sp[0].total;
            const totalPage_sp = Math.ceil(totalItems_sp / limit_sp);

            const sql_ds_sp = `
                ${sql_chi_tiet}
                ORDER BY ctgg.MaPhanLoai ASC
                LIMIT ? OFFSET ?
            `;
            const [result_detail] = await db.query(sql_ds_sp, [...value_sp, limit_sp, offset_sp]);

            // ==========================================
            // 3. LẤY LỊCH SỬ SỬ DỤNG (CÓ PHÂN TRANG)
            // ==========================================
            let page_log = parseInt(req.query.page_log) || 1;
            let limit_log = parseInt(req.query.limit_log) || 10;
            if (isNaN(page_log) || page_log < 1) page_log = 1;
            if (isNaN(limit_log) || limit_log < 1) limit_log = 10;
            const offset_log = (page_log - 1) * limit_log;
            let condition_log = ["ctgg.MaGG = ? "];
            let value_log = [MaGG];

            if(keyword_kh){
                condition_log.push("kh.TenKH COLLATE utf8mb4_unicode_ci like ?");
                value_log.push(`%${keyword_kh}%`);
            }

            if(ma_kh){
                condition_log.push("log.MaKH = ?")
                value_log.push(ma_kh);
            }

            if(ma_dh){
                condition_log.push("(log.MaDH = ? OR dh.MaDonHangHienThi LIKE ?)")
                value_log.push(ma_dh, `%${ma_dh}%`);
            }

            if(tu_ngay){
                condition_log.push("log.ThoiGianSuDung >= ?")
                value_log.push(`${tu_ngay} 00:00:00`);
            }

            if(den_ngay){
                condition_log.push("log.ThoiGianSuDung <= ?")
                value_log.push(`${den_ngay} 23:59:59`);
            }

            let whereClause_log = condition_log.length > 0 ? "where " + condition_log.join(" and ") : "";
            const sql_log_core = `
                SELECT 
                    log.MaLichSu, log.MaKH, log.MaDH, dh.MaDonHangHienThi, 
                    COALESCE(kh.TenKH, dh.TenNguoiNhan) AS TenKH, 
                    log.SoTienDaGiam, log.ThoiGianSuDung
                FROM LogSuDungMaGiamGia log
                left join KhachHang kh on kh.MaKH= log.MaKH
                inner join DonHang dh on dh.MaDH =log.MaDH
            `;
            
            const sql_count_log = `SELECT COUNT(*) AS total FROM (${sql_log_core}) as temptable`;
            const [countResult_log] = await db.query(sql_count_log, [...value_log]);
            const totalItems_log = countResult_log[0].total;
            const totalPage_log = Math.ceil(totalItems_log / limit_log);

            const sql_ds_log = `
                ${sql_log_core}
                ORDER BY log.ThoiGianSuDung DESC
                LIMIT ? OFFSET ?
            `;

            const [result_log] = await db.query(sql_ds_log, [...value_log, limit_log, offset_log]);

            // ==========================================
            // 4. TRẢ VỀ KẾT QUẢ
            // ==========================================
            res.status(200).json({
                success: true,
                message: "Lấy thông tin chương trình mã giảm giá thành công!",
                data: {
                    tt: thongTinChung, 
                    detail: result_detail,
                    log: result_log
                },
                pagination_sp: {
                    currentPage: page_sp,
                    limit: limit_sp,
                    totalItems: totalItems_sp,
                    totalPage: totalPage_sp
                },
                pagination_log: {
                    currentPage: page_log,
                    limit: limit_log,
                    totalItems: totalItems_log,
                    totalPage: totalPage_log
                }
            });

        }
        catch (error){
            console.error("Xảy ra lỗi khi lấy thông tin mã giảm giá: ", error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy thông tin mã giảm giá!"
            });
        }
    },

    them_ma_giam_gia: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { 
                TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                ThoiGianBD, ThoiGianKT, MaKH, MucGiaToiThieu,
                TrangThaiHoatDong, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa
            } = req.body;
            
            const MaTK = req.user.id;

            // 1. VALIDATION CƠ BẢN
            if (!TenMaGiamGia || !MaVoucher || !ThoiGianBD || !ThoiGianKT || !SoLuongDungToiDa) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ các thông tin bắt buộc!" });
            }

            if (new Date(ThoiGianBD) >= new Date(ThoiGianKT)) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Lỗi logic: Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!" });
            }

            // 2. KIỂM TRA TRÙNG LẶP MÃ VOUCHER (CHỐT CHẶN QUAN TRỌNG)
            const maVoucherClean = MaVoucher.trim().toUpperCase(); // Tự động xóa khoảng trắng và viết hoa
            const [checkMa] = await connection.query(`SELECT MaGG FROM MaGiamGia WHERE MaVoucher = ?`, [maVoucherClean]);
            
            if (checkMa.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Mã Voucher này đã tồn tại! Vui lòng nhập mã khác." });
            }

            // 3. TẠO MÃ GIẢM GIÁ
            const isVisible = (TrangThaiHoatDong === 1 || TrangThaiHoatDong === '1' || TrangThaiHoatDong === true) ? 1 : 0;
            const maxDiscount = LoaiGiamGia === 'TienMat' ? null : GiaTriGiamToiDa;
            
            const sql_them_ma_gg = `
                INSERT INTO MaGiamGia (
                    TenMaGiamGia, MaVoucher, SoLuongDungToiDa, ThoiGianBD,
                    ThoiGianKT, MaKH, MucGiaToiThieu, TrangThaiHoatDong,
                    LoaiGiamGia, ChietKhau, GiaTriGiamToiDa
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const [them_ma_gg] = await connection.query(sql_them_ma_gg, [
                TenMaGiamGia, maVoucherClean, SoLuongDungToiDa, 
                ThoiGianBD, ThoiGianKT, MaKH || null, MucGiaToiThieu || 0,
                isVisible, LoaiGiamGia, ChietKhau, maxDiscount
            ]);
            
            const maGG = them_ma_gg.insertId;

            // 5. GHI LOG BẢO MẬT (Dùng bảng chuẩn)
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Tạo mới mã giảm giá #${maGG}: "${maVoucherClean}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'VOUCHER_CREATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm mã giảm giá mới thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thao tác thêm mã giảm giá: ", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi thêm mã giảm giá!" });
        } finally {
            if (connection) connection.release();
        }
    },

    sua_ma_giam_gia: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaGG = req.params.id;
            const {
                TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                ThoiGianBD, ThoiGianKT, MaKH, MucGiaToiThieu,
                TrangThaiHoatDong, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa,
            } = req.body;
            
            const MaTK = req.user.id;

            // 1. VALIDATION CƠ BẢN
            if (!TenMaGiamGia || !MaVoucher || !ThoiGianKT || !SoLuongDungToiDa) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ các thông tin bắt buộc!" });
            }

            // 2. LẤY THÔNG TIN GỐC TỪ DATABASE (Cột mốc sự thật)
            const [check] = await connection.query(`SELECT MaGG, ThoiGianBD FROM MaGiamGia WHERE MaGG = ?`, [MaGG]);
            if(check.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá cần sửa!" });
            }

            const db_ThoiGianBD = check[0].ThoiGianBD;
            const isStarted = new Date(db_ThoiGianBD) <= new Date();

            // 3. GIẢI QUYẾT XUNG ĐỘT THỜI GIAN BẮT ĐẦU
            let final_ThoiGianBD = ThoiGianBD;
            if (isStarted) {
                final_ThoiGianBD = db_ThoiGianBD; // Đã chạy thì ép dùng giờ cũ
            } else if (!ThoiGianBD) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng chọn Thời gian bắt đầu!" });
            }

            if (new Date(final_ThoiGianBD) >= new Date(ThoiGianKT)) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Lỗi logic: Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!" });
            }

            // 4. KIỂM TRA TRÙNG LẶP MÃ VOUCHER (Ngoại trừ chính mã đang sửa)
            const maVoucherClean = MaVoucher.trim().toUpperCase();
            const [checkTrungMa] = await connection.query(
                `SELECT MaGG FROM MaGiamGia WHERE MaVoucher = ? AND MaGG != ?`, 
                [maVoucherClean, MaGG]
            );
            if (checkTrungMa.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Mã Voucher này đã bị trùng với một chương trình khác!" });
            }

            // 5. CẬP NHẬT THÔNG TIN CHUNG
            const isVisible = (TrangThaiHoatDong === 1 || TrangThaiHoatDong === '1' || TrangThaiHoatDong === true) ? 1 : 0;
            const maxDiscount = LoaiGiamGia === 'TienMat' ? null : GiaTriGiamToiDa; // Làm sạch dữ liệu

            const sql_sua_ma_gg = `
                UPDATE MaGiamGia SET
                    TenMaGiamGia = ?, MaVoucher = ?, SoLuongDungToiDa = ?, ThoiGianBD = ?,
                    ThoiGianKT = ?, MaKH = ?, MucGiaToiThieu = ?, TrangThaiHoatDong = ?, 
                    LoaiGiamGia = ?, ChietKhau = ?, GiaTriGiamToiDa = ? 
                WHERE MaGG = ?
            `;
            // Lưu ý: Sử dụng final_ThoiGianBD và maxDiscount đã được làm sạch
            await connection.query(sql_sua_ma_gg, [
                TenMaGiamGia, maVoucherClean, SoLuongDungToiDa, final_ThoiGianBD, 
                ThoiGianKT, MaKH || null, MucGiaToiThieu || 0, isVisible, 
                LoaiGiamGia, ChietKhau, maxDiscount, MaGG
            ]);

            // 7. GHI LOG HOẠT ĐỘNG (Bảo mật)
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Cập nhật thông tin mã giảm giá #${MaGG}: "${maVoucherClean}"`;
            
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'VOUCHER_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin mã giảm giá thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thao tác sửa thông tin mã giảm giá: ", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi sửa thông tin mã giảm giá!" });
        } finally {
            if (connection) connection.release();
        }
    },

    xoa_chuong_trinh_khuyen_mai: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaKM = req.params.id;
            const MaTK = req.user.id;

            // 1. KIỂM TRA TỒN TẠI & LẤY TÊN CHƯƠNG TRÌNH ĐỂ GHI LOG CHÍNH XÁC
            const [checkKM] = await connection.query('SELECT TenKM FROM KhuyenMai WHERE MaKM = ?', [MaKM]);
            if (checkKM.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy chương trình khuyến mãi này trong hệ thống!" });
            }
            const tenKhuyenMaiStr = checkKM[0].TenKM;

            // 2. KIỂM TRA LỊCH SỬ SỬ DỤNG TRONG ĐƠN HÀNG
            const [logs] = await connection.query('SELECT 1 FROM LogSuDungKhuyenMai WHERE MaKM = ? LIMIT 1', [MaKM]);

            // Chuẩn bị thông tin IP cho Log đối soát
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            let noiDungLog = '';

            // =====================================
            // TRƯỜNG HỢP 1: SOFT DELETE (VÔ HIỆU HÓA)
            // =====================================
            if (logs.length > 0) {
                // Giữ nguyên TrangThaiHoatDong theo đúng thiết kế bảng KhuyenMai của bạn
                await connection.query('UPDATE KhuyenMai SET TrangThaiHoatDong = 0 WHERE MaKM = ?', [MaKM]);

                // BỔ SUNG: Ghi nhận hoạt động vô hiệu hóa vào hệ thống log tập trung
                noiDungLog = `Hủy kích hoạt chiến dịch khuyến mãi #${MaKM} ("${tenKhuyenMaiStr}") do đã phát sinh lịch sử mua hàng.`;
                await connection.query(`
                    INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                    VALUES (?, 'PROMOTION_DEACTIVATE', ?, ?, NOW())
                `, [MaTK, noiDungLog, userIp]);

                await connection.commit();
                return res.status(200).json({ 
                    success: true, 
                    isSoftDeleted: true,
                    message: "Chiến dịch này đã có người sử dụng. Hệ thống đã tự động chuyển sang trạng thái Ngừng Hoạt Động thay vì xóa để bảo toàn dữ liệu kế toán." 
                });
            }

            // =====================================
            // TRƯỜNG HỢP 2: HARD DELETE (XÓA VĨNH VIỄN)
            // =====================================
            // Xóa chi tiết các sản phẩm áp dụng trước để tránh lỗi ràng buộc khóa ngoại (Foreign Key Constraint)
            await connection.query('DELETE FROM ChiTietKhuyenMai WHERE MaKM = ?', [MaKM]);
            await connection.query('DELETE FROM KhuyenMai WHERE MaKM = ?', [MaKM]);

            // Ghi nhận hoạt động xóa vĩnh viễn
            noiDungLog = `Xóa vĩnh viễn chương trình khuyến mãi #${MaKM} ("${tenKhuyenMaiStr}").`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'PROMOTION_DELETE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({ 
                success: true, 
                isSoftDeleted: false, 
                message: "Đã xóa chương trình khuyến mãi vĩnh viễn." 
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi xóa khuyến mãi: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ khi thao tác xóa." 
            });
        } finally {
            if (connection) connection.release();
        }
    },

    xoa_ma_giam_gia: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaGG = req.params.id;
            const MaTK = req.user.id;
            
            // 1. KIỂM TRA TỒN TẠI & LẤY MÃ VOUCHER ĐỂ GHI LOG
            const [checkGG] = await connection.query('SELECT MaVoucher FROM MaGiamGia WHERE MaGG = ?', [MaGG]);
            if (checkGG.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá này trong hệ thống!" });
            }
            const maVoucherStr = checkGG[0].MaVoucher;

            // 2. KIỂM TRA LỊCH SỬ SỬ DỤNG
            const [logs] = await connection.query('SELECT 1 FROM LogSuDungMaGiamGia WHERE MaGG = ? LIMIT 1', [MaGG]);

            // Chuẩn bị thông tin IP cho Log
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            let noiDungLog = '';

            // =====================================
            // TRƯỜNG HỢP 1: SOFT DELETE (VÔ HIỆU HÓA)
            // =====================================
            if (logs.length > 0) {
                // FIX LỖI SẬP: Đổi TrangThaiHoatDong thành TrangThai
                await connection.query('UPDATE MaGiamGia SET TrangThaiHoatDong = 0 WHERE MaGG = ?', [MaGG]);

                // BỔ SUNG GHI LOG KHI XÓA MỀM
                noiDungLog = `Hủy kích hoạt mã giảm giá #${MaGG} ("${maVoucherStr}") do đã có người sử dụng.`;
                await connection.query(`
                    INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                    VALUES (?, 'VOUCHER_DEACTIVATE', ?, ?, NOW())
                `, [MaTK, noiDungLog, userIp]);

                await connection.commit();
                return res.status(200).json({ 
                    success: true, 
                    isSoftDeleted: true,
                    message: "Mã giảm giá này đã có người sử dụng. Hệ thống đã tự động chuyển sang trạng thái Ngừng Hoạt Động để bảo toàn dữ liệu kế toán." 
                });
            }

            // =====================================
            // TRƯỜNG HỢP 2: HARD DELETE (XÓA VĨNH VIỄN)
            // =====================================
            await connection.query('DELETE FROM ChiTietMaGiamGia WHERE MaGG = ?', [MaGG]);
            await connection.query('DELETE FROM MaGiamGia WHERE MaGG = ?', [MaGG]);

            // Ghi Log Xóa vĩnh viễn
            noiDungLog = `Xóa vĩnh viễn mã giảm giá #${MaGG} ("${maVoucherStr}").`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'VOUCHER_DELETE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({ 
                success: true, 
                isSoftDeleted: false, 
                message: "Đã xóa mã giảm giá vĩnh viễn." 
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi xóa mã giảm giá: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ khi thao tác xóa." 
            });
        } finally {
            if (connection) connection.release();
        }
    },
    
    them_sp_km: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { DanhSachMaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM } = req.body;
            const MaKM = req.params.id;
            const MaTK = req.user.id;

            if (!DanhSachMaPhanLoai || !Array.isArray(DanhSachMaPhanLoai) || DanhSachMaPhanLoai.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 sản phẩm' });
            }

            // KIỂM TRA TỒN TẠI VÀ CHỐT CHẶN BẮT ĐẦU
            const [currentKM] = await connection.query('SELECT TenKM, ThoiGianBD, ThoiGianKT FROM KhuyenMai WHERE MaKM = ?', [MaKM]);
            if (currentKM.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Chương trình khuyến mãi không tồn tại' });
            }
            
            const { TenKM, ThoiGianBD, ThoiGianKT } = currentKM[0];
            if (new Date(ThoiGianBD) <= new Date()) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Không thể thêm sản phẩm! Chiến dịch này đã hoặc đang diễn ra.' });
            }

            // KIỂM TRA TRÙNG LẶP KHUNG GIỜ KHUYẾN MÃI (Giữ nguyên logic cực hay của bạn)
            const placeholders = DanhSachMaPhanLoai.map(() => '?').join(',');
            const sqlCheckOverlap = `
                SELECT ct.MaPhanLoai, km.TenKM 
                FROM ChiTietKhuyenMai ct
                INNER JOIN KhuyenMai km ON ct.MaKM = km.MaKM
                WHERE ct.MaPhanLoai IN (${placeholders})
                AND ct.MaKM != ? 
                AND km.TrangThaiHoatDong = 1
                AND (km.ThoiGianBD <= ? AND km.ThoiGianKT >= ?)
            `;
            
            const [overlaps] = await connection.query(sqlCheckOverlap, [...DanhSachMaPhanLoai, MaKM, ThoiGianKT, ThoiGianBD]);

            if (overlaps.length > 0) {
                await connection.rollback();
                const duplicateIds = [...new Set(overlaps.map(o => o.MaPhanLoai))];
                return res.status(400).json({ 
                    success: false, 
                    message: `Có ${duplicateIds.length} sản phẩm đang tham gia chiến dịch khác trong cùng khung giờ.`,
                    duplicates: duplicateIds 
                });
            }

            // XỬ LÝ INSERT HÀNG LOẠT
            const maxDiscount = LoaiGiamGia === 'TienMat' ? null : GiaTriGiamToiDa;
            const soLuongKM = (SoLuongKM === undefined || SoLuongKM === null) ? 1 : SoLuongKM;
            
            const values = DanhSachMaPhanLoai.map(MaPhanLoai => [
                MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, maxDiscount, soLuongKM
            ]);

            const sqlInsert = `INSERT IGNORE INTO ChiTietKhuyenMai (MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM) VALUES ?`;
            const [result] = await connection.query(sqlInsert, [values]);

            // GHI LOG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await connection.query(`INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) VALUES (?, 'PROMOTION_UPDATE', ?, ?, NOW())`, 
                [MaTK, `Thêm ${result.affectedRows} sản phẩm vào khuyến mãi #${MaKM}: "${TenKM}"`, userIp]);

            await connection.commit();
            res.status(200).json({ success: true, message: `Đã thêm thành công ${result.affectedRows} sản phẩm vào chiến dịch` });
        } 
        catch (error) {
            await connection.rollback();
            console.error('Lỗi API them_sp_km:', error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm sản phẩm" });
        } 
        finally {
            if (connection) connection.release();
        }
    },

    xoa_sp_km: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaKM = req.params.id;
            const MaPhanLoai = req.params.maPhanLoai;
            const MaTK = req.user.id;

            const [currentKM] = await connection.query('SELECT TenKM, ThoiGianBD FROM KhuyenMai WHERE MaKM = ?', [MaKM]);
            if (currentKM.length > 0 && new Date(currentKM[0].ThoiGianBD) <= new Date()) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Không thể xóa! Chiến dịch này đã bắt đầu.' });
            }

            await connection.query(`DELETE FROM ChiTietKhuyenMai WHERE MaKM = ? AND MaPhanLoai = ?`, [MaKM, MaPhanLoai]);
            
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await connection.query(`INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) VALUES (?, 'PROMOTION_UPDATE', ?, ?, NOW())`, 
                [MaTK, `Xóa phân loại SP #${MaPhanLoai} khỏi khuyến mãi #${MaKM}`, userIp]);

            await connection.commit();
            res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
        } 
        catch (error) { 
            await connection.rollback();
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa sản phẩm" }); 
        }
        finally {
            if (connection) connection.release();
        }
    },

    them_sp_voucher: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { DanhSachMaPhanLoai } = req.body;  
            const MaGG = req.params.id;
            const MaTK = req.user.id;

            if (!DanhSachMaPhanLoai || !Array.isArray(DanhSachMaPhanLoai) || DanhSachMaPhanLoai.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 sản phẩm' });
            }

            const [currentVoucher] = await connection.query('SELECT MaVoucher, ThoiGianBD FROM MaGiamGia WHERE MaGG = ?', [MaGG]);
            if (currentVoucher.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại' });
            }
            if (new Date(currentVoucher[0].ThoiGianBD) <= new Date()) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Không thể thêm sản phẩm! Mã giảm giá này đã bắt đầu có hiệu lực.' });
            }

            // TỐI ƯU SIÊU TỐC: Bỏ vòng lặp for, dùng INSERT IGNORE Bulk giống hệt Khuyến Mãi
            const values = DanhSachMaPhanLoai.map(MaPhanLoai => [MaGG, MaPhanLoai]);
            const sql_insert = `INSERT IGNORE INTO ChiTietMaGiamGia (MaGG, MaPhanLoai) VALUES ?`;
            const [result] = await connection.query(sql_insert, [values]);

            // GHI LOG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await connection.query(`INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) VALUES (?, 'VOUCHER_UPDATE', ?, ?, NOW())`, 
                [MaTK, `Thêm ${result.affectedRows} sản phẩm vào Voucher #${MaGG}: "${currentVoucher[0].MaVoucher}"`, userIp]);

            await connection.commit();
            res.status(200).json({ success: true, message: `Đã thêm thành công ${result.affectedRows} sản phẩm vào Voucher` });
        } 
        catch (error) { 
            await connection.rollback();
            console.error("Lỗi API them_sp_voucher:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm sản phẩm vào Voucher" }); 
        } 
        finally {
            if (connection) connection.release();
        }
    },

    xoa_sp_voucher: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaGG = req.params.id;
            const MaPhanLoai = req.params.maPhanLoai;
            const MaTK = req.user.id;

            const [currentVoucher] = await connection.query('SELECT MaVoucher, ThoiGianBD FROM MaGiamGia WHERE MaGG = ?', [MaGG]);
            if (currentVoucher.length > 0 && new Date(currentVoucher[0].ThoiGianBD) <= new Date()) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Không thể xóa! Mã giảm giá này đã có hiệu lực.' });
            }

            await connection.query(`DELETE FROM ChiTietMaGiamGia WHERE MaGG = ? AND MaPhanLoai = ?`, [MaGG, MaPhanLoai]);
            
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await connection.query(`INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) VALUES (?, 'VOUCHER_UPDATE', ?, ?, NOW())`, 
                [MaTK, `Xóa phân loại SP #${MaPhanLoai} khỏi Voucher #${MaGG}`, userIp]);

            await connection.commit();
            res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
        } 
        catch (error) { 
            await connection.rollback();
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi xóa sản phẩm" }); 
        }
        finally {
            if (connection) connection.release();
        }
    },

    tim_kiem_san_pham: async(req, res) => {
        try {
            const keyword = req.query.search || '';
            const maDM = req.query.maDM || '';
            const maHSX = req.query.maHSX || '';

            let condition = ["(mh.TenMH COLLATE utf8mb4_unicode_ci LIKE ? OR pl.ChiTietPhanLoai COLLATE utf8mb4_unicode_ci LIKE ?)"];
            let value = [`%${keyword}%`, `%${keyword}%`];

            if (maDM) {
                condition.push("mh.MaDM = ?");
                value.push(maDM);
            }
            
            if (maHSX) {
                condition.push("mh.MaHSX = ?");
                value.push(maHSX);
            }

            let whereClause = "WHERE " + condition.join(" AND ");

            const sql = `SELECT mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, mh.MaDM, mh.MaHSX
                        FROM MoHinh mh
                        INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                        ${whereClause}
                        LIMIT 50`;
            const [data] = await db.query(sql, value);
            
            res.status(200).json({ 
                success: true, 
                data: data 
            });
        } 
        catch (error) {
            console.error("Lỗi tìm kiếm sản phẩm: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi tìm kiếm sản phẩm" });
        }
    },

    thong_ke_khuyen_mai: async(req, res) => {
        try {
            const sql_km = `
                SELECT 
                    (SELECT COUNT(*) FROM KhuyenMai) as Total,
                    (SELECT COUNT(*) FROM KhuyenMai WHERE ThoiGianBD <= NOW() AND ThoiGianKT >= NOW() AND TrangThaiHoatDong = 1) as Active,
                    (SELECT COUNT(*) FROM LogSuDungKhuyenMai) as TotalUsage,
                    (SELECT COUNT(DISTINCT ctkm.MaPhanLoai) 
                     FROM ChiTietKhuyenMai ctkm 
                     INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM 
                     WHERE km.ThoiGianBD <= NOW() AND km.ThoiGianKT >= NOW() AND km.TrangThaiHoatDong = 1) as TotalProducts
            `;
            const [stat_km] = await db.query(sql_km);

            // FIX: Sửa TrangThaiHoatDong thành TrangThai, thêm điều kiện SoLuongDaDung
            const sql_gg = `
                SELECT 
                    (SELECT COUNT(*) FROM MaGiamGia) as Total,
                    (SELECT COUNT(*) FROM MaGiamGia WHERE ThoiGianBD <= NOW() AND ThoiGianKT >= NOW() AND TrangThai = 1 AND SoLuongDaDung < SoLuongDungToiDa) as Active,
                    (SELECT COUNT(*) FROM LogSuDungMaGiamGia) as TotalUsage,
                    (SELECT IFNULL(AVG(ChietKhau), 0) FROM MaGiamGia WHERE LoaiGiamGia = 'PhanTram') as AvgPercent,
                    (SELECT IFNULL(AVG(ChietKhau), 0) FROM MaGiamGia WHERE LoaiGiamGia = 'TienMat') as AvgCash
            `;
            const [stat_gg] = await db.query(sql_gg);

            res.status(200).json({
                success: true,
                data: {
                    promotion: {
                        total: stat_km[0].Total,
                        active: stat_km[0].Active,
                        usage: stat_km[0].TotalUsage,
                        totalProducts: stat_km[0].TotalProducts
                    },
                    voucher: {
                        total: stat_gg[0].Total,
                        active: stat_gg[0].Active,
                        usage: stat_gg[0].TotalUsage,
                        avgPercent: Math.round(stat_gg[0].AvgPercent),
                        avgCash: Math.round(stat_gg[0].AvgCash)
                    }
                }
            });
        } 
        catch (error) {
            console.error("Lỗi khi lấy thống kê: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy thống kê" });
        }
    },

    xuat_bao_cao_khuyen_mai: async (req, res) => {
        try {
            const MaKM = req.params.id;
            const MaTK = req.user.id;
            const sql_tt = `SELECT TenKM FROM KhuyenMai WHERE MaKM = ?`;
            const [result_tt] = await db.query(sql_tt, [MaKM]);
            
            if(result_tt.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Không tìm thấy chương trình!" 
                });
            }
            const tenChienDich = result_tt[0].TenKM;
            const sql_log = `SELECT 
                                log.MaLichSu, dh.MaDonHangHienThi, 
                                COALESCE(kh.TenKH, dh.TenNguoiNhan) AS TenKhachHang, 
                                log.SoTienDaGiam, log.ThoiGianSuDung
                            FROM LogSuDungKhuyenMai log
                            INNER JOIN DonHang dh ON dh.MaDH = log.MaDH
                            LEFT JOIN KhachHang kh ON kh.MaKH = log.MaKH
                            WHERE log.MaKM = ?
                            ORDER BY log.ThoiGianSuDung DESC`;
            const [logs] = await db.query(sql_log, [MaKM]);
            const workbook = new excel.Workbook();
            workbook.creator = 'Admin System';
            const worksheet = workbook.addWorksheet('Lịch sử áp dụng');

            worksheet.columns = [
                { header: 'Mã Lịch Sử', key: 'maLS', width: 15 },
                { header: 'Tên Khách Hàng', key: 'tenKH', width: 30 },
                { header: 'Mã Đơn Hàng', key: 'maDH', width: 20 },
                { header: 'Số Tiền Đã Giảm (VNĐ)', key: 'soTien', width: 25 },
                { header: 'Thời Gian Sử Dụng', key: 'thoiGian', width: 25 }
            ];

            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            logs.forEach(log => {
                const date = new Date(log.ThoiGianSuDung);
                const formattedDate = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

                worksheet.addRow({
                    maLS: `#${log.MaLichSu}`,
                    tenKH: log.TenKhachHang,
                    maDH: `#${log.MaDonHangHienThi}`,
                    soTien: Number(log.SoTienDaGiam), 
                    thoiGian: formattedDate
                });
            });

            worksheet.getColumn('soTien').numFmt = '#,##0';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            const safeFileName = tenChienDich.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename=Bao_Cao_${safeFileName}.xlsx`);

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            const TenKM = result_tt[0].TenKM;
            await db.query(`INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) VALUES (?, 'PROMOTION_REPORT', ?, ?, NOW())`, 
                [MaTK, `Xuất báo cáo chương trình khuyến mãi #${MaKM}: "${TenKM}"`, userIp]);

            await workbook.xlsx.write(res);
            res.status(200).end();

        } 
        catch (error) {
            console.error("Lỗi khi xuất file Excel: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi tạo báo cáo!" });
        }
    },
    xuat_bao_cao_voucher: async (req, res) => {
        try {
            const MaGG = req.params.id;
            const MaTK = req.user.id;
            const sql_tt = `SELECT TenMaGiamGia, MaVoucher FROM MaGiamGia WHERE MaGG = ?`;
            const [result_tt] = await db.query(sql_tt, [MaGG]);
            
            if(result_tt.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá!" });
            }
            const tenChienDich = `${result_tt[0].MaVoucher}_${result_tt[0].TenMaGiamGia}`;
            const sql_log = `SELECT 
                                log.MaLichSu, dh.MaDonHangHienThi, 
                                COALESCE(kh.TenKH, dh.TenNguoiNhan) AS TenKhachHang, 
                                log.SoTienDaGiam, log.ThoiGianSuDung
                            FROM LogSuDungMaGiamGia log
                            INNER JOIN DonHang dh ON dh.MaDH = log.MaDH
                            LEFT JOIN KhachHang kh ON kh.MaKH = log.MaKH
                            WHERE log.MaGG = ?
                            ORDER BY log.ThoiGianSuDung DESC`;
            const [logs] = await db.query(sql_log, [MaGG]);
            const workbook = new excel.Workbook();
            workbook.creator = 'Admin System';
            const worksheet = workbook.addWorksheet('Lịch sử Voucher');

            worksheet.columns = [
                { header: 'Mã Lịch Sử', key: 'maLS', width: 15 },
                { header: 'Tên Khách Hàng', key: 'tenKH', width: 30 },
                { header: 'Mã Đơn Hàng', key: 'maDH', width: 20 },
                { header: 'Số Tiền Đã Giảm (VNĐ)', key: 'soTien', width: 25 },
                { header: 'Thời Gian Sử Dụng', key: 'thoiGian', width: 25 }
            ];

            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } }; // Nền tím phân biệt với Khuyến mãi
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            logs.forEach(log => {
                const date = new Date(log.ThoiGianSuDung);
                const formattedDate = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

                worksheet.addRow({
                    maLS: `#${log.MaLichSu}`,
                    tenKH: log.TenKhachHang,
                    maDH: `#${log.MaDonHangHienThi}`,
                    soTien: Number(log.SoTienDaGiam), 
                    thoiGian: formattedDate
                });
            });

            worksheet.getColumn('soTien').numFmt = '#,##0';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            const safeFileName = tenChienDich.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename=Bao_Cao_Voucher_${safeFileName}.xlsx`);

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            const TenGG = result_tt[0].TenMaGiamGia;
            await db.query(`INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) VALUES (?, 'VOUCHER_REPORT', ?, ?, NOW())`, 
                [MaTK, `Xuất báo cáo chương trình mã giảm giá #${MaGG}: "${TenGG}"`, userIp]);

            await workbook.xlsx.write(res);
            res.status(200).end();

        } 
        catch (error) {
            console.error("Lỗi khi xuất file Excel Voucher: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi tạo báo cáo!" });
        }
    },

    lay_nhat_ky_hoat_dong: async(req, res) => {
        try {
            // Lấy 4 dòng mới nhất để hiển thị ở màn hình Dashboard thu gọn
            // Dùng COALESCE để lấy HoTen, nếu không có thì lấy TenDN, nếu vẫn không có thì hiện 'Admin'
            const sql = `
                SELECT 
                    log.*, 
                    COALESCE(nv.TenNV, tk.TenDN, 'Admin') AS NguoiThucHien 
                FROM LogHoatDongTaiKhoan log
                inner JOIN TaiKhoan tk ON log.MaTK = tk.MaTK
                inner join NhanVien nv on nv.MaTK = tk.MaTK
                WHERE log.LoaiLog LIKE 'PROMOTION_%' OR log.LoaiLog LIKE 'VOUCHER_%'
                ORDER BY log.ThoiGian DESC 
                LIMIT 4
            `;
            const [logs] = await db.query(sql);
            
            res.status(200).json({ 
                success: true, 
                data: logs 
            });
        } 
        catch (error) {
            console.error("Lỗi khi lấy nhật ký hoạt động thu gọn: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi máy chủ khi tải nhật ký!" 
            });
        }
    },

    lay_tat_ca_log_phan_trang: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10; 
            const offset = (page - 1) * limit;

            // Điều kiện lọc chung cho cả lệnh Đếm và lệnh Lấy danh sách
            const whereClause = `WHERE LoaiLog LIKE 'PROMOTION_%' OR LoaiLog LIKE 'VOUCHER_%'`;

            const sql_count = `SELECT COUNT(*) AS total FROM LogHoatDongTaiKhoan ${whereClause}`;
            
            const sql_ds = `
                SELECT 
                    log.*, 
                    COALESCE(tk.HoTen, tk.TenDN, 'Admin') AS NguoiThucHien 
                FROM LogHoatDongTaiKhoan log
                LEFT JOIN TaiKhoan tk ON log.MaTK = tk.MaTK
                ${whereClause}
                ORDER BY log.ThoiGian DESC 
                LIMIT ? OFFSET ?
            `;

            // CHẠY SONG SONG TỐI ƯU TỐC ĐỘ
            const [[countResult], [logs]] = await Promise.all([
                db.query(sql_count),
                db.query(sql_ds, [limit, offset])
            ]);

            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            res.status(200).json({
                success: true, 
                data: logs,
                pagination: { 
                    currentPage: page, 
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage 
                }
            });
        } 
        catch (error) {
            console.error("Lỗi khi lấy nhật ký hoạt động phân trang: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ khi tải nhật ký!" 
            });
        }
    }
}
module.exports = khuyenmai;