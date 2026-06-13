<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    <TheHeader />
    <div class="flex flex-col md:flex-row flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      <UserSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header class="mb-10">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tighter text-white mb-2">
            Quản lý <span class="text-primary italic">Đơn hàng</span>
          </h1>
          <p class="text-on-surface-variant font-medium">Theo dõi và kiểm tra lịch sử các kho báu bạn đã sở hữu.</p>
        </header>

        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-8">
          <button 
            v-for="tab in ['Tất cả', 'Chờ duyệt', 'Đang đóng gói', 'Đang vận chuyển', 'Đã giao', 'Đã hoàn hàng', 'Đã hủy']" 
            :key="tab"
            @click="activeTab = tab"
            :class="['px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300', activeTab === tab ? 'bg-primary text-on-primary-fixed shadow-[0_0_15px_rgba(255,143,115,0.3)]' : 'bg-surface-container border border-outline-variant/20 text-outline hover:text-white hover:border-outline-variant']"
          >
            {{ tab }}
          </button>
        </div>

        <div class="space-y-6">
          <TransitionGroup name="list">
            <div 
              v-for="order in filteredOrders" 
              :key="order.MaDH"
              class="group bg-surface-container-low hover:bg-surface-container-highest border border-outline-variant/20 rounded-2xl p-4 md:p-6 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div class="absolute top-0 right-0 w-32 h-32 bg-primary/0 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex-shrink-0 p-2 overflow-hidden relative">
                  <div v-if="order.TongSoSanPham > 1" class="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span class="font-bold text-white text-sm">+{{ order.TongSoSanPham - 1 }}</span>
                  </div>
                  <img 
                      v-if="order.Thumbnail" 
                      :src="(order.Thumbnail.startsWith('http')) ? order.Thumbnail : `${API_BASE_URL}/Images_product/${order.Thumbnail}`" 
                      alt="Product" 
                      class="w-full h-full object-contain"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-outline/50">
                      <span class="material-symbols-outlined text-4xl">inventory_2</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 lg:gap-8 flex-grow">
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-primary tracking-widest uppercase">Mã đơn</span>
                    <span class="text-lg font-headline font-bold text-white tracking-tight">{{ order.MaDonHangHienThi || order.MaDH }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Ngày đặt</span>
                    <span class="text-sm font-medium text-on-surface-variant">{{ formatDate(order.NgayLapDon) }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Tổng tiền</span>
                    <span class="text-base font-bold text-white">{{ formatPrice(order.ThanhTien) }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Thanh toán</span>
                    <span :class="['text-[11px] font-bold', order.TrangThaiThanhToan === 'Đã thanh toán' ? 'text-green-400' : 'text-yellow-500']">
                      {{ order.TrangThaiThanhToan || 'Chưa thanh toán' }}
                    </span>
                  </div>

                  <div class="flex flex-col gap-1 items-start">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Trạng thái</span>
                    <span :class="`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.TrangThaiDonHang)}`">
                      {{ order.TrangThaiDonHang }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- CỤM NÚT THAO TÁC -->
              <div class="flex lg:flex-col gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-outline-variant/20 pt-4 lg:pt-0 lg:pl-6">
                
                <div v-if="order.TrangThaiThanhToan === 'Chưa thanh toán' && order.TrangThaiDonHang !== 'Đã hủy'" class="flex flex-col gap-2 flex-1 lg:w-36">
                  
                  <div v-if="!isExpired(order.NgayLapDon)" class="text-[10px] text-rose-500 font-bold text-center bg-rose-500/10 py-1.5 rounded-lg border border-rose-500/20 animate-pulse flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[12px]">timer</span>
                    {{ formatCountdown(order.NgayLapDon) }}
                  </div>
                  <div v-else class="text-[10px] text-outline font-bold text-center bg-surface-container py-1.5 rounded-lg border border-outline-variant/20 flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[12px]">hourglass_empty</span>
                    Đang xử lý hủy
                  </div>

                  <button 
                    @click="openPaymentModal(order)" 
                    :disabled="isExpired(order.NgayLapDon)"
                    class="w-full px-4 py-2 bg-gradient-to-r from-rose-600 to-[#a50064] text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-1 shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Thanh toán
                  </button>
                </div>

                <button @click="router.push(`/orders/${order.MaDH}`)" class="flex-1 lg:w-36 px-4 py-2 bg-surface-container-high hover:bg-primary/10 border border-outline-variant/30 hover:border-primary/50 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:text-primary transition-all text-center">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="orders.length === 0" class="text-center py-20 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low">
            <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
            <h2 class="font-headline text-2xl text-white font-bold mb-2">Chưa có đơn hàng nào</h2>
            <p class="text-on-surface-variant">Thư mục "{{ activeTab }}" của bạn đang trống.</p>
          </div>

          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 sm:gap-3 mt-10 mb-4">            
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="w-10 h-10 flex items-center justify-center bg-surface-container-high rounded-lg hover:text-primary disabled:opacity-30 disabled:hover:text-current transition-colors border border-outline-variant/20 shrink-0">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <div class="md:hidden flex items-center justify-center px-4 h-10 bg-surface-container rounded-lg border border-outline-variant/20 text-sm font-bold text-on-surface tracking-widest">
              {{ currentPage }} / {{ totalPages }}
            </div>
            <div class="hidden md:flex items-center gap-2 flex-wrap justify-center">
              <button v-for="p in totalPages" :key="p" @click="changePage(p)" :class="['w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all border', currentPage === p ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(255,143,115,0.3)]' : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest border-outline-variant/20']">
                {{ p }}
              </button>
            </div>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="w-10 h-10 flex items-center justify-center bg-surface-container-high rounded-lg hover:text-primary disabled:opacity-30 disabled:hover:text-current transition-colors border border-outline-variant/20 shrink-0">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </main>
    </div>
    
    <div v-if="showPaymentModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-5 sm:p-8 max-w-sm w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        <h3 class="font-headline text-xl font-bold text-white mb-2 uppercase italic">Thanh toán đơn hàng</h3>
        <p class="text-sm text-on-surface-variant mb-6">Mã đơn: <span class="font-bold text-primary">{{ selectedOrder?.MaDonHangHienThi || selectedOrder?.MaDH }}</span></p>
        
        <div class="space-y-4 mb-6">
          <label class="text-[10px] font-bold text-outline uppercase tracking-widest block mb-2">1. Chọn hình thức cọc</label>
          <div class="grid grid-cols-2 gap-3 mb-6">
            <label :class="['flex items-center justify-center text-center p-3 rounded-xl border cursor-pointer transition-all', repayMethod === 'Thanh toán toàn bộ' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline-variant/20 text-outline hover:border-outline-variant']">
              <input type="radio" v-model="repayMethod" value="Thanh toán toàn bộ" class="hidden" />
              <span class="text-xs font-bold">Thanh toán<br>Toàn bộ (100%)</span>
            </label>
            <label :class="['flex items-center justify-center text-center p-3 rounded-xl border cursor-pointer transition-all', repayMethod === 'Cọc một phần' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline-variant/20 text-outline hover:border-outline-variant']">
              <input type="radio" v-model="repayMethod" value="Cọc một phần" class="hidden" />
              <span class="text-xs font-bold">Chỉ đặt cọc<br>tối thiểu</span>
            </label>
          </div>

          <label class="text-[10px] font-bold text-outline uppercase tracking-widest block mb-2">2. Chọn cổng thanh toán</label>
          <div class="space-y-3 mb-8">
            <label class="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/20 cursor-pointer hover:border-[#a50064] transition-all">
              <input type="radio" v-model="paymentGateway" value="momo" class="text-[#a50064] focus:ring-[#a50064]" />
              <span class="text-sm font-bold text-white">Ví MoMo</span>
            </label>
            <label class="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/20 cursor-pointer hover:border-[#0068FF] transition-all">
              <input type="radio" v-model="paymentGateway" value="zalopay" class="text-[#0068FF] focus:ring-[#0068FF]" />
              <span class="text-sm font-bold text-white">ZaloPay</span>
            </label>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="showPaymentModal = false" class="flex-1 py-3 bg-surface-container text-xs font-bold uppercase tracking-widest text-outline hover:text-white rounded-lg transition-colors">Hủy</button>
          <button @click="handleRepay" class="flex-[2] py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex justify-center items-center gap-2">
            <span v-if="isProcessingPayment" class="material-symbols-outlined animate-spin text-sm">autorenew</span>
            Quét mã
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth';
  import { useToastStore } from '../../stores/toast';
  import TheHeader from '../../components/TheHeader.vue';
  import UserSidebar from '../../components/UserSidebar.vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const activeTab = ref('Tất cả');
  const userString = localStorage.getItem('user');
  const orders = ref([]);

  const showPaymentModal = ref(false);
  const selectedOrder = ref(null);
  const repayMethod = ref('Thanh toán toàn bộ');
  const paymentGateway = ref('momo'); 
  const isProcessingPayment = ref(false);

  const currentPage = ref(1);
  const limit = ref(5);
  const totalPages = ref(1);
  const totalItemsCount = ref(0);

  // Đồng hồ đếm ngược
  const now = ref(Date.now());
  let timerInterval;

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
    fetchOrderdata();
    
    timerInterval = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  });

  onUnmounted(() => {
    clearInterval(timerInterval);
  });

  const getRemainingTime = (dateString) => {
    if (!dateString) return 0;
    const createdTime = new Date(dateString).getTime();
    const expireTime = createdTime + 15 * 60 * 1000; 
    return expireTime - now.value;
  };

  const formatCountdown = (dateString) => {
    const diff = getRemainingTime(dateString);
    if (diff <= 0) return '00:00';

    const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
    const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isExpired = (dateString) => {
    return getRemainingTime(dateString) <= 0;
  };

  // Xử lý thanh toán
  const openPaymentModal = (order) => {
    selectedOrder.value = order;
    showPaymentModal.value = true;
  };

  const handleRepay = async () => {
    const token = localStorage.getItem('token');
    if (!selectedOrder.value) return;

    isProcessingPayment.value = true;

    try {
      const endpoint = paymentGateway.value === 'momo' 
            ? '/api/don_hang/payment/momo/create' 
            : '/api/don_hang/payment/zalopay/create';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          MaDH: selectedOrder.value.MaDH,
          HinhThuc: repayMethod.value 
        })
      });

      const data = await response.json();
      if (response.ok) {
        window.location.href = data.checkoutUrl;
      } 
      else {
        toastStore.showToast(data.message, "error");
      }
    } 
    catch (error) {
      console.error("Lỗi thanh toán lại:", error);
      toastStore.showToast("Lỗi kết nối máy chủ thanh toán", "error");
    } finally {
      isProcessingPayment.value = false;
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Đang vận chuyển': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'Đã giao': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Đang đóng gói': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'Chờ duyệt': return 'bg-secondary/10 text-secondary border-secondary/20';  
      case 'Đã hoàn hàng': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'; 
      case 'Đã hủy': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-outline/10 text-outline border-outline/20';
    }
  };

  const filteredOrders = computed(() => {
    if (activeTab.value === 'Tất cả') return orders.value;
    return orders.value.filter(order => order.TrangThaiDonHang === activeTab.value);
  });

  watch(activeTab, () => {
    currentPage.value = 1;
    fetchOrderdata();
  });

  const fetchOrderdata = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (!token || !userString) {
      router.push('/login');
      return;
    }
    const queryParams = new URLSearchParams({
      page: currentPage.value,
      limit: limit.value
    });
    if (activeTab.value !== 'Tất cả') {
      queryParams.append('trangthai', activeTab.value);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/don_hang/watch_order?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        orders.value = result.data; 
        currentPage.value = result.pagination.currentPage;
        totalPages.value = result.pagination.totalPage;
        totalItemsCount.value = result.pagination.totalItems;
      } 
      else {
        console.error(result.message);
        orders.value = [];
      }
    } 
    catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    }
  }

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchOrderdata();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Đang cập nhật';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };
</script>

<style scoped>
  .list-enter-active,
  .list-leave-active {
    transition: all 0.4s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
  .list-leave-active {
    position: absolute;
  }

  .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>