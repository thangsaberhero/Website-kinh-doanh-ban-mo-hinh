const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");
const pool = require("../../config/db");

try {
    require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });
} catch (_) {
    // dotenv có thể đã được load ở file server/app chính.
}

// ======================================================
// 1. DIALOGFLOW AUTH
// ======================================================
const loadDialogflowCredentials = () => {
    const localFiles = [path.join(__dirname, "key.json"), path.join(__dirname, "key(1).json")];

    const parseJson = (raw) => {
        const credentials = JSON.parse(raw);
        if (!credentials.project_id || !credentials.client_email || !credentials.private_key) {
            throw new Error("Credential Dialogflow thiếu project_id/client_email/private_key");
        }
        credentials.private_key = String(credentials.private_key).replace(/\\n/g, "\n");
        return credentials;
    };

    const fromCredentials = (credentials, source) => ({
        source,
        config: {
            credentials,
            projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
        },
        projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
    });

    try {
        if (process.env.NODE_ENV !== "production") {
            for (const filePath of localFiles) {
                if (fs.existsSync(filePath)) {
                    const credentials = parseJson(fs.readFileSync(filePath, "utf8"));
                    return {
                        source: `local file: ${filePath}`,
                        config: {
                            keyFilename: filePath,
                            projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
                        },
                        projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
                    };
                }
            }
        }

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
            const raw = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, "base64").toString("utf8");
            return fromCredentials(parseJson(raw), "env GOOGLE_APPLICATION_CREDENTIALS_BASE64");
        }

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
            return fromCredentials(parseJson(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON), "env GOOGLE_APPLICATION_CREDENTIALS_JSON");
        }

        if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
            const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const credentials = parseJson(fs.readFileSync(filePath, "utf8"));
            return {
                source: `env GOOGLE_APPLICATION_CREDENTIALS file: ${filePath}`,
                config: {
                    keyFilename: filePath,
                    projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
                },
                projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
            };
        }

        for (const filePath of localFiles) {
            if (fs.existsSync(filePath)) {
                const credentials = parseJson(fs.readFileSync(filePath, "utf8"));
                return {
                    source: `fallback local file: ${filePath}`,
                    config: {
                        keyFilename: filePath,
                        projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
                    },
                    projectId: process.env.DIALOGFLOW_PROJECT_ID || credentials.project_id
                };
            }
        }
    } catch (error) {
        console.error("Lỗi đọc cấu hình Dialogflow:", error.message || error);
    }

    console.warn("⚠️ Chưa tìm thấy credential Dialogflow hợp lệ.");
    return {
        source: "none",
        config: {},
        projectId: process.env.DIALOGFLOW_PROJECT_ID || "chatbotai-jw9s"
    };
};

const dialogflowAuth = loadDialogflowCredentials();
const sessionClient = new dialogflow.SessionsClient(dialogflowAuth.config);
const intentsClient = new dialogflow.IntentsClient(dialogflowAuth.config);
const projectId = dialogflowAuth.projectId;

console.log("Dialogflow credential source:", dialogflowAuth.source);
console.log("Dialogflow projectId:", projectId);

// ======================================================
// 2. REGEX / INTENT CONFIG
// ======================================================
const PHONE_REGEX = /\b(0[35789])([0-9]{8})\b/;
const PRICE_REGEX = /(dưới|duoi|trên|tren|từ|tu|khoảng|khoang|tầm|tam|cỡ|co|chừng|chung|nhỏ hơn|nho hon|lớn hơn|lon hon|tối đa|toi da|max|min)\s*\d+|\d+(?:[\.,]\d+)?\s*(triệu|tr\b|k\b|ngàn|nghìn|ngan|nghin|củ|cu)/i;
const SHOPPING_INTENT_REGEX = /(mua|muốn|muon|tìm|tim|xem|tham khảo|tham khao|tư vấn|tu van|gợi ý|goi y|có mẫu|co mau|còn mẫu|con mau|mô hình|mo hinh|figure|sản phẩm|san pham|sp|nhân vật|nhan vat|anime|quà|qua|tặng|tang|mẫu|mau|dòng|dong|loại|loai|danh mục|danh muc)/i;
const ORDER_INTENT_REGEX = /(mã đơn|ma don|đơn hàng|don hang|order|tra cứu|tra cuu|kiểm tra đơn|kiem tra don|mã dh|ma dh|madon|vận đơn|van don)/i;
const BARE_ORDER_ID_REGEX = /^\d{5,8}$/;

const STATIC_RULES = [
    ["yeu_cau_gap_nhan_vien", /(nhân viên|nhan vien|tư vấn viên|tu van vien|admin|người thật|nguoi that|gặp shop|gap shop|liên hệ shop|lien he shop|hỗ trợ trực tiếp|ho tro truc tiep)/i],
    ["faq_thanh_toan", /(thanh toán|thanh toan|online|chuyển khoản|chuyen khoan|cod|visa|momo|zalopay|vnpay|quẹt thẻ|quet the|trả tiền|tra tien|phương thức thanh toán|phuong thuc thanh toan|trả góp|tra gop)/i],
    ["faq_van_chuyen", /(vận chuyển|van chuyen|giao hàng|giao hang|ship|phí ship|phi ship|bao lâu nhận|bao lau nhan|thời gian giao|thoi gian giao|đơn vị vận chuyển|don vi van chuyen)/i],
    ["faq_chinh_sach_bao_hanh", /(bảo hành|bao hanh|đổi trả|doi tra|hoàn tiền|hoan tien|lỗi sản phẩm|loi san pham|hỏng|hong|vỡ|vo|bể|be)/i],
    ["huong_dan_bao_quan_mo_hinh", /(bảo quản|bao quan|vệ sinh|ve sinh|lau bụi|lau bui|trưng bày|trung bay)/i],
    ["huong_dan_su_dung_blockchain", /(blockchain|truy xuất|truy xuat|xác thực|xac thuc|nguồn gốc|nguon goc|mã qr|ma qr|qr code|quét qr|quet qr|txhash|tx hash|transaction|mã giao dịch|ma giao dich|sepolia|smart contract|hợp đồng thông minh|hop dong thong minh|lịch sử blockchain|lich su blockchain|hướng dẫn.*blockchain|huong dan.*blockchain|cách.*blockchain|cach.*blockchain|cách truy xuất|cach truy xuat)/i],
    ["huong_dan_mua_hang", /(mua hàng|mua hang|hướng dẫn.*mua|huong dan.*mua|cách mua|cach mua|cách đặt|cach dat|hướng dẫn.*đặt|huong dan.*dat|đặt hàng như thế nào|dat hang nhu the nao|đặt hàng|dat hang)/i]
];

const INVENTORY_REGEX = /(còn hàng|con hang|còn không|con khong|còn ko|con ko|tồn kho|ton kho|còn sẵn|con san|hết hàng|het hang|check hàng|check hang|kiểm tra hàng|kiem tra hang|check kho|kiem tra kho)/i;
const REVIEW_REGEX = /(đánh giá|danh gia|review|nhận xét|nhan xet|khách đánh giá|khach danh gia|có tốt không|co tot khong)/i;
const PROMOTION_REGEX = /(khuyến mãi|khuyen mai|giảm giá|giam gia|sale|ưu đãi|uu dai|voucher|mã giảm|ma giam)/i;
const HOT_PRODUCT_REGEX = /(sản phẩm hot|san pham hot|bán chạy|ban chay|bestseller|best seller|mẫu hot|mau hot|mẫu bán chạy|mau ban chay|mẫu nào hot|mau nao hot|mẫu nào bán chạy|mau nao ban chay|mô hình hot|mo hinh hot|figure hot|sản phẩm nổi bật|san pham noi bat|mô hình nổi bật|mo hinh noi bat|gợi ý.*(hot|bán chạy|ban chay|nổi bật|noi bat)|goi y.*(hot|ban chay|noi bat)|top.*(sản phẩm|san pham|mô hình|mo hinh|figure)|mua nhiều|mua nhieu|được mua nhiều|duoc mua nhieu|được yêu thích|duoc yeu thich)/i;

