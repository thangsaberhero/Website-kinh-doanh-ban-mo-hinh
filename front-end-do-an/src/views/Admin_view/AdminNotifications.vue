<template>
    <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 h-screen overflow-hidden font-body flex w-full text-slate-800 relative">
      <div 
        v-show="layoutStore.isMobileMenuOpen" 
        @click="layoutStore.isMobileMenuOpen = false" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
      ></div>
  
      <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>
      
      <div class="flex-1 flex flex-col h-screen w-full relative">
        <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
        
        <main class="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-24">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 class="text-3xl font-brand font-bold text-slate-900 tracking-tight flex items-center gap-2">Trung tâm Thông báo </h1>
              <p class="text-slate-500 text-sm font-medium mt-1">Xem và quản lý toàn bộ các cảnh báo vận hành, đơn hàng của hệ thống.</p>
            </div>
            
            <div class="flex gap-2 shrink-0">
              <button @click="markAllAsRead" class="px-4 py-2 bg-white border border-slate-200 hover:border-[#ff8f73] hover:text-[#ff8f73] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">done_all</span> Đọc tất cả
              </button>
            
              <button @click="openDeleteAllModal" class="px-4 py-2 bg-white border border-slate-200 hover:border-rose-500 hover:text-rose-500 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">delete_sweep</span> Dọn dẹp đã đọc
              </button>
            </div>
          </div>
  
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex flex-wrap gap-1">
              <button v-for="tab in typeTabs" :key="tab.value" @click="activeTypeFilter = tab.value"
                :class="['px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5', 
                        activeTypeFilter === tab.value ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100']">
                <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
                {{ tab.label }}
              </button>
            </div>
            
            <div class="flex items-center gap-2 w-full lg:w-auto">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Trạng thái:</span>
              <select v-model="activeStatusFilter" class="w-full lg:w-40 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#ff8f73] bg-slate-50 cursor-pointer">
                <option value="all">Tất cả thông báo</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
              </select>
            </div>
          </div>
  
          <div v-if="isLoading" class="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff8f73]"></div>
          </div>
  
          <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="divide-y divide-slate-100">
              <div v-for="notif in notificationList" :key="notif.MaTB" 
                   @click="handleNotificationClick(notif)"
                   class="p-5 flex items-start gap-4 transition-all hover:bg-slate-50/80 cursor-pointer relative group"
                   :class="notif.DaDoc === 0 ? 'bg-[#ff8f73]/5' : ''">
                
                <div v-if="notif.DaDoc === 0" class="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff3d00] shadow-[0_0_8px_#ff3d00]"></div>
  
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105"
                     :class="getIconClass(notif.LoaiThongBao)">
                  <span class="material-symbols-outlined text-[20px]">{{ getIconName(notif.LoaiThongBao) }}</span>
                </div>
  
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="text-sm font-bold text-slate-900" :class="notif.DaDoc === 0 ? 'font-black text-black' : ''">{{ notif.TieuDe }}</h4>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider" :class="getBadgeClass(notif.LoaiThongBao)">
                      {{ getLoaiLabel(notif.LoaiThongBao) }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ notif.NoiDung }}</p>
                  
                  <div class="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span>{{ formatDatetime(notif.NgayTao) }}</span>
                    <span v-if="notif.DaDoc === 1" class="text-emerald-500 font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-sm">done</span>Đã xem</span>
                  </div>
                </div>
  
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0 self-center">
                  <button @click.stop="openDeleteSingleModal(notif.MaTB)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Xóa thông báo này">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
  
              <div v-if="notificationList.length === 0" class="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <span class="material-symbols-outlined text-5xl opacity-40">notifications_off</span>
                <p class="text-sm font-bold">Không tìm thấy thông báo nào phù hợp với bộ lọc.</p>
              </div>
            </div>
  
            <div v-if="pagination.totalPage > 1 && notificationList.length > 0" class="flex items-center justify-between bg-slate-50 p-4 border-t border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trang {{ pagination.currentPage }} / {{ pagination.totalPage }}</p>
              <div class="flex items-center gap-1">
                <button @click="changePage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all disabled:opacity-40 disabled:pointer-events-none"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
                <button @click="changePage(pagination.currentPage + 1)" :disabled="pagination.currentPage === pagination.totalPage" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all disabled:opacity-40 disabled:pointer-events-none"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    <div v-if="isConfirmModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner"
            :class="confirmType === 'delete_all' ? 'bg-rose-100 text-rose-500 border border-rose-200' : 'bg-orange-100 text-orange-500 border border-orange-200'">
            <span class="material-symbols-outlined text-3xl">
            {{ confirmType === 'delete_all' ? 'delete_sweep' : 'warning' }}
            </span>
        </div>
        
        <h3 class="text-lg font-bold text-slate-900 mb-2">Xác nhận thao tác</h3>
        <p class="text-sm text-slate-500 mb-6">
            {{ confirmMessage }} <br>
            <span v-if="confirmType === 'delete_all'" class="text-rose-500 font-medium">Hành động này không thể hoàn tác.</span>
        </p>
        
        <div class="flex justify-center gap-3">
            <button @click="isConfirmModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full">Hủy</button>
            <button @click="executeConfirmAction" class="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all w-full shadow-lg"
                    :class="confirmType === 'delete_all' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'">
            Xác nhận
            </button>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from '../../stores/toast';
  import { useLayoutStore } from '../../stores/layout';
  
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const isLoading = ref(true);  
  const activeTypeFilter = ref('all');
  const activeStatusFilter = ref('all');
  const notificationList = ref([]);
  const pagination = ref({ currentPage: 1, totalPage: 1 });
  
  const typeTabs = [
    { label: 'Tất cả', value: 'all', icon: 'blur_on' },
    { label: 'Đơn hàng', value: 'DonHang', icon: 'local_mall' },
    { label: 'Kho hàng', value: 'KhoHang', icon: 'inventory_2' },
    { label: 'Hệ thống', value: 'HeThong', icon: 'gpp_maybe' }
  ];

  const isConfirmModalOpen = ref(false);
  const confirmType = ref(''); 
  const confirmMessage = ref('');
  const targetId = ref(null);

  const openDeleteSingleModal = (id) => {
    targetId.value = id;
    confirmType.value = 'delete_single';
    confirmMessage.value = 'Bạn có chắc chắn muốn xóa thông báo này khỏi hệ thống không?';
    isConfirmModalOpen.value = true;
  };

  const openDeleteAllModal = () => {
    confirmType.value = 'delete_all';
    confirmMessage.value = 'Bạn đang yêu cầu dọn dẹp toàn bộ các thông báo đã đọc.';
    isConfirmModalOpen.value = true;
  };

  const executeConfirmAction = async () => {
    try {
        const token = localStorage.getItem('token');
        
        // Nếu là xóa 1 cái
        if (confirmType.value === 'delete_single') {
        const res = await fetch(`${API_BASE_URL}/api/thong_bao_admin/delete/${targetId.value}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            toastStore.showToast("Đã xóa thông báo", "success");
        }
        } 
        // Nếu là dọn dẹp tất cả
        else if (confirmType.value === 'delete_all') {
        const res = await fetch(`${API_BASE_URL}/api/thong_bao_admin/delete-read`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.success) {
            toastStore.showToast(result.message, "success");
            pagination.value.currentPage = 1; 
        }
        }
        
        fetchNotificationsFull();
        isConfirmModalOpen.value = false;
        
    } 
    catch (error) {
        console.error(error);
        toastStore.showToast("Lỗi kết nối máy chủ", "error");
        isConfirmModalOpen.value = false;
    }
  };
  
  const fetchNotificationsFull = async () => {
    isLoading.value = true;
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.value.currentPage,
        limit: 10,
        trangthai: activeStatusFilter.value,
        loai: activeTypeFilter.value
      }).toString();
  
      const res = await fetch(`${API_BASE_URL}/api/thong_bao_admin/all-page?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        notificationList.value = result.data;
        pagination.value = result.pagination;
      }
    } 
    catch (error) {
      console.error("Lỗi fetch thông báo: ", error);
    } 
    finally {
      isLoading.value = false;
    }
  };
  
  const handleNotificationClick = async (notif) => {
    try {
      const token = localStorage.getItem('token');
      if (notif.DaDoc === 0) {
        await fetch(`${API_BASE_URL}/api/thong_bao_admin/read/${notif.MaTB}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      if (notif.DuongDan) {
        router.push(notif.DuongDan);
      }
    } 
    catch (error) {
      console.error(error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/thong_bao_admin/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      toastStore.showToast("Đã đọc tất cả thông báo", "success");
      fetchNotificationsFull();
    } 
    catch (error) { 
      console.error(error); 
    }
  };
  
  const changePage = (page) => {
    if (page < 1 || page > pagination.value.totalPage) return;
    pagination.value.currentPage = page;
    fetchNotificationsFull();
  };
  
  // Định dạng màu sắc & Icon động trợ giúp UX
  const getIconName = (loai) => loai === 'DonHang' ? 'local_mall' : (loai === 'KhoHang' ? 'inventory_2' : 'gpp_maybe');
  const getLoaiLabel = (loai) => loai === 'DonHang' ? 'Đơn hàng' : (loai === 'KhoHang' ? 'Kho hàng' : 'Hệ thống');
  
  const getIconClass = (loai) => {
    if (loai === 'DonHang') return 'bg-emerald-50 border-emerald-100 text-emerald-500';
    if (loai === 'KhoHang') return 'bg-amber-50 border-amber-100 text-amber-500';
    return 'bg-blue-50 border-blue-100 text-blue-500';
  };
  
  const getBadgeClass = (loai) => {
    if (loai === 'DonHang') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (loai === 'KhoHang') return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };
  
  const formatDatetime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  };
  
  // Theo dõi bộ lọc đổi -> Reset trang về 1 và lấy lại data
  watch([activeTypeFilter, activeStatusFilter], () => {
    pagination.value.currentPage = 1;
    fetchNotificationsFull();
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
    scrollToTopCustom();
    fetchNotificationsFull();
  });
</script>