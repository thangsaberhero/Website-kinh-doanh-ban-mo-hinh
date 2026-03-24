<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <div class="flex flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      
      <aside class="w-72 hidden md:flex flex-col border-r border-outline-variant/20 bg-surface-container-low pt-8">
        <div class="px-6 flex flex-col items-center gap-3 mb-8">
          <div class="relative group cursor-pointer">
            <div class="w-24 h-24 rounded-full border-2 border-primary/50 p-1 group-hover:border-primary transition-colors">
              <img class="w-full h-full rounded-full object-cover" alt="User Profile" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"/>
            </div>
            <div class="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full flex items-center justify-center border-2 border-surface-container-low">
              <span class="material-symbols-outlined text-[14px] text-on-primary font-bold">verified</span>
            </div>
          </div>
          <div class="text-center">
            <h3 class="font-headline font-bold text-lg text-on-surface">{{ authStore.user?.username || authStore.user?.TenKH || 'Collector' }}</h3>
            <p class="text-[10px] text-primary uppercase tracking-widest font-bold">Elite Member</p>
          </div>
        </div>

        <div class="flex flex-col gap-1 flex-1">
          <router-link to = "/profile" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">person</span>
            <span>Thông tin cá nhân</span>
          </router-link>
          <router-link to = "/change-password" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent cursor-pointer">
            <span class="material-symbols-outlined">lock</span>
            <span>Đổi mật khẩu</span>
          </router-link>
          <router-link to = "/wishlist" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">favorite</span>
            <span>Danh sách yêu thích</span>
          </router-link>
          <router-link to = "/orders" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">inventory_2</span>
            <span>Lịch sử đơn hàng</span>
          </router-link>
        </div>

        <div class="p-6 border-t border-outline-variant/10">
          <button @click="handleLogout" class="flex items-center gap-3 text-sm font-bold transition-all text-outline hover:text-error w-full">
            <span class="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header class="mb-10">
          <h1 class="text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tighter text-white mb-2">
            Đổi <span class="text-primary italic">Mật khẩu</span>
          </h1>
          <p class="text-on-surface-variant font-medium">Bảo vệ kho báu của bạn bằng cách cập nhật mật khẩu mạnh mẽ.</p>
        </header>

        <div class="glass-panel rounded-2xl relative overflow-hidden border border-outline-variant/20 shadow-2xl">
          <form @submit.prevent="updatePassword" class="relative z-10 divide-y divide-outline-variant/15">
            
            <div class="p-8 md:p-10">
              <div class="flex items-start gap-4 mb-8">
                <div class="bg-surface-container-highest p-3 rounded-lg border border-outline-variant/30 shadow-inner">
                  <span class="material-symbols-outlined text-primary">key</span>
                </div>
                <div>
                  <h4 class="text-lg font-headline font-bold text-white uppercase tracking-tight">Mật khẩu hiện tại</h4>
                  <p class="text-sm text-on-surface-variant mt-1">Nhập mật khẩu hiện tại để xác minh danh tính của bạn.</p>
                </div>
              </div>
              
              <div class="max-w-md space-y-2">
                <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Mật khẩu cũ</label>
                <div class="relative group">
                  <input 
                    v-model="form.currentPassword" 
                    :type="showCurrent ? 'text' : 'password'"
                    class="w-full bg-transparent border-none border-b-2 border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-3 px-0 font-medium input-focus-glow" 
                    placeholder="••••••••••••" 
                    required
                  />
                  <button type="button" @click="showCurrent = !showCurrent" class="absolute right-0 top-1/2 -translate-y-1/2 text-outline hover:text-white transition-colors">
                    <span class="material-symbols-outlined">{{ showCurrent ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="p-8 md:p-10">
              <div class="flex items-start gap-4 mb-8">
                <div class="bg-surface-container-highest p-3 rounded-lg border border-outline-variant/30 shadow-inner">
                  <span class="material-symbols-outlined text-tertiary">security</span>
                </div>
                <div>
                  <h4 class="text-lg font-headline font-bold text-white uppercase tracking-tight">Thiết lập mật khẩu mới</h4>
                  <p class="text-sm text-on-surface-variant mt-1">Đảm bảo mật khẩu của bạn đủ mạnh để chống lại các cuộc tấn công.</p>
                </div>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                <div class="space-y-8">
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Mật khẩu mới</label>
                    <div class="relative">
                      <input 
                        v-model="form.newPassword" 
                        :type="showNew ? 'text' : 'password'"
                        class="w-full bg-transparent border-none border-b-2 border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-3 px-0 font-medium input-focus-glow" 
                        placeholder="Nhập mật khẩu mới" 
                        required
                      />
                      <button type="button" @click="showNew = !showNew" class="absolute right-0 top-1/2 -translate-y-1/2 text-outline hover:text-white transition-colors">
                        <span class="material-symbols-outlined">{{ showNew ? 'visibility_off' : 'visibility' }}</span>
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Xác nhận mật khẩu mới</label>
                    <div class="relative">
                      <input 
                        v-model="form.confirmPassword" 
                        :type="showConfirm ? 'text' : 'password'"
                        class="w-full bg-transparent border-none border-b-2 border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-3 px-0 font-medium input-focus-glow" 
                        placeholder="Nhập lại mật khẩu mới" 
                        required
                      />
                      <button type="button" @click="showConfirm = !showConfirm" class="absolute right-0 top-1/2 -translate-y-1/2 text-outline hover:text-white transition-colors">
                        <span class="material-symbols-outlined">{{ showConfirm ? 'visibility_off' : 'visibility' }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 space-y-4 shadow-inner">
                  <h5 class="text-[10px] font-bold uppercase tracking-widest text-outline">Yêu cầu bảo mật:</h5>
                  <ul class="space-y-4">
                    <li class="flex items-center gap-3 text-sm transition-colors" :class="validations.length ? 'text-green-400' : 'text-outline-variant'">
                      <span class="material-symbols-outlined text-[18px]">{{ validations.length ? 'check_circle' : 'cancel' }}</span>
                      <span>Tối thiểu 8 ký tự</span>
                    </li>
                    <li class="flex items-center gap-3 text-sm transition-colors" :class="validations.uppercase ? 'text-green-400' : 'text-outline-variant'">
                      <span class="material-symbols-outlined text-[18px]">{{ validations.uppercase ? 'check_circle' : 'cancel' }}</span>
                      <span>Ít nhất một chữ cái viết hoa</span>
                    </li>
                    <li class="flex items-center gap-3 text-sm transition-colors" :class="validations.number ? 'text-green-400' : 'text-outline-variant'">
                      <span class="material-symbols-outlined text-[18px]">{{ validations.number ? 'check_circle' : 'cancel' }}</span>
                      <span>Ít nhất một chữ số</span>
                    </li>
                    <li class="flex items-center gap-3 text-sm transition-colors" :class="validations.special ? 'text-green-400' : 'text-outline-variant'">
                      <span class="material-symbols-outlined text-[18px]">{{ validations.special ? 'check_circle' : 'cancel' }}</span>
                      <span>Ít nhất một ký tự đặc biệt (@, #, !,...)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="p-8 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-surface-container-low/30">
              <button @click="resetForm" type="button" class="text-xs font-bold uppercase tracking-widest text-outline hover:text-white transition-colors">
                Hủy thay đổi
              </button>
              <button 
                type="submit" 
                :disabled="isSaving || !isFormValid"
                class="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest px-10 py-4 rounded-lg neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
              >
                <span v-if="isSaving" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                {{ isSaving ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU' }}
              </button>
            </div>
          </form>
        </div>

        <div class="mt-8 flex gap-4 p-6 glass-panel rounded-xl border-l-4 border-primary bg-primary/5">
          <span class="material-symbols-outlined text-primary shrink-0 text-2xl">info</span>
          <div class="text-sm text-on-surface-variant leading-relaxed">
            <strong class="text-white">Mẹo bảo mật:</strong> Đừng sử dụng mật khẩu dễ đoán như ngày sinh, tên thú cưng hoặc mật khẩu bạn đã sử dụng cho các trang web khác. 
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast'; // Đảm bảo bạn đã tạo store Toast như bài trước nhé!

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const isSaving = ref(false);

// Toggles cho con mắt hiển thị mật khẩu
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Logic bắt lỗi Real-time cho Mật khẩu mới
const validations = computed(() => ({
  length: form.newPassword.length >= 8,
  uppercase: /[A-Z]/.test(form.newPassword),
  number: /[0-9]/.test(form.newPassword),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword)
}));

// Kiểm tra form có hợp lệ để bật nút Submit không
const isFormValid = computed(() => {
  const allValid = Object.values(validations.value).every(Boolean);
  return allValid && form.currentPassword && form.newPassword === form.confirmPassword;
});

onMounted(() => {
  if (!authStore.user && !localStorage.getItem('token')) {
    router.push('/login');
  }
});

const handleLogout = () => {
  if (authStore.logout) authStore.logout();
  else localStorage.removeItem('token');
  router.push('/login');
};

const resetForm = () => {
  form.currentPassword = '';
  form.newPassword = '';
  form.confirmPassword = '';
};

const updatePassword = async () => {
  // Check xác nhận mật khẩu lại một lần nữa cho chắc ăn
  if (form.newPassword !== form.confirmPassword) {
    toastStore.showToast("Mật khẩu xác nhận không khớp!", "error");
    return;
  }

  isSaving.value = true;
  
  // Giả lập call API Backend
  setTimeout(() => {
    isSaving.value = false;
    toastStore.showToast("Cập nhật mật khẩu thành công!", "success");
    resetForm();
  }, 1500);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.glass-panel {
  background: rgba(28, 31, 43, 0.4);
  backdrop-filter: blur(16px);
}

.neon-glow {
  box-shadow: 0 0 20px rgba(255, 143, 115, 0.2);
}

.input-focus-glow:focus {
  box-shadow: 0 10px 15px -3px rgba(255, 143, 115, 0.05);
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
</style>