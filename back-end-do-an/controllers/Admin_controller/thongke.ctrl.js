const db = require('../../config/db');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const thongke = {
    thongkedoanhthu: async (req,res) => {
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;

            let wherecondition = ["cttt.MaTrangThai = 4"]; // Trạng thái 4 = Đã giao
            let value = [];

            if(NgayBatDau){
                wherecondition.push("dh.NgayLapDon >= ?");
                value.push(`${NgayBatDau} 00:00:00`);
            }
            if(NgayKetThuc){
                wherecondition.push("dh.NgayLapDon <= ?");
                value.push(`${NgayKetThuc} 23:59:59`);
            }

            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql_core = `
                SELECT 
                    COUNT(DISTINCT dh.MaDH) as TongSoDonHang,
                    IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as TongDoanhThu,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan
                FROM DonHang dh
                INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH
                INNER JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai
                INNER JOIN MoHinh mh ON mh.MaMoHinh = pl.MaMoHinh
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                ${whereClause}
            `;
            const [result] = await db.query(sql_core, value);
            
            res.status(200).json({
                success: true,
                message: "Thống kê dữ liệu bán hàng thành công!",
                data: {
                    TongSoDonHang: result[0].TongSoDonHang || 0,
                    TongDoanhThu: result[0].TongDoanhThu || 0,
                    TongLoiNhuan: result[0].TongLoiNhuan || 0
                }
            });
        }
        catch (error){
            console.error("Lỗi khi thống kê doanh thu: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thống kê dữ liệu!" });
        }
    },

    thongkesanpham: async(req, res) =>{
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;

            let wherecondition = ["cttt.MaTrangThai = 4"];
            let value = [];

            if(NgayBatDau){
                wherecondition.push("dh.NgayLapDon >= ?");
                value.push(`${NgayBatDau} 00:00:00`);
            }
            if(NgayKetThuc){
                wherecondition.push("dh.NgayLapDon <= ?");
                value.push(`${NgayKetThuc} 23:59:59`);
            }

            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql_mh = `
                SELECT mh.MaMoHinh, mh.TenMH,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan,
                    IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                ${whereClause}
                GROUP BY mh.MaMoHinh, mh.TenMH
                ORDER BY TongSoSP DESC
                LIMIT 10
            `;
            const [result_mh] = await db.query(sql_mh, value);    

            const sql_dm = `
                SELECT dm.MaDM, dm.TenDM,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan,
                    IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP
                FROM DanhMuc dm
                INNER JOIN MoHinh mh ON mh.MaDM = dm.MaDM
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                ${whereClause}
                GROUP BY dm.MaDM, dm.TenDM
                ORDER BY TongSoSP DESC
                LIMIT 10
            `;
            const [result_dm] = await db.query(sql_dm, value);   

            const sql_ctdm = `
                SELECT ctdm.MaChiTietDM, ctdm.TenChiTietDM,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan,
                    IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP
                FROM ChiTietDanhMuc ctdm
                INNER JOIN MoHinh mh ON mh.MaChiTietDM = ctdm.MaChiTietDM
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                ${whereClause}
                GROUP BY ctdm.MaChiTietDM, ctdm.TenChiTietDM
                ORDER BY TongSoSP DESC
                LIMIT 10
            `;
            const [result_ctdm] = await db.query(sql_ctdm, value);   

            const sql_hsx = `
                SELECT hsx.MaHSX, hsx.TenHSX,
                    IFNULL(SUM((ctdh.DonGiaBan - mh.GiaNhap) * ctdh.SoLuong), 0) as TongLoiNhuan,
                    IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP
                FROM HangSanXuat hsx
                INNER JOIN MoHinh mh ON mh.MaHSX = hsx.MaHSX
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                ${whereClause}
                GROUP BY hsx.MaHSX, hsx.TenHSX
                ORDER BY TongSoSP DESC
                LIMIT 10
            `;
            const [result_hsx] = await db.query(sql_hsx, value);   

            res.status(200).json({
                success: true,
                message: "Thống kê dữ liệu sản phẩm thành công!",
                data: {
                    topMoHinh: result_mh,
                    topDanhMuc: result_dm,
                    topChiTietDM: result_ctdm,
                    topHSX: result_hsx
                }
            });
        }
        catch (error){
            console.error("Lỗi khi thống kê dữ liệu sản phẩm: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thống kê dữ liệu sản phẩm!" });
        }
    },

    thongkehieuquakhuyenmai: async(req,res) =>{
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;
            let wherecondition = ["cttt.MaTrangThai = 4"];
            let value = [];

            if(NgayBatDau){ wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc){ wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }

            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql_km = `
                SELECT km.MaKM, km.TenKM,
                    IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam,
                    COUNT(DISTINCT log.MaDH) as TongDonHang,
                    IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong
                FROM KhuyenMai km
                INNER JOIN LogSuDungKhuyenMai log ON km.MaKM = log.MaKM
                INNER JOIN DonHang dh ON dh.MaDH = log.MaDH
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                INNER JOIN (
                    SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - ctdh.GiaNhapThucTe) * ctdh.SoLuong) as LoiNhuanGoc
                    FROM ChiTietDonHang ctdh
                    GROUP BY ctdh.MaDH
                ) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH
                ${whereClause}
                GROUP BY km.MaKM, km.TenKM
                ORDER BY TongDonHang DESC
            `;
            const [result_km] = await db.query(sql_km, value);

            const sql_magg = `
                SELECT ma.MaGG, ma.TenMaGiamGia,
                    IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam,
                    COUNT(DISTINCT log.MaDH) as TongDonHang,
                    IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong
                FROM MaGiamGia ma
                INNER JOIN LogSuDungMaGiamGia log ON ma.MaGG = log.MaGG
                INNER JOIN DonHang dh ON dh.MaDH = log.MaDH
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                INNER JOIN (
                    SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - ctdh.GiaNhapThucTe) * ctdh.SoLuong) as LoiNhuanGoc
                    FROM ChiTietDonHang ctdh
                    GROUP BY ctdh.MaDH
                ) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH
                ${whereClause}
                GROUP BY ma.MaGG, ma.TenMaGiamGia
                ORDER BY TongDonHang DESC
            `;
            const [result_magg] = await db.query(sql_magg, value);

            res.status(200).json({
                success: true,
                message: "Thống kê dữ liệu khuyến mãi thành công!",
                data: { topkm: result_km, topmagg: result_magg }
            });
        }
        catch (error){
            console.error("Lỗi khi thống kê khuyến mãi: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thống kê khuyến mãi!" });
        }
    },

    thongkedonhang: async(req, res) =>{
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;
            let wherecondition = [];
            let value = [];

            if(NgayBatDau){ wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc){ wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }

            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql = `SELECT tt.MaTrangThai, tt.TenTrangThai,
                        COUNT(DISTINCT cttt.MaDH) as SoLuongDon
                        FROM ChiTietTrangThai cttt
                        INNER JOIN TrangThai tt ON cttt.MaTrangThai = tt.MaTrangThai
                        INNER JOIN DonHang dh ON cttt.MaDH = dh.MaDH
                        INNER JOIN (
                            SELECT MaDH, MAX(Thoigian) as MaxTime
                            FROM ChiTietTrangThai
                            GROUP BY MaDH
                        ) Latest ON cttt.MaDH = Latest.MaDH AND cttt.Thoigian = Latest.MaxTime
                        ${whereClause}
                        GROUP BY tt.MaTrangThai, tt.TenTrangThai
                        ORDER BY tt.MaTrangThai ASC`;
            const [result] = await db.query(sql, value);
            
            res.status(200).json({ success: true, message: "Thống kê đơn hàng thành công!", data: result });
        }
        catch (error){
            console.error("Lỗi khi thống kê đơn hàng: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thống kê đơn hàng!" });
        }
    },

    thongkekhachhang: async(req,res) =>{
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;
            let wherecondition = ["MaQuyen = 3"]; 
            let value = [];

            if(NgayBatDau){ wherecondition.push("tk.NgayTao >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc){ wherecondition.push("tk.NgayTao <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }

            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql = `SELECT DATE(tk.NgayTao) as NgayDangKy, 
                        COUNT(tk.MaTK) as SoLuongKhach
                        FROM TaiKhoan tk
                        ${whereClause}
                        GROUP BY DATE(tk.NgayTao)
                        ORDER BY NgayDangKy ASC`;
            const [result] = await db.query(sql, value);
            
            res.status(200).json({ success: true, message: "Thống kê khách hàng thành công!", data: result });
        }
        catch (error){
            console.error("Lỗi khi thống kê khách hàng: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi thống kê khách hàng!" });
        }
    },

    topsanpham: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc } = req.query;

            let whereConditions = [];
            let values = [];

            if (NgayBatDau) {
                whereConditions.push("dh.NgayLapDon >= ?");
                values.push(`${NgayBatDau} 00:00:00`);
            }
            if (NgayKetThuc) {
                whereConditions.push("dh.NgayLapDon <= ?");
                values.push(`${NgayKetThuc} 23:59:59`);
            }

            let whereClause = "";
            if (whereConditions.length > 0) {
                whereClause = " AND " + whereConditions.join(" AND ");
            }

            const sql = `SELECT mh.MaMoHinh AS id, mh.TenMH AS name, mh.AnhDaiDien AS image, dm.TenDM AS categoryName, SUM(ctdh.SoLuong) AS quantity, SUM(ctdh.DonGiaBan * ctdh.SoLuong) AS revenue
                        FROM ChiTietDonHang ctdh
                        INNER JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai
                        INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh
                        LEFT JOIN DanhMuc dm ON mh.MaDM = dm.MaDM
                        INNER JOIN DonHang dh ON ctdh.MaDH = dh.MaDH
                        INNER JOIN (
                            SELECT MaDH, MaTrangThai
                            FROM ChiTietTrangThai
                            WHERE (MaDH, Thoigian) IN (
                                SELECT MaDH, MAX(Thoigian) 
                                FROM ChiTietTrangThai 
                                GROUP BY MaDH
                            )
                        ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                        WHERE LatestStatus.MaTrangThai = 4 ${whereClause}
                        GROUP BY mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, dm.TenDM
                        ORDER BY quantity DESC
                        LIMIT 10`;

            const [data] = await db.query(sql, values);

            res.status(200).json({
                success: true,
                data: data
            });

        } catch (error) {
            console.error("Lỗi khi thống kê top sản phẩm bán chạy: ", error);
            res.status(500).json({
                success: false,
                message: "Gặp sự cố hệ thống khi lấy danh sách sản phẩm bán chạy"
            });
        }
    },

    thongkebieudo: async (req, res) => {
        try {
            const {NgayBatDau, NgayKetThuc} = req.query;
            let wherecondition = ["cttt.MaTrangThai = 4"];
            let value = [];

            if(NgayBatDau){ wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc){ wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }

            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            // Nhóm theo từng ngày để vẽ biểu đồ
            const sql = `SELECT DATE_FORMAT(dh.NgayLapDon, '%d/%m') as Ngay,
                    IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as DoanhThuNgay,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as LoiNhuanNgay
                    FROM DonHang dh
                    INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH
                    INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                    ${whereClause}
                    GROUP BY Ngay
                    ORDER BY DATE(MAX(dh.NgayLapDon)) ASC`;
            const [result] = await db.query(sql, value);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error("Lỗi khi tạo biểu đồ: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    },

    // xuatExcelDoanhThu: async (req, res) => {
    //     try {
    //         const { NgayBatDau, NgayKetThuc } = req.query;
            
    //         // -------------------------------------------------------------
    //         // 1. CẤU HÌNH ĐIỀU KIỆN TRUY VẤN SQL (Tương tự các hàm cũ của bạn)
    //         // -------------------------------------------------------------
    //         let whereSuccess = ["cttt.MaTrangThai = 4"]; // Chỉ lấy đơn hoàn thành cho tài chính
    //         let valueTime = [];
    //         let dhWhere = ""; // Dùng cho phần bổ sung
    //         let dhValues = [];

    //         if(NgayBatDau) { 
    //             whereSuccess.push("dh.NgayLapDon >= ?"); 
    //             valueTime.push(`${NgayBatDau} 00:00:00`); 
    //             dhWhere = "WHERE dh.NgayLapDon >= ? AND dh.NgayLapDon <= ?";
    //             dhValues.push(`${NgayBatDau} 00:00:00`);
    //         }
    //         if(NgayKetThuc) { 
    //             whereSuccess.push("dh.NgayLapDon <= ?"); 
    //             valueTime.push(`${NgayKetThuc} 23:59:59`); 
    //             if(!NgayBatDau) dhWhere = "WHERE dh.NgayLapDon <= ?";
    //             dhValues.push(`${NgayKetThuc} 23:59:59`);
    //         }
    //         let whereClauseSuccess = whereSuccess.length > 0 ? " WHERE " + whereSuccess.join(" AND ") : "";

    //         // -------------------------------------------------------------
    //         // 2. GỌI SONG SONG TẤT CẢ CÁC TRUY VẤN DỮ LIỆU (Tối ưu hiệu năng)
    //         // -------------------------------------------------------------
    //         const [
    //             [resKPI],       // Tổng doanh thu, đơn hàng
    //             [resBieuDo],    // Xu hướng ngày
    //             [resDanhMuc],   // Thống kê danh mục
    //             [resThuongHieu],// Thống kê hãng sản xuất
    //             [resMaGiamGia], // Chiến dịch marketing
    //             [resTonKho],    // Cảnh báo kho
    //             [resDanhGia]    // Top sản phẩm yêu thích
    //         ] = await Promise.all([
    //             db.query(`SELECT COUNT(DISTINCT dh.MaDH) as TongSoDonHang, IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as TongDoanhThu, IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan FROM DonHang dh INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess}`, valueTime),
    //             db.query(`SELECT DATE_FORMAT(dh.NgayLapDon, '%d/%m/%Y') as Ngay, IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as DoanhThuNgay FROM DonHang dh INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess} GROUP BY DATE(dh.NgayLapDon) ORDER BY DATE(dh.NgayLapDon) ASC`, valueTime),
    //             db.query(`SELECT dm.TenDM, IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP, IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan FROM DanhMuc dm INNER JOIN MoHinh mh ON mh.MaDM = dm.MaDM INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess} GROUP BY dm.MaDM, dm.TenDM ORDER BY TongSoSP DESC`, valueTime),
    //             db.query(`SELECT hsx.TenHSX, IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP, IFNULL(SUM((ctdh.DonGiaBan - mh.GiaNhap) * ctdh.SoLuong), 0) as TongLoiNhuan FROM HangSanXuat hsx INNER JOIN MoHinh mh ON mh.MaHSX = hsx.MaHSX INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess} GROUP BY hsx.MaHSX, hsx.TenHSX ORDER BY TongSoSP DESC`, valueTime),
    //             db.query(`SELECT ma.TenMaGiamGia, COUNT(DISTINCT log.MaDH) as TongDonHang, IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam, IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong FROM MaGiamGia ma INNER JOIN LogSuDungMaGiamGia log ON ma.MaGG = log.MaGG INNER JOIN DonHang dh ON dh.MaDH = log.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH INNER JOIN (SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - ctdh.GiaNhapThucTe) * ctdh.SoLuong) as LoiNhuanGoc FROM ChiTietDonHang ctdh GROUP BY ctdh.MaDH) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH ${whereClauseSuccess} GROUP BY ma.MaGG, ma.TenMaGiamGia ORDER BY TongDonHang DESC`, valueTime),
    //             db.query(`SELECT mh.TenMH, pl.ChiTietPhanLoai, pl.SoLuong FROM PhanLoai pl INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh WHERE pl.SoLuong <= 5 ORDER BY pl.SoLuong ASC`),
    //             db.query(`SELECT mh.TenMH, ROUND(AVG(dg.SoSao), 1) as DiemTB, COUNT(dg.MaDG) as LuotDanhGia FROM DanhGia dg INNER JOIN MoHinh mh ON mh.MaMoHinh = dg.MaMH GROUP BY mh.MaMoHinh, mh.TenMH ORDER BY DiemTB DESC, LuotDanhGia DESC LIMIT 10`)
    //         ]);

    //         // -------------------------------------------------------------
    //         // 3. KHỞI TẠO WORKBOOK & ĐỊNH NGHĨA PHONG CÁCH (THEME)
    //         // -------------------------------------------------------------
    //         const workbook = new ExcelJS.Workbook();
            
    //         // Định nghĩa màu từ tailwind.config.js
    //         const COLOR_PRIMARY = 'FFFF8F73';       // Cam san hô (Màu chủ đạo)
    //         const COLOR_TEXT_MAIN = 'FF222532';     // Xám đậm (surface-variant)
    //         const COLOR_TEXT_MUTED = 'FF737580';    // Xám nhạt (outline)
    //         const COLOR_BORDER = 'FFE2E8F0';        // Đường viền bảng thanh lịch
    //         const COLOR_ZEBRA = 'FFF8F9FA';         // Dòng xen kẽ
    //         const COLOR_KPI_BG = 'FFFFF5F2';        // Màu nền thẻ KPI nhạt

    //         // Hàm hỗ trợ tạo cấu trúc Header chuyên nghiệp giống nhau cho mọi Sheet
    //         const taoHeaderBaoCao = (ws, titleName) => {
    //             ws.views = [{ showGridLines: false }]; // Ẩn gridline mặc định
                
    //             // Khởi tạo nền trắng cho vùng tiêu đề
    //             for (let i = 1; i <= 7; i++) {
    //                 for (let j = 1; j <= 10; j++) {
    //                     ws.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    //                 }
    //             }

    //             // Chèn thông tin thương hiệu
    //             ws.getCell('A1').value = 'FIGURECOLLECT';
    //             ws.getCell('A1').font = { size: 14, bold: true, color: { argb: COLOR_PRIMARY }, name: 'Space Grotesk' };
    //             ws.getCell('A2').value = 'Hệ thống quản lý kinh doanh Anime & Hobby';
    //             ws.getCell('A2').font = { size: 10, italic: true, color: { argb: COLOR_TEXT_MUTED }, name: 'Manrope' };

    //             // Đường phân cách thương hiệu
    //             ws.mergeCells('A4:E4');
    //             ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

    //             // Tiêu đề chính của Sheet
    //             ws.getCell('A5').value = titleName.toUpperCase();
    //             ws.getCell('A5').font = { size: 15, bold: true, color: { argb: COLOR_TEXT_MAIN }, name: 'Space Grotesk' };
                
    //             const filterText = (NgayBatDau && NgayKetThuc) ? `Kỳ báo cáo: Từ ${NgayBatDau} đến ${NgayKetThuc}` : 'Kỳ báo cáo: Toàn thời gian';
    //             ws.getCell('A6').value = `${filterText} | Ngày trích xuất: ${new Date().toLocaleString('vi-VN')}`;
    //             ws.getCell('A6').font = { size: 9, italic: true, color: { argb: COLOR_TEXT_MUTED }, name: 'Manrope' };
    //         };

    //         // Hàm định dạng mẫu cho Header của các bảng dữ liệu
    //         const dinhDangHeaderBang = (row) => {
    //             row.height = 24;
    //             row.eachCell((cell) => {
    //                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
    //                 cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Manrope' };
    //                 cell.alignment = { horizontal: 'center', vertical: 'middle' };
    //                 cell.border = {
    //                     top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    //                     left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    //                     bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    //                     right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
    //                 };
    //             });
    //         };

    //         // Hàm định dạng mẫu cho các dòng dữ liệu thông thường
    //         const dinhDangDongDuLieu = (row, index, centerCols = [], rightCols = []) => {
    //             const fillStyle = { type: 'pattern', pattern: 'solid', fgColor: { argb: (index % 2 === 0) ? 'FFFFFFFF' : COLOR_ZEBRA } };
    //             row.eachCell((cell, colNum) => {
    //                 cell.fill = fillStyle;
    //                 cell.font = { size: 10, name: 'Manrope', color: { argb: COLOR_TEXT_MAIN } };
    //                 cell.border = {
    //                     top: { style: 'thin', color: { argb: COLOR_BORDER } },
    //                     left: { style: 'thin', color: { argb: COLOR_BORDER } },
    //                     bottom: { style: 'thin', color: { argb: COLOR_BORDER } },
    //                     right: { style: 'thin', color: { argb: COLOR_BORDER } }
    //                 };

    //                 if (centerCols.includes(colNum)) cell.alignment = { horizontal: 'center', vertical: 'middle' };
    //                 else if (rightCols.includes(colNum)) cell.alignment = { horizontal: 'right', vertical: 'middle' };
    //                 else cell.alignment = { horizontal: 'left', vertical: 'middle' };
    //             });
    //         };


    //         // =============================================================
    //         // SHEET 1: TỔNG QUAN & TÀI CHÍNH
    //         // =============================================================
    //         const ws1 = workbook.addWorksheet('Tổng quan & Tài chính');
    //         ws1.columns = [
    //             { key: 'A', width: 18 }, { key: 'B', width: 22 }, 
    //             { key: 'C', width: 22 }, { key: 'D', width: 22 }
    //         ];
    //         taoHeaderBaoCao(ws1, 'Tổng quan hoạt động & Doanh thu xu hướng');

    //         // --- Thiết kế 3 thẻ KPI lớn nằm ngang ---
    //         const kpis = [
    //             { label: 'TỔNG ĐƠN HOÀN THÀNH', val: resKPI[0]?.TongSoDonHang || 0, fmt: '#,##0 "đơn"', cellLbl: 'A8', cellVal: 'A9', mergeLbl: 'A8:B8', mergeVal: 'A9:B9' },
    //             { label: 'TỔNG DOANH THU THU VỀ', val: resKPI[0]?.TongDoanhThu || 0, fmt: '#,##0" đ"', cellLbl: 'C8', cellVal: 'C9', mergeLbl: 'C8:D8', mergeVal: 'C9:D9' },
    //             { label: 'LỢI NHUẬN GỘP THỰC TẾ', val: resKPI[0]?.TongLoiNhuan || 0, fmt: '#,##0" đ"', cellLbl: 'E8', cellVal: 'E9', mergeLbl: 'E8:F8', mergeVal: 'E9:F9' }
    //         ];

    //         kpis.forEach(kpi => {
    //             ws1.mergeCells(kpi.mergeLbl);
    //             ws1.mergeCells(kpi.mergeVal);
                
    //             const cL = ws1.getCell(kpi.cellLbl);
    //             cL.value = kpi.label;
    //             cL.font = { size: 9, bold: true, color: { argb: COLOR_TEXT_MUTED }, name: 'Manrope' };
    //             cL.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_KPI_BG } };
    //             cL.alignment = { horizontal: 'center', vertical: 'middle' };

    //             const cV = ws1.getCell(kpi.cellVal);
    //             cV.value = Number(kpi.val);
    //             cV.font = { size: 14, bold: true, color: { argb: COLOR_PRIMARY }, name: 'Space Grotesk' };
    //             cV.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_KPI_BG } };
    //             cV.alignment = { horizontal: 'center', vertical: 'middle' };
    //             cV.numFmt = kpi.fmt;

    //             // Kẻ khung bao quanh thẻ KPI
    //             ws1.getCell(kpi.cellLbl).border = { 
    //                 top: { style: 'thin', color: { argb: 'FFFA7A55' } }, 
    //                 left: { style: 'thin', color: { argb: 'FFFA7A55' } }, 
    //                 right: { style: 'thin', color: { argb: 'FFFA7A55' } } 
    //             };
    //             ws1.getCell(kpi.cellVal).border = { 
    //                 bottom: { style: 'thin', color: { argb: 'FFFA7A55' } }, 
    //                 left: { style: 'thin', color: { argb: 'FFFA7A55' } }, 
    //                 right: { style: 'thin', color: { argb: 'FFFA7A55' } } 
    //             };
    //         });

    //         // --- Bảng biểu đồ xu hướng ngày ---
    //         ws1.getCell('A12').value = 'BẢNG DOANH THU BIẾN ĐỘNG THEO NGÀY';
    //         ws1.getCell('A12').font = { size: 11, bold: true, color: { argb: COLOR_TEXT_MAIN }, name: 'Space Grotesk' };

    //         const hRow1 = ws1.getRow(13);
    //         hRow1.values = ['STT', 'Ngày ghi nhận', 'Doanh thu thu về trong ngày', 'Biên độ ước tính (35%)'];
    //         dinhDangHeaderBang(hRow1);

    //         resBieuDo.forEach((row, i) => {
    //             const r = ws1.addRow([i + 1, row.Ngay, Number(row.DoanhThuNgay), Number(row.DoanhThuNgay * 0.35)]);
    //             dinhDangDongDuLieu(r, i, [1, 2], [3, 4]);
    //             r.getCell(3).numFmt = '#,##0" đ"';
    //             r.getCell(4).numFmt = '#,##0" đ"';
    //         });


    //         // =============================================================
    //         // SHEET 2: DANH MỤC & THƯƠNG HIỆU
    //         // =============================================================
    //         const ws2 = workbook.addWorksheet('Danh mục & Thương hiệu');
    //         ws2.columns = [
    //             { key: 'A', width: 28 }, { key: 'B', width: 16 }, { key: 'C', width: 24 },
    //             { key: 'D', width: 5 },  // Cột khoảng cách trống ngăn cách 2 bảng
    //             { key: 'E', width: 28 }, { key: 'F', width: 16 }, { key: 'G', width: 24 }
    //         ];
    //         taoHeaderBaoCao(ws2, 'Thống kê sản lượng và cơ cấu sinh lời sản phẩm');

    //         // Vẽ tiêu đề nhỏ cho 2 bảng nằm song song
    //         ws2.getCell('A8').value = 'CƠ CẤU THEO DANH MỤC';
    //         ws2.getCell('A8').font = { size: 11, bold: true, color: { argb: COLOR_TEXT_MAIN }, name: 'Space Grotesk' };
    //         ws2.getCell('E8').value = 'CƠ CẤU THEO HÃNG SẢN XUẤT (BRAND)';
    //         ws2.getCell('E8').font = { size: 11, bold: true, color: { argb: COLOR_TEXT_MAIN }, name: 'Space Grotesk' };

    //         // Render dòng Header cho cả 2 bảng trên dòng số 9
    //         const hRow2 = ws2.getRow(9);
    //         hRow2.getCell(1).value = 'Tên Danh Mục'; hRow2.getCell(2).value = 'Sản Lượng Bán'; hRow2.getCell(3).value = 'Lợi Nhuận Thu Về';
    //         hRow2.getCell(5).value = 'Thương Hiệu / Hãng'; hRow2.getCell(6).value = 'Sản Lượng Bán'; hRow2.getCell(7).value = 'Lợi Nhuận Thu Về';
    //         dinhDangHeaderBang(hRow2);

    //         // Đổ dữ liệu song song (Max 10 dòng theo LIMIT của bạn)
    //         const maxLen = Math.max(resDanhMuc.length, resThuongHieu.length);
    //         for (let i = 0; i < maxLen; i++) {
    //             const dm = resDanhMuc[i];
    //             const h = resThuongHieu[i];
    //             const r = ws2.getRow(10 + i);

    //             r.getCell(1).value = dm ? dm.TenDM : '';
    //             r.getCell(2).value = dm ? Number(dm.TongSoSP) : null;
    //             r.getCell(3).value = dm ? Number(dm.TongLoiNhuan) : null;

    //             r.getCell(5).value = h ? h.TenHSX : '';
    //             r.getCell(6).value = h ? Number(h.TongSoSP) : null;
    //             r.getCell(7).value = h ? Number(h.TongLoiNhuan) : null;

    //             dinhDangDongDuLieu(r, i, [2, 6], [3, 7]);
    //             if(dm) { r.getCell(2).numFmt = '#,##0'; r.getCell(3).numFmt = '#,##0" đ"'; }
    //             if(h) { r.getCell(6).numFmt = '#,##0'; r.getCell(7).numFmt = '#,##0" đ"'; }
    //         }


    //         // =============================================================
    //         // SHEET 3: HIỆU QUẢ MARKETING
    //         // =============================================================
    //         const ws3 = workbook.addWorksheet('Hiệu quả Marketing');
    //         ws3.columns = [
    //             { key: 'A', width: 8 }, { key: 'B', width: 32 }, 
    //             { key: 'C', width: 16 }, { key: 'D', width: 24 }, { key: 'E', width: 24 }
    //         ];
    //         taoHeaderBaoCao(ws3, 'Đánh giá chiến dịch ưu đãi và mã giảm giá');

    //         const hRow3 = ws3.getRow(9);
    //         hRow3.values = ['STT', 'Chiến dịch / Mã giảm giá', 'Lượt sử dụng', 'Tổng chi phí giảm giá', 'Lợi nhuận ròng thu về'];
    //         dinhDangHeaderBang(hRow3);

    //         resMaGiamGia.forEach((row, i) => {
    //             const r = ws3.addRow([i + 1, row.TenMaGiamGia, Number(row.TongDonHang), Number(row.TongTienDaGiam), Number(row.LoiNhuanRong)]);
    //             dinhDangDongDuLieu(r, i, [1, 3], [4, 5]);
    //             r.getCell(3).numFmt = '#,##0';
    //             r.getCell(4).numFmt = '#,##0" đ"';
    //             r.getCell(5).numFmt = '#,##0" đ"';
    //         });


    //         // =============================================================
    //         // SHEET 4: CẢNH BÁO VẬN HÀNH
    //         // =============================================================
    //         const ws4 = workbook.addWorksheet('Cảnh báo vận hành');
    //         ws4.columns = [
    //             { key: 'A', width: 35 }, { key: 'B', width: 20 }, { key: 'C', width: 16 },
    //             { key: 'D', width: 6 },
    //             { key: 'E', width: 40 }, { key: 'F', width: 16 }, { key: 'G', width: 16 }
    //         ];
    //         taoHeaderBaoCao(ws4, 'Rà soát kho hàng tồn thấp và khảo sát mức độ hài lòng');

    //         ws4.getCell('A8').value = 'SẢN PHẨM SẮP HẾT HÀNG TRONG KHO (TỒN KHO <= 5)';
    //         ws4.getCell('A8').font = { size: 11, bold: true, color: { argb: 'FFEF4444' }, name: 'Space Grotesk' }; // Đỏ cảnh báo
    //         ws4.getCell('E8').value = 'TOP SẢN PHẨM ĐƯỢC YÊU THÍCH NHẤT (REVIEW CAO)';
    //         ws4.getCell('E8').font = { size: 11, bold: true, color: { argb: 'FF10B981' }, name: 'Space Grotesk' }; // Xanh lá tốt

    //         const hRow4 = ws4.getRow(9);
    //         hRow4.getCell(1).value = 'Tên Mô Hình'; hRow4.getCell(2).value = 'Phân Loại'; hRow4.getCell(3).value = 'Số Lượng Tồn';
    //         hRow4.getCell(5).value = 'Sản Phẩm'; hRow4.getCell(6).value = 'Điểm Đánh Giá'; hRow4.getCell(7).value = 'Lượt Vote';
    //         dinhDangHeaderBang(hRow4);

    //         const maxLen4 = Math.max(resTonKho.length, resDanhGia.length);
    //         for (let i = 0; i < maxLen4; i++) {
    //             const tk = resTonKho[i];
    //             const dg = resDanhGia[i];
    //             const r = ws4.getRow(10 + i);

    //             r.getCell(1).value = tk ? tk.TenMH : '';
    //             r.getCell(2).value = tk ? tk.ChiTietPhanLoai : '';
    //             r.getCell(3).value = tk ? Number(tk.SoLuong) : null;

    //             r.getCell(5).value = dg ? dg.TenMH : '';
    //             r.getCell(6).value = dg ? Number(dg.DiemTB) : null;
    //             r.getCell(7).value = dg ? Number(dg.LuotDanhGia) : null;

    //             dinhDangDongDuLieu(r, i, [2, 3, 6, 7], []);
                
    //             if (tk) {
    //                 // Nếu tồn kho bằng 0, cảnh báo màu chữ đỏ đậm riêng biệt
    //                 if(tk.SoLuong === 0) r.getCell(3).font = { color: { argb: 'FFEF4444' }, bold: true };
    //             }
    //             if (dg) {
    //                 r.getCell(6).numFmt = '0.0 "★"';
    //                 r.getCell(7).numFmt = '#,##0 "lượt"';
    //             }
    //         }

    //         // -------------------------------------------------------------
    //         // 4. THIẾT LẬP PHẢN HỒI HTTP XUẤT FILE ĐỂ DUYỆT TẢI VỀ
    //         // -------------------------------------------------------------
    //         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //         res.setHeader('Content-Disposition', 'attachment; filename=' + `Bao_Cao_Sau_Thong_Ke_FigureCollect_${Date.now()}.xlsx`);

    //         await workbook.xlsx.write(res);
    //         res.end();

    //     } catch (error) {
    //         console.error("Lỗi xuất hệ thống báo cáo Excel tổng hợp:", error);
    //         res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel liên kết" });
    //     }
    // },
    xuatExcelDoanhThu: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc } = req.query;
            
            let wherecondition = ["cttt.MaTrangThai = 4"];
            let value = [];
            if(NgayBatDau) { wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc) { wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }
            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql = `
                SELECT dh.MaDH, kh.TenKH, dh.NgayLapDon, dh.TongTien,
                       GROUP_CONCAT(mh.TenMH SEPARATOR ', ') as DanhSachHang
                FROM DonHang dh
                INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH
                INNER JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai
                INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh
                ${whereClause}
                GROUP BY dh.MaDH
                ORDER BY dh.NgayLapDon DESC
            `;
            const [donHangs] = await db.query(sql, value);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Báo cáo doanh thu');

            // Ẩn gridlines mặc định của Excel để báo cáo trông như một trang giấy A4 sạch sẽ
            worksheet.views = [{ showGridLines: false }];

            // Cấu hình độ rộng cột
            worksheet.columns = [
                { key: 'MaDH', width: 15 },
                { key: 'TenKH', width: 30 },
                { key: 'NgayLapDon', width: 25 },
                { key: 'DanhSachHang', width: 50 },
                { key: 'TongTien', width: 20 },
            ];

            // Tô nền trắng cho khu vực Header (Dòng 1 đến 8)
            for (let i = 1; i <= 8; i++) {
                for (let j = 1; j <= 5; j++) {
                    worksheet.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                }
            }

            // Chèn Logo
            try {
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
                worksheet.addImage(logoId, {
                    tl: { col: 0, row: 0 },
                    br: { col: 1, row: 3 }
                });
            } catch (err) {
                console.log("Không tìm thấy file logo.");
            }

            // Tên công ty: Vẫn giữ màu primary (#ff8f73) cho nổi bật
            worksheet.mergeCells('B1:E1');
            worksheet.getCell('B1').value = 'FIGURECOLLECT';
            worksheet.getCell('B1').font = { size: 16, bold: true, color: { argb: 'FFFF8F73' }, name: 'Space Grotesk' };
            worksheet.getCell('B1').alignment = { vertical: 'bottom', horizontal: 'left' };

            // Slogan: Sử dụng màu xám (outline: #737580)
            worksheet.mergeCells('B2:E2');
            worksheet.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
            worksheet.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' }, name: 'Manrope' }; 
            worksheet.getCell('B2').alignment = { vertical: 'top', horizontal: 'left' };

            // Đường kẻ ngang phân cách: Sử dụng màu cam nhạt (secondary-fixed: #ffc3c2)
            worksheet.mergeCells('A4:E4');
            worksheet.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

            // Tiêu đề báo cáo: Màu chữ tối đậm để dễ đọc (surface-variant: #222532)
            worksheet.mergeCells('A5:E5');
            const titleCell = worksheet.getCell('A5');
            titleCell.value = 'BÁO CÁO DOANH THU BÁN HÀNG';
            titleCell.font = { size: 16, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            // Thời gian xuất báo cáo: Màu xám (outline: #737580)
            const currentTime = new Date().toLocaleString('vi-VN');
            const filterText = (NgayBatDau && NgayKetThuc) ? `Từ ${NgayBatDau} đến ${NgayKetThuc}` : 'Tất cả';
            
            worksheet.mergeCells('A6:E6');
            worksheet.getCell('A6').value = `Ngày xuất: ${currentTime}`;
            worksheet.getCell('A6').font = { italic: true, size: 10, color: { argb: 'FF737580' }, name: 'Manrope' };
            worksheet.getCell('A6').alignment = { horizontal: 'center' };

            worksheet.mergeCells('A7:E7');
            worksheet.getCell('A7').value = `Thời gian dữ liệu: ${filterText}`;
            worksheet.getCell('A7').font = { italic: true, size: 10, color: { argb: 'FF737580' }, name: 'Manrope' };
            worksheet.getCell('A7').alignment = { horizontal: 'center' };

            // HEADER BẢNG DỮ LIỆU
            const headerRow = worksheet.getRow(9);
            headerRow.values = ['Mã đơn hàng', 'Khách hàng', 'Ngày mua', 'Chi tiết sản phẩm', 'Tổng tiền (VNĐ)'];
            headerRow.height = 25;
            
            headerRow.eachCell((cell) => {
                // Background: Lấy màu primary làm chủ đạo (#ff8f73)
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8F73' } };
                // Text: Màu nâu/đỏ rất đậm để tương phản trên nền cam (on-primary-container: #490b00) hoặc dùng trắng tùy gu
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Manrope' };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                // Border: Trắng để phân cách các cột header
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });

            // AutoFilter
            worksheet.autoFilter = 'A9:E9';

            // ĐỔ DỮ LIỆU
            let currentRow = 10;
            donHangs.forEach((item, index) => {
                const row = worksheet.addRow({
                    MaDH: item.MaDH,
                    TenKH: item.TenKH,
                    NgayLapDon: new Date(item.NgayLapDon).toLocaleString('vi-VN'),
                    DanhSachHang: item.DanhSachHang,
                    TongTien: item.TongTien
                });
                
                // Highlight xen kẽ (Zebra striping) nhẹ nhàng
                // Hàng chẵn: Trắng (#FFFFFF) - Hàng lẻ: Xám cực nhạt (#F8F9FA)
                const isEven = index % 2 === 0;
                const rowFillColor = isEven ? 'FFFFFFFF' : 'FFF8F9FA';

                row.eachCell((cell, colNumber) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFillColor } };
                    
                    // Text data: Màu xám đậm (surface-variant: #222532)
                    cell.font = { size: 10, name: 'Manrope', color: { argb: 'FF222532' } };
                    
                    // Border: Màu xám nhạt để bảng không bị rối mắt
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                    };
                    
                    if (colNumber === 1 || colNumber === 3) cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    else if (colNumber === 5) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        // Highlight riêng số tiền bằng màu primary (#ff8f73)
                        cell.font = { size: 10, name: 'Manrope', color: { argb: 'FFFF8F73' }, bold: true };
                    }
                    else cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                });
                currentRow++;
            });

            worksheet.getColumn('TongTien').numFmt = '#,##0';

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Bao_cao_doanh_thu_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error("Lỗi xuất Excel:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel" });
        }
    },
    xuatExcelDashboard: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc } = req.query;
            
            let wherecondition = ["cttt.MaTrangThai = 4"];
            let value = [];
            if(NgayBatDau) { wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc) { wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }
            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            // Lấy dữ liệu song song (KPI Tổng quan + Danh sách đơn hàng)
            const [ [kpiData], [donHangs] ] = await Promise.all([
                db.query(`SELECT COUNT(DISTINCT dh.MaDH) as TongSoDonHang, IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as TongDoanhThu, IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan FROM DonHang dh INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClause}`, value),
                db.query(`SELECT dh.MaDH, kh.TenKH, dh.NgayLapDon, dh.TongTien, GROUP_CONCAT(mh.TenMH SEPARATOR ', ') as DanhSachHang FROM DonHang dh INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH INNER JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh ${whereClause} GROUP BY dh.MaDH ORDER BY dh.NgayLapDon DESC`, value)
            ]);

            const workbook = new ExcelJS.Workbook();
            const ws = workbook.addWorksheet('Báo cáo Nhanh Dashboard');

            ws.views = [{ showGridLines: false }];
            ws.columns = [
                { key: 'MaDH', width: 15 }, { key: 'TenKH', width: 30 },
                { key: 'NgayLapDon', width: 25 }, { key: 'DanhSachHang', width: 50 },
                { key: 'TongTien', width: 20 },
            ];

            // 1. TẠO HEADER NỀN TRẮNG
            for (let i = 1; i <= 10; i++) {
                for (let j = 1; j <= 5; j++) {
                    ws.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                }
            }

            try {
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
                ws.addImage(logoId, { tl: { col: 0, row: 0 }, br: { col: 1, row: 3 } });
            } catch (err) {}

            ws.getCell('B1').value = 'FIGURECOLLECT';
            ws.getCell('B1').font = { size: 16, bold: true, color: { argb: 'FFFF8F73' } };
            ws.getCell('B2').value = 'Báo cáo trích xuất nhanh từ Dashboard';
            ws.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' } };
            
            ws.mergeCells('A4:E4');
            ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

            ws.mergeCells('A5:E5');
            ws.getCell('A5').value = 'BÁO CÁO NHANH TỔNG QUAN HỆ THỐNG';
            ws.getCell('A5').font = { size: 16, bold: true, color: { argb: 'FF222532' } };
            ws.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

            const filterText = (NgayBatDau && NgayKetThuc) ? `Từ ${NgayBatDau} đến ${NgayKetThuc}` : 'Tất cả';
            ws.mergeCells('A6:E6');
            ws.getCell('A6').value = `Kỳ dữ liệu: ${filterText} | Trích xuất lúc: ${new Date().toLocaleString('vi-VN')}`;
            ws.getCell('A6').font = { italic: true, size: 10, color: { argb: 'FF737580' } };
            ws.getCell('A6').alignment = { horizontal: 'center' };

            // 2. KHU VỰC THẺ KPI
            const kpiTongDoanhThu = kpiData[0]?.TongDoanhThu || 0;
            const kpiTongLoiNhuan = kpiData[0]?.TongLoiNhuan || 0;
            const kpiTongDon = kpiData[0]?.TongSoDonHang || 0;

            // Box Doanh thu
            ws.getCell('B8').value = 'TỔNG DOANH THU';
            ws.getCell('B8').font = { size: 9, bold: true, color: { argb: 'FF737580' } };
            ws.getCell('B9').value = kpiTongDoanhThu;
            ws.getCell('B9').numFmt = '#,##0" đ"';
            ws.getCell('B9').font = { size: 14, bold: true, color: { argb: 'FFFF8F73' } };

            // Box Lợi nhuận
            ws.getCell('C8').value = 'LỢI NHUẬN RÒNG';
            ws.getCell('C8').font = { size: 9, bold: true, color: { argb: 'FF737580' } };
            ws.getCell('C9').value = kpiTongLoiNhuan;
            ws.getCell('C9').numFmt = '#,##0" đ"';
            ws.getCell('C9').font = { size: 14, bold: true, color: { argb: 'FF10B981' } }; // Xanh lá

            // Box Đơn hàng
            ws.getCell('D8').value = 'ĐƠN HOÀN THÀNH';
            ws.getCell('D8').font = { size: 9, bold: true, color: { argb: 'FF737580' } };
            ws.getCell('D9').value = kpiTongDon;
            ws.getCell('D9').numFmt = '#,##0" đơn"';
            ws.getCell('D9').font = { size: 14, bold: true, color: { argb: 'FF222532' } };

            [8, 9].forEach(r => {
                ['B', 'C', 'D'].forEach(c => {
                    ws.getCell(`${c}${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
                    ws.getCell(`${c}${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F2' } }; // Nền cam siêu nhạt
                });
            });

            // 3. DANH SÁCH ĐƠN HÀNG
            const headerRow = ws.getRow(12);
            headerRow.values = ['Mã đơn hàng', 'Khách hàng', 'Ngày mua', 'Chi tiết sản phẩm', 'Tổng tiền (VNĐ)'];
            headerRow.height = 25;
            
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8F73' } };
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = { top: { style: 'thin', color: { argb: 'FFFFFFFF' } }, left: { style: 'thin', color: { argb: 'FFFFFFFF' } }, bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }, right: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
            });

            ws.autoFilter = 'A12:E12';

            let currentRow = 13;
            donHangs.forEach((item, index) => {
                const row = ws.addRow({
                    MaDH: item.MaDH,
                    TenKH: item.TenKH,
                    NgayLapDon: new Date(item.NgayLapDon).toLocaleString('vi-VN'),
                    DanhSachHang: item.DanhSachHang,
                    TongTien: item.TongTien
                });
                
                const isEven = index % 2 === 0;
                const rowFillColor = isEven ? 'FFFFFFFF' : 'FFF8F9FA'; // Trắng xen kẽ xám nhạt

                row.eachCell((cell, colNumber) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFillColor } };
                    cell.font = { size: 10, color: { argb: 'FF222532' } };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
                    
                    if (colNumber === 1 || colNumber === 3) cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    else if (colNumber === 5) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        cell.font = { size: 10, color: { argb: 'FFFF8F73' }, bold: true };
                    }
                    else cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                });
                currentRow++;
            });

            ws.getColumn('TongTien').numFmt = '#,##0';

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Snapshot_Dashboard_FigureCollect_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error("Lỗi xuất Excel Dashboard:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel" });
        }
    },
    thongkebosung: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc } = req.query;
            
            let dhWhere = "";
            let dhValues = [];
            if (NgayBatDau && NgayKetThuc) {
                dhWhere = "WHERE dh.NgayLapDon >= ? AND dh.NgayLapDon <= ?";
                dhValues = [`${NgayBatDau} 00:00:00`, `${NgayKetThuc} 23:59:59`];
            }

            const sql_tonkho = `SELECT mh.TenMH, mh.AnhDaiDien, pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.SoLuong 
                                FROM PhanLoai pl 
                                INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh 
                                WHERE pl.SoLuong <= 5 
                                ORDER BY pl.SoLuong ASC`;
            const [tonKhoData] = await db.query(sql_tonkho);

            const sql_top_danhgia = `SELECT mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, 
                                    ROUND(AVG(dg.SoSao), 1) as DiemTB, 
                                    COUNT(dg.MaDG) as LuotDanhGia
                                    FROM DanhGia dg
                                    INNER JOIN MoHinh mh ON mh.MaMoHinh = dg.MaMH
                                    GROUP BY mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien
                                    ORDER BY DiemTB DESC, LuotDanhGia DESC
                                    LIMIT 10`;
            const [topDanhGiaData] = await db.query(sql_top_danhgia);

            const sql_thatthoat = `SELECT cttt.MaTrangThai, COUNT(DISTINCT dh.MaDH) as SoLuongDon
                                    FROM DonHang dh
                                    INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                                    INNER JOIN (
                                        SELECT MaDH, MAX(ThoiGian) as MaxTime
                                        FROM ChiTietTrangThai
                                        GROUP BY MaDH
                                    ) Latest ON cttt.MaDH = Latest.MaDH AND cttt.ThoiGian = Latest.MaxTime
                                    ${dhWhere}
                                    GROUP BY cttt.MaTrangThai`;
            const [thatThoatData] = await db.query(sql_thatthoat, dhValues);

            const totalOrders = thatThoatData.reduce((sum, item) => sum + item.SoLuongDon, 0);
            const cancelCount = thatThoatData.find(item => item.MaTrangThai === 5)?.SoLuongDon || 0; 
            const returnCount = thatThoatData.find(item => item.MaTrangThai === 6)?.SoLuongDon || 0; 

            res.status(200).json({
                success: true,
                data: {
                    inventoryWarnings: tonKhoData,
                    topReviews: topDanhGiaData,
                    orderStats: {
                        cancelCount: cancelCount,
                        returnCount: returnCount,
                        cancelRate: totalOrders > 0 ? Math.round((cancelCount / totalOrders) * 100) : 0,
                        returnRate: totalOrders > 0 ? Math.round((returnCount / totalOrders) * 100) : 0
                    }
                }
            });

        } 
        catch (error) {
            console.error("Lỗi khi thống kê bổ sung: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy dữ liệu thống kê bổ sung!" });
        }
    },
    xuatExcelTuyChinh: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc, types } = req.query;
            
            // Xử lý types được gửi lên từ Frontend (chuỗi 'doanhthu,sanpham')
            const selectedTypes = types ? types.split(',') : [];
            
            if (selectedTypes.length === 0) {
                return res.status(400).json({ message: "Không có loại báo cáo nào được chọn" });
            }

            // 1. Cấu hình thời gian chung
            let whereSuccess = ["cttt.MaTrangThai = 4"];
            let valueTime = [];
            
            if (NgayBatDau) { 
                whereSuccess.push("dh.NgayLapDon >= ?"); 
                valueTime.push(`${NgayBatDau} 00:00:00`); 
            }
            if (NgayKetThuc) { 
                whereSuccess.push("dh.NgayLapDon <= ?"); 
                valueTime.push(`${NgayKetThuc} 23:59:59`); 
            }
            let whereClauseSuccess = whereSuccess.length > 0 ? " WHERE " + whereSuccess.join(" AND ") : "";

            // 2. Khởi tạo Workbook và các hàm định dạng mẫu (Giữ nguyên của bạn)
            const workbook = new ExcelJS.Workbook();
            const COLOR_PRIMARY = 'FFFF8F73';
            // Thêm tham số 'workbook' và 'endCol' (Mặc định là cột E)
            const taoHeaderBaoCao = (workbook, ws, titleName, endCol = 'E') => {
                ws.views = [{ showGridLines: false }];

                // 1. Tô nền trắng cho khu vực header (Từ dòng 1 đến 7)
                for (let i = 1; i <= 7; i++) {
                    for (let j = 1; j <= 10; j++) {
                        ws.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                    }
                }

                // 2. Chèn Logo vào góc trên bên trái (Cột A)
                try {
                    const logoPath = path.join(__dirname, '../../public/logo.png'); 
                    if (fs.existsSync(logoPath)) {
                        const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
                        ws.addImage(logoId, {
                            tl: { col: 0.2, row: 0.2 }, 
                            ext: { width: 60, height: 60 } 
                        });
                    }
                } 
                catch (err) {
                    console.log("Lỗi chèn logo báo cáo:", err);
                }

                // 3. Thông tin thương hiệu (Dịch sang cột B để nhường chỗ cho logo)
                ws.mergeCells(`B1:${endCol}1`);
                ws.getCell('B1').value = 'FIGURECOLLECT';
                ws.getCell('B1').font = { size: 16, bold: true, color: { argb: COLOR_PRIMARY }, name: 'Space Grotesk' };
                ws.getCell('B1').alignment = { vertical: 'bottom', horizontal: 'left' };

                ws.mergeCells(`B2:${endCol}2`);
                ws.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
                ws.getCell('B2').font = { size: 10, italic: true, color: { argb: 'FF737580' }, name: 'Manrope' };
                ws.getCell('B2').alignment = { vertical: 'top', horizontal: 'left' };

                // 4. Kẻ đường phân cách ngang
                ws.mergeCells(`A4:${endCol}4`);
                ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

                // 5. CĂN GIỮA: Tiêu đề chính của báo cáo
                ws.mergeCells(`A5:${endCol}5`); // Gộp ô từ A đến cột cuối của bảng
                const titleCell = ws.getCell('A5');
                titleCell.value = titleName.toUpperCase();
                titleCell.font = { size: 16, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                titleCell.alignment = { horizontal: 'center', vertical: 'middle' }; // Lệnh căn giữa

                // 6. CĂN GIỮA: Thời gian trích xuất
                const filterText = (NgayBatDau && NgayKetThuc) ? `Kỳ báo cáo: Từ ${NgayBatDau} đến ${NgayKetThuc}` : 'Kỳ báo cáo: Toàn thời gian';
                ws.mergeCells(`A6:${endCol}6`);
                const dateCell = ws.getCell('A6');
                dateCell.value = `${filterText} | Ngày trích xuất: ${new Date().toLocaleString('vi-VN')}`;
                dateCell.font = { size: 10, italic: true, color: { argb: 'FF737580' }, name: 'Manrope' };
                dateCell.alignment = { horizontal: 'center', vertical: 'middle' }; // Lệnh căn giữa
            };

            const dinhDangHeaderBang = (row) => {
                row.height = 24;
                row.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Manrope' };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFFFFFFF' } }, left: { style: 'thin', color: { argb: 'FFFFFFFF' } }, bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }, right: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
                });
            };

            const dinhDangDongDuLieu = (row, index, centerCols = [], rightCols = []) => {
                const fillStyle = { type: 'pattern', pattern: 'solid', fgColor: { argb: (index % 2 === 0) ? 'FFFFFFFF' : 'FFF8F9FA' } };
                row.eachCell((cell, colNum) => {
                    cell.fill = fillStyle;
                    cell.font = { size: 10, name: 'Manrope', color: { argb: 'FF222532' } };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
                    if (centerCols.includes(colNum)) cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    else if (rightCols.includes(colNum)) cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    else cell.alignment = { horizontal: 'left', vertical: 'middle' };
                });
            };

            // Hàm vẽ khung viền đậm bao quanh bảng (Khoanh vùng báo cáo)
            const khoanhVungBang = (ws, startRow, endRow, startCol, endCol) => {
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startCol; c <= endCol; c++) {
                        const cell = ws.getCell(r, c);
                        // Giữ lại các viền kẻ mỏng bên trong hiện tại
                        let currentBorder = cell.border || {};
                        let newBorder = { ...currentBorder };

                        // Vẽ viền 'medium' (đậm) ở các cạnh ngoài cùng
                        if (r === startRow) newBorder.top = { style: 'medium', color: { argb: 'FF94A3B8' } }; // Cạnh trên
                        if (r === endRow) newBorder.bottom = { style: 'medium', color: { argb: 'FF94A3B8' } }; // Cạnh dưới
                        if (c === startCol) newBorder.left = { style: 'medium', color: { argb: 'FF94A3B8' } }; // Cạnh trái
                        if (c === endCol) newBorder.right = { style: 'medium', color: { argb: 'FF94A3B8' } }; // Cạnh phải

                        cell.border = newBorder;
                    }
                }
            };

            // =========================================================
            // 3. LOGIC TẠO SHEET DỰA TRÊN LỰA CHỌN
            // =========================================================

            // --- SHEET 1: DOANH THU ---
            if (selectedTypes.includes('doanhthu')) {
                const [resKPI] = await db.query(`SELECT COUNT(DISTINCT dh.MaDH) as TongSoDonHang, IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as TongDoanhThu, IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan FROM DonHang dh INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess}`, valueTime);
                const [resBieuDo] = await db.query(`SELECT DATE_FORMAT(dh.NgayLapDon, '%d/%m/%Y') as Ngay, IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as DoanhThuNgay FROM DonHang dh INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess} GROUP BY DATE(dh.NgayLapDon) ORDER BY DATE(dh.NgayLapDon) ASC`, valueTime);

                const ws1 = workbook.addWorksheet('Tổng quan & Tài chính');
                ws1.columns = [{ key: 'A', width: 18 }, { key: 'B', width: 22 }, { key: 'C', width: 22 }, { key: 'D', width: 22 }];
                taoHeaderBaoCao(workbook, ws1, 'Tổng quan hoạt động & Doanh thu', 'D');

                ws1.getCell('A8').value = 'TỔNG ĐƠN'; ws1.getCell('A9').value = Number(resKPI[0]?.TongSoDonHang || 0);
                ws1.getCell('C8').value = 'DOANH THU'; ws1.getCell('C9').value = Number(resKPI[0]?.TongDoanhThu || 0);
                ws1.getCell('C9').numFmt = '#,##0" đ"';

                ws1.getCell('A12').value = 'DOANH THU BIẾN ĐỘNG THEO NGÀY';
                const hRow1 = ws1.getRow(13);
                hRow1.values = ['STT', 'Ngày', 'Doanh thu'];
                dinhDangHeaderBang(hRow1);

                resBieuDo.forEach((row, i) => {
                    const r = ws1.addRow([i + 1, row.Ngay, Number(row.DoanhThuNgay)]);
                    dinhDangDongDuLieu(r, i, [1, 2], [3]);
                    r.getCell(3).numFmt = '#,##0" đ"';
                });
                khoanhVungBang(ws1, 13, 13 + resBieuDo.length, 1, 3);
            }

            // --- SHEET 2: SẢN PHẨM ---
            if (selectedTypes.includes('sanpham')) {
                const [resDanhMuc] = await db.query(`SELECT dm.TenDM, IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP, IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan FROM DanhMuc dm INNER JOIN MoHinh mh ON mh.MaDM = dm.MaDM INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess} GROUP BY dm.MaDM, dm.TenDM ORDER BY TongSoSP DESC`, valueTime);
                const [resThuongHieu] = await db.query(`SELECT hsx.TenHSX, IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP, IFNULL(SUM((ctdh.DonGiaBan - mh.GiaNhap) * ctdh.SoLuong), 0) as TongLoiNhuan FROM HangSanXuat hsx INNER JOIN MoHinh mh ON mh.MaHSX = hsx.MaHSX INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH ${whereClauseSuccess} GROUP BY hsx.MaHSX, hsx.TenHSX ORDER BY TongSoSP DESC`, valueTime);

                const ws2 = workbook.addWorksheet('Danh mục & Thương hiệu');
                ws2.columns = [{ key: 'A', width: 28 }, { key: 'B', width: 16 }, { key: 'C', width: 24 }, { key: 'D', width: 5 }, { key: 'E', width: 28 }, { key: 'F', width: 16 }, { key: 'G', width: 24 }];
                taoHeaderBaoCao(workbook, ws2, 'Thống kê Danh mục & Thương hiệu', 'G');

                ws2.getCell('A8').value = 'CƠ CẤU THEO DANH MỤC';
                ws2.getCell('E8').value = 'CƠ CẤU THEO HÃNG SẢN XUẤT';
                const hRow2 = ws2.getRow(9);
                hRow2.getCell(1).value = 'Tên Danh Mục'; hRow2.getCell(2).value = 'SL Bán'; hRow2.getCell(3).value = 'Lợi Nhuận';
                hRow2.getCell(5).value = 'Thương Hiệu'; hRow2.getCell(6).value = 'SL Bán'; hRow2.getCell(7).value = 'Lợi Nhuận';
                dinhDangHeaderBang(hRow2);

                const maxLen = Math.max(resDanhMuc.length, resThuongHieu.length);
                for (let i = 0; i < maxLen; i++) {
                    const dm = resDanhMuc[i];
                    const h = resThuongHieu[i];
                    const r = ws2.getRow(10 + i);
                    r.getCell(1).value = dm ? dm.TenDM : ''; r.getCell(2).value = dm ? Number(dm.TongSoSP) : null; r.getCell(3).value = dm ? Number(dm.TongLoiNhuan) : null;
                    r.getCell(5).value = h ? h.TenHSX : ''; r.getCell(6).value = h ? Number(h.TongSoSP) : null; r.getCell(7).value = h ? Number(h.TongLoiNhuan) : null;
                    dinhDangDongDuLieu(r, i, [2, 6], [3, 7]);
                    if(dm) { r.getCell(2).numFmt = '#,##0'; r.getCell(3).numFmt = '#,##0" đ"'; }
                    if(h) { r.getCell(6).numFmt = '#,##0'; r.getCell(7).numFmt = '#,##0" đ"'; }
                }
                const endRowSheet2 = 9 + maxLen;
                khoanhVungBang(ws2, 9, endRowSheet2, 1, 3); 
                khoanhVungBang(ws2, 9, endRowSheet2, 5, 7); 
            }

            // --- SHEET 3: MARKETING ---
            if (selectedTypes.includes('marketing')) {
                const [resMaGiamGia] = await db.query(`SELECT ma.TenMaGiamGia, COUNT(DISTINCT log.MaDH) as TongDonHang, IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam, IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong FROM MaGiamGia ma INNER JOIN LogSuDungMaGiamGia log ON ma.MaGG = log.MaGG INNER JOIN DonHang dh ON dh.MaDH = log.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH INNER JOIN (SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - ctdh.GiaNhapThucTe) * ctdh.SoLuong) as LoiNhuanGoc FROM ChiTietDonHang ctdh GROUP BY ctdh.MaDH) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH ${whereClauseSuccess} GROUP BY ma.MaGG, ma.TenMaGiamGia ORDER BY TongDonHang DESC`, valueTime);
                const ws3 = workbook.addWorksheet('Hiệu quả Marketing');
                ws3.columns = [{ key: 'A', width: 8 }, { key: 'B', width: 32 }, { key: 'C', width: 16 }, { key: 'D', width: 24 }, { key: 'E', width: 24 }];
                taoHeaderBaoCao(workbook, ws3, 'Hiệu quả Marketing', 'E');
                const hRow3 = ws3.getRow(9);
                hRow3.values = ['STT', 'Mã giảm giá', 'Lượt dùng', 'Chi phí giảm giá', 'Lợi nhuận ròng'];
                dinhDangHeaderBang(hRow3);
                resMaGiamGia.forEach((row, i) => {
                    const r = ws3.addRow([i + 1, row.TenMaGiamGia, Number(row.TongDonHang), Number(row.TongTienDaGiam), Number(row.LoiNhuanRong)]);
                    dinhDangDongDuLieu(r, i, [1, 3], [4, 5]);
                    r.getCell(4).numFmt = '#,##0" đ"'; r.getCell(5).numFmt = '#,##0" đ"';
                });
                khoanhVungBang(ws3, 9, 9 + resMaGiamGia.length, 1, 5);
            }

            // --- SHEET 4: TỒN KHO ---
            if (selectedTypes.includes('tonkho')) {
                const [resTonKho] = await db.query(`SELECT mh.TenMH, pl.ChiTietPhanLoai, pl.SoLuong FROM PhanLoai pl INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh WHERE pl.SoLuong <= 5 ORDER BY pl.SoLuong ASC`);
                const ws4 = workbook.addWorksheet('Cảnh báo Tồn kho');
                ws4.columns = [{ key: 'A', width: 10 }, { key: 'B', width: 40 }, { key: 'C', width: 20 }, { key: 'D', width: 15 }];
                taoHeaderBaoCao(workbook, ws4, 'Cảnh báo Tồn kho sắp hết', 'D');
                const hRow4 = ws4.getRow(9);
                hRow4.values = ['STT', 'Tên Mô Hình', 'Phân Loại', 'Số Lượng Tồn'];
                dinhDangHeaderBang(hRow4);
                resTonKho.forEach((row, i) => {
                    const r = ws4.addRow([i + 1, row.TenMH, row.ChiTietPhanLoai, Number(row.SoLuong)]);
                    dinhDangDongDuLieu(r, i, [1, 4], []);
                    if(row.SoLuong === 0) r.getCell(4).font = { color: { argb: 'FFEF4444' }, bold: true };
                });
                khoanhVungBang(ws4, 9, 9 + resTonKho.length, 1, 4);
            }

            // 4. Trả file về cho Client
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Bao_Cao_Tuy_Chinh_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } 
        catch (error) {
            console.error("Lỗi xuất Excel Tùy Chỉnh:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel liên kết" });
        }
    }
}

module.exports = thongke;