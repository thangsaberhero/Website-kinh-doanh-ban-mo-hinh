<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <div class="mb-12">
        <h1 class="text-5xl md:text-6xl font-headline font-bold tracking-tighter uppercase text-white mb-2">
          Kho Báu <span class="text-primary italic">Đang Chờ</span>
        </h1>
        <p class="text-on-surface-variant font-medium tracking-wide">
          {{ cartItems.length }} vật phẩm đã sẵn sàng để gia nhập bộ sưu tập của bạn.
        </p>
      </div>

      <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-8 space-y-4">
          
          <TransitionGroup name="list" tag="div" class="space-y-4">
            <div 
              v-for="item in cartItems" 
              :key="item.id"
              class="group relative flex flex-col md:flex-row gap-6 p-6 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 rounded-2xl"
            >
              <div class="relative w-full md:w-48 aspect-square overflow-hidden bg-surface-container-lowest rounded-xl border border-outline-variant/20 cursor-pointer" @click="goToProduct(item.id)">
                <img :src="item.image" :alt="item.name" class="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"/>
              </div>
              
              <div class="flex flex-col flex-1 justify-between py-2">
                <div>
                  <div class="flex justify-between items-start">
                    <div>
                      <span :class="`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block ${item.tagClass}`">
                        {{ item.tag }}
                      </span>
                      <h3 @click="goToProduct(item.id)" class="text-2xl font-headline font-bold text-white leading-tight cursor-pointer hover:text-primary transition-colors">
                        {{ item.name }}
                      </h3>
                      <p class="text-on-surface-variant text-sm mt-2 font-medium">{{ item.details }}</p>
                    </div>
                    <button @click="removeItem(item.id)" class="text-outline hover:text-error hover:bg-error/10 rounded-lg p-2 transition-all">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-end justify-between mt-6 md:mt-0">
                  <div class="flex items-center bg-surface-container-highest rounded-full px-2 py-1 border border-outline-variant/20">
                    <button @click="decreaseQty(item)" class="w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors">
                      <span class="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span class="w-10 text-center font-bold text-white">{{ item.qty }}</span>
                    <button @click="increaseQty(item)" class="w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors">
                      <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <div class="text-right">
                    <span class="block text-primary font-headline font-bold text-2xl tracking-tighter">
                      {{ formatPrice(item.price * item.qty) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>

        </div>

        <div class="lg:col-span-4">
          <div class="sticky top-28 bg-surface-container p-8 rounded-2xl shadow-2xl border border-outline-variant/20">
            <h2 class="text-xl font-headline font-bold tracking-widest uppercase border-b border-outline-variant/20 pb-4 mb-6 text-white">Tóm tắt đơn hàng</h2>
            
            <div class="space-y-4 mb-6 text-sm font-medium">
              <div class="flex justify-between text-on-surface-variant">
                <span>Tạm tính ({{ totalItems }} SP)</span>
                <span class="text-white">{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>Phí vận chuyển</span>
                <span class="text-primary font-bold">Miễn phí</span>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>Giảm giá</span>
                <span class="text-error font-bold">- {{ formatPrice(discount) }}</span>
              </div>
            </div>
            
            <div class="pt-6 border-t border-outline-variant/20 mb-8">
              <div class="flex justify-between items-end">
                <span class="text-lg font-bold text-white uppercase tracking-widest">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>
            
            <div class="space-y-4">
              <button @click="router.push('/checkout')" class="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest text-sm rounded-lg shadow-[0_0_20px_rgba(255,143,115,0.2)] hover:brightness-110 active:scale-95 transition-all">
                THANH TOÁN NGAY
              </button>
              <button @click="router.push('/category')" class="w-full py-4 bg-transparent border border-outline-variant/30 text-outline font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-surface-container-highest transition-colors rounded-lg">
                Tiếp tục mua sắm
              </button>
            </div>
            
            <div class="mt-8 bg-surface-container-highest p-4 rounded-xl border border-outline-variant/10 flex gap-4">
              <span class="material-symbols-outlined text-primary text-2xl">verified</span>
              <p class="text-xs leading-relaxed text-on-surface-variant font-medium">
                Cam kết 100% hàng chính hãng. Bảo hành vận chuyển 1 đổi 1 nếu hư hỏng.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
        <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">shopping_cart_off</span>
        <h2 class="text-2xl font-headline font-bold text-white mb-2">Giỏ hàng trống</h2>
        <p class="text-on-surface-variant mb-8">Kho báu của bạn đang trống trải. Hãy lấp đầy nó nhé!</p>
        <button @click="router.push('/category')" class="px-8 py-3 bg-primary text-on-primary-fixed font-bold rounded-lg hover:brightness-110 transition-all">
          Khám phá cửa hàng
        </button>
      </div>

      <section class="mt-24 pt-16 border-t border-outline-variant/15">
        <h2 class="text-3xl font-headline font-bold tracking-tight uppercase mb-8 text-white">Có thể bạn sẽ thích</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="sp in suggestions" :key="sp.id" class="group cursor-pointer">
            <div class="aspect-[3/4] bg-surface-container-low border border-outline-variant/10 rounded-xl overflow-hidden mb-4 relative p-4">
              <img :src="sp.image" :alt="sp.name" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"/>
              <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                <button @click.stop="quickAdd(sp)" class="w-12 h-12 bg-primary text-on-primary-fixed rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
            </div>
            <h4 class="font-bold text-sm text-on-surface-variant group-hover:text-white transition-colors truncate">{{ sp.name }}</h4>
            <span class="text-primary font-headline font-bold">{{ formatPrice(sp.price) }}</span>
          </div>
        </div>
      </section>

    </main>
    <footer class="bg-surface-container-lowest border-t border-outline-variant/15 pt-20 pb-10">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div class="lg:col-span-1">
            <a class="font-headline text-2xl font-bold tracking-tighter text-primary mb-6 block" href="#">FigureCollect</a>
            <p class="text-on-surface-variant text-sm leading-relaxed mb-8">
              Điểm đến hàng đầu cho cộng đồng đam mê sưu tập mô hình tại Việt Nam. Chúng tôi mang đến những artifact giá trị nhất từ khắp nơi trên thế giới.
            </p>
            <div class="flex gap-3">
              <a class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant" href="#">
                <span class="material-symbols-outlined text-xl">social_leaderboard</span>
              </a>
              <a class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant" href="#">
                <span class="material-symbols-outlined text-xl">camera</span>
              </a>
              <a class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant" href="#">
                <span class="material-symbols-outlined text-xl">play_circle</span>
              </a>
            </div>
          </div>
          <div>
            <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Hỗ trợ khách hàng</h4>
            <ul class="space-y-4 text-on-surface-variant text-sm">
              <li><a class="hover:text-primary transition-colors" href="#">Hướng dẫn đặt hàng</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Chính sách vận chuyển</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Chính sách đổi trả</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Tra cứu đơn hàng</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Về chúng tôi</h4>
            <ul class="space-y-4 text-on-surface-variant text-sm">
              <li><a class="hover:text-primary transition-colors" href="#">Về FigureCollect</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Đăng ký nhận tin</h4>
            <p class="text-on-surface-variant text-sm mb-6 leading-relaxed">Nhận thông báo sớm nhất về các đợt Pre-order giới hạn.</p>
            <div class="relative">
              <input class="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3.5 pl-4 pr-12 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Email của bạn" type="email"/>
              <button class="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-on-primary px-3 rounded flex items-center justify-center hover:brightness-110 transition-all">
                <span class="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
        <div class="border-t border-outline-variant/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-outline font-bold tracking-widest uppercase">
          <div>© 2026 FigureCollect. All rights reserved.</div>
          <div class="flex gap-6">
            <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" class="hover:text-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const toastStore = useToastStore();

// Dữ liệu giả lập Giỏ hàng (Tương lai sẽ gọi API)
const cartItems = ref([
  { 
    id: 1, 
    name: 'Gundam Aerial FM 1/100', 
    price: 1450000, 
    qty: 1, 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD36oVCAtOB1Zf5vujeklLZjTZdqnll_rL5pyZDwpxWBqcca_LTg9dt12UHWtU8TxDpSEW5w_SjGUe5rrcvBdG6lC_NKfJQaVCWV9UNJGfh3LONPLlxYPx4R6c5R2tosmbS8ybnn27aq6tfctliCyvS5qhN4aF-SHSOGoI6GPQX8nGoD6N1IpIJ2HDEQ1pckMswiMblYisG5iUnrBCQiIH3qjNLvaIpBV-YXzpzClOocZwsFlrYE-_kDrCeDoekGv-BGGrs9l8Gh9Jx', 
    tag: 'LIMITED EDITION', 
    tagClass: 'text-tertiary bg-tertiary/10 border border-tertiary/20', 
    details: 'Scale: 1/100 | Series: Witch from Mercury' 
  },
  { 
    id: 2, 
    name: 'Rimuru Tempest: Ultimate Slime', 
    price: 4200000, 
    qty: 1, 
    image: 'https://ohgatcha.com/cdn/shop/products/that-time-i-got-reincarnated-as-a-slime-rimuru-tempest-ultimate-ver-1-7-scale-figure-shibuya-scramble-figure-23602494570673_1200x.jpg?v=1681034593', 
    tag: 'PRE-ORDER', 
    tagClass: 'text-secondary bg-secondary/10 border border-secondary/20', 
    details: 'Scale: 1/7 | Manufacturer: Good Smile Company' 
  }
]);

// Dữ liệu Gợi ý sản phẩm
const suggestions = ref([
  { id: 101, name: 'Action Base 4 Clear', price: 180000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIazZeZJ24VwYtPi56dUOOkvkApxpPNzOc5aOdg0IKZnjgt_J_Rkpkp-d4GQAnTyIXVboqadXAHl4-QLmOhzOyw_6qJBiW-yDvub2RT1u1GbYIcYnCjMrmh2-lBxXXYlJBUHnUDrgZnyQV_PRcfeBieRrvwAjPixP0ou99eMTaJe6l5AMFZLwiqJOtQOndokizbE4m7-q_VsuHXFKilvb02kFoLkv_pwKYLtsM-I-d270pIWYP-e8t3JLMFoO7mKknRnj-yPlRM804' },
  { id: 102, name: 'Acrylic Box LED - 30x30x40', price: 450000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuav1sJLUfGLIsDGhGkL0Up1Zns79vrUN2mRcb_RMgJ5uK_Mqnl0279cuunmg930On4iqAOE4f78YJEj2SBip9EqfbUJwEVPiumCAkikG1Y-nZfNL6xAOshUPitpzBPVseWKhtNsFIPBrW2CmluyVkq_Q8zFzuXGxqNc_ozQ0LwsvZ7dzzTfmePNbPaYRxSfkj-fp6FGcAD9n1nskgmo0IB975S6A0OLMzOxR-hgWJspAlRDdF59Yf_QOb-S4zfdA8dE4Q2atMyW-V' },
  { id: 103, name: 'Bộ vệ sinh Figure chuyên dụng', price: 120000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdzZv9i_wS6KrZXeAobsFPJk1yYLnYtKRVPyQzCmknmrdVPnEZM7alYuTc-QE5LJPjQ60doXVfQm7pAtfGuQS2FmxFtHb4vMiigNuXEsaxZ_Qd2Ds5HuBfzXaukS5QEk22GoUaflmaB8wVyxMvtdqIJpC0jOBUy1owhuFpudDIVHuoYu_Fh1LLTFHuX4ky7GrVo2OyTsibXYGDFUkq1LFgOji3awgxcPnOc95uxr-PEYJtL0hIiIg7gdBjZ2OfMe9VLIrkapj6Ppp7' },
  { id: 104, name: 'Panel Line Accent Color', price: 95000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4msE71U7jgRXWIVdkIHSFSJ9awutXqqs3QqtvKWLBa7QTf3kJf0-L5mA7EFGMoerQ4Y_-Ge6IMnjGbzYrzuX41xPXyZ4UUGWY6RCx1JC6kemzKRqCguW9ryd3KNV-HXuWpjcwMqxP67rWms51Br5i_2vIoCF7lOW_Ieo_HuuUvoYqUiVvW7sdxv2hbfhBv6fQUWOXqoaKmYyzKwvXkevMAezc854KJPQQqXaFd_rqs0BMPWuXlIz62AYeEteiQxMO3JB-84bnh24-' }
]);

const discount = ref(150000); // Giảm giá cố định để demo

// Tính toán tự động (Reactivity)
const totalItems = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0));
const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.price * item.qty), 0));
const totalPrice = computed(() => subtotal.value > 0 ? Math.max(0, subtotal.value - discount.value) : 0);

// Các hàm xử lý
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const increaseQty = (item) => {
  if(item.qty < 10) item.qty++;
};

const decreaseQty = (item) => {
  if (item.qty > 1) item.qty--;
};

const removeItem = (id) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id);
  toastStore.showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
};

const quickAdd = (product) => {
  toastStore.showToast(`Đã thêm ${product.name} vào giỏ!`, "success");
};

const goToProduct = (id) => {
  router.push(`/product/${id}`);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

/* Hiệu ứng khi xóa item khỏi danh sách */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>