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
import SupportView from '../views/User_view/SupportView.vue';

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
import AdminReport from '../views/Admin_view/AdminReport.vue';
import AdminNotifications from '../views/Admin_view/AdminNotifications.vue';
import AdminBlockchain from '../views/Admin_view/AdminBlockchain.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- KHU VỰC KHÁCH HÀNG ---
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Trang chủ | FigureCollect' } },
    { path: '/login', name: 'login', component: LoginView, meta: { hideFooter: true, hidePhone: true, hideChatbot: true, title: 'Đăng nhập | FigureCollect' } },
    { path: '/register', name: 'register', component: RegisterView, meta: { hideFooter: true, hidePhone: true, hideChatbot: true, title: 'Đăng ký | FigureCollect' } },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView, meta: { hideFooter: true, hidePhone: true, hideChatbot: true, title: 'Quên mật khẩu | FigureCollect' } },
    { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true, title: 'Thông tin cá nhân | FigureCollect' } },
    { path: '/change-password', name: 'ChangePassword', component: ChangePassword, meta: { requiresAuth: true, title: 'Đổi mật khẩu | FigureCollect' } },
    { path: '/cart', name: 'Cart', component: CartView, meta: { requiresAuth: true, title: 'Giỏ hàng của bạn | FigureCollect' } },
    { path: '/checkout', name: 'Checkout', component: CheckoutView, meta: { useMinimalFooter: true, requiresAuth: true, title: 'Thanh toán | FigureCollect' } },
    { path: '/ordersuccess', name: 'Ordersuccess', component: OrderSuccessView, meta: { useMinimalFooter: true, hideChatbot: true, requiresAuth: true, title: 'Đặt hàng thành công | FigureCollect' } },
    { path: '/orders', name: 'Order', component: OrderHistoryView, meta: { requiresAuth: true, title: 'Lịch sử đơn hàng | FigureCollect' } },
    { path: '/wishlist', name: 'Wishlist', component: WishlistView, meta: { requiresAuth: true, title: 'Sản phẩm yêu thích | FigureCollect' } },
    { path: '/search', name: 'Search', component: SearchView, meta: { title: 'Tìm kiếm sản phẩm | FigureCollect' } },
    { path: '/news', name: 'News', component: NewsView, meta: { title: 'Tin tức & Cập nhật | FigureCollect' } },
    { path: '/contact', name: 'Contact', component: ContactView, meta: { title: 'Liên hệ | FigureCollect' } },
    { path: '/support', name: 'Support', component: SupportView, meta: { title: 'Hỗ trợ khách hàng | FigureCollect' } },
    { path: '/category/:id?', name: 'category', component: CategoryView, meta: { title: 'Danh mục sản phẩm | FigureCollect' } },
    { path: '/product/:id', name: 'product-detail', component: ProductDetail },
    { path: '/orders/:id', name: 'Order-detail', component: OrderDetailView, meta: { requiresAuth: true } },
    { path: '/news/:id', name: 'NewsDetail', component: NewsDetailView },
    { path: '/truy-xuat/:serial?', name: 'ProvenanceTracking', component: ProvenanceTracking, meta: { title: 'Truy xuất nguồn gốc | FigureCollect' } },
    
    // --- KHU VỰC ADMIN ---
    { path: '/admin', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true, title: 'Bảng điều khiển | Admin - FigureCollect' } },
    { path: '/admin/inventory', name: 'Inventory', component: AdminInventory, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý kho hàng | Admin - FigureCollect' } },
    { path: '/admin/users', name: 'UserManagement', component: AdminUserManagement, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý người dùng | Admin - FigureCollect' } },
    { path: '/admin/orders', name: 'OrderManagement', component: AdminOrderManagement, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý đơn hàng | Admin - FigureCollect' } },
    { path: '/admin/promotion', name: 'PromotionsManagement', component: AdminPromotionsManagement, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý khuyến mãi | Admin - FigureCollect' } },
    { path: '/admin/news', name: 'NewsManagement', component: AdminNewsManagement, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý tin tức | Admin - FigureCollect' } },
    { path: '/admin/news/create', name: 'NewsCreate', component: AdminNewsCreate, meta: { requiresAuth: true, requiresAdmin: true, title: 'Viết bài mới | Admin - FigureCollect' } },
    { path: '/admin/manufacturers', name: 'Manufacturer', component: AdminManufacturer, meta: { requiresAuth: true, requiresAdmin: true, title: 'Hãng sản xuất | Admin - FigureCollect' } },
    { path: '/admin/categories', name: 'Category', component: AdminCategory, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý danh mục | Admin - FigureCollect' } },
    { path: '/admin/support', name: 'CustomerSupport', component: AdminCustomerSupport, meta: { requiresAuth: true, requiresAdmin: true, title: 'Hỗ trợ khách hàng | Admin - FigureCollect' } },
    { path: '/admin/profile', name: 'AdminProfile', component: AdminProfile, meta: { requiresAuth: true, requiresAdmin: true, title: 'Hồ sơ cá nhân | Admin - FigureCollect' } },
    { path: '/admin/change-password', name: 'AdminChangePassword', component: AdminChangePassword, meta: { requiresAuth: true, requiresAdmin: true, title: 'Đổi mật khẩu | Admin - FigureCollect' } },
    { path: '/admin/report', name: 'AdminReport', component: AdminReport, meta: { requiresAuth: true, requiresAdmin: true, title: 'Báo cáo thống kê | Admin - FigureCollect' } },
    { path: '/admin/notifications', name: 'AdminNotifications', component: AdminNotifications, meta: { requiresAuth: true, requiresAdmin: true, title: 'Thông báo hệ thống | Admin - FigureCollect' } },
    { path: '/admin/blockchain', name: 'AdminBlockchain', component: AdminBlockchain, meta: { requiresAuth: true, requiresAdmin: true, title: 'Quản lý Blockchain | Admin - FigureCollect' } },
    { path: '/admin/news/edit/:id', name: 'NewsEdit', component: AdminNewsEdit, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/promotion/:type/:id', name: 'AdminPromotionDetail', component: AdminPromotionDetail, meta: { requiresAuth: true, requiresAdmin: true } },
    
    { path: '/momo-payment', name: 'MoMoMock', component: checkout, meta: { requiresAuth: true, title: 'Cổng thanh toán MoMo' } },
  ]
});

router.beforeEach((to, from, next) => {
  // 1. Kiểm tra xem người dùng có đang cố vào khu vực Admin không
  const isAdminRoute = to.path.startsWith('/admin');
  
  // 2. Lấy thông tin xác thực
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user ? parseInt(user.MaQuyen) : null;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      return next({ name: 'login' }); // Chưa đăng nhập -> Đá ra Login
    }

    // Nếu trang đó đặc biệt yêu cầu quyền Admin/Staff
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (userRole !== 1 && userRole !== 2) {
        return next({ path: '/' }); // Khách hàng mò vào Admin -> Đá ra Trang chủ
      }
    }
  }
  next();
});

router.afterEach((to, from) => {
  document.title = to.meta.title || 'FigureCollect - Shop Mô Hình Chính Hãng';
});

export default router;