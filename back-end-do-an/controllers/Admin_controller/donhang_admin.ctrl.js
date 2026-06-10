const db = require('../../config/db.js');
const ExcelJS = require('exceljs');
const path = require('path');

const donhang_admin = {
    tao_don_hang_ngoai: async(req, res) => {
        const connection = await db.getConnection();
        try {
            const [check_nv] = await connection.query(`SELECT MaNV FROM NhanVien WHERE MaTK = ?`, [MaTK]);
            
            if (check_nv.length === 0) {
                return res.status(403).json({ success: false, message: "Bạn không phải nhân viên, không đủ thẩm quyền tạo đơn hàng!" });
            }
            
            const MaNV = check_nv[0].MaNV;
            const { DanhSachSanPham, Ten, SDT, DiaChi, MaGG, Note, ThuTienNgay, PhuongThucTT, SoTienDaTra } = req.body;
            // DanhSachSanPham từ FE gửi lên phải có dạng: [{ MaPhanLoai: 1, SoLuong: 2 }, ...]

            if (!DanhSachSanPham || !Array.isArray(DanhSachSanPham) || DanhSachSanPham.length === 0) {
                return res.status(400).json({ success: false, message: "Danh sách sản phẩm trống!" });
            }
            if (!Ten || !SDT) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            await connection.beginTransaction();

            // 1. Tách mảng MaPhanLoai để truy vấn DB
            const danhSachYeuCau = new Map(DanhSachSanPham.map(item => [item.MaPhanLoai, parseInt(item.SoLuong)]));
            const listMaPhanLoai = Array.from(danhSachYeuCau.keys());

            // 2. Truy vấn DB lấy GIÁ THẬT và KHUYẾN MÃI của các mã vừa gửi lên
            const sql_get_items = `
                SELECT 
                    mh.TenMH, mh.GiaNhap, mh.LoaiHinhBan,
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

            const coHangSan = db_items.some(item => !item.LoaiHinhBan || item.LoaiHinhBan.toLowerCase().includes('có sẵn'));
            // Chỉ cần chứa chữ "order" là bao trọn cả "Order" và "Pre-order"
            const coHangOrder = db_items.some(item => item.LoaiHinhBan && item.LoaiHinhBan.toLowerCase().includes('order'));

            if (coHangSan && coHangOrder) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: "Không thể tạo chung đơn có cả Hàng sẵn và Hàng Order/Pre-order. Vui lòng tách thành 2 đơn riêng biệt!" 
                });
            }

            if (coHangOrder && !DiaChi) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: "Vui lòng nhập đầy đủ thông tin!" });
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
                    const isOrder = item.LoaiHinhBan && item.LoaiHinhBan.toLowerCase().includes('order');
                    const kieuHang = isOrder ? 'Slot Order/Pre-order' : 'Hàng có sẵn';
                    return res.status(400).json({ 
                        success: false, 
                        message: `Sản phẩm ${item.TenMH} (${item.ChiTietPhanLoai}) chỉ còn ${item.TonKho} ${kieuHang}!` });
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
                const sql_check_voucher = `SELECT * FROM MaGiamGia WHERE MaGG = ? AND ThoiGianBD <= NOW() AND ThoiGianKT >= NOW() AND TrangThaiHoatDong = 1`;
                const [voucherInfo] = await connection.query(sql_check_voucher, [MaGG]);
                
                if (voucherInfo.length > 0) {
                    const v = voucherInfo[0];
                    if (v.SoLuongDaDung >= v.SoLuongDungToiDa) {
                        await connection.rollback();
                        return res.status(400).json({ success: false, message: `Mã voucher đã hết lượt sử dụng!` });
                    }

                    const sql_check_used = `
                        SELECT 1 
                        FROM LogSuDungMaGiamGia log
                        INNER JOIN DonHang dh ON log.MaDH = dh.MaDH
                        WHERE log.MaGG = ? AND dh.SDTNguoiNhan = ?
                        LIMIT 1
                    `;
                    const [usedCheck] = await connection.query(sql_check_used, [MaGG, SDT]);
                    
                    if (usedCheck.length > 0) {
                        await connection.rollback();
                        return res.status(400).json({ 
                            success: false, 
                            message: `Khách hàng có SĐT ${SDT} đã từng sử dụng mã giảm giá này rồi!` 
                        });
                    }

                    const sql_check_product = `SELECT MaPhanLoai FROM ChiTietMaGiamGia WHERE MaGG = ?`;
                    const [apDungChoPhanLoai] = await connection.query(sql_check_product, [MaGG]);
                    
                    let isHopLeSanPham = true;
                    
                    // Nếu bảng chi tiết có dữ liệu -> Mã này bị giới hạn chỉ áp dụng cho một số món
                    if (apDungChoPhanLoai.length > 0) {
                        const danhSachChoPhep = apDungChoPhanLoai.map(item => item.MaPhanLoai);
                        
                        // listMaPhanLoai là mảng các ID sản phẩm khách ĐANG MUA ở trên
                        const coMonHopLe = listMaPhanLoai.some(ma => danhSachChoPhep.includes(ma));
                        
                        if (!coMonHopLe) {
                            isHopLeSanPham = false; // Đánh dấu là không hợp lệ
                        }
                    }
                    
                    if (isHopLeSanPham && tongTienThanhToan >= Number(v.MucGiaToiThieu)) {
                        if (v.LoaiGiamGia === 'TienMat') {
                            soTienGiamVoucher = Number(v.ChietKhau);
                        } else if (v.LoaiGiamGia === 'ChietKhau') {
                            const tinhGiam = tongTienThanhToan * (Number(v.ChietKhau) / 100);
                            soTienGiamVoucher = Math.min(tinhGiam, Number(v.GiaTriGiamToiDa || tinhGiam));
                        }
                        tongTienThanhToan = Math.max(0, tongTienThanhToan - soTienGiamVoucher);
                    }
                } else {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: "Mã voucher không hợp lệ hoặc đã hết hạn!" });
                }
            }

            // 5. Insert Bảng DonHang
            const taoMaDonHangHienThi = () => {
                const date = new Date();
                const ddmmyy = date.getDate().toString().padStart(2, '0') +
                            (date.getMonth() + 1).toString().padStart(2, '0') +
                            date.getFullYear().toString().slice(-2);
                            
                const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
                return `FC${ddmmyy}-${randomString}`; 
            };
            
            const maHienThi = taoMaDonHangHienThi();

            let tienThucThu = Number(SoTienDaTra) || 0;
            let trangThaiThanhToan = 'Chưa thanh toán';
            let loaiGiaoDich = 'Thanh toán toàn bộ';

            if (ThuTienNgay && tienThucThu > 0) {
                if (tienThucThu >= tongTienThanhToan) {
                    trangThaiThanhToan = 'Đã thanh toán';
                    loaiGiaoDich = 'Thanh toán toàn bộ';
                } else {
                    trangThaiThanhToan = 'Đã đặt cọc';
                    loaiGiaoDich = 'Đặt cọc';
                }
            }

            // 5. Insert Bảng DonHang
            const sql_tao_don = `
                INSERT INTO DonHang (MaNV, MaDonHangHienThi, TongTien, ThanhTien, NgayLapDon, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note) 
                VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)
            `;
            const [tao_don] = await connection.query(sql_tao_don, [MaNV, maHienThi, TongTienHang, tongTienThanhToan, trangThaiThanhToan, Ten, SDT, DiaChi, Note]);
            const maDH_moi = tao_don.insertId;

            // Ghi nhận bảng thanh toán nếu có đưa tiền (Cọc hoặc Full)
            if (ThuTienNgay && tienThucThu > 0) {
                if (!PhuongThucTT) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: "Vui lòng chọn phương thức thanh toán!" });
                }

                // KIỂM TRA MÃ CÓ TỒN TẠI VÀ ĐANG HOẠT ĐỘNG KHÔNG
                const [check_pttt] = await connection.query(`SELECT MaPT FROM PhuongThucThanhToan WHERE MaPT = ? AND TrangThaiHoatDong = 1`, [PhuongThucTT]);
                
                // Gỡ bom 1: Chặn sập API nếu mảng rỗng
                if (check_pttt.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: "Phương thức thanh toán không tồn tại hoặc đã bị khóa!" });
                }

                const maPT = check_pttt[0].MaPT;

                // Gỡ bom 2: Sửa || thành &&. Nghiệp vụ: Đơn tại quầy chỉ nhận mã 4 (CK) và 5 (Tiền mặt)
                if (maPT !== 4 && maPT !== 5) {
                    await connection.rollback();
                    return res.status(400).json({ 
                        success: false, 
                        message: "Nghiệp vụ lỗi: Đơn hàng tại quầy chỉ hỗ trợ 'Thanh toán trực tiếp' hoặc 'Chuyển khoản ngoài'!" 
                    });
                }
            }
            await connection.query(`INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 1, NOW())`, [maDH_moi]);

            for (let detail of arrChiTietDonHang) {
                await connection.query(`
                    INSERT INTO ChiTietDonHang (MaDH, MaPhanLoai, LaHangKhuyenMai, SoLuong, GiaNhapThucTe, DonGiaGoc, DonGiaBan)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [maDH_moi, ...detail]);
            }

            for (let kho of arrUpdateKho) {
                const [resKho] = await connection.query(`UPDATE PhanLoai SET SoLuong = SoLuong - ? WHERE MaPhanLoai = ? AND SoLuong >= ?`, [kho[0], kho[1], kho[0]]);
                if (resKho.affectedRows === 0) throw new Error("Cập nhật tồn kho thất bại");

                const [checkStock] = await connection.query(`SELECT SoLuong, ChiTietPhanLoai, MaMoHinh FROM PhanLoai WHERE MaPhanLoai = ?`, [kho[1]]);
                if (checkStock.length > 0 && checkStock[0].SoLuong <= 3) {
                    await connection.query(`
                        INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                        VALUES (?, ?, ?, ?)
                    `, [
                        "Cảnh báo kho (Đơn tại quầy)", 
                        `Sản phẩm "${checkStock[0].ChiTietPhanLoai}" chỉ còn ${checkStock[0].SoLuong} cái sau khi xuất bán.`, 
                        "KhoHang", 
                        `/admin/inventory?productId=${checkStock[0].MaMoHinh}`
                    ]);
                }
            }

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

            const noiDungLog = `Tạo thành công đơn hàng ngoài: #${maDH_moi} (Mã tra cứu: ${maHienThi})`;

            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, ?, ?, ?, NOW())
            `, [MaTK, 'INVOICE', noiDungLog, userIp]);

            await connection.query(`
                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                VALUES (?, ?, ?, ?)
            `, [
                `Đơn hàng tại quầy #${maDH_moi}`, 
                `Nhân viên vừa xuất một đơn hàng ngoài hệ thống trị giá ${tongTienThanhToan.toLocaleString('vi-VN')}đ.`, 
                "DonHang", 
                `/admin/orders?viewOrderId=${maDH_moi}`
            ]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm đơn hàng ngoài thành công!",
                MaDH: maDH_moi, 
                MaHienThi: maHienThi 
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

    liet_ke_san_pham: async(req, res) => {
        try {
            const keyword = req.query.keyword || '';

            // BỔ SUNG: pl.SoLuong > 0 (Chỉ lấy hàng còn tồn kho) và mh.HienThi = 1
            let condition = ["(mh.TenMH COLLATE utf8mb4_unicode_ci LIKE ? OR pl.ChiTietPhanLoai COLLATE utf8mb4_unicode_ci LIKE ?) AND pl.HienThi = 1 AND mh.HienThi = 1 AND pl.SoLuong > 0"];
            let value = [`%${keyword}%`, `%${keyword}%`];

            let whereClause = "WHERE " + condition.join(" AND ");

            // Đổi pl.SoLuong AS TonKho để khớp với Frontend
            const sql = `SELECT mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.MaDM, mh.MaHSX, mh.TienCocToiThieu, mh.LoaiHinhBan,
                                pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, pl.SoLuong AS TonKho
                        FROM MoHinh mh
                        INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                        ${whereClause}
                        LIMIT 100`; // Nới rộng limit một chút vì sau khi gom nhóm số lượng sẽ ít đi
            
            const [flatData] = await db.query(sql, value);
            
            // TUYỆT CHIÊU GOM NHÓM: Biến dữ liệu phẳng thành cấu trúc lồng nhau (Nested)
            const groupedData = flatData.reduce((acc, row) => {
                // Tìm xem mô hình này đã có trong mảng kết quả chưa
                let model = acc.find(m => m.MaMoHinh === row.MaMoHinh);
                
                // Nếu chưa có, tạo mới lớp vỏ Mô hình
                if (!model) {
                    model = {
                        MaMoHinh: row.MaMoHinh,
                        TenMH: row.TenMH,
                        AnhDaiDien: row.AnhDaiDien,
                        TienCocToiThieu: row.TienCocToiThieu,
                        LoaiHinhBan: row.LoaiHinhBan,
                        PhanLoai: [] // Tạo mảng rỗng để chứa các phân loại
                    };
                    acc.push(model);
                }
                
                // Nhét phân loại vào bụng mô hình
                model.PhanLoai.push({
                    MaPhanLoai: row.MaPhanLoai,
                    ChiTietPhanLoai: row.ChiTietPhanLoai,
                    DonGia: row.DonGia,
                    TonKho: row.TonKho
                });
                
                return acc;
            }, []);
            
            res.status(200).json({ 
                success: true, 
                data: groupedData 
            });
        } 
        catch (error) {
            console.error("Lỗi tìm kiếm sản phẩm: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi tìm kiếm sản phẩm" });
        }
    },

    liet_ke_maGG_tai_quay: async (req, res) => {
        try {
            const sql_lay_ds = `
                SELECT 
                    gg.MaGG, 
                    gg.MaVoucher, 
                    gg.LoaiGiamGia, 
                    gg.ChietKhau, 
                    gg.GiaTriGiamToiDa, 
                    gg.MucGiaToiThieu, 
                    gg.ThoiGianKT,
                    gg.SoLuongDungToiDa,
                    gg.SoLuongDaDung
                FROM MaGiamGia gg
                WHERE gg.TrangThaiHoatDong = 1 
                  AND gg.ThoiGianBD <= NOW()  
                  AND gg.ThoiGianKT >= NOW()  
                  AND gg.SoLuongDungToiDa > gg.SoLuongDaDung 
                  AND gg.MaKH IS NULL
                ORDER BY gg.ChietKhau DESC
            `;
            
            const [ds] = await db.query(sql_lay_ds);
            
            res.status(200).json({
                success: true,
                data: ds,
                message: "Lấy danh sách mã giảm giá tại quầy thành công!"
            });
        }
        catch(error){
            console.error("Lỗi khi lấy danh sách mã giảm giá POS: ", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống tải danh sách mã giảm giá!" });
        }
    },

    huy_don_hang: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDH, LyDoHuy } = req.body;
            const MaTK = req.user.id; // Lấy từ Token để xác thực

            // 1. Kiểm tra đơn hàng có tồn tại và CÓ PHẢI CỦA NGƯỜI NÀY KHÔNG
            const sql_kiemtra_tt = `
                SELECT cttt.MaTrangThai, dh.MaDonHangHienThi, dh.TrangThaiThanhToan
                FROM DonHang dh
                LEFT JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                WHERE dh.MaDH = ?
                ORDER BY cttt.Thoigian DESC LIMIT 1
                FOR UPDATE
            `;
            const [don_hang] = await connection.query(sql_kiemtra_tt, [MaDH, MaTK]);

            if(don_hang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
            }

            const currentStatus = don_hang[0].MaTrangThai;
            const maHienThi = don_hang[0].MaDonHangHienThi;

            if (currentStatus === 5 || currentStatus === 6) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: "Đơn hàng này đã bị hủy hoặc hoàn từ trước! Không thể hoàn kho thêm lần nữa." 
                });
            }
            const finalLyDoHuy = LyDoHuy || 'Quản trị viên hủy đơn';
            // 3. THÊM TRẠNG THÁI HỦY (Mã 5)
            await connection.query(`INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 5, NOW())`, [MaDH]);

            // 4. Lấy chi tiết đơn hàng (Gom nhóm số lượng theo Phân Loại để tránh cộng đúp)
            const sql_lay_chi_tiet = `
                SELECT MaPhanLoai, SUM(SoLuong) AS TongSoLuong 
                FROM ChiTietDonHang 
                WHERE MaDH = ? 
                GROUP BY MaPhanLoai
            `;
            const [chi_tiet_don] = await connection.query(sql_lay_chi_tiet, [MaDH]);

            // 5. HOÀN TRẢ TỒN KHO 
            for (let item of chi_tiet_don) {
                await connection.query(`
                    UPDATE PhanLoai SET SoLuong = SoLuong + ? WHERE MaPhanLoai = ?
                `, [item.TongSoLuong, item.MaPhanLoai]);
            }

            // 6. HOÀN TRẢ KHUYẾN MÃI (Flash Sale)
            const sql_hoan_flash_sale = `
                UPDATE ChiTietKhuyenMai ctkm
                INNER JOIN ChiTietDonHang ct ON ctkm.MaPhanLoai = ct.MaPhanLoai
                SET ctkm.SoLuongDaDung = GREATEST(0, ctkm.SoLuongDaDung - ct.SoLuong)
                WHERE ct.MaDH = ? AND ct.LaHangKhuyenMai = 1
            `;
            await connection.query(sql_hoan_flash_sale, [MaDH]);
            await connection.query(`DELETE FROM LogSuDungKhuyenMai WHERE MaDH = ?`, [MaDH]);

            // 7. HOÀN TRẢ MÃ GIẢM GIÁ (VOUCHER)
            const sql_lay_voucher = `SELECT MaGG FROM LogSuDungMaGiamGia WHERE MaDH = ?`;
            const [log_voucher] = await connection.query(sql_lay_voucher, [MaDH]);
            
            if (log_voucher.length > 0) {
                await connection.query(`
                    UPDATE MaGiamGia SET SoLuongDaDung = GREATEST(0, SoLuongDaDung - 1) 
                    WHERE MaGG = ?
                `, [log_voucher[0].MaGG]);
                
                // Xóa log dùng voucher để khách có thể áp mã lại cho đơn sau
                await connection.query(`DELETE FROM LogSuDungMaGiamGia WHERE MaDH = ?`, [MaDH]);
            }

            // 8. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Hủy đơn hàng #${MaDH} - (${maHienThi}) với lý do: ${finalLyDoHuy}`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ORDER_CANCEL', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            // XỬ LÝ TRẠNG THÁI THANH TOÁN KHI HỦY
            if (don_hang[0].TrangThaiThanhToan && don_hang[0].TrangThaiThanhToan.includes('Đã thanh toán')) {
                await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = 'Chờ hoàn tiền' WHERE MaDH = ?`, [MaDH]);
            } else {
                await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = 'Đã hủy' WHERE MaDH = ?`, [MaDH]);
            }

            const sql_update_note_huy = `
                UPDATE DonHang 
                SET Note = CONCAT(COALESCE(Note, ''), '\n[HỦY ĐƠN] Lý do: ', ?) 
                WHERE MaDH = ?
            `;
            await connection.query(sql_update_note_huy, [finalLyDoHuy, MaDH]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Huỷ đơn hàng thành công! Số lượng và mã giảm giá đã được hoàn trả."
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi huỷ đơn hàng: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi huỷ đơn hàng!"});
        }
        finally {
            if (connection) connection.release();
        }
    },

    sua_thong_tin_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaDH, sdt, hoten, diachi} = req.body;
            if (!MaDH || !sdt || !hoten || !diachi) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
            }
            const MaTK = req.user.id;

            const sql_kiemtra_tt = `
                SELECT cttt.MaTrangThai, dh.MaDonHangHienThi 
                FROM ChiTietTrangThai cttt 
                INNER JOIN DonHang dh ON dh.MaDH = cttt.MaDH
                WHERE cttt.MaDH = ? 
                ORDER BY cttt.Thoigian DESC LIMIT 1
            `;
            const [trang_thai] = await connection.query(sql_kiemtra_tt,[MaDH]);

            if(trang_thai.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }
            const currentStatus = trang_thai[0].MaTrangThai;
            const maHienThi = trang_thai[0].MaDonHangHienThi;
                
            if(currentStatus === 3 || currentStatus === 4 || currentStatus === 5 || currentStatus === 6){
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Không thể thay đổi thông tin đơn hàng đã được giao hoặc đã bị hủy."
                });
            }

            const sql_cap_nhat_tt = `
                UPDATE DonHang dh
                SET dh.TenNguoiNhan = ?,
                    dh.SDTNguoiNhan = ?,
                    dh.DiaChiGiao = ?
                WHERE dh.MaDH = ?
            `;
            
            await connection.query(sql_cap_nhat_tt,[hoten, sdt, diachi, MaDH]);
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Thay đổi thông tin giao hàng của đơn #${MaDH} (${maHienThi}). Tên mới: ${hoten}, SĐT: ${sdt}`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ORDER_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

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
            if (!limit || isNaN(limit) || limit < 10) limit = 10;
            if (limit > 20) limit = 20;

            const offset = (page - 1) * limit;

            const { trangthai, ngaybatdau, ngayketthuc, timkiem, sapxep, trangthaitt, minPrice, maxPrice } = req.query;

            let conditions = [];
            let whereValues = [];
            
            let havingConditions = [];
            let havingValues = [];

            if(timkiem){
                conditions.push("(dh.MaDonHangHienThi LIKE ? or dh.MaDH like ? or dh.TenNguoiNhan COLLATE utf8mb4_unicode_ci LIKE ? or nv.TenNV COLLATE utf8mb4_unicode_ci LIKE ?)");
                whereValues.push(`%${timkiem}%`,`%${timkiem}%`,`%${timkiem}%`,`%${timkiem}%`);
            }
            if (ngaybatdau) {
                conditions.push("dh.NgayLapDon >= ?");
                whereValues.push(`${ngaybatdau} 00:00:00`);
            }
            if (ngayketthuc) {
                conditions.push("dh.NgayLapDon <= ?");
                whereValues.push(`${ngayketthuc} 23:59:59`);
            }
            if (trangthaitt) {
                if (trangthaitt === 'Chưa thanh toán') {
                    conditions.push("(dh.TrangThaiThanhToan IS NULL OR dh.TrangThaiThanhToan NOT LIKE '%Đã thanh toán%')");
                } 
                else {
                    conditions.push("dh.TrangThaiThanhToan LIKE ?");
                    whereValues.push(`%${trangthaitt}%`);
                }
            }
            if (minPrice && !isNaN(minPrice)) {
                conditions.push("dh.ThanhTien >= ?");
                whereValues.push(Number(minPrice));
            }
            if (maxPrice && !isNaN(maxPrice)) {
                conditions.push("dh.ThanhTien <= ?");
                whereValues.push(Number(maxPrice));
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
                SELECT dh.MaDH, dh.MaDonHangHienThi, dh.MaKH, dh.MaNV, kh.TenKH, nv.TenNV,
                dh.NgayLapDon, dh.TongTien, dh.TenNguoiNhan, dh.SDTNguoiNhan,
                dh.ThanhTien, dh.TrangThaiThanhToan,
                (
                    SELECT cttt.MaTrangThai
                    FROM ChiTietTrangThai cttt 
                    WHERE cttt.MaDH = dh.MaDH 
                    ORDER BY cttt.MaTrangThai DESC 
                    LIMIT 1
                ) AS MaTT,
                (
                    SELECT tt.TenTrangThai
                    FROM TrangThai tt
                    INNER JOIN ChiTietTrangThai cttt ON tt.MaTrangThai = cttt.MaTrangThai
                    WHERE cttt.MaDH = dh.MaDH 
                    ORDER BY cttt.ThoiGian DESC 
                    LIMIT 1
                ) AS TrangThai,

                (
                    SELECT COALESCE(SUM(tt.SoTienGiaoDich), 0)
                    FROM ThanhToan tt
                    WHERE tt.MaDH = dh.MaDH
                ) AS SoTienGiaoDich,

                -- BỔ SUNG: Lấy Tên phương thức thanh toán mới nhất
                (
                    SELECT pt.TenPhuongThuc
                    FROM ThanhToan tt
                    INNER JOIN PhuongThucThanhToan pt ON tt.MaPT = pt.MaPT
                    WHERE tt.MaDH = dh.MaDH
                    ORDER BY tt.NgayThanhToan DESC
                    LIMIT 1
                ) AS TenPhuongThuc,

                -- BỔ SUNG: Lấy Loại giao dịch (VD: Thanh toán toàn bộ, Cọc...)
                (
                    SELECT tt.LoaiGiaoDich
                    FROM ThanhToan tt
                    WHERE tt.MaDH = dh.MaDH
                    ORDER BY tt.NgayThanhToan DESC
                    LIMIT 1
                ) AS LoaiGiaoDich,

                -- BỔ SUNG: Lấy Ngày thanh toán
                (
                    SELECT tt.NgayThanhToan
                    FROM ThanhToan tt
                    WHERE tt.MaDH = dh.MaDH
                    ORDER BY tt.NgayThanhToan DESC
                    LIMIT 1
                ) AS NgayThanhToan

                FROM DonHang dh
                LEFT JOIN NhanVien nv ON dh.MaNV = nv.MaNV
                LEFT JOIN KhachHang kh ON kh.MaKH = dh.MaKH
                
                ${condition_clause}
                GROUP BY dh.MaDH
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
                    Latest.MaTrangThai, 
                    tt.TenTrangThai, 
                    COUNT(*) AS SoLuongDon
                FROM (
                    SELECT 
                        (SELECT MaTrangThai FROM ChiTietTrangThai cttt WHERE cttt.MaDH = dh.MaDH ORDER BY Thoigian DESC LIMIT 1) AS MaTrangThai
                    FROM DonHang dh
                ) AS Latest
                INNER JOIN TrangThai tt ON tt.MaTrangThai = Latest.MaTrangThai
                GROUP BY Latest.MaTrangThai, tt.TenTrangThai
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

    xem_chi_tiet_don_hang: async(req, res) => {
        try {
            const MaDH = Number(req.params.MaDH);
            
            // Validate định dạng ID
            if (isNaN(MaDH) || MaDH <= 0 || !Number.isInteger(MaDH)) {
                return res.status(400).json({ success: false, message: "Mã đơn hàng không hợp lệ!" });
            }

            // 1. LẤY THÔNG TIN CHUNG CỦA ĐƠN HÀNG
            const sql_donhang = `
                SELECT 
                    DonHang.MaDH, MaDonHangHienThi, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, 
                    TongTien, ThanhTien, NgayLapDon, Note, TrangThaiThanhToan, ma.MaVoucher
                FROM DonHang
                LEFT JOIN LogSuDungMaGiamGia log ON log.MaDH = DonHang.MaDH
                LEFT JOIN MaGiamGia ma ON ma.MaGG = log.MaGG
                WHERE DonHang.MaDH = ?
            `;
            const [donhang_info] = await db.query(sql_donhang, [MaDH]);

            if (donhang_info.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
            }

            // 2. LẤY DANH SÁCH SẢN PHẨM (Đã sửa lỗi thiếu dấu phẩy và tên cột)
            const sql_products = `
                SELECT 
                    mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, 
                    ct.LaHangKhuyenMai,
                    ct.GiaNhapThucTe, ct.DonGiaGoc, ct.DonGiaBan,
                    pl.MaPhanLoai, pl.ChiTietPhanLoai, ct.SoLuong,
                    ((ct.DonGiaGoc - ct.DonGiaBan) * ct.SoLuong) AS SoTienKhuyenMai
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                INNER JOIN ChiTietDonHang ct ON pl.MaPhanLoai = ct.MaPhanLoai
                WHERE ct.MaDH = ?
                ORDER BY ct.LaHangKhuyenMai ASC, mh.MaMoHinh DESC
            `;
            
            // 3. LẤY TRẠNG THÁI MỚI NHẤT
            const sql_trangthai = `
                SELECT tt.TenTrangThai, cttt.ThoiGian
                FROM TrangThai tt
                INNER JOIN ChiTietTrangThai cttt ON tt.MaTrangThai = cttt.MaTrangThai
                WHERE cttt.MaDH = ?
                ORDER BY cttt.ThoiGian DESC
                LIMIT 1
            `;

            // ⚡ TUYỆT CHIÊU TỐI ƯU TỐC ĐỘ: CHẠY SONG SONG 2 LỆNH SQL CÙNG LÚC
            const [productsResult, trangthaiResult] = await Promise.all([
                db.query(sql_products, [MaDH]),
                db.query(sql_trangthai, [MaDH])
            ]);

            // Trích xuất data từ mảng trả về
            const products = productsResult[0];
            const trangthai = trangthaiResult[0][0]; // Lấy object đầu tiên luôn cho gọn

            res.status(200).json({
                success: true,
                message: "Lấy chi tiết đơn hàng thành công",
                data: {
                    ThongTinGiaoHang: donhang_info[0],
                    TrangThaiHienTai: trangthai || null,
                    DanhSachHang: products
                }
            });
        } 
        catch (error) {
            console.error("Lỗi khi xem chi tiết đơn hàng: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác đơn hàng!" });
        }
    },

    cap_nhat_trang_thai_don_hang: async(req, res) => {
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const { MaDH, TrangThai } = req.body;
            const MaTK = req.user.id;

            const sql_lay_trang_thai = `
                SELECT cttt.MaTrangThai, dh.MaDonHangHienThi
                FROM ChiTietTrangThai cttt
                INNER JOIN DonHang dh ON cttt.MaDH = dh.MaDH
                WHERE dh.MaDH = ?
                ORDER BY cttt.Thoigian DESC
                LIMIT 1
            `;
            const [trangthai] = await connection.query(sql_lay_trang_thai, [MaDH]);

            if (trangthai.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!"});
            }
            
            const matrangthai = trangthai[0].MaTrangThai;
            const maHienThi = trangthai[0].MaDonHangHienThi; 

            if(matrangthai >= 4){
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Đơn hàng đã hoàn tất, đã hủy hoặc đang hoàn trả! Không thể cập nhật trạng thái."
                });
            }

            const trangThaiMoi = TrangThai ? parseInt(TrangThai) : (matrangthai + 1);

            const update_trang_thai = `INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, ?, NOW())`;
            await connection.query(update_trang_thai, [MaDH, trangThaiMoi]);
            
            const [tentrangthai] = await connection.query(`SELECT TenTrangThai FROM TrangThai WHERE MaTrangThai = ?`, [trangThaiMoi]);
            const ChiTietTrangThai = tentrangthai[0].TenTrangThai;

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Thay đổi trạng thái xử lý của đơn #${MaDH} (${maHienThi}): ${ChiTietTrangThai}`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ORDER_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            
            await connection.commit();
            res.status(200).json({
                success: true,
                message: `Cập nhật thành công! Đơn hàng chuyển sang: ${ChiTietTrangThai}`,
                MaDH: MaDH
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi cập nhật trạng thái đơn hàng: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi cập nhật trạng thái!"});
        }
        finally{
            if (connection) connection.release();
        }
    },

    hoan_tra_don_hang: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDH, LyDoHoan } = req.body;
            const MaTK = req.user.id;

            // Bắt buộc nhập lý do hoàn hàng để kế toán đối soát
            if (!LyDoHoan || LyDoHoan.trim() === '') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng nhập lý do hoàn trả hàng!" });
            }

            // 1. Lấy trạng thái mới nhất của đơn hàng
            const sql_kiemtra_tt = `
                SELECT cttt.MaTrangThai, dh.MaDonHangHienThi, dh.TrangThaiThanhToan
                FROM ChiTietTrangThai cttt
                INNER JOIN DonHang dh ON cttt.MaDH = dh.MaDH
                WHERE dh.MaDH = ?
                ORDER BY cttt.Thoigian DESC
                LIMIT 1
                FOR UPDATE
            `;
            const [trang_thai] = await connection.query(sql_kiemtra_tt, [MaDH]);

            if (trang_thai.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
            }

            const currentStatus = trang_thai[0].MaTrangThai;
            const maHienThi = trang_thai[0].MaDonHangHienThi; 

            // 2. ĐIỀU KIỆN SỐNG CÒN CỦA HOÀN HÀNG
            // Chỉ cho phép hoàn hàng nếu đơn đang đi trên đường (3) hoặc đã tới tay khách (4)
            if (currentStatus !== 3 && currentStatus !== 4) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Lỗi nghiệp vụ: Chỉ có thể hoàn trả các đơn hàng Đang vận chuyển hoặc Đã giao!"
                });
            }

            // 3. Cập nhật trạng thái thành 6 (Hoàn hàng/Trả hàng)
            await connection.query(`INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 6, NOW())`, [MaDH]);

            // 4. Nhập lại hàng vào kho
            const sql_lay_chi_tiet = `
                SELECT MaPhanLoai, SUM(SoLuong) AS TongSoLuong 
                FROM ChiTietDonHang 
                WHERE MaDH = ? 
                GROUP BY MaPhanLoai
            `;
            const [chi_tiet_don] = await connection.query(sql_lay_chi_tiet, [MaDH]);

            // 5. HOÀN TRẢ TỒN KHO 
            for (let item of chi_tiet_don) {
                await connection.query(`
                    UPDATE PhanLoai SET SoLuong = SoLuong + ? WHERE MaPhanLoai = ?
                `, [item.TongSoLuong, item.MaPhanLoai]);
            }

            // 6. HOÀN TRẢ KHUYẾN MÃI FLASH SALE (🌟 ĐÃ TỐI ƯU SIÊU TỐC)
            const sql_hoan_flash_sale = `
                UPDATE ChiTietKhuyenMai ctkm
                INNER JOIN ChiTietDonHang ct ON ctkm.MaPhanLoai = ct.MaPhanLoai
                SET ctkm.SoLuongDaDung = GREATEST(0, ctkm.SoLuongDaDung - ct.SoLuong)
                WHERE ct.MaDH = ? AND ct.LaHangKhuyenMai = 1
            `;
            await connection.query(sql_hoan_flash_sale, [MaDH]);
            await connection.query(`DELETE FROM LogSuDungKhuyenMai WHERE MaDH = ?`, [MaDH]);

            // 7. HOÀN TRẢ MÃ GIẢM GIÁ (VOUCHER)
            const sql_lay_voucher = `SELECT MaGG FROM LogSuDungMaGiamGia WHERE MaDH = ?`;
            const [log_voucher] = await connection.query(sql_lay_voucher, [MaDH]);
            
            if (log_voucher.length > 0) {
                await connection.query(`
                    UPDATE MaGiamGia SET SoLuongDaDung = GREATEST(0, SoLuongDaDung - 1) 
                    WHERE MaGG = ?
                `, [log_voucher[0].MaGG]);
                await connection.query(`DELETE FROM LogSuDungMaGiamGia WHERE MaDH = ?`, [MaDH]);
            }

            // 8. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            // Lưu kèm lý do hoàn hàng để kế toán tiện tra cứu
            const noiDungLog = `Xác nhận Hoàn hàng cho đơn #${MaDH} (${maHienThi}). Lý do: ${LyDoHoan}`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ORDER_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.query(`
                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                VALUES (?, ?, ?, ?)
            `, [
                `Hoàn trả đơn hàng #${MaDH}`, 
                `Đơn hàng mã ${maHienThi} vừa được xác nhận hoàn trả và nhập lại kho. Lý do: ${LyDoHoan}`, 
                "DonHang", 
                `/admin/orders?viewOrderId=${MaDH}`
            ]);

            // XỬ LÝ TRẠNG THÁI THANH TOÁN KHI HOÀN HÀNG
            if (trang_thai[0].TrangThaiThanhToan && trang_thai[0].TrangThaiThanhToan.includes('Đã thanh toán')) {
                await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = 'Chờ hoàn tiền' WHERE MaDH = ?`, [MaDH]);
            }

            const sql_update_note_hoan = `
                UPDATE DonHang 
                SET Note = CONCAT(COALESCE(Note, ''), '\n[HOÀN HÀNG] Lý do: ', ?) 
                WHERE MaDH = ?
            `;
            await connection.query(sql_update_note_hoan, [LyDoHoan.trim(), MaDH]);

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
            if (connection) connection.release();
        }
    },

    in_hoa_don: async (req, res) => {
        try {
            const MaDH = Number(req.params.MaDH);
            if (isNaN(MaDH) || MaDH <= 0 || !Number.isInteger(MaDH)) {
                return res.status(400).send("Mã đơn hàng không hợp lệ!");
            }

            // 1. Lấy thông tin chung đơn hàng
            const sql_donhang = `
                SELECT 
                    dh.MaDH, dh.MaDonHangHienThi, dh.TenNguoiNhan, dh.SDTNguoiNhan, dh.DiaChiGiao, 
                    dh.TongTien, dh.ThanhTien, dh.NgayLapDon, dh.Note, dh.TrangThaiThanhToan, ma.MaVoucher
                FROM DonHang dh
                LEFT JOIN LogSuDungMaGiamGia log ON log.MaDH = dh.MaDH
                LEFT JOIN MaGiamGia ma ON ma.MaGG = log.MaGG
                WHERE dh.MaDH = ?
            `;
            const [donhang_info] = await db.query(sql_donhang, [MaDH]);

            if (donhang_info.length === 0) {
                return res.status(404).send("Không tìm thấy đơn hàng!");
            }

            const dh = donhang_info[0];

            // 2. Lấy danh sách sản phẩm trong đơn
            const sql_products = `
                SELECT 
                    mh.TenMH, pl.ChiTietPhanLoai, ct.SoLuong, ct.DonGiaGoc, ct.DonGiaBan, ct.LaHangKhuyenMai
                FROM ChiTietDonHang ct
                INNER JOIN PhanLoai pl ON ct.MaPhanLoai = pl.MaPhanLoai
                INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh
                WHERE ct.MaDH = ?
                ORDER BY ct.LaHangKhuyenMai ASC
            `;
            const [products] = await db.query(sql_products, [MaDH]);

            // Định dạng ngày tháng và tiền tệ để hiển thị lên bill
            const formatMoney = (amount) => Number(amount).toLocaleString('vi-VN') + ' đ';
            const formatDate = (dateStr) => {
                const d = new Date(dateStr);
                return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            };

            const fs = require('fs');
            let logoBase64 = '';
            try {
                const logoPath = path.join(__dirname, '../../public/logo.png');
                const logoBuffer = fs.readFileSync(logoPath);
                logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            } 
            catch (error) {
                console.log("Không thể đọc file logo cho hóa đơn in:", error.message);
            }

            // 3. TẠO BLUEPRINT GIAO DIỆN HÓA ĐƠN BẰNG CHUỖI HTML & CSS INLINE
            let inputRows = '';
            let tongTienGiamCacMon = 0;

            products.forEach((item, index) => {
                const thanhTienGoc = item.DonGiaGoc * item.SoLuong;
                const thanhTienBan = item.DonGiaBan * item.SoLuong;
                tongTienGiamCacMon += (thanhTienGoc - thanhTienBan);

                // Nếu là hàng Flash Sale hoặc tặng kèm thì note thêm chữ bên cạnh tên
                const noteKM = item.LaHangKhuyenMai === 1 ? ' <small style="color:#ff3d00;">(FlashSale)</small>' : '';
                const tenHienThi = `${item.TenMH} - ${item.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : item.ChiTietPhanLoai}${noteKM}`;

                inputRows += `
                    <tr>
                        <td style="text-align: center; border-bottom: 1px dashed #ccc; padding: 6px 0;">${index + 1}</td>
                        <td style="border-bottom: 1px dashed #ccc; padding: 6px 0;">${tenHienThi}</td>
                        <td style="text-align: center; border-bottom: 1px dashed #ccc; padding: 6px 0;">${item.SoLuong}</td>
                        <td style="text-align: right; border-bottom: 1px dashed #ccc; padding: 6px 0;">${formatMoney(item.DonGiaGoc)}</td>
                        <td style="text-align: right; border-bottom: 1px dashed #ccc; padding: 6px 0;">${formatMoney(thanhTienGoc)}</td>
                    </tr>
                `;
            });

            const tongGiamVoucher = (dh.TongTien - tongTienGiamCacMon) - dh.ThanhTien;
            const tongGiamGiaThucTe = Math.max(0, tongTienGiamCacMon + (tongGiamVoucher > 0 ? tongGiamVoucher : 0));

            // Đoạn mã HTML hoàn chỉnh chuẩn form hóa đơn k80 hoặc A5 thị trường
            const htmlInvoice = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>In hóa đơn đơn hàng ${dh.MaDonHangHienThi}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; font-size: 13px; color: #000; margin: 0; padding: 20px; line-height: 1.4; }
                    .invoice-box { max-width: 600px; margin: auto; padding: 10px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .header h2 { margin: 5px 0; text-transform: uppercase; font-size: 20px; }
                    .header p { margin: 3px 0; font-size: 12px; color: #555; }
                    .divider { border-top: 2px solid #000; margin: 15px 0; }
                    .info-table { width: 100%; margin-bottom: 15px; }
                    .info-table td { padding: 3px 0; vertical-align: top; }
                    .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .data-table th { border-bottom: 2px solid #000; padding: 6px 0; font-weight: bold; font-size: 12px; }
                    .summary-table { width: 100%; margin-top: 15px; font-size: 13px; }
                    .summary-table td { padding: 4px 0; }
                    .footer-sign { width: 100%; margin-top: 40px; text-align: center; }
                    .footer-sign td { width: 50%; font-weight: bold; }
                    
                    /* CSS ĐẶC BIỆT KHI BẤM IN: Tự kích hoạt ẩn các thành phần thừa và tự mở hộp thoại in */
                    @media print {
                        body { padding: 0; margin: 0; }
                        @page { size: auto; margin: 5mm; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        ${logoBase64 ? `<img src="${logoBase64}" width="90" style="display: block; margin: 0 auto 10px auto; object-fit: contain;">` : ''}
                        <h2>FIGURECOLLECT SHOP</h2>
                        <p>Địa chỉ: Lạch Tray, Ngô Quyền, Hải Phòng</p>
                        <p>Hotline: 0123.456.789</p>
                        <div class="divider"></div>
                        <h3 style="margin: 10px 0; font-size: 18px;">HÓA ĐƠN BÁN HÀNG</h3>
                        <p style="font-style: italic;">Mã tra cứu: ${dh.MaDonHangHienThi}</p>
                    </div>

                    <table class="info-table">
                        <tr>
                            <td style="width: 40%"><strong>Ngày lập đơn:</strong> ${formatDate(dh.NgayLapDon)}</td>
                            <td style="width: 60%"><strong>Khách hàng:</strong> ${dh.TenNguoiNhan}</td>
                        </tr>
                        <tr>
                            <td><strong>Trạng thái:</strong> ${dh.TrangThaiThanhToan}</td>
                            <td><strong>Số điện thoại:</strong> ${dh.SDTNguoiNhan}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><strong>Địa chỉ giao:</strong> ${dh.DiaChiGiao}</td>
                        </tr>
                        ${dh.Note ? `<tr><td colspan="2"><strong>Ghi chú đơn:</strong> ${dh.Note}</td></tr>` : ''}
                    </table>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 8%; text-align: center;">STT</th>
                                <th style="text-align: left;">Tên mô hình / Phân loại</th>
                                <th style="width: 10%; text-align: center;">SL</th>
                                <th style="width: 20%; text-align: right;">Đơn giá</th>
                                <th style="width: 22%; text-align: right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inputRows}
                        </tbody>
                    </table>

                    <table class="summary-table">
                        <tr>
                            <td style="text-align: right; width: 70%;"><strong>Tổng tiền hàng:</strong></td>
                            <td style="text-align: right; width: 30%; font-weight: bold;">${formatMoney(dh.TongTien)}</td>
                        </tr>
                        ${tongGiamGiaThucTe > 0 ? `
                        <tr>
                            <td style="text-align: right; color: red;"><strong>Tổng cộng giảm giá:</strong></td>
                            <td style="text-align: right; font-weight: bold; color: red;">-${formatMoney(tongGiamGiaThucTe)}</td>
                        </tr>` : ''}
                        ${dh.MaVoucher ? `
                        <tr>
                            <td style="text-align: right; font-size: 11px; color: #666;">Mã Voucher áp dụng:</td>
                            <td style="text-align: right; font-size: 11px; color: #666; font-weight:bold;">${dh.MaVoucher}</td>
                        </tr>` : ''}
                        <tr>
                            <td style="text-align: right; font-size: 15px; border-top: 1px solid #000; padding-top: 8px;"><strong>TỔNG THANH TOÁN:</strong></td>
                            <td style="text-align: right; font-size: 16px; font-weight: bold; color: #ff3d00; border-top: 1px solid #000; padding-top: 8px;">${formatMoney(dh.ThanhTien)}</td>
                        </tr>
                    </table>

                    <table class="footer-sign">
                        <tr>
                            <td></td>
                            <td style="font-size: 12px; font-style: italic; font-weight: normal; padding-bottom: 5px;">
                                Ngày ${new Date().getDate().toString().padStart(2, '0')} tháng ${(new Date().getMonth() + 1).toString().padStart(2, '0')} năm ${new Date().getFullYear()}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom: 70px;">
                                Người mua hàng<br>
                                <span style="font-size:11px; font-weight:normal; font-style:italic;">(Ký và ghi rõ họ tên)</span>
                            </td>
                            <td style="padding-bottom: 70px;">
                                Người lập phiếu<br>
                                <span style="font-size:11px; font-weight:normal; font-style:italic;">(Ký và ghi rõ họ tên)</span>
                            </td>
                        </tr>
                    </table>

                    <p style="text-align: center; margin-top: 10px; font-size: 12px; font-style: italic; color: #555;">
                        🎉 Cảm ơn quý khách đã tin tưởng và ủng hộ FigureCollect! 🎉
                    </p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        // Tự động đóng tab sau khi in xong (nếu mở bằng cửa sổ mới)
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
            `;

            // Trả về HTML dưới dạng trang web thô trực tiếp
            res.status(200).send(htmlInvoice);

        } catch (error) {
            console.error("Lỗi khi xuất hóa đơn in ấn:", error);
            res.status(500).send("Lỗi máy chủ không thể kết xuất hóa đơn!");
        }
    },

    xuatExcelDonHang: async (req, res) => {
        try {
            const { NgayBatDau, NgayKetThuc, timkiem, trangthaitt, minPrice, maxPrice } = req.query;
            
            let conditions = [];
            let values = [];
            
            if (NgayBatDau) {
                conditions.push("dh.NgayLapDon >= ?");
                values.push(`${NgayBatDau} 00:00:00`);
            }
            if (NgayKetThuc) {
                conditions.push("dh.NgayLapDon <= ?");
                values.push(`${NgayKetThuc} 23:59:59`);
            }
            if (timkiem) {
                conditions.push("(dh.MaDH LIKE ? OR dh.TenNguoiNhan COLLATE utf8mb4_unicode_ci LIKE ?)");
                values.push(`%${timkiem}%`, `%${timkiem}%`);
            }
            if (trangthaitt) {
                if (trangthaitt === 'Chưa thanh toán') {
                    conditions.push("(dh.TrangThaiThanhToan IS NULL OR dh.TrangThaiThanhToan NOT LIKE '%Đã thanh toán%')");
                } else {
                    conditions.push("dh.TrangThaiThanhToan LIKE ?");
                    values.push(`%${trangthaitt}%`);
                }
            }
            if (minPrice && !isNaN(minPrice)) {
                conditions.push("dh.ThanhTien >= ?");
                values.push(Number(minPrice));
            }
            if (maxPrice && !isNaN(maxPrice)) {
                conditions.push("dh.ThanhTien <= ?");
                values.push(Number(maxPrice));
            }
            
            let whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

            // ==========================================
            // 1. TRUY VẤN SONG SONG 2 LUỒNG DỮ LIỆU
            // ==========================================
            const sql_doanhthu = `
                SELECT dh.MaDH, COALESCE(kh.TenKH, dh.TenNguoiNhan) AS KhachHang, 
                       dh.NgayLapDon, GROUP_CONCAT(mh.TenMH SEPARATOR ', ') AS ChiTietSanPham, dh.ThanhTien
                FROM DonHang dh
                LEFT JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                LEFT JOIN ChiTietDonHang ctdh ON dh.MaDH = ctdh.MaDH
                LEFT JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai
                LEFT JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh
                ${whereClause}
                GROUP BY dh.MaDH
                ORDER BY dh.NgayLapDon DESC
            `;

            const sql_nhatky = `
                SELECT cttt.MaDH, tt.TenTrangThai, cttt.Thoigian
                FROM ChiTietTrangThai cttt
                INNER JOIN TrangThai tt ON cttt.MaTrangThai = tt.MaTrangThai
                INNER JOIN DonHang dh ON cttt.MaDH = dh.MaDH
                ${whereClause}
                ORDER BY cttt.Thoigian DESC
            `;

            const [[donHangs], [nhatKys]] = await Promise.all([
                db.query(sql_doanhthu, values),
                db.query(sql_nhatky, values)
            ]);

            const workbook = new ExcelJS.Workbook();
            
            // Định dạng viền đen (Black Border) tiêu chuẩn cho toàn bộ các cell
            const blackBorder = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };

            // ==============================================
            // SHEET 1: BÁO CÁO DOANH THU ĐƠN HÀNG
            // ==============================================
            const ws1 = workbook.addWorksheet('Báo cáo doanh thu');
            ws1.views = [{ showGridLines: false }];
            ws1.columns = [
                { key: 'MaDH', width: 15 },
                { key: 'KhachHang', width: 30 },
                { key: 'NgayLapDon', width: 25 },
                { key: 'ChiTietSanPham', width: 50 },
                { key: 'ThanhTien', width: 20 },
            ];

            // 1. Chèn Logo
            try {
                const path = require('path');
                // Sửa lại đường dẫn logo cho đúng với thư mục public của bạn
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                const logoId1 = workbook.addImage({ filename: logoPath, extension: 'png' });
                ws1.addImage(logoId1, { tl: { col: 0, row: 0 }, br: { col: 1, row: 3 } });
            } catch (err) { console.log("Lỗi chèn ảnh Logo:", err.message); }

            // 2. Header Thông tin
            ws1.getCell('B1').value = 'FIGURECOLLECT';
            ws1.getCell('B1').font = { size: 16, bold: true, color: { argb: 'FFFF8F73' } };
            ws1.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
            ws1.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' } };

            ws1.mergeCells('A5:E5');
            ws1.getCell('A5').value = 'BÁO CÁO DOANH THU BÁN HÀNG';
            ws1.getCell('A5').font = { size: 16, bold: true, color: { argb: 'FF222532' } };
            ws1.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

            let filterText = (NgayBatDau && NgayKetThuc) ? `Từ ${NgayBatDau} đến ${NgayKetThuc}` : 'Tất cả thời gian';
            if (trangthaitt) {
                filterText += ` | Thanh toán: ${trangthaitt}`;
            }
            if (minPrice || maxPrice) {
                const min = minPrice ? new Intl.NumberFormat('vi-VN').format(minPrice) : '0';
                const max = maxPrice ? new Intl.NumberFormat('vi-VN').format(maxPrice) : 'Không giới hạn';
                filterText += ` | Giá trị đơn: ${min}đ - ${max}đ`;
            }

            ws1.mergeCells('A6:E6');
            ws1.getCell('A6').value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')} | Dữ liệu: ${filterText}`;
            ws1.getCell('A6').font = { italic: true, size: 10, color: { argb: 'FF737580' } };
            ws1.getCell('A6').alignment = { horizontal: 'center' };

            // 3. Header Bảng Dữ Liệu
            const headerRow1 = ws1.getRow(9);
            headerRow1.values = ['Mã đơn hàng', 'Khách hàng', 'Ngày mua', 'Chi tiết sản phẩm', 'Tổng tiền (VNĐ)'];
            headerRow1.height = 25;
            
            headerRow1.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8F73' } }; // Nền cam
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }; // Chữ trắng
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = blackBorder; // Bôi viền đen
            });

            // 4. Đổ Dữ Liệu
            donHangs.forEach((item) => {
                const row = ws1.addRow({
                    MaDH: `#FC-${item.MaDH}`,
                    KhachHang: item.KhachHang,
                    NgayLapDon: new Date(item.NgayLapDon).toLocaleString('vi-VN'),
                    ChiTietSanPham: item.ChiTietSanPham,
                    ThanhTien: item.ThanhTien
                });

                row.eachCell((cell, colNum) => {
                    cell.font = { size: 11, color: { argb: 'FF000000' } };
                    cell.border = blackBorder; // Bôi viền đen từng ô
                    
                    if (colNum === 5) { // Cột Tiền
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        cell.numFmt = '#,##0';
                    } else if (colNum === 1 || colNum === 3) { // Cột Mã & Ngày
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    }
                });
            });

            // ==============================================
            // SHEET 2: BÁO CÁO NHẬT KÝ HOẠT ĐỘNG
            // ==============================================
            const ws2 = workbook.addWorksheet('Nhật ký hoạt động');
            ws2.views = [{ showGridLines: false }];
            ws2.columns = [
                { key: 'MaDH', width: 20 },
                { key: 'TrangThai', width: 40 },
                { key: 'ThoiGian', width: 30 }
            ];

            // 1. Chèn Logo
            try {
                const path = require('path');
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                const logoId2 = workbook.addImage({ filename: logoPath, extension: 'png' });
                ws2.addImage(logoId2, { tl: { col: 0, row: 0 }, br: { col: 1, row: 3 } });
            } catch (err) {}

            // 2. Header Thông tin
            ws2.getCell('B1').value = 'FIGURECOLLECT';
            ws2.getCell('B1').font = { size: 16, bold: true, color: { argb: 'FFFF8F73' } };
            ws2.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
            ws2.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' } };

            ws2.mergeCells('A5:C5');
            ws2.getCell('A5').value = 'BÁO CÁO NHẬT KÝ CHUYỂN TRẠNG THÁI ĐƠN HÀNG';
            ws2.getCell('A5').font = { size: 16, bold: true, color: { argb: 'FF222532' } };
            ws2.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

            ws2.mergeCells('A6:C6');
            ws2.getCell('A6').value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')} | Dữ liệu: ${filterText}`;
            ws2.getCell('A6').font = { italic: true, size: 10, color: { argb: 'FF737580' } };
            ws2.getCell('A6').alignment = { horizontal: 'center' };

            // 3. Header Bảng
            const headerRow2 = ws2.getRow(9);
            headerRow2.values = ['Mã đơn hàng', 'Trạng thái cập nhật', 'Thời gian ghi nhận'];
            headerRow2.height = 25;
            
            headerRow2.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222532' } }; // Nền đen cho Sheet 2 (Dễ phân biệt)
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = blackBorder; // Bôi viền đen
            });

            // 4. Đổ Dữ Liệu
            nhatKys.forEach((item) => {
                const row = ws2.addRow({
                    MaDH: `#FC-${item.MaDH}`,
                    TrangThai: item.TenTrangThai,
                    ThoiGian: new Date(item.Thoigian).toLocaleString('vi-VN')
                });

                row.eachCell((cell, colNum) => {
                    cell.font = { size: 11, color: { argb: 'FF000000' } };
                    cell.border = blackBorder; // Bôi viền đen
                    if (colNum === 2) {
                        cell.alignment = { horizontal: 'left', vertical: 'middle' };
                    } else {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                });
            });

            // ==============================================
            // TRẢ FILE VỀ CHO TRÌNH DUYỆT (FRONTEND)
            // ==============================================
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Bao_Cao_Don_Hang_FigureCollect_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error("Lỗi xuất Excel quản lý đơn hàng:", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi tạo file Excel" });
        }
    },

    xac_nhan_thanh_toan: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDH } = req.body;
            const MaTK = req.user.id;

            // 1. Kiểm tra đơn hàng có tồn tại không và LẤY TRẠNG THÁI ĐƠN HÀNG HIỆN TẠI
            const sql_check = `
                SELECT dh.MaDH, dh.MaDonHangHienThi, dh.ThanhTien, dh.TrangThaiThanhToan,
                       (SELECT MaTrangThai FROM ChiTietTrangThai cttt WHERE cttt.MaDH = dh.MaDH ORDER BY Thoigian DESC LIMIT 1) AS TrangThaiHienTai
                FROM DonHang dh
                WHERE dh.MaDH = ? FOR UPDATE
            `;
            const [don_hang] = await connection.query(sql_check, [MaDH]);

            if (don_hang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
            }

            const dh = don_hang[0];

            // NẾU ĐƠN HÀNG ĐÃ BỊ HỦY HOẶC ĐANG HOÀN HÀNG THÌ KHÔNG CHO THANH TOÁN
            if (dh.TrangThaiHienTai === 5 || dh.TrangThaiHienTai === 6) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Không thể thu tiền cho đơn hàng đã bị Hủy hoặc Hoàn trả!" });
            }

            // 2. Chặn nếu đơn đã thanh toán rồi
            if (dh.TrangThaiThanhToan && dh.TrangThaiThanhToan.includes('Đã thanh toán')) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Đơn hàng này đã được thanh toán từ trước!" });
            }

            // 3. Cập nhật trạng thái ở bảng DonHang
            const trangThaiMoi = 'Đã thanh toán (Thu hộ COD)';
            await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = ? WHERE MaDH = ?`, [trangThaiMoi, MaDH]);

            // 4. Ghi nhận giao dịch vào bảng ThanhToan
            const sql_check_tt = `SELECT MaTT FROM ThanhToan WHERE MaDH = ?`;
            const [check_tt] = await connection.query(sql_check_tt, [MaDH]);

            if (check_tt.length > 0) {
                // Nếu lúc tạo đơn có insert sẵn thì update lại
                await connection.query(`
                    UPDATE ThanhToan 
                    SET TrangThaiGiaoDich = 'Thành công', NgayThanhToan = NOW(), SoTienGiaoDich = ? 
                    WHERE MaDH = ?
                `, [dh.ThanhTien, MaDH]);
            } else {
                // Nếu chưa có thì chèn dòng giao dịch mới
                await connection.query(`
                    INSERT INTO ThanhToan (MaPT, MaDH, NgayThanhToan, SoTienGiaoDich, LoaiGiaoDich, TrangThaiGiaoDich) 
                    VALUES (3, ?, NOW(), ?, 'Thanh toán toàn bộ', 'Thành công')
                `, [MaDH, dh.ThanhTien]);
            }

            // 5. Ghi Log Hoạt động
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Xác nhận đã thu tiền thành công cho đơn hàng #${MaDH} (${dh.MaDonHangHienThi}). Số tiền: ${dh.ThanhTien.toLocaleString('vi-VN')} đ`;
            
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'PAYMENT_CONFIRM', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Xác nhận thu tiền thành công!",
                TrangThaiThanhToan: trangThaiMoi
            });

        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi xác nhận thanh toán:", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi xác nhận thanh toán!" });
        } 
        finally {
            if (connection) connection.release();
        }
    },
    xac_nhan_hoan_tien: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDH } = req.body;
            const MaTK = req.user.id;

            const sql_check = `SELECT MaDonHangHienThi, ThanhTien, TrangThaiThanhToan FROM DonHang WHERE MaDH = ? FOR UPDATE`;
            const [don_hang] = await connection.query(sql_check, [MaDH]);

            if (don_hang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
            }

            const dh = don_hang[0];

            if (dh.TrangThaiThanhToan !== 'Chờ hoàn tiền') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Đơn hàng này không ở trạng thái cần hoàn tiền!" });
            }

            // 1. Cập nhật bảng DonHang
            const trangThaiMoi = 'Đã hoàn tiền';
            await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = ? WHERE MaDH = ?`, [trangThaiMoi, MaDH]);

            // 2. Ghi một giao dịch ÂM (Hoàn tiền) vào bảng ThanhToan để đối soát
            await connection.query(`
                INSERT INTO ThanhToan (MaPT, MaDH, NgayThanhToan, SoTienGiaoDich, LoaiGiaoDich, TrangThaiGiaoDich) 
                VALUES (4, ?, NOW(), ?, 'Hoàn tiền cho khách', 'Thành công')
            `, [MaDH, -dh.ThanhTien]);

            // 3. Ghi Log
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Xác nhận Đã hoàn tiền cho đơn hàng #${MaDH} (${dh.MaDonHangHienThi}). Số tiền hoàn: ${dh.ThanhTien.toLocaleString('vi-VN')} đ`;
            await connection.query(`INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian) VALUES (?, 'PAYMENT_REFUND', ?, ?, NOW())`, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({ success: true, message: "Xác nhận hoàn tiền thành công!", TrangThaiThanhToan: trangThaiMoi });
        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi hoàn tiền:", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi xác nhận hoàn tiền!" });
        } 
        finally {
            if (connection) connection.release();
        }
    },
    liet_ke_giao_dich: async (req, res) => {
        try {
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            if (page < 1) page = 1;
            if (limit < 10) limit = 10;
            if (limit > 50) limit = 50; // Giới hạn tối đa để tránh quá tải tải dữ liệu
            const offset = (page - 1) * limit;

            const { ngaybatdau, ngayketthuc, phuongthuc, loai, timkiem } = req.query;

            let conditions = [];
            let values = [];

            // 1. Lọc theo thời gian giao dịch
            if (ngaybatdau) {
                conditions.push("tt.NgayThanhToan >= ?");
                values.push(`${ngaybatdau} 00:00:00`);
            }
            if (ngayketthuc) {
                conditions.push("tt.NgayThanhToan <= ?");
                values.push(`${ngayketthuc} 23:59:59`);
            }

            // 2. Lọc theo phương thức thanh toán (ID của phương thức)
            if (phuongthuc && phuongthuc !== 'all') {
                conditions.push("tt.MaPT = ?");
                values.push(parseInt(phuongthuc));
            }

            // 3. Lọc theo loại giao dịch (Thu tiền / Hoàn tiền)
            if (loai && loai !== 'all') {
                if (loai === 'thu') {
                    conditions.push("tt.SoTienGiaoDich > 0");
                } else if (loai === 'chi') {
                    conditions.push("tt.SoTienGiaoDich < 0");
                }
            }

            // 4. Tìm kiếm từ khóa (Mã đơn hiển thị hoặc Mã giao dịch đối tác)
            if (timkiem) {
                conditions.push("(dh.MaDonHangHienThi LIKE ? OR COALESCE(tt.MaGiaoDichCuaDoiTac, '') LIKE ?)");
                values.push(`%${timkiem}%`, `%${timkiem}%`);
            }

            let whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

            // --- LUỒNG 1: TÍNH TOÁN KPI TỔNG QUAN THEO BỘ LỌC THỜI GIAN/TỪ KHÓA ---
            const sql_kpi = `
                SELECT 
                    IFNULL(SUM(CASE WHEN tt.SoTienGiaoDich > 0 THEN tt.SoTienGiaoDich ELSE 0 END), 0) AS TongTienVao,
                    IFNULL(SUM(CASE WHEN tt.SoTienGiaoDich < 0 THEN tt.SoTienGiaoDich ELSE 0 END), 0) AS TongTienRa,
                    IFNULL(SUM(tt.SoTienGiaoDich), 0) AS DongTienThuan
                FROM ThanhToan tt
                INNER JOIN DonHang dh ON tt.MaDH = dh.MaDH
                ${whereClause}
            `;
            const [kpiResult] = await db.query(sql_kpi, values);

            // --- LUỒNG 2: ĐẾM TỔNG SỐ BẢN GHI ĐỂ PHÂN TRANG ---
            const sql_count = `
                SELECT COUNT(*) AS total 
                FROM ThanhToan tt
                INNER JOIN DonHang dh ON tt.MaDH = dh.MaDH
                ${whereClause}
            `;
            const [countResult] = await db.query(sql_count, values);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            // --- LUỒNG 3: LẤY DANH SÁCH CHI TIẾT GIAO DỊCH PHÂN TRANG ---
            const sql_data = `
                SELECT 
                    tt.MaTT, tt.NgayThanhToan, tt.SoTienGiaoDich, tt.LoaiGiaoDich, 
                    tt.TrangThaiGiaoDich, tt.MaGiaoDichCuaDoiTac,
                    dh.MaDH, dh.MaDonHangHienThi, dh.TenNguoiNhan,
                    pt.TenPhuongThuc
                FROM ThanhToan tt
                INNER JOIN DonHang dh ON tt.MaDH = dh.MaDH
                INNER JOIN PhuongThucThanhToan pt ON tt.MaPT = pt.MaPT
                ${whereClause}
                ORDER BY tt.NgayThanhToan DESC
                LIMIT ? OFFSET ?
            `;
            
            const [transactions] = await db.query(sql_data, [...values, limit, offset]);

            res.status(200).json({
                success: true,
                message: "Lấy lịch sử dòng tiền tài chính thành công!",
                kpi: kpiResult[0],
                data: transactions,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });
        } catch (error) {
            console.error("Lỗi hệ thống khi kết xuất dòng tiền: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ không thể lấy dữ liệu tài chính!" });
        }
    },
    xuat_excel_giao_dich: async (req, res) => {
        try {
            const { ngaybatdau, ngayketthuc, phuongthuc, loai, timkiem } = req.query;
            let conditions = [];
            let values = [];

            if (ngaybatdau) { conditions.push("tt.NgayThanhToan >= ?"); values.push(`${ngaybatdau} 00:00:00`); }
            if (ngayketthuc) { conditions.push("tt.NgayThanhToan <= ?"); values.push(`${ngayketthuc} 23:59:59`); }
            if (phuongthuc && phuongthuc !== 'all') { conditions.push("tt.MaPT = ?"); values.push(parseInt(phuongthuc)); }
            if (loai && loai !== 'all') {
                if (loai === 'thu') conditions.push("tt.SoTienGiaoDich > 0");
                else if (loai === 'chi') conditions.push("tt.SoTienGiaoDich < 0");
            }
            if (timkiem) {
                conditions.push("(dh.MaDonHangHienThi LIKE ? OR tt.MaGiaoDichCuaDoiTac LIKE ?)");
                values.push(`%${timkiem}%`, `%${timkiem}%`);
            }

            let whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

            const sql_data = `
                SELECT 
                    tt.NgayThanhToan, tt.SoTienGiaoDich, tt.LoaiGiaoDich, 
                    tt.TrangThaiGiaoDich, tt.MaGiaoDichCuaDoiTac,
                    dh.MaDonHangHienThi, dh.TenNguoiNhan, pt.TenPhuongThuc
                FROM ThanhToan tt
                INNER JOIN DonHang dh ON tt.MaDH = dh.MaDH
                INNER JOIN PhuongThucThanhToan pt ON tt.MaPT = pt.MaPT
                ${whereClause}
                ORDER BY tt.NgayThanhToan DESC
            `;
            const [transactions] = await db.query(sql_data, values);

            const ExcelJS = require('exceljs');
            const path = require('path');
            const workbook = new ExcelJS.Workbook();
            const ws = workbook.addWorksheet('Dữ liệu giao dịch');

            // 1. ẨN GRIDLINES CHO SẠCH SẼ
            ws.views = [{ showGridLines: false }];

            // 2. CẤU HÌNH CỘT (Tương ứng từ A đến G)
            ws.columns = [
                { key: 'NgayThanhToan', width: 22 },
                { key: 'MaDH', width: 18 },
                { key: 'KhachHang', width: 25 },
                { key: 'PhuongThuc', width: 20 },
                { key: 'MaDoiSoat', width: 25 },
                { key: 'LoaiGiaoDich', width: 25 },
                { key: 'SoTien', width: 20 }
            ];

            // 3. TÔ NỀN TRẮNG KHU VỰC HEADER (Dòng 1-8, Cột 1-7)
            for (let i = 1; i <= 8; i++) {
                for (let j = 1; j <= 7; j++) {
                    ws.getCell(i, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                }
            }

            // 4. CHÈN LOGO
            try {
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                const logoId = workbook.addImage({ filename: logoPath, extension: 'png' });
                ws.addImage(logoId, {
                    tl: { col: 0, row: 0 },
                    br: { col: 1, row: 3 }
                });
            } catch (err) {
                console.log("Lỗi chèn ảnh Logo:", err.message);
            }

            // 5. HEADER THƯƠNG HIỆU & TIÊU ĐỀ
            ws.mergeCells('B1:G1');
            ws.getCell('B1').value = 'FIGURECOLLECT';
            ws.getCell('B1').font = { size: 16, bold: true, color: { argb: 'FFFF8F73' } }; // Cam San Hô

            ws.mergeCells('B2:G2');
            ws.getCell('B2').value = 'Đơn vị chuyên mô hình Anime & Hobby chính hãng';
            ws.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' } };

            ws.mergeCells('A4:G4');
            ws.getCell('A4').border = { bottom: { style: 'medium', color: { argb: 'FFFFC3C2' } } };

            ws.mergeCells('A5:G5');
            ws.getCell('A5').value = 'BÁO CÁO GIAO DỊCH THANH TOÁN';
            ws.getCell('A5').font = { size: 16, bold: true, color: { argb: 'FF222532' } };
            ws.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

            const filterText = (ngaybatdau && ngayketthuc) ? `Từ ${ngaybatdau} đến ${ngayketthuc}` : 'Tất cả thời gian';
            ws.mergeCells('A6:G6');
            ws.getCell('A6').value = `Ngày xuất: ${new Date().toLocaleString('vi-VN')} | Kỳ dữ liệu: ${filterText}`;
            ws.getCell('A6').font = { italic: true, size: 10, color: { argb: 'FF737580' } };
            ws.getCell('A6').alignment = { horizontal: 'center' };

            // 6. HEADER BẢNG DỮ LIỆU
            const headerRow = ws.getRow(9);
            headerRow.values = ['Thời gian', 'Mã đơn hàng', 'Khách hàng', 'Phương thức', 'Mã đối soát (Bank/Ví)', 'Nghiệp vụ', 'Số tiền (VNĐ)'];
            headerRow.height = 25;
            
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8F73' } }; // Nền cam
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }; // Chữ trắng
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });

            ws.autoFilter = 'A9:G9';

            // 7. ĐỔ DỮ LIỆU VỚI HIỆU ỨNG ZEBRA (Xen kẽ dòng) VÀ MÀU TÀI CHÍNH
            transactions.forEach((tx, index) => {
                const row = ws.addRow({
                    NgayThanhToan: new Date(tx.NgayThanhToan).toLocaleString('vi-VN'),
                    MaDH: tx.MaDonHangHienThi,
                    KhachHang: tx.TenNguoiNhan || 'Khách vãng lai',
                    PhuongThuc: tx.TenPhuongThuc,
                    MaDoiSoat: tx.MaGiaoDichCuaDoiTac || '[Nội bộ / COD]',
                    LoaiGiaoDich: tx.LoaiGiaoDich,
                    SoTien: tx.SoTienGiaoDich
                });
                
                // Trắng xen kẽ xám nhạt
                const isEven = index % 2 === 0;
                const rowFillColor = isEven ? 'FFFFFFFF' : 'FFF8F9FA'; 

                row.eachCell((cell, colNumber) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFillColor } };
                    cell.font = { size: 10, color: { argb: 'FF222532' } };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                    };
                    
                    if (colNumber === 1 || colNumber === 2 || colNumber === 4) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    } else if (colNumber === 7) { // Cột Số Tiền
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        cell.numFmt = '#,##0';
                        
                        // ĐIỂM NHẤN TÀI CHÍNH: Tiền dương màu Xanh, Tiền âm màu Đỏ
                        if (tx.SoTienGiaoDich > 0) {
                            cell.font = { size: 10, color: { argb: 'FF10B981' }, bold: true }; // Xanh lá Emerald
                        } else {
                            cell.font = { size: 10, color: { argb: 'FFE11D48' }, bold: true }; // Đỏ Rose
                        }
                    } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    }
                });
            });

            // 8. XUẤT FILE
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `Giao_Dich_Thanh_Toan_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } 
        catch (error) {
            console.error("Lỗi xuất Excel:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi tạo file Excel" });
        }
    }
}
module.exports = donhang_admin;