const db = require('../config/db');
const bcrypt = require('bcryptjs');

const fix_user_info = {
    capnhatthongtin: async(req, res) => {
        try {
            const {MaTK, AnhDaiDien, email, TenKH, DiaChi, SDT} = req.body;
            await db.query('Update TaiKhoan set AnhDaiDien = ? and email = ? where MaTK = ?',[AnhDaiDien, email, MaTK]);
            await db.query('Update KhachHang set TenKH = ? and DiaChi = ? and SDT = ? where MaTK = ?',[TenKH, DiaChi,SDT, MaTK]);
            res.status(200).json({message: "Thêm hàng mới vào giỏ thành công!"});

        }
        catch (error){
            console.error("Lỗi khi cập nhật thông tin: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác thông tin khách hàng!"});
        }
    },

    doi_mat_khau: async(req, res) =>{
        try {
            const {MaTK, MatKhau} = req.body;
            const [check] = await db.query('Select MatKhau from TaiKhoan where MaTK = ?',[MaTK]);
            const is_match = await bcrypt.compare(MatKhau, check.MatKhau);
            if(is_match){
                res.status(200).json({message: "Sai dữ liệu!"});
            }
            else{
                const hash = await bcrypt.hash(MatKhau, 10);
                await db.query('Update MatKhau from TaiKhoan set MatKhau = ? where MaTK = ?',[hash,MaTK]);
            }
        }
        catch (error){
            console.error("Lỗi khi đổi mật khẩu: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác thông tin khách hàng!"});
        }
    }
}
module.exports = fix_user_info;