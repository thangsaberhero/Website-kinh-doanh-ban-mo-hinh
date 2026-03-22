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

//Lấy thông tin sản phẩm
const homeviewRoutes = require('./routes/homeview.route.js');
app.use('/api/products', homeviewRoutes);

