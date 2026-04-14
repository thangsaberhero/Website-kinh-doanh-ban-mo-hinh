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
            const sql_core = `Select MaKM, TenKM, ThoiGianBD, ThoiGianKT, LoaiKM, DieuKien 
                                from KhuyenMai
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

}
module.exports = khuyenmai;