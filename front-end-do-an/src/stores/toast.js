import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const message = ref('');
  const type = ref('success'); // 'success' hoặc 'error'
  const isVisible = ref(false);
  let timeout = null;

  // Hàm bật Toast
  const showToast = (msg, toastType = 'success') => {
    message.value = msg;
    type.value = toastType;
    isVisible.value = true;

    // Tự động tắt sau 3 giây
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      isVisible.value = false;
    }, 3000);
  };

  // Hàm tắt Toast bằng tay (khi bấm dấu X)
  const closeToast = () => {
    isVisible.value = false;
  };

  return { message, type, isVisible, showToast, closeToast };
});