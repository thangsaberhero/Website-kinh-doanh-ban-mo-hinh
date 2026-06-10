<template>
  <footer class="bg-surface-container-low mt-auto py-8 border-t border-outline-variant/15">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <router-link to="/" class="text-lg font-black text-primary font-headline tracking-tighter uppercase">
        {{ systemStore.settings.shop_name || 'FigureCollect' }}
      </router-link>
      <div class="text-[10px] font-bold tracking-widest text-outline uppercase">
        © {{ currentYear }} {{ systemStore.settings.shop_name || 'FIGURECOLLECT' }}. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
  import { computed } from 'vue';
  import { useSystemStore } from '@/stores/system';

  const systemStore = useSystemStore();
  const currentYear = computed(() => new Date().getFullYear());
</script>