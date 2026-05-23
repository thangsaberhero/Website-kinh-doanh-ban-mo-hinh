const db = require('../../config/db');
const excel = require('exceljs');

const khuyenmai = {
    liet_ke_chuong_trinh_khuyen_mai: async(req, res) =>{
        try{
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;

            const offset = (page - 1) * limit;

            const {keyword, 
                trangthai
            } = req.query;
            
            let condition = [];
            let value = [];

            if(keyword){
                condition.push("TenKM COLLATE utf8mb4_unicode_ci like ?");
                value.push(`%${keyword}%`);
            }

            if(trangthai){
                if(trangthai === 'DangChay'){
                    condition.push("km.ThoiGianBD <= NOW() and km.ThoiGianKT >= NOW()");
                }
                else if(trangthai === 'SapToi'){
                    condition.push("km.ThoiGianBD > NOW()");
                }
                else if(trangthai === 'HetHan'){
                    condition.push("km.ThoiGianKT < NOW()");
                }
            }
            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";
            const sql_core = `Select km.MaKM, km.TenKM, km.ThoiGianBD, km.ThoiGianKT, km.TrangThaiHoatDong, Count(log.MaLichSu) as SoLuotDung
                                from KhuyenMai km
                                left join LogSuDungKhuyenMai log on km.MaKM = log.MaKM
                                ${whereClause}
                                group by km.MaKM`;
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count,value);
            const totalItems = countResult[0].total;
            //Làm tròn lên
            const totalPage = Math.ceil(totalItems/limit);
            const sql_ds = `${sql_core}
                order by km.MaKM DESC, km.ThoiGianBD DESC
                Limit ? offset ?`;


            const sql_params = [...value, limit, offset]
            const [chuongtrinh] = await db.query(sql_ds, sql_params);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách chương trình khuyến mãi thành công!",
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
            console.error("Xảy ra lỗi khi lấy danh sách chương trình khuyến mãi: " + error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy danh sách chương trình khuyến mãi!"
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
            const page_sp = parseInt(req.query.page_sp) || 1;
            const limit_sp = parseInt(req.query.limit_sp) || 10;
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
            const page_log = parseInt(req.query.page_log) || 1;
            const limit_log = parseInt(req.query.limit_log) || 10;
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
                condition_log.push("log.MaDH = ?")
                value_log.push(ma_dh);
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
                SELECT log.MaLichSu, log.MaKH, kh.TenKH, log.MaDH, log.SoTienDaGiam, log.ThoiGianSuDung
                FROM LogSuDungKhuyenMai log
                inner join KhachHang kh on kh.MaKh = log.MaKH
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

    them_chuong_trinh_khuyen_mai: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong, danhsachchitiet} = req.body;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const sql_them_khuyen_mai = `Insert into KhuyenMai(TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong)
                                        values(?, ?, ?, ?)`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [them_khuyen_mai] = await connection.query(sql_them_khuyen_mai, [TenKM, ThoiGianBD, ThoiGianKT, isVisible]);
            const maKM = them_khuyen_mai.insertId;
            const sql_them_chi_tiet = `Insert into ChiTietKhuyenMai
                                        (MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM)
                                        values
                                        (?, ?, ?, ?, ?, ?)`;
            if(danhsachchitiet && danhsachchitiet !== 'undefined'){
                const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                if(Array.isArray(ds_km) && ds_km.length>0){
                    for(let detail of ds_km){
                        await connection.query(sql_them_chi_tiet, [
                            maKM, detail.MaPhanLoai, detail.LoaiGiamGia,
                            detail.ChietKhau, detail.GiaTriGiamToiDa, detail.SoLuongKM
                        ]);
                    }
                }
            }
            await connection.query(
                `INSERT INTO LogHoatDongKhuyenMai (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã tạo chương trình khuyến mãi mới: "${TenKM}"`]
            );
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm chương trình khuyến mãi mới thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác thêm chương trình khuyến mãi: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi thêm chương trình khuyến mãi!"
            });
        }
        finally{
            connection.release();
        }
    },

    sua_chuong_trinh_khuyen_mai: async(req, res)=>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const MaKM = req.params.id;
            const {TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong, danhsachchitiet} = req.body;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const sql_sua_khuyen_mai = `Update KhuyenMai set TenKM = ?, ThoiGianBD = ?, ThoiGianKT = ?, TrangThaiHoatDong = ?
                                        where MaKM = ?`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [sua_khuyen_mai] = await connection.query(sql_sua_khuyen_mai, [TenKM, ThoiGianBD, ThoiGianKT, isVisible, MaKM]);
            if(danhsachchitiet && danhsachchitiet !== 'undefined'){
                await connection.query('Delete from ChiTietKhuyenMai where MaKM = ?', [MaKM]);
                const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                const sql_them_chi_tiet = `Insert into ChiTietKhuyenMai
                                    (MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM)
                                    values
                                    (?, ?, ?, ?, ?, ?)`;
                if(Array.isArray(ds_km) && ds_km.length>0){
                    for(let detail of ds_km){
                        if(detail.MaPhanLoai)
                        await connection.query(sql_them_chi_tiet, [
                            MaKM, detail.MaPhanLoai, detail.LoaiGiamGia,
                            detail.ChietKhau, detail.GiaTriGiamToiDa, detail.SoLuongKM
                        ]);
                    }
                }
            }
            await connection.query(
                `INSERT INTO LogHoatDongKhuyenMai (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã cập nhật thông tin của chương trình khuyến mãi: "${TenKM}"`]
            );
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin chương trình khuyến mãi mới thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác sửa thông tin chương trình khuyến mãi: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi sửa thông tin chương trình khuyến mãi!"
            });
        }
        finally{
            connection.release();
        }
    },

    liet_ke_ma_giam_gia: async(req, res) =>{
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const offset = (page - 1) * limit;

            const {keyword, 
                trangthai, ma
            } = req.query;
            
            let condition = [];
            let value = [];

            if(keyword){
                condition.push("gg.TenMaGiamGia like ?");
                value.push(`%${keyword}%`);
            }

            if(trangthai){
                if(trangthai === 'DangChay'){
                    condition.push("gg.ThoiGianBD <= NOW() and gg.ThoiGianKT >= NOW()");
                }
                else if(trangthai === 'SapToi'){
                    condition.push("gg.ThoiGianBD > NOW()");
                }
                else if(trangthai === 'HetHan'){
                    condition.push("gg.ThoiGianKT < NOW()");
                }
            }

            if(ma){
                condition.push("gg.MaVoucher = ?");
                value.push(ma);
            }

            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";
            const sql_core = `Select gg.*, Count(log.MaLichSu) as SoLuotDung
                                from MaGiamGia gg
                                left join LogSuDungMaGiamGia log on gg.MaGG = log.MaGG
                                ${whereClause}
                                group by gg.MaGG`;
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count,value);
            const totalItems = countResult[0].total;
            //Làm tròn lên
            const totalPage = Math.ceil(totalItems/limit);
            const sql_ds = `${sql_core}
                order by gg.MaGG DESC, gg.ThoiGianBD DESC
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
            const page_sp = parseInt(req.query.page_sp) || 1;
            const limit_sp = parseInt(req.query.limit_sp) || 10;
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
            const page_log = parseInt(req.query.page_log) || 1;
            const limit_log = parseInt(req.query.limit_log) || 10;
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
                condition_log.push("log.MaDH = ?")
                value_log.push(ma_dh);
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
                SELECT log.MaLichSu, log.MaKH, log.MaDH, kh.TenKH, log.SoTienDaGiam, log.ThoiGianSuDung
                FROM LogSuDungMaGiamGia log
                inner join KhachHang kh on kh.MaKH= log.MaKH
                WHERE log.MaGG = ?
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

    them_ma_giam_gia: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                ThoiGianBD, ThoiGianKT, MaKH, MucGiaToiThieu,
                TrangThaiHoatDong, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, danhsachchitiet} = req.body;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const sql_them_ma_gg = `Insert into MaGiamGia
                                        (TenMaGiamGia, MaVoucher, SoLuongDungToiDa, ThoiGianBD,
                                        ThoiGianKT, MaKH, MucGiaToiThieu, TrangThaiHoatDong,
                                        LoaiGiamGia, ChietKhau, GiaTriGiamToiDa)
                                        values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [them_ma_gg] = await connection.query(sql_them_ma_gg, [TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                                                                        ThoiGianBD, ThoiGianKT, MaKH || null, MucGiaToiThieu,
                                                                        isVisible, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa]);
            const maGG = them_ma_gg.insertId;
            const sql_them_chi_tiet = `Insert into ChiTietMaGiamGia
                                        (MaGG, MaPhanLoai)
                                        values
                                        (?, ?)`;
            if(danhsachchitiet && danhsachchitiet !== 'undefined'){
                const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                if(Array.isArray(ds_km) && ds_km.length>0){
                    for(let detail of ds_km){
                        await connection.query(sql_them_chi_tiet, [
                            maGG, detail.MaMoHinh
                        ]);
                    }
                }
            }
            await connection.query(
                `INSERT INTO LogHoatDongKhuyenMai (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã tạo chương trình mã giảm giá mới: "${TenMaGiamGia}"`]
            );
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm mã giảm giá mới thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác thêm mã giảm giá: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi thêm mã giảm giá!"
            });
        }
        finally{    
            connection.release();
        }
    },

    sua_ma_giam_gia: async(req, res)=>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const MaGG = req.params.id;
            const {TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                ThoiGianBD, ThoiGianKT, MaKH, MucGiaToiThieu,
                TrangThaiHoatDong, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, danhsachchitiet} = req.body;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const sql_sua_ma_gg = `Update MaGiamGia set
                                        TenMaGiamGia = ?, MaVoucher = ?, SoLuongDungToiDa = ?, ThoiGianBD = ?,
                                        ThoiGianKT = ?, MaKH = ?, MucGiaToiThieu = ?, TrangThaiHoatDong = ?,
                                        LoaiGiamGia = ?, ChietKhau = ?, GiaTriGiamToiDa = ? where MaGG = ?`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [sua_khuyen_mai] = await connection.query(sql_sua_ma_gg, [TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                                                                        ThoiGianBD, ThoiGianKT, MaKH || null, MucGiaToiThieu,
                                                                        isVisible, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, MaGG]);
            if(danhsachchitiet && danhsachchitiet !== 'undefined'){
                await connection.query('Delete from ChiTietMaGiamGia where MaGG = ?', [MaGG]);
                const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                const sql_them_chi_tiet = `Insert into ChiTietMaGiamGia
                                    (MaGG, MaPhanLoai)
                                    values
                                    (?, ?)`;
                if(Array.isArray(ds_km) && ds_km.length>0){
                    for(let detail of ds_km){
                        if(detail.MaMoHinh)
                        await connection.query(sql_them_chi_tiet, [
                            MaGG, detail.MaMoHinh
                        ]);
                    }
                }
            }
            await connection.query(
                `INSERT INTO LogHoatDongKhuyenMai (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã cập nhật thông tin của chương trình mã giảm giá: "${TenMaGiamGia}"`]
            );
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin mã giảm giá thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác sửa thông tin mã giảm giá: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi sửa thông tin mã giảm giá!"
            });
        }
        finally{
            connection.release();
        }
    },
    xoa_chuong_trinh_khuyen_mai: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaKM = req.params.id;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const [logs] = await connection.query('SELECT 1 FROM LogSuDungKhuyenMai WHERE MaKM = ? LIMIT 1', [MaKM]);
            
            if (logs.length > 0) {
                await connection.query('UPDATE KhuyenMai SET TrangThaiHoatDong = 0 WHERE MaKM = ?', [MaKM]);
                await connection.commit();
                return res.status(200).json({ 
                    success: true, 
                    isSoftDeleted: true,
                    message: "Chiến dịch này đã có người sử dụng. Hệ thống đã tự động chuyển sang trạng thái Ngừng Hoạt Động thay vì xóa để bảo toàn dữ liệu kế toán." 
                });
            }

            await connection.query('DELETE FROM ChiTietKhuyenMai WHERE MaKM = ?', [MaKM]);
            await connection.query('DELETE FROM KhuyenMai WHERE MaKM = ?', [MaKM]);
            await connection.query(
                `INSERT INTO LogHoatDongKhuyenMai (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã xóa chương trình khuyến mãi: "${MaKM}"`]
            );
            await connection.commit();
            res.status(200).json({ 
                success: true, 
                isSoftDeleted: false, 
                message: "Đã xóa chương trình khuyến mãi vĩnh viễn." 
            });
        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi xóa khuyến mãi: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ khi thao tác xóa." 
            });
        } 
        finally {
            connection.release();
        }
    },

    xoa_ma_giam_gia: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaGG = req.params.id;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const [logs] = await connection.query('SELECT 1 FROM LogSuDungMaGiamGia WHERE MaGG = ? LIMIT 1', [MaGG]);
            
            if (logs.length > 0) {
                await connection.query('UPDATE MaGiamGia SET TrangThaiHoatDong = 0 WHERE MaGG = ?', [MaGG]);
                await connection.commit();
                return res.status(200).json({ 
                    success: true, 
                    isSoftDeleted: true,
                    message: "Mã giảm giá này đã có người sử dụng. Hệ thống đã tự động chuyển sang trạng thái Ngừng Hoạt Động thay vì xóa để bảo toàn dữ liệu kế toán." 
                });
            }
            await connection.query('DELETE FROM ChiTietMaGiamGia WHERE MaGG = ?', [MaGG]);
            await connection.query('DELETE FROM MaGiamGia WHERE MaGG = ?', [MaGG]);
            await connection.query(
                `INSERT INTO LogHoatDongKhuyenMai (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã xóa chương trình mã giảm giá: "${MaGG}"`]
            );
            await connection.commit();
            res.status(200).json({ 
                success: true, 
                isSoftDeleted: false, 
                message: "Đã xóa mã giảm giá vĩnh viễn." 
            });
        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi xóa mã giảm giá: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ khi thao tác xóa." 
            });
        } 
        finally {
            connection.release();
        }
    },
    
    them_sp_km: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { DanhSachMaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM } = req.body;
            const MaKM = req.params.id;

            if (!DanhSachMaPhanLoai || !Array.isArray(DanhSachMaPhanLoai) || DanhSachMaPhanLoai.length === 0) {
                return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 sản phẩm' });
            }

            const [currentKM] = await connection.query('SELECT ThoiGianBD, ThoiGianKT FROM KhuyenMai WHERE MaKM = ?', [MaKM]);
            if (currentKM.length === 0) {
                return res.status(404).json({ success: false, message: 'Chương trình khuyến mãi không tồn tại' });
            }
            const { ThoiGianBD, ThoiGianKT } = currentKM[0];

            const placeholders = DanhSachMaPhanLoai.map(() => '?').join(',');
            const sqlCheckOverlap = `
                SELECT ct.MaPhanLoai, km.TenKM 
                FROM ChiTietKhuyenMai ct
                JOIN KhuyenMai km ON ct.MaKM = km.MaKM
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

            const giaTriGiamToiDa = (GiaTriGiamToiDa === undefined || GiaTriGiamToiDa === null) ? null : GiaTriGiamToiDa;
            const soLuongKM = (SoLuongKM === undefined || SoLuongKM === null) ? 1 : SoLuongKM;
            
            const values = DanhSachMaPhanLoai.map(MaPhanLoai => [
                MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, giaTriGiamToiDa, soLuongKM
            ]);

            const sqlInsert = `INSERT IGNORE INTO ChiTietKhuyenMai (MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM) VALUES ?`;
            const [result] = await connection.query(sqlInsert, [values]);

            await connection.commit();
            res.status(200).json({ 
                success: true, 
                message: `Đã thêm thành công ${result.affectedRows} sản phẩm vào chiến dịch` 
            });
        } 
        catch (error) {
            await connection.rollback();
            console.error('Lỗi API them_sp_km:', error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thêm sản phẩm" });
        } 
        finally {
            connection.release();
        }
    },

    xoa_sp_km: async(req, res) => {
        try {
            await db.query(`DELETE FROM ChiTietKhuyenMai WHERE MaKM = ? AND MaPhanLoai = ?`, [req.params.id, req.params.maPhanLoai]);
            res.status(200).json({ success: true });
        } 
        catch (error) { 
            res.status(500).json({ 
                success: false 
            }); 
        }
    },

    them_sp_voucher: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { DanhSachMaPhanLoai } = req.body;  
            const MaGG = req.params.id;

            if (!DanhSachMaPhanLoai || !Array.isArray(DanhSachMaPhanLoai) || DanhSachMaPhanLoai.length === 0) {
                return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 sản phẩm' });
            }

            let addedCount = 0;
            const sql_insert = `INSERT INTO ChiTietMaGiamGia (MaGG, MaPhanLoai) VALUES (?, ?)`;

            for (const MaPhanLoai of DanhSachMaPhanLoai) {
                const [existing] = await connection.query('SELECT 1 FROM ChiTietMaGiamGia WHERE MaGG = ? AND MaPhanLoai = ?', [MaGG, MaPhanLoai]);
                
                if (existing.length === 0) {
                    await connection.query(sql_insert, [MaGG, MaPhanLoai]);
                    addedCount++;
                }
            }

            await connection.commit();
            res.status(200).json({ 
                success: true,
                message: `Đã thêm thành công ${addedCount} sản phẩm vào Voucher` 
            });
        } 
        catch (error) { 
            await connection.rollback();
            console.error("Lỗi API them_sp_voucher:", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ khi thêm sản phẩm vào Voucher" 
            }); 
        } 
        finally {
            connection.release();
        }
    },

    xoa_sp_voucher: async(req, res) => {
        try {
            await db.query(
                `DELETE FROM ChiTietMaGiamGia WHERE MaGG = ? AND MaPhanLoai = ?`,
                [req.params.id, req.params.maPhanLoai]
            );
            res.status(200).json({ 
                success: true 
            });
        } 
        catch (error) { 
            res.status(500).json({ 
                success: false 
            }); 
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
            const sql_km = `SELECT (SELECT COUNT(*) FROM KhuyenMai) as Total,
                            (SELECT COUNT(*) FROM KhuyenMai WHERE ThoiGianBD <= NOW() AND ThoiGianKT >= NOW() AND TrangThaiHoatDong = 1) as Active,
                            (SELECT COUNT(*) FROM LogSuDungKhuyenMai) as TotalUsage,
                            (SELECT COUNT(DISTINCT ctkm.MaPhanLoai) 
                            FROM ChiTietKhuyenMai ctkm 
                            INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM 
                            WHERE km.ThoiGianBD <= NOW() AND km.ThoiGianKT >= NOW() AND km.TrangThaiHoatDong = 1) as TotalProducts`;
            const [stat_km] = await db.query(sql_km);

            const sql_gg = `SELECT (SELECT COUNT(*) FROM MaGiamGia) as Total,
                            (SELECT COUNT(*) FROM MaGiamGia WHERE ThoiGianBD <= NOW() AND ThoiGianKT >= NOW() AND TrangThaiHoatDong = 1) as Active,
                            (SELECT COUNT(*) FROM LogSuDungMaGiamGia) as TotalUsage,
                            (SELECT IFNULL(AVG(ChietKhau), 0) FROM MaGiamGia WHERE LoaiGiamGia = 'PhanTram') as AvgPercent,
                            (SELECT IFNULL(AVG(ChietKhau), 0) FROM MaGiamGia WHERE LoaiGiamGia = 'TienMat') as AvgCash`;
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
            res.status(500).json({ 
                message: "Lỗi máy chủ khi lấy thống kê" 
            });
        }
    },
    xuat_bao_cao_khuyen_mai: async (req, res) => {
        try {
            const MaKM = req.params.id;
            const sql_tt = `SELECT TenKM FROM KhuyenMai WHERE MaKM = ?`;
            const [result_tt] = await db.query(sql_tt, [MaKM]);
            
            if(result_tt.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Không tìm thấy chương trình!" 
                });
            }
            const tenChienDich = result_tt[0].TenKM;
            const sql_log = `SELECT log.MaLichSu, log.MaDH, kh.TenKH, log.SoTienDaGiam, log.ThoiGianSuDung
                            FROM LogSuDungKhuyenMai log
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
                { header: 'Mã Đơn Hàng', key: 'maDH', width: 15 },
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
                    tenKH: log.TenKH || 'Khách ẩn danh',
                    maDH: `#${log.MaDH}`,
                    soTien: Number(log.SoTienDaGiam), 
                    thoiGian: formattedDate
                });
            });

            worksheet.getColumn('soTien').numFmt = '#,##0';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            const safeFileName = tenChienDich.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename=Bao_Cao_${safeFileName}.xlsx`);

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
            const sql_tt = `SELECT TenMaGiamGia, MaVoucher FROM MaGiamGia WHERE MaGG = ?`;
            const [result_tt] = await db.query(sql_tt, [MaGG]);
            
            if(result_tt.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá!" });
            }
            const tenChienDich = `${result_tt[0].MaVoucher}_${result_tt[0].TenMaGiamGia}`;
            const sql_log = `SELECT log.MaLichSu, log.MaDH, kh.TenKH, log.SoTienDaGiam, log.ThoiGianSuDung
                            FROM LogSuDungMaGiamGia log
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
                { header: 'Mã Đơn Hàng', key: 'maDH', width: 15 },
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
                    tenKH: log.TenKH || 'Khách ẩn danh',
                    maDH: `#${log.MaDH}`,
                    soTien: Number(log.SoTienDaGiam), 
                    thoiGian: formattedDate
                });
            });

            worksheet.getColumn('soTien').numFmt = '#,##0';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            const safeFileName = tenChienDich.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename=Bao_Cao_Voucher_${safeFileName}.xlsx`);

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
            const sql = `SELECT * FROM LogHoatDongKhuyenMai ORDER BY ThoiGian DESC LIMIT 4`;
            const [logs] = await db.query(sql);
            res.status(200).json({ 
                success: true, 
                data: logs 
            });
        } 
        catch (error) {
            res.status(500).json({ 
                success: false,
                message: "Lỗi máy chủ!" 
            });
        }
    },

    lay_tat_ca_log_phan_trang: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10; 
            const offset = (page - 1) * limit;

            const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM LogHoatDongKhuyenMai`);
            const totalPage = Math.ceil(countResult[0].total / limit);

            const [logs] = await db.query(
                `SELECT * FROM LogHoatDongKhuyenMai ORDER BY ThoiGian DESC LIMIT ? OFFSET ?`,
                [limit, offset]
            );

            res.status(200).json({
                success: true, data: logs,
                pagination: { currentPage: page, totalPage: totalPage }
            });
        } 
        catch (error) {
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ!" 
            });
        }
    }
}
module.exports = khuyenmai;