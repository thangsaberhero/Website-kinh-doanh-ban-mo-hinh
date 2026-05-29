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
      
      <main class="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar pb-24">
        <div class="flex flex-col justify-between items-start gap-2">
          <h1 class="text-3xl font-brand font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p class="text-slate-500 text-sm font-medium">Quản lý thông tin tài khoản và thiết lập cá nhân của Quản trị viên.</p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div class="xl:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <form @submit.prevent="saveProfile" class="space-y-8 relative z-10">
              
              <div class="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
                <div class="relative group cursor-pointer shrink-0">
                  <div class="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-slate-50 shadow-md overflow-hidden transition-all duration-300 group-hover:border-[#ff8f73]/50 bg-slate-100">
                    <img class="w-full h-full object-cover" alt="Admin Avatar" :src="avatarPreview"/>
                  </div>
                </div>

                <div class="space-y-2 text-center sm:text-left">
                  <h4 class="text-lg font-bold text-slate-900">Ảnh đại diện</h4>
                  <p class="text-xs font-medium text-slate-500">Hỗ trợ định dạng JPG, PNG hoặc GIF. Kích thước tối đa 5MB.</p>
                  <div class="flex gap-3 justify-center sm:justify-start pt-2">
                    <input type="file" ref="fileInput" class="hidden" accept="image/jpeg, image/png, image/gif" @change="onFileSelected" />
                    
                    <button 
                      type="button" 
                      @click="triggerFileInput" 
                      class="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-black transition-all shadow-md shadow-slate-900/20"
                    >
                      Thay đổi ảnh
                    </button>
                    
                    <button type="button" @click="removeAvatar" class="px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100">
                      Gỡ bỏ
                    </button>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Họ và tên</label>
                  <input v-model="form.name" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white" type="text" placeholder="Nhập họ và tên quản trị viên"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                  <input v-model="form.email" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white" type="email" placeholder="admin@figurecollect.vn"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Số điện thoại</label>
                  <input v-model="form.phone" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white" type="tel" placeholder="Ví dụ: 0901234567"/>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Địa chỉ công tác / Nơi ở</label>
                  <input v-model="form.address" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white" type="text" placeholder="Nhập địa chỉ của bạn..."/>
                </div>
              </div>

              <div class="pt-6 flex items-center justify-end border-t border-slate-100 gap-3">
                <button type="button" @click="fetchUserData" class="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
                  Hủy bỏ
                </button>
                <button type="submit" class="bg-[#ff8f73] hover:bg-[#ff7a59] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg shadow-[#ff8f73]/30 transition-all flex items-center gap-2 active:scale-95">
                  <span v-if="isSaving" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  {{ isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI' }}
                </button>
              </div>
            </form>
          </div>

          <div class="space-y-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -z-10 group-hover:bg-[#ff8f73]/10 transition-colors duration-500"></div>
              
              <h3 class="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73]">admin_panel_settings</span> Phân quyền hệ thống
              </h3>
              
              <div class="space-y-4">
                <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span class="text-sm text-slate-500 font-medium">Vai trò</span>
                  <span class="text-sm font-bold text-[#ff8f73] bg-[#ff8f73]/10 px-3 py-1 rounded-lg">{{ userRole }}</span>
                </div>
                <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span class="text-sm text-slate-500 font-medium">Trạng thái</span>
                  <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Hoạt động
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500 font-medium">Ngày tham gia</span>
                  <span class="text-sm font-bold text-slate-900">{{ joinDate }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <RouterLink to="/admin/change-password" class="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors group">
                  <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                        <span class="material-symbols-outlined text-[18px]">lock</span>
                      </div>
                      <span class="text-sm font-bold">Đổi mật khẩu</span>
                  </div>
                  <span class="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                </RouterLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth';
  import { useToastStore } from '../../stores/toast';
  import { useLayoutStore } from '../../stores/layout';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  
  const toastStore = useToastStore();
  const router = useRouter();
  const authStore = useAuthStore();
  const layoutStore = useLayoutStore();
  
  const isSaving = ref(false);
  const isAvatarRemoved = ref(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // Lấy thông tin từ Storage
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  
  // Quản lý ảnh
  const fileInput = ref(null); 
  const selectedFile = ref(null); 
  const displayName = currentUser?.TenNV || currentUser?.username || 'Admin';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${displayName}&background=ff8f73&color=fff&bold=true&size=150`;
  const avatarPreview = ref(currentUser?.AnhDaiDien ? `${API_BASE_URL}/Images_user/${currentUser.AnhDaiDien}` : defaultAvatar);
  const ngayTaoFromDB = ref(null);

  
  // Khởi tạo Form
  const form = reactive({
    name: '',
    email: '', 
    phone: '', 
    address: '' 
  });
  
  // UI Data
  const userRole = computed(() => currentUser?.role === 1 ? 'Quản trị viên' : 'Nhân viên');
  const joinDate = computed(() => {
    const dateStr = ngayTaoFromDB.value || currentUser?.NgayTao;
    if (!dateStr) return 'Đang tải...'; 
    return new Date(dateStr).toLocaleDateString('vi-VN');
  });
  
  // API Lấy dữ liệu Admin
  const fetchUserData = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin_info/laythongtin`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      const dataJSON = await res.json();
      
      if (res.ok && dataJSON.data) {
        const userData = dataJSON.data;
        form.name = userData.TenNV || userData.TenDN || ''; 
        form.email = userData.Email || ''; 
        form.phone = userData.SDT || '';
        form.address = userData.DiaChi || '';
        ngayTaoFromDB.value = userData.NgayTao;
        
        if (userData.AnhDaiDien && userData.AnhDaiDien !== '') {
          avatarPreview.value = `${API_BASE_URL}/Images_user/${userData.AnhDaiDien}`;
        }
      }
    } 
    catch (error) {
      console.error("Lỗi lấy thông tin:", error);
    }
  };
  
  onMounted(() => {
    window.scroll(0,0);
    if (!currentUser && !localStorage.getItem('token')) {
      router.push('/login');
    } 
    else {
      fetchUserData();
    }
  });
  
  // Xử lý File Ảnh
  const triggerFileInput = () => {
    if (fileInput.value) fileInput.value.click();
  };
  
  const onFileSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        toastStore.showToast("Dung lượng ảnh tối đa là 5MB.", "error");
        return;
    }
    selectedFile.value = file; 
    avatarPreview.value = URL.createObjectURL(file); 
    isAvatarRemoved.value = false; 
  };

  const removeAvatar = () => {
    selectedFile.value = null;
    avatarPreview.value = defaultAvatar;
    if(fileInput.value) fileInput.value.value = ''; 
    isAvatarRemoved.value = true; 
  };

  const saveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return toastStore.showToast("Vui lòng đăng nhập lại!", "error");

    isSaving.value = true;
    try {
      const formData = new FormData();
      formData.append('MaTK', currentUser.id);
      formData.append('TenNV', form.name);
      formData.append('email', form.email);
      formData.append('SDT', form.phone);
      formData.append('DiaChi', form.address);
      formData.append('isAvatarRemoved', isAvatarRemoved.value);
      
      if (selectedFile.value) {
        formData.append('avatar', selectedFile.value); 
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin_info/change_info`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi cập nhật");

      // Cập nhật Local Storage
      const updatedUser = { ...currentUser, TenNV: form.name, username: form.name };
      
      // Xử lý lưu ảnh mới hoặc xóa ảnh
      if (data.newAvatarName) {
        updatedUser.AnhDaiDien = data.newAvatarName;
      } 
      else if (isAvatarRemoved.value) {
        updatedUser.AnhDaiDien = null; 
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (authStore.user) authStore.user = updatedUser;

      toastStore.showToast("Cập nhật thông tin thành công!", "success");
      isAvatarRemoved.value = false;
    } 
    catch (error) {
      toastStore.showToast(error.message, "error");
    } 
    finally {
      isSaving.value = false;
    }
  };
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>