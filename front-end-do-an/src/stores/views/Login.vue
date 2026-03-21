<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      
      <div v-if="isLoginView">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Đăng Nhập Quản Trị</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập</label>
            <input v-model="loginUsername" type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
            <input v-model="loginPassword" type="password" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">Đăng Nhập</button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-600">
          Chưa có tài khoản? 
          <a href="#" @click.prevent="isLoginView = false" class="text-blue-600 hover:underline font-bold">Đăng ký ngay</a>
        </p>
      </div>

      <div v-else>
        <h2 class="text-2xl font-bold mb-6 text-center text-green-600">Tạo Tài Khoản Mới</h2>
        <form @submit.prevent="handleRegister">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập mới</label>
            <input v-model="regUsername" type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input v-model="regEmail" type="email" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
            <input v-model="regPassword" type="password" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
          </div>
          <button type="submit" class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">Đăng Ký Khách Hàng</button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản? 
          <a href="#" @click.prevent="isLoginView = true" class="text-green-600 hover:underline font-bold">Quay lại đăng nhập</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useRouter } from 'vue-router'; // 1. Gọi anh đạo diễn
const router = useRouter();             // 2. Nhận việc

// Sửa lại hàm handleLogin một chút:
const handleLogin = async () => {
  // Thêm chữ await để đợi Node.js xử lý xong
  await authStore.login(loginUsername.value, loginPassword.value); 
  
  // Nếu Pinia có dữ liệu user -> Đăng nhập thành công
  if (authStore.user) {
    router.push('/home'); // 3. Lệnh "kéo rèm" chuyển sang trang chủ!
  }
};
// Biến điều khiển bật/tắt form (Mặc định là true -> Hiện Đăng nhập)
const isLoginView = ref(true); 

// --- Dữ liệu cho Form Đăng nhập ---
const loginUsername = ref('');
const loginPassword = ref('');
const authStore = useAuthStore();

// const handleLogin = () => {
//   authStore.login(loginUsername.value, loginPassword.value);
// };

// --- Dữ liệu cho Form Đăng ký ---
const regUsername = ref('');
const regEmail = ref('');
const regPassword = ref('');

// Hàm gọi API Đăng ký (Tương đương với việc submit form trong PHP)
const handleRegister = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: regUsername.value, 
        password: regPassword.value,
        email: regEmail.value
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Tạo tài khoản thành công! Hãy đăng nhập nhé.');
      // Xóa trắng form đăng ký
      regUsername.value = ''; regEmail.value = ''; regPassword.value = '';
      // Tự động lật ngược lại màn hình Đăng nhập
      isLoginView.value = true; 
    } else {
      alert(data.message); // Báo lỗi nếu trùng tên đăng nhập
    }
  } catch (error) {
    alert('Lỗi kết nối đến Backend!');
  }
};
</script>