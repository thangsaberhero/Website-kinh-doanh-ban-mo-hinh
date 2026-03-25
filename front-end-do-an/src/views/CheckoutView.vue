<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
      <form @submit.prevent="processCheckout" class="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
        
        <div class="lg:col-span-7 w-full space-y-12">
          
          <section>
            <div class="flex items-center gap-3 mb-8">
                <span class="text-primary font-headline text-3xl font-bold italic">01</span>
                <h2 class="text-2xl font-headline font-bold uppercase tracking-tight text-white">Thông tin giao hàng</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Họ và tên</label>
                <input v-model="shippingInfo.name" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="Nguyễn Văn A" type="text"/>
                </div>
                
                <div>
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Số điện thoại</label>
                <input v-model="shippingInfo.phone" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="090 123 4567" type="tel"/>
                </div>
                
                <div>
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Email</label>
                <input v-model="shippingInfo.email" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="example@collect.vn" type="email"/>
                </div>
                
                <div class="md:col-span-2">
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Địa chỉ nhận hàng</label>
                <input v-model="shippingInfo.address" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố" type="text"/>
                </div>
            </div>
        </section>

        <section>
            <div class="flex items-center gap-3 mb-8">
              <span class="text-primary font-headline text-3xl font-bold italic">02</span>
              <h2 class="text-2xl font-headline font-bold uppercase tracking-tight text-white">Phương thức thanh toán</h2>
            </div>
            
            <div class="space-y-4">
              <div :class="['border rounded-xl transition-all duration-300 overflow-hidden', paymentMethod === 'card' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="card" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Thẻ tín dụng / Ghi nợ</span>
                  <span class="material-symbols-outlined text-outline">credit_card</span>
                </label>
                
                <div v-if="paymentMethod === 'card'" class="px-6 pb-6 pt-2 border-t border-outline-variant/15 grid grid-cols-2 gap-6 slide-down">
                  <div class="col-span-2 space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Số thẻ</label>
                    <input class="w-full bg-transparent border-none border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-2 px-0 text-sm" placeholder="0000 0000 0000 0000" type="text"/>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Ngày hết hạn</label>
                    <input class="w-full bg-transparent border-none border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-2 px-0 text-sm" placeholder="MM/YY" type="text"/>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">CVV</label>
                    <input class="w-full bg-transparent border-none border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-2 px-0 text-sm" placeholder="123" type="text"/>
                  </div>
                </div>
              </div>

              <div :class="['border rounded-xl transition-all duration-300', paymentMethod === 'momo' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="momo" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Ví MoMo / ZaloPay</span>
                  <span class="material-symbols-outlined text-outline">account_balance_wallet</span>
                </label>
              </div>

              <div :class="['border rounded-xl transition-all duration-300', paymentMethod === 'cod' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="cod" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Thanh toán khi nhận hàng (COD)</span>
                  <span class="material-symbols-outlined text-outline">local_shipping</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <aside class="lg:col-span-5 w-full sticky top-24">
          <div class="bg-surface-container-high rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-outline-variant/20">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            
            <h2 class="text-xl font-headline font-bold uppercase tracking-widest mb-6 border-b border-outline-variant/20 pb-4 text-white">Tóm tắt đơn hàng</h2>
            
            <div class="space-y-6 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
              <div v-for="item in checkoutItems" :key="item.id" class="flex gap-4">
                <div class="w-20 h-20 bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden flex-shrink-0">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-contain p-2"/>
                </div>
                <div class="flex-grow flex flex-col justify-center">
                  <h4 class="text-sm font-bold text-white leading-tight line-clamp-2">{{ item.name }}</h4>
                  <p class="text-[10px] text-outline font-bold uppercase tracking-wider mt-1">SL: {{ item.qty }}</p>
                  <div class="mt-1 text-primary font-headline font-bold">{{ formatPrice(item.price) }}</div>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-outline-variant/20">
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Tạm tính</span>
                <span class="text-white">{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Phí vận chuyển</span>
                <span class="text-primary font-bold">Miễn phí</span>
              </div>
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Giảm giá</span>
                <span class="text-error font-bold">- {{ formatPrice(discount) }}</span>
              </div>
              
              <div class="flex justify-between items-end pt-6">
                <span class="text-sm font-bold uppercase tracking-widest text-white">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>

            <button 
              type="submit"
              :disabled="isProcessing"
              class="w-full mt-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest text-sm rounded-lg neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="isProcessing" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              {{ isProcessing ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT ĐẶT HÀNG' }}
            </button>

            <button 
                @click="router.push('/cart')" 
                type="button" 
                class="w-full mt-4 py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                <span class="material-symbols-outlined text-[16px]">keyboard_return</span>
                Trở về giỏ hàng
            </button>
            
            <div class="mt-6 flex items-center justify-center gap-2 text-outline text-[10px] font-bold uppercase tracking-widest">
              <span class="material-symbols-outlined text-[14px]">verified_user</span>
              Bảo hành chính hãng 100%
            </div>
          </div>
        </aside>
      </form>
    </main>
  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const isProcessing = ref(false);
const paymentMethod = ref('card'); // Mặc định chọn thẻ

// Dữ liệu Form
const shippingInfo = reactive({
  name: '',
  phone: '',
  email: '',
  address: ''
});

// Tự động điền dữ liệu nếu khách đã đăng nhập
onMounted(() => {
  if (authStore.user) {
    shippingInfo.name = authStore.user.username || authStore.user.TenKH || '';
    shippingInfo.email = authStore.user.email || '';
    // shippingInfo.phone và address sẽ fill nếu API auth trả về
  }
});

// Mock Dữ liệu đơn hàng (Truyền từ Giỏ hàng sang)
const checkoutItems = ref([
  { id: 1, name: 'Gundam Aerial - Full Mechanics 1/100', price: 1450000, qty: 1, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD36oVCAtOB1Zf5vujeklLZjTZdqnll_rL5pyZDwpxWBqcca_LTg9dt12UHWtU8TxDpSEW5w_SjGUe5rrcvBdG6lC_NKfJQaVCWV9UNJGfh3LONPLlxYPx4R6c5R2tosmbS8ybnn27aq6tfctliCyvS5qhN4aF-SHSOGoI6GPQX8nGoD6N1IpIJ2HDEQ1pckMswiMblYisG5iUnrBCQiIH3qjNLvaIpBV-YXzpzClOocZwsFlrYE-_kDrCeDoekGv-BGGrs9l8Gh9Jx' },
  { id: 2, name: 'Rimuru Tempest - Ultimate Form', price: 4200000, qty: 1, image: 'https://ohgatcha.com/cdn/shop/products/that-time-i-got-reincarnated-as-a-slime-rimuru-tempest-ultimate-ver-1-7-scale-figure-shibuya-scramble-figure-23602494570673_1200x.jpg?v=1681034593' }
]);

const discount = ref(150000);
const subtotal = computed(() => checkoutItems.value.reduce((sum, item) => sum + (item.price * item.qty), 0));
const totalPrice = computed(() => Math.max(0, subtotal.value - discount.value));

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Xử lý Đặt hàng
const processCheckout = async () => {
  isProcessing.value = true;
  
  // Giả lập gọi API tạo đơn hàng mất 2 giây
  setTimeout(() => {
    isProcessing.value = false;
    toastStore.showToast("🎉 Đặt hàng thành công!", "success");
    // Chuyển tới trang Lịch sử đơn hàng hoặc Success Page
    router.push('/ordersuccess'); 
  }, 2000);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.neon-glow {
  box-shadow: 0 0 20px rgba(255, 143, 115, 0.2);
}

.input-focus-glow:focus {
  box-shadow: 0 10px 15px -3px rgba(255, 143, 115, 0.05);
}

/* Hiệu ứng trượt mở Form nhập thẻ mượt mà */
.slide-down {
  animation: slideDown 0.3s ease-out forwards;
  transform-origin: top;
}
@keyframes slideDown {
  from { opacity: 0; transform: scaleY(0.9); }
  to { opacity: 1; transform: scaleY(1); }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
</style>