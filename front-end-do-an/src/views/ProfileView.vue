<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    
    <TheHeader />

    <div class="flex flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      
      <aside class="w-72 hidden md:flex flex-col border-r border-outline-variant/20 bg-surface-container-low pt-8">
        <div class="px-6 flex flex-col items-center gap-3 mb-8">
          <div class="relative group cursor-pointer">
            <div class="w-24 h-24 rounded-full border-2 border-primary/50 p-1 group-hover:border-primary transition-colors">
              <img class="w-full h-full rounded-full object-cover" alt="User Profile" :src="avatarPreview"/>
            </div>
            <div class="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full flex items-center justify-center border-2 border-surface-container-low">
              <span class="material-symbols-outlined text-[14px] text-on-primary font-bold">verified</span>
            </div>
          </div>
          <div class="text-center">
            <h3 class="font-headline font-bold text-lg text-on-surface">{{ authStore.user?.username || authStore.user?.TenKH || 'Collector' }}</h3>
            <p class="text-[10px] text-primary uppercase tracking-widest font-bold">Elite Member</p>
          </div>
        </div>

        <div class="flex flex-col gap-1 flex-1">
          <router-link to = "/profile" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent cursor-pointer">
            <span class="material-symbols-outlined">person</span>
            <span>Thông tin cá nhân</span>
          </router-link>
          <router-link to = "/change-password" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">lock</span>
            <span>Đổi mật khẩu</span>
          </router-link>
          <router-link to = "/wishlist" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">favorite</span>
            <span>Danh sách yêu thích</span>
          </router-link>
          <router-link to = "/orders" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">inventory_2</span>
            <span>Lịch sử đơn hàng</span>
          </router-link>
        </div>

        <div class="p-6 border-t border-outline-variant/10">
          <button @click="handleLogout" class="flex items-center gap-3 text-sm font-bold transition-all text-outline hover:text-error w-full">
            <span class="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header class="mb-10">
          <h1 class="text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tighter text-white mb-2">
            Hồ sơ <span class="text-primary italic">Cá nhân</span>
          </h1>
          <p class="text-on-surface-variant font-medium">Quản lý thông tin liên hệ và địa chỉ giao hàng của bạn.</p>
        </header>

        <div class="glass-panel p-8 md:p-10 rounded-2xl relative overflow-hidden border border-outline-variant/20 shadow-2xl">
          
          <form @submit.prevent="saveProfile" class="relative z-10 space-y-10">
            <div class="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-outline-variant/15">
              <div class="relative group cursor-pointer shrink-0">
                <div class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-surface-container-highest overflow-hidden neon-glow transition-all duration-300 group-hover:border-primary/50">
                  <img class="w-full h-full object-cover" alt="Avatar" :src="avatarPreview"/>
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
                <label class="block text-[11px] font-bold uppercase tracking-widest text-outline">Email</label>
                <input v-model="form.email" class="w-full bg-transparent border-none border-b-2 border-outline-variant/40 focus:border-primary focus:ring-0 text-white transition-all py-3 px-0 font-medium input-focus-glow" type="email" placeholder="Nhập email của bạn"/>
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

            <div class="pt-8 flex items-center justify-between border-t border-outline-variant/15">
              <button type="button" class="text-xs font-bold uppercase tracking-widest text-outline hover:text-white transition-colors">
                Hủy thay đổi
              </button>
              <button type="submit" class="bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
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
            <p class="text-3xl font-headline font-bold text-tertiary">Tháng 03, 2026</p>
          </div>
          <div class="glass-panel p-6 rounded-2xl border border-secondary/20 hover:border-secondary/50 transition-colors">
            <span class="material-symbols-outlined text-secondary mb-4 text-3xl">inventory_2</span>
            <h5 class="text-xs font-bold text-outline uppercase tracking-widest mb-1">Bộ sưu tập</h5>
            <p class="text-3xl font-headline font-bold text-white">42 <span class="text-sm font-medium text-secondary">Figures</span></p>
          </div>
          <div class="glass-panel p-6 rounded-2xl border border-primary/20 hover:border-primary/50 transition-colors">
            <span class="material-symbols-outlined text-primary mb-4 text-3xl">auto_awesome</span>
            <h5 class="text-xs font-bold text-outline uppercase tracking-widest mb-1">Điểm uy tín</h5>
            <p class="text-3xl font-headline font-bold text-white">4.9 <span class="text-sm font-medium text-primary">/ 5.0</span></p>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import TheHeader from '@/components/TheHeader.vue';

