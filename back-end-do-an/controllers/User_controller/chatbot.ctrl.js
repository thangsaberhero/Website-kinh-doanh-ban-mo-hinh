const { GoogleGenerativeAI } = require("@google/generative-ai");
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');
const pool = require('../../config/db');

//console.log("Key Gemini của tôi là:", process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sessionClient = new dialogflow.SessionsClient({
    keyFilename: path.join(__dirname, 'key.json')
});
const projectId = 'chatbotai-jw9s';

// =====================================================================
// 1. HÀM GỌI DIALOGFLOW (Đã fix lỗi bắt tham số an toàn 100%)
// =====================================================================
const phanLoaiBangDialogflow = async (userMessage, sessionId) => {
    try {
        const request = {
            session: sessionClient.projectAgentSessionPath(projectId, sessionId),
            queryInput: { text: { text: userMessage, languageCode: 'vi' } },
        };
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        // Xử lý an toàn: Dialogflow có thể trả về Object thường hoặc Struct (fields)
        const extractParam = (paramName) => {
            if (!result.parameters) return "";
            let p = result.parameters[paramName] || (result.parameters.fields && result.parameters.fields[paramName]);
            if (!p) return "";
            if (typeof p === 'string') return p;
            if (p.stringValue) return p.stringValue;
            if (Array.isArray(p)) return p.join(" ");
            if (p.listValue && p.listValue.values) return p.listValue.values.map(v => v.stringValue).join(" ");
            return "";
        };

        return {
            intent: result.intent ? result.intent.displayName : 'giao_tiep_co_ban',
            dfText: result.fulfillmentText || "",
            keywords: extractParam('keywords') || extractParam('danh_muc_sp') || extractParam('ten_san_pham'),
            phone: extractParam('phone'),
            Khoang_Gia: extractParam('Khoang_Gia'),
            DanhMuc: extractParam('danh_muc'),
            isFallback: result.intent?.displayName === 'Default Fallback Intent'
        };
    } catch (error) {
        console.error("Lỗi Dialogflow:", error);
        return { intent: "giao_tiep_co_ban", isFallback: true };
    }
};

