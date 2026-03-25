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
                <label v-for="cat in categories" :key="cat.MaDM" class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" :value="cat.MaDM" v-model="selectedCategories" class="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"/>
                  <span class="text-sm text-on-surface group-hover:text-primary transition-colors">{{ cat.TenDM }}</span>
                </label>
              </div>
            </div>

            <div class="mb-8">
              <label class="flex items-center gap-2 text-on-surface-variant font-headline text-[10px] tracking-widest uppercase mb-4">
                <span class="material-symbols-outlined text-sm">payments</span> Mức giá tối đa: <span class="text-primary font-bold">{{ formatPrice(maxPrice) }}</span>
              </label>
              <div class="px-2">
                <input v-model.number="maxPrice" type="range" min="0" max="20000000" step="500000" class="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"/>
                <div class="flex justify-between mt-2 text-[10px] font-mono text-outline">
                  <span>0đ</span>
                  <span>20M+</span>
                </div>
              </div>
            </div>

            <div v-if="availableBrands.length > 0" class="mb-8">
              <label class="flex items-center gap-2 text-on-surface-variant font-headline text-[10px] tracking-widest uppercase mb-4">
                <span class="material-symbols-outlined text-sm">stars</span> Thương hiệu
              </label>
              <div class="space-y-3">
                <label v-for="brand in availableBrands" :key="brand" class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" :value="brand" v-model="selectedBrands" class="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"/>
                  <span class="text-sm text-on-surface group-hover:text-primary transition-colors">{{ brand }}</span>
                </label>
              </div>
            </div>

            <div v-if="availableScales.length > 0" class="mb-10">
              <label class="flex items-center gap-2 text-on-surface-variant font-headline text-[10px] tracking-widest uppercase mb-4">
                <span class="material-symbols-outlined text-sm">straighten</span> Tỷ lệ
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="scale in availableScales" :key="scale" @click="toggleScale(scale)"
                  :class="['py-2 text-xs transition-all rounded font-bold', 
                    selectedScales.includes(scale) 
                      ? 'bg-primary/10 border border-primary text-primary' 
                      : 'bg-surface-container-high border border-outline-variant/20 hover:border-primary hover:text-primary text-on-surface-variant'
                  ]">
                  {{ scale }}
                </button>
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
              Tìm thấy <span class="text-primary">{{ finalProducts.length }}</span> kết quả  
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
              <span v-if="selectedScales.length" class="flex items-center gap-1 bg-surface-container-highest text-white px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30">
                {{ selectedScales.join(', ') }}
              </span>
              <span v-if="maxPrice < 20000000" class="flex items-center gap-1 bg-surface-container-highest text-white px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30">
                Dưới {{ formatPrice(maxPrice) }}
              </span>
            </div>
          </div>
          
          <div class="flex flex-row items-center gap-3 text-sm shrink-0">
            <span class="text-gray-400 font-bold whitespace-nowrap">Sắp xếp:</span>
            <select 
                v-model="sortBy" 
                class="bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-2 text-white font-bold cursor-pointer focus:ring-1 focus:ring-primary outline-none text-xs uppercase tracking-widest min-w-[180px]"
            >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá Thấp đến Cao</option>
                <option value="price_desc">Giá Cao đến Thấp</option>
            </select>
          </div>
        </div>

        <div v-if="finalProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          <div 
            v-for="sp in finalProducts" :key="sp.MaMoHinh"
            @click="router.push(`/product/${sp.MaMoHinh}`)"
            class="group relative bg-surface-container p-5 rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,143,115,0.15)] border border-outline-variant/40 hover:border-primary cursor-pointer flex flex-col h-full overflow-hidden"
          >
            <div v-if="sp.SoLuong === 0" class="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
              <span class="border-2 border-outline text-outline px-6 py-2 text-sm font-bold tracking-widest uppercase rounded">HẾT HÀNG</span>
            </div>

            <div class="absolute top-7 left-7 z-10 flex flex-col gap-2">
              <span v-if="sp.TrangThai" class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-primary text-on-primary-fixed shadow-md">
                {{ sp.TrangThai }}
              </span>
              <span v-if="sp.LoaiHinhBan" class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-tertiary text-on-tertiary-fixed shadow-md">
                {{ sp.LoaiHinhBan }}
              </span>
            </div>
            
            <div class="relative h-72 w-full mb-6 overflow-hidden rounded-xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
              <img :src="'/Images_product/' + sp.AnhDaiDien" 
                   :alt="sp.TenMH"
                   :class="['h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110', sp.SoLuong === 0 ? 'grayscale opacity-50' : '']"
              />
            </div>
            
            <div class="space-y-3 flex-1 flex flex-col justify-end">
              <div>
                <p class="text-[10px] text-outline font-bold uppercase tracking-[0.2em] mb-2">
                  {{ sp.TenHSX || 'UNKNOWN' }} • {{ sp.KichThuoc || 'N/A' }}
                </p>
                <h3 class="text-xl font-headline font-bold leading-snug group-hover:text-primary transition-colors text-white line-clamp-2">
                  {{ sp.TenMH }}
                </h3>
              </div>
              
              <div class="pt-4 mt-auto border-t border-outline-variant/30 flex justify-between items-center relative z-10">
                <span :class="['text-2xl font-headline font-bold tracking-tight', sp.SoLuong === 0 ? 'text-outline' : 'text-white']">
                  {{ formatPrice(sp.DonGia) }}
                </span>
                <button 
                  :disabled="sp.SoLuong === 0"
                  @click.stop="sp.SoLuong > 0 ? addToCart() : null" 
                  :class="['w-12 h-12 rounded-xl flex items-center justify-center transition-all', sp.SoLuong === 0 ? 'bg-surface-container text-outline cursor-not-allowed' : 'bg-primary text-on-primary-fixed hover:bg-white hover:text-primary shadow-lg shadow-primary/30']"
                >
                  <span class="material-symbols-outlined font-bold">add_shopping_cart</span>
                </button>
              </div>
            </div>
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
import TheHeader from '@/components/TheHeader.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// --- 1. BIẾN QUẢN LÝ DỮ LIỆU ---
const searchQuery = ref('');
const rawProducts = ref([]); 
const categories = ref([]);
const isSearching = ref(false);

