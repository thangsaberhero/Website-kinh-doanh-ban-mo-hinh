<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-grow w-full max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
      
      <div class="w-full max-w-4xl bg-white rounded-3xl shadow-[0_0_50px_rgba(165,0,100,0.15)] overflow-hidden flex flex-col md:flex-row border border-outline-variant/10">
        
        <div class="w-full md:w-5/12 bg-gradient-to-b from-[#b80072] to-[#8a0053] p-10 flex flex-col items-center justify-center relative overflow-hidden text-white">
          <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;"></div>
          
          <h2 class="text-3xl font-bold tracking-wider mb-2 z-10">MoMo</h2>
          <p class="text-pink-200 text-sm mb-8 z-10">Quét mã QR để thanh toán</p>
          
          <div class="bg-white p-4 rounded-2xl shadow-2xl z-10 relative">
            <div class="absolute inset-0 border-4 border-[#a50064]/20 rounded-2xl animate-pulse"></div>
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MoMoMock_FC${orderId}`" alt="QR Code" class="w-48 h-48 object-contain" />
          </div>

          <div class="mt-8 flex items-center gap-2 z-10 bg-black/20 px-4 py-2 rounded-full">
            <span class="material-symbols-outlined text-sm">qr_code_scanner</span>
            <span class="text-xs font-medium">Sử dụng App MoMo hoặc ứng dụng Camera</span>
          </div>
        </div>

        <div class="w-full md:w-7/12 p-10 lg:p-12 bg-gray-50 flex flex-col justify-center text-gray-800">
          
          <div class="mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-1">Thông tin thanh toán</h3>
            <p class="text-gray-500 text-sm">Đơn hàng của bạn sẽ được tự động duyệt ngay khi quét mã.</p>
          </div>

          <div class="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
            <div class="flex justify-between items-center border-b border-gray-100 pb-4">
              <span class="text-gray-500 text-sm font-medium">Nhà cung cấp</span>
              <span class="font-bold text-gray-900">FigureCollect Store</span>
            </div>
            <div class="flex justify-between items-center border-b border-gray-100 pb-4">
              <span class="text-gray-500 text-sm font-medium">Mã đơn hàng</span>
              <span class="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">FC-{{ orderId }}</span>
            </div>
            <div class="flex justify-between items-center border-b border-gray-100 pb-4">
              <span class="text-gray-500 text-sm font-medium">Hình thức</span>
              <span class="font-bold text-[#a50064] text-sm">{{ type }}</span>
            </div>
            <div class="flex justify-between items-center pt-2">
              <span class="text-gray-500 text-sm font-medium">Số tiền thanh toán</span>
              <span class="text-3xl font-black text-[#a50064]">{{ formatPrice(amount) }}</span>
            </div>
          </div>

          <div class="mt-auto space-y-3">
            <div class="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex gap-3 items-start mb-6">
              <span class="material-symbols-outlined text-blue-600">info</span>
              <p class="text-xs font-medium leading-relaxed">
                <strong class="block mb-1">Dành cho Nhà phát triển (Dev Mode):</strong>
                Vì đây là môi trường giả lập, vui lòng bấm nút bên dưới để mô phỏng hành động khách hàng đã quét mã thành công.
              </p>
            </div>

            <button 
              @click="confirmPayment" 
              :disabled="isProcessing"
              class="w-full bg-[#a50064] text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-[#8a0053] active:scale-[0.98] transition-all shadow-lg shadow-[#a50064]/30 flex justify-center items-center gap-2 disabled:opacity-70"
            >
              <span v-if="isProcessing" class="material-symbols-outlined animate-spin">autorenew</span>
              {{ isProcessing ? 'ĐANG XỬ LÝ GIAO DỊCH...' : 'GIẢ LẬP QUÉT MÃ THÀNH CÔNG' }}
            </button>
            
            <button 
                @click="cancelPayment" 
                class="w-full text-center text-gray-500 text-sm font-bold uppercase tracking-widest py-3 hover:text-gray-900 transition-colors"
            >
              Hủy thanh toán & Quay lại
            </button>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheHeader from '../../components/TheHeader.vue';
import { useToastStore } from '../../stores/toast';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const orderId = ref('');
const amount = ref(0);
const type = ref('');
const isProcessing = ref(false);

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

onMounted(() => {
  window.scrollTo(0, 0);
  
  // Lấy dữ liệu từ URL (Do file CheckoutView.vue ném sang)
  orderId.value = route.query.orderId;
  amount.value = route.query.amount;
  type.value = route.query.type || 'Thanh toán MoMo';
  
  if (!orderId.value || !amount.value) {
    toastStore.showToast("Dữ liệu thanh toán không hợp lệ!", "error");
    router.push('/checkout');
  }
});

const confirmPayment = async () => {
  isProcessing.value = true;
  
  try {
    // Gọi API báo cho Backend biết là khách đã bấm Xác nhận
    const response = await fetch('http://localhost:3000/api/don_hang/payment/momo/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          orderId: orderId.value,
          amount: amount.value,
          type: type.value
      })
    });

    if (response.ok) {
      toastStore.showToast("Giao dịch MoMo giả lập thành công!", "success");
      
      // Delay 1.5s tạo cảm giác đang loading y như cổng thật
      setTimeout(() => {
        router.push(`/ordersuccess?orderId=${orderId.value}`);
      }, 1500);
    } else {
        const errorData = await response.json();
        toastStore.showToast(errorData.message || "Lỗi xử lý giao dịch", "error");
        isProcessing.value = false;
    }
  } catch (error) {
    console.error("Lỗi mạng:", error);
    toastStore.showToast("Lỗi kết nối đến máy chủ thanh toán!", "error");
    isProcessing.value = false;
  }
};

const cancelPayment = () => {
  toastStore.showToast("Đã hủy thanh toán. Đơn hàng sẽ bị hủy nếu không thanh toán trong 5 phút.", "error");
  router.push('/orders'); // Có thể cho về trang quản lý đơn hàng
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }
</style>