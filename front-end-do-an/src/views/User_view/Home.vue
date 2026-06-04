<template>
  <div class="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
    <TheHeader />
    <section class="relative h-[85vh] overflow-hidden bg-surface-container-lowest group">
      <div class="absolute inset-0 w-full h-full">
        <Transition name="fade-slide" mode="out-in">
          <div :key="currentHeroIndex" class="absolute inset-0 w-full h-full">
            <div class="absolute inset-0 opacity-60">
              <img class="w-full h-full object-cover object-[60%_20%]" :alt="heroSlides[currentHeroIndex].title" :src="heroSlides[currentHeroIndex].image" fetchpriority="high"/>
              <div class="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80 lg:hidden"></div>
            </div>

            <div class="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-start">
              <span class="font-headline text-primary font-bold tracking-[0.3em] text-sm mb-4 animate-[slideInUp_0.5s_ease-out]">
                {{ heroSlides[currentHeroIndex].tag }}
              </span>
              <h1 class="font-headline text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tighter mb-6 max-w-2xl animate-[slideInUp_0.7s_ease-out]">
                {{ heroSlides[currentHeroIndex].title }} <br/> 
                <span class="text-gradient">{{ heroSlides[currentHeroIndex].titleAccent }}</span>
              </h1>
              <p class="text-on-surface-variant text-lg md:text-xl max-w-lg mb-10 leading-relaxed animate-[slideInUp_0.9s_ease-out]">
                {{ heroSlides[currentHeroIndex].desc }}
              </p>
              <div class="flex flex-wrap items-center gap-4 md:gap-6 animate-[slideInUp_1.1s_ease-out]">
                <button @click="router.push(heroSlides[currentHeroIndex].link)" class="hero-gradient text-on-primary font-bold px-8 py-4 rounded-lg flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Khám phá ngay
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <button @click="prevHeroSlide" class="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <button @click="nextHeroSlide" class="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>

      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        <button 
          v-for="(slide, index) in heroSlides" :key="index"
          @click="currentHeroIndex = index"
          :class="['h-1.5 rounded-full transition-all duration-500', currentHeroIndex === index ? 'w-10 bg-primary' : 'w-2 bg-white/30']"
        ></button>
      </div>
    </section>

    <section class="bg-surface-container-low py-12 border-y border-outline-variant/10">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">verified</span>
          </div>
          <div>
            <h3 class="font-headline font-bold text-lg text-on-surface">100% Verified</h3>
            <p class="text-on-surface-variant text-sm mt-1">Chính hãng từ các nhà phân phối lớn</p>
          </div>
        </div>
        <div class="flex items-center gap-4 md:border-x border-outline-variant/10 md:px-8">
          <div class="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">public</span>
          </div>
          <div>
            <h3 class="font-headline font-bold text-lg text-on-surface">Global Shipping</h3>
            <p class="text-on-surface-variant text-sm mt-1">Vận chuyển quốc tế an toàn & nhanh chóng</p>
          </div>
        </div>
        <div class="flex items-center gap-4 md:pl-8">
          <div class="w-12 h-12 rounded-full bg-secondary-dim/10 flex items-center justify-center text-secondary-dim shrink-0">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">support_agent</span>
          </div>
          <div>
            <h3 class="font-headline font-bold text-lg text-on-surface">24/7 Support</h3>
            <p class="text-on-surface-variant text-sm mt-1">Đội ngũ hỗ trợ chuyên nghiệp tận tâm</p>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-24">
      <div class="flex justify-between items-end mb-12 border-b border-outline-variant/15 pb-4">
        <div>
          <h2 class="font-headline text-3xl md:text-4xl font-bold text-on-surface">Danh mục nổi bật</h2>
          <div class="h-1 w-20 bg-primary rounded-full"></div>
        </div>
        <a @click="router.push('/category')" class="text-primary text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer underline-offset-4">
          Tất cả danh mục <span class="material-symbols-outlined text-lg">chevron_right</span>
        </a>
      </div>
      
      <div v-if="featuredCategories.length > 0" class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
        <div v-for="(cat, index) in featuredCategories" :key="cat.MaDM"
             @click="router.push(`/category/${cat.MaDM}`)" 
             class="group relative overflow-hidden rounded-xl bg-surface-container-high cursor-pointer"
             :class="{
               'md:col-span-2 md:row-span-2 h-[300px] md:h-full': index === 0, /* Ô to nhất */
               'md:col-span-2 h-[200px] md:h-full': index === 1,               /* Ô ngang vừa */
               'h-[200px] md:h-full': index > 1                                /* 2 Ô nhỏ */
             }">
          
          <!-- Lớp ảnh nền có hiệu ứng Slide Fade -->
          <transition name="fade">
            <img loading="lazy" 
                 :key="imageTick % (cat.DanhSachAnh?.length || 1)"
                 class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 :alt="cat.TenDM" 
                 :src="cat.DanhSachAnh && cat.DanhSachAnh.length > 0 ? cat.DanhSachAnh[imageTick % cat.DanhSachAnh.length] : 'https://placehold.co/600x400/1c1f2b/fff?text=No+Image'"/>
          </transition>

          <!-- Lớp phủ Gradient làm nổi bật chữ -->
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent opacity-90 z-10 pointer-events-none"></div>
          
          <!-- Nội dung Text tùy chỉnh theo vị trí Grid -->
          <div class="relative z-20" :class="index === 0 ? 'absolute bottom-8 left-8' : 'absolute bottom-6 left-6'">
            <h3 class="font-headline font-bold text-on-surface"
                :class="index === 0 ? 'text-4xl mb-2' : (index === 1 ? 'text-2xl mb-1' : 'text-xl')">
              {{ cat.TenDM }}
            </h3>
            
            <!-- Style riêng cho Ô số 1 (To nhất) -->
            <template v-if="index === 0">
              <p class="text-on-surface-variant mb-6 text-sm max-w-xs">{{ cat.MoTa || 'Khám phá bộ sưu tập độc đáo' }}</p>
              <span class="px-6 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg group-hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 inline-block">Xem ngay</span>
            </template>
            
            <!-- Style riêng cho Ô số 2 (Ngang) -->
            <template v-else-if="index === 1">
              <span class="text-sm font-bold text-primary group-hover:underline underline-offset-4">Khám phá</span>
            </template>
          </div>
        </div>
      </div>
      
      <!-- Khung chờ nếu chưa có dữ liệu -->
      <div v-else class="flex justify-center items-center h-[400px] text-on-surface-variant italic">
        Đang tải danh mục nổi bật...
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-12 border-t border-outline-variant/10">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="font-headline text-3xl md:text-4xl font-bold text-on-surface">Thương hiệu đối tác</h2>
          <div class="h-1 w-20 bg-primary rounded-full"></div>
        </div>
      </div>

      <div class="relative overflow-hidden py-4">
        <div class="flex marquee-track gap-6">       
          <div v-for="brand in brands" :key="`a-${brand.MaHSX}`"
              @click="goToBrand(brand.TenHSX)"
              class="flex-shrink-0 w-44 h-24 bg-surface-container-low border border-outline-variant/20 rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface-bright transition-all p-4 shadow-sm">
            <img v-if="brand.Logo" loading="lazy" :src="`${API_BASE_URL}/Images_brand/${brand.Logo}`" class="max-w-full max-h-full object-contain" />
            <span v-else class="font-headline font-black text-outline-variant text-lg uppercase italic">{{ brand.TenHSX }}</span>
          </div>

          <div v-for="brand in brands" :key="`b-${brand.MaHSX}`"
              @click="goToBrand(brand.TenHSX)"
              class="flex-shrink-0 w-44 h-24 bg-surface-container-low border border-outline-variant/20 rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface-bright transition-all p-4 shadow-sm">
            <img v-if="brand.Logo" loading="lazy" :src="`${API_BASE_URL}/Images_brand/${brand.Logo}`" class="max-w-full max-h-full object-contain" />
            <span v-else class="font-headline font-black text-outline-variant text-lg uppercase italic">{{ brand.TenHSX }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="py-12 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center mb-12 border-b border-outline-variant/15 pb-4">
          <div>
            <h2 class="font-headline text-3xl md:text-4xl font-bold text-on-surface">Hàng mới cập bến</h2>
            <div class="h-1 w-20 bg-primary rounded-full"></div>
          </div>
          <div class="flex gap-2">
            <button @click="scrollSlider('left')" class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-bright hover:text-primary transition-colors">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button @click="scrollSlider('right')" class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-bright hover:text-primary transition-colors">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        
        <div ref="productSlider" class="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4">
          <ProductCard 
            v-for="sp in productList" 
            :key="sp.MaMoHinh" 
            :product="sp"
            @add-to-cart="addToCart"
            class="shrink-0 w-[280px] lg:w-[calc(25%-18px)] snap-start"
          />
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-24">
      <div class="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center border border-tertiary/20 shadow-2xl shadow-tertiary/5">
        <img loading="lazy" class="absolute inset-0 w-full h-full object-cover" alt="Neon background" src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80"/>
        <div class="absolute inset-0 glass-panel bg-surface/60"></div>
        <div class="relative z-10 flex flex-col justify-center items-center text-center p-8 md:p-12 w-full">
          <span class="font-headline text-tertiary font-bold tracking-[0.4em] text-xs md:text-sm mb-4">MEMBER EXCLUSIVE</span>
          <h2 class="font-headline text-4xl md:text-5xl font-bold mb-6 text-on-surface">Special Member Rewards Program</h2>
          <p class="text-base md:text-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
            Tích lũy điểm cho mỗi đơn hàng, nhận ưu tiên Pre-order các phiên bản cực hiếm và voucher giảm giá độc quyền dành riêng cho Collector.
          </p>
          <button class="bg-on-surface text-surface font-bold px-10 py-4 rounded-lg hover:bg-primary hover:text-on-primary active:scale-95 transition-all shadow-xl">
            Tham gia ngay
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.js';
  import { useToastStore } from '../../stores/toast';
  import TheHeader from '../../components/TheHeader.vue';
  import ProductCard from '../../components/ProductCard.vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const toastStore = useToastStore();

  const productList = ref([]);
  const productSlider = ref(null);
  const brands = ref([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const featuredCategories = ref([]);
  const imageTick = ref(0);
  let categoryTimer = null;

  // 2. Hàm lấy danh mục từ API
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/danhmuc`);
      const dataJSON = await res.json();
      
      if (res.ok) {
        // Lọc ra các danh mục có bật Nổi Bật (DanhMucNoiBat === 1) 
        // và dùng .slice(0, 4) để chỉ lấy tối đa 4 cái lấp đầy lưới Bento.
        featuredCategories.value = dataJSON.data
          .filter(cat => cat.DanhMucNoiBat === 1)
          .slice(0, 4);
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục nổi bật:", error);
    }
  };

  const heroSlides = [
    {
      id: 1,
      tag: "PREMIUM ARTIFACTS",
      title: "FIGURE",
      titleAccent: "COLLECT",
      desc: "Nâng tầm bộ sưu tập của bạn với những kiệt tác giới hạn từ các studio hàng đầu thế giới.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGfQ6Typ978uv1QahrmCG7PbPFg5_MLWN4K6DDmh69N5IlhPUhPKmdIfvIvZrQ_rFT9xyW1urq37KsPg2Topn02qR3hXUA9h7RKAdw21cNNpg8-yJQ6L0mjub5hU8TJtnUbmNtH8CjWKlWU8MxvHE6W3LhxEOF4NzXIHMRv8vtmkqkPsfFUx4xRlv2TAaL2OMN0YNVoCa7_nDFZbJA-PHZBV_Hn6rkXodnc9YmQHIGun8C0b2cmKxBFeAEweP0SjPODlAbMN4Gzr-E",
      link: "/category"
    },
    {
      id: 2,
      tag: "LIMITED EDITION",
      title: "GUNDAM",
      titleAccent: "EXCLUSIVE",
      desc: "Khám phá dòng Gundam hiếm nhất, chỉ dành cho những Collector thực thụ.",
      image: "https://images.microcms-assets.io/assets/5694fd90407444338a64d654e407cc0e/6fac664357d64040a70393697bc5755f/2_figure_banner_vol1.png",
      link: "/category"
    },
    {
      id: 3,
      tag: "MEMBER BENEFITS",
      title: "THÀNH VIÊN",
      titleAccent: "ƯU ĐÃI",
      desc: "Gia nhập biệt đội Collector để nhận voucher 100k và ưu tiên đặt trước sản phẩm hot.",
      image: "https://cdn.oneesports.gg/wp-content/uploads/2025/03/HonkaiStarRail_v3_2_KV-1024x576.jpg",
      link: "/login"
    }
  ];

  const currentHeroIndex = ref(0);
  let heroTimer = null;

  const nextHeroSlide = () => {
    currentHeroIndex.value = (currentHeroIndex.value + 1) % heroSlides.length;
  };

  const prevHeroSlide = () => {
    currentHeroIndex.value = (currentHeroIndex.value - 1 + heroSlides.length) % heroSlides.length;
  };

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

  onMounted(async () => {
  scrollToTopCustom();
  heroTimer = setInterval(nextHeroSlide, 7000); 
  categoryTimer = setInterval(() => {
    imageTick.value++;
  }, 3500);

  await Promise.all([
    fetchBrands(),
    fetchCategories(),
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products?limit=12`);
        const dataJSON = await response.json(); 
        if (response.ok) productList.value = dataJSON.data; 
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      }
    })()
  ]);
});

  onUnmounted(() => {
    if (heroTimer) clearInterval(heroTimer);
    if (categoryTimer) clearInterval(categoryTimer);
  });

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/hsx`);
      const dataJSON = await res.json();
      if (res.ok) {
        brands.value = dataJSON.data; 
      }
    } 
    catch (error) {
      console.error("Lỗi lấy thương hiệu:", error);
    }
  };

  const goToBrand = (brandName) => {
    router.push({ path: '/category', query: { brand: brandName } });
  };

  const scrollSlider = (direction) => {
    if (!productSlider.value) return;
    const scrollAmount = 320; 
    
    if (direction === 'left') {
      productSlider.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } 
    else {
      productSlider.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    let maKH = null;
    
    if (userString) {
      const userObj = JSON.parse(userString);
      maKH = userObj.MaKH;
    }

    if (!token || !maKH) {
      toastStore.showToast("🛒 Bạn cần đăng nhập để mua mô hình nhé!", "error");
      router.push({ path: '/login', query: { redirect: '/' } });
      return;
    }

    try {
      const resVar = await fetch(`${API_BASE_URL}/api/products/variants/${product.MaMoHinh}`);
      const varJSON = await resVar.json();
      
      let maPhanLoai = null;
      if (resVar.ok && varJSON.data.length > 0) {
        maPhanLoai = varJSON.data[0].MaPhanLoai; 
      } 
      else {
        toastStore.showToast("⚠️ Sản phẩm này đang bị lỗi phân loại!", "error");
        return;
      }

      const payload = {
        MaKH: parseInt(maKH),
        MaPhanLoai: maPhanLoai, 
        soluong: 1      
      };

      const response = await fetch(`${API_BASE_URL}/api/don_hang/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload) 
      });

      const data = await response.json();

      if (response.ok) {
        toastStore.showToast(`🛒 Đã thêm ${product.TenMH} vào giỏ!`, "success"); 
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        toastStore.showToast("⚠️ Lỗi: " + data.message, "error"); 
      }

    } catch (error) {
      console.error("Lỗi khi kết nối API thêm giỏ hàng:", error);
      toastStore.showToast("Có lỗi mạng xảy ra khi thêm vào giỏ!", "error");
    }
  };

  onMounted(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?limit=12`);
      const dataJSON = await response.json(); 
      
      if (response.ok) {
        productList.value = dataJSON.data; 
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
    await fetchBrands();
  });
</script>

<style scoped>
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    vertical-align: middle;
  }

  .glass-panel {
    background: rgba(28, 31, 43, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .hero-gradient {
    background: linear-gradient(45deg, #ff8f73 0%, #ff7856 100%);
  }

  .text-gradient {
    background: linear-gradient(45deg, #ff8f73, #e9aaff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: scale(1.05); 
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: scale(0.95); 
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .hide-scrollbar {
    -ms-overflow-style: none;  
    scrollbar-width: none;  
  }

  .marquee-track {
    display: flex;
    width: max-content; 
    animation: scrollMarquee 30s linear infinite; 
  }

  .marquee-track:hover {
    animation-play-state: paused;
  }

  @keyframes scrollMarquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  /* Hiệu ứng mờ dần (Cross-fade) cực mượt giữa các bức ảnh danh mục */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s ease-in-out;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .fade-leave-active {
    /* position: absolute giúp ảnh cũ và ảnh mới đè lên nhau trong lúc chuyển đổi */
    position: absolute; 
  }
</style>