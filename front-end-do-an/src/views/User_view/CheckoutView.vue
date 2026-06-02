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
            
            <div class="space-y-6 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
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

            <div class="border-y border-outline-variant/20 py-5 my-5 relative z-10">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[18px]">confirmation_number</span>
                  Mã giảm giá
                </span>
                <button type="button" @click="openVoucherModal" class="text-sm font-bold text-primary hover:text-primary-container transition-colors flex items-center">
                  {{ selectedVoucher ? 'Đổi mã khác' : 'Chọn hoặc nhập mã' }}
                  <span class="material-symbols-outlined text-[16px] ml-1">chevron_right</span>
                </button>
              </div>
              
              <div v-if="selectedVoucher" class="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/30 mt-4 animate-[fadeIn_0.2s_ease-out]">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[16px]">local_activity</span>
                  </div>
                  <div>
                    <span class="text-xs text-primary font-bold block">{{ selectedVoucher.MaVoucher }}</span>
                    <span class="text-[10px] text-on-surface-variant font-medium">- {{ formatPrice(voucherDiscountAmount) }}</span>
                  </div>
                </div>
                <button type="button" @click="removeVoucher" class="text-outline hover:text-error transition-colors p-1" title="Bỏ chọn mã">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <div class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Tạm tính</span>
                <span class="text-white">{{ formatPrice(cartSummary.subtotal) }}</span>
              </div>
              <div v-if="cartSummary.discount > 0" class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Khuyến mãi (Flash Sale)</span>
                <span class="text-error font-bold">- {{ formatPrice(cartSummary.discount) }}</span>
              </div>
              <div v-if="voucherDiscountAmount > 0" class="flex justify-between text-sm text-on-surface-variant font-medium">
                <span>Voucher giảm giá</span>
                <span class="text-primary font-bold">- {{ formatPrice(voucherDiscountAmount) }}</span>
              </div>
              
              <div class="flex justify-between items-end pt-6 border-t border-outline-variant/20 mt-4">
                <span class="text-sm font-bold uppercase tracking-widest text-white">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">{{ formatPrice(finalTotal) }}</span>
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

    <div v-if="isVoucherModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-surface-container-high rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] border border-outline-variant/20">
        
        <div class="px-6 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container shrink-0">
          <h3 class="text-lg font-headline font-bold text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">sell</span>
            Chọn Mã Giảm Giá
          </h3>
          <button @click="isVoucherModalOpen = false" class="text-outline hover:text-error transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-low space-y-6">
          
          <div>
            <label class="text-[10px] font-bold text-outline uppercase tracking-widest block mb-3">Thêm mã giảm giá cá nhân</label>
            <div class="flex gap-2">
              <input v-model="voucherInputCode" type="text" placeholder="Nhập mã voucher..." class="flex-1 bg-background border border-outline-variant/30 focus:border-primary focus:ring-0 text-white p-3 rounded-xl uppercase transition-colors outline-none font-medium">
              <button @click="applyVoucherByCode" class="bg-primary text-on-primary-fixed px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95 disabled:opacity-50" :disabled="!voucherInputCode.trim()">
                ÁP DỤNG
              </button>
            </div>
          </div>

          <div>
            <label class="text-[10px] font-bold text-outline uppercase tracking-widest block mb-3">Mã giảm giá có sẵn</label>
            
            <div v-if="isFetchingVouchers" class="flex justify-center py-8">
              <span class="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
            
            <div v-else-if="availableVouchers.length > 0" class="space-y-4">
              <div v-for="v in availableVouchers" :key="v.MaGG" 
                   @click="isEligible(v) ? selectVoucherFromList(v) : null"
                   :class="['flex border rounded-2xl overflow-hidden transition-all', 
                            isEligible(v) ? 'bg-surface-container hover:border-primary border-outline-variant/30 cursor-pointer group' : 'bg-surface-dim border-outline-variant/10 opacity-50 grayscale cursor-not-allowed']">
                
                <div class="w-24 bg-primary/10 border-r border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-2 relative">
                  <div class="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-surface-container-low rounded-full"></div>
                  <span class="material-symbols-outlined text-primary text-3xl mb-1">loyalty</span>
                  <span class="text-[10px] font-bold text-primary uppercase text-center leading-tight">
                    {{ v.LoaiGiamGia === 'TienMat' ? 'Giảm Tiền' : 'Giảm %' }}
                  </span>
                </div>

                <div class="flex-1 p-4 relative">
                  <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-surface-container-low rounded-full"></div>
                  
                  <h4 class="text-sm font-bold text-white mb-1 leading-tight">{{ formatVoucherDesc(v) }}</h4>
                  <p class="text-[11px] font-medium text-outline mb-2">Đơn tối thiểu {{ formatPrice(v.GiaTriDonToiThieu) }}</p>
                  
                  <div class="flex justify-between items-end mt-3">
                    <span class="text-[10px] text-error font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[12px]">schedule</span> HSD: {{ formatDate(v.ThoiGianKT) }}
                    </span>
                    
                    <span v-if="!isEligible(v)" class="text-[10px] font-bold text-error">Mua thêm {{ formatPrice(v.GiaTriDonToiThieu - cartSummary.totalPrice) }}</span>
                    <button v-else-if="selectedVoucher?.MaGG === v.MaGG" class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary-fixed">
                      <span class="material-symbols-outlined text-[16px]">check</span>
                    </button>
                    <button v-else class="text-xs font-bold text-primary group-hover:text-primary-container">Chọn</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-10 border border-dashed border-outline-variant/20 rounded-2xl">
              <span class="material-symbols-outlined text-outline text-4xl mb-2">sentiment_dissatisfied</span>
              <p class="text-sm text-outline font-medium">Hiện tại chưa có mã giảm giá nào.</p>
            </div>
          </div>

        </div>

        <div class="px-6 py-5 border-t border-outline-variant/20 bg-surface-container flex gap-3 shrink-0">
          <button @click="isVoucherModalOpen = false" class="flex-1 py-3.5 rounded-xl font-bold text-outline hover:text-white bg-surface-container-highest transition-colors text-sm">Đóng</button>
        </div>
      </div>
    </div>

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
const checkoutItems = ref([]);