// =====================================================================
// 2. HÀM XỬ LÝ CHÍNH CỦA CHATBOT
// =====================================================================
const chatWithAI = async (req, res) => {
    try {
        const { message, sessionId = uuid.v4() } = req.body;
        if (!message) return res.status(400).json({ message: "Tin nhắn không để trống" });

        const dfResult = await phanLoaiBangDialogflow(message, sessionId);
        let intentName = dfResult.intent.toLowerCase().trim();
        let textRaw = message.toLowerCase().trim();

        if (/(0[35789])([0-9]{8})/.test(textRaw) || /^\d{5,8}$/.test(textRaw)) {
            intentName = "tra_cuu_don_hang";
            dfResult.isFallback = false;
        } else if (/(dưới|trên|từ|khoảng|tầm|cỡ)\s*\d+|\d+(?:[\.,]\d+)?\s*(triệu|tr\b|k\b|ngàn|nghìn|củ)/.test(textRaw)) {
            intentName = "tu_van_theo_gia";
            dfResult.isFallback = false;
        }

        if (["giao_tiep_co_ban", "default welcome intent"].includes(intentName)) {
            const finalMsg = dfResult.dfText || "Dạ shop FigureCollect xin chào ạ! Bạn muốn tìm mô hình nào nè? 🥰";
            return res.status(200).json({ message: finalMsg, products: [] });
        }

        if (dfResult.isFallback) {
            const promptFallback = `Bạn là nhân viên shop mô hình. Khách nói: "${message}". Đáp lại 1-2 câu thân thiện, lái họ về việc mua mô hình. Tuyệt đối không bịa sản phẩm.`;
            const fallbackResult = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent(promptFallback);
            return res.status(200).json({ message: fallbackResult.response.text(), products: [] });
        }

        let dbData = [];
        let responseMessage = "";

        switch (intentName) {
            case "yeu_cau_gap_nhan_vien":                
            case "faq_chinh_sach_bao_hanh":
            case "faq_thanh_toan":
            case "faq_van_chuyen":
            case "huong_dan_bao_quan_mo_hinh":
            case "huong_dan_mua_hang":
                responseMessage = dfResult.dfText || "Dạ bạn vui lòng xem chi tiết trên website của shop nha!";
                break;

                case "kiem_tra_ton_kho": {
                    let tenSanPham = extractCharacterName(dfResult.keywords || message);
                    if (!tenSanPham) {
                        responseMessage = "Dạ, bạn muốn kiểm tra tồn kho của mẫu mô hình nào ạ? Nhắn tên để shop check ngay nhé!";
                        break;
                    }
                    const dbResult = await checkInventory(tenSanPham);
                    if (!dbResult.success) {
                        responseMessage = "Dạ hệ thống tra cứu kho đang gặp chút sự cố, shop sẽ phản hồi lại bạn sau ạ!";
                    } else if (dbResult.found && parseInt(dbResult.data.TongSoLuong) > 0) {
                        responseMessage = `✅ CÒN HÀNG SẴN\nMẫu "${dbResult.data.TenMH}" hiện đang có sẵn ${dbResult.data.TongSoLuong} sản phẩm. Bạn thêm vào giỏ hàng ngay nhé!`;
                    } else if (dbResult.found) {
                        responseMessage = `❌ TẠM HẾT HÀNG\nRất tiếc, mẫu "${dbResult.data.TenMH}" hiện tại vừa hết hàng ạ.`;
                    } else {
                        responseMessage = `⚠️ CHƯA RÕ\nDạ shop chưa tìm thấy mẫu nào có tên "${tenSanPham}". Bạn vui lòng kiểm tra lại tên nhé!`;
                    }
                    break;
                }

            // ĐÃ BỎ THẺ <B> TRÁNH LỖI FRONTEND ẨN CHỮ
            case "hoi_thong_tin_san_pham": {
                let keywordTen = extractCharacterName(dfResult.keywords || message);
                if (!keywordTen) {
                    responseMessage = "Dạ bạn đang muốn tìm mô hình của nhân vật nào ạ? 🤔";
                    break;
                }
                dbData = await timSanPhamTheoTen(keywordTen);
                responseMessage = dbData.length > 0 ? `Dạ các mẫu "${keywordTen}" đây ạ 👇` : `Dạ shop tạm hết mẫu "${keywordTen}" rồi ạ.`;
                break;
            }

            case "tim_theo_danh_muc": {
                let danhMuc = dfResult.DanhMuc;
                if (!danhMuc) {
                    responseMessage = "Dạ bạn muốn xem danh mục nào ạ? 😊";
                    break;
                }
                dbData = await timSanPhamTheoDanhMuc(danhMuc);
                responseMessage = dbData.length > 0 ? `Dạ các mẫu thuộc danh mục "${danhMuc}" đây ạ 👇` : `Dạ danh mục "${danhMuc}" đang tạm hết hàng.`;
                break;
            }

            case "tu_van_theo_gia": {
                // 1. Gọi hàm phân tích giá và tên nhân vật
                const { minPrice, maxPrice, keyword } = parsePriceAndKeyword(message, dfResult.keywords);
                
                // 2. Truy vấn Database
                dbData = await timSanPhamTheoGia(keyword, minPrice, maxPrice);

                // 3. Tạo câu phản hồi linh hoạt theo mức giá khách hỏi
                let textKhoangGia = "";
                if (maxPrice === 999999999) textKhoangGia = `trên ${minPrice.toLocaleString('vi-VN')}đ`;
                else if (minPrice === 0) textKhoangGia = `dưới ${maxPrice.toLocaleString('vi-VN')}đ`;
                else textKhoangGia = `từ ${minPrice.toLocaleString('vi-VN')}đ đến ${maxPrice.toLocaleString('vi-VN')}đ`;

                let textNhanVat = keyword ? ` của nhân vật "${keyword}"` : "";

                if (dbData.length > 0) {
                    responseMessage = `Dạ shop tìm thấy các mẫu${textNhanVat} có mức giá ${textKhoangGia} phù hợp với yêu cầu của bạn đây ạ 👇`;
                } else {
                    responseMessage = `Dạ tiếc quá, hiện tại shop không có mẫu nào${textNhanVat} trong tầm giá ${textKhoangGia} ạ. Bạn có muốn xem thử khoảng giá khác không? 😅`;
                }
                break;
            }

            case "hoi_khuyen_mai": {
                dbData = await laySanPhamKhuyenMai();
                responseMessage = dbData.length > 0 ? `Dạ shop đang có chương trình giảm giá cho các mẫu hot dưới đây 👇` : `Dạ cửa hàng đang tạm hết chương trình khuyến mại ạ!`;
                break;
            }
            case "hoi_danh_gia_san_pham": {
                let tenSanPham = extractCharacterName(dfResult.keywords || message);
                
                if (!tenSanPham) {
                    responseMessage = "Dạ, bạn muốn xem đánh giá của mẫu mô hình nào ạ? Nhắn tên để shop lấy review cho bạn nhé!";
                    break;
                }

                const dbReview = await getProductReviews(tenSanPham);

                if (!dbReview.success) {
                    responseMessage = "Dạ hệ thống tải đánh giá đang gặp sự cố, bạn thử lại sau nhé!";
                } else if (!dbReview.found) {
                    responseMessage = `Dạ mẫu "${tenSanPham}" hiện chưa có khách hàng nào để lại đánh giá. Nhưng bạn yên tâm, hàng của shop luôn đảm bảo chất lượng 100% ạ!`;
                } else {
                    // Render danh sách các bình luận ra HTML
                    let htmlReviews = '';
                    dbReview.data.reviews.forEach(rv => {
                        let stars = '★'.repeat(rv.SoSao) + '☆'.repeat(5 - rv.SoSao);
                        
                        // Chuyển đổi ngày tháng cho đẹp
                        let dateObj = new Date(rv.ThoiGianDG);
                        let dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
                        
                        htmlReviews += `
                            <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span style="font-weight: bold; color: #2980b9; font-size: 14px;">Khách hàng</span>
                                    <span style="color: #f1c40f; font-size: 12px;">${stars}</span>
                                </div>
                                <div style="font-size: 11px; color: #bdc3c7; margin-bottom: 5px;">Ngày: ${dateStr}</div>
                                <div style="font-style: italic; font-size: 14px; margin-bottom: 8px;">"${rv.NoiDung}"</div>
                            </div>
                        `;
                    });

                    // Ghép vào khung UI tổng
                    responseMessage = `
                    <div style="background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); font-family: sans-serif; color: #333; line-height: 1.6;">
                        <div style="text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 20px;">
                            <h3 style="color: #2c3e50; font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase;">Đánh Giá: ${dbReview.data.tenMoHinh}</h3>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; background: #ecf0f1; padding: 15px; border-radius: 10px; margin-bottom: 25px;">
                            <div>
                                <span style="font-size: 28px; font-weight: bold; color: #e67e22;">${dbReview.data.avgScore}</span> <span style="font-size: 14px;">/ 5</span>
                                <div style="color: #7f8c8d; font-size: 12px;">Từ ${dbReview.data.totalReviews} lượt đánh giá</div>
                            </div>
                            <div style="text-align: right; font-size: 12px;">
                                <div style="color: #27ae60; font-weight: bold;">✔ Hàng chuẩn 100%</div>
                            </div>
                        </div>

                        <div style="font-weight: bold; margin-bottom: 10px; color: #3498db;">⭐ Nhận xét gần đây</div>
                        ${htmlReviews}
                    </div>
                    `;
                }
                break;
            }
            case "tra_cuu_don_hang": {
                console.log("=> Bắt đầu tra cứu đơn hàng và bảo hành...");
                let msgText = message.toLowerCase();
                let sdt = null;
                let maDon = null;

                // 1. Quét SĐT
                let phoneMatch = msgText.match(/(0[35789])([0-9]{8})\b/);
                if (phoneMatch) sdt = phoneMatch[0];
                else sdt = dfResult.phone || null; 

                // 2. Quét Mã đơn
                let orderIdMatch = msgText.match(/(?:mã|đơn|mã đơn|số)\s*(\d{4,8})\b/i);
                if (orderIdMatch) maDon = orderIdMatch[1];
                if (!maDon && !sdt) {
                    let bareNumber = msgText.match(/\b\d{5,8}\b/);
                    if (bareNumber) maDon = bareNumber[0];
                }

                if (sdt || maDon) {
                    // TÌM ĐƠN HÀNG
                    const donHang = await traCuuDonHang(sdt, maDon);

                    if (donHang) {
                        let ngayLap = new Date(donHang.NgayLapDon).toLocaleDateString('vi-VN');
                        let thanhTien = donHang.ThanhTien ? Number(donHang.ThanhTien).toLocaleString('vi-VN') + 'đ' : 'Chưa cập nhật';

                        // TÌM THÊM THÔNG TIN BẢO HÀNH DỰA VÀO MÃ ĐƠN HÀNG ĐÃ TÌM THẤY
                        const listBaoHanh = await traCuuBaoHanhTheoMaDH(donHang.MaDH);
                        let htmlBaoHanh = "";

                        // Nếu đơn hàng này có bảo hành, render thêm HTML cho phần bảo hành
                        if (listBaoHanh && listBaoHanh.length > 0) {
                            htmlBaoHanh = `<div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
                                <b style="color: #10b981;">🛡️ THÔNG TIN BẢO HÀNH:</b><br>`;
                            
                            listBaoHanh.forEach(bh => {
                                let ngayBD = new Date(bh.NgayBatDau).toLocaleDateString('vi-VN');
                                let ngayKT = new Date(bh.NgayKetThuc).toLocaleDateString('vi-VN');
                                htmlBaoHanh += `
                                    <div style="margin-top: 5px; font-size: 14px;">
                                        - <b>${bh.TenMH}</b><br>
                                        <span style="color: #666; font-size: 13px;">(Từ ${ngayBD} đến <b style="color: #dc3545;">${ngayKT}</b>)</span>
                                    </div>`;
                            });
                            htmlBaoHanh += `</div>`;
                        } else {
                            htmlBaoHanh = `<div style="margin-top: 10px; font-size: 13px; color: #888;"><i>* Đơn hàng này không có sản phẩm kèm bảo hành.</i></div>`;
                        }

                        // TRẢ KẾT QUẢ GỘP
                        responseMessage = `
                            Dạ, shop tìm thấy thông tin đơn hàng của bạn rồi ạ:<br><br>
                            📦 <b>Mã đơn:</b> ${donHang.MaDH}<br>
                            👤 <b>Người nhận:</b> ${donHang.TenNguoiNhan || 'Khách hàng'}<br>
                            📅 <b>Ngày đặt:</b> ${ngayLap}<br>
                            💰 <b>Tổng tiền:</b> ${thanhTien}<br>
                            🚚 <b>Trạng thái:</b> <span style="color: #ff6b6b; font-weight: bold;">${donHang.TrangThaiDonHang}</span><br>
                            📍 <b>Địa chỉ:</b> ${donHang.DiaChiGiao || 'Chưa cập nhật'}<br>
                            
                            ${htmlBaoHanh}

                            <!-- <br>👉 <a href="/order-history" target="_blank" style="color: #4facfe; text-decoration: underline; font-weight: bold;">Nhấn vào đây để xem chi tiết lịch sử mua hàng nhé!</a> -->
                        `;
                    } else {
                        responseMessage = `Dạ shop không tìm thấy đơn hàng nào khớp với thông tin <b>${sdt || maDon}</b> ạ. Bạn kiểm tra lại giúp shop nha! 😅`;
                    }
                } else {
                    responseMessage = "Dạ, để kiểm tra đơn hàng và bảo hành, bạn cho shop xin <b>Số điện thoại</b> hoặc <b>Mã đơn hàng</b> nhé! 👇";
                }
                break;
            }

            default:
                responseMessage = dfResult.dfText || "Dạ hệ thống đang xử lý yêu cầu ạ!";
                break;
        }
        
        return res.status(200).json({ message: responseMessage, products: dbData });

    } catch (error) {
        console.error("Lỗi Chatbot Controller:", error);
        return res.status(500).json({ message: "Dạ hệ thống đang quá tải một chút, bạn thử lại sau nhé!" });
    }
};

