<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <div class="flex flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      
      <aside class="w-72 hidden md:flex flex-col border-r border-outline-variant/20 bg-surface-container-low pt-8">
        <div class="px-6 flex flex-col items-center gap-3 mb-8">
          <div class="relative group cursor-pointer">
            <div class="w-24 h-24 rounded-full border-2 border-primary/50 p-1 group-hover:border-primary transition-colors">
              <img class="w-full h-full rounded-full object-cover" alt="User Profile" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"/>
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
            v-for="tab in ['Tất cả', 'Chờ xử lý', 'Đang vận chuyển', 'Đã giao', 'Đã hủy']" 
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
              :key="order.id"
              class="group bg-surface-container-low hover:bg-surface-container-highest border border-outline-variant/20 rounded-2xl p-6 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div class="absolute top-0 right-0 w-32 h-32 bg-primary/0 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div class="flex items-center gap-6">
                <div class="w-20 h-20 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex-shrink-0 p-2 overflow-hidden relative">
                  <div v-if="order.totalItems > 1" class="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
                    <span class="font-bold text-white text-sm">+{{ order.totalItems - 1 }}</span>
                  </div>
                  <img :src="order.thumbnail" alt="Product" class="w-full h-full object-contain"/>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 flex-grow">
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-primary tracking-widest uppercase">Mã đơn</span>
                    <span class="text-lg font-headline font-bold text-white tracking-tight">{{ order.id }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Ngày đặt</span>
                    <span class="text-sm font-medium text-on-surface-variant">{{ order.date }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Tổng tiền</span>
                    <span class="text-base font-bold text-white">{{ formatPrice(order.total) }}</span>
                  </div>
                  
                  <div class="flex flex-col gap-1 items-start">
                    <span class="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Trạng thái</span>
                    <span :class="`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`">
                      {{ order.status }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex lg:flex-col gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-outline-variant/20 pt-4 lg:pt-0 lg:pl-6">
                <button @click="router.push(`/orders/${order.id.replace('#', '')}`)" class="flex-1 lg:w-36 px-4 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-center shadow-lg shadow-primary/20">
                  Xem chi tiết
                </button>
                <button v-if="order.status === 'Đã giao'" class="flex-1 lg:w-36 px-4 py-2 border border-outline-variant text-outline rounded-lg font-bold text-xs uppercase tracking-widest hover:text-white hover:border-white transition-all text-center">
                  Mua lại
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

// Dữ liệu giả lập Đơn hàng
const orders = ref([
  { id: '#FC-8899', date: '14 Tháng 10, 2023', total: 12500000, status: 'Đang vận chuyển', totalItems: 2, thumbnail: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80' },
  { id: '#FC-8742', date: '02 Tháng 10, 2023', total: 8200000, status: 'Đã giao', totalItems: 1, thumbnail: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&q=80' },
  { id: '#FC-8611', date: '28 Tháng 09, 2023', total: 24000000, status: 'Chờ xử lý', totalItems: 3, thumbnail: 'https://images.unsplash.com/photo-1599409636295-e27e852d7e90?auto=format&fit=crop&q=80' },
  { id: '#FC-8520', date: '15 Tháng 09, 2023', total: 5400000, status: 'Đã hủy', totalItems: 1, thumbnail: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80' }
]);

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Hàm chọn màu Badge dựa trên trạng thái
const getStatusColor = (status) => {
  switch(status) {
    case 'Đang vận chuyển': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
    case 'Đã giao': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'Chờ xử lý': return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'Đã hủy': return 'bg-error/10 text-error border-error/20';
    default: return 'bg-outline/10 text-outline border-outline/20';
  }
};

// Lọc đơn hàng theo Tab
const filteredOrders = computed(() => {
  if (activeTab.value === 'Tất cả') return orders.value;
  return orders.value.filter(order => order.status === activeTab.value);
});

onMounted(() => {
  if (!authStore.user && !localStorage.getItem('token')) {
    router.push('/login');
  }
});

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