const CATEGORY_ALIASES = [
    { keys: ["gameprize", "game prize", "mô hình prize", "mo hinh prize", "prize figure"], value: "Gameprize" },
    { keys: ["mô hình scale", "mo hinh scale", "scale figure", "figure scale", "scale"], value: "Mô hình scale" },
    { keys: ["mô hình chibi", "mo hinh chibi", "chibi"], value: "Mô hình Chibi" },
    { keys: ["mô hình lắp ráp", "mo hinh lap rap", "lắp ráp", "lap rap", "model kit"], value: "Mô hình lắp ráp" },
    { keys: ["action figure", "figure cử động", "figure cu dong", "figma", "action"], value: "Action figure" },
    { keys: ["nendoroid nam", "nendo nam", "nedoroid nam"], value: "Nedoroid Nam" },
    { keys: ["nendoroid nữ", "nendoroid nu", "nendo nữ", "nendo nu"], value: "Nendoroid nữ" },
    { keys: ["nendoroid", "nendo", "nedoroid"], value: "Nendoroid" },
    { keys: ["pre-order 2026", "pre order 2026", "preorder 2026", "đặt trước 2026", "dat truoc 2026"], value: "Pre-order 2026" },
    { keys: ["pre-order 2027", "pre order 2027", "preorder 2027", "đặt trước 2027", "dat truoc 2027"], value: "Pre-order 2027" },
    { keys: ["pre-order", "pre order", "preorder", "đặt trước", "dat truoc"], value: "PRE-ORDER" },
    { keys: ["nhồi bông", "nhoi bong", "gấu bông", "gau bong"], value: "Nhồi bông" },
    { keys: ["phụ kiện", "phu kien", "phụ kiện khác", "phu kien khac"], value: "Phụ kiện khác" },
    { keys: ["mô hình", "mo hinh", "figure"], value: "Mô hình" }
];

const STATIC_DIALOGFLOW_INTENTS = new Set([
    "yeu_cau_gap_nhan_vien",
    "faq_thanh_toan",
    "faq_van_chuyen",
    "faq_chinh_sach_bao_hanh",
    "huong_dan_bao_quan_mo_hinh",
    "huong_dan_mua_hang",
    "huong_dan_su_dung_blockchain"
]);

const SQL_DIALOGFLOW_INTENTS = new Set([
    "kiem_tra_ton_kho",
    "hoi_thong_tin_san_pham",
    "tim_theo_danh_muc",
    "tu_van_theo_gia",
    "tra_cuu_don_hang",
    "hoi_khuyen_mai",
    "goi_y_san_pham_hot",
    "hoi_danh_gia_san_pham"
]);

const STATIC_FALLBACK_TEXT = {
    yeu_cau_gap_nhan_vien: "Dạ bạn vui lòng để lại nội dung cần hỗ trợ, shop sẽ chuyển cho nhân viên phản hồi sớm nhất ạ.",
    faq_thanh_toan: "Dạ bạn vui lòng xem thông tin thanh toán trên website hoặc thử lại sau ạ.",
    faq_van_chuyen: "Dạ bạn vui lòng xem thông tin vận chuyển trên website hoặc thử lại sau ạ.",
    faq_chinh_sach_bao_hanh: "Dạ bạn vui lòng xem chính sách bảo hành/đổi trả trên website hoặc gửi mã đơn để shop hỗ trợ ạ.",
    huong_dan_bao_quan_mo_hinh: "Dạ bạn vui lòng xem hướng dẫn bảo quản trên website hoặc thử lại sau ạ.",
    huong_dan_mua_hang: "Dạ bạn vui lòng xem hướng dẫn mua hàng trên website hoặc nhắn shop nếu cần hỗ trợ thêm ạ.",
    huong_dan_su_dung_blockchain: "Dạ bạn vào mục Truy xuất Blockchain, nhập mã truy xuất hoặc quét QR trên sản phẩm để kiểm tra nguồn gốc và lịch sử xác thực ạ."
};

// ======================================================
// 3. UTILS
// ======================================================
const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const compactHtmlResponse = (value = "") => String(value)
    .replace(/>\s+</g, "><")
    .replace(/\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const normalizeVietnamese = (value = "") => String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();

const normalizeIntentName = (value = "") => normalizeVietnamese(value)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const detectCategoryKeyword = (text = "") => {
    const raw = String(text).toLowerCase();
    const normalized = normalizeVietnamese(text);

    for (const group of CATEGORY_ALIASES) {
        if (group.keys.some(key => raw.includes(key.toLowerCase()) || normalized.includes(normalizeVietnamese(key)))) {
            return group.value;
        }
    }
    return "";
};

const GENERIC_CATEGORY_NAMES = new Set(["Mô hình"]);

const isGenericCategory = (category = "") => GENERIC_CATEGORY_NAMES.has(String(category || "").trim());

const extractTextParam = (parameters, ...names) => {
    if (!parameters) return "";
    for (const name of names) {
        const value = parameters[name] || parameters.fields?.[name];
        if (!value) continue;
        if (typeof value === "string") return value;
        if (value.stringValue) return value.stringValue;
        if (Array.isArray(value)) return value.join(" ");
        if (value.listValue?.values) return value.listValue.values.map(v => v.stringValue || "").join(" ");
    }
    return "";
};

const cleanProductKeyword = (rawText = "") => {
    if (!rawText || typeof rawText !== "string") return "";
    let text = ` ${rawText.toLowerCase().replace(/\s+/g, " ")} `;

    const stopWords = [
        "kiểm tra cho tôi", "kiem tra cho toi", "cho tôi kiểm tra", "cho toi kiem tra", "check cho tôi", "check cho toi",
        "cho tôi xem", "cho mình xem", "tôi muốn mua", "mình muốn tìm", "cho tôi", "cho mình", "tham khảo", "tham khao",
        "đánh giá sản phẩm", "danh gia san pham", "đánh giá", "danh gia", "review", "nhận xét", "nhan xet",
        "kiểm tra", "kiem tra", "check", "tồn kho", "ton kho", "còn hàng", "con hang", "còn sẵn", "con san",
        "hết hàng", "het hang", "tìm", "tim", "kiếm", "kiem", "tư vấn", "tu van", "gợi ý", "goi y",
        "đặt hàng", "dat hang", "đặt", "dat", "order", "mua", "bán", "ban", "xem", "xin", "hỏi", "hoi",
        "mô hình", "mo hinh", "sản phẩm", "san pham", "sp", "đồ chơi", "do choi", "món", "mon", "figure", "mẫu", "mau", "bé", "be",
        "nhân vật", "nhan vat", "loại", "loai", "dòng", "dong", "hàng", "hang", "shop", "ơi", "oi", "tôi", "toi", "mình", "minh",
        "bạn", "ban", "anh", "chị", "chi", "em", "admin", "ad", "dạ", "da", "ạ", "của", "cua", "cho", "muốn", "muon",
        "có", "co", "còn", "con", "không", "khong", "ko", "nào", "nao", "và", "va", "với", "voi", "về", "ve", "các", "cac","tài chính",
        "nhé", "nhe", "nha", "nè", "ne", "đi", "di", "thế", "the", "vậy", "vay", "hả", "ha", "đang", "dang","thì","thi","vài", "vai","hợp lý", "hop ly","bây giờ", "bay gio","hiện tại", "hien tai","mua được gì", "mua duoc gi","được gì", "duoc gi","có gì", "co gi","gì", "gi",
        "mua được", "mua duoc", "được", "duoc", "vừa", "vua", "phù hợp", "phu hop", "dưới", "duoi", "trên", "tren", "khoảng", "khoang", "tầm", "tam", "giá", "gia", "triệu", "trieu", "tr", "k", "ngàn", "nghìn", "ngan", "nghin", "củ", "cu"
    ];

    stopWords.sort((a, b) => b.length - a.length).forEach(word => {
        text = text.replace(new RegExp(`\\s${escapeRegExp(word)}\\s`, "gi"), " ");
    });

    return text.replace(/[0-9?!,.]/g, " ").replace(/\s+/g, " ").trim();
};

const maskAddress = (address = "") => {
    const parts = String(address || "").split(",").map(x => x.trim()).filter(Boolean);
    if (parts.length <= 1) return address ? "Đã ẩn một phần để bảo mật" : "Chưa cập nhật";
    return `***, ${parts.slice(-2).join(", ")}`;
};


// ======================================================
// 3.5. GROQ SLOT EXTRACTOR FOR SQL INTENTS
// ======================================================
// Groq chỉ dùng để tách slot JSON cho các intent cần truy vấn CSDL.
// Nếu Groq lỗi/chưa cấu hình API key, chatbot vẫn dùng local rule để truy vấn bình thường.
// .env gợi ý:
// GROQ_API_KEY=...
// GROQ_MODEL=llama-3.1-8b-instant
// USE_GROQ_SLOT_EXTRACTOR=true
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const USE_GROQ_SLOT_EXTRACTOR = process.env.USE_GROQ_SLOT_EXTRACTOR !== "false";
let groqDisabledUntil = 0;
const SQL_INTENTS_NEED_SLOT_EXTRACTION = new Set([
    "kiem_tra_ton_kho",
    "hoi_thong_tin_san_pham",
    "tim_theo_danh_muc",
    "tu_van_theo_gia",
    "tra_cuu_don_hang",
    "hoi_danh_gia_san_pham"
]);

const parseMoneyValue = (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;

    const raw = String(value).toLowerCase().replace(/,/g, ".").trim();
    const normalized = normalizeVietnamese(raw);
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*(trieu|tr\b|cu|k\b|ngan|nghin)?/i);
    if (!match) return null;

    let number = Number(match[1]);
    if (!Number.isFinite(number)) return null;

    const unit = match[2] || "";
    if (["trieu", "tr", "cu"].includes(unit)) number *= 1000000;
    else if (["k", "ngan", "nghin"].includes(unit)) number *= 1000;

    return Math.round(number);
};

