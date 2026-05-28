const db = require('../../config/db.js');
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
            // CHỐT CHẶN BẢO MẬT 1: KIỂM TRA ĐẦU VÀO TỪ API
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
            // CHỐT CHẶN BẢO MẬT 2: KIỂM TRA SẢN PHẨM & TỒN KHO 
            // ==========================================
            const sql_kiemtra_kho = `SELECT SoLuong AS TonKho FROM PhanLoai WHERE MaPhanLoai = ? and HienThi = 1`;
            const [kho] = await connection.query(sql_kiemtra_kho, [MaPhanLoai]);

            // Chặn nếu sản phẩm không tồn tại (bị xóa) hoặc gửi mã bậy bạ
            if (kho.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Sản phẩm này không tồn tại hoặc đang tạm thời ngừng kinh doanh!" });
            }

            const tonKho = kho[0].TonKho;

            // Chặn nếu kho đã cạn kiệt
            if (tonKho <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Sản phẩm này đã hết hàng trong kho!" });
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

            // FIX: Chặn lỗi cập nhật "Bóng ma" (Món đồ chưa từng được thêm vào giỏ)
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
                message: thongBao, // Trả thông báo động cho mượt
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
                    mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.TienCocToiThieu,
                    pl.MaPhanLoai, pl.ChiTietPhanLoai, pl.DonGia, pl.SoLuong AS TonKho,
                    ct.SoLuong,
                    
                    -- Giá sau khuyến mãi (Nếu không có sale thì bằng giá gốc)
                    (pl.DonGia - COALESCE(km_info.MucGiam, 0)) AS DonGiaKhuyenMai,
                    
                    -- Lấy số lượng khuyến mãi còn lại ra cho Frontend hiển thị
                    COALESCE(km_info.SoLuongConLai, 0) AS SoLuongKhuyenMaiConLai
                    
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                INNER JOIN ChiTietGioHang ct ON pl.MaPhanLoai = ct.MaPhanLoai
                
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
            const {TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note, MaGG} = req.body;
            const MaTK = req.user.id;
            if (!TenNguoiNhan || !SDTNguoiNhan || !DiaChiGiao) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Thông tin quan trọng không được trống!" });
            }
            const sql_laymagiohang = `
                Select gh.MaGH, kh.MaKH
                from GioHang gh
                inner join KhachHang kh on kh.MaKH = gh.MaKH 
                where kh.MaTK = ?
            `;
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaTK]);

            if(result_giohang.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy mã giỏ hàng" });
            }

            const MaGH = result_giohang[0].MaGH;
            const MaKH = result_giohang[0].MaKH;
            
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
                INNER JOIN ChiTietGioHang ct ON pl.MaPhanLoai = ct.MaPhanLoai
                
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
                await connection.rollback();
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
                    WHERE MaGG = ? AND TrangThaiHoatDong = 1 AND ThoiGianBD <= NOW() AND ThoiGianKT >= NOW()
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
                        return res.status(400).json({
                            success: false,
                            message: `Mã voucher ${voucherInfo[0].MaVoucher} đã được bạn sử dụng!`
                        });
                    }

                    if(v.SoLuongDaDung >= v.SoLuongDungToiDa){
                        await connection.rollback();
                        return res.status(400).json({
                            success: false,
                            message: `Mã voucher ${voucherInfo[0].MaVoucher} đã đạt giới hạn sử dụng!`
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
                        return res.status(400).json({
                            success: false,
                            message: `Mã voucher ${voucherInfo[0].MaVoucher} không tồn tại hoặc hết hạn!`
                        });
                }
            }

            // 2. Tạo Đơn hàng mới 
            const sql_tao_don = `INSERT INTO DonHang (MaKH, TongTien, ThanhTien, NgayLapDon, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note) 
            VALUES (?, ?, ?, NOW(), 'Chưa Thanh Toán', ?, ? ,?, ?)`;
            const [tao_don] = await connection.query(sql_tao_don, [MaKH, TongTienHang, tongTienThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, Note]);
            
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
                await connection.query(`UPDATE MaGiamGia SET SoLuongDaDung = SoLuongDaDung + 1 WHERE MaGG = ?`, [MaGG]);
            }

            await connection.query(`DELETE FROM ChiTietGioHang WHERE MaGH = ?`, [MaGH]);
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
                SELECT TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, TongTien, ThanhTien, NgayLapDon, Note,
                COALESCE(SUM(tt.SoTienGiaoDich), 0) AS DaThanhToan
                FROM DonHang
                LEFT JOIN ThanhToan tt on DonHang.MaDH = tt.MaDH
                WHERE DonHang.MaDH = ? AND MaKH = ?
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
            const MaTK = req.user.id; // Lấy từ Token để xác thực

            // 1. Kiểm tra đơn hàng có tồn tại và CÓ PHẢI CỦA NGƯỜI NÀY KHÔNG
            const sql_kiemtra_tt = `
                SELECT cttt.MaTrangThai, dh.MaKH, dh.MaDonHangHienThi
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

            // 2. NGHIỆP VỤ: Khách chỉ được hủy khi đơn đang "Chờ duyệt" (Mã 1)
            // (Mã 2: Đang đóng gói, 3: Đang vận chuyển, 4: Đã giao... thì không được hủy online)
            if(currentStatus !== 1){
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Không thể huỷ! Đơn hàng của bạn đã được Shop tiếp nhận xử lý hoặc đã giao cho đơn vị vận chuyển, vui lòng liên hệ nhân viên để có hướng xử lý."
                });
            }

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
            const sql_lay_khuyen_mai = `SELECT MaKM, MaKH, SoTienDaGiam FROM LogSuDungKhuyenMai WHERE MaDH = ?`;
            const [log_km] = await connection.query(sql_lay_khuyen_mai, [MaDH]);
            
            for (let km of log_km) {
                // Hoàn lại số lượng dựa trên số lượng hàng khuyến mãi trong ChiTietDonHang
                const [hang_km] = await connection.query(`
                    SELECT SoLuong FROM ChiTietDonHang 
                    WHERE MaDH = ? AND LaHangKhuyenMai = 1
                `, [MaDH]);
                
                if(hang_km.length > 0) {
                    await connection.query(`
                        UPDATE ChiTietKhuyenMai SET SoLuongDaDung = GREATEST(0, SoLuongDaDung - ?) 
                        WHERE MaKM = ?
                    `, [hang_km[0].SoLuong, km.MaKM]);
                }
            }
            // Xóa log dùng khuyến mãi để sau này tính toán báo cáo không bị sai
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

            const noiDungLog = `Khách hàng tự hủy đơn hàng #${MaDH} (${maHienThi})`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ORDER_CANCEL', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

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

    sua_thong_tin_don_hang_client: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaDH, sdt, hoten, diachi } = req.body;
            const MaTK = req.user.id; // ID tài khoản của chính khách hàng đang đăng nhập

            if (!MaDH || !sdt || !hoten || !diachi) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Thông tin không được để trống!" });
            }

            // RÀNG BUỘC BẢO MẬT: Phải INNER JOIN với KhachHang để chắc chắn đơn này do MaTK này đặt
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

            // RÀNG BUỘC NGHIỆP VỤ: Khách hàng CHỈ được sửa khi trạng thái là "Chờ duyệt" (Mã 1)
            if (currentStatus !== 1) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Không thể tự sửa thông tin! Đơn hàng đã được tiếp nhận đóng gói hoặc vận chuyển. Vui lòng liên hệ Hotline shop để được hỗ trợ thủ công."
                });
            }

            // Tiến hành cập nhật địa chỉ mới
            const sql_update = `
                UPDATE DonHang 
                SET TenNguoiNhan = ?, SDTNguoiNhan = ?, DiaChiGiao = ? 
                WHERE MaDH = ?
            `;
            await connection.query(sql_update, [hoten, sdt, diachi, MaDH]);

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
                                            inner join ChiTietDonHang ct on ct.MaPhanLoai = pl.MaPhanLoai
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