const momoType = ref('Thanh toán toàn bộ');
const requiresDeposit = computed(() => checkoutItems.value.some(item => item.TienCocToiThieu > 0));

const shippingInfo = reactive({
  name: '',
  phone: '',
  address: '',
  note: ''
});

// Giữ nguyên summary được Backend trả về cho Flash Sale
const cartSummary = ref({ subtotal: 0, discount: 0, totalPrice: 0 });

// ===============================================
// HỆ THỐNG VOUCHER (MÃ GIẢM GIÁ)
// ===============================================
const isVoucherModalOpen = ref(false);
const isFetchingVouchers = ref(false);
const availableVouchers = ref([]);
const selectedVoucher = ref(null);
const voucherInputCode = ref('');

// 1. Mở Modal và Load API Voucher
const openVoucherModal = async () => {
  isVoucherModalOpen.value = true;
  await fetchVouchers();
};

// 2. Gọi API danh sách Voucher
const fetchVouchers = async () => {
  isFetchingVouchers.value = true;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/don_hang/get_magg`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      availableVouchers.value = data.data;
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách Voucher:", error);
  } finally {
    isFetchingVouchers.value = false;
  }
};

// 3. Hàm kiểm tra điều kiện (Đơn tối thiểu)
const isEligible = (voucher) => {
  // cartSummary.totalPrice ở đây chính là (Tiền Hàng - Tiền Flash Sale)
  return cartSummary.value.totalPrice >= voucher.GiaTriDonToiThieu;
};

// 4. Bấm "Chọn" ở List
const selectVoucherFromList = (voucher) => {
  selectedVoucher.value = voucher;
  isVoucherModalOpen.value = false;
  toastStore.showToast(`Đã áp dụng mã: ${voucher.MaVoucher}`, "success");
};

// 5. Bấm nút "Áp dụng" khi nhập tay
const applyVoucherByCode = () => {
  const code = voucherInputCode.value.trim().toUpperCase();
  const found = availableVouchers.value.find(v => v.MaVoucher.toUpperCase() === code);
  
  if (found) {
    if (isEligible(found)) {
      selectVoucherFromList(found);
      voucherInputCode.value = '';
    } else {
      toastStore.showToast(`Đơn hàng chưa đạt tối thiểu ${formatPrice(found.GiaTriDonToiThieu)} để dùng mã này!`, "error");
    }
  } else {
    toastStore.showToast("Mã voucher không tồn tại hoặc đã hết hạn!", "error");
  }
};

// 6. Xóa Voucher đang chọn
const removeVoucher = () => {
  selectedVoucher.value = null;
  toastStore.showToast("Đã bỏ áp dụng mã giảm giá", "success");
};

// 7. Tính số tiền Voucher giảm được (Mô phỏng logic Backend)
const voucherDiscountAmount = computed(() => {
  if (!selectedVoucher.value) return 0;
  const v = selectedVoucher.value;
  const currentTotal = cartSummary.value.totalPrice; 

  if (currentTotal < v.GiaTriDonToiThieu) return 0; // Đề phòng

  if (v.LoaiGiamGia === 'TienMat') {
    return Number(v.ChietKhau);
  } else if (v.LoaiGiamGia === 'ChietKhau') {
    const tinhGiam = currentTotal * (Number(v.ChietKhau) / 100);
    return Math.min(tinhGiam, Number(v.GiaTriGiamToiDa || tinhGiam));
  }
  return 0;
});

// 8. TỔNG TIỀN CUỐI CÙNG SAU KHI TRỪ VOUCHER
const finalTotal = computed(() => {
  return Math.max(0, cartSummary.value.totalPrice - voucherDiscountAmount.value);
});

// Helper hiển thị cho Voucher
const formatVoucherDesc = (v) => {
  if (v.LoaiGiamGia === 'TienMat') return `Giảm ${formatPrice(v.ChietKhau)}`;
  return `Giảm ${v.ChietKhau}% (Tối đa ${formatPrice(v.GiaTriGiamToiDa)})`;
};
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

// Hàm định dạng tiền tệ
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// ===============================================
// HÀM TẢI DỮ LIỆU KHI VỪA MỞ TRANG
// ===============================================
onMounted(async () => {
  window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
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

    const resCart = await fetch(`${API_BASE_URL}/api/don_hang/watch`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataCart = await resCart.json();

    if (dataCart.success) {
      checkoutItems.value = dataCart.data;
      cartSummary.value = dataCart.cartSummary;
      
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
// XỬ LÝ ĐẶT HÀNG (Gọi API Xác Nhận Đơn Hàng)
// ===============================================
const processCheckout = async () => {
  if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
    toastStore.showToast("Vui lòng điền đầy đủ thông tin giao hàng!", "error");
    return;
  }

  if (checkoutItems.value.length === 0) {
    toastStore.showToast("Giỏ hàng của bạn đang trống!", "error");
    return;
  }

  if (!paymentMethod.value) {
    toastStore.showToast("Vui lòng chọn phương thức thanh toán!", "error");
    return; 
  }

  if (paymentMethod.value === 'cod' && requiresDeposit.value) {
    toastStore.showToast("Đơn hàng chứa sản phẩm bắt buộc cọc, không thể dùng COD!", "error");
    return; 
  }

  isProcessing.value = true;
  
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    toastStore.showToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
    router.push('/login');
    return;
  }

  try {
    // 🔥 ĐÃ BỔ SUNG TRUYỀN MaGG XUỐNG BACKEND ĐỂ ÁP DỤNG VOUCHER 🔥
    const payload = {
      TenNguoiNhan: shippingInfo.name,
      SDTNguoiNhan: shippingInfo.phone,
      DiaChiGiao: shippingInfo.address,
      Note: shippingInfo.note,
      MaGG: selectedVoucher.value ? selectedVoucher.value.MaGG : null 
    };

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
    
    // Xử lý cổng thanh toán
    if (paymentMethod.value === 'momo') {
      const momoRes = await fetch(`${API_BASE_URL}/api/don_hang/payment/momo/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ MaDH: data.MaDonHang, HinhThuc: momoType.value })
      });
      const momoData = await momoRes.json();
      
      if (momoRes.ok && momoData.checkoutUrl) window.location.href = momoData.checkoutUrl;
      else { toastStore.showToast("Lỗi tạo cổng thanh toán MoMo", "error"); isProcessing.value = false; }
    } 
    else if (paymentMethod.value === 'zalopay') {
      const zaloRes = await fetch(`${API_BASE_URL}/api/don_hang/payment/zalopay/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ MaDH: data.MaDonHang, HinhThuc: momoType.value })
      });
      const zaloData = await zaloRes.json();
      
      if (zaloRes.ok && zaloData.checkoutUrl) window.location.href = zaloData.checkoutUrl;
      else { toastStore.showToast("Lỗi tạo cổng thanh toán ZaloPay", "error"); isProcessing.value = false; }
    } 
    else {
      router.push({ path: '/ordersuccess', query: { orderId: data.MaDonHang } });
    }

  } catch (error) {
    console.error("Lỗi quá trình đặt hàng:", error);
    toastStore.showToast("Đã xảy ra lỗi, vui lòng thử lại sau!", "error");
  } finally {
    if (paymentMethod.value === 'cod') isProcessing.value = false;
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

.slide-down {
  animation: slideDown 0.3s ease-out forwards;
  transform-origin: top;
}
@keyframes slideDown {
  from { opacity: 0; transform: scaleY(0.9); }
  to { opacity: 1; transform: scaleY(1); }
}

/* Modal Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
</style>