const toastStore = useToastStore();
const router = useRouter();
const authStore = useAuthStore();

const isSaving = ref(false);

// 1. Mở két sắt lấy Mã Tài Khoản (để biết phải hỏi thông tin của ai)
const userString = localStorage.getItem('user');
const currentUser = userString ? JSON.parse(userString) : null;

// Quản lý file ảnh và đường dẫn ảnh mặc định
const fileInput = ref(null); 
const selectedFile = ref(null); 
const defaultAvatar = 'default_avatar.jpg';

// Ảnh Preview lúc đầu cứ gán mặc định, lát gọi API xong sẽ đè lên sau
const avatarPreview = ref(currentUser?.AnhDaiDien ? `http://localhost:3000/Images_user/${currentUser.AnhDaiDien}` : defaultAvatar);

// Khởi tạo Form rỗng
const form = reactive({
  name: '',
  email: '', 
  phone: '', 
  address: '' 
});

// ==========================================
// THÊM MỚI: HÀM TỰ ĐỘNG KÉO THÔNG TIN TỪ SERVER VỀ
// ==========================================
const fetchUserData = async () => {
  if (!currentUser) return;
  
  try {
    // Gọi đường link API lấy thông tin bạn vừa viết (truyền MaTK vào đuôi)
    const res = await fetch(`http://localhost:3000/api/info_user/laythongtin/${currentUser.id}`);
    const dataJSON = await res.json();
    
    if (res.ok && dataJSON.data) {
      const userData = dataJSON.data;
      
      // Đổ dữ liệu từ Server vào Form
      form.name = userData.TenKH || userData.TenDN || '';
      form.email = userData.Email || ''; 
      form.phone = userData.SDT || '';
      form.address = userData.diachi || '';
      
      // Đổ ảnh đại diện ra màn hình (nếu có)
      if (userData.AnhDaiDien && userData.AnhDaiDien !== '') {
        avatarPreview.value = `http://localhost:3000/Images_user/${userData.AnhDaiDien}`;
      }
    }
  } catch (error) {
    console.error("Lỗi kéo thông tin người dùng:", error);
  }
};

// ==========================================
// CHẠY NGAY KHI VỪA MỞ TRANG PROFILE LÊN
// ==========================================
onMounted(() => {
  window.scroll(0,0);
  if (!currentUser && !localStorage.getItem('token')) {
    router.push('/login');
  } else {
    // Nếu đã đăng nhập thì gọi hàm kéo dữ liệu
    fetchUserData();
  }
});

// Các hàm chọn ảnh (Giữ nguyên)
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
};

const removeAvatar = () => {
  selectedFile.value = null;
  avatarPreview.value = defaultAvatar;
  if(fileInput.value) fileInput.value.value = ''; 
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

// Hàm lưu Profile (Giữ nguyên như bản hoàn chỉnh trước đó)
const saveProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token || !currentUser) {
    toastStore.showToast("Vui lòng đăng nhập lại!", "error");
    return;
  }

  isSaving.value = true;
  
  try {
    const formData = new FormData();
    formData.append('MaTK', currentUser.id);
    formData.append('TenKH', form.name);
    formData.append('email', form.email);
    formData.append('SDT', form.phone);
    formData.append('DiaChi', form.address);
    
    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value); 
    }

    const response = await fetch('http://localhost:3000/api/info_user/change_info', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData 
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Lỗi khi lưu thông tin");

    // Cập nhật lại két sắt Local Storage để Header đồng bộ
    const updatedUser = {
      ...currentUser,
      TenKH: form.name,
      username: form.name
    };
    if (data.newAvatarName) {
      updatedUser.AnhDaiDien = data.newAvatarName;
    }
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (authStore.user) authStore.user = updatedUser;

    toastStore.showToast("🎉 Đã cập nhật hồ sơ thành công!", "success");

  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    toastStore.showToast(error.message, "error");
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

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