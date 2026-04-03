import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/Login.vue'; 
import HomeView from '../views/Home.vue';
import ProductDetail from '../views/Product_detail.vue';
import CategoryView from '../views/CategoryView.vue';
import RegisterView from '../views/RegisterView.vue';
import ProfileView from '../views/ProfileView.vue';
import ChangePassword from '../views/ChangePassword.vue';
import CartView from '../views/CartView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import OrderSuccessView from '../views/OrderSuccessView.vue';
import OrderHistoryView from '../views/OrderHistoryView.vue';
import OrderDetailView from '../views/OrderDetailView.vue';
import WishlistView from '../views/WishlistView.vue';
import SearchView from '../views/SearchView.vue';
import NewsView from '../views/NewsView.vue';
import ContactView from '../views/ContactView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', 
      name: 'home', 
      component: HomeView },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideFooter: true, hidePhone: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { hideFooter: true, hidePhone: true }
    },
    { path: '/product/:id', 
      name: 'product-detail', component: 
      ProductDetail },
    { path: '/category/:id?', 
      name: 'category', component: 
      CategoryView },
    {
      path: '/profile',
      name: 'Profile',
      component: ProfileView
    },
    {
      path: '/change-password',
      name: 'ChangePassword',
      component: ChangePassword
    },
    {
      path: '/cart',
      name: 'Cart',
      component: CartView
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: CheckoutView,
      meta: { useMinimalFooter: true }
    },
    {
      path: '/ordersuccess',
      name: 'Ordersuccess',
      component: OrderSuccessView,
      meta: { useMinimalFooter: true }
    },
    {
      path: '/orders',
      name: 'Order',
      component: OrderHistoryView
    },
    {
      path: '/orders/:id',
      name: 'Order-detail',
      component: OrderDetailView
    },
    {
      path: '/wishlist',
      name: 'Wishlist',
      component: WishlistView
    },
    {
      path: '/search',
      name: 'Search',
      component: SearchView
    },
    {
      path: '/news',
      name: 'News',
      component: NewsView
    },
    {
      path: '/contact',
      name: 'Contact',
      component: ContactView
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPasswordView,
      meta: { hideFooter: true, hidePhone: true }
    }
  ]
});

export default router;