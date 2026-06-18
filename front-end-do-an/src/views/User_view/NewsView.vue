<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
    <TheHeader />

    <main class="flex-1">
      <section v-if="heroNews.id" class="relative w-full h-[55vh] sm:h-[60vh] md:h-[85vh] min-h-[380px] md:min-h-[500px] overflow-hidden">
        <div class="absolute inset-0">
          <img :src="heroNews.image" :alt="heroNews.title" class="w-full h-full object-cover object-[center_10%] md:object-center" />
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        </div>
        <div class="relative z-10 h-full flex flex-col justify-end max-w-7xl mx-auto px-6 pb-10 md:pb-20">
          <div class="flex items-center space-x-3 mb-4">
            <span class="px-3 py-1 bg-primary border border-primary text-black text-[10px] font-black tracking-[0.2em] uppercase rounded shadow-[0_0_15px_rgba(255,61,0,0.5)]">
              {{ heroNews.category }}
            </span>
            <span class="text-on-surface-variant text-xs font-bold tracking-widest uppercase">• {{ heroNews.readTime }} phút đọc</span>
          </div>
          <h1 class="font-headline text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black italic tracking-tighter text-on-surface dark:text-white leading-tight mb-4 md:mb-6 uppercase max-w-4xl" v-html="heroNews.titleHtml"></h1>
          <p class="font-body text-sm md:text-lg text-on-surface-variant max-w-2xl mb-6 md:mb-8 leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
            {{ heroNews.summary }}
          </p>
          <div>
            <button @click="router.push(`/news/${heroNews.id}`)" class="px-8 py-3.5 bg-primary text-white dark:text-black font-headline font-black tracking-widest rounded-lg hover:text-on-surface dark:hover:text-white transition-all neon-glow flex items-center group uppercase text-sm">
              Đọc Bài Viết
              <span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      <section class="py-12 bg-background overflow-hidden">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex items-end justify-between mb-8">
            <h2 class="text-2xl font-headline font-black tracking-tight text-on-surface dark:text-white uppercase flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
              Đang Thịnh Hành
            </h2>
          </div>
          
          <div class="flex space-x-6 overflow-x-auto hide-scrollbar pb-6 -mx-6 px-6 snap-x">
            <div v-for="item in trendingNews" :key="item.id" @click="router.push(`/news/${item.id}`)" class="snap-start min-w-[280px] sm:min-w-[300px] h-[280px] sm:h-[350px] group relative rounded-2xl overflow-hidden cursor-pointer border border-outline-variant/30 hover:border-primary/50 transition-colors">
              <img :src="item.image" :alt="item.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
              <div class="absolute bottom-6 left-6 right-6">
                <span class="text-primary text-[10px] font-black uppercase tracking-widest mb-2 block">{{ item.category }}</span>
                <h4 class="font-headline font-bold text-lg leading-tight text-on-surface dark:text-white group-hover:text-primary transition-colors">{{ item.title }}</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-12 max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">       
          <div class="lg:col-span-8">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-outline-variant/30">
              <div class="w-full relative">
                <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 snap-x scroll-smooth">
                  <button 
                    v-for="tab in categories" :key="tab"
                    @click="activeCategory = tab"
                    :class="[
                      'snap-start shrink-0 px-5 py-2 rounded-lg font-headline font-bold text-[11px] tracking-widest uppercase transition-all',
                      activeCategory === tab 
                        ? 'bg-primary text-white dark:text-black shadow-[0_0_10px_rgba(255,61,0,0.3)]' 
                        : 'bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-on-surface dark:text-white'
                    ]"
                  >
                    {{ tab }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredNews.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <article v-for="post in displayNews" :key="post.id" @click="router.push(`/news/${post.id}`)"
                       class="group flex flex-col cursor-pointer relative mt-4">
                
                <div class="relative w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-primary/20 group-hover:shadow-lg transition-all duration-300 border border-outline-variant/20 group-hover:border-primary/50">
                  <img :src="post.image" :alt="post.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>

                  <div class="absolute top-4 bottom-4 left-4 right-4 border-y border-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center z-10 pointer-events-none opacity-80"></div>
                  <div class="absolute top-4 bottom-4 left-4 right-4 border-x border-white scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center z-10 pointer-events-none opacity-80"></div>

                  <div class="absolute top-3 right-3 z-20">
                    <span class="bg-background/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded text-on-surface dark:text-white border border-white/10">
                      {{ post.category }}
                    </span>
                  </div>
                </div>
                <div class="absolute top-2 -left-1.5 bg-primary text-on-primary-fixed flex flex-col items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-br-2xl shadow-lg z-10">
                  <span class="text-lg sm:text-xl font-headline font-black leading-none mb-1">{{ post.date.split('/')[0] }}</span>
                  <span class="text-[9px] sm:text-[10px] font-bold leading-none opacity-90 whitespace-nowrap">{{ post.date.split('/')[1] }}/{{ post.date.split('/')[2] }}</span>
                  <div class="absolute top-full left-0 w-0 h-0 border-t-[8px] border-l-[8px] border-l-transparent border-t-[#cc3200]"></div>
                </div>
                <div class="flex flex-col px-1">
                  <h3 class="font-headline text-lg font-bold leading-snug group-hover:text-primary transition-colors text-on-surface dark:text-white line-clamp-2" :title="post.title">
                    {{ post.title }}
                  </h3>
                </div>
              </article>
            </div>
            
            <div v-else-if="!isLoading" class="text-center py-20 bg-surface-container rounded-2xl border border-dashed border-outline-variant/50">
              <span class="material-symbols-outlined text-5xl text-on-surface-variant mb-4">article</span>
              <h3 class="font-headline text-xl font-bold text-on-surface dark:text-white mb-2">Chưa có dữ liệu</h3>
              <p class="text-on-surface-variant text-sm">Chưa có bài viết nào thuộc chuyên mục này.</p>
            </div>

            <div v-if="newsList.length < totalItems" class="flex justify-center mt-12 pb-8">
              <button @click="loadMore" :disabled="isFetchingMore" 
                      class="px-8 py-3.5 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(255,61,0,0.15)] hover:shadow-[0_0_25px_rgba(255,61,0,0.35)] active:scale-95 disabled:opacity-50 disabled:cursor-wait flex items-center gap-2">
                <span v-if="isFetchingMore" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                {{ isFetchingMore ? 'Đang lấy dữ liệu...' : 'Tải thêm bài viết' }}
              </button>
            </div>
          </div>

          <aside class="lg:col-span-4 space-y-10">
            <div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30">
              <h4 class="font-headline font-bold text-sm tracking-widest uppercase text-on-surface dark:text-white mb-6 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-xl">auto_graph</span>
                Đọc Nhiều Nhất
              </h4>
              <div class="space-y-6">
                <div v-for="(post, index) in popularNews" :key="post.id" @click="router.push(`/news/${post.id}`)" class="flex gap-4 group cursor-pointer">
                  <span class="text-4xl font-headline font-black text-outline dark:text-outline-variant/50 group-hover:text-primary/30 transition-colors">0{{ index + 1 }}</span>
                  <div>
                    <h5 class="font-headline font-bold text-sm text-on-surface dark:text-white group-hover:text-primary transition-colors leading-snug mb-1 line-clamp-2">{{ post.title }}</h5>
                    <span class="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{{ post.date }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30">
              <h4 class="font-headline font-bold text-sm tracking-widest uppercase text-on-surface dark:text-white mb-6">Thẻ Phổ Biến</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in trendingTags" :key="tag" 
                  @click="activeTag = activeTag === tag ? '' : tag"
                  :class="[
                    'px-3 py-1.5 border text-[10px] font-bold tracking-widest uppercase rounded cursor-pointer transition-all',
                    activeTag === tag 
                      ? 'bg-primary text-white dark:text-black border-primary shadow-[0_0_10px_rgba(255,143,115,0.4)]' 
                      : 'bg-background border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary'
                  ]"
                >
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
  import { useRoute, useRouter } from 'vue-router';
  import TheHeader from '@/components/TheHeader.vue';

  const route = useRoute();
  const router = useRouter();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
       
  const trendingNews = ref([]);     // Khu vực 2: Băng chuyền trượt ngang
  const allArticles = ref([]);     // Khu vực 3: Danh sách bài viết chính (Cột trái)
  const popularNews = ref([]);      // Khu vực 4: Sidebar Đọc nhiều nhất (Cột phải)
  const newsList = ref([]);

  const categories = ref(['Tất cả']);
  const activeCategory = ref('Tất cả');
  const trendingTags = ref([]);
  const activeTag = ref('');

  const itemsPerPage = 6;
  const visibleCount = ref(itemsPerPage);
  const isLoading = ref(true);

  const currentPage = ref(1);
  const limit = ref(5);
  const totalItems = ref(0);
  const isFetchingMore = ref(false);

  

  watch(activeCategory, () => {
    visibleCount.value = itemsPerPage;
  });

  const heroNews = computed(() => {
    if (activeCategory.value === 'Tất cả' && !activeTag.value && newsList.value.length > 0) {
      return newsList.value[0];
    }
    return {};
  });// Khu vực 1: Bài to nhất trên cùng

  const getImageUrl = (image) => {
    if (!image) return 'https://pbs.twimg.com/media/G1hCMJkaoAIsIEi.jpg';
    return image.startsWith('http') ? image : `${API_BASE_URL}/Images_news/${image}`;
  };

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

  const formatNewsItem = (item) => ({
    id: item.MaTT,
    title: item.TieuDe,
    excerpt: item.TomTat,
    category: item.TheLoai,
    image: item.AnhThumbnail 
      ? (item.AnhThumbnail.startsWith('http') ? item.AnhThumbnail : `${API_BASE_URL}/Images_news/${item.AnhThumbnail}`) 
      : 'https://placehold.co/600x400/1a1a1a/ffffff?text=No+Image',
    date: item.NgayDang ? new Date(item.NgayDang).toLocaleDateString('vi-VN') : '',
    readTime: item.ThoiGianDoc ? `${item.ThoiGianDoc} phút` : '1 phút',
    author: item.TacGia || 'FigureCollect',
    views: item.LuotXem || 0
  });

  // --- 2. CẬP NHẬT LẠI HÀM FETCH ĐỂ SỬ DỤNG BỘ CHUYỂN ĐỔI ---
  const fetchNewsData = async (isLoadMore = false) => {
    if (isLoadMore) isFetchingMore.value = true;
    try {
      let url = `${API_BASE_URL}/api/news?page=${currentPage.value}&limit=${limit.value}`;
      
      if (activeCategory.value && activeCategory.value !== 'Tất cả') {
        url += `&category=${encodeURIComponent(activeCategory.value)}`;
      }
      if (activeTag.value) {
        url += `&tag=${encodeURIComponent(activeTag.value)}`;
      }

      const res = await fetch(url);
      const result = await res.json();

      if (result.success) {
        // Chạy dữ liệu qua hàm formatNewsItem trước khi gán
        const mappedLatest = result.latestList.map(formatNewsItem);
        
        if (isLoadMore) {
          newsList.value.push(...mappedLatest);
        } else {
          newsList.value = mappedLatest;
          
          if (result.trendingList && result.trendingList.length > 0) {
            trendingNews.value = result.trendingList.map(formatNewsItem);
          }
          if (result.popularList && result.popularList.length > 0) {
            popularNews.value = result.popularList.map(formatNewsItem);
          }
        }
        totalItems.value = result.pagination.totalItems;
      }
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
    } finally {
      isFetchingMore.value = false;
    }
  };

  const loadMore = () => {
    currentPage.value++;
    fetchNewsData(true);
  };

  // 3. LOGIC LỌC BÀI VIẾT BÊN TRONG MAIN LIST
  const filteredNews = computed(() => {
    let result = allArticles.value;  
    if (activeCategory.value !== 'Tất cả') {
      result = result.filter(post => post.category === activeCategory.value);
    }
    if (activeTag.value) {
      result = result.filter(post => post.tags && post.tags.includes(activeTag.value));
    }
    if (activeCategory.value === 'Tất cả' && !activeTag.value && result.length > 0) {
      return result.slice(1);
    }
    return result;
  });

  watch([activeCategory, activeTag], () => {
    currentPage.value = 1;
    fetchNewsData();
  });

  const displayNews = computed(() => {
    if (activeCategory.value === 'Tất cả' && !activeTag.value && newsList.value.length > 0) {
      return newsList.value.slice(1); 
    }
    return newsList.value;
  });

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
    scrollToTopCustom();
    document.title = "Tin tức & Đánh giá Mô hình | FigureCollect";
    fetchNewsData().then(() => {
      if (route.query.tag) {
        activeTag.value = route.query.tag; 
        setTimeout(() => {
          window.scrollTo({ top: 1200, behavior: 'smooth' });
        }, 100);
      }
    });
  });
</script>

<style scoped>
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .neon-glow { box-shadow: 0 0 20px rgba(255, 61, 0, 0.4); }
</style>