const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const excel = require('exceljs');

const account_admin = {
    them_tai_khoan: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const { TenDN, MatKhau, Email, MaQuyen, BiKhoa, Hovaten } = req.body;
            // ID người thực hiện hành động tạo (Lấy từ Token của Admin)
            const MaNguoiThucHien = req.user.id; 

            // =====================================
            // 1. VALIDATION CƠ BẢN & BẢO MẬT
            // =====================================
            if (!TenDN || !MatKhau || !Email || !Hovaten) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ các thông tin bắt buộc!" });
            }

            // Validate Email bằng Regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(Email)) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Định dạng Email không hợp lệ!" });
            }

            // Validate Mật khẩu (Ví dụ: Ít nhất 6 ký tự)
            if (MatKhau.length < 6) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Mật khẩu phải dài ít nhất 6 ký tự để đảm bảo an toàn!" });
            }

            // =====================================
            // 2. KIỂM TRA TRÙNG LẶP DỮ LIỆU
            // =====================================
            const [checkUser] = await connection.query(`SELECT TenDN, Email FROM TaiKhoan WHERE TenDN = ? OR Email = ?`, [TenDN, Email]);
            
            if (checkUser.length > 0) {
                await connection.rollback(); // FIX LỖI: Bắt buộc rollback trước khi return
                
                const isDuplicateUsername = checkUser.some(u => u.TenDN === TenDN);
                const isDuplicateEmail = checkUser.some(u => u.Email === Email);
                
                let errorMsg = "Tài khoản đã tồn tại!";
                if (isDuplicateUsername && isDuplicateEmail) errorMsg = "Tên đăng nhập và Email đều đã được sử dụng!";
                else if (isDuplicateUsername) errorMsg = "Tên đăng nhập đã tồn tại!";
                else if (isDuplicateEmail) errorMsg = "Email này đã được đăng ký cho tài khoản khác!";
                
                return res.status(400).json({ success: false, message: errorMsg });
            }

            // =====================================
            // 3. XỬ LÝ DỮ LIỆU & BĂM MẬT KHẨU
            // =====================================
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(MatKhau, salt);
            
            // Xử lý biến BiKhoa an toàn (Mặc định là 0 - Không khóa)
            const isLocked = BiKhoa !== undefined ? parseInt(BiKhoa) : 0;
            const roleId = parseInt(MaQuyen) || 3; // Mặc định là Khách Hàng (3)

            const sql_dang_ky = `INSERT INTO TaiKhoan (TenDN, MatKhau, Email, MaQuyen, Bi_khoa) VALUES (?, ?, ?, ?, ?)`;
            const [dang_ky] = await connection.query(sql_dang_ky, [TenDN, hashedPass, Email, roleId, isLocked]);
            const ma_tk = dang_ky.insertId;

            // =====================================
            // 4. PHÂN NHÁNH THỰC THỂ (KHÁCH HÀNG / NHÂN VIÊN)
            // =====================================
            if (roleId === 3) { // Khách Hàng
                const [khResult] = await connection.query(`INSERT INTO KhachHang(MaTK, TenKH) VALUES (?, ?)`, [ma_tk, Hovaten]);
                const maKH = khResult.insertId;
                
                // Khởi tạo ngay Giỏ hàng và Wishlist
                await connection.query('INSERT INTO GioHang (MaKH) VALUES (?)', [maKH]);
                await connection.query('INSERT INTO DanhMucYeuThich (MaKH) VALUES (?)', [maKH]);
            } 
            else if (roleId === 2 || roleId === 1) { // Staff hoặc Admin
                await connection.query(`INSERT INTO NhanVien(MaTK, TenNV) VALUES (?, ?)`, [ma_tk, Hovaten]);
            }

            // =====================================
            // 5. GHI LOG HỆ THỐNG
            // =====================================
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const roleText = roleId === 1 ? "Quản trị viên" : (roleId === 2 ? "Nhân viên" : "Khách hàng");
            const noiDungLog = `Tạo mới tài khoản ${roleText} #${ma_tk}: "@${TenDN}"`;
            
            // FIX LỖI: Dùng chuẩn chung của bảng Log
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ACCOUNT_CREATE', ?, ?, NOW())
            `, [MaNguoiThucHien, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm tài khoản mới thành công!"
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi thêm tài khoản mới: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác với tài khoản!" });
        } finally {
            if (connection) connection.release(); // FIX LỖI: Đảm bảo chỉ gọi release 1 lần ở đây
        }
    },
    
    xem_thong_tin_tai_khoan: async(req, res) => {
        try {
            // Hỗ trợ bắt ID từ cả 2 kiểu khai báo router phổ biến (/:MaTK hoặc /:id)
            const MaTK = req.params.MaTK || req.params.id;
            
            const sql_lay_thong_tin = `
                SELECT tk.MaTK, q.TenQuyen, tk.TenDN, tk.Email, tk.MaQuyen, tk.AnhDaiDien, tk.Bi_khoa, tk.NgayTao, tk.DangNhapCuoi, tk.IPDangNhap
                FROM TaiKhoan tk 
                INNER JOIN Quyen q ON tk.MaQuyen = q.MaQuyen
                WHERE tk.MaTK = ?
            `;
            const [lay_thong_tin] = await db.query(sql_lay_thong_tin, [MaTK]);

            if (lay_thong_tin.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tài khoản này!"
                });
            }

            const thong_tin_tk = lay_thong_tin[0];
            let thong_tin_ca_nhan = {};

            if (thong_tin_tk.MaQuyen === 1 || thong_tin_tk.MaQuyen === 2) {
                // XỬ LÝ NHÂN VIÊN & ADMIN
                const sql_nv = `SELECT MaNV, TenNV AS HoTen, DiaChi, SDT FROM NhanVien WHERE MaTK = ?`;
                const [ket_qua_nv] = await db.query(sql_nv, [MaTK]);
                if (ket_qua_nv.length > 0) thong_tin_ca_nhan = ket_qua_nv[0];
            } 
            else if (thong_tin_tk.MaQuyen === 3) {
                const sql_kh = `
                    SELECT 
                        kh.MaKH, kh.TenKH AS HoTen, kh.DiaChi, kh.SDT,
                        COUNT(dh.MaDH) AS SoDonHang,
                        COALESCE(SUM(dh.TongTien), 0) AS TongChiTieu
                    FROM KhachHang kh
                    LEFT JOIN DonHang dh ON kh.MaKH = dh.MaKH AND dh.TrangThaiThanhToan = 'Đã thanh toán'
                    WHERE kh.MaTK = ?
                    GROUP BY kh.MaKH
                `;
                const [ket_qua_kh] = await db.query(sql_kh, [MaTK]);
                
                if (ket_qua_kh.length > 0) {
                    thong_tin_ca_nhan = ket_qua_kh[0];
                    // Ép kiểu chặt chẽ để frontend dễ dàng tính toán/định dạng (VND)
                    thong_tin_ca_nhan.SoDonHang = Number(thong_tin_ca_nhan.SoDonHang);
                    thong_tin_ca_nhan.TongChiTieu = Number(thong_tin_ca_nhan.TongChiTieu);
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
        catch (error) {
            console.error("Lỗi khi xem thông tin tài khoản: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi thao tác với tài khoản!"
            });
        }
    },

    sua_thong_tin_tai_khoan: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // ID tài khoản mục tiêu (Bị sửa)
            const MaTK = req.params.MaTK || req.params.id; 
            const { Hovaten, Email, diachi, SDT, BiKhoa } = req.body;
            // ID và Quyền của người đang thao tác (Lấy từ Token)
            const MaNguoiThucHien = parseInt(req.user.id);
            const QuyenNguoiThucHien = parseInt(req.user.role);

            // 1. CHỐT CHẶN TỰ KHÓA CHÍNH MÌNH
            if (parseInt(MaTK) === MaNguoiThucHien && parseInt(BiKhoa) === 1) {
                await connection.rollback(); // FIX LỖI: Thêm rollback
                return res.status(403).json({ 
                    success: false, 
                    message: "Bạn không thể tự khóa tài khoản của chính mình!" 
                });
            }

            // 2. KIỂM TRA TỒN TẠI VÀ CHỐT CHẶN ĐẶC QUYỀN (ANTI-MUTINY)
            const [check_tk] = await connection.query(`SELECT MaQuyen, TenDN FROM TaiKhoan WHERE MaTK = ?`, [MaTK]);
            if (check_tk.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản này!" });
            }
            
            const targetRole = check_tk[0].MaQuyen;
            const targetName = check_tk[0].TenDN;

            // Logic: Nếu người thao tác là Admin (1), và mục tiêu cũng là Admin (1), nhưng 2 ID khác nhau -> CHẶN!
            if (QuyenNguoiThucHien === 1 && targetRole === 1 && parseInt(MaTK) !== MaNguoiThucHien) {
                await connection.rollback();
                return res.status(403).json({ 
                    success: false, 
                    message: "Hệ thống từ chối: Quản trị viên không được quyền can thiệp vào hồ sơ của Quản trị viên khác!" 
                });
            }

            // 3. KIỂM TRA TRÙNG LẶP EMAIL
            if (Email && Email.trim() !== '') {
                const [checkEmail] = await connection.query(`SELECT MaTK FROM TaiKhoan WHERE Email = ? AND MaTK != ?`, [Email, MaTK]);
                if (checkEmail.length > 0) {
                    await connection.rollback(); // FIX LỖI: Dùng rollback thay vì release
                    return res.status(400).json({ 
                        success: false, 
                        message: "Email này đã được sử dụng bởi một tài khoản khác!" 
                    });
                }
            }

            // 4. THỰC HIỆN CẬP NHẬT
            const isLocked = BiKhoa !== undefined ? parseInt(BiKhoa) : 0;
            await connection.query(`UPDATE TaiKhoan SET Email = ?, Bi_khoa = ? WHERE MaTK = ?`, [Email, isLocked, MaTK]);
            
            if (targetRole === 1 || targetRole === 2) {
                await connection.query(`UPDATE NhanVien SET TenNV = ?, DiaChi = ?, SDT = ? WHERE MaTK = ?`, [Hovaten, diachi, SDT, MaTK]);
            } else if (targetRole === 3) {
                await connection.query(`UPDATE KhachHang SET TenKH = ?, DiaChi = ?, SDT = ? WHERE MaTK = ?`, [Hovaten, diachi, SDT, MaTK]);
            }

            // 5. GHI LOG ĐỒNG BỘ
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            const noiDungLog = `Cập nhật thông tin hồ sơ cho tài khoản #${MaTK}: "@${targetName}"`;
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ACCOUNT_UPDATE', ?, ?, NOW())
            `, [MaNguoiThucHien, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin tài khoản thành công!",
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin tài khoản: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi thao tác với tài khoản!"});
        } finally {
            if (connection) connection.release();
        }
    },

    thay_doi_khoa_tai_khoan: async(req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { MaTK } = req.body;
            const MaNguoiThucHien = parseInt(req.user.id);
            
            // Lưu ý: Ở các file trước bạn dùng req.user.MaQuyen, hãy đảm bảo tính đồng bộ của biến này từ middleware nhé
            const QuyenNguoiThucHien = parseInt(req.user.MaQuyen || req.user.role);

            // 1. CHẶN TỰ KHÓA CHÍNH MÌNH
            if (parseInt(MaTK) === MaNguoiThucHien) {
                await connection.rollback(); // FIX LỖI: Bổ sung rollback
                return res.status(403).json({ 
                    success: false, 
                    message: "Bạn không thể tự khóa tài khoản của chính mình!" 
                });
            }
    
            // 2. KIỂM TRA TỒN TẠI VÀ CHUẨN BỊ LOGIC
            // FIX LỖI: Chọn đúng tên cột Bi_khoa
            const [check_tk] = await connection.query(`SELECT MaQuyen, TenDN, Bi_khoa FROM TaiKhoan WHERE MaTK = ?`, [MaTK]);
            if (check_tk.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản này!" });
            }
            
            const targetRole = check_tk[0].MaQuyen;
            const targetName = check_tk[0].TenDN;
            const trangThaiHienTai = check_tk[0].Bi_khoa; // FIX LỖI: Dùng đúng biến check_tk
            
            // 3. CHẶN LEO THANG ĐẶC QUYỀN (ANTI-MUTINY)
            if (QuyenNguoiThucHien === 1 && targetRole === 1 && parseInt(MaTK) !== MaNguoiThucHien) {
                await connection.rollback();
                return res.status(403).json({ 
                    success: false, 
                    message: "Hệ thống từ chối: Quản trị viên không được quyền can thiệp vào hồ sơ của Quản trị viên khác!" 
                });
            }

            // 4. THỰC HIỆN CẬP NHẬT
            // FIX LỖI: Dùng connection.query để giữ Transaction
            await connection.query(`UPDATE TaiKhoan SET Bi_khoa = 1 - Bi_khoa WHERE MaTK = ?`, [MaTK]);
            
            // 5. GHI LOG ĐỒNG BỘ
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';

            // Tái sử dụng logic cực hay của bạn
            const hanhDong = trangThaiHienTai === 1 ? 'Mở khóa' : 'Khóa';
            const noiDungLog = `${hanhDong} tài khoản #${MaTK}: "@${targetName}"`;
            
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ACCOUNT_STATUS_TOGGLE', ?, ?, NOW())
            `, [MaNguoiThucHien, noiDungLog, userIp]);
    
            // FIX LỖI: Bổ sung commit chốt dữ liệu
            await connection.commit();

            res.status(200).json({
                success: true,
                message: `${hanhDong} tài khoản thành công!`,
                MaTK_vua_sua: MaTK
            });
        }
        catch (error) {
            await connection.rollback(); // FIX LỖI: Bổ sung rollback khi gặp lỗi
            console.error("Lỗi khi khoá tài khoản: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi thao tác với tài khoản!"
            });
        }
        finally {
            // FIX LỖI: Bổ sung giải phóng kết nối
            if (connection) connection.release(); 
        }
    },

    liet_ke_tai_khoan: async(req, res) => {
        try {
            let page = Math.max(parseInt(req.query.page) || 1, 1);
            let limit = parseInt(req.query.limit) || 10;
            if (limit < 1) limit = 10;
            if (limit > 20) limit = 20;
            const offset = (page - 1) * limit;

            const { 
                keyword_tdn, keyword_hoten, keyword_sdt, keyword_diachi, 
                quyen_admin, quyen_nhanvien, quyen_khach, trang_thai, tu_ngay, den_ngay 
            } = req.query;

            let condition = [];
            let value = [];

            if (keyword_tdn) {
                condition.push("tk.TenDN LIKE ?");
                value.push(`%${keyword_tdn}%`);
            }
            if (keyword_hoten) {
                condition.push("COALESCE(nv.TenNV, kh.TenKH) LIKE ?");
                value.push(`%${keyword_hoten}%`);
            }
            if (keyword_sdt) {
                condition.push("COALESCE(nv.SDT, kh.SDT) LIKE ?");
                value.push(`%${keyword_sdt}%`);
            }
            if (keyword_diachi) {
                condition.push("COALESCE(nv.DiaChi, kh.DiaChi) LIKE ?");
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
            } else if (trang_thai === 'locked') {
                condition.push("tk.Bi_khoa = 1");
            }

            // TỐI ƯU 1: Viết SARGable query để tận dụng Index của MySQL
            if (tu_ngay) {
                condition.push("tk.NgayTao >= ?");
                value.push(`${tu_ngay} 00:00:00`); 
            }
            if (den_ngay) {
                condition.push("tk.NgayTao <= ?");
                value.push(`${den_ngay} 23:59:59`);
            }

            let whereClause = condition.length > 0 ? "WHERE " + condition.join(" AND ") : "";

            const sql_core = `
                SELECT tk.MaTK, tk.TenDN, tk.Email, tk.AnhDaiDien, tk.NgayTao, tk.DangNhapCuoi, tk.IPDangNhap, tk.Bi_khoa,
                q.TenQuyen, tk.MaQuyen,
                COALESCE(nv.TenNV, kh.TenKH) AS HoTen,
                COALESCE(nv.SDT, kh.SDT) AS SDT,
                COALESCE(nv.DiaChi, kh.DiaChi) AS DiaChi
                FROM TaiKhoan tk
                LEFT JOIN Quyen q ON tk.MaQuyen = q.MaQuyen
                LEFT JOIN NhanVien nv ON tk.MaTK = nv.MaTK
                LEFT JOIN KhachHang kh ON tk.MaTK = kh.MaTK 
                ${whereClause}
            `;

            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) AS temptable`;
            const sql_ds = `
                ${sql_core}
                ORDER BY tk.MaQuyen ASC, tk.NgayTao DESC
                LIMIT ? OFFSET ?
            `;
            const sql_params = [...value, limit, offset];

            // TỐI ƯU 2: Promise.all chạy đa luồng
            const [[countResult], [ds]] = await Promise.all([
                db.query(sql_count, value),
                db.query(sql_ds, sql_params)
            ]);

            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

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
        catch (error) {
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
            const MaTK = req.user.id;

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

            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            const noiDungLog = `Xuất báo cáo tài khoản."`;
            
            await db.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ACCOUNT_STATUS_TOGGLE', ?, ?, NOW())
            `, [MaTK, noiDungLog, userIp]);

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
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const MaTK = req.params.MaTK || req.params.id;
            const MaNguoiThucHien = parseInt(req.user.id);
            const QuyenNguoiThucHien = parseInt(req.user.MaQuyen || req.user.role);

            // 1. KIỂM TRA TỒN TẠI VÀ CHẶN LEO THANG ĐẶC QUYỀN
            const [check_tk] = await connection.query(`SELECT MaQuyen, TenDN FROM TaiKhoan WHERE MaTK = ?`, [MaTK]);
            if (check_tk.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản để đặt lại mật khẩu!" });
            }

            const targetRole = check_tk[0].MaQuyen;
            const targetName = check_tk[0].TenDN;

            // Chặn tự reset chính mình (Nên ép người dùng vào trang cá nhân để đổi pass cho đúng luồng)
            if (parseInt(MaTK) === MaNguoiThucHien) {
                await connection.rollback();
                return res.status(403).json({ 
                    success: false, 
                    message: "Vui lòng sử dụng chức năng Đổi mật khẩu trong trang hồ sơ cá nhân của bạn!" 
                });
            }

            // Chặn Admin reset mật khẩu của Admin khác
            if (QuyenNguoiThucHien === 1 && targetRole === 1) {
                await connection.rollback();
                return res.status(403).json({ 
                    success: false, 
                    message: "Hệ thống từ chối: Quản trị viên không được quyền reset mật khẩu của Quản trị viên khác!" 
                });
            }

            // 2. BĂM MẬT KHẨU MẶC ĐỊNH
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash('123456', salt);

            // 3. CẬP NHẬT MẬT KHẨU
            await connection.query(`UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?`, [hashedPass, MaTK]);
            
            // 4. GHI LOG HỆ THỐNG
            let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (userIp === '::1' || userIp === '::ffff:127.0.0.1') userIp = '127.0.0.1';
            
            const noiDungLog = `Đặt lại mật khẩu về mặc định cho TK #${MaTK}: "@${targetName}"`;
            
            await connection.query(`
                INSERT INTO LogHoatDongTaiKhoan (MaTK, LoaiLog, NoiDung, IPAddress, ThoiGian)
                VALUES (?, 'ACCOUNT_PASSWORD_RESET', ?, ?, NOW())
            `, [MaNguoiThucHien, noiDungLog, userIp]);

            await connection.commit();
            res.status(200).json({ 
                success: true, 
                message: "Mật khẩu đã được đặt lại thành: 123456" 
            });
        } 
        catch (error) {
            await connection.rollback();
            console.error("Lỗi reset mật khẩu: ", error);
            res.status(500).json({ 
                success: false, 
                message: "Lỗi máy chủ khi thao tác!" 
            });
        }
        finally {
            if (connection) connection.release();
        }
    },
    lay_nhat_ky_hoat_dong: async(req, res) => {
        try {
            // TỐI ƯU 1: Chỉ lấy log liên quan đến tài khoản/bảo mật
            // TỐI ƯU 2: JOIN để lấy Tên người thực hiện
            const sql = `
                SELECT log.*, tk.TenDN AS NguoiThucHien
                FROM LogHoatDongTaiKhoan log
                LEFT JOIN TaiKhoan tk ON log.MaTK = tk.MaTK
                WHERE log.LoaiLog LIKE 'ACCOUNT_%'
                ORDER BY log.ThoiGian DESC 
                LIMIT 3
            `;
            const [logs] = await db.query(sql);
            
            res.status(200).json({
                success: true,
                message: "Lấy nhật ký bảo mật gần đây thành công!",
                data: logs
            });
        } 
        catch (error) {
            console.error("Lỗi lấy nhật ký: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy nhật ký!" });
        }
    },

    lay_tat_ca_log_phan_trang: async(req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            let limit = parseInt(req.query.limit) || 10; 
            if (!limit || isNaN(limit) || limit < 1) limit = 10;
            const offset = (page - 1) * limit;

            // Bộ lọc chỉ lấy Log tài khoản
            const whereClause = `WHERE log.LoaiLog LIKE 'ACCOUNT_%'`;

            const sql_count = `SELECT COUNT(*) AS total FROM LogHoatDongTaiKhoan log ${whereClause}`;
            const sql_ds = `
                SELECT log.*, tk.TenDN AS NguoiThucHien
                FROM LogHoatDongTaiKhoan log
                LEFT JOIN TaiKhoan tk ON log.MaTK = tk.MaTK
                ${whereClause}
                ORDER BY log.ThoiGian DESC 
                LIMIT ? OFFSET ?
            `;

            // TỐI ƯU 3: Chạy song song (Promise.all)
            const [[countResult], [logs]] = await Promise.all([
                db.query(sql_count),
                db.query(sql_ds, [limit, offset])
            ]);

            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách nhật ký thành công!",
                data: logs,
                pagination: { 
                    currentPage: page, 
                    limit: limit, 
                    totalItems: totalItems, // Đồng bộ key với toàn hệ thống
                    totalPage: totalPage 
                }
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách nhật ký phân trang: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy nhật ký!" });
        }
    }
}
module.exports = account_admin;