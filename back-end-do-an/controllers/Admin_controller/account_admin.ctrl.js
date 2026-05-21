const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const excel = require('exceljs');

const account_admin = {
    them_tai_khoan: async(req, res) =>{
        const connection = await db.getConnection();
            try{
                await connection.beginTransaction();
                
                const {TenDN, MatKhau, Email, MaQuyen, BiKhoa, Hovaten} = req.body;
                const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';

                const [checkUser] = await connection.query(`SELECT TenDN, Email FROM TaiKhoan WHERE TenDN = ? OR Email = ?`, [TenDN, Email]);
                
                if (checkUser.length > 0) {
                    connection.release();
                    const isDuplicateUsername = checkUser.some(u => u.TenDN === TenDN);
                    const isDuplicateEmail = checkUser.some(u => u.Email === Email);
                    
                    let errorMsg = "Tài khoản đã tồn tại!";
                    if (isDuplicateUsername && isDuplicateEmail) errorMsg = "Tên đăng nhập và Email đều đã được sử dụng!";
                    else if (isDuplicateUsername) errorMsg = "Tên đăng nhập đã tồn tại!";
                    else if (isDuplicateEmail) errorMsg = "Email này đã được đăng ký cho tài khoản khác!";
                    
                    return res.status(400).json({ success: false, message: errorMsg });
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(MatKhau, salt);

                const sql_dang_ky = `Insert into TaiKhoan (TenDn, MatKhau, Email, MaQuyen, Bi_khoa) values (?,?,?,?,?)`;
                const [dang_ky] = await connection.query(sql_dang_ky, [TenDN, hashedPass, Email, MaQuyen, BiKhoa])
                const ma_tk = dang_ky.insertId;

                if(MaQuyen === 3){
                    const [khResult] = await connection.query(`Insert into KhachHang(MaTK, TenKH) values (?, ?)`,[ma_tk, Hovaten]);
                    const maKH = khResult.insertId;
                    await connection.query('INSERT INTO GioHang (MaKH) VALUES (?)', [maKH]);
                    await connection.query('INSERT INTO DanhMucYeuThich (MaKH) VALUES (?)', [maKH]);
                }
                else if(MaQuyen === 2 || MaQuyen === 1){
                    await connection.query(`Insert into NhanVien(MaTK, TenNV) values (?, ?)`,[ma_tk, Hovaten]);
                }
                await connection.query(
                    `INSERT INTO LogHoatDongTaiKhoan (NoiDung) VALUES (?)`,
                    [`${nguoiThucHien} đã tạo thành công tài khoản mới "@${TenDN}" (Họ tên: ${Hovaten})`]
                );
                await connection.commit();
                res.status(200).json({
                    message: "Thêm tài khoản mới thành công!"
                });
            }
            catch (error){
                await connection.rollback();
                console.error("Lỗi khi thêm tài khoản mới: ", error);
                res.status(500).json({ message: "Lỗi server khi thao tác với tài khoản!"});
            }
            finally{
                connection.release();
            }
        },
    
    xem_thong_tin_tai_khoan: async(req, res) =>{
        try{
            const MaTK = req.params.MaTK;
            const sql_lay_thong_tin = `SELECT tk.MaTK, q.TenQuyen, tk.TenDN, tk.Email, tk.MaQuyen, tk.AnhDaiDien, tk.Bi_khoa, tk.NgayTao, tk.DangNhapCuoi, tk.IPDangNhap
                                        FROM TaiKhoan tk 
                                        INNER JOIN Quyen q ON tk.MaQuyen = q.MaQuyen
                                        WHERE tk.MaTK = ?`;
            const [lay_thong_tin] = await db.query(sql_lay_thong_tin,[MaTK]);

            if(lay_thong_tin.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tài khoản này!"
                });
            }
            const thong_tin_tk = lay_thong_tin[0];
            let thong_tin_ca_nhan = {};
            if(thong_tin_tk.MaQuyen === 1 || thong_tin_tk.MaQuyen === 2) {
                const sql_nv = `SELECT MaNV, TenNV AS HoTen, DiaChi, SDT FROM NhanVien WHERE MaTK = ?`;
                const [ket_qua_nv] = await db.query(sql_nv, [MaTK]);
                if(ket_qua_nv.length > 0) thong_tin_ca_nhan = ket_qua_nv[0];
            } 
            else if (thong_tin_tk.MaQuyen === 3) {
                const sql_kh = `SELECT MaKH, TenKH AS HoTen, DiaChi, SDT FROM KhachHang WHERE MaTK = ?`;
                const [ket_qua_kh] = await db.query(sql_kh, [MaTK]);
                if(ket_qua_kh.length > 0) {
                    thong_tin_ca_nhan = ket_qua_kh[0];
                    const sql_donhang = `SELECT COUNT(MaDH) as SoDonHang, COALESCE(SUM(TongTien), 0) as TongChiTieu FROM DonHang WHERE MaKH = ? AND TrangThaiThanhToan = 'Đã thanh toán'`;
                    const [thong_ke_dh] = await db.query(sql_donhang, [thong_tin_ca_nhan.MaKH]);
                    thong_tin_ca_nhan.SoDonHang = thong_ke_dh[0].SoDonHang;
                    thong_tin_ca_nhan.TongChiTieu = thong_ke_dh[0].TongChiTieu;
                }
            }
            res.status(200).json({
                success: true,
                message: "Lấy thông tin tài khoản thành công!",
                data: {
                    ...thong_tin_tk,
                    ...thong_tin_ca_nhan
                }
            });
        }
        catch (error){
            console.error("Lỗi khi xem thông tin tài khoản: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi thao tác với tài khoản!"});
        }
    },

    sua_thong_tin_tai_khoan: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const MaTK = req.params.MaTK;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const {Hovaten, Email, diachi, SDT, BiKhoa} = req.body;

            if (parseInt(MaTK) === parseInt(req.user.id) && parseInt(BiKhoa) === 1) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Bạn không thể tự khóa tài khoản của chính mình!" 
                });
            }

            const [check_tk] = await connection.query(`Select MaQuyen from TaiKhoan where MaTK = ?`,[MaTK])
            if(check_tk.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tài khoản này!"
                });
            }
            if (Email && Email.trim() !== '') {
                const [checkEmail] = await connection.query(`SELECT MaTK FROM TaiKhoan WHERE Email = ? AND MaTK != ?`, [Email, MaTK]);
                if (checkEmail.length > 0) {
                    connection.release(); 
                    return res.status(400).json({ 
                        success: false, 
                        message: "Email này đã được sử dụng bởi một tài khoản khác!" 
                    });
                }
            }

            await connection.query(`Update TaiKhoan set Email = ?, Bi_khoa = ? where MaTK = ?`,[Email, BiKhoa, MaTK]);
            if(check_tk[0].MaQuyen === 1 || check_tk[0].MaQuyen === 2){
                await connection.query(`Update NhanVien set TenNV = ?, DiaChi = ?, SDT = ? where MaTK = ?`, [Hovaten, diachi, SDT, MaTK]);
            }
            else if(check_tk[0].MaQuyen === 3){
                await connection.query(`Update KhachHang set TenKH = ?, DiaChi = ?, SDT = ? where MaTK = ?`, [Hovaten, diachi, SDT, MaTK]);
            }
            await connection.query(
                `INSERT INTO LogHoatDongTaiKhoan (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã cập nhật thông tin hồ sơ cho tài khoản (Mã TK: #${MaTK})`]
            );
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin tài khoản thành công!",
                MaTK_vua_sua: MaTK
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin tài khoản: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi thao tác với tài khoản!"});
        }
        finally{
            connection.release();
        }
    },

    thay_doi_khoa_tai_khoan: async(req, res) =>{
        try{
            const {MaTK} = req.body;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';

            if (parseInt(MaTK) === parseInt(req.user.id)) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Bạn không thể tự khóa tài khoản của chính mình!" 
                });
            }
    
            const [tai_khoan] = await db.query(`SELECT Bi_khoa FROM TaiKhoan WHERE MaTK = ?`, [MaTK]);
            if (tai_khoan.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản!" });
            }
            const trangThaiHienTai = tai_khoan[0].Bi_khoa;
            const hanhDong = trangThaiHienTai === 1 ? 'mở khóa' : 'khóa';

            await db.query(`Update TaiKhoan set Bi_khoa = 1 - Bi_khoa where MaTK = ?`,[MaTK]);
            await db.query(
                `INSERT INTO LogHoatDongTaiKhoan (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã ${hanhDong} tài khoản (Mã TK: #${MaTK})`]
            );
    
            res.status(200).json({
                success: true,
                message: "Khoá/Mở khoá tài khoản thành công!",
                MaTK_vua_sua: MaTK
            });
        }
        catch (error){
            console.error("Lỗi khi khoá tài khoản: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi thao tác với tài khoản!"});
        }
    },

    liet_ke_tai_khoan: async(req, res) =>{
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const {keyword_hoten, keyword_sdt, keyword_diachi, quyen_admin, quyen_nhanvien, quyen_khach, trang_thai, tu_ngay, den_ngay} = req.query;

            let condition = [];
            let value = [];
            
            if(keyword_hoten){
                condition.push("Coalesce(nv.TenNV, kh.TenKH) like ?");
                value.push(`%${keyword_hoten}%`);
            }
            if(keyword_sdt){
                condition.push("Coalesce(nv.SDT, kh.SDT) LIKE ?");
                value.push(`%${keyword_sdt}%`);
            }
            if(keyword_diachi){
                condition.push("Coalesce(nv.DiaChi, kh.DiaChi) LIKE ?");
                value.push(`%${keyword_diachi}%`);
            }

            let roles = [];
            if (quyen_admin === 'true') roles.push(1);
            if (quyen_nhanvien === 'true') roles.push(2);
            if (quyen_khach === 'true') roles.push(3);
            if (roles.length > 0) {
                const placeholders = roles.map(() => '?').join(',');
                condition.push(`tk.MaQuyen IN (${placeholders})`);
                value.push(...roles);
            }

            if (trang_thai === 'active') {
                condition.push("tk.Bi_khoa = 0");
            } 
            else if (trang_thai === 'locked') {
                condition.push("tk.Bi_khoa = 1");
            }

            if (tu_ngay) {
                condition.push("DATE(tk.NgayTao) >= ?");
                value.push(tu_ngay);
            }
            if (den_ngay) {
                condition.push("DATE(tk.NgayTao) <= ?");
                value.push(den_ngay);
            }

            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";

            const sql_core = `Select tk.MaTK, tk.TenDN, tk.Email, tk.AnhDaiDien, tk.NgayTao, tk.DangNhapCuoi, tk.IPDangNhap, tk.Bi_khoa,
                                q.TenQuyen, tk.MaQuyen,
                                Coalesce(nv.TenNV, kh.TenKH) As HoTen,
                                Coalesce(nv.SDT, kh.SDT) As SDT,
                                Coalesce(nv.DiaChi, kh.DiaChi) As DiaChi
                                from TaiKhoan tk
                                left join Quyen q on tk.MaQuyen = q.MaQuyen
                                left join NhanVien nv on tk.MaTK = nv.MaTK
                                left join KhachHang kh on tk.MaTK = kh.MaTK 
                                ${whereClause}`;

            const sql_count = `Select count(*) as total from (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count, value);
            const totalItems = countResult[0].total;

            const totalPage = Math.ceil(totalItems / limit);

            const sql_ds = `${sql_core}
                            order by tk.MaQuyen ASC, tk.NgayTao Desc
                            limit ? offset ?`;
            const [ds] = await db.query(sql_ds, [...value, limit, offset]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách tài khoản thành công!",
                data: ds,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });
        }
        catch (error){
            console.error("Lỗi khi liệt kê tài khoản: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi liệt kê tài khoản!"
            });
        }
    },

    thong_ke_tai_khoan: async(req, res) => {
        try {
            const sql = `SELECT (SELECT COUNT(*) FROM TaiKhoan) as TotalUsers,
                        (SELECT COUNT(*) FROM TaiKhoan WHERE DATE(DangNhapCuoi) = CURDATE()) as ActiveToday,
                        (SELECT COUNT(*) FROM TaiKhoan WHERE MONTH(NgayTao) = MONTH(CURDATE()) AND YEAR(NgayTao) = YEAR(CURDATE())) as NewThisMonth,
                        (SELECT COUNT(*) FROM TaiKhoan WHERE Bi_khoa = 1) as LockedUsers,
                        (SELECT COUNT(*) FROM TaiKhoan WHERE MaQuyen = 1) as AdminCount,
                        (SELECT COUNT(*) FROM TaiKhoan WHERE MaQuyen = 2) as StaffCount,
                        (SELECT COUNT(*) FROM TaiKhoan WHERE MaQuyen = 3) as CollectorCount`;
            const [stats] = await db.query(sql);
            
            res.status(200).json({
                success: true,
                data: stats[0]
            });
        } 
        catch (error) {
            res.status(500).json({ 
                success: false, 
                message: "Lỗi thống kê" 
            });
        }
    },
    xuat_bao_cao_tai_khoan: async(req, res) => {
        try {
            const {keyword_hoten, keyword_sdt, keyword_diachi, quyen_admin, quyen_nhanvien, quyen_khach, trang_thai, tu_ngay, den_ngay} = req.query;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';

            let condition = [];
            let value = [];
            
            if(keyword_hoten){
                condition.push("Coalesce(nv.TenNV, kh.TenKH) like ?");
                value.push(`%${keyword_hoten}%`);
            }
            if(keyword_sdt){
                condition.push("Coalesce(nv.SDT, kh.SDT) LIKE ?");
                value.push(`%${keyword_sdt}%`);
            }
            if(keyword_diachi){
                condition.push("Coalesce(nv.DiaChi, kh.DiaChi) LIKE ?");
                value.push(`%${keyword_diachi}%`);
            }

            let roles = [];
            if (quyen_admin === 'true') roles.push(1);
            if (quyen_nhanvien === 'true') roles.push(2);
            if (quyen_khach === 'true') roles.push(3);
            if (roles.length > 0) {
                const placeholders = roles.map(() => '?').join(',');
                condition.push(`tk.MaQuyen IN (${placeholders})`);
                value.push(...roles);
            }

            if (trang_thai === 'active') condition.push("tk.Bi_khoa = 0");
            else if (trang_thai === 'locked') condition.push("tk.Bi_khoa = 1");

            if (tu_ngay) {
                condition.push("DATE(tk.NgayTao) >= ?");
                value.push(tu_ngay);
            }
            if (den_ngay) {
                condition.push("DATE(tk.NgayTao) <= ?");
                value.push(den_ngay);
            }

            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";

            const sql = `Select tk.MaTK, tk.TenDN, tk.Email, tk.NgayTao, tk.Bi_khoa,
                        q.TenQuyen, Coalesce(nv.TenNV, kh.TenKH) As HoTen, Coalesce(nv.SDT, kh.SDT) As SDT
                        from TaiKhoan tk
                        left join Quyen q on tk.MaQuyen = q.MaQuyen
                        left join NhanVien nv on tk.MaTK = nv.MaTK
                        left join KhachHang kh on tk.MaTK = kh.MaTK 
                        ${whereClause}
                        order by tk.MaQuyen ASC, tk.NgayTao DESC`;
            const [users] = await db.query(sql, value);

            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Danh sách Người dùng');

            worksheet.columns = [
                { header: 'Mã TK', key: 'MaTK', width: 10 },
                { header: 'Họ và Tên', key: 'HoTen', width: 25 },
                { header: 'Tên Đăng Nhập', key: 'TenDN', width: 20 },
                { header: 'Email liên hệ', key: 'Email', width: 30 },
                { header: 'Số Điện Thoại', key: 'SDT', width: 15 },
                { header: 'Vai Trò', key: 'TenQuyen', width: 15 },
                { header: 'Trạng Thái', key: 'TrangThai', width: 15 },
                { header: 'Ngày Đăng Ký', key: 'NgayTao', width: 20 },
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = { type: 'pattern', pattern:'solid', fgColor:{ argb:'FFF8FAFC' } };

            users.forEach(user => {
                worksheet.addRow({
                    MaTK: user.MaTK,
                    HoTen: user.HoTen || 'Chưa cập nhật',
                    TenDN: user.TenDN,
                    Email: user.Email || 'Chưa cập nhật',
                    SDT: user.SDT || 'Chưa cập nhật',
                    TenQuyen: user.TenQuyen,
                    TrangThai: user.Bi_khoa === 1 ? 'Bị khóa' : 'Hoạt động',
                    NgayTao: user.NgayTao ? new Date(user.NgayTao).toLocaleString('vi-VN') : ''
                });
            });

            await db.query(
                `INSERT INTO LogHoatDongTaiKhoan (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã xuất dữ liệu danh sách ${users.length} tài khoản ra file Excel`]
            );

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=' + 'Bao_Cao_Nguoi_Dung.xlsx');

            await workbook.xlsx.write(res);
            res.status(200).end();
        } 
        catch (error) {
            console.error("Lỗi xuất Excel: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi xuất báo cáo" });
        }
    },
    dat_lai_mat_khau: async(req, res) => {
        try {
            const MaTK = req.params.MaTK;
            const nguoiThucHien = req.user?.HoTen || req.user?.TenDN || 'Admin';
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash('123456', salt);

            const [result] = await db.query(`UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?`, [hashedPass, MaTK]);
            
            await db.query(
                `INSERT INTO LogHoatDongTaiKhoan (NoiDung) VALUES (?)`,
                [`${nguoiThucHien} đã đặt lại mật khẩu về mặc định "123456" cho tài khoản (Mã TK: #${MaTK})`]
            );

            if(result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Không tìm thấy tài khoản!" 
                });
            }

            res.status(200).json({ 
                success: true, 
                message: "Mật khẩu đã được đặt lại thành: 123456" 
            });
        } 
        catch (error) {
            console.error("Lỗi reset mật khẩu: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ!" 
            });
        }
    },
    lay_nhat_ky_hoat_dong: async(req, res) => {
        try {
            const sql = `SELECT * FROM LogHoatDongTaiKhoan ORDER BY ThoiGian DESC LIMIT 3`;
            const [logs] = await db.query(sql);
            
            res.status(200).json({
                success: true,
                data: logs
            });
        } 
        catch (error) {
            console.error("Lỗi lấy nhật ký: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ!" 
            });
        }
    },
    lay_tat_ca_log_phan_trang: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10; 
            const offset = (page - 1) * limit;

            const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM LogHoatDongTaiKhoan`);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            const [logs] = await db.query(
                `SELECT * FROM LogHoatDongTaiKhoan ORDER BY ThoiGian DESC LIMIT ? OFFSET ?`,
                [limit, offset]
            );

            res.status(200).json({
                success: true,
                data: logs,
                pagination: { currentPage: page, totalPage: totalPage }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    }
}
module.exports = account_admin;