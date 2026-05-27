<template>
  <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>

    <div class="flex-1 flex flex-col min-h-screen overflow-hidden w-full relative">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-24">
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý tin tức</h1>
            <p class="text-slate-500 text-sm font-medium max-w-xl">Hệ thống biên tập và lưu trữ nội dung cộng đồng dành riêng cho những người đam mê mô hình.</p>
          </div>
          
          <div class="flex gap-3">
            <button @click="goToCreatePost" class="flex-none bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all active:scale-95 text-sm uppercase tracking-wider">
              <span class="material-symbols-outlined text-[20px]">edit_document</span>
              Thêm bài viết mới
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-[#ff8f73] border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Tổng bài viết</p>
            <h3 class="text-3xl font-brand font-bold text-slate-900">{{stats.total}}</h3>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Đang hiển thị</p>
            <h3 class="text-3xl font-brand font-bold text-emerald-600">{{stats.published}}</h3>
          </div>

          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-slate-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Bản nháp</p>
            <h3 class="text-3xl font-brand font-bold text-slate-600">{{stats.drafts}}</h3>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-purple-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Lượt xem tháng này</p>
            <div class="flex items-end gap-3">
              <h3 class="text-3xl font-brand font-bold text-slate-900">{{formatNumber(stats.views)}}</h3>
              <span class="text-emerald-500 text-xs font-bold pb-1.5 flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[14px]">trending_up</span> +5%
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex bg-slate-100 p-1 rounded-xl">
              <button v-for="tab in tabs" :key="tab.id" @click="changeTab(tab.id)"
                class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all"
                :class="activeTab === tab.id ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500 hover:text-slate-900'">
                {{ tab.name }}
              </button>
            </div>
            
            <div class="flex items-center gap-3 w-full md:w-auto">
              <div class="relative w-full md:w-64">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Tìm tiêu đề, tác giả..." class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-white">
              </div>
              <button class="flex items-center gap-2 bg-white text-slate-600 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 hover:border-[#ff8f73] hover:text-[#ff8f73] transition-all shadow-sm shrink-0">
                <span class="material-symbols-outlined text-sm">filter_list</span> Bộ lọc
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto custom-scrollbar">
              <table class="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                <thead class="bg-slate-50/50">
                  <tr>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Bài viết</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Tác giả</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Chuyên mục</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Tương tác</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Trạng thái</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
                  </tr>
                </thead>
                
                <tbody v-if="isLoading" class="divide-y divide-slate-50">
                    <tr v-for="i in 5" :key="i" class="animate-pulse">
                      <td class="px-6 py-4"><div class="flex gap-3"><div class="w-12 h-12 bg-slate-200 rounded-lg shrink-0"></div><div class="space-y-2"><div class="h-4 w-48 bg-slate-200 rounded"></div><div class="h-3 w-20 bg-slate-100 rounded"></div></div></div></td>
                      <td class="px-6 py-4"><div class="h-4 w-24 bg-slate-200 rounded"></div></td>
                      <td class="px-6 py-4"><div class="h-6 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                      <td class="px-6 py-4"><div class="h-4 w-20 bg-slate-200 rounded mx-auto"></div></td>
                      <td class="px-6 py-4"><div class="h-6 w-24 bg-slate-200 rounded-full"></div></td>
                      <td class="px-6 py-4"><div class="flex justify-end gap-1"><div class="h-8 w-8 bg-slate-200 rounded-xl"></div></div></td>
                    </tr>
                </tbody>

                <tbody v-else-if="newsList.length > 0" class="divide-y divide-slate-50">
                  <tr v-for="post in newsList" :key="post.id" class="hover:bg-slate-50/80 transition-colors group">
                    
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                          <img :src="post.thumbnail" alt="Thumbnail" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                        </div>
                        <div class="flex flex-col max-w-[300px]">
                          <span class="text-sm font-bold text-slate-900 truncate group-hover:text-[#ff8f73] transition-colors cursor-pointer" :title="post.title">{{ post.title }}</span>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">{{ post.idCode }}</span>
                            <span class="text-[11px] text-slate-500 font-medium"><span class="material-symbols-outlined text-[12px] align-text-bottom">schedule</span> {{ post.date }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                            <img :src="`https://ui-avatars.com/api/?name=${post.author}&background=random&color=fff`" class="w-full h-full object-cover"/>
                          </div>
                          <span class="text-sm text-slate-700 font-medium">{{ post.author }}</span>
                      </div>
                    </td>
                    
                    <td class="px-6 py-4 text-center">
                      <span class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border" :class="getCategoryBadgeClass(post.category)">
                        {{ post.category }}
                      </span>
                    </td>
                    
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-3 text-xs font-bold text-slate-500">
                        <span class="flex items-center gap-1 hover:text-sky-500 cursor-pointer" title="Lượt xem"><span class="material-symbols-outlined text-[14px]">visibility</span> {{ post.views }}</span>
                        <span class="flex items-center gap-1 hover:text-[#ff8f73] cursor-pointer" title="Bình luận"><span class="material-symbols-outlined text-[14px]">chat_bubble</span> {{ post.comments }}</span>
                      </div>
                    </td>

                    <td class="px-6 py-4">
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border" :class="getStatusClass(post.status)">
                        <span class="size-1.5 rounded-full" :class="getStatusDotClass(post.status)"></span>
                        {{ post.status }}
                      </div>
                    </td>
                    
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-1 relative">
                        <button @click="goToPreview(post.id)" class="w-8 h-8 flex items-center justify-center rounded-xl hover:text-sky-500 hover:bg-sky-50 transition-all text-slate-400 shadow-sm" title="Xem trước trang (Preview)">
                          <span class="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button @click="goToEditPost(post.id)" class="w-8 h-8 flex items-center justify-center rounded-xl hover:text-[#ff8f73] hover:bg-[#ff8f73]/10 transition-all text-slate-400 shadow-sm" title="Chỉnh sửa bài viết">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button @click="openDeleteConfirm(post)" class="w-8 h-8 flex items-center justify-center rounded-xl hover:text-rose-500 hover:bg-rose-50 transition-all text-slate-400 shadow-sm" title="Xóa">
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>

                <tbody v-else>
                  <tr>
                    <td colspan="6" class="py-16 text-center">
                      <div class="flex flex-col items-center justify-center">
                        <div class="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                          <span class="material-symbols-outlined text-[40px] text-slate-300" style="font-variation-settings: 'FILL' 1;">article</span>
                        </div>
                        <h4 class="text-slate-900 font-bold mb-2">Không tìm thấy bài viết nào</h4>
                        <p class="text-xs text-slate-500 max-w-sm">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="px-6 py-4 flex items-center justify-between bg-slate-50/30 border-t border-slate-100">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Hiển thị {{startItem}} - {{endItem}} của {{ pagination.totalItems }} bài viết
              </p>
              <div class="flex items-center gap-2">
                  <button @click="changePage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1" 
                          class="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] transition-all disabled:opacity-50">
                      <span class="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  
                  <button v-for="page in pagination.totalPages" :key="page" 
                          @click="changePage(page)"
                          class="w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs transition-all shadow-sm"
                          :class="pagination.currentPage === page ? 'bg-[#ff8f73] text-white shadow-lg shadow-[#ff8f73]/20' : 'bg-white border border-slate-200 text-slate-600 hover:text-[#ff8f73]'">
                  {{ page }}
                  </button>

                  <button @click="changePage(pagination.currentPage + 1)" :disabled="pagination.currentPage === pagination.totalPages"
                          class="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] transition-all disabled:opacity-50">
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
              </div>
            </div>
          </div>
        </div>  
      </main>
    </div>
  </div>
  <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
      
      <div class="bg-rose-50 p-6 flex flex-col items-center justify-center border-b border-rose-100">
        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
          <span class="material-symbols-outlined text-4xl text-rose-500">warning</span>
        </div>
        <h3 class="text-lg font-bold text-slate-900">Xác nhận xóa bài viết</h3>
      </div>

      <div class="p-6 text-center">
        <p class="text-sm text-slate-600 mb-2">Bạn có chắc chắn muốn xóa bài viết này không?</p>
        <p class="font-bold text-slate-900 bg-slate-50 py-2 px-4 rounded-lg border border-slate-100 line-clamp-2">
          "{{ postToDelete?.title }}"
        </p>
        <p class="text-[11px] font-medium text-rose-500 mt-4 bg-rose-50 py-1.5 px-3 rounded-md inline-block">
          Hành động này không thể hoàn tác!
        </p>
      </div>

      <div class="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button @click="isDeleteModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm">
          Hủy bỏ
        </button>
        <button @click="executeDelete" class="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 rounded-xl transition-all flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">delete_forever</span> Xóa vĩnh viễn
        </button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
  
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const isDeleteModalOpen = ref(false);
  const postToDelete = ref(null);
  const isLoading = ref(true);
  
  setTimeout(() => {
    isLoading.value = false;
  }, 800);
  
  const stats = ref({
    total: 0,
    published: 0,
    drafts: 0,
    views: 0
  });

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

// Hàm gọi API Thống kê
  const fetchStats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/news/admin/stats',{
          headers: {'Authorization': `Bearer ${token}`}
        });
        if (response.ok) {
            const data = await response.json();
            stats.value = data;
        }
    } catch (error) {
        console.error("Lỗi tải thống kê:", error);
    }
  };
  // --- STATE DỮ LIỆU TỪ BACKEND ---
  const tabs = [
    { id: '', name: 'Tất cả' },
    { id: 'Đã duyệt', name: 'Đã xuất bản' }, 
    { id: 'Bản nháp', name: 'Bản nháp' }
  ];
  const activeTab = ref('');
  const searchQuery = ref('');
  const newsList = ref([]); // Mảng rỗng chờ API

