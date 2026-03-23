<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center relative overflow-hidden">
    
    <router-link to="/login" class="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/10 transition-all group">
      <span class="material-symbols-outlined text-white/80 text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
      <span class="text-sm font-bold text-white/90 tracking-wide">Quay lại đăng nhập</span>
    </router-link>

    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tertiary/5"></div>
      <img alt="Background mecha" class="w-full h-full object-cover opacity-20 grayscale blur-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK5I8y1D8C2v9X2FdoYJCWYMINyNspI_dq1venZsysS-XWxigu40_RSmx6oq5mY2QkBUj9dtnNKZlbIhR3VmMOGV5bIW7mFyaFVR5XPox9LMswJYph81spiStN4f4M-G0U1MkdLSCniqgh0z5PlRsNWA-_xVoVGVj87uVEYqHcfzbq4TG3ojkO8f5ukSL2je7mtgsEzyWrlw4Q4y39Inq2PErpIa7IP4lJKNM2ARjrstjOp0ZawegoLRzestaMUdnBALjIPL_-E1o"/>
    </div>

    <main class="relative z-10 w-full max-w-6xl p-4 md:p-8">
      <div class="animate-slide-up glass-panel w-full overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row min-h-[750px]">
        
        <div class="hidden lg:flex lg:w-3/5 relative min-h-[600px] border-r border-white/5">
          <div class="absolute inset-0 z-0">
            <img alt="High-end collectible mecha figure" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK5I8y1D8C2v9X2FdoYJCWYMINyNspI_dq1venZsysS-XWxigu40_RSmx6oq5mY2QkBUj9dtnNKZlbIhR3VmMOGV5bIW7mFyaFVR5XPox9LMswJYph81spiStN4f4M-G0U1MkdLSCniqgh0z5PlRsNWA-_xVoVGVj87uVEYqHcfzbq4TG3ojkO8f5ukSL2je7mtgsEzyWrlw4Q4y39Inq2PErpIa7IP4lJKNM2ARjrstjOp0ZawegoLRzestaMUdnBALjIPL_-E1o"/>
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30"></div>
          </div>
          <div class="relative z-10 w-full p-12 flex flex-col justify-between">
            <div>
              <div class="inline-flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                <span class="font-headline text-2xl font-bold tracking-tight text-white">FigureCollect</span>
              </div>
            </div>
            <div class="max-w-xl">
              <span class="inline-block px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md border border-tertiary/30">New Member</span>
              <h1 class="font-headline text-5xl font-bold text-white leading-tight mb-6 -ml-1">
                Bắt đầu hành trình <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Sưu tầm</span> của bạn
              </h1>
              <p class="text-white/90 text-sm font-medium leading-[1.8] max-w-md line-clamp-2">
                Gia nhập cộng đồng FigureCollect để sở hữu và truy xuất nguồn gốc những mô hình giới hạn.
              </p>
            </div>
            <div class="flex items-center gap-12 border-t border-white/10 pt-8">
              <div>
                <div class="text-xs text-white/70 uppercase tracking-widest mb-1 font-semibold">Cộng đồng</div>
                <div class="font-headline text-xl font-semibold text-white">10K+ Members</div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full lg:w-2/5 p-8 md:p-10 lg:p-12 bg-surface/20 backdrop-blur-md flex flex-col justify-center overflow-y-auto custom-scrollbar">
          <div class="w-full max-w-md mx-auto">
            
            <div class="lg:hidden flex items-center gap-2 mb-10">
              <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
              <span class="font-headline text-xl font-bold tracking-tight">FigureCollect</span>
            </div>

            <div class="mb-8 text-center">
              <h2 class="font-headline text-3xl font-bold text-on-surface mb-2">Đăng ký</h2>
              <p class="text-on-surface-variant text-sm">Tạo tài khoản mới hoàn toàn miễn phí.</p>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-4">
              
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-on-surface-variant ml-1">Tên đăng nhập</label>
                <div class="relative group">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">person</span>
                  <input 
                    v-model="form.username" 
                    type="text" 
                    required
                    placeholder="VD: gundam_hunter" 
                    class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-4 text-sm text-on-surface transition-all input-focus-glow"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-on-surface-variant ml-1">Email</label>
                <div class="relative group">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    required
                    placeholder="name@example.com" 
                    class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-4 text-sm text-on-surface transition-all input-focus-glow"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-on-surface-variant ml-1">Mật khẩu</label>
                <div class="relative group">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    v-model="form.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    required
                    placeholder="••••••••" 
                    class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-11 text-sm text-on-surface transition-all input-focus-glow"
                  />
                  <button 
                    type="button" 
                    @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span class="material-symbols-outlined text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-on-surface-variant ml-1">Xác nhận mật khẩu</label>
                <div class="relative group">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">verified_user</span>
                  <input 
                    v-model="form.confirmPassword" 
                    :type="showPassword ? 'text' : 'password'" 
                    required
                    placeholder="••••••••" 
                    class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-4 text-sm text-on-surface transition-all input-focus-glow"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                :disabled="isLoading"
                class="w-full mt-4 py-3.5 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {{ isLoading ? 'Đang xử lý...' : 'Tạo tài khoản' }}
              </button>
            </form>

            <p class="mt-8 text-center text-on-surface-variant text-xs">
              Đã có tài khoản? 
              <router-link to="/login" class="text-tertiary font-bold hover:underline decoration-2 underline-offset-4 transition-all">
                Đăng nhập ngay
              </router-link>
            </p>
            
          </div>
        </div>
      </div>
    </main>

    <Transition name="slide-fade">
      <div 
        v-if="toastMessage" 
        :class="[
          'fixed bottom-8 right-8 flex items-center gap-3 px-5 py-4 border rounded-xl shadow-2xl z-50 max-w-sm',
          toastType === 'error' ? 'bg-surface-container-highest border-error/50 text-error-dim' : 'bg-surface-container-highest border-green-500/50 text-green-400'
        ]"
      >
        <span class="material-symbols-outlined" :class="toastType === 'error' ? 'text-error' : 'text-green-500'">
          {{ toastType === 'error' ? 'error' : 'check_circle' }}
        </span>
        <span class="text-sm font-medium">{{ toastMessage }}</span>
        <button @click="toastMessage = ''" class="ml-auto text-on-surface-variant hover:text-white transition-colors">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// Form đăng ký có thêm trường email và confirmPassword
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const showPassword = ref(false);
const isLoading = ref(false);