// --- 2. BIẾN QUẢN LÝ BỘ LỌC ĐA CHIỀU ---
const selectedCategories = ref([]);
const selectedBrands = ref([]);
const selectedScales = ref([]);
const sortBy = ref('newest');
const maxPrice = ref(20000000); 

// Format tiền tệ
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// --- 3. ĐỘNG HÓA THƯƠNG HIỆU VÀ TỶ LỆ ---
// Tự động quét qua rawProducts để tìm ra các Hãng và Tỷ lệ có tồn tại (không trùng lặp)
const availableBrands = computed(() => {
  const brands = rawProducts.value.map(p => p.TenHSX).filter(b => b); // Lọc bỏ giá trị null/rỗng
  return [...new Set(brands)].sort(); // Loại bỏ trùng lặp và sắp xếp A-Z
});

const availableScales = computed(() => {
  const scales = rawProducts.value.map(p => p.KichThuoc).filter(s => s);
  return [...new Set(scales)].sort();
});

// --- 4. HÀM XỬ LÝ API ---
const fetchCategories = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/products/danhmuc');
    const dataJSON = await res.json();
    if (res.ok) categories.value = dataJSON.data || dataJSON; 
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
  }
};

const fetchAllProducts = async () => {
  isSearching.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/products'); 
    const dataJSON = await res.json();
    
    if (res.ok) {
      rawProducts.value = dataJSON.data || [];
    }
  } catch (error) {
    console.error("Lỗi tải sản phẩm:", error);
  } finally {
    isSearching.value = false;
  }
};

// --- 5. LOGIC LỌC TỰ ĐỘNG ---
const toggleScale = (scale) => {
  const index = selectedScales.value.indexOf(scale);
  if (index === -1) selectedScales.value.push(scale);
  else selectedScales.value.splice(index, 1);
};

const hasActiveFilters = computed(() => {
  return selectedCategories.value.length > 0 || 
         selectedBrands.value.length > 0 || 
         selectedScales.value.length > 0 || 
         maxPrice.value < 20000000;
});

const resetFilters = () => {
  selectedCategories.value = [];
  selectedBrands.value = [];
  selectedScales.value = [];
  maxPrice.value = 20000000;
  sortBy.value = 'newest';
};

const clearSearchAndFilters = () => {
  searchQuery.value = '';
  router.replace('/search'); // Xóa params trên URL
  resetFilters();
};

// Xử lý Lọc & Sắp xếp
const finalProducts = computed(() => {
  let result = rawProducts.value;

  // 1. Lọc theo Từ khóa gõ trên ô tìm kiếm
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase();
    result = result.filter(sp => sp.TenMH.toLowerCase().includes(keyword));
  }

  // 2. Lọc theo Danh mục
  if (selectedCategories.value.length > 0) {
    result = result.filter(sp => selectedCategories.value.includes(sp.MaDM));
  }
  
  // 3. Lọc theo Thương hiệu
  if (selectedBrands.value.length > 0) {
    result = result.filter(sp => selectedBrands.value.includes(sp.TenHSX));
  }

  // 4. Lọc theo Tỷ lệ / Kích thước
  if (selectedScales.value.length > 0) {
    result = result.filter(sp => selectedScales.value.includes(sp.KichThuoc));
  }

  // 5. Lọc theo Khoảng giá
  result = result.filter(sp => Number(sp.DonGia) <= maxPrice.value);

  // 6. Sắp xếp
  return result.slice().sort((a, b) => {
    if (sortBy.value === 'price_asc') return Number(a.DonGia - b.DonGia);
    if (sortBy.value === 'price_desc') return Number(b.DonGia - a.DonGia);
    return b.MaMoHinh - a.MaMoHinh; 
  });
});

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q;
  }
  fetchCategories();
  fetchAllProducts(); // Gọi dữ liệu 1 lần khi vào trang
});

watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || '';
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
</style>