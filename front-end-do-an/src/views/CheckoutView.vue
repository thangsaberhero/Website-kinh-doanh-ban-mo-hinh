<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
      <form @submit.prevent="processCheckout" class="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
        
        <div class="lg:col-span-7 w-full space-y-12">
          
          <section>
            <div class="flex items-center gap-3 mb-8">
                <span class="text-primary font-headline text-3xl font-bold italic">01</span>
                <h2 class="text-2xl font-headline font-bold uppercase tracking-tight text-white">Thông tin giao hàng</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Họ và tên</label>
                <input v-model="shippingInfo.name" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="Nguyễn Văn A" type="text"/>
                </div>
                
                <div>
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Số điện thoại</label>
                <input v-model="shippingInfo.phone" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="090 123 4567" type="tel"/>
                </div>
                
                <div>
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Email</label>
                <input v-model="shippingInfo.email" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="example@collect.vn" type="email"/>
                </div>
                
                <div class="md:col-span-2">
                <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Địa chỉ nhận hàng</label>
                <input v-model="shippingInfo.address" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố" type="text"/>
                </div>
            </div>
        </section>

        <section>
            <div class="flex items-center gap-3 mb-8">
              <span class="text-primary font-headline text-3xl font-bold italic">02</span>
              <h2 class="text-2xl font-headline font-bold uppercase tracking-tight text-white">Phương thức thanh toán</h2>
            </div>
            
            <div class="space-y-4">
              <div :class="['border rounded-xl transition-all duration-300 overflow-hidden', paymentMethod === 'card' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="card" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Thẻ tín dụng / Ghi nợ</span>
                  <span class="material-symbols-outlined text-outline">credit_card</span>
                </label>
                
                <div v-if="paymentMethod === 'card'" class="px-6 pb-6 pt-2 border-t border-outline-variant/15 grid grid-cols-2 gap-6 slide-down">
                  <div class="col-span-2 space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Số thẻ</label>
                    <input class="w-full bg-transparent border-none border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-2 px-0 text-sm" placeholder="0000 0000 0000 0000" type="text"/>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Ngày hết hạn</label>
                    <input class="w-full bg-transparent border-none border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-2 px-0 text-sm" placeholder="MM/YY" type="text"/>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">CVV</label>
                    <input class="w-full bg-transparent border-none border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-2 px-0 text-sm" placeholder="123" type="text"/>
                  </div>
                </div>
              </div>

              <div :class="['border rounded-xl transition-all duration-300', paymentMethod === 'momo' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="momo" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Ví MoMo / ZaloPay</span>
                  <span class="material-symbols-outlined text-outline">account_balance_wallet</span>
                </label>
              </div>

              <div :class="['border rounded-xl transition-all duration-300', paymentMethod === 'cod' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="cod" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Thanh toán khi nhận hàng (COD)</span>
                  <span class="material-symbols-outlined text-outline">local_shipping</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        <aside class="lg:col-span-5 w-full sticky top-24">
          <div class="bg-surface-container-high rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-outline-variant/20">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            
            <h2 class="text-xl font-headline font-bold uppercase tracking-widest mb-6 border-b border-outline-variant/20 pb-4 text-white">Tóm tắt đơn hàng</h2>
            
            <div class="space-y-6 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
              <div v-for="item in checkoutItems" :key="item.id" class="flex gap-4">
                <div class="w-20 h-20 bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden flex-shrink-0">
                  <img :src="'/Images_product/'+ item.AnhDaiDien" :alt="item.TenMH" class="w-full h-full object-contain p-2"/>
                </div>
                <div class="flex-grow flex flex-col justify-center">
                  <h4 class="text-sm font-bold text-white leading-tight line-clamp-2">{{ item.TenMH }}</h4>
                  <p class="text-[10px] text-outline font-bold uppercase tracking-wider mt-1">SL: {{ item.SoLuong }}</p>
                  <div class="mt-1 text-primary font-headline font-bold">{{ formatPrice(item.DonGia) }}</div>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-outline-variant/20">
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Tạm tính</span>
                <span class="text-white">{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Phí vận chuyển</span>
                <span class="text-primary font-bold">Miễn phí</span>
              </div>
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Giảm giá</span>
                <span class="text-error font-bold">- {{ formatPrice(discount) }}</span>
              </div>
              
              <div class="flex justify-between items-end pt-6">
                <span class="text-sm font-bold uppercase tracking-widest text-white">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>

            <button 
              type="submit"
              :disabled="isProcessing"
              class="w-full mt-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest text-sm rounded-lg neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="isProcessing" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              {{ isProcessing ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT ĐẶT HÀNG' }}
            </button>

            <button 
                @click="router.push('/cart')" 
                type="button" 
                class="w-full mt-4 py-3 text-xs font-bold uppercase tracking-widest text-outline hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                <span class="material-symbols-outlined text-[16px]">keyboard_return</span>
                Trở về giỏ hàng
            </button>
            
            <div class="mt-6 flex items-center justify-center gap-2 text-outline text-[10px] font-bold uppercase tracking-widest">
              <span class="material-symbols-outlined text-[14px]">verified_user</span>
              Bảo hành chính hãng 100%
            </div>
          </div>
        </aside>
      </form>
    </main>

    <footer class="bg-surface-container-low mt-auto py-8 border-t border-outline-variant/15">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="text-lg font-black text-primary font-headline tracking-tighter uppercase">FigureCollect</div>
        <div class="text-[10px] font-bold tracking-widest text-outline uppercase">© 2026 FIGURECOLLECT. THE NEON VAULT PROTOCOL.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const isProcessing = ref(false);
const paymentMethod = ref('card'); 
const checkoutItems = ref([]); // Đổi thành mảng rỗng để chứa dữ liệu thật
const discount = ref(0); // Tạm thời set giảm giá về 0, bạn có thể tự thêm logic mã giảm giá sau

// Dữ liệu Form giao hàng
const shippingInfo = reactive({
  name: '',
  phone: '',
  email: '',
  address: ''
});

// Hàm định dạng tiền tệ
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Tính toán tự động dựa trên dữ liệu thật
const subtotal = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + (item.DonGia * item.SoLuong), 0);
});
const totalPrice = computed(() => Math.max(0, subtotal.value - discount.value));

