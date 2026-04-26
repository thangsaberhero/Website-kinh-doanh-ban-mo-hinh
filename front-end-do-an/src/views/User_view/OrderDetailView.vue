<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-1 pt-8 pb-24 px-6 max-w-7xl mx-auto w-full relative">
      <div class="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <button @click="router.push('/orders')" class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-outline hover:text-white transition-colors mb-8 group">
        <span class="material-symbols-outlined transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Quay lại danh sách đơn
      </button>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <span class="font-headline text-primary tracking-widest text-xs uppercase font-bold mb-2 block">Chi Tiết Giao Dịch</span>
          <h1 class="text-5xl md:text-6xl font-headline font-black tracking-tighter text-white">
            {{ "Mã: " + route.params.id }}
          </h1>
        </div>
        <div class="flex flex-wrap gap-4">
          <button class="px-6 py-3 bg-surface-container-high hover:bg-surface-bright text-on-surface text-sm font-bold rounded-lg flex items-center gap-2 transition-all border border-outline-variant/15">
            <span class="material-symbols-outlined text-lg">support_agent</span>
            Liên hệ hỗ trợ
          </button>
          <button @click="router.push('/category')" class="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-bold rounded-lg flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div class="lg:col-span-8 space-y-8">
          
          <section class="glass-panel rounded-xl p-8 border border-outline-variant/10 shadow-xl">
            <h3 class="font-headline text-lg font-bold mb-10 flex items-center gap-2 text-white">
              <span class="material-symbols-outlined text-primary">local_shipping</span>
              Lộ Trình Vận Chuyển
            </h3>
            
            <div class="relative flex justify-between items-start">
              <div class="absolute top-5 left-0 w-full h-[2px] bg-surface-container-highest z-0">
                <div class="h-full bg-primary shadow-[0_0_10px_rgba(255,143,115,0.5)] transition-all duration-1000" :style="{ width: progressWidth }"></div>
              </div>

              <div v-for="(step, index) in timeline" :key="index" class="relative z-10 flex flex-col items-center text-center w-24">
                
                <div v-if="step.status === 'completed'" class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary-fixed mb-3 shadow-[0_0_15px_rgba(255,143,115,0.4)]">
                  <span class="material-symbols-outlined text-lg font-bold">check</span>
                </div>
                
                <div v-else-if="step.status === 'active'" class="w-12 h-12 -mt-1 rounded-full bg-primary-container border-4 border-surface flex items-center justify-center text-on-primary-fixed mb-2 shadow-[0_0_20px_rgba(255,120,86,0.6)] animate-pulse">
                  <span class="material-symbols-outlined text-xl">{{ step.icon }}</span>
                </div>
                
                <div v-else class="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-outline mb-3">
                  <span class="material-symbols-outlined text-lg">{{ step.icon }}</span>
                </div>

                <span :class="['text-[11px] font-bold uppercase tracking-tighter', step.status === 'active' ? 'text-primary' : (step.status === 'completed' ? 'text-white' : 'text-outline')]">
                  {{ step.name }}
                </span>
                <span v-if="step.time" class="text-[10px] text-outline mt-1">{{ step.time }}</span>
                <!-- <span v-if="step.status === 'active'" class="text-[10px] text-primary/70 mt-1 italic">Hôm nay</span> -->
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="font-headline text-lg font-bold px-2 flex items-center gap-2 text-white">
              <span class="material-symbols-outlined text-tertiary">inventory_2</span>
              Danh Sách Sản Phẩm
            </h3>
            
            <div v-for="item in orderItems" :key="item.MaMoHinh" @click="router.push(`/product/${item.MaMoHinh}`)" class="glass-panel group cursor-pointer overflow-hidden flex flex-col md:flex-row items-center border border-outline-variant/10 rounded-xl transition-all hover:bg-surface-container-high/60 hover:border-primary/30">
              <div class="w-full md:w-48 h-48 bg-surface-container-lowest overflow-hidden flex items-center justify-center p-4">
                <img :src="'http://localhost:3000/Images_product/'+item.AnhDaiDien" :alt="item.name" class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"/>
              </div>
              <div class="flex-1 p-6 flex flex-col md:flex-row justify-between w-full">
                <div class="space-y-2">
                  <div class="flex gap-2 mb-1">
                    <span class="px-2 py-0.5 bg-tertiary/10 text-tertiary border border-tertiary/20 text-[10px] font-black uppercase rounded-full">{{ item.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : item.ChiTietPhanLoai }}</span>
                  </div>
                  <h4 class="font-headline text-xl font-bold text-white group-hover:text-primary transition-colors">{{ item.TenMH }}</h4>
                  <p class="text-sm text-outline font-medium tracking-tight">Mã định danh: {{ item.MaPhanLoai }}</p>
                </div>
                <div class="mt-4 md:mt-0 md:text-right flex flex-col justify-between">
                  <span class="text-xs text-outline font-bold uppercase tracking-widest">Số lượng: 0{{ item.SoLuong }}</span>
                  <span class="text-2xl font-headline font-black text-primary">{{ formatPrice(item.DonGiaBan) }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="lg:col-span-4 space-y-8 sticky top-24">
          
          <section class="glass-panel rounded-xl p-6 border border-outline-variant/10 shadow-xl">
            <div class="flex items-center gap-3 mb-6 border-b border-outline-variant/10 pb-4">
              <div class="w-10 h-10 rounded-lg bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">person_pin_circle</span>
              </div>
              <div>
                <h3 class="font-headline font-bold text-white leading-none">Người Nhận</h3>
                <p class="text-[10px] text-outline uppercase tracking-widest mt-1">Thông tin giao hàng</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="text-[10px] text-outline font-black uppercase tracking-widest">Họ và tên</label>
                <p class="font-bold text-white mt-1">{{ orderInfo.TenNguoiNhan }}</p>
              </div>
              <div>
                <label class="text-[10px] text-outline font-black uppercase tracking-widest">Số điện thoại</label>
                <p class="font-bold text-white mt-1">{{ orderInfo.SDTNguoiNhan }}</p>
              </div>
              <div>
                <label class="text-[10px] text-outline font-black uppercase tracking-widest">Địa chỉ chi tiết</label>
                <p class="text-sm text-on-surface-variant leading-relaxed mt-1">{{ orderInfo.DiaChiGiao }}</p>
              </div>
            </div>
          </section>

          <section class="glass-panel rounded-xl p-6 border border-outline-variant/10 bg-gradient-to-br from-surface-container-high to-surface shadow-xl">
            <h3 class="font-headline text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <span class="material-symbols-outlined text-secondary">payments</span>
              Thanh Toán
            </h3>
            
            <div class="space-y-4 mb-8">
              <div class="flex justify-between items-center text-sm">
                <span class="text-outline">Tạm tính</span>
                <span class="font-bold text-white">{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-outline">Khuyến mãi</span>
                <span class="text-primary font-bold">- {{ formatPrice(discount) }}</span>
              </div>
              <!-- <div class="flex justify-between items-center text-sm">
                <span class="text-outline">Bảo hiểm</span>
                <span class="font-bold text-white">0₫</span>
              </div> -->
              
              <div class="pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                <span class="font-headline font-bold text-white uppercase tracking-widest text-xs">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary">{{ formatPrice(orderInfo.TongTien) }}</span>
              </div>
            </div>
            
            <div class="p-4 rounded-lg bg-surface-container-lowest border border-primary/20 flex items-start gap-3">
              <span class="material-symbols-outlined text-primary text-lg mt-0.5">verified_user</span>
              <div class="text-[11px] text-on-surface-variant leading-tight">
                Đơn hàng của bạn được bảo hộ bởi <span class="text-primary font-bold">The Collector's Shield</span>. Hoàn tiền 200% nếu phát hiện hàng giả hoặc hư hỏng.
              </div>
            </div>
          </section>
          
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import TheHeader from '../../components/TheHeader.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

const router = useRouter();
const route = useRoute();

const discount = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    // Nếu item.KhuyenMai bị null/undefined, nó sẽ tự động biến thành 0
    return sum + (Number(item.KhuyenMai) || 0);
  }, 0);
});
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const orderItems = ref([]); 
const orderInfo = ref({});
const orderStatus = ref([]);
const order = ref([]);

