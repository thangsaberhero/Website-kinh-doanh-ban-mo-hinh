const db = require('../../config/db'); // Import DB của bạn
const blockchainService = require('../../services/blockchain.service'); // Trỏ đúng thư mục services mới
const { Web3 } = require('web3'); // Import thư viện Web3
const QRCode = require('qrcode'); 

// =====================================================================
// 🚀 ĐOẠN CODE KIỂM TRA KẾT NỐI BLOCKCHAIN SEPOLIA
// =====================================================================
const web3 = new Web3('https://ethereum-sepolia-rpc.publicnode.com');

async function checkBlockchainConnection() {
    try {
        console.log('⏳ Đang kiểm tra kết nối mạng Sepolia...');
        const blockNumber = await web3.eth.getBlockNumber();
        console.log('✅ Kết nối thành công tới Sepolia! Block mới nhất:', blockNumber);

        const rawAddress = '0x3D9aFEc87bf4243ae7807bB8Eca970ca9106D902';
        const formattedAddress = web3.utils.toChecksumAddress(rawAddress.trim());
        const code = await web3.eth.getCode(formattedAddress);
        
        if (code !== '0x' && code !== '0x0') {
            console.log('🚀 Tuyệt vời! Đã tìm thấy Smart Contract trên Sepolia.');
        } else {
            console.log('❌ Lỗi: Không tìm thấy code hợp đồng tại địa chỉ này.');
        }
    } catch (error) {
        console.error('🔴 Lỗi kết nối Blockchain:', error.message);
    }
}
checkBlockchainConnection();


// =====================================================================
// 🌟 TỐI ƯU: API lấy toàn bộ mô hình phục vụ Frontend (Thanh tìm kiếm)
// =====================================================================
const getValidSerials = async (req, res) => {
    try {
        // CHỈNH SỬA: Đã đồng bộ chữ hoa chữ thường tên bảng 'MoHinh' chuẩn CSDL
        const query = `
            SELECT mh.*, hsx.TenHSX 
            FROM MoHinh mh
            LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
            ORDER BY mh.MaVach_Serial DESC
        `;
        const [rows] = await db.query(query);

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("LỖI LẤY DANH SÁCH MÔ HÌNH:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi kết nối cơ sở dữ liệu", 
            error: error.message 
        });
    }
};


// =====================================================================
// 🌟 TỐI ƯU: Lấy chi tiết lịch sử (Cứu hộ luồng dữ liệu khi chưa Mint)
// =====================================================================
const truyXuatNguonGoc = async (req, res) => {
    try {
        const { serialNumber } = req.params;

        // 1. Lấy dữ liệu lịch sử lưu trữ trên Smart Contract
        const history = await blockchainService.getHistoryFromBlockchain(serialNumber);

        // 2. Tìm thông tin chi tiết của mô hình (Ảnh, Tên, Hãng) trong MySQL để hiển thị bổ trợ
        const sql = `
            SELECT *
            FROM MoHinh mh
            LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
            LEFT JOIN PhanLoai pl ON pl.MaMoHinh = mh.MaMoHinh
            WHERE mh.MaVach_Serial = ? 
            LIMIT 1
        `;
        const [rows] = await db.query(sql, [serialNumber]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Mã vạch/Serial không tồn tại trong hệ thống dữ liệu gốc!"
            });
        }

        // Trả về gói cấu trúc đồng bộ khớp với hàm handleSearch ở Front-end Vue 3
        return res.status(200).json({
            success: true,
            product: rows[0], // Gồm TenMH, AnhDaiDien, TenHSX, MaVach_Serial
            history: history  // Mảng hành trình blockchain lịch sử
        });

    } catch (error) {
        console.error("Lỗi khi truy xuất:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi kết nối dữ liệu Blockchain",
            error: error.message
        });
    }
};


// =====================================================================
// 🌟 TỐI ƯU: Đã bổ sung cập nhật SQL khi Mint thành công
// =====================================================================
const mintProduct = async (req, res) => {
    try {
        const { serialNumber, manufacturer } = req.body;
        if (!serialNumber || !manufacturer) return res.status(400).json({ success: false, message: "Thiếu dữ liệu!" });

        // 1. Tương tác nạp khối định danh lên mạng Sepolia
        const receipt = await blockchainService.mintProductOnBlockchain(serialNumber, manufacturer);
        
        // 2. BỔ SUNG: Cập nhật trạng thái cột Is_Minted = 1 trực tiếp vào SQL
        const updateQuery = "UPDATE MoHinh SET Is_Minted = 1 WHERE MaVach_Serial = ?";
        await db.query(updateQuery, [serialNumber]);

        return res.status(200).json({ 
            success: true, 
            message: "Khởi tạo thành công và đồng bộ dữ liệu hệ thống!", 
            hash: receipt.hash 
        });
    } catch (error) {
        console.error("LỖI MINT BLOCKCHAIN:", error);
        return res.status(500).json({ success: false, message: "Lỗi Mint Blockchain", error: error.message });
    }
};


// =====================================================================
// 3. Dành cho Admin: Update trạng thái Blockchain
// =====================================================================
const updateProductStatus = async (req, res) => {
    try {
        const { serialNumber, newStatus, location } = req.body;
        if (!serialNumber || !newStatus || !location) return res.status(400).json({ success: false, message: "Thiếu dữ liệu!" });

        const receipt = await blockchainService.updateStatusOnBlockchain(serialNumber, newStatus, location);
        return res.status(200).json({ success: true, message: "Cập nhật thành công!", hash: receipt.hash });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Update Blockchain", error: error.message });
    }
};


// =====================================================================
// 4. Tạo mã QR dựa trên Serial số mô hình
// =====================================================================
const FRONTEND_URL = process.env.VITE_CLIENT_URL || 'http://localhost:5173';

const generateProductQR = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const qrUrl = `${FRONTEND_URL}/truy-xuat/${serialNumber}`;

        const qrImageBase64 = await QRCode.toDataURL(qrUrl, {
            errorCorrectionLevel: 'H', 
            margin: 1,
            width: 300,
            color: { dark: '#000000', light: '#ffffff' }
        });

        res.json({
            success: true,
            serialNumber: serialNumber,
            qrCodeData: qrImageBase64, 
            targetUrl: qrUrl
        });
    } 
    catch (error) {
        console.error("Lỗi tạo mã QR:", error);
        res.status(500).json({ success: false, message: "Không thể tạo mã QR" });
    }
};

module.exports = {
    getValidSerials,
    truyXuatNguonGoc,
    mintProduct,
    updateProductStatus,
    generateProductQR
};