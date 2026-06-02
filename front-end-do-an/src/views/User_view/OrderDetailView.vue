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
            {{ "Mã: " + (orderInfo.MaDonHangHienThi || route.params.id) }}
          </h1>
        </div>
        <div class="flex flex-wrap gap-4">
          
          <button v-if="orderInfo.TrangThaiThanhToan === 'Chưa thanh toán' && !isExpired(orderInfo.NgayLapDon)"
                  @click="showPaymentModal = true" 
                  class="px-6 py-3 bg-gradient-to-r from-rose-600 to-[#a50064] text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse hover:brightness-110 active:scale-95">
            <span class="material-symbols-outlined text-lg">qr_code_scanner</span>
            Thanh toán ngay ({{ formatCountdown(orderInfo.NgayLapDon) }})
          </button>
          
          <button v-else-if="orderInfo.TrangThaiThanhToan === 'Chưa thanh toán' && isExpired(orderInfo.NgayLapDon)"
                  disabled
                  class="px-6 py-3 bg-surface-container-high text-outline text-sm font-bold rounded-lg flex items-center gap-2 border border-outline-variant/20 cursor-not-allowed">
            <span class="material-symbols-outlined text-lg">hourglass_empty</span>
            Đang xử lý hủy
          </button>

          <!-- 🔥 ĐÃ SỬA: Thay orderInfo.TrangThaiDonHang thành currentOrderStatus -->
          <button v-if="currentOrderStatus === 'Chờ duyệt' && orderInfo.TrangThaiThanhToan === 'Chưa thanh toán'"
                  @click="showCancelModal = true"
                  class="px-6 py-3 border border-error/50 text-error hover:bg-error/10 hover:border-error text-sm font-bold rounded-lg flex items-center gap-2 transition-all active:scale-95">
            <span class="material-symbols-outlined text-lg">cancel</span>
            Hủy đơn hàng
          </button>

          <button v-else class="px-6 py-3 bg-surface-container-high hover:bg-surface-bright text-on-surface text-sm font-bold rounded-lg flex items-center gap-2 transition-all border border-outline-variant/15">
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
              <!-- Đường line nền -->
              <div class="absolute top-5 left-0 w-full h-[2px] bg-surface-container-highest z-0">
                <div :class="['h-full transition-all duration-1000', currentOrderStatus === 'Đã hủy' ? 'bg-error shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(255,143,115,0.5)]']" :style="{ width: progressWidth }"></div>
              </div>

              <div v-for="(step, index) in timeline" :key="index" class="relative z-10 flex flex-col items-center text-center flex-1">
                
                <!-- ICON ĐÃ HOÀN THÀNH -->
                <div v-if="step.status === 'completed'" class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary-fixed mb-3 shadow-[0_0_15px_rgba(255,143,115,0.4)]">
                  <span class="material-symbols-outlined text-lg font-bold">check</span>
                </div>
                
                <!-- ICON ĐANG ACTIVE (MÀU ĐỎ KHI HỦY) -->
                <div v-else-if="step.status === 'active' && step.name === 'Đã hủy'" class="w-12 h-12 -mt-1 rounded-full bg-error border-4 border-surface flex items-center justify-center text-white mb-2 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse">
                  <span class="material-symbols-outlined text-xl">{{ step.icon }}</span>
                </div>

                <!-- ICON ĐANG ACTIVE (MÀU CAM KHI HOÀN HÀNG) -->
                <div v-else-if="step.status === 'active' && step.name.includes('hoàn hàng')" class="w-12 h-12 -mt-1 rounded-full bg-orange-500 border-4 border-surface flex items-center justify-center text-white mb-2 shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse">
                  <span class="material-symbols-outlined text-xl">{{ step.icon }}</span>
                </div>
                
                <!-- ICON ĐANG ACTIVE (BÌNH THƯỜNG) -->
                <div v-else-if="step.status === 'active'" class="w-12 h-12 -mt-1 rounded-full bg-primary-container border-4 border-surface flex items-center justify-center text-on-primary-fixed mb-2 shadow-[0_0_20px_rgba(255,120,86,0.6)] animate-pulse">
                  <span class="material-symbols-outlined text-xl">{{ step.icon }}</span>
                </div>
                
                <!-- ICON PENDING (CHƯA TỚI) -->
                <div v-else class="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-outline mb-3">
                  <span class="material-symbols-outlined text-lg">{{ step.icon }}</span>
                </div>

                <!-- MÀU SẮC TEXT TƯƠNG ỨNG -->
                <span :class="['text-[11px] font-bold uppercase tracking-tighter whitespace-nowrap', step.status === 'active' ? (step.name === 'Đã hủy' ? 'text-error' : (step.name.includes('hoàn hàng') ? 'text-orange-400' : 'text-primary')) : (step.status === 'completed' ? 'text-white' : 'text-outline')]">
                  {{ step.name }}
                </span>
                <span v-if="step.time" class="text-[10px] text-outline mt-1">{{ step.time }}</span>
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <h3 class="font-headline text-lg font-bold px-2 flex items-center gap-2 text-white">
              <span class="material-symbols-outlined text-tertiary">inventory_2</span>
              Danh Sách Sản Phẩm
            </h3>
            
            <div v-for="item in orderItems" :key="item.MaPhanLoai + '-' + item.LaHangKhuyenMai" @click="router.push(`/product/${item.MaMoHinh}`)" class="glass-panel group cursor-pointer overflow-hidden flex flex-col md:flex-row items-center border border-outline-variant/10 rounded-xl transition-all hover:bg-surface-container-high/60 hover:border-primary/30">
              <div class="w-full md:w-48 h-48 bg-surface-container-lowest overflow-hidden flex items-center justify-center p-4">
                <img :src="(item.AnhDaiDien && item.AnhDaiDien.startsWith('http')) ? item.AnhDaiDien : `${API_BASE_URL}/Images_product/` + item.AnhDaiDien" :alt="item.TenMH" class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"/>
              </div>
              <div class="flex-1 p-6 flex flex-col md:flex-row justify-between w-full">
                <div class="space-y-2">
                  <div class="flex gap-2 mb-1">
                    <span class="px-2 py-0.5 bg-tertiary/10 text-tertiary border border-tertiary/20 text-[10px] font-black uppercase rounded-full">{{ item.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : item.ChiTietPhanLoai }}</span>
                    <span v-if="item.LaHangKhuyenMai === 1" class="px-2 py-0.5 bg-error/10 text-error border border-error/20 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                      <span class="material-symbols-outlined text-[12px]">local_fire_department</span> SALE
                    </span>
                  </div>
                  <h4 class="font-headline text-xl font-bold text-white group-hover:text-primary transition-colors">{{ item.TenMH }}</h4>
                  <p class="text-sm text-outline font-medium tracking-tight">Mã định danh: {{ item.MaPhanLoai }}</p>
                </div>
                <div class="mt-4 md:mt-0 md:text-right flex flex-col justify-between">
                  <span class="text-xs text-outline font-bold uppercase tracking-widest">Số lượng: {{ item.SoLuong < 10 ? '0'+item.SoLuong : item.SoLuong }}</span>
                  <div class="text-right mt-1">
                    <div v-if="item.LaHangKhuyenMai === 1" class="text-xs text-outline line-through mb-0.5">
                      {{ formatPrice(item.DonGiaGoc * item.SoLuong) }}
                    </div>
                    <span class="text-2xl font-headline font-black text-primary">{{ formatPrice(item.ThanhTienSP) }}</span>
                  </div>
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
              <div class="pt-3 border-t border-outline-variant/15">
                <label class="text-[10px] text-outline font-black uppercase tracking-widest">Ghi chú của bạn</label>
                <p class="text-sm text-tertiary italic leading-relaxed mt-1">"{{ orderInfo.Note || 'Không có ghi chú' }}"</p>
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
                <span class="text-outline">Tạm tính (Tiền hàng)</span>
                <span class="font-bold text-white">{{ formatPrice(orderInfo.TongTien) }}</span>
              </div>
              
              <div class="flex justify-between items-center text-sm" v-if="orderInfo.TongTien > orderInfo.ThanhTien">
                <span class="text-outline">Voucher giảm giá và ưu đãi</span>
                <span class="text-error font-bold">- {{ formatPrice(orderInfo.TongTien - orderInfo.ThanhTien) }}</span>
              </div>
              
              <div class="pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                <span class="font-headline font-bold text-white uppercase tracking-widest text-xs">Tổng Hóa Đơn</span>
                <span class="text-lg font-headline font-black text-white">{{ formatPrice(orderInfo.ThanhTien) }}</span>
              </div>

              <div class="pt-4 border-t border-outline-variant/20 mt-4">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-outline uppercase font-bold text-[10px] tracking-widest">Đã thanh toán</span>
                  <span class="text-green-400 font-bold">{{ formatPrice(orderInfo.DaThanhToan || 0) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm mt-2">
                  <span class="text-outline uppercase font-bold text-[10px] tracking-widest">Phương thức</span>
                  <span class="text-white font-medium max-w-[200px] text-right truncate" :title="orderInfo.TenPhuongThuc || 'Chưa giao dịch'">
                    {{ orderInfo.TenPhuongThuc || 'Chưa giao dịch' }}
                  </span>
                </div>
              </div>

              <div class="pt-4 border-t border-outline-variant/20 flex justify-between items-end mt-2 bg-primary/5 -mx-6 px-6 py-4 border-b border-b-primary/20">
                <span class="font-headline font-bold text-white uppercase tracking-widest text-[11px] w-2/3">
                  Số tiền cần trả 
                </span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">
                  {{ formatPrice(Math.max(0, orderInfo.ThanhTien - (orderInfo.DaThanhToan || 0))) }}
                </span>
              </div>
            </div>
            
            <div class="p-4 rounded-lg bg-surface-container-lowest border border-primary/20 flex items-start gap-3">
              <span class="material-symbols-outlined text-primary text-lg mt-0.5">verified_user</span>
              <div class="text-[11px] text-on-surface-variant leading-tight">
                Đơn hàng của bạn được bảo hộ bởi <span class="text-primary font-bold">The Collector's Shield</span>. Hoàn tiền 200% nếu phát hiện hàng giả.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <div v-if="showPaymentModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
        <h3 class="font-headline text-xl font-bold text-white mb-2 uppercase italic">Thanh toán đơn hàng</h3>
        <p class="text-sm text-on-surface-variant mb-6">Mã đơn: <span class="font-bold text-primary">{{ orderInfo.MaDonHangHienThi || route.params.id }}</span></p>
        
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

    <div v-if="showCancelModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-surface-container-high border border-error/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(244,63,94,0.15)] animate-[fadeIn_0.2s_ease-out]">
        <div class="flex flex-col items-center text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-4 border border-error/20">
            <span class="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h3 class="font-headline text-2xl font-bold text-white mb-2">Hủy đơn hàng?</h3>
          <p class="text-sm text-on-surface-variant">Bạn có chắc chắn muốn hủy đơn hàng <span class="font-bold text-white">{{ orderInfo.MaDonHangHienThi || route.params.id }}</span> không? Hành động này không thể hoàn tác.</p>
        </div>
        
        <div class="flex gap-3">
          <button @click="showCancelModal = false" class="flex-1 py-3.5 bg-surface-container text-sm font-bold uppercase tracking-widest text-outline hover:text-white rounded-xl transition-colors">
            Quay lại
          </button>
          <button @click="confirmCancelOrder" :disabled="isCanceling" class="flex-1 py-3.5 bg-error text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all flex justify-center items-center gap-2 shadow-lg shadow-error/20 disabled:opacity-50">
            <span v-if="isCanceling" class="material-symbols-outlined animate-spin text-sm">autorenew</span>
            Đồng ý hủy
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';
import TheHeader from '../../components/TheHeader.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();

const router = useRouter();
const route = useRoute();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const orderItems = ref([]); 
const orderInfo = ref({});
const orderStatus = ref([]);
const order = ref([]);

// QUẢN LÝ THANH TOÁN LẠI
const showPaymentModal = ref(false);
const repayMethod = ref('Thanh toán toàn bộ');
const paymentGateway = ref('momo'); 
const isProcessingPayment = ref(false);

// QUẢN LÝ HỦY ĐƠN HÀNG (MỚI)
const showCancelModal = ref(false);
const isCanceling = ref(false);

// 🔥 ĐÃ BỔ SUNG: Computed tự động nhặt trạng thái mới nhất từ Lộ trình (Timeline)
const currentOrderStatus = computed(() => {
  if (orderStatus.value && orderStatus.value.length > 0) {
    return orderStatus.value[orderStatus.value.length - 1].TenTrangThai;
  }
  return '';
});

// Đồng hồ đếm ngược
const now = ref(Date.now());
let timerInterval;

const formatTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${hours}:${minutes}, ${day}/${month}`;
};

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

const dynamicSteps = computed(() => {
  const status = currentOrderStatus.value;
  
  // Nếu đơn bị hủy: Cắt ngắn lộ trình, chỉ để lại Chờ duyệt và Đã hủy
  if (status === 'Đã hủy') {
    return [
      { name: 'Chờ duyệt', icon: 'receipt_long' },
      { name: 'Đã hủy', icon: 'cancel' }
    ];
  }
  
  // Nếu đơn bị hoàn: Rẽ nhánh sang quy trình hoàn hàng
  if (status === 'Đang hoàn hàng' || status === 'Đã hoàn hàng') {
    return [
      { name: 'Chờ duyệt', icon: 'receipt_long' },
      { name: 'Đang vận chuyển', icon: 'local_shipping' },
      { name: 'Đang hoàn hàng', icon: 'assignment_return' },
      { name: 'Đã hoàn hàng', icon: 'keyboard_return' }
    ];
  }

  // Mặc định: Luồng đi chuẩn của một đơn hàng thành công
  return [
    { name: 'Chờ duyệt', icon: 'receipt_long' },
    { name: 'Đang đóng gói', icon: 'inventory_2' },
    { name: 'Đang vận chuyển', icon: 'local_shipping' },
    { name: 'Đã giao', icon: 'check_circle' }
  ];
});

// Cập nhật lại timeline để map theo dynamicSteps thay vì baseSteps
const timeline = computed(() => {
  const latestStepName = currentOrderStatus.value;

  return dynamicSteps.value.map((step) => {
    const safeOrderStatus = orderStatus.value || [];
    const dbRecord = safeOrderStatus.find(s => s.TenTrangThai === step.name);
    
    let currentStatus = 'pending';
    let timeString = null;
    
    if (dbRecord) {
      timeString = formatTime(dbRecord.ThoiGian);
      currentStatus = (step.name === latestStepName) ? 'active' : 'completed';
    }
    
    // Đảm bảo thanh bar chạy mượt mà đến bước Đã hủy
    if (latestStepName === 'Đã hủy' && step.name === 'Chờ duyệt') {
       currentStatus = 'completed';
    }
    
    return { ...step, status: currentStatus, time: timeString };
  });
});

// Cập nhật lại thanh tiến trình (progress width)
const progressWidth = computed(() => {
  if (!orderStatus.value || orderStatus.value.length === 0) return '0%';
  const latestStepName = currentOrderStatus.value;
  let currentIndex = dynamicSteps.value.findIndex(s => s.name === latestStepName);
  
  if (currentIndex === -1) currentIndex = 0;
  return `${(currentIndex / (dynamicSteps.value.length - 1)) * 100}%`;
});

const fetchOrderdata = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }
  const maDH = route.params.id;
  try {
    const response = await fetch(`${API_BASE_URL}/api/don_hang/watch_detail_order/${maDH}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (response.ok) {
      orderInfo.value = result.data.ThongTinGiaoHang; 
      orderItems.value = result.data.DanhSachHang;
      orderStatus.value = result.data.Trang_thai_don_hang;
      document.title = `Mã ${orderInfo.value.MaDonHangHienThi || maDH} | FigureCollect`;
    } else {
      order.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi tải thông tin đơn hàng:", error);
  }
}

const handleRepay = async () => {
  const token = localStorage.getItem('token');
  isProcessingPayment.value = true;
  try {
    const endpoint = paymentGateway.value === 'momo' ? '/api/don_hang/payment/momo/create' : '/api/don_hang/payment/zalopay/create';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ MaDH: route.params.id, HinhThuc: repayMethod.value })
    });
    const data = await response.json();
    if (response.ok) window.location.href = data.checkoutUrl;
    else toastStore.showToast(data.message, "error");
  } catch (error) {
    toastStore.showToast("Lỗi kết nối máy chủ", "error");
  } finally {
    isProcessingPayment.value = false;
  }
};

const confirmCancelOrder = async () => {
  isCanceling.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/don_hang/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ MaDH: route.params.id }) 
    });
    
    const data = await response.json();
    
    if (response.ok) {
      toastStore.showToast("Đã hủy đơn hàng thành công!", "success");
      showCancelModal.value = false;
      fetchOrderdata(); 
    } else {
      toastStore.showToast(data.message, "error");
    }
  } catch (error) {
    console.error("Lỗi khi hủy đơn:", error);
    toastStore.showToast("Lỗi kết nối máy chủ!", "error");
  } finally {
    isCanceling.value = false;
  }
};

onMounted(() => {
  fetchOrderdata();
  if (!authStore.user) {
    const userString = localStorage.getItem('user');
    if (userString) authStore.user = JSON.parse(userString);
  }
  window.scrollTo(0, 0); 
  timerInterval = setInterval(() => { now.value = Date.now(); }, 1000);
});

onUnmounted(() => { clearInterval(timerInterval); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');
.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }
.glass-panel { background: rgba(28, 31, 43, 0.4); backdrop-filter: blur(16px); }
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>