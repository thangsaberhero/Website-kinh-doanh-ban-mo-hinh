<template>
    <aside class="w-72 hidden md:flex flex-col border-r border-outline-variant/20 bg-surface-container-low pt-8">
      <div class="px-6 flex flex-col items-center gap-3 mb-8">
        <div class="relative group cursor-pointer">
          <div class="w-24 h-24 rounded-full border-2 border-primary/50 p-1 group-hover:border-primary transition-colors">
            <img class="w-full h-full rounded-full object-cover" alt="User Profile" :src="userAvatar"/>
          </div>
          <div class="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full flex items-center justify-center border-2 border-surface-container-low">
            <span class="material-symbols-outlined text-[14px] text-on-primary font-bold">verified</span>
          </div>
        </div>
        <div class="text-center">
          <h3 class="font-headline font-bold text-lg text-on-surface">
            {{ authStore.user?.username || authStore.user?.TenKH || 'Collector' }}
          </h3>
          
          <p :class="['text-[10px] uppercase tracking-widest font-bold mt-0.5', memberTier.color]">
            {{ memberTier.name }}
          </p>
        </div>
      </div>
  
      <div class="flex flex-col gap-1 flex-1">
        <router-link to="/profile" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" active-class="!text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent">
          <span class="material-symbols-outlined">person</span> <span>Thông tin cá nhân</span>
        </router-link>
        <router-link v-if="!isSocialAccount" to="/change-password" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" active-class="!text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent">
          <span class="material-symbols-outlined">lock</span> <span>Đổi mật khẩu</span>
        </router-link>
        <router-link to="/wishlist" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" active-class="!text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent">
          <span class="material-symbols-outlined">favorite</span> <span>Danh sách yêu thích</span>
        </router-link>
        <router-link to="/orders" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest" active-class="!text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent">
          <span class="material-symbols-outlined">inventory_2</span> <span>Lịch sử đơn hàng</span>
        </router-link>
      </div>
  
      <div class="p-6 border-t border-outline-variant/10">
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