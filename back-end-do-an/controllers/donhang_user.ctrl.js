const db = require('../config/db');

const donhang_user = {
    themdonhang: async(req, res) =>{
        try {
            const {MaKH, maPhanLoai, soluong} = req.body;
            const sql_laymagiohang = 'Select MaGH from GioHang where MaKH = ?';
            const [result_giohang] = await db.query(sql_laymagiohang,[MaKH]);

            if(result_giohang.length === 0)
                return res.status(404).json({ message: "Không tìm thấy mã giỏ hàng"});

            const maGH = result_giohang[0].MaGH;

            const sql_themhangvaogio = `Insert into ChiTietGioHang(MaGH, MaMoHinh, SoLuong) values (?,?,?)`;
            const [them_hang] = await db.query(sql_themhangvaogio,[maGH,maPhanLoai,soluong]);

            res.status(200).json({
                message: "Thêm hàng vào giỏ thành công",
                MaGioHangCuaKhach: maGH
            })
            
        }
        catch (error){
            console.error("Lỗi khi thêm vào giỏ: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác giỏ hàng!"});
        }
    }
}

module.exports = donhang_user;