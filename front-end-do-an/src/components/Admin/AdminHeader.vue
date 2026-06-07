<template>
    <header class="bg-white border-b border-slate-200 h-16 flex justify-between items-center px-8 shrink-0 z-40 sticky top-0 shadow-sm transition-all duration-300">
      
      <div class="flex items-center gap-4">
        <button 
          @click="$emit('toggle-sidebar')" 
          class="text-slate-500 hover:text-[#ff8f73] bg-slate-50 hover:bg-[#ff8f73]/10 p-2 -ml-3 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
      
      <div class="flex items-center gap-6">
        <div class="flex gap-2">
          
          <div class="relative group">
            <button class="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors">
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span v-if="unreadCount > 0" class="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff8f73] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff3d00] border-2 border-white"></span>
              </span>
            </button>

            <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 overflow-hidden cursor-default"> 
              <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 class="text-sm font-bold text-slate-900">Thông báo mới ({{ unreadCount }})</h3>
                <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-[10px] text-[#ff8f73] hover:text-[#ff3d00] font-semibold">Đánh dấu đã đọc</button>
              </div>
              
              <div class="max-h-[300px] overflow-y-auto">
                <a v-for="notif in notifications" :key="notif.MaTB" @click.prevent="clickNotification(notif)" 
                  href="#" class="flex gap-3 p-4 hover:bg-slate-50 border-b border-slate-50 transition-colors"
                  :class="notif.DaDoc === 0 ? 'bg-[#ff8f73]/5' : ''">
                  
                  <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      :class="notif.LoaiThongBao === 'DonHang' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
                    <span class="material-symbols-outlined text-[16px]">
                      {{ notif.LoaiThongBao === 'DonHang' ? 'local_mall' : 'inventory_2' }}
                    </span>
                  </div>
                  
                  <div>
                    <p class="text-sm text-slate-800 font-medium">{{ notif.TieuDe }}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">{{ notif.NoiDung }}</p>
                    <p class="text-[10px] font-semibold mt-1" :class="notif.DaDoc === 0 ? 'text-[#ff8f73]' : 'text-slate-400'">
                      {{ new Date(notif.NgayTao).toLocaleString('vi-VN') }}
                    </p>
                  </div>
                  
                  <div v-if="notif.DaDoc === 0" class="w-2 h-2 rounded-full bg-[#ff3d00] mt-1 shrink-0"></div> 
                </a>

                <div v-if="notifications.length === 0" class="p-6 text-center text-slate-400 text-sm">
                  Bạn không có thông báo nào.
                </div>
                <button @click="router.push('/admin/notifications')" class="w-full text-center py-2.5 bg-slate-50 border-t border-slate-100 text-xs font-bold text-[#ff8f73] hover:text-[#ff3d00] hover:bg-slate-100/80 transition-all rounded-b-2xl">
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="h-8 w-[1px] bg-slate-200"></div>
        
        <div class="relative group cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="text-right hidden md:block">
              <p class="text-xs font-bold text-slate-900 group-hover:text-[#ff8f73] transition-colors">{{ user?.TenNV || user?.username || user?.TenDN || 'Admin' }}</p>
              <p class="text-[10px] text-[#ff8f73] uppercase font-bold tracking-wider">{{ roleName }}</p>
            </div>
            <div class="w-9 h-9 rounded-full bg-[#ff8f73]/10 border border-[#ff8f73]/30 flex items-center justify-center text-[#ff8f73] font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-[#ff8f73]/30 transition-all">
              <img :src="adminAvatar" alt="Admin Avatar" class="w-10 h-10 rounded-full object-cover border border-slate-200" />
            </div>
          </div>
  
          <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p class="text-xs font-medium text-slate-500">Tài khoản</p>
              <p class="text-sm font-bold text-slate-900 truncate">{{ user?.Email || user?.email || 'Chưa cập nhật email' }}</p>
            </div>
            <div class="py-1">
              <RouterLink to="/admin/profile" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#ff8f73]">
                <span class="material-symbols-outlined text-[18px]">person</span> Hồ sơ cá nhân
              </RouterLink>
              
              <RouterLink to="/admin/change-password" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#ff8f73]">
                <span class="material-symbols-outlined text-[18px]">shield_person</span> Bảo mật tài khoản
              </RouterLink>
            </div>
            <div class="py-1 border-t border-slate-100">
              <button @click="handleLogout" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium">
                <span class="material-symbols-outlined text-[18px]">logout</span> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
</template>
    
<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.js';

  const authStore = useAuthStore();
  const router = useRouter();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const notifications = ref([]);
  const unreadCount = ref(0);
  let pollingInterval = null;

  defineEmits(['toggle-sidebar', 'search']);

  // Lấy thông tin user từ store
  const user = computed(() => {
    if (authStore.user) return authStore.user;
    
    const localUser = localStorage.getItem('user');
    return localUser ? JSON.parse(localUser) : null;
  });
  // Chuyển đổi mã quyền thành văn bản hiển thị
  const roleName = computed(() => {
    if (!user.value) return '';
    const roleId = user.value.role || user.value.MaQuyen; 
    return roleId === 1 ? 'Quản trị viên' : 'Nhân viên';
  });


  const adminAvatar = computed(() => {
    // Ưu tiên lấy thông tin từ authStore, nếu chưa có thì fallback sang localStorage
    const user = authStore.user || JSON.parse(localStorage.getItem('user') || '{}');
    
    // 1. Trường hợp có ảnh đại diện
    if (user && user.AnhDaiDien) {
      const anh = user.AnhDaiDien;
      return anh.startsWith('http') ? anh : `${API_BASE_URL}/Images_user/${anh}`;
    }
    
    // 2. Trường hợp KHÔNG có ảnh: Tự động lấy tên hiển thị ban đầu tạo Avatar chữ
    // Hệ thống check lần lượt tên Nhân viên (TenNV), username, tên đăng nhập (TenDN) hoặc mặc định là 'Admin'
    const name = user.TenNV || user.username || user.TenDN || 'Admin';

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff8f73&color=fff&bold=true&size=128`;
  });
  // Xử lý đăng xuất
  const handleLogout = () => {
    if (authStore.logout) {
      authStore.logout();
    } 
    else {
      localStorage.removeItem('token'); 
    }
    router.push('/login');
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          if (pollingInterval) clearInterval(pollingInterval);
          return;
      }
      const res = await fetch(`${API_BASE_URL}/api/thong_bao_admin`, {
          headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
          if (pollingInterval) clearInterval(pollingInterval);
          return;
      }

      const result = await res.json();
      if (result.success) {
        notifications.value = result.data;
        unreadCount.value = result.unreadCount;
      }
    } 
    catch (error) { 
      console.error(error); 
    }
  };

  const markAllAsRead = async () => {
    await fetch(`${API_BASE_URL}/api/thong_bao_admin/read-all`, { 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      } 
    });
    fetchNotifications(); 
  };

  const clickNotification = async (notif) => {
    if (notif.DaDoc === 0) {
      await fetch(`${API_BASE_URL}/api/thong_bao_admin/read/${notif.MaTB}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } 
      });
      fetchNotifications();
    }
    if (notif.DuongDan) {
      router.push(notif.DuongDan);
    }
  };

  onMounted(() => {
    fetchNotifications();
    pollingInterval = setInterval(fetchNotifications, 30000); 
  });

  onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
  });
</script>