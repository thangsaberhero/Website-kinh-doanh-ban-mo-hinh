const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Chức năng tự huỷ đơn
const cron = require('node-cron');
// LƯU Ý: Phải trỏ đúng đường dẫn đến file cấu hình MySQL của bạn
const db = require('./config/db');

// Middlewares
app.use(cors());
app.use(express.json()); // Giúp server đọc được dữ liệu JSON gửi lên



// Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Máy chủ Backend đang chạy tại cổng ${PORT}`);
});

// Import Route Auth
const authRoutes = require('./routes/User_route/auth.route.js');

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

//Lấy đường dẫn ảnh đại diện
const path = require('path'); // Nhớ gọi thư viện path ở đầu file server.js nhé
// Cấp quyền cho trình duyệt được phép truy cập vào thư mục public/Images_user
app.use('/Images_user', express.static(path.join(__dirname, 'public/Images_user')));
app.use('/Images_news', express.static(path.join(__dirname, 'public/Images_news')));



// --- ROUTE CHATBOT ---
const chatRoutes = require('./routes/User_route/chat.route.js');
app.use('/api/chatbot', chatRoutes);





// =========================================================
// CRON JOB: TỰ ĐỘNG HỦY ĐƠN VÀ NHẢ KHO (Mỗi 1 phút chạy 1 lần)
// =========================================================
cron.schedule('* * * * *', async () => {

    // Cấp một connection để làm Transaction an toàn
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Tìm đơn hàng: Trạng thái 'Chờ duyệt', quá 5 phút
        const sql_tim_don = `
            SELECT MaDH FROM DonHang 
            WHERE TrangThaiThanhToan = 'Chưa thanh toán' 
            AND TIMESTAMPDIFF(MINUTE, NgayLapDon, NOW()) >= 5
        `;
        const [don_qua_han] = await connection.query(sql_tim_don);

        if (don_qua_han.length > 0) {
            for (let don of don_qua_han) {
                const maDH = don.MaDH;

                // 2. Cập nhật trạng thái thành Đã Hủy
                await connection.query(
                    `UPDATE DonHang SET TrangThaiThanhToan = 'Đã hủy (Quá hạn thanh toán)' WHERE MaDH = ?`, 
                    [maDH]
                );

                // 3. Hoàn lại số lượng tồn kho (Nhả kho)
                const sql_hoan_kho = `
                    UPDATE PhanLoai pl
                    INNER JOIN ChiTietDonHang ct ON pl.MaPhanLoai = ct.MaMoHinh
                    SET pl.SoLuong = pl.SoLuong + ct.SoLuong
                    WHERE ct.MaDH = ?
                `;
                await connection.query(sql_hoan_kho, [maDH]);
                
                // 4. Ghi log trạng thái
                await connection.query(
                    `INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 5, NOW())`, 
                    [maDH] // Giả sử 5 là mã trạng thái Hủy
                );

                console.log(`❌ Đã tự động hủy đơn FC-${maDH} và hoàn lại kho.`);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("⚠️ [CRON] Lỗi khi chạy tác vụ hủy đơn:", error);
    } finally {
        connection.release();
    }
});


// Nhánh luồng xử lý của admin:
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