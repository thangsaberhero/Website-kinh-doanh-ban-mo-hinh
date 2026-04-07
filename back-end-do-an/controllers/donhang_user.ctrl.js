const db = require('../config/db');
//const PayOS = require("@payos/node");
// Thay 3 chuỗi bên dưới bằng 3 mã bạn vừa lấy ở Bước 1
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
            

            // Thay vì gọi API của MoMo thật, ta tự tạo ra một đường link trỏ về 
            // một trang giao diện mới trên chính Frontend (Vue.js) của bạn
            const mockUrl = `http://localhost:5173/momo-payment?orderId=${MaDH}&amount=${soTienCanThanhToan}&type=${encodeURIComponent(HinhThuc || 'Thanh toán toàn bộ')}`;

            res.status(200).json({
                message: "Tạo link thanh toán MoMo thành công!",
                checkoutUrl: mockUrl // Frontend sẽ lấy link này để mở ra
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
            // Chú ý: MaPT = 2 (Giả sử 1 là COD, 2 là Ví Điện Tử/MoMo, bạn tự chỉnh lại theo DB nhé)
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
            // await connection.query(
            //     `INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 1, NOW())`, 
            //     [orderId]
            // );

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