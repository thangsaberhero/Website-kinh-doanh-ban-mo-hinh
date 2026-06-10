// File: src/stores/system.js
import { defineStore } from 'pinia';

export const useSystemStore = defineStore('system', {
  state: () => ({
    settings: {
      shop_name: 'FigureCollect',
      contact_phone: '',
      contact_email: '',
      shop_address: '',
      logo_header: '',
      logo_favicon: '',
      login_bg: [], // Chứa mảng ảnh slider đăng nhập
      home_banner: [], // Chứa mảng ảnh banner trang chủ
      social_facebook: '',
      social_youtube: '',
      social_instagram: ''
    },
    isLoaded: false // Cờ đánh dấu để không gọi API nhiều lần
  }),
  
  actions: {
    async fetchSettings(forceReload = false) {
      // Nếu đã tải rồi VÀ không có lệnh ép tải lại (forceReload), thì mới dừng
      if (this.isLoaded && !forceReload) return; 

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api/setting/admin`);
        const result = await response.json();
        
        if (result.success) {
          this.settings = { ...this.settings, ...result.data };
          this.isLoaded = true;
          
          // 🔥 MAGIC: Tự động đổi Title và Favicon của website
          if (this.settings.shop_name) {
            document.title = this.settings.shop_name;
          }
          if (this.settings.logo_favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = this.settings.logo_favicon;
          }
        }
      } 
      catch (error) {
        console.error('Lỗi tải cài đặt hệ thống:', error);
      }
    }
  }
});