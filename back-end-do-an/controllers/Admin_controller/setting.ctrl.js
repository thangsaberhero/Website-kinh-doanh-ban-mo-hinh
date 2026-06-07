const db = require('../../config/db.js'); // Đảm bảo đường dẫn tới file db của bạn đúng

const setting_Controller = {
    // 1. LẤY TOÀN BỘ CÀI ĐẶT (API Public dùng cho mọi trang)
    lay_toan_bo_cai_dat: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT KhoaCaiDat, GiaTri FROM CaiDatHeThong');
            
            let settingsObj = {};
            rows.forEach(row => {
                try {
                    // Thử parse JSON (dành cho mảng như home_banner)
                    settingsObj[row.KhoaCaiDat] = JSON.parse(row.GiaTri);
                } catch (e) {
                    // Nếu lỗi parse tức là chuỗi bình thường (như tên shop, logo)
                    settingsObj[row.KhoaCaiDat] = row.GiaTri;
                }
            });

            res.status(200).json({ success: true, data: settingsObj });
        } catch (error) {
            console.error("Lỗi lấy cài đặt hệ thống:", error);
            res.status(500).json({ success: false, message: "Lỗi server khi tải cài đặt!"});
        }
    },

    // 2. CẬP NHẬT CÀI ĐẶT VĂN BẢN (Tên shop, hotline, email...)
    cap_nhat_van_ban: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { keyCaiDat, giaTri } = req.body;

            if (!keyCaiDat) {
                return res.status(400).json({ success: false, message: "Thiếu khóa cài đặt!" });
            }

            const sql = `UPDATE CaiDatHeThong SET GiaTri = ? WHERE KhoaCaiDat = ?`;
            await connection.query(sql, [giaTri, keyCaiDat]);

            res.status(200).json({ success: true, message: "Cập nhật thông tin thành công!" });
        } catch (error) {
            console.error("Lỗi cập nhật văn bản:", error);
            res.status(500).json({ success: false, message: "Lỗi server!" });
        } finally {
            if (connection) connection.release();
        }
    },

    // 3. CẬP NHẬT FILE ĐƠN (Logo Header, Logo Favicon, Ảnh nền Login...)
    cap_nhat_file_don: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { keyCaiDat } = req.body; 

            if (!keyCaiDat) {
                return res.status(400).json({ success: false, message: "Thiếu khóa cài đặt!" });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: "Vui lòng chọn một hình ảnh!" });
            }

            // Lấy link ảnh an toàn từ Cloudinary
            const fileUrl = req.file.path || req.file.secure_url || req.file.url;

            const sql = `UPDATE CaiDatHeThong SET GiaTri = ? WHERE KhoaCaiDat = ?`;
            await connection.query(sql, [fileUrl, keyCaiDat]);

            res.status(200).json({ 
                success: true, 
                message: "Cập nhật hình ảnh thành công!",
                newUrl: fileUrl 
            });
        } catch (error) {
            console.error("Lỗi cập nhật ảnh cài đặt:", error);
            res.status(500).json({ success: false, message: "Lỗi server!" });
        } finally {
            if (connection) connection.release();
        }
    },

    // 4. CẬP NHẬT MẢNG FILE (Banner Trang chủ...)
    cap_nhat_mang_file: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { keyCaiDat, oldImages } = req.body;

            if (!keyCaiDat) {
                return res.status(400).json({ success: false, message: "Thiếu khóa cài đặt!" });
            }

            // Bước 1: Thu thập lại các ảnh cũ mà Admin KHÔNG XÓA
            let arrImages = [];
            if (oldImages) {
                try {
                    // Nếu gửi từ FormData, oldImages thường là chuỗi JSON '["link1", "link2"]'
                    arrImages = JSON.parse(oldImages);
                } catch (e) {
                    // Đề phòng trường hợp chỉ có 1 link dạng string
                    arrImages = typeof oldImages === 'string' ? [oldImages] : oldImages;
                }
            }

            // Bước 2: Bổ sung thêm các ảnh mới vừa Upload
            if (req.files && req.files.length > 0) {
                const newUrls = req.files.map(file => file.path || file.secure_url || file.url);
                arrImages = [...arrImages, ...newUrls]; // Gộp mảng ảnh cũ và mới lại
            }

            // Bước 3: Đóng gói thành chuỗi JSON để lưu vào MySQL
            const jsonDanhSachAnh = JSON.stringify(arrImages);

            const sql = `UPDATE CaiDatHeThong SET GiaTri = ? WHERE KhoaCaiDat = ?`;
            await connection.query(sql, [jsonDanhSachAnh, keyCaiDat]);

            res.status(200).json({
                success: true,
                message: "Cập nhật danh sách ảnh slide thành công!",
                data: arrImages
            });

        } catch (error) {
            console.error("Lỗi cập nhật mảng ảnh:", error);
            res.status(500).json({ success: false, message: "Lỗi server khi cập nhật mảng ảnh!" });
        } finally {
            if (connection) connection.release();
        }
    },

    // 5. LẤY DANH SÁCH PHƯƠNG THỨC THANH TOÁN
    lay_phuong_thuc_thanh_toan: async (req, res) => {
        try {
            // Lấy tất cả phương thức để hiện lên bảng Admin
            const sql = `SELECT MaPT, TenPhuongThuc, TrangThaiHoatDong FROM PhuongThucThanhToan ORDER BY MaPT ASC`;
            const [data] = await db.query(sql);
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            console.error("Lỗi lấy phương thức thanh toán:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        }
    },

    // 6. BẬT/TẮT PHƯƠNG THỨC THANH TOÁN
    toggle_phuong_thuc: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { MaPT, TrangThaiHoatDong } = req.body;
            if (!MaPT) return res.status(400).json({ success: false, message: "Thiếu mã phương thức!" });

            await connection.query(
                `UPDATE PhuongThucThanhToan SET TrangThaiHoatDong = ? WHERE MaPT = ?`,
                [TrangThaiHoatDong, MaPT]
            );

            res.status(200).json({ success: true, message: "Đã cập nhật trạng thái thanh toán!" });
        } catch (error) {
            console.error("Lỗi cập nhật phương thức:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ!" });
        } finally {
            if (connection) connection.release();
        }
    }
};

module.exports = setting_Controller;