// Xử lý Toast (Thêm type để biết là lỗi hay thành công)
const toastMessage = ref('');
const toastType = ref('error'); // 'error' hoặc 'success'
let toastTimeout = null;

const showToast = (message, type = 'error') => {
  toastMessage.value = message;
  toastType.value = type;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMessage.value = '';
  }, 3500); 
};

// Hàm xử lý Đăng ký
const handleRegister = async () => {
  // 1. Kiểm tra mật khẩu nhập lại có khớp không trước khi gọi server
  if (form.password !== form.confirmPassword) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }

  isLoading.value = true;
  toastMessage.value = '';

  try {
    // Delay nhẹ tạo cảm giác đang xử lý mượt mà
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Gọi API sang Backend (Hiện tại API này bạn chưa viết, tôi cứ để sẵn)
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      TenDN: form.username,
      Email: form.email,
      MatKhau: form.password
    });
    
    // Báo thành công màu xanh lá
    showToast('Đăng ký thành công! Đang chuyển hướng...', 'success');
    
    // Tự động chuyển về trang Đăng nhập sau 2 giây
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    // Hiển thị lỗi từ server (VD: Tên đăng nhập đã tồn tại)
    const errorMsg = error.response?.data?.message || 'Lỗi kết nối máy chủ, vui lòng thử lại.';
    showToast(errorMsg, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
}

.input-focus-glow:focus {
  box-shadow: 0 4px 20px -5px rgba(255, 143, 115, 0.3);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(50px);
  opacity: 0;
}
</style>