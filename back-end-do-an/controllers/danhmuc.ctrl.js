const db = require('../config/db');

const danhMucController = {
    // API Lấy tất cả danh mục
    getAll: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM DanhMuc');
            res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
        }
    },

    // API Thêm một danh mục mới
    create: async (req, res) => {
        try {
            const { TenDM, MoTa } = req.body;
            const sql = 'INSERT INTO DanhMuc (TenDM, MoTa) VALUES (?, ?)';
            const [result] = await db.query(sql, [TenDM, MoTa]);
            
            res.status(201).json({ 
                message: "Thêm thành công!", 
                id: result.insertId 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi server khi thêm danh mục" });
        }
    }

    
};

module.exports = danhMucController;