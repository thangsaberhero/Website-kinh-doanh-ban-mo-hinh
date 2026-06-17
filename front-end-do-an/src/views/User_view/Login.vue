<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center relative overflow-hidden">
    
    <router-link to="/" class="hidden lg:flex fixed top-6 left-6 z-50 items-center gap-2 px-4 py-2 rounded-full bg-surface/80 dark:bg-white/10 hover:bg-surface dark:hover:bg-white/20 backdrop-blur-md transition-all group border border-outline-variant/30 dark:border-white/10 shadow-sm">
      <span class="material-symbols-outlined text-on-surface dark:text-white/80 text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
      <span class="text-sm font-bold text-on-surface dark:text-white/90 tracking-wide">Quay lại</span>
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
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKf1uyglHyXkQBW-2-LahZoQyoz3Qi3nEZzvwq-FOxvD4Z-gNtdOuPxD7tvMCzMyg-ui0V4E1CJsK-fSHvdn2NeuSORcQ_wLq9bmAMrgcjodXeDo1JuGE9ldHXfE4AXEqLYvYvaKdQZaoowZ8aa8tfHWqvpsXH34aojQsfdcsBxkC6MhnXsCT-bE2yCsF1BXnZ5HRgL2ACyTGYkNkShodcqRdg_ltBu17--OpduokAyeAl2yeNcoCUSpTxwGJDbESYOUZKqKBaZASm"
        />
      </transition>
    </div>

    <main class="relative z-10 w-full max-w-6xl p-4 md:p-8">
      <div class="animate-slide-up glass-panel w-full overflow-hidden rounded-3xl md:rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row min-h-[auto] md:min-h-[750px]">
        
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKf1uyglHyXkQBW-2-LahZoQyoz3Qi3nEZzvwq-FOxvD4Z-gNtdOuPxD7tvMCzMyg-ui0V4E1CJsK-fSHvdn2NeuSORcQ_wLq9bmAMrgcjodXeDo1JuGE9ldHXfE4AXEqLYvYvaKdQZaoowZ8aa8tfHWqvpsXH34aojQsfdcsBxkC6MhnXsCT-bE2yCsF1BXnZ5HRgL2ACyTGYkNkShodcqRdg_ltBu17--OpduokAyeAl2yeNcoCUSpTxwGJDbESYOUZKqKBaZASm"
              />
            </transition>
            <!-- Lớp phủ cho dễ đọc chữ -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 dark:from-background dark:via-background/40"></div>
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
              <span class="inline-block px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md border border-tertiary/30 shadow-sm">Limited Edition</span>
              <h1 class="font-headline text-6xl font-bold text-white leading-tight mb-6 -ml-1 drop-shadow-md">
                Chào mừng bạn đến với <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">{{ systemStore.settings.shop_name || 'FigureCollect' }}</span> 
              </h1>
              <p class="text-white/90 text-lg font-medium leading-[1.8] max-w-md drop-shadow-sm">
                Nâng tầm bộ sưu tập của bạn với những tạo tác cơ khí tinh xảo nhất từ các studio hàng đầu thế giới.
              </p>
            </div>

            <div class="flex items-center gap-12 border-t border-white/10 pt-8">
              <div>
                <div class="text-xs text-white/70 uppercase tracking-widest mb-1 font-semibold">Authenticity</div>
                <div class="font-headline text-xl font-semibold text-white">100% Verified</div>
              </div>
              <div>
                <div class="text-xs text-white/70 uppercase tracking-widest mb-1 font-semibold">Shipping</div>
                <div class="font-headline text-xl font-semibold text-white">Global Secure</div>
              </div>
            </div>
          </div>
        </div>

        <!-- NỬA PHẢI: FORM ĐĂNG NHẬP -->
        <div class="w-full lg:w-2/5 p-5 sm:p-8 md:p-12 lg:p-14 bg-surface/20 backdrop-blur-md flex flex-col justify-center overflow-y-auto">
          <div class="w-full max-w-md mx-auto">
            
            <div class="lg:hidden flex items-center justify-between mb-6 relative w-full">
              <router-link to="/" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-on-surface/80">arrow_back</span>
                <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                <span class="font-headline text-xl font-bold tracking-tight">{{ systemStore.settings.shop_name || 'FigureCollect' }}</span>
              </router-link>
            </div>

            <div class="mb-10 text-center">
              <h2 class="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-3">Đăng nhập</h2>
              <p class="text-on-surface-variant">Tiếp tục hành trình săn tìm những siêu phẩm hiếm có của bạn.</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-on-surface-variant ml-1" for="identity">Email hoặc tên đăng nhập</label>
                <div class="relative group">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input 
                    v-model="form.identity" 
                    id="identity" 
                    type="text" 
                    required
                    placeholder="name@example.com" 
                    class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-12 pr-4 text-on-surface transition-all input-focus-glow"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <div class="flex justify-between items-center ml-1">
                  <label class="text-sm font-medium text-on-surface-variant" for="password">Mật khẩu</label>
                  <router-link to="/forgot-password" class="text-xs font-semibold text-primary hover:text-primary-fixed transition-colors">Quên mật khẩu?</router-link>
                </div>
                <div class="relative group">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    v-model="form.password" 
                    id="password" 
                    :type="showPassword ? 'text' : 'password'" 
                    required
                    placeholder="••••••••" 
                    class="w-full bg-surface-container-highest/50 border-none border-b-2 border-outline/30 focus:border-primary focus:ring-0 rounded-lg py-4 pl-12 pr-12 text-on-surface transition-all input-focus-glow"
                  />
                  <button 
                    type="button" 
                    @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2 ml-1">
                <input 
                  v-model="form.remember" 
                  id="remember" 
                  type="checkbox" 
                  class="w-4 h-4 rounded bg-surface-container border-outline/30 text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <label class="text-sm text-on-surface-variant select-none cursor-pointer" for="remember">Ghi nhớ đăng nhập</label>
              </div>

              <button 
                type="submit" 
                :disabled="isLoading"
                class="w-full py-4 px-6 bg-primary dark:bg-gradient-to-r dark:from-primary dark:to-primary-container text-white dark:text-on-primary font-bold rounded-xl shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {{ isLoading ? 'Đang xác thực...' : 'Đăng nhập' }}
              </button>
            </form>

            <div class="relative my-10">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-outline-variant/20"></div>
              </div>
              <div class="relative flex justify-center text-xs uppercase tracking-widest">
                <span class="px-4 bg-transparent text-on-surface-variant backdrop-blur-sm">Hoặc đăng nhập nhanh</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button @click="handleGoogleLogin" type="button" class="flex items-center justify-center gap-2 py-2.5 px-2 sm:px-4 bg-surface-container hover:bg-surface border border-outline-variant/20 rounded-xl transition-colors group">
                <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.21-3.21C17.54 1.84 14.99 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.86 3c.91-2.72 3.47-4.46 6.64-4.46z" fill="#EA4335"></path><path d="M23.49 12.27c0-.81-.07-1.59-.21-2.34H12v4.42h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.47z" fill="#4285F4"></path><path d="M5.36 14.5c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17l-3.86-3C.68 8.65 0 10.25 0 12s.68 3.35 1.5 4.84l3.86-2.34z" fill="#FBBC05"></path><path d="M12 23c3.12 0 5.73-1.03 7.64-2.8l-3.66-2.84c-1.06.71-2.42 1.14-3.98 1.14-3.17 0-5.84-2.14-6.8-5.04l-3.86 3C3.51 20.35 7.42 23 12 23z" fill="#34A853"></path></svg>
                <span class="text-sm font-semibold text-on-surface dark:text-white">Google</span>
              </button>
              <button @click="handleFacebookLogin" type="button" class="flex items-center justify-center gap-2 py-2.5 px-2 sm:px-4 bg-surface-container hover:bg-surface border border-outline-variant/20 rounded-xl transition-colors group">
                <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                <span class="text-sm font-semibold text-on-surface dark:text-white">Facebook</span>
              </button>
            </div>

            <p class="mt-12 text-center text-on-surface-variant text-sm">
              Bạn chưa có tài khoản? 
              <router-link to="/register" class="text-tertiary font-bold hover:underline decoration-2 underline-offset-4 transition-all">Đăng ký ngay</router-link>
            </p>
            
            <footer class="mt-12 pt-6 border-t border-outline-variant/30 dark:border-white/5 text-[10px] text-on-surface-variant dark:text-outline/60 w-full flex justify-between items-center">
              <span>© {{ new Date().getFullYear() }} {{ systemStore.settings.shop_name || 'FigureCollect' }} Hub. All rights reserved.</span>
              <div class="flex gap-4">
                <a href="#" @click.prevent="openPolicy('terms')" class="hover:text-primary transition-colors">Điều khoản</a>
                <a href="#" @click.prevent="openPolicy('privacy')" class="hover:text-primary transition-colors">Bảo mật</a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  </div>
  <transition 
    enter-active-class="transition duration-500 ease-out" 
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showPolicyModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" @click="showPolicyModal = false"></div>
      
      <div class="relative bg-surface-container-high w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden transform scale-100 transition-all">
        <div class="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
          <h3 class="text-lg font-headline font-bold text-on-surface dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">{{ policyContent.icon }}</span>
            {{ policyContent.title }}
          </h3>
          <button @click="showPolicyModal = false" class="text-outline hover:text-error transition-colors p-1">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        <div class="p-6 space-y-5 bg-surface/50">
          <div v-for="(line, index) in policyContent.body" :key="index" class="flex gap-3 items-start">
            <span class="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
            <p class="text-sm text-on-surface-variant leading-relaxed">{{ line }}</p>
          </div>
        </div>
        
        <div class="p-5 border-t border-outline-variant/20 bg-surface-container flex justify-end">
          <button @click="showPolicyModal = false" class="px-6 py-2.5 bg-primary text-on-primary-fixed font-bold rounded-lg hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20">
            Tôi đã hiểu
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.js';
  import { useToastStore } from '../../stores/toast.js';
  import { useSystemStore } from '../../stores/system.js'; 
  import { googleTokenLogin } from 'vue3-google-login';

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const systemStore = useSystemStore(); 
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const form = reactive({
    identity: '',
    password: '', 
    remember: false
  });

  const showPassword = ref(false); 
  const isLoading = ref(false);    

  // Khai báo biến đếm và Timer để chuyển đổi ảnh Slider
  const currentBgIndex = ref(0);
  let bgTimer = null;

  onMounted(async () => {
    // 1. KÍCH HOẠT GỌI API NGAY KHI MỞ TRANG ĐĂNG NHẬP
    await systemStore.fetchSettings();

    // 2. Cài đặt đồng hồ chuyển ảnh mỗi 4 giây
    bgTimer = setInterval(() => {
      const bgArray = systemStore.settings?.login_bg;
      
      // ĐÃ SỬA: Chỉ kích hoạt hiệu ứng trượt nếu có từ 2 ảnh trở lên
      if (bgArray && bgArray.length > 1) {
        currentBgIndex.value = (currentBgIndex.value + 1) % bgArray.length;
      }
    }, 4000); 
  });

  onUnmounted(() => {
    // Xóa timer khi chuyển trang để không làm nặng trình duyệt
    if (bgTimer) clearInterval(bgTimer);
  });

  const handleLogin = async () => {
    isLoading.value = true;  
    try {
      const isSuccess = await authStore.login(form.identity, form.password, form.remember);

      if (isSuccess) {
        toastStore.showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success', 2500, 'top-right');
        const userRole = Number(authStore.user?.role || authStore.user?.MaQuyen);
        
        setTimeout(() => {
          if (userRole === 1) {
            router.push('/admin');
          } 
          else if (userRole === 2) {
            router.push('/admin/orders');
          } 
          else {
            const redirectPath = route.query.redirect || '/';
            router.push(redirectPath);
          }
        }, 500);
      } 
    }
    catch (error) {
      console.error("Lỗi khi kết nối API login:", error);
      toastStore.showToast(error.message || "Sai tên đăng nhập hoặc mật khẩu!", 'error', 4000, 'top-right');
    } 
    finally {
      isLoading.value = false; 
    }
  };

  const handleGoogleLogin = () => {
    googleTokenLogin().then(async (response) => {
      isLoading.value = true;
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`
          },
          body: JSON.stringify({ token: response.access_token })
        });
        const data = await res.json();
        if (res.ok) handleSuccessfulLogin(data);
        else toastStore.showToast(data.message, 'error', 4000, 'top-right');
      } 
      catch (error) {
        toastStore.showToast("Lỗi máy chủ!", 'error', 4000, 'top-right');
      } 
      finally {
        isLoading.value = false;
      }
    }).catch((err) => console.log("Google Login Failed", err));
  };

  const handleFacebookLogin = () => {
    window.FB.login((response) => { 
      if (response.authResponse) {
        isLoading.value = true;
        
        const processLogin = async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/auth/facebook`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`
              },
              body: JSON.stringify({ accessToken: response.authResponse.accessToken })
            });
            const data = await res.json();
            if (res.ok) handleSuccessfulLogin(data);
            else toastStore.showToast(data.message, 'error', 4000, 'top-right');
          } 
          catch (error) {
            toastStore.showToast("Lỗi máy chủ!", 'error', 4000, 'top-right');
          } 
          finally {
            isLoading.value = false;
          }
        };
        processLogin(); 
      } 
    }, { scope: 'public_profile,email' });
  };

  const handleSuccessfulLogin = (data) => {
    authStore.user = data.user;
    authStore.token = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    toastStore.showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success', 2500, 'top-right');
    
    setTimeout(() => {
      const userRole = Number(data.user.MaQuyen); 
      
      if (userRole === 1) {
        router.push('/admin'); 
      } else if (userRole === 2) {
        router.push('/admin/orders'); 
      } 
      else {
        const redirectPath = route.query.redirect || '/';
        router.push(redirectPath);
      }
    }, 500);
  };

  const showPolicyModal = ref(false);
  const policyType = ref('');

  const policyContent = computed(() => {
    if (policyType.value === 'terms') {
      return {
        title: 'Điều khoản dịch vụ',
        icon: 'gavel',
        body: [
          'Bằng việc đăng nhập, bạn đồng ý với các quy định hoạt động của hệ thống.',
          'Mọi hành vi gian lận, cố tình phá hoại sẽ dẫn đến việc khóa tài khoản vĩnh viễn.',
          'Chúng tôi có quyền từ chối cung cấp dịch vụ nếu phát hiện vi phạm tiêu chuẩn cộng đồng.'
        ]
      };
    }
    return {
      title: 'Chính sách bảo mật',
      icon: 'security',
      body: [
        'Chúng tôi chỉ sử dụng thông tin cơ bản của bạn để phục vụ việc xác thực đăng nhập.',
        'Cam kết KHÔNG bán hay chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba.',
        'Thông tin mật khẩu được mã hóa một chiều hoàn toàn an toàn theo tiêu chuẩn hiện đại.'
      ]
    };
  });

  const openPolicy = (type) => {
    policyType.value = type;
    showPolicyModal.value = true;
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
    position: absolute; /* Quan trọng: giúp 2 ảnh đè lên nhau lúc chuyển đổi */
  }
</style>