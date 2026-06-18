const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Chức năng tự huỷ đơn
const cron = require('node-cron');
const db = require('./config/db');

// Middlewares
app.use(cors());
app.use(express.json());

// Khởi động Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Import Route Auth
const authRoutes = require('./routes/auth.route.js');

// Sử dụng Route Auth
app.use('/api/auth', authRoutes);

// Thay đổi thông tin khách hàng
const user_info = require('./routes/User_route/info_user.route.js');
app.use('/api/info_user', user_info);       

//Lấy thông tin sản phẩm và danh mục sản phẩm
const productsRoutes = require('./routes/User_route/products.route.js');
app.use('/api/products', productsRoutes);

//Thêm đơn hàng
const donhangRoutes = require('./routes/User_route/donhang_user.route.js');
app.use('/api/don_hang',donhangRoutes);

const userReviewRoutes = require('./routes/User_route/review.route.js');
app.use('/api/reviews', userReviewRoutes);

const userContactRoutes = require('./routes/User_route/contact.route.js');
app.use('/api/contact', userContactRoutes);

//Lấy đường dẫn ảnh đại diện
const path = require('path');
app.use('/Images_user', express.static(path.join(__dirname, 'public/Images_user')));
app.use('/Images_news', express.static(path.join(__dirname, 'public/Images_news')));
app.use('/Images_review', express.static(path.join(__dirname, 'public/Images_review')));
app.use('/Images_product', express.static(path.join(__dirname, 'public/Images_product')));
app.use('/Images_brand', express.static(path.join(__dirname, 'public/Images_brand')));

const chatRoutes = require('./routes/User_route/chat.route.js');
app.use('/api/chatbot', chatRoutes);

const blockchainRoutes = require('./routes/User_route/blockchain.route.js');
app.use('/api/blockchain', blockchainRoutes);

// =========================================================
// CRON JOB: TỰ ĐỘNG HỦY ĐƠN VÀ NHẢ KHO
// =========================================================
cron.schedule('* * * * *', async () => {
    const connection = await db.getConnection();

    try {
        // 1. TÌM ĐƠN HÀNG: Lấy thêm MaTK để biết đơn này của ai
        const sql_tim_don = `
            SELECT dh.MaDH, kh.TenKH, kh.MaTK 
            FROM DonHang dh
            INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
            WHERE dh.TrangThaiThanhToan = 'Chưa Thanh Toán' 
            AND TIMESTAMPDIFF(MINUTE, dh.NgayLapDon, NOW()) >= 15
            AND dh.MaDH NOT IN (
                SELECT MaDH FROM ThanhToan WHERE MaPT = 3
            )
        `;
        const [don_qua_han] = await connection.query(sql_tim_don);

        if (don_qua_han.length > 0) {
            console.log(`[CRON] Phát hiện ${don_qua_han.length} đơn hàng quá hạn. Bắt đầu hủy...`);

            for (let don of don_qua_han) {
                const maDH = don.MaDH;
                const maTK = don.MaTK; // Lấy Mã Tài Khoản
                
                await connection.beginTransaction(); 

                try {
                    await connection.query(
                        `UPDATE DonHang 
                         SET TrangThaiThanhToan = 'Đã hủy', 
                             Note = CONCAT(IFNULL(Note, ''), '\n[Hệ thống] Hủy tự động do quá 15 phút không thanh toán.') 
                         WHERE MaDH = ?`, [maDH]
                    );

                    await connection.query(`INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 5, NOW())`, [maDH]);

                    const sql_hoan_kho = `
                        UPDATE PhanLoai pl
                        INNER JOIN ChiTietDonHang ct ON pl.MaPhanLoai = ct.MaPhanLoai
                        SET pl.SoLuong = pl.SoLuong + ct.SoLuong
                        WHERE ct.MaDH = ?
                    `;
                    await connection.query(sql_hoan_kho, [maDH]);
                    
                    await connection.query(`
                        UPDATE ChiTietKhuyenMai ctkm
                        INNER JOIN ChiTietDonHang ctdh ON ctkm.MaPhanLoai = ctdh.MaPhanLoai
                        SET ctkm.SoLuongDaDung = ctkm.SoLuongDaDung - ctdh.SoLuong
                        WHERE ctdh.MaDH = ? AND ctdh.LaHangKhuyenMai = 1
                    `, [maDH]);
                    await connection.query(`DELETE FROM LogSuDungKhuyenMai WHERE MaDH = ?`, [maDH]);

                    await connection.query(`
                        UPDATE MaGiamGia mg
                        INNER JOIN LogSuDungMaGiamGia log ON log.MaGG = mg.MaGG
                        SET mg.SoLuongDaDung = mg.SoLuongDaDung - 1 
                        WHERE log.MaDH = ?
                    `, [maDH]);
                    await connection.query(`DELETE FROM LogSuDungMaGiamGia WHERE MaDH = ?`, [maDH]);

                    //  LOGIC CHỐNG SPAM
                    if (maTK) {
                        // Đếm số đơn bị hệ thống hủy của tài khoản này trong ngày hôm nay
                        const sql_count_spam = `
                            SELECT COUNT(*) as SpamCount 
                            FROM DonHang dh
                            INNER JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                            WHERE kh.MaTK = ? 
                              AND dh.TrangThaiThanhToan = 'Đã hủy'
                              AND dh.Note LIKE '%[Hệ thống] Hủy tự động do quá 15 phút%'
                              AND DATE(dh.NgayLapDon) = CURDATE()
                        `;
                        const [spamResult] = await connection.query(sql_count_spam, [maTK]);
                        const spamCount = spamResult[0].SpamCount;

                        // Nếu cố tình spam >= 3 đơn trong 1 ngày -> Khóa tài khoản
                        if (spamCount >= 3) {
                            await connection.query(`UPDATE TaiKhoan SET Bi_khoa = 1 WHERE MaTK = ?`, [maTK]);
                            // console.log(`🚨 [BẢO MẬT] Đã KHÓA tài khoản MaTK: ${maTK} do spam ${spamCount} đơn hàng ảo!`);
                            
                            await connection.query(`
                                INSERT INTO ThongBaoAdmin (TieuDe, NoiDung, LoaiThongBao, DuongDan) 
                                VALUES (?, ?, ?, ?)
                            `, [
                                "Cảnh báo bảo mật: Khóa tài khoản Spam", 
                                `Hệ thống vừa tự động KHÓA tài khoản của khách hàng "${tenKH}" do phát hiện hành vi cố tình tạo ${spamCount} đơn hàng ảo.`, 
                                "HeThong", 
                                `/admin/users?userId=${maTK}`
                            ]);
                        }
                    }
                    // ==========================================

                    await connection.commit();
                    console.log(`✅ Đã tự động hủy thành công đơn FC-${maDH} và hoàn lại kho.`);

                } catch (err_don_hang) {
                    await connection.rollback();
                    console.error(`⚠️ Lỗi khi hủy đơn FC-${maDH}:`, err_don_hang);
                }
            }
        }
    } catch (error) {
        console.error("⚠️ [CRON] Lỗi truy vấn tổng thể:", error);
    } finally {
        connection.release();
    }
});

