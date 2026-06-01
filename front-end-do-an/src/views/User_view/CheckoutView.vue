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
                
                <div class="md:col-span-2">
                  <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Số điện thoại</label>
                  <input v-model="shippingInfo.phone" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="090 123 4567" type="tel"/>
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Địa chỉ nhận hàng</label>
                  <input v-model="shippingInfo.address" required class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300" placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố" type="text"/>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-xs font-label uppercase tracking-widest text-outline mb-2">Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea v-model="shippingInfo.note" rows="2" class="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:border-primary focus:ring-0 text-on-surface p-4 transition-all duration-300 custom-scrollbar" placeholder="Ghi chú thêm về thời gian giao hàng, yêu cầu đóng gói..."></textarea>
                </div>
            </div>
        </section>

        <section>
            <div class="flex items-center gap-3 mb-8">
              <span class="text-primary font-headline text-3xl font-bold italic">02</span>
              <h2 class="text-2xl font-headline font-bold uppercase tracking-tight text-white">Phương thức thanh toán</h2>
            </div>
            
            <div class="space-y-4">
              <div :class="['border rounded-xl transition-all duration-300 overflow-hidden', paymentMethod === 'momo' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="momo" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Thanh toán qua Ví MoMo</span>
                  <span class="material-symbols-outlined text-outline text-[#A50064]">account_balance_wallet</span>
                </label>
              </div>

              <div :class="['border rounded-xl transition-all duration-300 overflow-hidden', paymentMethod === 'zalopay' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant']">
                <label class="flex items-center gap-4 cursor-pointer p-6">
                  <input v-model="paymentMethod" value="zalopay" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5 cursor-pointer" type="radio"/>
                  <span class="flex-grow font-bold text-white">Thanh toán qua ZaloPay</span>
                  <span class="material-symbols-outlined text-outline text-[#0068FF]">account_balance_wallet</span>
                </label>
              </div>

              <div v-if="paymentMethod === 'momo' || paymentMethod === 'zalopay'" class="px-6 pb-6 pt-4 border rounded-xl border-primary/50 bg-surface-container-high slide-down">
                  <h3 class="text-xs font-label uppercase tracking-widest text-outline mb-4">Tùy chọn thanh toán</h3>
                  <div class="flex flex-col gap-3">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input v-model="momoType" value="Thanh toán toàn bộ" type="radio" class="text-primary w-4 h-4" />
                        <span class="text-sm font-medium text-white">Thanh toán toàn bộ (100%)</span>
                    </label>
                    <label v-if="requiresDeposit" class="flex items-center gap-3 cursor-pointer">
                        <input v-model="momoType" value="Cọc một phần" type="radio" class="text-primary w-4 h-4" />
                        <span class="text-sm font-medium text-white">Chỉ đặt cọc trước (Theo quy định sản phẩm)</span>
                    </label>
                  </div>
              </div>

              <div :class="['border rounded-xl transition-all duration-300', paymentMethod === 'cod' ? 'border-primary bg-surface-container-high' : 'border-outline-variant/30 bg-surface-container-low', requiresDeposit ? 'opacity-50 cursor-not-allowed bg-surface-container-lowest' : 'hover:border-outline-variant']">
                <label class="flex items-center gap-4 p-6" :class="requiresDeposit ? 'cursor-not-allowed' : 'cursor-pointer'">
                  <input v-model="paymentMethod" value="cod" :disabled="requiresDeposit" class="text-primary focus:ring-primary bg-surface-dim border-outline w-5 h-5" type="radio" :class="requiresDeposit ? 'cursor-not-allowed' : 'cursor-pointer'"/>
                  <div class="flex-grow">
                      <span class="font-bold text-white block">Thanh toán khi nhận hàng (COD)</span>
                      <span v-if="requiresDeposit" class="text-[11px] text-error font-bold mt-1 block">Không hỗ trợ COD vì giỏ hàng chứa sản phẩm bắt buộc phải đặt cọc!</span>
                  </div>
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
              <div v-for="item in checkoutItems" :key="item.MaPhanLoai" class="flex gap-4">
                <div class="w-20 h-20 bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden flex-shrink-0">
                  <img :src="(item.AnhDaiDien && item.AnhDaiDien.startsWith('http')) ? item.AnhDaiDien : `${API_BASE_URL}/Images_product/` + item.AnhDaiDien" class="w-full h-full object-contain p-2"/>
                </div>
                <div class="flex-grow flex flex-col justify-center">
                  <h4 class="text-sm font-bold text-white leading-tight line-clamp-2">{{ item.TenMH }}</h4>
                  <p class="text-[10px] text-outline font-bold uppercase tracking-wider mt-1">SL: {{ item.SoLuong }}</p>
                  
                  <div v-if="Number(item.DonGiaKhuyenMai) < Number(item.DonGia)">
                      <div v-if="item.SoLuongMuaGiaGoc === 0">
                          <span class="mt-1 block text-primary font-headline font-bold">{{ formatPrice(item.ThanhTien) }}</span>
                          <span class="text-[10px] text-tertiary px-1 py-0.5 bg-tertiary/10 border border-tertiary/20 rounded inline-block mt-1">Giá Sale</span>
                      </div>
                      <div v-else class="mt-1">
                          <span class="block text-primary font-headline font-bold">{{ formatPrice(item.ThanhTien) }}</span>
                          <span class="text-[10px] text-error font-bold block mt-1">Vượt giới hạn ưu đãi!</span>
                          <span class="text-[11px] text-tertiary block">{{ item.SoLuongDuocGiamGia }} SP x {{ formatPrice(item.DonGiaKhuyenMai) }} (Sale)</span>
                          <span class="text-[11px] text-outline block">{{ item.SoLuongMuaGiaGoc }} SP x {{ formatPrice(item.DonGia) }} (Gốc)</span>
                      </div>
                  </div>
                  <div v-else>
                      <span class="mt-1 block text-primary font-headline font-bold">{{ formatPrice(item.ThanhTien) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-outline-variant/20">
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Tạm tính</span>
                <span class="text-white">{{ formatPrice(cartSummary.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Giảm giá</span>
                <span class="text-error font-bold">- {{ formatPrice(cartSummary.discount) }}</span>
              </div>
              
              <div class="flex justify-between items-end pt-6">
                <span class="text-sm font-bold uppercase tracking-widest text-white">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">{{ formatPrice(cartSummary.totalPrice) }}</span>
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
  </div>
</template>

<script setup>
import TheHeader from '../../components/TheHeader.vue';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const isProcessing = ref(false);
const paymentMethod = ref(''); 
const checkoutItems = ref([]); // Đổi thành mảng rỗng để chứa dữ liệu thật

const momoType = ref('Thanh toán toàn bộ'); // Mặc định là thanh toán hết
const requiresDeposit = computed(() => {
    // Kiểm tra xem có món nào trong giỏ có yêu cầu cọc không (TienCocToiThieu > 0)
    // Lưu ý: Đảm bảo API get giỏ hàng của bạn có trả về trường TienCocToiThieu
    return checkoutItems.value.some(item => item.TienCocToiThieu > 0);
});

// Dữ liệu Form giao hàng
const shippingInfo = reactive({
  name: '',
  phone: '',
  address: '',
  note: ''
});

const cartSummary = ref({
  subtotal: 0,
  discount: 0,
  totalPrice: 0
});

// Hàm định dạng tiền tệ
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Tính toán tự động dựa trên dữ liệu thật
const subtotal = computed(() => checkoutItems.value.reduce((sum, item) => sum + (item.DonGia * item.SoLuong), 0));
const discount = computed(() => {
  return checkoutItems.value.reduce((sum, item) => {
    const mucGiamGiaCuaItem = item.dongiakhuyenmai ? (item.DonGia - item.dongiakhuyenmai) : 0;
    return sum + (mucGiamGiaCuaItem * item.SoLuong);
  }, 0);
});
const totalPrice = computed(() => subtotal.value > 0 ? Math.max(0, subtotal.value - discount.value) : 0);

// ===============================================
// HÀM TẢI DỮ LIỆU KHI VỪA MỞ TRANG
// ===============================================
onMounted(async () => {
  window.scroll(0,0);
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) {
    toastStore.showToast("Vui lòng đăng nhập để đặt hàng!", "error");
    router.push('/login');
    return;
  }

  const userObj = JSON.parse(userString);

  try {
    // 1. GỌI API LẤY THÔNG TIN CÁ NHÂN (Để điền tự động vào Form)
    const resInfo = await fetch(`${API_BASE_URL}/api/info_user/laythongtin`,{
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataInfo = await resInfo.json();
    
    if (resInfo.ok && dataInfo.data) {
      const userData = dataInfo.data;
      shippingInfo.name = userData.TenKH || userData.TenDN || '';
      shippingInfo.phone = userData.SDT || '';
      shippingInfo.address = userData.diachi || userData.DiaChi || '';
    }

    // 2. GỌI API LẤY GIỎ HÀNG (Dùng lại hàm watch cart ở trang Giỏ Hàng)
    const resCart = await fetch(`${API_BASE_URL}/api/don_hang/watch`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataCart = await resCart.json();

    if (dataCart.success) {
      checkoutItems.value = dataCart.data;
      cartSummary.value = dataCart.cartSummary;
      
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

  // ================= BỔ SUNG TRẠM GÁC THANH TOÁN Ở ĐÂY =================
  if (!paymentMethod.value) {
    toastStore.showToast("Vui lòng chọn phương thức thanh toán!", "error");
    return; // Dừng lại ngay, không cho chạy tiếp
  }

  if (paymentMethod.value === 'cod' && requiresDeposit.value) {
    toastStore.showToast("Đơn hàng chứa sản phẩm bắt buộc cọc, không thể dùng COD!", "error");
    return; // Chặn luôn trường hợp dùng F12 lách luật chọn COD
  }
  // ====================================================================

  isProcessing.value = true;
  
  // 2. LẤY THÔNG TIN XÁC THỰC
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    toastStore.showToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
    router.push('/login');
    return;
  }

  try {
    // 3. ĐÓNG GÓI DỮ LIỆU CỰC KỲ ĐƠN GIẢN
    // Vì Backend của bạn chỉ yêu cầu MaKH (nhìn dòng: const { MaKH } = req.body;)
    const payload = {
      TenNguoiNhan: shippingInfo.name,
      SDTNguoiNhan: shippingInfo.phone,
      DiaChiGiao: shippingInfo.address,
      Note: shippingInfo.note,
    };

    console.log("Gói hàng gửi đi:", payload);

    // 4. GỌI API ĐẾN BACKEND
    const response = await fetch(`${API_BASE_URL}/api/don_hang/xacnhan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      toastStore.showToast(data.message, "error");
      isProcessing.value = false;
      return;
    }

    toastStore.showToast("🎉 " + data.message, "success");
    
    if (paymentMethod.value === 'momo') {
      const momoRes = await fetch(`${API_BASE_URL}/api/don_hang/payment/momo/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          MaDH: data.MaDonHang, 
          HinhThuc: momoType.value 
        })
      });
      const momoData = await momoRes.json();
      
      if (momoRes.ok && momoData.checkoutUrl) {
        window.location.href = momoData.checkoutUrl;
      } 
      else {
        toastStore.showToast("Lỗi tạo cổng thanh toán MoMo", "error");
        isProcessing.value = false;
      }
    } 
    else if (paymentMethod.value === 'zalopay') {
      const zaloRes = await fetch(`${API_BASE_URL}/api/don_hang/payment/zalopay/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          MaDH: data.MaDonHang,
          HinhThuc: momoType.value 
        })
    });
      const zaloData = await zaloRes.json();
      
      if (zaloRes.ok && zaloData.checkoutUrl) {
        window.location.href = zaloData.checkoutUrl;
      } 
      else {
          toastStore.showToast("Lỗi tạo cổng thanh toán ZaloPay", "error");
          isProcessing.value = false;
      }
    } 
    else {
      router.push({ path: '/ordersuccess', query: { orderId: data.MaDonHang } });
    }

  } catch (error) {
    console.error("Lỗi quá trình đặt hàng:", error);
    toastStore.showToast("Đã xảy ra lỗi, vui lòng thử lại sau!", "error");
  } finally {
    // Chỉ tắt trạng thái loading nếu không bị chuyển hướng sang Ví điện tử
    if (paymentMethod.value === 'cod') {
        isProcessing.value = false;
    }
  }
};
</script>

<style scoped>


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