// Quản lý Phân trang
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5
  });

  const fetchAdminNews = async (page = 1) => {
    isLoading.value = true;
    try {
        // Nối URL với các tham số truy vấn
        let url = `http://localhost:3000/api/news/admin/list?page=${page}&limit=${pagination.value.limit}`;
        
        if (searchQuery.value) url += `&search=${encodeURIComponent(searchQuery.value)}`;
        if (activeTab.value) url += `&status=${encodeURIComponent(activeTab.value)}`;
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          headers: {'Authorization': `Bearer ${token}`}
        });
        const result = await response.json();

        if (response.ok) {
        // Ánh xạ dữ liệu DB sang UI
        newsList.value = result.data.map(item => ({
            id: item.MaTT,
            idCode: `#ART-${item.MaTT.toString().padStart(4, '0')}`, // VD: #ART-0012
            title: item.TieuDe,
            author: item.TacGia || 'Admin', 
            category: item.TheLoai,
            date: new Date(item.NgayDang).toLocaleDateString('vi-VN'),
            status: item.TrangThai === 'Đã duyệt' ? 'Đã xuất bản' : item.TrangThai,
            views: item.LuotXem,
            comments: 0, // Tính năng cmt tính sau
            thumbnail: item.AnhDaiDien || 'https://via.placeholder.com/200'
        }));

        // Cập nhật cục Phân trang
        pagination.value = result.pagination;
        }
    } catch (error) {
        console.error("Lỗi tải danh sách:", error);
    } finally {
        isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchAdminNews();
    fetchStats();
  });