//format time từ sql lên giao diện
const formatTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${hours}:${minutes}, ${day}/${month}`;
};

const baseSteps = [
  { name: 'Chờ duyệt', icon: 'receipt_long' },
  { name: 'Đang đóng gói', icon: 'inventory_2' },
  { name: 'Đang vận chuyển', icon: 'local_shipping' },
  { name: 'Đã giao', icon: 'check_circle' }
];

// Logic Lộ trình động
const timeline = computed(() => {
  // Bọc lót an toàn khi lấy trạng thái mới nhất
  const latestStepName = (orderStatus.value && orderStatus.value.length > 0) 
    ? orderStatus.value[orderStatus.value.length - 1].TenTrangThai 
    : '';

  return baseSteps.map((step) => {
    // Thêm mảng rỗng [] dự phòng nếu orderStatus.value bị undefined
    const safeOrderStatus = orderStatus.value || [];
    const dbRecord = safeOrderStatus.find(s => s.TenTrangThai === step.name);
    
    let currentStatus = 'pending';
    let timeString = null;

    if (dbRecord) {
      timeString = formatTime(dbRecord.ThoiGian);
      currentStatus = (step.name === latestStepName) ? 'active' : 'completed';
    }

    return {
      ...step,
      status: currentStatus,
      time: timeString
    };
  });
});

// 4. Tính toán độ dài thanh tiến trình màu cam ĐỘNG
const progressWidth = computed(() => {
  if (!orderStatus.value || orderStatus.value.length === 0) return '0%';
  
  const latestStepName = orderStatus.value[orderStatus.value.length - 1].TenTrangThai;
  let currentIndex = baseSteps.findIndex(s => s.name === latestStepName);
  
  if (currentIndex === -1) currentIndex = 0;
  const stepCount = baseSteps.length - 1;
  
  return `${(currentIndex / stepCount) * 100}%`;
});

const subtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.DonGia * item.SoLuong, 0);
});

const fetchOrderdata = async () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  if (!token || !userString) {
    router.push('/login');
    return;
  }
  const maKH = JSON.parse(userString).MaKH;
  const maDH = route.params.id;
  try {
    const response = await fetch(`http://localhost:3000/api/don_hang/watch_detail_order/${maKH}/${maDH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      orderInfo.value = result.data.ThongTinGiaoHang; 
      orderItems.value = result.data.DanhSachHang;
      orderStatus.value = result.data.Trang_thai_don_hang;
    } else {
      console.error(result.message);
      order.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi tải thông tin đơn hàng:", error);
  }
}

onMounted(() => {
  fetchOrderdata();
  if (!authStore.user) {
    const userString = localStorage.getItem('user');
    if (userString) authStore.user = JSON.parse(userString);
  }
  window.scrollTo(0, 0); // Đảm bảo luôn cuộn lên top khi vào trang
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.glass-panel {
  background: rgba(28, 31, 43, 0.4);
  backdrop-filter: blur(16px);
}
</style>