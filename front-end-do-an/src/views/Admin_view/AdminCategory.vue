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
              <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý danh mục</h1>
              <p class="text-slate-500 text-sm font-medium">Tổ chức và phân loại bộ sưu tập sản phẩm của bạn.</p>
            </div>
            
            <button @click="openAddModal" class="w-full xl:w-auto bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm">
              <span class="material-symbols-outlined text-[20px]">add_circle</span>
              Thêm danh mục mới
            </button>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-slate-400 relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-8xl text-slate-50 material-symbols-outlined group-hover:text-slate-100 transition-colors pointer-events-none" style="font-variation-settings: 'FILL' 1;">category</div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Tổng số danh mục</p>
              <p class="text-5xl font-black text-slate-900 mt-1">{{ totalCats }}</p>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-400 relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-8xl text-emerald-50 material-symbols-outlined group-hover:text-emerald-100 transition-colors pointer-events-none" style="font-variation-settings: 'FILL' 1;">check_circle</div>
            <div class="relative z-10">
              <p class="text-[11px] text-emerald-600 font-bold uppercase tracking-widest mb-2">Danh mục hoạt động</p>
              <p class="text-5xl font-black text-slate-900 mt-1">{{ activeCats }}</p>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-rose-400 relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-8xl text-rose-50 material-symbols-outlined group-hover:text-rose-100 transition-colors pointer-events-none" style="font-variation-settings: 'FILL' 1;">bolt</div>
            <div class="relative z-10">
              <p class="text-[11px] text-rose-600 font-bold uppercase tracking-widest mb-2">Tạm dừng</p>
              <p class="text-5xl font-black text-slate-900 mt-1">0{{ inactiveCats }}</p>
            </div>
          </div>

        </div>
  
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div class="p-6 flex flex-col md:flex-row justify-between gap-4 items-center border-b border-slate-100">
              <div class="relative w-full md:w-80">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input v-model="searchQuery" type="text" placeholder="Tìm tên danh mục, mô tả..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 shadow-sm">
              </div>
              <div class="flex items-center gap-3 w-full md:w-auto">
                <select v-model="statusFilter" class="w-full md:w-48 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/20 focus:border-[#ff8f73] transition-all cursor-pointer shadow-sm">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>
              </div>
            </div>
  
            <div class="overflow-x-auto min-h-[300px]">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr class="bg-slate-50/50 border-b border-slate-100">
                    <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center w-16">STT</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Danh mục sản phẩm</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mô tả ngắn</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">Số lượng MH</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">Trạng thái</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="(cat, index) in categories" :key="cat.id" class="transition-colors group hover:bg-slate-50/80">
                    <td class="px-6 py-4 text-center text-sm font-bold text-slate-400">
                      {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </td>
                    <td class="px-8 py-4">
                      <div class="flex items-center gap-4">
                        <div class="flex flex-col">
                          <p class="font-bold text-slate-900 text-[15px] mb-0.5">{{ cat.name }}</p>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{{ cat.id }}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td class="px-8 py-4">
                      <p class="text-sm font-medium text-slate-500 max-w-xs truncate" :title="cat.description">
                        {{ cat.description }}
                      </p>
                    </td>
  
                    <td class="px-8 py-4 text-center">
                      <span class="text-sm font-bold text-slate-800">{{ cat.count }}</span>
                    </td>
                    
                    <td class="px-8 py-4 text-center">
                      <span 
                        class="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border shadow-sm inline-block whitespace-nowrap"
                        :class="cat.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'"
                      >
                        {{ cat.status }}
                      </span>
                    </td>
                    
                    <td class="px-8 py-4">
                      <div class="flex justify-end gap-2">
                        <button @click="openEditModal(cat)" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#ff8f73] hover:bg-[#ff8f73]/10 rounded-xl transition-all border border-transparent hover:border-[#ff8f73]/20" title="Sửa thông tin">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button @click="confirmDelete(cat)" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100" title="Xóa">
                          <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="categories.length === 0">
                    <td colspan="5" class="px-8 py-10 text-center text-slate-500 font-medium italic">
                      Không tìm thấy danh mục nào phù hợp với tìm kiếm của bạn.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p class="text-xs font-bold text-slate-400">
                Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} - 
                {{ Math.min(currentPage * itemsPerPage, totalCats) }} 
                của {{ totalCats }} danh mục
              </p>
              <div class="flex items-center gap-2">
                <button 
                  @click="currentPage > 1 && currentPage--" 
                  :disabled="currentPage === 1" 
                  class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                <button 
                  v-for="page in totalPages" :key="page"
                  @click="currentPage = page"
                  class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all"
                  :class="currentPage === page ? 'bg-[#ff8f73] text-white shadow-lg shadow-[#ff8f73]/20' : 'bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73]'"
                >
                  {{ page }}
                </button>
  
                <button 
                  @click="currentPage < totalPages && currentPage++" 
                  :disabled="currentPage === totalPages"
                  class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
          
        </main>
      </div>
  
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#ff8f73]">{{ isEditMode ? 'edit_note' : 'category' }}</span> 
              {{ isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}
            </h3>
            <button @click="isModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
  
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên danh mục (*)</label>
              <input v-model="formCategory.name" type="text" placeholder="VD: Action Figure" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-800">
            </div>
            
            <div class="grid grid-cols-3 gap-6">
              <div class="col-span-6">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mô tả ngắn</label>
                <textarea v-model="formCategory.description" rows="2" placeholder="Nhập mô tả cho danh mục..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 resize-none custom-scrollbar"></textarea>
              </div>
              
              <!-- <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
                <select v-model="formCategory.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] outline-none font-bold text-slate-700 bg-white h-[68px]">
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>
              </div> -->
            </div>
            <div class="mt-6 pt-6 border-t border-slate-100">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Chi tiết danh mục (Phân loại con)</span>
                <span class="text-[10px] text-slate-400 font-medium normal-case italic">Không bắt buộc</span>
              </label>

              <div class="space-y-2 mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input v-model="newDetail.name" type="text" placeholder="Tên phân loại (VD: Master Grade)" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] outline-none">
                <div class="flex gap-2">
                  <input v-model="newDetail.desc" type="text" placeholder="Mô tả ngắn cho phân loại này..." class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] outline-none">
                  <button @click="addDetail" class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Thêm</button>
                </div>
              </div>
              <div class="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1 mt-4">
                <div v-for="(detail, index) in formCategory.details" :key="index" class="flex flex-col gap-1 p-3 bg-white border border-slate-100 rounded-xl relative group hover:border-[#ff8f73]/30 transition-all shadow-sm">
                  
                  <div class="flex items-center gap-2 pr-6">
                    <span class="text-[10px] font-bold text-slate-300 mt-0.5">#{{ index + 1 }}</span>
                    <input v-model="detail.name" class="font-bold text-sm text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-full" placeholder="Tên phân loại">
                  </div>
                  
                  <input v-model="detail.description" class="text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 w-full pl-6" placeholder="Nhập mô tả ngắn (không bắt buộc)...">
                  
                  <button @click="removeDetail(index)" class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                
                <div v-if="!formCategory.details || formCategory.details.length === 0" class="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                  <p class="text-xs text-slate-400 font-medium">Danh mục này hiện chưa có phân loại con.</p>
                </div>
              </div>
            </div>
          </div>
  
          <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
            <button @click="isModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
            <button @click="saveCategory" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 rounded-xl transition-all">
              {{ isEditMode ? 'Cập nhật' : 'Lưu danh mục' }}
            </button>
          </div>
        </div>
      </div>
  
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div class="p-6 flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
            <p class="text-sm text-slate-500">Bạn có chắc chắn muốn xóa danh mục <span class="font-bold text-slate-900">"{{ itemToDelete?.name }}"</span>? Thao tác này có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.</p>
          </div>
          <div class="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button @click="isDeleteModalOpen = false" class="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">Hủy bỏ</button>
            <button @click="executeDelete" class="flex-1 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all">Xóa vĩnh viễn</button>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
  
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  
  const categories = ref([]);
  
  // Các biến thống kê & phân trang
  const totalCats = ref(0);
  const activeCats = ref(0); 
  const inactiveCats = ref(0);
  
  const searchQuery = ref('');
  const statusFilter = ref('all');
  const currentPage = ref(1);
  const itemsPerPage = ref(10); 
  const totalPages = ref(1);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // --- 2. HÀM GỌI API LẤY DANH SÁCH ---
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/api/product_admin/get_all_cate?page=${currentPage.value}&limit=${itemsPerPage.value}`;
      if (searchQuery.value) url += `&keyword=${encodeURIComponent(searchQuery.value)}`;
      const response = await fetch(url,
        {headers: {'Authorization': `Bearer ${token}`}}
      );
      const result = await response.json();

      if (result.success) {
        // Ánh xạ dữ liệu từ API vào Vue
        categories.value = result.data.map(item => ({
          id: item.MaDM,
          name: item.TenDM,
          description: item.MoTa || 'Chưa có mô tả',
          count: item.TongSoLuongDanhMucCon || 0,
          // Ánh xạ mảng danh mục con (Cực kỳ quan trọng cho Form Sửa)
          details: item.DanhSachDanhMucCon ? item.DanhSachDanhMucCon.map(sub => ({
             id: sub.MaChiTietDM,
             name: sub.TenChiTietDM,
             description: sub.MoTa || ''
          })) : []
        }));
        
        totalPages.value = result.pagination.totalPage;
        totalCats.value = result.pagination.totalCates;
        
        // (Tùy chọn) Tính số lượng Hoạt động / Tạm dừng dựa trên danh sách hiển thị
        activeCats.value = categories.value.filter(c => c.status === 'Hoạt động').length;
        inactiveCats.value = categories.value.filter(c => c.status === 'Tạm dừng').length;
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };
  
  onMounted(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    fetchCategories();
  });

  // Hễ gõ tìm kiếm, đổi bộ lọc, hoặc chuyển trang là gọi lại API
  let searchTimeout;
  watch([searchQuery, statusFilter], () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchCategories();
    }, 500); // Đợi 0.5s cho gõ xong mới tìm
  });

  watch(currentPage, () => {
    fetchCategories();
  });
  
  // LOGIC CRUD (THÊM / SỬA / XÓA)
  const isModalOpen = ref(false);
  const isEditMode = ref(false);
  const editingId = ref(null);
  const newDetail = ref({ name: '', desc: '' });
  const formCategory = ref({ 
    name: '', 
    description: '', 
    details: [] 
  });
  
  const openAddModal = () => {
    isEditMode.value = false;
    editingId.value = null;
    formCategory.value = { name: '', description: '', details: [] };
    isModalOpen.value = true;
  };
  
  const openEditModal = (cat) => {
    isEditMode.value = true;
    editingId.value = cat.id;
    formCategory.value = { 
      ...cat,
      details: cat.details ? [...cat.details] : [] 
    };
    isModalOpen.value = true;
  };
  
  // --- KẾT NỐI API: THÊM / SỬA DANH MỤC ---
  const saveCategory = async () => {
    if (!formCategory.value.name.trim()) {
      toastStore.showToast("Vui lòng nhập tên danh mục!", "error");
      return;
    }

    // Đóng gói dữ liệu chuẩn bị gửi đi
    const payload = {
      TenDM: formCategory.value.name,
      MoTa: formCategory.value.description,
      // Ép mảng danh mục con thành chuỗi JSON để Node.js dễ đọc
      ChiTiet: JSON.stringify(formCategory.value.details) 
    };

    try {
      let url = `${API_BASE_URL}/api/product_admin/add_variant`; 
      let method = 'POST';

      if (isEditMode.value) {
        url = `${API_BASE_URL}/api/product_admin/fix_cate/${editingId.value}`;
        method = 'PUT';
      }

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' ,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok || result.success) {
        toastStore.showToast(result.message || "Lưu danh mục thành công!", "success");
        isModalOpen.value = false;
        fetchCategories(); // Gọi hàm lấy lại bảng
      } else {
        toastStore.showToast(result.message || "Lỗi khi lưu danh mục!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      toastStore.showToast("Lỗi kết nối máy chủ!", "error");
    }
  };
  
  const isDeleteModalOpen = ref(false);
  const itemToDelete = ref(null);
  const confirmDelete = (cat) => {
    console.log("👉 Dòng dữ liệu bạn vừa bấm Xóa:", cat);
    itemToDelete.value = cat;
    isDeleteModalOpen.value = true;
  };

  const executeDelete = async () => {
    if (!itemToDelete.value) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/product_admin/delete_detail/${itemToDelete.value.id}`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${token}`}
      });
      const result = await response.json();

      if (response.ok || result.success) {
        toastStore.showToast(result.message || "Đã xóa danh mục!", "success");
        isDeleteModalOpen.value = false;
        fetchCategories(); // Gọi hàm lấy lại bảng
      } else {
        toastStore.showToast(result.message || "Không thể xóa danh mục này!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toastStore.showToast("Lỗi kết nối máy chủ!", "error");
    } finally {
      itemToDelete.value = null;
    }
  };
  
  const addDetail = () => {
    if (!newDetail.value.name.trim()) return;
    if (!formCategory.value.details) formCategory.value.details = [];
    
    formCategory.value.details.push({
      name: newDetail.value.name.trim(),
      description: newDetail.value.desc.trim()
    });
    
    newDetail.value = { name: '', desc: '' };
  };

  const removeDetail = async (index) => {
    const detailItem = formCategory.value.details[index];

    // TRƯỜNG HỢP 1: Phân loại con mới vừa gõ thêm (chưa có ID trong Database)
    // Chỉ cần xóa khỏi màn hình là xong
    if (!detailItem.id) {
      formCategory.value.details.splice(index, 1);
      return;
    }

    // TRƯỜNG HỢP 2: Phân loại con đã có sẵn trong Database
    // Hiện thông báo xác nhận cẩn thận trước khi gọi API xóa
    if (confirm(`Bạn có chắc chắn muốn xóa phân loại "${detailItem.name}" không?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/product_admin/delete_detail_variant/${detailItem.id}`, {
          method: 'DELETE',
          headers: {'Authorization': `Bearer ${token}`}
        });
        
        const result = await response.json();

        if (response.ok || result.success) {
          // Xóa thành công dưới DB -> Bóc khỏi giao diện
          formCategory.value.details.splice(index, 1);
          toastStore.showToast("Đã xóa chi tiết danh mục!", "success");
          
          // Cập nhật lại cái bảng lớn ở ngoài để đồng bộ số lượng
          fetchCategories(); 
        } else {
          toastStore.showToast(result.message || "Không thể xóa phân loại này!", "error");
        }
      } catch (error) {
        console.error("Lỗi khi xóa chi tiết:", error);
        toastStore.showToast("Lỗi kết nối máy chủ!", "error");
      }
    }
  };

</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>