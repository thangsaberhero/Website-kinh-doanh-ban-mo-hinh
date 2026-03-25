<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <main class="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <div class="mb-12">
        <h1 class="text-5xl md:text-6xl font-headline font-bold tracking-tighter uppercase text-white mb-2">
          Kho Báu <span class="text-primary italic">Đang Chờ</span>
        </h1>
        <p class="text-on-surface-variant font-medium tracking-wide">
          {{ cartItems.length }} vật phẩm đã sẵn sàng để gia nhập bộ sưu tập của bạn.
        </p>
      </div>

      <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-8 space-y-4">
          
          <TransitionGroup name="list" tag="div" class="space-y-4">
            <div 
              v-for="item in cartItems" 
              :key="item.MaPhanLoai"
              class="group relative flex flex-col md:flex-row gap-6 p-6 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 rounded-2xl"
            >
              <div class="relative w-full md:w-48 aspect-square overflow-hidden bg-surface-container-lowest rounded-xl border border-outline-variant/20 cursor-pointer" @click="goToProduct(item.MaMoHinh)">
                <div class="relative w-full md:w-48 aspect-square overflow-hidden bg-surface-container-lowest rounded-xl border border-outline-variant/20 cursor-pointer" @click="goToProduct(item.MaMoHinh)">
                <img 
                  :src="item.AnhDaiDien ? ('/Images_product/' + item.AnhDaiDien) : 'https://via.placeholder.com/150'" 
                  :alt="item.TenMH" 
                  class="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              </div>
              
              <div class="flex flex-col flex-1 justify-between py-2">
                <div>
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block text-tertiary bg-tertiary/10 border border-tertiary/20">
                        Phân loại: {{ item.ChiTietPhanLoai || 'Mặc định' }}
                      </span>
                      
                      <h3 @click="goToProduct(item.MaMoHinh)" class="text-2xl font-headline font-bold text-white leading-tight cursor-pointer hover:text-primary transition-colors">
                        {{ item.TenMH }}
                      </h3>
                      
                      <p class="text-on-surface-variant text-sm mt-2 font-medium">Đơn giá: {{ formatPrice(item.DonGia) }}</p>
                    </div>
                    
                    <button @click="removeItem(item.MaPhanLoai)" class="text-outline hover:text-error hover:bg-error/10 rounded-lg p-2 transition-all">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-end justify-between mt-6 md:mt-0">
                  <div class="flex items-center bg-surface-container-highest rounded-full px-2 py-1 border border-outline-variant/20">
                    <button @click="decreaseQty(item)" class="w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors">
                      <span class="material-symbols-outlined text-sm">remove</span>
                    </button>
                    
                    <span class="w-10 text-center font-bold text-white">{{ item.SoLuong }}</span>
                    
                    <button @click="increaseQty(item)" class="w-8 h-8 flex items-center justify-center text-outline hover:text-primary transition-colors">
                      <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <div class="text-right">
                    <span class="block text-primary font-headline font-bold text-2xl tracking-tighter">
                      {{ formatPrice(item.ThanhTien) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div class = "mt-6 flex justify-end">
            <button 
              @click="clearCart" 
              class="flex items-center gap-2 px-5 py-2.5 text-sm uppercase font-bold text-error hover:bg-error/20 rounded-xl transition-all active:scale-95"
            >
              <span class="material-symbols-outlined text-[20px]">delete_sweep</span>
              Xóa tất cả
            </button>
          </div>

        </div>

        <div class="lg:col-span-4">
          <div class="sticky top-28 bg-surface-container p-8 rounded-2xl shadow-2xl border border-outline-variant/20">
            <h2 class="text-xl font-headline font-bold tracking-widest uppercase border-b border-outline-variant/20 pb-4 mb-6 text-white">Tóm tắt đơn hàng</h2>
            
            <div class="space-y-4 mb-6 text-sm font-medium">
              <div class="flex justify-between text-on-surface-variant">
                <span>Tạm tính ({{ totalItems }} SP)</span>
                <span class="text-white">{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>Phí vận chuyển</span>
                <span class="text-primary font-bold">Miễn phí</span>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>Giảm giá</span>
                <span class="text-error font-bold">- {{ formatPrice(discount) }}</span>
              </div>
            </div>
            
            <div class="pt-6 border-t border-outline-variant/20 mb-8">
              <div class="flex justify-between items-end">
                <span class="text-lg font-bold text-white uppercase tracking-widest">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">{{ formatPrice(totalPrice) }}</span>
              </div>
            </div>
            
            <div class="space-y-4">
              <button @click="router.push('/checkout')" class="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest text-sm rounded-lg shadow-[0_0_20px_rgba(255,143,115,0.2)] hover:brightness-110 active:scale-95 transition-all">
                THANH TOÁN NGAY
              </button>
              <button @click="router.push('/category')" class="w-full py-4 bg-transparent border border-outline-variant/30 text-outline font-bold uppercase tracking-widest text-xs hover:text-white hover:bg-surface-container-highest transition-colors rounded-lg">
                Tiếp tục mua sắm
              </button>
            </div>
            
            <div class="mt-8 bg-surface-container-highest p-4 rounded-xl border border-outline-variant/10 flex gap-4">
              <span class="material-symbols-outlined text-primary text-2xl">verified</span>
              <p class="text-xs leading-relaxed text-on-surface-variant font-medium">
                Cam kết 100% hàng chính hãng. Bảo hành vận chuyển 1 đổi 1 nếu hư hỏng.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
        <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">shopping_cart_off</span>
        <h2 class="text-2xl font-headline font-bold text-white mb-2">Giỏ hàng trống</h2>
        <p class="text-on-surface-variant mb-8">Kho báu của bạn đang trống trải. Hãy lấp đầy nó nhé!</p>
        <button @click="router.push('/category')" class="px-8 py-3 bg-primary text-on-primary-fixed font-bold rounded-lg hover:brightness-110 transition-all">
          Khám phá cửa hàng
        </button>
      </div>

      <section class="mt-24 pt-16 border-t border-outline-variant/15">
        <h2 class="text-3xl font-headline font-bold tracking-tight uppercase mb-8 text-white">Có thể bạn sẽ thích</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="sp in suggestions" :key="sp.id" class="group cursor-pointer">
            <div class="aspect-[3/4] bg-surface-container-low border border-outline-variant/10 rounded-xl overflow-hidden mb-4 relative p-4">
              <img :src="sp.image" :alt="sp.name" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"/>
              <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                <button @click.stop="quickAdd(sp)" class="w-12 h-12 bg-primary text-on-primary-fixed rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
            </div>
            <h4 class="font-bold text-sm text-on-surface-variant group-hover:text-white transition-colors truncate">{{ sp.name }}</h4>
            <span class="text-primary font-headline font-bold">{{ formatPrice(sp.price) }}</span>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast';
import { onMounted } from 'vue';

const router = useRouter();
const toastStore = useToastStore();

// Gọi biến giỏ hàng)
const cartItems = ref([]);

const fetchCartData = async () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  // Chưa đăng nhập thì đá về trang login
  if (!token || !userString) {
    router.push('/login');
    return;
  }

  const maKH = JSON.parse(userString).MaKH;

  try {
    // Gọi API bạn đã viết (Nhớ kiểm tra lại đường link có đúng tuyến đường bạn cấu hình chưa)
    // Ví dụ: GET http://localhost:3000/api/add_cart/watch/:maKH
    const response = await fetch(`http://localhost:3000/api/add_cart/watch/${maKH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (response.ok) {
      // Đổ dữ liệu từ API vào biến cartItems
      cartItems.value = result.data; 
    } else {
      console.error(result.message);
      cartItems.value = []; // Giỏ hàng trống
    }
  } catch (error) {
    console.error("Lỗi khi tải giỏ hàng:", error);
  }
};

// 3. Tự động chạy hàm khi mở trang
onMounted(() => {
  fetchCartData();
});

// Dữ liệu Gợi ý sản phẩm
const suggestions = ref([
  { id: 101, name: 'Action Base 4 Clear', price: 180000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIazZeZJ24VwYtPi56dUOOkvkApxpPNzOc5aOdg0IKZnjgt_J_Rkpkp-d4GQAnTyIXVboqadXAHl4-QLmOhzOyw_6qJBiW-yDvub2RT1u1GbYIcYnCjMrmh2-lBxXXYlJBUHnUDrgZnyQV_PRcfeBieRrvwAjPixP0ou99eMTaJe6l5AMFZLwiqJOtQOndokizbE4m7-q_VsuHXFKilvb02kFoLkv_pwKYLtsM-I-d270pIWYP-e8t3JLMFoO7mKknRnj-yPlRM804' },
  { id: 102, name: 'Acrylic Box LED - 30x30x40', price: 450000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuav1sJLUfGLIsDGhGkL0Up1Zns79vrUN2mRcb_RMgJ5uK_Mqnl0279cuunmg930On4iqAOE4f78YJEj2SBip9EqfbUJwEVPiumCAkikG1Y-nZfNL6xAOshUPitpzBPVseWKhtNsFIPBrW2CmluyVkq_Q8zFzuXGxqNc_ozQ0LwsvZ7dzzTfmePNbPaYRxSfkj-fp6FGcAD9n1nskgmo0IB975S6A0OLMzOxR-hgWJspAlRDdF59Yf_QOb-S4zfdA8dE4Q2atMyW-V' },
  { id: 103, name: 'Bộ vệ sinh Figure chuyên dụng', price: 120000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdzZv9i_wS6KrZXeAobsFPJk1yYLnYtKRVPyQzCmknmrdVPnEZM7alYuTc-QE5LJPjQ60doXVfQm7pAtfGuQS2FmxFtHb4vMiigNuXEsaxZ_Qd2Ds5HuBfzXaukS5QEk22GoUaflmaB8wVyxMvtdqIJpC0jOBUy1owhuFpudDIVHuoYu_Fh1LLTFHuX4ky7GrVo2OyTsibXYGDFUkq1LFgOji3awgxcPnOc95uxr-PEYJtL0hIiIg7gdBjZ2OfMe9VLIrkapj6Ppp7' },
  { id: 104, name: 'Panel Line Accent Color', price: 95000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4msE71U7jgRXWIVdkIHSFSJ9awutXqqs3QqtvKWLBa7QTf3kJf0-L5mA7EFGMoerQ4Y_-Ge6IMnjGbzYrzuX41xPXyZ4UUGWY6RCx1JC6kemzKRqCguW9ryd3KNV-HXuWpjcwMqxP67rWms51Br5i_2vIoCF7lOW_Ieo_HuuUvoYqUiVvW7sdxv2hbfhBv6fQUWOXqoaKmYyzKwvXkevMAezc854KJPQQqXaFd_rqs0BMPWuXlIz62AYeEteiQxMO3JB-84bnh24-' }
]);

const discount = ref(0); // Giảm giá cố định để demo

// Tính toán tự động (Reactivity)
// Thay 'price' thành 'DonGia', thay 'qty' thành 'SoLuong'
const totalItems = computed(() => cartItems.value.reduce((sum, item) => sum + item.SoLuong, 0));
const subtotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.DonGia * item.SoLuong), 0));
const totalPrice = computed(() => subtotal.value > 0 ? Math.max(0, subtotal.value - discount.value) : 0);

// Các hàm xử lý
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const increaseQty = async (item) => {
  // 1. Lưu lại số lượng cũ phòng trường hợp API bị lỗi để còn phục hồi
  const oldQty = item.SoLuong;

  // 2. TĂNG SỐ LƯỢNG TRÊN GIAO DIỆN TRƯỚC (Cho khách hàng thấy mượt mà)
  // (Lưu ý: Bạn có thể thay số 10 bằng item.SoLuongTon nếu API có trả về tồn kho)
  if (item.SoLuong < item.TonKho) {
    item.SoLuong++;
    // Tự động tính lại Thành Tiền cho món đó ngay lập tức
    item.ThanhTien = item.DonGia * item.SoLuong; 
  } else {
    toastStore.showToast("Đã đạt số lượng mua tối đa!", "error");
    return; // Dừng lại không gọi API nữa
  }

  // 3. Lấy thông tin vé (Token) và Mã Khách Hàng
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    toastStore.showToast("Vui lòng đăng nhập lại!", "error");
    return;
  }
  const maKH = JSON.parse(userString).MaKH;

  // 4. GỌI API BÁO CHO BACKEND CẬP NHẬT DATABASE
  try {
    const payload = {
      MaKH: parseInt(maKH),
      MaPhanLoai: item.MaPhanLoai, // Gửi đúng mã phân loại của món đó
      soluong: item.SoLuong        // Gửi con số MỚI NHẤT xuống Database
    };

    const response = await fetch('http://localhost:3000/api/add_cart/update', {
      method: 'POST', // Chú ý kiểm tra lại xem Backend của bạn dùng POST hay PUT cho link này nhé
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // Nếu Backend báo lỗi (VD: Trong kho không đủ hàng)
      throw new Error(data.message || "Lỗi cập nhật từ Server");
    }

    // Tùy chọn: Hiện thông báo nhỏ gọn (toast) thành công nếu thích
    // toastStore.showToast("Đã cập nhật số lượng", "success");

  } catch (error) {
    console.error("Lỗi cập nhật số lượng:", error);
    toastStore.showToast("Không thể cập nhật số lượng lúc này!", "error");
    
    // BƯỚC QUAN TRỌNG: Nếu API lỗi, phải hoàn tác (Rollback) giao diện về số cũ
    item.SoLuong = oldQty;
    item.ThanhTien = item.DonGia * item.SoLuong; 
  }
};

const decreaseQty = async (item) => {
  // 1. Lưu lại số lượng cũ phòng trường hợp API bị lỗi để còn phục hồi
  const oldQty = item.SoLuong;

  // 2. TĂNG SỐ LƯỢNG TRÊN GIAO DIỆN TRƯỚC (Cho khách hàng thấy mượt mà)
  // (Lưu ý: Bạn có thể thay số 10 bằng item.SoLuongTon nếu API có trả về tồn kho)
  if (item.SoLuong > 1) {
    item.SoLuong--;
    // Tự động tính lại Thành Tiền cho món đó ngay lập tức
    item.ThanhTien = item.DonGia * item.SoLuong; 
  } else {
    toastStore.showToast("Đã đạt số lượng mua tối thiểu!", "error");
    return; // Dừng lại không gọi API nữa
  }

  // 3. Lấy thông tin vé (Token) và Mã Khách Hàng
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    toastStore.showToast("Vui lòng đăng nhập lại!", "error");
    return;
  }
  const maKH = JSON.parse(userString).MaKH;

  // 4. GỌI API BÁO CHO BACKEND CẬP NHẬT DATABASE
  try {
    const payload = {
      MaKH: parseInt(maKH),
      maPhanLoai: item.MaPhanLoai, // Gửi đúng mã phân loại của món đó
      soluong: item.SoLuong        // Gửi con số MỚI NHẤT xuống Database
    };

    const response = await fetch('http://localhost:3000/api/add_cart/update', {
      method: 'POST', // Chú ý kiểm tra lại xem Backend của bạn dùng POST hay PUT cho link này nhé
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // Nếu Backend báo lỗi (VD: Trong kho không đủ hàng)
      throw new Error(data.message || "Lỗi cập nhật từ Server");
    }

    // Tùy chọn: Hiện thông báo nhỏ gọn (toast) thành công nếu thích
    // toastStore.showToast("Đã cập nhật số lượng", "success");

  } catch (error) {
    console.error("Lỗi cập nhật số lượng:", error);
    toastStore.showToast("Không thể cập nhật số lượng lúc này!", "error");
    
    // BƯỚC QUAN TRỌNG: Nếu API lỗi, phải hoàn tác (Rollback) giao diện về số cũ
    item.SoLuong = oldQty;
    item.ThanhTien = item.DonGia * item.SoLuong; 
  }
};

// Đổi tham số nhận vào thành maPL (Mã Phân Loại) cho đúng với HTML
const removeItem = async (maPL) => { 
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    toastStore.showToast("Vui lòng đăng nhập lại!", "error");
    return;
  }
  const maKH = JSON.parse(userString).MaKH;

  // Xóa trên giao diện TRƯỚC cho mượt (tuỳ chọn, nhưng rất khuyến khích)
  // Lưu lại mảng cũ phòng khi Backend lỗi thì phục hồi lại
  const oldCart = [...cartItems.value];
  
  // Lọc bỏ món hàng có Mã Phân Loại trùng với mã vừa bấm xóa
  cartItems.value = cartItems.value.filter(sp => sp.MaPhanLoai !== maPL);

  try {
    const payload = {
      MaKH: parseInt(maKH),
      MaPhanLoai: maPL, // Truyền thẳng maPL vào đây, không dùng item.MaPhanLoai nữa
    };

    const response = await fetch('http://localhost:3000/api/add_cart/delete', {
      method: 'POST', // Đảm bảo Backend của bạn dùng app.post('/delete', ...)
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi xóa hàng từ Server");
    }

    toastStore.showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
    
  } catch (error) {
    console.error("Lỗi cập nhật giỏ hàng:", error);
    toastStore.showToast("Không thể xoá hàng lúc này!", "error");
    
    // Nếu Backend lỗi (ví dụ rớt mạng), phục hồi lại giỏ hàng như cũ để khách không bị sốc
    cartItems.value = oldCart; 
  }
};

const clearCart = async () => {
  // 1. Hỏi lại cho chắc chắn, tránh khách bấm nhầm
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng không?")) {
    return;
  }

  // 2. Lấy thông tin user
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    toastStore.showToast("Vui lòng đăng nhập lại!", "error");
    return;
  }
  const maKH = JSON.parse(userString).MaKH;

  // 3. Xóa trên giao diện trước cho mượt (lưu lại mảng cũ để phòng hờ)
  const oldCart = [...cartItems.value];
  cartItems.value = [];

  // 4. Gọi API xuống Backend
  try {
    const payload = {
      MaKH: parseInt(maKH)
    };

    const response = await fetch('http://localhost:3000/api/add_cart/deleteAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi xóa giỏ hàng từ Server");
    }

    toastStore.showToast("Đã làm sạch giỏ hàng!", "success");
    
  } catch (error) {
    console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
    toastStore.showToast("Không thể xóa lúc này!", "error");
    
    // Phục hồi lại nếu API lỗi
    cartItems.value = oldCart; 
  }
};

const quickAdd = (product) => {
  toastStore.showToast(`Đã thêm ${product.name} vào giỏ!`, "success");
};

const goToProduct = (id) => {
  router.push(`/product/${id}`);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

/* Hiệu ứng khi xóa item khỏi danh sách */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>