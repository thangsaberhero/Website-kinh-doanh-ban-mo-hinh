<template>
  <div class="bg-background text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
    
    <nav class="sticky top-0 z-50 glass-panel border-b border-outline-variant/15 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-12">
          <a @click="router.push('/')" class="cursor-pointer font-headline text-2xl font-bold tracking-tighter text-primary">FigureCollect</a>
          <div class="hidden md:flex items-center gap-8">
            <a class="text-sm font-medium hover:text-primary transition-colors" href="#">Cửa hàng</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="#">Hàng mới về</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="#">Pre-order</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="#">Phụ kiện</a>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div class="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-lg border border-outline-variant/10 focus-within:border-primary/50 transition-colors">
            <span class="material-symbols-outlined text-outline text-xl mr-2">search</span>
            <input class="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-outline text-on-surface" placeholder="Tìm kiếm mô hình..." type="text"/>
          </div>
          <div class="flex items-center gap-4">
            <button class="hover:text-primary transition-colors"><span class="material-symbols-outlined">favorite</span></button>
            <button class="hover:text-primary relative transition-colors">
              <span class="material-symbols-outlined">shopping_cart</span>
              <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 rounded-full">{{ cartCount }}</span>
            </button>
            <div class="w-8 h-8 rounded-full overflow-hidden border border-primary/20 cursor-pointer hover:border-primary transition-colors">
              <img alt="User Profile" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"/>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main v-if="product" class="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div class="lg:col-span-7 space-y-6">
          <div class="relative bg-surface-container-low rounded-lg overflow-hidden group">
            <div class="absolute top-4 left-4 z-10 flex gap-2">
              <span class="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                {{ product.LoaiHinhBan }}
              </span>
              <span class="bg-surface-bright text-on-surface text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                {{ product.TrangThai }}
              </span>
            </div>
            
            <img :src="'/Images_product/' + mainImage" class="w-full aspect-[4/5] object-contain transform group-hover:scale-105 transition-transform duration-700 p-8"/>
            
            <div class="absolute bottom-6 right-6 flex flex-col gap-2">
              <button class="p-3 bg-surface-bright/80 backdrop-blur rounded-full hover:bg-primary hover:text-on-primary transition-all shadow-xl">
                <span class="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-5 gap-4">
            <button 
              v-for="(anh, index) in allImages" 
              :key="index"
              @click="mainImage = anh"
              :class="['aspect-square bg-surface-container-high rounded overflow-hidden transition-colors', mainImage === anh ? 'border-2 border-primary' : 'border border-outline-variant/15 hover:border-primary/50']"
            >
              <img :src="'/Images_product/' + anh" class="w-full h-full object-cover" :class="mainImage === anh ? 'opacity-100' : 'opacity-60 hover:opacity-100'" />
            </button>
          </div>
        </div>

        <div class="lg:col-span-5 flex flex-col">
          <header class="mb-8">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-primary text-xs font-bold tracking-[0.2em] uppercase">{{ product.TenHSX || 'UNKNOWN' }}</span>
              <span class="text-outline-variant">•</span>
              <span class="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Mô Hình</span>
            </div>
            <h1 class="font-headline text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">{{ product.TenMH }}</h1>
            <div class="flex items-baseline gap-4 mt-6">
              <span class="font-headline text-3xl font-bold text-on-surface">{{ formatPrice(product.DonGia) }}</span>
            </div>
          </header>

          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-px bg-outline-variant/15 rounded overflow-hidden">
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Thương hiệu</span>
                <span class="text-on-surface font-semibold">{{ product.TenHSX }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Chất liệu</span>
                <span class="text-on-surface font-semibold">{{ product.ChatLieu }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kích thước</span>
                <span class="text-on-surface font-semibold">{{ product.KichThuoc }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kho hàng</span>
                <span class="text-on-surface font-semibold">{{ product.SoLuong }} hộp</span>
              </div>
              
            </div>

            <div class="space-y-4 pt-6">
              <div class="flex items-center gap-4">
                <div class="flex items-center bg-surface-container-highest rounded border border-outline-variant/20 h-14">
                  <button @click="buyQuantity > 1 && buyQuantity--" class="px-4 hover:text-primary transition-colors"><span class="material-symbols-outlined">remove</span></button>
                  <span class="w-12 text-center font-bold text-lg">{{ buyQuantity }}</span>
                  <button @click="buyQuantity < product.SoLuong && buyQuantity++" class="px-4 hover:text-primary transition-colors"><span class="material-symbols-outlined">add</span></button>
                </div>
                <button class="flex-1 h-14 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold uppercase tracking-widest rounded shadow-[0_0_20px_rgba(255,143,115,0.3)] hover:brightness-110 active:scale-95 transition-all">THÊM VÀO GIỎ HÀNG</button>
              </div>
            </div>

            <div class="pt-6 border-t border-outline-variant/15 flex items-center gap-6">
              <div class="flex flex-col">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">BẢO HÀNH</span>
                <span class="text-sm font-semibold">1 Đổi 1 trong 7 ngày</span>
              </div>
              <div class="h-8 w-px bg-outline-variant/30"></div>
              <div class="flex flex-col">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">VẬN CHUYỂN</span>
                <span class="text-sm font-semibold">Miễn phí toàn quốc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-else class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <span class="material-symbols-outlined animate-spin text-primary text-5xl">settings</span>
        <span class="font-headline text-outline tracking-widest uppercase">Đang tải dữ liệu...</span>
      </div>
    </div>

    <footer class="bg-surface-container-lowest border-t border-outline-variant/15 pt-20 pb-10 mt-auto">
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const product = ref(null);
const allImages = ref([]); 
const mainImage = ref('');
const buyQuantity = ref(1);
const cartCount = ref(0); // Khai báo biến này để Header không bị báo lỗi

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

onMounted(async () => {
  const spId = route.params.id; 
  try {
    const res = await fetch(`http://localhost:3000/api/products/${spId}`);
    if (res.ok) {
      product.value = await res.json();
      allImages.value = [...new Set([product.value.AnhDaiDien, ...product.value.danhSachAnhPhu])];
      mainImage.value = product.value.AnhDaiDien;
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }
</style>