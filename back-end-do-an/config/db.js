const mysql = require('mysql2/promise'); // Nếu bạn dùng thư viện mysql2 thì đổi thành require('mysql2')

// ĐÂY CHÍNH LÀ NƠI KHAI BÁO BIẾN 'pool' MÀ MÁY ĐANG TÌM KIẾM
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'kinhdoanhmohinh'
});

// Gọi kết nối thử
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối MySQL:', err);
        return;
    }
    console.log('🚀 Đã kết nối thành công tới MySQL!');
    connection.release(); 
});

// Xuất biến pool ra để các file khác dùng được
module.exports = pool;