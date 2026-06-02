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
        <div class="flex items-start gap-4">
          <RouterLink to="/admin/profile" class="mt-1 w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all shadow-sm shrink-0">
            <span class="material-symbols-outlined">arrow_back</span>
          </RouterLink>
          <div class="flex flex-col justify-between items-start gap-2">
            <h1 class="text-3xl font-brand font-bold text-slate-900 tracking-tight">Đổi mật khẩu</h1>
            <p class="text-slate-500 text-sm font-medium">Cập nhật mật khẩu thường xuyên để bảo vệ tài khoản quản trị của bạn.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div class="xl:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <form @submit.prevent="changePassword" class="space-y-6 relative z-10">
              
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Mật khẩu hiện tại <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input :type="showOld ? 'text' : 'password'" v-model="form.oldPassword" required
                          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white pr-10" 
                          placeholder="Nhập mật khẩu bạn đang sử dụng"/>
                  <button type="button" @click="showOld = !showOld" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ff8f73] transition-colors">
                    <span class="material-symbols-outlined text-[20px]">{{ showOld ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Mật khẩu mới <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input :type="showNew ? 'text' : 'password'" v-model="form.newPassword" required minlength="6"
                          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white pr-10" 
                          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"/>
                  <button type="button" @click="showNew = !showNew" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ff8f73] transition-colors">
                    <span class="material-symbols-outlined text-[20px]">{{ showNew ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Xác nhận mật khẩu mới <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input :type="showConfirm ? 'text' : 'password'" v-model="form.confirmPassword" required minlength="6"
                          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white pr-10" 
                          placeholder="Nhập lại mật khẩu mới để xác nhận"/>
                  <button type="button" @click="showConfirm = !showConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ff8f73] transition-colors">
                    <span class="material-symbols-outlined text-[20px]">{{ showConfirm ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
                <p v-if="errorText" class="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <span class="material-symbols-outlined text-[14px]">error</span> {{ errorText }}
                </p>
              </div>

              <div class="pt-6 flex items-center justify-end border-t border-slate-100 gap-3">
                <RouterLink to="/admin/profile" class="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
                  Hủy bỏ
                </RouterLink>
                <button type="submit" :disabled="isSaving" class="bg-[#ff8f73] hover:bg-[#ff7a59] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-lg shadow-[#ff8f73]/30 transition-all flex items-center gap-2 active:scale-95">
                  <span v-if="isSaving" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  {{ isSaving ? 'ĐANG LƯU...' : 'CẬP NHẬT MẬT KHẨU' }}
                </button>
              </div>
            </form>
          </div>

          <div class="space-y-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div class="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -z-10 group-hover:bg-sky-50 transition-colors duration-500"></div>
              
              <h3 class="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                <span class="material-symbols-outlined text-sky-500">shield_locked</span> Yêu cầu mật khẩu
              </h3>
              
              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">check_circle</span>
                  <p class="text-sm text-slate-600 font-medium">Độ dài tối thiểu <span class="font-bold text-slate-900">6 ký tự</span>.</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">check_circle</span>
                  <p class="text-sm text-slate-600 font-medium">Nên chứa cả <span class="font-bold text-slate-900">chữ cái</span> và <span class="font-bold text-slate-900">chữ số</span>.</p>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">check_circle</span>
                  <p class="text-sm text-slate-600 font-medium">Mật khẩu mới phải <span class="font-bold text-rose-500">khác</span> mật khẩu cũ.</p>
                </li>
              </ul>
            </div>

            <div class="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex flex-col gap-2">
              <h4 class="text-sm font-bold text-rose-700 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">warning</span> Quên mật khẩu hiện tại?
              </h4>
              <p class="text-xs text-rose-600/80 font-medium leading-relaxed">
                Nếu bạn không nhớ mật khẩu hiện tại, vui lòng liên hệ với Quản trị viên cấp cao (Super Admin) hoặc bộ phận IT để được hỗ trợ reset mật khẩu.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, reactive, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast';
  import { useLayoutStore } from '../../stores/layout';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  
  // Show/Hide Password State
  const showOld = ref(false);
  const showNew = ref(false);
  const showConfirm = ref(false);
  
  const isSaving = ref(false);
  const errorText = ref('');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const form = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  
  onMounted(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    if (!currentUser && !localStorage.getItem('token')) {
      router.push('/login');
    }
  });
  
  // Bắt lỗi Validation realtime khi gõ
  watch(() => form.confirmPassword, (val) => {
    if (val && form.newPassword && val !== form.newPassword) {
      errorText.value = 'Mật khẩu xác nhận không khớp!';
    } 
    else {
      errorText.value = '';
    }
  });
  
  const changePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      errorText.value = 'Mật khẩu xác nhận không khớp!';
      return;
    }
    if (form.oldPassword === form.newPassword) {
      errorText.value = 'Mật khẩu mới không được trùng với mật khẩu hiện tại!';
      return;
    }
  
    isSaving.value = true;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin_info/change_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          MaTK: currentUser.id,
          MatKhauCu: form.oldPassword,
          MatKhauMoi: form.newPassword
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Lỗi khi đổi mật khẩu");
      }
  
      toastStore.showToast("Cập nhật mật khẩu thành công!", "success");
      setTimeout(() => {
        router.push('/admin/profile');
      }, 1000);
  
    } 
    catch (error) {
      toastStore.showToast(error.message, "error");
      errorText.value = error.message; 
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