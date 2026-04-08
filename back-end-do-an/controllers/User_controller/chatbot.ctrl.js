const { GoogleGenerativeAI } = require("@google/generative-ai");
console.log("Key của tôi là:", process.env.GEMINI_API_KEY);
const pool = require('../../config/db')

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

// Khởi tạo Dialogflow Client
const path = require('path');
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: path.join(__dirname, 'key.json') 
});
const projectId = 'chatbotai-jw9s'; 

const phanLoaiBangDialogflow = async (userMessage, sessionId) => {
    try {
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
        const request = {
            session: sessionPath,
            queryInput: {
                text: { text: userMessage, languageCode: 'vi' },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        const parameters = result.parameters.fields || {};
        
        return {
            intent: result.intent ? result.intent.displayName : 'giao_tiep_co_ban',
            dfText: result.fulfillmentText, 
            keywords: parameters.keywords ? parameters.keywords.stringValue : "",
            phone: parameters.phone ? parameters.phone.stringValue : "",
            Khoang_Gia: parameters.Khoang_Gia ? parameters.Khoang_Gia.stringValue : "",
            DanhMuc: parameters.danh_muc ? parameters.danh_muc.stringValue : "", 
            isFallback: result.intent.displayName === 'Default Fallback Intent'
        };
    } catch (error) {
        console.error("Lỗi Dialogflow:", error);
        return { intent: "giao_tiep_co_ban", isFallback: true }; 
    }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- HÀM CHAT MỚI ĐÃ TỐI ƯU ---
// --- HÀM CHAT ĐÃ UPDATE: TỰ ĐỘNG BẮT TỪ KHÓA SIÊU CHUẨN ---
// --- HÀM CHAT ĐÃ UPDATE: FIX LỖI TRÙNG LẶP CASE ---
const chatWithAI = async (req, res) => {
    try {
        const { message, sessionId = uuid.v4() } = req.body;

        if (!message) return res.status(400).json({ message: "Tin nhắn không để trống" });

        console.log("\n--- BƯỚC 1: DIALOGFLOW PHÂN TÍCH ---");
        const dfResult = await phanLoaiBangDialogflow(message, sessionId);
        
        let intentName = dfResult.intent.toLowerCase().trim();
        console.log("DF Intent ban đầu:", intentName);

        let textRaw = message.toLowerCase().trim();
        // SỬA LẠI REGEX MỘT CHÚT CHO CHUẨN XÁC HƠN
        let isPhoneNumber = /(0[35789])([0-9]{8})/.test(textRaw);
        let isOrderId = /^\d{5,8}$/.test(textRaw);

        if (isPhoneNumber || isOrderId) {
            console.log("=> Phát hiện SĐT hoặc Mã đơn, ép sang tra_cuu_don_hang!");
            intentName = "tra_cuu_don_hang";
            dfResult.isFallback = false; 
        }
        // --- HÀNG RÀO BẢO VỆ: PHÂN BIỆT TÌM TÊN VÀ TÌM GIÁ ---
        // Nếu Intent là tìm theo tên, nhưng khách lại gõ kèm chữ số và tiền (ví dụ: "Luffy 500k", "dưới 1 triệu")
        let hasPriceKeywords = /(dưới|trên|từ|khoảng)\s*\d+|\d+\s*(triệu|tr\b|k\b|ngàn|nghìn|củ)/.test(textRaw);
        if (intentName === "hoi_thong_tin_san_pham" && hasPriceKeywords) {
            console.log("=> Phát hiện có nhắc đến giá tiền, tự động bẻ lái sang tu_van_theo_gia!");
            intentName = "tu_van_theo_gia";
        }
        // 1. TRƯỜNG HỢP CỐ ĐỊNH 
        if (["huong_dan_mua_hang", "giao_tiep_co_ban", "default welcome intent"].includes(intentName)) {
            console.log("=> Trả lời cố định từ Dialogflow.");
            const textDF = dfResult.dfText ? dfResult.dfText.trim() : "";
            const finalMsg = textDF !== "" ? textDF : "Dạ shop FigureCollect xin chào ạ! Bạn muốn tìm mô hình nào nè? 🥰";
            return res.status(200).json({ message: finalMsg, products: [] });
        }

        // 2. TRƯỜNG HỢP FALLBACK 
        if (dfResult.isFallback) {
             console.log("=> DF không hiểu, gọi Gemini xử lý Fallback...");
             const promptFallback = `Bạn là nhân viên shop mô hình. Khách vừa nói: "${message}". Hãy đáp lại ngắn gọn (1-2 câu), thân thiện và lái họ về việc mua mô hình. Tuyệt đối không bịa ra sản phẩm.`;
             const aiGenerator = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
             const fallbackResult = await aiGenerator.generateContent(promptFallback);
             return res.status(200).json({ message: fallbackResult.response.text(), products: [] });
        }

        // 3. TRƯỜNG HỢP CẦN DATABASE
        console.log("=> Xử lý Database theo Intent:", intentName);
        let dbData = []; 
        let responseMessage = "";
        
        switch (intentName) {
            
            // --- CHỨC NĂNG MỚI: LIÊN HỆ NHÂN VIÊN ---
            case "yeu_cau_gap_nhan_vien": {
                // Nhớ đổi lại địa chỉ thật của shop bạn nhé
                responseMessage = `
                    Dạ, nếu bạn cần hỗ trợ trực tiếp, vui lòng chọn kênh liên hệ dưới đây nhé. Shop luôn sẵn sàng hỗ trợ bạn! 🥰
                    
                    <div style="background: #f4f6f8; padding: 12px 15px; border-radius: 10px; margin-top: 12px; font-size: 14px; color: #333; line-height: 1.6; border-left: 4px solid #0068FF;">
                        <b>🏠 Địa chỉ:</b> Số 1, Đường Lê Hồng Phong, Lạ Viên, Ngô Quyền, TP. Hải Phòng<br>
                        <b>⏰ Giờ hoạt động:</b> 08:00 - 22:00 (Tất cả các ngày trong tuần)
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                        
                        <a href="https://zalo.me/0986709616" target="_blank" style="display: flex; align-items: center; padding: 12px; background: #ffffff; border: 1.5px solid #0068FF; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png" alt="Zalo" style="width: 45px; height: 45px; border-radius: 10px; margin-right: 15px; object-fit: cover;">
                            <div style="display: flex; flex-direction: column; text-align: left;">
                                <span style="font-weight: bold; font-size: 15px; color: #0068FF; margin-bottom: 3px;">Chat qua Zalo</span>
                                <span style="font-size: 13px; color: #555;">0986.709.616 (Trực tuyến)</span>
                            </div>
                        </a>

                        <a href="https://www.facebook.com/phutooan" target="_blank" style="display: flex; align-items: center; padding: 12px; background: #ffffff; border: 1.5px solid #1877F2; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/1024px-2021_Facebook_icon.svg.png" alt="Facebook" style="width: 45px; height: 45px; margin-right: 15px; object-fit: cover;">
                            <div style="display: flex; flex-direction: column; text-align: left;">
                                <span style="font-weight: bold; font-size: 15px; color: #1877F2; margin-bottom: 3px;">Nhắn tin qua Facebook</span>
                                <span style="font-size: 13px; color: #555;">Fanpage FigureCollect</span>
                            </div>
                        </a>

                        <a href="https://www.instagram.com/ddpt24/" target="_blank" style="display: flex; align-items: center; padding: 12px; background: #ffffff; border: 1.5px solid #E1306C; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png" alt="Instagram" style="width: 45px; height: 45px; border-radius: 10px; margin-right: 15px; object-fit: cover;">
                            <div style="display: flex; flex-direction: column; text-align: left;">
                                <span style="font-weight: bold; font-size: 15px; color: #E1306C; margin-bottom: 3px;">Nhắn tin Instagram</span>
                                <span style="font-size: 13px; color: #555;">@figurecollect_ig</span>
                            </div>
                        </a>

                    </div>
                `;
                break;
            }


            case "hoi_khuyen_mai": {
                console.log("=> Bắt đầu tìm kiếm chương trình khuyến mại...");
                dbData = await laySanPhamKhuyenMai(); 
                
                if (dbData && dbData.length > 0) {
                    let tenChuongTrinh = dbData[0].TenKM;
                    responseMessage = `Dạ hiện tại cửa hàng đang có chương trình <b>${tenChuongTrinh}</b> áp dụng cho một số mã mô hình cực hot. Dưới đây là thông tin chi tiết các sản phẩm đang được giảm giá để bạn tham khảo nhé 👇`;
                } else {
                    responseMessage = `Dạ hiện tại cửa hàng đang tạm hết các chương trình khuyến mại, bạn vui lòng theo dõi thêm trong thời gian tới nhé! 🥰`;
                }
                break;
            }            
            // --- CHỨC NĂNG MỚI: CHỈ TÌM THEO TÊN HOẶC LOẠI SẢN PHẨM ---
            case "hoi_thong_tin_san_pham": {
                console.log("=> Bắt đầu tìm kiếm sản phẩm CHỈ THEO TÊN/LOẠI...");
                
                // Lấy từ khóa từ Dialogflow, nếu không có thì lọc từ câu chat gốc
                let rawKeyword = dfResult.keywords || message;
                let keywordTen = extractCharacterName(rawKeyword);

                console.log(`=> Từ khóa cần tìm: [${keywordTen}]`);

                if (!keywordTen) {
                    responseMessage = "Dạ bạn đang muốn tìm mô hình của nhân vật hay dòng sản phẩm nào ạ? (Ví dụ: Luffy, Zoro, Gundam...) 🤔";
                    break;
                }

                // Gọi hàm truy vấn DB riêng cho việc tìm theo tên
                dbData = await timSanPhamTheoTen(keywordTen);

                if (dbData && dbData.length > 0) {
                    responseMessage = `Dạ shop tìm thấy các mẫu <b>${keywordTen}</b> siêu hot cho bạn đây ạ 👇`;
                } else {
                    responseMessage = `Dạ tiếc quá, hiện shop tạm hết mẫu <b>${keywordTen}</b> rồi ạ. Bạn tham khảo nhân vật khác giúp shop nha! 🥲`;
                }
                break;
            }
            
            case "tu_van_theo_gia": {
                console.log("=> Bắt đầu tìm kiếm sản phẩm (có thể kèm giá)...");
                let minPrice = 0;
                let maxPrice = 999999999;
                let msgText = message.toLowerCase();

                let matchDuoi = msgText.match(/dưới\s*(\d+(?:\.\d+)?)\s*(triệu|tr|k|ngàn|nghìn|củ)/);
                if (matchDuoi) {
                    let so = parseFloat(matchDuoi[1]);
                    let donVi = matchDuoi[2];
                    if (['triệu', 'tr', 'củ'].includes(donVi)) maxPrice = so * 1000000;
                    else maxPrice = so * 1000;
                }
                
                let matchTren = msgText.match(/(?:trên|từ|hơn|>)\s*(\d+(?:\.\d+)?)\s*(triệu|tr|k|ngàn|nghìn|củ)/);
                if (matchTren) {
                    let so = parseFloat(matchTren[1]);
                    let donVi = matchTren[2];
                    if (['triệu', 'tr', 'củ'].includes(donVi)) minPrice = so * 1000000;
                    else minPrice = so * 1000;
                }

                if (minPrice === 0 && maxPrice === 999999999) {
                    let khoangGia = dfResult.Khoang_Gia || ""; 
                    if (khoangGia === "duoi_1_trieu") maxPrice = 1000000;
                    else if (khoangGia === "tu_1_den_3_trieu") { minPrice = 1000000; maxPrice = 3000000; }
                    else if (khoangGia === "tren_3_trieu") minPrice = 3000000;
                    else if (khoangGia === "tren_1_trieu") minPrice = 1000000;
                }

                let rawKeyword = dfResult.keywords || message;
                let keywordGia = extractCharacterName(rawKeyword);

                console.log(`=> Tìm kiếm: [${keywordGia}] | Giá: ${minPrice} - ${maxPrice}`);
                dbData = await timSanPhamTheoGia(keywordGia, minPrice, maxPrice); 

                if (dbData && dbData.length > 0) {
                    let khoangGiaText = "";
                    if (maxPrice < 999999999 && minPrice > 0) khoangGiaText = `từ <b>${minPrice.toLocaleString('vi-VN')}đ</b> đến <b>${maxPrice.toLocaleString('vi-VN')}đ</b> `;
                    else if (maxPrice < 999999999) khoangGiaText = `dưới <b>${maxPrice.toLocaleString('vi-VN')}đ</b> `;
                    else if (minPrice > 0) khoangGiaText = `trên <b>${minPrice.toLocaleString('vi-VN')}đ</b> `;

                    let tenNhanVatText = keywordGia ? `<b>${keywordGia}</b> ` : "mô hình ";
                    responseMessage = `Dạ shop tìm thấy các mẫu ${tenNhanVatText}${khoangGiaText}cho bạn đây ạ 👇`;
                } else {
                    responseMessage = `Dạ tiếc quá, hiện shop tạm hết mẫu ${keywordGia ? `<b>${keywordGia}</b> ` : ""}trong khoảng giá bạn tìm rồi ạ. 🥲`;
                }
                break;
            }

            // ĐÂY LÀ CASE TRA CỨU ĐƠN HÀNG DUY NHẤT (ĐÃ XÓA CÁI TRÙNG LẶP)
            case "tra_cuu_don_hang": {
                console.log("=> Bắt đầu tra cứu đơn hàng...");
                let msgText = message.toLowerCase();
                let sdt = null;
                let maDon = null;

                let phoneMatch = msgText.match(/(0[35789])([0-9]{8})\b/);
                if (phoneMatch) sdt = phoneMatch[0];
                else sdt = dfResult.phone || null; 

                let orderIdMatch = msgText.match(/(?:mã|đơn|mã đơn|số)\s*(\d{4,8})\b/i);
                if (orderIdMatch) maDon = orderIdMatch[1];

                if (!maDon && !sdt) {
                    let bareNumber = msgText.match(/\b\d{5,8}\b/);
                    if (bareNumber) maDon = bareNumber[0];
                }

                if (sdt || maDon) {
                    const donHang = await traCuuDonHang(sdt, maDon);

                    if (donHang) {
                        let ngayLap = new Date(donHang.NgayLapDon).toLocaleDateString('vi-VN');
                        let thanhTien = donHang.ThanhTien ? Number(donHang.ThanhTien).toLocaleString('vi-VN') + 'đ' : 'Chưa cập nhật';

                        responseMessage = `
                            Dạ, shop tìm thấy thông tin đơn hàng của bạn rồi ạ:<br><br>
                            📦 <b>Mã đơn:</b> ${donHang.MaDH}<br>
                            👤 <b>Người nhận:</b> ${donHang.TenNguoiNhan || 'Khách hàng'}<br>
                            📅 <b>Ngày đặt:</b> ${ngayLap}<br>
                            💰 <b>Tổng tiền:</b> ${thanhTien}<br>
                            🚚 <b>Trạng thái:</b> <span style="color: #ff6b6b; font-weight: bold;">${donHang.TrangThaiDonHang}</span><br>
                            📍 <b>Địa chỉ:</b> ${donHang.DiaChiGiao || 'Chưa cập nhật'}<br><br>
                            👉 <a href="/order-history" target="_blank" style="color: #4facfe; text-decoration: underline; font-weight: bold;">Nhấn vào đây để xem chi tiết lịch sử mua hàng nhé!</a>
                        `;
                    } else {
                        responseMessage = `Dạ shop không tìm thấy đơn hàng nào khớp với thông tin <b>${sdt || maDon}</b> ạ. Bạn kiểm tra lại giúp shop nha! 😅`;
                    }
                } else {
                    responseMessage = "Dạ, để kiểm tra trạng thái đơn hàng, bạn cho shop xin <b>Số điện thoại đặt hàng</b> hoặc <b>Mã đơn hàng</b> nhé! 👇";
                }
                break;
            }
            // --- CHỨC NĂNG MỚI: TÌM THEO DANH MỤC SẢN PHẨM ---
            case "tim_theo_danh_muc": {
                console.log("=> Bắt đầu tìm kiếm sản phẩm theo danh mục...");
                
                // Lấy tên danh mục từ Dialogflow
                let danhMuc = dfResult.DanhMuc;

                console.log(`=> Danh mục cần tìm: [${danhMuc}]`);

                if (!danhMuc || danhMuc.trim() === "") {
                    responseMessage = "Dạ bạn muốn xem sản phẩm thuộc danh mục nào ạ? (Ví dụ: Gundam, Anime Figure, Model Kit...) 😊";
                    break;
                }

                // Gọi hàm truy vấn DB
                dbData = await timSanPhamTheoDanhMuc(danhMuc);

                if (dbData && dbData.length > 0) {
                    responseMessage = `Dạ đây là các mẫu thuộc danh mục <b>${danhMuc}</b> cực hot bên shop ạ 👇`;
                } else {
                    responseMessage = `Dạ hiện tại danh mục <b>${danhMuc}</b> shop đang tạm hết hàng. Bạn xem thử các mẫu khác nhé! 🥲`;
                }
                break;
            }
            default: {
                responseMessage = dfResult.dfText || "Dạ hệ thống đang xử lý yêu cầu của bạn ạ!";
                break;
            }
        }
        
        // 4. TRẢ VỀ CHO FRONTEND
        console.log("=> Trả kết quả Database về Frontend!");
        return res.status(200).json({ 
            message: responseMessage, 
            products: dbData 
        });

    } catch (error) {
        console.error("Lỗi Chatbot:", error);
        return res.status(500).json({ message: "Dạ hệ thống đang quá tải một chút, bạn thử lại sau nhé!" });
    }
};

// =====================================================================
// CÁC HÀM TRUY VẤN CSDL (GIỮ NGUYÊN HOÀN TOÀN TỪ CODE CŨ CỦA BẠN)
// =====================================================================

const timSanPham = async (keywords) => {
    const sql = `
        SELECT m.MaMoHinh, m.TenMH, m.DonGia AS GiaGoc, m.TrangThai,
               (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh, 
               h.TenHSX, p.ChiTietPhanLoai, p.DonGia AS GiaPhienBan, p.SoLuong
        FROM MoHinh m
        LEFT JOIN HangSanXuat h ON m.MaHSX = h.MaHSX
        LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh
        WHERE m.TenMH LIKE ? OR m.ThongTinChiTiet LIKE ?
    `;
    const [rows] = await pool.query(sql, [`%${keywords}%`, `%${keywords}%`]);
    return rows;
};

const timSanPhamTheoGia = async (keywords, minPrice, maxPrice) => {
    try {
        // Câu lệnh gốc: Kết hợp bảng MoHinh và Phanloai để lấy giá thực tế rẻ nhất
        let sql = `
            SELECT m.MaMoHinh, m.TenMH, m.TrangThai, 
                   (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh,
                   MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaThucTe
            FROM MoHinh m
            LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh
            WHERE 1=1
        `;
        const params = [];

        // 1. TÌM THEO TÊN (Nếu khách có nhập từ khóa như "Luffy", "Zoro"...)
        // Thêm hàm .trim() để đảm bảo không bị lỗi do khoảng trắng thừa
        if (keywords && keywords.trim() !== "") {
            const cleanKeyword = keywords.trim();
            sql += ` AND (m.TenMH LIKE ? OR m.ThongTinChiTiet LIKE ?)`;
            params.push(`%${cleanKeyword}%`, `%${cleanKeyword}%`);
        }

        // 2. TÌM THEO GIÁ (Gom nhóm và lọc bằng HAVING)
        sql += ` GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai 
                 HAVING GiaThucTe BETWEEN ? AND ? 
                 ORDER BY GiaThucTe ASC 
                 LIMIT 5`; // Lấy 5 mẫu có giá thấp nhất trong khoảng khách tìm

        // 3. XỬ LÝ AN TOÀN CHO BIẾN GIÁ
        // Lỡ Frontend/Dialogflow truyền vào undefined hoặc 0, ta gán mặc định để SQL không bị lỗi
        const safeMinPrice = (minPrice && minPrice > 0) ? minPrice : 0;
        const safeMaxPrice = (maxPrice && maxPrice > 0) ? maxPrice : 999999999;
        
        params.push(safeMinPrice, safeMaxPrice);

        // Debug log để bạn dễ theo dõi trên Terminal khi Bot chạy
        // console.log("=> SQL tìm theo giá:", sql);
        // console.log("=> Tham số:", params);

        // 4. THỰC THI TRUY VẤN
        const [rows] = await pool.query(sql, params);
        return rows;

    } catch (error) {
        console.error("❌ Lỗi ở hàm timSanPhamTheoGia:", error);
        return []; // Trả về mảng rỗng để bot báo "hết hàng" thay vì làm sập cả Backend
    }
};

const timSanPhamTheoDanhMuc = async (danhMuc) => {
    try {
        let sql = `
            SELECT m.MaMoHinh, m.TenMH, m.TrangThai, 
                   (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh,
                   MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaThucTe
            FROM MoHinh m
            LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh
            LEFT JOIN DanhMuc d ON m.MaDM = d.MaDM   -- ĐÃ SỬA THÀNH BẢNG DanhMuc VÀ CỘT MaDM
            WHERE d.TenDM LIKE ?                     -- ĐÃ SỬA THÀNH CỘT TenDM
        `;
        const params = [];

        if (danhMuc && danhMuc.trim() !== "") {
            const cleanDanhMuc = danhMuc.trim();
            params.push(`%${cleanDanhMuc}%`);
        }

        sql += ` GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai 
                 ORDER BY m.MaMoHinh DESC 
                 LIMIT 5`; // Lấy 5 sản phẩm mới nhất của danh mục

        const [rows] = await pool.query(sql, params);
        return rows;
    } catch (error) {
        console.error("❌ Lỗi ở hàm timSanPhamTheoDanhMuc:", error);
        return [];
    }
};

const traCuuDonHang = async (phone, maDH) => {
    try {
        let sql = `
            SELECT MaDH, TrangThaiDonHang, NgayLapDon, ThanhTien, TenNguoiNhan, DiaChiGiao 
            FROM donhang 
            WHERE 1=1 
        `;
        let params = [];

        // Ưu tiên 1: Tìm chính xác theo Mã Đơn Hàng
        if (maDH) {
            sql += ` AND MaDH = ? `;
            params.push(maDH);
        } 
        // Ưu tiên 2: Tìm theo Số điện thoại (lấy đơn mới nhất)
        else if (phone) {
            sql += ` AND SDTNguoiNhan LIKE ? `;
            params.push(`%${phone}%`);
        }

        sql += ` ORDER BY NgayLapDon DESC LIMIT 1`;

        const [rows] = await pool.query(sql, params);
        return rows[0]; 

    } catch (error) {
        console.error("❌ Lỗi ở hàm traCuuDonHang:", error);
        return null;
    }
};

const traCuuBaoHanh = async (phone) => {
    const sql = `
        SELECT DH.MaDH, M.TenMH, CBH.NgayBatDau, CBH.NgayKetThuc 
        FROM DonHang DH 
        JOIN BaoHanh BH ON DH.MaDH = BH.MaDH 
        JOIN ChiTietBaoHanh CBH ON BH.MaPBH = CBH.MaPBH 
        JOIN Phanloai P ON CBH.MaMoHinh = P.MaPhanLoai 
        JOIN MoHinh M ON P.MaMoHinh = M.MaMoHinh
        WHERE DH.SDTNguoiNhan LIKE ?
    `;
    const [rows] = await pool.query(sql, [`%${phone}%`]);
    return rows;
};
const laySanPhamKhuyenMai = async () => {
    try {
        // LƯU Ý: Nếu bảng KhuyenMai của bạn dùng cột 'NgayBatDau' và 'NgayKetThuc' 
        // thì hãy sửa chữ 'ThoiGianKT' và 'ThoiGianBD' ở dòng WHERE bên dưới nhé.
        const sql = `
            SELECT 
                m.MaMoHinh, 
                m.TenMH, 
                m.TrangThai, 
                (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh,
                km.TenKM, 
                ctkm.ChietKhau,
                MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaGoc,
                (MIN(COALESCE(p.DonGia, m.DonGia)) - (MIN(COALESCE(p.DonGia, m.DonGia)) * ctkm.ChietKhau / 100)) AS GiaThucTe
            FROM KhuyenMai km
            JOIN ChiTietKhuyenMai ctkm ON km.MaKM = ctkm.MaKM
            JOIN MoHinh m ON ctkm.MaMoHinh = m.MaMoHinh
            LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh
            WHERE km.ThoiGianKT >= NOW() AND km.ThoiGianBD <= NOW()
            GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai, km.TenKM, ctkm.ChietKhau
            ORDER BY GiaThucTe ASC
            LIMIT 5
        `;
        const [rows] = await pool.query(sql);
        return rows;
    } catch (error) {
        console.error("❌ Lỗi ở hàm laySanPhamKhuyenMai:", error);
        return []; 
    }
};
const layKhuyenMaiHienTai = async () => {
    const sql = `
        SELECT TenKM, DieuKien, ThoiGianKT 
        FROM KhuyenMai 
        WHERE ThoiGianKT >= NOW() AND ThoiGianBD <= NOW() 
        LIMIT 3
    `;
    const [rows] = await pool.query(sql);
    return rows;
};

const timSanPhamTheoTen = async (keywords) => {
    try {
        let sql = `
            SELECT m.MaMoHinh, m.TenMH, m.TrangThai, 
                   (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh,
                   MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaThucTe
            FROM MoHinh m
            LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh
            WHERE 1=1
        `;
        const params = [];

        if (keywords && keywords.trim() !== "") {
            const cleanKeyword = keywords.trim();
            sql += ` AND (m.TenMH LIKE ? OR m.ThongTinChiTiet LIKE ?)`;
            params.push(`%${cleanKeyword}%`, `%${cleanKeyword}%`);
        }

        sql += ` GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai 
                 ORDER BY m.MaMoHinh DESC 
                 LIMIT 5`; // Chỉ lấy 5 sản phẩm mới nhất để tránh tràn khung chat

        const [rows] = await pool.query(sql, params);
        return rows;
    } catch (error) {
        console.error("❌ Lỗi ở hàm timSanPhamTheoTen:", error);
        return [];
    }
};

const taoDonHang = async (keywords, customerName, phone, address) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); 

        const checkKhoSql = `
            SELECT MH.MaMoHinh, MH.TenMH, PL.MaPhanLoai, PL.DonGia, PL.SoLuong 
            FROM MoHinh MH
            INNER JOIN Phanloai PL ON MH.MaMoHinh = PL.MaMoHinh
            WHERE MH.TenMH LIKE ? AND PL.SoLuong > 0
            LIMIT 1
        `;
        const [rowsSanPham] = await connection.query(checkKhoSql, [`%${keywords}%`]);

        if (rowsSanPham.length === 0) {
            await connection.rollback(); 
            return { success: false, message: `Dạ mẫu ${keywords} hiện đã hết hàng.` };
        }

        const sp = rowsSanPham[0];

        const insertDH = `
            INSERT INTO DonHang (NgayLapDon, TongTien, ThanhTien, TrangThaiDonHang, TenNguoiNhan, SDTNguoiNhan, DiaChiGiao)
            VALUES (NOW(), ?, ?, 'Chờ xử lý', ?, ?, ?)
        `;
        const [donHangResult] = await connection.query(insertDH, [sp.DonGia, sp.DonGia, customerName, phone, address]);
        const maDH = donHangResult.insertId;

        const insertCT = `INSERT INTO ChiTietDonHang (MaDH, MaMoHinh, SoLuong, DonGiaBan) VALUES (?, ?, 1, ?)`;
        await connection.query(insertCT, [maDH, sp.MaPhanLoai, sp.DonGia]); 

        const updateKho = `UPDATE Phanloai SET SoLuong = SoLuong - 1 WHERE MaPhanLoai = ?`;
        await connection.query(updateKho, [sp.MaPhanLoai]);

        await connection.commit();
        return { success: true, maDH, tenSP: sp.TenMH, gia: sp.DonGia };

    } catch (error) {
        await connection.rollback();
        console.error("Lỗi tạo đơn:", error);
        return { success: false, message: "Lỗi hệ thống khi tạo đơn." };
    } finally {
        connection.release(); 
    }
};
// =====================================================================
// HÀM DÙNG CHUNG: Để trên cùng của file (Dọn dẹp từ thừa)
// =====================================================================
function extractCharacterName(rawText) {
    if (!rawText) return "";
    let textTam = " " + rawText.toLowerCase() + " ";
    
    // Danh sách "từ cấm" siêu đầy đủ (bao gồm cả lỗi sai chính tả)
    const tuThua = [
        "tôi muốn mua", "mình muốn tìm", "cho mình xem", "có", "không", "nào", "mô hình", 
        "figure", "shop", "ơi", "dưới", "trên", "khoảng", "tầm", "giá", "triệu", "triêu", 
        "tr", "k", "ngàn", "nghìn", "rẻ", "củ", "đến", "từ", "và", "với", "hơn"
    ];
    
    tuThua.forEach(tu => {
        textTam = textTam.replace(new RegExp(" " + tu + " ", 'gi'), " "); 
    });
    
    textTam = textTam.replace(/[0-9\.]/g, ' '); // Quét sạch số
    return textTam.replace(/\s+/g, ' ').trim(); // Dọn dẹp khoảng trắng
}
module.exports = { chatWithAI };