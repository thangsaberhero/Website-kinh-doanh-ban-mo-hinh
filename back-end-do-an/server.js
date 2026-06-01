const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Chức năng tự huỷ đơn
const cron = require('node-cron');
const db = require('./config/db');

// Middlewares
app.use(cors());
app.use(express.json()); // Giúp server đọc được dữ liệu JSON gửi lên

// Khởi động Server
const port = process.env.PORT || 3000; 
// Code của bạn...
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
// Cấp quyền cho trình duyệt được phép truy cập vào thư mục public/Images_user
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
        // 1. Tìm đơn hàng: Trạng thái 'Chưa Thanh Toán', quá 15 phút
        // Dùng lệnh SELECT bình thường, chưa cần Transaction ở đây
        const sql_tim_don = `
            SELECT MaDH FROM DonHang 
            WHERE TrangThaiThanhToan = 'Chưa Thanh Toán' 
            AND TIMESTAMPDIFF(MINUTE, NgayLapDon, NOW()) >= 15
        `;
        const [don_qua_han] = await connection.query(sql_tim_don);

        if (don_qua_han.length > 0) {
            console.log(`[CRON] Phát hiện ${don_qua_han.length} đơn hàng quá hạn. Bắt đầu hủy...`);

            // Xử lý từng đơn một cách độc lập
            for (let don of don_qua_han) {
                const maDH = don.MaDH;
                
                // 🔥 ĐƯA TRANSACTION VÀO TRONG VÒNG LẶP: Hủy lỗi đơn nào thì rollback đơn đó, các đơn khác vẫn an toàn
                await connection.beginTransaction(); 

                try {
                    // 2. Cập nhật trạng thái 'Đã hủy' (Cho khớp với IPN) và ghi lý do vào Note
                    await connection.query(
                        `UPDATE DonHang 
                         SET TrangThaiThanhToan = 'Đã hủy', 
                             Note = CONCAT(IFNULL(Note, ''), '\n[Hệ thống] Hủy tự động do quá 15 phút không thanh toán.') 
                         WHERE MaDH = ?`, 
                        [maDH]
                    );

                    // 3. Ghi log trạng thái đơn hàng = 5 (Đã hủy)
                    await connection.query(
                        `INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 5, NOW())`, 
                        [maDH]
                    );

                    // 4. Hoàn lại số lượng tồn kho (Nhả kho)
                    const sql_hoan_kho = `
                        UPDATE PhanLoai pl
                        INNER JOIN ChiTietDonHang ct ON pl.MaPhanLoai = ct.MaPhanLoai
                        SET pl.SoLuong = pl.SoLuong + ct.SoLuong
                        WHERE ct.MaDH = ?
                    `;
                    await connection.query(sql_hoan_kho, [maDH]);
                    
                    // 5. HOÀN LẠI FLASH SALE 
                    await connection.query(`
                        UPDATE ChiTietKhuyenMai ctkm
                        INNER JOIN ChiTietDonHang ctdh ON ctkm.MaPhanLoai = ctdh.MaPhanLoai
                        SET ctkm.SoLuongDaDung = ctkm.SoLuongDaDung - ctdh.SoLuong
                        WHERE ctdh.MaDH = ? AND ctdh.LaHangKhuyenMai = 1
                    `, [maDH]);

                    await connection.query(`DELETE FROM LogSuDungKhuyenMai WHERE MaDH = ?`, [maDH]);

                    // 6. HOÀN LẠI VOUCHER (MÃ GIẢM GIÁ)
                    await connection.query(`
                        UPDATE MaGiamGia mg
                        INNER JOIN LogSuDungMaGiamGia log ON log.MaGG = mg.MaGG
                        SET mg.SoLuongDaDung = mg.SoLuongDaDung - 1 
                        WHERE log.MaDH = ?
                    `, [maDH]);

                    await connection.query(`DELETE FROM LogSuDungMaGiamGia WHERE MaDH = ?`, [maDH]);

                    // Lưu thay đổi cho đơn hàng NÀY
                    await connection.commit();
                    console.log(`✅ Đã tự động hủy thành công đơn FC-${maDH} và hoàn lại kho.`);

                } catch (err_don_hang) {
                    // Nếu lỗi chỉ Rollback đơn NÀY, vòng lặp vẫn tiếp tục chạy đơn tiếp theo
                    await connection.rollback();
                    console.error(`⚠️ Lỗi khi hủy đơn FC-${maDH}:`, err_don_hang);
                }
            }
        }
    } catch (error) {
        console.error("⚠️ [CRON] Lỗi truy vấn tổng thể:", error);
    } finally {
        // Chạy xong hết mới thả kết nối Database ra
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

// //Báo cáo thống kê
// const bao_cao_route = require('./routes/Admin_route/thong_ke.route.js');
// app.use('/api/thong_ke/admin', bao_cao_route);