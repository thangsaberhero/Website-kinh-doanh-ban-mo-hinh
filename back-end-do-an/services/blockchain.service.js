const { Web3 } = require('web3');
require('dotenv').config(); // Đảm bảo đã load cấu hình từ file .env

const RPC_URL = process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'; 
const web3 = new Web3(RPC_URL);
const CONTRACT_ADDRESS = '0x3d9afec87bf4243ae7807bb8eca970ca9106d902'; 

// =====================================================================
// 🔑 CẤU HÌNH VÍ ADMIN ĐỂ KÝ GIAO DỊCH (BẮT BUỘC PHẢI CÓ)
// =====================================================================
// Bạn hãy thêm dòng này vào file .env: PRIVATE_KEY=mã_private_key_ví_metamask_của_bạn
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x_NHẬP_PRIVATE_KEY_VÍ_ADMIN_CỦA_BẠN_VÀO_ĐÂY_NẾU_KHÔNG_DÙNG_ENV'; 

let adminAddress = '';
try {
    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);
    adminAddress = account.address;
    console.log('🔑 Ví Admin đã sẵn sàng thực hiện giao dịch:', adminAddress);
} catch (err) {
    console.error('🔴 Lỗi cấu hình Ví Admin: Hãy kiểm tra lại Private Key trong file .env!');
}
// =====================================================================

const CONTRACT_ABI = [
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

const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// 1. Hàm lấy lịch sử từ Blockchain (Chỉ đọc - Dùng .call())
async function getHistoryFromBlockchain(serialNumber) {
    try {
        const cleanSerial = serialNumber.trim(); 
        const historyData = await contract.methods.getProductHistory(cleanSerial).call();
        
        console.log("Dữ liệu thô từ Blockchain:", historyData); 

        return historyData.map(record => ({
            status: record.status,
            location: record.location,
            timestamp: Number(record.timestamp),
            updatedBy: record.updatedBy
        }));
    } catch (error) {
        console.error("Lỗi khi đọc Blockchain:", error);
        return [];
    }
}

// 2. Hàm khởi tạo sản phẩm mới trên Blockchain (Ghi dữ liệu - Dùng .methods.xxx().send())
async function mintProductOnBlockchain(serialNumber, manufacturer) {
    console.log(`--- Đang khởi tạo sản phẩm mới: ${serialNumber} ---`);
    try {
        // Cú pháp chuẩn Web3.js: sử dụng .methods và kích hoạt bằng .send()
        const receipt = await contract.methods.mintProduct(serialNumber, manufacturer).send({
            from: adminAddress,
            gas: 300000 // Lượng gas ước tính cho mạng Sepolia
        });
        
        console.log("Khởi tạo thành công trên Blockchain! Hash:", receipt.transactionHash);
        
        // Trả về object có thuộc tính 'hash' để đồng bộ khớp với controller nhận dữ liệu
        return { hash: receipt.transactionHash };
    } catch (error) {
        console.error("Lỗi khi khởi tạo sản phẩm:", error);
        throw error;
    }
}

// 3. Hàm cập nhật trạng thái/hành trình (Ghi dữ liệu - Dùng .methods.xxx().send())
async function updateStatusOnBlockchain(serialNumber, newStatus, location) {
    console.log(`--- Đang cập nhật trạng thái cho: ${serialNumber} ---`);
    try {
        // Cú pháp chuẩn Web3.js: sử dụng .methods và kích hoạt bằng .send()
        const receipt = await contract.methods.updateProductStatus(serialNumber, newStatus, location).send({
            from: adminAddress,
            gas: 300000
        });
        
        console.log("Cập nhật trạng thái thành công! Hash:", receipt.transactionHash);
        
        // Trả về object chứa hash giao dịch cho Frontend hiển thị
        return { hash: receipt.transactionHash };
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái tại Service:", error);
        throw error;
    }
}

module.exports = { 
    contract, 
    getHistoryFromBlockchain, 
    mintProductOnBlockchain, 
    updateStatusOnBlockchain 
};