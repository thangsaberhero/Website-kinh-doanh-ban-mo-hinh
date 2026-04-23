const db = require('../../config/db'); // Import DB của bạn
const blockchainService = require('../../services/blockchain.service'); // Trỏ đúng thư mục services mới
const {Web3} = require('web3'); // <-- THÊM MỚI: Import thư viện Web3

// =====================================================================
// 🚀 ĐOẠN CODE KIỂM TRA KẾT NỐI BLOCKCHAIN SEPOLIA
// =====================================================================
const web3 = new Web3('https://ethereum-sepolia-rpc.publicnode.com');
const contractAddress = '0x3D9aFEc87bf4243ae7807bB8Eca970ca9106D902'; // Contract từ ảnh Etherscan của bạn

async function checkBlockchainConnection() {
    try {
        console.log('⏳ Đang kiểm tra kết nối mạng Sepolia...');
        const blockNumber = await web3.eth.getBlockNumber();
        console.log('✅ Kết nối thành công tới Sepolia! Block mới nhất:', blockNumber);

        // Sử dụng web3.utils.toChecksumAddress để chuẩn hóa địa chỉ và .trim() để bỏ dấu cách thừa
        const rawAddress = '0x3D9aFEc87bf4243ae7807bB8Eca970ca9106D902';
        const formattedAddress = web3.utils.toChecksumAddress(rawAddress.trim());

        const code = await web3.eth.getCode(formattedAddress);
        
        if (code !== '0x' && code !== '0x0') {
            console.log('🚀 Tuyệt vời! Đã tìm thấy Smart Contract trên Sepolia.');
        } else {
            console.log('❌ Lỗi: Không tìm thấy code hợp đồng tại địa chỉ này.');
        }
    } catch (error) {
        // Nếu lỗi do Validator, chúng ta sẽ in ra thông báo dễ hiểu hơn
        if (error.message.includes('validator')) {
            console.error('🔴 Lỗi: Định dạng địa chỉ ví không hợp lệ. Hãy kiểm tra dấu cách hoặc ký tự lạ.');
        } else {
            console.error('🔴 Lỗi kết nối Blockchain:', error.message);
        }
    }
}

// Gọi hàm kiểm tra ngay khi Node.js đọc đến file này
checkBlockchainConnection();
// =====================================================================

// 1. Dành cho Khách hàng/Web: Truy xuất kết hợp DB & Blockchain
const truyXuatNguonGoc = async (req, res) => {
    try {
        const { serialNumber } = req.params;

        // Lấy thông tin cơ bản từ Database
        const query = `
            SELECT sp.MaVach_Serial, mh.TenMH, hsx.TenHSX, mh.AnhDaiDien 
            FROM SanPhamVatLy sp 
            LEFT JOIN MoHinh mh ON sp.MaMoHinh = mh.MaMoHinh
            LEFT JOIN HangSanXuat hsx ON mh.MaHSX = hsx.MaHSX
            WHERE sp.MaVach_Serial = ?
        `;
        const [rows] = await db.query(query, [serialNumber]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mã Serial này trong hệ thống!" });
        }

        const product = rows[0];

        // Lấy lịch sử bất biến từ Blockchain
        const blockchainHistory = await blockchainService.getHistoryFromBlockchain(serialNumber);

        res.json({
            success: true,
            product: product,
            history: blockchainHistory
        });

    } catch (error) {
        console.error("CHI TIẾT LỖI TẠI BACKEND:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi máy chủ", 
            error: error.message
        });
    }
};

// 2. Dành cho Admin: Mint sản phẩm lên Blockchain
const mintProduct = async (req, res) => {
    try {
        const { serialNumber, manufacturer } = req.body;
        if (!serialNumber || !manufacturer) return res.status(400).json({ success: false, message: "Thiếu dữ liệu!" });

        const receipt = await blockchainService.mintProductOnBlockchain(serialNumber, manufacturer);
        return res.status(200).json({ success: true, message: "Khởi tạo thành công!", hash: receipt.hash });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi Mint Blockchain", error: error.message });
    }
};

// 3. Dành cho Admin: Update trạng thái Blockchain
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

module.exports = {
    truyXuatNguonGoc,
    mintProduct,
    updateProductStatus
};