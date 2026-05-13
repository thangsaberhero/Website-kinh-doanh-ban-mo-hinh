<template>
  <div class="fixed top-0 left-0 h-1 bg-[#ff8f73] z-[100] transition-all duration-150 shadow-[0_0_10px_rgba(255,143,115,0.8)]" 
    :style="{ width: readingProgress + '%' }">
  </div>

  <div class="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
    <main class="flex-1 relative py-12 lg:py-20">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div v-if="isLoading" class="max-w-4xl mx-auto px-6 animate-pulse">
        <div class="h-6 w-32 bg-surface-container-highest rounded-full mx-auto mb-6"></div>
        <div class="h-16 w-3/4 bg-surface-container-highest rounded-xl mx-auto mb-8"></div>
        <div class="h-[300px] md:h-[500px] w-full bg-surface-container-high rounded-3xl mb-12"></div>
        <div class="space-y-4 max-w-3xl mx-auto">
          <div class="h-4 bg-surface-container-highest rounded w-full"></div>
          <div class="h-4 bg-surface-container-highest rounded w-5/6"></div>
        </div>
      </div>
  
      <article v-else-if="article" class="max-w-4xl mx-auto px-6 relative z-10">      
        <header class="mb-12 text-center max-w-3xl mx-auto">
          <span class="inline-block py-1.5 px-4 rounded bg-primary text-black font-headline font-black text-[10px] tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(255,143,115,0.3)]">
            {{ article.TheLoai }}
          </span>
          
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-headline font-black text-white leading-[1.15] tracking-tighter mb-8 italic uppercase">
            {{ article.TieuDe }}
          </h1>
          
          <div class="flex flex-wrap items-center justify-center gap-6 text-sm font-headline tracking-wider text-on-surface-variant">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
                <img :src="`https://ui-avatars.com/api/?name=${article.TacGia || 'Admin'}&background=192540&color=ff8f73`" alt="Avatar">
              </div>
              <span class="text-white font-bold">{{ article.TacGia || 'Admin' }}</span>
            </div>
            <div class="h-4 w-px bg-outline-variant/30 hidden sm:block"></div>
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-primary">calendar_today</span> 
              {{ formatDate(article.NgayDang) }}
            </span>
            <div class="h-4 w-px bg-outline-variant/30 hidden sm:block"></div>
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-primary">visibility</span> 
              {{ article.LuotXem }} lượt xem
            </span>
          </div>
        </header>
  
        <figure v-if="article.Thumbnail" class="w-full h-[300px] md:h-[550px] rounded-[2rem] overflow-hidden border border-outline-variant/20 shadow-2xl mb-16 relative">
          <img :src="article.Thumbnail" :alt="article.TieuDe" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
        </figure>
  
        <div class="max-w-3xl mx-auto">
          <div class="news-content text-lg leading-relaxed text-on-surface" v-html="article.NoiDung"></div>
        </div>

        <div class="max-w-3xl mx-auto mt-12 pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-3">
            <span class="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-wider mr-2">Tags: </span> 
            <span class="px-3 py-1.5 bg-surface-container-highest border border-outline-variant/50 text-on-surface-variant text-[12px] font-bold tracking-widest uppercase rounded hover:border-primary hover:text-primary transition-colors cursor-pointer">
              #{{ article.TheLoai }}
            </span>
            <span class="px-3 py-1.5 bg-surface-container-highest border border-outline-variant/50 text-on-surface-variant text-[12px] font-bold tracking-widest uppercase rounded hover:border-primary hover:text-primary transition-colors cursor-pointer">
              #Gundam_Models
            </span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-wider mr-2">Chia sẻ:</span>            
            <button @click="shareFacebook" class="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all" title="Chia sẻ lên Facebook">
              <span class="material-symbols-outlined text-[18px]">share</span>
            </button>              
            <button @click="copyLink" class="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant/50 hover:bg-primary hover:text-black hover:border-primary flex items-center justify-center transition-all" :title="copied ? 'Đã copy!' : 'Copy Link'">
              <span class="material-symbols-outlined text-[18px]" :class="{'text-emerald-500': copied}">
                {{ copied ? 'check' : 'link' }}
              </span>
            </button>
          </div>
        </div>

        <section v-if="relatedNews.length > 0" class="max-w-4xl mx-auto mt-24 border-t border-outline-variant/30 pt-16 relative z-10">
          <div class="flex items-center gap-4 mb-8">
            <div class="h-8 w-1.5 bg-primary rounded-full"></div>
            <h3 class="text-2xl font-headline font-black text-white uppercase italic tracking-wider">Tin tức cùng chuyên mục</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="item in relatedNews" :key="item.MaTT" 
                  @click="router.push(`/news/${item.MaTT}`)"
                  class="group cursor-pointer bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,143,115,0.15)] transition-all duration-300 flex flex-col h-full">
                  
                  <div class="h-48 w-full overflow-hidden relative">
                      <img :src="item.AnhDaiDien" :alt="item.TieuDe" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                      <div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                  </div>
                  
                  <div class="p-5 flex flex-col flex-1">
                      <h4 class="text-white font-headline font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {{ item.TieuDe }}
                      </h4>
                      
                      <div class="mt-auto flex items-center justify-between text-xs text-on-surface-variant font-medium">
                          <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px]">calendar_today</span> 
                          {{ formatDate(item.NgayDang) }}
                          </span>
                          <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px]">visibility</span> 
                          {{ item.LuotXem }}
                          </span>
                      </div>
                  </div>
              </div>
          </div>
        </section>
      </article>
  
      <div v-else class="text-center py-32">
        <span class="material-symbols-outlined text-7xl text-outline-variant mb-6">article_shortcut</span>
        <h2 class="text-2xl font-headline font-black text-white uppercase italic tracking-tighter">Bài viết đã chìm vào hư không</h2>
        <button @click="router.push('/news')" class="mt-8 px-8 py-3 bg-primary text-black font-headline font-black tracking-widest rounded-lg hover:bg-white transition-all uppercase text-sm">
          Quay lại trang tin tức
        </button>
      </div>
  
    </main>
  </div>
  <button 
    @click="router.push('/news')" 
    class="fixed top-[80px] left-8 bg-white border border-slate-200 text-slate-600 hover:text-[#ff8f73] hover:border-[#ff8f73] hover:shadow-lg hover:-translate-y-1 transition-all w-12 h-12 rounded-full flex items-center justify-center shadow-md z-40"
    title="Quay lại danh sách tin tức"
  >
    <span class="material-symbols-outlined">arrow_back</span>
  </button>
  <Transition name="fade">
    <button 
      v-show="showScrollTop" 
      @click="scrollToTop" 
      class="fixed bottom-[100px] right-8 bg-primary text-black hover:bg-white hover:scale-110 transition-all duration-300 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,143,115,0.4)] z-50"
      title="Cuộn lên đầu trang"
    >
      <span class="material-symbols-outlined text-[24px]">keyboard_arrow_up</span>
    </button>
  </Transition>
