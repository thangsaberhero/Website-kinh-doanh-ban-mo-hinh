const db = require('../../config/db');
const ExcelJS = require('exceljs');

const thongke = {
    thongkedoanhthu: async (req,res) => {
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

            let whereClause = wherecondition.length > 0? "Where " + wherecondition.join(" and ") : "";

            const sql_core = `Select 
                                Count(Distinct dh.MaDH) as TongSoDonHang,
                                Sum(ctdh.DonGiaBan * ctdh.SoLuong) as TongDoanhThu,
                                Sum((ctdh.DonGiaBan - mh.GiaNhap) * ctdh.SoLuong) as TongLoiNhuan,
                                from DonHang dh
                                inner join ChiTietDonHang ctdh on dh.MaDH = ctdh.MaDH
                                inner join PhanLoai pl on ctdh.MaMoHinh = pl.MaPhanLoai
                                inner join MoHinh mh on mh.MaMoHinh = pl.MaMoHinh
                                ${whereClause}
                                GROUP BY DATE(dh.NgayLapDon)`;
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
            console.error("Lỗi khi thống kê dữ liệu: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi thống kê dữ liệu!"
            });
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

            let whereClause = wherecondition.length > 0? "Where " + wherecondition.join(" and ") : "";

            const sql_mh = `Select mh.MaMoHinh, mh.TenMH,
                                Sum(ctdh.DonGiaBan - mh.GiaNhap) as TongLoiNhuan,
                                Sum(ctdh.SoLuong) as TongSoSP
                                from MoHinh mh
                                inner join PhanLoai pl on pl.MaMoHinh = mh.MaMoHinh
                                inner join DonHang dh on dh.MaDH = ctdh.MaDH
                                inner join ChiTietDonHang ctdh on pl.MaPhanLoai = ctdh.MaMoHinh
                                ${whereClause}
                                GROUP BY mh.MaMoHinh, mh.TenMH
                                ORDER BY TongSoSP DESC
                                LIMIT 10
                                `;
            const [result_mh] = await db.query(sql_mh,value);    

            const sql_dm = `Select dm.MaDM, dm.TenDM,
                                Sum((ctdh.DonGiaBan - mh.GiaNhap) * ctdh.SoLuong) as TongLoiNhuan,
                                Sum(ctdh.SoLuong) as TongSoSP
                                from DanhMuc dm
                                inner join MoHinh mh on mh.MaDM = dm.MaDM
                                inner join PhanLoai pl on pl.MaMoHinh = mh.MaMoHinh
                                inner join DonHang dh on dh.MaDH = ctdh.MaDH
                                inner join ChiTietDonHang ctdh on pl.MaPhanLoai = ctdh.MaMoHinh
                                ${whereClause}
                                GROUP BY dm.MaDM, dm.TenDM
                                ORDER BY TongSoSP DESC
                                `;
            const [result_dm] = await db.query(sql_dm,value);   

            const sql_ctdm = `Select ctdm.MaChiTietDM, ctdm.TenChiTietDM,
                                Sum((ctdh.DonGiaBan - mh.GiaNhap) * ctdh.SoLuong) as TongLoiNhuan,
                                Sum(ctdh.SoLuong) as TongSoSP
                                from ChiTietDanhMuc ctdm
                                inner join MoHinh mh on mh.MaChiTietDM = ctdm.MaChiTietDM
                                inner join PhanLoai pl on pl.MaMoHinh = mh.MaMoHinh
                                inner join DonHang dh on dh.MaDH = ctdh.MaDH
                                inner join ChiTietDonHang ctdh on pl.MaPhanLoai = ctdh.MaMoHinh
                                ${whereClause}\
                                GROUP BY ctdm.MaChiTietDM, ctdm.TenChiTietDM
                                ORDER BY TongSoSP DESC
                                `;
            const [result_ctdm] = await db.query(sql_ctdm,value);   

            const sql_hsx = `Select hsx.MaHSX, hsx.TenHSX,
                                Sum(ctdh.DonGiaBan - mh.GiaNhap) as TongLoiNhuan,
                                Sum(ctdh.SoLuong) as TongSoSP
                                from HangSanXuat hsx
                                inner join MoHinh mh on mh.MaChiTietDM = ctdm.MaChiTietDM
                                inner join PhanLoai pl on pl.MaMoHinh = mh.MaMoHinh
                                inner join DonHang dh on dh.MaDH = ctdh.MaDH
                                inner join ChiTietDonHang ctdh on pl.MaPhanLoai = ctdh.MaMoHinh
                                ${whereClause}
                                GROUP BY mh.MaMoHinh, mh.TenMH
                                ORDER BY TongSoSP DESC
                                LIMIT 10
                                `;
            const [result_hsx] = await db.query(sql_mh,value);   

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
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi thống kê dữ liệu sản phẩm!"
            });
        }
    },

    thongkehieuquakhuyenmai: async(req,res) =>{
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

            let whereClause = wherecondition.length > 0? "Where " + wherecondition.join(" and ") : "";

            const sql_km = `Select km.MaKM, km.TenKM,
                            Sum(log.SoTienDaGiam) as TongTienDaGiam,
                            Count(DISTINCT log.MaDH) as TongDonHang,
                            Sum(LoiNhuan.LoiNhuanGoc) - Sum(log.SoTienDaGiam) as LoiNhuanRong
                            from KhuyenMai km
                            inner join LogSuDungKhuyenMai log on km.MaKM = log.MaKM
                            inner join DonHang dh on dh.MaDH = log.MaDH
                            inner join ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                            inner join (
                                select ctdh.MaDH,
                                Sum((ctdh.DonGiaBan - ctdh.GiaNhapThucTe) * ctdh.SoLuong) as LoiNhuanGoc
                                from ChiTietDonHang ctdh
                                group by ctdh.MaDH
                            ) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH
                            ${whereClause}
                            Group by km.MaKM, km.TenKM
                            order by TongDonHang DESC
                        `;
            const [result_km] = await db.query(sql_km,value);

            const sql_magg = `Select ma.MaGG, ma.TenMaGiamGia,
                            Sum(log.SoTienDaGiam) as TongTienDaGiam,
                            Count(DISTINCT log.MaDH) as TongDonHang,
                            Sum(LoiNhuan.LoiNhuanGoc) - Sum(log.SoTienDaGiam) as LoiNhuanRong
                            from MaGiamGia ma
                            inner join LogSuDungMaGiamGia log on ma.MaGG = log.MaGG
                            inner join DonHang dh on dh.MaDH = log.MaDH
                            inner join ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                            inner join (
                                select ctdh.MaDH,
                                Sum((ctdh.DonGiaBan - ctdh.GiaNhapThucTe) * ctdh.SoLuong) as LoiNhuanGoc
                                from ChiTietDonHang ctdh
                                group by ctdh.MaDH
                            ) as LoiNhuan ON log.MaDH = LoiNhuan.MaDH
                            ${whereClause}
                            Group by ma.MaGG, ma.TenMaGiamGia
                            order by TongDonHang DESC
                        `;
            const [result_magg] = await db.query(sql_magg, value);

            res.status(200).json({
                success: true,
                message: "Thống kê dữ liệu sản phẩm thành công!",
                data: {
                    topkm: result_km,
                    topmagg: result_magg,
                }
            });
        }
        catch (error){
            console.error("Lỗi khi thống kê dữ liệu sản phẩm: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi thống kê dữ liệu sản phẩm!"
            });
        }
    },

    thongkedonhang: async(req, res) =>{
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;

            let wherecondition = [];
            let value = [];

            if(NgayBatDau){
                wherecondition.push("dh.NgayLapDon >= ?");
                value.push(`${NgayBatDau} 00:00:00`);
            }
            if(NgayKetThuc){
                wherecondition.push("dh.NgayLapDon <= ?");
                value.push(`${NgayKetThuc} 23:59:59`);
            }

            let whereClause = wherecondition.length > 0? "Where " + wherecondition.join(" and ") : "";

            const sql = `SELECT tt.MaTrangThai, tt.TenTrangThai,
                                COUNT(DISTINCT cttt.MaDH) as SoLuongDon
                         FROM ChiTietTrangThai cttt
                         INNER JOIN TrangThai tt ON cttt.MaTrangThai = tt.MaTrangThai
                         INNER JOIN DonHang dh ON cttt.MaDH = dh.MaDH
                         ${whereClause}
                         GROUP BY tt.MaTrangThai, tt.TenTrangThai
                         ORDER BY tt.MaTrangThai ASC`;

            const [result] = await db.query(sql,value);
            res.status(200).json({
                success: true,
                message: "Thống kê dữ liệu chuyển đổi đơn hàng thành công!",
                data: result
            });
        }
        catch (error){
            console.error("Lỗi khi thống kê dữ liệu chuyển đổi đơn hàng: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi thống kê dữ liệu chuyển đổi đơn hàng!"
            });
        }
    },

    thongkekhachhang: async(req,res) =>{
        try{
            const {NgayBatDau, NgayKetThuc} = req.query;

            let wherecondition = ["MaQuyen = 3"];
            let value = [];

            if(NgayBatDau){
                wherecondition.push("tk.NgayTao >= ?");
                value.push(`${NgayBatDau} 00:00:00`);
            }
            if(NgayKetThuc){
                wherecondition.push("tk.NgayTao <= ?");
                value.push(`${NgayKetThuc} 23:59:59`);
            }

            let whereClause = wherecondition.length > 0? "Where " + wherecondition.join(" and ") : "";

            const sql = `SELECT DATE(tk.NgayTao) as NgayDangKy, 
                                COUNT(tk.MaTK) as SoLuongKhach
                         FROM TaiKhoan tk
                         ${whereClause}
                         GROUP BY DATE(tk.NgayTao)
                         ORDER BY NgayDangKy ASC`;

            const [result] = await db.query(sql,value);
            res.status(200).json({
                success: true,
                message: "Thống kê dữ liệu số lượng khách hàng thành công!",
                data: result
            });
        }
        catch (error){
            console.error("Lỗi khi thống kê dữ liệu số lượng khách hàng: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi thống kê dữ liệu số lượng khách hàng!"
            });
        }
    },

    xuatExcelDoanhThu: async (req, res) => {
    try {
        const { NgayBatDau, NgayKetThuc } = req.query;
        
        // 1. Lấy dữ liệu chi tiết đơn hàng (Sử dụng kiến thức Snapshot bạn vừa học)
        let wherecondition = ["cttt.MaTrangThai = 4"];
        let value = [];
        if(NgayBatDau) { wherecondition.push("dh.NgayLapDon >= ?"); value.push(`${NgayBatDau} 00:00:00`); }
        if(NgayKetThuc) { wherecondition.push("dh.NgayLapDon <= ?"); value.push(`${NgayKetThuc} 23:59:59`); }
        let whereClause = wherecondition.length > 0 ? "WHERE " + wherecondition.join(" AND ") : "";

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

        // 2. Khởi tạo Workbook và Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Báo cáo doanh thu');

        // 3. Định nghĩa các cột (Header)
        worksheet.columns = [
            { header: 'Mã Đơn', key: 'MaDH', width: 10 },
            { header: 'Khách Hàng', key: 'TenKH', width: 25 },
            { header: 'Ngày Lập', key: 'NgayLapDon', width: 20 },
            { header: 'Chi Tiết Sản Phẩm', key: 'DanhSachHang', width: 40 },
            { header: 'Tổng Tiền (VNĐ)', key: 'TongTien', width: 20 },
        ];

        // 4. Định dạng Header cho đẹp (In đậm, màu nền)
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4F81BD' } // Màu xanh chuyên nghiệp
        };

        // 5. Đổ dữ liệu vào các dòng
        donHangs.forEach(item => {
            worksheet.addRow({
                MaDH: item.MaDH,
                TenKH: item.TenKH,
                NgayLapDon: new Date(item.NgayLapDon).toLocaleString('vi-VN'),
                DanhSachHang: item.DanhSachHang,
                TongTien: item.TongTien
            });
        });

        // Định dạng cột Tiền có dấu phân cách hàng nghìn
        worksheet.getColumn('TongTien').numFmt = '#,##0';

        // 6. Thiết lập Header trả về file cho Browser
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + `Bao_cao_doanh_thu_${Date.now()}.xlsx`);

        // 7. Ghi file và gửi về
        await workbook.xlsx.write(res);
        res.end();

        } catch (error) {
            console.error("Lỗi xuất Excel:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel" });
        }
    }
}

module.exports = thongke;