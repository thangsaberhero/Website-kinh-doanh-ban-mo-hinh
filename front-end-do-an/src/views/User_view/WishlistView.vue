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
          <router-link to="/profile" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">person</span>
            <span>Thông tin cá nhân</span>
          </router-link>
          <router-link to="/change-password" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
            <span class="material-symbols-outlined">lock</span>
            <span>Đổi mật khẩu</span>
          </router-link>
          <router-link to="/wishlist" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-primary border-r-4 border-primary bg-gradient-to-r from-primary/10 to-transparent cursor-pointer">
            <span class="material-symbols-outlined">favorite</span>
            <span>Danh sách yêu thích</span>
          </router-link>
          <router-link to="/orders" class="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-on-surface-variant hover:text-white hover:bg-surface-container-highest cursor-pointer">
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

        <header class="mb-12">
          <div class="flex items-center gap-4 mb-2">
            <h1 class="text-4xl lg:text-5xl font-headline font-bold uppercase tracking-tighter text-white">
              Danh Sách <span class="text-primary italic">Yêu Thích</span>
            </h1>
          </div>
          <p class="text-on-surface-variant font-medium">
            Showcase những tuyệt tác đang chờ đợi.
          </p>
        </header>

        <div v-if="isLoading" class="flex justify-center items-center py-20">
            <span class="material-symbols-outlined animate-spin text-primary text-5xl">settings</span>
        </div>

        <TransitionGroup v-else name="list" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          
          <div 
            v-for="item in wishlistItems" 
            :key="item.MaMoHinh"
            class="group rounded-2xl overflow-hidden border border-outline-variant/15 hover:border-primary/50 transition-all duration-700 shadow-2xl flex flex-col h-[550px] bg-surface-container-low"
          >
            <div class="relative flex-1 overflow-hidden bg-surface-container-lowest cursor-pointer" @click="router.push(`/product/${item.MaMoHinh}`)">
              <img :src="'http://localhost:3000/Images_product/' + item.AnhDaiDien" :alt="item.TenMH" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 gallery-image-mask"/>
              
              <div class="absolute top-6 left-6">
                <span :class="`px-4 py-1.5 backdrop-blur-md text-[10px] font-bold rounded-full border uppercase tracking-widest ${getTagClass(item.LoaiHinhBan)}`">
                  {{ item.LoaiHinhBan || 'Mô Hình' }}
                </span>
              </div>

              <div class="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-[#0c0e17] via-[#0c0e17]/60 to-transparent">
                <div class="mb-2">
                  <span :class="`px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-widest ${getStatusClass(item.SoLuong, item.TrangThai)}`">
                    {{ item.SoLuong === 0 ? 'Hết hàng' : (item.TrangThai || 'Sẵn có') }}
                  </span>
                </div>
                <h3 class="font-headline text-3xl font-bold leading-none mb-2 text-white line-clamp-2">{{ item.TenMH }}</h3>
                <div class="flex justify-between items-end">
                  <p class="font-headline text-2xl font-bold text-primary tracking-tighter">
                      {{ formatPrice(item.dongiakhuyenmai ? item.dongiakhuyenmai : item.DonGia) }}
                  </p>
                  <span class="text-[10px] text-outline uppercase tracking-widest font-bold">{{ item.TenHSX }}</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-surface-container-highest border-t border-outline-variant/10 flex gap-2">
              
              <button 
                @click="addToCart(item)"
                :disabled="item.SoLuong === 0"
                :class="[
                  'flex-[2] py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded transition-all',
                  getActionButtonClass(item.SoLuong, item.TrangThai)
                ]"
              >
                <span class="material-symbols-outlined text-[16px]">{{ getActionIcon(item.SoLuong, item.TrangThai) }}</span>
                {{ getActionText(item.SoLuong, item.TrangThai) }}
              </button>

              <button 
                @click="removeFromWishlist(item.MaMoHinh)"
                class="flex-1 py-3 bg-surface-container text-error hover:bg-error/10 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded border border-error/20 hover:border-error transition-all"
              >
                <span class="material-symbols-outlined text-[16px]">close</span>
                Gỡ bỏ
              </button>
            </div>
          </div>

        </TransitionGroup>

        <div v-if="!isLoading && wishlistItems.length === 0" class="text-center py-32 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low">
          <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">heart_broken</span>
          <h2 class="font-headline text-2xl text-white font-bold mb-2">Chưa có báu vật nào!</h2>
          <p class="text-on-surface-variant mb-6">Hãy dạo quanh cửa hàng và lưu lại những mô hình bạn yêu thích nhé.</p>
          <button @click="router.push('/category')" class="px-8 py-3 bg-primary text-on-primary-fixed font-bold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20">
            Khám phá ngay
          </button>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TheHeader from '../../components/TheHeader.vue';
import { useAuthStore } from '../../stores/auth';
import { useToastStore } from '../../stores/toast';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const wishlistItems = ref([]); // Đã gỡ bỏ dữ liệu giả
const isLoading = ref(true);
const userString = localStorage.getItem('user');
const currentUser = userString ? JSON.parse(userString) : null;

