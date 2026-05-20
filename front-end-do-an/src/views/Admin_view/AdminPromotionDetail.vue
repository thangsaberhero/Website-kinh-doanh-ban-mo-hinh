<template>
  <div class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800">
    <div v-show="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"></div>
    <AdminSideBar :is-collapsed="isSidebarCollapsed" :is-mobile-open="isMobileMenuOpen" />
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden w-full relative">
      <AdminHeader @toggle-sidebar="handleToggleSidebar" />
      <main class="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-24">
        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff8f73]"></div>
        </div>

        <!-- Nội dung chính - chỉ hiển thị khi có data -->
        <template v-else-if="detailData">
          <div class="flex items-center gap-4 border-b border-slate-200 pb-4">
            <button @click="$router.push('/admin/promotion')" class="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all shadow-sm">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider"
                      :class="promoType === 'campaign' ? 'bg-orange-50 text-[#ff8f73] border border-orange-200' : 'bg-purple-50 text-purple-600 border border-purple-200'">
                  {{ promoType === 'campaign' ? 'Khuyến mãi hệ thống' : 'Mã Voucher' }}
                </span>
              </div>
              <h1 class="text-2xl font-brand font-bold text-slate-900 mt-1">
                {{ detailData.TenKM || detailData.TenMaGiamGia || 'Đang tải...' }}
              </h1>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <span class="material-symbols-outlined text-slate-400 text-3xl">calendar_today</span>
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thời gian áp dụng</p>
                <p class="text-xs font-bold text-slate-700 mt-1">Từ: {{ formatDate(detailData.ThoiGianBD) }}</p>
                <p class="text-xs font-bold text-slate-700">Đến: {{ formatDate(detailData.ThoiGianKT) }}</p>
              </div>
            </div>

            <div v-if="promoType === 'voucher'" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <span class="material-symbols-outlined text-purple-400 text-3xl">confirmation_number</span>
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cấu hình mã code</p>
                <p class="text-sm font-black text-slate-900 mt-1">MÃ: {{ detailData.MaVoucher }}</p>
                <p class="text-xs font-medium text-slate-500">Đơn tối thiểu: {{ formatCurrency(detailData.MucGiaToiThieu) }}</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <span class="material-symbols-outlined text-emerald-400 text-3xl">analytics</span>
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Trạng thái vận hành</p>
                <p class="text-sm font-bold mt-1" :class="detailData.TrangThaiHoatDong === 1 ? 'text-emerald-600' : 'text-slate-400'">
                  {{ detailData.TrangThaiHoatDong === 1 ? 'Đang kích hoạt' : 'Đang tạm ẩn' }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit border border-slate-200">
            <button @click="activeSubTab = 'products'" :class="activeSubTab === 'products' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500'" class="px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">category</span> Sản phẩm áp dụng
            </button>
            <button @click="activeSubTab = 'logs'" :class="activeSubTab === 'logs' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500'" class="px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">history</span> Lịch sử sử dụng
            </button>
          </div>

          <!-- Tab Sản phẩm -->
          <div v-if="activeSubTab === 'products'" class="space-y-4">
            <div class="flex justify-end">
              <button @click="openAddProductModal" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
                <span class="material-symbols-outlined text-[16px]">add</span> Thêm sản phẩm vào chiến dịch
              </button>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                  <tr>
                    <th class="py-4 px-6">Tên mô hình / Phân loại</th>
                    <th class="py-4 px-6">Giá gốc</th>
                    <th class="py-4 px-6">Chiết khấu giảm</th>
                    <th class="py-4 px-6">Giá sau giảm</th>
                    <th class="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sp in productsList" :key="sp.MaPhanLoai" class="border-b border-slate-100 hover:bg-slate-50/50">
                    <td class="py-4 px-6">
                      <p class="font-bold text-slate-900 text-sm">{{ sp.TenMH }}</p>
                      <p class="text-[11px] text-slate-400 font-medium mt-0.5">Phân loại: {{ sp.TenPhanLoai || sp.chiTietPhanLoai || 'Mặc định' }}</p>
                    </td>
                    <td class="py-4 px-6 text-sm text-slate-600">{{ formatCurrency(sp.DonGia) }}</td>
                    <td class="py-4 px-6">
                      <span class="font-bold text-rose-500 text-xs px-2 py-1 rounded bg-rose-50 border border-rose-100">
                        {{ sp.LoaiGiamGia === 'TienMat' ? `-${formatCurrency(sp.ChietKhau || 0)}` : `-${sp.ChietKhau || 0}%` }}
                      </span>
                    </td>
                    <td class="py-4 px-6 font-bold text-emerald-600 text-sm">{{ formatCurrency(sp.DonGiaKhuyenMai) }}</td>
                    <td class="py-4 px-6 text-right">
                      <button @click="openDeleteProductModal(sp)" class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="productsList.length === 0">
                    <td colspan="5" class="py-12 text-center text-slate-400 text-sm font-medium">Chiến dịch này áp dụng cho toàn bộ cửa hàng hoặc chưa thiết lập sản phẩm.</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="paginationSP.totalPage > 1" class="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
                <button @click="changeSPPage(paginationSP.currentPage - 1)" :disabled="paginationSP.currentPage === 1" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Trước</button>
                <button @click="changeSPPage(paginationSP.currentPage + 1)" :disabled="paginationSP.currentPage === paginationSP.totalPage" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Sau</button>
              </div>
            </div>
          </div>

          <!-- Tab Lịch sử -->
          <div v-if="activeSubTab === 'logs'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                <tr>
                  <th class="py-4 px-6">Mã lịch sử</th>
                  <th class="py-4 px-6">Khách hàng</th>
                  <th class="py-4 px-6">Mã đơn hàng</th>
                  <th class="py-4 px-6">Số tiền đã giảm</th>
                  <th class="py-4 px-6">Thời gian dùng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logsList" :key="log.MaLichSu" class="border-b border-slate-100 hover:bg-slate-50/50">
                  <td class="py-4 px-6 font-mono text-xs text-slate-400">#{{ log.MaLichSu }}</td>
                  <td class="py-4 px-6 text-sm font-bold text-slate-800">{{ log.TenKH || 'Khách ẩn danh' }}</td>
                  <td class="py-4 px-6 text-xs text-sky-600 font-bold hover:underline cursor-pointer">ĐH #{{ log.MaDH }}</td>
                  <td class="py-4 px-6 text-sm font-black text-rose-500">-{{ formatCurrency(log.SoTienDaGiam) }}</td>
                  <td class="py-4 px-6 text-xs text-slate-500">{{ formatDate(log.ThoiGianSuDung) }}</td>
                </tr>
                <tr v-if="logsList.length === 0">
                  <td colspan="5" class="py-12 text-center text-slate-400 text-sm font-medium">Chưa có khách hàng nào áp dụng chương trình này.</td>
                </tr>
              </tbody>
            </table>
            <div v-if="paginationLog.totalPage > 1" class="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <button @click="changeLogPage(paginationLog.currentPage - 1)" :disabled="paginationLog.currentPage === 1" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Trước</button>
              <button @click="changeLogPage(paginationLog.currentPage + 1)" :disabled="paginationLog.currentPage === paginationLog.totalPage" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Sau</button>
            </div>
          </div>
        </template>

        <!-- Nếu không có dữ liệu và không loading -->
        <div v-else class="text-center text-slate-500 py-12">Không tìm thấy thông tin chương trình.</div>
      </main>
    </div>

    <div v-if="isAddProductModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-500">add_shopping_cart</span>
            Thêm sản phẩm vào {{ promoType === 'campaign' ? 'Khuyến mãi' : 'Voucher' }}
          </h3>
          <button @click="isAddProductModalOpen = false" class="text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Tìm kiếm Mô hình / Sản phẩm</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input v-model="searchProductQuery" @input="debounceSearchProduct" type="text" placeholder="Nhập tên mô hình..."
                     class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none">
            </div>
            <div v-if="searchedProducts.length > 0" class="mt-2 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <div v-for="prod in searchedProducts" :key="prod.MaPhanLoai"
                   @click="selectProduct(prod)"
                   class="px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-emerald-50 flex justify-between items-center"
                   :class="selectedProduct?.MaPhanLoai === prod.MaPhanLoai ? 'bg-emerald-100/50 border-l-4 border-emerald-500' : ''">
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ prod.TenMH }}</p>
                  <p class="text-[11px] text-slate-500">Phân loại: {{ prod.TenPhanLoai || 'Mặc định' }} - Giá: {{ formatCurrency(prod.DonGia) }}</p>
                </div>
                <span v-if="selectedProduct?.MaPhanLoai === prod.MaPhanLoai" class="material-symbols-outlined text-emerald-500">check_circle</span>
              </div>
            </div>
            <p v-else-if="searchProductQuery && searchedProducts.length === 0 && !selectedProduct" class="text-xs text-rose-500 mt-2">Không tìm thấy sản phẩm.</p>
          </div>
          <div v-if="selectedProduct && promoType === 'campaign'" class="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <h4 class="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">Cấu hình mức giảm cho sản phẩm này</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Loại giảm giá</label>
                <select v-model="addProductForm.LoaiGiamGia" class="w-full border border-orange-200 rounded-lg p-2.5 text-sm">
                  <option value="ChietKhau">Phần trăm (%)</option>
                  <option value="TienMat">Số tiền cố định (đ)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Mức giảm</label>
                <input v-model="addProductForm.ChietKhau" type="number" min="0" class="w-full border border-orange-200 rounded-lg p-2.5 text-sm">
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button @click="isAddProductModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl">Hủy</button>
          <button @click="submitAddProduct" :disabled="!selectedProduct" class="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 rounded-xl disabled:opacity-50">Lưu</button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isDeleteProductModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
      <div class="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-rose-200">
        <span class="material-symbols-outlined text-3xl">warning</span>
      </div>
      <h3 class="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa sản phẩm</h3>
      <p class="text-sm text-slate-500 mb-6">
        Bạn có chắc chắn muốn xóa <br>
        <span class="font-bold text-slate-700">"{{ productToDelete?.TenMH }}"</span> khỏi danh sách áp dụng?
      </p>
      <div class="flex justify-center gap-3">
        <button @click="isDeleteProductModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full">Hủy</button>
        <button @click="confirmDeleteProduct" class="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 rounded-xl transition-all w-full">Xóa</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
