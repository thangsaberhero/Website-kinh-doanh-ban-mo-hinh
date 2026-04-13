require('dotenv').config();
const { ethers } = require('ethers');

// Paste ABI bạn copy từ tab Compiler của Remix vào đây
const CONTRACT_ABI = [
  // ... (Dán mảng ABI vào đây)
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Hàm lấy lịch sử từ Blockchain (chỉ đọc, không tốn phí gas)
async function getHistoryFromBlockchain(serialNumber) {
    try {
        const historyData = await contract.getProductHistory(serialNumber);
        return historyData.map(record => ({
            status: record.status,
            location: record.location,
            timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
            updatedBy: record.updatedBy
        }));
    } catch (error) {
        console.error("Lỗi đọc Blockchain:", error);
        throw error;
    }
}

module.exports = { contract, getHistoryFromBlockchain };