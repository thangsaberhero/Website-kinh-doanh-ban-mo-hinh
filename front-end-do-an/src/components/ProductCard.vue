<template>
    <router-link 
        :to="`/product/${product.MaMoHinh}`"
        class="group cursor-pointer flex flex-col h-full transition-all duration-300 relative block"
    >
      <div v-if="product.SoLuong === 0" class="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-lg">
        <span class="border-2 border-outline text-outline px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded">HẾT HÀNG</span>
      </div>
  
      <div class="relative bg-surface-container-highest aspect-[3/4] rounded-lg overflow-hidden mb-4 border border-outline-variant/10">        
        <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <span v-if="product.LoaiHinhBan" class="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-primary text-on-primary shadow-sm">
            {{ product.LoaiHinhBan }}
          </span>
          <span v-if="product.TrangThai && product.TrangThai !== 'Còn hàng'" class="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-tertiary text-on-tertiary shadow-sm">
            {{ product.TrangThai }}
          </span>
        </div>
        
        <div v-if="product.DonGia && product.DonGiaKhuyenMai && (Number(product.DonGia) > Number(product.DonGiaKhuyenMai))" class="absolute top-3 right-3 z-10">
          <span class="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
            -{{ Math.round((1 - Number(product.DonGiaKhuyenMai) / Number(product.DonGia)) * 100) }}%
          </span>
        </div>

        <img 
          loading="lazy" 
          :src="getImageUrl(product.AnhDaiDien)" 
          @error="$event.target.src = 'https://server.wallpaperalchemy.com/storage/wallpapers/353/evernight-honkai-star-rail-4k-wallpaper.jpg'"
          :alt="product.TenMH" 
          :class="['w-full h-full object-cover transition-transform duration-700 group-hover:scale-105', product.SoLuong === 0 ? 'grayscale opacity-50' : '']"
        />
        
        <div class="absolute inset-0 bg-surface/0 group-hover:bg-surface/10 transition-colors"></div>
        
        <button v-if="!hideCart"
          @click.prevent="$emit('add-to-cart', product)" 
          :disabled="product.SoLuong === 0" 
          :class="['absolute bottom-2 right-2 md:bottom-4 md:right-4 w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center transform transition-all shadow-lg z-10', 
                  product.SoLuong === 0 
                    ? 'bg-surface-container-high text-outline cursor-not-allowed opacity-100 translate-y-0' 
                    : 'bg-primary text-on-primary lg:opacity-0 lg:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white hover:text-primary shadow-primary/20']"
        >
          <span class="material-symbols-outlined text-[16px] md:text-[20px] font-bold">shopping_cart</span>
        </button>
      </div>
      
      <div class="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <p class="text-[10px] text-outline font-bold uppercase tracking-[0.15em] mb-1 truncate">
            {{ product.TenHSX || 'UNKNOWN' }} <span v-if="product.KichThuoc">• {{ product.KichThuoc }}</span>
          </p>
          
          <h3 class="font-headline font-bold text-sm md:text-base leading-snug group-hover:text-primary transition-colors text-white line-clamp-2 min-h-[2.5rem] md:min-h-[2.75rem]">
            {{ product.TenMH }}
          </h3>
        </div>
        
        <div class="pt-1">
          
          <div v-if="product.DonGia && product.DonGiaKhuyenMai && (Number(product.DonGia) > Number(product.DonGiaKhuyenMai))" class="flex items-baseline gap-2">
            <span :class="['text-base md:text-xl font-headline font-bold tracking-tight', product.SoLuong === 0 ? 'text-outline' : 'text-primary']">
              {{ formatPrice(product.DonGiaKhuyenMai) }}
            </span>
            <span class="text-xs text-outline line-through font-medium">
                {{ formatPrice(product.DonGia) }}
            </span>
          </div>
        
          <div v-else>
            <span :class="['text-base md:text-xl font-headline font-bold tracking-tight', product.SoLuong === 0 ? 'text-outline' : 'text-primary']">
              {{ formatPrice(product.DonGiaKhuyenMai || product.DonGia || 0) }}
            </span>
          </div>
          
        </div>
      </div>
    </router-link>
  </template>
  
  <script setup>
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const props = defineProps({
    product: {
        type: Object,
        required: true
    },
    hideCart: {
      type: Boolean,
      default: false
    }
});
  
  defineEmits(['add-to-cart']);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  const getImageUrl = (imagePath) => {
  // 1. Nếu không có ảnh -> trả về ảnh trống hoặc bỏ qua để @error HTML tự lo
  if (!imagePath) return 'https://server.wallpaperalchemy.com/storage/wallpapers/353/evernight-honkai-star-rail-4k-wallpaper.jpg';
  
  // 2. Nếu là ảnh mới up lên Cloudinary (bắt đầu bằng http hoặc https) -> Trả về nguyên link
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // 3. Nếu là ảnh cũ lưu ở Render (chỉ là tên file) -> Nối với API_BASE_URL
  const cleanPath = imagePath.replace(/^public\//, ''); // Đề phòng DB lưu dính chữ public/
  return `${API_BASE_URL}/Images_product/${cleanPath}`;
};
  </script>