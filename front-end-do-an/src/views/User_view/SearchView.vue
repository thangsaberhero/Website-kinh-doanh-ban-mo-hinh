<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <div class="flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
      
      <aside class="w-72 hidden lg:flex flex-col border-r border-outline-variant/30 bg-surface-container-low overflow-y-auto custom-scrollbar">
        <div class="flex flex-col py-8 gap-8 px-6">
          <div>
            <h2 class="font-headline text-primary text-xs uppercase tracking-widest mb-6">Filters / Refine Artifacts</h2>
            
            <div class="mb-8">
              <label class="flex items-center gap-2 text-on-surface-variant font-headline text-[10px] tracking-widest uppercase mb-4">
                <span class="material-symbols-outlined text-sm">category</span> Danh mục
              </label>
              <div class="space-y-3">
                <div v-for="cat in categories" :key="cat.MaDM" class="flex flex-col">
                  <label class="flex items-center gap-3 cursor-pointer group mb-2">
                    <input type="checkbox" :value="cat.MaDM" v-model="selectedCategories" class="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"/>
                    <span class="text-sm text-on-surface group-hover:text-primary transition-colors font-bold">{{ cat.TenDM }}</span>
                  </label>
                  
                  <div v-if="cat.subCategories && cat.subCategories.length > 0" class="pl-7 flex flex-col space-y-2 mb-2 border-l border-outline-variant/20 ml-2">
                    <label v-for="sub in cat.subCategories" :key="sub.MaChiTietDM" class="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" :value="sub.MaChiTietDM" v-model="selectedSubCategories" class="w-3 h-3 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"/>
                      <span class="text-xs text-on-surface-variant group-hover:text-primary transition-colors">{{ sub.TenChiTietDM }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-8">
              <label class="flex items-center gap-2 text-on-surface-variant font-headline text-[10px] tracking-widest uppercase mb-4">
                <span class="material-symbols-outlined text-sm">payments</span> Mức giá tối đa: <span class="text-primary font-bold">{{ formatPrice(maxPrice) }}</span>
              </label>
              <div class="px-2">
                <input v-model.number="maxPrice" type="range" min="0" max="10000000" step="500000" class="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"/>
                <div class="flex justify-between mt-2 text-[10px] font-mono text-outline">
                  <span>0đ</span>
                  <span>10M</span>
                </div>
              </div>
            </div>

            <div v-if="availableBrands.length > 0" class="mb-8">
              <label class="flex items-center gap-2 text-on-surface-variant font-headline text-[10px] tracking-widest uppercase mb-4">
                <span class="material-symbols-outlined text-sm">stars</span> Thương hiệu
              </label>
              <div class="space-y-3">
                <label v-for="brand in availableBrands" :key="brand.TenHSX" class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" :value="brand.TenHSX" v-model="selectedBrands" class="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"/>
                  <span class="text-sm text-on-surface group-hover:text-primary transition-colors">{{ brand.TenHSX }}</span>
                </label>
              </div>
            </div>
            
            <button @click="resetFilters" v-if="hasActiveFilters" class="w-full bg-surface-container-highest text-outline hover:text-white hover:bg-outline-variant/50 py-3 font-headline font-bold text-sm tracking-widest active:scale-[0.98] transition-all rounded-lg border border-outline-variant/30">
              XÓA BỘ LỌC
            </button>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-surface p-6 lg:p-12 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/20 pb-6">
          <div class="space-y-2">
            <p class="text-primary font-headline text-sm tracking-widest font-bold uppercase">Kết quả tìm kiếm</p>
            <h1 class="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-white">
              Tìm thấy <span class="text-primary">{{ totalItems }}</span> kết quả  
              <span v-if="searchQuery">
                cho "{{ searchQuery }}"
              </span>
            </h1>
            
            <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-4 pt-2">
              <span v-if="selectedCategories.length" class="flex items-center gap-1 bg-surface-container-highest text-white px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30">
                Đã chọn {{ selectedCategories.length }} danh mục
              </span>
              <span v-if="selectedBrands.length" class="flex items-center gap-1 bg-surface-container-highest text-white px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30">
                {{ selectedBrands.join(', ') }}
              </span>
              <span v-if="maxPrice < 20000000" class="flex items-center gap-1 bg-surface-container-highest text-white px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30">
                Dưới {{ formatPrice(maxPrice) }}
              </span>
            </div>
          </div>
          
          <div class="flex flex-col items-end gap-3 text-sm shrink-0">
            <div class="flex items-center gap-3">
                <span class="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Hiển thị:</span>
                <select 
                    v-model="limit" 
                    class="bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-2 text-white font-bold cursor-pointer focus:ring-1 focus:ring-primary outline-none text-xs uppercase tracking-widest"
                >
                    <option value="9">9 Sản phẩm</option>
                    <option value="18">18 Sản phẩm</option>
                    <option value="27">27 Sản phẩm</option>
                </select>
            </div>
            
            <div class="flex items-center gap-3">
                <span class="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Sắp xếp:</span>
                <select 
                    v-model="sortBy" 
                    class="bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-2 text-white font-bold cursor-pointer focus:ring-1 focus:ring-primary outline-none text-xs uppercase tracking-widest"
                >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá Thấp đến Cao</option>
                    <option value="price_desc">Giá Cao đến Thấp</option>
                </select>
            </div>
          </div>
        </div>

        <div v-if="productList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          <ProductCard 
            v-for="sp in productList" 
            :key="sp.MaMoHinh" 
            :product="sp"
            @add-to-cart="addToCart"
          />
        </div>
        <div v-if="totalPages > 0" class="mt-12 flex justify-center items-center gap-2 flex-wrap pb-12">
          <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1" class="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container text-white hover:bg-primary transition-all disabled:opacity-30 border border-outline-variant/30">
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          <button v-for="(page, index) in visiblePages" :key="index" @click="page !== '...' ? currentPage = page : null" :disabled="page === '...'"
            :class="[
              currentPage === page ? 'bg-primary text-black shadow-lg shadow-primary/20 border-primary' : 'bg-surface-container text-white border-outline-variant/30',
              page === '...' ? 'cursor-default border-transparent hover:text-white bg-transparent shadow-none' : 'hover:text-primary cursor-pointer hover:border-primary/50',
              'w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all shadow-sm border'
            ]">
            {{ page }}
          </button>

          <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages" class="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container text-white hover:bg-primary transition-all disabled:opacity-30 border border-outline-variant/30">
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>

          <div class="flex items-center gap-2 ml-4 border-l border-outline-variant/30 pl-4">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Đến trang:</span>
            <input type="number" placeholder="" min="1" :max="totalPages" @keyup.enter="jumpToPage" class="w-16 h-10 bg-surface-container border border-outline-variant/30 rounded-xl text-center text-white text-xs font-bold outline-none focus:border-primary transition-colors custom-scrollbar" />
          </div>
        </div>
        <div v-else-if="!isSearching" class="py-32 flex flex-col items-center justify-center text-center">
          <span class="material-symbols-outlined text-7xl text-outline-variant mb-6">search_off</span>
          <h2 class="text-2xl font-headline font-bold text-white mb-2">Không tìm thấy báu vật nào</h2>
          <p class="text-on-surface-variant max-w-md mb-8">Chúng tôi không tìm thấy kết quả nào phù hợp với từ khóa và bộ lọc hiện tại.</p>
          
          <div class="mb-8">
            <p class="text-sm text-outline font-bold tracking-widest uppercase mb-4">Thử các từ khóa phổ biến:</p>
            <div class="flex flex-wrap justify-center gap-3">
              <button @click="searchQuery = 'Gundam'" class="px-4 py-2 bg-surface-container border border-outline-variant/30 rounded-full text-sm hover:border-primary hover:text-primary transition-colors">Gundam</button>
              <button @click="searchQuery = 'Naruto'" class="px-4 py-2 bg-surface-container border border-outline-variant/30 rounded-full text-sm hover:border-primary hover:text-primary transition-colors">Naruto</button>
              <button @click="searchQuery = 'One Piece'" class="px-4 py-2 bg-surface-container border border-outline-variant/30 rounded-full text-sm hover:border-primary hover:text-primary transition-colors">One Piece</button>
            </div>
          </div>

          <button @click="clearSearchAndFilters" class="px-6 py-3 border border-primary text-primary hover:bg-primary/10 rounded font-bold text-sm tracking-widest uppercase transition-colors">
            Xóa bộ lọc và Tìm kiếm lại
          </button>
        </div>

        <div v-if="isSearching" class="py-32 flex flex-col items-center justify-center text-center">
            <span class="material-symbols-outlined text-5xl text-primary animate-spin mb-4">progress_activity</span>
            <p class="text-outline font-bold tracking-widest uppercase">Đang quét kho dữ liệu...</p>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
  import TheHeader from '../../components/TheHeader.vue';
  import ProductCard from '../../components/ProductCard.vue';
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.js'; 
  import { useToastStore } from '../../stores/toast';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const toastStore = useToastStore(); 
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // --- 1. BIẾN QUẢN LÝ DỮ LIỆU & PHÂN TRANG ---
  const searchQuery = ref(route.query.q || '');
  const productList = ref([]);
  const categories = ref([]);
  const isSearching = ref(false);

  const currentPage = ref(1);
  const limit = ref(9);
  const totalPages = ref(1);
  const totalItems = ref(0);

  // --- 2. BIẾN BỘ LỌC ---
  const selectedCategories = ref([]);
  const selectedSubCategories = ref([]);
  const selectedBrands = ref([]);
  const sortBy = ref('newest');
  const maxPrice = ref(10000000); 

  const availableBrands = ref([]);
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // --- 3. HÀM TẢI DỮ LIỆU TỪ API ---
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/danhmuc`);
      const dataJSON = await res.json();
      if (res.ok) {
        const mainCats = dataJSON.data || dataJSON;
        
        for (let cat of mainCats) {
          try {
            const subRes = await fetch(`${API_BASE_URL}/api/products/danhmuc/${cat.MaDM}/chitiet`);
            const subJSON = await subRes.json();
            if (subRes.ok) {
              cat.subCategories = subJSON.data || subJSON;
            }
          } catch (err) {
            cat.subCategories = []; 
          }
        }
        categories.value = mainCats;
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  const fetchBrand = async () => {
    try{
      const res = await fetch(`${API_BASE_URL}/api/products/hsx`);
      const dataJSON = await res.json();
      if(res.ok){
        availableBrands.value = dataJSON.data || dataJSON;
      }
    }
    catch(error){
      console.error("Lỗi lấy hsx:", error);
    }
  }

  const fetchProducts = async () => {
    isSearching.value = true;
    try {
      let url = `${API_BASE_URL}/api/products?page=${currentPage.value}&limit=${limit.value}`;

      if (searchQuery.value) url += `&keyword=${encodeURIComponent(searchQuery.value)}`;
      if (selectedCategories.value.length > 0) url += `&danhmuc=${selectedCategories.value.join(',')}`;
      if (selectedSubCategories.value.length > 0) url += `&chitietdanhmuc=${selectedSubCategories.value.join(',')}`;
      if (selectedBrands.value.length > 0) url += `&thuonghieu=${selectedBrands.value.join(',')}`;
      if (sortBy.value) url += `&sapxep=${sortBy.value}`;
      if (maxPrice.value < 20000000) url += `&gia=${maxPrice.value}`;

      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        productList.value = result.data;
        totalPages.value = result.pagination.totalPage;
        totalItems.value = result.pagination.totalItems;
        currentPage.value = result.pagination.currentPage;
      }
    } 
    catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } 
    finally {
      isSearching.value = false;
    }
  };

  // --- 4. LOGIC THANH PHÂN TRANG RÚT GỌN (Giống CategoryView) ---
  const visiblePages = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    const delta = 1; 
    
    if (total <= 5) {
      let pages = [];
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    let pages = [1];
    if (current - delta > 2) pages.push('...');
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pages.push(i);
    }
    if (current + delta < total - 1) pages.push('...');
    pages.push(total);
    return pages;
  });

  const jumpToPage = (event) => {
    const pageNum = parseInt(event.target.value);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
      currentPage.value = pageNum;
      event.target.value = ''; 
    }
  };

  // --- 5. LẮNG NGHE & XÓA BỘ LỌC ---
  const hasActiveFilters = computed(() => {
    return selectedCategories.value.length > 0 || 
          selectedBrands.value.length > 0 || 
          maxPrice.value < 20000000 ||
          searchQuery.value !== '';
  });

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    let maKH = null;
    
    if (userString) {
      const userObj = JSON.parse(userString);
      maKH = userObj.MaKH;
    }

    if (!token || !maKH) {
      toastStore.showToast("🛒 Bạn cần đăng nhập để mua mô hình nhé!", "error");
      router.push({ path: '/login', query: { redirect: route.fullPath } });
      return;
    }

    try {
      const resVar = await fetch(`${API_BASE_URL}/api/products/variants/${product.MaMoHinh}`);
      const varJSON = await resVar.json();
      
      let maPhanLoai = null;
      if (resVar.ok && varJSON.data.length > 0) {
        maPhanLoai = varJSON.data[0].MaPhanLoai; 
      } else {
        toastStore.showToast("⚠️ Sản phẩm này đang bị lỗi phân loại!", "error");
        return;
      }

      const payload = { MaPhanLoai: maPhanLoai, soluong: 1 };
      const response = await fetch(`${API_BASE_URL}/api/don_hang/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload) 
      });

      const data = await response.json();
      if (response.ok) {
        toastStore.showToast(`🛒 Đã thêm ${product.TenMH} vào giỏ!`, "success"); 
        window.dispatchEvent(new Event('cart-updated'));
      } 
      else {
        toastStore.showToast("⚠️ Lỗi: " + data.message, "error"); 
      }
    } 
    catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
    }
  };

  const resetFilters = () => {
    selectedCategories.value = [];
    selectedSubCategories.value = [];
    selectedBrands.value = [];
    maxPrice.value = 20000000;
    sortBy.value = 'newest';
    searchQuery.value = '';
    router.replace('/search');
  };

  const clearSearchAndFilters = () => {
    resetFilters();
  };

  watch([selectedCategories, selectedSubCategories, selectedBrands, sortBy, limit], () => {
    currentPage.value = 1;
    fetchProducts();
  });

  let searchTimeout;
  watch([searchQuery, maxPrice], () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchProducts();
    }, 500); 
  });

  watch(currentPage, () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProducts();
  });

  // Bắt URL param
  watch(() => route.query.q, (newQuery) => {
    if(newQuery !== searchQuery.value) {
      searchQuery.value = newQuery || '';
    }
  });

  const scrollToTopCustom = (duration = 1000) => {
    const startPosition = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      let progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Thực hiện cuộn
      window.scrollTo(0, startPosition * (1 - easeProgress));

      // Nếu chưa hết thời gian thì tiếp tục gọi animation
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };
  onMounted(() => {
    scrollToTopCustom(1500);
    fetchCategories();
    fetchProducts(); 
    fetchBrand();
  });
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
</style>