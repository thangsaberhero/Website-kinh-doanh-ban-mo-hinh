const db = require('../../config/db');

const thong_bao_admin = {
    lay_danh_sach: async (req, res) => {
        try {
            const sql_list = `SELECT MaTB, TieuDe, NoiDung, LoaiThongBao, DuongDan, DaDoc, NgayTao 
                              FROM ThongBaoAdmin 
                              ORDER BY NgayTao DESC LIMIT 10`;
            const [notifications] = await db.query(sql_list);

            const sql_count = `SELECT COUNT(*) AS total FROM ThongBaoAdmin WHERE DaDoc = 0`;
            const [countResult] = await db.query(sql_count);
            const unreadCount = countResult[0].total;

            res.status(200).json({
                success: true,
                message: "Lấy danh sách thông báo thành công!",
                data: notifications,
                unreadCount: unreadCount
            });
        } 
        catch (error) {
            console.error("Lỗi lấy danh sách thông báo: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy thông báo" });
        }
    },

    danh_dau_da_doc: async (req, res) => {
        try {
            const MaTB = req.params.id;
            const [result] = await db.query(`UPDATE ThongBaoAdmin SET DaDoc = 1 WHERE MaTB = ?`, [MaTB]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thông báo!" });
            }

            res.status(200).json({ success: true, message: "Đã đọc thông báo" });
        } 
        catch (error) {
            console.error("Lỗi cập nhật trạng thái thông báo: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ" });
        }
    },

    danh_dau_tat_ca: async (req, res) => {
        try {
            await db.query(`UPDATE ThongBaoAdmin SET DaDoc = 1 WHERE DaDoc = 0`);
            res.status(200).json({ success: true, message: "Đã đánh dấu đọc tất cả thông báo" });
        } 
        catch (error) {
            console.error("Lỗi cập nhật đọc tất cả: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ" });
        }
    },

    lay_tat_ca_full_page: async (req, res) => {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.max(parseInt(req.query.limit) || 10, 10);
            const offset = (page - 1) * limit;

            const { trangthai, loai } = req.query;

            let condition = ["1=1"];
            let params = [];

            if (trangthai === 'unread') {
                condition.push("DaDoc = 0");
            } else if (trangthai === 'read') {
                condition.push("DaDoc = 1");
            }

            if (loai && loai !== 'all') {
                condition.push("LoaiThongBao = ?");
                params.push(loai);
            }

            const whereClause = "WHERE " + condition.join(" AND ");

            const sql_count = `SELECT COUNT(*) AS total FROM ThongBaoAdmin ${whereClause}`;
            const sql_data = `SELECT * FROM ThongBaoAdmin ${whereClause} ORDER BY NgayTao DESC LIMIT ? OFFSET ?`;

            const [[countResult], [notifications]] = await Promise.all([
                db.query(sql_count, params),
                db.query(sql_data, [...params, limit, offset])
            ]);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            res.status(200).json({
                success: true,
                message: "Lấy danh sách thông báo phân trang thành công!",
                data: notifications,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalItems: totalItems,
                    totalPage: totalPage
                }
            });
        } 
        catch (error) {
            console.error("Lỗi phân trang thông báo: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    },

    xoa_thong_bao: async (req, res) => {
        try {
            const { id } = req.params;
            await db.query(`DELETE FROM ThongBaoAdmin WHERE MaTB = ?`, [id]);
            res.status(200).json({ success: true, message: "Xóa thông báo thành công!" });
        } 
        catch (error) {
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    },

    xoa_thong_bao_da_doc: async (req, res) => {
        try {
            const [result] = await db.query(`DELETE FROM ThongBaoAdmin WHERE DaDoc = 1`);
            res.status(200).json({ 
                success: true, 
                message: `Đã dọn dẹp ${result.affectedRows} thông báo cũ!` 
            });
        } 
        catch (error) {
            console.error("Lỗi xóa thông báo đã đọc: ", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    }
};

module.exports = thong_bao_admin;