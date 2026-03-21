const db = require('../config/db');

const homeviewController = {
    getAllProduct: async(req, res) => {
        try {
            const sql = 'SELECT * FROM MoHinh ORDER BY MaMoHinh DESC';
            const [products] = await db.query(sql);

            res.status(200).json({
                message: "Lấy danh sách sản phẩm thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy sản phẩm:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu sản phẩm"
            });
        }
    }

}
module.exports = homeviewController;
