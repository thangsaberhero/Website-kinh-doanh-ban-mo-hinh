const db = require('../../config/db');
const nodemailer = require('nodemailer');

const contactController = {
    getAllContactsAdmin: async (req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.max(parseInt(req.query.limit) || 5, 5);
            const offset = (page - 1) * limit;
            
            const search = req.query.search || '';
            const status = req.query.status || 'all';

            let whereConditions = ["1=1"];
            let params = [];

            if (search) {
                whereConditions.push("(lh.HoTen LIKE ? OR lh.Email LIKE ? OR lh.SDT LIKE ? OR lh.NoiDung LIKE ?)");
                params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (status === 'pending') {
                whereConditions.push("lh.TrangThai = 0");
            } else if (status === 'resolved') {
                whereConditions.push("lh.TrangThai = 1");
            }

            const whereClause = whereConditions.join(" AND ");
            const countSql = `SELECT COUNT(*) as total FROM LienHe lh WHERE ${whereClause}`;
            const [countResult] = await db.query(countSql, params);
            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            const sql = `SELECT lh.*, nv.TenNV as TenNV_XuLy 
                        FROM LienHe lh
                        LEFT JOIN NhanVien nv ON lh.MaNV_XuLy = nv.MaNV
                        WHERE ${whereClause}
                        ORDER BY lh.NgayGui DESC
                        LIMIT ? OFFSET ?`;
            
            const [result] = await db.query(sql, [...params, limit, offset]);

            const statsSql = `SELECT COUNT(*) as totalContacts,
                            SUM(CASE WHEN TrangThai = 0 THEN 1 ELSE 0 END) as pendingContacts,
                            SUM(CASE WHEN TrangThai = 1 THEN 1 ELSE 0 END) as resolvedContacts
                            FROM LienHe`;
            const [statsResult] = await db.query(statsSql);
            const contactStats = statsResult[0];

            res.status(200).json({
                success: true,
                data: result,
                pagination: { totalPages, currentPage: page, totalItems, limit },
                stats: contactStats 
            });
        } catch (error) {
            console.error("Lỗi API getAllContactsAdmin:", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi máy chủ khi lấy tin nhắn liên hệ", 
                error: error.message 
            });
        }
    },

    replyContact: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaLH } = req.params;
            const { replyContent } = req.body;

            if (!req.user) return res.status(401).json({ message: "Thiếu Token" });
            const MaTK = req.user.id || req.user.MaTK;

            const [contactObj] = await connection.query('SELECT * FROM LienHe WHERE MaLH = ?', [MaLH]);
            if (contactObj.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy liên hệ" });
            }
            const contact = contactObj[0];

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, 
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"FigureCollect Support" <${process.env.EMAIL_USER}>`,
                to: contact.Email,
                subject: 'Phản hồi từ hệ thống chăm sóc khách hàng FigureCollect',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h3 style="color: #ff3d00;">Chào ${contact.HoTen},</h3>
                        <p>Cảm ơn bạn đã liên hệ với hệ thống FigureCollect với nội dung:</p>
                        <blockquote style="border-left: 4px solid #ff8f73; padding-left: 10px; background: #f9f9f9; padding: 10px; font-style: italic;">
                            ${contact.NoiDung}
                        </blockquote>
                        <p><b>Phản hồi từ đội ngũ hỗ trợ:</b></p>
                        <p style="background: #fff3f0; padding: 15px; border-radius: 8px;">
                            ${replyContent.replace(/\n/g, '<br>')}
                        </p>
                        <br>
                        <p>Trân trọng,<br><b>Đội ngũ FigureCollect</b></p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);

            const [nv] = await connection.query('SELECT MaNV FROM NhanVien WHERE MaTK = ?', [MaTK]);
            const MaNV = nv.length > 0 ? nv[0].MaNV : null;

            const sql = `UPDATE LienHe SET TrangThai = 1, MaNV_XuLy = ?, NgayXuLy = NOW(), PhanHoiShop = ? WHERE MaLH = ?`;
            await connection.query(sql, [MaNV, replyContent, MaLH]);
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            const noiDungLog = `Trả lời liên hệ #${MaLH} của khách hàng "${contact.HoTen}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'CONTACT', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            await connection.commit();
            res.status(200).json({ 
                success: true,
                message: "Đã gửi email và lưu hệ thống" 
            });
        } catch (error) {
            await connection.rollback();
            console.error("Lỗi gửi email: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi khi gửi email", 
                error: error.message 
            });
        }
        finally{
            connection.release();
        }
    }
};

module.exports = contactController;