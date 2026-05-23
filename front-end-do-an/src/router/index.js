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
import NewsDetailView from '../views/User_view/NewsDetailView.vue';
import ContactView from '../views/User_view/ContactView.vue';
import ForgotPasswordView from '../views/User_view/ForgotPasswordView.vue';
//Phần thanh toán có thể thay thế bằng payos sau này
import checkout from '../views/User_view/MoMoMockView.vue';
import ProvenanceTracking from '../views/User_view/ProvenanceTracking.vue';

import AdminDashboard from '../views/Admin_view/AdminDashboard.vue';
import AdminInventory from '../views/Admin_view/AdminInventory.vue';
import AdminUserManagement from '../views/Admin_view/AdminUserManagement.vue';
import AdminOrderManagement from '../views/Admin_view/AdminOrderManagement.vue';
import AdminPromotionsManagement from '../views/Admin_view/AdminPromotionsManagement.vue';
import AdminNewsManagement from '../views/Admin_view/AdminNewsManagement.vue';
import AdminNewsCreate from '../views/Admin_view/AdminNewsCreate.vue';
import AdminNewsEdit from '../views/Admin_view/AdminNewsEdit.vue';
import AdminManufacturer from '../views/Admin_view/AdminManufacturer.vue';
import AdminCategory from '../views/Admin_view/AdminCategory.vue';
import AdminCustomerSupport from '../views/Admin_view/AdminCustomerSupport.vue';
import AdminPromotionDetail from '../views/Admin_view/AdminPromotionDetail.vue';
import AdminProfile from '../views/Admin_view/AdminProfile.vue';
import AdminChangePassword from '../views/Admin_view/AdminChangePassword.vue';

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
      path: '/news/:id',
      name: 'NewsDetail',
      component: NewsDetailView
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
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard
    },
    {
      path: '/admin/inventory',
      name: 'Inventory',
      component: AdminInventory
    },
    {
      path: '/admin/users',
      name: 'UserManagement',
      component: AdminUserManagement
    },
    {
      path: '/admin/orders',
      name: 'OrderManagement',
      component: AdminOrderManagement
    },
    {
      path: '/admin/promotion',
      name: 'PromotionsManagement',
      component: AdminPromotionsManagement
    },
    {
      path: '/admin/news',
      name: 'NewsManagement',
      component: AdminNewsManagement
    },
    {
      path: '/admin/news/create',
      name: 'NewsCreate',
      component: AdminNewsCreate
    },
    {
      path: '/admin/news/edit/:id',
      name: 'NewsEdit',
      component: AdminNewsEdit
    },
    {
      path: '/admin/manufacturers',
      name: 'Manufacturer',
      component: AdminManufacturer
    },
    {
      path: '/admin/categories',
      name: 'Category',
      component: AdminCategory
    },
    {
      path: '/admin/support',
      name: 'CustomerSupport',
      component: AdminCustomerSupport
    },
    {
      path: '/admin/promotion/:type/:id',
      name: 'AdminPromotionDetail',
      component: AdminPromotionDetail
    },
    {
      path: '/admin/profile',
      name: 'AdminProfile',
      component: AdminProfile
    },
    {
      path: '/admin/change-password',
      name: 'AdminChangePassword',
      component: AdminChangePassword
    },
  ]
});

export default router;