//==========================================
//===== Nhánh luồng xử lý của admin:
//==========================================
//Lấy thông tin upload ảnh
const uploadRoutes = require('./routes/Admin_route/upload.route.js');
app.use('/api/upload', uploadRoutes);

//Lấy thông tin tin tức
const newsRoutes = require('./routes/Admin_route/news.route.js');
app.use('/api/news', newsRoutes);

//Chương trình khuyến mãi
const khuyenmai_control = require('./routes/Admin_route/khuyen_mai.route.js');
app.use('/api/khuyen_mai_admin',khuyenmai_control);

//Quản lý tài khoản
const account_admin_control = require('./routes/Admin_route/account_admin.route.js');
app.use('/api/account_admin', account_admin_control);

//Quản lý đơn hàng
const don_hang_admin_control = require('./routes/Admin_route/donhang_admin.route.js');
app.use('/api/invoice_admin', don_hang_admin_control);

//Quản lý kho
const product_admin_control = require('./routes/Admin_route/product_admin.route.js');
app.use('/api/product_admin', product_admin_control);

const adminReviewRoutes = require('./routes/Admin_route/review.route.js');
app.use('/api/reviews/admin', adminReviewRoutes);

const adminContactRoutes = require('./routes/Admin_route/contact.route.js');
app.use('/api/contact/admin', adminContactRoutes);

const adminInfoRouter = require('./routes/Admin_route/admin_info.route');
app.use('/api/admin_info', adminInfoRouter);

const thongkeRouter = require('./routes/Admin_route/thongke.route.js'); 
app.use('/api/thongke', thongkeRouter);

const thongbaoRouter = require('./routes/Admin_route/thongbao.route.js'); 
app.use('/api/thong_bao_admin', thongbaoRouter);

const setting_route = require('./routes/Admin_route/setting.route.js');
app.use('/api/setting/admin', setting_route);