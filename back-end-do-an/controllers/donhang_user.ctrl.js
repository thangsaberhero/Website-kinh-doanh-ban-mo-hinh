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
    }

}

module.exports = donhang_user;