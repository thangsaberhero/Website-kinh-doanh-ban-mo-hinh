const db = require('../../config/db');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const thongke = {
    thongkedoanhthu: async (req,res) => {
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;

            let wherecondition = ["LatestStatus.MaTrangThai = 4"]; 
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
                    COUNT(dh.MaDH) as TongSoDonHang,
                    IFNULL(SUM(dh.ThanhTien), 0) as TongDoanhThu,
                    IFNULL(SUM(dh.ThanhTien - OrderImportCost.TotalImport), 0) as TongLoiNhuan
                FROM DonHang dh
                INNER JOIN (
                    SELECT MaDH, SUM(COALESCE(GiaNhapThucTe, 0) * SoLuong) as TotalImport
                    FROM ChiTietDonHang
                    GROUP BY MaDH
                ) OrderImportCost ON dh.MaDH = OrderImportCost.MaDH
                INNER JOIN (
                    SELECT MaDH, MaTrangThai
                    FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (
                        SELECT MaDH, MAX(Thoigian)
                        FROM ChiTietTrangThai
                        GROUP BY MaDH
                    )
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
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

            let wherecondition = ["LatestStatus.MaTrangThai = 4"];
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
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                ${whereClause}
                GROUP BY mh.MaMoHinh, mh.TenMH
                ORDER BY TongSoSP DESC
                LIMIT 10
            `;   

            const sql_dm = `
                SELECT dm.MaDM, dm.TenDM,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan,
                    IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP
                FROM DanhMuc dm
                INNER JOIN MoHinh mh ON mh.MaDM = dm.MaDM
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                ${whereClause}
                GROUP BY dm.MaDM, dm.TenDM
                ORDER BY TongSoSP DESC
                LIMIT 10
            `; 

            const sql_ctdm = `
                SELECT ctdm.MaChiTietDM, ctdm.TenChiTietDM,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan,
                    IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP
                FROM ChiTietDanhMuc ctdm
                INNER JOIN MoHinh mh ON mh.MaChiTietDM = ctdm.MaChiTietDM
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                ${whereClause}
                GROUP BY ctdm.MaChiTietDM, ctdm.TenChiTietDM
                ORDER BY TongSoSP DESC
                LIMIT 10
            `;

            const sql_hsx = `
                SELECT hsx.MaHSX, hsx.TenHSX,
                    IFNULL(SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong), 0) as TongLoiNhuan,
                    IFNULL(SUM(ctdh.SoLuong), 0) as TongSoSP
                FROM HangSanXuat hsx
                INNER JOIN MoHinh mh ON mh.MaHSX = hsx.MaHSX
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietDonHang ctdh ON pl.MaPhanLoai = ctdh.MaPhanLoai
                INNER JOIN DonHang dh ON dh.MaDH = ctdh.MaDH
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                ${whereClause}
                GROUP BY hsx.MaHSX, hsx.TenHSX
                ORDER BY TongSoSP DESC
                LIMIT 10
            `;
            
            const [ [result_mh], [result_dm], [result_ctdm], [result_hsx]] = await Promise.all([
                db.query(sql_mh, value),
                db.query(sql_dm, value),
                db.query(sql_ctdm, value),
                db.query(sql_hsx, value)
            ]);

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
            let wherecondition = ["LatestStatus.MaTrangThai = 4"];
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
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                INNER JOIN (
                    SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong) as LoiNhuanGoc
                    FROM ChiTietDonHang ctdh
                    GROUP BY ctdh.MaDH
                ) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH
                ${whereClause}
                GROUP BY km.MaKM, km.TenKM
                ORDER BY TongDonHang DESC
            `;

            const sql_magg = `
                SELECT ma.MaGG, ma.TenMaGiamGia,
                    IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam,
                    COUNT(DISTINCT log.MaDH) as TongDonHang,
                    IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong
                FROM MaGiamGia ma
                INNER JOIN LogSuDungMaGiamGia log ON ma.MaGG = log.MaGG
                INNER JOIN DonHang dh ON dh.MaDH = log.MaDH
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                INNER JOIN (
                    SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong) as LoiNhuanGoc
                    FROM ChiTietDonHang ctdh
                    GROUP BY ctdh.MaDH
                ) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH
                ${whereClause}
                GROUP BY ma.MaGG, ma.TenMaGiamGia
                ORDER BY TongDonHang DESC
            `;

            const [ [result_km], [result_magg] ] = await Promise.all([
                db.query(sql_km, value),
                db.query(sql_magg, value)
            ]);

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
            let wherecondition = ["LatestStatus.MaTrangThai = 4"];
            let value = [];

            if(NgayBatDau){ wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc){ wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }

            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql = `
                SELECT DATE_FORMAT(dh.NgayLapDon, '%d/%m') as Ngay,
                    IFNULL(SUM(dh.ThanhTien), 0) as DoanhThuNgay,
                    IFNULL(SUM(dh.ThanhTien - OrderImportCost.TotalImport), 0) as LoiNhuanNgay
                FROM DonHang dh
                INNER JOIN (
                    SELECT MaDH, SUM(COALESCE(GiaNhapThucTe, 0) * SoLuong) as TotalImport
                    FROM ChiTietDonHang
                    GROUP BY MaDH
                ) OrderImportCost ON dh.MaDH = OrderImportCost.MaDH
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                ${whereClause}
                GROUP BY Ngay
                ORDER BY DATE(MAX(dh.NgayLapDon)) ASC
            `;
            const [result] = await db.query(sql, value);
            res.status(200).json({ success: true, data: result });
        } 
        catch (error) {
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
    //             db.query(`SELECT ma.TenMaGiamGia, COUNT(DISTINCT log.MaDH) as TongDonHang, IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam, IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong FROM MaGiamGia ma INNER JOIN LogSuDungMaGiamGia log ON ma.MaGG = log.MaGG INNER JOIN DonHang dh ON dh.MaDH = log.MaDH INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH INNER JOIN (SELECT ctdh.MaDH, FVF FROM ChiTietDonHang ctdh GROUP BY ctdh.MaDH) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH ${whereClauseSuccess} GROUP BY ma.MaGG, ma.TenMaGiamGia ORDER BY TongDonHang DESC`, valueTime),
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

    xuatExcelDoanhThu: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc } = req.query;
            
            let wherecondition = ["LatestStatus.MaTrangThai = 4"];
            let value = [];
            if(NgayBatDau) { wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc) { wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }
            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const sql = `
                SELECT dh.MaDH, dh.MaDonHangHienThi, kh.TenKH, dh.NgayLapDon, dh.ThanhTien as TongTien,
                       GROUP_CONCAT(mh.TenMH SEPARATOR ', ') as DanhSachHang
                FROM DonHang dh
                INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH
                INNER JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai
                INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh
                ${whereClause}
                GROUP BY dh.MaDH
                ORDER BY dh.NgayLapDon DESC
            `;
            const [donHangs] = await db.query(sql, value);

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Hệ Thống FIGURECOLLECT';
            workbook.lastModifiedBy = 'Hệ Thống FIGURECOLLECT';
            workbook.created = new Date();
            workbook.modified = new Date();
            const COLOR_PRIMARY = 'FFFF8F73';
            
            const formatDateVN = (dateStr) => {
                if (!dateStr) return '';
                if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    if(parts.length === 3 && parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return dateStr;
            };

            const filterText = (NgayBatDau && NgayKetThuc) ? `Từ ${formatDateVN(NgayBatDau)} đến ${formatDateVN(NgayKetThuc)}` : 'Tất cả thời gian';

            const ws = workbook.addWorksheet('Báo cáo doanh thu');
            ws.views = [{ showGridLines: false }];
            ws.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true };

            ws.columns = [
                { key: 'STT', width: 10 },
                { key: 'MaDH', width: 18 },
                { key: 'TenKH', width: 30 },
                { key: 'NgayLapDon', width: 22 },
                { key: 'DanhSachHang', width: 45 },
                { key: 'TongTien', width: 20 },
            ];

            const endCol = 'F';
            const maxCol = endCol.charCodeAt(0) - 64; 
            for (let i = 1; i <= 8; i++) {
                for (let j = 1; j <= maxCol; j++) {
                    ws.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                }
            }

            try {
                const path = require('path');
                const fs = require('fs');
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                if (fs.existsSync(logoPath)) {
                    const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
                    ws.addImage(logoId, { tl: { col: 0.1, row: 0.2 }, ext: { width: 70, height: 70 } });
                }
            } catch (err) { }

            ws.mergeCells(`B1:${endCol}1`);
            ws.getCell('B1').value = 'FIGURECOLLECT';
            ws.getCell('B1').font = { size: 22, bold: true, color: { argb: COLOR_PRIMARY }, name: 'Space Grotesk' };
            ws.getCell('B1').alignment = { vertical: 'bottom', horizontal: 'left' };

            ws.mergeCells(`B2:${endCol}2`);
            ws.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
            ws.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' }, name: 'Manrope' }; 
            ws.getCell('B2').alignment = { vertical: 'top', horizontal: 'left' };

            ws.mergeCells(`A4:${endCol}4`);
            ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

            ws.mergeCells(`A5:${endCol}5`);
            const titleCell = ws.getCell('A5');
            titleCell.value = 'BÁO CÁO DOANH THU BÁN HÀNG';
            titleCell.font = { size: 18, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            ws.mergeCells(`A6:${endCol}6`);
            ws.getCell('A6').value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
            ws.getCell('A6').font = { italic: true, size: 11, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('A6').alignment = { horizontal: 'center' };

            ws.mergeCells(`A7:${endCol}7`);
            ws.getCell('A7').value = `Kỳ dữ liệu: ${filterText}`;
            ws.getCell('A7').font = { italic: true, size: 11, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('A7').alignment = { horizontal: 'center' };

            const headerRow = ws.getRow(9);
            headerRow.values = ['STT', 'Mã đơn hàng', 'Khách hàng', 'Ngày mua', 'Chi tiết sản phẩm', 'Tổng tiền (VNĐ)'];
            headerRow.height = 25;
            
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Manrope' };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = { top: { style: 'thin', color: { argb: 'FFFFFFFF' } }, left: { style: 'thin', color: { argb: 'FFFFFFFF' } }, bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }, right: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
            });

            donHangs.forEach((item, index) => {
                const row = ws.getRow(10 + index);
                row.values = [
                    index + 1,
                    item.MaDonHangHienThi || `#FC-${item.MaDH}`,
                    item.TenKH || 'Khách vãng lai',
                    new Date(item.NgayLapDon).toLocaleString('vi-VN'),
                    item.DanhSachHang,
                    Number(item.TongTien)
                ];
                row.height = 25;
                
                const isEven = index % 2 === 0;
                const rowFillColor = isEven ? 'FFFFFFFF' : 'FFF8F9FA';

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFillColor } };
                    cell.font = { size: 10, name: 'Manrope', color: { argb: 'FF222532' } };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
                    
                    if (colNumber === 1 || colNumber === 2 || colNumber === 4) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    } else if (colNumber === 6) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        cell.numFmt = '#,##0';
                        cell.font = { size: 10, name: 'Manrope', color: { argb: COLOR_PRIMARY }, bold: true };
                    } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    }
                });
            });

            const MaTK = req.user?.id || null;
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            
            const noiDungLog = `Xuất báo cáo doanh thu bán hàng ra file Excel (Tổng ${donHangs.length} đơn hàng).`;
            await db.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) 
                VALUES (?, 'ACCOUNT_EXPORT', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Bao_cao_doanh_thu_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error("Lỗi xuất Excel doanh thu:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel" });
        }
    },
    
    xuatExcelDashboard: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc } = req.query;
            
            let wherecondition = ["LatestStatus.MaTrangThai = 4"];
            let value = [];
            if(NgayBatDau) { wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
            if(NgayKetThuc) { wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }
            let whereClause = wherecondition.length > 0 ? " WHERE " + wherecondition.join(" AND ") : "";

            const [ [kpiData], [donHangs] ] = await Promise.all([
                db.query(`SELECT COUNT(DISTINCT dh.MaDH) as TongSoDonHang, IFNULL(SUM(dh.ThanhTien), 0) as TongDoanhThu, IFNULL(SUM(dh.ThanhTien - OrderImportCost.TotalImport), 0) as TongLoiNhuan FROM DonHang dh INNER JOIN (SELECT MaDH, SUM(COALESCE(GiaNhapThucTe, 0) * SoLuong) as TotalImport FROM ChiTietDonHang GROUP BY MaDH) OrderImportCost ON dh.MaDH = OrderImportCost.MaDH INNER JOIN (SELECT MaDH, MaTrangThai FROM ChiTietTrangThai WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)) LatestStatus ON dh.MaDH = LatestStatus.MaDH ${whereClause}`, value),
                db.query(`SELECT dh.MaDH, dh.MaDonHangHienThi, kh.TenKH, dh.NgayLapDon, dh.ThanhTien as TongTien, GROUP_CONCAT(mh.TenMH SEPARATOR ', ') as DanhSachHang FROM DonHang dh INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH INNER JOIN (SELECT MaDH, MaTrangThai FROM ChiTietTrangThai WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)) LatestStatus ON dh.MaDH = LatestStatus.MaDH INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH INNER JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh ${whereClause} GROUP BY dh.MaDH ORDER BY dh.NgayLapDon DESC`, value)
            ]);

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Hệ Thống FIGURECOLLECT';
            workbook.lastModifiedBy = 'Hệ Thống FIGURECOLLECT';
            workbook.created = new Date();
            workbook.modified = new Date();
            const COLOR_PRIMARY = 'FFFF8F73';

            const formatDateVN = (dateStr) => {
                if (!dateStr) return '';
                if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    if(parts.length === 3 && parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return dateStr;
            };

            const filterText = (NgayBatDau && NgayKetThuc) ? `Từ ${formatDateVN(NgayBatDau)} đến ${formatDateVN(NgayKetThuc)}` : 'Tất cả thời gian';

            const ws = workbook.addWorksheet('Báo cáo Nhanh Dashboard');
            ws.views = [{ showGridLines: false }];
            ws.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true };

            ws.columns = [
                { key: 'STT', width: 10 },
                { key: 'MaDH', width: 18 },
                { key: 'TenKH', width: 30 },
                { key: 'NgayLapDon', width: 22 },
                { key: 'DanhSachHang', width: 45 },
                { key: 'TongTien', width: 20 },
            ];

            const endCol = 'F';
            const maxCol = endCol.charCodeAt(0) - 64; 
            for (let i = 1; i <= 12; i++) {
                for (let j = 1; j <= maxCol; j++) {
                    ws.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                }
            }

            try {
                const path = require('path');
                const fs = require('fs');
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                if (fs.existsSync(logoPath)) {
                    const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
                    ws.addImage(logoId, { tl: { col: 0.1, row: 0.2 }, ext: { width: 70, height: 70 } });
                }
            } catch (err) {}

            ws.mergeCells(`B1:${endCol}1`);
            ws.getCell('B1').value = 'FIGURECOLLECT';
            ws.getCell('B1').font = { size: 22, bold: true, color: { argb: COLOR_PRIMARY }, name: 'Space Grotesk' };
            ws.getCell('B1').alignment = { vertical: 'bottom', horizontal: 'left' };

            ws.mergeCells(`B2:${endCol}2`);
            ws.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
            ws.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('B2').alignment = { vertical: 'top', horizontal: 'left' };
            
            ws.mergeCells(`A4:${endCol}4`);
            ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

            ws.mergeCells(`A5:${endCol}5`);
            ws.getCell('A5').value = 'BÁO CÁO NHANH TỔNG QUAN HỆ THỐNG';
            ws.getCell('A5').font = { size: 18, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
            ws.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

            ws.mergeCells(`A6:${endCol}6`);
            ws.getCell('A6').value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
            ws.getCell('A6').font = { italic: true, size: 11, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('A6').alignment = { horizontal: 'center' };

            ws.mergeCells(`A7:${endCol}7`);
            ws.getCell('A7').value = `Kỳ dữ liệu: ${filterText}`;
            ws.getCell('A7').font = { italic: true, size: 11, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('A7').alignment = { horizontal: 'center' };

            const kpiTongDoanhThu = kpiData[0]?.TongDoanhThu || 0;
            const kpiTongLoiNhuan = kpiData[0]?.TongLoiNhuan || 0;
            const kpiTongDon = kpiData[0]?.TongSoDonHang || 0;

            ws.getCell('B9').value = 'TỔNG DOANH THU THỰC TẾ';
            ws.getCell('B9').font = { size: 10, bold: true, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('B10').value = Number(kpiTongDoanhThu);
            ws.getCell('B10').numFmt = '#,##0" đ"';
            ws.getCell('B10').font = { size: 16, bold: true, color: { argb: COLOR_PRIMARY }, name: 'Space Grotesk' };

            ws.getCell('D9').value = 'LỢI NHUẬN RÒNG';
            ws.getCell('D9').font = { size: 10, bold: true, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('D10').value = Number(kpiTongLoiNhuan);
            ws.getCell('D10').numFmt = '#,##0" đ"';
            ws.getCell('D10').font = { size: 16, bold: true, color: { argb: 'FF10B981' }, name: 'Space Grotesk' };

            ws.getCell('F9').value = 'TỔNG ĐƠN HÀNG';
            ws.getCell('F9').font = { size: 10, bold: true, color: { argb: 'FF737580' }, name: 'Manrope' };
            ws.getCell('F10').value = Number(kpiTongDon);
            ws.getCell('F10').numFmt = '#,##0" đơn"';
            ws.getCell('F10').font = { size: 16, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };

            [9, 10].forEach(r => {
                ws.mergeCells(`B${r}:C${r}`);
                ws.mergeCells(`D${r}:E${r}`);
                ['B', 'D', 'F'].forEach(c => {
                    ws.getCell(`${c}${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
                    ws.getCell(`${c}${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F2' } }; 
                });
            });

            // Bảng dữ liệu
            const headerRow = ws.getRow(13);
            headerRow.values = ['STT', 'Mã đơn hàng', 'Khách hàng', 'Ngày mua', 'Chi tiết sản phẩm', 'Tổng tiền (VNĐ)'];
            headerRow.height = 25;
            
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Manrope' };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = { top: { style: 'thin', color: { argb: 'FFFFFFFF' } }, left: { style: 'thin', color: { argb: 'FFFFFFFF' } }, bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }, right: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
            });

            donHangs.forEach((item, index) => {
                const row = ws.getRow(14 + index);
                row.values = [
                    index + 1,
                    item.MaDonHangHienThi || `#FC-${item.MaDH}`,
                    item.TenKH || 'Khách vãng lai',
                    new Date(item.NgayLapDon).toLocaleString('vi-VN'),
                    item.DanhSachHang,
                    Number(item.TongTien)
                ];
                row.height = 25;
                
                const isEven = index % 2 === 0;
                const rowFillColor = isEven ? 'FFFFFFFF' : 'FFF8F9FA'; 

                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFillColor } };
                    cell.font = { size: 10, name: 'Manrope', color: { argb: 'FF222532' } };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
                    
                    if (colNumber === 1 || colNumber === 2 || colNumber === 4) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    } else if (colNumber === 6) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        cell.numFmt = '#,##0';
                        cell.font = { size: 10, name: 'Manrope', color: { argb: COLOR_PRIMARY }, bold: true };
                    } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    }
                });
            });

            const MaTK = req.user?.id || null;
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            
            const noiDungLog = `Xuất báo cáo nhanh tổng quan hệ thống (Dashboard) ra file Excel.`;
            await db.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) 
                VALUES (?, 'ACCOUNT_EXPORT', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Snapshot_Dashboard_FigureCollect_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error("Lỗi xuất Excel Dashboard:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel" });
        }
    },

    xuatExcelTuyChinh: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc, types } = req.query;
            
            const selectedTypes = types ? types.split(',') : [];
            if (selectedTypes.length === 0) {
                return res.status(400).json({ message: "Không có loại báo cáo nào được chọn" });
            }

            // --- 1. CHUẨN BỊ ĐIỀU KIỆN TRUY VẤN (WHERE CLAUSE) ---
            let whereSuccess = ["LatestStatus.MaTrangThai = 4"];
            let whereTimeOnlyArr = [];
            let valueTime = [];
            
            if (NgayBatDau) { 
                whereSuccess.push("dh.NgayLapDon >= ?"); 
                whereTimeOnlyArr.push("dh.NgayLapDon >= ?"); 
                valueTime.push(`${NgayBatDau} 00:00:00`); 
            }
            if (NgayKetThuc) { 
                whereSuccess.push("dh.NgayLapDon <= ?"); 
                whereTimeOnlyArr.push("dh.NgayLapDon <= ?");
                valueTime.push(`${NgayKetThuc} 23:59:59`); 
            }
            
            let whereClauseSuccess = whereSuccess.length > 0 ? " WHERE " + whereSuccess.join(" AND ") : "";
            let whereTimeOnly = whereTimeOnlyArr.length > 0 ? " WHERE " + whereTimeOnlyArr.join(" AND ") : "";

            const latestStatusJoin = `
                INNER JOIN (
                    SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                    WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
            `;

            const workbook = new ExcelJS.Workbook();            
            workbook.creator = 'Hệ Thống FIGURECOLLECT';
            workbook.lastModifiedBy = 'Hệ Thống FIGURECOLLECT';
            workbook.created = new Date();
            workbook.modified = new Date();
            const COLOR_PRIMARY = 'FFFF8F73';
            
            // --- 2. HÀM HỖ TRỢ ĐỊNH DẠNG (UI/UX EXCEL) ---
            const formatDateVN = (dateStr) => {
                if (!dateStr) return '';
                if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return dateStr;
            };

            const taoHeaderBaoCao = (ws, titleName, endCol = 'E') => {
                ws.views = [{ showGridLines: false }];
                ws.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true };

                const maxCol = endCol.charCodeAt(0) - 64; 
                for (let i = 1; i <= 8; i++) {
                    for (let j = 1; j <= maxCol; j++) {
                        ws.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                    }
                }

                try {
                    const path = require('path');
                    const fs = require('fs');
                    const logoPath = path.join(__dirname, '../../public/logo.png'); 
                    if (fs.existsSync(logoPath)) {
                        const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
                        // Chèn logo gọn trong cột A (STT)
                        ws.addImage(logoId, { tl: { col: 0.1, row: 0.2 }, ext: { width: 70, height: 70 } });
                    }
                } catch (err) { }

                ws.mergeCells(`B1:${endCol}1`);
                ws.getCell('B1').value = 'FIGURECOLLECT';
                ws.getCell('B1').font = { size: 22, bold: true, color: { argb: COLOR_PRIMARY }, name: 'Space Grotesk' };
                ws.getCell('B1').alignment = { vertical: 'bottom', horizontal: 'left' };

                ws.mergeCells(`B2:${endCol}2`);
                ws.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
                ws.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' }, name: 'Manrope' };
                ws.getCell('B2').alignment = { vertical: 'top', horizontal: 'left' };

                ws.mergeCells(`A4:${endCol}4`);
                ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

                ws.mergeCells(`A5:${endCol}5`);
                const titleCell = ws.getCell('A5');
                titleCell.value = titleName.toUpperCase();
                titleCell.font = { size: 18, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                titleCell.alignment = { horizontal: 'center', vertical: 'middle' }; 

                const filterText = (NgayBatDau && NgayKetThuc) ? `Từ ${formatDateVN(NgayBatDau)} đến ${formatDateVN(NgayKetThuc)}` : 'Toàn thời gian';
                
                ws.mergeCells(`A6:${endCol}6`);
                ws.getCell('A6').value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`;
                ws.getCell('A6').font = { italic: true, size: 11, color: { argb: 'FF737580' }, name: 'Manrope' };
                ws.getCell('A6').alignment = { horizontal: 'center' };

                ws.mergeCells(`A7:${endCol}7`);
                ws.getCell('A7').value = `Kỳ dữ liệu: ${filterText}`;
                ws.getCell('A7').font = { italic: true, size: 11, color: { argb: 'FF737580' }, name: 'Manrope' };
                ws.getCell('A7').alignment = { horizontal: 'center' };
            };

            const dinhDangHeaderBang = (row) => {
                row.height = 25;
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARY } };
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Manrope' };
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFFFFFFF' } }, left: { style: 'thin', color: { argb: 'FFFFFFFF' } }, bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }, right: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
                });
            };

            const dinhDangDongDuLieu = (row, index, centerCols = [], rightCols = []) => {
                const fillStyle = { type: 'pattern', pattern: 'solid', fgColor: { argb: (index % 2 === 0) ? 'FFFFFFFF' : 'FFF8F9FA' } };
                row.height = 25;
                row.eachCell({ includeEmpty: true }, (cell, colNum) => {
                    cell.fill = fillStyle;
                    cell.font = { size: 10, name: 'Manrope', color: { argb: 'FF222532' } };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
                    
                    if (centerCols.includes(colNum)) cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    else if (rightCols.includes(colNum)) cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    else cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                });
            };

            // ==============================================================
            // BÁO CÁO THỐNG KÊ DOANH SỐ BÁN HÀNG
            // ==============================================================
            if (selectedTypes.includes('doanhso')) {
                // Truy vấn 1: Doanh thu theo tháng
                const [resBieuDoThang] = await db.query(`SELECT DATE_FORMAT(dh.NgayLapDon, '%m/%Y') as Thang, COUNT(dh.MaDH) as SoDon, IFNULL(SUM(dh.ThanhTien), 0) as DoanhThuThang FROM DonHang dh ${latestStatusJoin} ${whereClauseSuccess} GROUP BY Thang ORDER BY MAX(dh.NgayLapDon) ASC`, valueTime);
                
                // Truy vấn 2: Doanh thu theo ngày
                const [resBieuDoNgay] = await db.query(`SELECT DATE_FORMAT(dh.NgayLapDon, '%d/%m/%Y') as Ngay, COUNT(dh.MaDH) as SoDon, IFNULL(SUM(dh.ThanhTien), 0) as DoanhThuNgay FROM DonHang dh ${latestStatusJoin} ${whereClauseSuccess} GROUP BY Ngay ORDER BY MAX(dh.NgayLapDon) ASC`, valueTime);

                // Truy vấn 3: Chi tiết đơn hàng tạo nên doanh thu
                const [resDonHangChiTiet] = await db.query(`SELECT dh.MaDonHangHienThi, COALESCE(kh.TenKH, dh.TenNguoiNhan) AS KhachHang, dh.NgayLapDon, dh.ThanhTien FROM DonHang dh LEFT JOIN KhachHang kh ON dh.MaKH = kh.MaKH ${latestStatusJoin} ${whereClauseSuccess} ORDER BY dh.NgayLapDon DESC`, valueTime);

                const ws1 = workbook.addWorksheet('Báo cáo doanh số');
                ws1.columns = [
                    { key: 'A', width: 10 }, 
                    { key: 'B', width: 25 }, 
                    { key: 'C', width: 35 }, 
                    { key: 'D', width: 25 }, 
                    { key: 'E', width: 25 }
                ];
                taoHeaderBaoCao(ws1, 'BÁO CÁO THỐNG KÊ DOANH SỐ BÁN HÀNG', 'E');

                let currentRow = 9;

                // --- BẢNG 1: TỔNG HỢP DOANH THU ---
                ws1.mergeCells(`A${currentRow}:E${currentRow}`);
                ws1.getCell(`A${currentRow}`).value = 'I. TỔNG HỢP DOANH THU';
                ws1.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowThang = ws1.getRow(currentRow);
                hRowThang.values = ['STT', 'Tháng', 'Số đơn hoàn thành', 'Tổng doanh thu', 'Ghi chú'];
                dinhDangHeaderBang(hRowThang);
                currentRow++;

                resBieuDoThang.forEach((row, i) => {
                    const r = ws1.getRow(currentRow);
                    r.values = [i + 1, `Tháng ${row.Thang}`, Number(row.SoDon), Number(row.DoanhThuThang), ''];
                    dinhDangDongDuLieu(r, i, [1, 2, 3], [4]);
                    r.getCell(4).numFmt = '#,##0" đ"';
                    r.getCell(4).font = { bold: true, color: { argb: COLOR_PRIMARY } };
                    currentRow++;
                });

                currentRow += 2;

                // --- BẢNG 2: CHI TIẾT DOANH THU THEO NGÀY ---
                ws1.mergeCells(`A${currentRow}:E${currentRow}`);
                ws1.getCell(`A${currentRow}`).value = 'II. CHI TIẾT DOANH THU THEO NGÀY';
                ws1.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowNgay = ws1.getRow(currentRow);
                hRowNgay.values = ['STT', 'Ngày ghi nhận', 'Số đơn hoàn thành', 'Doanh thu thu về', 'Ghi chú'];
                dinhDangHeaderBang(hRowNgay);
                currentRow++;

                resBieuDoNgay.forEach((row, i) => {
                    const r = ws1.getRow(currentRow);
                    r.values = [i + 1, row.Ngay, Number(row.SoDon), Number(row.DoanhThuNgay), ''];
                    dinhDangDongDuLieu(r, i, [1, 2, 3], [4]);
                    r.getCell(4).numFmt = '#,##0" đ"';
                    r.getCell(4).font = { bold: true, color: { argb: COLOR_PRIMARY } };
                    currentRow++;
                });

                currentRow += 2; 

                // --- BẢNG 3: DANH SÁCH ĐƠN HÀNG CHI TIẾT ---
                ws1.mergeCells(`A${currentRow}:E${currentRow}`);
                ws1.getCell(`A${currentRow}`).value = 'III. DANH SÁCH ĐƠN HÀNG ĐÃ THANH TOÁN (HOÀN THÀNH)';
                ws1.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowDon = ws1.getRow(currentRow);
                hRowDon.values = ['STT', 'Mã đơn hàng', 'Khách hàng', 'Ngày mua', 'Tổng tiền (VNĐ)'];
                dinhDangHeaderBang(hRowDon);
                currentRow++;

                resDonHangChiTiet.forEach((row, i) => {
                    const r = ws1.getRow(currentRow);
                    r.values = [
                        i + 1, 
                        row.MaDonHangHienThi, 
                        row.KhachHang || 'Khách vãng lai', 
                        new Date(row.NgayLapDon).toLocaleString('vi-VN'), 
                        Number(row.ThanhTien)
                    ];
                    dinhDangDongDuLieu(r, i, [1, 2, 4], [5]);
                    r.getCell(5).numFmt = '#,##0'; // Ép định dạng phân cách hàng nghìn
                    currentRow++;
                });
            }

            // ==============================================================
            // BÁO CÁO THỐNG KÊ HÀNG TỒN KHO
            // ==============================================================
            if (selectedTypes.includes('tonkho')) {
                const [resTonKho] = await db.query(`SELECT mh.TenMH, pl.ChiTietPhanLoai, pl.SoLuong, dm.TenDM FROM PhanLoai pl INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh INNER JOIN DanhMuc dm ON mh.MaDM = dm.MaDM ORDER BY pl.SoLuong ASC`);
                
                const ws2 = workbook.addWorksheet('Báo cáo tồn kho');
                ws2.columns = [{ key: 'A', width: 10 }, { key: 'B', width: 45 }, { key: 'C', width: 25 }, { key: 'D', width: 25 }, { key: 'E', width: 18 }];
                taoHeaderBaoCao(ws2, 'BÁO CÁO THỐNG KÊ HÀNG TỒN KHO', 'E');

                const hRow2 = ws2.getRow(9);
                hRow2.values = ['STT', 'Tên Mô Hình', 'Danh Mục', 'Phân Loại', 'Số Lượng Tồn'];
                dinhDangHeaderBang(hRow2);
                
                resTonKho.forEach((row, i) => {
                    const r = ws2.getRow(10 + i);
                    r.values = [i + 1, row.TenMH, row.TenDM, row.ChiTietPhanLoai, Number(row.SoLuong)];
                    dinhDangDongDuLieu(r, i, [1, 3, 4, 5], []);
                    
                    if(row.SoLuong <= 5) r.getCell(5).font = { color: { argb: 'FFEF4444' }, bold: true };
                });
            }

            // ==============================================================
            // BÁO CÁO THỐNG KÊ CHƯƠNG TRÌNH KHUYẾN MÃI
            // ==============================================================
            if (selectedTypes.includes('khuyenmai')) {
                // Truy vấn 1: Hiệu quả của Khuyến Mãi (Flash Sale, Giảm giá trực tiếp sản phẩm)
                const sql_km = `
                    SELECT km.TenKM, COUNT(DISTINCT log.MaDH) as TongDonHang, IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam, IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong 
                    FROM KhuyenMai km 
                    INNER JOIN LogSuDungKhuyenMai log ON km.MaKM = log.MaKM 
                    INNER JOIN DonHang dh ON dh.MaDH = log.MaDH ${latestStatusJoin} 
                    INNER JOIN (SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong) as LoiNhuanGoc FROM ChiTietDonHang ctdh GROUP BY ctdh.MaDH) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH 
                    ${whereClauseSuccess} 
                    GROUP BY km.MaKM, km.TenKM ORDER BY TongDonHang DESC
                `;

                // Truy vấn 2: Hiệu quả của Mã Giảm Giá (Voucher, Coupon áp dụng cho tổng đơn)
                const sql_magg = `
                    SELECT ma.TenMaGiamGia, COUNT(DISTINCT log.MaDH) as TongDonHang, IFNULL(SUM(log.SoTienDaGiam), 0) as TongTienDaGiam, IFNULL(SUM(LoiNhuan.LoiNhuanGoc) - SUM(log.SoTienDaGiam), 0) as LoiNhuanRong 
                    FROM MaGiamGia ma 
                    INNER JOIN LogSuDungMaGiamGia log ON ma.MaGG = log.MaGG 
                    INNER JOIN DonHang dh ON dh.MaDH = log.MaDH ${latestStatusJoin} 
                    INNER JOIN (SELECT ctdh.MaDH, SUM((ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, 0)) * ctdh.SoLuong) as LoiNhuanGoc FROM ChiTietDonHang ctdh GROUP BY ctdh.MaDH) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH 
                    ${whereClauseSuccess} 
                    GROUP BY ma.MaGG, ma.TenMaGiamGia ORDER BY TongDonHang DESC
                `;

                const [[resKhuyenMai], [resMaGiamGia]] = await Promise.all([
                    db.query(sql_km, valueTime),
                    db.query(sql_magg, valueTime)
                ]);
                
                const ws3 = workbook.addWorksheet('Báo cáo khuyến mãi');
                ws3.columns = [
                    { key: 'A', width: 10 }, 
                    { key: 'B', width: 45 }, 
                    { key: 'C', width: 20 }, 
                    { key: 'D', width: 25 }, 
                    { key: 'E', width: 25 }
                ];
                taoHeaderBaoCao(ws3, 'BÁO CÁO HIỆU QUẢ MARKETING VÀ ƯU ĐÃI', 'E');

                let currentRow = 9;

                // --- BẢNG 1: CHIẾN DỊCH KHUYẾN MÃI (FLASH SALE) ---
                ws3.mergeCells(`A${currentRow}:E${currentRow}`);
                ws3.getCell(`A${currentRow}`).value = 'I. HIỆU QUẢ CHIẾN DỊCH GIẢM GIÁ TRỰC TIẾP (FLASH SALE / CAMPAIGN)';
                ws3.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowKM = ws3.getRow(currentRow);
                hRowKM.values = ['STT', 'Tên Chiến Dịch Khuyến Mãi', 'Số Đơn Chuyển Đổi', 'Ngân Sách Đã Chi (VNĐ)', 'Lợi Nhuận Ròng (VNĐ)'];
                dinhDangHeaderBang(hRowKM);
                currentRow++;
                
                if (resKhuyenMai.length > 0) {
                    resKhuyenMai.forEach((row, i) => {
                        const r = ws3.getRow(currentRow);
                        r.values = [i + 1, row.TenKM, Number(row.TongDonHang), Number(row.TongTienDaGiam), Number(row.LoiNhuanRong)];
                        dinhDangDongDuLieu(r, i, [1, 3], [4, 5]);
                        r.getCell(4).numFmt = '#,##0" đ"'; 
                        r.getCell(4).font = { bold: true, color: { argb: 'FFEF4444' } }; // Đỏ (Chi phí)
                        r.getCell(5).numFmt = '#,##0" đ"';
                        r.getCell(5).font = { bold: true, color: { argb: 'FF10B981' } }; // Xanh lá (Lợi nhuận)
                        currentRow++;
                    });
                } else {
                    const r = ws3.getRow(currentRow);
                    r.values = ['', 'Không có chiến dịch khuyến mãi nào phát sinh trong kỳ', '', '', ''];
                    ws3.mergeCells(`B${currentRow}:E${currentRow}`);
                    dinhDangDongDuLieu(r, 1, [], []);
                    r.getCell(2).font = { italic: true, color: { argb: 'FF737580' } };
                    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
                    currentRow++;
                }

                currentRow += 3;

                // --- BẢNG 2: MÃ GIẢM GIÁ (VOUCHER) ---
                ws3.mergeCells(`A${currentRow}:E${currentRow}`);
                ws3.getCell(`A${currentRow}`).value = 'II. HIỆU QUẢ SỬ DỤNG MÃ GIẢM GIÁ (VOUCHER / COUPON)';
                ws3.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowMG = ws3.getRow(currentRow);
                hRowMG.values = ['STT', 'Tên Mã Giảm Giá / Voucher', 'Số Lượt Sử Dụng', 'Ngân Sách Đã Chi (VNĐ)', 'Lợi Nhuận Ròng (VNĐ)'];
                dinhDangHeaderBang(hRowMG);
                currentRow++;
                
                if (resMaGiamGia.length > 0) {
                    resMaGiamGia.forEach((row, i) => {
                        const r = ws3.getRow(currentRow);
                        r.values = [i + 1, row.TenMaGiamGia, Number(row.TongDonHang), Number(row.TongTienDaGiam), Number(row.LoiNhuanRong)];
                        dinhDangDongDuLieu(r, i, [1, 3], [4, 5]);
                        r.getCell(4).numFmt = '#,##0" đ"'; 
                        r.getCell(4).font = { bold: true, color: { argb: 'FFEF4444' } }; 
                        r.getCell(5).numFmt = '#,##0" đ"';
                        r.getCell(5).font = { bold: true, color: { argb: 'FF10B981' } }; 
                        currentRow++;
                    });
                } else {
                    const r = ws3.getRow(currentRow);
                    r.values = ['', 'Không có mã giảm giá nào được sử dụng trong kỳ', '', '', ''];
                    ws3.mergeCells(`B${currentRow}:E${currentRow}`);
                    dinhDangDongDuLieu(r, 1, [], []);
                    r.getCell(2).font = { italic: true, color: { argb: 'FF737580' } };
                    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
                    currentRow++;
                }
            }

            // ==============================================================
            // THỐNG KÊ PHẢN HỒI, ĐÁNH GIÁ KHÁCH HÀNG
            // ==============================================================
            if (selectedTypes.includes('danhgia')) {
                let whereDG = ""; let valuesDG = [];
                let whereLH = ""; let valuesLH = [];
                
                if(NgayBatDau) { 
                    whereDG += " AND dg.ThoiGianDG >= ?"; valuesDG.push(`${NgayBatDau} 00:00:00`); 
                    whereLH += " AND NgayGui >= ?"; valuesLH.push(`${NgayBatDau} 00:00:00`); 
                }
                if(NgayKetThuc) { 
                    whereDG += " AND dg.ThoiGianDG <= ?"; valuesDG.push(`${NgayKetThuc} 23:59:59`); 
                    whereLH += " AND NgayGui <= ?"; valuesLH.push(`${NgayKetThuc} 23:59:59`); 
                }

                // Truy vấn 1: Tổng hợp theo số sao
                const [resSao] = await db.query(`SELECT SoSao, COUNT(*) as SoLuong FROM DanhGia dg WHERE 1=1 ${whereDG} GROUP BY SoSao ORDER BY SoSao DESC`, valuesDG);
                
                // Truy vấn 2: Thống kê điểm trung bình theo từng sản phẩm (MỚI)
                const [resSanPham] = await db.query(`SELECT mh.TenMH, ROUND(AVG(dg.SoSao), 1) as DiemTB, COUNT(dg.MaDG) as LuotDanhGia FROM DanhGia dg INNER JOIN MoHinh mh ON dg.MaMH = mh.MaMoHinh WHERE 1=1 ${whereDG} GROUP BY mh.MaMoHinh, mh.TenMH ORDER BY DiemTB DESC, LuotDanhGia DESC`, valuesDG);

                // Truy vấn 3: Chi tiết đánh giá
                const [resDanhGia] = await db.query(`SELECT kh.TenKH, mh.TenMH, dg.SoSao, dg.NoiDung, dg.ThoiGianDG FROM DanhGia dg INNER JOIN KhachHang kh ON dg.MaKH = kh.MaKH INNER JOIN MoHinh mh ON dg.MaMH = mh.MaMoHinh WHERE 1=1 ${whereDG} ORDER BY dg.ThoiGianDG DESC`, valuesDG);
                
                // Truy vấn 4: Chi tiết tin nhắn liên hệ/góp ý
                const [resLienHe] = await db.query(`SELECT HoTen, SDT, NoiDung, TrangThai, NgayGui FROM LienHe WHERE 1=1 ${whereLH} ORDER BY NgayGui DESC`, valuesLH);

                const ws4 = workbook.addWorksheet('Báo cáo phản hồi');
                ws4.columns = [
                    { key: 'A', width: 10 }, 
                    { key: 'B', width: 25 }, 
                    { key: 'C', width: 45 }, 
                    { key: 'D', width: 15 }, 
                    { key: 'E', width: 50 }, 
                    { key: 'F', width: 22 }
                ];
                taoHeaderBaoCao(ws4, 'THỐNG KÊ PHẢN HỒI VÀ ĐÁNH GIÁ', 'F');

                let currentRow = 9;

                // --- BẢNG 1: TỔNG HỢP THEO SỐ SAO ---
                ws4.mergeCells(`A${currentRow}:F${currentRow}`);
                ws4.getCell(`A${currentRow}`).value = 'I. TỔNG HỢP ĐÁNH GIÁ SẢN PHẨM THEO MỨC ĐỘ HÀI LÒNG (SỐ SAO)';
                ws4.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowSao = ws4.getRow(currentRow);
                hRowSao.values = ['STT', 'Mức độ', 'Số sao', 'Số lượng đánh giá', '', '']; 
                dinhDangHeaderBang(hRowSao);
                ws4.mergeCells(`D${currentRow}:F${currentRow}`); 
                currentRow++;

                let tongSao = 0; let tongLuot = 0;
                resSao.forEach((row, i) => {
                    tongSao += (row.SoSao * row.SoLuong);
                    tongLuot += row.SoLuong;
                    
                    let mucDo = 'Tệ';
                    if (row.SoSao >= 4) mucDo = 'Tốt';
                    else if (row.SoSao === 3) mucDo = 'Khá';
                    
                    const r = ws4.getRow(currentRow);
                    r.values = [i + 1, mucDo, `${row.SoSao} Sao`, row.SoLuong, '', ''];
                    dinhDangDongDuLieu(r, i, [1, 2, 3, 4], []);
                    ws4.mergeCells(`D${currentRow}:F${currentRow}`);
                    
                    if(row.SoSao >= 4) r.getCell(2).font = { bold: true, color: { argb: 'FF10B981' } }; 
                    else if(row.SoSao <= 2) r.getCell(2).font = { bold: true, color: { argb: 'FFEF4444' } }; 
                    currentRow++;
                });

                const diemTB = tongLuot > 0 ? (tongSao / tongLuot).toFixed(1) : 0;
                ws4.mergeCells(`A${currentRow}:C${currentRow}`);
                ws4.getCell(`A${currentRow}`).value = 'ĐIỂM ĐÁNH GIÁ TRUNG BÌNH TOÀN HỆ THỐNG';
                ws4.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF222532' } };
                ws4.getCell(`A${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
                
                ws4.mergeCells(`D${currentRow}:F${currentRow}`);
                ws4.getCell(`D${currentRow}`).value = `${diemTB} / 5.0 Sao`;
                ws4.getCell(`D${currentRow}`).font = { bold: true, size: 12, color: { argb: COLOR_PRIMARY } };
                ws4.getCell(`D${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
                
                ['A', 'D'].forEach(col => {
                    ws4.getCell(`${col}${currentRow}`).border = { top: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };
                });
                
                currentRow += 3;

                // --- BẢNG 2: THỐNG KÊ ĐÁNH GIÁ THEO TỪNG SẢN PHẨM ---
                ws4.mergeCells(`A${currentRow}:F${currentRow}`);
                ws4.getCell(`A${currentRow}`).value = 'II. BẢNG XẾP HẠNG ĐIỂM ĐÁNH GIÁ THEO TỪNG SẢN PHẨM';
                ws4.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowSP = ws4.getRow(currentRow);
                hRowSP.values = ['STT', 'Tên Mô Hình', '', 'Điểm Trung Bình', 'Số Lượt Đánh Giá', '']; 
                dinhDangHeaderBang(hRowSP);
                ws4.mergeCells(`B${currentRow}:C${currentRow}`); 
                ws4.mergeCells(`E${currentRow}:F${currentRow}`); 
                currentRow++;
                
                resSanPham.forEach((row, i) => {
                    const r = ws4.getRow(currentRow);
                    r.values = [i + 1, row.TenMH, '', `${row.DiemTB} / 5.0`, row.LuotDanhGia, ''];
                    dinhDangDongDuLieu(r, i, [1, 4, 5], []);
                    ws4.mergeCells(`B${currentRow}:C${currentRow}`);
                    ws4.mergeCells(`E${currentRow}:F${currentRow}`);
                    
                    // Highlight màu điểm trung bình
                    if(row.DiemTB >= 4.0) r.getCell(4).font = { bold: true, color: { argb: 'FF10B981' } }; 
                    else if(row.DiemTB < 3.0) r.getCell(4).font = { bold: true, color: { argb: 'FFEF4444' } };
                    currentRow++;
                });

                currentRow += 3;

                // --- BẢNG 3: CHI TIẾT ĐÁNH GIÁ ---
                ws4.mergeCells(`A${currentRow}:F${currentRow}`);
                ws4.getCell(`A${currentRow}`).value = 'III. CHI TIẾT NỘI DUNG ĐÁNH GIÁ';
                ws4.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowDG = ws4.getRow(currentRow);
                hRowDG.values = ['STT', 'Khách Hàng', 'Sản Phẩm', 'Số Sao', 'Nội Dung Đánh Giá', 'Thời Gian'];
                dinhDangHeaderBang(hRowDG);
                currentRow++;
                
                resDanhGia.forEach((row, i) => {
                    const r = ws4.getRow(currentRow);
                    r.values = [i + 1, row.TenKH, row.TenMH, `${row.SoSao} Sao`, row.NoiDung, new Date(row.ThoiGianDG).toLocaleString('vi-VN')];
                    dinhDangDongDuLieu(r, i, [1, 4, 6], []);
                    currentRow++;
                });

                currentRow += 3;

                // --- BẢNG 4: DANH SÁCH LIÊN HỆ ---
                ws4.mergeCells(`A${currentRow}:F${currentRow}`);
                ws4.getCell(`A${currentRow}`).value = 'IV. DANH SÁCH GÓP Ý & LIÊN HỆ TỪ KHÁCH HÀNG';
                ws4.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FF222532' }, name: 'Space Grotesk' };
                currentRow++;

                const hRowLH = ws4.getRow(currentRow);
                hRowLH.values = ['STT', 'Người Liên Hệ', 'Số Điện Thoại', 'Tình Trạng', 'Nội Dung Góp Ý / Hỏi Đáp', 'Ngày Gửi'];
                dinhDangHeaderBang(hRowLH);
                currentRow++;
                
                resLienHe.forEach((row, i) => {
                    const r = ws4.getRow(currentRow);
                    const tinhTrang = row.TrangThai === 1 ? 'Đã xử lý' : 'Chưa xử lý';
                    r.values = [i + 1, row.HoTen, row.SDT || 'Không cung cấp', tinhTrang, row.NoiDung, new Date(row.NgayGui).toLocaleString('vi-VN')];
                    dinhDangDongDuLieu(r, i, [1, 3, 4, 6], []);
                    
                    if (row.TrangThai === 0) r.getCell(4).font = { bold: true, color: { argb: 'FFEF4444' } }; 
                    else r.getCell(4).font = { bold: true, color: { argb: 'FF10B981' } }; 
                    currentRow++;
                });
            }

            // ==============================================================
            // BÁO CÁO THỐNG KÊ ĐƠN HÀNG
            // ==============================================================
            if (selectedTypes.includes('donhang')) {
                // Đếm số lượng đơn hàng theo từng trạng thái
                const sql_donhang = `
                    SELECT tt.TenTrangThai, COUNT(DISTINCT dh.MaDH) as SoLuongDon
                    FROM DonHang dh
                    INNER JOIN (
                        SELECT MaDH, MaTrangThai FROM ChiTietTrangThai
                        WHERE (MaDH, Thoigian) IN (SELECT MaDH, MAX(Thoigian) FROM ChiTietTrangThai GROUP BY MaDH)
                    ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                    INNER JOIN TrangThai tt ON LatestStatus.MaTrangThai = tt.MaTrangThai
                    ${whereTimeOnly}
                    GROUP BY tt.TenTrangThai
                `;
                const [resTrangThai] = await db.query(sql_donhang, valueTime);
                
                const ws5 = workbook.addWorksheet('Báo cáo đơn hàng');
                ws5.columns = [{ key: 'A', width: 10 }, { key: 'B', width: 35 }, { key: 'C', width: 25 }, { key: 'D', width: 30 }];
                taoHeaderBaoCao(ws5, 'BÁO CÁO THỐNG KÊ ĐƠN HÀNG', 'D');

                const hRow5 = ws5.getRow(9);
                hRow5.values = ['STT', 'Trạng Thái Đơn Hàng', 'Số Lượng Đơn', 'Ghi Chú'];
                dinhDangHeaderBang(hRow5);
                
                resTrangThai.forEach((row, i) => {
                    const r = ws5.getRow(10 + i);
                    r.values = [i + 1, row.TenTrangThai, Number(row.SoLuongDon), ''];
                    dinhDangDongDuLieu(r, i, [1, 3], []);
                    r.getCell(3).numFmt = '#,##0" đơn"';
                    r.getCell(3).font = { bold: true, color: { argb: 'FF222532' } }; 
                });
            }

            // ==============================================================
            // BÁO CÁO THỐNG KÊ NHẬT KÝ HOẠT ĐỘNG
            // ==============================================================
            if (selectedTypes.includes('nhatky')) {
                let whereLog = "";
                let valuesLog = [];
                if(NgayBatDau) { whereLog += " AND log.ThoiGian >= ?"; valuesLog.push(`${NgayBatDau} 00:00:00`); }
                if(NgayKetThuc) { whereLog += " AND log.ThoiGian <= ?"; valuesLog.push(`${NgayKetThuc} 23:59:59`); }

                const [resNhatKy] = await db.query(`SELECT tk.TenDN, log.LoaiLog, log.NoiDung, log.ThoiGian FROM LogHoatDongTaiKhoan log LEFT JOIN TaiKhoan tk ON log.MaTK = tk.MaTK WHERE 1=1 ${whereLog} ORDER BY log.ThoiGian DESC`, valuesLog);
                
                const ws6 = workbook.addWorksheet('Báo cáo nhật ký');
                ws6.columns = [{ key: 'A', width: 10 }, { key: 'B', width: 25 }, { key: 'C', width: 30 }, { key: 'D', width: 55 }, { key: 'E', width: 22 }];
                taoHeaderBaoCao(ws6, 'THỐNG KÊ NHẬT KÝ HOẠT ĐỘNG', 'E');

                const hRow6 = ws6.getRow(9);
                hRow6.values = ['STT', 'Người Thực Hiện', 'Hành Động / Cờ Log', 'Nội Dung Chi Tiết', 'Thời Gian Ghi Nhận'];
                dinhDangHeaderBang(hRow6);
                
                resNhatKy.forEach((row, i) => {
                    const r = ws6.getRow(10 + i);
                    r.values = [i + 1, row.TenDN || 'Hệ thống', row.LoaiLog, row.NoiDung, new Date(row.ThoiGian).toLocaleString('vi-VN')];
                    dinhDangDongDuLieu(r, i, [1, 2, 3, 5], []);
                });
            }

            const MaTK = req.user?.id || null;
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            
            const noiDungLog = `Xuất báo cáo tùy chỉnh đa luồng ra file Excel. Các module bao gồm: [${selectedTypes.join(', ')}].`;
            await db.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) 
                VALUES (?, 'ACCOUNT_EXPORT', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Bao_Cao_Tong_Hop_FigureCollect_${Date.now()}.xlsx`);

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