const extractJsonObject = (text = "") => {
    const raw = String(text || "").trim();
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1] : raw;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;

    try {
        return JSON.parse(candidate.slice(start, end + 1));
    } catch (_) {
        return null;
    }
};


const GENERIC_SLOT_KEYWORD_REGEX = /^(bay gio|hien tai|luc nay|chua biet|chua ro|khong biet|khong ro|gi|ta|nhi|nhe|nao|mau nao|san pham nao|mo hinh nao|figure nao|mua duoc gi|duoc gi|co gi|mua gi|mua duoc|hop ly|phu hop|vua tam|tam nao|tam gia|ngan sach|san pham|mo hinh|figure|mau|hang|do choi)$/i;
const GENERIC_SLOT_KEYWORD_CONTAINS_ONLY_REGEX = /^(bay gio|hien tai|luc nay|toi|minh|em|shop|co|khoang|tam|ngan sach|chua biet|khong biet|mua|duoc|gi|ta|nhi|nao|hop ly|phu hop|mo hinh|san pham|figure|mau|hang|thich hop|nen mua|chon|lay|voi|thi|la|nha|nhe|a|da|ad|admin)(\s+(bay gio|hien tai|luc nay|toi|minh|em|shop|co|khoang|tam|ngan sach|chua biet|khong biet|mua|duoc|gi|ta|nhi|nao|hop ly|phu hop|mo hinh|san pham|figure|mau|hang|thich hop|nen mua|chon|lay|voi|thi|la|nha|nhe|a|da|ad|admin))*$/i;

const cleanMeaningfulKeyword = (value = "") => {
    const raw = String(value || "")
        .replace(/[?!,.]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!raw) return "";

    const normalized = normalizeVietnamese(raw);
    if (!normalized) return "";

    if (GENERIC_SLOT_KEYWORD_REGEX.test(normalized)) return "";
    if (GENERIC_SLOT_KEYWORD_CONTAINS_ONLY_REGEX.test(normalized)) return "";

    // Những cụm này thể hiện người dùng hỏi chung theo ngân sách, không phải tên sản phẩm.
    if (/^(chua biet|khong biet|mua duoc|duoc|co|nen mua|chon|lay)/.test(normalized) && /(gi|nao|ta|nhi|hop ly|phu hop)$/.test(normalized)) {
        return "";
    }

    return raw;
};

const normalizeAiSlots = (slots = {}) => {
    const clean = (value) => String(value || "").trim();
    const productKeyword = cleanMeaningfulKeyword(slots.productKeyword || slots.productName || slots.characterName || slots.keyword);
    const rawCategory = clean(slots.categoryKeyword || slots.category || slots.danhMuc);
    const detectedCategory = detectCategoryKeyword(rawCategory);

    const minPrice = parseMoneyValue(slots.minPrice);
    const maxPrice = parseMoneyValue(slots.maxPrice);

    return {
        productKeyword,
        categoryKeyword: detectedCategory || rawCategory,
        minPrice,
        maxPrice,
        phone: clean(slots.phone),
        orderCode: clean(slots.orderCode || slots.maDonHang || slots.maDon),
        serialCode: clean(slots.serialCode || slots.serial || slots.maSerial),
        reviewKeyword: cleanMeaningfulKeyword(slots.reviewKeyword || slots.productKeyword || slots.productName || slots.characterName)
    };
};

const buildSlotExtractionPrompt = (message, intentName, dfResult = {}) => `
Bạn là bộ tách dữ liệu cho chatbot bán mô hình FigureCollect.
Nhiệm vụ: dựa vào intent đã nhận diện và câu khách hàng, tách dữ liệu làm input truy vấn MySQL.
Chỉ trả về JSON hợp lệ, không markdown, không giải thích.

Intent hiện tại: ${intentName}
Câu khách hàng: ${message}
Dialogflow parameters: ${JSON.stringify({
    // Với intent tư vấn theo giá, không truyền keywords từ Dialogflow vì có thể là context cũ.
    keywords: intentName === "tu_van_theo_gia" ? "" : (dfResult.keywords || ""),
    DanhMuc: dfResult.DanhMuc || "",
    phone: dfResult.phone || "",
    Khoang_Gia: dfResult.Khoang_Gia || ""
})}

Schema JSON bắt buộc:
{
  "productKeyword": "tên nhân vật/sản phẩm/series cần tìm, ví dụ miku, luffy, nendoroid; để rỗng nếu câu chỉ hỏi giá chung",
  "categoryKeyword": "danh mục nếu có, ví dụ Gameprize, Mô hình scale, Action figure, Nedoroid Nam, Nendoroid nữ, Nendoroid, PRE-ORDER; nếu không có thì rỗng",
  "minPrice": null hoặc số VND,
  "maxPrice": null hoặc số VND,
  "phone": "số điện thoại nếu có",
  "orderCode": "mã đơn nếu có",
  "serialCode": "mã serial/truy xuất nếu có",
  "reviewKeyword": "tên sản phẩm cần xem đánh giá nếu có"
}

Quy tắc:
- Chỉ được lấy productKeyword từ Câu khách hàng hiện tại, không được lấy từ Dialogflow parameters nếu câu hiện tại không nhắc lại sản phẩm đó.
- Không đưa các từ giao tiếp như tôi, mình, shop, thì, được, mua được, hợp lý vào productKeyword.
- Nếu khách hỏi chung theo ngân sách như "chưa biết mua mô hình gì", "mua được gì", "mẫu nào hợp lý", "nên mua gì" thì productKeyword phải là "".
- Chỉ điền productKeyword khi có tên rõ ràng của nhân vật/sản phẩm/series, ví dụ: miku, luffy, naruto, one piece.
- Với câu như "tôi có 2 củ", "khoảng 2 triệu", "ngân sách 2tr" => hiểu là maxPrice = 2000000, minPrice = 0.
- Với "từ 1 triệu đến 2 triệu" => minPrice = 1000000, maxPrice = 2000000.
- Với "trên 2 triệu" => minPrice = 2000000, maxPrice = null.
- Với "dưới 2 triệu" => minPrice = 0, maxPrice = 2000000.
- Ví dụ: "tôi có 2 củ thì mua mô hình miku nào là hợp lý" => productKeyword "miku", minPrice 0, maxPrice 2000000.
- Ví dụ: "có khoảng 5 củ chưa biết mua mô hình gì ta" => productKeyword "", minPrice 0, maxPrice 5000000.
- Nếu intent là tim_theo_danh_muc và khách nói "nendoroid" thì categoryKeyword = "Nendoroid".
- Nếu intent là hoi_thong_tin_san_pham và khách nói "mô hình miku" thì productKeyword = "miku", categoryKeyword rỗng.
`.trim();

const extractSlotsByGroq = async (message, intentName, dfResult = {}) => {
    if (!USE_GROQ_SLOT_EXTRACTOR) return {};
    if (!process.env.GROQ_API_KEY) return {};
    if (!SQL_INTENTS_NEED_SLOT_EXTRACTION.has(intentName)) return {};
    if (Date.now() < groqDisabledUntil) return {};
    if (typeof fetch !== "function") {
        console.warn("Groq slot extractor bỏ qua vì Node.js chưa hỗ trợ global fetch.");
        return {};
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: GROQ_MODEL,
                temperature: 0,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: "Bạn chỉ được trả về một JSON object hợp lệ theo schema. Không markdown, không giải thích."
                    },
                    {
                        role: "user",
                        content: buildSlotExtractionPrompt(message, intentName, dfResult)
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            console.error("Groq slot extractor HTTP error:", response.status, errorText);

            if ([400, 401, 403, 404, 429, 500, 502, 503].includes(response.status)) {
                groqDisabledUntil = Date.now() + (response.status === 429 ? 60000 : 30000);
            }

            return {};
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || "";
        const json = extractJsonObject(text);
        return json ? normalizeAiSlots(json) : {};
    } catch (error) {
        console.error("Lỗi Groq slot extractor:", error.message || error);
        groqDisabledUntil = Date.now() + 30000;
        return {};
    } finally {
        clearTimeout(timer);
    }
};

