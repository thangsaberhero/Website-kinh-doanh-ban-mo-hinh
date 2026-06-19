const db = require('../../config/db.js');
const crypto = require('crypto');
const https = require('https');
//const PayOS = require("@payos/node");
// /const payos = new PayOS("YOUR_CLIENT_ID", "YOUR_API_KEY", "YOUR_CHECKSUM_KEY");

const donhang_user = {
    them_hang_vao_gio: async(req, res) =>{
        // 1. Kiểm tra quyền
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaPhanLoai, soluong } = req.body;
            const MaTK = req.user.id;

            // ==========================================
            // KIỂM TRA ĐẦU VÀO TỪ API
            // ==========================================
            if (!MaPhanLoai || !soluong || isNaN(soluong) || parseInt(soluong) <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Dữ liệu đầu vào không hợp lệ (số lượng phải lớn hơn 0)!" });
            }

            // 2. Tìm Giỏ Hàng
            const sql_laymagiohang = `
                Select gh.MaGH 
                from GioHang gh
                inner join KhachHang kh on kh.MaKH = gh.MaKH 
                where kh.MaTK = ?
            `;
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaTK]);

            if(result_giohang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng" });
            }

            const maGH = result_giohang[0].MaGH;

            // ==========================================
            // KIỂM TRA SẢN PHẨM & TỒN KHO 
            // ==========================================
            const sql_kiemtra_kho = `SELECT pl.SoLuong AS TonKho, mh.LoaiHinhBan
                FROM PhanLoai pl
                INNER JOIN MoHinh mh on mh.MaMoHinh = pl.MaMoHinh
                WHERE pl.MaPhanLoai = ? and pl.HienThi = 1`;
            const [kho] = await connection.query(sql_kiemtra_kho, [MaPhanLoai]);

            // Chặn nếu sản phẩm không tồn tại (bị xóa) hoặc gửi mã bậy bạ
            if (kho.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Sản phẩm này không tồn tại hoặc đang tạm thời ngừng kinh doanh!" });
            }

            const tonKho = kho[0].TonKho;
            const newItemType = kho[0].LoaiHinhBan;

            // Chặn nếu kho đã cạn kiệt
            if (tonKho <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Sản phẩm này đã hết hàng trong kho!" });
            }

            // ==========================================
            // CHỐNG LẪN LỘN LOẠI HÌNH BÁN
            // ==========================================
            // Lấy ra loại hình bán của các món đang nằm sẵn trong giỏ
            const sql_check_cart_type = `
                SELECT DISTINCT mh.LoaiHinhBan
                FROM ChiTietGioHang ct
                INNER JOIN PhanLoai pl ON ct.MaPhanLoai = pl.MaPhanLoai
                INNER JOIN MoHinh mh ON pl.MaMoHinh = mh.MaMoHinh
                WHERE ct.MaGH = ?
            `;
            const [cartTypes] = await connection.query(sql_check_cart_type, [maGH]);

            // Nếu giỏ hàng đang có đồ, kiểm tra xem có bị lệch pha không
            if (cartTypes.length > 0) {
                const currentCartType = cartTypes[0].LoaiHinhBan;
                
                if (newItemType !== currentCartType) {
                    await connection.rollback();
                    return res.status(400).json({ 
                        success: false, 
                        message: `Lỗi nghiệp vụ: Giỏ hàng đang chứa sản phẩm '${currentCartType}'. Không thể đặt chung với sản phẩm '${newItemType}'!` 
                    });
                }
            }

            // 3. Tiến hành xử lý thêm hoặc cập nhật
            const sql_check = 'Select SoLuong from ChiTietGioHang where MaGH = ? and MaPhanLoai = ?';
            const [check] = await connection.query(sql_check, [maGH, MaPhanLoai]);
            
            let thongBao = "";

            if (check.length === 0) {
                // TRƯỜNG HỢP: CHƯA CÓ TRONG GIỎ
                let so_luong_them = parseInt(soluong);
                
                // Tránh việc khách thêm ngay 9999 cái ngay lần đầu tiên
                if (so_luong_them > tonKho) {
                    so_luong_them = tonKho;
                    thongBao = `Đã thêm tối đa số lượng kho hiện có (${tonKho} sản phẩm).`;
                } else {
                    thongBao = "Thêm hàng mới vào giỏ thành công!";
                }

                const sql_themhangmoivaogio = `Insert into ChiTietGioHang(MaGH, MaPhanLoai, SoLuong) values (?,?,?)`;
                await connection.query(sql_themhangmoivaogio, [maGH, MaPhanLoai, so_luong_them]);
                
            } else {
                // TRƯỜNG HỢP: ĐÃ CÓ SẴN, CỘNG DỒN SỐ LƯỢNG
                const trongGio = check[0].SoLuong;
                let so_luong_moi = trongGio + parseInt(soluong);

                if (so_luong_moi >= tonKho) {
                    so_luong_moi = tonKho;
                    thongBao = `Đã đạt giới hạn! Kho hiện chỉ còn ${tonKho} sản phẩm.`;
                } else {
                    thongBao = "Cập nhật số lượng giỏ hàng thành công!";
                }

                const sql_themhangvaogio = 'Update ChiTietGioHang set SoLuong = ? where MaGH = ? and MaPhanLoai = ?';
                await connection.query(sql_themhangvaogio, [so_luong_moi, maGH, MaPhanLoai]);
            } 
            
            // LƯU TOÀN BỘ VÀ TRẢ KẾT QUẢ
            await connection.commit();
            res.status(200).json({
                success: true,
                message: thongBao,
                MaGioHangCuaKhach: maGH
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thêm vào giỏ: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi thao tác giỏ hàng!"
            });
        }
        finally{
            connection.release();
        }
    },

    cap_nhat_gio_hang: async(req, res) =>{
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
                });
            }
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaPhanLoai, soluong} = req.body;
            const MaTK = req.user.id;
            if (!MaPhanLoai || !soluong || isNaN(soluong) || parseInt(soluong) <= 0) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: "Dữ liệu đầu vào không hợp lệ (số lượng phải lớn hơn 0)!" 
                });
            }

            const sql_laymagiohang = `
                Select gh.MaGH 
                from GioHang gh
                inner join KhachHang kh on kh.MaKH = gh.MaKH 
                where kh.MaTK = ?
            `;
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaTK]);

            if(result_giohang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng" });
            }

            const maGH = result_giohang[0].MaGH;

            const sql_kiemtra_kho = `SELECT SoLuong AS TonKho FROM PhanLoai WHERE MaPhanLoai = ?  and HienThi = 1`;
            const [kho] = await connection.query(sql_kiemtra_kho, [MaPhanLoai]);
            if (kho.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Sản phẩm này không tồn tại hoặc đang tạm thời ngừng kinh doanh!" });
            }

            const tonKho = kho[0].TonKho;

            if (tonKho <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Sản phẩm này đã hết hàng trong kho!" });
            }

            let so_luong_chot = parseInt(soluong);
            let thongBao = "Cập nhật giỏ hàng thành công!";

            // Ép số lượng về mức tồn kho tối đa nếu khách nhập quá
            if (so_luong_chot > tonKho) {
                so_luong_chot = tonKho;
                thongBao = `Đã cập nhật về mức tối đa! Kho hiện chỉ còn ${tonKho} sản phẩm.`;
            }

            // Thực hiện Update
            const [updateResult] = await connection.query(
                'UPDATE ChiTietGioHang SET SoLuong = ? WHERE MaPhanLoai = ? AND MaGH = ?',
                [so_luong_chot, MaPhanLoai, maGH]
            );

            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ 
                    success: false, 
                    message: "Sản phẩm này không có trong giỏ hàng của bạn!" 
                });
            }

            await connection.commit();
            res.status(200).json({
                success: true,
                message: thongBao,
                MaGioHangCuaKhach: maGH,
                SoLuongMoi: so_luong_chot // Trả về số lượng chốt để Frontend tự render lại ô Input nếu cần
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thêm vào giỏ: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi thao tác giỏ hàng!"});
        }
        finally{
            connection.release();
        }
    },


    xoa_hang_trong_gio: async(req, res) =>{
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
                });
            }
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaPhanLoai} = req.body;
            const MaTK = req.user.id;
            if (!MaPhanLoai) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: "Dữ liệu đầu vào không hợp lệ!" 
                });
            }
            const sql_laymagiohang = `
                Select gh.MaGH 
                from GioHang gh
                inner join KhachHang kh on kh.MaKH = gh.MaKH 
                where kh.MaTK = ?
            `;
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaTK]);

            if(result_giohang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng" });
            }

            const maGH = result_giohang[0].MaGH;

            const [updateResult] = await connection.query('Delete from ChiTietGioHang where MaPhanLoai = ? and MaGH = ?',[MaPhanLoai, maGH]);
            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ 
                    success: false, 
                    message: "Sản phẩm này không có trong giỏ hàng của bạn!" 
                });
            }

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sản phẩm đã được xoá khỏi giỏ hàng của bạn.",
                MaGioHangCuaKhach: maGH
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi xoá hàng trong giỏ: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác giỏ hàng!"});
        }
        finally{
            connection.release();
        }
    },

    xoa_het_hang_trong_gio: async(req, res) =>{
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
                });
            }
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaTK = req.user.id;
            const sql_laymagiohang = `
                Select gh.MaGH 
                from GioHang gh
                inner join KhachHang kh on kh.MaKH = gh.MaKH 
                where kh.MaTK = ?
            `;
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaTK]);

            if(result_giohang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng" });
            }

            const maGH = result_giohang[0].MaGH;

            const [check] = await connection.query(`select * from ChiTietGioHang where MaGH = ?`,[maGH]);
            if(check.length === 0){
                await connection.rollback();
                return res.status(404).json({ 
                    success: false, 
                    message: "Giỏ hàng của bạn không có sản phẩm nào!" 
                });
            }
            const [updateResult] = await connection.query('Delete from ChiTietGioHang where MaGH = ?',[maGH]);
            if (updateResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ 
                    success: false, 
                    message: "Giỏ hàng của bạn đang trống!" 
                });
            }
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Tất cả sản phẩm đã được xoá khỏi giỏ hàng của bạn!",
                MaGioHangCuaKhach: maGH
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi xoá hết hàng trong giỏ: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi thao tác giỏ hàng!"});
        }
        finally{
            connection.release();
        }
    },

    xem_hang_trong_gio: async(req, res) =>{
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
                });
            }
        try {
            const MaTK = req.user.id;
            const sql_laymagiohang = `
                Select gh.MaGH 
                from GioHang gh
                inner join KhachHang kh on kh.MaKH = gh.MaKH 
                where kh.MaTK = ?
            `;
            const [result_giohang] = await db.query(sql_laymagiohang, [MaTK]);

            if(result_giohang.length === 0) {
                await db.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng" });
            }

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
                    mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.TienCocToiThieu, mh.LoaiHinhBan,
                    pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, pl.SoLuong AS TonKho,
                    ct.SoLuong,
                    
                    -- Giá sau khuyến mãi (Nếu không có sale thì bằng giá gốc)
                    (pl.DonGia - COALESCE(km_info.MucGiam, 0)) AS DonGiaKhuyenMai,
                    
                    -- Lấy số lượng khuyến mãi còn lại ra cho Frontend hiển thị
                    COALESCE(km_info.SoLuongConLai, 0) AS SoLuongKhuyenMaiConLai
                    
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                INNER JOIN ChiTietGioHang ct ON pl.MaPhanLoai = ct.MaPhanLoai
                
                -- GOM LOGIC KHUYẾN MÃI VÀO 1 BẢNG ẢO
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
                INNER JOIN PhanLoai pl ON pl.MaPhanLoai = ct.MaPhanLoai
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
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
                });
            }
        const connection = await db.getConnection(); 
        try {
            const {TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note, MaGG, paymentMethod} = req.body;
            const MaTK = req.user.id;
            
            if (!TenNguoiNhan || !SDTNguoiNhan || !DiaChiGiao) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Thông tin quan trọng không được trống!" });
            }
            
            const sql_laymagiohang = `SELECT gh.MaGH, kh.MaKH FROM GioHang gh INNER JOIN KhachHang kh ON kh.MaKH = gh.MaKH WHERE kh.MaTK = ?`;
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaTK]);

            if(result_giohang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng" });
            }

            const MaGH = result_giohang[0].MaGH;
            const MaKH = result_giohang[0].MaKH;

            const sql_check_type = `
                SELECT count(Distinct mh.LoaiHinhBan) As SoLoaihinh
                FROM MoHinh mh
                INNER JOIN PhanLoai pl on pl.MaMoHinh = mh.MaMoHinh
                INNER JOIN ChiTietGioHang ctgh on ctgh.MaPhanLoai = pl.MaPhanLoai
                INNER JOIN GioHang gh on gh.MaGH = ctgh.MaGH
                WHERE gh.MaGH = ?`;
            
            const [typeResult] = await connection.query(sql_check_type, [MaGH]);

            if (typeResult[0].SoLoaiHinh > 1) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: "Không thể đặt chung hàng Có sẵn và hàng Đặt trước (Pre-order/Order) trong cùng một đơn hàng!" 
                });
            }

            // ================= BẮT ĐẦU TRANSACTION =================
            await connection.beginTransaction(); 
            
            const sql_get_cart_item = `
                SELECT 
                    mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.TienCocToiThieu, mh.GiaNhap, mh.LoaiHinhBan,
                    pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, pl.SoLuong AS TonKho,
                    ct.SoLuong,
                    km_info.MaKM,
                    COALESCE(km_info.MucGiam, 0) AS MucGiam,
                    (pl.DonGia - COALESCE(km_info.MucGiam, 0)) AS DonGiaKhuyenMai,
                    COALESCE(km_info.SoLuongConLai, 0) AS SoLuongKhuyenMaiConLai
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                INNER JOIN ChiTietGioHang ct ON pl.MaPhanLoai = ct.MaPhanLoai
                LEFT JOIN (
                    SELECT * FROM (
                        SELECT 
                            ctkm.MaPhanLoai,
                            km.MaKM,
                            (ctkm.SoLuongKM - ctkm.SoLuongDaDung) AS SoLuongConLai,
                            (CASE
                                WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                                WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl_sub.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl_sub.DonGia))
                                ELSE 0
                            END) AS MucGiam,
                            ROW_NUMBER() OVER(PARTITION BY ctkm.MaPhanLoai ORDER BY (
                                CASE
                                    WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                                    WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl_sub.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl_sub.DonGia))
                                    ELSE 0
                                END
                            ) DESC) as rn
                        FROM ChiTietKhuyenMai ctkm
                        INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                        INNER JOIN PhanLoai pl_sub ON ctkm.MaPhanLoai = pl_sub.MaPhanLoai
                        WHERE km.TrangThaiHoatDong = 1
                          AND km.ThoiGianBD <= NOW()
                          AND km.ThoiGianKT >= NOW()
                          AND (ctkm.SoLuongKM - ctkm.SoLuongDaDung) > 0
                    ) AS ranked_promo
                    WHERE rn = 1 
                ) AS km_info ON pl.MaPhanLoai = km_info.MaPhanLoai
                WHERE ct.MaGH = ?
            `;
            const [cart_item] = await connection.query(sql_get_cart_item, [MaGH]);
            if (cart_item.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Giỏ hàng đang trống, không thể đặt hàng!" });
            }

            let TongTienHang = 0;
            let TongTienKhuyenMai = 0;
            let TongCocBatBuoc = 0;

            let arrChiTietDonHang = [];
            let arrUpdateKho = [];
            let arrUpdateKhuyenMai = [];
            let arrLogKhuyenMai = [];

            for (let item of cart_item){
                if(item.SoLuong > item.TonKho){
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${item.TenMH} phân loại ${item.ChiTietPhanLoai} chỉ còn ${item.TonKho}, vui lòng cập nhật lại giỏ hàng!`
                    });
                }
                const slSale = item.SoLuongKhuyenMaiConLai > 0? Math.min(item.SoLuong, item.SoLuongKhuyenMaiConLai) : 0;
                const slMuaGiaGoc = item.SoLuong - slSale;
                
                TongTienHang += (item.DonGia * item.SoLuong);
                TongTienKhuyenMai += (item.MucGiam * slSale);
                TongCocBatBuoc += (item.TienCocToiThieu * item.SoLuong); 
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

            if (paymentMethod === 'cod' && TongCocBatBuoc > 0) {
                await connection.rollback();
                return res.status(400).json({ 
                    success: false, 
                    message: "Cảnh báo bảo mật: Đơn hàng chứa sản phẩm yêu cầu đặt cọc không được phép dùng phương thức Thu hộ (COD)!" 
                });
            }
            
            let tongTienThanhToan = TongTienHang - TongTienKhuyenMai;
           
            let soTienGiamVoucher = 0;
            if (MaGG) {
                const sql_check_voucher = `
                    SELECT * FROM MaGiamGia 
                    WHERE MaGG = ? 
                      AND ThoiGianBD <= NOW() 
                      AND ThoiGianKT >= NOW() 
                      AND TrangThaiHoatDong = 1
                      AND (MaKH IS NULL OR MaKH = ?) 
                `;
                const [voucherInfo] = await connection.query(sql_check_voucher, [MaGG, MaKH]);
                
                if (voucherInfo.length > 0) {
                    const v = voucherInfo[0];
                    if (v.SoLuongDaDung >= v.SoLuongDungToiDa) {
                        await connection.rollback();
                        return res.status(400).json({ success: false, message: `Mã voucher này đã hết lượt sử dụng!` });
                    }
                    const sql_check_used = `SELECT MaLichSu FROM LogSuDungMaGiamGia WHERE MaGG = ? AND MaKH = ? LIMIT 1`;
                    const [check_used] = await connection.query(sql_check_used, [MaGG, MaKH]);
                    
                    if (check_used.length > 0) {
                        await connection.rollback();
                        return res.status(400).json({ success: false, message: `Bạn đã sử dụng mã voucher này trước đó rồi!` });
                    }
                    const sql_check_product = `SELECT MaPhanLoai FROM ChiTietMaGiamGia WHERE MaGG = ?`;
                    const [apDungChoPhanLoai] = await connection.query(sql_check_product, [MaGG]);
                    
                    if (apDungChoPhanLoai.length > 0) {
                        const danhSachChoPhep = apDungChoPhanLoai.map(item => item.MaPhanLoai);
                        const danhSachTrongGio = cart_item.map(item => item.MaPhanLoai);
                        const coMonHopLe = danhSachTrongGio.some(ma => danhSachChoPhep.includes(ma));
                        
                        if (!coMonHopLe) {
                            await connection.rollback();
                            return res.status(400).json({ 
                                success: false, 
                                message: `Mã giảm giá này không áp dụng cho các sản phẩm đang có trong giỏ hàng của bạn!` 
                            });
                        }
                    }
                    const giaTriToiThieu = Number(v.GiaTriDonToiThieu || 0); 
                    if (tongTienThanhToan < giaTriToiThieu) {
                        await connection.rollback();
                        return res.status(400).json({ 
                            success: false, 
                            message: `Đơn hàng chưa đạt giá trị tối thiểu (${giaTriToiThieu.toLocaleString('vi-VN')}đ) để sử dụng mã này!` 
                        });
                    }
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
                    return res.status(400).json({ success: false, message: `Mã voucher không tồn tại hoặc đã hết hạn!` });
                }
            }
            
            const taoMaDonHangHienThi = () => {
                const date = new Date();
                const ddmmyy = date.getDate().toString().padStart(2, '0') +
                            (date.getMonth() + 1).toString().padStart(2, '0') +
                            date.getFullYear().toString().slice(-2);
                            
                const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
                return `FC${ddmmyy}-${randomString}`; 
            };
            
            const maHienThi = taoMaDonHangHienThi();

            let snapshotTag = '[SẴN]'; 
            
            for (let item of cart_item) {
                let loaiHang = (item.LoaiHinhBan || '').toLowerCase();
                if (loaiHang.includes('pre-order') || loaiHang.includes('pre order')) {
                    snapshotTag = '[PRE-ORDER]';
                    break;
                } else if (loaiHang.includes('order')) {
                    snapshotTag = '[ORDER]';
                }
            }

            // Ép Tag vào trước nội dung Ghi chú gốc của khách
            const finalNote = (Note && Note.trim() !== '') ? `${snapshotTag} ${Note}` : snapshotTag;

            const sql_tao_don = `INSERT INTO DonHang (MaKH, MaDonHangHienThi, TongTien, ThanhTien, NgayLapDon, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note) 
            VALUES (?, ?, ?, ?, NOW(), 'Chưa thanh toán', ?, ? ,?, ?)`;
            const [tao_don] = await connection.query(sql_tao_don, [MaKH, maHienThi, TongTienHang, tongTienThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, finalNote]);
            
            const maDH_moi = tao_don.insertId; 

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
                    return res.status(400).json({ success: false, message: "Sản phẩm bạn chọn vừa có người mua hết hoặc vượt tồn kho! Vui lòng làm mới giỏ hàng." });
                }
                const [checkStock] = await connection.query(`SELECT SoLuong, ChiTietPhanLoai FROM PhanLoai WHERE MaPhanLoai = ?`, [kho[1]]);
                if (checkStock.length > 0 && checkStock[0].SoLuong <= 5) {
                    await connection.query(`
                        INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                        VALUES (?, ?, ?, ?)
                    `, [
                        "Cảnh báo sắp hết hàng", 
                        `Phân loại "${checkStock[0].ChiTietPhanLoai}" chỉ còn lại ${checkStock[0].SoLuong} sản phẩm trong kho.`, 
                        "KhoHang", 
                        `/admin/inventory?productId=${checkStock[0].MaMoHinh}`
                    ]);
                }
            }

            for (let km of arrUpdateKhuyenMai) {
                const [resultUpdateKM] = await connection.query(`
                    UPDATE ChiTietKhuyenMai 
                    SET SoLuongDaDung = SoLuongDaDung + ? 
                    WHERE MaKM = ? AND MaPhanLoai = ? 
                    AND (SoLuongKM - SoLuongDaDung) >= ? 
                `, [km[0], km[1], km[2], km[0]]); 

                if (resultUpdateKM.affectedRows === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({ success: false, message: "Sản phẩm đang hot và vừa hết suất khuyến mãi! Vui lòng làm mới giỏ hàng." });
                }
            }

            for (let log of arrLogKhuyenMai) {
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
                
                const [updateVoucher] = await connection.query(`
                    UPDATE MaGiamGia 
                    SET SoLuongDaDung = SoLuongDaDung + 1 
                    WHERE MaGG = ? AND SoLuongDaDung < SoLuongDungToiDa
                `, [MaGG]);
                
                if (updateVoucher.affectedRows === 0) {
                    await connection.rollback();
                    return res.status(400).json({ 
                        success: false, 
                        message: "Rất tiếc! Lượt sử dụng cuối cùng của Voucher này vừa có người nhanh tay hơn. Vui lòng chọn mã khác!" 
                    });
                }
            }

            await connection.query(`DELETE FROM ChiTietGioHang WHERE MaGH = ?`, [MaGH]);
            const formatTien = tongTienThanhToan.toLocaleString('vi-VN');
            await connection.query(`
                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                VALUES (?, ?, ?, ?)
            `, [
                `Đơn hàng mới #${maDH_moi}`, 
                `Khách hàng ${TenNguoiNhan} vừa đặt một đơn hàng trị giá ${formatTien}đ.`, 
                "DonHang", 
                `/admin/orders?viewOrderId=${maDH_moi}`
            ]);

            // =======================================================
            // LƯU LỊCH SỬ GIAO DỊCH NẾU LÀ COD
            // =======================================================
            if (paymentMethod === 'cod') {
                await connection.query(`
                    INSERT INTO ThanhToan (MaPT, MaDH, NgayThanhToan, SoTienGiaoDich, LoaiGiaoDich, TrangThaiGiaoDich) 
                    VALUES (3, ?, NOW(), 0, 'Đăng ký giao hàng thu hộ (COD)', 'Chờ thanh toán')
                `, [maDH_moi]);
            }

            await connection.commit();
            res.status(200).json({ 
                success: true,
                message: "🎉 Đặt hàng thành công!",
                MaDonHang: maDH_moi
            });
            
        } catch (error) {
            await connection.rollback(); 
            console.error("Lỗi khi xác nhận đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác đơn hàng!"});
        }
        finally{
            connection.release();
        }
    },

    xem_don_hang: async(req, res) => {
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
                });
            }
        try{
            const MaTK = req.user.id;
            const sql_laymakhachhang = `
                Select MaKH
                from KhachHang
                where MaTK = ?
            `;
            const [result_kh] = await db.query(sql_laymakhachhang, [MaTK]);

            if(result_kh.length === 0) {
                await db.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã khách hàng!" });
            }
            const MaKH = result_kh[0].MaKH;
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 5;

            if (!page || isNaN(page) || page < 1) page = 1;
            if (!limit || isNaN(limit) || limit < 1) limit = 5;
            if (limit > 10) limit = 10;

            const offset = (page - 1) * limit;

            const {
                trangthai
            } = req.query;

            let conditions = ["MaKH = ?"];
            let values = [MaKH];

            let where_clause = "WHERE " + conditions.join(" AND ");
            let having_clause = "";
            if(trangthai){
                const trangthai_word = trangthai.toString().trim();
                having_clause = "HAVING TrangThaiDonHang = ?";
                values.push(trangthai);
            }
            const sql_core = `Select DonHang.*,
                COALESCE(COUNT(ct.MaPhanLoai), 0) AS TongSoSanPham,
                (SELECT mh.AnhDaiDien 
                        FROM ChiTietDonHang ctdh 
                        Join PhanLoai pl on pl.MaPhanLoai = ctdh.MaPhanLoai
                        JOIN MoHinh mh ON mh.MaMoHinh = pl.MaMoHinh
                        WHERE ctdh.MaDH = DonHang.MaDH 
                        LIMIT 1) as Thumbnail,
                (SELECT tt.TenTrangThai
                        FROM ChiTietTrangThai cttt 
                        JOIN TrangThai tt ON tt.MaTrangThai = cttt.MaTrangThai
                        WHERE cttt.MaDH = DonHang.MaDH 
                        ORDER BY cttt.Thoigian DESC, cttt.MaTrangThai DESC
                        LIMIT 1) as TrangThaiDonHang,
                (SELECT pt.TenPhuongThuc 
                        FROM ThanhToan t
                        JOIN PhuongThucThanhToan pt ON pt.MaPT = t.MaPT
                        WHERE t.MaDH = DonHang.MaDH
                        ORDER BY t.NgayThanhToan ASC
                        LIMIT 1) as PhuongThucThanhToan
                    
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
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
                });
            }
        try {
            const MaTK = req.user.id;
            const MaDH = req.params.MaDH;
            const sql_laymakhachhang = `
                Select DonHang.MaKH
                from DonHang
                inner join KhachHang on KhachHang.MaKH = DonHang.MaKH
                where KhachHang.MaTK = ? and MaDH = ?
            `;
            const [result_kh] = await db.query(sql_laymakhachhang, [MaTK, MaDH]);

            if(result_kh.length === 0) {
                await db.rollback();
                return res.status(404).json({ success: false, message: "Bạn không có quyền xem thông tin đơn hàng này!" });
            }
            const MaKH = result_kh[0].MaKH;
            
            const sql_donhang = `
                SELECT 
                    DonHang.MaDH, MaDonHangHienThi, TenNguoiNhan, SDTNguoiNhan, 
                    DiaChiGiao, TongTien, ThanhTien, NgayLapDon, Note, TrangThaiThanhToan, HangVanChuyen, MaVanDon,
                    COALESCE(SUM(tt.SoTienGiaoDich), 0) AS DaThanhToan, 
                    GROUP_CONCAT(DISTINCT pttt.TenPhuongThuc SEPARATOR ', ') AS TenPhuongThuc
                FROM DonHang
                LEFT JOIN ThanhToan tt on DonHang.MaDH = tt.MaDH
                LEFT JOIN PhuongThucThanhToan pttt on pttt.MaPT = tt.MaPT
                WHERE DonHang.MaDH = ? AND DonHang.MaKH = ?
                GROUP BY DonHang.MaDH
            `;
            const [donhang_info] = await db.query(sql_donhang, [MaDH, MaKH]);

            if (donhang_info.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: "Không tìm thấy đơn hàng!"});
            }

            const sql = `SELECT 
            mh.MaMoHinh,
            mh.TenMH,
            mh.AnhDaiDien, 
            mh.TienCocToiThieu,
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
            
            const sql_trangthai =  `
                SELECT tt.TenTrangThai, cttt.ThoiGian
                FROM TrangThai tt
                INNER JOIN ChiTietTrangThai cttt ON tt.MaTrangThai = cttt.MaTrangThai
                WHERE cttt.MaDH = ?
                ORDER BY cttt.ThoiGian ASC, cttt.MaTrangThai ASC
            `;
            const [trangthai] = await db.query(sql_trangthai, [MaDH]);

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
            res.status(500).json({
                success: false,
                 message: "Lỗi server khi thao tác đơn hàng!"});
        }
    },

    huy_don_hang: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDH } = req.body;
            const MaTK = req.user.id;

            // 1. Kiểm tra đơn hàng có tồn tại, CÓ PHẢI CỦA NGƯỜI NÀY KHÔNG, và LẤY TRẠNG THÁI THANH TOÁN
            const sql_kiemtra_tt = `
                SELECT cttt.MaTrangThai, dh.MaKH, dh.MaDonHangHienThi, dh.TrangThaiThanhToan
                FROM DonHang dh
                LEFT JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                WHERE dh.MaDH = ? AND kh.MaTK = ?
                ORDER BY cttt.Thoigian DESC LIMIT 1
            `;
            const [don_hang] = await connection.query(sql_kiemtra_tt, [MaDH, MaTK]);

            if(don_hang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng của bạn!" });
            }

            const currentStatus = don_hang[0].MaTrangThai;
            const maHienThi = don_hang[0].MaDonHangHienThi;
            const trangThaiThanhToan = don_hang[0].TrangThaiThanhToan;

            // 2. Chỉ được hủy khi đơn đang "Chờ duyệt"
            if(currentStatus !== 1){
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Không thể huỷ! Đơn hàng đã được Shop tiếp nhận xử lý hoặc đang vận chuyển."
                });
            }

            // Không cho tự hủy nếu đã nạp tiền
            if(trangThaiThanhToan === 'Đã thanh toán' || trangThaiThanhToan === 'Đã cọc') {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Đơn hàng này đã được thanh toán/đặt cọc. Vui lòng liên hệ bộ phận CSKH để được hỗ trợ hủy đơn và hoàn tiền an toàn!"
                });
            }

            await connection.query(`
                UPDATE DonHang 
                SET TrangThaiThanhToan = 'Đã hủy', 
                    Note = CONCAT(IFNULL(Note, ''), '\n[Hệ thống] Khách hàng tự bấm hủy đơn.') 
                WHERE MaDH = ?
            `, [MaDH]);

            // 3. THÊM TRẠNG THÁI HỦY (Mã 5)
            await connection.query(`INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 5, NOW())`, [MaDH]);

            // 4. Lấy chi tiết đơn hàng
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

            // 6. HOÀN TRẢ KHUYẾN MÃI
            await connection.query(`
                UPDATE ChiTietKhuyenMai ctkm
                INNER JOIN ChiTietDonHang ctdh ON ctkm.MaPhanLoai = ctdh.MaPhanLoai
                SET ctkm.SoLuongDaDung = GREATEST(0, ctkm.SoLuongDaDung - ctdh.SoLuong)
                WHERE ctdh.MaDH = ? AND ctdh.LaHangKhuyenMai = 1
            `, [MaDH]);
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

            const noiDungLog = `Khách hàng tự hủy đơn hàng #${MaDH} (${maHienThi})`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ORDER_CANCEL', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.query(`
                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                VALUES (?, ?, ?, ?)
            `, [
                `Đơn hàng bị hủy #${MaDH}`, 
                `Khách hàng vừa tự hủy đơn hàng mang mã ${maHienThi}.`, 
                "DonHang", 
                `/admin/orders?viewOrderId=${MaDH}`
            ]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Huỷ đơn hàng thành công! Kho hàng và voucher đã được hoàn trả hệ thống."
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

    sua_thong_tin_don_hang_client: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDH, sdt, hoten, diachi } = req.body;
            const MaTK = req.user.id; 

            if (!MaDH || !sdt || !hoten || !diachi) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Thông tin không được để trống!" });
            }

            // Validate Số điện thoại chuẩn Việt Nam
            const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
            if (!phoneRegex.test(sdt)) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ!" });
            }

            // RÀNG BUỘC BẢO MẬT: Chắc chắn đơn này do MaTK này đặt
            const sql_check_owner = `
                SELECT cttt.MaTrangThai, dh.MaDonHangHienThi
                FROM DonHang dh
                INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                LEFT JOIN ChiTietTrangThai cttt ON dh.MaDH = cttt.MaDH
                WHERE dh.MaDH = ? AND kh.MaTK = ?
                ORDER BY cttt.Thoigian DESC LIMIT 1
            `;
            const [don_hang] = await connection.query(sql_check_owner, [MaDH, MaTK]);

            if (don_hang.length === 0) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: "Bạn không có quyền chỉnh sửa đơn hàng này!" });
            }

            const currentStatus = don_hang[0].MaTrangThai;
            const maHienThi = don_hang[0].MaDonHangHienThi;

            // RÀNG BUỘC NGHIỆP VỤ: Chỉ được sửa khi "Chờ duyệt" 
            if (currentStatus !== 1) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Không thể tự sửa thông tin! Đơn hàng đã được tiếp nhận đóng gói hoặc vận chuyển. Vui lòng liên hệ Hotline shop để được hỗ trợ."
                });
            }

            // Cập nhật địa chỉ & Tự động ghi chú thêm vào cột Note
            const sql_update = `
                UPDATE DonHang 
                SET TenNguoiNhan = ?, 
                    SDTNguoiNhan = ?, 
                    DiaChiGiao = ?,
                    Note = CONCAT(IFNULL(Note, ''), '\n[Hệ thống] Khách tự cập nhật thông tin giao hàng lúc ', DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i'))
                WHERE MaDH = ?
            `;
            await connection.query(sql_update, [hoten, sdt, diachi, MaDH]);

            // Bắn thông báo cho Admin & Ghi Log
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'UPDATE_ORDER_INFO', ?, ?, NOW())
            `, [MaTK, `Khách cập nhật địa chỉ đơn #${MaDH}`, userIp]);

            await connection.query(`
                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                VALUES (?, ?, ?, ?)
            `, [
                `Khách thay đổi địa chỉ đơn #${MaDH}`, 
                `Khách hàng vừa cập nhật lại SĐT/Địa chỉ giao hàng cho đơn mã ${maHienThi}. Hãy kiểm tra lại phiếu gửi!`, 
                "DonHang", 
                `/admin/orders?viewOrderId=${MaDH}`
            ]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin nhận hàng thành công!"
            });
        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khách hàng sửa thông tin đơn: ", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi chỉnh sửa thông tin!" });
        } finally {
            if (connection) connection.release();
        }
    },

    liet_ke_maGG: async (req, res) =>{
        try{
            const MaTK = req.user.id;
            
            const sql_lay_ds = `
                SELECT DISTINCT 
                    gg.MaGG, 
                    gg.MaVoucher, 
                    gg.LoaiGiamGia, 
                    gg.ChietKhau, 
                    gg.GiaTriGiamToiDa, 
                    gg.MucGiaToiThieu, 
                    gg.ThoiGianKT
                FROM MaGiamGia gg
                LEFT JOIN ChiTietMaGiamGia ctgg ON ctgg.MaGG = gg.MaGG
                
                WHERE gg.TrangThaiHoatDong = 1 
                  AND gg.ThoiGianBD >= NOW()
                  AND gg.ThoiGianKT <= NOW()
                  AND gg.SoLuongDungToiDa > gg.SoLuongDaDung
                  
                  -- CHỐT CHẶN 1: Mã áp dụng toàn shop HOẶC áp dụng cho món đang có trong giỏ
                  AND (
                      ctgg.MaGG IS NULL 
                      OR ctgg.MaPhanLoai IN (
                          SELECT ctgh.MaPhanLoai
                          FROM ChiTietGioHang ctgh
                          INNER JOIN GioHang gh ON gh.MaGH = ctgh.MaGH
                          INNER JOIN KhachHang kh ON kh.MaKH = gh.MaKH 
                          WHERE kh.MaTK = ?
                      )
                  )
                  
                  -- CHỐT CHẶN 2: Khách hàng chưa từng sử dụng mã này
                  AND gg.MaGG NOT IN (
                      SELECT log.MaGG 
                      FROM LogSuDungMaGiamGia log
                      INNER JOIN KhachHang kh_log ON log.MaKH = kh_log.MaKH
                      WHERE kh_log.MaTK = ?
                  )
            `;
            
            const [ds] = await db.query(sql_lay_ds, [MaTK, MaTK]);
            
            res.status(200).json({
                success: true,
                data: ds,
                message: "Lấy danh sách mã giảm giá thành công!"
            });
        }
        catch(error){
            console.error("Lỗi khi lấy danh sách mã giảm giá: ", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống tải danh sách mã giảm giá!" });
        }
    },

    xac_nhan_chon_cod: async (req, res) => {
        try {
            const MaTK = req.user.id;
            const { MaDH } = req.body;

            // 1. Kiểm tra đơn hàng có đúng của khách này không, và đang ở trạng thái Cọc không
            const [order] = await db.query(`
                SELECT dh.MaDH, dh.MaDonHangHienThi 
                FROM DonHang dh 
                JOIN KhachHang kh ON dh.MaKH = kh.MaKH 
                WHERE dh.MaDH = ? AND kh.MaTK = ? AND dh.TrangThaiThanhToan = 'Đã đặt cọc'
            `, [MaDH, MaTK]);

            if (order.length === 0) {
                return res.status(400).json({ success: false, message: "Đơn hàng không hợp lệ hoặc đã thanh toán!" });
            }

            // 2. Cập nhật trạng thái thanh toán để làm tín hiệu cho Admin
            await db.query(`UPDATE DonHang SET TrangThaiThanhToan = 'Xác nhận thu COD' WHERE MaDH = ?`, [MaDH]);

            // 3. Ghi Log để Kế toán biết khách vừa bấm
            await db.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, ThoiGian) 
                VALUES (?, 'ORDER_COD_CONFIRM', ?, NOW())
            `, [MaTK, `Khách hàng xác nhận trả phần còn lại bằng tiền mặt (COD) cho đơn ${order[0].MaDonHangHienThi}`]);

            res.status(200).json({ success: true, message: "Đã báo cho Shop chuẩn bị Ship COD cho bạn!" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    },

    // ==============================================
    // THANH TOÁN MOMO
    // ==============================================
    tao_link_momo_mock: async (req, res) => {
        try {
            const { MaDH, HinhThuc } = req.body;
            let soTienCanThanhToan = 0;
            let maHienThi = "";

            // =======================================================
            // 1. TÍNH TOÁN SỐ TIỀN (THÊM NHÁNH THANH TOÁN CÒN LẠI)
            // =======================================================
            if (HinhThuc === 'Thanh toán toàn bộ') {
                const sql_tong_tien = `SELECT ThanhTien, MaDonHangHienThi FROM DonHang WHERE MaDH = ?`;
                const [result_tong] = await db.query(sql_tong_tien, [MaDH]);
                soTienCanThanhToan = result_tong[0].ThanhTien;
                maHienThi = result_tong[0].MaDonHangHienThi || MaDH.toString();

            } else if (HinhThuc === 'Thanh toán phần còn lại') {
                const sql_tinh_tien = `
                    SELECT dh.ThanhTien, dh.MaDonHangHienThi, COALESCE(SUM(tt.SoTienGiaoDich), 0) AS TongDaThu
                    FROM DonHang dh
                    LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH AND tt.TrangThaiGiaoDich = 'Thành công'
                    WHERE dh.MaDH = ?
                    GROUP BY dh.MaDH
                `;
                const [result] = await db.query(sql_tinh_tien, [MaDH]);
                if(result.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
                
                soTienCanThanhToan = result[0].ThanhTien - result[0].TongDaThu;
                
                if (soTienCanThanhToan <= 0) {
                    return res.status(400).json({ success: false, message: "Đơn hàng này đã được thanh toán đầy đủ!" });
                }
                maHienThi = result[0].MaDonHangHienThi || MaDH.toString();

            } else { // Cọc một phần
                const sql_tinh_tien_coc = `
                    SELECT SUM(mh.TienCocToiThieu * ct.SoLuong) as TienCoc, dh.MaDonHangHienThi
                    FROM MoHinh mh
                    INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                    INNER JOIN ChiTietDonHang ct ON ct.MaPhanLoai = pl.MaPhanLoai
                    INNER JOIN DonHang dh ON dh.MaDH = ct.MaDH
                    WHERE ct.MaDH = ? LIMIT 1
                `;
                const [result_tien_coc] = await db.query(sql_tinh_tien_coc,[MaDH]);                  
                soTienCanThanhToan = result_tien_coc[0].TienCoc;
                if(soTienCanThanhToan === 0){
                        return res.status(400).json({ 
                            success: false, 
                            message: "Lỗi thao tác: Đơn hàng này không có sản phẩm nào yêu cầu đặt cọc. Vui lòng thanh toán toàn bộ!" 
                        });
                    }
                maHienThi = result_tien_coc[0].MaDonHangHienThi || MaDH.toString();
            }

            // 2. Lấy thông tin từ .env
            const partnerCode = process.env.MOMO_PARTNER_CODE.trim();
            const accessKey = process.env.MOMO_ACCESS_KEY.trim();
            const secretkey = process.env.MOMO_SECRET_KEY.trim();
            const DOMAIN_BACKEND = process.env.DOMAIN_BACKEND.trim(); 
            const DOMAIN_FRONTEND = process.env.DOMAIN_FRONTEND.trim();

            const requestId = partnerCode + new Date().getTime();
            const orderId = maHienThi + "_" + new Date().getTime();
            const orderInfo = "Thanh toan don hang " + maHienThi;
            
            const redirectUrl = `${DOMAIN_FRONTEND}/ordersuccess?maDH=${MaDH}`; 
            const ipnUrl = `${DOMAIN_BACKEND}/api/don_hang/payment/momo/ipn`; 
            
            const amountNum = Math.max(1000, Number(soTienCanThanhToan)); 
            
            let safeHinhThuc = 'deposit';
            if (HinhThuc === 'Thanh toán toàn bộ') safeHinhThuc = 'full';
            if (HinhThuc === 'Thanh toán phần còn lại') safeHinhThuc = 'remaining';
            
            const extraData = Buffer.from(safeHinhThuc).toString('base64');
            const requestType = "payWithMethod";

            const rawSignature = `accessKey=${accessKey}&amount=${amountNum}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

            const signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

            const requestBody = JSON.stringify({
                partnerCode, accessKey, requestId, amount: amountNum, orderId, orderInfo,
                redirectUrl, ipnUrl, extraData, requestType, signature, lang: 'vi'
            });

            // 5. Gửi Request lên MoMo
            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };

            const reqMoMo = https.request(options, resMoMo => {
                let body = '';
                resMoMo.on('data', chunk => { body += chunk; });
                resMoMo.on('end', () => {
                    const response = JSON.parse(body);
                    if (response.payUrl) {
                        res.status(200).json({ message: "Tạo link MoMo thành công!", checkoutUrl: response.payUrl });
                    } else {
                        res.status(400).json({ message: "Lỗi từ MoMo", data: response });
                    }
                });
            });

            reqMoMo.on('error', (e) => res.status(500).json({ message: "Không thể kết nối đến MoMo" }));
            reqMoMo.write(requestBody);
            reqMoMo.end();

        } catch (error) {
            console.error("Lỗi Controller:", error);
            res.status(500).json({ message: "Lỗi hệ thống tạo thanh toán!" });
        }
    },

    momo_ipn: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = req.body;

            const accessKey = process.env.MOMO_ACCESS_KEY;
            const secretkey = process.env.MOMO_SECRET_KEY;

            // 1. Kiểm tra chữ ký
            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
            const expectedSignature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

            if (signature !== expectedSignature) return res.status(400).json({ message: "Chữ ký không hợp lệ!" });

            const maHienThiGoc = orderId.split('_')[0];
            const sql_tim_don = `SELECT MaDH, TrangThaiThanhToan, Note FROM DonHang WHERE MaDonHangHienThi = ? LIMIT 1`;
            const [don_hang] = await connection.query(sql_tim_don, [maHienThiGoc]);

            if (don_hang.length === 0) return res.status(204).send(); 
            
            const MaDH = don_hang[0].MaDH;

            await connection.beginTransaction();

            if (resultCode === 0) {
                const trangThaiHienTai = don_hang[0].TrangThaiThanhToan;

                const decodedExtraData = Buffer.from(extraData, 'base64').toString('utf8');
                let hinhThuc = 'Cọc một phần';
                if (decodedExtraData === 'full') hinhThuc = 'Thanh toán toàn bộ';
                else if (decodedExtraData === 'remaining') hinhThuc = 'Thanh toán phần còn lại';

                let trangThaiMoi = 'Đã cọc';
                if (hinhThuc === 'Thanh toán toàn bộ' || hinhThuc === 'Thanh toán phần còn lại') {
                    trangThaiMoi = 'Đã thanh toán';
                }

                // Đã thanh toán full thì ko nhận thêm hook gì nữa
                if (trangThaiHienTai === 'Đã thanh toán') {
                    await connection.rollback();
                    return res.status(204).send(); 
                }
                // Nếu đang là Đã cọc, mà hook lại gửi về loại "Cọc" hoặc "Full" -> Hook cũ gọi trễ, skip.
                if (trangThaiHienTai === 'Đã cọc' && hinhThuc !== 'Thanh toán phần còn lại') {
                    await connection.rollback();
                    return res.status(204).send(); 
                }

                if (trangThaiHienTai === 'Đã hủy') {
                    const noteMoi = (don_hang[0].Note || "") + "\n🚨 CẢNH BÁO: KHÁCH THANH TOÁN TRỄ QUA MOMO KHI ĐƠN ĐÃ BỊ HỦY. ADMIN KIỂM TRA LẠI TỒN KHO HOẶC HOÀN TIỀN!";
                    await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = ?, Note = ? WHERE MaDH = ?`, [trangThaiMoi, noteMoi, MaDH]);
                } else {
                    await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = ? WHERE MaDH = ?`, [trangThaiMoi, MaDH]);
                }

                await connection.query(`
                    INSERT INTO ThanhToan (MaPT, MaDH, NgayThanhToan, SoTienGiaoDich, LoaiGiaoDich, TrangThaiGiaoDich, MaGiaoDichCuaDoiTac) 
                    VALUES (1, ?, NOW(), ?, ?, 'Thành công', ?)
                `, [MaDH, amount, hinhThuc, transId]);
            }

            await connection.commit();
            return res.status(204).send();

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi xử lý IPN MoMo:", error);
            return res.status(500).json({ message: "Lỗi server" });
        } finally {
            connection.release();
        }
    },

    // ==============================================
    // THANH TOÁN ZALOPAY
    // ==============================================
    tao_link_zalopay_mock: async (req, res) => {
        console.log("===== [ZALOPAY CREATE] START =====");
        try {
            const { MaDH, HinhThuc } = req.body;
            console.log("Mã đơn hàng:", MaDH);
            
            let soTienCanThanhToan = 0;
            let maHienThi = "";

            // =======================================================
            // 1. TÍNH TOÁN SỐ TIỀN (THÊM NHÁNH THANH TOÁN CÒN LẠI)
            // =======================================================
            if (HinhThuc === 'Thanh toán toàn bộ') {
                const sql_tong_tien = `SELECT ThanhTien, MaDonHangHienThi FROM DonHang WHERE MaDH = ?`;
                const [result_tong] = await db.query(sql_tong_tien, [MaDH]);
                soTienCanThanhToan = result_tong[0].ThanhTien;
                maHienThi = result_tong[0].MaDonHangHienThi || MaDH.toString(); 

            } else if (HinhThuc === 'Thanh toán phần còn lại') {
                const sql_tinh_tien = `
                    SELECT dh.ThanhTien, dh.MaDonHangHienThi, COALESCE(SUM(tt.SoTienGiaoDich), 0) AS TongDaThu
                    FROM DonHang dh
                    LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH AND tt.TrangThaiGiaoDich = 'Thành công'
                    WHERE dh.MaDH = ?
                    GROUP BY dh.MaDH
                `;
                const [result] = await db.query(sql_tinh_tien, [MaDH]);
                if(result.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
                
                soTienCanThanhToan = result[0].ThanhTien - result[0].TongDaThu;
                
                if (soTienCanThanhToan <= 0) {
                    return res.status(400).json({ success: false, message: "Đơn hàng này đã được thanh toán đầy đủ!" });
                }
                maHienThi = result[0].MaDonHangHienThi || MaDH.toString();

            } else { // Cọc một phần
                const sql_tinh_tien_coc = `
                    SELECT SUM(mh.TienCocToiThieu * ct.SoLuong) as TienCoc, dh.MaDonHangHienThi
                    FROM MoHinh mh
                    INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                    INNER JOIN ChiTietDonHang ct ON ct.MaPhanLoai = pl.MaPhanLoai
                    INNER JOIN DonHang dh ON dh.MaDH = ct.MaDH
                    WHERE ct.MaDH = ? LIMIT 1
                `;
                const [result_tien_coc] = await db.query(sql_tinh_tien_coc,[MaDH]);                  
                soTienCanThanhToan = result_tien_coc[0].TienCoc;
                if(soTienCanThanhToan === 0){
                        return res.status(400).json({ 
                            success: false, 
                            message: "Lỗi thao tác: Đơn hàng này không có sản phẩm nào yêu cầu đặt cọc. Vui lòng thanh toán toàn bộ!" 
                        });
                    }
                maHienThi = result_tien_coc[0].MaDonHangHienThi || MaDH.toString();
            }

            const amount = Math.max(1000, Math.round(Number(soTienCanThanhToan)));
            console.log("Số tiền thanh toán:", amount);

            const DOMAIN_BACKEND = process.env.DOMAIN_BACKEND; 
            const DOMAIN_FRONTEND = process.env.DOMAIN_FRONTEND;
            const config = {
                app_id: process.env.ZALO_APP_ID, 
                key1: process.env.ZALO_KEY1,
                apiUrl: "https://sb-openapi.zalopay.vn/v2/create"
            };

            const date = new Date();
            const yy = date.getFullYear().toString().slice(-2);
            const mm = ('0' + (date.getMonth() + 1)).slice(-2);
            const dd = ('0' + date.getDate()).slice(-2);
            const prefixDate = `${yy}${mm}${dd}`; 
            
            const transID = Math.floor(Math.random() * 1000000);
            const app_trans_id = `${prefixDate}_${MaDH}_${transID}`; 
            
            let safeHinhThuc = 'deposit';
            if (HinhThuc === 'Thanh toán toàn bộ') safeHinhThuc = 'full';
            if (HinhThuc === 'Thanh toán phần còn lại') safeHinhThuc = 'remaining';

            const embed_data = JSON.stringify({ 
                redirecturl: `${DOMAIN_FRONTEND}/ordersuccess?maDH=${MaDH}`,
                hinhThuc: safeHinhThuc,
                maDonHangHienThi: maHienThi,
                maDH_Goc: MaDH
            });

            const item = JSON.stringify([{}]); 

            const order = {
                app_id: config.app_id,
                app_trans_id: app_trans_id,
                app_user: "KhachHang",
                app_time: date.getTime(), 
                expire_duration_seconds: 900,
                item: item,
                embed_data: embed_data,
                amount: amount, 
                description: `Thanh toan don hang ${maHienThi}`,
                bank_code: "", 
                callback_url: `${DOMAIN_BACKEND}/api/don_hang/payment/zalopay/ipn`
            };

            const dataToMac = [
                config.app_id,
                order.app_trans_id,
                order.app_user,
                order.amount,
                order.app_time,
                order.embed_data,
                order.item
            ].join("|");

            order.mac = crypto.createHmac('sha256', config.key1).update(dataToMac).digest('hex');

            const response = await fetch(config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(order).toString() 
            });

            const dataResult = await response.json();

            if (dataResult.return_code === 1) {
                console.log("===== [ZALOPAY CREATE SUCCESS] =====");
                res.status(200).json({ message: "Tạo link ZaloPay thành công!", checkoutUrl: dataResult.order_url });
            } else {
                console.log("===== [ZALOPAY CREATE FAIL] =====");
                res.status(400).json({ message: "Lỗi từ ZaloPay", data: dataResult });
            }

        } catch (error) {
            console.error("Lỗi Controller ZaloPay:", error);
            res.status(500).json({ message: "Lỗi hệ thống tạo thanh toán ZaloPay!" });
        }
    },

    zalopay_ipn: async (req, res) => {
        console.log("\n🚀 ===== [ZALOPAY IPN] BẮT ĐẦU NHẬN THÔNG BÁO =====");
        const connection = await db.getConnection();
        let result = {};
        
        try {
            const config = { key2: process.env.ZALO_KEY2 };

            if (!config.key2) {
                console.error("❌ LỖI NGHIÊM TRỌNG: KHÔNG TÌM THẤY ZALO_KEY2 TRONG BIẾN MÔI TRƯỜNG ENV!");
            }

            const dataStr = req.body.data;
            const reqMac = req.body.mac;
            const mac = crypto.createHmac('sha256', config.key2).update(dataStr).digest('hex');

            if (reqMac !== mac) {
                console.error("❌ LỖI: CHỮ KÝ MAC KHÔNG KHỚP! (Có thể do sai KEY2)");
                result.return_code = -1;
                result.return_message = "mac not equal";
                return res.status(400).json(result);
            }

            const dataJson = JSON.parse(dataStr);
            const embed_data = JSON.parse(dataJson.embed_data); 
            const maDH_Goc = embed_data.maDH_Goc;
            
            let hinhThuc = 'Cọc một phần';
            if (embed_data.hinhThuc === 'full') hinhThuc = 'Thanh toán toàn bộ';
            else if (embed_data.hinhThuc === 'remaining') hinhThuc = 'Thanh toán phần còn lại';
            
            const amount = dataJson.amount;
            const transId = dataJson.zp_trans_id;

            await connection.beginTransaction();

            const sql_tim_don = `SELECT MaDH, TrangThaiThanhToan, Note FROM DonHang WHERE MaDH = ? LIMIT 1`;
            const [don_hang] = await connection.query(sql_tim_don, [maDH_Goc])

            if (don_hang.length > 0) {
                const MaDH = don_hang[0].MaDH;
                const trangThaiHienTai = don_hang[0].TrangThaiThanhToan;
                
                let trangThaiMoi = 'Đã cọc';
                if (hinhThuc === 'Thanh toán toàn bộ' || hinhThuc === 'Thanh toán phần còn lại') {
                    trangThaiMoi = 'Đã thanh toán';
                }

                let isIdempotentOK = true;
                if (trangThaiHienTai === 'Đã thanh toán') {
                    isIdempotentOK = false;
                } else if (trangThaiHienTai === 'Đã cọc' && hinhThuc !== 'Thanh toán phần còn lại') {
                    isIdempotentOK = false;
                }

                if (isIdempotentOK) {
                    if (trangThaiHienTai === 'Đã hủy') {
                        const noteMoi = (don_hang[0].Note || "") + "\n🚨 CẢNH BÁO: KHÁCH THANH TOÁN TRỄ QUA ZALOPAY KHI ĐƠN ĐÃ BỊ HỦY. ADMIN KIỂM TRA LẠI TỒN KHO!";
                        await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = ?, Note = ? WHERE MaDH = ?`, [trangThaiMoi, noteMoi, MaDH]);
                    } else {
                        await connection.query(`UPDATE DonHang SET TrangThaiThanhToan = ? WHERE MaDH = ?`, [trangThaiMoi, MaDH]);
                    }

                    const MA_PT_ZALOPAY = 2; // ZaloPay ID
                    await connection.query(`
                        INSERT INTO ThanhToan (MaPT, MaDH, NgayThanhToan, SoTienGiaoDich, LoaiGiaoDich, TrangThaiGiaoDich, MaGiaoDichCuaDoiTac) 
                        VALUES (?, ?, NOW(), ?, ?, 'Thành công', ?)
                    `, [MA_PT_ZALOPAY, MaDH, amount, hinhThuc, transId]);
                }
            }

            await connection.commit();
            result.return_code = 1;
            result.return_message = "success";
            return res.json(result);

        } catch (error) {
            await connection.rollback();
            console.error("❌ ===== LỖI SẬP HỆ THỐNG IPN ZALOPAY =====", error);
            result.return_code = 0; 
            result.return_message = error.message;
            return res.status(500).json(result);
        } finally {
            connection.release();
        }
    }

    // // 2. Hàm nhận tín hiệu khi khách bấm "Xác nhận" trên giao diện MoMo giả
    // xac_nhan_momo_mock: async (req, res) => {
    //     // Cấp 1 connection riêng để làm Transaction (đảm bảo an toàn ghi dữ liệu)
    //     const connection = await db.getConnection();

    //     try {
    //         // Frontend truyền cục data về khi bấm "Xác nhận"
    //         const { orderId, amount, type } = req.body; 

    //         await connection.beginTransaction();

    //         // Bước 1: Ghi vào bảng ThanhToan
    //         const sql_thanh_toan = `
    //             INSERT INTO ThanhToan (MaPT, MaDH, NgayThanhToan, SoTienGiaoDich, LoaiGiaoDich) 
    //             VALUES (1, ?, NOW(), ?, ?)
    //         `;
    //         await connection.query(sql_thanh_toan, [orderId, amount, type]);

    //         // Bước 2: Cập nhật trạng thái đơn hàng (Đã cọc hoặc Đã thanh toán)
    //         let trangThaiMoi = type === 'Thanh toán toàn bộ' ? 'Đã thanh toán' : 'Đã cọc';
    //         await connection.query(
    //             `UPDATE DonHang SET TrangThaiThanhToan = ? WHERE MaDH = ?`, 
    //             [trangThaiMoi, orderId]
    //         );
            
    //         // Bước 3: Thêm log vào bảng ChiTietTrangThai (Giả sử mã trạng thái 2 là Đã cọc/thanh toán)

    //         await connection.commit();
    //         connection.release();

    //         res.status(200).json({ 
    //             success: true, 
    //             message: "Giao dịch thành công!" 
    //         });
            
    //     } catch (error) {
    //         await connection.rollback();
    //         connection.release();
    //         console.error("Lỗi xử lý xác nhận MoMo:", error);
    //         res.status(500).json({ success: false, message: "Lỗi hệ thống khi ghi nhận thanh toán!" });
    //     }
    // }
}

module.exports = donhang_user;