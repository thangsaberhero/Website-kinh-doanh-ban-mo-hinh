import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const savedTheme = localStorage.getItem('theme');
  const isDark = ref(savedTheme ? savedTheme === 'dark' : true);

  const applyTheme = (dark) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  applyTheme(isDark.value);

  watch(isDark, (newValue) => {
    applyTheme(newValue);
  });

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggleTheme };
});