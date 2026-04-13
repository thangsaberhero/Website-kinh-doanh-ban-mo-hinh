<template>
  <div class="fixed bottom-6 left-6 z-[100] flex items-center group"> 
    <div class="relative w-[80px] h-[80px] flex items-center justify-center">
      <div class="absolute inset-0 rounded-full border-2 border-primary opacity-50 animate-ring-circle"></div>
      <div class="absolute w-[60px] h-[60px] rounded-full bg-primary/40 animate-ring-fill"></div>
      
      <a href="tel:0795209255" class="relative z-10 w-[40px] h-[40px] rounded-full bg-primary flex items-center justify-center shadow-lg animate-ring-icon transition-transform hover:scale-110">
        <span class="material-symbols-outlined text-white text-xl">call</span>
      </a>
    </div>
    
    <a href="tel:0795209255" class="absolute left-10 bg-primary h-[40px] flex items-center rounded-r-full pl-6 pr-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 -z-10 shadow-lg cursor-pointer">
      <span class="text-white font-bold text-sm tracking-wider whitespace-nowrap">0795.209.255</span>
    </a>
  </div>
</template>

<style scoped>
/* 1. Hiệu ứng vòng viền lan tỏa (Scale to và mờ dần) */
@keyframes ring-circle {
  0% { transform: scale(0.5); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

/* 2. Hiệu ứng vòng nền nhấp nháy (Scale nhẹ và đổi opacity) */
@keyframes ring-fill {
  0% { transform: scale(0.8); opacity: 0.4; }
  50% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(0.8); opacity: 0.4; }
}

/* 3. Hiệu ứng điện thoại rung lắc (Lắc qua lắc lại) */
@keyframes ring-icon {
  0% { transform: rotate(0) scale(1) skew(1deg); }
  10% { transform: rotate(-25deg) scale(1) skew(1deg); }
  20% { transform: rotate(25deg) scale(1) skew(1deg); }
  30% { transform: rotate(-25deg) scale(1) skew(1deg); }
  40% { transform: rotate(25deg) scale(1) skew(1deg); }
  50% { transform: rotate(0) scale(1) skew(1deg); }
  100% { transform: rotate(0) scale(1) skew(1deg); }
}

/* Áp dụng keyframes vào các class (có thể cấu hình trong tailwind.config.js, nhưng viết ở đây cho gọn) */
.animate-ring-circle {
  animation: ring-circle 1.5s infinite ease-in-out;
}
.animate-ring-fill {
  animation: ring-fill 1.5s infinite ease-in-out;
}
.animate-ring-icon {
  animation: ring-icon 1.5s infinite ease-in-out;
}
</style>