// =====================================================================
// 3. CÁC HÀM TRUY VẤN DATABASE MYSQL
// =====================================================================
const checkInventory = async (tenSanPham) => {
    try {
        // Đã sửa: JOIN -> LEFT JOIN và SUM(...) -> COALESCE(SUM(...), 0)
        const sql = `SELECT mh.MaMoHinh, mh.TenMH, COALESCE(SUM(pl.SoLuong), 0) AS TongSoLuong 
                     FROM MoHinh mh 
                     LEFT JOIN Phanloai pl ON mh.MaMoHinh = pl.MaMoHinh 
                     WHERE mh.TenMH LIKE ? 
                     GROUP BY mh.MaMoHinh, mh.TenMH 
                     LIMIT 1`;
                     
        // Tham số truyền vào đã có sẵn %% để tìm kiếm gần đúng
        const [rows] = await pool.query(sql, [`%${tenSanPham}%`]);
        
        return rows.length > 0 
            ? { success: true, found: true, data: rows[0] } 
            : { success: true, found: false, data: null };
            
    } catch (error) {
        console.error("Lỗi SQL checkInventory:", error);
        return { success: false, found: false, data: null };
    }
}; 

const timSanPhamTheoTen = async (keywords) => {
    try {
        const sql = `SELECT m.MaMoHinh, m.TenMH, m.TrangThai, (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh, MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaThucTe 
                     FROM MoHinh m LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh WHERE m.TenMH LIKE ? OR m.ThongTinChiTiet LIKE ? 
                     GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai ORDER BY m.MaMoHinh DESC LIMIT 5`;
        const [rows] = await pool.query(sql, [`%${keywords.trim()}%`, `%${keywords.trim()}%`]);
        return rows;
    } catch (error) { 
        console.error("Lỗi timSanPhamTheoTen:", error);
        return []; 
    }
};

