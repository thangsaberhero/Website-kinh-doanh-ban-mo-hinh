<template>
    <div @click="closeAllMenus" class="bg-slate-50 min-h-screen font-body flex w-full text-slate-800 relative">
      
      <div 
        v-show="isMobileMenuOpen" 
        @click="isMobileMenuOpen = false" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
      ></div>
  
      <AdminSideBar :is-collapsed="isSidebarCollapsed" :is-mobile-open="isMobileMenuOpen" />
  
      <div class="flex-1 flex flex-col min-h-screen overflow-hidden w-full relative">
        <AdminHeader @toggle-sidebar="handleToggleSidebar" />
        
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
                <p class="text-3xl font-brand font-bold text-slate-900">42</p>
              </div>
              <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner">
                <span class="material-symbols-outlined text-slate-500">factory</span>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border border-sky-50 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
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
            </div>
  
            <div class="bg-white p-6 rounded-2xl border border-[#ff8f73]/20 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div class="relative z-10">
                <p class="text-[11px] text-[#ff8f73] font-bold uppercase tracking-widest mb-2">Tổng sản phẩm</p>
                <p class="text-3xl font-brand font-bold text-[#ff3d00]">1,248</p>
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
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Hãng sản xuất</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Quốc gia</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Số sản phẩm</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Liên hệ</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">Trạng thái</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="mfr in paginatedManufacturers" :key="mfr.id" class="transition-colors group hover:bg-slate-50/80">              
                    <td class="px-8 py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-lg font-black text-[#ff8f73]">
                          {{ mfr.code }}
                        </div>
                        <div class="flex flex-col">
                          <p class="font-bold text-slate-900 text-[15px] mb-0.5">{{ mfr.name }}</p>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{{ mfr.id }}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td class="px-8 py-4 text-sm font-semibold text-slate-600">{{ mfr.country }}</td>
                    <td class="px-8 py-4 text-sm font-bold text-slate-900 text-right">{{ mfr.products }}</td>
                    <td class="px-8 py-4 text-sm font-medium text-slate-500">{{ mfr.contact }}</td>
                    
                    <td class="px-8 py-4 text-center">
                      <span 
                        class="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border shadow-sm inline-block"
                        :class="mfr.status === 'Đang hợp tác' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'"
                      >
                        {{ mfr.status }}
                      </span>
                    </td>
                    
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
                  <tr v-if="filteredManufacturers.length === 0">
                    <td colspan="6" class="px-8 py-10 text-center text-slate-500 font-medium">
                        Không tìm thấy hãng sản xuất nào phù hợp với tìm kiếm của bạn.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p class="text-xs font-bold text-slate-400">Hiển thị {{ startItem }} - {{ endItem }} của {{ filteredManufacturers.length }} hãng</p>
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
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên hãng sản xuất (*)</label>
            <input v-model="formManufacturer.name" type="text" placeholder="VD: Bandai Namco" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-800">
          </div>
          
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quốc gia</label>
            <input v-model="formManufacturer.country" type="text" placeholder="VD: Nhật Bản" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none font-medium text-slate-700">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Liên hệ</label>
            <input v-model="formManufacturer.contact" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none font-medium text-slate-700">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
            <select v-model="formManufacturer.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] outline-none font-bold text-slate-700 bg-white">
              <option value="Đang hợp tác">Đang hợp tác</option>
              <option value="Ngưng cung cấp">Ngưng cung cấp</option>
            </select>
          </div>
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
  
  const isSidebarCollapsed = ref(false);
  const isMobileMenuOpen = ref(false);
  
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) isMobileMenuOpen.value = !isMobileMenuOpen.value;
    else isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };
  const closeAllMenus = () => {};

  const manufacturers = ref([
    { id: '8801', code: 'BN', name: 'Bandai Namco', country: 'Nhật Bản', products: 450, contact: 'contact@bandainamco.jp', status: 'Đang hợp tác' },
    { id: '8842', code: 'GSC', name: 'Good Smile Company', country: 'Nhật Bản', products: 320, contact: 'sales@goodsmile.jp', status: 'Đang hợp tác' },
    { id: '8905', code: 'KT', name: 'Kotobukiya', country: 'Nhật Bản', products: 120, contact: 'info@kotobukiya.co.jp', status: 'Ngưng cung cấp' },
    { id: '9012', code: 'MF', name: 'Max Factory', country: 'Trung Quốc', products: 88, contact: '+81 3-1234-5678', status: 'Đang hợp tác' },
  ]);

  const searchQuery = ref('');
  const statusFilter = ref('all');
  const currentPage = ref(1);
  const itemsPerPage = ref(10); 

  const filteredManufacturers = computed(() => {
    let result = manufacturers.value;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.id.includes(q)
      );
    }
    
    if (statusFilter.value !== 'all') {
      result = result.filter(m => m.status === statusFilter.value);
    }
    
    currentPage.value = 1;
    return result;
  });

  const paginatedManufacturers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredManufacturers.value.slice(start, end);
  });

  const totalPages = computed(() => Math.ceil(filteredManufacturers.value.length / itemsPerPage.value) || 1);

  const startItem = computed(() => filteredManufacturers.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
  const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredManufacturers.value.length));

  const isModalOpen = ref(false);
  const isEditMode = ref(false);
  const editingId = ref(null);

  const formManufacturer = ref({
    name: '', code: '', country: '', contact: '', status: 'Đang hợp tác'
  });

  const openAddModal = () => {
    isEditMode.value = false;
    editingId.value = null;
    formManufacturer.value = { name: '', code: '', country: '', contact: '', status: 'Đang hợp tác' };
    isModalOpen.value = true;
  };

  const openEditModal = (mfr) => {
    isEditMode.value = true;
    editingId.value = mfr.id;
    formManufacturer.value = { ...mfr };
    isModalOpen.value = true;
  };

  const saveManufacturer = () => {
    if (!formManufacturer.value.name) return alert("Vui lòng nhập tên hãng!");
    if (!formManufacturer.value.code) {
        formManufacturer.value.code = formManufacturer.value.name.substring(0, 2).toUpperCase();
    }

    if (isEditMode.value) {
        const index = manufacturers.value.findIndex(m => m.id === editingId.value);
        if (index !== -1) manufacturers.value[index] = { ...formManufacturer.value, id: editingId.value };
    } else {
        // Thêm mới
        manufacturers.value.unshift({
            ...formManufacturer.value,
            id: Math.floor(Math.random() * 10000).toString(), // ID giả lập
            products: 0
        });
    }
    isModalOpen.value = false;
  };

  const isDeleteModalOpen = ref(false);
  const itemToDelete = ref(null);

  const confirmDelete = (mfr) => {
    itemToDelete.value = mfr;
    isDeleteModalOpen.value = true;
  };

  const executeDelete = () => {
    manufacturers.value = manufacturers.value.filter(m => m.id !== itemToDelete.value.id);
    isDeleteModalOpen.value = false;
    itemToDelete.value = null;
  };
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>