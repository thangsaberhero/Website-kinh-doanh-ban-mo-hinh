const db = require('../config/db');

const donhang_admin = {
    tao_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            const {DanhSachSanPham, TongTien, ThanhTien, Ten, SDT, DiaChi} = req.body;

            const sql_tao_don_hang = `Insert into DonHang 
                                    (NgayLapDon, TongTien, ThanhTien, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao) 
                                    Values (NOW(),?,?,'Đơn hàng ngoài',?,?,?)`;
            
            const [don_hang_moi] = await connection.query(sql_tao_don_hang,[TongTien, ThanhTien, TongTien, Ten, SDT, DiaChi]);
            const ma_don_hang_moi = don_hang_moi.insertId;

            if(Array.isArray(DanhSachSanPham) && DanhSachSanPham.length > 0){
                const sql_them_don_hang = `Insert into ChiTietDonHang (MaDH, MaMoHinh, SoLuong, DonGiaBan) Values (?,?,?,?)`;
                const sql_cap_nhat_ton_kho = `UPDATE PhanLoai SET SoLuong = SoLuong - ? WHERE MaPhanLoai = ?`;

                for(let item of DanhSachSanPham){
                    await connection.query(sql_cap_nhat_ton_kho,[item.SoLuong,item.MaPhanLoai]);
                    await connection.query(sql_them_don_hang,[ma_don_hang_moi, item.MaPhanLoai, item.SoLuong, item.DonGia]);
                }
            }
            await connection.query(`Insert into ChiTietTrangThai
                                    (MaDH, MaTrangThai, Thoigian)
                                    Values (?,1,NOW())`, [ma_don_hang_moi]);
            


            await connection.commit();

            res.status(200).json({
                success: true,
                message: "Thêm đơn hàng ngoài mới thành công!",
                MaDH: ma_don_hang_moi
            });
        }
        catch (error){
            console.error("Lỗi khi thêm đơn hàng mới: ", error);
            res.status(500).json({ message: "Lỗi server khi thêm đơn hàng!"});
        }
        finally {
        connection.release(); // Luôn nhớ nhả connection
        }
    },

    huy_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaDH} = req.body;

            const sql_kiemtra_tt = `Select cttt.MaTrangThai from ChiTietTrangThai where MaDH = ? Order by Thoigian DESC Limit 1`;
            const [trang_thai] = await connection.query(sql_kiemtra_tt,[MaDH]);

            if(trang_thai.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }

            // SỬA LỖI: Lấy đúng thuộc tính MaTrangThai từ Object
            const currentStatus = trang_thai[0].MaTrangThai;

            if(currentStatus === 3 || currentStatus === 4 || currentStatus === 5){
                await connection.rollback();
                return res.status(400).json({
                    message: "Không thể huỷ! Đơn hàng đã được giao hoặc đã bị hủy trước đó."
                });
            }

            const sql_them_trang_thai_huy = `Insert into ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) Values (?,5,Now())`;
            await connection.query(sql_them_trang_thai_huy,[MaDH]);

            const sql_cap_nhat_ton_kho = `UPDATE Phanloai pl
                                        inner join ChiTietDonHang ctdh on ctdh.MaMoHinh = pl.MaPhanLoai
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

            // SỬA LỖI: Lấy đúng thuộc tính MaTrangThai từ Object
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

            const maGH = result_giohang[0].MaGH;
            const sql = `SELECT 
            mh.MaMoHinh,
            mh.TenMH,
            mh.AnhDaiDien, 
            mh.TienCocToiThieu,
            pl.DonGia,
            (
                Select (pl.DonGia - ctkm.ChietKhau)
                from MoHinh mh
                inner join ChiTietKhuyenMai ctkm
                inner join KhuyenMai km on km.MaKM = ctkm.MaKM
                where km.ThoiGianBD <= now() and km.ThoiGianKT >= now() and mh.MaMoHinh = ctkm.MaMoHinh and pl.MaMoHinh = mh.MaMoHinh
                order by ctkm.ChietKhau desc
                limit 1
            ) As dongiakhuyenmai,
            pl.MaPhanLoai,
            pl.ChiTietPhanLoai,
            ct.SoLuong,
            (pl.DonGia * ct.SoLuong) AS ThanhTien,
            pl.SoLuong AS TonKho
            FROM MoHinh mh
            inner join PhanLoai pl on mh.MaMoHinh = pl.MaMoHinh
            inner join ChiTietGioHang ct on pl.MaPhanLoai = ct.MaMoHinh
            where ct.MaGH = ?
            ORDER BY mh.MaMoHinh DESC`;
            const [products] = await db.query(sql,[maGH]);

            res.status(200).json({
                message: "Lấy danh sách sản phẩm thành công",
                data: products
            });
        } 
        catch (error){
            console.error("Lỗi khi xem giỏ hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác giỏ hàng!"});
        }
    },

    xac_nhan_don_hang: async(req, res) => {
        // [MỚI]: Phải xin hệ thống cấp riêng một 'connection' để làm Transaction
        const connection = await db.getConnection(); 

        try {
            const { MaKH, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao } = req.body;
           
            const sql_laymagiohang = 'SELECT MaGH FROM GioHang WHERE MaKH = ?';
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaKH]);

            if(result_giohang.length === 0) {
                connection.release(); // Nhớ trả lại connection nếu dừng sớm
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});
            }
            const maGH = result_giohang[0].MaGH;

            // Truyền giá trị tính tiền riêng tránh việc bị sửa thông tin
            const sql_tinh_tong_tien =  `select SUM( 
                                        Coalesce(
                                            (
                                            Select (pl.DonGia - ctkm.ChietKhau)
                                            from MoHinh mh
                                            inner join ChiTietKhuyenMai ctkm on ctkm.MaMoHinh = mh.MaMoHinh
                                            inner join KhuyenMai km on km.MaKM = ctkm.MaKM
                                            where km.ThoiGianBD <= now() and km.ThoiGianKT >= now() and mh.MaMoHinh = ctkm.MaMoHinh and pl.MaMoHinh = mh.MaMoHinh
                                            order by ctkm.ChietKhau desc
                                            limit 1
                                            ), 
                                        pl.DonGia) * ctgh.SoLuong) 
                                        as TongTien
                                        from ChiTietGioHang ctgh
                                        inner join Phanloai pl on pl.MaPhanLoai = ctgh.MaMoHinh
                                        where ctgh.MaGH = ?`;
            const [result_tong_tien] = await connection.query(sql_tinh_tong_tien,[maGH]);
            const TongTien = result_tong_tien[0].TongTien;
            // 1. Kiểm tra giỏ hàng có đồ không? Giỏ trống thì không cho đặt!
            const [hang_trong_gio] = await connection.query('SELECT * FROM ChiTietGioHang WHERE MaGH = ?', [maGH]);
            if (hang_trong_gio.length === 0) {
                connection.release();
                return res.status(400).json({ message: "Giỏ hàng đang trống, không thể đặt hàng!" });
            }

            // ================= BẮT ĐẦU TRANSACTION =================
            await connection.beginTransaction(); 

            //Kiểm tra số lượng tồn kho trước khi đặt hàng:

            const sql_kiem_tra_ton_kho = `select mh.TenMH, ctgh.Soluong as Mua, pl.SoLuong as TonKho, pl.ChiTietPhanLoai
                                        from MoHinh mh
                                        inner join Phanloai pl on mh.MaMoHinh = pl.MaMoHinh
                                        inner join ChiTietGioHang ctgh on ctgh.MaMoHinh = pl.MaPhanLoai
                                        where ctgh.MaGH = ?`
            const [kiem_tra] = await connection.query(sql_kiem_tra_ton_kho,[maGH]);
            for (let item of kiem_tra){
                if(item.Mua > item.TonKho){
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        message: `Sản phẩm ${item.TenMH} phân loại ${item.ChiTietPhanLoai} chỉ còn ${item.TonKho}, vui lòng cập nhật lại giỏ hàng!`
                    });
                }
            }

            // 2. Tạo Đơn hàng mới 
            const sql_tao_don = `INSERT INTO DonHang (MaKH, TongTien, NgayLapDon, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao) 
            VALUES (?, ?, NOW(), 'Chưa Thanh Toán', ?, ? ,?)`;
            const [tao_don] = await connection.query(sql_tao_don, [MaKH, TongTien, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao]);
            
            // Lấy cái Mã Đơn Hàng vừa được MySQL sinh ra tự động
            const maDH_moi = tao_don.insertId; 

            // Thêm trạng thái "chờ duyệt cho đơn hàng"
            await connection.query(`Insert into ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) Values (?, 1, NOW())`, [maDH_moi]);

            // 3. COPY hàng từ Giỏ sang Đơn (Dùng chiêu INSERT INTO ... SELECT siêu nhanh của SQL)
            const sql_chuyen_hang = `
                INSERT INTO ChiTietDonHang (MaDH, MaMoHinh, SoLuong, DonGiaBan)
                SELECT ?, ctgh.MaMoHinh, ctgh.SoLuong , 
                Coalesce((
                    Select (pl.DonGia - ctkm.ChietKhau)
                    from MoHinh mh
                    inner join ChiTietKhuyenMai ctkm on ctkm.MaMoHinh = mh.MaMoHinh
                    inner join KhuyenMai km on km.MaKM = ctkm.MaKM
                    where km.ThoiGianBD <= now() and km.ThoiGianKT >= now() and mh.MaMoHinh = ctkm.MaMoHinh and pl.MaMoHinh = mh.MaMoHinh
                    order by ctkm.ChietKhau desc
                    limit 1
                ),
                pl.DonGia)
                FROM ChiTietGioHang ctgh
                inner join PhanLoai pl on pl.MaPhanLoai = ctgh.MaMoHinh
                WHERE MaGH = ?
            `;
            await connection.query(sql_chuyen_hang, [maDH_moi, maGH]);

            // 4. Dọn sạch giỏ hàng, đồng thời trừ số lượng tồn kho
            const sql_tru_kho = `
                UPDATE PhanLoai pl
                INNER JOIN ChiTietGioHang ct ON pl.MaPhanLoai = ct.MaMoHinh
                SET pl.SoLuong = pl.SoLuong - ct.SoLuong
                WHERE ct.MaGH = ?
            `;
            await connection.query(sql_tru_kho, [maGH]);
            const sql_xoa_gio = `DELETE FROM ChiTietGioHang WHERE MaGH = ?`;
            await connection.query(sql_xoa_gio, [maGH]);

            

            // ================= KẾT THÚC TRANSACTION =================
            await connection.commit(); // Thành công hết! Chốt sổ lưu vào DB!
            connection.release(); // Trả kết nối lại cho hệ thống

            res.status(200).json({ 
                message: "🎉 Đặt hàng thành công!",
                MaDonHang: maDH_moi
            });
            
        } catch (error) {
            // NẾU CÓ LỖI Ở BẤT KỲ ĐÂU -> HỦY BỎ TẤT CẢ MỌI THAY ĐỔI TRƯỚC ĐÓ
            await connection.rollback(); 
            connection.release();
            
            console.error("Lỗi khi xác nhận đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác đơn hàng!"});
        }
    },

    xem_don_hang: async(req, res) => {
        try{
            const maKH = req.params.MaKH;
            const [thong_tin_gio_hang] = await db.query(`Select DonHang.*,
                COALESCE(COUNT(ct.MaMoHinh), 0) AS TongSoSanPham,
                (SELECT mh.AnhDaiDien 
                        FROM ChiTietDonHang ctdh 
                        Join Phanloai pl on pl.MaPhanLoai = ctdh.MaMoHinh
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
                where MaKH = ?
                GROUP BY DonHang.MaDH
                ORDER BY DonHang.NgayLapDon DESC`,[maKH]);
            res.status(200).json({
                message: "Lấy danh sách đơn hàng thành công",
                data: thong_tin_gio_hang
            });
        }
        catch (error){
            console.error("Lỗi khi lấy thông tin danh sách đơn hàng: ", error);
            res.status(500).json({
                message: "Lỗi server khi lấy thông tin danh sách đơn hàng!"
            });
        }
    },
    
    xem_hang_trong_don_hang: async(req, res) =>{
        try {
            const MaKH = req.params.MaKH;
            const MaDH = req.params.MaDH;
            const sql_donhang = `
                SELECT TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, TongTien, NgayLapDon
                FROM DonHang WHERE MaDH = ? AND MaKH = ?
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
            ct.DonGiaBan,
            pl.MaPhanLoai,
            pl.ChiTietPhanLoai,
            ct.SoLuong,
            ((pl.DonGia - ct.DonGiaBan) * ct.SoLuong) AS KhuyenMai,
            pl.SoLuong AS TonKho
            FROM MoHinh mh
            inner join PhanLoai pl on mh.MaMoHinh = pl.MaMoHinh
            inner join ChiTietDonHang ct on pl.MaPhanLoai = ct.MaMoHinh
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
}
module.exports = donhang_admin;