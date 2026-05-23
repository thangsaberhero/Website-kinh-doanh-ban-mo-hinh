const db = require('../../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const fix_user_info = {
    laythongtin: async(req, res) => {
        try {
            const MaTK = req.user.id; 

            const sql = `SELECT tk.*, kh.TenKH, kh.DiaChi,kh.SDT,
                    (SELECT COUNT(DISTINCT ct.MaPhanLoai) FROM DonHang dh JOIN ChiTietDonHang ct ON dh.MaDH = ct.MaDH WHERE dh.MaKH = kh.MaKH AND dh.TrangThaiThanhToan != 'Đã hủy') AS SoFigureDaMua,
                    (SELECT COUNT(dg.MaDG) FROM DanhGia dg WHERE dg.MaKH = kh.MaKH AND dg.TrangThai = 1) AS SoDanhGia
                    FROM TaiKhoan tk 
                    INNER JOIN KhachHang kh ON tk.MaTK = kh.MaTK 
                    WHERE tk.MaTK = ?`;
            
            const [info] = await db.query(sql, [MaTK]);

            if (info.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy thông tin tài khoản!" });
            }

            res.status(200).json({
                message: "Lấy thông tin thành công",
                data: info[0]
            });
        }
        catch (error){
            console.error("Lỗi khi lấy dữ liệu thông tin cá nhân: ", error);
            res.status(500).json({ message: "Lỗi server khi lấy dữ liệu cá nhân!" });
        }
    },

    capnhatthongtin: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {email, TenKH, DiaChi, SDT} = req.body;
            const MaTK = req.user.id; 
            const newFileName = req.file ? req.file.filename : null; 

            if (newFileName) {
                const sql_lay_anh_cu = 'SELECT AnhDaiDien FROM TaiKhoan WHERE MaTK = ?';
                const [result_anh_cu] = await connection.query(sql_lay_anh_cu, [MaTK]);
                
                if (result_anh_cu.length > 0 && result_anh_cu[0].AnhDaiDien) {
                    const oldFileName = result_anh_cu[0].AnhDaiDien;
                    if (oldFileName && oldFileName !== '') {
                      const oldFilePath = path.join(__dirname, '..', 'public', 'Images_user', oldFileName);
                      fs.unlink(oldFilePath, (err) => {
                          if (err) console.error("Lỗi khi gỡ ảnh cũ: ", err);
                          else console.log(`Đã gỡ ảnh cũ thành công: ${oldFileName}`);
                      });
                    }
                }
                
                await connection.query('UPDATE TaiKhoan SET AnhDaiDien = ?, email = ? WHERE MaTK = ?', [newFileName, email, MaTK]);
            } else {
                await connection.query('UPDATE TaiKhoan SET Email = ? WHERE MaTK = ?', [email, MaTK]);
            }

            await connection.query('UPDATE khachhang SET TenKH = ?, DiaChi = ?, SDT = ? WHERE MaTK = ?', [TenKH, DiaChi, SDT, MaTK]);
            await connection.commit();
            // 3. ĐÃ BỔ SUNG TRẢ VỀ TÊN ẢNH MỚI CHO FRONTEND
            res.status(200).json({ 
                message: "Cập nhật thông tin thành công!", 
                newAvatarName: isAvatarRemoved === 'true' ? null : (newFileName || undefined)
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi cập nhật thông tin: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác thông tin khách hàng!"});
        }
        finally{
            connection.release();
        }
    },

    doi_mat_khau: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            const {MatKhau} = req.body;
            const MaTK = req.user.id; 
            const [check] = await connection.query('Select MatKhau from TaiKhoan where MaTK = ?',[MaTK]);
            const is_match = await bcrypt.compare(MatKhau, check.MatKhau);
            if(is_match){
                await connection.rollback();
                res.status(200).json({message: "Sai dữ liệu!"});
            }

            const hash = await bcrypt.hash(MatKhauMoi, 10);
            await db.query('UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?', [hash, MaTK]);

            res.status(200).json({ message: "Đổi mật khẩu thành công!" });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi đổi mật khẩu: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác thông tin khách hàng!"});
        }
        finally{
            connection.release();
        }
    }
}
module.exports = fix_user_info;