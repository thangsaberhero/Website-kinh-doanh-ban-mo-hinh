const db = require('../../config/db');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const product_admin = {
    them_danh_muc_moi: async(req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            const { TenDM, MoTa, ChiTiet, DanhMucNoiBat } = req.body;
            const MaTK = req.user.id;

            // Xử lý biến DanhMucNoiBat (Đảm bảo giá trị luôn là 1 hoặc 0)
            const isNoiBat = (DanhMucNoiBat == 1 || DanhMucNoiBat === 'true') ? 1 : 0;

            // 2. XỬ LÝ MẢNG ẢNH TỪ MULTER (CỰC KỲ QUAN TRỌNG)
            // Nếu có up ảnh thì req.files sẽ là mảng chứa các file, nếu không có thì gán mảng rỗng []
            const uploadedFiles = req.files || [];
            console.log("📦 Dữ liệu file từ Cloudinary:", uploadedFiles);
            
            // Map qua mảng file để lấy đường dẫn (path/url). 
            // Lưu ý: Nếu bạn dùng Cloudinary, đường dẫn thường nằm ở file.path
            const arrUrlAnh = uploadedFiles.map(file => file.path || file.secure_url || file.url);
            
            // Ép mảng URL thành chuỗi JSON (VD: '["url1", "url2"]') để lưu vào cột TEXT
            const jsonDanhSachAnh = JSON.stringify(arrUrlAnh);

            // 3. VALIDATION
            if (!TenDM || TenDM.trim() === '') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Tên danh mục không được để trống!" });
            }

            // 4. KIỂM TRA TRÙNG LẶP
            const sql_check = `SELECT MaDM FROM DanhMuc WHERE TenDM = ?`;
            const [check] = await connection.query(sql_check, [TenDM]);
            
            if (check.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Đã tồn tại danh mục này!" });
            }
            
            // 5. THÊM DANH MỤC CHA (ĐÃ UPDATE CÂU SQL)
            // Thêm DanhSachAnh và DanhMucNoiBat vào câu lệnh INSERT
            const sql_insert_dm = `INSERT INTO DanhMuc(TenDM, MoTa, DanhSachAnh, DanhMucNoiBat) VALUES (?, ?, ?, ?)`;
            const [result_dm] = await connection.query(sql_insert_dm, [TenDM, MoTa, jsonDanhSachAnh, isNoiBat]);
            const ma_DM_moi = result_dm.insertId;

            // 6. THÊM DANH MỤC CON (TỐI ƯU BULK INSERT)
            if (ChiTiet && ChiTiet !== 'undefined') {
                const cates = typeof ChiTiet === 'string' ? JSON.parse(ChiTiet) : ChiTiet;
                
                if (Array.isArray(cates) && cates.length > 0) {
                    const values = cates.map(cate => [
                        ma_DM_moi, cate.name, cate.description || null
                    ]);
                    
                    const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES ?`;
                    await connection.query(sql_insert_chitiet, [values]);
                }
            }
            
            // 7. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Thêm mới danh mục sản phẩm #${ma_DM_moi}: "${TenDM}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'CATEGORY_CREATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({ 
                success: true,
                message: `Thành công tạo danh mục (và các chi tiết nếu có)!`,
                MaDMMoi: ma_DM_moi
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thêm danh mục mới: ", error); 
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác thêm danh mục!"});
        }
        finally {
            if (connection) connection.release(); 
        }
    },

    sua_thong_tin_danh_muc: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaDM = req.params.id; 
            
            const { TenDM, MoTa , ChiTiet, DanhMucNoiBat } = req.body;
            const MaTK = req.user.id;
            
            // Xử lý biến DanhMucNoiBat (Đảm bảo giá trị luôn là 1 hoặc 0)
            const isNoiBat = (DanhMucNoiBat == 1 || DanhMucNoiBat === 'true') ? 1 : 0;

            if (!TenDM || TenDM.trim() === '') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Tên danh mục không được để trống!" });
            }

            const [kiemtra] = await connection.query(`SELECT MaDM FROM DanhMuc WHERE MaDM = ?`,[MaDM]);
            if(kiemtra.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: `Không tìm thấy danh mục cần sửa!` });
            }

            // Kiểm tra trùng lặp tên
            const sql_check = `SELECT * FROM DanhMuc WHERE TenDM = ? AND MaDM != ?`;
            const [check] = await connection.query(sql_check, [TenDM, MaDM]);
            
            if(check.length > 0){
                await connection.rollback();
                return res.status(400).json({ success: false, message: `Tên danh mục này đã được sử dụng!` });
            }

            // 2. XỬ LÝ LOGIC CẬP NHẬT ẢNH THÔNG MINH
            let updateImageQuery = "";
            let queryParams = [TenDM, MoTa || null, isNoiBat];

            // Nếu Admin có chọn tải lên file ảnh mới
            if (req.files && req.files.length > 0) {
                const arrUrlAnh = req.files.map(file => file.path); // Lấy url từ Cloudinary
                const jsonDanhSachAnh = JSON.stringify(arrUrlAnh);
                
                updateImageQuery = ", DanhSachAnh = ?"; // Thêm câu lệnh cập nhật ảnh
                queryParams.push(jsonDanhSachAnh);      // Nhét giá trị ảnh vào mảng tham số
            }
            
            // Cuối cùng mới đẩy MaDM vào mảng tham số để dùng cho WHERE
            queryParams.push(MaDM); 

            // 3. CẬP NHẬT DANH MỤC CHA
            // SQL sẽ tự động co giãn tùy thuộc vào việc updateImageQuery có nội dung hay không
            const sql = `UPDATE DanhMuc SET TenDM=?, MoTa=?, DanhMucNoiBat=? ${updateImageQuery} WHERE MaDM=?`;
            await connection.query(sql, queryParams);

            // 4. CẬP NHẬT DANH MỤC CON (Giữ nguyên logic của bạn)
            if(ChiTiet && ChiTiet !== 'undefined') {
                const cates = typeof ChiTiet === 'string' ? JSON.parse(ChiTiet) : ChiTiet;
                const sql_sua_chi_tiet = `UPDATE ChiTietDanhMuc SET TenChiTietDM = ?, MoTa = ? WHERE MaChiTietDM = ?`;
                const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES (?, ?, ?)`;
                
                for (let cate of cates) {
                    if(cate.id)
                        await connection.query(sql_sua_chi_tiet, [cate.name, cate.description, cate.id]);
                    else
                        await connection.query(sql_insert_chitiet, [MaDM, cate.name, cate.description]);
                }
            }

            // 5. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Cập nhật thông tin danh mục #${MaDM}: "${TenDM}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'CATEGORY_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin danh mục thành công!"
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi sửa danh mục: ", error); // Đã fix thông báo console
            res.status(500).json({ success: false, message: "Lỗi server khi cập nhật danh mục!"});
        }
        finally{
            if (connection) connection.release();
        }
    },

    // them_chi_tiet_danh_muc_moi: async(req, res) =>{
    //     const connection = await db.getConnection();
    //     try{
    //         await connection.beginTransaction();
    //         const {MaDM, danhSachChiTiet} = req.body;
    //         if (!MaDM) {
    //             return res.status(400).json({ message: "Thiếu mã danh mục (MaDM)!" });
    //         }
    //         let soLuongThemThanhCong = 0;
    //         const sql_kiem_tra = `Select * from ChiTietDanhMuc where MaDM = ? and TenChiTietDM = ?`;
    //         const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES (?, ?, ?)`;
    //         if (Array.isArray(danhSachChiTiet) && danhSachChiTiet.length > 0) {
    //             for (let chiTiet of danhSachChiTiet) {
    //                 const [check] = await connection.query(sql_kiem_tra, [MaDM, danhSachChiTiet.Ten]);
    //                 if(check.length === 0){
    //                     await connection.query(sql_insert_chitiet,[MaDM, chiTiet.Ten, chiTiet.MoTa]);
    //                     soLuongThemThanhCong++;
    //                 }
    //             }
    //         }
    //         await connection.commit();
    //         res.status(200).json({ 
    //             message: `Đã xử lý xong! Thêm thành công ${soLuongThemThanhCong} chi tiết mới.`,
    //             MaDM_DaThem: MaDM
    //         });
    //     }
    //     catch (error){
    //         await connection.rollback();
    //         console.error("Lỗi khi thêm chi tiết danh mục mới");
    //         res.status(500).json({ message: "Lỗi server khi thao tác thêm danh mục!"});
    //     }
    //     finally{
    //         connection.release();
    //     }
    // },

    them_hang_san_xuat_moi: async(req, res)=>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {TenHSX, MoTa} = req.body;
            const MaTK = req.user.id;
            if (!TenHSX || TenHSX.trim() === '') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Tên hãng sản xuất không được để trống!" });
            }
            let logoFileName = null;
            if (req.file) {
                logoFileName = req.file.filename;
            }
            const sql_check = `Select * from HangSanXuat where TenHSX = ?`
            const [check] = await connection.query(sql_check, [TenHSX]);
            if(check.length > 0){
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Hãng sản xuất này đã tồn tại!`
                });
            }
            const sql = `Insert into HangSanXuat(TenHSX, MoTa, Logo) values (?,?,?)`;
            const [sql_hsx] = await connection.query(sql,[TenHSX, MoTa || null, logoFileName]);
            const MaHSX = sql_hsx.insertId;
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Thêm mới HSX #${MaHSX}: "${TenHSX}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'MANUFACTURER_CREATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
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
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaHSX = req.params.id;
            const { TenHSX, MoTa } = req.body;
            if (!TenHSX || TenHSX.trim() === '') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Tên hãng sản xuất không được để trống!" });
            }
            const MaTK = req.user.id;
            const sql_check = `SELECT * FROM HangSanXuat WHERE TenHSX = ? AND MaHSX != ?`;
            const [check] = await connection.query(sql_check, [TenHSX, MaHSX]);
            
            if(check.length > 0){
                await connection.rollback();
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
            await connection.query(sql, values);
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Thêm mới HSX #${MaHSX}: "${TenHSX}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'MANUFACTURER_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin hãng thành công!"
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi sửa HSX: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi cập nhật HSX!"});
        }
    },

    xoa_HSX: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaHSX = req.params.id || req.body.MaHSX;
            const MaTK = req.user.id;
            const [check_ton_tai] = await connection.query(`Select TenHSX from HangSanXuat where MaHSX = ?`,[MaHSX]);
            if(check_ton_tai.length === 0)
            {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Không tìm thấy hãng sản xuất cần xoá!`
                });
            }
            const tenHSXStr = check_ton_tai[0].TenHSX;

            const [check] = await connection.query('SELECT 1 FROM MoHinh WHERE MaHSX = ? LIMIT 1',[MaHSX]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0){
                await connection.rollback();
                return res.status(400).json({ success: false,
                    message: `Hiện tại HSX này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang HSX khác rồi hẵng xoá danh mục này nhé.`});
                                        }
            await connection.query('Delete from HangSanXuat where MaHSX = ?',[MaHSX]);
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Xoá hãng sản xuất #${MaHSX}: "${tenHSXStr}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'MANUFACTURER_DELETE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Xoá HSX thành công!"
            });
        }
        catch (error){
            console.error("Lỗi khi xoá HSX: ", error);
            res.status(500).json({ success: false,message: "Lỗi server khi thao tác với HSX!"});
        }
        finally{
            connection.release();
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
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaDM = req.params.id || req.body.id;
            const MaTK = req.user.id;
            const [check_ton_tai] = await connection.query(`Select TenDM from DanhMuc where MaDM = ?`,[MaDM]);
            if(check_ton_tai.length === 0)
            {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy danh mục cần xoá!`
                });
            }
            const tenDMStr = check_ton_tai[0].TenDM;
            const sql_kiem_tra = 'SELECT 1 FROM MoHinh WHERE MaDM = ? LIMIT 1';
            const [check] = await connection.query(sql_kiem_tra,[MaDM]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0){
                await connection.rollback();
                return res.status(404).json({ success: false, message: `Hiện tại danh mục này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang danh mục khác rồi hẵng xoá danh mục này nhé.`});
                }
            const sql_kiem_tra_ctdm = 'SELECT 1 FROM ChiTietDanhMuc WHERE MaDM = ? LIMIT 1';
            const [check_dm] = await connection.query(sql_kiem_tra_ctdm,[MaDM]);
            //Kiểm tra tồn tại danh mục con trong danh mục không?
            if(check_dm.length > 0){
                await connection.rollback();
                return res.status(404).json({ success: false,message: `Hiện tại danh mục này đang tồn tại các danh mục chi tiết, 
                                            hãy xoá hết các danh mục chi tiết rồi quay lại nhé.`});
            }
            
            await connection.query('Delete from DanhMuc where MaDM = ?',[MaDM]);
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Xoá danh mục #${MaDM}: "${tenDMStr}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'CATEGORY_DELETE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Xoá danh mục hàng thành công!"
            })
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi xoá danh mục: ", error);
            res.status(500).json({ 
                success: false,message: "Lỗi server khi thao tác với danh mục!"});
        }
        finally{
            connection.release();
        }
    },

    xoa_chi_tiet_danh_muc: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaChiTietDM = req.params.id || req.body.id;
            const MaTK = req.user.id;
            const [check_ton_tai] = await connection.query(`Select TenChiTietDM from ChiTietDanhMuc where MaChiTietDM = ?`,[MaChiTietDM]);
            if(check_ton_tai.length === 0)
            {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy danh mục cần xoá!`
                });
            }
            const tenctDMStr = check_ton_tai[0].TenChiTietDM;
            const sql_kiem_tra = `SELECT 1 FROM MoHinh WHERE MaChiTietDM = ? LIMIT 1`;
            const [check] = await connection.query(sql_kiem_tra,[MaChiTietDM]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0){
                await connection.rollback();
                return res.status(404).json({ success: false, message: `Hiện tại chi tiết danh mục này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang danh mục khác rồi hẵng xoá danh mục này nhé.`});
            }
            await connection.query('Delete from ChiTietDanhMuc where MaChiTietDM = ?',[MaChiTietDM]);
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Xoá danh mục #${MaChiTietDM}: "${tenctDMStr}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'CATEGORY_DETAIL_DELETE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Xoá danh mục hàng thành công!"
            })
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi xoá chi tiết danh mục: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác với danh mục!"});
        }
        finally{
            connection.release();
        }
    },

    
    them_mat_hang_moi: async(req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            const MaTK = req.user.id;
            
            const { 
                TenMH, MaHSX, MaDM, MaChiTietDM, TenNhanVat, Series, ChatLieu, GiaNhap, DonGia, TrangThai, ThongTinChiTiet,
                LoaiHinhBan, KichThuoc, NgayPhatHanh, TienCocToiThieu, SoLuong, HienThi, MaVach_Serial 
            } = req.body;

            // 1. KIỂM TRA TRÙNG LẶP (TÊN VÀ SERIAL)
            const [so_sanh_trung_lap] = await connection.query(`SELECT MaMoHinh FROM MoHinh WHERE TenMH = ? OR MaVach_Serial = ?`, [TenMH, MaVach_Serial]);
            if (so_sanh_trung_lap.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Đã có sản phẩm trùng tên hoặc mã vạch serial!" });
            }

            // 2. PARSE JSON VÀ KIỂM TRA TRÙNG TÊN PHÂN LOẠI
            let parsedPhanLoai = [];
            if (req.body.DanhSachPhanLoai && req.body.DanhSachPhanLoai !== 'undefined') {
                parsedPhanLoai = JSON.parse(req.body.DanhSachPhanLoai);
                if (Array.isArray(parsedPhanLoai) && parsedPhanLoai.length > 0) {
                    const variantNames = parsedPhanLoai.map(v => v.name.trim().toLowerCase());
                    const uniqueNames = new Set(variantNames);
                    
                    if (uniqueNames.size !== variantNames.length) {
                        throw new Error("Lỗi dữ liệu: Bạn đã nhập trùng tên phân loại của sản phẩm!");
                    }
                }
            }

            // 3. XỬ LÝ ẢNH
            let tenAnhDaiDien = null;
            if (req.files && req.files['AnhDaiDien']) {
                const file = req.files['AnhDaiDien'][0];
                tenAnhDaiDien = file.path || file.secure_url || file.url || file.filename;
            }

            let danhSachAnhPhu = [];
            if (req.files && req.files['BoSuuTapAnh']) {
                danhSachAnhPhu = req.files['BoSuuTapAnh'].map(file => {
                    return file.path || file.secure_url || file.url || file.filename;
                });
            }

            // 4. THÊM MÔ HÌNH CHÍNH
            const sql_them_san_pham = `
                INSERT INTO MoHinh (
                    TenMH, MaHSX, MaDM, MaChiTietDM, TenNhanVat, Series, ChatLieu, GiaNhap, DonGia, TrangThai, 
                    ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCoctoiThieu, HienThi, AnhDaiDien, MaVach_Serial
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const isVisible = HienThi !== 'undefined' ? HienThi : 0;
            const [them_san_pham] = await connection.query(sql_them_san_pham, [
                TenMH, MaHSX, MaDM, MaChiTietDM || null, TenNhanVat, Series, ChatLieu, GiaNhap, DonGia, TrangThai, 
                ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCocToiThieu, isVisible, tenAnhDaiDien, MaVach_Serial
            ]);
            
            if (them_san_pham.affectedRows === 0) {
                throw new Error("Thêm mô hình thất bại: Không có dữ liệu nào được ghi vào cơ sở dữ liệu.");
            }
            const ma_san_pham_moi = them_san_pham.insertId;

            // 5. THÊM BỘ SƯU TẬP ẢNH (DÙNG BULK INSERT)
            if (danhSachAnhPhu.length > 0) {
                const sql_them_anh = `INSERT INTO AnhMoHinh (LinkAnh, MaMoHinh) VALUES ?`;
                const valuesAnh = danhSachAnhPhu.map(filename => [filename, ma_san_pham_moi]);
                
                const [resultAnh] = await connection.query(sql_them_anh, [valuesAnh]);
                if (resultAnh.affectedRows !== danhSachAnhPhu.length) {
                    throw new Error(`Lỗi lưu ảnh: Cần lưu ${danhSachAnhPhu.length} ảnh nhưng chỉ lưu được ${resultAnh.affectedRows} ảnh.`);
                }
            }

            // 6. THÊM PHÂN LOẠI "MẶC ĐỊNH" (BẮT BUỘC)
            const sql_them_phan_loai_don = `INSERT INTO PhanLoai (ChiTietPhanLoai, SoLuong, MaMoHinh, DonGia, HienThi) VALUES (?,?,?,?,?)`;
            const [resMacDinh] = await connection.query(sql_them_phan_loai_don, ['Mặc định', SoLuong, ma_san_pham_moi, DonGia, isVisible]);
            
            if (resMacDinh.affectedRows === 0) {
                throw new Error("Lỗi lưu phân loại: Không thể tạo phân loại Mặc định.");
            }

            // 7. THÊM CÁC PHÂN LOẠI MỞ RỘNG (NẾU CÓ)
            if (parsedPhanLoai.length > 0) {
                const danhSachLuuPhanLoai = parsedPhanLoai
                    .filter(variant => variant.name && variant.name.trim().toLowerCase() !== 'mặc định') // Chống việc admin gõ trùng chữ "mặc định"
                    .map(variant => {
                        const variantVisibility = (isVisible === 0) ? 0 : (variant.isVisible !== undefined ? Number(variant.isVisible) : 1);
                        return [
                            variant.name.trim(), 
                            variant.stock || 0, 
                            ma_san_pham_moi, 
                            variant.sellPrice || DonGia || 0, 
                            variantVisibility
                        ];
                    });

                if (danhSachLuuPhanLoai.length > 0) {
                    // Cú pháp đúng cho Bulk Insert: VALUES ?
                    const sql_them_phan_loai_bulk = `INSERT INTO PhanLoai (ChiTietPhanLoai, SoLuong, MaMoHinh, DonGia, HienThi) VALUES ?`;
                    const [resultPhanLoai] = await connection.query(sql_them_phan_loai_bulk, [danhSachLuuPhanLoai]);
                    
                    if (resultPhanLoai.affectedRows !== danhSachLuuPhanLoai.length) {
                        throw new Error(`Lỗi lưu phân loại: Hệ thống không thể ghi nhận đầy đủ các phiên bản của sản phẩm.`);
                    }
                }
            }

            // 8. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Thêm sản phẩm mới #${ma_san_pham_moi}: "${TenMH}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'PRODUCT_CREATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);
            
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm sản phẩm mới thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thêm sản phẩm mới: ", error);
            res.status(500).json({ 
                success: false, 
                // Trả về thẳng lỗi mà mình đã throw ra để dễ debug
                message: error.message || "Lỗi server khi thao tác thêm sản phẩm!" 
            });
        } finally {
            if (connection) connection.release();
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
                success: true,
                message: "Thêm phân loại mới thành công!",
                MaMoHinh: MaMoHinh
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thêm sản phẩm mới: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác với danh mục!"});
        }
        finally{
            connection.release();
        }
    },

    //Sửa thông tin mặt hàng (có thể sửa cả phân loại, thêm)
    sua_thong_tin_mat_hang: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaMH = req.params.id || req.body.MaMH;
            const MaTK = req.user.id;

            const {
                TenMH, MaHSX, MaDM, MaChiTietDM, TenNhanVat, Series, ChatLieu, DonGia, TrangThai, ThongTinChiTiet,
                LoaiHinhBan, KichThuoc, SoLuong, NgayPhatHanh, TienCocToiThieu, DanhSachPhanLoai, HienThi, MaVach_Serial, AnhCuCanXoa
            } = req.body;

            // 1. KIỂM TRA TRÙNG LẶP (Đã sửa cú pháp và logic MaMoHinh != ?)
            const sql_kiem_tra_trung = `SELECT MaMoHinh FROM MoHinh WHERE (TenMH = ? OR MaVach_Serial = ?) AND MaMoHinh != ? LIMIT 1`;
            const [so_sanh_trung_lap] = await connection.query(sql_kiem_tra_trung, [TenMH, MaVach_Serial, MaMH]);
            
            if (so_sanh_trung_lap.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Đã có sản phẩm khác trùng Tên hoặc Mã vạch (Serial)!" });
            }

            // 2. PARSE JSON PHÂN LOẠI
            let parsedPhanLoai = [];
            if (DanhSachPhanLoai && DanhSachPhanLoai !== 'undefined') {
                parsedPhanLoai = JSON.parse(DanhSachPhanLoai);
                if (Array.isArray(parsedPhanLoai) && parsedPhanLoai.length > 0) {
                    const variantNames = parsedPhanLoai.map(v => v.name.trim().toLowerCase());
                    const uniqueNames = new Set(variantNames);
                    if (uniqueNames.size !== variantNames.length) {
                        throw new Error("Lỗi dữ liệu: Bạn đã nhập trùng tên phân loại của sản phẩm!");
                    }
                }
            }

            // 3. CẬP NHẬT MÔ HÌNH CHÍNH
            const isVisible = (HienThi !== undefined && HienThi !== 'undefined') ? Number(HienThi) : 0;
            const sql_sua_tt_san_pham = `
                UPDATE MoHinh SET
                    TenMH = ?, MaHSX = ?, MaDM = ?, MaChiTietDM = ?, TenNhanVat = ?, Series = ?, ChatLieu = ?, 
                    DonGia = ?, TrangThai = ?, ThongTinChiTiet = ?, KichThuoc = ?, NgayPhatHanh = ?, 
                    LoaiHinhBan = ?, TienCocToiThieu = ?, HienThi = ?, MaVach_Serial = ?
                WHERE MaMoHinh = ?
            `;
            
            const [updateSp] = await connection.query(sql_sua_tt_san_pham, [
                TenMH, MaHSX, MaDM, MaChiTietDM || null, TenNhanVat || null, Series || null, ChatLieu, 
                DonGia, TrangThai, ThongTinChiTiet, KichThuoc, NgayPhatHanh || null, 
                LoaiHinhBan, TienCocToiThieu || 0, isVisible, MaVach_Serial, MaMH
            ]);

            if (updateSp.affectedRows === 0) {
                throw new Error("Không tìm thấy sản phẩm cần sửa hoặc không có dữ liệu nào được cập nhật.");
            }

            // 4. CẬP NHẬT PHÂN LOẠI MẶC ĐỊNH (Đồng bộ lại giá và kho từ Form gốc)
            await connection.query(
                `UPDATE PhanLoai SET HienThi = ?, DonGia = ?, SoLuong = ? WHERE MaMoHinh = ? AND ChiTietPhanLoai = 'Mặc định'`,
                [isVisible, DonGia, SoLuong || 0, MaMH]
            );

            // 5. CẬP NHẬT ẢNH ĐẠI DIỆN MỚI
            if (req.files && req.files['AnhDaiDien']) {
                const file = req.files['AnhDaiDien'][0];
                const tenAnhMoi = file.path || file.secure_url || file.url || file.filename;
                await connection.query(`UPDATE MoHinh SET AnhDaiDien = ? WHERE MaMoHinh = ?`, [tenAnhMoi, MaMH]);
            }

            // 6. XÓA ẢNH BỘ SƯU TẬP CŨ TRONG DATABASE
            if (AnhCuCanXoa && AnhCuCanXoa !== 'undefined') {
                const arrXoa = JSON.parse(AnhCuCanXoa);
                if (Array.isArray(arrXoa) && arrXoa.length > 0) {
                    const placeholders = arrXoa.map(() => '?').join(',');
                    await connection.query(
                        `DELETE FROM AnhMoHinh WHERE MaMoHinh = ? AND LinkAnh IN (${placeholders})`, 
                        [MaMH, ...arrXoa]
                    );
                }
            }

            // 7. THÊM ẢNH BỘ SƯU TẬP MỚI (BULK INSERT)
            if (req.files && req.files['BoSuuTapAnhMoi']) {
                const valuesAnhMoi = req.files['BoSuuTapAnhMoi'].map(file => [
                    file.path || file.secure_url || file.url || file.filename, 
                    MaMH
                ]);
                await connection.query(`INSERT INTO AnhMoHinh (LinkAnh, MaMoHinh) VALUES ?`, [valuesAnhMoi]);
            }

            // 8. XỬ LÝ PHÂN LOẠI MỞ RỘNG (SỬA ĐỒNG LOẠT VÀ THÊM MỚI BULK INSERT)
            if (parsedPhanLoai.length > 0) {
                const sql_sua_phan_loai = `UPDATE PhanLoai SET ChiTietPhanLoai=?, DonGia=?, SoLuong=?, HienThi=? WHERE MaPhanLoai=?`;
                const variantsToInsert = [];
                const updatePromises = [];

                for (let variant of parsedPhanLoai) {
                    if (variant.name && variant.name.trim().toLowerCase() !== 'mặc định') {
                        const variantVisibility = (isVisible === 0) ? 0 : (variant.isVisible !== undefined ? Number(variant.isVisible) : 1);
                        
                        if (variant.id) {
                            // Đẩy vào mảng Promise để chạy song song siêu tốc
                            updatePromises.push(connection.query(sql_sua_phan_loai, [
                                variant.name.trim(), variant.sellPrice || DonGia, variant.stock || 0, variantVisibility, variant.id
                            ]));
                        } else {
                            // Gom vào mảng để Bulk Insert 1 lần
                            variantsToInsert.push([
                                variant.name.trim(), variant.stock || 0, MaMH, variant.sellPrice || DonGia, variantVisibility
                            ]);
                        }
                    }
                }

                if (updatePromises.length > 0) await Promise.all(updatePromises); // Chạy song song tất cả lệnh UPDATE
                
                if (variantsToInsert.length > 0) {
                    await connection.query(
                        `INSERT INTO PhanLoai (ChiTietPhanLoai, SoLuong, MaMoHinh, DonGia, HienThi) VALUES ?`, 
                        [variantsToInsert]
                    );
                }
            } // <--- Đã chuẩn hóa dấu đóng ngoặc ở đây (Xóa bỏ dấu ngoặc thừa)

            // XỬ LÝ XÓA PHÂN LOẠI ĐƯỢC YÊU CẦU
            const phanLoaiCanXoa = (req.body.PhanLoaiCanXoa && req.body.PhanLoaiCanXoa !== 'undefined') 
                ? JSON.parse(req.body.PhanLoaiCanXoa) 
                : [];

            if (phanLoaiCanXoa && phanLoaiCanXoa.length > 0) {
                for (const id of phanLoaiCanXoa) {
                    try {
                        // Bước 1: Thử xóa cứng (Dành cho phân loại gõ nhầm, tạo thừa, chưa ai mua)
                        const [resultDelete] = await connection.query('DELETE FROM PhanLoai WHERE MaPhanLoai = ?', [id]);
                        
                        if (resultDelete.affectedRows > 0) {
                            console.log(`[Hard Delete] Đã xóa vĩnh viễn phân loại ID: ${id}`);
                        }

                    } catch (error) {
                        // Bắt chính xác mã lỗi 1451: Ràng buộc khóa ngoại (Đã có trong ChiTietDonHang hoặc ChiTietKhuyenMai)
                        if (error.errno === 1451) {
                            // Bước 2: Tự động chuyển sang xóa mềm để bảo vệ dữ liệu thống kê
                            await connection.query('UPDATE PhanLoai SET HienThi = 0 WHERE MaPhanLoai = ?', [id]);
                            console.log(`[Soft Delete] Sản phẩm đã từng giao dịch. Đã ẩn vĩnh viễn phân loại ID: ${id}`);
                        } else {
                            throw error;
                        }
                    }
                }
            }

            // 9. GHI LOG HOẠT ĐỘNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Cập nhật thông tin sản phẩm #${MaMH}: "${TenMH}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'PRODUCT_UPDATE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin sản phẩm thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin sản phẩm: ", error);
            res.status(500).json({ 
                success: false, 
                message: error.message || "Lỗi server khi thao tác với sản phẩm!" 
            });
        } finally {
            if (connection) connection.release();
        }
    },
    
    //Xoá theo cách ẩn với khách hàng, tránh ảnh hướng báo cáo thống kê
    An_mat_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {MaMH} = req.body;
            const {MaTK} = req.user.id;
            const sql_xoa_mem = `
                                Update MoHinh
                                Set TrangThai = 'Ngừng kinh doanh', HienThi = 0
                                Where MaMoHinh = ?`;
            const [ket_qua] = await connection.query(sql_xoa_mem, [MaMH]);
            if(ket_qua.affectedRows === 0){
                return res.status(404).json({ message: "Không thấy sản phẩm cần ẩn!"});
            }
            const sql_xoa_mem_cho_pl = `
                                        Update PhanLoai
                                        Set HienThi = 0
                                        where MaMoHinh =?`;
            await connection.query(sql_xoa_mem_cho_pl, [MaMH]);
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
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {MaPL} = req.body;
            const sql_xoa_mem = `
                                Update PhanLoai
                                Set HienThi = 0
                                Where MaPhanLoai = ?`;
            const [ket_qua] = await connection.query(sql_xoa_mem, [MaPL]);
            if(ket_qua.affectedRows === 0){
                await connection.rollback();
                return res.status(404).json({ success: false,
                    message: "Không thấy phân loại cần ẩn!"});
            }
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Đã chuyển phân loại vào trạng thái ẩn!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi ẩn sản phẩm: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác ẩn!" });
        }
        finally{
            connection.release();
        }
    },

    thay_doi_hien_thi_mat_hang: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // HienThi (0 là Ẩn, 1 là Hiện)
            const MaMH = req.params.id;
            const { HienThi } = req.body; 
            const MaTK = req.user.id;
            
            // 1. KIỂM TRA TỒN TẠI VÀ LẤY TÊN ĐỂ GHI LOG
            const [kiem_tra] = await connection.query(`SELECT TenMH FROM MoHinh WHERE MaMoHinh = ?`, [MaMH]);
            if (kiem_tra.length === 0) {
                await connection.rollback();
                return res.status(404).json({ // FIX LỖI SẬP: Đã thêm 404
                    success: false,
                    message: "Không tìm thấy sản phẩm cần ẩn/hiện!"
                });
            } 
            const tenMHStr = kiem_tra[0].TenMH;

            // 2. CẬP NHẬT MÔ HÌNH CHÍNH
            // Ép kiểu về số để đảm bảo an toàn
            const trangThaiHienThi = Number(HienThi) === 1 ? 1 : 0; 
            
            const sql_update_mh = `UPDATE MoHinh SET HienThi = ? WHERE MaMoHinh = ?`;
            const [ket_qua] = await connection.query(sql_update_mh, [trangThaiHienThi, MaMH]);
            
            if (ket_qua.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm hoặc không có thay đổi!"});
            }

            // 3. ĐỒNG BỘ CẬP NHẬT PHÂN LOẠI CON
            const sql_update_pl = `UPDATE PhanLoai SET HienThi = ? WHERE MaMoHinh = ?`;
            await connection.query(sql_update_pl, [trangThaiHienThi, MaMH]);

            // 4. GHI LOG HỆ THỐNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const trangThaiText = trangThaiHienThi === 1 ? 'Hiển thị' : 'Ẩn';
            const noiDungLog = `Thay đổi trạng thái thành [${trangThaiText}] cho sản phẩm #${MaMH}: "${tenMHStr}"`;
            
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'PRODUCT_VISIBILITY_TOGGLE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: trangThaiHienThi === 0 ? "Đã ẩn sản phẩm!" : "Đã hiển thị lại sản phẩm thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thay đổi hiển thị sản phẩm: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác!" });
        } finally {
            if (connection) connection.release();
        }
    },

    liet_ke_mat_hang: async(req, res)=>{
        try {
            //Thông tin trang và số lượng hiển thị giới hạn trên 1 trang
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            if (!page || isNaN(page) || page < 1) page = 1;
            if (!limit || isNaN(limit) || limit < 1) limit = 10;
            if (limit > 20) limit = 20;
            // Tính toán vị trí cắt dữ liệu
            const offset = (page - 1) * limit;

            //Các tham số bộ lọc frontend gửi lên
            const { 
                keyword, minprice, maxprice, danhmuc, chitietdanhmuc, 
                hsx, NgayBatDau, NgayKetThuc, LoaiHinhBan, HienThi,
                TinhTrangTonKho, 
                CoKhuyenMai,
                Sapxep 
            } = req.query;


            let condition = [];
            let value = [];

            if(keyword){
                condition.push("(mh.TenMH LIKE ? OR mh.TenNhanVat LIKE ? OR mh.Series LIKE ? OR mh.MaVach_Serial = ?)");
                const kw = `%${keyword}%`;
                value.push(kw, kw, kw, keyword);
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
                value.push('Có sẵn');
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

            const sql_core = `SELECT mh.MaMoHinh, mh.TenMH, mh.MaHSX, mh.MaDM, TenDM, mh.MaChiTietDM,
                 mh.ChatLieu, mh.KichThuoc, TenChiTietDM, mh.GiaNhap, mh.DonGia, mh.TrangThai, mh.LoaiHinhBan,
                mh.AnhDaiDien, mh.NgayPhatHanh, TenHSX, mh.HienThi, mh.TienCocToiThieu, 
                mh.ThongTinChiTiet, mh.TenNhanVat, mh.Series, mh.MaVach_Serial,
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

            const sql_summary = `
                SELECT 
                    COUNT(MaMoHinh) AS TongSanPham,
                    SUM(CASE WHEN SoLuongTon <= 3 AND SoLuongTon > 0 THEN 1 ELSE 0 END) AS SapHetHang,
                    SUM(CASE WHEN SoLuongTon = 0 THEN 1 ELSE 0 END) AS HetHang,
                    SUM(CASE WHEN SoLuongTon > 3 THEN 1 ELSE 0 END) AS DangCoSan
                FROM (
                    SELECT mh.MaMoHinh, COALESCE(SUM(pl.SoLuong), 0) AS SoLuongTon
                    FROM MoHinh mh
                    LEFT JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                    GROUP BY mh.MaMoHinh
                ) AS TmpKho
            `;
            
            const [summaryResult] = await db.query(sql_summary);
            const summaryData = summaryResult[0];

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách sản phẩm thành công!",
                data: products,
                summary: summaryData,
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
            const sql = `SELECT 
                    mh.MaMoHinh, mh.AnhDaiDien, mh.TenMH, mh.ChatLieu, mh.TenNhanVat, mh.Series, 
                    mh.GiaNhap, mh.DonGia, mh.TrangThai, mh.ThongTinChiTiet,
                    mh.KichThuoc, mh.NgayPhatHanh, mh.LoaiHinhBan, mh.TienCocToiThieu, mh.HienThi, mh.MaVach_Serial,
                    mh.MaHSX, mh.MaDM, mh.MaChiTietDM,
                    (
                        SELECT COALESCE(SUM(SoLuong), 0) 
                        FROM PhanLoai 
                        WHERE MaMoHinh = mh.MaMoHinh
                    ) AS SoLuongTong,
                    hsx.TenHSX, DanhMuc.TenDM, ChiTietDanhMuc.TenChiTietDM,
                    GROUP_CONCAT(anh.LinkAnh) AS DanhSachAnhPhu
                FROM MoHinh mh
                LEFT JOIN DanhMuc ON DanhMuc.MaDM = mh.MaDM
                LEFT JOIN ChiTietDanhMuc ON ChiTietDanhMuc.MaChiTietDM = mh.MaChiTietDM
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
            delete product_detail.DanhSachAnhPhu;

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

    liet_ke_brand: async(req, res) => {
        try {
            // Tối ưu cách viết ép kiểu và giới hạn giá trị phân trang
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            let limit = parseInt(req.query.limit) || 10;
            if (limit < 1) limit = 10;
            if (limit > 20) limit = 20;
            
            const offset = (page - 1) * limit;
            const { keyword, sapxep } = req.query;
            
            let condition = [];
            let value = [];
            
            if (keyword) {
                condition.push("TenHSX LIKE ?");
                value.push(`%${keyword}%`);
            }
            let whereClause = condition.length > 0 ? "WHERE " + condition.join(" AND ") : "";
            
            let filter = sapxep === 'z-a' ? "ORDER BY TenHSX DESC" : "ORDER BY TenHSX ASC";

            const sql_core = `
                SELECT hsx.MaHSX, TenHSX, MoTa, Logo,
                (
                    SELECT COUNT(*)
                    FROM MoHinh
                    WHERE MoHinh.MaHSX = hsx.MaHSX
                ) AS TongSoLuongSanPham
                FROM HangSanXuat hsx
                ${whereClause}
            `;
            
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) AS temptable`;
            const sql_ds = `${sql_core} ${filter} LIMIT ? OFFSET ?`;
            const sql_params = [...value, limit, offset];

            // TỐI ƯU HIỆU NĂNG: Chạy đếm tổng và lấy danh sách cùng một lúc
            const [[countResult], [brands]] = await Promise.all([
                db.query(sql_count, value),
                db.query(sql_ds, sql_params)
            ]);

            // ĐỒNG BỘ FRONTEND: Dùng chung key totalItems
            const totalItems = countResult[0].total; 
            const totalPage = Math.ceil(totalItems / limit);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách hãng sản xuất thành công",
                data: brands,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems, // Đã đổi thành totalItems
                    totalPage: totalPage
                }
            });
        }
        catch (error) {
            console.error("Lỗi khi lấy danh sách HSX: ", error);
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

    liet_ke_danh_muc: async(req, res) => {
        try {
            const isGetAll = req.query.getAll === 'true';

            if (isGetAll) {
                // 🔥 SỬA: Lấy thêm DanhSachAnh và DanhMucNoiBat
                const [cates] = await db.query(`SELECT MaDM, TenDM, MoTa, DanhSachAnh, DanhMucNoiBat FROM DanhMuc ORDER BY TenDM ASC`);
                const [subCates] = await db.query(`SELECT MaChiTietDM, TenChiTietDM, MaDM FROM ChiTietDanhMuc`);
                
                // Gộp danh mục con và ÉP KIỂU MẢNG ẢNH
                const finalCates = cates.map(cate => ({
                    ...cate,
                    // 🔥 THÊM: Ép chuỗi TEXT thành mảng Array để Vue.js dễ render
                    DanhSachAnh: cate.DanhSachAnh ? JSON.parse(cate.DanhSachAnh) : [],
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
                condition.push("dm.TenDM LIKE ?"); 
                value.push(`%${keyword}%`);
            }
            let whereClause = condition.length > 0 ? "WHERE " + condition.join(" AND ") : "";

            let filter = "ORDER BY dm.TenDM ASC";
            if(sapxep === 'z-a'){
                filter = "ORDER BY dm.TenDM DESC";
            }
    
            // 🔥 SỬA: Bổ sung dm.DanhSachAnh và dm.DanhMucNoiBat vào câu SELECT core
            const sql_core = `SELECT dm.MaDM, dm.TenDM, dm.MoTa, dm.DanhSachAnh, dm.DanhMucNoiBat,
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

            let finalCates = cates; 
            
            // Xử lý danh mục con và ép kiểu dữ liệu ảnh
            if (cates.length > 0) {
                const arrMaDM = cates.map(c => c.MaDM);

                const [subCates] = await db.query(
                    `SELECT MaChiTietDM, TenChiTietDM, MaDM, MoTa FROM ChiTietDanhMuc WHERE MaDM IN (?)`, 
                    [arrMaDM]
                );

                finalCates = cates.map(cate => {
                    return {
                        ...cate,
                        // 🔥 THÊM: Ép chuỗi TEXT thành mảng Array (Bắt lỗi rỗng)
                        DanhSachAnh: cate.DanhSachAnh ? JSON.parse(cate.DanhSachAnh) : [],
                        DanhSachDanhMucCon: subCates.filter(sub => sub.MaDM === cate.MaDM)
                    };
                });
            } else {
                // Trong trường hợp không có danh mục con, vẫn phải ép kiểu ảnh cho mảng cates gốc
                finalCates = cates.map(cate => ({
                    ...cate,
                    DanhSachAnh: cate.DanhSachAnh ? JSON.parse(cate.DanhSachAnh) : []
                }));
            }

            res.status(200).json({
                success: true,
                message: "Lấy danh sách danh mục thành công",
                data: finalCates,
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

    xuatExcelKhoHang: async (req, res) => {
        try {
            // 1. TRUY VẤN SONG SONG 2 LUỒNG DỮ LIỆU
            const sql_tonkho = `
                SELECT mh.MaMoHinh, mh.TenMH, pl.ChiTietPhanLoai, hsx.TenHSX, dm.TenDM, 
                       pl.SoLuong, mh.GiaNhap, pl.DonGia AS GiaBan, mh.TrangThai
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON mh.MaMoHinh = pl.MaMoHinh
                LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
                LEFT JOIN DanhMuc dm ON mh.MaDM = dm.MaDM
                ORDER BY mh.MaMoHinh DESC, pl.MaPhanLoai ASC
            `;

            const sql_nhatky = `
                SELECT log.ThoiGian, tk.TenDN, log.NoiDung, log.IPAddress
                FROM LogHoatDongTaiKhoan log
                LEFT JOIN TaiKhoan tk ON log.MaTK = tk.MaTK
                WHERE log.LoaiLog LIKE '%PRODUCT%'
                ORDER BY log.ThoiGian DESC
                LIMIT 1000
            `;

            const [[tonKhos], [nhatKys]] = await Promise.all([
                db.query(sql_tonkho),
                db.query(sql_nhatky)
            ]);

            const workbook = new ExcelJS.Workbook();
            const blackBorder = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };

            // ==============================================
            // SHEET 1: BÁO CÁO TỒN KHO
            // ==============================================
            const ws1 = workbook.addWorksheet('Tồn kho chi tiết');
            ws1.views = [{ showGridLines: false }];
            ws1.columns = [
                { key: 'MaMH', width: 12 }, { key: 'TenMH', width: 45 },
                { key: 'PhanLoai', width: 20 }, { key: 'ThuongHieu', width: 20 },
                { key: 'TonKho', width: 12 }, { key: 'GiaNhap', width: 18 },
                { key: 'GiaBan', width: 18 }, { key: 'TrangThai', width: 20 }
            ];

            // Chèn Logo
            try {
                const logoPath = path.join(__dirname, '../../public/logo.png'); // Sửa đường dẫn nếu cần
                const logoId1 = workbook.addImage({ filename: logoPath, extension: 'png' });
                ws1.addImage(logoId1, { tl: { col: 0, row: 0 }, br: { col: 1, row: 3 } });
            } catch (err) {}

            ws1.getCell('B1').value = 'FIGURECOLLECT';
            ws1.getCell('B1').font = { size: 16, bold: true, color: { argb: 'FFFF8F73' } };
            ws1.getCell('B2').value = 'Hệ thống Quản trị Kho hàng & Sản phẩm';
            ws1.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' } };

            ws1.mergeCells('A5:H5');
            ws1.getCell('A5').value = 'BÁO CÁO TỒN KHO CHI TIẾT';
            ws1.getCell('A5').font = { size: 16, bold: true, color: { argb: 'FF222532' } };
            ws1.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

            ws1.mergeCells('A6:H6');
            ws1.getCell('A6').value = `Ngày trích xuất: ${new Date().toLocaleString('vi-VN')} | Tổng số mã PL: ${tonKhos.length}`;
            ws1.getCell('A6').font = { italic: true, size: 10, color: { argb: 'FF737580' } };
            ws1.getCell('A6').alignment = { horizontal: 'center' };

            // Header Bảng
            const headerRow1 = ws1.getRow(9);
            headerRow1.values = ['Mã MH', 'Tên Sản phẩm', 'Phân loại', 'Hãng / Danh mục', 'Tồn kho', 'Giá nhập (VNĐ)', 'Giá bán (VNĐ)', 'Tình trạng'];
            headerRow1.height = 25;
            
            headerRow1.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8F73' } }; 
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = blackBorder;
            });

            // Đổ Dữ Liệu Tồn Kho
            tonKhos.forEach((item) => {
                const row = ws1.addRow({
                    MaMH: `#${item.MaMoHinh}`,
                    TenMH: item.TenMH,
                    PhanLoai: item.ChiTietPhanLoai,
                    ThuongHieu: `${item.TenHSX || 'N/A'}\n(${item.TenDM || 'N/A'})`,
                    TonKho: item.SoLuong,
                    GiaNhap: item.GiaNhap,
                    GiaBan: item.GiaBan,
                    TrangThai: item.TrangThai
                });

                row.eachCell((cell, colNum) => {
                    cell.font = { size: 11, color: { argb: 'FF000000' } };
                    cell.border = blackBorder;
                    
                    if (colNum === 5) { // Tồn kho
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        cell.font = { size: 11, bold: true, color: { argb: item.SoLuong <= 3 ? 'FFFF0000' : 'FF000000' } }; // Đỏ nếu sắp hết
                    } else if (colNum === 6 || colNum === 7) { // Giá
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        cell.numFmt = '#,##0';
                    } else if (colNum === 1 || colNum === 8) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    }
                });
            });

            // ==============================================
            // SHEET 2: BÁO CÁO NHẬT KÝ SẢN PHẨM
            // ==============================================
            const ws2 = workbook.addWorksheet('Nhật ký hoạt động');
            ws2.views = [{ showGridLines: false }];
            ws2.columns = [
                { key: 'ThoiGian', width: 25 },
                { key: 'NguoiThucHien', width: 25 },
                { key: 'NoiDung', width: 60 },
                { key: 'IP', width: 20 }
            ];

            try {
                const logoPath = path.join(__dirname, '../../public/logo.png'); 
                const logoId2 = workbook.addImage({ filename: logoPath, extension: 'png' });
                ws2.addImage(logoId2, { tl: { col: 0, row: 0 }, br: { col: 1, row: 3 } });
            } catch (err) {}

            ws2.getCell('B1').value = 'FIGURECOLLECT';
            ws2.getCell('B1').font = { size: 16, bold: true, color: { argb: 'FFFF8F73' } };
            ws2.getCell('B2').value = 'Hệ thống Quản trị Kho hàng & Sản phẩm';
            ws2.getCell('B2').font = { size: 11, italic: true, color: { argb: 'FF737580' } };

            ws2.mergeCells('A5:D5');
            ws2.getCell('A5').value = 'NHẬT KÝ THAO TÁC KHO HÀNG';
            ws2.getCell('A5').font = { size: 16, bold: true, color: { argb: 'FF222532' } };
            ws2.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

            const headerRow2 = ws2.getRow(8);
            headerRow2.values = ['Thời gian', 'Tài khoản thực hiện', 'Nội dung thao tác', 'IP Address'];
            headerRow2.height = 25;
            
            headerRow2.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222532' } }; // Nền đen cho Sheet 2
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = blackBorder; 
            });

            nhatKys.forEach((item) => {
                const row = ws2.addRow({
                    ThoiGian: new Date(item.ThoiGian).toLocaleString('vi-VN'),
                    NguoiThucHien: item.TenDangNhap || 'System',
                    NoiDung: item.NoiDung,
                    IP: item.IPAddress || 'N/A'
                });

                row.eachCell((cell, colNum) => {
                    cell.font = { size: 11, color: { argb: 'FF000000' } };
                    cell.border = blackBorder; 
                    if (colNum === 3) cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    else cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
            });

            // ==============================================
            // TRẢ FILE VỀ CHO FRONTEND
            // ==============================================
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + `KhoHang_FigureCollect_${Date.now()}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error("Lỗi xuất Excel Kho hàng:", error);
            res.status(500).json({ success: false, message: "Lỗi hệ thống khi tạo file Excel" });
        }
    }
}
module.exports = product_admin;