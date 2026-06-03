<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center relative overflow-hidden">
    
    <router-link to="/login" class="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/10 transition-all group">
      <span class="material-symbols-outlined text-white/80 text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
      <span class="text-sm font-bold text-white/90 tracking-wide">Quay lại</span>
    </router-link>

    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tertiary/5"></div>
      <img alt="Background mecha" class="w-full h-full object-cover opacity-20 grayscale blur-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ4syu3OaAgN3MlEWk5NTPIpnOEp9ocEhE581faqIp_5iHa3mje_hmFlZuBaM4m3KknzD-9VyZvgRJiTWZ-H6kPhtp7B7c1zkOohdn-4x4_AXZzuQ09GIQBc81CrKBl4eBReD2G4swAZ-f419IAJcsBQbno8kCqLCBjKV4YQcFuh41jzT9R8PJH5v6We2egwtvj5PB3J2kHkuklsTI6Xghx8n7auZvc-8qDLMbiQXXqF2AlrT6Lum7qXxDIxj8wlsVRIScgb8Bt-jX"/>
    </div>

    <main class="relative z-10 w-full max-w-6xl p-4 md:p-8">
      <div class="animate-slide-up glass-panel w-full overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row min-h-[750px]">
        
        <div class="hidden lg:flex lg:w-3/5 relative min-h-[600px] border-r border-white/5">
          <div class="absolute inset-0 z-0">
            <img alt="Cinematic Gundam" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ4syu3OaAgN3MlEWk5NTPIpnOEp9ocEhE581faqIp_5iHa3mje_hmFlZuBaM4m3KknzD-9VyZvgRJiTWZ-H6kPhtp7B7c1zkOohdn-4x4_AXZzuQ09GIQBc81CrKBl4eBReD2G4swAZ-f419IAJcsBQbno8kCqLCBjKV4YQcFuh41jzT9R8PJH5v6We2egwtvj5PB3J2kHkuklsTI6Xghx8n7auZvc-8qDLMbiQXXqF2AlrT6Lum7qXxDIxj8wlsVRIScgb8Bt-jX"/>
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30"></div>
          </div>
          <div class="relative z-10 w-full p-12 flex flex-col justify-between">
            <div>
              <router-link to="/" class="inline-flex items-center gap-2 group transition-all">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                  <span class="font-headline text-2xl font-bold tracking-tight text-white">FigureCollect</span>
                </div>
              </router-link>
            </div>
            
            <div class="max-w-xl">
              <h1 class="font-headline text-6xl font-bold text-white leading-tight mb-6 -ml-1">
                Khôi phục quyền truy cập vào <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">FigureCollect</span>
              </h1>
              <p class="text-on-surface-variant text-lg max-w-md font-light leading-relaxed">
                Đừng để bộ sưu tập của bạn bị đóng bụi. Hãy lấy lại quyền truy cập và tiếp tục hành trình săn tìm những tạo tác quý hiếm.
              </p>
            </div>
          </div>
        </div>

        <div class="w-full lg:w-2/5 p-8 md:p-12 lg:p-14 bg-surface/20 backdrop-blur-md flex flex-col justify-center overflow-y-auto">
          <div class="w-full max-w-md mx-auto relative min-h-[450px] flex flex-col justify-center">
            
            <div class="lg:hidden flex items-center justify-between mb-12 absolute top-0 left-0 w-full">
              <router-link to="/login" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-on-surface/80">arrow_back</span>
                <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                <span class="font-headline text-xl font-bold tracking-tight">FigureCollect</span>
              </router-link>
            </div>

            <div class="w-full max-w-[350px] mx-auto mb-10 relative hidden sm:block">
              <div class="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-white/20 rounded-full z-0"></div>
              <div class="absolute left-0 top-4 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-out" :style="{ width: ((step - 1) / 3) * 100 + '%' }"></div>
              
              <div class="flex justify-between relative z-10">
                <div v-for="i in 4" :key="i" class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2"
                      :class="step >= i ? 'bg-primary border-primary text-on-primary shadow-[0_0_15px_rgba(255,143,115,0.4)]' : 'bg-surface/80 border-outline/30 text-on-surface-variant backdrop-blur-md'">
                  <span v-if="step > i" class="material-symbols-outlined text-base">check</span>
                  <span v-else>{{ i }}</span>
                </div>
              </div>

              <div class="flex justify-between mt-2 text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                <span :class="step >= 1 ? 'text-primary' : ''">Email</span>
                <span :class="step >= 2 ? 'text-primary' : ''">Xác thực</span>
                <span :class="step >= 3 ? 'text-primary' : ''">Đổi Pass</span>
                <span :class="step >= 4 ? 'text-primary' : ''">Hoàn tất</span>
              </div>
            </div>

            <transition name="fade-slide" mode="out-in">              
              
              <div v-if="step === 1" key="step1">
                <div class="mb-10 text-center">
                  <h2 class="font-headline text-4xl font-bold text-on-surface mb-3">Quên mật khẩu</h2>
                  <p class="text-on-surface-variant">Đừng lo lắng, chúng tôi sẽ gửi hướng dẫn khôi phục qua email cho bạn.</p>
                </div>

                <form @submit.prevent="handleRequestOTP" class="space-y-6">
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-on-surface-variant ml-1" for="email">Địa chỉ Email</label>
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                      <input 
                        v-model="form.email" 
                        id="email" 
                        type="email" 
                        required
                        placeholder="name@example.com" 
                        class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-12 pr-4 text-on-surface transition-all input-focus-glow"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    :disabled="isSubmitting"
                    class="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>{{ isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục' }}</span>
                    <span v-if="!isSubmitting" class="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                  </button>
                </form>
                
                <div class="mt-5 text-center">
                  <router-link to="/login" class="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm font-medium">
                    <span class="material-symbols-outlined text-sm">keyboard_backspace</span>
                    Quay lại Đăng nhập
                  </router-link>
                </div>
              </div>

              <div v-else-if="step === 2" key="step2">
                <div class="mb-10 text-center">
                  <h2 class="font-headline text-4xl font-bold text-on-surface mb-3">Nhập mã OTP</h2>
                  <p class="text-on-surface-variant text-sm mb-4">
                    Mã xác thực gồm 6 chữ số đã được gửi tới <br>
                    <strong class="text-primary">{{ form.email }}</strong>
                    <button type="button" @click="step = 1" class="text-xs text-outline hover:text-white underline ml-2">Đổi Email</button>
                  </p>

                  <div class="inline-flex items-center justify-center py-2 px-4 rounded-full bg-surface-container/50 border border-white/5">
                    <div v-if="countdown > 0" class="flex items-center gap-2 text-sm">
                      <span class="material-symbols-outlined text-tertiary text-lg animate-pulse">timer</span>
                      <span class="text-on-surface-variant">Mã hết hạn sau:</span>
                      <span class="font-bold text-tertiary font-mono text-base tracking-widest">{{ formattedTime }}</span>
                    </div>
                    <div v-else class="flex items-center gap-2 text-sm">
                      <span class="material-symbols-outlined text-error text-lg">error</span>
                      <span class="text-error font-medium">Mã OTP đã hết hạn!</span>
                      <button 
                        type="button" 
                        @click="handleResendOTP" 
                        :disabled="isSubmitting"
                        class="ml-2 font-bold text-primary hover:underline underline-offset-2 transition-all disabled:opacity-50"
                      >
                        Gửi lại mã
                      </button>
                    </div>
                  </div>
                </div>

                <form @submit.prevent="handleVerifyOTP" class="space-y-6">
                  <div class="space-y-1.5">
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">password</span>
                      <input 
                        v-model="form.otp"
                        @input="form.otp = form.otp.replace(/\D/g, '')"
                        inputmode="numeric" 
                        type="text" 
                        maxlength="6" 
                        required 
                        :disabled="countdown === 0"
                        placeholder="••••••" 
                        class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-12 pr-4 text-on-surface text-center text-2xl tracking-[1em] transition-all input-focus-glow font-bold disabled:opacity-50" 
                      />
                    </div>
                  </div>
                  <button type="submit" :disabled="isSubmitting || countdown === 0" class="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group">
                    <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>{{ isSubmitting ? 'Đang xác thực...' : 'Xác thực mã' }}</span>
                  </button>
                </form>
              </div>

              <div v-else-if="step === 3" key="step3">
                <div class="mb-10 text-center">
                  <h2 class="font-headline text-3xl font-bold text-on-surface mb-3">Tạo mật khẩu mới</h2>
                  <p class="text-on-surface-variant">Mã OTP hợp lệ. Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn.</p>
                </div>
                <form @submit.prevent="handleResetPassword" class="space-y-6">
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-on-surface-variant ml-1">Mật khẩu mới</label>
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                      <input v-model="form.newPassword" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-12 pr-12 text-on-surface transition-all input-focus-glow" />
                      <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                        <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                      </button>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium text-on-surface-variant ml-1">Nhập lại mật khẩu mới</label>
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock_reset</span>
                      <input v-model="form.confirmPassword" type="password" required placeholder="••••••••" class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-12 pr-4 text-on-surface transition-all input-focus-glow" />
                    </div>
                  </div>
                  <button type="submit" :disabled="isSubmitting" class="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>{{ isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}</span>
                  </button>
                </form>
              </div>

              <div v-else-if="step === 4" key="step4" class="text-center">
                <div class="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <span class="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                </div>
                <h2 class="font-headline text-3xl font-bold text-on-surface mb-3">Thành công!</h2>
                <p class="text-on-surface-variant text-sm leading-relaxed mb-8">
                  Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay bây giờ.
                </p>
                <div class="flex items-center justify-center gap-2 text-primary font-bold text-sm animate-pulse">
                  <span class="material-symbols-outlined text-lg">sync</span>
                  Đang tự động chuyển về trang Đăng nhập...
                </div>
              </div>
            </transition> 
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast.js';

  const router = useRouter();
  const toastStore = useToastStore();

  const step = ref(1);
  const isSubmitting = ref(false);
  const showPassword = ref(false);

  // State lưu Token nhận về từ API bảo mật JWT
  const forgotToken = ref('');
  const resetToken = ref('');

  // Quản lý đồng hồ đếm ngược
  const countdown = ref(0);
  let timerInterval = null;

  const form = reactive({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/auth';

  // Định dạng hiển thị thời gian MM:SS
  const formattedTime = computed(() => {
    const minutes = Math.floor(countdown.value / 60).toString().padStart(2, '0');
    const seconds = (countdown.value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  // Bắt đầu đếm ngược 5 phút (300 giây)
  const startTimer = () => {
    countdown.value = 300;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(timerInterval);
      }
    }, 1000);
  };

  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  // Xử lý Bước 1: Yêu cầu gửi OTP
  const handleRequestOTP = async () => {
    isSubmitting.value = true;
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
    
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi hệ thống');
      
      // Lưu lại forgotToken từ server trả về
      forgotToken.value = data.forgotToken;
      toastStore.showToast('Mã xác thực đã được gửi đến email của bạn!', 'success', 4000, 'top-right');
      
      step.value = 2; 
      startTimer(); // Khởi chạy bộ đếm ngược
    } 
    catch (error) {
      toastStore.showToast(error.message || 'Không thể gửi yêu cầu, vui lòng thử lại.', 'error', 4000, 'top-right');
    } 
    finally {
      isSubmitting.value = false;
    }
  };

  // Hàm xử lý nút bấm "Gửi lại mã" khi hết thời gian
  const handleResendOTP = async () => {
    isSubmitting.value = true;
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
    
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi hệ thống');
      
      forgotToken.value = data.forgotToken;
      form.otp = ''; // Reset rỗng ô nhập liệu mã cũ
      toastStore.showToast('Mã xác thực mới đã được gửi lại!', 'success', 4000, 'top-right');
      
      startTimer(); // Reset lại đồng hồ đếm ngược 5 phút mới
    } 
    catch (error) {
      toastStore.showToast(error.message || 'Không thể gửi lại yêu cầu, vui lòng thử lại.', 'error', 4000, 'top-right');
    } 
    finally {
      isSubmitting.value = false;
    }
  };

  // Xử lý Bước 2: Xác thực OTP và nhận resetToken chứng nhận
  const handleVerifyOTP = async () => {
    isSubmitting.value = true;
    try {
      if (form.otp.length < 6) throw new Error("Mã OTP phải đủ 6 chữ số");
      
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              email: form.email, 
              otp: form.otp,
              forgotToken: forgotToken.value // Truyền kèm token chứa mã OTP gốc mã hóa
          })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP không hợp lệ');
      
      // Lưu token chứng nhận xác thực thành công từ backend trả ra
      resetToken.value = data.resetToken;
      if (timerInterval) clearInterval(timerInterval); // Dừng đồng hồ đếm ngược

      toastStore.showToast('Xác thực thành công! Vui lòng tạo mật khẩu mới.', 'success', 3000, 'top-right');
      step.value = 3; 
    } 
    catch (error) {
      toastStore.showToast(error.message || 'Xác thực thất bại!', 'error', 4000, 'top-right');
    } 
    finally {
      isSubmitting.value = false;
    }
  };

  // Xử lý Bước 3: Đổi mật khẩu
  const handleResetPassword = async () => {
    isSubmitting.value = true;
    try {
      if (form.newPassword !== form.confirmPassword) {
        toastStore.showToast("Mật khẩu nhập lại không khớp!", 'warning', 3500, 'top-right');
        return; 
      }
      if (form.newPassword.length < 6) {
        toastStore.showToast("Mật khẩu phải dài ít nhất 6 ký tự!", 'warning', 3500, 'top-right');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: form.email, 
            resetToken: resetToken.value, 
            newPassword: form.newPassword 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể đổi mật khẩu');
      
      step.value = 4; 
      setTimeout(() => {
        router.push('/login');
      }, 4000);
    } 
    catch (error) {
      toastStore.showToast(error.message || 'Lỗi khi cập nhật mật khẩu.', 'error', 4000, 'top-right');
    } 
    finally {
      isSubmitting.value = false;
    }
  };
</script>

<style scoped>  
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

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(15px);
  }
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-15px);
  }
</style>