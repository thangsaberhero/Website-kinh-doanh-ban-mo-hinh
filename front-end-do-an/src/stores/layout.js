import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
  const isSidebarCollapsed = ref(false);
  const isMobileMenuOpen = ref(false);
  const openSubMenus = ref({});
  const sidebarScrollTop = ref(0);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    } 
    else {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    }
  };

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };

  return {
    isSidebarCollapsed,
    isMobileMenuOpen,
    openSubMenus,
    sidebarScrollTop,
    toggleSidebar,
    closeMobileMenu
  };
});