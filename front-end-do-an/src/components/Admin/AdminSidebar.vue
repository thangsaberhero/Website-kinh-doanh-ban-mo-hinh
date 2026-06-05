<template>
  <aside 
    class="bg-[#091328] flex flex-col h-screen sticky top-0 z-50 transition-[width] duration-300 ease-in-out overflow-hidden"
    :class="isCollapsed ? 'w-20' : 'w-64'"
  >
    <div class="py-8 flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300" 
         :class="isCollapsed ? 'items-center px-0' : 'px-6'">
      <h1 class="font-headline font-bold text-[#ff8f73] tracking-tighter transition-all duration-300" 
          :class="isCollapsed ? 'text-xl' : 'text-2xl'">
        {{ isCollapsed ? 'FC' : 'FigureCollect' }}
      </h1>
      <p class="text-[10px] text-[#a3aac4] uppercase tracking-[0.2em] mt-1 transition-all duration-300 ease-in-out"
         :class="isCollapsed ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'">
        Hệ thống Quản trị
      </p>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
      <RouterLink 
        v-for="item in mainMenuItems" 
        :key="item.path"
        :to="item.path" 
        class="flex items-center py-3 font-body text-sm font-medium transition-all duration-200 border-r-2 border-transparent text-[#a3aac4] hover:text-white hover:bg-[#141f38]"
        exact-active-class="!text-[#ff8f73] !bg-[#141f38] !border-[#ff3d00]"
        :title="isCollapsed ? item.name : ''" 
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
    </nav>

    <div class="mt-auto pb-6 border-t border-white/5 pt-4 space-y-1 overflow-x-hidden">
      <RouterLink 
        to="/admin/settings" 
        class="flex items-center py-3 font-body text-sm font-medium transition-all duration-200 border-r-2 border-transparent text-[#a3aac4] hover:text-white hover:bg-[#141f38]"
        exact-active-class="!text-[#ff8f73] !bg-[#141f38] !border-[#ff3d00]"
        :title="isCollapsed ? 'Cài đặt' : ''"
      >
        <div class="flex items-center justify-center min-w-[80px]">
          <span class="material-symbols-outlined">settings</span>
        </div>
        <span 
          class="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
          :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'"
        >
          Cài đặt
        </span>
      </RouterLink>
      
      <button 
        class="w-full flex items-center py-3 text-[#a3aac4] hover:text-[#ff6e84] hover:bg-[#141f38] transition-all duration-200 font-body text-sm font-medium"
        :title="isCollapsed ? 'Đăng xuất' : ''"
      >
        <div class="flex items-center justify-center min-w-[80px]">
          <span class="material-symbols-outlined">logout</span>
        </div>
        <span 
          class="whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out"
          :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'"
        >
          Đăng xuất
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

const mainMenuItems = [
  { name: 'Bảng điều khiển', path: '/admin', icon: 'dashboard' },
  { name: 'Quản lý sản phẩm', path: '/admin/inventory', icon: 'inventory_2' },
  { name: 'Quản lý Blockchain', path: '/admin/blockchain', icon: 'link' },
  { name: 'Quản lý hãng sản xuất', path: '/admin/manufacturers', icon: 'factory' },
  { name: 'Danh mục sản phẩm', path: '/admin/categories', icon: 'category' },
  { name: 'Quản lý đơn hàng', path: '/admin/orders', icon: 'local_shipping' },
  { name: 'Hỗ trợ khách hàng', path: '/admin/support', icon: 'support_agent' },
  { name: 'Quản lý người dùng', path: '/admin/users', icon: 'group' },
  { name: 'Quản lý tin tức', path: '/admin/news', icon: 'newspaper' },
  { name: 'Quản lý khuyến mãi', path: '/admin/promotion', icon: 'confirmation_number' },
  { name: 'Báo cáo và Thống kê', path: '/admin/report', icon: 'bar_chart' }
];
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #40485d; border-radius: 4px; }
a.exact-active-class:hover { transform: none !important; }
</style>