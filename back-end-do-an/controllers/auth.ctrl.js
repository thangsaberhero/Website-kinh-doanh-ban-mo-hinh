const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // 1. ĐĂNG KÝ
    register: async (req, res) => {
        try {
            const { TenDN, MatKhau} = req.body;

            // Kiểm tra xem Tên đăng nhập đã tồn tại chưa
            const [checkUser] = await db.query('SELECT * FROM TaiKhoan WHERE TenDN = ?', [TenDN]);
            if (checkUser.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(MatKhau, salt);

            // Lưu vào Database (Giả sử MaQuyen = 3 là Khách hàng bình thường)
            const sqltk = 'INSERT INTO TaiKhoan (TenDN, MatKhau, MaQuyen) VALUES (?, ?, 3)';
            const [resultTK] = await db.query(sqltk, [TenDN, hashedPass]);
            
            const maTK = resultTK.insertId;

            const sqlkh = 'INSERT INTO KhanhHang (TenKH, MaKH) VALUES(?,?)';
            const [resulKH] = await db.query(sqlkh, [TenDN,maTK]);

            const maKH = resultKH.insertId;

            const sql_giohang = 'INSERT INTO GioHang (MaKH) VALUES (?)'
            const [result_giohang] = await db.query(sql_giohang, [maKH]);

            res.status(201).json({ message: "Đăng ký thành công!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server khi đăng ký" });
        }
    },

    // 2. ĐĂNG NHẬP
    login: async (req, res) => {
        try {
            const { TenDN, MatKhau } = req.body;

            // Tìm user trong CSDL
            const [users] = await db.query('SELECT * FROM TaiKhoan WHERE TenDN = ?', [TenDN]);
            if (users.length === 0) {
                return res.status(404).json({ message: "Tài khoản không tồn tại!" });
            }

            const user = users[0];

            // So sánh mật khẩu khách nhập với mật khẩu đã mã hóa trong DB
            const validPass = await bcrypt.compare(MatKhau, user.MatKhau);
            if (!validPass) {
                return res.status(401).json({ message: "Mật khẩu không chính xác!" });
            }

            // Tạo vé thông hành (Token) có hạn 1 ngày
            const token = jwt.sign(
                { id: user.MaTK, role: user.MaQuyen }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            // Gửi token và thông tin cơ bản về cho Frontend
            res.status(200).json({ 
                message: "Đăng nhập thành công!",
                token: token,
                user: {
                    id: user.MaTK,
                    username: user.TenDN,
                    email: user.Email
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server khi đăng nhập" });
        }
    }
};

module.exports = authController;