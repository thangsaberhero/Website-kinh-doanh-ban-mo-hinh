const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Đường dẫn tới file setup kết nối MySQL của bạn
const { getHistoryFromBlockchain } = require('../services/blockchain.service');

router.get('/truy-xuat/:serialNumber', async (req, res) => {
    try {
        const { serialNumber } = req.params;

        // 1. Lấy thông tin cơ bản từ Database
        const query = `
            SELECT sp.MaVach_Serial, mh.TenMH, hsx.TenHSX, mh.AnhDaiDien 
            FROM SanPhamVatLy sp 
            JOIN MoHinh mh ON sp.MaMoHinh = mh.MaMoHinh
            JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
            WHERE sp.MaVach_Serial = ?
        `;
        const [rows] = await db.query(query, [serialNumber]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mã Serial này trong hệ thống!" });
        }

        const product = rows[0];

        // 2. Lấy lịch sử bất biến từ Blockchain
        const blockchainHistory = await getHistoryFromBlockchain(serialNumber);

        res.json({
            success: true,
            product: product,
            history: blockchainHistory
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
    }
});

module.exports = router;