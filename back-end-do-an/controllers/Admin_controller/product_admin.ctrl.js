const db = require('../../config/db');

const product_admin = {
    them_danh_muc_moi: async(req, res) =>{
        const connection = await db.getConnection();

        try{
            await connection.beginTransaction();
            const {TenDM, MoTa, ChiTiet} = req.body;
            const sql_check = `Select * from DanhMuc where TenDM = ?`;
            const [check] = await connection.query(sql_check,[TenDM]);
            //Kiểm tra xem tồn tại danh mục hàng này chưa?
            if(check.length > 0)
            {
                connection.release();
                return res.status(400).json({ message: "Đã tồn tại danh mục này!" });
            }
            await connection.beginTransaction();
            
            const sql_insert_dm = `Insert into DanhMuc(TenDM, MoTa) values (?,?)`;
            const [result_dm] = await connection.query(sql_insert_dm,[TenDM, MoTa]);
            
            const ma_DM_moi = result_dm.insertId;

            if(ChiTiet && ChiTiet !== 'undefined')
            {
                const cates = JSON.parse(ChiTiet);
                const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES (?, ?, ?)`;
                for (let cate of cates) {
                    await connection.query(sql_insert_chitiet, [ma_DM_moi, cate.name, cate.description]);
                }
            }
            
            await connection.commit();
            res.status(200).json({ 
                message: `Thành công tạo danh mục (và các chi tiết nếu có)!`,
                MaDMMoi: ma_DM_moi
            });
            
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thêm danh mục mới");
            res.status(500).json({ message: "Lỗi server khi thao tác thêm danh mục!"});
        }
        finally{
            connection.release();
        }
    },

    sua_thong_tin_danh_muc: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaDM = req.params.id; // Lấy ID từ URL
            const { TenDM, MoTa , ChiTiet} = req.body;

            // Kiểm tra xem tên mới gõ có bị trùng với một hãng KHÁC trong DB không
            const sql_check = `SELECT * FROM DanhMuc WHERE TenDM = ? AND MaDM != ?`;
            const [check] = await connection.query(sql_check, [TenDM, MaDM]);
            
            if(check.length > 0){
                return res.status(400).json({
                    success: false,
                    message: `Tên danh mục này đã được sử dụng!`
                });
            }

            const sql = `UPDATE DanhMuc SET TenDM=?, MoTa=? WHERE MaDM=?`;
            await connection.query(sql, [TenDM, MoTa || null, MaDM]);
            if(ChiTiet && ChiTiet !== 'undefined')
            {
                const cates = JSON.parse(ChiTiet);
                const sql_sua_chi_tiet = `Update ChiTietDanhMuc set TenChiTietDM = ?, MoTa = ? where MaChiTietDM = ?`
                const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES (?, ?, ?)`;
                for (let cate of cates) {
                    if(cate.id)
                        await connection.query(sql_sua_chi_tiet, [cate.name, cate.description, cate.id]);
                    else
                        await connection.query(sql_insert_chitiet, [MaDM, cate.name, cate.description]);
                }
            }
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin danh mục thành công!"
            });
        }
        catch (error) {
            connection.rollback();
            console.error("Lỗi khi sửa HSX: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi cập nhật danh mục!"});
        }
        finally{
            connection.release()
        }
    },

    them_chi_tiet_danh_muc_moi: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {MaDM, danhSachChiTiet} = req.body;
            if (!MaDM) {
                return res.status(400).json({ message: "Thiếu mã danh mục (MaDM)!" });
            }
            let soLuongThemThanhCong = 0;
            const sql_kiem_tra = `Select * from ChiTietDanhMuc where MaDM = ? and TenChiTietDM = ?`;
            const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES (?, ?, ?)`;
            if (Array.isArray(danhSachChiTiet) && danhSachChiTiet.length > 0) {
                for (let chiTiet of danhSachChiTiet) {
                    const [check] = await connection.query(sql_kiem_tra, [MaDM, danhSachChiTiet.Ten]);
                    if(check.length === 0){
                        await connection.query(sql_insert_chitiet,[MaDM, chiTiet.Ten, chiTiet.MoTa]);
                        soLuongThemThanhCong++;
                    }
                }
            }
            await connection.commit();
            res.status(200).json({ 
                message: `Đã xử lý xong! Thêm thành công ${soLuongThemThanhCong} chi tiết mới.`,
                MaDM_DaThem: MaDM
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thêm chi tiết danh mục mới");
            res.status(500).json({ message: "Lỗi server khi thao tác thêm danh mục!"});
        }
        finally{
            connection.release();
        }
    },

    them_hang_san_xuat_moi: async(req, res)=>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {TenHSX, MoTa} = req.body;
            const sql_check = `Select * from HangSanXuat where TenHSX = ?`
            const [check] = await connection.query(sql_check, [TenHSX]);
            if(check.length > 0){
                await connection.rollback();
                return res.status(400).json({
                    message: `Hãng sản xuất này đã tồn tại!`
                });
            }
            const sql = `Insert into HangSanXuat(TenHSX, MoTa, Logo) values (?,?,?)`;
            await connection.query(sql,[TenHSX, MoTa || null, Logo]);
            await connection.commit();
            res.status(200).json({ 
                success: true,
                message: `Đã xử lý xong! Thêm thành công hãng sản xuất ${TenHSX}.`,
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thêm HSX mới: " + error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác thêm HSX!"});
        }
        finally{
            connection.release();
        }
    },

    sua_thong_tin_HSX: async(req, res) => {
        try {
            const MaHSX = req.params.id; // Lấy ID từ URL
            const { TenHSX, MoTa } = req.body;

            // Kiểm tra xem tên mới gõ có bị trùng với một hãng KHÁC trong DB không
            const sql_check = `SELECT * FROM HangSanXuat WHERE TenHSX = ? AND MaHSX != ?`;
            const [check] = await db.query(sql_check, [TenHSX, MaHSX]);
            
            if(check.length > 0){
                return res.status(400).json({
                    success: false,
                    message: `Tên hãng sản xuất này đã được sử dụng!`
                });
            }

            let sql = `UPDATE HangSanXuat SET TenHSX=?, MoTa=?`;
            let values = [TenHSX, MoTa || null];
            if (req.file) {
                sql += `, Logo=?`;
                values.push(req.file.filename);
            }
            sql += ` WHERE MaHSX=?`;
            values.push(MaHSX);
            await db.query(sql, values);

            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin hãng thành công!"
            });
        }
        catch (error) {
            console.error("Lỗi khi sửa HSX: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi cập nhật HSX!"});
        }
    },

    xoa_HSX: async(req, res) =>{
        try {
            const MaHSX = req.params.id || req.body.MaHSX;
            const sql_kiem_tra = 'SELECT 1 FROM MoHinh WHERE MaHSX = ? LIMIT 1';
            const [check] = await db.query(sql_kiem_tra,[MaHSX]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0){
                return res.status(400).json({ success: false,
                    message: `Hiện tại HSX này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang HSX khác rồi hẵng xoá danh mục này nhé.`});}
            await db.query('Delete from HangSanXuat where MaHSX = ?',[MaHSX]);
            res.status(200).json({
                success: true,
                message: "Xoá HSX thành công!"
            })
        }
        catch (error){
            console.error("Lỗi khi xoá HSX: ", error);
            res.status(500).json({ success: false,message: "Lỗi server khi thao tác với HSX!"});
        }
    },

    get_brand: async(req, res)=>{
        try {
            const sql = 'SELECT * FROM HangSanXuat';
            const [brands] = await db.query(sql);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách hãng sản xuất thành công",
                data: brands
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách HSX:,", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy dữ liệu danh sách HSX!"
            });
        }
    },

    getAllvariant: async(req, res) => {
        try {
            const sql = 'SELECT * FROM DanhMuc';
            const [products] = await db.query(sql);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách danh mục thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách danh mục:,", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy dữ liệu danh sách danh mục"
            });
        }
    },

    getAlldetailvariant: async(req, res) => {
        try {
            const MaDM = req.params.MaDM;
            const sql = 'SELECT * FROM ChiTietDanhMuc where MaDM = ?';
            const [products] = await db.query(sql,[MaDM]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách danh mục thành công",
                data: products
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách danh mục:,", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy dữ liệu danh sách danh mục"
            });
        }
    },

    xoa_danh_muc: async(req, res) =>{
        try {
            
            const MaDM = req.params.id || req.body.id;
            const sql_kiem_tra = 'SELECT 1 FROM MoHinh WHERE MaDM = ? LIMIT 1';
            const [check] = await db.query(sql_kiem_tra,[MaDM]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0)
                return res.status(404).json({ success: false, message: `Hiện tại danh mục này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang danh mục khác rồi hẵng xoá danh mục này nhé.`});

            const sql_kiem_tra_ctdm = 'SELECT 1 FROM ChiTietDanhMuc WHERE MaDM = ? LIMIT 1';
            const [check_dm] = await db.query(sql_kiem_tra_ctdm,[MaDM]);
            //Kiểm tra tồn tại danh mục con trong danh mục không?
            if(check_dm.length > 0)
                return res.status(404).json({ success: false,message: `Hiện tại danh mục này đang tồn tại các danh mục chi tiết, 
                                            hãy xoá hết các danh mục chi tiết rồi quay lại nhé.`});
            
            await db.query('Delete from DanhMuc where MaDM = ?',[MaDM]);
            res.status(200).json({
                success: true,
                message: "Xoá danh mục hàng thành công!"
            })
        }
        catch (error){
            console.error("Lỗi khi xoá danh mục: ", error);
            res.status(500).json({ 
                success: false,message: "Lỗi server khi thao tác với danh mục!"});
        }
    },

    xoa_chi_tiet_danh_muc: async(req, res) =>{
        try {
            const MaChiTietDM = req.params.id || req.body.id;
            console.log("Chuẩn bị xoá danh mục: " + MaChiTietDM);
            const sql_kiem_tra = `SELECT 1 FROM MoHinh WHERE MaChiTietDM = ? LIMIT 1`;
            const [check] = await db.query(sql_kiem_tra,[MaChiTietDM]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0)
                return res.status(404).json({ success: false, message: `Hiện tại chi tiết danh mục này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang danh mục khác rồi hẵng xoá danh mục này nhé.`});

            await db.query('Delete from ChiTietDanhMuc where MaChiTietDM = ?',[MaChiTietDM]);
            res.status(200).json({
                success: true,
                message: "Xoá danh mục hàng thành công!"
            })
        }
        catch (error){
            console.error("Lỗi khi xoá chi tiết danh mục: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác với danh mục!"});
        }
    },

    
    them_mat_hang_moi: async(req, res) =>{
        const connection = await db.getConnection();

        try{
            await connection.beginTransaction();
            const DS_PL = JSON.parse(req.body.DanhSachPhanLoai);
            const {TenMH, MaHSX ,MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet ,
                LoaiHinhBan, KichThuoc, NgayPhatHanh, TienCocToiThieu, SoLuong, HienThi} = req.body;

            let tenAnhDaiDien = null;
            if (req.files && req.files['AnhDaiDien']) {
                // Lấy tên file của ảnh đầu tiên trong mảng AnhDaiDien
                tenAnhDaiDien = req.files['AnhDaiDien'][0].filename; 
            }

            let danhSachAnhPhu = [];
            if (req.files && req.files['BoSuuTapAnh']) {
                // Lấy ra danh sách các tên file của bộ sưu tập
                danhSachAnhPhu = req.files['BoSuuTapAnh'].map(file => file.filename);
            }

            const sql_them_san_pham = `Insert into MoHinh (TenMH, MaHSX, MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCoctoiThieu, HienThi, AnhDaiDien)
                                        Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const isVisible = HienThi !== undefined ? HienThi : 0;
            const [them_san_pham] = await connection.query(sql_them_san_pham, [TenMH, MaHSX, MaDM, MaChiTietDM || null, ChatLieu, DonGia, TrangThai, ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCocToiThieu, isVisible, tenAnhDaiDien]);
            
            const ma_san_pham_moi = them_san_pham.insertId;
            //Lấy mã sản phẩm mới thêm
            if (danhSachAnhPhu.length > 0) {
                const sql_them_anh = `INSERT INTO AnhMoHinh (LinkAnh, MaMoHinh) VALUES (?,?)`;
                for (let filename of danhSachAnhPhu) {
                    await connection.query(sql_them_anh, [filename, ma_san_pham_moi]);
                }
            }
            const sql_them_phan_loai = `Insert into Phanloai (ChiTietPhanLoai, SoLuong, MaMoHinh, DonGia, HienThi) values (?,?,?,?,?)`;
            await connection.query(sql_them_phan_loai,['Mặc định', SoLuong, ma_san_pham_moi, DonGia, HienThi]);
            if (req.body.DanhSachPhanLoai && req.body.DanhSachPhanLoai !== 'undefined') {
                try {
                    const danhsachPL = JSON.parse(req.body.DanhSachPhanLoai);
                    
                    if (Array.isArray(danhsachPL) && danhsachPL.length > 0) {
                        for (let variant of danhsachPL) {
                            if (variant.name && variant.name.trim().toLowerCase() !== 'mặc định') {
                                const variantVisibility = (isVisible === 0) ? 0 : (variant.isVisible !== undefined ? variant.isVisible : 1);
                                
                                await connection.query(sql_them_phan_loai, [
                                    variant.name, 
                                    variant.stock || 0, 
                                    ma_san_pham_moi, 
                                    variant.sellPrice || DonGia || 0, 
                                    variantVisibility
                                ]);
                            }
                        }
                    }
                } catch (parseError) {
                    console.error("Lỗi khi đọc JSON phân loại đặc biệt:", parseError);
                    // Dù lỗi phân loại phụ, nhưng sản phẩm chính đã lưu, ta vẫn cho pass hoặc báo lỗi nhẹ.
                }
            }
            await connection.commit();
            res.status(200).json({
                message: "Thêm sản phẩm mới thành công!"
            });

        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thêm sản phẩm mới: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác với danh mục!"});
        }
        finally{
            connection.release();
        }
    },

    them_phan_loai_cho_san_pham: async(req, res)=>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {MaMoHinh, DS_PL} = req.body;
            const sql_check = "select HienThi from MoHinh where MaMoHinh = ?";
            const [check] = await connection.query(sql_check, [MaMoHinh]);
            
            if(check.length === 0){
                await connection.rollback();
                return res.status(404).json({
                    message: "Không tồn tại sản phẩm này để thêm phân loại."
                });
            }

            const HienThi_SP_Goc = check[0].HienThi;

            const sql_them_phan_loai = `Insert into Phanloai (ChiTietPhanLoai, SoLuong, MaMoHinh, DonGia, HienThi) values (?,?,?,?,?)`;
            if(Array.isArray(DS_PL) && DS_PL.length > 0){
                    for(let variant of DS_PL){
                        const visibility = (HienThi_SP_Goc === 0) ? 0 : (variant.HienThi !== undefined ? variant.HienThi : 1);

                        await connection.query(sql_them_phan_loai, [
                            variant.ChiTietPhanLoai, 
                            variant.SoLuong, 
                            MaMoHinh, 
                            variant.DonGia, 
                            visibility
                        ]);
                    }
            }
            await connection.commit();
            res.status(200).json({
                message: "Thêm phân loại mới thành công!",
                MaMoHinh: MaMoHinh
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thêm sản phẩm mới: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác với danh mục!"});
        }
        finally{
            connection.release();
        }
    },

    //Sửa thông tin mặt hàng (có thể sửa cả phân loại, thêm)
    sua_thong_tin_mat_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const MaMH = req.params.id || req.body.MaMH;
            const {TenMH, MaHSX, MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet ,
                LoaiHinhBan, Danh_sach_anh, KichThuoc, SoLuong, NgayPhatHanh, TienCocToiThieu, DanhSachPhanLoai, HienThi, AnhCuCanXoa} = req.body;
            const sql_sua_tt_san_pham = `Update MoHinh SET
                                        TenMH = ?,
                                        MaHSX = ?,
                                        MaDM = ?,
                                        MaChiTietDM = ?,
                                        ChatLieu = ?,
                                        DonGia = ?,
                                        TrangThai = ?,
                                        ThongTinChiTiet = ?,
                                        KichThuoc = ?,
                                        NgayPhatHanh = ?,
                                        LoaiHinhBan = ?,
                                        TienCocToiThieu = ?,
                                        HienThi = ?
                                        where MaMoHinh = ?
                                        `;
            const isVisible = HienThi !== undefined ? HienThi : 0;
            await connection.query(sql_sua_tt_san_pham, [TenMH, MaHSX, MaDM, MaChiTietDM || null, ChatLieu, DonGia, TrangThai, 
                                        ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCocToiThieu, isVisible, MaMH]);
            
            // 2. CẬP NHẬT ẢNH ĐẠI DIỆN (Chỉ update nếu có upload file mới)
            if (req.files && req.files['AnhDaiDien']) {
                const tenAnhMoi = req.files['AnhDaiDien'][0].filename;
                await connection.query(`UPDATE MoHinh SET AnhDaiDien = ? WHERE MaMoHinh = ?`, [tenAnhMoi, MaMH]);
            }

            // 3. THÊM ẢNH BỘ SƯU TẬP MỚI (Append)
            if (req.files && req.files['BoSuuTapAnhMoi']) {
                const sql_them_anh = `INSERT INTO AnhMoHinh (LinkAnh, MaMoHinh) VALUES (?, ?)`;
                for (let file of req.files['BoSuuTapAnhMoi']) {
                    await connection.query(sql_them_anh, [file.filename, MaMH]);
                }
            }

            if (AnhCuCanXoa) {
                const arrXoa = JSON.parse(AnhCuCanXoa);
                if (arrXoa.length > 0) {
                    // Tạo ra các dấu ? tương ứng với số lượng ảnh cần xóa
                    const placeholders = arrXoa.map(() => '?').join(',');
                    // Xóa khỏi Database
                    await connection.query(
                        `DELETE FROM AnhMoHinh WHERE MaMoHinh = ? AND LinkAnh IN (${placeholders})`, 
                        [MaMH, ...arrXoa]
                    );
                }
            }
            
            // Xử lý mảng biến thể đặc biệt
            if (DanhSachPhanLoai && DanhSachPhanLoai !== 'undefined') {
                const variants = JSON.parse(DanhSachPhanLoai);
                if (Array.isArray(variants)) {
                    const sql_sua_phan_loai = `UPDATE Phanloai SET ChiTietPhanLoai=?, DonGia=?, SoLuong=?, HienThi=? WHERE MaPhanLoai=?`;
                    const sql_them_phan_loai = `INSERT INTO Phanloai (ChiTietPhanLoai, MaMoHinh, DonGia, SoLuong, HienThi) VALUES (?,?,?,?,?)`;
                    
                    for (let variant of variants) {
                        if (variant.name && variant.name.trim().toLowerCase() !== 'mặc định') {
                            const variantVisibility = isVisible === 0 ? 0 : (variant.isVisible !== undefined ? parseInt(variant.isVisible) : 1);
                            
                            if (variant.id) { // Nếu có ID -> Sửa
                                await connection.query(sql_sua_phan_loai, [variant.name, variant.sellPrice, variant.stock, variantVisibility, variant.id]);
                            } else {          // Nếu chưa có ID -> Thêm mới
                                await connection.query(sql_them_phan_loai, [variant.name, MaMH, variant.sellPrice || safeDonGia, variant.stock || 0, variantVisibility]);
                            }
                        }
                    }
                }
            }
            
            await connection.commit();
            res.status(200).json({
                message: "Sửa thông tin sản phẩm mới thành công!"
            });

        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin sản phẩm: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác với sản phẩm!"});
        }
        finally{
            connection.release();
        }
    },
    
    //Xoá theo cách ẩn với khách hàng, tránh ảnh hướng báo cáo thống kê
    An_mat_hang: async(req, res) =>{
        try{
            const {MaMH} = req.body;
            const sql_xoa_mem = `
                                Update MoHinh
                                Set TrangThai = 'Ngừng kinh doanh', HienThi = 0
                                Where MaMoHinh = ?`;
            const [ket_qua] = await db.query(sql_xoa_mem, [MaMH]);
            if(ket_qua.affectedRows === 0){
                return res.status(404).json({ message: "Không thấy sản phẩm cần ẩn!"});
            }
            const sql_xoa_mem_cho_pl = `
                                        Update PhanLoai
                                        Set HienThi = 0
                                        where MaMoHinh =?`;
            await db.query(sql_xoa_mem_cho_pl, [MaMH]);
            res.status(200).json({
                success: true,
                message: "Đã chuyển sản phẩm vào trạng thái ẩn!"
            });
        }
        catch (error){
            console.error("Lỗi khi ẩn sản phẩm: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác ẩn!" });
        }
    },

    An_phan_loai: async(req, res) =>{
        try{
            const {MaPL} = req.body;
            const sql_xoa_mem = `
                                Update PhanLoai
                                Set HienThi = 0
                                Where MaPhanLoai = ?`;
            const [ket_qua] = await db.query(sql_xoa_mem, [MaPL]);
            if(ket_qua.affectedRows === 0){
                return res.status(404).json({ message: "Không thấy phân loại cần ẩn!"});
            }
            res.status(200).json({
                success: true,
                message: "Đã chuyển phân loại vào trạng thái ẩn!"
            });
        }
        catch (error){
            console.error("Lỗi khi ẩn sản phẩm: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác ẩn!" });
        }
    },

    thay_doi_hien_thi_mat_hang: async(req, res) => {
    const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Frontend gửi lên MaMH và biến HienThi (0 là Ẩn, 1 là Hiện)
            const { MaMH, HienThi } = req.body; 

            // Nếu HienThi = 0 thì là Ngừng kinh doanh, nếu = 1 thì là Đang kinh doanh (hoặc Còn hàng tùy bạn)
            const trangThaiMoi = HienThi === 0 ? 'Ngừng kinh doanh' : 'Còn hàng';

            // 1. Cập nhật bảng Mô hình
            const sql_update_mh = `UPDATE MoHinh SET TrangThai = ?, HienThi = ? WHERE MaMoHinh = ?`;
            const [ket_qua] = await connection.query(sql_update_mh, [trangThaiMoi, HienThi, MaMH]);
            
            if(ket_qua.affectedRows === 0){
                await connection.rollback();
                return res.status(404).json({ message: "Không tìm thấy sản phẩm!"});
            }

            // 2. Cập nhật đồng loạt các Phân loại của Mô hình đó
            const sql_update_pl = `UPDATE PhanLoai SET HienThi = ? WHERE MaMoHinh = ?`;
            await connection.query(sql_update_pl, [HienThi, MaMH]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: HienThi === 0 ? "Đã ẩn sản phẩm!" : "Đã hiển thị lại sản phẩm thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thay đổi hiển thị sản phẩm: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác!" });
        } finally {
            connection.release();
        }
    },

    liet_ke_mat_hang: async(req, res)=>{
        try {
            //Thông tin trang và số lượng hiển thị giới hạn trên 1 trang
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Tính toán vị trí cắt dữ liệu
            const offset = (page - 1) * limit;

            //Các tham số bộ lọc frontend gửi lên
            const { 
                keyword, minprice, maxprice, danhmuc, chitietdanhmuc, 
                hsx, NgayBatDau, NgayKetThuc, LoaiHinhBan, HienThi,
                TinhTrangTonKho, // Lọc: 'sap_het' (<5) hoặc 'het_hang' (=0)
                CoKhuyenMai,
                Sapxep      // Lọc: 'true'
            } = req.query;


            let condition = [];
            let value = [];

            if(keyword){
                condition.push("mh.TenMH like ?");
                value.push(`%${keyword}%`);
            }

            if(minprice){
                condition.push("mh.DonGia >= ?");
                value.push(minprice);
            }

            if(maxprice){
                condition.push("mh.DonGia <= ?");
                value.push(maxprice);
            }

            if(danhmuc){
                condition.push("mh.MaDM = ?");
                value.push(danhmuc);
            }

            if(chitietdanhmuc){
                condition.push("mh.MaChiTietDM = ?");
                value.push(chitietdanhmuc);
            }

            if(hsx){
                condition.push("mh.MaHSX = ?");
                value.push(hsx);
            }

            if(NgayBatDau){
                condition.push("mh.NgayPhatHanh >= ?");
                value.push(NgayBatDau);
            }

            if(NgayKetThuc){
                condition.push("mh.NgayPhatHanh <= ?");
                value.push(NgayKetThuc);
            }

            if(HienThi){
                condition.push("mh.HienThi = ?");
                value.push(HienThi);
            }

            if(LoaiHinhBan === 'preorder'){
                condition.push("mh.LoaiHinhBan = ?");
                value.push('Pre-order');
            }
            else if(LoaiHinhBan === 'order'){
                condition.push("mh.LoaiHinhBan = ?");
                value.push('Order');
            }
            else if(LoaiHinhBan === 'cosan'){
                condition.push("mh.LoaiHinhBan = ?");
                value.push('Có sẵn'); // Đã thêm dấu nháy đơn đóng
            }
            
            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";
            
            let havingcondition = [];
            if(TinhTrangTonKho === 'low'){
                havingcondition.push('SoLuong <= 3 and SoLuong > 0');
            } else if(TinhTrangTonKho === 'out'){
                havingcondition.push('SoLuong = 0');
            }

            if(CoKhuyenMai){
                havingcondition.push('dongiakhuyenmai is not null');
            }
            let havingClause = havingcondition.length ? "Having " + havingcondition.join(" and ") : "";

            let filter = "";
            if(Sapxep === 'price_asc')
                filter = "Order by mh.DonGia Asc";
            else if(Sapxep === 'price_desc')
                filter = "Order by mh.DonGia Desc";
            else if(Sapxep === 'stock_asc')
                filter = "Order by mh.SoLuong Asc";
            else if(Sapxep === 'date_desc')
                filter = "Order by mh.NgayPhatHanh desc";
            else
                filter = "Order by mh.MaMoHinh desc";

            const sql_core = `SELECT mh.MaMoHinh, mh.TenMH, mh.MaHSX, mh.MaDM, TenDM, mh.MaChiTietDM, mh.ChatLieu, mh.KichThuoc, TenChiTietDM, mh.DonGia, mh.TrangThai, mh.LoaiHinhBan,
                mh.AnhDaiDien, mh.NgayPhatHanh, TenHSX, mh.HienThi, mh.TienCocToiThieu, mh.ThongTinChiTiet,
                (
                    SELECT COALESCE(SUM(SoLuong), 0) 
                    FROM PhanLoai 
                    WHERE MaMoHinh = mh.MaMoHinh
                ) AS SoLuong,
                (
                    Select (mh.DonGia - ctkm.ChietKhau)
                    from ChiTietKhuyenMai ctkm
                    inner join KhuyenMai km on km.MaKM = ctkm.MaKM
                    inner join PhanLoai pl on pl.MaPhanLoai = ctkm.MaPhanLoai
                    where km.ThoiGianBD <= now() and km.ThoiGianKT >= now() and pl.MaPhanLoai = ctkm.MaPhanLoai
                    order by ctkm.ChietKhau desc
                    limit 1
                ) As dongiakhuyenmai
                FROM MoHinh mh
                left join DanhMuc On DanhMuc.MaDM = mh.MaDM
                left join ChiTietDanhMuc on ChiTietDanhMuc.MaChiTietDM = mh.MaChiTietDM
                INNER JOIN HangSanXuat ON mh.MaHSX = HangSanXuat.MaHSX 
                ${whereClause}
                ${havingClause}`;


            // Việc này BẮT BUỘC để Frontend biết có tổng cộng bao nhiêu trang
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count,value);
            const totalItems = countResult[0].total;
            //Làm tròn lên
            const totalPage = Math.ceil(totalItems/limit);

            const sql_ds = `${sql_core}
                ${filter}
                Limit ? offset ?`;


            const sql_params = [...value, limit, offset]
            const [products] = await db.query(sql_ds, sql_params);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách sản phẩm thành công!",
                data: products,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });
        }
        catch(error) {
            console.error("Xảy ra lỗi khi lấy danh sách thông tin sản phẩm: " + error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy danh sách thông tin sản phẩm!"
            });
        }
    },

    xem_thong_tin_san_pham: async(req, res)=>{
        try{
            const MaMH = req.params.MaMH;
            console.log("👉 1. Backend đang đi tìm sản phẩm có MaMoHinh =", MaMH);
            const sql = `Select mh.MaMoHinh, mh.AnhDaiDien, mh.TenMH, mh.ChatLieu, mh.DonGia, mh.TrangThai, mh.ThongTinChiTiet, 
                            mh.KichThuoc, mh.NgayPhatHanh, mh.LoaiHinhBan, mh.TienCocToiThieu,
                            (
                                SELECT COALESCE(SUM(SoLuong), 0) 
                                FROM PhanLoai 
                                WHERE MaMoHinh = mh.MaMoHinh
                            ) AS SoLuongTong,
                             TenHSX, TenDM, TenChiTietDM,
                             GROUP_CONCAT(anh.LinkAnh) AS DanhSachAnhPhu
                            FROM MoHinh mh
                            left join DanhMuc On DanhMuc.MaDM = mh.MaDM
                            left join ChiTietDanhMuc on ChiTietDanhMuc.MaChiTietDM = mh.MaChiTietDM
                            LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                            LEFT JOIN AnhMoHinh anh ON mh.MaMoHinh = anh.MaMoHinh
                            WHERE mh.MaMoHinh = ?
                            GROUP BY mh.MaMoHinh`;
            const [ket_qua] = await db.query(sql,[MaMH]);
            if(ket_qua.length === 0)
            {
                return res.status(404).json({
                            success: false,
                            message: "Sản phẩm không tồn tại!"
                        });
            }
            const product_detail = ket_qua[0];
            if(product_detail.DanhSachAnhPhu){
                product_detail.galleryUrls = product_detail.DanhSachAnhPhu.split(',');
            }
            else{
                product_detail.galleryUrls = [];
            }

            const sql_phan_loai = `Select MaPhanLoai, ChiTietPhanLoai, DonGia, SoLuong, HienThi from PhanLoai where MaMoHinh = ?`;
            const [ket_qua_pl] = await db.query(sql_phan_loai,[MaMH]);
            product_detail.DS_PL = ket_qua_pl;

            res.status(200).json({
                success: true,
                message: "Lấy thông tin sản phẩm thành công!",
                data: product_detail
            });
        }
        catch (error){
            console.error("Xảy ra lỗi khi lấy thông tin sản phẩm: " + error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy thông tin sản phẩm!"
            });
        }
    },

    liet_ke_brand: async(req, res)=>{
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Tính toán vị trí cắt dữ liệu
            const offset = (page - 1) * limit;

            const {keyword, sapxep} = req.query;
            let condition = [];
            let value = [];
            if(keyword){
                condition.push("TenHSX like ?");
                value.push(`%${keyword}%`);
            }
            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";

            let filter = "";
            if(sapxep === 'z-a'){
                filter += "Order by TenHSX DESC";
            }
            else
                filter += "Order by TenHSX ASC";
    
            const sql_core = `SELECT hsx.MaHSX, TenHSX, MoTa, Logo,
                            (
                                Select count(*)
                                from MoHinh
                                where MoHinh.MaHSX = hsx.MaHSX
                            ) as TongSoLuongSanPham
                                 FROM HangSanXuat hsx
                            ${whereClause}`;
            const sql_count = `Select count(*) as total from (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count, value);
            const totalBrands = countResult[0].total;
            
            const totalPage = Math.ceil(totalBrands/limit);

            const sql_ds = `${sql_core}
                            ${filter}
                            limit ? offset ?`;

            const sql_params = [...value, limit, offset];
            const [brands] = await db.query(sql_ds, sql_params);
            res.status(200).json({
                success: true,
                message: "Lấy danh sách hãng sản xuất thành công",
                data: brands,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalBrands: totalBrands,
                    totalPage: totalPage
                    }
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách HSX:,", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy dữ liệu danh sách HSX!"
            });
        }
    },

    thong_ke_hang_san_xuat: async(req, res) => {
        try {
            // 1. Đếm tổng số hãng sản xuất
            const [brandCount] = await db.query('SELECT COUNT(*) as total FROM HangSanXuat');

            // 2. Tính tổng số lượng tất cả sản phẩm trong kho (Gom từ bảng Phanloai)
            const [productCount] = await db.query('SELECT COUNT(*) as total FROM MoHinh');

            res.status(200).json({
                success: true,
                data: {
                    tongSoHang: brandCount[0].total,
                    tongSoSanPham: productCount[0].total
                }
            });
        } catch (error) {
            console.error("Lỗi khi lấy thống kê HSX: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thống kê!" });
        }
    },

    liet_ke_danh_muc: async(req, res)=>{
        try {
            // 1. KIỂM TRA CỜ "LẤY TẤT CẢ" (Dùng cho các thẻ <select> ở Frontend)
            const isGetAll = req.query.getAll === 'true';

            if (isGetAll) {
                // Lấy tất cả danh mục cha
                const [cates] = await db.query(`SELECT MaDM, TenDM FROM DanhMuc ORDER BY TenDM ASC`);
                // Lấy tất cả danh mục con
                const [subCates] = await db.query(`SELECT MaChiTietDM, TenChiTietDM, MaDM FROM ChiTietDanhMuc`);
                
                // Gộp danh mục con vào danh mục cha tương ứng
                const finalCates = cates.map(cate => ({
                    ...cate,
                    DanhSachDanhMucCon: subCates.filter(sub => sub.MaDM === cate.MaDM)
                }));

                return res.status(200).json({ success: true, data: finalCates });
            }

            // 2. LUỒNG PHÂN TRANG (Dành cho trang Quản lý danh mục)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const {keyword, sapxep} = req.query;
            let condition = [];
            let value = [];

            if(keyword){
                // Thêm bí danh dm. để tránh lỗi trùng cột nếu sau này có JOIN thêm
                condition.push("dm.TenDM LIKE ?"); 
                value.push(`%${keyword}%`);
            }
            let whereClause = condition.length > 0 ? "WHERE " + condition.join(" AND ") : "";

            let filter = "ORDER BY dm.TenDM ASC";
            if(sapxep === 'z-a'){
                filter = "ORDER BY dm.TenDM DESC";
            }
    
            const sql_core = `SELECT dm.MaDM, dm.TenDM, dm.MoTa, 
                                (
                                    SELECT count(*)
                                    FROM ChiTietDanhMuc ctdm
                                    WHERE ctdm.MaDM = dm.MaDM
                                ) AS TongSoLuongDanhMucCon
                              FROM DanhMuc dm
                              ${whereClause}`;

            const sql_count = `SELECT count(*) AS total FROM (${sql_core}) AS temptable`;
            const [countResult] = await db.query(sql_count, value);
            const totalCates = countResult[0].total;
            
            const totalPage = Math.ceil(totalCates/limit);

            const sql_ds = `
                ${sql_core}
                ${filter}
                LIMIT ? OFFSET ?
            `;

            const sql_params = [...value, limit, offset];
            const [cates] = await db.query(sql_ds, sql_params);

            // ---------------------------------------------------------
            // BƯỚC MỚI: TÌM VÀ GỘP DANH MỤC CON CHO CÁC DANH MỤC VỪA TÌM ĐƯỢC
            // ---------------------------------------------------------
            let finalCates = cates; 
            
            if (cates.length > 0) {
                // Lấy ra danh sách các MaDM của trang hiện tại (VD: [1, 2, 3])
                const arrMaDM = cates.map(c => c.MaDM);
                
                // Gọi API lấy các danh mục con thuộc các danh mục cha này
                // Mẹo MySQL2: Khi dùng IN (?), bạn phải truyền mảng vào trong một mảng khác [arrMaDM]
                const [subCates] = await db.query(
                    `SELECT MaChiTietDM, TenChiTietDM, MaDM, MoTa FROM ChiTietDanhMuc WHERE MaDM IN (?)`, 
                    [arrMaDM]
                );

                // Nhét danh mục con vào đúng danh mục cha
                finalCates = cates.map(cate => {
                    return {
                        ...cate,
                        // Tạo ra một mảng con chứa các chi tiết danh mục
                        DanhSachDanhMucCon: subCates.filter(sub => sub.MaDM === cate.MaDM)
                    };
                });
            }

            res.status(200).json({
                success: true,
                message: "Lấy danh sách danh mục thành công",
                data: finalCates, // Trả về mảng đã gộp
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalCates: totalCates,
                    totalPage: totalPage
                }
            });
        }
        catch (error){
            console.error("Lỗi khi lấy danh sách danh mục:,", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy dữ liệu danh sách danh mục!"
            });
        }
    },
}
module.exports = product_admin;