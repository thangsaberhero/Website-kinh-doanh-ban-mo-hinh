const exceljs = require('exceljs');
const db = require('../../config/db.js'); // Đảm bảo đường dẫn DB chuẩn

const bao_cao_ctrl = {
    xuat_bao_cao_excel: async (req, res) => {
        try {
            // 1. TẠO WORKBOOK MỚI
            const workbook = new exceljs.Workbook();
            workbook.creator = 'FigureCollect System';
            workbook.created = new Date();

            // =========================================================
            // SHEET 1: TỔNG QUAN HỆ THỐNG
            // =========================================================
            const sheetDash = workbook.addWorksheet('Tổng Quan');
            
            // Trang trí Tiêu đề
            sheetDash.mergeCells('A1:E1');
            sheetDash.getCell('A1').value = 'BÁO CÁO THỐNG KÊ HOẠT ĐỘNG KINH DOANH - FIGURECOLLECT';
            sheetDash.getCell('A1').font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E293B' } };
            sheetDash.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            // Ở đây bạn có thể dùng db.query() để đếm tổng đơn, tổng doanh thu...
            // Ví dụ mình chèn dữ liệu tĩnh để demo cấu trúc:
            sheetDash.addRow([]); // Dòng trống
            sheetDash.addRow(['Chỉ số KPI', 'Giá trị']);
            sheetDash.addRow(['Tổng Doanh Thu Hóa Đơn', 62400000]);
            sheetDash.addRow(['Tổng Số Đơn Hàng', 216]);
            
            // Format cột tiền tệ cho dòng 4 (Doanh thu)
            sheetDash.getCell('B4').numFmt = '#,##0" ₫"';

            // =========================================================
            // SHEET 2: SỔ CHI TIẾT ĐƠN HÀNG (Dữ liệu thật từ Database)
            // =========================================================
            const sheetOrders = workbook.addWorksheet('Danh Sách Đơn Hàng');

            // Khai báo các cột (Headers)
            sheetOrders.columns = [
                { header: 'Mã Đơn', key: 'maDH', width: 12 },
                { header: 'Tên Khách Hàng', key: 'tenKH', width: 25 },
                { header: 'Ngày Lập', key: 'ngayLap', width: 20 },
                { header: 'Tổng Tiền (Gốc)', key: 'tongTien', width: 20 },
                { header: 'Khuyến Mãi', key: 'khuyenMai', width: 18 },
                { header: 'Thành Tiền (Hóa đơn)', key: 'thanhTien', width: 20 },
                { header: 'Đã Thanh Toán', key: 'daThanhToan', width: 20 },
                { header: 'Còn Phải Thu (COD)', key: 'cod', width: 20 },
                { header: 'Trạng Thái', key: 'trangThai', width: 20 },
                { header: 'Ghi Chú', key: 'note', width: 30 }
            ];

            // Làm đẹp cho thanh Header
            sheetOrders.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheetOrders.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E293B' } // Màu nền xanh đen đậm
            };

            // Lấy dữ liệu thật từ SQL
            const sql_don_hang = `
                SELECT 
                    dh.MaDH, kh.TenKH, dh.NgayLapDon, dh.TongTien, dh.ThanhTien, dh.Note,
                    COALESCE(SUM(tt.SoTienGiaoDich), 0) AS DaThanhToan,
                    (SELECT tt.TenTrangThai FROM TrangThai tt 
                     INNER JOIN ChiTietTrangThai cttt ON tt.MaTrangThai = cttt.MaTrangThai 
                     WHERE cttt.MaDH = dh.MaDH ORDER BY cttt.ThoiGian DESC LIMIT 1) AS TrangThai
                FROM DonHang dh
                LEFT JOIN KhachHang kh ON dh.MaKH = kh.MaKH
                LEFT JOIN ThanhToan tt ON dh.MaDH = tt.MaDH
                GROUP BY dh.MaDH
                ORDER BY dh.NgayLapDon DESC
            `;
            const [orders] = await db.query(sql_don_hang);

            // Đổ dữ liệu vào Sheet
            orders.forEach(order => {
                sheetOrders.addRow({
                    maDH: `FC-${order.MaDH}`,
                    tenKH: order.TenKH || 'Khách vãng lai',
                    ngayLap: order.NgayLapDon, // ExcelJS tự hiểu Date object
                    tongTien: Number(order.TongTien),
                    khuyenMai: Number(order.TongTien - order.ThanhTien),
                    thanhTien: Number(order.ThanhTien),
                    daThanhToan: Number(order.DaThanhToan),
                    cod: Number(Math.max(0, order.ThanhTien - order.DaThanhToan)),
                    trangThai: order.TrangThai || 'Chưa xác định',
                    note: order.Note || ''
                });
            });

            const lastDataRow = orders.length + 1; // Dòng dữ liệu cuối cùng (Do dòng 1 là Header)
            
            const totalRow = sheetOrders.addRow({
                maDH: 'TỔNG CỘNG:',
                // Các cột chữ để trống
                tenKH: '', ngayLap: '',
                // Nhúng công thức SUM của Excel động theo số lượng đơn hàng
                tongTien: { formula: `SUM(D2:D${lastDataRow})` },
                khuyenMai: { formula: `SUM(E2:E${lastDataRow})` },
                thanhTien: { formula: `SUM(F2:F${lastDataRow})` },
                daThanhToan: { formula: `SUM(G2:G${lastDataRow})` },
                cod: { formula: `SUM(H2:H${lastDataRow})` },
                trangThai: '', note: ''
            });

            // Trang trí cho dòng Tổng cộng thật nổi bật
            totalRow.font = { bold: true, size: 12, color: { argb: 'FFB91C1C' } }; // Chữ đỏ đậm
            totalRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFEE2E2' } // Nền màu hồng nhạt
            };

            // Định dạng tiền tệ cho các cột E, F, G, H
            ['D', 'E', 'F', 'G', 'H'].forEach(col => {
                sheetOrders.getColumn(col).numFmt = '#,##0" ₫"';
            });

            const sql_sp = `
                SELECT 
                    mh.MaMoHinh, 
                    mh.TenMH, 
                    pl.MaPhanLoai, 
                    pl.ChiTietPhanLoai,
                    COALESCE(SUM(COALESCE(ctdh.GiaNhapThucTe, mh.GiaNhap) * ctdh.SoLuong), 0) AS TongTienNhap,
                    COALESCE(SUM(ctdh.DonGiaBan * ctdh.SoLuong), 0) AS TongTienBan, 
                    COALESCE(SUM(ctdh.SoLuong * (ctdh.DonGiaBan - COALESCE(ctdh.GiaNhapThucTe, mh.GiaNhap))), 0) AS LoiNhuan,
                    COALESCE(SUM(ctdh.SoLuong), 0) AS SoLuongBan
                FROM MoHinh mh
                INNER JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
                LEFT JOIN ChiTietDonHang ctdh ON ctdh.MaPhanLoai = pl.MaPhanLoai
                GROUP BY mh.MaMoHinh, mh.TenMH, pl.MaPhanLoai, pl.ChiTietPhanLoai
                ORDER BY mh.MaMoHinh DESC
            `;
            const [sp] = await db.query(sql_sp);
            
            const sheetProducts = workbook.addWorksheet('Doanh thu sản phẩm');

            // 2. KHAI BÁO CỘT
            sheetProducts.columns = [
                { header: 'Mã phân loại', key: 'maPL', width: 15 },
                { header: 'Tên mô hình', key: 'tenMH', width: 35 },
                { header: 'Phân loại', key: 'tenPL', width: 20 },
                { header: 'Số lượng bán', key: 'soluong', width: 15 },
                { header: 'Tổng tiền nhập', key: 'tiennhap', width: 20 },
                { header: 'Tổng tiền bán', key: 'tienban', width: 20 },
                { header: 'Lợi Nhuận', key: 'loinhuan', width: 20 }, // Đổi tên hiển thị cho chuẩn Kế toán
            ];

            // 3. TRANG TRÍ HEADER
            sheetProducts.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheetProducts.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E293B' } // Màu nền xanh đen đậm
            };

            // 4. ĐỔ DỮ LIỆU
            sp.forEach(item => {
                sheetProducts.addRow({
                    maPL: `PL-${item.MaPhanLoai}`, // Nên dùng PL- thay vì FC- để dễ phân biệt với mã đơn hàng
                    tenMH: item.TenMH,
                    tenPL: item.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : item.ChiTietPhanLoai, // Fix lỗi sai tên biến
                    soluong: Number(item.SoLuongBan),
                    tiennhap: Number(item.TongTienNhap),
                    tienban: Number(item.TongTienBan),
                    loinhuan: Number(item.LoiNhuan), // Ánh xạ chuẩn với Key 'loinhuan'
                });
            });

            // 5. LÀM DÒNG TỔNG CỘNG ĐỘNG
            const lastDataRow_sp = sp.length + 1; 
            
            const totalRow_sp = sheetProducts.addRow({
                maPL: 'TỔNG CỘNG:',
                tenMH: '', tenPL: '',
                soluong: { formula: `SUM(D2:D${lastDataRow_sp})` },
                tiennhap: { formula: `SUM(E2:E${lastDataRow_sp})` }, // Fix dải tính E2:E
                tienban: { formula: `SUM(F2:F${lastDataRow_sp})` },
                loinhuan: { formula: `SUM(G2:G${lastDataRow_sp})` },
            });

            totalRow_sp.font = { bold: true, size: 12, color: { argb: 'FFB91C1C' } }; 
            totalRow_sp.fill = {
                type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } 
            };

            // 6. FORMAT TIỀN TỆ (Fix lỗi gọi nhầm sheet)
            ['E', 'F', 'G'].forEach(col => {
                sheetProducts.getColumn(col).numFmt = '#,##0" ₫"';
            });


            // =========================================================
            // ĐÓNG GÓI VÀ TRẢ VỀ TRÌNH DUYỆT CỦA CLIENT
            // =========================================================
            // Set Header để trình duyệt hiểu đây là file Excel cần Download
            res.setHeader(
                'Content-Type', 
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition', 
                'attachment; filename=' + `Bao_Cao_FigureCollect_${new Date().getTime()}.xlsx`
            );

            // Ghi file thẳng vào luồng response (Tối ưu RAM vì không lưu file cứng trên Server)
            await workbook.xlsx.write(res);
            res.status(200).end();

        } catch (error) {
            console.error("Lỗi xuất Excel: ", error);
            res.status(500).json({ success: false, message: "Lỗi tạo file báo cáo!" });
        }
    }
};

module.exports = bao_cao_ctrl;