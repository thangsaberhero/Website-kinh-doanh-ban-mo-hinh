const db = require('../../config/db');

const contactController = {
    submitContact: async (req, res) => {
        try {
            const { name, email, phone, message } = req.body;
            if (!name || !email || !message) {
                return res.status(400).json({ success: false, message: "Vui lòng điền đủ thông tin" });
            }

            const sql = `INSERT INTO LienHe (HoTen, Email, SDT, NoiDung) VALUES (?, ?, ?, ?)`;
            await db.query(sql, [name, email, phone || null, message]);
            res.status(200).json({ 
                message: "Gửi liên hệ thành công" 
            });
        } catch (error) {
            console.error("Lỗi API submitContact: ", error);
            res.status(500).json({ 
                message: "Lỗi máy chủ khi gửi tin liên hệ", 
                error: error.message 
            });
        }
    }
};

module.exports = contactController;