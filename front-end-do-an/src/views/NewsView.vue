<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
    <TheHeader />

    <main class="flex-1">
      <section class="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
        <div class="absolute inset-0">
          <img :src="heroNews.image" :alt="heroNews.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        </div>
        <div class="relative z-10 h-full flex flex-col justify-end max-w-7xl mx-auto px-6 pb-20">
          <div class="flex items-center space-x-3 mb-4">
            <span class="px-3 py-1 bg-primary border border-primary text-black text-[10px] font-black tracking-[0.2em] uppercase rounded shadow-[0_0_15px_rgba(255,61,0,0.5)]">
              {{ heroNews.tag }}
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
              <article v-for="post in filteredNews" :key="post.id" @click="router.push(`/news/${post.id}`)"
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

            <div v-if="filteredNews.length > 0" class="mt-12 flex justify-center">
              <button class="px-10 py-3 border border-outline-variant hover:border-primary text-white hover:text-primary font-headline font-bold text-[11px] tracking-[0.2em] uppercase rounded-lg transition-all">
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';

const router = useRouter();

// --- MOCK DATA ---
const heroNews = ref({
  id: 1,
  tag: 'Đánh giá chi tiết',
  titleHtml: 'PG Unleashed RX-78-2: <br/><span class="text-primary italic">Đỉnh Cao Cơ Khí</span>',
  summary: 'Bandai đã định nghĩa lại hoàn toàn chuẩn mực của dòng Perfect Grade. Cùng mổ xẻ từng lớp khung xương và cơ chế LED đỉnh cao của huyền thoại này.',
  readTime: 8,
  image: 'https://shopkeycap.com/wp-content/uploads/2021/06/Perfect-Grade-Unleashed-RX-78-2-ft.png'
});

const trendingNews = ref([
{ id: 2, title: 'Top 5 Nendoroid hiếm nhất đang bị săn lùng', category: 'Thị trường', image: 'https://file.hstatic.net/1000231532/file/20220206-choi-nendoroid-sao-cho-dung_nshop-hobby11_d577ca1b2adc48418e80fed2291b7c81.jpg' },
  { id: 3, title: 'Wonder Festival: Tương lai ngành figure', category: 'Sự kiện', image: 'https://i.ytimg.com/vi/Y3BAQabxcTw/maxresdefault.jpg' },
  { id: 4, title: 'Bí quyết bảo quản nhựa PVC không bị chảy nhớt', category: 'Kiến thức', image: 'https://file.hstatic.net/200000462939/article/bao-quan-mo-hinh-pvc_4215ac9e512548edb7ecc62e4337f9ac.jpg' },
  { id: 5, title: 'Xu hướng Figure kim loại (Die-cast) lên ngôi', category: 'Thị trường', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8EdqfhHO1MmqYvBjqyF537FJ0LAeWwQqmEQ&s' },
]);

const mainArticles = ref([
  { id: 6, title: 'Mở hộp Hatsune Miku 1/7 - Digital Future Edition', summary: 'Phiên bản kỷ niệm với hệ thống LED RGB tích hợp dưới chân đế và chi tiết tóc trong suốt tuyệt đẹp từ GoodSmile.', category: 'Anime Figure', date: '26/03/2026', readTime: 5, image: 'https://product.hstatic.net/200000462939/product/4399653_7b748166b9c6458eb8c6a1450c3469f6_master.jpeg' },
  { id: 7, title: 'Nàng Elf Bunny Girl Rabbi – Mỗi đường cong là một cám dỗ', summary: 'Siêu phẩm scale 1/4 từ B-Style đã chính thức cập bến. Đánh giá chi tiết chất liệu lưới tất chân thật và độ hoàn thiện màu sơn.', category: 'Anime Figure', date: '25/03/2026', readTime: 4, image: 'https://pos.nvncdn.com/f625c0-33854/art/20250906_DjoKD7Js.jpeg?v=1757140733' },
  { id: 8, title: 'Metal Build Evangelion EVA-01: Có đáng tiền?', summary: 'Sự kết hợp giữa chất liệu kim loại nặng tay và thiết kế sinh học độc đáo. Liệu đây có phải là bản EVA hoàn hảo nhất?', category: 'Mecha & Robot', date: '20/03/2026', readTime: 7, image: 'https://bizweb.dktcdn.net/100/503/392/products/1-2830abed-41d0-4b6a-a6fc-4b71f827b943.jpg?v=1706807367323' },
  { id: 9, title: 'Phân biệt mô hình thật (Auth) và hàng giả (Bootleg)', summary: 'Hướng dẫn chi tiết cách soi tem seal, màu sơn và khớp nối để không mua phải hàng nhái kém chất lượng trên thị trường.', category: 'Kiến thức', date: '15/03/2026', readTime: 6, image: 'https://khomohinh.com/wp-content/uploads/2023/01/cach-phan-biet-mo-hinh-real-fake-thumb.jpg' },
  { id: 10, title: 'Lịch phát hành mô hình Gundam (Gunpla) Quý 3/2026', summary: 'Tổng hợp danh sách các mẫu MG, RG và HG sắp ra mắt. Đặc biệt chú ý siêu phẩm MGEX Strike Freedom.', category: 'Gundam', date: '10/03/2026', readTime: 3, image: 'https://preview.redd.it/hg-1-144-tx-ff104-gundam-alyzeus-announced-release-date-v0-ive5786le2hg1.jpeg?width=640&crop=smart&auto=webp&s=066fda75065791f116de60557f3afa720aeecef9' },
]);

const popularNews = ref([
  { id: 11, title: 'Cách setup tủ trưng bày LED chuẩn bảo tàng mini', date: '01/03/2026' },
  { id: 12, title: 'Tại sao mô hình cũ (Rare) lại có giá trên trời?', date: '28/02/2026' },
  { id: 13, title: 'Top 10 hãng sản xuất mô hình uy tín nhất thế giới', date: '20/02/2026' },
]);

const trendingTags = ['Bandai', 'GoodSmile', 'Metal_Build', 'Pre_Order', 'Unboxing', 'Cyberpunk', 'Gundam_Seed'];

// --- LOGIC LỌC ---
const categories = ['Tất cả', 'Gundam', 'Anime Figure', 'Mecha & Robot', 'Thị trường'];
const activeCategory = ref('Tất cả');

const filteredNews = computed(() => {
  if (activeCategory.value === 'Tất cả') return mainArticles.value;
  return mainArticles.value.filter(post => post.category === activeCategory.value);
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