const timSanPhamTheoDanhMuc = async (danhMuc) => {
    try {
        const sql = `SELECT m.MaMoHinh, m.TenMH, m.TrangThai, (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh, MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaThucTe 
                     FROM MoHinh m LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh LEFT JOIN DanhMuc d ON m.MaDM = d.MaDM WHERE d.TenDM LIKE ? 
                     GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai ORDER BY m.MaMoHinh DESC LIMIT 5`;
        const [rows] = await pool.query(sql, [`%${danhMuc.trim()}%`]);
        return rows;
    } catch (error) { return []; }
};

const timSanPhamTheoGia = async (keywords, minPrice, maxPrice) => {
    try {
        let sql = `SELECT m.MaMoHinh, m.TenMH, m.TrangThai, (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh, MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaThucTe 
                   FROM MoHinh m LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh WHERE 1=1`;
        let params = [];
        if (keywords) { sql += ` AND (m.TenMH LIKE ?)`; params.push(`%${keywords.trim()}%`); }
        sql += ` GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai HAVING GiaThucTe BETWEEN ? AND ? ORDER BY GiaThucTe ASC LIMIT 5`;
        params.push(minPrice || 0, maxPrice || 999999999);
        const [rows] = await pool.query(sql, params);
        return rows;
    } catch (error) { return []; }
};

