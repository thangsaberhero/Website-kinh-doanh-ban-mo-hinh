<template>
  <aside 
    class="bg-[#091328] flex flex-col h-screen sticky top-0 z-50 transition-[width] duration-300 ease-in-out select-none"
    :class="isCollapsed ? 'w-20' : 'w-64'"
  >
    <div class="py-8 flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300" 
         :class="isCollapsed ? 'items-center px-0' : 'px-6'">
      <h1 class="font-headline font-brand font-bold text-[#ff8f73] tracking-tighter transition-all duration-300" 
          :class="isCollapsed ? 'text-xl' : 'text-2xl'">
        {{ isCollapsed ? 'FC' : 'FigureCollect' }}
      </h1>
      <p class="text-[10px] text-[#a3aac4] uppercase tracking-[0.2em] mt-1 transition-all duration-300 ease-in-out"
         :class="isCollapsed ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'">
        Hệ thống Quản trị
      </p>
    </div>

    <nav ref="navRef" @scroll="handleScroll" class="flex-1 space-y-1 overflow-y-auto overflow-x-visible custom-scrollbar pb-10 relative">
      <div 
        v-for="(item, index) in mainMenuItems" 
        :key="index"
        class="relative"
        @mouseenter="handleMouseEnter($event, item.name)"
        @mouseleave="hoveredMenu = null"
      >
        <template v-if="item.children">
          <button 
            @click="toggleSubMenu(item.name)"
            class="w-full flex items-center justify-between py-3 font-body text-sm font-medium transition-all duration-200 border-l-2 text-[#a3aac4] hover:text-white hover:bg-[#141f38]"
            :class="isGroupActive(item) ? 'text-[#ff8f73] bg-[#141f38]/50 border-[#ff3d00]' : 'border-transparent'"
          >
            <div class="flex items-center">
              <div class="flex items-center justify-center min-w-[80px]">
                <span class="material-symbols-outlined" :class="isGroupActive(item) ? 'font-bold text-[#ff8f73]' : ''">
                  {{ item.icon }}
                </span>
              </div>
              <span 
                class="whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-300 ease-in-out text-left"
                :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'"
              >
                {{ item.name }}
              </span>
            </div>
            <span 
              v-show="!isCollapsed"
              class="material-symbols-outlined text-[18px] mr-4 transition-transform duration-300"
              :class="layoutStore.openSubMenus[item.name] ? 'rotate-180 text-[#ff8f73]' : 'text-slate-500'"
            >
              expand_more
            </span>
          </button>

          <div v-show="!isCollapsed && layoutStore.openSubMenus[item.name]" class="bg-[#0b1833]/40 overflow-hidden transition-all duration-200 ease-in-out">
            <RouterLink 
              v-for="child in item.children" 
              :key="child.path"
              :to="child.path"
              class="flex items-center py-2.5 pl-14 pr-4 font-body text-sm font-medium text-[#a3aac4] hover:text-white hover:bg-white/5 transition-colors"
              exact-active-class="!text-[#ff8f73] !font-bold bg-[#141f38]/30"
            >
              <span class="material-symbols-outlined text-[18px] mr-3 opacity-70">
                {{ child.icon }}
              </span>
              {{ child.name }}
            </RouterLink>
          </div>
        </template>

        <template v-else>
          <RouterLink 
            :to="item.path" 
            class="flex items-center py-3 font-body text-sm font-medium transition-all duration-200 border-l-2 border-transparent text-[#a3aac4] hover:text-white hover:bg-[#141f38]"
            exact-active-class="!text-[#ff8f73] !bg-[#141f38] !border-[#ff3d00]"
          >
            <div class="flex items-center justify-center min-w-[80px]">
              <span class="material-symbols-outlined">{{ item.icon }}</span>
            </div>
            <span 
              class="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
              :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'"
            >
              {{ item.name }}
            </span>
          </RouterLink>
        </template>

        <div 
          v-if="isCollapsed && hoveredMenu === item.name" 
          class="fixed left-[80px] z-[100] flex items-start animate-fade-in"
          :style="{ top: `${popupTop}px` }"
        >
          <div class="absolute left-1 top-[18px] w-3 h-3 bg-[#141f38] rotate-45 transform origin-center border-b border-l border-white/10 z-0"></div>
          
          <div class="bg-[#141f38] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 min-w-[220px] relative z-10 ml-2">
            <div class="px-4 py-2 font-bold text-white text-xs uppercase tracking-wider border-b border-white/5 bg-[#1a2642]">
              {{ item.name }}
            </div>
            <template v-if="item.children">
              <RouterLink 
                v-for="child in item.children" 
                :key="child.path"
                :to="child.path"
                class="flex items-center px-4 py-2.5 font-body text-sm font-medium text-[#a3aac4] hover:text-white hover:bg-white/5 transition-colors"
                exact-active-class="!text-[#ff8f73] !bg-[#1a2642]"
              >
                <span class="material-symbols-outlined text-[18px] mr-3 opacity-70">
                  {{ child.icon }}
                </span>
                {{ child.name }}
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <div class="mt-auto pb-6 border-t border-white/5 pt-4 space-y-1 overflow-x-visible relative">
      <div class="relative" @mouseenter="handleMouseEnter($event, 'settings')" @mouseleave="hoveredMenu = null">
        <RouterLink 
          to="/admin/settings" 
          class="flex items-center py-3 font-body text-sm font-medium transition-all duration-200 border-l-2 border-transparent text-[#a3aac4] hover:text-white hover:bg-[#141f38]"
          exact-active-class="!text-[#ff8f73] !bg-[#141f38] !border-[#ff3d00]"
        >
          <div class="flex items-center justify-center min-w-[80px]">
            <span class="material-symbols-outlined">settings</span>
          </div>
          <span class="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out" :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'">
            Cài đặt
          </span>
        </RouterLink>

        <div v-if="isCollapsed && hoveredMenu === 'settings'" class="fixed left-[80px] z-[100] flex items-start animate-fade-in" :style="{ top: `${popupTop}px` }">
          <div class="absolute left-1 top-[18px] w-3 h-3 bg-[#141f38] rotate-45 transform origin-center border-b border-l border-white/10 z-0"></div>
          <div class="bg-[#141f38] text-white text-sm font-bold px-4 py-3 rounded-lg shadow-2xl relative z-10 whitespace-nowrap border border-white/10 ml-2">
            Cài đặt
          </div>
        </div>
      </div>
      
      <div class="relative" @mouseenter="handleMouseEnter($event, 'logout')" @mouseleave="hoveredMenu = null">
        <button @click="handleLogout" class="w-full flex items-center py-3 text-[#a3aac4] hover:text-[#ff6e84] hover:bg-[#141f38] transition-all duration-200 font-body text-sm font-medium border-l-2 border-transparent">
          <div class="flex items-center justify-center min-w-[80px]">
            <span class="material-symbols-outlined">logout</span>
          </div>
          <span class="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out" :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'">
            Đăng xuất
          </span>
        </button>

         <div v-if="isCollapsed && hoveredMenu === 'logout'" class="fixed left-[80px] z-[100] flex items-start animate-fade-in" :style="{ top: `${popupTop}px` }">
          <div class="absolute left-1 top-[18px] w-3 h-3 bg-rose-600 rotate-45 transform origin-center z-0"></div>
          <div class="bg-rose-600 text-white text-sm font-bold px-4 py-3 rounded-lg shadow-2xl relative z-10 whitespace-nowrap ml-2">
            Đăng xuất
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { RouterLink, useRoute, useRouter } from 'vue-router';
  import { useLayoutStore } from '../../stores/layout';
  import { useToastStore } from '../../stores/toast';

  defineProps({
    isCollapsed: {
      type: Boolean,
      default: false
    }
  });

  const route = useRoute();
  const router = useRouter();
  const layoutStore = useLayoutStore();
  const toastStore = useToastStore();

  const hoveredMenu = ref(null);
  const popupTop = ref(0);
  const navRef = ref(null);

  const mainMenuItems = [
    { 
      name: 'Quản lý hệ thống', 
      icon: 'admin_panel_settings',
      children: [
        { name: 'Bảng điều khiển', path: '/admin', icon: 'dashboard' },
        { name: 'Quản lý người dùng', path: '/admin/users', icon: 'group' } 
      ]
    },
    { 
      name: 'Quản lý danh mục', 
      icon: 'inventory_2',
      children: [
        { name: 'Quản lý sản phẩm', path: '/admin/inventory', icon: 'box' },
        { name: 'Danh mục sản phẩm', path: '/admin/categories', icon: 'category' },
        { name: 'Hãng sản xuất', path: '/admin/manufacturers', icon: 'factory' }
      ]
    },
    { 
      name: 'Quản lý bán hàng', 
      icon: 'shopping_bag',
      children: [
        { name: 'Quản lý tin tức', path: '/admin/news', icon: 'newspaper' },
        { name: 'Quản lý đơn hàng', path: '/admin/orders', icon: 'receipt_long' },
        { name: 'Quản lý thanh toán', path: '/admin/payment', icon: 'payments' },
        { name: 'Quản lý Blockchain', path: '/admin/blockchain', icon: 'link' } 
      ]
    },
    { 
      name: 'Quản lý hậu mãi, khuyến mãi, tư vấn khách hàng', 
      icon: 'support_agent',
      children: [
        { name: 'Quản lý khuyến mãi', path: '/admin/promotion', icon: 'loyalty' },
        { name: 'Hỗ trợ khách hàng', path: '/admin/support', icon: 'forum' } 
      ]
    },
    { 
      name: 'Báo cáo và thống kê', 
      path: '/admin/report', 
      icon: 'bar_chart' 
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    toastStore.showToast("Đã đăng xuất khỏi hệ thống!", "success");
    router.push('/login');
  };

  // Khởi tạo trạng thái ban đầu: Chỉ gán mở (true) nếu nhóm này chưa từng được lưu trong Pinia
  const initializeMenus = () => {
    mainMenuItems.forEach(item => {
      if (item.children) {
        if (layoutStore.openSubMenus[item.name] === undefined) {
          layoutStore.openSubMenus[item.name] = true;
        }
      }
    });
  };

  const toggleSubMenu = (menuName) => {
    layoutStore.openSubMenus[menuName] = !layoutStore.openSubMenus[menuName];
  };

  const handleMouseEnter = (event, menuName) => {
    hoveredMenu.value = menuName;
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      popupTop.value = rect.top;
    }
  };

  const isGroupActive = (item) => {
    if (!item.children) return false;
    return item.children.some(child => route.path === child.path);
  };

  // Hàm bắt sự kiện cuộn chuột để lưu lại vị trí hiện tại vào Pinia
  const handleScroll = (event) => {
    layoutStore.sidebarScrollTop = event.target.scrollTop;
  };

  onMounted(() => {
    initializeMenus();
    if (navRef.value) {
      navRef.value.scrollTop = layoutStore.sidebarScrollTop;
    }
  });
  </script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #40485d; border-radius: 4px; }

  .animate-fade-in {
    animation: fadeIn 0.15s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>