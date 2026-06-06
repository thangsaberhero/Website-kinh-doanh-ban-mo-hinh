<template>
  <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 h-screen overflow-hidden font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>

    <div class="flex-1 flex flex-col h-screen w-full overflow-hidden relative">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-32">
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý thanh toán</h1>
            <p class="text-slate-500 text-sm font-medium">Theo dõi, kiểm tra chi tiết các giao dịch thu tiền bán hàng và hoàn trả tài chính.</p>
          </div>
          <div class="flex gap-3 w-full xl:w-auto">
            <button @click="exportFinanceExcel" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
              <span class="material-symbols-outlined text-[20px]" :class="{'animate-bounce': isExporting}">file_download</span>
              {{ isExporting ? 'Đang tạo file...' : 'Xuất Excel' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-emerald-200 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">arrow_downward</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Dòng tiền vào (Thu)</p>
              <p class="text-3xl font-brand font-bold text-emerald-600">+{{ formatPrice(kpiStats.TongTienVao) }}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-inner relative z-10">
              <span class="material-symbols-outlined text-emerald-500">arrow_downward</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-rose-200 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">arrow_upward</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Dòng tiền ra (Hoàn chi)</p>
              <p class="text-3xl font-brand font-bold text-rose-600">{{ formatPrice(kpiStats.TongTienRa) }}</p>
            </div>
            <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 shadow-inner relative z-10">
              <span class="material-symbols-outlined text-rose-500">arrow_upward</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-blue-200 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Lưu chuyển tiền thuần</p>
              <p class="text-3xl font-brand font-bold" :class="kpiStats.DongTienThuan >= 0 ? 'text-slate-900' : 'text-rose-600'">
                {{ formatPrice(kpiStats.DongTienThuan) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-inner relative z-10">
              <span class="material-symbols-outlined text-blue-500">account_balance_wallet</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div class="p-6 flex flex-col xl:flex-row justify-between gap-6 items-start xl:items-center border-b border-slate-100 bg-slate-50/30">
            <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <select v-model="filterParams.phuongthuc" class="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 bg-white shadow-sm outline-none cursor-pointer focus:border-[#ff8f73]">
                <option value="all">Tất cả phương thức</option>
                <option value="1">Ví điện tử MoMo</option>
                <option value="2">Thu hộ COD</option>
                <option value="4">Chuyển khoản ngân hàng</option>
                <option value="5">Tiền mặt tại quầy</option>
              </select>

              <select v-model="filterParams.loai" class="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 bg-white shadow-sm outline-none cursor-pointer focus:border-[#ff8f73]">
                <option value="all">Tất cả loại luồng</option>
                <option value="thu">Luồng tiền vào (+)</option>
                <option value="chi">Luồng tiền ra (-)</option>
              </select>
              
              <div class="flex items-center px-4 py-2 border border-slate-200 rounded-xl bg-slate-100 text-xs font-bold text-slate-500 whitespace-nowrap shadow-inner">
                <span>Tìm thấy {{ totalRecords }} bản ghi giao dịch</span>
              </div>
            </div>

            <div class="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
              <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-0.5 shadow-sm w-full md:w-auto">
                <span class="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                <input type="date" v-model="filterParams.ngaybatdau" class="bg-transparent border-none text-[12px] font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none py-1.5">
                <span class="text-slate-300">-</span>
                <input type="date" v-model="filterParams.ngayketthuc" class="bg-transparent border-none text-[12px] font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none py-1.5">
              </div>

              <div class="relative w-full md:w-64">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input type="text" v-model="filterParams.timkiem" placeholder="Tìm mã đơn #FC, mã MoMo/Bank..." class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-[#ff8f73] focus:ring-4 focus:ring-[#ff8f73]/10 outline-none transition-all font-medium text-slate-700 shadow-sm">
              </div>
            </div>
          </div>

          <div class="overflow-x-auto min-h-[350px]">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center w-16">STT</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Thời gian giao dịch</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Đơn hàng & Khách</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Phương thức</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mã đối soát hệ thống</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nghiệp vụ</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Giá trị phát sinh</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-if="isLoading" class="text-center">
                  <td colspan="7" class="py-16 text-slate-400 font-medium text-sm animate-pulse">
                    Đang đồng bộ dòng tiền dữ liệu...
                  </td>
                </tr>
                <tr v-else-if="transactions.length === 0" class="text-center">
                  <td colspan="7" class="py-16 text-slate-400 font-medium text-sm">
                    Không ghi nhận lịch sử giao dịch phát sinh nào trong kỳ đối soát này.
                  </td>
                </tr>
                
                <tr 
                  v-for="(item, index) in transactions" 
                  :key="item.MaTT" 
                  class="hover:bg-slate-50/60 transition-all duration-150 group"
                >
                  <td class="px-6 py-4 text-center font-bold text-xs text-slate-300 group-hover:text-slate-500 transition-colors">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold text-slate-700">{{ formatDate(item.NgayThanhToan).split(' ')[1] }}</span>
                      <span class="text-[10px] font-semibold text-slate-400 mt-0.5">{{ formatDate(item.NgayThanhToan).split(' ')[0] }}</span>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span 
                        @click="viewOrderDetail(item.MaDH)"
                        class="font-brand font-bold text-slate-900 text-sm cursor-pointer hover:text-[#ff3d00] transition-colors flex items-center gap-1"
                      >
                        {{ item.MaDonHangHienThi }}
                        <span class="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity">open_in_new</span>
                      </span>
                      <span class="text-[11px] font-semibold text-slate-500 mt-0.5">Khách: {{ item.TenNguoiNhan || 'Hệ thống quầy' }}</span>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4">
                    <span 
                      class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border shadow-sm transition-all"
                      :class="getPaymentMethodStyle(item.TenPhuongThuc)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {{ item.TenPhuongThuc }}
                    </span>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div v-if="item.MaGiaoDichCuaDoiTac" class="flex items-center gap-1.5">
                      <span class="font-mono font-bold text-xs text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/50">
                        {{ item.MaGiaoDichCuaDoiTac }}
                      </span>
                    </div>
                    
                    <div v-else-if="item.TenPhuongThuc.includes('COD') || item.TenPhuongThuc.includes('Tiền mặt')">
                      <span class="inline-flex text-[10px] font-bold tracking-wide bg-slate-100 text-slate-400 rounded px-2 py-0.5 uppercase">
                        Nội bộ / COD
                      </span>
                    </div>
                    
                    <div v-else class="flex items-center gap-2">
                      <div v-if="editingTxId === item.MaTT" class="flex items-center gap-1 animate-[fadeIn_0.15s_ease-out]">
                        <input 
                          v-model="inputRefCode" 
                          type="text" 
                          placeholder="Nhập mã..." 
                          class="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/10 w-28 font-mono font-bold"
                        />
                        <button @click="saveRefCode(item.MaTT)" class="bg-emerald-500 text-white p-1 rounded-md hover:bg-emerald-600 flex items-center transition-colors shadow-sm">
                          <span class="material-symbols-outlined text-[14px]">check</span>
                        </button>
                        <button @click="editingTxId = null" class="bg-slate-100 text-slate-500 p-1 rounded-md hover:bg-slate-200 flex items-center transition-colors">
                          <span class="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                      <div v-else>
                        <button 
                          @click="startEdit(item.MaTT)" 
                          class="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-lg font-bold hover:bg-amber-100 transition-colors shadow-sm"
                        >
                          <span class="material-symbols-outlined text-[12px]">edit</span>
                          Chờ đối soát
                        </button>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="flex flex-col items-start gap-1">
                      <span class="text-xs font-bold text-slate-700">{{ item.LoaiGiaoDich }}</span>
                      <span v-if="item.TrangThaiGiaoDich === 'Thành công'" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                        Thành công
                      </span>
                      <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-rose-50 text-rose-700 border border-rose-100 shadow-sm">
                        Thất bại
                      </span>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 text-right font-headline text-base font-black tracking-tight">
                    <span v-if="item.SoTienGiaoDich > 0" class="text-emerald-600 bg-emerald-50/30 px-2.5 py-1 rounded-xl">
                      +{{ formatPrice(item.SoTienGiaoDich) }}
                    </span>
                    <span v-else class="text-rose-600 bg-rose-50/30 px-2.5 py-1 rounded-xl">
                      {{ formatPrice(item.SoTienGiaoDich) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="transactions.length > 0" class="bg-slate-50/80 border-t-2 border-slate-200">
                  <td colspan="6" class="px-6 py-4 text-right text-sm font-bold text-slate-600 uppercase tracking-wider">
                    Tổng phát sinh trang hiện tại:
                  </td>
                  <td class="px-6 py-4 text-right font-headline text-lg font-black">
                    <span :class="pageSubtotal >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                      {{ pageSubtotal >= 0 ? '+' : '' }}{{ formatPrice(pageSubtotal) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="p-6 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
            <span class="text-xs font-bold text-slate-400">
              Trang {{ currentPage }} / {{ totalPages }} tổng số trang
            </span>
            
            <div v-if="totalPages > 1" class="flex items-center gap-2">
              <button 
                @click="changePage(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              <button 
                v-for="p in totalPages" 
                :key="p" 
                @click="changePage(p)"
                :class="currentPage === p 
                  ? 'bg-[#ff8f73] text-white shadow-lg border-transparent' 
                  : 'bg-white border-slate-200 text-slate-500 hover:text-[#ff8f73]'"
                class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold border transition-all"
              >
                {{ p }}
              </button>
              
              <button 
                @click="changePage(currentPage + 1)" 
                :disabled="currentPage === totalPages"
                class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73]"
              >
                <span class="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

      </main>
      
      <footer class="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-between items-center px-8 py-4 z-40">
        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">© 2026 FigureCollect - Tài chính Kế toán.</span>
      </footer>
    </div>
  </div>
</template>
    
<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useLayoutStore } from '../../stores/layout';

  const router = useRouter();
  const layoutStore = useLayoutStore();

  const transactions = ref([]);
  const isLoading = ref(true);
  const totalRecords = ref(0);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const itemsPerPage = ref(10);

  const kpiStats = ref({
    TongTienVao: 0,
    TongTienRa: 0,
    DongTienThuan: 0
  });

  const filterParams = ref({
    ngaybatdau: '',
    ngayketthuc: '',
    phuongthuc: 'all',
    loai: 'all',
    timkiem: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const fetchTransactions = async () => {
    isLoading.value = true;
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({
        page: currentPage.value,
        limit: itemsPerPage.value,
        ngaybatdau: filterParams.value.ngaybatdau,
        ngayketthuc: filterParams.value.ngayketthuc,
        phuongthuc: filterParams.value.phuongthuc,
        loai: filterParams.value.loai,
        timkiem: filterParams.value.timkiem
      });

      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/payment?${query.toString()}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        transactions.value = result.data;
        kpiStats.value = result.kpi;
        totalRecords.value = result.pagination.totalItems;
        totalPages.value = result.pagination.totalPage;
      }
    } 
    catch (error) {
      console.error("Lỗi đồng bộ API quản lý dòng tiền:", error);
    } 
    finally {
      isLoading.value = false;
    }
  };

  const pageSubtotal = computed(() => {
    return transactions.value.reduce((sum, item) => sum + Number(item.SoTienGiaoDich), 0);
  });

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchTransactions();
    }
  };

  const viewOrderDetail = (maDH) => {
    router.push({ path: '/admin/orders', query: { viewOrderId: maDH } });
  };

  let debounceTimeout = null;
  watch(
    filterParams,
    () => {
      currentPage.value = 1; // Reset về trang đầu khi thay đổi bộ lọc
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(fetchTransactions, 400); // Tránh gọi API liên tục khi gõ ký tự
    }, { deep: true }
  );

  const isExporting = ref(false);

  const exportFinanceExcel = async () => {
    isExporting.value = true;
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({
        ngaybatdau: filterParams.value.ngaybatdau,
        ngayketthuc: filterParams.value.ngayketthuc,
        phuongthuc: filterParams.value.phuongthuc,
        loai: filterParams.value.loai,
        timkiem: filterParams.value.timkiem
      });

      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/payment/export?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Lỗi tải file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_Doi_Soat_Tai_Chinh.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } 
    catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toastStore.showToast("Lỗi xuất Excel!", "error");
    } 
    finally {
      isExporting.value = false;
    }
  };

  const getPaymentMethodStyle = (methodName) => {
    const name = methodName?.toUpperCase() || '';
    if (name.includes('MOMO')) {
      return 'bg-pink-50 text-pink-600 border-pink-100';
    }
    if (name.includes('COD') || name.includes('THU HỘ')) {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    if (name.includes('CHUYỂN KHOẢN') || name.includes('BANK')) {
      return 'bg-blue-50 text-blue-600 border-blue-100';
    }
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  onMounted(() => {
    fetchTransactions();
  });
</script>
    
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>