const traCuuDonHang = async (phone, maDH) => {
    try {
        let sql = `SELECT MaDH, TrangThaiDonHang, NgayLapDon, ThanhTien, TenNguoiNhan, DiaChiGiao FROM donhang WHERE 1=1`;
        let params = [];
        if (maDH) { sql += ` AND MaDH = ?`; params.push(maDH); }
        else if (phone) { sql += ` AND SDTNguoiNhan LIKE ?`; params.push(`%${phone}%`); }
        sql += ` ORDER BY NgayLapDon DESC LIMIT 1`;
        const [rows] = await pool.query(sql, params);
        return rows[0];
    } catch (error) { return null; }
};

const traCuuBaoHanhTheoMaDH = async (maDH) => {
    try {
        const sql = `SELECT M.TenMH, CBH.NgayBatDau, CBH.NgayKetThuc FROM BaoHanh BH JOIN ChiTietBaoHanh CBH ON BH.MaPBH = CBH.MaPBH 
                     JOIN Phanloai P ON CBH.MaMoHinh = P.MaPhanLoai JOIN MoHinh M ON P.MaMoHinh = M.MaMoHinh WHERE BH.MaDH = ?`;
        const [rows] = await pool.query(sql, [maDH]);
        return rows;
    } catch (error) { return []; }
};

const laySanPhamKhuyenMai = async () => {
    try {
        const sql = `SELECT m.MaMoHinh, m.TenMH, m.TrangThai, (SELECT LinkAnh FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh LIMIT 1) AS LinkAnh, 
                     km.TenKM, ctkm.ChietKhau, MIN(COALESCE(p.DonGia, m.DonGia)) AS GiaGoc, (MIN(COALESCE(p.DonGia, m.DonGia)) - (MIN(COALESCE(p.DonGia, m.DonGia)) * ctkm.ChietKhau / 100)) AS GiaThucTe 
                     FROM KhuyenMai km JOIN ChiTietKhuyenMai ctkm ON km.MaKM = ctkm.MaKM JOIN MoHinh m ON ctkm.MaMoHinh = m.MaMoHinh 
                     LEFT JOIN Phanloai p ON m.MaMoHinh = p.MaMoHinh WHERE km.ThoiGianKT >= NOW() AND km.ThoiGianBD <= NOW() 
                     GROUP BY m.MaMoHinh, m.TenMH, m.TrangThai, km.TenKM, ctkm.ChietKhau ORDER BY GiaThucTe ASC LIMIT 5`;
        const [rows] = await pool.query(sql);
        return rows;
    } catch (error) { return []; }
};

