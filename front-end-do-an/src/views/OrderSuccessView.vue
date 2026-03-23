<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-grow pt-12 pb-24 px-6 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary-container/10 rounded-full blur-[100px]"></div>
      </div>

      <div class="max-w-4xl mx-auto z-10 relative">
        <section class="text-center mb-16">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary-container mb-8 shadow-[0_0_40px_rgba(255,143,115,0.4)] animate-pulse">
            <span class="material-symbols-outlined text-on-primary-fixed text-5xl font-bold" style="font-variation-settings: 'FILL' 1;">check_circle</span>
          </div>
          <h1 class="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-primary neon-glow mb-6 italic">ĐẶT HÀNG THÀNH CÔNG!</h1>
          <p class="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
            Cảm ơn bạn đã tin tưởng <span class="text-white font-bold">FigureCollect</span>. Tuyệt tác của bạn đang được chuẩn bị để gia nhập bộ sưu tập.
          </p>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          <div class="md:col-span-2 bg-surface-container-low p-8 rounded-2xl relative overflow-hidden border border-outline-variant/15 shadow-xl">
            <div class="absolute -top-4 -right-4 p-4 opacity-5 pointer-events-none">
              <span class="material-symbols-outlined text-[150px]">verified</span>
            </div>
            <div class="flex flex-col h-full justify-between relative z-10">
              <div class="mb-6">
                <span class="text-[10px] uppercase tracking-[0.2em] text-primary mb-2 block font-bold">Mã đơn hàng</span>
                <h2 class="font-headline text-4xl font-bold text-white tracking-tight">{{ orderId }}</h2>
              </div>
              <div class="grid grid-cols-2 gap-8">
                <div>
                  <span class="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-bold">Ngày đặt</span>
                  <p class="text-white font-medium">{{ orderDate }}</p>
                </div>
                <div>
                  <span class="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-bold">Thanh toán</span>
                  <p class="text-white font-medium">Đã xác nhận</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-surface-container-high p-8 rounded-2xl border-l-4 border-primary shadow-xl">
            <span class="text-[10px] uppercase tracking-[0.2em] text-primary mb-4 block font-bold">Tóm tắt đơn hàng</span>
            <div class="space-y-4">
              <div class="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <span class="text-sm text-on-surface-variant font-medium">Số lượng</span>
                <span class="text-white font-bold">02 SP</span>
              </div>
              <div class="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <span class="text-sm text-on-surface-variant font-medium">Vận chuyển</span>
                <span class="text-white font-bold">Miễn phí</span>
              </div>
              <div class="pt-2">
                <span class="text-[10px] uppercase tracking-[0.2em] text-outline mb-1 block font-bold">Tổng thanh toán</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">12.500.000đ</span>
              </div>
            </div>
          </div>
        </div>

        <section class="mb-16 bg-surface-container-lowest p-8 md:p-10 rounded-2xl border border-outline-variant/15 shadow-2xl">
          <h3 class="font-headline text-2xl font-bold mb-10 tracking-tight flex items-center text-white">
            <span class="w-8 h-[3px] bg-primary mr-4 rounded-full"></span>
            CÁC BƯỚC TIẾP THEO
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
            <div class="hidden md:block absolute top-6 left-12 right-12 h-[2px] bg-outline-variant/30 z-0"></div>
            
            <div class="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
              <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,143,115,0.4)] ring-4 ring-surface-container-lowest">
                <span class="material-symbols-outlined text-on-primary-fixed" style="font-variation-settings: 'FILL' 1;">check</span>
              </div>
              <h4 class="font-headline text-lg font-bold text-white mb-2">Xác nhận đơn hàng</h4>
              <p class="text-sm text-on-surface-variant font-medium leading-relaxed">Hệ thống đã ghi nhận yêu cầu và đang kiểm tra tồn kho vật lý.</p>
            </div>
            
            <div class="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
              <div class="w-12 h-12 rounded-full bg-surface-container-high border-2 border-primary flex items-center justify-center mb-6 ring-4 ring-surface-container-lowest">
                <span class="material-symbols-outlined text-primary">inventory_2</span>
              </div>
              <h4 class="font-headline text-lg font-bold text-white mb-2">Đóng gói</h4>
              <p class="text-sm text-on-surface-variant font-medium leading-relaxed">Tuyệt tác được bảo vệ trong lớp kén chống sốc chuẩn Collector.</p>
            </div>
            
            <div class="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
              <div class="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-outline-variant/50 flex items-center justify-center mb-6 ring-4 ring-surface-container-lowest opacity-60">
                <span class="material-symbols-outlined text-outline">local_shipping</span>
              </div>
              <h4 class="font-headline text-lg font-bold text-white mb-2 opacity-60">Vận chuyển</h4>
              <p class="text-sm text-on-surface-variant font-medium leading-relaxed opacity-60">Đơn vị vận chuyển chuyên biệt sẽ đưa báu vật đến tận tay bạn.</p>
            </div>
          </div>
        </section>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button @click="router.push('/orders')" class="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest text-sm rounded-lg neon-glow hover:brightness-110 active:scale-95 transition-all">
            Xem đơn hàng của tôi
          </button>
          <button @click="router.push('/category')" class="w-full sm:w-auto px-10 py-4 border-2 border-primary text-primary font-headline font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-primary/10 active:scale-95 transition-all">
            Tiếp tục mua sắm
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Tạo dữ liệu giả lập cho ngày tháng và Mã đơn hàng
const orderId = ref('');
const orderDate = ref('');

onMounted(() => {
  // Tạo mã đơn hàng ngẫu nhiên kiểu #FC-XXXX
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  orderId.value = `#FC-${randomNum}`;

  // Lấy ngày hôm nay định dạng tiếng Việt
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  orderDate.value = today.toLocaleDateString('vi-VN', options);
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