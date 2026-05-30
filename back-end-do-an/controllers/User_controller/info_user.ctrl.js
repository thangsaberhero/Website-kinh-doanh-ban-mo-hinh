const db = require('../../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const fix_user_info = {
    laythongtin: async(req, res) => {
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
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
                return res.status(404).json({ 
                    success: false,
                    message: "Không tìm thấy thông tin tài khoản!" });
            }

            res.status(200).json({
                success: true,
                message: "Lấy thông tin thành công",
                data: info[0]
            });
        }
        catch (error){
            console.error("Lỗi khi lấy dữ liệu thông tin cá nhân: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi lấy dữ liệu cá nhân!" });
        }
    },

    capnhatthongtin: async(req, res) => {
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
        
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {email, TenKH, DiaChi, SDT, isAvatarRemoved} = req.body; 
            const MaTK = req.user.id; 
            
            // 1. LẤY LINK ẢNH TỪ CLOUDINARY
            let newFileName = null;
            if (req.file) {
                newFileName = req.file.path || req.file.secure_url || req.file.url || req.file.filename;
            }

            const [check] = await connection.query(`Select Email from TaiKhoan where Email = ? and MaTK != ?`,[email, MaTK]);
            if(check.length > 0){
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Không thay đổi được do trùng Email!" });
            }

            // HÀM PHỤ TRỢ: Xóa ảnh cũ cục bộ (Bỏ qua nếu là link Cloud)
            const handleRemoveOldLocalImage = (oldFileName) => {
                if (oldFileName && oldFileName !== '' && !oldFileName.startsWith('http')) {
                    const fs = require('fs');
                    const path = require('path');
                    const oldFilePath = path.join(__dirname, '..', 'public', 'Images_user', oldFileName);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlink(oldFilePath, (err) => {
                            if (err) console.error("Lỗi khi gỡ ảnh cũ: ", err);
                        });
                    }
                }
            };

            // 2. NẾU CÓ UP ẢNH MỚI
            if (newFileName) {
                const sql_lay_anh_cu = 'SELECT AnhDaiDien FROM TaiKhoan WHERE MaTK = ?';
                const [result_anh_cu] = await connection.query(sql_lay_anh_cu, [MaTK]);
                
                if (result_anh_cu.length > 0 && result_anh_cu[0].AnhDaiDien) {
                    handleRemoveOldLocalImage(result_anh_cu[0].AnhDaiDien);
                }
                await connection.query('UPDATE TaiKhoan SET AnhDaiDien = ?, email = ? WHERE MaTK = ?', [newFileName, email, MaTK]);
            } 
            // 3. NẾU BẤM NÚT "GỠ BỎ" ẢNH
            else if (isAvatarRemoved === 'true') {
                const sql_lay_anh_cu = 'SELECT AnhDaiDien FROM TaiKhoan WHERE MaTK = ?';
                const [result_anh_cu] = await connection.query(sql_lay_anh_cu, [MaTK]);
                
                if (result_anh_cu.length > 0 && result_anh_cu[0].AnhDaiDien) {
                    handleRemoveOldLocalImage(result_anh_cu[0].AnhDaiDien);
                }
                await connection.query('UPDATE TaiKhoan SET AnhDaiDien = NULL, Email = ? WHERE MaTK = ?', [email, MaTK]);
            } 
            // 4. NẾU CHỈ ĐỔI TEXT (TÊN, ĐỊA CHỈ, SĐT)
            else {
                await connection.query('UPDATE TaiKhoan SET Email = ? WHERE MaTK = ?', [email, MaTK]);
            }

            // Đảm bảo tên bảng viết đúng chữ Hoa/Thường (KhachHang)
            await connection.query('UPDATE KhachHang SET TenKH = ?, DiaChi = ?, SDT = ? WHERE MaTK = ?', [TenKH, DiaChi, SDT, MaTK]);
            await connection.commit();
            
            res.status(200).json({ 
                success: true,
                message: "Cập nhật thông tin thành công!", 
                newAvatarName: isAvatarRemoved === 'true' ? null : (newFileName || undefined)
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi cập nhật thông tin: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác thông tin khách hàng!"});
        }
        finally{
            connection.release();
        }
    },

    doi_mat_khau: async(req, res) =>{
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
        const connection = await db.getConnection();
        try {
            const {MatKhau} = req.body;
            const MaTK = req.user.id; 
            const [check] = await connection.query('Select MatKhau from TaiKhoan where MaTK = ?',[MaTK]);
            if(check.length > 0){
                await connection.rollback();
                return res.status(404).json({ 
                    success: false,
                    message: "Không tìm thấy tài khoản!" });
            }            
            const is_match = await bcrypt.compare(MatKhau, check.MatKhau);
            if(is_match){
                await connection.rollback();
                res.status(200).json({
                    success: false,
                    message: "Mật khẩu trùng mật khẩu cũ!"});
            }

            const hash = await bcrypt.hash(MatKhauMoi, 10);
            await connection.query('UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?', [hash, MaTK]);

            await connection.commit();
            res.status(200).json({
                success: true,
                 message: "Đổi mật khẩu thành công!" });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi đổi mật khẩu: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi thao tác thông tin khách hàng!"});
        }
        finally{
            connection.release();
        }
    }
}
module.exports = fix_user_info;