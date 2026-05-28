const bcrypt = require('bcryptjs'); // Hoặc 'bcryptjs' tùy thư viện bạn đang dùng trong package.json

const password = '123456';
const saltRounds = 10; // 10 là mức độ mã hóa tiêu chuẩn

bcrypt.hash(password, saltRounds, function(err, hash) {
    console.log("Chuỗi băm của bạn là:");
    console.log(hash);
});