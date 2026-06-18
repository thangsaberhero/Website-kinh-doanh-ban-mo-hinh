import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse((localStorage.getItem('user') || sessionStorage.getItem('user'))) || null);
  const token = ref((localStorage.getItem('token') || sessionStorage.getItem('token')) || null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const login = async (username, password, remember) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TenDN: username, 
          MatKhau: password, 
          remember: remember
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Dữ liệu user từ Backend:", data.user);
        user.value = data.user;
        token.value = data.token;

        if (remember) {
          // Có ghi nhớ: Lưu dài hạn
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } 
        else {
          // Không ghi nhớ: Lưu ngắn hạn (Tắt trình duyệt là đăng xuất)
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        return true;
      } else {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      throw error;
    }
  };

  const initializeAuth = () => {
    const tokenStr = (localStorage.getItem('token') || sessionStorage.getItem('token')) || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (tokenStr && userStr) {
        user.value = JSON.parse(userStr); 
        token.value = tokenStr;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return { user, token, login, logout, initializeAuth };
});