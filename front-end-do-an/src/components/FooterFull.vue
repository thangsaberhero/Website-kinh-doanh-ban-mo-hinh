<template>
  <footer class="bg-surface-container-lowest border-t border-outline-variant/15 pt-20 pb-10">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">        
        <div class="lg:col-span-1">
          <router-link to="/" class="font-headline text-2xl font-bold tracking-tighter text-primary mb-6 block">
            FigureCollect
          </router-link>
          <p class="text-on-surface-variant text-sm leading-relaxed mb-8">
            Điểm đến hàng đầu cho cộng đồng đam mê sưu tập mô hình tại Việt Nam. Chúng tôi mang đến những tạo tác giá trị nhất từ khắp nơi trên thế giới.
          </p>
          <div class="flex gap-3">
            <a href="#" class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined text-xl">social_leaderboard</span>
            </a>
            <a href="#" class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined text-xl">camera</span>
            </a>
            <a href="#" class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined text-xl">play_circle</span>
            </a>
          </div>
        </div>

        <div>
          <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Hỗ trợ khách hàng</h4>
          <ul class="space-y-4 text-on-surface-variant text-sm">
            <li><router-link to="/guide" class="hover:text-primary transition-colors">Hướng dẫn đặt hàng</router-link></li>
            <li><router-link to="/shipping-policy" class="hover:text-primary transition-colors">Chính sách vận chuyển</router-link></li>
            <li><router-link to="/return-policy" class="hover:text-primary transition-colors">Chính sách đổi trả</router-link></li>
            <li><router-link to="/orders" class="hover:text-primary transition-colors">Tra cứu đơn hàng</router-link></li>
          </ul>
        </div>

        <div>
          <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Thông tin liên hệ</h4>
          <ul class="space-y-4 text-on-surface-variant text-sm">
            <li class="flex items-start gap-3">
              <span class="material-symbols-outlined text-[18px] text-primary">location_on</span>
              <span>Phường Ngô Quyền, TP. Hải Phòng</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[18px] text-primary">call</span>
              <span>0795 209 255 (Zalo/Hotline)</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[18px] text-primary">mail</span>
              <span>vuhongphong04@gmail.com</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[18px] text-primary">schedule</span>
              <span>08:00 - 22:00 (Thứ 2 - Chủ Nhật)</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Đăng ký nhận tin</h4>
          <p class="text-on-surface-variant text-sm mb-6 leading-relaxed">Nhận thông báo sớm nhất về các đợt Pre-order giới hạn.</p>
          <form @submit.prevent="handleSubscribe" class="relative">
            <input 
              v-model="emailInput"
              class="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3.5 pl-4 pr-12 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" 
              placeholder="Email của bạn" 
              type="email" 
              required
            />
            <button type="submit" class="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-on-primary px-3 rounded flex items-center justify-center hover:brightness-110 transition-all">
              <span class="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>       
      </div>

      <div class="border-t border-outline-variant/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-outline font-bold tracking-widest uppercase">
        <div>© {{ currentYear }} FigureCollect. All rights reserved.</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToastStore } from '@/stores/toast';
  
const currentYear = computed(() => new Date().getFullYear());
const toastStore = useToastStore();
const emailInput = ref('');

const handleSubscribe = () => {
  console.log('Đăng ký nhận tin với email:', emailInput.value);
  toastStore.showToast("Cảm ơn bạn đã đăng ký nhận tin!", "success");
  emailInput.value = '';
};
</script>