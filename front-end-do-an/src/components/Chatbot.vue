<template>
  <div class="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
    <div
      v-if="isOpen"
      class="w-[calc(100vw-2rem)] sm:w-80 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl flex flex-col mb-4 overflow-hidden transition-all duration-300"
    >
      <div class="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
        <div class="font-bold flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          Trợ lý Figure
        </div>
        <button @click="isOpen = false" class="text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref="chatBox" class="h-80 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="msg.sender === 'user' ? 'self-end' : 'self-start'"
          class="max-w-[85%]"
        >
          <!-- Không dùng v-html cho tin nhắn user để tránh XSS -->
          <div
            v-if="msg.sender === 'user'"
            class="px-4 py-2 text-sm shadow-sm whitespace-pre-line bg-[#ff7a59] text-white rounded-l-xl rounded-tr-xl"
          >
            {{ msg.text }}
          </div>

          <!-- Bot vẫn có thể render HTML, nhưng đã được sanitize cơ bản ở frontend + escape ở backend -->
          <div
            v-else
            class="bot-html-message px-3 py-2 text-sm shadow-sm bg-gray-800 text-gray-100 border border-gray-700 rounded-r-xl rounded-tl-xl"
            v-html="safeBotHtml(msg.text)"
            @click="handleBotHtmlClick"
          ></div>

          <div v-if="msg.products && msg.products.length > 0" class="mt-2 flex flex-col gap-2">
            <div
              v-for="sp in msg.products"
              :key="sp.MaMoHinh"
              @click="goToProduct(sp.MaMoHinh)"
              class="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-700 hover:border-[#ff7a59] transition-all group"
            >
              <img :src="getProductImage(sp)" @error="handleProductImageError" class="w-14 h-14 object-cover rounded-lg bg-white" alt="Product image" />

              <div class="flex-1 overflow-hidden">
                <div class="text-sm font-semibold text-white truncate group-hover:text-[#ff7a59] transition-colors">
                  {{ sp.TenMH }}
                </div>
                <div class="text-xs text-[#ff7a59] font-bold mt-1">
                  {{ formatPrice(sp.GiaThucTe || sp.GiaGoc || sp.DonGia) }}
                </div>
                <div v-if="sp.ChatLieu" class="text-[11px] text-gray-300 mt-0.5 truncate">
                  Chất liệu: {{ sp.ChatLieu }}
                </div>
                <div v-if="sp.TongSoLuong !== undefined" class="text-[11px] text-gray-400 mt-0.5">
                  {{ Number(sp.TongSoLuong) > 0 ? `Còn ${sp.TongSoLuong} sản phẩm` : 'Tạm hết hàng' }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0" class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="suggestion in msg.suggestions"
              :key="suggestion"
              @click="sendSuggestion(suggestion)"
              class="text-xs px-3 py-1 rounded-full border border-gray-600 text-gray-200 hover:border-[#ff7a59] hover:text-[#ff7a59] transition-colors"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="self-start max-w-[85%] bg-gray-800 border border-gray-700 rounded-r-xl rounded-tl-xl px-4 py-3 shadow-sm flex items-center gap-1"
        >
          <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
          <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
          <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
        </div>
      </div>

      <div class="p-3 bg-gray-800 border-t border-gray-700 flex items-center gap-2">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Nhập tin nhắn..."
          :disabled="isLoading"
          class="flex-1 bg-gray-900 text-white border border-gray-700 rounded-full px-4 py-2 text-sm outline-none focus:border-[#ff7a59] transition-colors placeholder-gray-500 disabled:opacity-50"
        />

        <button
          @click="sendMessage"
          :disabled="isLoading"
          class="bg-[#ff7a59] text-white p-2 rounded-full hover:bg-orange-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>

    <button
      @click="isOpen = !isOpen"
      class="bg-[#ff7a59] hover:bg-orange-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center transition-transform hover:scale-110 overflow-hidden relative group"
    >
      <div v-if="!isOpen" class="animate-custom-wiggle flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-9 md:w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="6" width="14" height="12" rx="2" stroke-linecap="round" />
          <path d="M3 10V14" stroke-linecap="round" />
          <path d="M21 10V14" stroke-linecap="round" />
          <path d="M12 6V3M10 3h4" stroke-linecap="round" />
          <circle cx="9" cy="11.5" r="1.2" fill="white" stroke="white" />
          <circle cx="15" cy="11.5" r="1.2" fill="white" stroke="white" />
          <path d="M9 15h6M9 15c0 1 1 2 3 2s3-1 3-2" stroke-linecap="round" />
        </svg>
      </div>

      <div v-else>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <span class="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 group-hover:animate-ping"></span>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const isOpen = ref(false);
const userInput = ref('');
const isLoading = ref(false);
const chatBox = ref(null);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MESSAGE_STORAGE_KEY = 'figure_chatbot_messages';
const SESSION_STORAGE_KEY = 'figure_chatbot_session_id';
const MAX_SAVED_MESSAGES = 30;

const defaultMessages = [
  {
    sender: 'bot',
    text: 'Xin chào! Mình là trợ lý ảo của FigureCollect. Bạn cần tìm mô hình, kiểm tra đơn hàng hay hướng dẫn truy xuất Blockchain ạ?',
    products: [],
    suggestions: []
  }
];

const loadMessages = () => {
  try {
    const saved = localStorage.getItem(MESSAGE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultMessages;
  } catch (error) {
    console.warn('Không thể đọc lịch sử chatbot:', error);
    return defaultMessages;
  }
};

const messages = ref(loadMessages());

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

watch(
  messages,
  (newMessages) => {
    const trimmed = newMessages.slice(-MAX_SAVED_MESSAGES);
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(trimmed));
  },
  { deep: true }
);

const formatPrice = (price) => {
  if (!price) return 'Liên hệ';
  return Number(price).toLocaleString('vi-VN') + ' đ';
};

const PRODUCT_IMAGE_BASE_PATH = '/Images_product';
const DEFAULT_PRODUCT_IMAGE = `${PRODUCT_IMAGE_BASE_PATH}/default.jpg`;

const getProductImage = (productOrImage) => {
  const rawImage = typeof productOrImage === 'object' && productOrImage !== null
    ? productOrImage.LinkAnh
      || productOrImage.AnhDaiDien
      || productOrImage.DuongDanAnh
      || productOrImage.image
      || productOrImage.ImageSrc
      || ''
    : productOrImage;

  let image = String(rawImage || '').trim();
  if (!image) return DEFAULT_PRODUCT_IMAGE;

  // Chuẩn hóa dấu \ từ Windows thành / để tránh lỗi khi nối đường dẫn.
  image = image.replace(/\\/g, '/');

  // Link đầy đủ: giữ nguyên.
  if (/^https?:\/\//i.test(image)) return image;

  // Link dạng //domain.com/image.jpg.
  if (image.startsWith('//')) return `https:${image}`;

  // Đường dẫn public tuyệt đối như /Images_product/a.jpg hoặc /uploads/a.jpg.
  if (image.startsWith('/')) return encodeURI(image);

  // DB có thể lưu Images_product/a.jpg hoặc public/Images_product/a.jpg.
  image = image
    .replace(/^public\/Images_product\//i, '')
    .replace(/^Images_product\//i, '')
    .replace(/^\/+/, '');

  return `${PRODUCT_IMAGE_BASE_PATH}/${encodeURI(image)}`;
};

const handleProductImageError = (event) => {
  const img = event?.target;
  if (!img) return;

  const fallbackUrl = new URL(DEFAULT_PRODUCT_IMAGE, window.location.origin).href;
  if (img.src !== fallbackUrl) {
    img.src = DEFAULT_PRODUCT_IMAGE;
  }
};

const goToProduct = (id) => {
  router.push(`/product/${id}`);
};

const safeBotHtml = (html = '') => {
  // Sanitizer cơ bản để giảm rủi ro khi backend trả HTML.
  // Backend đã escape dữ liệu động từ DB; frontend vẫn chặn script/event handler thêm một lớp nữa.
  return String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};

const pushBotMessage = (data) => {
  messages.value.push({
    sender: 'bot',
    text: data.message || 'Dạ shop chưa có phản hồi phù hợp ạ.',
    products: data.products || [],
    suggestions: data.suggestions || []
  });
};


const handleBotHtmlClick = (event) => {
  const link = event.target.closest?.('a');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

  event.preventDefault();
  router.push(href);
};

const sendSuggestion = (suggestion) => {
  userInput.value = suggestion;
  sendMessage();
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const text = userInput.value.trim();
  messages.value.push({ sender: 'user', text, products: [] });
  userInput.value = '';

  isLoading.value = true;
  scrollToBottom();

  try {
    const response = await axios.post(`${API_BASE_URL}/api/chatbot`, {
      message: text,
      sessionId: getSessionId()
    });

    pushBotMessage(response.data);
  } catch (error) {
    console.error(error);
    messages.value.push({
      sender: 'bot',
      text: 'Xin lỗi, hệ thống đang quá tải, vui lòng thử lại sau.',
      products: [],
      suggestions: []
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
@keyframes customWiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.animate-custom-wiggle {
  animation: customWiggle 1.5s ease-in-out infinite;
  transform-origin: center;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #4B5563;
  border-radius: 20px;
}


.bot-html-message,
.bot-html-message :deep(*) {
  white-space: normal !important;
}

.bot-html-message {
  line-height: 1.38;
  overflow-wrap: anywhere;
}

.bot-html-message :deep(div),
.bot-html-message :deep(p),
.bot-html-message :deep(h1),
.bot-html-message :deep(h2),
.bot-html-message :deep(h3),
.bot-html-message :deep(ul),
.bot-html-message :deep(ol) {
  margin-top: 0 !important;
}

.bot-html-message :deep(br + br) {
  display: none;
}

.bot-html-message :deep(a) {
  color: inherit;
}

.bot-html-message :deep(img) {
  max-width: 100%;
}

</style>
