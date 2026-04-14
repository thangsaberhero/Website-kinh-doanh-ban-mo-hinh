<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
    <TheHeader />

    <main class="flex-1">
      <section v-if="heroNews.id" class="relative w-full h-[85vh] min-h-[500px] overflow-hidden">
        <div class="absolute inset-0">
          <img :src="heroNews.image" :alt="heroNews.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        </div>
        <div class="relative z-10 h-full flex flex-col justify-end max-w-7xl mx-auto px-6 pb-20">
          <div class="flex items-center space-x-3 mb-4">
            <span class="px-3 py-1 bg-primary border border-primary text-black text-[10px] font-black tracking-[0.2em] uppercase rounded shadow-[0_0_15px_rgba(255,61,0,0.5)]">
              {{ heroNews.category }}
            </span>
            <span class="text-on-surface-variant text-xs font-bold tracking-widest uppercase">• {{ heroNews.readTime }} phút đọc</span>
          </div>
          <h1 class="font-headline text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-white leading-tight mb-6 uppercase max-w-4xl" v-html="heroNews.titleHtml">
          </h1>
          <p class="font-body text-base md:text-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed font-medium">
            {{ heroNews.summary }}
          </p>
          <div>
            <button @click="router.push(`/news/${heroNews.id}`)" class="px-8 py-3.5 bg-primary text-black font-headline font-black tracking-widest rounded-lg hover:bg-white transition-all neon-glow flex items-center group uppercase text-sm">
              Đọc Bài Viết
              <span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      <section class="py-12 bg-background overflow-hidden">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex items-end justify-between mb-8">
            <h2 class="text-2xl font-headline font-black tracking-tight text-white uppercase flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
              Đang Thịnh Hành
            </h2>
          </div>
          
          <div class="flex space-x-6 overflow-x-auto hide-scrollbar pb-6 -mx-6 px-6 snap-x">
            <div v-for="item in trendingNews" :key="item.id" @click="router.push(`/news/${item.id}`)" 
                 class="snap-start min-w-[280px] sm:min-w-[300px] h-[350px] group relative rounded-2xl overflow-hidden cursor-pointer border border-outline-variant/30 hover:border-primary/50 transition-colors">
              <img :src="item.image" :alt="item.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
              <div class="absolute bottom-6 left-6 right-6">
                <span class="text-primary text-[10px] font-black uppercase tracking-widest mb-2 block">{{ item.category }}</span>
                <h4 class="font-headline font-bold text-lg leading-tight text-white group-hover:text-primary transition-colors">{{ item.title }}</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-12 max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div class="lg:col-span-8">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-outline-variant/30">
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="tab in categories" :key="tab"
                  @click="activeCategory = tab"
                  :class="[
                    'px-5 py-2 rounded-lg font-headline font-bold text-[11px] tracking-widest uppercase transition-all',
                    activeCategory === tab 
                      ? 'bg-primary text-black shadow-[0_0_10px_rgba(255,61,0,0.3)]' 
                      : 'bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-white'
                  ]"
                >
                  {{ tab }}
                </button>
              </div>
            </div>

            <div v-if="filteredNews.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <article v-for="post in displayNews" :key="post.id" @click="router.push(`/news/${post.id}`)"
                       class="group flex flex-col cursor-pointer relative mt-4">
                
                <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-primary/20 group-hover:shadow-lg transition-all duration-300 border border-outline-variant/20 group-hover:border-primary/50">
                  <img :src="post.image" :alt="post.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>

                  <div class="absolute top-4 bottom-4 left-4 right-4 border-y border-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center z-10 pointer-events-none opacity-80"></div>
                  <div class="absolute top-4 bottom-4 left-4 right-4 border-x border-white scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center z-10 pointer-events-none opacity-80"></div>

                  <div class="absolute top-3 right-3 z-20">
                    <span class="bg-background/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded text-white border border-white/10">
                      {{ post.category }}
                    </span>
                  </div>
                </div>
                <div class="absolute top-2 -left-1.5 bg-primary text-on-primary-fixed flex flex-col items-center justify-center min-w-[50px] px-3 py-2 rounded-br-2xl shadow-lg z-10">
                     <span class="text-xl font-headline font-black leading-none mb-1">{{ post.date.split('/')[0] }}</span>
                     <span class="text-[10px] font-bold leading-none opacity-90">{{ post.date.split('/')[1] }}/{{ post.date.split('/')[2] }}</span>
                     <div class="absolute top-full left-0 w-0 h-0 border-t-[8px] border-l-[8px] border-l-transparent border-t-[#cc3200]"></div>
                </div>
                <div class="flex flex-col px-1">
                  <h3 class="font-headline text-lg font-bold leading-snug group-hover:text-primary transition-colors text-white line-clamp-2" :title="post.title">
                    {{ post.title }}
                  </h3>
                </div>
              </article>
            </div>
            
            <div v-else class="text-center py-20 bg-surface-container rounded-2xl border border-dashed border-outline-variant/50">
              <span class="material-symbols-outlined text-5xl text-on-surface-variant mb-4">article</span>
              <h3 class="font-headline text-xl font-bold text-white mb-2">Chưa có dữ liệu</h3>
              <p class="text-on-surface-variant text-sm">Chưa có bài viết nào thuộc chuyên mục này.</p>
            </div>

            <div v-if="filteredNews.length > 0 && visibleCount < filteredNews.length" class="mt-12 flex justify-center">
              <button @click = "loadMore" class="px-10 py-3 border border-outline-variant hover:border-primary text-white hover:text-primary font-headline font-bold text-[11px] tracking-[0.2em] uppercase rounded-lg transition-all">
                Tải thêm bài viết
              </button>
            </div>
          </div>

          <aside class="lg:col-span-4 space-y-10">
            <div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30">
              <h4 class="font-headline font-bold text-sm tracking-widest uppercase text-white mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-xl">auto_graph</span>
                Đọc Nhiều Nhất
              </h4>
              <div class="space-y-6">
                <div v-for="(post, index) in popularNews" :key="post.id" @click="router.push(`/news/${post.id}`)" class="flex gap-4 group cursor-pointer">
                  <span class="text-4xl font-headline font-black text-outline-variant/50 group-hover:text-primary/30 transition-colors">0{{ index + 1 }}</span>
                  <div>
                    <h5 class="font-headline font-bold text-sm text-white group-hover:text-primary transition-colors leading-snug mb-1 line-clamp-2">{{ post.title }}</h5>
                    <span class="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{{ post.date }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30">
              <h4 class="font-headline font-bold text-sm tracking-widest uppercase text-white mb-6">Thẻ Phổ Biến</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in trendingTags" :key="tag" class="px-3 py-1.5 bg-background border border-outline-variant/50 text-on-surface-variant text-[10px] font-bold tracking-widest uppercase rounded cursor-pointer hover:border-primary hover:text-primary transition-colors">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';

