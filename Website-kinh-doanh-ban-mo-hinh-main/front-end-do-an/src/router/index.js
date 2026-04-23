import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/User_view/Login.vue'; 
import HomeView from '../views/User_view/Home.vue';
import ProductDetail from '../views/User_view/Product_detail.vue';
import CategoryView from '../views/User_view/CategoryView.vue';
import RegisterView from '../views/User_view/RegisterView.vue';
import ProfileView from '../views/User_view/ProfileView.vue';
import ChangePassword from '../views/User_view/ChangePassword.vue';
import CartView from '../views/User_view/CartView.vue';
import CheckoutView from '../views/User_view/CheckoutView.vue';
import OrderSuccessView from '../views/User_view/OrderSuccessView.vue';
import OrderHistoryView from '../views/User_view/OrderHistoryView.vue';
import OrderDetailView from '../views/User_view/OrderDetailView.vue';
import WishlistView from '../views/User_view/WishlistView.vue';
import SearchView from '../views/User_view/SearchView.vue';
import NewsView from '../views/User_view/NewsView.vue';
import ContactView from '../views/User_view/ContactView.vue';
import ForgotPasswordView from '../views/User_view/ForgotPasswordView.vue';
//Phần thanh toán có thể thay thế bằng payos sau này
import checkout from '../views/User_view/MoMoMockView.vue';
// Import component Truy xuất blockchain
import ProvenanceTracking from '../views/User_view/ProvenanceTracking.vue';
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
    },
    {
      path: '/momo-payment',
      name: 'MoMoMock',
      component: checkout
    },
    {
      path: '/truy-xuat',
      name: 'TruyXuat',
      component: ProvenanceTracking
    }
  ]
});

export default router;