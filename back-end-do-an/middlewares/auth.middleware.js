const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: "Từ chối truy cập! Bạn chưa đăng nhập." });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        res.status(403).json({ message: "Vé thông hành không hợp lệ hoặc đã hết hạn!" });
    }
};

module.exports = verifyToken;