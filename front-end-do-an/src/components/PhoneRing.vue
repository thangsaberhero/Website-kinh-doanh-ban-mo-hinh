<template>
  <div class="fixed bottom-6 left-6 z-[100] flex flex-col items-center" @mouseleave="isOpen = false">
    <Transition name="fade-slide">
      <div v-show="isOpen" class="flex flex-col gap-4 mb-4 items-center">
        
        <a 
          href="https://zalo.me/0795209255" 
          target="_blank" 
          aria-label="Chat Zalo"
          class="relative group flex items-center justify-center w-[45px] h-[45px] rounded-full bg-[#0068FF] shadow-lg hover:scale-110 transition-transform"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/3840px-Icon_of_Zalo.svg.png" alt="Zalo Logo" class="w-full h-full object-cover p-1.5 rounded-full" />
          <span class="absolute left-14 px-3 py-1.5 bg-black/80 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
            Chat qua Zalo
          </span>
        </a>

        <a 
          href="https://m.me/Vuhongphong04" 
          target="_blank" 
          aria-label="Chat Messenger"
          class="relative group flex items-center justify-center w-[45px] h-[45px] rounded-full shadow-lg hover:scale-110 transition-transform bg-white"
        >
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFfhn0USgl1kRzOAzyn2wOGYsmp0uddsb1cw&s" alt="Messenger Logo" class="w-full h-full object-cover p-1.5 rounded-full" />
          
          <span class="absolute left-14 px-3 py-1.5 bg-black/80 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
            Chat Messenger
          </span>
        </a>

        <a 
          href="mailto:contact@figurecollect.com" 
          aria-label="Gửi Email"
          class="relative group flex items-center justify-center w-[45px] h-[45px] rounded-full shadow-lg hover:scale-110 transition-transform bg-white"
        >
          <img src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gmail.width-500.format-webp.webp" alt="Gmail Logo" class="w-full h-full object-cover p-1.5 rounded-full" />
          
          <span class="absolute left-14 px-3 py-1.5 bg-black/80 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
            Gửi Email
          </span>
        </a>

        <a 
          href="tel:0795209255" 
          aria-label="Gọi Hotline"
          class="relative group flex items-center justify-center w-[45px] h-[45px] rounded-full bg-green-500 text-white shadow-lg hover:scale-110 transition-transform"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
          </svg>
          <span class="absolute left-14 px-3 py-1.5 bg-black/80 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
            0795.209.255
          </span>
        </a>
      </div>
    </Transition>

    <button 
      @click="isOpen = !isOpen" 
      aria-label="Mở menu hỗ trợ"
      class="relative w-[80px] h-[80px] flex items-center justify-center"
    >
      <div v-show="!isOpen" class="absolute inset-0 rounded-full border-2 border-primary opacity-50 animate-ring-circle"></div>
      <div v-show="!isOpen" class="absolute w-[60px] h-[60px] rounded-full bg-primary/40 animate-ring-fill"></div>
      
      <div 
        class="relative z-10 w-[50px] h-[50px] rounded-full bg-primary flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
        :class="[ !isOpen ? 'animate-ring-icon' : 'rotate-180 bg-surface-container-highest' ]"
      >
        <span 
          class="material-symbols-outlined text-2xl transition-colors duration-300"
          :class="isOpen ? 'text-on-surface' : 'text-white'"
        >
          {{ isOpen ? 'close' : 'support_agent' }}
        </span>
      </div>
    </button>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  const isOpen = ref(false);
</script>

<style scoped>
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }

  @keyframes ring-circle {
    0% { transform: scale(0.5); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: scale(1.2); opacity: 0; }
  }

  @keyframes ring-fill {
    0% { transform: scale(0.8); opacity: 0.4; }
    50% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(0.8); opacity: 0.4; }
  }

  @keyframes ring-icon {
    0% { transform: rotate(0) scale(1) skew(1deg); }
    10% { transform: rotate(-25deg) scale(1) skew(1deg); }
    20% { transform: rotate(25deg) scale(1) skew(1deg); }
    30% { transform: rotate(-25deg) scale(1) skew(1deg); }
    40% { transform: rotate(25deg) scale(1) skew(1deg); }
    50% { transform: rotate(0) scale(1) skew(1deg); }
    100% { transform: rotate(0) scale(1) skew(1deg); }
  }

  .animate-ring-circle { animation: ring-circle 1.5s infinite ease-in-out; }
  .animate-ring-fill { animation: ring-fill 1.5s infinite ease-in-out; }
  .animate-ring-icon { animation: ring-icon 1.5s infinite ease-in-out; }
</style>