const db = require('../../config/db');

const product_view = {
    getAllProduct: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;

            const offset = (page - 1) * limit;
            const {keyword, danhmuc, thuonghieu, chitietdanhmuc, gia, sapxep} = req.query;

            let condition = [];
            let value = [];
            if(keyword){
                condition.push("(mh.TenMH like ? or TenHSX like ?)");
                value.push(`%${keyword}%`, `%${keyword}%`);
            }
            if(danhmuc){
                const dmArray = danhmuc.split(','); 
                condition.push(`mh.MaDM IN (?)`);
                value.push(dmArray);
            }
            if(chitietdanhmuc){
                const ctdmArray = chitietdanhmuc.split(',');
                condition.push(`mh.MaChiTietDM IN (?)`);
                value.push(ctdmArray);
            }
            if(thuonghieu){
                const thArray = thuonghieu.split(',');
                condition.push(`TenHSX IN (?)`);
                value.push(thArray);
            }
            if(gia){
                condition.push("mh.DonGia <= ?");
                value.push(gia);
            }
            let whereClause = condition.length > 0 ? "where " + condition.join(" and "): "";

            let filter = ""
            if(sapxep === 'price_asc')
                filter = "order by mh.DonGia ASC";
            else if(sapxep === 'price_desc')
                filter = "order by mh.DonGia DESC";
            else
                filter = "order by mh.MaMoHinh DESC";

            const sql_core = `SELECT mh.*,TenHSX , 
            (
                SELECT COALESCE(SUM(SoLuong), 0) 
                FROM PhanLoai 
                WHERE MaMoHinh = mh.MaMoHinh
            ) AS SoLuong
            FROM MoHinh mh
            INNER JOIN HangSanXuat ON mh.MaHSX = HangSanXuat.MaHSX 
            ${whereClause}`;

            const sql_count = `Select count(*) as total from (${sql_core}) as temptable`
            const [countResult] = await db.query(sql_count, value);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems/limit);

            const sql = `${sql_core}
                        ${filter}
                        limit ? offset ?`

            const [products] = await db.query(sql, [...value, limit, offset]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách sản phẩm thành công",
                data: products,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });
        }
        catch (error){
            console.error("Lỗi khi lấy sản phẩm:,", error);
            res.status(500).json({
                success: false,
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
                    GROUP_CONCAT(anh.LinkAnh) AS DanhSachAnh,
                    (
                        SELECT COALESCE(SUM(SoLuong), 0) 
                        FROM PhanLoai 
                        WHERE MaMoHinh = mh.MaMoHinh
                    ) AS SoLuong
                    
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
    //Lấy ds hsx
    getAllbrand: async(req, res) => {
        try {
            const sql = 'SELECT * FROM HangSanXuat';
            const [products] = await db.query(sql);

            res.status(200).json({
                message: "Lấy danh sách hãng sản xuất thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách hãng sản xuất:,", error);
            res.status(500).json({
                message: "Lỗi server khi lấy dữ liệu danh sách hãng sản xuất!"
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

            const sql = `
                SELECT MaMoHinh, TenMH, AnhDaiDien, DonGia 
                FROM MoHinh 
                WHERE TenMH LIKE ? 
                LIMIT 10
            `;
            
            const [results] = await db.query(sql, [`%${keyword}%`]);

            res.status(200).json({
                message: "Tìm kiếm thành công",
                data: results
            });

        } catch (error) {
            console.error("Lỗi API tìm kiếm:", error);
            res.status(500).json({ message: "Lỗi server khi tìm kiếm" });
        }
    },

    //Thêm/bỏ sản phẩm yêu thích
    toggle_favorite_product: async(req, res) => {
        try {
            const { MaKH, MaMoHinh } = req.body; 

            // 1. Tìm mã danh sách yêu thích của khách hàng
            const tim_ma_yeu_thich = `SELECT MaYeuThich FROM DanhMucYeuThich WHERE MaKH = ?`;
            const [check] = await db.query(tim_ma_yeu_thich, [MaKH]);
            
            if (check.length === 0) { 
                return res.status(404).json({ message: "Không tìm thấy danh sách yêu thích của khách hàng này!" });
            }
            
            const Ma_dmyt = check[0].MaYeuThich;

            // 2. Kiểm tra xem sản phẩm đã có trong danh sách hay chưa
            const sql_kiem_tra = `SELECT 1 FROM ChiTietYeuThich WHERE MaYeuThich = ? AND MaMoHinh = ? LIMIT 1`;
            const [kiem_tra_ton_tai] = await db.query(sql_kiem_tra, [Ma_dmyt, MaMoHinh]);
            
            // 3. Xử lý Logic Bật/Tắt (Toggle)
            if (kiem_tra_ton_tai.length > 0) {
                // TRƯỜNG HỢP 1: ĐÃ CÓ -> Tiến hành XÓA
                const sql_xoa = `DELETE FROM ChiTietYeuThich WHERE MaYeuThich = ? AND MaMoHinh = ?`;
                await db.query(sql_xoa, [Ma_dmyt, MaMoHinh]);
                
                return res.status(200).json({ 
                    message: "Đã bỏ sản phẩm khỏi danh sách yêu thích!",
                    action: "removed" // Trả về chữ này để Frontend biết mà đổi màu trái tim (rỗng)
                });
            } else {
                // TRƯỜNG HỢP 2: CHƯA CÓ -> Tiến hành THÊM
                const sql_them = `INSERT INTO ChiTietYeuThich (MaYeuThich, MaMoHinh) VALUES (?, ?)`;
                await db.query(sql_them, [Ma_dmyt, MaMoHinh]);
                
                return res.status(200).json({ 
                    message: "Đã thêm sản phẩm vào danh sách yêu thích!",
                    action: "added" // Trả về chữ này để Frontend biết mà đổi màu trái tim (đỏ)
                });
            }

        } catch (error) {
            console.error("Lỗi khi thao tác (Toggle) danh mục yêu thích:", error);
            res.status(500).json({ message: "Lỗi server khi thao tác danh sách yêu thích!" });
        }
    },

    check_favorite_product: async(req, res) => {
        try {
            const { MaKH, MaMoHinh } = req.params; 

            // 1. Tìm mã danh sách yêu thích của khách hàng
            const tim_ma_yeu_thich = `SELECT MaYeuThich FROM DanhMucYeuThich WHERE MaKH = ?`;
            const [check] = await db.query(tim_ma_yeu_thich, [MaKH]);
            
            if (check.length === 0) { 
                return res.status(200).json({ isFavorite: false });
            }
            
            const Ma_dmyt = check[0].MaYeuThich;

            // 2. Kiểm tra xem sản phẩm đã có trong danh sách hay chưa
            const sql_kiem_tra = `SELECT 1 FROM ChiTietYeuThich WHERE MaYeuThich = ? AND MaMoHinh = ? LIMIT 1`;
            const [kiem_tra_ton_tai] = await db.query(sql_kiem_tra, [Ma_dmyt, MaMoHinh]);
            if (kiem_tra_ton_tai.length > 0) {
                return res.status(200).json({ isFavorite: true }); // Đã tim
            } else {
                return res.status(200).json({ isFavorite: false }); // Chưa tim
            }

        } catch (error) {
            console.error("Lỗi khi thao tác (Toggle) danh mục yêu thích:", error);
            res.status(500).json({ message: "Lỗi server khi thao tác danh sách yêu thích!" });
        }
    },

    watch_favorite_product: async(req, res) => {
        try {
            const { MaKH } = req.params; 

            // 1. Tìm mã danh sách yêu thích của khách hàng
            const tim_ma_yeu_thich = `SELECT MaYeuThich FROM DanhMucYeuThich WHERE MaKH = ?`;
            const [check] = await db.query(tim_ma_yeu_thich, [MaKH]);
            
            if (check.length === 0) { 
                return res.status(200).json({ 
                    message: "Danh sách trống!",
                    data: []
                });
            }
            
            const Ma_dmyt = check[0].MaYeuThich;

            // 2. lấy danh sách sản phẩm yêu thích
            const sql_kiem_tra = `SELECT mh.*,TenHSX , 
            (
                SELECT COALESCE(SUM(SoLuong), 0) 
                FROM PhanLoai 
                WHERE MaMoHinh = mh.MaMoHinh
            ) AS SoLuong
            FROM MoHinh mh
            INNER JOIN HangSanXuat ON mh.MaHSX = HangSanXuat.MaHSX 
            inner join ChiTietYeuThich on mh.MaMoHinh = ChiTietYeuThich.MaMoHinh
            Where ChiTietYeuThich.MaYeuThich = ?
            ORDER BY mh.MaMoHinh DESC`;
            const [products] = await db.query(sql_kiem_tra, [Ma_dmyt]);
            res.status(200).json({
                message: "Lấy danh sách sản phẩm thành công",
                data: products
            });

        } catch (error) {
            console.error("Lỗi khi thao tác (Toggle) danh mục yêu thích:", error);
            res.status(500).json({ message: "Lỗi server khi thao tác danh sách yêu thích!" });
        }
    },
    getRelatedProducts: async(req, res) => {
        try{
            const { id } = req.params;
            const sql = `SELECT mh.MaMoHinh, mh.TenMH, mh.DonGia, mh.AnhDaiDien, mh.KichThuoc, hsx.TenHSX
                        FROM MoHinh mh
                        LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                        WHERE mh.MaDM = (SELECT MaDM FROM MoHinh WHERE MaMoHinh = ?) AND mh.MaMoHinh != ? AND mh.HienThi = 1
                        LIMIT 4`;
            const [relatedProducts] = await db.query(sql, [id, id]);
            res.status(200).json({
                message: "Lấy sản phẩm liên quan thành công",
                data: relatedProducts
            });
        }
        catch(error){
            console.error("Lỗi API getRelatedProducts: ", error);
            res.status(500).json({
                message: "Lỗi máy chủ khi lấy sản phẩm liên quan",
                error: error.message
            });
        }
    }
}
module.exports = product_view;

