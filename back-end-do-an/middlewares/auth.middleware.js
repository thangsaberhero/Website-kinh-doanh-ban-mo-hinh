const jwt = require('jsonwebtoken');

const auth_middleware = {
    verifyToken: (req, res, next) => {
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
    },

    verifyAdmin: (req, res, next) => {
        // Hàm này bắt buộc phải đứng sau verifyToken trong Route.
        // Nhờ verifyToken chạy trước, ta đã có biến req.user
        
        if (req.user && req.user.role === '1') {
            next(); // Đúng chức vụ, mời vào!
        } else {
            return res.status(403).json({ 
                success: false, 
                message: "Truy cập bị từ chối! Bạn không có quyền quản trị." 
            });
        }
    },

    verifyStaff: (req, res, next) => {
        // Hàm này bắt buộc phải đứng sau verifyToken trong Route.
        // Nhờ verifyToken chạy trước, ta đã có biến req.user
        
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: "Truy cập bị từ chối! Bạn không có quyền thao tác nghiệp vụ này." 
            });
        }
    },
};
module.exports = auth_middleware;