<template>
  <nav class="sticky top-0 z-50 glass-panel border-b border-outline-variant/15 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      
      <div class="flex items-center gap-12">
        <a class="font-headline text-2xl font-bold tracking-tighter text-primary cursor-pointer" @click="router.push('/')">FigureCollect</a>
        <div class="hidden md:flex items-center gap-8">
          <a class="text-sm font-medium hover:text-primary transition-colors cursor-pointer" @click="router.push('/category')">Cửa hàng</a>
          <a class="text-sm font-medium hover:text-primary transition-colors cursor-pointer" @click="router.push('/news')">Tin tức</a>
          <a class="text-sm font-medium hover:text-primary transition-colors cursor-pointer" @click="router.push('/contact')">Liên hệ</a>
          <router-link to="/truy-xuat" class="hover:text-primary transition-colors font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8f73] to-[#e9aaff]">Truy xuất Blockchain</router-link>
        </div>
      </div>

      <div class="flex items-center gap-6">
        
        <div class="w-96 hidden lg:flex items-center relative bg-surface-container px-4 py-2 rounded-lg border border-outline-variant/10 focus-within:border-primary/50 transition-colors z-50">
          <span class="material-symbols-outlined text-outline text-xl mr-2">search</span>
          <input 
              v-model="searchQuery" 
              @input="handleSearch"
              @keyup.enter="submitSearch"
              class="bg-transparent border-none focus:ring-0 text-sm w-64 pr-8 placeholder:text-outline text-on-surface" 
              placeholder="Tìm kiếm mô hình..." 
              type="text"
          />
          
          <button 
            v-if="searchQuery" 
            @click="clearSearch"
            class="absolute right-3 text-outline hover:text-on-surface transition-colors flex items-center justify-center bg-surface-container rounded-full"
            title="Xóa tìm kiếm"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>

          <div 
              v-if="searchQuery" 
              class="absolute top-[110%] left-0 w-full bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden"
          >
              <div v-if="isSearching" class="p-6 text-center text-sm text-outline flex items-center justify-center gap-2">
                <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                Đang tìm kiếm...
              </div>
              <div v-else-if="searchResults.length === 0" class="p-6 text-center text-sm text-outline">
                Không tìm thấy mô hình nào phù hợp.
              </div>
              <div v-else class="max-h-[350px] overflow-y-auto custom-scrollbar py-2">
                <div 
                    v-for="item in searchResults" 
                    :key="item.MaMoHinh" 
                    @click="goToProduct(item.MaMoHinh)"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                >
                    <div class="w-14 h-14 shrink-0 rounded-md overflow-hidden bg-surface-container-lowest border border-white/10">
                      <img :src="'/Images_product/' + item.AnhDaiDien" :alt="item.TenMH" class="w-full h-full object-cover" />
                    </div>
                    <div class="flex-1 flex flex-col justify-center">
                      <h4 class="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                          {{ item.TenMH }}
                      </h4>
                      <span class="text-primary font-bold text-sm mt-0.5">{{ formatPrice(item.DonGia) }}</span>
                    </div>
                </div>
              </div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <button @click="router.push('/wishlist')" class="hover:text-primary transition-colors"><span class="material-symbols-outlined">favorite</span></button>
          <button @click="router.push('/cart')" class="hover:text-primary relative transition-colors outline-none" title="Xem giỏ hàng">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-primary text-on-primary-fixed text-[10px] font-bold px-1.5 rounded-full shadow-md">{{ cartCount }}</span>
          </button>
          
          <div v-if="authStore.user" class="flex items-center gap-3 ml-2 border-l border-outline-variant/30 pl-4 relative">
            <span class="text-sm font-bold text-primary hidden md:block">
              Chào, {{ authStore.user.TenKH || authStore.user.username || 'Collector' }}!
            </span>
            
            <div @click="showUserMenu = !showUserMenu" class="w-8 h-8 rounded-full overflow-hidden border border-primary/20 cursor-pointer hover:border-primary transition-all duration-300" :class="{'ring-2 ring-primary ring-offset-2 ring-offset-background': showUserMenu}">
              <img alt="User Profile" class="w-full h-full object-cover" :src="userAvatar"/>
            </div>

            <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>

            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div v-if="showUserMenu" class="absolute top-[120%] right-0 w-60 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden z-50 py-2">
                <div class="px-4 py-3 border-b border-outline-variant/10 mb-2 bg-surface-container">
                  <p class="text-sm text-on-surface font-bold truncate">{{ authStore.user.username || authStore.user.TenKH || 'Collector' }}</p>
                  <p class="text-xs text-outline truncate">{{ authStore.user.email || 'collector@figure.com' }}</p>
                </div>
                
                <a @click="router.push('/profile'); showUserMenu = false" class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-white/5 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[18px] text-primary">person</span>
                  Hồ sơ cá nhân
                </a>
                <a @click="router.push('/orders'); showUserMenu = false" class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-white/5 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[18px] text-tertiary">local_mall</span>
                  Đơn hàng của tôi
                </a>
                <a @click="router.push('/wishlist'); showUserMenu = false" class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-white/5 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[18px] text-error">favorite</span>
                  Mô hình yêu thích
                </a>
                
                <div class="h-px bg-outline-variant/10 my-2"></div>
                
                <a @click="handleLogout" class="flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer font-bold">
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                  Đăng xuất
                </a>
              </div>
            </transition>
          </div>

          <div v-else class="ml-2 border-l border-outline-variant/30 pl-4">
            <button @click="router.push({ path: '/login', query: { redirect: route.fullPath } })" class="px-5 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              Đăng nhập
            </button>
          </div>
          
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref , computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; 

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Biến điều khiển ẩn/hiện User Menu Dropdown
const showUserMenu = ref(false);
const cartCount = ref(0);

const defaultAvatar = 'default_avatar.jpg';

// Computed tự động theo dõi: Hễ authStore thay đổi là link ảnh đổi theo
const userAvatar = computed(() => {
  if (authStore.user && authStore.user.AnhDaiDien) {
    return `http://localhost:3000/Images_user/${authStore.user.AnhDaiDien}`;
  }
  return defaultAvatar;
});

// Hàm Đăng xuất
const handleLogout = () => {
  showUserMenu.value = false; // Đóng menu trước khi out
  if (authStore.logout) {
    authStore.logout();
  } else {
    localStorage.removeItem('token'); 
  }
  router.push(redirectPath);
};

// ---- LOGIC TÌM KIẾM ----
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
let searchTimeout = null;

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Hàm mới: Dọn dẹp thanh tìm kiếm khi bấm dấu (X)
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  isSearching.value = false;
};

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    clearSearch();
    return;
  }

  isSearching.value = true;
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/search?keyword=${searchQuery.value}`);
      const dataJSON = await response.json();
      
      if (response.ok) {
        searchResults.value = dataJSON.data;
      } else {
        searchResults.value = [];
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 500); 
};

const submitSearch = () => {
  if(searchQuery.value.trim() !== ''){
    router.push({ path: "/search", query: {q: searchQuery.value.trim() } });
    searchQuery.value = '';
  }
}

// Chuyển trang và xóa chữ ở tìm kiếm
const goToProduct = (id) => {
  router.push(`/product/${id}`);
  clearSearch();
};
</script>

<style scoped>
/* Giữ nguyên các class của bạn */
.glass-panel {
  background: rgba(28, 31, 43, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>