</template>
    
<script setup>
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast';
  
  const route = useRoute();
  const router = useRouter();
  const toastStore = useToastStore();
  const article = ref(null);
  const isLoading = ref(true);
  
  const postId = ref(route.params.id);
  const relatedNews = ref([]);
  const showScrollTop = ref(false);
  const copied = ref(false);
  const readingProgress = ref(0);

  const updateProgress = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    readingProgress.value = (winScroll / height) * 100;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/news/${postId.value}`);
      const result = await response.json();
  
      if (response.ok && result.data) {
        console.log(result.data);
        article.value = result.data;
        document.title = `${article.value.TieuDe} | FigureCollect`;
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const incrementViewCount = async() => {
    const storageKey = `viewed_post_${postId.value}`;

    if(!sessionStorage.getItem(storageKey)){
        try{
          const response = await fetch(`http://localhost:3000/api/news/${postId.value}/view`, {
            method: 'PATCH'
          });
          if(response.ok){
            sessionStorage.setItem(storageKey, 'true');
            if(article.value){
                article.value.LuotXem++;
            }
          }
        }
        catch(error){
          console.error("Không thể cập nhật lượt xem: ", error);
        }
    }
  }

  const fetchRelatedNews = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/news/${postId.value}/related`);
      const result = await response.json();
      if (response.ok) {
          relatedNews.value = result.data;
      }
    } catch (error) {
      console.error("Lỗi tải tin liên quan:", error);
    }
  };

  const checkScroll = () => {
    showScrollTop.value = window.scrollY > 400; 
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied.value = true;
      toastStore.showToast('Đã sao chép liên kết bài viết', 'success');
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Lỗi khi sao chép: ', err);
    }
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  // Theo dõi nếu ID trên URL thay đổi (Do click vào tin liên quan)
  // Thì phải bắt nó cuộn lên đầu trang và load lại data mới
  watch(() => route.params.id, (newId) => {
    if (newId) {
      isLoading.value = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Gọi lại 2 API với ID mới
      postId.value = newId; 
      fetchArticle(); 
      fetchRelatedNews(newId);
      incrementViewCount();
    }
  });
  onMounted(() => {
    fetchArticle();
    fetchRelatedNews();
    incrementViewCount();
    window.addEventListener('scroll', () => {
      checkScroll();
      updateProgress();
    });
  });
  onUnmounted(() => {
    window.removeEventListener('scroll', () => {
      checkScroll();
      updateProgress();
    });
    document.title = "Figure Collect";
  });
</script>
    
<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&display=swap');
  
  .font-headline { font-family: 'Space Grotesk', sans-serif; }
  .font-body { font-family: 'Manrope', sans-serif; }
  
  /* XỬ LÝ NỘI DUNG TỪ TINYMCE ĐỂ ĐỒNG BỘ DARK THEME */
  .news-content :deep(p) {
    margin-bottom: 1.75rem;
    line-height: 1.8;
    color: #c5d1e8; /* text-on-surface-variant */
  }
  
  .news-content :deep(h2), 
  .news-content :deep(h3) {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    color: #ffffff;
    margin-top: 3rem;
    margin-bottom: 1.25rem;
    text-transform: uppercase;
    font-style: italic;
    letter-spacing: -0.025em;
  }
  
  .news-content :deep(h2) { font-size: 2.25rem; }
  .news-content :deep(h3) { font-size: 1.75rem; }
  
  .news-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 1.5rem;
    margin: 3rem auto;
    display: block;
    border: 1px solid rgba(255, 143, 115, 0.2);
    box-shadow: 0 0 30px rgba(255, 143, 115, 0.05);
  }
  
  .news-content :deep(a) {
    color: #ff8f73; /* primary */
    text-decoration: none;
    font-weight: 700;
    border-bottom: 1px solid rgba(255, 143, 115, 0.3);
    transition: all 0.3s ease;
  }
  
  .news-content :deep(a:hover) {
    color: #ffffff;
    border-bottom-color: #ffffff;
  }
  
  .news-content :deep(ul), 
  .news-content :deep(ol) {
    margin-left: 1.5rem;
    margin-bottom: 2rem;
    color: #c5d1e8;
  }
  
  .news-content :deep(blockquote) {
    border-left: 4px solid #ff8f73;
    background: rgba(25, 37, 64, 0.5);
    padding: 1.5rem 2rem;
    border-radius: 0 1rem 1rem 0;
    margin: 3rem 0;
    font-style: italic;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>