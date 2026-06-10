const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Connection } = require('mysql2');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', 
    port: 2525,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const authController = {
    // 1. ĐĂNG KÝ
    preRegister: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { TenDN, email } = req.body;
            
            // Kiểm tra xem Tên đăng nhập hoặc Email đã tồn tại chưa
            const [checkUser] = await connection.query('SELECT * FROM TaiKhoan WHERE TenDN = ? or email = ?', [TenDN, email]);
            if (checkUser.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại!" });
            }

            // Tạo mã OTP ngẫu nhiên 6 số
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Gửi Email OTP
            const mailOptions = {
                from: `"FigureCollect Shop" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Mã xác thực đăng ký tài khoản (OTP)',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #333; background-color: #0c0e17; color: #fff;">
                        <h2 style="color: #ff3d00; text-align: center;">FIGURECOLLECT</h2>
                        <p>Xin chào ${TenDN},</p>
                        <p>Bạn đang thực hiện đăng ký tài khoản mới. Dưới đây là mã xác thực OTP của bạn:</p>
                        <h1 style="text-align: center; letter-spacing: 5px; color: #ff3d00; background: #222532; padding: 10px; border-radius: 8px;">${otp}</h1>
                        <p style="color: #aaa; font-size: 12px; text-align: center;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);

            // Tạo JWT chứa OTP và Email với thời hạn 5 phút (Không lưu vào DB)
            const registerToken = jwt.sign(
                { email: email, otp: otp },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );

            res.status(200).json({
                success: true,
                message: "Mã OTP đã được gửi đến email của bạn!",
                registerToken: registerToken // Trả token về cho Frontend giữ
            });
        } 
        catch (error) {
            console.error("Lỗi gửi OTP đăng ký: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi gửi OTP" });
        } 
        finally {
            connection.release();
        }
    },

    register: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { TenDN, email, MatKhau, otp, registerToken } = req.body;

            if (!registerToken || !otp) {
                return res.status(400).json({ message: "Thiếu mã xác thực!" });
            }

            // 1. Giải mã và kiểm tra hạn sử dụng của Token
            let decoded;
            try {
                decoded = jwt.verify(registerToken, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(400).json({ message: "Mã OTP đã hết hạn (quá 5 phút) hoặc không hợp lệ. Vui lòng đăng ký lại!" });
            }

            // 2. So sánh mã OTP người dùng nhập với OTP gốc trong Token
            if (decoded.email !== email || decoded.otp !== otp) {
                return res.status(400).json({ message: "Mã OTP không chính xác!" });
            }

            // 3. Nếu đúng hết, bắt đầu lưu vào Database
            await connection.beginTransaction();
            
            // (Nên check trùng lại 1 lần nữa cho an toàn tuyệt đối)
            const [checkUser] = await connection.query('SELECT * FROM TaiKhoan WHERE TenDN = ? or email = ?', [TenDN, email]);
            if (checkUser.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại!" });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(MatKhau, salt);

            // Lưu bảng TaiKhoan
            const sqltk = 'INSERT INTO TaiKhoan (TenDN, MatKhau, Email, MaQuyen) VALUES (?, ?, ?, 3)';
            const [resultTK] = await connection.query(sqltk, [TenDN, hashedPass, email]);
            const maTK = resultTK.insertId;

            // Lưu bảng KhachHang
            const sqlkh = 'INSERT INTO KhachHang (TenKH, MaTK) VALUES(?,?)';
            const [resultKH] = await connection.query(sqlkh, [TenDN, maTK]);
            const maKH = resultKH.insertId;

            // Tạo Giỏ hàng & Yêu thích
            await connection.query('INSERT INTO GioHang (MaKH) VALUES (?)', [maKH]);
            await connection.query('INSERT INTO DanhMucYeuThich (MaKH) VALUES (?)', [maKH]);

            await connection.commit();
            res.status(201).json({
                success: true,
                message: "Đăng ký tài khoản thành công!" 
            });
        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi đăng ký: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi đăng ký" });
        } 
        finally {
            connection.release();
        }
    },

    // 2. ĐĂNG NHẬP
    login: async (req, res) => {
        try {
            const { TenDN, MatKhau } = req.body;
            const sql_login = `
                SELECT tk.*, 
                    kh.MaKH, kh.TenKH,
                    nv.MaNV, nv.TenNV,
                    tk.MaQuyen
                FROM TaiKhoan tk
                LEFT JOIN KhachHang kh ON tk.MaTK = kh.MaTK
                LEFT JOIN NhanVien nv ON tk.MaTK = nv.MaTK
                WHERE tk.TenDN = ?
            `;
            const [users] = await db.query(sql_login, [TenDN]);
            
            if (users.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: "Tài khoản không tồn tại!" });
            }

            if (users.Bi_khoa === 1) {
            return res.status(403).json({ 
                success: false,
                message: "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ hỗ trợ." });
        }

            const user = users[0];

            // So sánh mật khẩu khách nhập với mật khẩu đã mã hóa trong DB
            const validPass = await bcrypt.compare(MatKhau, user.MatKhau);
            if (!validPass) {
                return res.status(401).json({ 
                    success: false,
                    message: "Mật khẩu không chính xác!" });
            }

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await db.query(`UPDATE TaiKhoan SET DangNhapCuoi = NOW(), IPDangNhap = ? WHERE MaTK = ?`, [userIp, user.MaTK]);

            // Tạo vé thông hành (Token) có hạn 1 ngày
            const token = jwt.sign(
                { 
                    id: user.MaTK, 
                    role: user.MaQuyen,
                    avatar: user.AnhDaiDien 
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            delete user.MatKhau;
            delete user.ResetOTP;
            delete user.OTPExpires;

            // Gửi token và thông tin cơ bản về cho Frontend
            res.status(200).json({ 
                success: true,
                message: "Đăng nhập thành công!",
                token: token,
                user: user
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi đăng nhập" });
        }
    },

    // 1. API: Yêu cầu gửi OTP (Quên mật khẩu)
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            // Kiểm tra email có tồn tại không
            const [users] = await db.query('SELECT * FROM TaiKhoan WHERE Email = ?', [email]);
            if (users.length === 0) {
                // Trả về thông báo ẩn danh để bảo mật hệ thống, tránh bị dò quét email
                return res.status(200).json({ success: true, message: "Nếu email tồn tại, OTP sẽ được gửi." });
            }

            const user = users[0];
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Gửi Email chứa OTP
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

            // Gói thông tin email và mã OTP vào Token tạm thời thời hạn 5 phút
            const forgotToken = jwt.sign(
                { email: email, otp: otp },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );

            res.status(200).json({ 
                success: true,
                message: "OTP đã được gửi thành công!",
                forgotToken: forgotToken // Frontend nhận và lưu lại chuỗi mã hóa này
            });
        } 
        catch (error) {
            console.error("Lỗi gửi OTP quên mật khẩu:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi gửi OTP" });
        }
    },

    // 2. API: Xác thực mã OTP
    verifyOTP: async (req, res) => {
        try {
            const { email, otp, forgotToken } = req.body;

            if (!forgotToken || !otp) {
                return res.status(400).json({ success: false, message: "Thiếu thông tin xác thực mã!" });
            }

            // 1. Giải mã kiểm tra tính hợp lệ và thời hạn của Token mã hóa
            let decoded;
            try {
                decoded = jwt.verify(forgotToken, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Mã OTP đã hết hạn (quá 5 phút). Vui lòng gửi lại yêu cầu!" });
            }

            // 2. Đối chiếu Email và OTP khách nhập với thông tin giải mã từ Token
            if (decoded.email !== email || decoded.otp !== otp) {
                return res.status(400).json({ success: false, message: "Mã OTP không chính xác!" });
            }

            // 3. OTP đúng -> Ký một Token chứng nhận đã xác thực thành công (hạn 5 phút) giao cho khách chuyển sang màn hình đổi Pass
            const resetToken = jwt.sign(
                { email: email, isVerified: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );

            res.status(200).json({ 
                success: true,
                message: "Xác thực OTP thành công!",
                resetToken: resetToken 
            });
        } 
        catch (error) {
            console.error("Lỗi xác thực OTP:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi xác thực OTP" });
        }
    },

    // 3. API: Thiết lập mật khẩu mới
    resetPassword: async (req, res) => {
        try {
            const { email, resetToken, newPassword } = req.body;

            if (!resetToken) {
                return res.status(400).json({ success: false, message: "Phiên làm việc không hợp lệ!" });
            }

            // 1. Xác thực Token chứng nhận đổi pass xem còn hạn hay không
            let decoded;
            try {
                decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(400).json({ success: false, message: "Phiên xác thực đổi mật khẩu đã hết hạn. Vui lòng xác thực lại OTP!" });
            }

            // 2. Kiểm tra tính chính danh của Token quyền đổi pass
            if (decoded.email !== email || !decoded.isVerified) {
                return res.status(400).json({ success: false, message: "Yêu cầu thay đổi mật khẩu bị từ chối!" });
            }

            // 3. Mã hóa mật khẩu mới và cập nhật duy nhất trường mật khẩu trong DB
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(newPassword, salt);

            await db.query(
                'UPDATE TaiKhoan SET MatKhau = ? WHERE Email = ?', 
                [hashedPass, email]
            );

            res.status(200).json({ success: true, message: "Đổi mật khẩu tài khoản thành công!" });
        } 
        catch (error) {
            console.error("Lỗi cập nhật mật khẩu mới:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi đổi mật khẩu" });
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
    },
    googleLogin: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { token } = req.body;
            
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
            const payload = await response.json();

            if (!response.ok) {
                return res.status(400).json({ success: false, message: "Token Google không hợp lệ!" });
            }

            const { email, name } = payload;
            let targetMaTK;

            await connection.beginTransaction();
            const [users] = await connection.query('SELECT * FROM TaiKhoan WHERE Email = ?', [email]);
            
            if (users.length > 0) {
                targetMaTK = users[0].MaTK; // Đã có tài khoản
            } 
            else {
                const TenDN = email.split('@')[0] + Math.floor(Math.random() * 1000); 
                const randomPass = Math.random().toString(36).slice(-10); 
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(randomPass, salt);

                const sqltk = 'INSERT INTO TaiKhoan (TenDN, MatKhau, Email, MaQuyen) VALUES (?, ?, ?, 3)';
                const [resultTK] = await connection.query(sqltk, [TenDN, hashedPass, email]);
                targetMaTK = resultTK.insertId;

                const sqlkh = 'INSERT INTO KhachHang (TenKH, MaTK) VALUES(?,?)';
                const [resultKH] = await connection.query(sqlkh, [name, targetMaTK]);
                const maKH = resultKH.insertId;

                await connection.query('INSERT INTO GioHang (MaKH) VALUES (?)', [maKH]);
                await connection.query('INSERT INTO DanhMucYeuThich (MaKH) VALUES (?)', [maKH]);
            }

            const sql_login = `
                SELECT tk.*, 
                    kh.MaKH, kh.TenKH,
                    nv.MaNV, nv.TenNV,
                    tk.MaQuyen
                FROM TaiKhoan tk
                LEFT JOIN KhachHang kh ON tk.MaTK = kh.MaTK
                LEFT JOIN NhanVien nv ON tk.MaTK = nv.MaTK
                WHERE tk.MaTK = ?
            `;
            const [fullUsers] = await connection.query(sql_login, [targetMaTK]);
            const fullUser = fullUsers[0];

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await connection.query(`UPDATE TaiKhoan SET DangNhapCuoi = NOW(), IPDangNhap = ? WHERE MaTK = ?`, [userIp, targetMaTK]);

            await connection.commit();

            const appToken = jwt.sign(
                { id: fullUser.MaTK, role: fullUser.MaQuyen, avatar: fullUser.AnhDaiDien },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            delete fullUser.MatKhau;
            delete fullUser.ResetOTP;
            delete fullUser.OTPExpires;

            fullUser.isSocialAuth = true;

            res.status(200).json({
                success: true,
                message: "Đăng nhập Google thành công!",
                token: appToken,
                user: fullUser
            });
        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi Google Login:", error);
            res.status(500).json({ success: false, message: "Lỗi xác thực Google" });
        } 
        finally {
            connection.release();
        }
    },

    facebookLogin: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { accessToken } = req.body;

            const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
            const data = await response.json(); 
            const { email, name, id } = data;

            if (!response.ok) {
                return res.status(400).json({ success: false, message: "Token Facebook không hợp lệ!" });
            }
            if (!email) {
                return res.status(400).json({ success: false, message: "Tài khoản Facebook chưa liên kết Email!" });
            }

            let targetMaTK;

            await connection.beginTransaction();
            const [users] = await connection.query('SELECT * FROM TaiKhoan WHERE Email = ?', [email]);
            
            if (users.length > 0) {
                targetMaTK = users[0].MaTK;
            } 
            else {
                const TenDN = email.split('@')[0] + Math.floor(Math.random() * 1000);
                const randomPass = Math.random().toString(36).slice(-10);
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(randomPass, salt);

                const [resultTK] = await connection.query('INSERT INTO TaiKhoan (TenDN, MatKhau, Email, MaQuyen) VALUES (?, ?, ?, 3)', [TenDN, hashedPass, email]);
                targetMaTK = resultTK.insertId;

                const [resultKH] = await connection.query('INSERT INTO KhachHang (TenKH, MaTK) VALUES(?,?)', [name, targetMaTK]);
                const maKH = resultKH.insertId;

                await connection.query('INSERT INTO GioHang (MaKH) VALUES (?)', [maKH]);
                await connection.query('INSERT INTO DanhMucYeuThich (MaKH) VALUES (?)', [maKH]);
            }

            // LẤY ĐẦY ĐỦ THÔNG TIN USER 
            const sql_login = `
                SELECT tk.*, kh.MaKH, kh.TenKH, nv.MaNV, nv.TenNV, tk.MaQuyen
                FROM TaiKhoan tk
                LEFT JOIN KhachHang kh ON tk.MaTK = kh.MaTK
                LEFT JOIN NhanVien nv ON tk.MaTK = nv.MaTK
                WHERE tk.MaTK = ?
            `;
            const [fullUsers] = await connection.query(sql_login, [targetMaTK]);
            const fullUser = fullUsers[0];

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            await connection.query(`UPDATE TaiKhoan SET DangNhapCuoi = NOW(), IPDangNhap = ? WHERE MaTK = ?`, [userIp, targetMaTK]);

            await connection.commit();

            const appToken = jwt.sign({ id: fullUser.MaTK, role: fullUser.MaQuyen, avatar: fullUser.AnhDaiDien }, process.env.JWT_SECRET, { expiresIn: '1d' });

            delete fullUser.MatKhau;
            delete fullUser.ResetOTP;
            delete fullUser.OTPExpires;

            fullUser.isSocialAuth = true;

            res.status(200).json({ success: true, message: "Đăng nhập Facebook thành công!", token: appToken, user: fullUser });
        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi Facebook Login:", error);
            res.status(500).json({ success: false, message: "Lỗi xác thực Facebook" });
        } 
        finally {
            connection.release();
        }
    }
};

module.exports = authController;