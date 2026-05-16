const db = require('../../config/db');

const product_view = {
    getAllProduct: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;

            const offset = (page - 1) * limit;
            const {keyword, danhmuc, thuonghieu, chitietdanhmuc, gia, sapxep} = req.query;

            let condition = [];
            let havingcondition = [];
            let value = [];
            if(keyword){
                condition.push("(mh.TenMH COLLATE utf8mb4_unicode_ci LIKE ? OR HangSanXuat.TenHSX COLLATE utf8mb4_unicode_ci LIKE ?)");
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
                havingcondition.push("DonGiaKhuyenMai <= ?");
                value.push(gia);
            }

            let whereClause = condition.length > 0 ? " and " + condition.join(" and "): "";

            let havingClause = havingcondition.length > 0 ? " HAVING " + havingcondition.join(" and ") : "";

            let filter = ""
            if(sapxep === 'price_asc')
                filter = "order by DonGiaKhuyenMai ASC";
            else if(sapxep === 'price_desc')
                filter = "order by DonGiaKhuyenMai DESC";
            else
                filter = "order by mh.MaMoHinh DESC";

            const sql_core = `SELECT mh.*,TenHSX , 
                (
                    SELECT COALESCE(SUM(SoLuong), 0) 
                    FROM PhanLoai 
                    WHERE MaMoHinh = mh.MaMoHinh
                ) AS SoLuong,
                Min(pl.DonGia - Coalesce((
                    Select MAX(
                            Case
                                when ctkm.LoaiGiamGia = 'TienMat' Then ctkm.ChietKhau
                            
                                when ctkm.LoaiGiamGia = 'ChietKhau' then 
                                    LEAST((pl.DonGia * ctkm.ChietKhau / 100), Coalesce(ctkm.GiaTriGiamToiDa, pl.DonGia))
                                else 0
                            end
                            )
                    from ChiTietKhuyenMai ctkm
                    inner join KhuyenMai km on ctkm.MaKM = km.MaKM
                    where ctkm.MaPhanLoai = pl.MaPhanLoai 
                        and km.TrangThaiHoatDong = 1
                        and km.ThoiGianBD <= NOW()
                        and km.ThoiGianKT >= NOW()
                ), 0)) as DonGiaKhuyenMai,
                MAX(
                    COALESCE((
                        SELECT MAX(
                            CASE 
                                WHEN ctkm.LoaiGiamGia = 'TienMat' THEN (ctkm.ChietKhau / pl.DonGia) * 100
                                
                                WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN 
                                    (LEAST((pl.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl.DonGia)) / pl.DonGia) * 100
                                ELSE 0
                            END
                        )
                        FROM ChiTietKhuyenMai ctkm
                        INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                        WHERE ctkm.MaPhanLoai = pl.MaPhanLoai 
                            AND km.TrangThaiHoatDong = 1
                            AND km.ThoiGianBD <= NOW()
                            AND km.ThoiGianKT >= NOW()
                    ), 0)
                ) as PhanTramGiamGiaMax
                FROM MoHinh mh
                INNER JOIN HangSanXuat ON mh.MaHSX = HangSanXuat.MaHSX 
                inner join PhanLoai pl on pl.MaMoHinh = mh.MaMoHinh
                where mh.HienThi = 1
                        and pl.HienThi = 1
                ${whereClause}
                group by mh.MaMoHinh
                ${havingClause}`
                ;

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
                        WHERE PhanLoai.MaMoHinh = mh.MaMoHinh
                    ) AS SoLuong
                    
                FROM MoHinh mh
                LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                LEFT JOIN AnhMoHinh anh ON mh.MaMoHinh = anh.MaMoHinh
                WHERE mh.MaMoHinh = ?
                GROUP BY mh.MaMoHinh
            `;

            const sql_ct = `
                SELECT pl.*,
                (pl.DonGia - COALESCE((
                        SELECT MAX(
                            CASE 
                                WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                                WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN 
                                    LEAST((pl.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl.DonGia))
                                ELSE 0
                            END
                        )
                        FROM ChiTietKhuyenMai ctkm
                        INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                        WHERE ctkm.MaPhanLoai = pl.MaPhanLoai 
                            AND km.TrangThaiHoatDong = 1
                            AND km.ThoiGianBD <= NOW()
                            AND km.ThoiGianKT >= NOW()
                    ), 0)) AS DonGiaKhuyenMai
                
                FROM PhanLoai pl
                WHERE pl.MaMoHinh = ? and pl.HienThi = 1
            `;

            const [modelResult, variantsResult] = await Promise.all([
                db.query(sql, [id]),
                db.query(sql_ct, [id])
            ]);

            if (modelResult[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sản phẩm!"
                });
            }

            const productDetail = modelResult[0][0]; // Lấy object mô hình gốc
            
            // Xử lý biến chuỗi DanhSachAnh thành Mảng (Array) cho Frontend dễ dùng
            if (productDetail.DanhSachAnh) {
                productDetail.DanhSachAnh = productDetail.DanhSachAnh.split(',');
            } else {
                productDetail.DanhSachAnh = [];
            }

            // Nhét toàn bộ mảng Phân loại vào làm một thuộc tính của Mô hình
            productDetail.DanhSachPhanLoai = variantsResult[0];

            res.status(200).json({
                message: "Đã có thông tin của sản phẩm!",
                data: productDetail
            });
        }
        catch (error){
            console.error("Lỗi khi lấy thông tin sản phẩm:,", error);
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
    getRelatedProducts: async (req, res) => {
        try {
            const { id } = req.params;

            // BƯỚC 1: Lấy thông tin Nhân Vật, Series, và Danh Mục của sản phẩm hiện tại làm "Mồi nhử"
            const sql_target = `SELECT MaDM, TenNhanVat, Series FROM MoHinh WHERE MaMoHinh = ?`;
            const [targetInfo] = await db.query(sql_target, [id]);

            if (targetInfo.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm gốc" });
            }

            const { MaDM, TenNhanVat, Series } = targetInfo[0];

            // BƯỚC 2: Truy vấn sản phẩm liên quan với logic Phân Cấp Ưu Tiên
            const sql_related = `
                SELECT mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.KichThuoc, hsx.TenHSX, mh.TrangThai, mh.LoaiHinhBan,
                
                -- Lấy thêm Tổng số lượng để hiển thị nhãn "HẾT HÀNG" trên Frontend
                (
                    SELECT COALESCE(SUM(SoLuong), 0) 
                    FROM PhanLoai 
                    WHERE MaMoHinh = mh.MaMoHinh
                ) AS SoLuong,

                -- Lấy Giá Khuyến Mãi (hoặc giá gốc nếu không có sale) để hiển thị chuẩn xác
                MIN(
                    pl.DonGia - COALESCE((
                        SELECT MAX(
                            CASE 
                                WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau
                                WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN 
                                    LEAST((pl.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl.DonGia))
                                ELSE 0
                            END
                        )
                        FROM ChiTietKhuyenMai ctkm
                        INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                        WHERE ctkm.MaPhanLoai = pl.MaPhanLoai 
                            AND km.TrangThaiHoatDong = 1
                            AND km.ThoiGianBD <= NOW()
                            AND km.ThoiGianKT >= NOW()
                    ), 0)
                ) AS DonGia

                FROM MoHinh mh
                LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                LEFT JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                WHERE mh.MaMoHinh != ? 
                  AND mh.HienThi = 1
                  -- Điều kiện lấy: Cùng Nhân vật HOẶC Cùng Series HOẶC Cùng Danh Mục
                  AND (
                      (mh.TenNhanVat = ? AND mh.TenNhanVat IS NOT NULL) OR 
                      (mh.Series = ? AND mh.Series IS NOT NULL) OR 
                      mh.MaDM = ?
                  )
                GROUP BY mh.MaMoHinh
                
                -- BÍ QUYẾT PHÂN CẤP ƯU TIÊN NẰM Ở ĐÂY
                ORDER BY 
                    CASE 
                        WHEN mh.TenNhanVat = ? AND mh.TenNhanVat IS NOT NULL THEN 1  -- Ưu tiên 1: Trùng tên nhân vật
                        WHEN mh.Series = ? AND mh.Series IS NOT NULL THEN 2          -- Ưu tiên 2: Trùng Series/Anime
                        ELSE 3                                                       -- Ưu tiên 3: Cùng danh mục bù vào
                    END ASC,
                    RAND() -- Random ngẫu nhiên các sản phẩm trong cùng một mức ưu tiên
                LIMIT 4
            `;

            // Chú ý: Cần truyền đủ các tham số theo đúng thứ tự của dấu "?" trong câu SQL
            const [relatedProducts] = await db.query(sql_related, [
                id, 
                TenNhanVat, Series, MaDM, // Nhóm biến cho mệnh đề WHERE
                TenNhanVat, Series        // Nhóm biến cho mệnh đề ORDER BY CASE
            ]);

            res.status(200).json({
                success: true,
                message: "Lấy sản phẩm liên quan thành công",
                data: relatedProducts
            });
        }
        catch (error) {
            console.error("Lỗi API getRelatedProducts: ", error);
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy sản phẩm liên quan",
                error: error.message
            });
        }
    },
}
module.exports = product_view;

