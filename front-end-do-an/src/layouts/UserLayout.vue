<template>
  <div ref="customCursor" class="my-custom-cursor" :class="cursorType"></div>

  <div class="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary flex flex-col min-h-screen">
    
    <TheHeader /> 
    
    <main class="flex-grow">
      <RouterView /> 
    </main>

    <PhoneRing v-if="!route.meta?.hidePhone" />
    <Chatbox v-if="!route.meta?.hideChatbox" />
    
    <template v-if="!route.meta.hideFooter">
      <FooterMinimal v-if="route.meta.useMinimalFooter" />
      <FooterFull v-else />
    </template>
  </div>
</template>
  
<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { RouterView, useRoute } from 'vue-router';
  import TheHeader from '@/components/TheHeader.vue';
  import FooterFull from '@/components/FooterFull.vue';
  import FooterMinimal from '@/components/FooterMinimal.vue';
  import PhoneRing from '@/components/PhoneRing.vue';
  import Chatbox from '@/components/Chatbot.vue';
  
  const route = useRoute();
  
  const customCursor = ref(null);
  const cursorType = ref('is-normal');
  const isAppLoading = ref(false); 
  
  const moveCursor = (e) => {
    if (customCursor.value) {
      customCursor.value.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }
  };
  
  const handleHover = (e) => {
    if (isAppLoading.value) { cursorType.value = 'is-working'; return; }
    const target = e.target;
    if (target.closest(':disabled, .disabled, [disabled]')) { cursorType.value = 'is-unavailable'; return; }
    if (target.closest('[draggable="true"], .draggable')) { cursorType.value = 'is-move'; return; }
    if (target.closest('input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]), textarea, .cursor-text')) { cursorType.value = 'is-text'; return; }
    if (target.closest('a, button, label, .cursor-pointer')) { cursorType.value = 'is-pointer'; return; }
    if (target.closest('[title], .help-icon')) { cursorType.value = 'is-help'; return; }
    cursorType.value = 'is-normal';
  };
  
  onMounted(() => {
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);
  });
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', moveCursor);
    window.removeEventListener('mouseover', handleHover);
  });
</script>
  
<style scoped>
  body, body * {
    cursor: none !important;
  }

/* 2. Cấu hình khung chứa con chuột giả */
  .my-custom-cursor {
    position: fixed;
    top: 0;
    left: 0;
    width: 32px; /* Chỉnh kích thước tùy theo file GIF của bạn */
    height: 32px;
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none; /* Cực kỳ quan trọng: Để click xuyên qua ảnh này */
    z-index: 9999; /* Luôn nổi lên trên cùng (Toast hay Chatbot cũng không đè được) */
    transition: background-image 0.15s ease; /* Hiệu ứng chuyển ảnh mượt mà */
    
    
    filter: none !important;
    mix-blend-mode: normal !important;
    -webkit-filter: none !important;
    color-scheme: light only !important;
    /* Chỉnh tọa độ đầu nhọn của chuột. Thường đầu mũi tên nằm ở góc trái trên cùng (0, 0)
        Nếu file GIF của bạn có mũi tên nằm ở giữa ảnh, hãy đổi thành margin: -16px 0 0 -16px; */
    margin-top: 0px; 
    margin-left: 0px;
  }

/* 3. Gắn file GIF tương ứng cho từng trạng thái */
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