// Thay bằng API Key của bạn
const apiKey = "AIzaSyCSdgk7CrmJ3neVkRd_Xt3HC-OdA95uSCQ";

async function xemDanhSachModel() {
    try {
        console.log("⏳ Đang hỏi Google danh sách Model được phép dùng...");
        
        // Gọi thẳng vào server Google bằng fetch (không cần dùng thư viện)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.log("❌ Lỗi từ Google:", data.error.message);
            return;
        }

        console.log("✅ THÀNH CÔNG! Đây là danh sách các model bạn CÓ THỂ sử dụng để chat:");
        
        let count = 0;
        data.models.forEach(model => {
            // Lọc ra những model hỗ trợ chat (generateContent)
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${model.name.replace('models/', '')}`);
                count++;
            }
        });

        if (count === 0) {
            console.log("⚠️ API Key của bạn không có quyền dùng bất kỳ model chat nào.");
        }

    } catch (error) {
        console.log("❌ Lỗi hệ thống:", error.message);
    }
}

xemDanhSachModel();