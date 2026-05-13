const db = require('../../config/db.js');

const donhang_admin = {
    tao_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            const {DanhSachSanPham, TongTien, ThanhTien, Ten, SDT, DiaChi} = req.body;

            const sql_tao_don_hang = `Insert into DonHang 
                                    (NgayLapDon, TongTien, ThanhTien, TrangThaiThanhToan, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao) 
                                    Values (NOW(),?,?,'Đơn hàng ngoài',?,?,?)`;
            
            const [don_hang_moi] = await connection.query(sql_tao_don_hang,[TongTien, ThanhTien, TongTien, Ten, SDT, DiaChi]);
            const ma_don_hang_moi = don_hang_moi.insertId;

            if(Array.isArray(DanhSachSanPham) && DanhSachSanPham.length > 0){
                const sql_them_don_hang = `Insert into ChiTietDonHang (MaDH, MaMoHinh, SoLuong, DonGiaBan) Values (?,?,?,?)`;
                const sql_cap_nhat_ton_kho = `UPDATE PhanLoai SET SoLuong = SoLuong - ? WHERE MaPhanLoai = ?`;

                for(let item of DanhSachSanPham){
                    await connection.query(sql_cap_nhat_ton_kho,[item.SoLuong,item.MaPhanLoai]);
                    await connection.query(sql_them_don_hang,[ma_don_hang_moi, item.MaPhanLoai, item.SoLuong, item.DonGia]);
                }
            }
            await connection.query(`Insert into ChiTietTrangThai
                                    (MaDH, MaTrangThai, Thoigian)
                                    Values (?,1,NOW())`, [ma_don_hang_moi]);
            


            await connection.commit();

            res.status(200).json({
                success: true,
                message: "Thêm đơn hàng ngoài mới thành công!",
                MaDH: ma_don_hang_moi
            });
        }
        catch (error){
            console.error("Lỗi khi thêm đơn hàng mới: ", error);
            res.status(500).json({ message: "Lỗi server khi thêm đơn hàng!"});
        }
        finally {
        connection.release();
        }
    },

    huy_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaDH} = req.body;

            const sql_kiemtra_tt = `Select cttt.MaTrangThai from ChiTietTrangThai cttt where MaDH = ? Order by Thoigian DESC Limit 1`;
            const [trang_thai] = await connection.query(sql_kiemtra_tt,[MaDH]);

            if(trang_thai.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }
            const currentStatus = trang_thai[0].MaTrangThai;

            if(currentStatus === 3 || currentStatus === 4 || currentStatus === 5){
                await connection.rollback();
                return res.status(400).json({
                    message: "Không thể huỷ! Đơn hàng đã được giao hoặc đã bị hủy trước đó."
                });
            }

            const sql_them_trang_thai_huy = `Insert into ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) Values (?,5,Now())`;
            await connection.query(sql_them_trang_thai_huy,[MaDH]);

            const sql_cap_nhat_ton_kho = `UPDATE Phanloai pl
                                        inner join ChiTietDonHang ctdh on ctdh.MaMoHinh = pl.MaPhanLoai
                                        SET pl.SoLuong = pl.SoLuong + ctdh.SoLuong WHERE ctdh.MaDH = ?`;
            
            await connection.query(sql_cap_nhat_ton_kho,[MaDH]);

            await connection.commit();
            res.status(200).json({
                message: "Huỷ đơn hàng thành công!",
                success: true
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi huỷ đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi huỷ đơn hàng!"});
        }
        finally {
            connection.release();
        }
    },

    sua_thong_tin_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const {MaDH, sdt, hoten, diachi} = req.body;

            const sql_kiemtra_tt = `Select cttt.MaTrangThai from ChiTietTrangThai where MaDH = ? Order by Thoigian DESC Limit 1`;
            const [trang_thai] = await connection.query(sql_kiemtra_tt,[MaDH]);

            if(trang_thai.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            }
            const currentStatus = trang_thai[0].MaTrangThai;
                
            if(currentStatus === 3 || currentStatus === 4 || currentStatus === 5){
                await connection.rollback();
                return res.status(400).json({
                    message: "Không thể thay đổi thông tin đơn hàng đã được giao hoặc đã bị hủy."
                });
            }

            const sql_cap_nhat_tt = `UPDATE DonHang dh
                                        SET TenNguoiNhan = ?,
                                        SDTNguoiNhan = ?,
                                        DiaChiGiao = ?
                                        WHERE ctdh.MaDH = ?`;
            
            await connection.query(sql_cap_nhat_tt,[hoten, sdt, diachi, MaDH]);

            await connection.commit();
            res.status(200).json({
                message: "Sửa thông tin đơn hàng thành công!",
                success: true
            });
        }
        catch (error) {
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi sửa thông tin đơn hàng!"});
        }
        finally {
            connection.release();
        }
    },

    liet_ke_don_hang: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { 
                trangthai, ngaybatdau, ngayketthuc,          
                Sapxep_theosotien, Sapxep_theotrangthai, Sapxep_theothoigian
            } = req.query;

            let conditions = [];
            let whereValues = [];
            
            let havingConditions = [];
            let havingValues = [];

            if (ngaybatdau) {
                conditions.push("dh.NgayLapDon >= ?");
                whereValues.push(ngaybatdau);
            }
            if (ngayketthuc) {
                conditions.push("dh.NgayLapDon <= ?");
                whereValues.push(ngayketthuc);
            }
            let condition_clause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

            if (trangthai) {
                havingConditions.push("MaTT = ?");
                havingValues.push(trangthai);
            }
            let having_clause = havingConditions.length > 0 ? "HAVING " + havingConditions.join(" AND ") : "";

            let orderParams = [];
            if (Sapxep_theothoigian === 'true') orderParams.push("dh.NgayLapDon DESC");
            if (Sapxep_theosotien === 'true') orderParams.push("dh.TongTien DESC");
            if (Sapxep_theotrangthai === 'true') orderParams.push("MaTT ASC");

            let filter = "";
            if (orderParams.length > 0) {
                filter = "ORDER BY " + orderParams.join(", ");
            } else {
                filter = "ORDER BY dh.NgayLapDon DESC";
            }

            const sql_core = `
                SELECT dh.MaDH, dh.MaKH, dh.MaNV, dh.NgayLapDon, dh.TongTien, dh.ThanhTien, dh.TrangThaiThanhToan,
                (
                    SELECT cttt.MaTrangThai
                    FROM ChiTietTrangThai cttt 
                    WHERE cttt.MaDH = dh.MaDH 
                    ORDER BY cttt.MaTrangThai DESC 
                    LIMIT 1
                ) AS MaTT
                FROM DonHang dh
                ${condition_clause}
                ${having_clause}
            `;

            const combinedValues = [...whereValues, ...havingValues];

            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count, combinedValues);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            const sql_ds = `
                ${sql_core}
                ${filter}
                LIMIT ? OFFSET ?
            `;
            
            const sql_params = [...combinedValues, limit, offset];
            const [invoices] = await db.query(sql_ds, sql_params);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách đơn hàng thành công!",
                data: invoices,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });                    
        }
        catch (error) {
            console.error("Xảy ra lỗi khi lấy danh sách đơn hàng: ", error);
            res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng!" });
        }
    },

    xem_chi_tiet_don_hang: async(req, res) =>{
        try {
            const MaDH = req.params.MaDH;
            const sql_donhang = `
                SELECT TenNguoiNhan, SDTNguoiNhan, DiaChiGiao, TongTien, NgayLapDon
                FROM DonHang WHERE MaDH = ?
            `;
            const [donhang_info] = await db.query(sql_donhang, [MaDH]);

            if (donhang_info.length === 0) {

                return res.status(404).json({ 
                                    success: false,
                                    message: "Không tìm thấy đơn hàng!"});
            }

            const sql = `SELECT 
            mh.MaMoHinh,
            mh.TenMH,
            mh.AnhDaiDien, 
            pl.DonGia,
            ct.DonGiaBan,
            pl.MaPhanLoai,
            pl.ChiTietPhanLoai,
            ct.SoLuong,
            ((pl.DonGia - ct.DonGiaBan) * ct.SoLuong) AS KhuyenMai
            FROM MoHinh mh
            inner join PhanLoai pl on mh.MaMoHinh = pl.MaMoHinh
            inner join ChiTietDonHang ct on pl.MaPhanLoai = ct.MaMoHinh
            where ct.MaDH = ?
            ORDER BY mh.MaMoHinh DESC`;
            const [products] = await db.query(sql,[MaDH]);
            
            const sql_trangthai =  `Select
            tt.TenTrangThai,
            cttt.ThoiGian
            from TrangThai tt
            inner join ChiTietTrangThai cttt on tt.MaTrangThai = cttt.MaTrangThai
            where cttt.MaDH = ?
            order by cttt.MaTrangThai DESC
            limit 1`;

            const [trangthai] = await db.query(sql_trangthai,[MaDH]);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách sản phẩm trong đơn hàng thành công",
                data: {
                    ThongTinGiaoHang: donhang_info[0],
                    DanhSachHang: products,
                    Trang_thai_don_hang: trangthai
                    }
            });
        } 
        catch (error){
            console.error("Lỗi khi xem đơn hàng: ", error);
            res.status(500).json({ success: false,
                message: "Lỗi server khi thao tác đơn hàng!"});
        }
    },

    cap_nhat_trang_thai_don_hang: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {MaDH} = req.body;
            const sql_lay_trang_thai = `
                Select
                    MaTrangThai
                    inner join ChiTietTrangThai
                    where MaDH = ?
                    order by MaTrangThai DESC
                    limit 1
            `;
            const [trangthai] = await connection.query(sql_lay_trang_thai, [MaDH]);

            if (trangthai.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: "Không tìm thấy đơn hàng!"});
            }
            const matrangthai = trangthai[0].MaTrangThai;
            const update_trang_thai = `Insert into ChiTietTrangThai (MaDH, MaTrangThai) values (?,?)`;
            if(matrangthai <= 3){
                await connection.query(update_trang_thai, [MaDH, matrangthai + 1]);
            }
            else{
                await connection.rollback();
                return res.status(200).json({
                    success: false,
                    message: "Không thể cập nhật trạng thái cho đơn hàng đã thành công!"
                });
            }
            await connection.commit()
            res.status(200).json({
                message: "Cập nhật trạng thái cho đơn hàng thành công!",
                success: true,
                MaDH: MaDH
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi sửa thông tin đơn hàng: ", error);
            res.status(500).json({ message: "Lỗi server khi sửa thông tin đơn hàng!"});
        }
        finally{
            connection.release();
        }
    },

    hoan_tra_don_hang: async(req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { MaDH } = req.body;

        // 1. Lấy trạng thái mới nhất của đơn hàng
        const sql_kiemtra_tt = `
            SELECT MaTrangThai 
            FROM ChiTietTrangThai 
            WHERE MaDH = ? 
            ORDER BY Thoigian DESC 
            LIMIT 1
        `;
        const [trang_thai] = await connection.query(sql_kiemtra_tt, [MaDH]);

        if (trang_thai.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        }

        const currentStatus = trang_thai[0].MaTrangThai;

        // 2. ĐIỀU KIỆN SỐNG CÒN CỦA HOÀN HÀNG
        // Chỉ cho phép hoàn hàng nếu đơn đang đi trên đường (3) hoặc đã tới tay khách (4)
        if (currentStatus !== 3 && currentStatus !== 4) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Lỗi nghiệp vụ: Chỉ có thể hoàn trả các đơn hàng Đang giao hoặc Đã hoàn thành!"
            });
        }

        // 3. Cập nhật trạng thái thành 6 (Hoàn hàng/Trả hàng)
        const sql_them_trang_thai_hoan = `INSERT INTO ChiTietTrangThai (MaDH, MaTrangThai, Thoigian) VALUES (?, 6, NOW())`;
        await connection.query(sql_them_trang_thai_hoan, [MaDH]);

        // 4. Nhập lại hàng vào kho
        const sql_cap_nhat_ton_kho = `
            UPDATE PhanLoai pl
            INNER JOIN ChiTietDonHang ctdh ON ctdh.MaPhanLoai = pl.MaPhanLoai
            SET pl.SoLuong = pl.SoLuong + ctdh.SoLuong 
            WHERE ctdh.MaDH = ?
        `;
        await connection.query(sql_cap_nhat_ton_kho, [MaDH]);

        await connection.commit();
        res.status(200).json({
            success: true,
            message: "Xác nhận hoàn hàng và nhập lại kho thành công!"
        });
    }
    catch (error) {
        await connection.rollback();
        console.error("Lỗi khi hoàn trả đơn hàng: ", error);
        res.status(500).json({ success: false, message: "Lỗi server khi thao tác hoàn trả!"});
    }
    finally {
        connection.release();
    }
}
}
module.exports = donhang_admin;