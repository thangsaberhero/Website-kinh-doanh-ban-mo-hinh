<template>
  <Transition name="slide-fade">
    <div 
      v-if="toastStore.isVisible" 
      :class="[
        'fixed bottom-8 right-8 flex items-center gap-3 px-5 py-4 border rounded-xl shadow-2xl z-[9999] max-w-sm',
        toastStore.type === 'error' ? 'bg-surface-container-highest border-error/50 text-error-dim' : 'bg-surface-container-highest border-green-500/50 text-green-400'
      ]"
    >
      <span class="material-symbols-outlined" :class="toastStore.type === 'error' ? 'text-error' : 'text-green-500'">
        {{ toastStore.type === 'error' ? 'error' : 'check_circle' }}
      </span>
      <span class="text-sm font-medium">{{ toastStore.message }}</span>
      <button @click="toastStore.closeToast" class="ml-auto text-on-surface-variant hover:text-white transition-colors">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { useToastStore } from '@/stores/toast';
const toastStore = useToastStore();
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(50px);
  opacity: 0;
}
</style>