// =====================================================================
// 4. HÀM TIỆN ÍCH LỌC TỪ THỪA (Đã fix lỗi regex khoảng trắng)
// =====================================================================
function extractCharacterName(rawText) {
    if (!rawText || typeof rawText !== 'string') return "";
    let textTam = " " + rawText.toLowerCase().replace(/\s+/g, ' ') + " ";
    
    // Đã bổ sung đẩy đủ họ hàng hang hốc nhà "tồn kho", "còn hàng" vào đây:
    const tuThua = [
    // 1. Nhóm từ khóa hành động/yêu cầu
    "cho tôi xem", "cho mình xem", "tôi muốn mua", "mình muốn tìm", "cho tôi", "cho mình", 
    "đánh giả sản phẩm", "đánh giá sản phẩm", "đánh giá", "review", "nhận xét", "kiểm tra", 
    "check", "tồn kho", "còn hàng", "còn sẵn", "tìm", "kiếm", "tư vấn", "gợi ý", "đặt hàng", 
    "đặt", "order", "ship", "giao", "hỏi", "mua", "bán", "lấy", "đọc", "xem", "xin",

    // 2. Nhóm danh từ/chỉ báo loại sản phẩm
    "mô hình", "sản phẩm", "sp", "đồ chơi", "món", "figure", "mẫu", "bé", "con", "chiếc", 
    "cái", "dòng", "nhân vật", "loại", "bản", "hàng", "chất lượng", "thực tế", 

    // 3. Nhóm từ liên quan đến giá cả/so sánh
    "dưới", "trên", "khoảng", "tầm", "cỡ", "chừng", "giá", "triệu", "triêu", "tr", "k", 
    "ngàn", "nghìn", "rẻ", "củ", "đến", "từ", "hơn", "đắt", "max", "min",

    // 4. Nhóm tính từ/trạng thái phổ biến
    "còn không", "còn ko", "còn", "có", "không", "ko", "đẹp", "xịn", "mới", "cũ", "hot", 
    "to", "nhỏ", "mini", "bự", "chính hãng", "real", "fake", "chuẩn",

    // 5. Nhóm đại từ/nhân xưng/chào hỏi
    "shop", "ơi", "tôi", "mình", "bạn", "anh", "chị", "em", "thằng", "ad", "admin", "khách", 
    "người", "chào", "hi", "hello", "alo", "dạ", "ạ",

    // 6. Nhóm từ đệm/từ nối/cảm thán
    "của", "cho", "muốn", "sao", "nào", "và", "với", "về", "các", "nhé", "nha", "nè", 
    "đi", "thế", "vậy", "hả", "những", "một", "vài", "đang", "đã", "sẽ", "thì", "là", "mà"
];
    
    tuThua.forEach(tu => { 
        textTam = textTam.replace(new RegExp(" " + tu + " ", 'gi'), " "); 
    });
    
    return textTam.replace(/[0-9\.]/g, ' ').replace(/[?!,\.]/g, ' ').replace(/\s+/g, ' ').trim();
}
const getProductReviews = async (tenSanPham) => {
    try {
        // Đã sửa "dg.," thành "dg.*" (hoặc chỉ đích danh các cột cần thiết)
        const sql = `
            SELECT dg.MaDG, dg.NoiDung, dg.SoSao, dg.ThoiGianDG, mh.TenMH 
            FROM DanhGia dg
            JOIN MoHinh mh ON dg.MaMoHinh = mh.MaMoHinh
            WHERE mh.TenMH LIKE ?
            ORDER BY dg.ThoiGianDG DESC
        `;
        const [rows] = await pool.query(sql, [`%${tenSanPham}%`]);
        
        if (rows.length === 0) return { success: true, found: false, data: null };

        // Đã sửa DiemDG thành SoSao
        const totalReviews = rows.length;
        const avgScore = (rows.reduce((sum, row) => sum + row.SoSao, 0) / totalReviews).toFixed(1);
        const tenMoHinhChuẩn = rows[0].TenMH;

        return { 
            success: true, 
            found: true, 
            data: {
                tenMoHinh: tenMoHinhChuẩn,
                totalReviews: totalReviews,
                avgScore: avgScore,
                reviews: rows.slice(0, 3) // Chỉ lấy 3 đánh giá mới nhất
            } 
        };
    } catch (error) {
        console.error("Lỗi SQL getProductReviews:", error);
        return { success: false, found: false, data: null };
    }
};
// =====================================================================
// 5. HÀM PHÂN TÍCH GIÁ TIỀN & LỌC TÊN SẢN PHẨM (MỚI XÂY DỰNG LẠI)
// =====================================================================
const parsePriceAndKeyword = (text, dfKeyword) => {
    let minPrice = 0;
    let maxPrice = 999999999;
    let rawText = text.toLowerCase();

    // Biểu thức chính quy bắt giá tiền: VD: 1.5 triệu, 2 củ rưỡi, 500 k
    // Bắt các con số, đơn vị (triệu, tr, củ, k, ngàn, nghìn) và từ khóa "rưỡi"
    const priceRegex = /(\d+(?:[\.,]\d+)?)\s*(triệu|tr\b|củ|k\b|ngàn|nghìn)(?:\s+(rưỡi))?/g;
    
    // Hàm con để tính toán giá trị thực
    const calcValue = (matchObj) => {
        let val = parseFloat(matchObj[1].replace(',', '.'));
        let unit = matchObj[2];
        let isRuoi = matchObj[3] === 'rưỡi';

        if (['triệu', 'tr', 'củ'].includes(unit)) {
            val *= 1000000;
            if (isRuoi) val += 500000;
        } else if (['k', 'ngàn', 'nghìn'].includes(unit)) {
            val *= 1000;
            if (isRuoi) val += 500;
        }
        return val;
    };

    let matches = [...rawText.matchAll(priceRegex)];
    
    if (matches.length === 2 && rawText.includes('từ') && (rawText.includes('đến') || rawText.includes('-'))) {
        // Trường hợp: "từ 500k đến 1 củ"
        let price1 = calcValue(matches[0]);
        let price2 = calcValue(matches[1]);
        minPrice = Math.min(price1, price2);
        maxPrice = Math.max(price1, price2);
    } else if (matches.length > 0) {
        let price = calcValue(matches[0]);
        
        if (/(dưới|nhỏ hơn|tối đa|max)\s*\d+/.test(rawText)) {
            // Trường hợp: "dưới 1 triệu"
            maxPrice = price;
        } else if (/(trên|lớn hơn|từ|hơn|min)\s*\d+/.test(rawText)) {
            // Trường hợp: "trên 500k"
            minPrice = price;
        } else if (/(khoảng|tầm|cỡ|chừng)\s*\d+/.test(rawText)) {
            // Trường hợp: "khoảng 1 triệu" -> Tìm xung quanh mức giá đó (± 30%)
            minPrice = price * 0.7;
            maxPrice = price * 1.3;
        } else {
            // Khách chỉ nói khơi khơi "1 triệu" -> Mặc định hiểu là "khoảng 1 triệu"
            minPrice = price * 0.7;
            maxPrice = price * 1.3;
        }
    }

    // Xóa các cụm từ liên quan đến giá để không bị dính vào tên nhân vật
    // VD: "mô hình luffy dưới 1 triệu rưỡi" -> "mô hình luffy"
    let cleanText = rawText
        .replace(/từ\s*\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn)(?:\s+rưỡi)?\s*(đến|-)\s*\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn)(?:\s+rưỡi)?/g, '')
        .replace(/(dưới|trên|từ|khoảng|tầm|cỡ|hơn)\s*\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn)(?:\s+rưỡi)?/g, '')
        .replace(/\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn)(?:\s+rưỡi)?/g, '')
        .trim();

    // Lấy tên nhân vật. Nếu Dialogflow có bắt được keyword thì ưu tiên, không thì dùng cleanText.
    let keyword = extractCharacterName(dfKeyword || cleanText);

    return { minPrice, maxPrice, keyword };
};
module.exports = { chatWithAI };