<template>
  <div class="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center relative overflow-hidden">
    
    <router-link to = "/" class="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/10 transition-all group">
      <span class="material-symbols-outlined text-white/80 text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
      <span class="text-sm font-bold text-white/90 tracking-wide">Quay lại</span>
    </router-link>

    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tertiary/5"></div>
      <img alt="Background mecha" class="w-full h-full object-cover opacity-20 grayscale blur-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKf1uyglHyXkQBW-2-LahZoQyoz3Qi3nEZzvwq-FOxvD4Z-gNtdOuPxD7tvMCzMyg-ui0V4E1CJsK-fSHvdn2NeuSORcQ_wLq9bmAMrgcjodXeDo1JuGE9ldHXfE4AXEqLYvYvaKdQZaoowZ8aa8tfHWqvpsXH34aojQsfdcsBxkC6MhnXsCT-bE2yCsF1BXnZ5HRgL2ACyTGYkNkShodcqRdg_ltBu17--OpduokAyeAl2yeNcoCUSpTxwGJDbESYOUZKqKBaZASm"/>
    </div>

    <main class="relative z-10 w-full max-w-6xl p-4 md:p-8">
      <div class="animate-slide-up glass-panel w-full overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row min-h-[750px]">
        
        <div class="hidden lg:flex lg:w-3/5 relative min-h-[600px] border-r border-white/5">
          <div class="absolute inset-0 z-0">
            <img alt="High-end collectible mecha figure" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKf1uyglHyXkQBW-2-LahZoQyoz3Qi3nEZzvwq-FOxvD4Z-gNtdOuPxD7tvMCzMyg-ui0V4E1CJsK-fSHvdn2NeuSORcQ_wLq9bmAMrgcjodXeDo1JuGE9ldHXfE4AXEqLYvYvaKdQZaoowZ8aa8tfHWqvpsXH34aojQsfdcsBxkC6MhnXsCT-bE2yCsF1BXnZ5HRgL2ACyTGYkNkShodcqRdg_ltBu17--OpduokAyeAl2yeNcoCUSpTxwGJDbESYOUZKqKBaZASm"/>
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30"></div>
          </div>
          <div class="relative z-10 w-full p-12 flex flex-col justify-between">
            <div>
              <a class="inline-flex items-center gap-2 group transition-all" href="#">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                  <span class="font-headline text-2xl font-bold tracking-tight text-white">FigureCollect</span>
                </div>
              </a>
            </div>
            <div class="max-w-xl">
              <span class="inline-block px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md border border-tertiary/30">Limited Edition</span>
              <h1 class="font-headline text-6xl font-bold text-white leading-tight mb-6 -ml-1">
                Chào mừng bạn đến với <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">FigureCollect</span> 
              </h1>
              <p class="text-white/90 text-lg font-medium leading-[1.8] max-w-md">
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

        <div class="w-full lg:w-2/5 p-8 md:p-12 lg:p-14 bg-surface/20 backdrop-blur-md flex flex-col justify-center overflow-y-auto">
          <div class="w-full max-w-md mx-auto">
            
            <div class="lg:hidden flex items-center justify-between mb-12">
              <a class="flex items-center gap-2" href="#">
                <span class="material-symbols-outlined text-on-surface/80">arrow_back</span>
                <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">deployed_code</span>
                <span class="font-headline text-xl font-bold tracking-tight">FigureCollect</span>
              </a>
            </div>

            <div class="mb-10 text-center">
              <h2 class="font-headline text-4xl font-bold text-on-surface mb-3">Đăng nhập</h2>
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
                  <router-link to = "/forgot-password" class="text-xs font-semibold text-primary hover:text-primary-fixed transition-colors">Quên mật khẩu?</router-link>
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
                class="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
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
              <button type="button" class="flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container hover:bg-surface border border-outline-variant/20 rounded-xl transition-colors group">
                <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.21-3.21C17.54 1.84 14.99 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.86 3c.91-2.72 3.47-4.46 6.64-4.46z" fill="#EA4335"></path><path d="M23.49 12.27c0-.81-.07-1.59-.21-2.34H12v4.42h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.47z" fill="#4285F4"></path><path d="M5.36 14.5c-.23-.68-.36-1.41-.36-2.17s.13-1.49.36-2.17l-3.86-3C.68 8.65 0 10.25 0 12s.68 3.35 1.5 4.84l3.86-2.34z" fill="#FBBC05"></path><path d="M12 23c3.12 0 5.73-1.03 7.64-2.8l-3.66-2.84c-1.06.71-2.42 1.14-3.98 1.14-3.17 0-5.84-2.14-6.8-5.04l-3.86 3C3.51 20.35 7.42 23 12 23z" fill="#34A853"></path></svg>
                <span class="text-sm font-semibold text-white">Google</span>
              </button>
              <button type="button" class="flex items-center justify-center gap-2 py-2.5 px-4 bg-surface-container hover:bg-surface border border-outline-variant/20 rounded-xl transition-colors group">
                <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                <span class="text-sm font-semibold text-white">Facebook</span>
              </button>
            </div>

            <p class="mt-12 text-center text-on-surface-variant text-sm">
              Bạn chưa có tài khoản? 
              <router-link to="/register" class="text-tertiary font-bold hover:underline decoration-2 underline-offset-4 transition-all">Đăng ký ngay</router-link>
            </p>
            
            <footer class="mt-12 pt-6 border-t border-white/5 text-[10px] text-outline/60 w-full flex justify-between items-center">
              <span>© 2024 FigureCollect Hub. All rights reserved.</span>
              <div class="flex gap-4">
                <a class="hover:text-on-surface-variant transition-colors" href="#">Điều khoản</a>
                <a class="hover:text-on-surface-variant transition-colors" href="#">Bảo mật</a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>

    <Transition name="slide-fade">
      <div 
        v-if="toastMessage" 
        class="fixed bottom-8 right-8 flex items-center gap-3 px-5 py-4 bg-surface-container-highest border border-error/50 text-error-dim rounded-xl shadow-2xl z-50 max-w-sm"
      >
        <span class="material-symbols-outlined text-error">error</span>
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
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js'

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 1. Khai báo các biến mà giao diện đang đòi hỏi
const form = reactive({
  identity: '', // Đây chính là Username/Email
  password: '', 
  remember: false
});

const showPassword = ref(false); // Biến để bật/tắt con mắt xem mật khẩu
const isLoading = ref(false);    // Biến tạo hiệu ứng quay vòng lúc đang đăng nhập
const toastMessage = ref('');    // Biến chứa thông báo lỗi màu đỏ góc dưới

// 2. Hàm xử lý khi bấm nút Đăng Nhập
const handleLogin = async () => {
  isLoading.value = true;   // Bật trạng thái đang load
  toastMessage.value = '';  // Xóa lỗi cũ (nếu có)

  try {
    await authStore.login(form.identity, form.password); 

    // Nếu có thông tin user -> Đăng nhập thành công -> Hất sang Trang chủ
    if (authStore.user) {
      const userRole = authStore.user.role;
      if(userRole === 1 || userRole === 2){
        router.push('/admin')
      }
      else{
        const redirectPath = route.query.redirect || '/';
        router.push(redirectPath);
      }
    } else {
      // Nếu authStore.user không có, tức là đăng nhập xịt
      toastMessage.value = 'Sai tên đăng nhập hoặc mật khẩu!';
    }
  } catch (error) {
    console.error(error);
    
    toastMessage.value = error.message;
  } finally {
    isLoading.value = false; // Tắt trạng thái load
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

  /* Hiệu ứng trượt cho Toast */
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