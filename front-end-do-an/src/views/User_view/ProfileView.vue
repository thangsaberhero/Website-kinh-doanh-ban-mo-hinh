<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    <TheHeader />
    <div class="flex flex-col md:flex-row flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      <UserSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header class="mb-10">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tighter text-white mb-2">
            Hồ sơ <span class="text-primary italic">Cá nhân</span>
          </h1>
          <p class="text-on-surface-variant font-medium">Quản lý thông tin liên hệ và địa chỉ giao hàng của bạn.</p>
        </header>

        <div class="glass-panel p-5 md:p-10 rounded-2xl relative overflow-hidden border border-outline-variant/20 shadow-2xl">          
          <form @submit.prevent="saveProfile" class="relative z-10 space-y-10">
            <div class="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-outline-variant/15">
              <div class="relative group cursor-pointer shrink-0">
                <div class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-surface-container-highest overflow-hidden neon-glow transition-all duration-300 group-hover:border-primary/50">
                  <img class="w-full h-full rounded-full object-cover" alt="User Profile" :src="computedAvatar"/>
                </div>
                </div>

              <div class="space-y-3 text-center sm:text-left">
                <h4 class="text-xl font-headline font-bold text-white">Ảnh đại diện</h4>
                <p class="text-sm text-on-surface-variant">Tải lên hình ảnh mới. Hỗ trợ: JPG, PNG (Max 5MB).</p>
                <div class="flex gap-3 justify-center sm:justify-start pt-2">
                  
                  <input type="file" ref="fileInput" class="hidden" accept="image/jpeg, image/png" @change="onFileSelected" />
                  
                  <button 
                    type="button" 
                    @click="triggerFileInput" 
                    class="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-surface-container-highest text-white border border-outline-variant/30 rounded-lg hover:bg-primary hover:border-primary hover:text-on-primary-fixed transition-all"
                  >
                    Tải ảnh lên
                  </button>
                  
                  <button type="button" @click="removeAvatar" class="px-5 py-2 text-xs font-bold uppercase tracking-widest text-error hover:bg-error/10 rounded-lg transition-all">
                    Gỡ bỏ
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              
              <div class="space-y-2">
                <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Họ và tên</label>
                <input v-model="form.name" class="w-full bg-transparent border-none border-b-2 border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-3 px-0 font-medium input-focus-glow" type="text" placeholder="Nhập họ và tên"/>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Email</label>
                  <span v-if="isSocialAccount" class="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Tài khoản liên kết</span>
                </div>
                
                <div class="relative group">
                  <input 
                    v-model="form.email" 
                    disabled
                    class="w-full bg-transparent border-none border-b-2 border-outline-variant/20 text-outline/50 cursor-not-allowed py-3 px-0 font-medium" 
                    type="email" 
                    :title="isSocialAccount ? 'Không thể thay đổi email của tài khoản liên kết' : 'Email không thể tự thay đổi để đảm bảo bảo mật. Vui lòng liên hệ Hotline nếu cần hỗ trợ.'"
                  />
                  <span class="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/50 text-sm">lock</span>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Số điện thoại</label>
                <input v-model="form.phone" class="w-full bg-transparent border-none border-b-2 border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-3 px-0 font-medium input-focus-glow" type="tel" placeholder="Ví dụ: 0901234567"/>
              </div>

              <div class="space-y-2 md:col-span-2">
                <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Địa chỉ </label>
                <input v-model="form.address" class="w-full bg-transparent border-none border-b-2 border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-3 px-0 font-medium input-focus-glow" type="text" placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."/>
              </div>

            </div>

            <div class="pt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 border-t border-outline-variant/15">
              <button type="button" @click="fetchUserData" class="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-surface-container-highest border border-outline-variant/30 rounded-lg hover:bg-surface-bright transition-colors text-center">
                Hủy thay đổi
              </button>
              <button type="submit" class="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                <span v-if="isSaving" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                {{ isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI' }}
              </button>
            </div>
          </form>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-tertiary/20 hover:border-tertiary/50 transition-colors">
            <span class="material-symbols-outlined text-tertiary mb-4 text-3xl">person</span>
            <h5 class="text-xs font-bold text-outline uppercase tracking-widest mb-1">Thành viên từ</h5>
            <p class="text-3xl font-headline font-bold text-tertiary">{{ joinDateDisplay }}</p>
          </div>
          <div class="glass-panel p-6 rounded-2xl border border-secondary/20 hover:border-secondary/50 transition-colors">
            <span class="material-symbols-outlined text-secondary mb-4 text-3xl">inventory_2</span>
            <h5 class="text-xs font-bold text-outline uppercase tracking-widest mb-1">Bộ sưu tập</h5>
            <p class="text-3xl font-headline font-bold text-white">{{ stats.totalFigures }} <span class="text-sm font-medium text-secondary">Figures</span></p>
          </div>
          <div class="glass-panel p-6 rounded-2xl border border-primary/20 hover:border-primary/50 transition-colors">
            <span class="material-symbols-outlined text-primary mb-4 text-3xl">rate_review</span>
            <h5 class="text-xs font-bold text-outline uppercase tracking-widest mb-1">Đã đánh giá</h5>
            <p class="text-3xl font-headline font-bold text-white">{{ stats.totalReviews }} <span class="text-sm font-medium text-primary">Lượt</span></p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
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
  const isAvatarRemoved = ref(false); 
  const ngayTaoFromDB = ref(null);   

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isSocialAccount = ref(currentUser?.isSocialAuth === true);

  const fileInput = ref(null); 
  const selectedFile = ref(null); 

  const stats = reactive({
    totalFigures: 0,
    totalReviews: 0
  });

  const displayName = computed(() => form.name || currentUser?.TenKH || currentUser?.username || 'Collector');
  const defaultAvatar = computed(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value)}&background=ff8f73&color=fff&bold=true&size=128`);
  const avatarPreview = ref(currentUser?.AnhDaiDien ? `${API_BASE_URL}/Images_user/${currentUser.AnhDaiDien}` : '');

  const computedAvatar = computed(() => {
    if (avatarPreview.value) return avatarPreview.value;
    return defaultAvatar.value;
  });

  const form = reactive({
    name: '',
    email: '', 
    phone: '', 
    address: '' 
  });

  const joinDateDisplay = computed(() => {
    const targetDate = ngayTaoFromDB.value || currentUser?.NgayTao;
    if (!targetDate) return 'Đang tải...';
    const d = new Date(targetDate);
    return `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}, ${d.getFullYear()}`;
  });

  const fetchUserData = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/info_user/laythongtin`, {headers: {'Authorization': `Bearer ${token}`}});
      const dataJSON = await res.json();
      
      if (res.ok && dataJSON.data) {
        const userData = dataJSON.data;
        
        form.name = userData.TenKH || userData.TenDN || '';
        form.email = userData.Email || ''; 
        form.phone = userData.SDT || '';
        form.address = userData.DiaChi || ''; 
        ngayTaoFromDB.value = userData.NgayTao; 
        stats.totalFigures = userData.SoFigureDaMua || 0;
        stats.totalReviews = userData.SoDanhGia || 0;
        
        if (userData.AnhDaiDien && userData.AnhDaiDien !== '') {
          avatarPreview.value = userData.AnhDaiDien.startsWith('http') 
            ? userData.AnhDaiDien 
            : `${API_BASE_URL}/Images_user/${userData.AnhDaiDien}`;
          isAvatarRemoved.value = false;
        }
        else {
          avatarPreview.value = '';
        }
      }
    } 
    catch (error) {
      console.error("Lỗi kéo thông tin người dùng:", error);
    }
  };

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
    if (!currentUser && !localStorage.getItem('token')) {
      router.push('/login');
    } 
    else {
      fetchUserData();
    }
  });

  const triggerFileInput = () => {
    if (fileInput.value) fileInput.value.click();
  };

  const onFileSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastStore.showToast("Dung lượng ảnh quá lớn! Tối đa 5MB.", "error");
      return;
    }
    selectedFile.value = file; 
    avatarPreview.value = URL.createObjectURL(file); 
    isAvatarRemoved.value = false; 
  };

  const removeAvatar = () => {
    selectedFile.value = null;
    avatarPreview.value = '';
    isAvatarRemoved.value = true;
    if(fileInput.value) fileInput.value.value = ''; 
  };

  const saveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) {
      toastStore.showToast("Vui lòng đăng nhập lại!", "error");
      return;
    }

    isSaving.value = true;
    
    try {
      const formData = new FormData();
      formData.append('TenKH', form.name);
      // formData.append('email', form.email);
      formData.append('SDT', form.phone);
      formData.append('DiaChi', form.address);
      formData.append('isAvatarRemoved', isAvatarRemoved.value); 
      
      if (selectedFile.value) {
        formData.append('avatar', selectedFile.value); 
      }

      const response = await fetch(`${API_BASE_URL}/api/info_user/change_info`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi khi lưu thông tin");

      const updatedUser = {
        ...currentUser,
        TenKH: form.name,
        username: form.name
      };
      
      if (isAvatarRemoved.value) {
        updatedUser.AnhDaiDien = null;
      } 
      else if (data.newAvatarName) {
        updatedUser.AnhDaiDien = data.newAvatarName;
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (authStore.user) authStore.user = updatedUser;

      toastStore.showToast("🎉 Đã cập nhật hồ sơ thành công!", "success");
      isAvatarRemoved.value = false;

    } 
    catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      toastStore.showToast(error.message, "error");
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