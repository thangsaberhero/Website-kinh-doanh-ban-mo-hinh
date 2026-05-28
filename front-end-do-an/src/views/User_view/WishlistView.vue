<template>
  <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
    <TheHeader />
    <div class="flex flex-1 w-full max-w-7xl mx-auto overflow-hidden">
      <UserSidebar />

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
              <img :src="'${API_BASE_URL}/Images_product/' + item.AnhDaiDien" :alt="item.TenMH" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 gallery-image-mask"/>
              
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
  import { useAuthStore } from '../../stores/auth';
  import { useToastStore } from '../../stores/toast';
  import TheHeader from '../../components/TheHeader.vue';
  import UserSidebar from '../../components/UserSidebar.vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const toastStore = useToastStore();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const wishlistItems = ref([]); 
  const isLoading = ref(true);
  const userString = localStorage.getItem('user');

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
        const response = await fetch(`${API_BASE_URL}/api/products/list_favorite/${userObj.MaKH}`, {
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
      } 
      catch (error) {
        console.error("Lỗi khi kết nối API lấy danh sách yêu thích:", error);
      } 
      finally {
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

      const response = await fetch('${API_BASE_URL}/api/products/add_remove_favorite', {
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
    } 
    catch (error) {
      console.error("Lỗi khi xóa yêu thích:", error);
      toastStore.showToast("⚠️ Có lỗi xảy ra khi gỡ bỏ!", "error");
    }
  };

  onMounted(() => {
    window.scrollTo(0, 0);
    if (!authStore.user && !localStorage.getItem('token')) {
      router.push('/login');
    } 
    else {
      fetchWishlist();
    }
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
    return 'bg-green-900/40 text-green-400 border-green-500/30';
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
    router.push(`/product/${item.MaMoHinh}`);
  };
</script>

<style scoped>

  .gallery-image-mask {
    mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
  }

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