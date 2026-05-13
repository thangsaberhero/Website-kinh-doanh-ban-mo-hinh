<template>
  <div class="bg-background text-on-background selection:bg-primary selection:text-on-primary-fixed min-h-screen flex flex-col font-body"> 
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
              <span>Danh mục</span>
            </div>
            <div class="space-y-3">
              <div @click="goToCategory('')" class="flex items-center justify-between group cursor-pointer py-1">
                <span :class="['text-sm transition-colors', !categoryId ? 'text-primary font-bold' : 'group-hover:text-white text-gray-300 font-medium']">Tất cả sản phẩm</span>
                <input :checked="!categoryId" class="rounded-sm bg-surface-container-highest border-none text-primary focus:ring-offset-0 focus:ring-primary pointer-events-none" type="checkbox"/>
              </div>

              <div v-for="cat in categories" :key="cat.MaDM" class="flex flex-col">
                <div @click="goToCategory(cat.MaDM)" class="flex items-center justify-between group cursor-pointer py-2">
                  <span :class="['text-sm transition-colors', categoryId == cat.MaDM ? 'text-primary font-bold' : 'group-hover:text-white text-gray-300 font-medium']">{{ cat.TenDM }}</span>
                  <input :checked="categoryId == cat.MaDM && !subCategoryId" class="rounded-sm bg-surface-container-highest border-none text-primary focus:ring-offset-0 focus:ring-primary pointer-events-none" type="checkbox"/>
                </div>

                <div v-if="categoryId == cat.MaDM && cat.subCategories?.length > 0" class="pl-4 flex flex-col space-y-3 mt-1 mb-2 border-l border-outline-variant/30 ml-2">
                  <div
                    v-for="sub in cat.subCategories" 
                    :key="sub.MaChiTietDM"
                    @click="selectSubCategory(cat.MaDM, sub.MaChiTietDM)"
                    class="flex items-center justify-between group cursor-pointer"
                  >
                    <span :class="['text-[13px] transition-colors', subCategoryId == sub.MaChiTietDM ? 'text-primary font-bold' : 'group-hover:text-white text-gray-400']">
                      - {{ sub.TenChiTietDM }}
                    </span>
                    <input :checked="subCategoryId == sub.MaChiTietDM" class="rounded-sm bg-surface-container-highest border-none text-primary focus:ring-offset-0 focus:ring-primary pointer-events-none w-3 h-3" type="checkbox"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-10">
            <div class="flex items-center gap-2 mb-4 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <span class="material-symbols-outlined text-sm">payments</span>
              <span>Mức giá tối đa: {{ formatPrice(maxPrice) }}</span>
            </div>
            <div class="space-y-4">
              <input v-model.number="maxPrice" min="0" max="10000000" step="500000" class="w-full h-1 bg-surface-container-highest accent-primary rounded-lg appearance-none cursor-pointer" type="range"/>
              <div class="flex justify-between text-[10px] font-mono text-gray-400 font-bold">
                <span>0 VND</span>
                <span>10M VND</span>
              </div>
            </div>
          </div>
          <div v-if="availableBrands.length > 0" class="mb-10">
            <div class="flex items-center gap-2 mb-4 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <span class="material-symbols-outlined text-sm">stars</span>
              <span>Thương hiệu</span>
            </div>
            <div class="space-y-3">
              <label v-for="brand in availableBrands" :key="brand.MaHSX || brand.TenHSX" class="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  :value="brand.TenHSX" 
                  v-model="selectedBrands" 
                  class="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"
                />
                <span class="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{{ brand.TenHSX }}</span>
              </label>
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
        </header>

        <div v-if="productList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          <div 
            v-for="sp in productList" :key="sp.MaMoHinh"
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
              <img :src="'http://localhost:3000/Images_product/' + sp.AnhDaiDien" 
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
        <div v-if="totalPages > 0" class="mt-12 flex justify-center items-center gap-2 flex-wrap">
          <button 
            @click="currentPage > 1 && currentPage--" 
            :disabled="currentPage === 1"
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container text-white hover:bg-primary transition-all disabled:opacity-30 disabled:hover:bg-surface-container cursor-pointer border border-outline-variant/30"
          >
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          <button 
            v-for="(page, index) in visiblePages" :key="index"
            @click="page !== '...' ? currentPage = page : null"
            :disabled="page === '...'"
            class="w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all shadow-sm border"
            :class="[
              currentPage === page 
                ? 'bg-primary text-black shadow-lg shadow-primary/20 border-primary' 
                : 'bg-surface-container text-white border-outline-variant/30',
              page === '...' 
                ? 'cursor-default border-transparent hover:text-white bg-transparent shadow-none' 
                : 'hover:text-primary cursor-pointer hover:border-primary/50'
            ]"
          >
            {{ page }}
          </button>

          <button 
            @click="currentPage < totalPages && currentPage++" 
            :disabled="currentPage === totalPages"
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container text-white hover:bg-primary transition-all disabled:opacity-30 disabled:hover:bg-surface-container cursor-pointer border border-outline-variant/30"
          >
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>

          <div class="flex items-center gap-2 ml-4 border-l border-outline-variant/30 pl-4">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Đến trang:</span>
            <input 
              type="number" 
              placeholder=""
              min="1" 
              :max="totalPages"
              @keyup.enter="jumpToPage"
              class="w-16 h-10 bg-surface-container border border-outline-variant/30 rounded-xl text-center text-white text-xs font-bold outline-none focus:border-primary transition-colors custom-scrollbar"
            />
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore(); 

