const db = require('../config/db');

const product_view = {
    getAllProduct: async(req, res) => {
        try {
            const sql = 'SELECT MoHinh.*,TenHSX FROM MoHinh INNER JOIN HangSanXuat ON MoHinh.MaHSX = HangSanXuat.MaHSX ORDER BY MoHinh.MaMoHinh DESC';
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

    getVariantProductById: async(req, res) => {
        try {
            const id = req.params.id;

            const sql = `
                SELECT pl.*
                FROM PhanLoai pl
                WHERE pl.MaMoHinh = ?
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
            console.error("Lỗi khi lấy thông tin phân loại sản phẩm:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu sản phẩm"
            });
        }
    },
    //Lấy danh sách danh mục
    getAllvariant: async(req, res) => {
        try {
            const sql = 'SELECT * FROM DanhMuc';
            const [products] = await db.query(sql);

            res.status(200).json({
                message: "Lấy danh sách danh mục thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách danh mục:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu danh sách danh mục"
            });
        }
    },
    // Lấy danh sách chi tiết danh mục
    getAlldetailvariant: async(req, res) => {
        try {
            const maDM = req.params.maDM;
            const sql = 'SELECT * FROM ChiTietDanhMuc where MaDM = ?';
            const [products] = await db.query(sql,[maDM]);

            res.status(200).json({
                message: "Lấy danh sách danh mục thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách danh mục:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu danh sách danh mục"
            });
        }
    },
    // Lấy thông tin các sản phẩm theo danh mục
    getProductsByVariant: async(req, res) => {
        try {
            const maDM = req.params.maDM;
            const sql = 'SELECT MoHinh.*, TenHSX FROM MoHinh INNER JOIN HangSanXuat ON MoHinh.MaHSX = HangSanXuat.MaHSX where MaDM = ? ORDER BY MaMoHinh DESC';
            const [products] = await db.query(sql, [maDM]);

            res.status(200).json({
                message: "Lấy danh sách sản phẩm thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách sản phẩm theo danh mục:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu danh sách danh mục!"
            });
        }
    },
    // Lấy thông tin các sản phẩm theo chi tiết danh mục
    getProductsByDetailVariant: async(req, res) => {
        try {
            const maCTDM = req.params.maCTDM;
            const sql = `SELECT MoHinh.*, TenHSX FROM MoHinh 
            inner join ChiTietDanhMuc on MoHinh.MaChiTietDM = ChiTietDanhMuc.MaChiTietDM 
            INNER JOIN HangSanXuat ON MoHinh.MaHSX = HangSanXuat.MaHSX
            where MoHinh.MaChiTietDM = ? ORDER BY MaMoHinh DESC`;
            const [products] = await db.query(sql, [maCTDM]);

            res.status(200).json({
                message: "Lấy danh sách sản phẩm thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách sản phẩm theo chi tiết danh mục:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu danh sách danh mục!"
            });
        }
    },
    // Lấy thông tin các sản phẩm theo tìm kiếm
    getProductsBySearch: async (req, res) => {
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
module.exports = product_view;