const pickKeyword = (...values) => {
    for (const value of values) {
        const cleaned = String(value || "").trim();
        if (cleaned) return cleaned;
    }
    return "";
};

const pickProductKeyword = (...values) => {
    for (const value of values) {
        const cleaned = cleanMeaningfulKeyword(value);
        if (cleaned) return cleaned;
    }
    return "";
};

// ======================================================
// 4. DIALOGFLOW
// ======================================================
const getFulfillmentText = (result = {}) => {
    if (result.fulfillmentText && String(result.fulfillmentText).trim()) return result.fulfillmentText;
    const texts = [];
    (result.fulfillmentMessages || []).forEach(msg => {
        (msg.text?.text || []).forEach(t => {
            if (t && String(t).trim()) texts.push(t);
        });
    });
    return texts.join("\n");
};

const phanLoaiBangDialogflow = async (userMessage, sessionId) => {
    try {
        const [response] = await sessionClient.detectIntent({
            session: sessionClient.projectAgentSessionPath(projectId, sessionId),
            queryInput: { text: { text: userMessage, languageCode: "vi" } }
        });

        const result = response.queryResult || {};
        return {
            intent: normalizeIntentName(result.intent?.displayName || "giao_tiep_co_ban"),
            dfText: getFulfillmentText(result),
            keywords: extractTextParam(result.parameters, "keywords", "ten_san_pham"),
            phone: extractTextParam(result.parameters, "phone"),
            Khoang_Gia: extractTextParam(result.parameters, "Khoang_Gia"),
            DanhMuc: extractTextParam(result.parameters, "danh_muc", "danh_muc_sp", "chi_tiet_danh_muc"),
            isFallback: result.intent?.displayName === "Default Fallback Intent",
            confidence: Number(result.intentDetectionConfidence || 0)
        };
    } catch (error) {
        console.error("Lỗi Dialogflow:", error.message || error);
        return { intent: "giao_tiep_co_ban", dfText: "", isFallback: true, confidence: 0 };
    }
};

const staticResponseCache = new Map();
const getDialogflowStaticResponse = async (intentName, dfText = "") => {
    if (dfText && String(dfText).trim()) return dfText;
    if (!STATIC_DIALOGFLOW_INTENTS.has(intentName)) return "";
    if (staticResponseCache.has(intentName)) return staticResponseCache.get(intentName);

    try {
        const [intents] = await intentsClient.listIntents({
            parent: intentsClient.projectAgentPath(projectId),
            intentView: "INTENT_VIEW_FULL"
        });
        const matched = intents.find(item => normalizeIntentName(item.displayName) === intentName);
        const text = (matched?.messages || [])
            .flatMap(msg => msg.text?.text || [])
            .find(t => t && String(t).trim()) || "";
        if (text) {
            staticResponseCache.set(intentName, text);
            return text;
        }
    } catch (error) {
        console.error("Lỗi lấy Dialogflow Responses theo intent:", error.message || error);
    }

    return STATIC_FALLBACK_TEXT[intentName] || "Dạ bạn vui lòng xem chi tiết trên website của shop nha!";
};

const decideIntent = (textRaw, dfResult) => {
    const normalized = normalizeVietnamese(textRaw);
    const confidence = Number(dfResult.confidence || 0);
    const dfIntent = normalizeIntentName(dfResult.intent || "");
    const categoryKeyword = detectCategoryKeyword(textRaw);
    const cleanedKeyword = cleanProductKeyword(textRaw);
    const hasShoppingIntent = SHOPPING_INTENT_REGEX.test(textRaw) || SHOPPING_INTENT_REGEX.test(normalized);
    const hasOrderIntent = ORDER_INTENT_REGEX.test(textRaw) || ORDER_INTENT_REGEX.test(normalized);

    if (PHONE_REGEX.test(textRaw) && (hasOrderIntent || !hasShoppingIntent)) return { intentName: "tra_cuu_don_hang", source: "rule_order" };
    if (BARE_ORDER_ID_REGEX.test(textRaw) && hasOrderIntent) return { intentName: "tra_cuu_don_hang", source: "rule_order_id" };
    if (BARE_ORDER_ID_REGEX.test(textRaw) && !hasOrderIntent) return { intentName: "can_clarify", source: "rule_bare_number" };

    if (INVENTORY_REGEX.test(textRaw) || INVENTORY_REGEX.test(normalized)) return { intentName: "kiem_tra_ton_kho", source: "rule_inventory" };
    if (HOT_PRODUCT_REGEX.test(textRaw) || HOT_PRODUCT_REGEX.test(normalized)) return { intentName: "goi_y_san_pham_hot", source: "rule_hot_product" };
    if (PROMOTION_REGEX.test(textRaw) || PROMOTION_REGEX.test(normalized)) return { intentName: "hoi_khuyen_mai", source: "rule_promotion" };

    // Ưu tiên giá trước danh mục để câu "gợi ý sản phẩm khoảng 2 củ" không bị bắt nhầm.
    if (PRICE_REGEX.test(textRaw) && (hasShoppingIntent || !hasOrderIntent)) return { intentName: "tu_van_theo_gia", source: "rule_price" };
    if ((REVIEW_REGEX.test(textRaw) || REVIEW_REGEX.test(normalized)) && hasShoppingIntent) return { intentName: "hoi_danh_gia_san_pham", source: "rule_review" };

    // "mô hình" là danh mục quá chung. Nếu câu còn keyword cụ thể như "miku"
    // thì phải tìm theo tên sản phẩm, không tìm danh mục "Mô hình".
    if (categoryKeyword && hasShoppingIntent && (!isGenericCategory(categoryKeyword) || !cleanedKeyword)) {
        return { intentName: "tim_theo_danh_muc", source: "rule_category", categoryKeyword };
    }

    if (!dfResult.isFallback && confidence >= 0.45 && SQL_DIALOGFLOW_INTENTS.has(dfIntent)) {
        if (!(dfIntent === "tim_theo_danh_muc" && isGenericCategory(categoryKeyword) && cleanedKeyword)) {
            return { intentName: dfIntent, source: "dialogflow_sql_intent" };
        }
    }

    for (const [intentName, regex] of STATIC_RULES) {
        if (regex.test(textRaw) || regex.test(normalized)) return { intentName, source: "rule_static" };
    }

    if (hasShoppingIntent) return { intentName: "hoi_thong_tin_san_pham", source: "rule_product_search" };
    if (!dfResult.isFallback && confidence >= 0.45) return { intentName: dfIntent, source: "dialogflow" };
    return { intentName: "can_clarify", source: "low_confidence" };
};

// ======================================================
// 5. PRODUCT SQL HELPERS - KHỚP CSDL CHUẨN
// ======================================================
const productSelect = `
    m.MaMoHinh,
    m.TenMH,
    m.TrangThai,
    m.MaDM,
    m.MaChiTietDM,
    d.TenDM,
    ctdm.TenChiTietDM,
    m.TenNhanVat,
    m.Series,
    m.AnhDaiDien,
    COALESCE(NULLIF(TRIM(m.AnhDaiDien), ''), (SELECT NULLIF(TRIM(LinkAnh), '') FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh AND NULLIF(TRIM(LinkAnh), '') IS NOT NULL ORDER BY LinkAnh ASC LIMIT 1)) AS LinkAnh,   
    COALESCE(NULLIF(m.DonGia, 0), MIN(NULLIF(p.DonGia, 0)), 0) AS GiaThucTe,
    COALESCE(SUM(p.SoLuong), 0) AS TongSoLuong
`;

const productFrom = `
    FROM MoHinh m
    LEFT JOIN PhanLoai p ON m.MaMoHinh = p.MaMoHinh AND p.HienThi = 1
    LEFT JOIN DanhMuc d ON m.MaDM = d.MaDM
    LEFT JOIN ChiTietDanhMuc ctdm ON m.MaChiTietDM = ctdm.MaChiTietDM
`;

const productGroup = `
    GROUP BY
        m.MaMoHinh, m.TenMH, m.TrangThai, m.MaDM, m.MaChiTietDM,
        d.TenDM, ctdm.TenChiTietDM, m.TenNhanVat, m.Series, m.AnhDaiDien, m.DonGia
`;

const productVisibilityWhere = "m.HienThi = 1";

const productSearchCondition = `
    (
        m.TenMH LIKE ? OR m.ThongTinChiTiet LIKE ? OR m.TenNhanVat LIKE ? OR m.Series LIKE ?
        OR d.TenDM LIKE ? OR ctdm.TenChiTietDM LIKE ?
    )
`;

const likeParams = (keyword) => Array(6).fill(`%${String(keyword || "").trim()}%`);

