<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    
    <div v-if="isOpen" 
         class="w-80 bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl flex flex-col mb-4 overflow-hidden transition-all duration-300">
      
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
        <div v-for="(msg, index) in messages" :key="index" 
             :class="msg.sender === 'user' ? 'self-end' : 'self-start'"
             class="max-w-[85%]">
          
          <div :class="msg.sender === 'user' 
                ? 'bg-[#ff7a59] text-white rounded-l-xl rounded-tr-xl' 
                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-r-xl rounded-tl-xl'"
               class="px-4 py-2 text-sm shadow-sm"
               v-html="msg.text">
          </div>

          <div v-if="msg.products && msg.products.length > 0" class="mt-2 flex flex-col gap-2">
            <div v-for="sp in msg.products" :key="sp.MaMoHinh" 
                 @click="goToProduct(sp.MaMoHinh)"
                 class="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer hover:bg-gray-700 hover:border-[#ff7a59] transition-all group">
              
              <img :src="/Images_product/ + sp.LinkAnh" class="w-14 h-14 object-cover rounded-lg bg-white" alt="img" />
              
              <div class="flex-1 overflow-hidden">
                <div class="text-sm font-semibold text-white truncate group-hover:text-[#ff7a59] transition-colors">
                  {{ sp.TenMH }}
                </div>
                <div class="text-xs text-[#ff7a59] font-bold mt-1">
                  {{ formatPrice(sp.GiaGoc || sp.GiaThucTe) }}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        <div v-if="isLoading" class="self-start max-w-[85%] bg-gray-800 border border-gray-700 rounded-r-xl rounded-tl-xl px-4 py-3 shadow-sm flex items-center gap-1">
          <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
          <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
          <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
        </div>
      </div>

      <div class="p-3 bg-gray-800 border-t border-gray-700 flex items-center gap-2">
        <input v-model="userInput" @keyup.enter="sendMessage" 
               type="text" placeholder="Nhập tin nhắn..." :disabled="isLoading"
               class="flex-1 bg-gray-900 text-white border border-gray-700 rounded-full px-4 py-2 text-sm outline-none focus:border-[#ff7a59] transition-colors placeholder-gray-500 disabled:opacity-50" />
        
        <button @click="sendMessage" :disabled="isLoading"
                class="bg-[#ff7a59] text-white p-2 rounded-full hover:bg-orange-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>

    <button @click="isOpen = !isOpen" 
            class="bg-[#ff7a59] hover:bg-orange-600 text-white w-16 h-16 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center transition-transform hover:scale-110 overflow-hidden relative group">
      
      <div v-if="!isOpen" class="animate-custom-wiggle flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="6" width="14" height="12" rx="2" stroke-linecap="round"/>
          <path d="M3 10V14" stroke-linecap="round"/>
          <path d="M21 10V14" stroke-linecap="round"/>
          <path d="M12 6V3M10 3h4" stroke-linecap="round"/>
          <circle cx="9" cy="11.5" r="1.2" fill="white" stroke="white"/>
          <circle cx="15" cy="11.5" r="1.2" fill="white" stroke="white"/>
          <path d="M9 15h6M9 15c0 1 1 2 3 2s3-1 3-2" stroke-linecap="round"/>
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
import { ref, nextTick } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; 

const router = useRouter();
const isOpen = ref(false);
const userInput = ref('');
const isLoading = ref(false); // Biến theo dõi trạng thái gọi API
const chatBox = ref(null); // Ref để tham chiếu tới thẻ div bao bọc tin nhắn
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const messages = ref([
  { sender: 'bot', text: 'Xin chào! Mình là trợ lý ảo của FigureCollect. Bạn cần tìm mô hình nào?', products: [] }
]);

const formatPrice = (price) => {
  if (!price) return 'Liên hệ';
  return Number(price).toLocaleString('vi-VN') + ' đ';
};

const goToProduct = (id) => {
  router.push(`/product/${id}`); 
  //isOpen.value = false; 
};

// Hàm tự động cuộn xuống cuối cùng
const scrollToBottom = async () => {
  await nextTick(); // Đợi DOM cập nhật xong
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const text = userInput.value;
  messages.value.push({ sender: 'user', text });
  userInput.value = '';
  
  isLoading.value = true; // Bật hiệu ứng "đang gõ"
  scrollToBottom(); // Cuộn ngay khi user vừa gửi tin nhắn

  try {
    const response = await axios.post(`${API_BASE_URL}/api/chatbot`, { message: text });
    
    messages.value.push({ 
      sender: 'bot', 
      text: response.data.message,
      products: response.data.products || [] 
    });
  } catch (error) {
    console.error(error);
    messages.value.push({ sender: 'bot', text: 'Xin lỗi, hệ thống đang quá tải, vui lòng thử lại sau.' });
  } finally {
    isLoading.value = false; // Tắt hiệu ứng "đang gõ" dù thành công hay lỗi
    scrollToBottom(); // Cuộn lần nữa khi bot đã trả lời xong
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
  background-color: #4B5563; /* Tailwind gray-600 */
  border-radius: 20px;
}
</style>