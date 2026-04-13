const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test kết nối ngay khi khởi động
pool.getConnection()
    .then(conn => {
        console.log('🚀 Đã kết nối thành công tới MySQL!');
        conn.release();
    })
    .catch(err => console.error('❌ Lỗi kết nối MySQL:', err));

module.exports = pool;