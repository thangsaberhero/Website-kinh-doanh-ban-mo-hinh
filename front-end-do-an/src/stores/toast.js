import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  const showToast = (message, type = 'success', duration = 3000, position = 'bottom-right') => {
    // Kiểm tra trùng lặp dựa trên cả nội dung, loại và vị trí hiển thị
    const existingToast = toasts.value.find(
      (t) => t.message === message && t.type === type && t.position === position
    );

    if (existingToast) {
      existingToast.count += 1;
      existingToast.updatedAt = Date.now(); 
      
      existingToast.startTime = Date.now();
      existingToast.remainingTime = duration;
      existingToast.isPaused = false;

      if (duration > 0) {
        clearTimeout(existingToast.timerId);
        existingToast.timerId = setTimeout(() => {
          closeToast(existingToast.id);
        }, duration);
      }
      return; 
    }

    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    const newToast = { id, message, type, count: 1, duration, position, updatedAt: Date.now(), startTime: Date.now(), remainingTime: duration, isPaused: false, timerId: null };

    toasts.value.push(newToast);

    if (duration > 0) {
      newToast.timerId = setTimeout(() => {
        closeToast(id);
      }, duration);
    }
  };

  const pauseToast = (id) => {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast && !toast.isPaused && toast.duration > 0) {
      clearTimeout(toast.timerId);
      toast.remainingTime -= (Date.now() - toast.startTime);
      toast.isPaused = true;
    }
  };

  const resumeToast = (id) => {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast && toast.isPaused && toast.remainingTime > 0) {
      toast.startTime = Date.now();
      toast.isPaused = false;
      
      toast.timerId = setTimeout(() => {
        closeToast(id);
      }, toast.remainingTime);
    }
  };

  const closeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      clearTimeout(toasts.value[index].timerId); 
      toasts.value.splice(index, 1);
    }
  };

  return { toasts, showToast, closeToast, pauseToast, resumeToast };
});