// ===============================================
// HÀM TẢI DỮ LIỆU KHI VỪA MỞ TRANG
// ===============================================
onMounted(async () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) {
    toastStore.showToast("Vui lòng đăng nhập để đặt hàng!", "error");
    router.push('/login');
    return;
  }

  const userObj = JSON.parse(userString);
  const maTK = userObj.MaTK || userObj.id;
  const maKH = userObj.MaKH || userObj.id;

  try {
    // 1. GỌI API LẤY THÔNG TIN CÁ NHÂN (Để điền tự động vào Form)
    const resInfo = await fetch(`http://localhost:3000/api/info_user/laythongtin/${maTK}`);
    const dataInfo = await resInfo.json();
    
    if (resInfo.ok && dataInfo.data) {
      const userData = dataInfo.data;
      shippingInfo.name = userData.TenKH || userData.TenDN || '';
      shippingInfo.email = userData.Email || userData.email || '';
      shippingInfo.phone = userData.SDT || '';
      shippingInfo.address = userData.diachi || userData.DiaChi || '';
    }

    // 2. GỌI API LẤY GIỎ HÀNG (Dùng lại hàm watch cart ở trang Giỏ Hàng)
    const resCart = await fetch(`http://localhost:3000/api/add_cart/watch/${maKH}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataCart = await resCart.json();

    if (resCart.ok) {
      checkoutItems.value = dataCart.data;
      
      // Nếu giỏ hàng rỗng, đá khách về trang Giỏ Hàng
      if (checkoutItems.value.length === 0) {
        toastStore.showToast("Giỏ hàng của bạn đang trống!", "error");
        router.push('/cart');
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu Checkout:", error);
    toastStore.showToast("Không thể tải thông tin đặt hàng, vui lòng thử lại!", "error");
  }
});

// ===============================================
// XỬ LÝ ĐẶT HÀNG (Gọi API Tạo Đơn)
// ===============================================
// ===============================================
// XỬ LÝ ĐẶT HÀNG (Gọi API Xác Nhận Đơn Hàng)
// ===============================================
const processCheckout = async () => {
  // 1. KIỂM TRA BẢO VỆ VÒNG NGOÀI
  if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
    toastStore.showToast("Vui lòng điền đầy đủ thông tin giao hàng!", "error");
    return;
  }

  if (checkoutItems.value.length === 0) {
    toastStore.showToast("Giỏ hàng của bạn đang trống!", "error");
    return;
  }

  isProcessing.value = true;
  
  // 2. LẤY THÔNG TIN XÁC THỰC
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    toastStore.showToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
    router.push('/login');
    return;
  }

  // Lấy đúng mã Khách Hàng (Tương thích cả 2 trường hợp id hoặc MaKH)
  const maKH = JSON.parse(userString).MaKH || JSON.parse(userString).id;

  try {
    // 3. ĐÓNG GÓI DỮ LIỆU CỰC KỲ ĐƠN GIẢN
    // Vì Backend của bạn chỉ yêu cầu MaKH (nhìn dòng: const { MaKH } = req.body;)
    const payload = {
      MaKH: parseInt(maKH),
      
      // Bổ sung thêm các trường này vào Payload (Nếu Backend của bạn sau này cần lưu địa chỉ, SĐT)
      // Hiện tại Backend của bạn chưa thấy có lệnh UPDATE thông tin giao hàng vào bảng DonHang
      TenNguoiNhan: shippingInfo.name,
      SDTNguoiNhan: shippingInfo.phone,
      DiaChiGiao: shippingInfo.address,
      TongTien: totalPrice.value
    };

    console.log("Gói hàng gửi đi:", payload);

    // 4. GỌI API ĐẾN BACKEND
    const response = await fetch('http://localhost:3000/api/add_cart/xacnhan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra khi tạo đơn hàng!");
    }

    // 5. XỬ LÝ KHI THÀNH CÔNG
    toastStore.showToast("🎉 " + data.message, "success");
    
    // Chuyển hướng khách hàng về trang Lịch sử đơn hàng để xem lại
    router.push('/orders'); 

  } catch (error) {
    console.error("Lỗi quá trình đặt hàng:", error);
    toastStore.showToast(error.message, "error");
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.neon-glow {
  box-shadow: 0 0 20px rgba(255, 143, 115, 0.2);
}

.input-focus-glow:focus {
  box-shadow: 0 10px 15px -3px rgba(255, 143, 115, 0.05);
}

/* Hiệu ứng trượt mở Form nhập thẻ mượt mà */
.slide-down {
  animation: slideDown 0.3s ease-out forwards;
  transform-origin: top;
}
@keyframes slideDown {
  from { opacity: 0; transform: scaleY(0.9); }
  to { opacity: 1; transform: scaleY(1); }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
</style>