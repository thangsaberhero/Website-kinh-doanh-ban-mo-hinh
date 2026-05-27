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
                      <img :src="'http://localhost:3000/Images_product/' + item.AnhDaiDien" :alt="item.TenMH" class="w-full h-full object-cover" />
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
          <div class="relative" @mouseenter="showMiniCart = true" @mouseleave="showMiniCart = false">          
            <button @click="router.push('/cart')" class="hover:text-primary relative transition-colors outline-none py-2" title="Xem giỏ hàng">
              <span class="material-symbols-outlined">shopping_cart</span>
              <span v-if="cartCount > 0" class="absolute top-0 -right-1 bg-primary text-on-primary-fixed text-[10px] font-bold px-1.5 rounded-full shadow-md">{{ cartCount }}</span>
            </button>

            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div v-show="showMiniCart" class="absolute top-full right-0 pt-4 z-50"> 
                <div class="w-80 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden flex flex-col cursor-default">                    
                  <div class="px-4 py-3 border-b border-outline-variant/10 bg-surface-container flex justify-between items-center">
                    <span class="text-sm font-bold text-on-surface">Giỏ hàng của bạn</span>
                    <span class="text-xs font-medium text-primary">{{ cartCount }} sản phẩm</span>
                  </div>

                  <div v-if="cartItems.length > 0" class="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    <div v-for="item in cartItems" :key="item.MaPhanLoai" class="flex gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group relative">
                      <div class="w-16 h-16 shrink-0 rounded bg-surface-container-lowest border border-white/10 overflow-hidden cursor-pointer" @click="goToProduct(item.MaMoHinh)">
                        <img :src="'http://localhost:3000/Images_product/' + item.AnhDaiDien" :alt="item.TenMH" class="w-full h-full object-cover">
                      </div>
                      
                      <div class="flex-1 flex flex-col justify-between overflow-hidden pr-8">
                        <h4 @click="goToProduct(item.MaMoHinh)" class="text-xs font-bold text-on-surface line-clamp-2 cursor-pointer hover:text-primary transition-colors">{{ item.TenMH }}</h4>
                        <div class="flex justify-between items-end">
                          <span class="text-[10px] text-outline">SL: {{ item.SoLuong }}</span>
                          <span class="text-sm font-bold text-primary">{{ formatPrice(item.DonGia) }}</span>
                        </div>
                      </div>

                      <button @click.stop="removeFromCart(item.MaPhanLoai)" 
                              class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-outline hover:text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20" 
                              title="Xóa khỏi giỏ">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div v-else class="py-10 text-center flex flex-col items-center">
                    <span class="material-symbols-outlined text-4xl text-outline mb-2">production_quantity_limits</span>
                    <p class="text-sm text-outline font-medium">Giỏ hàng đang trống</p>
                  </div>

                  <div class="p-4 border-t border-outline-variant/10 bg-surface-container-lowest">
                    <div class="flex justify-between items-center mb-4">
                      <span class="text-sm text-on-surface-variant font-medium">Tổng tạm tính:</span>
                      <span class="text-lg font-bold text-primary">{{ formatPrice(cartTotal) }}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <button @click="router.push('/cart'); showMiniCart = false" class="py-2.5 text-xs font-bold text-on-surface bg-surface-container border border-outline-variant/20 hover:border-primary/50 hover:text-primary rounded-lg transition-all text-center">
                        Xem giỏ hàng
                      </button>
                      <button @click="router.push('/checkout'); showMiniCart = false" class="py-2.5 text-xs font-bold text-on-primary bg-primary hover:brightness-110 rounded-lg transition-all shadow-lg shadow-primary/20 text-center" :disabled="cartItems.length === 0" :class="{'opacity-50 cursor-not-allowed': cartItems.length === 0}">
                        Thanh toán
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          
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
  import { ref , computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '@/stores/auth'; 

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const showUserMenu = ref(false);
  const cartCount = ref(0);
  const showMiniCart = ref(false);
  const cartItems = ref([]);
  const cartTotal = ref(0);

  const userAvatar = computed(() => {
    if (authStore.user && authStore.user.AnhDaiDien) {
      return `http://localhost:3000/Images_user/${authStore.user.AnhDaiDien}`;
    }
    const name = authStore.user?.TenKH || authStore.user?.username || authStore.user?.TenDN || 'Collector';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff8f73&color=fff&bold=true&size=150`;
  });

  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
      cartItems.value = [];
      cartCount.value = 0;
      cartTotal.value = 0;
      return;
    }

    const userObj = JSON.parse(userString);
    
    if (userObj && userObj.MaKH) {
      try {
        const response = await fetch(`http://localhost:3000/api/don_hang/watch?t=${new Date().getTime()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });

        const result = await response.json();

        if (response.ok && result.data) {
          cartItems.value = result.data;
          cartCount.value = result.data.reduce((total, item) => total + Number(item.SoLuong || 0), 0);
          cartTotal.value = result.data.reduce((total, item) => total + Number(item.ThanhTien || 0), 0);
        } 
        else {
          cartItems.value = [];
          cartCount.value = 0;
          cartTotal.value = 0;
        }
      } 
      catch (error) {
        console.error("Lỗi tải mini-cart:", error);
        cartItems.value = [];
        cartCount.value = 0;
        cartTotal.value = 0;
      }
    } 
  };

  const removeFromCart = async (maPhanLoai) => {
    if (!authStore.user || !authStore.user.MaKH) return;
    try {
      const response = await fetch('http://localhost:3000/api/don_hang/delete', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MaKH: authStore.user.MaKH,
          MaPhanLoai: maPhanLoai
        })
      });

      const result = await response.json();
      if (response.ok || result.message === "Xoá món hàng trong giỏ thành công!") {
        fetchCartData(); 
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  onMounted(() => {
    fetchCartData();
    window.addEventListener('cart-updated', fetchCartData);
  });

  onUnmounted(() => {
    window.removeEventListener('cart-updated', fetchCartData);
  });
  
  watch(() => authStore.user, () => {
    fetchCartData();
  });

  const handleLogout = () => {
    showUserMenu.value = false; 
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

  const goToProduct = (id) => {
    router.push(`/product/${id}`);
    clearSearch();
    showMiniCart.value = false;
  };
</script>

<style scoped>
  .glass-panel {
    background: rgba(28, 31, 43, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
</style>