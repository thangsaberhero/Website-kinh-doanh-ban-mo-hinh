const db = require('../config/db');

const product_admin = {
    them_danh_muc_moi: async(req, res) =>{
        const connection = await db.getConnection();

        try{
            const {TenDM, MoTa, danhSachChiTiet} = req.body;
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
            const [result_dm] = await db.query(sql_insert_dm,[TenDM, MoTa]);
            
            const ma_DM_moi = result_dm.insertId;

            if (Array.isArray(danhSachChiTiet) && danhSachChiTiet.length > 0) {
                const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES (?, ?, ?)`;
                for (let chiTiet of danhSachChiTiet) {
                    await connection.query(sql_insert_chitiet, [maDMMoi, chiTiet.Ten, chiTiet.MoTa]);
                }
            }

            await connection.commit();
            connection.release();

            res.status(200).json({ 
                message: `Thành công tạo danh mục (và các chi tiết nếu có)!`,
                MaDMMoi: ma_DM_moi
            });
            
        }
        catch (error){
            await connection.rollback();
            connection.release();
            console.error("Lỗi khi thêm danh mục mới");
            res.status(500).json({ message: "Lỗi server khi thao tác thêm danh mục!"});
        }
    },

    them_chi_tiet_danh_muc_moi: async(req, res) =>{
        try{
            const {MaDM, danhSachChiTiet} = req.body;
            if (!MaDM) {
                return res.status(400).json({ message: "Thiếu mã danh mục (MaDM)!" });
            }
            let soLuongThemThanhCong = 0;
            const sql_kiem_tra = `Select * from ChiTietDanhMuc where MaDM = ? and TenChiTietDM = ?`;
            const sql_insert_chitiet = `INSERT INTO ChiTietDanhMuc(MaDM, TenChiTietDM, MoTa) VALUES (?, ?, ?)`;
            if (Array.isArray(danhSachChiTiet) && danhSachChiTiet.length > 0) {
                for (let chiTiet of danhSachChiTiet) {
                    const [check] = await db.query(sql_kiem_tra, [MaDM, danhSachChiTiet.Ten]);
                    if(check.length === 0){
                        await db.query(sql_insert_chitiet,[MaDM, chiTiet.Ten, chiTiet.MoTa]);
                        soLuongThemThanhCong++;
                    }
                }
            }
            res.status(200).json({ 
                message: `Đã xử lý xong! Thêm thành công ${soLuongThemThanhCong} chi tiết mới.`,
                MaDM_DaThem: MaDM
            });
        }
        catch (error){
            console.error("Lỗi khi thêm chi tiết danh mục mới");
            res.status(500).json({ message: "Lỗi server khi thao tác thêm danh mục!"});
        }
    },

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

    xoa_danh_muc: async(req, res) =>{
        try {
            const {MaDM} = req.body;
            const sql_kiem_tra = 'SELECT 1 FROM MoHinh WHERE MaDM = ? LIMIT 1';
            const [check] = await db.query(sql_kiem_tra,[MaDM]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0)
                return res.status(404).json({ message: `Hiện tại danh mục này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang danh mục khác rồi hẵng xoá danh mục này nhé.`});

            const sql_kiem_tra_ctdm = 'SELECT 1 FROM ChiTietDanhMuc WHERE MaDM = ? LIMIT 1';
            const [check_dm] = await db.query(sql_kiem_tra_ctdm,[MaDM]);
            //Kiểm tra tồn tại danh mục con trong danh mục không?
            if(check_dm.length > 0)
                return res.status(404).json({ message: `Hiện tại danh mục này đang tồn tại các danh mục chi tiết, 
                                            hãy xoá hết các danh mục chi tiết rồi quay lại nhé.`});
            
            await db.query('Delete from DanhMuc where MaDM = ?',[MaDM]);
            res.status(200).json({
                message: "Xoá danh mục hàng thành công!"
            })
        }
        catch (error){
            console.error("Lỗi khi xoá danh mục: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác với danh mục!"});
        }
    },

    xoa_chi_tiet_danh_muc: async(req, res) =>{
        try {
            const {MaChiTietDM} = req.body;
            const sql_kiem_tra = `SELECT 1 FROM MoHinh WHERE MaChiTietDM = ? LIMIT 1`;
            const [check] = await db.query(sql_kiem_tra,[MaChiTietDM]);
            //Kiểm tra tồn tại sản phẩm trong danh mục không?
            if(check.length > 0)
                return res.status(404).json({ message: `Hiện tại chi tiết danh mục này đang tồn tại sản phẩm, 
                                            hãy chuyển hết sản phẩm sang danh mục khác rồi hẵng xoá danh mục này nhé.`});

            await db.query('Delete from ChiTietDanhMuc where MaChiTietDM = ?',[MaChiTietDM]);
            res.status(200).json({
                message: "Xoá danh mục hàng thành công!"
            })
        }
        catch (error){
            console.error("Lỗi khi xoá chi tiết danh mục: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác với danh mục!"});
        }
    },

    

    them_mat_hang_moi: async(req, res) =>{
        try{
            const {TenMH,MaDM,MaChiTietDM,ChatLieu,DonGia,TrangThai, ThongTinChiTiet ,LoaiHinhBan, Danh_sach_anh, KichThuoc, NgayPhatHanh, TienCocToiThieu, DS_PL} = req.body;
            const sql_them_san_pham = `Insert into MoHinh (TenMH, MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCoctoiThieu)
                                        Values (?,?,?,?,?,?,?,?,?,?,?)`;
            const [them_san_pham] = await db.query(sql_them_san_pham, [TenMH, MaDM, MaChiTietDM || null, ChatLieu, DonGia, TrangThai, ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCocToiThieu]);
            const ma_san_pham_moi = them_san_pham.insertId;

            //Thêm 1 phân loại mặc định cho sản phẩm
            const sql_them_phan_loai = `Insert into Phanloai (ChiTietPhanLoai, MaMoHinh, DonGia) values (?,?,?)`;
            await db.query(sql_them_phan_loai,['NONE', ma_san_pham_moi, DonGia]);

            if(Array.isArray(Danh_sach_anh) && Danh_sach_anh.length>0){
                const sql_them_anh = `Insert into AnhMoHinh (LinkAnh, MaMoHinh) values (?,?)`;
                for(let image of Danh_sach_anh){
                    await db.query(sql_them_anh, [image.Link]);
                }
                await db.query(`Update Mohinh set AnhDaiDien = ? where MaMoHinh = ?`, [Danh_sach_anh[0].Link, ma_san_pham_moi]);
            }
            if(Array.isArray(DS_PL)){
                if(DS_PL.length > 0){
                    for(let variant of DS_PL){
                        await db.query(sql_them_phan_loai, [DS_PL.ChiTietPhanLoai, ma_san_pham_moi, DS_PL.DonGia]);
                    }
                }
            }
            res.status(200).json({
                message: "Thêm sản phẩm mới thành công!"
            })

        }
        catch (error){
            console.error("Lỗi khi thêm sản phẩm mới: ", error);
            res.status(500).json({ message: "Lỗi server khi thao tác với danh mục!"});
        }
    }
}