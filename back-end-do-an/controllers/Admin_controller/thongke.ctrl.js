const db = require('../../config/db');
const ExcelJS = require('exceljs');

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
            const formattedData = data.map(item => ({
                ...item,
                image: item.image ? `http://localhost:3000/Images_product/${item.image}` : 'https://via.placeholder.com/150'
            }));

            res.status(200).json({
                success: true,
                data: formattedData
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
                        IFNULL(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) as DoanhThuNgay
                        FROM DonHang dh
                        INNER JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH
                        INNER JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                        ${whereClause}
                        GROUP BY DATE(dh.NgayLapDon)
                        ORDER BY DATE(dh.NgayLapDon) ASC`;
            const [result] = await db.query(sql, value);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    },

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

            worksheet.columns = [
                { header: 'Mã Đơn', key: 'MaDH', width: 10 },
                { header: 'Khách Hàng', key: 'TenKH', width: 25 },
                { header: 'Ngày Lập', key: 'NgayLapDon', width: 20 },
                { header: 'Chi Tiết Sản Phẩm', key: 'DanhSachHang', width: 40 },
                { header: 'Tổng Tiền (VNĐ)', key: 'TongTien', width: 20 },
            ];

            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };

            donHangs.forEach(item => {
                worksheet.addRow({
                    MaDH: item.MaDH,
                    TenKH: item.TenKH,
                    NgayLapDon: new Date(item.NgayLapDon).toLocaleString('vi-VN'),
                    DanhSachHang: item.DanhSachHang,
                    TongTien: item.TongTien
                });
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
    }
}

module.exports = thongke;