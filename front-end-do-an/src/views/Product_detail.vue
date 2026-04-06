<template>
  <div class="bg-background text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col font-body">
    <TheHeader />
    
    <main v-if="product" class="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div class="lg:col-span-7 space-y-6">
          <div class="relative bg-surface-container-low rounded-lg overflow-hidden group border border-outline-variant/20">
            <div class="absolute top-4 left-4 z-10 flex gap-2">
              <span class="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                {{ product.LoaiHinhBan }}
              </span>
              <span class="bg-surface-bright text-on-surface text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm border border-outline-variant/30">
                {{ product.TrangThai }}
              </span>
            </div>
            
            <img :src="'/Images_product/' + mainImage" class="w-full aspect-[4/5] object-contain transform group-hover:scale-105 transition-transform duration-700 p-8 drop-shadow-2xl"/>
            
            <div class="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
              <button class="p-3 bg-surface-bright/80 backdrop-blur rounded-full hover:bg-primary hover:text-on-primary transition-all shadow-xl">
                <span class="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div class="grid grid-cols-5 gap-4">
            <button 
              v-for="(anh, index) in allImages" 
              :key="index"
              @click="mainImage = anh"
              :class="['aspect-square bg-surface-container-high rounded overflow-hidden transition-all duration-300 transform', mainImage === anh ? 'border-2 border-primary scale-105 shadow-lg' : 'border border-outline-variant/15 hover:border-primary/50 opacity-60 hover:opacity-100']"
            >
              <img :src="'/Images_product/' + anh" class="w-full h-full object-cover"/>
            </button>
          </div>
        </div>

        <div class="lg:col-span-5 flex flex-col">
          <header class="mb-8">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-primary text-xs font-bold tracking-[0.2em] uppercase">{{ product.TenHSX || 'UNKNOWN' }}</span>
              <span class="text-outline-variant">•</span>
              <span class="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Mô Hình</span>
            </div>
            <h1 class="font-headline text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.1] text-white">{{ product.TenMH }}</h1>
            <div class="flex items-baseline gap-4 mt-6">
              <span class="font-headline text-3xl font-bold">
                <div v-if="selectedVariant && selectedVariant.dongiakhuyenmai">
                  <span class="text-primary font-bold">{{ formatPrice(selectedVariant.dongiakhuyenmai) }}</span>
                  <span class="text-outline line-through text-base ml-3">{{ formatPrice(selectedVariant.DonGia) }}</span>
                </div>
                <div v-else-if="selectedVariant">
                    <span class="text-white font-bold">{{ formatPrice(selectedVariant.DonGia) }}</span>
                </div>
                 <div v-else>
                    <span class="text-outline italic text-sm">Đang tải giá...</span>
                </div>
              </span>
            </div>
          </header>

          <div class="space-y-8 flex-1">
            <div class="grid grid-cols-2 gap-px bg-outline-variant/15 rounded overflow-hidden border border-outline-variant/20">
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Thương hiệu</span>
                <span class="text-white font-semibold">{{ product.TenHSX }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Chất liệu</span>
                <span class="text-white font-semibold">{{ product.ChatLieu }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kích thước</span>
                <span class="text-white font-semibold">{{ product.KichThuoc }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kho hàng</span>
                <span class="text-white font-semibold">
                  {{ selectedVariant ? (selectedVariant.SoLuong === 0 ? 'Hết hàng' : selectedVariant.SoLuong + ' hộp') : 'Đang tải...' }}
                </span>
              </div>
            </div>

            <div v-if="variants.length > 1" class="pt-6 border-t border-outline-variant/15">
              <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-3">CHỌN PHÂN LOẠI</span>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="variant in variants"
                  :key="variant.MaPhanLoai"
                  @click="selectedVariant = variant; buyQuantity = 1;"
                  :class="[
                    'px-5 py-2.5 border-2 rounded-md font-semibold transition-all text-sm',
                    selectedVariant?.MaPhanLoai === variant.MaPhanLoai
                      ? 'border-primary text-primary bg-primary/10 shadow-inner'
                      : 'border-outline-variant/30 text-outline hover:border-primary/50 hover:text-white'
                  ]"
                >
                  {{ variant.ChiTietPhanLoai === 'NONE' ? 'Bình thường' : variant.ChiTietPhanLoai}}
                </button>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-outline-variant/15 mt-auto">
              <div class="flex items-center gap-4">
                <div class="flex items-center bg-surface-container-highest rounded border border-outline-variant/20 h-14">
                  <button @click="buyQuantity > 1 && buyQuantity--" class="px-5 hover:text-primary transition-colors text-outline"><span class="material-symbols-outlined">remove</span></button>
                  <span class="w-10 text-center font-bold text-xl text-white">{{ buyQuantity }}</span>
                  <button @click="buyQuantity < (selectedVariant ? selectedVariant.SoLuong : 0) && buyQuantity++" class="px-5 hover:text-primary transition-colors text-outline"><span class="material-symbols-outlined">add</span></button>
                </div>
                
                <button 
                  @click="addToCart" 
                  :disabled="!selectedVariant || selectedVariant.SoLuong === 0"
                  :class="['flex-1 h-14 font-headline font-bold uppercase tracking-widest rounded transition-all text-sm px-4', 
                    (!selectedVariant || selectedVariant.SoLuong === 0) 
                      ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0_0_20px_rgba(255,143,115,0.3)] hover:brightness-110 active:scale-95'
                  ]"
                >
                  {{ (!selectedVariant || selectedVariant.SoLuong === 0) ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG' }}
                </button>

                <button 
                    @click="toggleFavorite"
                    title="Thêm/Bỏ yêu thích"
                    :class="['w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                             isFavorite 
                             ? 'bg-red-950/50 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-950' 
                             : 'bg-surface-container-low border-outline-variant/30 text-outline hover:border-primary/50 hover:text-primary']">
                    <span class="material-symbols-outlined font-bold text-3xl">
                        {{ isFavorite ? 'favorite' : 'favorite_border' }}
                    </span>
                </button>
              </div>
            </div>

            <div class="pt-6 border-t border-outline-variant/15 flex items-center gap-6 text-sm">
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">BẢO HÀNH</span>
                <span class="font-semibold text-on-surface">1 Đổi 1 trong 7 ngày</span>
              </div>
              <div class="h-10 w-px bg-outline-variant/30"></div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">VẬN CHUYỂN</span>
                <span class="font-semibold text-on-surface">Miễn phí nội thành Hải Phòng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-else class="flex-1 flex items-center justify-center bg-surface-container-lowest">
      <div class="flex flex-col items-center gap-4 p-10 bg-surface-container rounded-2xl border border-outline-variant/15 shadow-2xl">
        <span class="material-symbols-outlined animate-spin text-primary text-6xl">settings</span>
        <span class="font-headline text-outline tracking-widest uppercase font-bold text-sm">Đang tải tạo tác...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';
import { useToastStore } from '@/stores/toast'

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const product = ref(null);
const allImages = ref([]); 
const mainImage = ref('');
const buyQuantity = ref(1);

const variants = ref([]);
const selectedVariant = ref(null);

// ================= BIẾN MỚI ĐỂ LƯU TRẠNG THÁI YÊU THÍCH =================
const isFavorite = ref(false);

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

onMounted(async () => {
  window.scrollTo(0, 0);
  const spId = route.params.id; 
  
  // 1. Tải thông tin sản phẩm và ảnh
  try {
    const res = await fetch(`http://localhost:3000/api/products/${spId}`);
    const dataJSON = await res.json();

    if (res.ok) {
      product.value = dataJSON.data[0]; 
      if (product.value.DanhSachAnh) {
        allImages.value = [...new Set(product.value.DanhSachAnh.split(','))];
      } else {
        allImages.value = [product.value.AnhDaiDien];
      }
      mainImage.value = allImages.value[0]; 
    }
  } catch (error) {
    console.error("Lỗi tải sản phẩm:", error);
  }

  // 2. Tải danh sách phân loại (Variant)
  try {
    const resVar = await fetch(`http://localhost:3000/api/products/variants/${spId}`);
    const varJSON = await resVar.json();
    
    if (resVar.ok) {
      variants.value = varJSON.data;
      if (variants.value.length > 0) {
        selectedVariant.value = variants.value[0];
      }
    }
  } catch (error) {
    console.error("Lỗi tải phân loại:", error);
  }

  // ================= 3. [MỚI]: KIỂM TRA TRẠNG THÁI YÊU THÍCH KHI LOAD WEB =================
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (token && userString) {
      try {
          const userObj = JSON.parse(userString);
          // Giả sử Backend có API GET /api/favorite/check/:maKH/:maMH để kiểm tra
          const resFav = await fetch(`http://localhost:3000/api/products/check_favorite/${userObj.MaKH}/${spId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const favData = await resFav.json();
          
          if (resFav.ok && favData.isFavorite) {
              isFavorite.value = true; // Nếu Backend bảo đã thích -> tô đỏ trái tim
          }
      } catch (err) {
          console.error("Lỗi kiểm tra trạng thái yêu thích:", err);
      }
  }
});

// ================= HÀM MỚI XỬ LÝ KHI BẤM NÚT THẢ TIM ❤️ =================
const toggleFavorite = async () => {
    // 1. Bóc tách thông tin đăng nhập
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    // 2. Kiểm tra nếu chưa đăng nhập -> đá sang trang Login
    if (!token || !userString) {
        toastStore.showToast("💖 Bạn cần đăng nhập để thả tim mô hình nhé!", "error");
        // Ghi nhớ trang hiện tại để login xong thì quay lại đây
        router.push({ path: '/login', query: { redirect: route.fullPath } });
        return;
    }

    const userObj = JSON.parse(userString);

    try {
        // 3. Gửi payload lên API "Toggle" ở Backend
        const payload = {
            MaKH: userObj.MaKH,
            MaMoHinh: product.value.MaMoHinh // Lấy id của Mô hình gốc
        };

        const response = await fetch('http://localhost:3000/api/products/add_remove_favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload) 
        });

        const data = await response.json();

        if (response.ok) {
            // 4. Cập nhật UI ngay lập tức dựa trên chữ 'action' từ Backend trả về
            if (data.action === 'added') {
                isFavorite.value = true; // Tô đỏ
                toastStore.showToast("💖 " + data.message, "success");
            } else if (data.action === 'removed') {
                isFavorite.value = false; // Bỏ đỏ (rỗng)
                toastStore.showToast("💔 " + data.message, "success");
            }
        } else {
            toastStore.showToast("⚠️ Lỗi: " + data.message, "error");
        }

    } catch (error) {
        console.error("Lỗi khi kết nối API yêu thích:", error);
        alert("Có lỗi mạng xảy ra, không thể thao tác mục yêu thích!");
    }
};

// Hàm xử lý Thêm vào giỏ (Giữ nguyên cũ của bạn)
const addToCart = async () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let maKH = null;
  
  if (userString) {
    const userObj = JSON.parse(userString);
    maKH = userObj.MaKH;
  }

  if (!token || !maKH) {
    toastStore.showToast("🛒 Bạn cần đăng nhập để mua mô hình nhé!", "error");
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return;
  }

  try {
    const payload = {
      MaKH: parseInt(maKH),
      MaPhanLoai: selectedVariant.value.MaPhanLoai, 
      soluong: buyQuantity.value          
    };

    const response = await fetch('http://localhost:3000/api/add_cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(payload) 
    });

    const data = await response.json();

    if (response.ok) {
      toastStore.showToast("🛒 🎉 " + data.message, "success"); 
      // Có thể gọi store giỏ hàng ở đây để cập nhật số lượng trên Header
    } else {
      toastStore.showToast("⚠️ Lỗi: " + data.message, "error"); 
    }

  } catch (error) {
    console.error("Lỗi khi kết nối API thêm giỏ hàng:", error);
    alert("Có lỗi mạng xảy ra khi thêm vào giỏ!");
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

/* Custom css cho animation zoom ảnh, hover ... */
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
/* Hiệu ứng fill cho icon yêu thích khi đã thích */
.is-favorite-icon {
    font-variation-settings: 'FILL' 1, 'wght' 600;
}
</style>