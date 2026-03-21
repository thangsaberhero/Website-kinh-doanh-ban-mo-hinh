<template>
  <div class="min-h-screen bg-blue-50 p-8">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Trang Chủ Hệ Thống</h1>
      <p class="text-gray-600 mb-6">Chào mừng bạn đã đăng nhập thành công. Đây là khu vực quản trị.</p>
      
      <button @click="handleLogout" class="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition">
        Đăng Xuất
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.user = null; // Xóa thông tin user
  router.push('/');      // Lệnh thần thánh: Đẩy người dùng về lại trang đăng nhập (URL là '/')
};
</script>