<template>
  <div 
    ref="customCursor" 
    class="my-custom-cursor"
    :class="cursorType"
  ></div>

  <RouterView /> 
  <TheToast />
  
  <PhoneRing v-if="!route.meta?.hidePhone && !route.meta?.requiresAdmin" />
  
  <template v-if="!route.meta?.hideFooter && !route.meta?.requiresAdmin">
    <FooterMinimal v-if="route.meta?.useMinimalFooter" />
    <FooterFull v-else />
  </template>
  
  <Chatbox v-if="!route.meta?.hideChatbot && !route.meta?.requiresAdmin" />
</template>

<script setup>
  import { RouterView, useRoute } from 'vue-router';
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useSystemStore } from '@/stores/system';
  import { useThemeStore } from '@/stores/theme';

  import TheToast from '@/components/TheToast.vue';
  import FooterFull from '@/components/FooterFull.vue';
  import FooterMinimal from '@/components/FooterMinimal.vue';
  import PhoneRing from '@/components/PhoneRing.vue';
  import Chatbox from '@/components/Chatbot.vue';

  const route = useRoute();
  const authStore = useAuthStore();
  const systemStore = useSystemStore();
  const themeStore = useThemeStore();
  
  watch(() => route.meta?.requiresAdmin, (isAdmin) => {
    const html = document.documentElement;
    if (isAdmin) {
      html.classList.add('dark');
    } else {
      if (themeStore.isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, { immediate: true });
  // --- LOGIC CON TRỎ CHUỘT ---
  const customCursor = ref(null);
  const cursorType = ref('is-normal'); // Trạng thái mặc định

  const isAppLoading = ref(false); 

  const moveCursor = (e) => {
    if (customCursor.value) {
      customCursor.value.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }
  };

  const handleHover = (e) => {
    // 1. Ưu tiên cao nhất: Nếu app đang bận xử lý (gọi API) -> Hiện Busy/Working
    if (isAppLoading.value) {
      cursorType.value = 'is-working';
      return;
    }

    const target = e.target;
    // 2. Thẻ bị vô hiệu hóa
    if (target.closest(':disabled, .disabled, [disabled]')) { cursorType.value = 'is-unavailable'; return; }
    
    // 3. Thẻ kéo thả
    if (target.closest('[draggable="true"], .draggable')) { cursorType.value = 'is-move'; return; }

    // 4. Ô nhập chữ (Nên thêm class .cursor-text để dễ tùy biến sau này)
    if (target.closest('input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]), textarea, .cursor-text')) { cursorType.value = 'is-text'; return; }

    // 5. ƯU TIÊN CAO HƠN: Nút bấm, Link, Label -> Hiện ngón tay (Link)
    if (target.closest('a, button, label, .cursor-pointer')) { cursorType.value = 'is-pointer'; return; }

    // 6. BỊ ĐẨY XUỐNG THẤP HƠN: Chỉ hiện Help nếu nó có 'title' nhưng KHÔNG PHẢI là nút bấm
    if (target.closest('[title], .help-icon')) { cursorType.value = 'is-help'; return; }

    // 7. Mặc định
    cursorType.value = 'is-normal';
  };

  onMounted(() => {
    authStore.initializeAuth();
    systemStore.fetchSettings();
    const hasMouse = window.matchMedia("(pointer: fine)").matches;
    
    if (hasMouse) {
      window.addEventListener('mousemove', moveCursor);
      window.addEventListener('mouseover', handleHover); 
    }
  });

  onUnmounted(() => {
    const hasMouse = window.matchMedia("(pointer: fine)").matches;
    if (hasMouse) {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
    }
  });
</script>

<style>
  /* Ẩn con chuột thật của hệ điều hành */
  @media (hover: hover) and (pointer: fine) {
    body, body * {
      cursor: none !important;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    .my-custom-cursor {
      display: none !important;
    }
  }

  /* Cấu hình khung chứa con chuột giả */
  .my-custom-cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: 32px;
    height: 32px;
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 9999; /* Luôn nổi lên trên cùng */
    transition: background-image 0.15s ease;
    
    
    filter: none !important;
    mix-blend-mode: normal !important;
    -webkit-filter: none !important;
    color-scheme: light only !important;
    margin-top: 0px; 
    margin-left: 0px;
  }

  /* Gắn file GIF tương ứng cho từng trạng thái */
  .my-custom-cursor.is-normal {
    background-image: url('/cursors/Normal.gif'); /* Đường dẫn file Normal */
  }

  .my-custom-cursor.is-pointer {
    background-image: url('/cursors/Link.gif'); /* Đường dẫn file ngón tay/Pin */
  }

  .my-custom-cursor.is-text {
    background-image: url('/cursors/Text.gif'); /* Đường dẫn file cột chữ I */
    /* Cột text thường tâm nằm ở giữa, nên có thể cần lệch margin một chút */
    margin-top: -16px; 
    margin-left: -16px;
  }

  .my-custom-cursor.is-unavailable {
    background-image: url('/cursors/Unavailable.gif'); 
  }

  .my-custom-cursor.is-move {
    background-image: url('/cursors/Move.gif'); 
    margin-top: -16px; /* Mũi tên 4 hướng thường lấy tâm ở giữa */
    margin-left: -16px;
  }

  .my-custom-cursor.is-help {
    background-image: url('/cursors/Help.gif'); 
  }

  .my-custom-cursor.is-working {
    background-image: url('/cursors/Working.gif'); 
  }
</style>