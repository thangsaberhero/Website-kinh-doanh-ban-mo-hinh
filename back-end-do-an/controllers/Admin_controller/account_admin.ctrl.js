const db = require('../../config/db');
const bcrypt = require('bcryptjs');

const account_admin = {
    them_tai_khoan: async(req, res) =>{
        const connection = await db.getConnection();
            try{
                await connection.beginTransaction();
                
                const {TenDN, MatKhau, Email, MaQuyen, BiKhoa, Hovaten} = req.body;

                const [checkUser] = await connection.query(`Select * from TaiKhoan where TenDn = ?`,[TenDN]);
                if(checkUser.length > 0){
                    connection.release();                    
                    return res.status(400).json({
                        message: "Đã tồn tại tài khoản này!"
                    });
                }

                // Mã hóa mật khẩu
                const salt = await bcrypt.genSalt(10);
                const hashedPass = await bcrypt.hash(MatKhau, salt);

                const sql_dang_ky = `Insert into TaiKhoan (TenDn, MatKhau, Email, MaQuyen, Bi_khoa) values (?,?,?,?,?)`;
                const [dang_ky] = await connection.query(sql_dang_ky, [TenDN, hashedPass, Email, MaQuyen, BiKhoa])
                const ma_tk = dang_ky.insertId;

                if(MaQuyen === 3){
                    await connection.query(`Insert into KhachHang(MaTK, TenKH) values (?)`,[ma_tk, Hovaten]); 
                }
                else if(MaQuyen === 2 || MaQuyen === 1){
                    await connection.query(`Insert into NhanVien(MaTK, TenNV) values (?)`,[ma_tk, Hovaten]);
                }
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
            const sql_lay_thong_tin = `Select TenQuyen, TenDN, Email, MaQuyen, AnhDaiDien, Bi_khoa, NgayTao, DangNhapCuoi
                                        from TaiKhoan inner join Quyen on TaiKhoan.MaQuyen = Quyen.MaQuyen
                                        where MaTK = ?`;
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
                if(ket_qua_kh.length > 0) thong_tin_ca_nhan = ket_qua_kh[0];
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
            const {MaTK, Hovaten, Email, diachi, SDT, BiKhoa} = req.body;
            const [check_tk] = await connection.query(`Select MaQuyen from TaiKhoan where MaTK = ?`,[MaTK])
            if(check_tk.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy tài khoản này!"
                });
            }
            await connection.query(`Update TaiKhoan set Email = ?, Bi_khoa = ? where MaTK = ?`,[Email, BiKhoa, MaTK]);
            if(check_tk[0].MaQuyen === 1 || check_tk[0].MaQuyen === 2){
                await connection.query(`Update NhanVien set TenNV = ?, DiaChi = ?, SDT = ? where MaTK = ?`, [Hovaten, diachi, SDT, MaTK]);
            }
            else if(check_tk[0].MaQuyen === 3){
                await connection.query(`Update KhachHang set TenKH = ?, DiaChi = ?, SDT = ? where MaTK = ?`, [Hovaten, diachi, SDT, MaTK]);
            }
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
            await db.query(`Update TaiKhoan set Bi_khoa = 1 - Bi_khoa where MaTK = ?`,[MaTK]);
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

            const {keyword_hoten, keyword_sdt, 
                    quyen_admin, quyen_nhanvien, quyen_khach
            } = req.query;

            let condition = [];
            let value = [];
            if(keyword_hoten){
                condition.push("HoTen like ?");
                value.push(`%${keyword_hoten}%`);
            }
            if(keyword_sdt){
                condition.push("SDT = ?");
                value.push(keyword_sdt);
            }
            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";
            let roles = [];
            if (quyen_admin === 'true') roles.push(1);
            if (quyen_nhanvien === 'true') roles.push(2);
            if (quyen_khach === 'true') roles.push(3);
            if (roles.length > 0) {
                const placeholders = roles.map(() => '?').join(',');
                condition.push(`tk.MaQuyen IN (${placeholders})`);
                value.push(...roles);
            }
            const sql_core = `Select tk.MaTK, tk.Email, tk.AnhDaiDien, tk.NgayTao, tk.DangNhapCuoi, tk.Bi_khoa,
                                q.TenQuyen, tk.MaQuyen,
                                Coalesce(nv.TenNV, kh.TenKH) As HoTen,
                                Coalesce(nv.SDT, kh.SDT) As SDT
                                from TaiKhoan tk
                                left join Quyen q on tk.MaQuyen = q.MaQuyen
                                left join NhanVien nv on tk.MaTK = nv.MaTK
                                left join KhachHang kh on tk.MaTK = kh.MaTK 
                                ${whereClause}`;
            const sql_count = `Select count(*) as total from (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count,value);
            const totalItems = countResult[0].total;

            const totalPage = Math.ceil(totalItems/limit);

            const sql_ds = `${sql_core}
                            order by tk.MaQuyen ASC, NgayTao Desc
                            limit ? offset ?`;
            const [ds] = await db.query(sql_ds,[...value,limit,offset]);
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
            })
        }
        catch (error){
            console.error("Lỗi khi liệt kê tài khoản: ", error);
            res.status(500).json({ 
                success: false,
                message: "Lỗi server khi liệt kê tài khoản!"});
        }
    }
}
module.exports = account_admin;