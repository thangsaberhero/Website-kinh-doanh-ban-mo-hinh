const db = require('../../config/db');

const product_view = {
    getAllProduct: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;
            if (!page || isNaN(page) || page < 1) page = 1;
            if (!limit || isNaN(limit) || limit < 1) limit = 9;
            if (limit > 27) limit = 27;

            const offset = (page - 1) * limit;
            let {keyword, danhmuc, thuonghieu, chitietdanhmuc, gia, sapxep} = req.query;

            let condition = [];
            let havingcondition = [];
            let value = [];
            if (keyword) {
                const safeKeyword = keyword.toString().trim();
                if (safeKeyword !== '') {
                    condition.push("(mh.TenMH COLLATE utf8mb4_unicode_ci LIKE ? OR HangSanXuat.TenHSX COLLATE utf8mb4_unicode_ci LIKE ?)");
                    value.push(`%${safeKeyword}%`, `%${safeKeyword}%`);
                }
            }
            const parseArrayParam = (param) => {
                if (!param) return [];
                // Nếu Express đã parse thành Array (?dm=1&dm=2) thì dùng luôn
                if (Array.isArray(param)) return param; 
                // Nếu là String (?dm=1,2) thì tách chuỗi
                return param.toString().split(',').map(item => item.trim()).filter(item => item !== '');
            };
            if(danhmuc){
                const dmArray = parseArrayParam(danhmuc);
                if (dmArray.length > 0) { // Đảm bảo mảng không rỗng để tránh lỗi SQL IN ()
                    condition.push(`mh.MaDM IN (?)`);
                    value.push(dmArray);
                }
            }
            if(chitietdanhmuc){
                const ctdmArray = parseArrayParam(chitietdanhmuc);
                if (ctdmArray.length > 0) {
                    condition.push(`mh.MaChiTietDM IN (?)`);
                    value.push(ctdmArray);
                }
            }
            if(thuonghieu){
                const thArray = parseArrayParam(thuonghieu);
                if (thArray.length > 0) {
                    condition.push(`TenHSX IN (?)`);
                    value.push(thArray);
                }
            }

            if(gia){
                const parsedGia = parseInt(gia);
                if (!isNaN(parsedGia) && parsedGia >= 0) {
                    havingcondition.push("DonGiaKhuyenMai <= ?");
                    value.push(parsedGia);
                }
            }

            let whereClause = condition.length > 0 ? " and " + condition.join(" and "): "";

            let havingClause = havingcondition.length > 0 ? " HAVING " + havingcondition.join(" and ") : "";

            let filter = ""
            if(sapxep === 'price_asc')
                filter = "order by DonGiaKhuyenMai ASC";
            else if(sapxep === 'price_desc')
                filter = "order by DonGiaKhuyenMai DESC";
            else
                filter = "order by mh.NgayPhatHanh DESC";

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
            const parsedId = Number(id);
                if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                    return res.status(404).json({
                        success: false,
                        message: "Mã sản phẩm không hợp lệ!"
                    });
                }
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

    getVariantProductById: async(req, res) => {
        try {
            const id = req.params.id;
            const parsedId = Number(id);
                if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                    return res.status(404).json({
                        success: false,
                        message: "Mã sản phẩm không hợp lệ!"
                    });
                }
            const sql = `
                SELECT pl.*
                
                FROM PhanLoai pl
                WHERE pl.MaMoHinh = ? and pl.HienThi = 1
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
            const parsedId = Number(maDM);
                if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                    return res.status(404).json({
                        success: false,
                        message: "Mã sản phẩm không hợp lệ!"
                    });
                }
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
    // getProductsByDetailVariant: async(req, res) => {
    //     try {
    //         const maCTDM = req.params.maCTDM;
    //         const sql = `SELECT MoHinh.*, TenHSX FROM MoHinh 
    //         inner join ChiTietDanhMuc on MoHinh.MaChiTietDM = ChiTietDanhMuc.MaChiTietDM 
    //         INNER JOIN HangSanXuat ON MoHinh.MaHSX = HangSanXuat.MaHSX
    //         where MoHinh.MaChiTietDM = ? ORDER BY MaMoHinh DESC`;
    //         const [products] = await db.query(sql, [maCTDM]);

    //         res.status(200).json({
    //             message: "Lấy danh sách sản phẩm thành công",
    //             data: products
    //         });
    //     }
    //     catch (error){
    //         console.error("Lỗi khi lấy danh sách sản phẩm theo chi tiết danh mục:,", error);
    //         res.status(500).json({
    //             message: "Lỗi server khi lấy dữ liệu danh sách danh mục!"
    //         });
    //     }
    // },
    // Lấy thông tin các sản phẩm theo tìm kiếm
    getProductsBySearch: async (req, res) => {
        try {
            const keyword = req.query.keyword;
            const safeKeyword = keyword.toString().trim();
            if (!safeKeyword) {
                return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
            }

            const sql = `
                SELECT mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.DonGia, hsx.TenHSX
                FROM MoHinh mh
                Inner join HangSanXuat hsx on hsx.MaHSX = mh.MaHSX
                WHERE (TenMH COLLATE utf8mb4_unicode_ci LIKE ? or hsx.TenHSX COLLATE utf8mb4_unicode_ci LIKE ?) And mh.HienThi = 1
                LIMIT 10
            `;
            const [results] = await db.query(sql, [`%${keyword}%`,`%${keyword}%`]);

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
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaMoHinh } = req.body; 
            const MaTK = req.user.id;

            // 2. Chuẩn hóa ID
            const parsedId = Number(MaMoHinh); // Đã fix tên biến maDM
            if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã sản phẩm không hợp lệ!"
                });
            }

            // 3. TỐI ƯU HÓA: Tìm thẳng MaYeuThich thông qua MaTK bằng 1 lần JOIN
            const sql_get_info = `
                SELECT yt.MaYeuThich 
                FROM KhachHang kh
                INNER JOIN DanhMucYeuThich yt ON kh.MaKH = yt.MaKH
                WHERE kh.MaTK = ?
            `;
            const [info_result] = await connection.query(sql_get_info, [MaTK]);
            
            if (info_result.length === 0) { 
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy danh sách yêu thích của khách hàng này!" 
                });
            }
            const Ma_dmyt = info_result[0].MaYeuThich;

            // 4. Kiểm tra sản phẩm có tồn tại không (Chỉ cần bảng MoHinh, không cần Tồn kho)
            const sql_check_mo_hinh = `SELECT 1 FROM MoHinh WHERE MaMoHinh = ? AND HienThi = 1`;
            const [moHinh] = await connection.query(sql_check_mo_hinh, [parsedId]);

            if (moHinh.length === 0) {
                await connection.rollback();
                return res.status(404).json({ 
                    success: false, 
                    message: "Sản phẩm này không tồn tại hoặc đang tạm thời ngừng kinh doanh!" 
                });
            }

            // 5. Kiểm tra xem sản phẩm đã có trong danh sách hay chưa
            const sql_kiem_tra = `SELECT 1 FROM ChiTietYeuThich WHERE MaYeuThich = ? AND MaMoHinh = ? LIMIT 1`;
            const [kiem_tra_ton_tai] = await connection.query(sql_kiem_tra, [Ma_dmyt, parsedId]);
            
            // 6. Xử lý Logic Bật/Tắt (Toggle)
            if (kiem_tra_ton_tai.length > 0) {
                // TRƯỜNG HỢP 1: ĐÃ CÓ -> Tiến hành XÓA
                const sql_xoa = `DELETE FROM ChiTietYeuThich WHERE MaYeuThich = ? AND MaMoHinh = ?`;
                await connection.query(sql_xoa, [Ma_dmyt, parsedId]);
                await connection.commit();
                
                return res.status(200).json({ 
                    success: true,
                    message: "Đã bỏ sản phẩm khỏi danh sách yêu thích!",
                    action: "removed" 
                });
            } else {
                // TRƯỜNG HỢP 2: CHƯA CÓ -> Tiến hành THÊM
                const sql_them = `INSERT INTO ChiTietYeuThich (MaYeuThich, MaMoHinh) VALUES (?, ?)`;
                await connection.query(sql_them, [Ma_dmyt, parsedId]);
                await connection.commit();
                
                return res.status(200).json({ 
                    success: true,
                    message: "Đã thêm sản phẩm vào danh sách yêu thích!",
                    action: "added" 
                });
            }

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thao tác (Toggle) danh mục yêu thích:", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác danh sách yêu thích!" });
        } finally {
            connection.release(); 
        }
    },

    check_favorite_product: async(req, res) => {
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
        try {
            const {id} = req.params; 

            const MaTK = req.user.id;

            // 2. Chuẩn hóa ID
            const parsedId = Number(id); // Đã fix tên biến maDM
            if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã sản phẩm không hợp lệ!"
                });
            }
            // 1. Tìm mã danh sách yêu thích của khách hàng
            const sql_get_info = `
                SELECT yt.MaYeuThich 
                FROM KhachHang kh
                INNER JOIN DanhMucYeuThich yt ON kh.MaKH = yt.MaKH
                WHERE kh.MaTK = ?
            `;
            const [info_result] = await db.query(sql_get_info, [MaTK]);
            
            if (info_result.length === 0) { 
                return res.status(404).json({
                    isFavorite: false
                });
            }
            const Ma_dmyt = info_result[0].MaYeuThich;

            // 4. Kiểm tra sản phẩm có tồn tại không (Chỉ cần bảng MoHinh)
            const sql_kiem_tra = `
                SELECT 1 
                FROM ChiTietYeuThich ct
                INNER JOIN MoHinh mh ON ct.MaMoHinh = mh.MaMoHinh
                WHERE ct.MaYeuThich = ? AND ct.MaMoHinh = ? AND mh.HienThi = 1
                LIMIT 1
            `;
            const [kiem_tra_ton_tai] = await db.query(sql_kiem_tra, [Ma_dmyt, parsedId]);
            
            // Trả về true nếu mảng có dữ liệu, false nếu mảng rỗng
            return res.status(200).json({ 
                isFavorite: kiem_tra_ton_tai.length > 0 
            });

        } catch (error) {
            console.error("Lỗi khi thao tác (Toggle) danh mục yêu thích:", error);
            res.status(500).json({ message: "Lỗi server khi thao tác danh sách yêu thích!" });
        }
    },

    watch_favorite_product: async(req, res) => {
        if (req.user && (req.user.role == 1 || req.user.role == 2)) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Nhân viên/Admin không được phép sử dụng chức năng này. Vui lòng dùng tài khoản Khách hàng!" 
            });
        }
        try {
            const MaTK = req.user.id;

            // 1. Tìm mã danh sách yêu thích của khách hàng
            const tim_ma_yeu_thich = `SELECT yt.MaYeuThich 
                                    FROM DanhMucYeuThich yt
                                    inner join KhachHang kh on kh.MaKH = yt.MaKH
                                    WHERE kh.MaTK = ?`;
            const [check] = await db.query(tim_ma_yeu_thich, [MaTK]);
            
            if (check.length === 0) { 
                return res.status(200).json({ 
                    message: "Danh sách trống!",
                    data: []
                });
            }
            
            const Ma_dmyt = check[0].MaYeuThich;

            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 9;
            

            if (!page || isNaN(page) || page < 1) page = 1;
            if (!limit || isNaN(limit) || limit < 1) limit = 9;
            if (limit > 27) limit = 27;

            const offset = (page - 1) * limit;

            // 2. lấy danh sách sản phẩm yêu thích
            const sql_core = `
                SELECT 
                    mh.MaMoHinh, mh.AnhDaiDien, mh.TenMH, hsx.TenHSX,
                    (
                        SELECT MIN(DonGia) 
                        FROM PhanLoai 
                        WHERE MaMoHinh = mh.MaMoHinh
                    ) AS DonGia,
                    (
                        SELECT COALESCE(SUM(SoLuong), 0) 
                        FROM PhanLoai 
                        WHERE MaMoHinh = mh.MaMoHinh
                    ) AS SoLuong
                FROM MoHinh mh
                LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX 
                INNER JOIN ChiTietYeuThich ct ON mh.MaMoHinh = ct.MaMoHinh
                WHERE ct.MaYeuThich = ? AND mh.HienThi = 1
                ORDER BY mh.MaMoHinh DESC
            `;
            const sql_count = `Select count(*) as total from (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count, Ma_dmyt);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);
            const sql_ds = `
                ${sql_core}
                LIMIT ? OFFSET ?
            `;
            const [ds] = await db.query(sql_ds, [Ma_dmyt, limit, offset]);
            res.status(200).json({
                message: "Lấy danh sách sản phẩm thành công",
                data: ds,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });

        } catch (error) {
            console.error("Lỗi khi thao tác (Toggle) danh mục yêu thích:", error);
            res.status(500).json({ message: "Lỗi server khi thao tác danh sách yêu thích!" });
        }
    },
    getRelatedProducts: async (req, res) => {
        try {
            const {id} = req.params;
            const parsedId = Number(id);
            if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã sản phẩm không hợp lệ!"
                });
            }

            // BƯỚC 1: Lấy thông tin Nhân Vật, Series, và Danh Mục của sản phẩm hiện tại làm "Mồi nhử"
            const sql_target = `SELECT MaDM, TenNhanVat, Series FROM MoHinh WHERE MaMoHinh = ?`;
            const [targetInfo] = await db.query(sql_target, [parsedId]);

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
                parsedId, 
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
    getCartSuggestions: async (req, res) => {
        try {
            const { cartItemIds } = req.body;
            let sql = '';
            let params = [];
            const MA_DM_PHU_KIEN = 5;

            if (cartItemIds && cartItemIds.length > 0) {
                const placeholders = cartItemIds.map(() => '?').join(',');

                // ==========================================
                // BƯỚC 1: "ĐỌC VỊ" KHÁCH HÀNG TỪ GIỎ HÀNG
                // Lấy ra các Nhân Vật và Series mà họ đang định mua
                // ==========================================
                const sql_find_chars = `SELECT DISTINCT TenNhanVat, Series FROM MoHinh WHERE MaMoHinh IN (${placeholders})`;
                const [cartInfo] = await db.query(sql_find_chars, cartItemIds);

                // Lọc ra các tên không bị Null hoặc Rỗng
                const characters = cartInfo.map(item => item.TenNhanVat).filter(Boolean);
                const series = cartInfo.map(item => item.Series).filter(Boolean);

                // ==========================================
                // BƯỚC 2: XÂY DỰNG ĐIỀU KIỆN LỌC ĐỘNG
                // Mặc định luôn có Phụ Kiện (MA_DM = 5) để dự phòng
                // ==========================================
                let matchConditions = ["mh.MaDM = ?"];
                let matchParams = [MA_DM_PHU_KIEN];

                // Nếu giỏ hàng có mô hình nhân vật cụ thể -> Thêm vào điều kiện quét
                if (characters.length > 0) {
                    matchConditions.push(`mh.TenNhanVat IN (${characters.map(() => '?').join(',')})`);
                    matchParams.push(...characters);
                }
                if (series.length > 0) {
                    matchConditions.push(`mh.Series IN (${series.map(() => '?').join(',')})`);
                    matchParams.push(...series);
                }

                // ==========================================
                // BƯỚC 3: QUÉT KHO HÀNG VÀ SẮP XẾP ƯU TIÊN
                // ==========================================
                sql = `
                    SELECT mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.KichThuoc, hsx.TenHSX, mh.TrangThai,
                           (SELECT COALESCE(SUM(SoLuong), 0) FROM PhanLoai WHERE MaMoHinh = mh.MaMoHinh) AS SoLuong,
                           
                           -- Tích hợp tính giá khuyến mãi chuẩn chỉ
                           MIN(
                                pl.DonGia - COALESCE((
                                    SELECT MAX(CASE WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl.DonGia)) ELSE 0 END)
                                    FROM ChiTietKhuyenMai ctkm
                                    INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                                    WHERE ctkm.MaPhanLoai = pl.MaPhanLoai AND km.TrangThaiHoatDong = 1 AND km.ThoiGianBD <= NOW() AND km.ThoiGianKT >= NOW()
                                ), 0)
                           ) AS DonGiaKhuyenMai

                    FROM MoHinh mh
                    LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                    LEFT JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                    
                    WHERE mh.MaMoHinh NOT IN (${placeholders})
                      AND mh.HienThi = 1
                      AND (${matchConditions.join(' OR ')})
                    GROUP BY mh.MaMoHinh
                    
                    -- Mẹo SQL tối ưu: (mh.MaDM = 5) sẽ trả về 1 (True). 
                    -- Xếp tăng dần ASC tức là số 0 (Nhân vật/Series) sẽ đứng trên số 1 (Phụ kiện).
                    ORDER BY (mh.MaDM = ${MA_DM_PHU_KIEN}) ASC, RAND() 
                    LIMIT 4
                `;

                params = [...matchParams, ...cartItemIds];

            } else {
                // ==========================================
                // TRƯỜNG HỢP GIỎ HÀNG TRỐNG
                // Trả về 4 sản phẩm mới nhất (Kèm giá khuyến mãi)
                // ==========================================
                sql = `
                    SELECT mh.MaMoHinh, mh.TenMH, mh.AnhDaiDien, mh.KichThuoc, hsx.TenHSX, mh.TrangThai,
                           (SELECT COALESCE(SUM(SoLuong), 0) FROM PhanLoai WHERE MaMoHinh = mh.MaMoHinh) AS SoLuong,
                           MIN(
                                pl.DonGia - COALESCE((
                                    SELECT MAX(CASE WHEN ctkm.LoaiGiamGia = 'TienMat' THEN ctkm.ChietKhau WHEN ctkm.LoaiGiamGia = 'ChietKhau' THEN LEAST((pl.DonGia * ctkm.ChietKhau / 100), COALESCE(ctkm.GiaTriGiamToiDa, pl.DonGia)) ELSE 0 END)
                                    FROM ChiTietKhuyenMai ctkm
                                    INNER JOIN KhuyenMai km ON ctkm.MaKM = km.MaKM
                                    WHERE ctkm.MaPhanLoai = pl.MaPhanLoai AND km.TrangThaiHoatDong = 1 AND km.ThoiGianBD <= NOW() AND km.ThoiGianKT >= NOW()
                                ), 0)
                           ) AS DonGiaKhuyenMai
                    FROM MoHinh mh
                    LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                    LEFT JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                    WHERE mh.HienThi = 1
                    GROUP BY mh.MaMoHinh
                    ORDER BY mh.NgayPhatHanh DESC 
                    LIMIT 4
                `;
                params = [];
            }

            const [suggestions] = await db.query(sql, params);
            
            res.status(200).json({
                success: true,
                message: "Lấy sản phẩm gợi ý thành công",
                data: suggestions
            });
            
        } catch (error) {
            console.error("Lỗi khi lấy gợi ý giỏ hàng:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy gợi ý", error: error.message });
        }
    }
}
module.exports = product_view;