const queryProducts = async ({ keyword = "", minPrice = 0, maxPrice = 999999999, limit = 5, categoryOnly = false } = {}) => {
    const params = [];
    let where = `WHERE ${productVisibilityWhere}`;

    if (keyword && String(keyword).trim()) {
        where += ` AND ${productSearchCondition}`;
        params.push(...likeParams(keyword));
    }

    const outerWhere = Number.isFinite(minPrice) || Number.isFinite(maxPrice)
        ? "WHERE product_result.GiaThucTe BETWEEN ? AND ?"
        : "";

    if (outerWhere) params.push(Number(minPrice) || 0, Number(maxPrice) || 999999999);

    const orderBy = categoryOnly
        ? "ORDER BY CASE WHEN product_result.TongSoLuong > 0 THEN 0 ELSE 1 END, product_result.TongSoLuong DESC, product_result.MaMoHinh DESC"
        : "ORDER BY CASE WHEN product_result.TongSoLuong > 0 THEN 0 ELSE 1 END, product_result.TongSoLuong DESC, product_result.GiaThucTe ASC, product_result.MaMoHinh DESC";

    const sql = `
        SELECT *
        FROM (
            SELECT ${productSelect}
            ${productFrom}
            ${where}
            ${productGroup}
        ) AS product_result
        ${outerWhere}
        ${orderBy}
        LIMIT ?
    `;

    params.push(Number(limit) || 5);
    const [rows] = await pool.query(sql, params);
    return rows;
};

const queryProductsNearPrice = async ({ keyword = "", targetPrice = 0, limit = 5 } = {}) => {
    const params = [];
    let where = `WHERE ${productVisibilityWhere}`;

    if (keyword && String(keyword).trim()) {
        where += ` AND ${productSearchCondition}`;
        params.push(...likeParams(keyword));
    }

    const sql = `
        SELECT *
        FROM (
            SELECT ${productSelect}
            ${productFrom}
            ${where}
            ${productGroup}
        ) AS product_result
        ORDER BY
            CASE WHEN product_result.TongSoLuong > 0 THEN 0 ELSE 1 END,
            ABS(product_result.GiaThucTe - ?) ASC,
            product_result.TongSoLuong DESC,
            product_result.MaMoHinh DESC
        LIMIT ?
    `;

    params.push(Number(targetPrice) || 0, Number(limit) || 5);
    const [rows] = await pool.query(sql, params);
    return rows;
};

const timSanPhamTheoTen = async (keyword) => {
    try {
        return await queryProducts({ keyword, limit: 5 });
    } catch (error) {
        console.error("Lỗi timSanPhamTheoTen:", error.message || error);
        return [];
    }
};

const timSanPhamTheoDanhMuc = async (keyword) => {
    try {
        return await queryProducts({ keyword, limit: 8, categoryOnly: true });
    } catch (error) {
        console.error("Lỗi timSanPhamTheoDanhMuc:", error.message || error);
        return [];
    }
};

const checkInventory = async (keyword) => {
    try {
        const products = await queryProducts({ keyword, limit: 5 });
        return { success: true, found: products.length > 0, products, data: products[0] || null };
    } catch (error) {
        console.error("Lỗi SQL checkInventory:", error.message || error);
        return { success: false, found: false, products: [], data: null };
    }
};

const timSanPhamTheoGia = async (keyword, minPrice, maxPrice) => {
    try {
        return await queryProducts({ keyword, minPrice, maxPrice, limit: 5 });
    } catch (error) {
        console.error("Lỗi timSanPhamTheoGia:", error.message || error);
        return [];
    }
};

const timSanPhamGanGia = async (keyword, minPrice, maxPrice) => {
    try {
        const targetPrice = (Number(minPrice) || 0) > 0 && (Number(maxPrice) || 0) < 999999999
            ? ((Number(minPrice) + Number(maxPrice)) / 2)
            : ((Number(maxPrice) || Number(minPrice)) || 0);
        return await queryProductsNearPrice({ keyword, targetPrice, limit: 5 });
    } catch (error) {
        console.error("Lỗi timSanPhamGanGia:", error.message || error);
        return [];
    }
};

const laySanPhamNoiBatFallback = async (limit = 5) => {
    try {
        return await queryProducts({ limit, categoryOnly: true });
    } catch (error) {
        console.error("Lỗi laySanPhamNoiBatFallback:", error.message || error);
        return [];
    }
};

const laySanPhamHot = async (limit = 5) => {
    try {
        const sql = `
            SELECT ${productSelect},
                COALESCE(sold.TongDaBan, 0) AS TongDaBan,
                COALESCE(sold.DoanhThu, 0) AS DoanhThu,
                COALESCE(fav.SoLuotYeuThich, 0) AS SoLuotYeuThich,
                COALESCE(rv.SoLuotDanhGia, 0) AS SoLuotDanhGia,
                COALESCE(rv.DiemTrungBinh, 0) AS DiemTrungBinh
            ${productFrom}
            LEFT JOIN (
                SELECT pl.MaMoHinh, SUM(ctdh.SoLuong) AS TongDaBan, SUM(ctdh.SoLuong * ctdh.DonGiaBan) AS DoanhThu
                FROM ChiTietDonHang ctdh
                JOIN PhanLoai pl ON ctdh.MaPhanLoai = pl.MaPhanLoai
                JOIN DonHang dh ON ctdh.MaDH = dh.MaDH
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM ChiTietTrangThai ctt
                    JOIN TrangThai tt ON ctt.MaTrangThai = tt.MaTrangThai
                    WHERE ctt.MaDH = dh.MaDH AND tt.TenTrangThai = 'Đã hủy'
                )
                GROUP BY pl.MaMoHinh
            ) sold ON sold.MaMoHinh = m.MaMoHinh
            LEFT JOIN (
                SELECT MaMoHinh, COUNT(*) AS SoLuotYeuThich
                FROM ChiTietYeuThich
                GROUP BY MaMoHinh
            ) fav ON fav.MaMoHinh = m.MaMoHinh
            LEFT JOIN (
                SELECT MaMH, COUNT(*) AS SoLuotDanhGia, AVG(SoSao) AS DiemTrungBinh
                FROM DanhGia
                WHERE TrangThai = 1
                GROUP BY MaMH
            ) rv ON rv.MaMH = m.MaMoHinh
            WHERE ${productVisibilityWhere}
            ${productGroup}, sold.TongDaBan, sold.DoanhThu, fav.SoLuotYeuThich, rv.SoLuotDanhGia, rv.DiemTrungBinh
            ORDER BY
                COALESCE(sold.TongDaBan, 0) DESC,
                COALESCE(sold.DoanhThu, 0) DESC,
                COALESCE(fav.SoLuotYeuThich, 0) DESC,
                COALESCE(rv.DiemTrungBinh, 0) DESC,
                COALESCE(SUM(p.SoLuong), 0) DESC,
                m.MaMoHinh DESC
            LIMIT ?
        `;
        const [rows] = await pool.query(sql, [Number(limit) || 5]);
        return rows.length ? rows : laySanPhamNoiBatFallback(limit);
    } catch (error) {
        console.error("Lỗi laySanPhamHot:", error.message || error);
        return laySanPhamNoiBatFallback(limit);
    }
};

