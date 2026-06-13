<template>
  <aside class="w-full md:w-72 flex flex-col border-b md:border-b-0 md:border-r border-outline-variant/20 bg-surface-container-low pt-4 md:pt-8 shrink-0 z-20">   
    <div class="px-4 md:px-6 flex flex-row md:flex-col items-center gap-4 md:gap-3 mb-4 md:mb-8">
      <div class="relative group cursor-pointer shrink-0">
        <div class="w-12 h-12 md:w-24 md:h-24 rounded-full border-2 border-primary/50 p-1 group-hover:border-primary transition-colors">
          <img class="w-full h-full rounded-full object-cover" alt="User Profile" :src="userAvatar"/>
        </div>
        <div class="absolute bottom-0 right-0 bg-primary w-4 h-4 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-surface-container-low">
          <span class="material-symbols-outlined text-[10px] md:text-[14px] text-on-primary font-bold">verified</span>
        </div>
      </div>
      
      <div class="text-left md:text-center flex-1">
        <h3 class="font-headline font-bold text-base md:text-lg text-on-surface line-clamp-1">
          {{ authStore.user?.username || authStore.user?.TenKH || 'Collector' }}
        </h3>
        <p :class="['text-[9px] md:text-[10px] uppercase tracking-widest font-bold mt-0.5', memberTier.color]">
          {{ memberTier.name }}
        </p>
      </div>
    </div>

    <div class="flex flex-row md:flex-col gap-0 flex-1 overflow-x-auto custom-scrollbar px-2 md:px-0 pb-0">  
      <router-link to="/profile" 
        class="flex shrink-0 items-center gap-2 md:gap-3 px-5 py-4 md:px-6 md:py-4 text-xs md:text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" 
        active-class="!text-primary border-b-4 md:border-b-0 md:border-r-4 border-primary bg-gradient-to-t md:bg-gradient-to-r from-primary/10 to-transparent">
        <span class="material-symbols-outlined text-[18px] md:text-[24px]">person</span> <span>Thông tin cá nhân</span>
      </router-link>  
      <router-link v-if="!isSocialAccount" to="/change-password" 
        class="flex shrink-0 items-center gap-2 md:gap-3 px-5 py-4 md:px-6 md:py-4 text-xs md:text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" 
        active-class="!text-primary border-b-4 md:border-b-0 md:border-r-4 border-primary bg-gradient-to-t md:bg-gradient-to-r from-primary/10 to-transparent">
        <span class="material-symbols-outlined text-[18px] md:text-[24px]">lock</span> <span>Đổi mật khẩu</span>
      </router-link>    
      <router-link to="/wishlist" 
        class="flex shrink-0 items-center gap-2 md:gap-3 px-5 py-4 md:px-6 md:py-4 text-xs md:text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" 
        active-class="!text-primary border-b-4 md:border-b-0 md:border-r-4 border-primary bg-gradient-to-t md:bg-gradient-to-r from-primary/10 to-transparent">
        <span class="material-symbols-outlined text-[18px] md:text-[24px]">favorite</span> <span>Danh sách yêu thích</span>
      </router-link>    
      <router-link to="/orders" 
        class="flex shrink-0 items-center gap-2 md:gap-3 px-5 py-4 md:px-6 md:py-4 text-xs md:text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" 
        active-class="!text-primary border-b-4 md:border-b-0 md:border-r-4 border-primary bg-gradient-to-t md:bg-gradient-to-r from-primary/10 to-transparent">
        <span class="material-symbols-outlined text-[18px] md:text-[24px]">inventory_2</span> <span>Lịch sử đơn hàng</span>
      </router-link>
      <button @click="handleLogout" 
        class="flex md:hidden shrink-0 items-center gap-2 px-5 py-4 text-xs font-bold transition-all text-error/80 hover:text-error hover:bg-error/10 border-b-4 border-transparent">
        <span class="material-symbols-outlined text-[18px]">logout</span> <span>Đăng xuất</span>
      </button>
    </div>

    <div class="p-4 md:p-6 border-t border-outline-variant/10 hidden md:block">
      <button @click="handleLogout" class="flex items-center gap-3 text-sm font-bold transition-all text-outline hover:text-error w-full">
        <span class="material-symbols-outlined">logout</span> <span>Đăng xuất</span>
      </button>
    </div>
  </aside>
</template>
  
<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const router = useRouter();
  const authStore = useAuthStore();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const totalFigures = ref(0); 
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isSocialAccount = computed(() => currentUser?.isSocialAuth === true);
  
  const fetchUserStats = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/info_user/laythongtin`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });
      if (res.success) {
        const resData = await res.json();
        totalFigures.value = resData.data?.SoFigureDaMua || 0;
        
        // 3. ĐỒNG BỘ AVATAR: Ép Store và LocalStorage nhận link Cloudinary mới nhất
        if (authStore.user && resData.data?.AnhDaiDien) {
          authStore.user.AnhDaiDien = resData.data.AnhDaiDien;
          
          // Cập nhật luôn xuống LocalStorage để F5 không bị mất
          const updatedUser = { ...currentUser, AnhDaiDien: resData.data.AnhDaiDien };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } 
    catch (error) {
      console.error("Lỗi lấy cấp bậc thành viên:", error);
    }
  };
  
  onMounted(() => {
    fetchUserStats();
  });
  
  const memberTier = computed(() => {
    const count = totalFigures.value;
    if (count >= 30) {
      return { name: 'Elite Member', color: 'text-purple-400' }; 
    } 
    else if (count >= 15) {
      return { name: 'Master Collector', color: 'text-yellow-400' };
    } 
    else if (count >= 5) {
      return { name: 'Pro Collector', color: 'text-sky-400' }; 
    } 
    else {
      return { name: 'Newbie Collector', color: 'text-primary' }; 
    }
  });
  
  const userAvatar = computed(() => {
    if (authStore.user && authStore.user.AnhDaiDien) {
      const anh = authStore.user.AnhDaiDien;
      return anh.startsWith('http') ? anh : `${API_BASE_URL}/Images_user/${anh}`;
    }
    const displayName = authStore.user?.TenKH || authStore.user?.username || 'Collector';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff8f73&color=fff&bold=true&size=128`;
  });
  
  const handleLogout = () => {
    if (authStore.logout) authStore.logout();
    else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };
</script>