import AdminHeader from "../../components/Admin/AdminHeader.vue";
import { useToastStore } from '../../stores/toast';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const isSidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const activeSubTab = ref('products');
const isLoading = ref(true);
const isDeleteProductModalOpen = ref(false);
const productToDelete = ref(null);

const promoId = route.params.id;
const promoType = computed(() => route.path.includes('/voucher/') ? 'voucher' : 'campaign');

const detailData = ref(null);
const productsList = ref([]);
const logsList = ref([]);
const paginationSP = ref({ currentPage: 1, totalPage: 1 });
const paginationLog = ref({ currentPage: 1, totalPage: 1 });

// Modal
const isAddProductModalOpen = ref(false);
const searchProductQuery = ref('');
const searchedProducts = ref([]);
const selectedProduct = ref(null);
const addProductForm = ref({
  MaPhanLoai: '',
  LoaiGiamGia: 'ChietKhau',
  ChietKhau: 0,
  GiaTriGiamToiDa: null,
  SoLuongKM: null
});

// Helper
const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Fetch chính
const fetchDetailData = async () => {
  isLoading.value = true;
  try {
    const endpoint = promoType.value === 'campaign'
      ? `http://localhost:3000/api/khuyen_mai_admin/${promoId}?page_sp=${paginationSP.value.currentPage}&page_log=${paginationLog.value.currentPage}`
      : `http://localhost:3000/api/khuyen_mai_admin/vouchers/${promoId}?page_sp=${paginationSP.value.currentPage}&page_log=${paginationLog.value.currentPage}`;
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await res.json();
    if (result.success) {
      detailData.value = result.data.tt;
      productsList.value = result.data.detail || [];
      logsList.value = result.data.log || [];
      paginationSP.value = {
        currentPage: result.pagination_sp?.currentPage || 1,
        totalPage: result.pagination_sp?.totalPage || 1
      };
      paginationLog.value = {
        currentPage: result.pagination_log?.currentPage || 1,
        totalPage: result.pagination_log?.totalPage || 1
      };
    } else {
      console.error('API error:', result.message);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    isLoading.value = false;
  }
};

// Phân trang
const changeSPPage = (page) => {
  if (page < 1 || page > paginationSP.value.totalPage) return;
  paginationSP.value.currentPage = page;
  fetchDetailData();
};
const changeLogPage = (page) => {
  if (page < 1 || page > paginationLog.value.totalPage) return;
  paginationLog.value.currentPage = page;
  fetchDetailData();
};

const openDeleteProductModal = (product) => {
  productToDelete.value = product;
  isDeleteProductModalOpen.value = true;
};

const confirmDeleteProduct = async () => {
  if (!productToDelete.value) return;
  const product = productToDelete.value;
  try {
    const endpoint = promoType.value === 'campaign'
      ? `http://localhost:3000/api/khuyen_mai_admin/${promoId}/products/${product.MaPhanLoai}`
      : `http://localhost:3000/api/khuyen_mai_admin/vouchers/${promoId}/products/${product.MaPhanLoai}`;
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      toastStore.showToast('Xóa sản phẩm thành công!', 'success');
      fetchDetailData();
    } 
    else {
      toastStore.showToast('Xóa thất bại', 'error');
    }
  } 
  catch (error) {
    console.error(error);
    toastStore.showToast('Lỗi kết nối máy chủ', 'error');
  } 
  finally {
    isDeleteProductModalOpen.value = false;
    productToDelete.value = null;
  }
};

