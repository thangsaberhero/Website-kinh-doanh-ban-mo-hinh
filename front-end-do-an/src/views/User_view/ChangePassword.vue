<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    <TheHeader />
    <div class="flex flex-col md:flex-row flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      <UserSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header class="mb-10">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tighter text-white mb-2">
            Đổi <span class="text-primary italic">Mật khẩu</span>
          </h1>
          <p class="text-on-surface-variant font-medium">Bảo vệ kho báu của bạn bằng cách cập nhật mật khẩu mạnh mẽ.</p>
        </header>

        <div class="glass-panel p-5 md:p-10 rounded-2xl relative overflow-hidden border border-outline-variant/20 shadow-2xl">
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
              <button @click="resetForm" type="button" class="flex-1 md:flex-none py-3.5 md:py-0 text-xs font-bold uppercase tracking-widest text-outline bg-surface-container md:bg-transparent border border-outline-variant/30 md:border-transparent rounded-lg md:rounded-none hover:text-white transition-colors text-center">
                Hủy thay đổi
              </button>
              <button 
                type="submit" 
                :disabled="isSaving || !isFormValid"
                class="flex-[2] md:flex-none w-full sm:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest px-0 md:px-8 py-3.5 rounded-lg neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center md:justify-start gap-2"
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
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth';
  import { useToastStore } from '../../stores/toast';
  import TheHeader from '../../components/TheHeader.vue';
  import UserSidebar from '../../components/UserSidebar.vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

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
    if (!authStore.user && !localStorage.getItem('token')) {
      router.push('/login');
    }
    else if (currentUser?.isSocialAuth === true) {
      toastStore.showToast("Tài khoản liên kết Google/Facebook không thể sử dụng chức năng đổi mật khẩu!", "error");
      router.push('/profile');
    }
  });

  const resetForm = () => {
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
  };

  const updatePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toastStore.showToast("Mật khẩu xác nhận không khớp!", "error");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toastStore.showToast("Vui lòng đăng nhập lại!", "error");
      router.push('/login');
      return;
    }

    isSaving.value = true;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toastStore.showToast("🎉 " + data.message, "success");
        resetForm(); 
      } 
      else {
        toastStore.showToast("⚠️ " + (data.message || "Lỗi đổi mật khẩu!"), "error");
      }
    } 
    catch (error) {
      console.error("Lỗi kết nối:", error);
      toastStore.showToast("Lỗi kết nối đến máy chủ!", "error");
    } 
    finally {
      isSaving.value = false;
    }
  };
</script>

<style scoped>
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