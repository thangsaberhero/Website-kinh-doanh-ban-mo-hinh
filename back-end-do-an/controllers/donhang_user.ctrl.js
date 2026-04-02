const db = require('../config/db');

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
                const sql_themhangvaogio = 'Update ChiTietGioHang set SoLuong = SoLuong + ? where MaGH = ? and MaMoHinh = ?'
                await db.query(sql_themhangvaogio,[soluong,maGH,MaPhanLoai])

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

            const maGH = result_giohang[0].MaGH;
            const sql = `SELECT 
            mh.MaMoHinh,
            mh.TenMH,
            mh.AnhDaiDien, 
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
            const { MaKH, TongTien, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao } = req.body;
           
            const sql_laymagiohang = 'SELECT MaGH FROM GioHang WHERE MaKH = ?';
            const [result_giohang] = await connection.query(sql_laymagiohang, [MaKH]);

            if(result_giohang.length === 0) {
                connection.release(); // Nhớ trả lại connection nếu dừng sớm
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});
            }
            const maGH = result_giohang[0].MaGH;

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
            const sql_tao_don = `INSERT INTO DonHang (MaKH, TongTien, NgayLapDon, TrangThaiDonHang, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao) 
            VALUES (?, ?, NOW(), 'Chờ Duyệt', ?, ? ,?)`;
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
    }
    
    
}

module.exports = donhang_user;