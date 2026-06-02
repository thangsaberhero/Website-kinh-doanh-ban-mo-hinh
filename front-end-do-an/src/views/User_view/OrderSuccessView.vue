<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-grow pt-12 pb-24 px-6 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" 
             :class="isPaymentFailed ? 'bg-rose-500/10' : 'bg-primary/5'"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px]"
             :class="isPaymentFailed ? 'bg-rose-600/10' : 'bg-primary-container/10'"></div>
      </div>

      <div class="max-w-4xl mx-auto z-10 relative">
        <section class="text-center mb-16">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 animate-pulse"
               :class="isPaymentFailed 
                  ? 'bg-gradient-to-tr from-rose-500 to-rose-700 shadow-[0_0_40px_rgba(244,63,94,0.4)]' 
                  : 'bg-gradient-to-tr from-primary to-primary-container shadow-[0_0_40px_rgba(255,143,115,0.4)]'">
            <span class="material-symbols-outlined text-white text-5xl font-bold" style="font-variation-settings: 'FILL' 1;">
              {{ isPaymentFailed ? 'cancel' : 'check_circle' }}
            </span>
          </div>
          
          <h1 class="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6 italic"
              :class="isPaymentFailed ? 'text-rose-500' : 'text-primary neon-glow'">
            {{ isPaymentFailed ? 'THANH TOÁN THẤT BẠI!' : 'ĐẶT HÀNG THÀNH CÔNG!' }}
          </h1>
          
          <p class="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
            <span v-if="!isPaymentFailed">Cảm ơn bạn đã tin tưởng <span class="text-white font-bold">FigureCollect</span>. Tuyệt tác của bạn đang được chuẩn bị để gia nhập bộ sưu tập.</span>
            <span v-else>Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán. Đơn hàng của bạn sẽ được lưu lại để chờ thanh toán sau.</span>
          </p>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div class="md:col-span-2 bg-surface-container-low p-8 rounded-2xl relative overflow-hidden border border-outline-variant/15 shadow-xl">
            <div class="absolute -top-4 -right-4 p-4 opacity-5 pointer-events-none">
              <span class="material-symbols-outlined text-[150px]">{{ isPaymentFailed ? 'error' : 'verified' }}</span>
            </div>
            <div class="flex flex-col h-full justify-between relative z-10">
              <div class="mb-6">
                <span class="text-[10px] uppercase tracking-[0.2em] mb-2 block font-bold" :class="isPaymentFailed ? 'text-rose-500' : 'text-primary'">Mã đơn hàng</span>
                <h2 class="font-headline text-4xl font-bold text-white tracking-tight">Mã: {{ orderIdDisplay }}</h2>
              </div>
              <div class="grid grid-cols-2 gap-8">
                <div>
                  <span class="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-bold">Ngày đặt</span>
                  <p class="text-white font-medium">{{ formatTime(orderInfo.NgayLapDon) }}</p>
                </div>
                <div>
                  <span class="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-bold">Trạng thái</span>
                  <p class="font-medium" :class="isPaymentFailed ? 'text-rose-400' : 'text-white'">
                    {{ isPaymentFailed ? 'Chưa thanh toán' : 'Chờ duyệt' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-surface-container-high p-8 rounded-2xl border-l-4 shadow-xl" :class="isPaymentFailed ? 'border-rose-500' : 'border-primary'">
            <span class="text-[10px] uppercase tracking-[0.2em] mb-4 block font-bold" :class="isPaymentFailed ? 'text-rose-500' : 'text-primary'">Tóm tắt đơn hàng</span>
            <div class="space-y-4">
              <div class="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <span class="text-sm text-on-surface-variant font-medium">Số lượng</span>
                <span class="text-white font-bold">{{ totalQty < 10 ? '0' + totalQty : totalQty }} SP</span>
              </div>
              <div class="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <span class="text-sm text-on-surface-variant font-medium">Vận chuyển</span>
                <span class="text-white font-bold">Chưa rõ</span>
              </div>
              <div class="pt-2">
                <span class="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-bold">Tổng cần thanh toán</span>
                <span class="text-3xl font-headline font-black tracking-tighter" :class="isPaymentFailed ? 'text-rose-500' : 'text-primary'">
                  {{ formatPrice(orderInfo.TongTien || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button @click="router.push('/orders')" 
                  class="w-full sm:w-auto px-10 py-4 text-on-primary-fixed font-headline font-bold uppercase tracking-widest text-sm rounded-lg hover:brightness-110 active:scale-95 transition-all"
                  :class="isPaymentFailed ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-gradient-to-r from-primary to-primary-container neon-glow'">
            Xem lại đơn hàng
          </button>
          
          <button v-if="!isPaymentFailed" @click="router.push('/category')" class="w-full sm:w-auto px-10 py-4 border-2 border-primary text-primary font-headline font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-primary/10 active:scale-95 transition-all">
            Tiếp tục mua sắm
          </button>
          <button v-else @click="router.push('/orders')" class="w-full sm:w-auto px-10 py-4 border-2 border-rose-500 text-rose-500 font-headline font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-rose-500/10 active:scale-95 transition-all">
            Thanh toán lại
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import TheHeader from '../../components/TheHeader.vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'; 
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const route = useRoute(); 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const orderInfo = ref({});
const orderItems = ref([]);
const totalQty = ref(0);
const orderIdDisplay = ref('');

// --- LOGIC PHÁT HIỆN TRẠNG THÁI THANH TOÁN TỪ URL ---
const isPaymentFailed = computed(() => {
  // 1. Check MoMo (resultCode != 0)
  if (route.query.resultCode && route.query.resultCode !== '0') return true;
  // 2. Check ZaloPay (status != 1)
  if (route.query.status && route.query.status !== '1') return true;
  
  return false;
});

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatTime = (dateString) => {
  if (!dateString) return 'Đang cập nhật';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

const fetchOrderdata = async () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    router.push('/login');
    return;
  }
  
  // Lấy maDH từ biến maDH mới (hoặc tương thích ngược với orderId cũ nếu khách chọn COD)
  let rawMaDH = route.query.maDH || route.query.orderId; 

  if (!rawMaDH) {
    router.push('/');
    return;
  }

  // Đề phòng trường hợp Frontend cũ truyền 1 cục Array vào
  const maDH = Array.isArray(rawMaDH) ? rawMaDH[0] : rawMaDH;
  // orderIdDisplay.value = maDH;

  try {
    const response = await fetch(`${API_BASE_URL}/api/don_hang/watch_detail_order/${maDH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      orderInfo.value = result.data.ThongTinGiaoHang; 
      orderItems.value = result.data.DanhSachHang;
      totalQty.value = orderItems.value.reduce((sum, item) => sum + item.SoLuong, 0);
      
      // 🔥 BỔ SUNG DÒNG NÀY ĐỂ CẬP NHẬT MÃ HIỂN THỊ XỊN
      if (orderInfo.value.MaDonHangHienThi) {
        orderIdDisplay.value = orderInfo.value.MaDonHangHienThi;
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải thông tin hóa đơn:", error);
  }
}

onMounted(() => {
  window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  fetchOrderdata(); 
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.neon-glow {
  text-shadow: 0 0 10px rgba(255, 143, 115, 0.5), 0 0 20px rgba(255, 143, 115, 0.3);
}

button.neon-glow {
  text-shadow: none;
  box-shadow: 0 0 20px rgba(255, 143, 115, 0.2);
}
</style>