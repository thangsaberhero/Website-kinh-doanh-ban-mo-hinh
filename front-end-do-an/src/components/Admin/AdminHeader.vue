<template>
    <header class="bg-white border-b border-slate-200 h-16 flex justify-between items-center px-8 shrink-0 z-40 sticky top-0 shadow-sm transition-all duration-300">
      
      <div class="flex items-center gap-4">
        <button 
          @click="$emit('toggle-sidebar')" 
          class="text-slate-500 hover:text-[#ff8f73] bg-slate-50 hover:bg-[#ff8f73]/10 p-2 -ml-3 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>
        
        <div class="relative group">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input 
            @input="$emit('search', $event.target.value)"
            class="bg-slate-50 border border-slate-200 text-sm pl-10 pr-12 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff8f73] focus:border-[#ff8f73] w-64 lg:w-96 transition-all placeholder:text-slate-400" 
            placeholder="Tìm kiếm dữ liệu, chức năng..." 
            type="text"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-400 bg-white border border-slate-200 rounded">Ctrl</kbd>
            <kbd class="px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-400 bg-white border border-slate-200 rounded">K</kbd>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-6">
        <div class="flex gap-2">
          
          <div class="relative group">
            <button class="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors">
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span class="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff8f73] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff3d00] border-2 border-white"></span>
              </span>
            </button>
  
            <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 overflow-hidden cursor-default">
              <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 class="text-sm font-bold text-slate-900">Thông báo mới</h3>
                <button class="text-[10px] text-[#ff8f73] hover:text-[#ff3d00] font-semibold">Đánh dấu đã đọc</button>
              </div>
              
              <div class="max-h-[300px] overflow-y-auto">
                <a href="#" class="flex gap-3 p-4 bg-[#ff8f73]/5 hover:bg-slate-50 border-b border-slate-50 transition-colors">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[16px]">local_mall</span>
                  </div>
                  <div>
                    <p class="text-sm text-slate-800 font-medium">Đơn hàng mới <span class="font-bold">#FC-9025</span></p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Khách hàng Nguyễn Văn A vừa đặt mua 2 vật phẩm.</p>
                    <p class="text-[10px] text-[#ff8f73] font-semibold mt-1">Vừa xong</p>
                  </div>
                  <div class="w-2 h-2 rounded-full bg-[#ff3d00] mt-1 shrink-0"></div> </a>
  
                <a href="#" class="flex gap-3 p-4 hover:bg-slate-50 border-b border-slate-50 transition-colors">
                  <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[16px]">inventory_2</span>
                  </div>
                  <div>
                    <p class="text-sm text-slate-800 font-medium">Cảnh báo sắp hết hàng</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Sản phẩm "Gundam RX-78-2" chỉ còn 3 hộp trong kho.</p>
                    <p class="text-[10px] text-slate-400 font-medium mt-1">2 giờ trước</p>
                  </div>
                </a>
              </div>
              
              <a href="#" class="block w-full text-center px-4 py-3 text-xs font-bold text-slate-500 hover:text-[#ff8f73] hover:bg-slate-50 transition-colors border-t border-slate-100">
                XEM TẤT CẢ THÔNG BÁO
              </a>
            </div>
          </div>
          
          <div class="relative group">
            <button class="text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition-colors" title="Trợ giúp & Tài liệu">
                <span class="material-symbols-outlined text-[20px]">help</span>
            </button>

            <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 overflow-hidden cursor-default">
                <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 class="text-sm font-bold text-slate-900">Trung tâm Hỗ trợ</h3>
                </div>
                
                <div class="py-1">
                <RouterLink to="/admin/help/docs" class="flex items-center justify-between px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#ff8f73] transition-colors group/item">
                    <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">menu_book</span> Tài liệu sử dụng
                    </div>
                    <span class="material-symbols-outlined text-[14px] opacity-0 group-hover/item:opacity-100 transition-opacity">open_in_new</span>
                </RouterLink>
                
                <RouterLink to="/admin/help/faq" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#ff8f73] transition-colors">
                    <span class="material-symbols-outlined text-[18px]">quiz</span> Câu hỏi thường gặp
                </RouterLink>

                <button class="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#ff8f73] transition-colors">
                    <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">keyboard</span> Phím tắt hệ thống
                    </div>
                    <kbd class="px-1.5 py-0.5 text-[9px] font-sans font-semibold text-slate-400 bg-white border border-slate-200 rounded">Ctrl + /</kbd>
                </button>
                </div>

                <div class="py-1 border-t border-slate-100 bg-slate-50/50">
                <RouterLink to="/admin/help/contact" class="flex items-center gap-2 px-4 py-2 text-sm text-[#ff8f73] hover:text-[#ff3d00] font-medium transition-colors">
                    <span class="material-symbols-outlined text-[18px]">support_agent</span> Liên hệ hỗ trợ IT
                </RouterLink>
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
              <img :src="user?.AnhDaiDien ? `http://localhost:3000/Images_user/${user.AnhDaiDien}` : `https://ui-avatars.com/api/?name=${user?.TenNV || user?.username || user?.TenDN || 'Admin'}&background=ff8f73&color=fff&bold=true`" alt="Avatar" class="w-full h-full object-cover">
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
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../../stores/auth.js';

  const authStore = useAuthStore();
  const router = useRouter();

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

  // Xử lý đăng xuất
  const handleLogout = () => {
  if (authStore.logout) {
    authStore.logout();
  } else {
    localStorage.removeItem('token'); 
  }
  router.push('/login');
};
</script>