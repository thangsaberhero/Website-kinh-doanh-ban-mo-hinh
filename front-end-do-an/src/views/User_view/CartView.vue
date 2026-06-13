<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">  
    <TheHeader />

    <main class="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
      <div class="mb-12">
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tighter uppercase text-white mb-2">
          Kho Báu <span class="text-primary italic">Đang Chờ</span>
        </h1>
        <p class="text-on-surface-variant font-medium tracking-wide">
          {{ cartItems.length }} vật phẩm đã sẵn sàng để gia nhập bộ sưu tập của bạn.
        </p>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-32">
        <span class="material-symbols-outlined animate-spin text-primary text-5xl">settings</span>
      </div>
      <div v-else-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div class="lg:col-span-8 space-y-4">

          <div class="flex flex-col sm:flex-row justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 mb-2">
            <span class="text-on-surface-variant text-sm font-medium mb-3 sm:mb-0">
              Đang hiển thị <strong>{{ cartItems.length }}</strong> / {{ totalItems }} sản phẩm
            </span>
            <div class="flex items-center gap-3">
              <span class="text-xs text-outline font-bold uppercase tracking-widest">Sắp xếp:</span>
              <select v-model="sortBy" class="bg-background text-white border border-outline-variant/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer">
                <option value="default">Vừa thêm gần đây</option>
                <option value="price_asc">Giá khuyến mãi tăng dần</option>
                <option value="price_desc">Giá khuyến mãi giảm dần</option>
              </select>
            </div>
          </div>

          <TransitionGroup name="list" tag="div" class="space-y-4">
            <div 
              v-for="item in cartItems" 
              :key="item.MaPhanLoai"
              class="group relative flex flex-row gap-3 sm:gap-6 p-3 sm:p-6 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 rounded-2xl"
            >
              <div class="relative w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-auto md:aspect-square overflow-hidden bg-surface-container-lowest rounded-xl border border-outline-variant/20 cursor-pointer shrink-0" @click="goToProduct(item.MaMoHinh)">
                <img 
                  :src="(item.AnhDaiDien && item.AnhDaiDien.startsWith('http')) ? item.AnhDaiDien : `${API_BASE_URL}/Images_product/` + item.AnhDaiDien"
                  :alt="item.TenMH" 
                  class="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div class="flex flex-col flex-1 justify-between py-1">
                <div>
                  <div class="flex justify-between items-start">
                    <div class="pr-6 md:pr-0"> <span class="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full mb-1 sm:mb-3 inline-block text-tertiary bg-tertiary/10 border border-tertiary/20">
                        Phân loại: {{ item.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : item.ChiTietPhanLoai }}
                      </span>               
                      <h3 @click="goToProduct(item.MaMoHinh)" class="text-sm sm:text-lg md:text-2xl font-headline font-bold text-white leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2">
                        {{ item.TenMH }}
                      </h3>          
                      <p class="text-on-surface-variant text-xs sm:text-sm mt-1 font-medium">Đơn giá: {{ formatPrice(item.DonGia) }}</p>
                    </div>
                    
                    <button @click="confirmRemoveItem(item)" class="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 text-outline hover:text-error hover:bg-error/10 rounded-lg p-1.5 sm:p-2 transition-all">
                      <span class="material-symbols-outlined text-[18px] sm:text-[24px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-3 sm:mt-0 gap-2 sm:gap-0">
                  <div class="flex items-center bg-surface-container-highest rounded-full px-1 py-0.5 sm:px-2 sm:py-1 border border-outline-variant/20">
                    <button @click="decreaseQty(item)" class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-outline hover:text-primary transition-colors">
                      <span class="material-symbols-outlined text-[14px] sm:text-sm">remove</span>
                    </button>
                    <span class="w-6 sm:w-10 text-center font-bold text-white text-xs sm:text-base">{{ item.SoLuong }}</span>        
                    <button @click="increaseQty(item)" class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-outline hover:text-primary transition-colors">
                      <span class="material-symbols-outlined text-[14px] sm:text-sm">add</span>
                    </button>
                  </div>

                  <div class="text-left sm:text-right flex flex-col items-start sm:items-end justify-center w-full sm:w-auto">
                    <span class="block text-primary font-headline font-bold text-lg md:text-2xl tracking-tighter">
                      {{ formatPrice(item.ThanhTien) }}
                    </span>
                    
                    <div v-if="Number(item.DonGiaKhuyenMai) < Number(item.DonGia)" class="mt-1 flex flex-col items-end gap-0.5">
                      <div v-if="item.SoLuongMuaGiaGoc === 0">
                        <span class="text-[10px] text-tertiary font-bold px-1.5 py-0.5 rounded bg-tertiary/10 border border-tertiary/20">
                          Còn {{ item.SoLuongKhuyenMaiConLai }} suất giá sale
                        </span>
                      </div>
                      <div v-else class="text-right flex flex-col items-end">
                        <span class="text-[10px] text-error font-bold px-1.5 py-0.5 rounded bg-error/10 border border-error/20 mb-1">
                          Vượt giới hạn ưu đãi!
                        </span>
                        <span class="text-[10px] text-tertiary font-medium">
                          {{ item.SoLuongDuocGiamGia }} SP x {{ formatPrice(item.DonGiaKhuyenMai) }}
                        </span>
                        <span class="text-[10px] text-on-surface-variant font-medium">
                          {{ item.SoLuongMuaGiaGoc }} SP x {{ formatPrice(item.DonGia) }}
                        </span>
                      </div>
                    </div>
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
          <div class="lg:sticky lg:top-28 bg-surface-container p-5 md:p-8 rounded-2xl shadow-xl lg:shadow-2xl border border-outline-variant/20 mt-8 lg:mt-0">
            <h2 class="text-xl font-headline font-bold tracking-widest uppercase border-b border-outline-variant/20 pb-4 mb-6 text-white">Tóm tắt đơn hàng</h2>
            <div class="space-y-4 mb-6 text-sm font-medium">
              <div class="flex justify-between text-on-surface-variant">
                <span>Tạm tính ({{ totalItems }} SP)</span>
                <span class="text-white">{{ formatPrice(cartSummary.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-on-surface-variant">
                <span>Giảm giá</span>
                <span class="text-error font-bold">- {{ formatPrice(cartSummary.discount) }}</span>
              </div>
            </div>
            
            <div class="pt-6 border-t border-outline-variant/20 mb-8">
              <div class="flex justify-between items-end">
                <span class="text-lg font-bold text-white uppercase tracking-widest">Tổng cộng</span>
                <span class="text-3xl font-headline font-black text-primary tracking-tighter">{{ formatPrice(cartSummary.totalPrice) }}</span>
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

      <section v-if="suggestions.length > 0" class="mt-24 pt-16 border-t border-outline-variant/15">
        <h2 class="text-3xl font-headline font-bold tracking-tight uppercase mb-8 text-white">Có thể bạn sẽ thích</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <ProductCard 
            v-for="sp in suggestions" 
            :key="sp.MaMoHinh" 
            :product="sp"
            @add-to-cart="addToCart" />
        </div>
      </section>
    </main>
  </div>
  <div v-if="isClearCartModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity">
    <div class="bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-outline-variant/20 animate-[zoomIn_0.2s_ease-out]">
      <div class="p-6 flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4 border border-error/20">
          <span class="material-symbols-outlined text-4xl">warning</span>
        </div>
        <h3 class="text-xl font-headline font-bold text-white mb-2">Xóa toàn bộ giỏ hàng?</h3>
        <p class="text-sm text-on-surface-variant font-medium">
          Bạn có chắc chắn muốn dọn sạch kho báu của mình không? Hành động này không thể hoàn tác.
        </p>
      </div>
      
      <div class="p-4 bg-surface-container border-t border-outline-variant/20 flex gap-3">
        <button @click="isClearCartModalOpen = false" 
          class="flex-1 py-3 text-sm font-bold text-white bg-surface-container-highest hover:bg-surface-bright rounded-xl transition-colors border border-outline-variant/30">
          Hủy bỏ
        </button>
        <button @click="executeClearCart" 
                class="flex-1 py-3 text-sm font-bold text-on-error bg-error hover:brightness-110 rounded-xl transition-all shadow-[0_0_15px_rgba(255,84,73,0.3)]">
          Xóa tất cả
        </button>
      </div> 
    </div>
  </div>
  <div v-if="isDeleteItemModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity">
    <div class="bg-surface-container-high rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-outline-variant/20 animate-[zoomIn_0.2s_ease-out]">
      <div class="p-6 flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4 border border-error/20">
          <span class="material-symbols-outlined text-4xl">delete_forever</span>
        </div>
        <h3 class="text-xl font-headline font-bold text-white mb-2">Xóa sản phẩm này?</h3>
        <p class="text-sm text-on-surface-variant font-medium line-clamp-2">
          Bạn có chắc chắn muốn xóa <span class="text-white font-bold">{{ itemToDelete?.TenMH }}</span> khỏi giỏ hàng?
        </p>
      </div>
      
      <div class="p-4 bg-surface-container border-t border-outline-variant/20 flex gap-3">
        <button @click="isDeleteItemModalOpen = false" 
          class="flex-1 py-3 text-sm font-bold text-white bg-surface-container-highest hover:bg-surface-bright rounded-xl transition-colors border border-outline-variant/30">
          Giữ lại
        </button>
        <button @click="executeDeleteItem" 
                class="flex-1 py-3 text-sm font-bold text-on-error bg-error hover:brightness-110 rounded-xl transition-all shadow-[0_0_15px_rgba(255,84,73,0.3)]">
          Xóa
        </button>
      </div> 
    </div>
  </div>
</template>

<script setup>
  import TheHeader from '../../components/TheHeader.vue';
  import ProductCard from '../../components/ProductCard.vue';
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast'; 

  const router = useRouter();
  const toastStore = useToastStore();
  const cartItems = ref([]);
  const suggestions = ref([]);
  const isClearCartModalOpen = ref(false);
  const isDeleteItemModalOpen = ref(false);
  const itemToDelete = ref(null);
  const isLoading = ref(true);

  const sortBy = ref('default');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  let pollingInterval = null;

  const cartSummary = ref({
    subtotal: 0,
    discount: 0,
    totalPrice: 0
  });

  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (Number(item.SoLuong) || 0);
    }, 0);
  });

  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    if (!isBackgroundLoad) isLoading.value = true;
    const queryParams = new URLSearchParams({ sapxep: sortBy.value }).toString();

    try {
      const response = await fetch(`${API_BASE_URL}/api/don_hang/watch/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

      const result = await response.json();

      if (result.success) {
        cartItems.value = result.data; 
        cartSummary.value = result.cartSummary;
      } 
      else {
        console.error(result.message);
        cartItems.value = []; 
      }
      fetchSuggestions();
    } 
    catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    }
    finally {
      if (!isBackgroundLoad) isLoading.value = false;
    }
  };

  watch(sortBy, () => { 
    fetchCartData();
  });

  const fetchSuggestions = async () => {
    try {
      const itemIds = cartItems.value.map(item => item.MaMoHinh);
      const response = await fetch(`${API_BASE_URL}/api/products/cart-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
        body: JSON.stringify({ cartItemIds: itemIds })
      });
      
      const dataJSON = await response.json(); 
      
      if (response.ok) {
        suggestions.value = dataJSON.data; 
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm gợi ý:", error);
    }
  };

  // Hàm cuộn trang mượt mà có kiểm soát thời gian
  const scrollToTopCustom = (duration = 1000) => {
    const startPosition = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      let progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Thực hiện cuộn
      window.scrollTo(0, startPosition * (1 - easeProgress));

      // Nếu chưa hết thời gian thì tiếp tục gọi animation
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  onMounted(() => {
    // window.scrollTo({
    //   top: 0,
    //   left: 0,
    //   behavior: 'smooth'
    // });
    scrollToTopCustom();
    fetchCartData();
    fetchSuggestions();
    pollingInterval = setInterval(() => {
      fetchCartData(true);
      fetchSuggestions(true);
    }, 5000);
  });

  onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
  });


  // Tính toán giá
  

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const addToCart = async (productInfo) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    let maKH = null;
    
    if (userString) {
      const userObj = JSON.parse(userString);
      maKH = userObj.MaKH;
    }

    if (!token || !maKH) {
      toastStore.showToast("Vui lòng đăng nhập lại!", "error");
      return;
    }

    try {
      const resVar = await fetch(`${API_BASE_URL}/api/products/variants/${productInfo.MaMoHinh}`,
        {
          headers: {'Authorization': `Bearer ${token}`}
        }
      );
      const varJSON = await resVar.json();
      
      let maPhanLoai = null;
      if (resVar.ok && varJSON.data.length > 0) {
        maPhanLoai = varJSON.data[0].MaPhanLoai; 
      } else {
        toastStore.showToast("Sản phẩm này đang bị lỗi!", "error");
        return;
      }

      const payload = { MaKH: parseInt(maKH), MaPhanLoai: maPhanLoai, soluong: 1 };
      const response = await fetch(`${API_BASE_URL}/api/don_hang/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload) 
      });

      const data = await response.json();

      if (response.ok) {
        toastStore.showToast(`Đã thêm ${productInfo.TenMH} vào giỏ!`, "success"); 
        await fetchCartData(); 
        window.dispatchEvent(new Event('cart-updated')); 
      } else {
        toastStore.showToast("Lỗi: " + data.message, "error"); 
      }
    } catch (error) {
      console.error("Lỗi thêm nhanh phụ kiện:", error);
    }
  };

  const clearCart = () => {
    isClearCartModalOpen.value = true;
  };

  const executeClearCart = async () => {
    isClearCartModalOpen.value = false;
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) {
      toastStore.showToast("Vui lòng đăng nhập lại!", "error");
      return;
    }
    const maKH = JSON.parse(userString).MaKH;
    const oldCart = [...cartItems.value];
    cartItems.value = [];

    try {
      const payload = { MaKH: parseInt(maKH) };
      const response = await fetch(`${API_BASE_URL}/api/don_hang/deleteAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi xóa giỏ hàng từ Server");
      
      toastStore.showToast("Đã làm sạch giỏ hàng!", "success");
      window.dispatchEvent(new Event('cart-updated'));
    } 
    catch (error) {
      toastStore.showToast("Không thể xóa lúc này!", "error");
      cartItems.value = oldCart; 
    }
  };

  const confirmRemoveItem = (item) => {
    itemToDelete.value = item;
    isDeleteItemModalOpen.value = true;
  };

  const executeDeleteItem = async () => {
    isDeleteItemModalOpen.value = false;
    if (itemToDelete.value) {
      await removeItem(itemToDelete.value.MaPhanLoai);
      itemToDelete.value = null; 
    }
  };

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

      const response = await fetch(`${API_BASE_URL}/api/don_hang/update`, {
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
      await fetchCartData();
      window.dispatchEvent(new Event('cart-updated'));
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
    const oldQty = item.SoLuong;

    if (item.SoLuong > 1) {
      item.SoLuong--;
      item.ThanhTien = item.DonGia * item.SoLuong; 
    } 
    else {
      confirmRemoveItem(item);
      return; 
    }

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) {
      toastStore.showToast("Vui lòng đăng nhập lại!", "error");
      return;
    }
    const maKH = JSON.parse(userString).MaKH;

    try {
      const payload = {
        MaKH: parseInt(maKH),
        MaPhanLoai: item.MaPhanLoai, 
        soluong: item.SoLuong        
      };

      const response = await fetch(`${API_BASE_URL}/api/don_hang/update`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Lỗi cập nhật từ Server");
      await fetchCartData();
      window.dispatchEvent(new Event('cart-updated'));
    } 
    catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      toastStore.showToast("Không thể cập nhật số lượng lúc này!", "error");
      item.SoLuong = oldQty;
      item.ThanhTien = item.DonGia * item.SoLuong; 
    }
  };

  const removeItem = async (maPL) => { 
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) {
      toastStore.showToast("Vui lòng đăng nhập lại!", "error");
      return;
    }
    const maKH = JSON.parse(userString).MaKH;
    const oldCart = [...cartItems.value];
    
    cartItems.value = cartItems.value.filter(sp => sp.MaPhanLoai !== maPL);

    try {
      const payload = {
        MaKH: parseInt(maKH),
        MaPhanLoai: maPL, 
      };

      const response = await fetch(`${API_BASE_URL}/api/don_hang/delete`, {
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
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng:", error);
      toastStore.showToast("Không thể xoá hàng lúc này!", "error");
      cartItems.value = oldCart; 
    }
  };

  const goToProduct = (id) => {
    router.push(`/product/${id}`);
  };
</script>

<style scoped>
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