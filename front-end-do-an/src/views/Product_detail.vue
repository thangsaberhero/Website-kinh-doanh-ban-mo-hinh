<template>
  <div class="bg-background text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
    <TheHeader />
    
    <main v-if="product" class="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div class="lg:col-span-7 space-y-6">
          <div class="relative bg-surface-container-low rounded-lg overflow-hidden group">
            <div class="absolute top-4 left-4 z-10 flex gap-2">
              <span class="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                {{ product.LoaiHinhBan }}
              </span>
              <span class="bg-surface-bright text-on-surface text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                {{ product.TrangThai }}
              </span>
            </div>
            
            <img :src="'/Images_product/' + mainImage" class="w-full aspect-[4/5] object-contain transform group-hover:scale-105 transition-transform duration-700 p-8"/>
            
            <div class="absolute bottom-6 right-6 flex flex-col gap-2">
              <button class="p-3 bg-surface-bright/80 backdrop-blur rounded-full hover:bg-primary hover:text-on-primary transition-all shadow-xl">
                <span class="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-5 gap-4">
            <button 
              v-for="(anh, index) in allImages" 
              :key="index"
              @click="mainImage = anh"
              :class="['aspect-square bg-surface-container-high rounded overflow-hidden transition-colors', mainImage === anh ? 'border-2 border-primary' : 'border border-outline-variant/15 hover:border-primary/50']"
            >
              <img :src="'/Images_product/' + anh" class="w-full h-full object-cover" :class="mainImage === anh ? 'opacity-100' : 'opacity-60 hover:opacity-100'" />
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
            <h1 class="font-headline text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">{{ product.TenMH }}</h1>
            <div class="flex items-baseline gap-4 mt-6">
              <span class="font-headline text-3xl font-bold text-on-surface">{{ formatPrice(product.DonGia) }}</span>
            </div>
          </header>

          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-px bg-outline-variant/15 rounded overflow-hidden">
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Thương hiệu</span>
                <span class="text-on-surface font-semibold">{{ product.TenHSX }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Chất liệu</span>
                <span class="text-on-surface font-semibold">{{ product.ChatLieu }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kích thước</span>
                <span class="text-on-surface font-semibold">{{ product.KichThuoc }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kho hàng</span>
                <span class="text-on-surface font-semibold">{{ product.SoLuong }} hộp</span>
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
                    'px-4 py-2 border-2 rounded-md font-semibold transition-all text-sm',
                    selectedVariant?.MaPhanLoai === variant.MaPhanLoai
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-outline-variant/30 text-outline hover:border-primary/50'
                  ]"
                >
                  {{ variant.TenPhanLoai }}
                </button>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-outline-variant/15">
              <div class="flex items-center gap-4">
                <div class="flex items-center bg-surface-container-highest rounded border border-outline-variant/20 h-14">
                  <button @click="buyQuantity > 1 && buyQuantity--" class="px-4 hover:text-primary transition-colors"><span class="material-symbols-outlined">remove</span></button>
                  <span class="w-12 text-center font-bold text-lg">{{ buyQuantity }}</span>
                  <button @click="buyQuantity < (selectedVariant ? selectedVariant.SoLuong : 0) && buyQuantity++" class="px-4 hover:text-primary transition-colors"><span class="material-symbols-outlined">add</span></button>
                </div>
                <button 
                  @click="addToCart" 
                  :disabled="!selectedVariant || selectedVariant.SoLuong === 0"
                  :class="['flex-1 h-14 font-headline font-bold uppercase tracking-widest rounded transition-all', 
                    (!selectedVariant || selectedVariant.SoLuong === 0) 
                      ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0_0_20px_rgba(255,143,115,0.3)] hover:brightness-110 active:scale-95'
                  ]"
                >
                  {{ (!selectedVariant || selectedVariant.SoLuong === 0) ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG' }}
                </button>
              </div>
            </div>

            <div class="pt-6 border-t border-outline-variant/15 flex items-center gap-6">
              <div class="flex flex-col">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">BẢO HÀNH</span>
                <span class="text-sm font-semibold">1 Đổi 1 trong 7 ngày</span>
              </div>
              <div class="h-8 w-px bg-outline-variant/30"></div>
              <div class="flex flex-col">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">VẬN CHUYỂN</span>
                <span class="text-sm font-semibold">Miễn phí toàn quốc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-else class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <span class="material-symbols-outlined animate-spin text-primary text-5xl">settings</span>
        <span class="font-headline text-outline tracking-widest uppercase">Đang tải dữ liệu...</span>
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
const cartCount = ref(0); // Khai báo biến này để Header không bị báo lỗi

const variants = ref([]);
const selectedVariant = ref(null);

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

onMounted(async () => {
  const spId = route.params.id; 
  try {
    const res = await fetch(`http://localhost:3000/api/products/${spId}`);
    const dataJSON = await res.json(); // Lấy cả gói hàng từ Backend

    if (res.ok) {
      // 1. Bóc vỏ hộp, lấy đúng cục dữ liệu Mô hình ở vị trí [0]
      product.value = dataJSON.data[0]; 

      // 2. Xử lý danh sách ảnh
      // Nếu có DanhSachAnh (do GROUP_CONCAT tạo ra), ta dùng lệnh split(',') để cắt chuỗi thành 1 mảng. 
      // Nếu không có, ta dùng luôn cái AnhDaiDien.
      if (product.value.DanhSachAnh) {
        // Dùng Set để loại bỏ các ảnh bị trùng lặp (nếu có)
        allImages.value = [...new Set(product.value.DanhSachAnh.split(','))];
      } else {
        allImages.value = [product.value.AnhDaiDien];
      }
      
      mainImage.value = allImages.value[0]; // Gán ảnh chính là ảnh đầu tiên
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
  try {
    // Lưu ý: Đảm bảo đường link này khớp với Route bạn đã cấu hình bên Backend nhé
    // Ví dụ: router.get('/products/variants/:id', getVariantProductById)
    const resVar = await fetch(`http://localhost:3000/api/products/variants/${spId}`);
    const varJSON = await resVar.json();
    
    if (resVar.ok) {
      variants.value = varJSON.data;
      // Gán mặc định luôn chọn loại đầu tiên khi web load xong
      if (variants.value.length > 0) {
        selectedVariant.value = variants.value[0];
      }
    }
  } catch (error) {
    console.error("Lỗi tải phân loại:", error);
  }
});

// Hàm xử lý khi khách bấm nút "THÊM VÀO GIỎ HÀNG"
const addToCart = async () => {
  // 1. Lấy Token
  const token = localStorage.getItem('token');
  
  // 2. Lấy chuỗi user từ localStorage và bóc tách lấy ID
  const userString = localStorage.getItem('user');
  let maKH = null;
  
  if (userString) {
    const userObj = JSON.parse(userString); // Mở hộp user
    maKH = userObj.MaKH; // Lấy cái id số 4 ra
  }

  // THÊM 2 DÒNG NÀY ĐỂ DEBUG (Kiểm tra xem code nó đọc được gì)
  console.log("Mật mã Token:", token ? "Đã có" : "Trống rỗng");
  console.log("Mã Khách Hàng (id):", maKH);

  // 3. Kiểm tra bảo vệ vòng ngoài
  if (!token || !maKH) {
    alert("Bạn cần đăng nhập để thêm mô hình vào giỏ nhé!");
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return;
  }

  try {
    const payload = {
      MaKH: parseInt(maKH), // Chắc chắn lúc này maKH đang là số 4
      MaPhanLoai: selectedVariant.value.MaPhanLoai, 
      soluong: buyQuantity.value          
    };

    // ... (Phần gọi API fetch('http://localhost:3000/api/add_cart', ...) bên dưới bạn giữ nguyên)
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
      toastStore.showToast("🎉 " + data.message, "success");
      cartCount.value++; 
    } else {
      toastStore.showToast("⚠️ Lỗi: " + data.message, "error");
    }

  } catch (error) {
    console.error("Lỗi khi kết nối API thêm giỏ hàng:", error);
    alert("Có lỗi mạng xảy ra, vui lòng thử lại sau!");
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }
</style>