const router = useRouter();

// 1. KHỞI TẠO CÁC BIẾN CHỨA DỮ LIỆU RỖNG
const heroNews = ref({});         // Khu vực 1: Bài to nhất trên cùng
const trendingNews = ref([]);     // Khu vực 2: Băng chuyền trượt ngang
const mainArticles = ref([]);     // Khu vực 3: Danh sách bài viết chính (Cột trái)
const popularNews = ref([]);      // Khu vực 4: Sidebar Đọc nhiều nhất (Cột phải)

const categories = ['Tất cả', 'Gundam', 'Anime Figure', 'Mecha & Robot', 'Thị trường'];
const activeCategory = ref('Tất cả');
const trendingTags = ['Bandai', 'GoodSmile', 'Metal_Build', 'Pre_Order', 'Unboxing', 'Cyberpunk', 'Gundam_Seed'];

const itemsPerPage = 6;
const visibleCount = ref(itemsPerPage);

const loadMore = () => {
  visibleCount.value += itemsPerPage;
};

watch(activeCategory, () => {
  visibleCount.value = itemsPerPage;
});

const formatTitle = (rawTitle) => {
  if (!rawTitle) return '';
  if (rawTitle.includes(':')) {
    const parts = rawTitle.split(':');
    return `${parts[0]}:<br><span class="text-primary">${parts.slice(1).join(':').trim()}</span>`;
  }
  
  if (rawTitle.includes(' - ')) {
    const parts = rawTitle.split(' - ');
    return `${parts[0]}<br><span class="text-primary">${parts.slice(1).join(' - ').trim()}</span>`;
  }
  return rawTitle;
};
// 2. HÀM FETCH DỮ LIỆU TỪ BACKEND VÀ "CHIA BÀI"
const fetchNewsData = async () => {
  try {
    // Gọi API (Giả sử API này trả về đủ 3 mảng: latest, trending, popular)
    const response = await fetch('http://localhost:3000/api/news');
    const data = await response.json();
    
    if (response.ok) {
      // BƯỚC 1: XỬ LÝ DANH SÁCH BÀI MỚI NHẤT (latestList)
      const allLatest = data.latestList.map(item => ({
        id: item.MaTT,
        title: item.TieuDe,
        titleHtml: formatTitle(item.TieuDe),
        summary: item.TomTat,
        category: item.TheLoai,
        date: new Date(item.NgayDang).toLocaleDateString('vi-VN'),
        readTime: 5, 
        image: item.AnhDaiDien
      }));

      // KHU VỰC 1 (HERO): Bốc bài viết MỚI NHẤT (vị trí số 0) để đưa lên Banner to nhất
      if (allLatest.length > 0) {
        heroNews.value = allLatest[0];
      }

      // KHU VỰC 3 (MAIN LIST): Lấy phần còn lại (từ vị trí số 1 trở đi) để đưa xuống danh sách bên dưới, tránh hiển thị trùng bài Banner
      mainArticles.value = allLatest.slice(1);

      // KHU VỰC 2 (TRENDING): Gắn thẳng vào biến trendingNews
      trendingNews.value = data.trendingList.map(item => ({
        id: item.MaTT,
        title: item.TieuDe,
        category: item.TheLoai,
        image: item.AnhDaiDien
      }));

      // KHU VỰC 4 (POPULAR): Gắn vào sidebar Đọc nhiều nhất
      popularNews.value = data.popularList.map(item => ({
        id: item.MaTT,
        title: item.TieuDe,
        date: new Date(item.NgayDang).toLocaleDateString('vi-VN')
      }));
    }
  } catch (error) {
    console.error("Lỗi khi tải tin tức:", error);
  }
};

// 3. LOGIC LỌC BÀI VIẾT BÊN TRONG MAIN LIST
const filteredNews = computed(() => {
  if (activeCategory.value === 'Tất cả') return mainArticles.value;
  return mainArticles.value.filter(post => post.category === activeCategory.value);
});

const displayNews = computed(() => {
  return filteredNews.value.slice(0, visibleCount.value);
});
// Gọi hàm ngay khi mở trang
onMounted(() => {
  fetchNewsData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.neon-glow { box-shadow: 0 0 20px rgba(255, 61, 0, 0.4); }
</style>