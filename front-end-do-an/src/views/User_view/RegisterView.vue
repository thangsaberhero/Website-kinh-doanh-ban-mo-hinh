<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center relative overflow-hidden">
    
    <router-link to="/login" class="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/10 transition-all group">
      <span class="material-symbols-outlined text-white/80 text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
      <span class="text-sm font-bold text-white/90 tracking-wide">Quay lại đăng nhập</span>
    </router-link>

    <!-- NỀN MỜ PHÍA SAU (Đồng bộ với Slider) -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tertiary/5 z-10"></div>
      <transition name="fade">
        <img 
          v-if="systemStore.settings.login_bg && systemStore.settings.login_bg.length > 0"
          :key="currentBgIndex"
          class="absolute inset-0 w-full h-full object-cover opacity-20 grayscale blur-sm" 
          :src="systemStore.settings.login_bg[currentBgIndex]" 
        />
        <img 
          v-else
          class="absolute inset-0 w-full h-full object-cover opacity-20 grayscale blur-sm" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK5I8y1D8C2v9X2FdoYJCWYMINyNspI_dq1venZsysS-XWxigu40_RSmx6oq5mY2QkBUj9dtnNKZlbIhR3VmMOGV5bIW7mFyaFVR5XPox9LMswJYph81spiStN4f4M-G0U1MkdLSCniqgh0z5PlRsNWA-_xVoVGVj87uVEYqHcfzbq4TG3ojkO8f5ukSL2je7mtgsEzyWrlw4Q4y39Inq2PErpIa7IP4lJKNM2ARjrstjOp0ZawegoLRzestaMUdnBALjIPL_-E1o"
        />
      </transition>
    </div>

    <main class="relative z-10 w-full max-w-6xl p-4 md:p-8">
      <div class="animate-slide-up glass-panel w-full overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row min-h-[750px]">
        
        <!-- NỬA TRÁI: SLIDER ẢNH NỀN -->
        <div class="hidden lg:flex lg:w-3/5 relative min-h-[600px] border-r border-white/5 overflow-hidden">
          <div class="absolute inset-0 z-0">
            <!-- Khối luân phiên ảnh -->
            <transition name="fade">
              <img 
                v-if="systemStore.settings.login_bg && systemStore.settings.login_bg.length > 0"
                :key="currentBgIndex" 
                :src="systemStore.settings.login_bg[currentBgIndex]" 
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 scale-105"
              />
              <img 
                v-else 
                class="absolute inset-0 w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK5I8y1D8C2v9X2FdoYJCWYMINyNspI_dq1venZsysS-XWxigu40_RSmx6oq5mY2QkBUj9dtnNKZlbIhR3VmMOGV5bIW7mFyaFVR5XPox9LMswJYph81spiStN4f4M-G0U1MkdLSCniqgh0z5PlRsNWA-_xVoVGVj87uVEYqHcfzbq4TG3ojkO8f5ukSL2je7mtgsEzyWrlw4Q4y39Inq2PErpIa7IP4lJKNM2ARjrstjOp0ZawegoLRzestaMUdnBALjIPL_-E1o"
              />
            </transition>
            <!-- Lớp phủ cho dễ đọc chữ -->
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30"></div>
          </div>
          
          <div class="relative z-10 w-full p-12 flex flex-col justify-between">
            <div>
              <router-link to="/" class="inline-flex items-center gap-2 group transition-all">
                <!-- Tự động load Logo Header nếu có, không có thì dùng Icon mặc định -->
                <div class="flex items-center gap-2">
                  <img v-if="systemStore.settings.logo_header" :src="systemStore.settings.logo_header" class="h-8 object-contain" alt="Logo"/>
                  <template v-else>
                    <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                    <span class="font-headline text-2xl font-bold tracking-tight text-white">{{ systemStore.settings.shop_name || 'FigureCollect' }}</span>
                  </template>
                </div>
              </router-link>
            </div>
            <div class="max-w-xl">
              <span class="inline-block px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md border border-tertiary/30">New Member</span>
              <h1 class="font-headline text-5xl font-bold text-white leading-tight mb-6 -ml-1 drop-shadow-md">
                Bắt đầu hành trình <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Sưu tầm</span> của bạn
              </h1>
              <p class="text-white/90 text-sm font-medium leading-[1.8] max-w-md line-clamp-2 drop-shadow-sm">
                Gia nhập cộng đồng {{ systemStore.settings.shop_name || 'FigureCollect' }} để sở hữu và truy xuất nguồn gốc những mô hình giới hạn.
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

        <!-- NỬA PHẢI: FORM ĐĂNG KÝ -->
        <div class="w-full lg:w-2/5 p-8 md:p-10 lg:p-12 bg-surface/20 backdrop-blur-md flex flex-col justify-center overflow-y-auto custom-scrollbar">
          <div class="w-full max-w-md mx-auto relative min-h-[500px] flex flex-col justify-center">
            
            <!-- Hiển thị Tên thương hiệu động ở bản Mobile -->
            <div class="lg:hidden flex items-center gap-2 mb-10 absolute top-0 left-0">
              <router-link to="/" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                <span class="font-headline text-xl font-bold tracking-tight">{{ systemStore.settings.shop_name || 'FigureCollect' }}</span>
              </router-link>
            </div>

            <div class="w-full max-w-xs mx-auto mb-10 relative hidden sm:block">
              <div class="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-white/20 rounded-full z-0"></div>
              <div class="absolute left-0 top-4 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-out" :style="{ width: ((step - 1) / 2) * 100 + '%' }"></div>
              
              <div class="flex justify-between relative z-10">
                <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2"
                     :class="step >= i ? 'bg-primary border-primary text-on-primary shadow-[0_0_15px_rgba(255,143,115,0.4)]' : 'bg-surface/80 border-outline/30 text-on-surface-variant backdrop-blur-md'">
                  <span v-if="step > i" class="material-symbols-outlined text-base">check</span>
                  <span v-else>{{ i }}</span>
                </div>
              </div>
              
              <div class="flex justify-between mt-2 text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                <span :class="step >= 1 ? 'text-primary' : ''">Thông tin</span>
                <span :class="step >= 2 ? 'text-primary' : ''" class="ml-2">Xác thực</span>
                <span :class="step >= 3 ? 'text-primary' : ''">Hoàn tất</span>
              </div>
            </div>

            <transition name="fade-slide" mode="out-in">              
              <div v-if="step === 1" key="step1">
                <div class="mb-8 text-center">
                  <h2 class="font-headline text-3xl font-bold text-on-surface mb-2">Đăng ký</h2>
                  <p class="text-on-surface-variant text-sm">Tạo tài khoản mới hoàn toàn miễn phí.</p>
                </div>

                <form @submit.prevent="handlePreRegister" class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-on-surface-variant ml-1">Tên đăng nhập</label>
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">person</span>
                      <input v-model="form.username" type="text" required placeholder="VD: gundam_hunter" class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-4 text-sm text-on-surface transition-all input-focus-glow" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-on-surface-variant ml-1">Email</label>
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">alternate_email</span>
                      <input v-model="form.email" type="email" required placeholder="name@example.com" class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-4 text-sm text-on-surface transition-all input-focus-glow" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-on-surface-variant ml-1">Mật khẩu</label>
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">lock</span>
                      <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-11 text-sm text-on-surface transition-all input-focus-glow" />
                      <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                        <span class="material-symbols-outlined text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                      </button>
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-on-surface-variant ml-1">Xác nhận mật khẩu</label>
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">verified_user</span>
                      <input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-11 pr-4 text-sm text-on-surface transition-all input-focus-glow" />
                    </div>
                  </div>

                  <button type="submit" :disabled="isLoading" class="w-full mt-6 py-3.5 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group">
                    <span v-if="isLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>{{ isLoading ? 'Đang gửi mã...' : 'Tiếp tục' }}</span>
                    <span v-if="!isLoading" class="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
                  </button>
                </form>

                <p class="mt-8 text-center text-on-surface-variant text-xs">
                  Đã có tài khoản? 
                  <router-link to="/login" class="text-tertiary font-bold hover:underline decoration-2 underline-offset-4 transition-all">
                    Đăng nhập ngay
                  </router-link>
                </p>
              </div>

              <div v-else-if="step === 2" key="step2">
                <div class="mb-10 text-center">
                  <h2 class="font-headline text-3xl font-bold text-on-surface mb-3">Xác nhận Email</h2>
                  <p class="text-on-surface-variant text-sm mb-4">
                    Mã xác thực gồm 6 chữ số đã được gửi tới <br>
                    <strong class="text-primary">{{ form.email }}</strong>
                    <button type="button" @click="step = 1" class="text-xs text-outline hover:text-white underline ml-2">Sửa Email</button>
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
                        :disabled="isLoading"
                        class="ml-2 font-bold text-primary hover:underline underline-offset-2 transition-all disabled:opacity-50"
                      >
                        Gửi lại mã
                      </button>
                    </div>
                  </div>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-6">
                  <div class="space-y-1.5">
                    <div class="relative group">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">password</span>
                      <input 
                        v-model="otpCode"
                        @input="otpCode = otpCode.replace(/\D/g, '')"
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
                  <button type="submit" :disabled="isLoading || countdown === 0" class="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group">
                    <span v-if="isLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>{{ isLoading ? 'Đang xử lý...' : 'Xác thực & Tạo tài khoản' }}</span>
                  </button>
                </form>
              </div>

              <div v-else-if="step === 3" key="step3" class="text-center">
                <div class="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <span class="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                </div>
                <h2 class="font-headline text-3xl font-bold text-on-surface mb-3">Tạo tài khoản thành công!</h2>
                <p class="text-on-surface-variant text-sm leading-relaxed mb-8">
                  Chào mừng <strong>{{ form.username }}</strong> gia nhập cộng đồng {{ systemStore.settings.shop_name || 'FigureCollect' }}.
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
  import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast.js';
  import { useSystemStore } from '../../stores/system.js';

  const router = useRouter();
  const toastStore = useToastStore();
  const systemStore = useSystemStore();

  const step = ref(1); // 1: Info, 2: OTP, 3: Success
  const registerToken = ref(''); 
  const otpCode = ref(''); 

  const form = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const showPassword = ref(false);
  const isLoading = ref(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const countdown = ref(0); 
  let timerInterval = null;

  // Biến đếm và Timer để chuyển đổi ảnh Slider
  const currentBgIndex = ref(0);
  let bgTimer = null;

  onMounted(async () => {
    // Kích hoạt gọi API để lấy dữ liệu cài đặt
    await systemStore.fetchSettings();

    // Cài đặt đồng hồ chuyển ảnh mỗi 4 giây (chỉ chạy khi mảng có từ 2 ảnh trở lên)
    bgTimer = setInterval(() => {
      const bgArray = systemStore.settings?.login_bg;
      if (bgArray && bgArray.length > 1) {
        currentBgIndex.value = (currentBgIndex.value + 1) % bgArray.length;
      }
    }, 4000); 
  });

  // Format thời gian từ giây sang dạng MM:SS (VD: 04:59)
  const formattedTime = computed(() => {
    const minutes = Math.floor(countdown.value / 60).toString().padStart(2, '0');
    const seconds = (countdown.value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  // Hàm bắt đầu đếm ngược 5 phút (300 giây)
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

  // Hủy bộ đếm khi rời khỏi trang để tránh rò rỉ bộ nhớ
  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (bgTimer) clearInterval(bgTimer);
  });

  // BƯỚC 1: Lấy mã OTP
  const handlePreRegister = async () => {
    if (form.password !== form.confirmPassword) {
      toastStore.showToast('Mật khẩu xác nhận không khớp!', 'warning', 3500, 'top-right');
      return;
    }
    if (form.password.length < 6) {
      toastStore.showToast("Mật khẩu phải dài ít nhất 6 ký tự!", 'warning', 3500, 'top-right');
      return;
    }
    
    isLoading.value = true;
    try {
      const payload = {
        TenDN: form.username,
        email: form.email
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi kiểm tra từ Server!');
      }

      registerToken.value = data.registerToken;
      toastStore.showToast('Mã OTP đã được gửi!', 'success', 3000, 'top-right');
      step.value = 2;
      startTimer();      
    } 
    catch (error) {
      console.error("Lỗi đăng ký B1:", error);
      toastStore.showToast(error.message || 'Lỗi kết nối, vui lòng thử lại.', 'error', 4000, 'top-right');
    } 
    finally {
      isLoading.value = false;
    }
  };

  // BƯỚC 2: Xác thực & Tạo tài khoản
  const handleRegister = async () => {
    if (!otpCode.value || otpCode.value.length !== 6) {
        toastStore.showToast('Vui lòng nhập đủ 6 số OTP!', 'warning', 3000, 'top-right');
        return;
    }

    isLoading.value = true;
    try {
      const payload = {
        TenDN: form.username,
        email: form.email,
        MatKhau: form.password,
        otp: otpCode.value,
        registerToken: registerToken.value
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi đăng ký từ Server!');
      }
      
      step.value = 3; // Chuyển sang màn hình "Thành công"
      
      // Chờ 3 giây rồi chuyển trang
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } 
    catch (error) {
      console.error("Lỗi đăng ký B2:", error);
      toastStore.showToast(error.message || 'Mã OTP không đúng hoặc đã hết hạn.', 'error', 4000, 'top-right');
    } 
    finally {
      isLoading.value = false;
    }
  };

  // Hàm xử lý khi bấm nút "Gửi lại mã"
  const handleResendOTP = async () => {
    isLoading.value = true;
    try {
      const payload = {
        TenDN: form.username,
        email: form.email
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi hệ thống khi gửi lại mã!');
      }

      // Cập nhật lại Token mới và reset ô nhập
      registerToken.value = data.registerToken;
      otpCode.value = '';
      
      toastStore.showToast('Đã gửi lại mã OTP mới!', 'success', 3000, 'top-right');
      startTimer(); // Khởi động lại bộ đếm 5 phút
      
    } 
    catch (error) {
      console.error("Lỗi gửi lại mã:", error);
      toastStore.showToast(error.message, 'error', 4000, 'top-right');
    } 
    finally {
      isLoading.value = false;
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

  /* Kỹ thuật CSS Fade cho ảnh cực mượt */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1.5s ease-in-out;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .fade-leave-active {
    position: absolute;
  }

  /* CSS cho hiệu ứng chuyển bước (Transition form) */
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