// Lấy danh sách yêu thích từ Backend
const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
        router.push('/login');
        return;
    }

    const userObj = JSON.parse(userString);

    try {
        isLoading.value = true;
        // Gọi API của bạn (khớp với route bạn khai báo)
        const response = await fetch(`http://localhost:3000/api/products/list_favorite/${userObj.MaKH}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const dataJSON = await response.json();

        if (response.ok) {
            wishlistItems.value = dataJSON.data || [];
        } else {
            console.error("Lỗi:", dataJSON.message);
        }
    } catch (error) {
        console.error("Lỗi khi kết nối API lấy danh sách yêu thích:", error);
    } finally {
        isLoading.value = false;
    }
};

// Hàm gỡ bỏ sản phẩm gọi API Toggle
const removeFromWishlist = async (maMoHinh) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const userObj = JSON.parse(userString);

    try {
        const payload = {
            MaKH: userObj.MaKH,
            MaMoHinh: maMoHinh
        };

        const response = await fetch('http://localhost:3000/api/products/add_remove_favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload) 
        });

        const data = await response.json();

        if (response.ok && data.action === 'removed') {
            // Lọc sản phẩm ra khỏi mảng để giao diện tự cập nhật (Hiệu ứng Transition)
            wishlistItems.value = wishlistItems.value.filter(item => item.MaMoHinh !== maMoHinh);
            toastStore.showToast("💔 Đã xóa khỏi danh sách yêu thích", "success");
        }
    } catch (error) {
        console.error("Lỗi khi xóa yêu thích:", error);
        toastStore.showToast("⚠️ Có lỗi xảy ra khi gỡ bỏ!", "error");
    }
};

const avatarPreview = ref(
  currentUser && currentUser.AnhDaiDien 
    ? `http://localhost:3000/Images_user/${currentUser.AnhDaiDien}` 
    : 'default_avatar.jpg'
);

const fetchUserData = async () => {
  if (!currentUser) return;
  
  try {
    // Gọi đường link API lấy thông tin bạn vừa viết (truyền MaTK vào đuôi)
    const res = await fetch(`http://localhost:3000/api/info_user/laythongtin/${currentUser.id}`);
    const dataJSON = await res.json();
    
    if (res.ok && dataJSON.data) {
      const userData = dataJSON.data;
      if (userData.AnhDaiDien && userData.AnhDaiDien !== '') {
        avatarPreview.value = `http://localhost:3000/Images_user/${userData.AnhDaiDien}`;
      }
    }
  } catch (error) {
    console.error("Lỗi kéo thông tin người dùng:", error);
  }
};

onMounted(() => {
    window.scrollTo(0, 0);
    if (!authStore.user && !localStorage.getItem('token')) {
        router.push('/login');
    } else {
        fetchWishlist();
    }
    fetchUserData();
});

// CÁC HÀM XỬ LÝ MÀU SẮC DỰA TRÊN TRẠNG THÁI TỪ BACKEND
const getTagClass = (type) => {
  if (type === 'Limited') return 'bg-primary/20 text-primary border-primary/30';
  if (type === 'Pre-order') return 'bg-tertiary-dim/20 text-tertiary-dim border-tertiary-dim/30';
  return 'bg-outline/20 text-white border-outline/30';
};

const getStatusClass = (soLuong, status) => {
  if (soLuong === 0) return 'bg-error/20 text-error border-error/30';
  if (status === 'Sắp về') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-green-900/40 text-green-400 border-green-500/30'; // Mặc định sẵn có
};

const getActionButtonClass = (soLuong, status) => {
  if (soLuong === 0) return 'bg-surface-container border border-outline/20 text-outline cursor-not-allowed';
  if (status === 'Pre-order') return 'bg-gradient-to-r from-tertiary-dim to-tertiary text-on-tertiary hover:brightness-110 active:scale-95';
  return 'bg-primary text-on-primary-fixed hover:brightness-110 active:scale-95';
};

const getActionText = (soLuong, status) => {
  if (soLuong === 0) return 'Đã hết hàng';
  return 'Xem chi tiết'; // Chuyển nút Mua ở đây thành Xem chi tiết để an toàn khi chọn variant
};

const getActionIcon = (soLuong, status) => {
  if (soLuong === 0) return 'notifications';
  return 'shopping_cart';
};

const addToCart = (item) => {
  if (item.SoLuong === 0) return;
  // Bấm nút giỏ hàng ở Wishlist sẽ đưa thẳng vào xem chi tiết để khách chọn biến thể (Variant)
  router.push(`/product/${item.MaMoHinh}`);
};

const handleLogout = () => {
  if (authStore.logout) authStore.logout();
  else localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.gallery-image-mask {
  mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
}

/* Hiệu ứng khi xóa thẻ */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.list-leave-active {
  position: absolute;
}
</style>