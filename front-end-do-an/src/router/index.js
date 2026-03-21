import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/Login.vue'; 
import HomeView from '../views/Home.vue';
import ProductDetail from '../views/Product_detail.vue';
import CategoryView from '../views/CategoryView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', 
      name: 'home', 
      component: HomeView },
    { path: '/login', 
      name: 'login', 
      component: LoginView },
    { path: '/product/:id', 
      name: 'product-detail', component: 
      ProductDetail },
    { path: '/category/:id?', 
      name: 'category', component: 
      CategoryView }
  ]
});

export default router;