const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Giúp server đọc được dữ liệu JSON gửi lên

// Import Routes
const danhMucRoutes = require('./routes/danhmuc.route.js');

// Sử dụng Routes
app.use('/api/danhmuc', danhMucRoutes);

// Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Máy chủ Backend đang chạy tại cổng ${PORT}`);
});

// Import Route Auth
const authRoutes = require('./routes/auth.route.js');

// Sử dụng Route Auth
app.use('/api/auth', authRoutes);

// Thay đổi thông tin khách hàng
const user_info = require('./routes/info_user.route.js');
app.use('/api/info_user', user_info);

//Lấy thông tin sản phẩm
const homeviewRoutes = require('./routes/homeview.route.js');
app.use('/api/products', homeviewRoutes);

//Thêm đơn hàng
const add_cartRoutes = require('./routes/donhang_user.route.js');
app.use('/api/add_cart',add_cartRoutes);

//Lấy đường dẫn ảnh đại diện
const path = require('path'); // Nhớ gọi thư viện path ở đầu file server.js nhé
// Cấp quyền cho trình duyệt được phép truy cập vào thư mục public/Images_user
app.use('/Images_user', express.static(path.join(__dirname, 'public/Images_user')));