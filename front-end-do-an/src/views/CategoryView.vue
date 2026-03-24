<template>
  <div class="bg-background text-on-background selection:bg-primary selection:text-on-primary-fixed min-h-screen flex flex-col font-body">
    <TheHeader />
    
    <div class="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
      
      <aside class="w-72 hidden lg:flex flex-col border-r border-outline-variant/30 bg-surface-container-low overflow-y-auto custom-scrollbar">
        <div class="p-8">
          <div class="flex items-center gap-3 mb-10">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined text-on-primary-fixed text-lg">filter_list</span>
            </div>
            <h2 class="text-xl font-headline font-bold uppercase tracking-widest text-white">Filters</h2>
          </div>
          
          <div class="mb-10">
            <div class="flex items-center gap-2 mb-4 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <span class="material-symbols-outlined text-sm">category</span>
              <span>Category</span>
            </div>
            <div class="space-y-3">
              <label @click.prevent="goToCategory('')" class="flex items-center justify-between group cursor-pointer">
                <span :class="['text-sm transition-colors', !categoryId ? 'text-primary font-bold' : 'group-hover:text-white text-gray-300 font-medium']">Tất cả sản phẩm</span>
                <input :checked="!categoryId" class="rounded-sm bg-surface-container-highest border-none text-primary focus:ring-offset-0 focus:ring-primary pointer-events-none" type="checkbox"/>
              </label>
              
              <label 
                v-for="cat in categories" 
                :key="cat.MaDM"
                @click.prevent="goToCategory(cat.MaDM)" 
                class="flex items-center justify-between group cursor-pointer"
              >
                <span :class="['text-sm transition-colors', categoryId == cat.MaDM ? 'text-primary font-bold' : 'group-hover:text-white text-gray-300 font-medium']">{{ cat.TenDM }}</span>
                <input :checked="categoryId == cat.MaDM" class="rounded-sm bg-surface-container-highest border-none text-primary focus:ring-offset-0 focus:ring-primary pointer-events-none" type="checkbox"/>
              </label>
            </div>
          </div>

          <div class="mb-10">
            <div class="flex items-center gap-2 mb-4 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <span class="material-symbols-outlined text-sm">payments</span>
              <span>Price</span>
            </div>
            <div class="space-y-4">
              <input class="w-full h-1 bg-surface-container-highest accent-primary rounded-lg appearance-none cursor-pointer" type="range"/>
              <div class="flex justify-between text-[10px] font-mono text-gray-400 font-bold">
                <span>0 VND</span>
                <span>20M VND</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-surface p-6 lg:p-12 custom-scrollbar">
        <header class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 class="text-4xl lg:text-6xl font-headline font-bold tracking-tight mb-2 uppercase text-white">
              {{ getCategoryName() }} <span class="text-primary">{{ getCategoryNumber() }}</span>
            </h1>
            <p class="text-gray-400 max-w-xl font-medium">Khám phá những tạo tác tinh xảo nhất từ thế giới Anime và Mecha. Mỗi mô hình là một câu chuyện huyền thoại.</p>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-400 font-bold">Sắp xếp:</span>
            <button class="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] bg-surface-container px-4 py-2 rounded-lg border border-outline-variant/30 text-white hover:border-primary hover:text-primary transition-colors">
              Mới nhất <span class="material-symbols-outlined text-xs">expand_more</span>
            </button>
          </div>
        </header>

        <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          
          <div 
            v-for="sp in filteredProducts" 
            :key="sp.MaMoHinh"
            @click="router.push(`/product/${sp.MaMoHinh}`)"
            class="group relative bg-surface-container p-5 rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,143,115,0.15)] border border-outline-variant/40 hover:border-primary cursor-pointer flex flex-col h-full"
          >
            <div class="absolute top-7 left-7 z-10 flex flex-col gap-2">
              <span class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-primary text-on-primary-fixed shadow-md">
                {{ sp.LoaiHinhBan || 'Limited' }}
              </span>
            </div>
            
            <div class="relative h-72 w-full mb-6 overflow-hidden rounded-xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
              <img :src="'/Images_product/' + sp.AnhDaiDien" class="h-full w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"/>
            </div>
            
            <div class="space-y-3 flex-1 flex flex-col justify-end">
              <div>
                <p class="text-[11px] text-primary font-bold uppercase tracking-[0.2em] mb-2">
                  {{ sp.TenHSX || 'THƯƠNG HIỆU' }} • {{ sp.KichThuoc || 'N/A' }}
                </p>
                <h3 class="text-xl font-headline font-bold leading-snug group-hover:text-primary transition-colors text-white line-clamp-2">
                  {{ sp.TenMH }}
                </h3>
              </div>
              <div class="pt-4 mt-auto border-t border-outline-variant/30 flex justify-between items-center">
                <span class="text-2xl font-headline font-bold text-white tracking-tight">{{ formatPrice(sp.DonGia) }}</span>
                <button @click.stop="addToCart" class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary-fixed hover:bg-white hover:text-primary transition-all shadow-lg shadow-primary/30">
                  <span class="material-symbols-outlined font-bold">add_shopping_cart</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <div v-else class="text-center py-20 border border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-low">
          <span class="material-symbols-outlined text-6xl text-gray-500 mb-4">search_off</span>
          <h2 class="font-headline text-2xl text-white font-bold mb-2">Không tìm thấy kho báu!</h2>
          <p class="text-gray-400">Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác xem sao.</p>
        </div>

        <section class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 bg-gradient-to-br from-primary-dim to-secondary-container p-10 rounded-2xl flex flex-col justify-center relative overflow-hidden">
            <div class="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
              <span class="material-symbols-outlined text-[20rem] -mr-20 -mt-10 text-white">rocket_launch</span>
            </div>
            <h2 class="text-3xl font-headline font-bold text-white mb-4 z-10">GIA NHẬP BIỆT ĐỘI COLLECTOR</h2>
            <p class="text-white/80 max-w-md mb-8 z-10 font-medium">Đăng ký để nhận thông báo sớm nhất về các đợt Pre-order giới hạn và nhận voucher 100k cho đơn hàng đầu tiên.</p>
            <div class="flex gap-4 max-w-md z-10">
              <input class="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder:text-white/70 focus:ring-1 focus:ring-white outline-none font-medium" placeholder="Email của bạn..." type="email"/>
              <button class="bg-white text-primary-dim px-8 font-bold rounded-lg hover:bg-primary-fixed hover:text-white transition-colors shadow-lg">ĐĂNG KÝ</button>
            </div>
          </div>
          <div class="bg-surface-container p-10 rounded-2xl flex flex-col justify-center border border-outline-variant/30">
            <span class="material-symbols-outlined text-primary text-5xl mb-6">verified_user</span>
            <h3 class="text-xl font-headline font-bold mb-2 text-white">Bảo Hành Chính Hãng</h3>
            <p class="text-sm text-gray-400 font-medium leading-relaxed">Cam kết 100% hàng chính hãng, hỗ trợ bảo hành trọn đời cho các lỗi từ nhà sản xuất.</p>
          </div>
        </section>

      </main>
    </div>

    <footer class="bg-surface-container-lowest border-t border-outline-variant/30 py-12 px-6 lg:px-12 z-10 relative mt-auto">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
        <div>
          <span class="text-2xl font-bold font-headline tracking-tighter text-primary uppercase mb-4 block">FigureCollect</span>
          <p class="text-gray-400 text-xs max-w-sm font-medium leading-relaxed">© 2026 FigureCollect. Neon Vault Edition. Điểm đến tin cậy cho những nhà sưu tầm mô hình cao cấp tại Việt Nam.</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div class="space-y-4">
            <h4 class="text-[10px] font-bold uppercase tracking-widest text-primary">Thông tin</h4>
            <ul class="space-y-2 text-sm text-gray-400 font-medium">
              <li><a class="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
          <div class="space-y-4">
            <h4 class="text-[10px] font-bold uppercase tracking-widest text-primary">Hỗ trợ</h4>
            <ul class="space-y-2 text-sm text-gray-400 font-medium">
              <li><a class="hover:text-primary transition-colors" href="#">Giao hàng</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Liên hệ</a></li>
            </ul>
          </div>
          <div class="space-y-4">
            <h4 class="text-[10px] font-bold uppercase tracking-widest text-primary">Mạng xã hội</h4>
            <div class="flex gap-4">
              <a class="w-8 h-8 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center hover:bg-primary hover:text-on-primary-fixed transition-all text-white" href="#"><span class="material-symbols-outlined text-lg">public</span></a>
              <a class="w-8 h-8 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center hover:bg-primary hover:text-on-primary-fixed transition-all text-white" href="#"><span class="material-symbols-outlined text-lg">alternate_email</span></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// IMPORT THÊM AUTH STORE ĐỂ HEADER HOẠT ĐỘNG
