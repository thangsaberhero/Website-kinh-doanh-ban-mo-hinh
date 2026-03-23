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
    },

    getProductById: async(req, res) => {
        try {
            const id = req.params.id;

            const sql = `
                SELECT 
                    mh.*, 
                    hsx.TenHSX, 
                    GROUP_CONCAT(anh.LinkAnh) AS DanhSachAnh
                FROM MoHinh mh
                LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                LEFT JOIN AnhMoHinh anh ON mh.MaMoHinh = anh.MaMoHinh
                WHERE mh.MaMoHinh = ?
                GROUP BY mh.MaMoHinh
            `;

            const [product] = await db.query(sql, [id]);

            if(product.length === 0)
                return res.status(404).json({
                    message: "Không tìm thấy sản phẩm!"
            });
            res.status(200).json({
                message: "Đã có thông tin của sản phẩm!",
                data: product
            });
        }
        catch (error){
            console.error("Lỗi khi lấy thông tin sản phẩm:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu sản phẩm"
            });
        }
    },

    // Hàm tìm kiếm sản phẩm theo tên
    searchProducts : async (req, res) => {
        try {
            const keyword = req.query.keyword;
            
            if (!keyword) {
                return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
            }

            // Lệnh SQL: Tìm những mô hình có tên chứa từ khóa (Không phân biệt hoa thường)
            // LIMIT 10: Chỉ lấy tối đa 10 sản phẩm thả xuống cho nhẹ
            const sql = `
                SELECT MaMoHinh, TenMH, AnhDaiDien, DonGia 
                FROM MoHinh 
                WHERE TenMH LIKE ? 
                LIMIT 10
            `;
            
            // Thêm % vào 2 đầu từ khóa để tìm chuỗi con
            const [results] = await db.query(sql, [`%${keyword}%`]);

            res.status(200).json({
                message: "Tìm kiếm thành công",
                data: results
            });

        } catch (error) {
            console.error("Lỗi API tìm kiếm:", error);
            res.status(500).json({ message: "Lỗi server khi tìm kiếm" });
        }
    }
}
module.exports = homeviewController;