const laySanPhamKhuyenMai = async (limit = 5) => {
    try {
        const sql = `
            SELECT
                m.MaMoHinh, m.TenMH, m.TrangThai, m.MaDM, m.MaChiTietDM,
                d.TenDM, ctdm.TenChiTietDM, m.TenNhanVat, m.Series, m.AnhDaiDien,
                COALESCE(NULLIF(TRIM(m.AnhDaiDien), ''), (SELECT NULLIF(TRIM(LinkAnh), '') FROM AnhMoHinh WHERE MaMoHinh = m.MaMoHinh AND NULLIF(TRIM(LinkAnh), '') IS NOT NULL ORDER BY LinkAnh ASC LIMIT 1)) AS LinkAnh,
                km.TenKM,
                MIN(
                    CASE
                        WHEN ctkm.LoaiGiamGia IN ('PhanTram', 'Phần trăm', 'Percent')
                            THEN GREATEST(p.DonGia - LEAST(p.DonGia * ctkm.ChietKhau / 100, COALESCE(ctkm.GiaTriGiamToiDa, p.DonGia)), 0)
                        ELSE GREATEST(p.DonGia - ctkm.ChietKhau, 0)
                    END
                ) AS GiaThucTe,
                MIN(p.DonGia) AS GiaGoc,
                MAX(ctkm.ChietKhau) AS ChietKhau,
                COALESCE(SUM(p.SoLuong), 0) AS TongSoLuong
            FROM KhuyenMai km
            JOIN ChiTietKhuyenMai ctkm ON km.MaKM = ctkm.MaKM
            JOIN PhanLoai p ON ctkm.MaPhanLoai = p.MaPhanLoai AND p.HienThi = 1
            JOIN MoHinh m ON p.MaMoHinh = m.MaMoHinh
            LEFT JOIN DanhMuc d ON m.MaDM = d.MaDM
            LEFT JOIN ChiTietDanhMuc ctdm ON m.MaChiTietDM = ctdm.MaChiTietDM
            WHERE m.HienThi = 1
              AND km.TrangThaiHoatDong = 1
              AND km.ThoiGianBD <= NOW()
              AND km.ThoiGianKT >= NOW()
              AND COALESCE(ctkm.SoLuongKM, 0) > COALESCE(ctkm.SoLuongDaDung, 0)
            GROUP BY
                m.MaMoHinh, m.TenMH, m.TrangThai, m.MaDM, m.MaChiTietDM,
                d.TenDM, ctdm.TenChiTietDM, m.TenNhanVat, m.Series, m.AnhDaiDien, km.TenKM
            ORDER BY GiaThucTe ASC, COALESCE(SUM(p.SoLuong), 0) DESC
            LIMIT ?
        `;
        const [rows] = await pool.query(sql, [Number(limit) || 5]);
        return rows;
    } catch (error) {
        console.error("Lỗi laySanPhamKhuyenMai:", error.message || error);
        return [];
    }
};

const getProductReviews = async (keyword) => {
    try {
        const sql = `
            SELECT dg.MaDG, dg.NoiDung, dg.SoSao, dg.ThoiGianDG, m.TenMH
            FROM DanhGia dg
            JOIN MoHinh m ON dg.MaMH = m.MaMoHinh
            WHERE dg.TrangThai = 1
              AND (m.TenMH LIKE ? OR m.TenNhanVat LIKE ? OR m.Series LIKE ?)
            ORDER BY dg.ThoiGianDG DESC
            LIMIT 10
        `;
        const like = `%${keyword}%`;
        const [rows] = await pool.query(sql, [like, like, like]);
        if (!rows.length) return { success: true, found: false, data: null };

        const totalReviews = rows.length;
        const avgScore = (rows.reduce((sum, row) => sum + Number(row.SoSao || 0), 0) / totalReviews).toFixed(1);
        return {
            success: true,
            found: true,
            data: { tenMoHinh: rows[0].TenMH, totalReviews, avgScore, reviews: rows.slice(0, 3) }
        };
    } catch (error) {
        console.error("Lỗi getProductReviews:", error.message || error);
        return { success: false, found: false, data: null };
    }
};

