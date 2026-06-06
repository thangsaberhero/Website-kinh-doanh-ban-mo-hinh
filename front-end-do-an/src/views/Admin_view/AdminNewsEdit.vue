<template>
  <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 h-screen overflow-hidden font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>

    <div class="flex-1 flex flex-col h-screen w-full relative">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      
      <div class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-4">
          <button @click="router.push('/admin/news')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all" title="Quay lại">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 class="text-lg font-bold text-slate-900 uppercase">Chỉnh sửa nội dung bài viết</h1>
            <p class="text-xs text-slate-500 font-medium">Sáng tạo nội dung cộng đồng</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="submitPost('Bản nháp')" class="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">save</span> Lưu nháp
          </button>
          <button @click="submitPost('Đã duyệt')" class="px-6 py-2.5 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">publish</span> Chỉnh sửa bài viết
          </button>
        </div>
      </div>

      <main class="flex-1 overflow-y-auto p-8 custom-scrollbar pb-24">      
        <div class="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">       
          <div class="flex-1 flex flex-col gap-6">         
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 transition-all focus-within:border-[#ff8f73] focus-within:ring-4 focus-within:ring-[#ff8f73]/10">
              <input 
                v-model="postData.title" 
                type="text" 
                placeholder="Nhập tiêu đề bài viết ở đây ..." 
                class="w-full bg-transparent px-6 py-4 text-2xl font-bold text-slate-900 placeholder:text-slate-300 outline-none"
              >
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
              <Editor
                api-key="m7ecn07md9z34y1l3o6ekspbur4e52910tsvii43ieymhdx1"
                v-model="postData.content"
                :init="editorConfig"
              />     
            </div>
          </div>

          <div class="w-full xl:w-80 flex flex-col gap-6 shrink-0">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 class="font-bold text-slate-900 mb-4 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73] text-[18px]">category</span> Chuyên mục
              </h3>
              
              <div class="relative">
                <input 
                  v-model="postData.category" 
                  @focus="showCategoryDropdown = true"
                  @blur="showCategoryDropdown = false"
                  placeholder="Chọn hoặc nhập chuyên mục mới..."
                  class="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none transition-transform" :class="{ 'rotate-180': showCategoryDropdown }">
                  expand_more
                </span>

                <Transition name="fade-slide">
                  <ul v-if="showCategoryDropdown" class="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar overflow-hidden py-1">
                    <li 
                      v-for="cat in filteredCategories" 
                      :key="cat"
                      @mousedown.prevent="selectCategory(cat)"
                      class="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-[#ff8f73]/10 hover:text-[#ff8f73] cursor-pointer transition-colors flex items-center justify-between"
                    >
                      {{ cat }}
                      <span v-if="postData.category === cat" class="material-symbols-outlined text-[16px] text-[#ff8f73]">check</span>
                    </li>
                    <li v-if="filteredCategories.length === 0" class="px-4 py-2.5 text-sm text-slate-400 italic">
                      Chưa có chuyên mục nào
                    </li>
                  </ul>
                </Transition>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 class="font-bold text-slate-900 mb-4 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73] text-[18px]">image</span> Ảnh đại diện (Thumbnail)
              </h3>
              
              <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleFileUpload">
              
              <div @click="triggerFileInput" class="border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group relative overflow-hidden" :class="postData.thumbnail ? 'border-transparent p-0' : 'border-slate-300 hover:border-[#ff8f73] hover:bg-[#ff8f73]/5 bg-slate-50'">
                <template v-if="!postData.thumbnail">
                  <span class="material-symbols-outlined text-4xl text-slate-300 group-hover:text-[#ff8f73] mb-1 transition-colors">add_photo_alternate</span>
                  <span class="text-xs font-bold text-slate-500 group-hover:text-[#ff8f73]">Click để tải ảnh lên</span>
                  <span class="text-[10px] text-slate-400">Tỷ lệ 16:9 (1280x720px)</span>
                </template>
                <template v-else>
                  <img :src="postData.thumbnail" class="w-full h-full object-cover">
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button @click.stop="removeThumbnail" class="p-2 bg-white rounded-lg text-slate-700 hover:text-rose-500 shadow-lg"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                </template>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 class="font-bold text-slate-900 mb-4 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73] text-[18px]">manage_search</span> Tóm tắt bài viết 
              </h3>
              <textarea 
                v-model="postData.summary"
                maxlength="180"
                placeholder="Nhập đoạn tóm tắt ngắn để hiển thị ngoài trang chủ..." 
                class="w-full h-40 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 transition-all resize-none bg-slate-50 focus:bg-white"
              ></textarea>
              <p class="text-[10px] font-bold mt-2 text-right transition-colors" :class="postData.summary.length >= 150 ? 'text-rose-500' : 'text-slate-400'">
                {{ postData.summary.length }}/180 ký tự
              </p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 class="font-bold text-slate-900 mb-4 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73] text-[18px]">tag</span> Tags bài viết
              </h3>
              <input 
                v-model="postData.tags" 
                placeholder="VD: Bandai, GoodSmile, Gundam (Cách nhau bằng dấu phẩy)" 
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all bg-slate-50"
              >
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
  import Editor from '@tinymce/tinymce-vue';
  
  const route = useRoute();
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  const postId = route.params.id;

  const thumbnailFile = ref(null);
  const isLoading = ref(false);
  const existingCategories = ref(['Review', 'Tin tức', 'Mẹo vặt']);
  const showCategoryDropdown = ref(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const postData = ref({
    title: '',
    content: '', 
    category: 'Review',
    summary: '',
    thumbnail: null,
    tags: ''
  });
  
  const editorConfig = {
    height: 750,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'image media link | removeformat | fullscreen',
    content_style: 'body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #334155; } img { max-width: 100%; height: auto; border-radius: 8px; }',
    
    // HÀM XỬ LÝ UPLOAD ẢNH BÊN TRONG BÀI VIẾT 
    images_upload_handler: async (blobInfo, progress) => {
      return new Promise(async(resolve, reject) => {
        try{
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', blobInfo.blob(), blobInfo.filename());
    
            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`},
                body: formData
            });
            const result = await response.json();

            if(response.ok){
                resolve(result.location);
            }
            else{
                reject('Lỗi từ server: ' + result.message);
            }
        }catch(error){
            reject('Lỗi khổng thể tải ảnh lên: ' + error.message);
        }
      });
    }
  };
  
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch('${API_BASE_URL}/api/news',{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const data = await response.json();
      if (response.ok && data.latestList) {
        const allCategories = data.latestList.map(item => item.TheLoai);
        existingCategories.value = [...new Set(allCategories)];
      }
    } catch (error) {
      console.error("Lỗi tải danh sách chuyên mục:", error);
    }
  };

  const fetchPostDetail = async () =>{
    isLoading.value = true;
    try{
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/news/${postId}`,{
          headers: {'Authorization': `Bearer ${token}`}
        });
        const result = await response.json();

        if(response.ok){
            const article = result.data;
            document.title = `Chỉnh sửa: ${article.TieuDe} | Admin - FigureCollect`;
            postData.value = {
                title: article.TieuDe,
                content: article.NoiDung,
                category: article.TheLoai,
                summary: article.TomTat,
                thumbnail: article.AnhThumbnail ? (article.AnhThumbnail.startsWith('http') ? article.AnhThumbnail : `${API_BASE_URL}/Images_news/${article.AnhThumbnail}`) : null,
                tags: article.Tags || ''
            };
        }
    }
    finally{
        isLoading.value = false;
    }
  }

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
    fetchCategories();
    fetchPostDetail();
  });

  const selectCategory = (category) => {
    postData.value.category = category;
    showCategoryDropdown.value = false;
  };

  const filteredCategories = computed(() => {
    if (!postData.value.category) return existingCategories.value;
    return existingCategories.value.filter(cat => 
      cat.toLowerCase().includes(postData.value.category.toLowerCase())
    );
  });
  // Xử lý Upload Ảnh Thumbnail 
  const fileInputRef = ref(null);
  const triggerFileInput = () => {
    if (!postData.value.thumbnail && fileInputRef.value) fileInputRef.value.click();
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file){
        thumbnailFile.value = file;
        postData.value.thumbnail = URL.createObjectURL(file);
    } 
  };
  const removeThumbnail = () => {
    thumbnailFile.value = null;
    postData.value.thumbnail = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
  };
  
  const submitPost = async (status) => {
    if (!postData.value.title) return toastStore.showToast("Vui lòng nhập Tiêu đề bài viết!", "error");
    if (!postData.value.content) return toastStore.showToast("Nội dung bài viết không được để trống!", "error");
    if (!postData.value.category.trim()) return toastStore.showToast("Vui lòng nhập hoặc chọn Chuyên mục!", "error");
    
    // 1. Gói toàn bộ dữ liệu vào FormData
    const formData = new FormData();
    formData.append('TieuDe', postData.value.title);
    formData.append('NoiDung', postData.value.content);
    formData.append('TheLoai', postData.value.category);
    formData.append('TomTat', postData.value.summary);
    formData.append('TrangThai', status); 
    formData.append('Tags', postData.value.tags); 

    if (thumbnailFile.value) {
        formData.append('thumbnail', thumbnailFile.value);
    }

    try {
      const token = localStorage.getItem('token');
        const response = await 
        fetch(`${API_BASE_URL}/api/news/${postId}`, {
            method: 'PUT',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            toastStore.showToast("Cập nhật bài viết thành công!", "success");
            router.push('/admin/news'); 
        } else {
            toastStore.showToast("Lỗi: " + result.message, "error");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật:", error);
        toastStore.showToast("Không thể kết nối đến máy chủ.", "error");
    }
  };
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }
</style>