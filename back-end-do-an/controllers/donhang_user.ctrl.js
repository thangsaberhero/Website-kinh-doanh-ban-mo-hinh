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
            const { MaKH } = req.body;
            
            // Sửa lỗi chính tả onst -> const
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

            // 2. Tạo Đơn hàng mới (Giả sử bảng DonHang có cột MaKH, NgayDat, TrangThai)
            const sql_tao_don = `INSERT INTO DonHang (MaKH, NgayDat, TrangThai) VALUES (?, NOW(), 'Chờ Duyệt')`;
            const [tao_don] = await connection.query(sql_tao_don, [MaKH]);
            
            // Lấy cái Mã Đơn Hàng vừa được MySQL sinh ra tự động
            const maDH_moi = tao_don.insertId; 

            // 3. COPY hàng từ Giỏ sang Đơn (Dùng chiêu INSERT INTO ... SELECT siêu nhanh của SQL)
            // LƯU Ý: Sửa lại chữ MaPhanLoai hoặc MaMoHinh cho khớp với thiết kế CSDL của bạn nhé
            const sql_chuyen_hang = `
                INSERT INTO ChiTietDonHang (MaDH, MaMoHinh, SoLuong)
                SELECT ?, MaPhanLoai, SoLuong 
                FROM ChiTietGioHang 
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
    }

    
    


}

module.exports = donhang_user;