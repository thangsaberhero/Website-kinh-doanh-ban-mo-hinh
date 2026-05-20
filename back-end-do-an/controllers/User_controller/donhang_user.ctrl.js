const db = require('../../config/db.js');
//const PayOS = require("@payos/node");
// /const payos = new PayOS("YOUR_CLIENT_ID", "YOUR_API_KEY", "YOUR_CHECKSUM_KEY");

const donhang_user = {
    them_hang_vao_gio: async(req, res) =>{
        try {
            const {MaKH, MaPhanLoai, soluong} = req.body;
            const sql_laymagiohang = 'Select MaGH from GioHang where MaKH = ?';
            const [result_giohang] = await db.query(sql_laymagiohang,[MaKH]);

            if(result_giohang.length === 0)
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});

            const maGH = result_giohang[0].MaGH;

            //check món hàng đã có chưa
            const sql_check = 'Select * from ChiTietGioHang where MaGH = ? and MaMoHinh = ?';
            const [check] = await db.query(sql_check,[MaKH, MaPhanLoai]);
            if (check.length === 0){
                const sql_themhangmoivaogio = `Insert into ChiTietGioHang(MaGH, MaMoHinh, SoLuong) values (?,?,?)`;
                await db.query(sql_themhangmoivaogio,[maGH,MaPhanLoai,soluong]);

                res.status(200).json({
                message: "Thêm hàng mới vào giỏ thành công!",
                MaGioHangCuaKhach: maGH
            });
                }
            else{
                const sql_kiemtra = `Select ctgh.SoLuong as TrongGio, pl.SoLuong as TonKho
                    from ChiTietGioHang ctgh
                    inner join Phanloai pl on ctgh.MaMoHinh = pl.MaPhanLoai
                    where ctgh.MaGH = ? and ctgh.MaMoHinh = ?`;
                const [kiem_tra] = await db.query(sql_kiemtra,[maGH, MaPhanLoai]);
                const tronggio = kiem_tra[0].TrongGio;
                const tonkho = kiem_tra[0].TonKho;
                let so_luong_moi = tronggio + soluong;
                let thongBao = "Cập nhật giỏ hàng thành công!";

                if (so_luong_moi >= tonkho) {
                    so_luong_moi = tonkho;
                    thongBao = `Đã đạt giới hạn! Kho hiện chỉ còn ${tonkho} sản phẩm.`;
                }

                const sql_themhangvaogio = 'Update ChiTietGioHang set SoLuong = ? where MaGH = ? and MaMoHinh = ?'
                await db.query(sql_themhangvaogio,[so_luong_moi,maGH,MaPhanLoai])

                res.status(200).json({
                message: "Cập nhật giỏ hàng thành công!",
                MaGioHangCuaKhach: maGH
            });
            } 
        }
        catch (error){
            console.error("Lỗi khi thêm vào giỏ: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác giỏ hàng!"});
        }
    },

    cap_nhat_gio_hang: async(req, res) =>{
        try {
            const {MaKH, MaPhanLoai, soluong} = req.body;
            const sql_laymagiohang = 'Select MaGH from GioHang where MaKH = ?';
            const [result_giohang] = await db.query(sql_laymagiohang,[MaKH]);

            if(result_giohang.length === 0)
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});

            const maGH = result_giohang[0].MaGH;
            await db.query('Update ChiTietGioHang set SoLuong = ? where MaMoHinh = ? and MaGH = ?',[soluong, MaPhanLoai, maGH]);

            res.status(200).json({
                message: "Cập nhật giỏ hàng thành công!",
                MaGioHangCuaKhach: maGH
            });
        }
        catch (error) {
            console.error("Lỗi khi thêm vào giỏ: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác giỏ hàng!"});
        }
    },


    xoa_hang_trong_gio: async(req, res) =>{
        try {
            const {MaKH, MaPhanLoai} = req.body;
            const sql_laymagiohang = 'Select MaGH from GioHang where MaKH = ?';
            const [result_giohang] = await db.query(sql_laymagiohang,[MaKH]);

            if(result_giohang.length === 0)
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});

            const maGH = result_giohang[0].MaGH;
            await db.query('Delete from ChiTietGioHang where MaMoHinh = ? and MaGH = ?',[MaPhanLoai, maGH]);
            res.status(200).json({
                message: "Xoá món hàng trong giỏ thành công!",
                MaGioHangCuaKhach: maGH
            })
        }
        catch (error){
            console.error("Lỗi khi xoá hàng trong giỏ: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác giỏ hàng!"});
        }
    },

    xoa_het_hang_trong_gio: async(req, res) =>{
        try {
            const {MaKH} = req.body;
            const sql_laymagiohang = 'Select MaGH from GioHang where MaKH = ?';
            const [result_giohang] = await db.query(sql_laymagiohang,[MaKH]);

            if(result_giohang.length === 0)
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});

            const maGH = result_giohang[0].MaGH;
            await db.query('Delete from ChiTietGioHang where MaGH = ?',[maGH]);
            res.status(200).json({
                message: "Xoá món hàng trong giỏ thành công!",
                MaGioHangCuaKhach: maGH
            })
        }
        catch (error){
            console.error("Lỗi khi xoá hết hàng trong giỏ: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác giỏ hàng!"});
        }
    },

    xem_hang_trong_gio: async(req, res) =>{
        try {
            const MaKH = req.params.MaKH;
            const sql_laymagiohang = 'Select MaGH from GioHang where MaKH = ?';
            const [result_giohang] = await db.query(sql_laymagiohang,[MaKH]);

            if(result_giohang.length === 0)
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});

            const MaGH = result_giohang[0].MaGH;
            const {sapxep} = req.query;
            let filter  = "";
            if(sapxep === 'price_asc')
                filter = "order by DonGiaKhuyenMai ASC";
            else if(sapxep === 'price_desc')
                filter = "order by DonGiaKhuyenMai DESC";
            else
                filter = "order by mh.NgayPhatHanh DESC";

            const sql_ds = `SELECT 
                    mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.TienCocToiThieu,
                    pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, pl.SoLuong AS TonKho,
                    ct.SoLuong,
                    
                    -- Giá sau khuyến mãi (Nếu không có sale thì bằng giá gốc)
                    (pl.DonGia - COALESCE(km_info.MucGiam, 0)) AS DonGiaKhuyenMai,
                    
                    -- Lấy số lượng khuyến mãi còn lại ra cho Frontend hiển thị
                    COALESCE(km_info.SoLuongConLai, 0) AS SoLuongKhuyenMaiConLai
                    
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                INNER JOIN ChiTietGioHang ct ON pl.MaPhanLoai = ct.MaMoHinh
                
                -- TUYỆT CHIÊU: GOM LOGIC KHUYẾN MÃI VÀO 1 BẢNG ẢO (LEFT JOIN)
                LEFT JOIN (
                    SELECT 
                        ctkm.MaPhanLoai,
                        (ctkm.SoLuongKM - ctkm.SoLuongDaDung) AS SoLuongConLai,
                        MAX(CASE
                            WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                            WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl_sub.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl_sub.DonGia))
                            ELSE 0
                        END) AS MucGiam
                    FROM ChiTietKhuyenMai ctkm
                    INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                    INNER JOIN PhanLoai pl_sub ON ctkm.MaPhanLoai = pl_sub.MaPhanLoai
                    WHERE km.TrangThaiHoatDong = 1
                      AND km.ThoiGianBD <= NOW()
                      AND km.ThoiGianKT >= NOW()
                      AND (ctkm.SoLuongKM - ctkm.SoLuongDaDung) > 0
                    GROUP BY ctkm.MaPhanLoai, ctkm.SoLuongKM, ctkm.SoLuongDaDung
                ) AS km_info ON pl.MaPhanLoai = km_info.MaPhanLoai
                
                WHERE ct.MaGH = ?
                ${filter}
            `;
            const sql_summary = `
                SELECT 
                    SUM(pl.DonGia * ct.SoLuong) AS TotalSubtotal,
                    
                    -- Tính tổng tiền giảm: Hàm LEAST đảm bảo khách chỉ được giảm tối đa bằng số lượng Sale còn lại
                    SUM(
                        LEAST(ct.SoLuong, COALESCE(km_info.SoLuongConLai, 0)) * COALESCE(km_info.MucGiam, 0)
                    ) AS TotalDiscount
                    
                FROM ChiTietGioHang ct
                INNER JOIN PhanLoai pl ON pl.MaPhanLoai = ct.MaMoHinh
                LEFT JOIN (
                    SELECT 
                        ctkm.MaPhanLoai,
                        (ctkm.SoLuongKM - ctkm.SoLuongDaDung) AS SoLuongConLai,
                        MAX(CASE
                            WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                            WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl_sub.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl_sub.DonGia))
                            ELSE 0
                        END) AS MucGiam
                    FROM ChiTietKhuyenMai ctkm
                    INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                    INNER JOIN PhanLoai pl_sub ON ctkm.MaPhanLoai = pl_sub.MaPhanLoai
                    WHERE km.TrangThaiHoatDong = 1
                      AND km.ThoiGianBD <= NOW()
                      AND km.ThoiGianKT >= NOW()
                      AND (ctkm.SoLuongKM - ctkm.SoLuongDaDung) > 0
                    GROUP BY ctkm.MaPhanLoai, ctkm.SoLuongKM, ctkm.SoLuongDaDung
                ) AS km_info ON pl.MaPhanLoai = km_info.MaPhanLoai
                
                WHERE ct.MaGH = ?
            `;
            
            const [[products], [summaryResult] ] = await Promise.all([
                db.query(sql_ds, [MaGH]),
                db.query(sql_summary, [MaGH])
            ]);
            const Subtotal = Number(summaryResult[0].TotalSubtotal) || 0;
            const Discount = Number(summaryResult[0].TotalDiscount) || 0;
            const TotalPrice = Subtotal - Discount
            

            const formattedProducts = products.map(item => {
                // Nếu số lượng khuyến mãi > 0 thì lấy nhỏ hơn giữa (Số mua) và (Số Sale)
                // Nếu không có khuyến mãi, Số lượng Sale = 0
                const slDuocSale = item.SoLuongKhuyenMaiConLai > 0 
                                   ? Math.min(item.SoLuong, item.SoLuongKhuyenMaiConLai) 
                                   : 0;
                
                // Số lượng phải mua giá gốc
                const slMuaGiaGoc = item.SoLuong - slDuocSale;
                
                // Thành tiền = (Hàng sale * Giá sale) + (Hàng gốc * Giá gốc)
                const thanhTien = (slDuocSale * item.DonGiaKhuyenMai) + (slMuaGiaGoc * item.DonGia);

                return {
                    ...item,
                    SoLuongDuocGiamGia: slDuocSale,
                    SoLuongMuaGiaGoc: slMuaGiaGoc,
                    ThanhTien: thanhTien
                };
            });

            res.status(200).json({
                success: true,
                message: "Lấy danh sách sản phẩm thành công",
                data: formattedProducts,
                cartSummary: {
                    subtotal: Subtotal,
                    discount: Discount,
                    totalPrice: TotalPrice
                }
            });
        } 
        catch (error){
            console.error("Lỗi khi xem giỏ hàng: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi thao tác giỏ hàng!"});
        }
    },

    xac_nhan_don_hang: async(req, res) => {
        const connection = await db.getConnection(); 

        try {
            const { MaKH, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note , MaGG} = req.body;
           
            const sql_laymagiohang = 'SELECT MaGH FROM GioHang WHERE MaKH = ?';
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaKH]);

            if(result_giohang.length === 0) {
                connection.release();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng"});
            }
            const MaGH = result_giohang[0].MaGH;
            
            // 1. Kiểm tra giỏ hàng có đồ không? Giỏ trống thì không cho đặt!
            

            // ================= BẮT ĐẦU TRANSACTION =================
            await connection.beginTransaction(); 
            //Kiểm tra số lượng tồn kho trước khi đặt hàng:
            const sql_get_cart_item = `SELECT 
                    mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.TienCocToiThieu, mh.GiaNhap,
                    pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, pl.SoLuong AS TonKho,
                    ct.SoLuong,
                    km_info.MaKM,
                    COALESCE(km_info.MucGiam, 0) AS MucGiam,
                    
                    -- Giá sau khuyến mãi (Nếu không có sale thì bằng giá gốc)
                    (pl.DonGia - COALESCE(km_info.MucGiam, 0)) AS DonGiaKhuyenMai,
                    
                    -- Lấy số lượng khuyến mãi còn lại ra cho Frontend hiển thị
                    COALESCE(km_info.SoLuongConLai, 0) AS SoLuongKhuyenMaiConLai
                    
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                INNER JOIN ChiTietGioHang ct ON pl.MaPhanLoai = ct.MaMoHinh
                
                -- TUYỆT CHIÊU: GOM LOGIC KHUYẾN MÃI VÀO 1 BẢNG ẢO (LEFT JOIN)
                LEFT JOIN (
                    SELECT 
                        ctkm.MaPhanLoai,
                        km.MaKM,
                        (ctkm.SoLuongKM - ctkm.SoLuongDaDung) AS SoLuongConLai,
                        MAX(CASE
                            WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                            WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl_sub.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl_sub.DonGia))
                            ELSE 0
                        END) AS MucGiam
                    FROM ChiTietKhuyenMai ctkm
                    INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                    INNER JOIN PhanLoai pl_sub ON ctkm.MaPhanLoai = pl_sub.MaPhanLoai
                    WHERE km.TrangThaiHoatDong = 1
                      AND km.ThoiGianBD <= NOW()
                      AND km.ThoiGianKT >= NOW()
                      AND (ctkm.SoLuongKM - ctkm.SoLuongDaDung) > 0
                    GROUP BY ctkm.MaPhanLoai, ctkm.SoLuongKM, ctkm.SoLuongDaDung
                ) AS km_info ON pl.MaPhanLoai = km_info.MaPhanLoai
                WHERE ct.MaGH = ?`;
            const [cart_item] = await connection.query(sql_get_cart_item, [MaGH]);
            if (cart_item.length === 0) {
                connection.release();
                return res.status(400).json({ success: false,
                    message: "Giỏ hàng đang trống, không thể đặt hàng!" });
            }
            let TongTienHang = 0;
            let TongTienKhuyenMai = 0;
            let arrChiTietDonHang = [];
            let arrUpdateKho = [];
            let arrUpdateKhuyenMai = [];
            let arrLogKhuyenMai = [];

            for (let item of cart_item){
                if(item.SoLuong > item.TonKho){
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${item.TenMH} phân loại ${item.ChiTietPhanLoai} chỉ còn ${item.TonKho}, vui lòng cập nhật lại giỏ hàng!`
                    });
                }
                const slSale = item.SoLuongKhuyenMaiConLai > 0? Math.min(item.SoLuong, item.SoLuongKhuyenMaiConLai) : 0;
                const slMuaGiaGoc = item.SoLuong - slSale;
                TongTienHang += (item.DonGia * item.SoLuong);
                TongTienKhuyenMai += (item.MucGiam * slSale);
                arrUpdateKho.push([item.SoLuong, item.MaPhanLoai]);

                if(slSale > 0){
                    const GiaBanSauSale = item.DonGia - item.MucGiam;
                    arrChiTietDonHang.push([item.MaPhanLoai, 1, slSale, item.GiaNhap, item.DonGia, GiaBanSauSale]);
                    arrUpdateKhuyenMai.push([slSale, item.MaKM, item.MaPhanLoai])
                    const soTienGiamCuaMonNay = item.MucGiam * slSale;
                    arrLogKhuyenMai.push([item.MaKM, MaKH, soTienGiamCuaMonNay]);
                }
                if(slMuaGiaGoc > 0){
                    arrChiTietDonHang.push([item.MaPhanLoai, 0, slMuaGiaGoc, item.GiaNhap, item.DonGia, item.DonGia]);
                }
            }
            
            let tongTienThanhToan = TongTienHang - TongTienKhuyenMai;
            //Xử lý voucher

            let soTienGiamVoucher = 0;
            if (MaGG) {
                const sql_check_voucher = `
                    SELECT * FROM MaGiamGia 
                    WHERE MaGG = ? AND ThoiGianBD <= NOW() AND ThoiGianKT >= NOW()
                `;
                const [voucherInfo] = await connection.query(sql_check_voucher, [MaGG]);
                
                if (voucherInfo.length > 0) {
                    const v = voucherInfo[0];
                    const sql_check_used = `
                        Select MaLichSu from LogSuDungMaGiamGia
                        where MaGG = ? and MaKH = ?
                    `;
                    const [check_used] = await connection.query(sql_check_used, [MaGG, MaKH]);
                    if(check_used.length > 0){
                        await connection.rollback();
                        connection.release();
                        return res.status(400).json({
                            success: false,
                            message: `Mã voucher ${voucherInfo[0].MaVoucher} đã được bạn sử dụng!`
                        });
                    }

                    if(v.SoLuongDaDung > v.SoLuongDungToiDa){
                        await connection.rollback();
                        connection.release();
                        return res.status(400).json({
                            success: false,
                            message: `Mã voucher ${voucherInfo[0].MaVoucher} đã đạt giới hạn sử dụng!`
                        });
                    }
                    // Ở đây bạn có thể thêm logic kiểm tra SoLuongDaDung < SoLuong
                    
                    if (v.LoaiGiamGia === 'TienMat') {
                        soTienGiamVoucher = Number(v.ChietKhau);
                    } else if (v.LoaiGiamGia === 'ChietKhau') {
                        const tinhGiam = tongTienThanhToan * (Number(v.ChietKhau) / 100);
                        soTienGiamVoucher = Math.min(tinhGiam, Number(v.GiaTriGiamToiDa || tinhGiam));
                    }
                    
                    tongTienThanhToan -= soTienGiamVoucher;
                    if (tongTienThanhToan < 0) tongTienThanhToan = 0;
                } else {
                    await connection.rollback();
                        connection.release();
                        return res.status(400).json({
                            success: false,
                            message: `Mã voucher ${voucherInfo[0].MaVoucher} không tồn tại hoặc hết hạn!`
                        });
                }
            }

            // 2. Tạo Đơn hàng mới 
            const sql_tao_don = `INSERT INTO DonHang (MaKH, TongTien, ThanhTien, NgayLapDon, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note) 
            VALUES (?, ?, ?, NOW(), 'Chưa Thanh Toán', ?, ? ,?, ?)`;
            const [tao_don] = await connection.query(sql_tao_don, [MaKH, TongTien, tongTienThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note]);
            
            // Lấy cái Mã Đơn Hàng vừa được MySQL sinh ra tự động
            const maDH_moi = tao_don.insertId; 

            // Thêm trạng thái "chờ duyệt cho đơn hàng"
            await connection.query(`Insert into ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) Values (?, 1, NOW())`, [maDH_moi]);

            for (let detail of arrChiTietDonHang) {
                await connection.query(`
                    INSERT INTO ChiTietDonHang (MaDH, MaPhanLoai, LaHangKhuyenMai, SoLuong, GiaNhapThucTe, DonGiaGoc, DonGiaBan)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [maDH_moi, ...detail]);
            }

            for (let kho of arrUpdateKho) {
                const [resultUpdateKho] = await connection.query(`
                        UPDATE PhanLoai SET SoLuong = SoLuong - ? WHERE MaPhanLoai = ?
                        AND (SoLuong >= ?)
                    `, [kho[0], kho[1], kho[0]])
                if (resultUpdateKho.affectedRows === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false,
                        message: "Sản phẩm bạn chọn vừa có người mua hết hoặc vượt tồn kho! Vui lòng làm mới giỏ hàng." });
                }
            }

            // Cập nhật số lượng đã dùng của Flash Sale
            for (let km of arrUpdateKhuyenMai) {
                const [resultUpdateKM] = await connection.query(`
                    UPDATE ChiTietKhuyenMai 
                    SET SoLuongDaDung = SoLuongDaDung + ? 
                    WHERE MaKM = ? AND MaPhanLoai = ? 
                    AND (SoLuongKM - SoLuongDaDung) >= ? -- ĐIỀU KIỆN SỐNG CÒN
                `, [km[0], km[1], km[2], km[0]]); // Truyền biến số lượng 2 lần

                // Nếu có người khác nẫng tay trên làm số lượng không đủ -> Update thất bại
                if (resultUpdateKM.affectedRows === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false,
                        message: "Sản phẩm đang hot và vừa hết suất khuyến mãi! Vui lòng làm mới giỏ hàng." });
                }
            }

            for (let log of arrLogKhuyenMai) {
                // log lúc này đang là: [MaKM, MaKH, soTienGiamCuaMonNay]
                await connection.query(`
                    INSERT INTO LogSuDungKhuyenMai (MaKM, MaKH, MaDH, SoTienDaGiam, ThoiGianSuDung) 
                    VALUES (?, ?, ?, ?, NOW())
                `, [log[0], log[1], maDH_moi, log[2]]);
            }

            if (MaGG && soTienGiamVoucher > 0) {
                await connection.query(`
                    INSERT INTO LogSuDungMaGiamGia (MaGG, MaKH, MaDH, SoTienDaGiam, ThoiGianSuDung)
                    VALUES (?, ?, ?, ?, NOW())
                `, [MaGG, MaKH, maDH_moi, soTienGiamVoucher]);
            }

            await connection.query(`DELETE FROM ChiTietGioHang WHERE MaGH = ?`, [MaGH]);
            await connection.commit();
            connection.release();

            res.status(200).json({ 
                success: true,
                message: "🎉 Đặt hàng thành công!",
                MaDonHang: maDH_moi
            });
            
        } catch (error) {
            await connection.rollback(); 
            connection.release();
            
            console.error("Lỗi khi xác nhận đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác đơn hàng!"});
        }
    },

    xem_don_hang: async(req, res) => {
        try{
            const maKH = req.params.MaKH;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const offset = (page - 1) * limit;

            const {
                trangthai
            } = req.query;

            let conditions = ["MaKH = ?"];
            let values = [maKH];

            let where_clause = "WHERE " + conditions.join(" AND ");
            let having_clause = "";
            if(trangthai){
                having_clause = "HAVING TrangThaiDonHang = ?";
                values.push(trangthai);
            }
            const sql_core = `Select DonHang.*,
                COALESCE(COUNT(ct.MaPhanLoai), 0) AS TongSoSanPham,
                (SELECT mh.AnhDaiDien 
                        FROM ChiTietDonHang ctdh 
                        Join Phanloai pl on pl.MaPhanLoai = ctdh.MaPhanLoai
                        JOIN MoHinh mh ON mh.MaMoHinh = pl.MaMoHinh
                        WHERE ctdh.MaDH = DonHang.MaDH 
                        LIMIT 1) as Thumbnail,
                (SELECT tt.TenTrangThai
                        FROM ChiTietTrangThai cttt 
                        JOIN TrangThai tt ON tt.MaTrangThai = cttt.MaTrangThai
                        WHERE cttt.MaDH = DonHang.MaDH 
                        Order by cttt.MaTrangThai Desc
                        LIMIT 1) as TrangThaiDonHang
                    
                from DonHang left join ChiTietDonHang ct on DonHang.MaDH = ct.MaDH
                ${where_clause}
                GROUP BY DonHang.MaDH
                ${having_clause}
                ORDER BY DonHang.NgayLapDon DESC`;
            const sql_count = `Select count(*) as total from (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count, values);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);
            const sql_ds = `
                ${sql_core}
                LIMIT ? OFFSET ?
            `;
            const sql_params = [...values, limit, offset];
            const [invoices] = await db.query(sql_ds, sql_params);


            res.status(200).json({
                success: true,
                message: "Lấy danh sách đơn hàng thành công",
                data: invoices,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });
        }
        catch (error){
            console.error("Lỗi khi lấy thông tin danh sách đơn hàng: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin danh sách đơn hàng!"
            });
        }
    },
    
    xem_hang_trong_don_hang: async(req, res) =>{
        try {
            const MaKH = req.params.MaKH;
            const MaDH = req.params.MaDH;
            const sql_donhang = `
                SELECT TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, TongTien, ThanhTien, NgayLapDon, Note,
                COALESCE(SUM(tt.SoTienGiaoDich), 0) AS DaThanhToan
                FROM DonHang
                LEFT JOIN ThanhToan tt on DonHang.MaDH = tt.MaDH
                WHERE DonHang.MaDH = ? AND MaKH = ?
            `;
            const [donhang_info] = await db.query(sql_donhang, [MaDH, MaKH]);

            if (donhang_info.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!"});
            }

            const sql = `SELECT 
            mh.MaMoHinh,
            mh.TenMH,
            mh.AnhDaiDien, 
            pl.DonGia,
            pl.MaPhanLoai,
            pl.ChiTietPhanLoai,
            ct.LaHangKhuyenMai,
            ct.SoLuong,
            ct.DonGiaGoc,
            ct.DonGiaBan,
            (ct.SoLuong * ct.DonGiaBan) as ThanhTienSP,
            pl.SoLuong AS TonKho
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
            where cttt.MaDH = ?`;

            const [trangthai] = await db.query(sql_trangthai,[MaDH]);

            res.status(200).json({
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
            res.status(500).json({ message: "Lỗi server khi thao tác đơn hàng!"});
        }
    },

    //Thanh Toán
    // 1. Hàm tạo link chuyển hướng sang Cổng thanh toán MoMo (Giả)
    tao_link_momo_mock: async (req, res) => {
        try {
            const { MaDH, HinhThuc } = req.body;
            let soTienCanThanhToan = 0;

            if (HinhThuc === 'Thanh toán toàn bộ') {
                // Nếu thanh toán hết -> Lấy Tổng Tiền của Đơn hàng
                const sql_tong_tien = `SELECT TongTien FROM DonHang WHERE MaDH = ?`;
                const [result_tong] = await db.query(sql_tong_tien, [MaDH]);
                soTienCanThanhToan = result_tong[0].TongTien;

            } else {
                const sql_tinh_tien_coc = `Select SUM(mh.TienCocToiThieu * ct.SoLuong) as TienCoc
                                            from MoHinh mh
                                            inner join Phanloai pl on pl.MaMoHinh = mh.MaMoHinh
                                            inner join ChiTietDonHang ct on ct.MaMoHinh = pl.MaPhanLoai
                                            where ct.MaDH = ? 
                                            limit 1`;
                const [result_tien_coc] = await db.query(sql_tinh_tien_coc,[MaDH])                   
                soTienCanThanhToan = result_tien_coc[0].TienCoc;
            }
            const mockUrl = `http://localhost:5173/momo-payment?orderId=${MaDH}&amount=${soTienCanThanhToan}&type=${encodeURIComponent(HinhThuc || 'Thanh toán toàn bộ')}`;

            res.status(200).json({
                message: "Tạo link thanh toán MoMo thành công!",
                checkoutUrl: mockUrl
            });

        } catch (error) {
            console.error("Lỗi tạo thanh toán MoMo mock:", error);
            res.status(500).json({ message: "Lỗi tạo cổng thanh toán!" });
        }
    },

    // 2. Hàm nhận tín hiệu khi khách bấm "Xác nhận" trên giao diện MoMo giả
    xac_nhan_momo_mock: async (req, res) => {
        // Cấp 1 connection riêng để làm Transaction (đảm bảo an toàn ghi dữ liệu)
        const connection = await db.getConnection();

        try {
            // Frontend truyền cục data về khi bấm "Xác nhận"
            const { orderId, amount, type } = req.body; 

            await connection.beginTransaction();

            // Bước 1: Ghi vào bảng ThanhToan
            const sql_thanh_toan = `
                INSERT INTO ThanhToan (MaPT, MaDH, NgayThanhToan, SoTienGiaoDich, LoaiGiaoDich) 
                VALUES (1, ?, NOW(), ?, ?)
            `;
            await connection.query(sql_thanh_toan, [orderId, amount, type]);

            // Bước 2: Cập nhật trạng thái đơn hàng (Đã cọc hoặc Đã thanh toán)
            let trangThaiMoi = type === 'Thanh toán toàn bộ' ? 'Đã thanh toán' : 'Đã cọc';
            await connection.query(
                `UPDATE DonHang SET TrangThaiThanhToan = ? WHERE MaDH = ?`, 
                [trangThaiMoi, orderId]
            );
            
            // Bước 3: Thêm log vào bảng ChiTietTrangThai (Giả sử mã trạng thái 2 là Đã cọc/thanh toán)

            await connection.commit();
            connection.release();

            res.status(200).json({ 
                success: true, 
                message: "Giao dịch thành công!" 
            });
            
        } catch (error) {
            await connection.rollback();
            connection.release();
            console.error("Lỗi xử lý xác nhận MoMo:", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi ghi nhận thanh toán!" });
        }
    }
}

module.exports = donhang_user;