// --- XỬ LÝ LỌC & TÌM KIẾM ---
  let searchTimeout = null;
  const handleSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchAdminNews(1); // Gõ xong tự động quay về trang 1 và tìm
    }, 500);
  };

  const changeTab = (tabId) => {
    activeTab.value = tabId;
    fetchAdminNews(1); // Chuyển tab tự động load lại trang 1
  };

  const changePage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pagination.value.totalPages) {
        fetchAdminNews(pageNumber);
    }
  };
  
  // --- CÁC HÀM XỬ LÝ MÀU SẮC (UI LOGIC) ---
  
  const getCategoryBadgeClass = (category) => {
    const map = {
      'Review': 'bg-purple-50 text-purple-600 border-purple-200',
      'Sự kiện': 'bg-orange-50 text-orange-600 border-orange-200',
      'Tin tức': 'bg-sky-50 text-sky-600 border-sky-200',
      'Mẹo vặt': 'bg-emerald-50 text-emerald-600 border-emerald-200'
    };
    return map[category] || 'bg-slate-50 text-slate-600 border-slate-200';
  };
  
  const getStatusClass = (status) => {
    if (status === 'Đã xuất bản') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Bản nháp') return 'bg-slate-100 text-slate-500 border-slate-200';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };
  
  const getStatusDotClass = (status) => {
    if (status === 'Đã xuất bản') return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
    if (status === 'Bản nháp') return 'bg-slate-400';
    return 'bg-slate-400';
  };

  const startItem = computed(() => {
    if (pagination.value.totalItems === 0) return 0;
    return (pagination.value.currentPage - 1) * pagination.value.limit + 1;
  });

  const endItem = computed(() => {
    if (pagination.value.totalItems === 0) return 0;
    return Math.min(
        pagination.value.currentPage * pagination.value.limit, 
        pagination.value.totalItems
    );
  });
  // --- HÀNH ĐỘNG NÚT BẤM ---
  const goToCreatePost = () => {
    router.push(`/admin/news/create`);
  };

  const goToEditPost = (id) => {
    router.push(`/admin/news/edit/${id}`);
  }
  const goToPreview = (id) => {
    const routeData = router.resolve({ path: `/news/${id}` });
    // Mở tab mới
    window.open(routeData.href, '_blank');
  };
  // --- LOGIC XỬ LÝ NÚT XÓA ---
  const openDeleteConfirm = (post) => {
    postToDelete.value = post; // Lưu lại thông tin bài viết được chọn
    isDeleteModalOpen.value = true; // Mở Modal
  };

  const executeDelete = async () => {
    if (!postToDelete.value) return;

    try {
        isLoading.value = true;
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/news/${postToDelete.value.id}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        });
        if (!response.ok) throw new Error('Lỗi khi xóa bài viết');

        let pageToFetch = pagination.value.currentPage;
        if(newsList.value.length === 1 && pageToFetch > 1){
            pageToFetch -= 1;
        }
        await fetchAdminNews(pageToFetch);
        await fetchStats();

        isDeleteModalOpen.value = false;
        postToDelete.value = null; // Xóa rỗng biến tạm
        
        toastStore.showToast("Đã xóa bài viết thành công!", "success"); 

    } catch (error) {
        console.error("Lỗi:", error);
        toastStore.showToast("Đã xảy ra lỗi khi xóa bài viết.", "error");
    }
  };
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>