<template>
  <RouterView /> 
  <TheToast />
  <PhoneRing v-if="!route.meta?.hidePhone" />
  
  <template v-if="!route.meta.hideFooter">
    <FooterMinimal v-if="route.meta.useMinimalFooter" />
    <FooterFull v-else />
  </template>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router';
import TheToast from '@/components/TheToast.vue';
import FooterFull from '@/components/FooterFull.vue';
import FooterMinimal from '@/components/FooterMinimal.vue';
import PhoneRing from '@/components/PhoneRing.vue';

const route = useRoute();
</script>