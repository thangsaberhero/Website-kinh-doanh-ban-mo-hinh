<template>
  <div class="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen">
    <TheHeader />
    <section class="relative h-[85vh] overflow-hidden bg-surface-container-lowest">
      <div class="absolute inset-0 opacity-60">
        <img class="w-full h-full object-cover object-[60%_20%]" alt="Premium Gundam" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGfQ6Typ978uv1QahrmCG7PbPFg5_MLWN4K6DDmh69N5IlhPUhPKmdIfvIvZrQ_rFT9xyW1urq37KsPg2Topn02qR3hXUA9h7RKAdw21cNNpg8-yJQ6L0mjub5hU8TJtnUbmNtH8CjWKlWU8MxvHE6W3LhxEOF4NzXIHMRv8vtmkqkPsfFUx4xRlv2TAaL2OMN0YNVoCa7_nDFZbJA-PHZBV_Hn6rkXodnc9YmQHIGun8C0b2cmKxBFeAEweP0SjPODlAbMN4Gzr-E"/>
        <div class="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80 lg:hidden"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-start">
        <span class="font-headline text-primary font-bold tracking-[0.3em] text-sm mb-4">PREMIUM ARTIFACTS</span>
        <h1 class="font-headline text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tighter mb-6 max-w-2xl">
          FIGURE <br/> <span class="text-gradient">COLLECT</span>
        </h1>
        <p class="text-on-surface-variant text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
          Nâng tầm bộ sưu tập của bạn với những kiệt tác giới hạn từ các studio hàng đầu thế giới.
        </p>
        <div class="flex flex-wrap items-center gap-4 md:gap-6">
          <button class="hero-gradient text-on-primary font-bold px-8 py-4 rounded-lg flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
            Khám phá ngay
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <button class="border border-outline-variant px-8 py-4 rounded-lg font-bold hover:bg-surface-bright active:scale-95 transition-all">
            Xem bộ sưu tập
          </button>
        </div>
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
          <h2 class="font-headline text-3xl md:text-4xl font-bold mb-2 text-on-surface">Danh mục nổi bật</h2>
          <div class="h-1 w-20 bg-primary rounded-full"></div>
        </div>
        <a @click="router.push('/category')" class="text-primary text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer underline-offset-4">
          Tất cả danh mục <span class="material-symbols-outlined text-lg">chevron_right</span>
        </a>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
        <div @click="router.push('/category/1')" class="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-surface-container-high h-[300px] md:h-full cursor-pointer">
          <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gundam" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTN9R9WoKtJr-Z5C2HbDfdYQSUUkkan2weN7m276fs-9-P0MfXSkCIutOHsUECJDPFQTvK7WMzUqmDd7bE6EbBQ89NU6GX846dACqtgAtgxNK6oJEpDisoDWtFfq3l73MKMynANeKevX-NoaASnwF0HCk8biBUPgrslgf68Qd1QOuQOFk1jgWRReU69L9wU8cRhfpQ93BHmkgka3p0nAD4K85Ie9dapTkJZe3UYbtPbS9RMZmkQTdxDIvG9EB1qF59TskilCVBv7gV"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent opacity-90"></div>
          <div class="absolute bottom-8 left-8">
            <h3 class="font-headline text-4xl font-bold mb-2 text-on-surface">Gundam</h3>
            <p class="text-on-surface-variant mb-6 text-sm">Gunpla kits & Metal Build series</p>
            <span class="px-6 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg group-hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">Xem ngay</span>
          </div>
        </div>
        <div @click="router.push('/category/2')" class="md:col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-high h-[200px] md:h-full cursor-pointer">
          <img class="w-full h-full object-cover object-[60%_20%] transition-transform duration-700 group-hover:scale-110" alt="Anime Figures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc9EefOKRtW9P5T9dmvXGNNq8MFtz_sLJ9wqkmeXpy4Cdu580eR8eUS0-CjohhwjyysehekPNkihEdDiy3Lw9JhKVgfrThzIsgSKiH_MBybuB-tlXDjDNF8i19e2Cw7KR9eGecbSCuziwDfkCZv1kHBGiqbNyAOxX-qol3qeRhPaPgwhXF0KAIIhcociO5EhmEl-_AqVhbCf77Ki9aRhIKkrcvFv_mFoQLeRxXtI0IB2U4e4fSsux_bHpIxOZDb9F6Hxf10RqO5MlC"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90"></div>
          <div class="absolute bottom-6 left-6">
            <h3 class="font-headline text-2xl font-bold mb-1 text-on-surface">Anime Figures</h3>
            <span class="text-sm font-bold text-primary group-hover:underline underline-offset-4">Khám phá</span>
          </div>
        </div>
        <div class="group relative overflow-hidden rounded-xl bg-surface-container-high h-[200px] md:h-full cursor-pointer">
          <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Limited Edition" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYfZUKfGvIVYtGGesAxpJgnoXAyTLnTvBXgmRQJY_Zo3kOuXB8YgxJHlwWsAeLk2LH87_2Km4PNjLiG2SzLXi84AJUW5_0pAbjOR-OmDmpX6PqeHvLRa6L3a1zy72GqbFmhWBWh0D5lvwErV46i2zlhf6xG5Qj4b0-PYNf-tbQiUpqlG7U1WNXEfr8agsAa-KG09-bGSmRwLXD5S_Lqa6Qq2M5kFwGSOmixajDgDZ0KgjjQT5W4zJhYmHiNEkd8vxQYYq2VPm665xL"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90"></div>
          <div class="absolute bottom-4 left-4">
            <h3 class="font-headline text-xl font-bold text-on-surface">Limited Edition</h3>
          </div>
        </div>
        <div class="group relative overflow-hidden rounded-xl bg-surface-container-high h-[200px] md:h-full cursor-pointer">
          <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Accessories" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgmPpWW6OB7MYZv-uu7oXIkdQrQzvMqrYbvIXWVmaTRXlZvzLwnzhI_idJrgvEG6ElViJqHJmFtYpmNn9EZwuebx308XKoAdA2Esjv_oB7_qlBNqJEJYnS2ett-ZFgM12M9lHFZ6N6oZJCUt4cacKs3O6xOpQzlrBpKNHVaQV4VDwvYHBRk6IzpwHJftf9AGxIauIEKwH2jylx2-yscCboBK2-Rf7XZNgQ-yaFqpMkzoCx6QPNbm8eYwjWcaEzy6neqzGJesfFOqiK"/>
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90"></div>
          <div class="absolute bottom-4 left-4">
            <h3 class="font-headline text-xl font-bold text-on-surface">Phụ kiện</h3>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex justify-between items-center mb-12 border-b border-outline-variant/15 pb-4">
          <h2 class="font-headline text-3xl md:text-4xl font-bold text-on-surface">Hàng mới cập bến</h2>
          <div class="flex gap-2">
            <button class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-bright hover:text-primary transition-colors">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-bright hover:text-primary transition-colors">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="sp in productList" :key="sp.MaMoHinh" @click="goToDetail(sp.MaMoHinh)" class="group cursor-pointer">
            <div class="relative bg-surface-container-highest aspect-[3/4] rounded-lg overflow-hidden mb-5 border border-outline-variant/10">
              
              <span class="absolute top-4 left-4 z-10 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-primary text-on-primary">
                NEW
              </span>
              
              <img :src="'/Images_product/' + sp.AnhDaiDien" :alt="sp.TenMH" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div class="absolute inset-0 bg-surface/0 group-hover:bg-surface/20 transition-colors"></div>
              
              <button class="absolute bottom-4 right-4 w-12 h-12 bg-primary text-on-primary rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-lg shadow-primary/30">
                <span class="material-symbols-outlined">shopping_cart</span>
              </button>
            </div>
            
            <div class="space-y-3">
              <h3 class="font-headline font-bold text-base md:text-lg leading-snug group-hover:text-primary transition-colors text-on-surface line-clamp-2">
                {{ sp.TenMH }}
              </h3>
              <div class="flex justify-between items-end">
                <span class="text-xl md:text-2xl font-bold text-primary">{{ formatPrice(sp.DonGia) }}</span>
                <span class="text-[10px] text-outline uppercase tracking-widest font-bold">Còn: {{ sp.SoLuong }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-6 py-24">
      <div class="relative rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center border border-tertiary/20 shadow-2xl shadow-tertiary/5">
        <img class="absolute inset-0 w-full h-full object-cover" alt="Neon background" src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80"/>
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
import TheHeader from '@/components/TheHeader.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
const authStore = useAuthStore();

const router = useRouter();

const productList = ref([]);

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const dataJSON = await response.json(); // Lấy toàn bộ gói hàng
    
    if (response.ok) {
      productList.value = dataJSON.data; // Chỉ lấy phần mảng dữ liệu nhét vào list
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
});

const goToDetail = (id) => {
  router.push(`/product/${id}`); 
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.font-headline { 
  font-family: 'Space Grotesk', sans-serif; 
}

.font-body {
  font-family: 'Manrope', sans-serif;
}

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
</style>