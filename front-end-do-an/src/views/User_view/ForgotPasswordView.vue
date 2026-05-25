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
                    <p class="text-on-surface-variant text-sm">
                      Mã xác thực gồm 6 chữ số đã được gửi tới <br>
                      <strong class="text-primary">{{ form.email }}</strong>
                      <button type="button" @click="step = 1" class="text-xs text-outline hover:text-white underline ml-2">Đổi Email</button>
                    </p>
                  </div>
                  <form @submit.prevent="handleVerifyOTP" class="space-y-6">
                    <div class="space-y-1.5">
                      <div class="relative group">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">password</span>
                        <input 
                          v-model="form.otp" 
                          type="text" 
                          maxlength="6" 
                          required 
                          placeholder="••••••" 
                          class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-12 pr-4 text-on-surface text-center text-2xl tracking-[1em] transition-all input-focus-glow font-bold" 
                        />
                      </div>
                    </div>
                    <button type="submit" :disabled="isSubmitting" class="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group">
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
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast.js';

  const router = useRouter();
  const toastStore = useToastStore();
  // Khởi tạo luồng các bước: 1: Email, 2: OTP, 3: Pass mới, 4: Thành công
  const step = ref(1);
  const isSubmitting = ref(false);
  const showPassword = ref(false);
  
  const form = reactive({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const API_BASE_URL = 'http://localhost:3000/api/auth';

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
       
      toastStore.showToast('Mã xác thực đã được gửi đến email của bạn!', 'success', 4000, 'top-right');
      step.value = 2; 
    } 
    catch (error) {
      toastStore.showToast(error.message || 'Không thể gửi yêu cầu, vui lòng thử lại.', 'error', 4000, 'top-right');
    } 
    finally {
      isSubmitting.value = false;
    }
  };
  
  // Xử lý Bước 2: Xác thực OTP
  const handleVerifyOTP = async () => {
    isSubmitting.value = true;
    try {
      if (form.otp.length < 6) throw new Error("Mã OTP phải đủ 6 chữ số");
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, otp: form.otp })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP không hợp lệ');
      
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
            otp: form.otp, 
            newPassword: form.newPassword 
        })
       });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể đổi mật khẩu');
      
      step.value = 4; 
      setTimeout(() => {
        router.push('/login');
      }, 5000);
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
</style>