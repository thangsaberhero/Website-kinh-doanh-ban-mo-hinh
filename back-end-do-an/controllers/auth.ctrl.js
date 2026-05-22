const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const authController = {
    // 1. ĐĂNG KÝ
    register: async (req, res) => {
        try {
            const { TenDN, email, MatKhau} = req.body;

            // Kiểm tra xem Tên đăng nhập đã tồn tại chưa
            const [checkUser] = await db.query('SELECT * FROM TaiKhoan WHERE TenDN = ?', [TenDN]);
            if (checkUser.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(MatKhau, salt);

            // Lưu vào Database (MaQuyen = 3 là Khách hàng bình thường)
            const sqltk = 'INSERT INTO TaiKhoan (TenDN, MatKhau, Email, MaQuyen) VALUES (?, ?, ?, 3)';
            const [resultTK] = await db.query(sqltk, [TenDN, hashedPass, email]);
            
            const maTK = resultTK.insertId;

            const sqlkh = 'INSERT INTO KhachHang (TenKH, MaTK) VALUES(?,?)';
            const [resultKH] = await db.query(sqlkh, [TenDN,maTK]);

            const maKH = resultKH.insertId;

            const sql_giohang = 'INSERT INTO GioHang (MaKH) VALUES (?)';
            await db.query(sql_giohang, [maKH]);

            const sql_danhmucyeuthich = `Insert into DanhMucYeuThich (MaKH) Values (?)`;
            await db.query(sql_danhmucyeuthich, [maKH]);

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
            const sql_login = `
                SELECT tk.*, 
                    kh.MaKH, kh.TenKH,
                    nv.MaNV, nv.TenNV
                FROM TaiKhoan tk
                LEFT JOIN khachhang kh ON tk.MaTK = kh.MaTK
                LEFT JOIN NhanVien nv ON tk.MaTK = nv.MaTK
                WHERE tk.TenDN = ?
            `;
            const [users] = await db.query(sql_login, [TenDN]);
            
            if (users.length === 0) {
                return res.status(404).json({ message: "Tài khoản không tồn tại!" });
            }

            const user = users[0];

            // So sánh mật khẩu khách nhập với mật khẩu đã mã hóa trong DB
            const validPass = await bcrypt.compare(MatKhau, user.MatKhau);
            if (!validPass) {
                return res.status(401).json({ message: "Mật khẩu không chính xác!" });
            }

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await db.query(`UPDATE TaiKhoan SET DangNhapCuoi = NOW(), IPDangNhap = ? WHERE MaTK = ?`, [userIp, user.MaTK]);

            // Tạo vé thông hành (Token) có hạn 1 ngày
            const token = jwt.sign(
                { 
                    id: user.MaTK, 
                    role: user.MaQuyen 
                }, 
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
                    email: user.Email,
                    MaKH: user.MaKH,
                    role: user.MaQuyen,
                    HoTen: user.TenKH || user.TenNV || 'Người dùng hệ thống',
                    MaKH: user.MaKH || null,
                    MaNV: user.MaNV || null
                    AnhDaiDien: user.AnhDaiDien
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server khi đăng nhập" });
        }
    },

    // 1. API: Yêu cầu gửi OTP (Quên mật khẩu)
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            // Kiểm tra email có tồn tại không
            const [users] = await db.query('SELECT * FROM TaiKhoan WHERE Email = ?', [email]);
            if (users.length === 0) {
                // Trả về lỗi ẩn danh để bảo mật
                return res.status(200).json({ message: "Nếu email tồn tại, OTP sẽ được gửi." });
            }

            const user = users[0];
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 5 * 60 * 1000);

            // Lưu OTP vào DB
            await db.query('UPDATE TaiKhoan SET ResetOTP = ?, OTPExpires = ? WHERE MaTK = ?', [otp, expires, user.MaTK]);

            // Gửi Email
            const mailOptions = {
                from: `"FigureCollect Shop" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Mã xác thực khôi phục mật khẩu (OTP)',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #333; background-color: #0c0e17; color: #fff;">
                        <h2 style="color: #ff3d00; text-align: center;">FIGURECOLLECT</h2>
                        <p>Xin chào ${user.TenDN},</p>
                        <p>Bạn vừa yêu cầu khôi phục mật khẩu. Dưới đây là mã xác thực OTP của bạn:</p>
                        <h1 style="text-align: center; letter-spacing: 5px; color: #ff3d00; background: #222532; padding: 10px; border-radius: 8px;">${otp}</h1>
                        <p style="color: #aaa; font-size: 12px; text-align: center;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: "OTP đã được gửi thành công!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi máy chủ khi gửi OTP" });
        }
    },
    // 2. API: Xác thực OTP
    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;

            const [users] = await db.query('SELECT * FROM TaiKhoan WHERE Email = ? AND ResetOTP = ?', [email, otp]);
            
            if (users.length === 0) {
                return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc sai email!" });
            }

            const user = users[0];

            // Kiểm tra xem OTP đã quá hạn 5 phút chưa
            if (new Date() > new Date(user.OTPExpires)) {
                return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng gửi lại yêu cầu!" });
            }

            res.status(200).json({ message: "Xác thực OTP thành công!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi máy chủ khi xác thực OTP" });
        }
    },

    // 3. API: Đổi mật khẩu mới
    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;

            // Kiểm tra lại lần cuối để đảm bảo an toàn tuyệt đối
            const [users] = await db.query('SELECT * FROM TaiKhoan WHERE Email = ? AND ResetOTP = ?', [email, otp]);
            
            if (users.length === 0 || new Date() > new Date(users[0].OTPExpires)) {
                return res.status(400).json({ message: "Phiên xác thực không hợp lệ. Vui lòng thử lại!" });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(newPassword, salt);

            // Cập nhật pass mới và XÓA SẠCH mã OTP đi (để không bị dùng lại)
            await db.query(
                'UPDATE TaiKhoan SET MatKhau = ?, ResetOTP = NULL, OTPExpires = NULL WHERE Email = ?', 
                [hashedPass, email]
            );

            res.status(200).json({ message: "Đổi mật khẩu thành công!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi máy chủ khi đổi mật khẩu" });
        }
    },
    // 4. Đổi mật khẩu bình thường
    change_password: async (req, res) => {
        try {
            const maTK = req.user.id; 
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            // 1. Lấy thông tin mật khẩu hiện tại từ DB
            const sql_get_user = `SELECT MatKhau FROM TaiKhoan WHERE MaTK = ?`;
            const [users] = await db.query(sql_get_user, [maTK]);

            if (users.length === 0) {
                return res.status(404).json({ success: false, message: "Tài khoản không tồn tại!" });
            }

            const user = users[0];

            // 2. Kiểm tra mật khẩu cũ xem có khớp không
            const validPass = await bcrypt.compare(currentPassword, user.MatKhau);
            if (!validPass) {
                return res.status(401).json({ success: false, message: "Mật khẩu hiện tại không chính xác!" });
            }

            // 3. Mã hóa (Hash) mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            // 4. Cập nhật mật khẩu mới vào DB
            const sql_update = `UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?`;
            await db.query(sql_update, [hashedNewPassword, maTK]);

            res.status(200).json({ 
                success: true, 
                message: "Đổi mật khẩu thành công!" 
            });

        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác!" });
        }
    }
};

module.exports = authController;