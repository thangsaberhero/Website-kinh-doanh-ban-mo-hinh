<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <AdminSidebar :isCollapsed="isSidebarCollapsed" />

    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <AdminHeader @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />
      
      <main class="flex-1 overflow-y-auto custom-scrollbar"> 
        <RouterView />
      </main>
    </div>
  </div>
</template>
  
<script setup>
  import { ref } from 'vue';
  import { RouterView } from 'vue-router';
  import AdminSidebar from '@/components/Admin/AdminSidebar.vue';
  import AdminHeader from '@/components/Admin/AdminHeader.vue';
  
  const isSidebarCollapsed = ref(false);
</script>