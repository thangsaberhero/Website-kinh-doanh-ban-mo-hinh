const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Bảo vệ yêu cầu khách đưa vé ra (Vé thường nằm ở phần Headers của Request)
    const token = req.header('Authorization');

    // 2. Nếu khách đi tay không (chưa đăng nhập) -> Đuổi ra ngoài!
    if (!token) {
        return res.status(401).json({ message: "Từ chối truy cập! Bạn chưa đăng nhập." });
    }

    try {
        // 3. Nếu có vé, bảo vệ dùng "Máy quét" (jwt.verify) để xem vé thật hay vé giả
        // Lưu ý: Chữ 'BIMAT_CUA_BAN' phải giống y hệt chữ bạn đã dùng lúc tạo Token ở hàm Login nhé!
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        
        // 4. Nếu vé thật, lưu thông tin khách vào biến req.user để Bếp trưởng dùng nếu cần
        req.user = decoded; 
        
        // 5. Câu lệnh QUAN TRỌNG NHẤT: Mở cửa cho khách đi tiếp vào gặp Bếp trưởng!
        next(); 

    } catch (error) {
        // Vé giả hoặc vé đã hết hạn
        res.status(403).json({ message: "Vé thông hành không hợp lệ hoặc đã hết hạn!" });
    }
};

module.exports = verifyToken;