const productList = ref([]);
const categories = ref([]);
const categoryId = ref(route.params.id || '');
const subCategoryId = ref('');
const searchQuery = ref('');
const sortBy = ref('newest');
const maxPrice = ref(10000000);
const selectedBrands = ref([]);
const availableBrands = ref([]);

const currentPage = ref(1);
const limit = ref(9);
const totalPages = ref(1);
const totalItems = ref(0);

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// HÀM ĐĂNG XUẤT CHO NÚT AVATAR
const handleLogout = () => {
  authStore.user = null;
  router.push('/login');
};

// Tính toán danh sách các nút phân trang sẽ hiển thị
const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  const delta = 1; // Số lượng nút hiển thị ở hai bên trang hiện tại
  
  // Nếu tổng số trang ít (từ 5 trang trở xuống) -> Hiện tất cả, không cần dấu ...
  if (total <= 5) {
    let pages = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Nếu nhiều trang -> Bắt đầu tính toán rút gọn
  let pages = [1]; // Luôn hiện trang 1

  // Nếu trang hiện tại cách trang 1 quá xa -> Thêm dấu ...
  if (current - delta > 2) {
    pages.push('...');
  }

  // Các trang ở xung quanh trang hiện tại
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    pages.push(i);
  }

  // Nếu trang hiện tại cách trang cuối quá xa -> Thêm dấu ...
  if (current + delta < total - 1) {
    pages.push('...');
  }

  // Luôn hiện trang cuối
  pages.push(total);

  return pages;
});

// Hàm hỗ trợ "Nhảy trang nhanh" khi khách hàng nhập số
const jumpToPage = (event) => {
  const pageNum = parseInt(event.target.value);
  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
    currentPage.value = pageNum;
    event.target.value = ''; // Nhảy xong thì xóa trắng ô nhập
  } else {
    toastStore.showToast(`Vui lòng nhập trang từ 1 đến ${totalPages.value}`, "error");
  }
};

const goToCategory = (id) => {
  if (id) {
    // Nếu bấm vào đúng Danh mục cha đang hiển thị, VÀ đang có Danh mục con được chọn
    if (categoryId.value == id && subCategoryId.value !== '') {
      // 1. Reset thằng con về rỗng (tắt dấu check của con, bật dấu check của cha)
      subCategoryId.value = '';
      
      // 2. Gọi lại API lấy tất cả sản phẩm của thằng cha
      fetchProducts(id);
    } else {
      // Nếu bấm sang một Danh mục cha KHÁC, thì cứ chuyển link như bình thường
      router.push(`/category/${id}`);
    }
  } else {
    // Nếu bấm "Tất cả sản phẩm"
    router.push(`/category`);
  }
};

