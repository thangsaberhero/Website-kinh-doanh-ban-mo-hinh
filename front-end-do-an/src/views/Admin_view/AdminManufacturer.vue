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
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý hãng sản xuất</h1>
            <p class="text-slate-500 text-sm font-medium">Theo dõi và quản lý danh sách các đối tác cung cấp mô hình.</p>
          </div>
          
          <button @click="openAddModal" class="w-full xl:w-auto bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm">
            <span class="material-symbols-outlined text-[20px]">add_business</span>
            Thêm hãng mới
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Tổng số hãng</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ tongSoHang }}</p>
            </div>
            <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner">
              <span class="material-symbols-outlined text-slate-500">factory</span>
            </div>
          </div>
          
          <!-- <div class="bg-white p-6 rounded-2xl border border-sky-50 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="relative z-10">
              <p class="text-[11px] text-sky-500 font-bold uppercase tracking-widest mb-2">Đang hợp tác</p>
              <p class="text-3xl font-brand font-bold text-sky-600">38</p>
            </div>
            <div class="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100 shadow-inner">
              <span class="material-symbols-outlined text-sky-500">handshake</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-rose-50 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div class="relative z-10">
                  <p class="text-[11px] text-rose-500 font-bold uppercase tracking-widest mb-2">Ngừng hợp tác</p>
                  <p class="text-3xl font-brand font-bold text-rose-600">04</p>
              </div>
              <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 shadow-inner">
                  <span class="material-symbols-outlined text-rose-500">block</span>
              </div>
          </div> -->

          <div class="bg-white p-6 rounded-2xl border border-[#ff8f73]/20 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="relative z-10">
              <p class="text-[11px] text-[#ff8f73] font-bold uppercase tracking-widest mb-2">Tổng sản phẩm</p>
              <p class="text-3xl font-brand font-bold text-[#ff3d00]">{{ tongSoSanPham }}</p>
            </div>
            <div class="w-12 h-12 bg-[#ff8f73]/10 rounded-xl flex items-center justify-center border border-[#ff8f73]/20 shadow-inner">
              <span class="material-symbols-outlined text-[#ff3d00]">inventory_2</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div class="p-6 flex flex-col md:flex-row justify-between gap-4 items-center border-b border-slate-100">
              <div class="relative w-full md:w-80">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input v-model="searchQuery" type="text" placeholder="Tìm kiếm tên hãng, mã số..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 shadow-sm">
              </div>
              
              <div class="flex items-center gap-3 w-full md:w-auto">
                  <select v-model="statusFilter" class="w-full md:w-48 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/20 focus:border-[#ff8f73] transition-all cursor-pointer shadow-sm">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Đang hợp tác">Đang hợp tác</option>
                  <option value="Ngưng cung cấp">Ngưng cung cấp</option>
                  </select>
              </div>
          </div>

          <div class="overflow-x-auto min-h-[300px]">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold w-1/3">Hãng sản xuất</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mô tả thông tin</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">Số sản phẩm</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="mfr in manufacturers" :key="mfr.id" class="transition-colors group hover:bg-slate-50/80">              
                  <td class="px-8 py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                        <img v-if="mfr.logo" :src="`http://localhost:3000/Images_brand/${mfr.logo}`" class="w-full h-full object-contain p-1" />
                        <span v-else class="text-lg font-black text-[#ff8f73]">{{ mfr.code }}</span>
                      </div>
                      <div class="flex flex-col">
                        <p class="font-bold text-slate-900 text-[15px] mb-0.5">{{ mfr.name }}</p>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{{ mfr.id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-4">
                    <p class="text-sm font-medium text-slate-500 max-w-md truncate" :title="mfr.description">
                      {{ mfr.description || 'Chưa có thông tin mô tả' }}
                    </p>
                  </td>
                  <!-- <td class="px-8 py-4 text-sm font-semibold text-slate-600">{{ mfr.country }}</td> -->
                  <td class="px-8 py-4 text-center">
                      <span class="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{{ mfr.products }}</span>
                  </td>
                  <!-- <td class="px-8 py-4 text-sm font-medium text-slate-500">{{ mfr.contact }}</td> -->
                  
                  <!-- <td class="px-8 py-4 text-center">
                    <span 
                      class="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border shadow-sm inline-block"
                      :class="mfr.status === 'Đang hợp tác' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'"
                    >
                      {{ mfr.status }}
                    </span>
                  </td> -->
                  
                  <td class="px-8 py-4">
                    <div class="flex justify-center gap-2">
                      <button @click="openEditModal(mfr)" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#ff8f73] hover:bg-[#ff8f73]/10 rounded-xl transition-all border border-transparent hover:border-[#ff8f73]/20" title="Sửa thông tin">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button @click="confirmDelete(mfr)" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100" title="Xóa">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="manufacturers.length === 0">
                  <td colspan="6" class="px-8 py-10 text-center text-slate-500 font-medium">
                      Không tìm thấy hãng sản xuất nào phù hợp với tìm kiếm của bạn.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p class="text-xs font-bold text-slate-400">
              Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} - 
              {{ Math.min(currentPage * itemsPerPage, totalBrandsCount) }} 
              của {{ totalBrandsCount }} hãng
            </p>
            <div class="flex items-center gap-2">
              <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1" 
                      class="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400">
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              <button v-for="page in totalPages" :key="page" 
                      @click="currentPage = page"
                      class="w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs transition-all shadow-sm"
                      :class="currentPage === page ? 'bg-[#ff8f73] text-white shadow-lg shadow-[#ff8f73]/20' : 'bg-white border border-slate-200 text-slate-600 hover:text-[#ff8f73]'">
              {{ page }}
              </button>

              <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages"
                      class="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  </div>
  <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#ff8f73]">{{ isEditMode ? 'edit_square' : 'add_business' }}</span> 
            {{ isEditMode ? 'Chỉnh sửa hãng sản xuất' : 'Thêm hãng mới' }}
          </h3>
        </div>
        <button @click="isModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-6 space-y-5">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Logo Hãng</label>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
              <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-contain p-1 relative z-10" />
              <span v-else class="material-symbols-outlined text-slate-300 text-3xl">image</span>
            </div>
            <div class="flex-1">
              <input type="file" accept="image/*" ref="logoInput" @change="onLogoChange" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff8f73]/10 file:text-[#ff8f73] hover:file:bg-[#ff8f73]/20 cursor-pointer"/>
              <p class="text-[10px] text-slate-400 mt-2">Định dạng: PNG, JPG (Khuyên dùng ảnh nền trong suốt).</p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên hãng sản xuất (*)</label>
          <input v-model="formManufacturer.name" type="text" placeholder="VD: Bandai Namco" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-800">
        </div>
        
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mô tả thông tin (Tùy chọn)</label>
          <textarea v-model="formManufacturer.description" rows="4" placeholder="Nhập thông tin giới thiệu về hãng sản xuất này..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 resize-none"></textarea>
        </div>
        <!-- <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quốc gia</label>
          <input v-model="formManufacturer.country" type="text" placeholder="VD: Nhật Bản" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none font-medium text-slate-700">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Liên hệ</label>
          <input v-model="formManufacturer.contact" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none font-medium text-slate-700">
        </div> -->

        <!-- <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
          <select v-model="formManufacturer.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] outline-none font-bold text-slate-700 bg-white">
            <option value="Đang hợp tác">Đang hợp tác</option>
            <option value="Ngưng cung cấp">Ngưng cung cấp</option>
          </select>
        </div> -->
      </div>

      <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
        <button @click="isModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
        <button @click="saveManufacturer" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 rounded-xl transition-all">
          {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
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
        <h3 class="text-lg font-bold text-slate-900 mb-2">Xóa hãng sản xuất?</h3>
        <p class="text-sm text-slate-500">Bạn có chắc muốn xóa <span class="font-bold text-slate-900">"{{ itemToDelete?.name }}"</span> không? Hành động này không thể hoàn tác.</p>
      </div>
      <div class="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
        <button @click="isDeleteModalOpen = false" class="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">Hủy</button>
        <button @click="executeDelete" class="flex-1 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-lg shadow-rose-500/20">Xóa vĩnh viễn</button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, computed } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
    
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const manufacturers = ref([]);
  const searchQuery = ref('');
  const statusFilter = ref('all');
  
  // Các biến phân trang từ Backend
  const currentPage = ref(1);
  const itemsPerPage = ref(10); 
  const totalPages = ref(1);
  const totalBrandsCount = ref(0);
  const tongSoHang = ref(0);
  const tongSoSanPham = ref(0);
  const formManufacturer = ref({ id: null, name: '', description: '' });
  const logoFile = ref(null);
  const logoPreview = ref(null);
  const logoInput = ref(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const onLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      logoFile.value = file;
      logoPreview.value = URL.createObjectURL(file);
    }
  };

  // HÀM GỌI API THỐNG KÊ
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/product_admin/thong_ke_hsx`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const result = await response.json();
      if (result.success) {
        tongSoHang.value = result.data.tongSoHang;
        tongSoSanPham.value = result.data.tongSoSanPham;
      }
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    }
  };

  // HÀM GỌI API LẤY DANH SÁCH HÃNG
  const fetchManufacturers = async () => {
    try {
      let url = `${API_BASE_URL}/api/product_admin/get_all_brand?page=${currentPage.value}&limit=${itemsPerPage.value}`;
      
      // Truyền từ khóa tìm kiếm
      if (searchQuery.value) {
        url += `&keyword=${encodeURIComponent(searchQuery.value)}`;
      }
      const token = localStorage.getItem('token');
      const response = await fetch(url,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const result = await response.json();

      if (result.success) {
        manufacturers.value = result.data.map(item => ({
          id: item.MaHSX,
          code: item.TenHSX.substring(0, 2).toUpperCase(),
          name: item.TenHSX,
          products: item.TongSoLuongSanPham || 0,
          description: item.MoTa,
          logo: item.Logo 
        }));

        // Cập nhật thông số phân trang
        totalPages.value = result.pagination.totalPage;
        totalBrandsCount.value = result.pagination.totalBrands;
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hãng:", error);
    }
  };

  // Gọi API ngay khi mở trang
  import { onMounted, watch } from 'vue';
  onMounted(() => {
    fetchManufacturers();
    fetchStats();
  });

  // Lắng nghe thay đổi: Hễ gõ tìm kiếm hoặc đổi bộ lọc là gọi lại API từ trang 1
  // Dùng debounce nhẹ nếu sợ gõ nhanh gọi API liên tục
  let searchTimeout;
  watch([searchQuery, statusFilter], () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchManufacturers();
    }, 500); // Đợi gõ xong 0.5s mới tìm
  });

  // Lắng nghe khi bấm chuyển trang
  watch(currentPage, () => {
    fetchManufacturers();
  });

  const isModalOpen = ref(false);
  const isEditMode = ref(false);
  const editingId = ref(null);

  const openAddModal = () => {
    isEditMode.value = false;
    editingId.value = null;
    formManufacturer.value = { id: null, name: '', description: ''};
    logoFile.value = null;
    logoPreview.value = null;
    if (logoInput.value) logoInput.value.value = '';
    isModalOpen.value = true;
  };

  const openEditModal = (mfr) => {
    isEditMode.value = true;
    editingId.value = mfr.id;
    formManufacturer.value = { id: mfr.id, name: mfr.name, description: mfr.description };
    logoFile.value = null; 
    logoPreview.value = mfr.logo ? `http://localhost:3000/Images_brand/${mfr.logo}` : null;
    if (logoInput.value) logoInput.value.value = '';
    isModalOpen.value = true;
  };

  const saveManufacturer = async () => {
    if (!formManufacturer.value.name.trim()) {
      toastStore.showToast("Vui lòng nhập tên hãng sản xuất!", "error");
      return;
    }

    const formData = new FormData();
    formData.append('TenHSX', formManufacturer.value.name);
    formData.append('MoTa', formManufacturer.value.description);
    
    if (logoFile.value) {
      formData.append('Logo', logoFile.value);
    }

    try {
      let url = `${API_BASE_URL}/api/product_admin/add_brand`; 
      let method = 'POST';
      if (isEditMode.value) {
        url = `${API_BASE_URL}/api/product_admin/fix_brand/${formManufacturer.value.id}`;
        method = 'PUT';
      }

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        headers: {'Authorization': `Bearer ${token}`},
        body: formData
      });

      const result = await response.json();

      if (response.ok || result.success) {
        toastStore.showToast(result.message || "Lưu thành công!", "success");
        isModalOpen.value = false;
        fetchManufacturers(); 
      } else {
        toastStore.showToast(result.message || "Lỗi khi lưu!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi lưu hãng:", error);
      toastStore.showToast("Lỗi máy chủ!", "error");
    }
  };

  const isDeleteModalOpen = ref(false);
  const itemToDelete = ref(null);

  const confirmDelete = (mfr) => {
    itemToDelete.value = mfr;
    isDeleteModalOpen.value = true;
  };

  const executeDelete = async () => {
    if (!itemToDelete.value) return;
    
    try {
      const token = localStorage.getItem('token');
      // 👉 Sửa URL Xóa ở đây
      const response = await fetch(`${API_BASE_URL}/api/product_admin/delete_brand/${itemToDelete.value.id}`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${token}`}
      });
      
      const result = await response.json();

      if (result.success) {
        toastStore.showToast(result.message || "Đã xóa thành công!", "success");
        fetchManufacturers(); // Tải lại danh sách từ DB
      } else {
        // Thông báo lỗi nếu hãng đang có sản phẩm
        toastStore.showToast(result.message || "Không thể xóa hãng này!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toastStore.showToast("Lỗi máy chủ!", "error");
    } finally {
      isDeleteModalOpen.value = false;
      itemToDelete.value = null;
    }
  };
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>