// Tìm kiếm sản phẩm
let searchTimeout;
const debounceSearchProduct = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (!searchProductQuery.value.trim()) {
      searchedProducts.value = [];
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/khuyen_mai_admin/search/products?search=${encodeURIComponent(searchProductQuery.value)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      if (result.success) searchedProducts.value = result.data;
      else searchedProducts.value = [];
    } 
    catch (error) {
      console.error(error);
      searchedProducts.value = [];
    }
  }, 500);
};

const selectProduct = (product) => {
  selectedProduct.value = product;
  addProductForm.value.MaPhanLoai = product.MaPhanLoai;
  searchProductQuery.value = `${product.TenMH} - ${product.TenPhanLoai || ''}`;
  searchedProducts.value = [];
};

const openAddProductModal = () => {
  selectedProduct.value = null;
  addProductForm.value = { MaPhanLoai: '', LoaiGiamGia: 'ChietKhau', ChietKhau: 0, GiaTriGiamToiDa: null, SoLuongKM: null };
  searchProductQuery.value = '';
  searchedProducts.value = [];
  isAddProductModalOpen.value = true;
};

const submitAddProduct = async () => {
  if (!selectedProduct.value) {
    toastStore.showToast('Vui lòng chọn một sản phẩm', 'error');
    return;
  }
  if (!selectedProduct.value.MaPhanLoai) {
    toastStore.showToast('Sản phẩm không có mã phân loại hợp lệ', 'error');
    return;
  }

  // Tạo payload an toàn, tránh gửi undefined/null không cần thiết
  let payload = {};
  if (promoType.value === 'campaign') {
    const chietKhau = Number(addProductForm.value.ChietKhau);
    
    if (isNaN(chietKhau) || chietKhau <= 0) {
      toastStore.showToast('Vui lòng nhập mức giảm giá hợp lệ (>0)', 'error');
      return;
    }

    payload = {
      MaPhanLoai: selectedProduct.value.MaPhanLoai,
      LoaiGiamGia: addProductForm.value.LoaiGiamGia,
      ChietKhau: chietKhau,
      GiaTriGiamToiDa: addProductForm.value.GiaTriGiamToiDa ? Number(addProductForm.value.GiaTriGiamToiDa) : null,
      SoLuongKM: addProductForm.value.SoLuongKM ? Number(addProductForm.value.SoLuongKM) : null
    };
  } else {
    payload = {
      MaPhanLoai: selectedProduct.value.MaPhanLoai
    };
  }

  console.log('📦 Payload gửi đi:', payload); // Debug

  try {
    const endpoint = promoType.value === 'campaign'
      ? `http://localhost:3000/api/khuyen_mai_admin/${promoId}/products`
      : `http://localhost:3000/api/khuyen_mai_admin/vouchers/${promoId}/products`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    console.log('📡 Response:', result);

    if (res.ok && result.success) {
      toastStore.showToast('Thêm sản phẩm thành công!', 'success');
      isAddProductModalOpen.value = false;
      fetchDetailData(); 
    } 
    else {
      toastStore.showToast(result.message || 'Thêm thất bại, vui lòng kiểm tra lại dữ liệu', 'error');
    }
  } 
  catch (error) {
    console.error('❌ Lỗi khi gọi API:', error);
    toastStore.showToast('Lỗi kết nối máy chủ', 'error');
  }
};

const handleToggleSidebar = () => {
  if (window.innerWidth < 768) isMobileMenuOpen.value = !isMobileMenuOpen.value;
  else isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

onMounted(() => {
  fetchDetailData();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>