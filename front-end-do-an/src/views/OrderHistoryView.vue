<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <div class="flex flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      
      <aside class="w-72 hidden md:flex flex-col border-r border-outline-variant/20 bg-surface-container-low pt-8">
        <div class="px-6 flex flex-col items-center gap-3 mb-8">
          <div class="relative group cursor-pointer">
            <div class="w-24 h-24 rounded-full border-2 border-primary/50 p-1 group-hover:border-primary transition-colors">
              <img class="w-full h-full rounded-full object-cover" alt="User Profile" :src="avatarPreview"/>
            </div>
            <div class="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full flex items-center justify-center border-2 border-surface-container-low">
              <span class="material-symbols-outlined text-[14px] text-on-primary font-bold">verified</span>
            </div>
          </div>
          <div class="text-center">
            <h3 class="font-headline font-bold text-lg text-on-surface">{{ authStore.user?.username || authStore.user?.TenKH || 'Collector' }}</h3>
            <p class="text-[10px] text-primary uppercase tracking-widest font-bold">Elite Member</p>
          </div>
        </div>

        <div class="flex flex-col gap-1 flex-1">
          <router-link to = "/profile" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">person</span>
            <span>Thông tin cá nhân</span>
          </router-link>
          <router-link to = "/change-password" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">lock</span>
            <span>Đổi mật khẩu</span>
          </router-link>
          <router-link to = "/wishlist" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">favorite</span>
            <span>Danh sách yêu thích</span>
          </router-link>
          <router-link to = "/orders" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent cursor-pointer">
            <span class="material-symbols-outlined">inventory_2</span>
            <span>Lịch sử đơn hàng</span>
          </router-link>
        </div>

        <div class="p-6 border-t border-outline-variant/10">
          <button @click="handleLogout" class="flex items-center gap-3 text-sm font-bold transition-all text-outline hover:text-error w-full">
            <span class="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header class="mb-10">
          <h1 class="text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tighter text-white mb-2">
            Quản lý <span class="text-primary italic">Đơn hàng</span>
          </h1>
          <p class="text-on-surface-variant font-medium">Theo dõi và kiểm tra lịch sử các kho báu bạn đã sở hữu.</p>
        </header>

        <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-4 mb-8">
          <button 
            v-for="tab in ['Tất cả', 'Chờ duyệt', 'Đang đóng gói', 'Đang vận chuyển', 'Đã giao', 'Đã hủy']" 
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
              class="group bg-surface-container-low hover:bg-surface-container-highest border border-outline-variant/20 rounded-2xl p-6 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div class="absolute top-0 right-0 w-32 h-32 bg-primary/0 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div class="flex items-center gap-6">
                <div class="w-20 h-20 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex-shrink-0 p-2 overflow-hidden relative">
                  <div v-if="order.TongSoSanPham > 1" class="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span class="font-bold text-white text-sm">+{{ order.TongSoSanPham - 1 }}</span>
                  </div>
                  <img 
                      v-if="order.Thumbnail" 
                      :src="'/Images_product/' + order.Thumbnail" 
                      alt="Product" 
                      class="w-full h-full object-contain"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-outline/50">
                      <span class="material-symbols-outlined text-4xl">inventory_2</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 flex-grow">
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-primary tracking-widest uppercase">Mã đơn</span>
                    <span class="text-lg font-headline font-bold text-white tracking-tight">{{ order.MaDH }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Ngày đặt</span>
                    <span class="text-sm font-medium text-on-surface-variant">{{ formatDate(order.NgayLapDon) }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Tổng tiền</span>
                    <span class="text-base font-bold text-white">{{ formatPrice(order.TongTien) }}</span>
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

              <div class="flex lg:flex-col gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-outline-variant/20 pt-4 lg:pt-0 lg:pl-6">
                <button @click="router.push(`/orders/${order.MaDH}`)" class="flex-1 lg:w-36 px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-center shadow-lg shadow-primary/20">
                  Xem chi tiết
                </button>
                <button v-if="order.status === 'Đã giao'" class="flex-1 lg:w-36 px-4 py-2 border border-outline-variant text-outline rounded-lg font-bold text-xs uppercase tracking-widest hover:text-white hover:border-white transition-all text-center">
                  Mua lại
                </button>
                <button 
                  v-if="order.TrangThaiDonHang === 'Chờ duyệt' && (order.TrangThaiThanhToan === 'Chưa thanh toán' || !order.TrangThaiThanhToan)"
                  @click="openPaymentModal(order)" 
                  class="flex-1 lg:w-36 px-4 py-2 bg-[#a50064] text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-1 shadow-lg shadow-pink-500/20"
                >
                  <span class="material-symbols-outlined text-sm">payments</span>
                  Thanh toán
                </button>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="filteredOrders.length === 0" class="text-center py-20 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low">
            <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
            <h2 class="font-headline text-2xl text-white font-bold mb-2">Chưa có đơn hàng nào</h2>
            <p class="text-on-surface-variant">Thư mục "{{ activeTab }}" của bạn đang trống.</p>
          </div>
        </div>

      </main>
    </div>
    <div v-if="showPaymentModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <h3 class="font-headline text-xl font-bold text-white mb-2 uppercase italic">Chọn hình thức</h3>
        <p class="text-sm text-on-surface-variant mb-6">Bạn muốn cọc trước hay thanh toán toàn bộ cho đơn hàng #{{ selectedOrder?.MaDH }}?</p>
        
        <div class="space-y-3 mb-8">
          <label class="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/20 cursor-pointer hover:border-primary transition-all">
            <input type="radio" v-model="repayMethod" value="Thanh toán toàn bộ" class="text-primary" />
            <span class="text-sm font-bold text-white">Thanh toán toàn bộ (100%)</span>
          </label>
          <label class="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/20 cursor-pointer hover:border-primary transition-all">
            <input type="radio" v-model="repayMethod" value="Cọc một phần" class="text-primary" />
            <span class="text-sm font-bold text-white">Đặt cọc tối thiểu</span>
          </label>
        </div>

        <div class="flex gap-3">
          <button @click="showPaymentModal = false" class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-white transition-colors">Hủy</button>
          <button @click="handleRepay" class="flex-[2] py-3 bg-[#a50064] text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all">Tiến hành quét mã</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('Tất cả');

const userString = localStorage.getItem('user');
const currentUser = userString ? JSON.parse(userString) : null;
// Dữ liệu giả lập Đơn hàng
const orders = ref([]);

const showPaymentModal = ref(false);
const selectedOrder = ref(null);
const repayMethod = ref('Thanh toán toàn bộ');

// Mở Modal và lưu lại đơn hàng đang chọn
const openPaymentModal = (order) => {
  selectedOrder.value = order;
  showPaymentModal.value = true;
};

// Gọi API tạo link MoMo từ Modal
const handleRepay = async () => {
  const token = localStorage.getItem('token');
  if (!selectedOrder.value) return;

  try {
    const response = await fetch('http://localhost:3000/api/payment/momo/create', {
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
      // Bế khách sang trang MoMo màu hồng!
      window.location.href = data.checkoutUrl;
    } else {
      toastStore.showToast(data.message, "error");
    }
  } catch (error) {
    console.error("Lỗi thanh toán lại:", error);
    toastStore.showToast("Lỗi kết nối máy chủ thanh toán", "error");
  }
};

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);


// Hàm chọn màu Badge dựa trên trạng thái
const getStatusColor = (status) => {
  switch(status) {
    case 'Đang vận chuyển': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
    case 'Đã giao': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'Đang đóng gói': return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'Chờ duyệt': return 'bg-secondary/10 text-secondary border-secondary/20';  
    case 'Đã hủy': return 'bg-error/10 text-error border-error/20';
    default: return 'bg-outline/10 text-outline border-outline/20';
  }
};

// Lọc đơn hàng theo Tab
const filteredOrders = computed(() => {
  if (activeTab.value === 'Tất cả') return orders.value;
  return orders.value.filter(order => order.TrangThaiDonHang === activeTab.value);
});

const fetchOrderdata = async () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  if (!token || !userString) {
    router.push('/login');
    return;
  }
  const maKH = JSON.parse(userString).MaKH;
  try {
    const response = await fetch(`http://localhost:3000/api/add_cart/watch_order/${maKH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      orders.value = result.data; 
    } else {
      console.error(result.message);
      orders.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
  }
}

const avatarPreview = ref(
  currentUser && currentUser.AnhDaiDien 
    ? `http://localhost:3000/Images_user/${currentUser.AnhDaiDien}` 
    : 'default_avatar.jpg'
);

const fetchUserData = async () => {
  if (!currentUser) return;
  
  try {
    // Gọi đường link API lấy thông tin bạn vừa viết (truyền MaTK vào đuôi)
    const res = await fetch(`http://localhost:3000/api/info_user/laythongtin/${currentUser.id}`);
    const dataJSON = await res.json();
    
    if (res.ok && dataJSON.data) {
      const userData = dataJSON.data;
      if (userData.AnhDaiDien && userData.AnhDaiDien !== '') {
        avatarPreview.value = `http://localhost:3000/Images_user/${userData.AnhDaiDien}`;
      }
    }
  } catch (error) {
    console.error("Lỗi kéo thông tin người dùng:", error);
  }
};

onMounted(() => {
  window.scroll(0,0);
  fetchOrderdata();
  fetchUserData();
});

// Hàm chuyển đổi ngày tháng từ MySQL sang định dạng thân thiện
const formatDate = (dateString) => {
  if (!dateString) return 'Đang cập nhật';
  
  const date = new Date(dateString);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Bạn có thể tùy chỉnh hiển thị ở đây. Hiện tại đang là: 26/03/2026 - 15:37
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

const handleLogout = () => {
  if (authStore.logout) authStore.logout();
  else localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

/* Hiệu ứng mượt mà khi lọc danh sách */
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
</style>