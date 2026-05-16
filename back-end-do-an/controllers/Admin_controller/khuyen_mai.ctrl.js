const db = require('../../config/db');

const khuyenmai = {
    liet_ke_chuong_trinh_khuyen_mai: async(req, res) =>{
        try{
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const offset = (page - 1) * limit;

            const {keyword, 
                trangthai
            } = req.query;
            
            let condition = [];
            let value = [];

            if(keyword){
                condition.push("TenKM like ?");
                value.push(`%${keyword}%`);
            }

            if(trangthai){
                if(trangthai === 'DangChay'){
                    condition.push("ThoiGianBD <= NOW() and ThoiGianKT >= NOW()");
                }
                else if(trangthai === 'SapToi'){
                    condition.push("ThoiGianBD > NOW()");
                }
                else if(trangthai === 'HetHan'){
                    condition.push("ThoiGianKT < NOW()");
                }
            }
            let whereClause = condition.length > 0 ? "Where " + condition.join(" and ") : "";
            const sql_core = `Select km.MaKM, km.TenKM, km.ThoiGianBD, km.ThoiGianKT, km.TrangThaiHoatDong, Count(log.MaLichSu) as SoLuotDung
                                from KhuyenMai km
                                inner join LogSuDungKhuyenMai log on km.MaKM = log.MaKM
                                ${whereClause}`;
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count,value);
            const totalItems = countResult[0].total;
            //Làm tròn lên
            const totalPage = Math.ceil(totalItems/limit);
            const sql_ds = `${sql_core}
                order by MaKM DESC, ThoiGianBD DESC
                Limit ? offset ?`;


            const sql_params = [...value, limit, offset]
            const [chuongtrinh] = await db.query(sql_ds, sql_params);

            res.status(200).json({
                success: true,
                message: "Lấy thông tin danh sách chương trình khuyến mãi thành công!",
                data: chuongtrinh,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });

        }
        catch (error){
            console.error("Xảy ra lỗi khi lấy danh sách chương trình khuyến mãi: " + error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy danh sách chương trình khuyến mãi!"
            });
        }
    },

    xem_chi_tiet_khuyen_mai: async(req, res) =>{
        try{
            const MaKM = req.params.MaKM;
            const sql_tt = `Select *
                        from KhuyenMai km
                        where MaKM = ?
                        `;
            const [result_tt] = await db.query(sql_tt,[MaKM]);

            const sql_chi_tiet = `Select 
                                ctkm.MaPhanLoai, ctkm.LoaiGiamGia, ctkm.ChietKhau, ctkm.GiaTriGiamToiDa, ctkm.SoLuongKM,
                                pl.TenPhanLoai, mh.TenMH, pl.DonGia,
                                pl.DonGia - Coalesce((
                                    Select MAX(
                                            Case
                                                when ctkm.LoaiGiamGia = 'TienMat' Then ctkm.ChietKhau
                                            
                                                when ctkm.LoaiGiamGia = 'ChietKhau' then 
                                                    LEAST((pl.DonGia * ChietKhau / 100), Coalesce(ctkm.GiaTriGiamToiDa, pl.DonGia))
                                                else 0
                                            end
                                            )
                                ), 0) as DonGiaKhuyenMai
                                from ChiTietKhuyenMai ctkm
                                inner join PhanLoai pl on pl.MaPhanLoai = ctkm.MaPhanLoai
                                inner join MoHinh mh on mh.MaMoHinh = pl.MaMoHinh
                                where MaKM = ?
                                Order by ctkm.MaPhanLoai`;
            const [result_detail] = await db.query(sql_chi_tiet,[MaKM]);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const offset = (page - 1) * limit;

            const sql_log_core = `Select log.MaLichSu, log.MaKH, log.MaDH, log.SoTienDaGiam, log.ThoiGianSuDung
                                    from LogSuDungKhuyenMai log
                                    where log.MaKM = ?`;
            
            const sql_count = `SELECT COUNT(*) AS total FROM (${sql_core}) as temptable`;
            const [countResult] = await db.query(sql_count,[MaKM]);
            const totalItems = countResult[0].total;
            //Làm tròn lên
            const totalPage = Math.ceil(totalItems/limit);

            const sql_ds = `${sql_core}
                Limit ? offset ?`;

            const [result_log] = await db.query(sql_ds,[MaKM]);
            res.status(200).json({
                success: true,
                message: "Lấy thông tin chương trình khuyến mãi thành công!",
                data: {
                    tt: result_tt,
                    detail: result_detail,
                    log: result_log
                },
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            })

        }
        catch (error){
            console.error("Xảy ra lỗi khi lấy thông tin chương trình khuyến mãi: " + error);
            res.status(500).json({
                success: false,
                message: "Xảy ra lỗi khi lấy thông tin chương trình khuyến mãi!"
            });
        }
    },

    them_chuong_trinh_khuyen_mai: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong, danhsachchitiet} = req.body;
            const sql_them_khuyen_mai = `Insert into KhuyenMai(TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong)
                                        values(?, ?, ?, ?)`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [them_khuyen_mai] = await connection.query(sql_them_khuyen_mai, [TenKM, ThoiGianBD, ThoiGianKT, isVisible]);
            const maKM = them_khuyen_mai.insertId;
            const sql_them_chi_tiet = `Insert into ChiTietKhuyenMai
                                        (MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM)
                                        values
                                        (?, ?, ?, ?, ?, ?)`;
            if(danhsachchitiet && danhsachchitiet !== 'undefined'){
                    const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                    if(Array.isArray(ds_km) && ds_km.length>0){
                        for(let detail of ds_km){
                            await connection.query(sql_them_chi_tiet, [
                                maKM, detail.MaPhanLoai, detail.LoaiGiamGia,
                                detail.ChietKhau, detail.GiaTriGiamToiDa, detail.SoLuongKM
                            ]);
                        }
                    }}
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm chương trình khuyến mãi mới thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác thêm chương trình khuyến mãi: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi thêm chương trình khuyến mãi!"
            });
        }
        finally{
            connection.release();
        }
    },

    sua_chuong_trinh_khuyen_mai: async(req, res)=>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const MaKM = req.params.id;
            const {TenKM, ThoiGianBD, ThoiGianKT, TrangThaiHoatDong, danhsachchitiet} = req.body;
            const sql_sua_khuyen_mai = `Update KhuyenMai set TenKM = ?, ThoiGianBD = ?, ThoiGianKT = ?, TrangThaiHoatDong = ?
                                        where MaKM = ?`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [sua_khuyen_mai] = await connection.query(sql_sua_khuyen_mai, [TenKM, ThoiGianBD, ThoiGianKT, isVisible, MaKM]);
            if(danhsachchitiet && danhsachchitiet !== 'undefined')
                {
                    await connection.query('Delete from ChiTietKhuyenMai where MaKM = ?', [MaKM]);
                    const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                    const sql_them_chi_tiet = `Insert into ChiTietKhuyenMai
                                        (MaKM, MaPhanLoai, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, SoLuongKM)
                                        values
                                        (?, ?, ?, ?, ?, ?)`;
                    if(Array.isArray(ds_km) && ds_km.length>0){
                        for(let detail of ds_km){
                            if(detail.MaPhanLoai)
                            await connection.query(sql_them_chi_tiet, [
                                MaKM, detail.MaPhanLoai, detail.LoaiGiamGia,
                                detail.ChietKhau, detail.GiaTriGiamToiDa, detail.SoLuongKM
                            ]);
                        }
                    }
                }
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin chương trình khuyến mãi mới thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác sửa thông tin chương trình khuyến mãi: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi sửa thông tin chương trình khuyến mãi!"
            });
        }
        finally{
            connection.release();
        }
    },

    them_ma_giam_gia: async(req, res) =>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const {TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                ThoiGianBD, ThoiGianKT, MaKH, MucGiaToiThieu,
                TrangThaiHoatDong, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, danhsachchitiet} = req.body;
            const sql_them_ma_gg = `Insert into MaGiamGia
                                        (TenMaGiamGia, MaVoucher, SoLuongDungToiDa, ThoiGianBD,
                                        ThoiGianKT, MaKH, MucGiaToiThieu, TrangThaiHoatDong,
                                        LoaiGiamGia, ChietKhau, GiaTriGiamToiDa)
                                        values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [them_ma_gg] = await connection.query(sql_them_ma_gg, [TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                                                                        ThoiGianBD, ThoiGianKT, MaKH || null, MucGiaToiThieu,
                                                                        isVisible, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa]);
            const maGG = them_ma_gg.insertId;
            const sql_them_chi_tiet = `Insert into ChiTietMaGiamGia
                                        (MaGG, MaMoHinh)
                                        values
                                        (?, ?)`;
            if(danhsachchitiet && danhsachchitiet !== 'undefined'){
                    const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                    if(Array.isArray(ds_km) && ds_km.length>0){
                        for(let detail of ds_km){
                            await connection.query(sql_them_chi_tiet, [
                                maGG, detail.MaMoHinh
                            ]);
                        }
                    }}
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Thêm mã giảm giá mới thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác thêm mã giảm giá: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi thêm mã giảm giá!"
            });
        }
        finally{    
            connection.release();
        }
    },

    sua_ma_giam_gia: async(req, res)=>{
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            const MaGG = req.params.id;
            const {TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                ThoiGianBD, ThoiGianKT, MaKH, MucGiaToiThieu,
                TrangThaiHoatDong, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, danhsachchitiet} = req.body;
            const sql_sua_ma_gg = `Update MaGiamGia set
                                        TenMaGiamGia = ?, MaVoucher = ?, SoLuongDungToiDa = ?, ThoiGianBD = ?,
                                        ThoiGianKT = ?, MaKH = ?, MucGiaToiThieu = ?, TrangThaiHoatDong = ?,
                                        LoaiGiamGia = ?, ChietKhau = ?, GiaTriGiamToiDa = ? where MaGG = ?`;
            const isVisible = TrangThaiHoatDong !== 'undefined'? TrangThaiHoatDong : 0;
            const [sua_khuyen_mai] = await connection.query(sql_sua_ma_gg, [TenMaGiamGia, MaVoucher, SoLuongDungToiDa, 
                                                                        ThoiGianBD, ThoiGianKT, MaKH || null, MucGiaToiThieu,
                                                                        isVisible, LoaiGiamGia, ChietKhau, GiaTriGiamToiDa, MaGG]);
            if(danhsachchitiet && danhsachchitiet !== 'undefined')
                {
                    await connection.query('Delete from ChiTietMaGiamGia where MaGG = ?', [MaGG]);
                    const ds_km = typeof danhsachchitiet === 'string' ? JSON.parse(danhsachchitiet) : danhsachchitiet;
                    const sql_them_chi_tiet = `Insert into ChiTietMaGiamGia
                                        (MaGG, MaMoHinh)
                                        values
                                        (?, ?)`;
                    if(Array.isArray(ds_km) && ds_km.length>0){
                        for(let detail of ds_km){
                            if(detail.MaMoHinh)
                            await connection.query(sql_them_chi_tiet, [
                                MaGG, detail.MaMoHinh
                            ]);
                        }
                    }
                }
            await connection.commit();
            res.status(200).json({
                success: true,
                message: "Sửa thông tin mã giảm giá thành công!"
            });
        }
        catch (error){
            await connection.rollback();
            console.error("Lỗi khi thao tác sửa thông tin mã giảm giá: " + error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi sửa thông tin mã giảm giá!"
            });
        }
        finally{
            connection.release();
        }
    },
}
module.exports = khuyenmai;