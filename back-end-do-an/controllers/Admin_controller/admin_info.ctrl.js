const db = require('../../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const admin_info_ctrl = {
    laythongtin: async(req, res) => {
        try {
            const { MaTK } = req.params; 
            const sql = 'SELECT tk.*, nv.TenNV, nv.DiaChi, nv.SDT FROM TaiKhoan tk INNER JOIN NhanVien nv ON tk.MaTK = nv.MaTK WHERE tk.MaTK = ?';
            const [info] = await db.query(sql, [MaTK]);

            if (info.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy thông tin tài khoản Quản trị!" });
            }

            res.status(200).json({
                message: "Lấy thông tin thành công",
                data: info[0]
            });
        }
        catch (error){
            console.error("Lỗi khi lấy dữ liệu admin: ", error);
            res.status(500).json({ message: "Lỗi server khi lấy dữ liệu cá nhân!" });
        }
    },

    capnhatthongtin: async(req, res) => {
        try {
            const { MaTK, email, TenNV, DiaChi, SDT, isAvatarRemoved } = req.body;
            const newFileName = req.file ? req.file.filename : null; 

            if (newFileName) {
                const sql_lay_anh_cu = 'SELECT AnhDaiDien FROM TaiKhoan WHERE MaTK = ?';
                const [result_anh_cu] = await db.query(sql_lay_anh_cu, [MaTK]);
                
                if (result_anh_cu.length > 0 && result_anh_cu[0].AnhDaiDien) {
                    const oldFileName = result_anh_cu[0].AnhDaiDien;
                    const oldFilePath = path.join(__dirname, '..', 'public', 'Images_user', oldFileName);
                    fs.unlink(oldFilePath, (err) => { if (err) console.error("Lỗi khi gỡ ảnh cũ: ", err); });
                }
                await db.query('UPDATE TaiKhoan SET AnhDaiDien = ?, Email = ? WHERE MaTK = ?', [newFileName, email, MaTK]);
            } 
            else if (isAvatarRemoved === 'true') {
                const sql_lay_anh_cu = 'SELECT AnhDaiDien FROM TaiKhoan WHERE MaTK = ?';
                const [result_anh_cu] = await db.query(sql_lay_anh_cu, [MaTK]);
                
                if (result_anh_cu.length > 0 && result_anh_cu[0].AnhDaiDien) {
                    const oldFileName = result_anh_cu[0].AnhDaiDien;
                    const oldFilePath = path.join(__dirname, '..', 'public', 'Images_user', oldFileName);
                    fs.unlink(oldFilePath, (err) => { if (err) console.error("Lỗi khi gỡ ảnh cũ: ", err); });
                }
                await db.query('UPDATE TaiKhoan SET AnhDaiDien = NULL, Email = ? WHERE MaTK = ?', [email, MaTK]);
            } 
            else {
                await db.query('UPDATE TaiKhoan SET Email = ? WHERE MaTK = ?', [email, MaTK]);
            }
            await db.query('UPDATE NhanVien SET TenNV = ?, DiaChi = ?, SDT = ? WHERE MaTK = ?', [TenNV, DiaChi, SDT, MaTK]);
            
            res.status(200).json({ 
                message: "Cập nhật thông tin quản trị viên thành công!", 
                newAvatarName: newFileName
            });
        }
        catch (error){
            console.error("Lỗi khi cập nhật thông tin admin: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác thông tin!"});
        }
    },
    doi_mat_khau: async(req, res) => {
        try {
            const { MaTK, MatKhauCu, MatKhauMoi } = req.body;
            const [taikhoan] = await db.query('SELECT MatKhau FROM TaiKhoan WHERE MaTK = ?', [MaTK]);
            
            if (taikhoan.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
            }

            const isMatch = await bcrypt.compare(MatKhauCu, taikhoan[0].MatKhau);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác!" });
            }

            const saltRounds = 10;
            const hashedNewPassword = await bcrypt.hash(MatKhauMoi, saltRounds);
            await db.query('UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?', [hashedNewPassword, MaTK]);

            res.status(200).json({ message: "Đổi mật khẩu thành công!" });
        }
        catch (error) {
            console.error("Lỗi khi đổi mật khẩu admin: ", error);
            res.status(500).json({ message: "Lỗi server khi đổi mật khẩu!" });
        }
    }
}
module.exports = admin_info_ctrl;