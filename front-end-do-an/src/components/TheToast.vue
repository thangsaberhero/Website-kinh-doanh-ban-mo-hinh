<template>
  <div 
    v-for="pos in positions" 
    :key="pos"
    class="fixed z-[9999] flex flex-col gap-3 max-w-sm w-full p-6 pointer-events-none"
    :class="positionClasses[pos]"
  >
    <TransitionGroup :name="getTransitionName(pos)">
      <div 
        v-for="toast in getToastsByPosition(pos)" 
        :key="toast.id"
        role="alert" 
        @mouseenter="toastStore.pauseToast(toast.id)"
        @mouseleave="toastStore.resumeToast(toast.id)"
        class="relative overflow-hidden pointer-events-auto flex items-center gap-3 px-5 py-4 border rounded-xl shadow-2xl bg-surface-container-highest transition-all w-full"
        :class="themeConfig[toast.type]?.borderClass"
      >
        <span 
          class="material-symbols-outlined shrink-0" 
          :class="themeConfig[toast.type]?.textClass"
        >
          {{ themeConfig[toast.type]?.icon }}
        </span>
        
        <div class="flex-1 flex items-center gap-2">
          <span class="text-sm font-medium" :class="themeConfig[toast.type]?.textClass">
            {{ toast.message }}
          </span>
          
          <Transition name="bounce">
            <span 
              v-if="toast.count > 1" 
              :key="toast.count" 
              class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-white/10"
              :class="themeConfig[toast.type]?.textClass"
            >
              x{{ toast.count }}
            </span>
          </Transition>
        </div>
        
        <button 
          @click="toastStore.closeToast(toast.id)" 
          class="ml-auto text-on-surface-variant hover:text-white transition-colors shrink-0 z-10"
        >
          <span class="material-symbols-outlined text-sm">close</span>
        </button>

        <div 
          v-if="toast.duration > 0"
          :key="toast.updatedAt"
          class="absolute bottom-0 left-0 h-1 bg-current opacity-30 progress-bar"
          :class="themeConfig[toast.type]?.textClass"
          :style="{ 
            '--toast-duration': `${toast.duration}ms`,
            'animation-play-state': toast.isPaused ? 'paused' : 'running'
          }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
  import { useToastStore } from '@/stores/toast';

  const toastStore = useToastStore();
  const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  const positionClasses = {
    'top-left': 'top-0 left-0 items-start',
    'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-0 right-0 items-end',
    'bottom-left': 'bottom-0 left-0 flex-col-reverse items-start',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center',
    'bottom-right': 'bottom-0 right-0 flex-col-reverse items-end'
  };

  const getToastsByPosition = (pos) => {
    return toastStore.toasts.filter(toast => toast.position === pos);
  };

  // Hàm xác định tên hiệu ứng động dựa trên vị trí
  const getTransitionName = (pos) => {
    if (pos.includes('right')) return 'toast-right';
    if (pos.includes('left')) return 'toast-left';
    return 'toast-center'; 
  };

  const themeConfig = {
    success: { borderClass: 'border-green-500/50', textClass: 'text-green-400', icon: 'check_circle' },
    error: { borderClass: 'border-error/50', textClass: 'text-error-dim', icon: 'error' },
    warning: { borderClass: 'border-yellow-500/50', textClass: 'text-yellow-400', icon: 'warning' },
    info: { borderClass: 'border-blue-500/50', textClass: 'text-blue-400', icon: 'info' }
};
</script>

<style scoped>
  .toast-right-enter-active, .toast-right-leave-active, .toast-right-move,
  .toast-left-enter-active, .toast-left-leave-active, .toast-left-move,
  .toast-center-enter-active, .toast-center-leave-active, .toast-center-move {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25);
  }

  .toast-right-enter-from, .toast-right-leave-to {
    transform: translateX(60px);
    opacity: 0;
  }

  .toast-left-enter-from, .toast-left-leave-to {
    transform: translateX(-60px);
    opacity: 0;
  }

  .toast-center-enter-from, .toast-center-leave-to {
    transform: translateY(-30px) scale(0.9);
    opacity: 0;
  }

  .toast-right-leave-active, .toast-left-leave-active, .toast-center-leave-active {
    position: absolute;
  }

  .bounce-enter-active {
    animation: bounce-in 0.3s;
  }
  @keyframes bounce-in {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .progress-bar {
    animation: shrink var(--toast-duration) linear forwards;
  }
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
</style>