const getCategoryName = () => {
  if (!categoryId.value) return 'FIGURE COLLECTION';
  const currentCat = categories.value.find(c => c.MaDM == categoryId.value);
  return currentCat ? currentCat.TenDM : 'FIGURE COLLECTION';
};

const getCategoryNumber = () => {
  if (!categoryId.value) return '00';
  return ('0' + categoryId.value).slice(-2); 
};

const fetchCategories = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/products/danhmuc');
    const dataJSON = await res.json();
    
    if (res.ok) {
      const mainCats = dataJSON.data || dataJSON; 
      
      // Vòng lặp: Đi hỏi Backend xem từng Danh mục cha có Danh mục con nào không
      for (let cat of mainCats) {
        try {
          const subRes = await fetch(`http://localhost:3000/api/products/danhmuc/${cat.MaDM}/chitiet`);
          const subJSON = await subRes.json();
          if (subRes.ok) {
            cat.subCategories = subJSON.data || subJSON; // Gắn đàn con vào mảng cha
          }
        } catch (err) {
          cat.subCategories = []; 
        }
      }
      categories.value = mainCats; // Lưu lại toàn bộ dữ liệu
    }
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
  }
};

const fetchBrand = async () => {
  try{
    const res = await fetch('http://localhost:3000/api/products/hsx');
    const dataJSON = await res.json();
    if(res.ok){
      availableBrands.value = dataJSON.data || dataJSON;
    }
  }
  catch(error){
    console.error("Lỗi lấy hsx:", error);
  }
};

// Xử lý khi bấm danh mục con
const selectSubCategory = (maDM, maCTDM) => {
  subCategoryId.value = maCTDM; // Lưu lại mã thằng con
  fetchProducts(maDM, maCTDM);  // Gọi API lấy sản phẩm của thằng con
};

// Có thể lấy theo Cha hoặc theo Con
const fetchProducts = async () => {
  try {
    let url = `http://localhost:3000/api/products?page=${currentPage.value}&limit=${limit.value}`;
    if(categoryId.value)
      url += `&danhmuc=${categoryId.value}`;
    if(subCategoryId.value)
      url += `&chitietdanhmuc=${subCategoryId.value}`
    if(selectedBrands.value.length > 0)
      url += `&thuonghieu=${selectedBrands.value.join(',')}`;
    if(sortBy.value)
      url += `&sapxep=${sortBy.value}`;
    if(maxPrice.value < 20000000){
      url += `&gia=${maxPrice.value}`
    }
    
    // let apiUrl = 'http://localhost:3000/api/products'; // Mặc định lấy tất cả

    // if (maCTDM) {
    //   // Nếu bấm vào thằng con -> Gọi API lọc theo Chi Tiết Danh Mục
    //   apiUrl = `http://localhost:3000/api/products/chitietdm/${maCTDM}/products`;
    // } else if (maDM) {
    //   // Nếu chỉ bấm thằng cha -> Gọi API lọc theo Danh Mục gốc
    //   apiUrl = `http://localhost:3000/api/products/danhmuc/${maDM}/products`;
    // }
      
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      productList.value = result.data;
      totalPages.value = result.pagination.totalPage;
      totalItems.value = result.pagination.totalItems;
      currentPage.value = result.pagination.currentPage;
     }
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);
  }
};

// 5. Cập nhật Watcher: Khi bấm sang Danh mục cha khác, phải Reset thằng con
watch([categoryId, subCategoryId, selectedBrands, sortBy, limit], () => {
  currentPage.value = 1;
  fetchProducts();
});

let priceTimeout;
watch(maxPrice, () => {
  clearTimeout(priceTimeout);
  priceTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 500); 
});

// Khi bấm chuyển trang -> Chỉ gọi API tải trang mới
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Tự cuộn lên đầu
  fetchProducts();
});

const addToCart = () => {
  alert("Tính năng thêm giỏ hàng sẽ được hoàn thiện sau!");
};

onMounted(() => {
  window.scroll(0,0)
  fetchCategories();
  fetchBrand();
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