import { useAuthStore } from '../stores/auth.js';
import TheHeader from '@/components/TheHeader.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore(); 

const productList = ref([]);
const categories = ref([]);
const categoryId = ref(route.params.id || '');
const searchQuery = ref('');

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// HÀM ĐĂNG XUẤT CHO NÚT AVATAR
const handleLogout = () => {
  authStore.user = null;
  router.push('/login');
};

const goToCategory = (id) => {
  if(id) {
    router.push(`/category/${id}`);
  } else {
    router.push(`/category`);
  }
};

const getCategoryName = () => {
  if (!categoryId.value) return 'NEON VAULT';
  const currentCat = categories.value.find(c => c.MaDM == categoryId.value);
  return currentCat ? currentCat.TenDM : 'NEON VAULT';
};

const getCategoryNumber = () => {
  if (!categoryId.value) return '00';
  return ('0' + categoryId.value).slice(-2); 
};

const fetchCategories = async () => {
  try {
    // Gọi ĐÚNG đường link /api/products/danhmuc như trong file homeview.route.js
    const res = await fetch('http://localhost:3000/api/products/danhmuc');
    const dataJSON = await res.json();
    
    if (res.ok) {
      // Dùng || để phòng hờ trường hợp BE không có bọc biến data
      categories.value = dataJSON.data || dataJSON; 
    }
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
  }
};

const fetchProducts = async (id) => {
  try {
    // Sửa lại đường link khớp với dòng 13 trong file homeview.route.js của bạn
    const apiUrl = id 
      ? `http://localhost:3000/api/products/danhmuc/${id}/products` 
      : 'http://localhost:3000/api/products';
      
    const response = await fetch(apiUrl);
    const dataJSON = await response.json();
    
    if (response.ok) {
      productList.value = dataJSON.data || dataJSON;
    }
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);
  }
};

const filteredProducts = computed(() => {
  if (!searchQuery.value) return productList.value;
  return productList.value.filter(sp => 
    sp.TenMH.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const addToCart = () => {
  alert("Tính năng thêm giỏ hàng sẽ được hoàn thiện sau!");
};

onMounted(() => {
  fetchCategories();
  fetchProducts(categoryId.value);
});

watch(() => route.params.id, (newId) => {
  categoryId.value = newId || '';
  fetchProducts(newId);
  searchQuery.value = ''; 
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }
.glass-panel { backdrop-filter: blur(12px); background: rgba(28, 31, 43, 0.6); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0c0e17; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
</style>