const traCuuDonHang = async (phone, maDon) => {
    try {
        let where = "WHERE 1=1";
        const params = [];

        if (maDon) {
            where += " AND (dh.MaDH = ? OR dh.MaDonHangHienThi = ?)";
            params.push(maDon, maDon);
        } else if (phone) {
            where += " AND dh.SDTNguoiNhan LIKE ?";
            params.push(`%${phone}%`);
        }

        const sql = `
            SELECT
                dh.MaDH, dh.MaDonHangHienThi, dh.NgayLapDon, dh.TongTien, dh.ThanhTien,
                dh.TrangThaiThanhToan, dh.TenNguoiNhan, dh.SDTNguoiNhan, dh.DiaChiGiao,
                dh.MaVanDon, dh.HangVanChuyen,
                COALESCE(tt.TenTrangThai, 'Chưa cập nhật') AS TrangThaiDonHang
            FROM DonHang dh
            LEFT JOIN (
                SELECT ctt.MaDH, ctt.MaTrangThai
                FROM ChiTietTrangThai ctt
                JOIN (
                    SELECT MaDH, MAX(Thoigian) AS MaxTime
                    FROM ChiTietTrangThai
                    GROUP BY MaDH
                ) latest ON latest.MaDH = ctt.MaDH AND latest.MaxTime = ctt.Thoigian
            ) latestStatus ON latestStatus.MaDH = dh.MaDH
            LEFT JOIN TrangThai tt ON tt.MaTrangThai = latestStatus.MaTrangThai
            ${where}
            ORDER BY dh.NgayLapDon DESC, dh.MaDH DESC
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, params);
        return rows[0] || null;
    } catch (error) {
        console.error("Lỗi traCuuDonHang:", error.message || error);
        return null;
    }
};

// ======================================================
// 6. PRICE PARSER / HTML RENDER
// ======================================================
const parsePriceAndKeyword = (text, dfKeyword = "") => {
    const raw = String(text || "").toLowerCase();
    const normalized = normalizeVietnamese(raw);
    const priceRegex = /(\d+(?:[\.,]\d+)?)\s*(triệu|tr\b|củ|k\b|ngàn|nghìn|ngan|nghin|cu)(?:\s+(rưỡi|ruoi))?/g;
    const matches = [...raw.matchAll(priceRegex)];
    let minPrice = 0;
    let maxPrice = 999999999;

    const toNumber = (match) => {
        let value = Number(String(match[1]).replace(",", "."));
        const unit = normalizeVietnamese(match[2]);
        const half = normalizeVietnamese(match[3] || "") === "ruoi";
        if (["trieu", "tr", "cu"].includes(unit)) {
            value *= 1000000;
            if (half) value += 500000;
        } else {
            value *= 1000;
            if (half) value += 500;
        }
        return value;
    };

    if (matches.length >= 2 && normalized.includes("tu") && (normalized.includes("den") || raw.includes("-"))) {
        const a = toNumber(matches[0]);
        const b = toNumber(matches[1]);
        minPrice = Math.min(a, b);
        maxPrice = Math.max(a, b);
    } else if (matches.length) {
        const value = toNumber(matches[0]);

        if (/(duoi|nho hon|toi da|max)/.test(normalized)) {
            maxPrice = value;
        } else if (/(tren|lon hon|min)/.test(normalized)) {
            minPrice = value;
        } else if (/(khoang|tam|co|ngan sach|muc gia|gia tam|trong tam)/.test(normalized)) {
            // Người dùng thường nói "khoảng 2 củ" với ý nghĩa ngân sách tối đa gần 2 triệu.
            // Để không bỏ sót mẫu 1.2tr hoặc đúng 2tr, tìm từ 0 đến giá người dùng đưa ra.
            minPrice = 0;
            maxPrice = value;
        } else {
            minPrice = value * 0.7;
            maxPrice = value * 1.3;
        }
    }

    const noPriceText = raw
        .replace(/từ\s*\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn|ngan|nghin|cu)(?:\s+(rưỡi|ruoi))?\s*(đến|den|-)\s*\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn|ngan|nghin|cu)(?:\s+(rưỡi|ruoi))?/g, " ")
        .replace(/(dưới|duoi|trên|tren|từ|tu|khoảng|khoang|tầm|tam|cỡ|co|chừng|chung|hơn|hon|nhỏ hơn|nho hon|lớn hơn|lon hon|tối đa|toi da|max|min)\s*\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn|ngan|nghin|cu)(?:\s+(rưỡi|ruoi))?/g, " ")
        .replace(/\d+(?:[\.,]\d+)?\s*(triệu|tr|củ|k|ngàn|nghìn|ngan|nghin|cu)(?:\s+(rưỡi|ruoi))?/g, " ");

    let keyword = cleanProductKeyword(noPriceText);
    if (!keyword && dfKeyword) keyword = cleanProductKeyword(dfKeyword);
    keyword = cleanMeaningfulKeyword(keyword);
    if (["san pham", "mo hinh", "figure", "mau", "do choi", "mon", "duoc", "thi duoc", "mua duoc", "co duoc"].includes(normalizeVietnamese(keyword))) keyword = "";

    return { minPrice, maxPrice, keyword, searchMode: keyword ? "product_and_price" : "price_only" };
};

const extractOrderLookup = (message, dfResult) => {
    const text = String(message || "").toLowerCase();
    const phone = text.match(PHONE_REGEX)?.[0] || dfResult.phone || null;
    const maDon = text.match(/(?:mã|ma|đơn|don|mã đơn|ma don|số|so|order|madon|mã dh|ma dh)\s*([a-z0-9-]{4,20})\b/i)?.[1]
        || (BARE_ORDER_ID_REGEX.test(text) ? text : null);
    return { sdt: phone, maDon };
};

const mergeSlots = (localSlots = {}, aiSlots = {}) => ({
    productKeyword: pickProductKeyword(aiSlots.productKeyword, localSlots.productKeyword),
    categoryKeyword: pickKeyword(aiSlots.categoryKeyword, localSlots.categoryKeyword),
    minPrice: aiSlots.minPrice !== null && aiSlots.minPrice !== undefined ? aiSlots.minPrice : localSlots.minPrice,
    maxPrice: aiSlots.maxPrice !== null && aiSlots.maxPrice !== undefined ? aiSlots.maxPrice : localSlots.maxPrice,
    phone: pickKeyword(aiSlots.phone, localSlots.phone),
    orderCode: pickKeyword(aiSlots.orderCode, localSlots.orderCode),
    serialCode: pickKeyword(aiSlots.serialCode, localSlots.serialCode),
    reviewKeyword: pickProductKeyword(aiSlots.reviewKeyword, aiSlots.productKeyword, localSlots.reviewKeyword, localSlots.productKeyword)
});

const extractSlotsLocally = (message, intentName, dfResult = {}) => {
    const parsedPrice = PRICE_REGEX.test(message) || intentName === "tu_van_theo_gia"
        // Với tư vấn theo giá, chỉ tách keyword từ câu hiện tại. Không dùng dfResult.keywords vì có thể dính context cũ như "miku".
        ? parsePriceAndKeyword(message, intentName === "tu_van_theo_gia" ? "" : dfResult.keywords)
        : { minPrice: null, maxPrice: null, keyword: "" };

    const order = extractOrderLookup(message, dfResult);
    const categoryKeyword = detectCategoryKeyword(dfResult.DanhMuc || dfResult.keywords || message);
    const productKeyword = intentName === "tu_van_theo_gia"
        ? pickProductKeyword(parsedPrice.keyword)
        : pickProductKeyword(dfResult.keywords, cleanProductKeyword(message));

    return {
        productKeyword,
        categoryKeyword,
        minPrice: parsedPrice.minPrice,
        maxPrice: parsedPrice.maxPrice,
        phone: order.sdt || "",
        orderCode: order.maDon || "",
        serialCode: "",
        reviewKeyword: productKeyword
    };
};

const extractSlotsForSqlIntent = async (message, intentName, dfResult = {}) => {
    const localSlots = extractSlotsLocally(message, intentName, dfResult);

    // Groq chỉ là lớp hỗ trợ. Nếu Groq lỗi/hết quota/chưa có key, vẫn dùng localSlots.
    const aiSlots = await extractSlotsByGroq(message, intentName, dfResult);
    const slots = mergeSlots(localSlots, aiSlots || {});

    // Nếu khách chỉ hỏi giá chung như "gợi ý sản phẩm khoảng 2 củ",
    // không cho Groq/Dialogflow kéo keyword cũ từ context trước đó vào truy vấn.
    if (intentName === "tu_van_theo_gia" && !localSlots.productKeyword) {
        slots.productKeyword = "";
        slots.reviewKeyword = "";
    }

    if (process.env.DEBUG_CHATBOT_SLOTS === "true") {
        console.log("DEBUG_CHATBOT_SLOTS", { intentName, localSlots, groqSlots: aiSlots, slots });
    }

    return slots;
};

const renderReviewHtml = (data) => {
    const reviews = data.reviews.map(rv => {
        const stars = "★".repeat(Number(rv.SoSao || 0)) + "☆".repeat(5 - Number(rv.SoSao || 0));
        const date = new Date(rv.ThoiGianDG).toLocaleDateString("vi-VN");
        return `
            <div style="border-bottom:1px solid #eee;padding-bottom:10px;margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <span style="font-weight:bold;color:#2980b9;font-size:14px;">Khách hàng</span>
                    <span style="color:#f1c40f;font-size:12px;">${stars}</span>
                </div>
                <div style="font-size:11px;color:#bdc3c7;margin-bottom:5px;">Ngày: ${date}</div>
                <div style="font-style:italic;font-size:14px;margin-bottom:8px;">"${escapeHtml(rv.NoiDung || "Khách hàng chưa để lại nội dung.")}"</div>
            </div>
        `;
    }).join("");

    return `
        <div style="background:#ffffff;padding:18px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.05);font-family:sans-serif;color:#333;line-height:1.6;">
            <h3 style="color:#2c3e50;font-size:16px;font-weight:bold;margin:0 0 12px 0;text-transform:uppercase;">Đánh giá: ${escapeHtml(data.tenMoHinh)}</h3>
            <div style="background:#ecf0f1;padding:12px;border-radius:10px;margin-bottom:15px;">
                <span style="font-size:26px;font-weight:bold;color:#e67e22;">${escapeHtml(data.avgScore)}</span> / 5
                <div style="color:#7f8c8d;font-size:12px;">Từ ${escapeHtml(data.totalReviews)} lượt đánh giá</div>
            </div>
            ${reviews}
        </div>
    `;
};

const renderOrderHtml = (order) => {
    const ngayLap = order.NgayLapDon ? new Date(order.NgayLapDon).toLocaleDateString("vi-VN") : "Chưa cập nhật";
    const thanhTien = order.ThanhTien ? `${Number(order.ThanhTien).toLocaleString("vi-VN")}đ` : "Chưa cập nhật";
    return `
        Dạ, shop tìm thấy thông tin đơn hàng của bạn rồi ạ:<br><br>
        📦 <b>Mã đơn:</b> ${escapeHtml(order.MaDonHangHienThi || order.MaDH)}<br>
        👤 <b>Người nhận:</b> ${escapeHtml(order.TenNguoiNhan || "Khách hàng")}<br>
        📅 <b>Ngày đặt:</b> ${ngayLap}<br>
        💰 <b>Tổng tiền:</b> ${thanhTien}<br>
        💳 <b>Thanh toán:</b> ${escapeHtml(order.TrangThaiThanhToan || "Chưa cập nhật")}<br>
        🚚 <b>Trạng thái:</b> <span style="color:#ff6b6b;font-weight:bold;">${escapeHtml(order.TrangThaiDonHang || "Chưa cập nhật")}</span><br>
        🚛 <b>Vận đơn:</b> ${escapeHtml(order.MaVanDon || "Chưa cập nhật")} ${order.HangVanChuyen ? `(${escapeHtml(order.HangVanChuyen)})` : ""}<br>
        📍 <b>Địa chỉ:</b> ${escapeHtml(maskAddress(order.DiaChiGiao))}
    `;
};

// ======================================================
// 7. MAIN CONTROLLER
// ======================================================
const chatWithAI = async (req, res) => {
    try {
        const { message, sessionId = uuid.v4() } = req.body;
        if (!message || !String(message).trim()) {
            return res.status(400).json({ message: "Tin nhắn không để trống", products: [] });
        }

        const cleanMessage = String(message).trim();
        const textRaw = cleanMessage.toLowerCase();
        const dfResult = await phanLoaiBangDialogflow(cleanMessage, sessionId);

        // Intent cố định vẫn ưu tiên Responses/HTML từ Dialogflow.
        if (STATIC_DIALOGFLOW_INTENTS.has(dfResult.intent) && dfResult.dfText && String(dfResult.dfText).trim()) {
            return res.status(200).json({
                message: compactHtmlResponse(dfResult.dfText),
                products: [],
                sessionId,
                intent: dfResult.intent,
                confidence: dfResult.confidence || 0,
                source: "dialogflow_static_response",
                suggestions: []
            });
        }

        const decision = decideIntent(textRaw, dfResult);
        const intentName = decision.intentName;
        const aiSlots = await extractSlotsForSqlIntent(cleanMessage, intentName, dfResult);

        const sendBot = (botMessage, products = [], extra = {}) => res.status(200).json({
            message: compactHtmlResponse(botMessage),
            products,
            sessionId,
            intent: intentName,
            confidence: dfResult.confidence || 0,
            source: decision.source,
            suggestions: [],
            ...extra
        });

        if (intentName === "can_clarify") {
            return sendBot("Dạ mình chưa chắc ý bạn muốn hỏi ạ. Bạn muốn shop hỗ trợ tìm sản phẩm, tư vấn theo giá, kiểm tra đơn hàng hay hỏi chính sách ạ?", []);
        }

        if (["giao_tiep_co_ban", "default_welcome_intent"].includes(intentName)) {
            return sendBot(dfResult.dfText || "Dạ shop FigureCollect xin chào ạ! Bạn muốn tìm mô hình nào nè? 🥰", []);
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
            case "huong_dan_su_dung_blockchain":
                responseMessage = await getDialogflowStaticResponse(intentName, dfResult.dfText);
                break;

            case "kiem_tra_ton_kho": {
                const keyword = pickProductKeyword(aiSlots.productKeyword, cleanProductKeyword(dfResult.keywords || cleanMessage));
                if (!keyword) {
                    responseMessage = "Dạ bạn muốn kiểm tra tồn kho của mẫu mô hình nào ạ?";
                    break;
                }
                const result = await checkInventory(keyword);
                dbData = result.products || [];
                if (!result.success) responseMessage = "Dạ hệ thống kiểm tra kho đang gặp chút sự cố, bạn thử lại sau giúp shop nhé.";
                else if (!dbData.length) responseMessage = `Dạ shop chưa tìm thấy mẫu nào liên quan đến "${escapeHtml(keyword)}" ạ.`;
                else {
                    const conHang = dbData.filter(sp => Number(sp.TongSoLuong || 0) > 0 || /(con hang|co san|pre order|preorder|dat truoc)/.test(normalizeVietnamese(sp.TrangThai || "")));
                    dbData = conHang.length ? conHang : dbData;
                    responseMessage = conHang.length
                        ? `✅ Dạ shop tìm thấy ${conHang.length} mẫu liên quan đến "${escapeHtml(keyword)}" còn hàng. Bạn xem bên dưới nhé 👇`
                        : `Dạ shop tìm thấy ${dbData.length} mẫu liên quan đến "${escapeHtml(keyword)}", nhưng hệ thống chưa ghi nhận số lượng còn hàng. Bạn xem mẫu bên dưới và nhắn shop để xác nhận nhanh nhé 👇`;
                }
                break;
            }

            case "hoi_thong_tin_san_pham": {
                const keyword = pickProductKeyword(aiSlots.productKeyword, cleanProductKeyword(dfResult.keywords || cleanMessage));
                if (!keyword) {
                    responseMessage = "Dạ bạn đang muốn tìm mô hình của nhân vật nào ạ? 🤔";
                    break;
                }
                dbData = await timSanPhamTheoTen(keyword);
                responseMessage = dbData.length
                    ? `Dạ các mẫu "${escapeHtml(keyword)}" đây ạ 👇`
                    : `Dạ shop tạm hết hoặc chưa tìm thấy mẫu "${escapeHtml(keyword)}" rồi ạ.`;
                break;
            }

            case "tim_theo_danh_muc": {
                const danhMuc = pickKeyword(aiSlots.categoryKeyword, decision.categoryKeyword, detectCategoryKeyword(dfResult.DanhMuc || dfResult.keywords || cleanMessage), cleanProductKeyword(dfResult.DanhMuc || cleanMessage));
                if (!danhMuc) {
                    return sendBot("Dạ bạn muốn xem danh mục nào ạ? Ví dụ: Gameprize, Mô hình scale, Chibi, Action figure, Nendoroid hoặc Pre-order 2026.", []);
                }
                dbData = await timSanPhamTheoDanhMuc(danhMuc);
                responseMessage = dbData.length
                    ? `Dạ shop tìm thấy các mẫu thuộc danh mục "${escapeHtml(danhMuc)}" đây ạ 👇`
                    : `Dạ hiện tại shop chưa tìm thấy sản phẩm nào thuộc danh mục "${escapeHtml(danhMuc)}" ạ.`;
                break;
            }

            case "tu_van_theo_gia": {
                const parsedPrice = parsePriceAndKeyword(cleanMessage, "");
                const minPrice = aiSlots.minPrice !== null && aiSlots.minPrice !== undefined ? aiSlots.minPrice : parsedPrice.minPrice;
                const maxPrice = aiSlots.maxPrice !== null && aiSlots.maxPrice !== undefined ? aiSlots.maxPrice : parsedPrice.maxPrice;
                // Với câu tư vấn giá, chỉ dùng keyword nếu câu hiện tại có nhắc sản phẩm cụ thể.
                // Không dùng aiSlots.productKeyword khi parsedPrice.keyword rỗng để tránh dính context cũ như "miku".
                const keyword = pickProductKeyword(parsedPrice.keyword);
                const searchMode = keyword ? "product_and_price" : "price_only";

                dbData = await timSanPhamTheoGia(keyword, minPrice, maxPrice);
                let usedNearPriceFallback = false;

                if (!dbData.length) {
                    dbData = await timSanPhamGanGia(keyword, minPrice, maxPrice);
                    usedNearPriceFallback = dbData.length > 0;
                }

                const effectiveMaxPrice = maxPrice === null || maxPrice === undefined ? 999999999 : maxPrice;
                const effectiveMinPrice = minPrice === null || minPrice === undefined ? 0 : minPrice;
                const priceText = effectiveMaxPrice >= 999999999
                    ? `trên ${Math.round(effectiveMinPrice).toLocaleString("vi-VN")}đ`
                    : effectiveMinPrice <= 0
                        ? `dưới ${Math.round(effectiveMaxPrice).toLocaleString("vi-VN")}đ`
                        : `từ ${Math.round(effectiveMinPrice).toLocaleString("vi-VN")}đ đến ${Math.round(effectiveMaxPrice).toLocaleString("vi-VN")}đ`;

                if (dbData.length && usedNearPriceFallback) {
                    responseMessage = searchMode === "product_and_price"
                        ? `Dạ shop chưa có mẫu "${escapeHtml(keyword)}" đúng tầm ${priceText}, nhưng có vài mẫu gần mức giá đó bạn có thể tham khảo ạ 👇`
                        : `Dạ shop chưa có sản phẩm đúng tầm ${priceText}, nhưng có vài mẫu gần mức giá đó bạn có thể tham khảo ạ 👇`;
                } else {
                    responseMessage = dbData.length
                        ? (searchMode === "product_and_price"
                            ? `Dạ shop tìm thấy các mẫu "${escapeHtml(keyword)}" có mức giá ${priceText} phù hợp đây ạ 👇`
                            : `Dạ shop tìm thấy các sản phẩm trong tầm giá ${priceText} phù hợp đây ạ 👇`)
                        : (searchMode === "product_and_price"
                            ? `Dạ tiếc quá, shop chưa tìm thấy mẫu "${escapeHtml(keyword)}" trong tầm giá ${priceText} ạ.`
                            : `Dạ tiếc quá, shop chưa tìm thấy sản phẩm nào trong tầm giá ${priceText} ạ.`);
                }
                break;
            }

            case "hoi_khuyen_mai":
                dbData = await laySanPhamKhuyenMai();
                responseMessage = dbData.length ? "Dạ shop đang có chương trình giảm giá cho các mẫu dưới đây 👇" : "Dạ cửa hàng đang tạm hết chương trình khuyến mại ạ!";
                break;

            case "goi_y_san_pham_hot":
                dbData = await laySanPhamHot();
                responseMessage = dbData.length ? "Dạ đây là các mẫu nổi bật/bán chạy shop gợi ý cho bạn ạ 👇" : "Dạ hiện tại shop chưa có sản phẩm phù hợp để gợi ý ạ.";
                break;

            case "hoi_danh_gia_san_pham": {
                const keyword = pickProductKeyword(aiSlots.reviewKeyword, aiSlots.productKeyword, cleanProductKeyword(dfResult.keywords || cleanMessage));
                if (!keyword) {
                    responseMessage = "Dạ, bạn muốn xem đánh giá của mẫu mô hình nào ạ?";
                    break;
                }
                const review = await getProductReviews(keyword);
                if (!review.success) responseMessage = "Dạ hệ thống tải đánh giá đang gặp sự cố, bạn thử lại sau nhé!";
                else if (!review.found) responseMessage = `Dạ mẫu "${escapeHtml(keyword)}" hiện chưa có khách hàng nào để lại đánh giá ạ.`;
                else responseMessage = renderReviewHtml(review.data);
                break;
            }

            case "tra_cuu_don_hang": {
                const orderLookup = extractOrderLookup(cleanMessage, dfResult);
                const sdt = pickKeyword(aiSlots.phone, orderLookup.sdt);
                const maDon = pickKeyword(aiSlots.orderCode, orderLookup.maDon);
                if (!sdt && !maDon) {
                    responseMessage = "Dạ, để kiểm tra đơn hàng, bạn cho shop xin <b>Số điện thoại</b> hoặc <b>Mã đơn hàng</b> nhé! 👇";
                    break;
                }
                const order = await traCuuDonHang(sdt, maDon);
                responseMessage = order
                    ? renderOrderHtml(order)
                    : `Dạ shop không tìm thấy đơn hàng nào khớp với thông tin <b>${escapeHtml(sdt || maDon)}</b> ạ.`;
                break;
            }

            default:
                responseMessage = dfResult.dfText || "Dạ hệ thống đang xử lý yêu cầu ạ!";
                break;
        }

        return sendBot(responseMessage, dbData);
    } catch (error) {
        console.error("Lỗi Chatbot Controller:", error.message || error);
        return res.status(500).json({ message: "Dạ hệ thống đang quá tải một chút, bạn thử lại sau nhé!", products: [] });
    }
};

module.exports = { chatWithAI };
