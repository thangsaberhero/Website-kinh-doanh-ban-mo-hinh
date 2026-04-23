const { Web3 } = require('web3');
const RPC_URL = process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'; 
const web3 = new Web3(RPC_URL);
const CONTRACT_ADDRESS = '0x3d9afec87bf4243ae7807bb8eca970ca9106d902'; 

// TODO 2: Dán toàn bộ mảng JSON ABI của bạn vào giữa 2 dấu ngoặc vuông này
// Paste ABI của bạn
const CONTRACT_ABI = [
    // ... (Giữ nguyên toàn bộ mảng ABI bạn đã copy) ...
    {
        "inputs": [
            { "internalType": "string", "name": "_serialNumber", "type": "string" },
            { "internalType": "string", "name": "_manufacturer", "type": "string" }
        ],
        "name": "mintProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_serialNumber", "type": "string" },
            { "internalType": "string", "name": "_newStatus", "type": "string" },
            { "internalType": "string", "name": "_location", "type": "string" }
        ],
        "name": "updateProductStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "_serialNumber", "type": "string" }],
        "name": "getProductHistory",
        "outputs": [
            {
                "components": [
                    { "internalType": "string", "name": "status", "type": "string" },
                    { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
                    { "internalType": "string", "name": "location", "type": "string" },
                    { "internalType": "address", "name": "updatedBy", "type": "address" }
                ],
                "internalType": "struct ProductProvenance.ProductHistory[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "name": "isProductMinted",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "", "type": "string" },
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "productTrail",
        "outputs": [
            { "internalType": "string", "name": "status", "type": "string" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "internalType": "string", "name": "location", "type": "string" },
            { "internalType": "address", "name": "updatedBy", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// KHỞI TẠO ĐỐI TƯỢNG CONTRACT (Chính dòng này sẽ sửa lỗi undefined của bạn)
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
// 1. Hàm lấy lịch sử từ Blockchain (Chỉ đọc, không tốn gas)
async function getHistoryFromBlockchain(serialNumber) {
    try {
        // Đảm bảo không có khoảng trắng thừa
        const cleanSerial = serialNumber.trim(); 
        
        // Gọi Smart Contract
        const historyData = await contract.methods.getProductHistory(cleanSerial).call();
        
        // 🔥 THÊM DÒNG NÀY VÀO ĐỂ XEM DỮ LIỆU THẬT SỰ TỪ BLOCKCHAIN LÀ GÌ
        console.log("Dữ liệu thô từ Blockchain:", historyData); 

        return historyData.map(record => ({
            status: record.status,
            location: record.location,
            timestamp: Number(record.timestamp),
            updatedBy: record.updatedBy
        }));
    } catch (error) {
        console.error("Lỗi khi đọc Blockchain:", error);
        return []; // Nếu có lỗi nó sẽ trả về mảng rỗng
    }
}

// 2. Hàm khởi tạo sản phẩm mới trên Blockchain (Tốn phí Gas)
async function mintProductOnBlockchain(serialNumber, manufacturer) {
    console.log(`--- Đang khởi tạo sản phẩm mới: ${serialNumber} ---`);
    try {
        // Gọi hàm từ Smart Contract
        const tx = await contract.mintProduct(serialNumber, manufacturer);
        console.log(`Đang chờ block xác nhận... Hash: ${tx.hash}`);
        
        // Bắt buộc phải có đoạn này để chờ giao dịch được ghi vào block thành công
        const receipt = await tx.wait(); 
        console.log("Khởi tạo thành công trên Blockchain!");
        return receipt;
    } catch (error) {
        console.error("Lỗi khi khởi tạo sản phẩm:", error);
        throw error;
    }
}

// 3. Hàm cập nhật trạng thái/hành trình (Tốn phí Gas)
async function updateStatusOnBlockchain(serialNumber, newStatus, location) {
    console.log(`--- Đang cập nhật trạng thái cho: ${serialNumber} ---`);
    try {
        const tx = await contract.updateProductStatus(serialNumber, newStatus, location);
        console.log(`Đang chờ block xác nhận... Hash: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log("Cập nhật trạng thái thành công!");
        return receipt;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        throw error;
    }
}

module.exports = { 
    contract, 
    getHistoryFromBlockchain, 
    mintProductOnBlockchain, 
    updateStatusOnBlockchain 
};