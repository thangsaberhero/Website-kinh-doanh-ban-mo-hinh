const db = require('../../config/db');

const product_admin = {
    them_danh_muc_moi: async(req, res) =>{
        const connection = await db.getConnection();

        try{
            await connection.beginTransaction();
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
            const sql = `Insert into HangSanXuat(TenHSX, MoTa) values (?,?)`;
            await connection.query(sql,[TenHSX, MoTa]);
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

    xoa_HSX: async(req, res) =>{
        try {
            const {MaHSX} = req.body;
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
            const {MaDM} = req.body;
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
        const connection = await db.getConnection();

        try{
            await connection.beginTransaction();
            const danhSachPhanLoai = JSON.parse(req.body.DanhSachPhanLoai);
            const {TenMH, MaHSX ,MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet ,
                LoaiHinhBan, Danh_sach_anh, KichThuoc, NgayPhatHanh, TienCocToiThieu, SoLuong, DS_PL, HienThi} = req.body;
            const sql_them_san_pham = `Insert into MoHinh (TenMH, MaHSX, MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCoctoiThieu, HienThi)
                                        Values (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const isVisible = HienThi !== undefined ? HienThi : 0;
            const [them_san_pham] = await connection.query(sql_them_san_pham, [TenMH, MaHSX, MaDM, MaChiTietDM || null, ChatLieu, DonGia, TrangThai, ThongTinChiTiet, KichThuoc, NgayPhatHanh, LoaiHinhBan, TienCocToiThieu, isVisible]);
            
            const ma_san_pham_moi = them_san_pham.insertId;
            //Lấy mã sản phẩm mới thêm
            
            if(Array.isArray(Danh_sach_anh) && Danh_sach_anh.length>0){
                const sql_them_anh = `Insert into AnhMoHinh (LinkAnh, MaMoHinh) values (?,?)`;
                for(let image of Danh_sach_anh){
                    await connection.query(sql_them_anh, [image.Link, ma_san_pham_moi]);
                }
                //Cập nhật ảnh đai diện
                await connection.query(`Update Mohinh set AnhDaiDien = ? where MaMoHinh = ?`, [Danh_sach_anh[0].Link, ma_san_pham_moi]);
            }
            
            const sql_them_phan_loai = `Insert into Phanloai (ChiTietPhanLoai, SoLuong, MaMoHinh, DonGia, HienThi) values (?,?,?,?,?)`;
            await connection.query(sql_them_phan_loai,['Mặc định', SoLuong, ma_san_pham_moi, DonGia, HienThi]);

            if(Array.isArray(DS_PL) && DS_PL.length > 0){
                const variantVisibility = (HienThi === 0) ? 0 : (variant.HienThi !== undefined ? variant.HienThi : 1);

                await connection.query(sql_them_phan_loai, [
                    variant.ChiTietPhanLoai, 
                    variant.SoLuong, 
                    ma_san_pham_moi, 
                    variant.DonGia, 
                    variantVisibility // Đưa biến đã tính toán vào đây
                ]);
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

            const {MaMH,TenMH, MaHSX, MaDM, MaChiTietDM, ChatLieu, DonGia, TrangThai, ThongTinChiTiet ,
                LoaiHinhBan, Danh_sach_anh, KichThuoc, SoLuong, NgayPhatHanh, TienCocToiThieu, DS_PL, HienThi} = req.body;
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
            
            if (Array.isArray(Danh_sach_anh) && Danh_sach_anh.length > 0) {
                // Xóa sạch ảnh cũ của MaMH này
                await connection.query(`DELETE FROM AnhMoHinh WHERE MaMoHinh = ?`, [MaMH]);
                
                // Insert lại mảng ảnh mới
                const sql_them_anh = `INSERT INTO AnhMoHinh (LinkAnh, MaMoHinh) VALUES (?, ?)`;
                for (let image of Danh_sach_anh) {
                    await connection.query(sql_them_anh, [image.Link, MaMH]);
                }
                
                // Cập nhật ảnh đại diện vào bảng MoHinh
                await connection.query(`UPDATE MoHinh SET AnhDaiDien = ? WHERE MaMoHinh = ?`, [Danh_sach_anh[0].Link, MaMH]);
            }
            
            if(Array.isArray(DS_PL) && DS_PL.length > 0){
                const sql_sua_phan_loai = `Update Phanloai set ChiTietPhanLoai = ?, DonGia = ?, SoLuong = ? , HienThi = ?  where MaPhanLoai = ?`;
                const sql_them_phan_loai = `INSERT INTO Phanloai (ChiTietPhanLoai, MaMoHinh, SoLuong, DonGia, HienThi) VALUES (?, ?, ?, ?, ?)`;
                    for(let variant of DS_PL){
                        const visibility = (HienThi_SP_Goc === 0) ? 0 : (variant.HienThi !== undefined ? variant.HienThi : 1);
                        if(variant.MaPhanLoai)
                            await connection.query(sql_sua_phan_loai, [variant.ChiTietPhanLoai || null, variant.DonGia, variant.SoLuong, visibility, variant.MaPhanLoai]);
                        else
                            await connection.query(sql_them_phan_loai, [variant.ChiTietPhanLoai, MaMH, variant.SoLuong, visibility, variant.DonGia]);
                    }
            }
            
            await connection.query(`Update Phanloai set DonGia = ?, SoLuong = ?, HienThi = ? where MaMoHinh = ? and ChiTietPhanLoai = 'Mặc định'`,[DonGia, SoLuong, HienThi, MaMH]);
            
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

            const sql_core = `SELECT mh.MaMoHinh, mh.TenMH, mh.MaHSX, mh.MaDM, TenDM, mh.MaChiTietDM, TenChiTietDM, mh.DonGia, mh.TrangThai, mh.LoaiHinhBan,
                mh.AnhDaiDien, mh.NgayPhatHanh, TenHSX, mh.HienThi, 
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
            const MaMH = req.params.id;
            const sql = `Select mh.MaMoHinh, mh.AnhDaiDien, mh.TenMH, mh.ChatLieu, mh.DonGia, mh.TrangThai, mh.ThongTinChiTiet, 
                            mh.KichThuoc, mh.NgayPhatHanh, mh.LoaiHinhBan, mh.TienCocToiThieu,
                            (
                                SELECT COALESCE(SUM(SoLuong), 0) 
                                FROM PhanLoai 
                                WHERE MaMoHinh = mh.MaMoHinh
                            ) AS SoLuongTong,
                             TenHSX, TenDM, TenChiTietDM,
                             GROUP_CONCAT(anh.LinkAnh) AS DanhSachAnh,
                                (
                                    Select (mh.DonGia - ctkm.ChietKhau)
                                    from ChiTietKhuyenMai ctkm
                                    inner join KhuyenMai km on km.MaKM = ctkm.MaKM
                                    where km.ThoiGianBD <= now() and km.ThoiGianKT >= now() and mh.MaMoHinh = ctkm.MaMoHinh
                                    order by ctkm.ChietKhau desc
                                    limit 1
                                ) As dongiakhuyenmai
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
            if(product_detail.Danh_sach_anh){
                product_detail.Danh_sach_anh = product_detail.Danh_sach_anh.split(',').map(link => ({Link: link}));
            }
            else{
                product_detail.DanhSachAnh = [];
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

    // thong_tin_hang_gan_het: async(req, res) =>{

    // }
}
module.exports = product_admin;