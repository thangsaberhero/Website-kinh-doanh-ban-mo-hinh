const db = require('../config/db');

const product_view = {
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
            const sql = 'SELECT MoHinh.* FROM MoHinh inner join DanhMuc on MoHinh.MaDM = DanhMuc.MaDM where Ma ORDER BY MaMoHinh DESC';
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
            const sql = 'SELECT MoHinh.* FROM MoHinh inner join ChiTietDanhMuc on MoHinh.MaChiTietDM = ChiTietDanhMuc.MaChiTietDM where MaChiTietDM = ? ORDER BY MaMoHinh DESC';
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
    getProductsBySearch: async(req, res) => {
        try {
            const search = req.params.thongtin;
            const sql = 'SELECT * from MoHinh where MoHinh.TenMH like %?%';
            const [products] = await db.query(sql, [search]);

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
}
module.exports = product_view;

