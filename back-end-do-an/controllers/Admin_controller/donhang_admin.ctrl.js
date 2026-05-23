const db = require('../../config/db.js');

const donhang_admin = {
    tao_don_hang_ngoai: async(req, res) => {
        const connection = await db.getConnection();
        try {
            const MaTK  = req.user.id;
            const { DanhSachSanPham, Ten, SDT, DiaChi, MaGG, Note } = req.body;
            // DanhSachSanPham từ FE gửi lên phải có dạng: [{ MaPhanLoai: 1, SoLuong: 2 }, ...]

            if (!DanhSachSanPham || !Array.isArray(DanhSachSanPham) || DanhSachSanPham.length === 0) {
                return res.status(400).json({ success: false, message: "Danh sách sản phẩm trống!" });
            }

            await connection.beginTransaction();

            // 1. Tách mảng MaPhanLoai để truy vấn DB
            const danhSachYeuCau = new Map(DanhSachSanPham.map(item => [item.MaPhanLoai, parseInt(item.SoLuong)]));
            const listMaPhanLoai = Array.from(danhSachYeuCau.keys());

            // 2. Truy vấn DB lấy GIÁ THẬT và KHUYẾN MÃI của các mã vừa gửi lên
            const sql_get_items = `
                SELECT 
                    mh.TenMH, mh.GiaNhap,
                    pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, pl.SoLuong AS TonKho,
                    km_info.MaKM,
                    COALESCE(km_info.MucGiam, 0) AS MucGiam,
                    COALESCE(km_info.SoLuongKhuyenMaiConLai, 0) AS SoLuongKhuyenMaiConLai
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                LEFT JOIN (
                    SELECT 
                        ctkm.MaPhanLoai, km.MaKM,
                        (ctkm.SoLuongKM - ctkm.SoLuongDaDung) AS SoLuongKhuyenMaiConLai,
                        MAX(CASE
                            WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                            WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl_sub.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl_sub.DonGia))
                            ELSE 0
                        END) AS MucGiam
                    FROM ChiTietKhuyenMai ctkm
                    INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                    INNER JOIN PhanLoai pl_sub ON ctkm.MaPhanLoai = pl_sub.MaPhanLoai
                    WHERE km.TrangThaiHoatDong = 1 AND km.ThoiGianBD <= NOW() AND km.ThoiGianKT >= NOW() AND (ctkm.SoLuongKM - ctkm.SoLuongDaDung) > 0
                    GROUP BY ctkm.MaPhanLoai, ctkm.SoLuongKM, ctkm.SoLuongDaDung, km.MaKM
                ) AS km_info ON pl.MaPhanLoai = km_info.MaPhanLoai
                WHERE pl.MaPhanLoai IN (?)
            `;
            const [db_items] = await connection.query(sql_get_items, [listMaPhanLoai]);

            // Kiểm tra xem có mã ma nào bị gửi lên không
            if (db_items.length !== listMaPhanLoai.length) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Có sản phẩm không tồn tại trong hệ thống!" });
            }

            let TongTienHang = 0;
            let TongTienKhuyenMai = 0;
            let arrChiTietDonHang = [];
            let arrUpdateKho = [];
            let arrUpdateKhuyenMai = [];
            let arrLogKhuyenMai = [];

            // 3. Tính toán dựa trên dữ liệu TRONG DATABASE
            for (let item of db_items) {
                const soLuongYeuCau = danhSachYeuCau.get(item.MaPhanLoai);

                if (soLuongYeuCau > item.TonKho) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: `Sản phẩm ${item.TenMH} (${item.ChiTietPhanLoai}) chỉ còn ${item.TonKho} cái!` });
                }

                const slSale = item.SoLuongKhuyenMaiConLai > 0 ? Math.min(soLuongYeuCau, item.SoLuongKhuyenMaiConLai) : 0;
                const slMuaGiaGoc = soLuongYeuCau - slSale;

                TongTienHang += (item.DonGia * soLuongYeuCau);
                TongTienKhuyenMai += (item.MucGiam * slSale);
                arrUpdateKho.push([soLuongYeuCau, item.MaPhanLoai]);

                if (slSale > 0) {
                    const GiaBanSauSale = item.DonGia - item.MucGiam;
                    arrChiTietDonHang.push([item.MaPhanLoai, 1, slSale, item.GiaNhap, item.DonGia, GiaBanSauSale]);
                    arrUpdateKhuyenMai.push([slSale, item.MaKM, item.MaPhanLoai]);
                    arrLogKhuyenMai.push([item.MaKM, item.MucGiam * slSale]); 
                }
                if (slMuaGiaGoc > 0) {
                    arrChiTietDonHang.push([item.MaPhanLoai, 0, slMuaGiaGoc, item.GiaNhap, item.DonGia, item.DonGia]);
                }
            }

            let tongTienThanhToan = TongTienHang - TongTienKhuyenMai;
            let soTienGiamVoucher = 0;

            // 4. Xử lý Voucher (Mã giảm giá nội bộ nhân viên áp dụng cho khách)
            if (MaGG) {
                const sql_check_voucher = `SELECT * FROM MaGiamGia WHERE MaGG = ? AND ThoiGianBD <= NOW() AND ThoiGianKT >= NOW() AND TrangThai = 1`;
                const [voucherInfo] = await connection.query(sql_check_voucher, [MaGG]);
                
                if (voucherInfo.length > 0) {
                    const v = voucherInfo[0];
                    if (v.SoLuongDaDung >= v.SoLuongDungToiDa) {
                        await connection.rollback();
                        return res.status(400).json({ success: false, message: `Mã voucher đã hết lượt sử dụng!` });
                    }
                    
                    if (v.LoaiGiamGia === 'TienMat') {
                        soTienGiamVoucher = Number(v.ChietKhau);
                    } else if (v.LoaiGiamGia === 'ChietKhau') {
                        const tinhGiam = tongTienThanhToan * (Number(v.ChietKhau) / 100);
                        soTienGiamVoucher = Math.min(tinhGiam, Number(v.GiaTriGiamToiDa || tinhGiam));
                    }
                    tongTienThanhToan = Math.max(0, tongTienThanhToan - soTienGiamVoucher);
                } else {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: "Mã voucher không hợp lệ hoặc đã hết hạn!" });
                }
            }

            // 5. Insert Bảng DonHang
            const sql_tao_don = `
                INSERT INTO DonHang (TongTien, ThanhTien, NgayLapDon, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note) 
                VALUES (?, ?, NOW(), 'Đơn hàng ngoài', ?, ?, ?, ?)
            `;
            const [tao_don] = await connection.query(sql_tao_don, [TongTienHang, tongTienThanhToan, Ten, SDT, DiaChi, Note]);
            const maDH_moi = tao_don.insertId;

            // 6. Insert Trạng Thái
            await connection.query(`INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 1, NOW())`, [maDH_moi]);

            // 7. Insert Chi Tiết Đơn Hàng
            for (let detail of arrChiTietDonHang) {
                await connection.query(`
                    INSERT INTO ChiTietDonHang (MaDH, MaPhanLoai, LaHangKhuyenMai, SoLuong, GiaNhapThucTe, DonGiaGoc, DonGiaBan)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [maDH_moi, ...detail]);
            }

            // 8. Trừ Tồn Kho
            for (let kho of arrUpdateKho) {
                const [resKho] = await connection.query(`UPDATE PhanLoai SET SoLuong = SoLuong - ? WHERE MaPhanLoai = ? AND SoLuong >= ?`, [kho[0], kho[1], kho[0]]);
                if (resKho.affectedRows === 0) throw new Error("Cập nhật tồn kho thất bại");
            }

            // 9. Cập nhật Số lượng khuyến mãi & Ghi Log
            for (let km of arrUpdateKhuyenMai) {
                await connection.query(`UPDATE ChiTietKhuyenMai SET SoLuongDaDung = SoLuongDaDung + ? WHERE MaKM = ? AND MaPhanLoai = ?`, [km[0], km[1], km[2]]);
            }
            for (let log of arrLogKhuyenMai) {
                await connection.query(`INSERT INTO LogSuDungKhuyenMai (MaKM, MaDH, SoTienDaGiam, ThoiGianSuDung) VALUES (?, ?, ?, NOW())`, [log[0], maDH_moi, log[1]]);
            }
            if (MaGG && soTienGiamVoucher > 0) {
                await connection.query(`INSERT INTO LogSuDungMaGiamGia (MaGG, MaDH, SoTienDaGiam, ThoiGianSuDung) VALUES (?, ?, ?, NOW())`, [MaGG, maDH_moi, soTienGiamVoucher]);
                await connection.query(`UPDATE MaGiamGia SET SoLuongDaDung = SoLuongDaDung + 1 WHERE MaGG = ?`, [MaGG]);
            }

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            // Xây dựng nội dung Log thật súc tích
            const noiDungLog = `Tạo thành công đơn hàng ngoài mã số #${maDH_moi}`;

            // Dùng Parameterized Query (?) để chống SQL Injection tuyệt đối
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, ?, ?, ?, NOW())
            `, [MaTK, 'INVOICE', noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm đơn hàng ngoài thành công!",
                MaDH: maDH_moi
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thêm đơn hàng mới: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thêm đơn hàng!" });
        }
        finally {
            if (connection) connection.release();
        }
    },

    huy_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaDH} = req.body;

            const sql_kiemtra_tt = `Select cttt.MaTrangThai from ChiTietTrangThai cttt where MaDH = ? Order by Thoigian DESC Limit 1`;
            const [trang_thai] = await connection.query(sql_kiemtra_tt,[MaDH]);

            if(trang_thai.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }
            const currentStatus = trang_thai[0].MaTrangThai;

            if(currentStatus === 4 || urrentStatus === 5){
                await connection.rollback();
                return res.status(400).json({
                    message: "Không thể huỷ! Đơn hàng đã được giao hoặc đã bị hủy trước đó."
                });
            }

            const sql_them_trang_thai_huy = `Insert into ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) Values (?,5,Now())`;
            await connection.query(sql_them_trang_thai_huy,[MaDH]);

            const sql_cap_nhat_ton_kho = `UPDATE Phanloai pl
                                        inner join ChiTietDonHang ctdh on ctdh.MaPhanLoai = pl.MaPhanLoai
                                        SET pl.SoLuong = pl.SoLuong + ctdh.SoLuong WHERE ctdh.MaDH = ?`;
            
            await connection.query(sql_cap_nhat_ton_kho,[MaDH]);

            await connection.commit();
            res.status(200).json({
                message: "Huỷ đơn hàng thành công!",
                success: true
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi huỷ đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi huỷ đơn hàng!"});
        }
        finally {
            connection.release();
        }
    },

    sua_thong_tin_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaDH, sdt, hoten, diachi} = req.body;

            const sql_kiemtra_tt = `Select cttt.MaTrangThai from ChiTietTrangThai where MaDH = ? Order by Thoigian DESC Limit 1`;
            const [trang_thai] = await connection.query(sql_kiemtra_tt,[MaDH]);

            if(trang_thai.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }
            const currentStatus = trang_thai[0].MaTrangThai;
                
            if(currentStatus === 3 || currentStatus === 4 || currentStatus === 5){
                await connection.rollback();
                return res.status(400).json({
                    message: "Không thể thay đổi thông tin đơn hàng đã được giao hoặc đã bị hủy."
                });
            }

            const sql_cap_nhat_tt = `UPDATE DonHang dh
                                        SET TenNguoiNhan = ?,
                                        SDTNguoiNhan = ?,
                                        DiaChiGiao = ?
                                        WHERE ctdh.MaDH = ?`;
            
            await connection.query(sql_cap_nhat_tt,[hoten, sdt, diachi, MaDH]);

            await connection.commit();
            res.status(200).json({
                message: "Sửa thông tin đơn hàng thành công!",
                success: true
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi sửa thông tin đơn hàng!"});
        }
        finally {
            connection.release();
        }
    },

    liet_ke_don_hang: async(req, res) => {
        try {
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            if (!page || isNaN(page) || page < 1) page = 1;
            if (!limit || isNaN(limit) || limit < 1) limit = 5;
            if (limit > 10) limit = 10;

            const offset = (page - 1) * limit;

            const { 
                trangthai, ngaybatdau, ngayketthuc, timkiem, sapxep
            } = req.query;

            let conditions = [];
            let whereValues = [];
            
            let havingConditions = [];
            let havingValues = [];

            if(timkiem){
                const timkiem_gon = timkiem.replace(/^FC-/i, '').trim();
                conditions.push("(dh.MaDH like ? or dh.TenNguoiNhan COLLATE utf8mb4_unicode_ci LIKE ? or nv.TenNV COLLATE utf8mb4_unicode_ci LIKE ?)");
                whereValues.push(`%${timkiem_gon}%`,`%${timkiem}%`,`%${timkiem}%`);
            }
            if (ngaybatdau) {
                conditions.push("dh.NgayLapDon >= ?");
                whereValues.push(ngaybatdau);
            }
            if (ngayketthuc) {
                conditions.push("dh.NgayLapDon <= ?");
                whereValues.push(ngayketthuc);
            }
            let condition_clause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

            if (trangthai) {
                havingConditions.push("MaTT = ?");
                havingValues.push(trangthai);
            }
            let having_clause = havingConditions.length > 0 ? "HAVING " + havingConditions.join(" AND ") : "";

            let filter = "ORDER BY dh.NgayLapDon DESC";
            if (sapxep === 'date_asc') filter = ("ORDER BY dh.NgayLapDon ASC");
            if (sapxep === 'total_desc') filter = ("ORDER BY dh.TongTien DESC");
            if (sapxep === 'total_asc') filter = ("ORDER BY dh.TongTien ASC");

            const sql_core = `
                SELECT dh.MaDH, dh.MaKH, dh.MaNV, kh.TenKh, nv.TenNV,
                dh.NgayLapDon, dh.TongTien, dh.TenNguoiNhan,
                dh.ThanhTien, dh.TrangThaiThanhToan,
                (
                    SELECT cttt.MaTrangThai
                    FROM ChiTietTrangThai cttt 
                    WHERE cttt.MaDH = dh.MaDH 
                    ORDER BY cttt.MaTrangThai DESC 
                    LIMIT 1
                ) AS MaTT,
                (
                    Select tt.TenTrangThai
                    FROM TrangThai tt
                    inner join ChiTietTrangThai cttt on tt.MaTrangThai = cttt.MaTrangThai
                    WHERE cttt.MaDH = dh.MaDH 
                    ORDER BY cttt.MaTrangThai DESC 
                    LIMIT 1
                ) As TrangThai
                FROM DonHang dh
                left join NhanVien nv on dh.MaNV = nv.MaNV
                left join KhachHang kh on kh.MaKH = dh.MaKH
                ${condition_clause}
                ${having_clause}
            `;

            const combinedValues = [...whereValues, ...havingValues];

            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count, combinedValues);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            const sql_ds = `
                ${sql_core}
                ${filter}
                LIMIT ? OFFSET ?
            `;
            
            const sql_params = [...combinedValues, limit, offset];
            const [invoices] = await db.query(sql_ds, sql_params);

            const sql_summary = `
                SELECT 
                    LatestStatus.MaTrangThai, 
                    tt.TenTrangThai,
                    COUNT(dh.MaDH) AS SoLuongDon
                FROM DonHang dh
                INNER JOIN (
                    -- Tìm trạng thái mới nhất của từng đơn hàng
                    SELECT MaDH, MAX(MaTrangThai) as MaTrangThai
                    FROM ChiTietTrangThai
                    GROUP BY MaDH
                ) LatestStatus ON dh.MaDH = LatestStatus.MaDH
                INNER JOIN TrangThai tt ON tt.MaTrangThai = LatestStatus.MaTrangThai
                GROUP BY LatestStatus.MaTrangThai, tt.TenTrangThai
            `;
            const [summaryData] = await db.query(sql_summary);
            const summaryCounters = summaryData.reduce((acc, item) => {
                acc[item.MaTrangThai] = item.SoLuongDon;
                return acc;
            }, {});

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách đơn hàng thành công!",
                data: invoices,
                summary: summaryCounters,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });                    
        }
        catch (error) {
            console.error("Xảy ra lỗi khi lấy danh sách đơn hàng: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng!" });
        }
    },

    xem_chi_tiet_don_hang: async(req, res) =>{
        try {
            const MaDH = req.params.MaDH;
            const sql_donhang = `
                SELECT 
                TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, 
                TongTien, ThanhTien, NgayLapDon, Note, MaVoucher
                FROM DonHang
                left join LogSuDungMaGiamGia log on log.MaDH = DonHang.MaDH
                left join MaGiamGia ma on ma.MaGG = log.MaGG
                WHERE DonHang.MaDH = ?
            `;
            const [donhang_info] = await db.query(sql_donhang, [MaDH]);

            if (donhang_info.length === 0) {

                return res.status(404).json({ 
                                    success: false,
                                    message: "Không tìm thấy đơn hàng!"});
            }

            const sql = `SELECT 
            mh.MaMoHinh,
            mh.TenMH,
            mh.AnhDaiDien, 
            ct.GiaNhapThucTe,
            ct.DonGiaGoc,
            ct.DonGiaBan,
            pl.MaPhanLoai,
            pl.ChiTietPhanLoai,
            ct.SoLuong,
            ((ct.DonGiaGoc - ct.DonGiaBan) * ct.SoLuong) AS KhuyenMai
            FROM MoHinh mh
            inner join PhanLoai pl on mh.MaMoHinh = pl.MaMoHinh
            inner join ChiTietDonHang ct on pl.MaPhanLoai = ct.MaPhanLoai
            where ct.MaDH = ?
            ORDER BY mh.MaMoHinh DESC`;
            const [products] = await db.query(sql,[MaDH]);
            
            const sql_trangthai =  `Select
            tt.TenTrangThai,
            cttt.ThoiGian
            from TrangThai tt
            inner join ChiTietTrangThai cttt on tt.MaTrangThai = cttt.MaTrangThai
            where cttt.MaDH = ?
            order by cttt.MaTrangThai DESC
            limit 1`;

            const [trangthai] = await db.query(sql_trangthai,[MaDH]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách sản phẩm trong đơn hàng thành công",
                data: {
                    ThongTinGiaoHang: donhang_info[0],
                    DanhSachHang: products,
                    Trang_thai_don_hang: trangthai
                    }
            });
        } 
        catch (error){
            console.error("Lỗi khi xem đơn hàng: ", error);
            res.status(500).json({ success: false,
                message: "Lỗi server khi thao tác đơn hàng!"});
        }
    },

    cap_nhat_trang_thai_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {MaDH} = req.body;
            const sql_lay_trang_thai = `
                Select
                    MaTrangThai
                    from ChiTietTrangThai
                    where MaDH = ?
                    order by MaTrangThai DESC
                    limit 1
            `;
            const [trangthai] = await connection.query(sql_lay_trang_thai, [MaDH]);

            if (trangthai.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!"});
            }
            const matrangthai = trangthai[0].MaTrangThai;
            const update_trang_thai = `Insert into ChiTietTrangThai (MaDH, MaTrangThai) values (?,?)`;
            if(matrangthai <= 3){
                await connection.query(update_trang_thai, [MaDH, matrangthai + 1]);
            }
            else{
                await connection.rollback();
                return res.status(200).json({
                    success: false,
                    message: "Không thể cập nhật trạng thái cho đơn hàng đã thành công!"
                });
            }
            await connection.commit()
            res.status(200).json({
                message: "Cập nhật trạng thái cho đơn hàng thành công!",
                success: true,
                MaDH: MaDH
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi sửa thông tin đơn hàng!"});
        }
        finally{
            connection.release();
        }
    },

    hoan_tra_don_hang: async(req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { MaDH } = req.body;

        // 1. Lấy trạng thái mới nhất của đơn hàng
        const sql_kiemtra_tt = `
            SELECT MaTrangThai 
            FROM ChiTietTrangThai 
            WHERE MaDH = ? 
            ORDER BY Thoigian DESC 
            LIMIT 1
        `;
        const [trang_thai] = await connection.query(sql_kiemtra_tt, [MaDH]);

        if (trang_thai.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        }

        const currentStatus = trang_thai[0].MaTrangThai;

        // 2. ĐIỀU KIỆN SỐNG CÒN CỦA HOÀN HÀNG
        // Chỉ cho phép hoàn hàng nếu đơn đang đi trên đường (3) hoặc đã tới tay khách (4)
        if (currentStatus !== 3 && currentStatus !== 4) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Lỗi nghiệp vụ: Chỉ có thể hoàn trả các đơn hàng Đang giao hoặc Đã hoàn thành!"
            });
        }

        // 3. Cập nhật trạng thái thành 6 (Hoàn hàng/Trả hàng)
        const sql_them_trang_thai_hoan = `INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 6, NOW())`;
        await connection.query(sql_them_trang_thai_hoan, [MaDH]);

        // 4. Nhập lại hàng vào kho
        const sql_cap_nhat_ton_kho = `
            UPDATE PhanLoai pl
            INNER JOIN ChiTietDonHang ctdh ON ctdh.MaPhanLoai = pl.MaPhanLoai
            SET pl.SoLuong = pl.SoLuong + ctdh.SoLuong 
            WHERE ctdh.MaDH = ?
        `;
        await connection.query(sql_cap_nhat_ton_kho, [MaDH]);

        await connection.commit();
        res.status(200).json({
            success: true,
            message: "Xác nhận hoàn hàng và nhập lại kho thành công!"
        });
    }
    catch (error) {
        await connection.rollback();
        console.error("Lỗi khi hoàn trả đơn hàng: ", error);
        res.status(500).json({ success: false, message: "Lỗi server khi thao tác hoàn trả!"});
    }
    finally {
        connection.release();
    }
}
}
module.exports = donhang_admin;