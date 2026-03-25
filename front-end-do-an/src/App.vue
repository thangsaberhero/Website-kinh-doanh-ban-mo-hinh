<template>
  <RouterView /> <TheToast />
  <FooterMinimal v-if="route.meta.useMinimalFooter" />
  <FooterFull v-else />
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router';
import TheToast from '@/components/TheToast.vue';
import FooterFull from '@/components/FooterFull.vue';
import FooterMinimal from '@/components/FooterMinimal.vue';

const route = useRoute();
</script>