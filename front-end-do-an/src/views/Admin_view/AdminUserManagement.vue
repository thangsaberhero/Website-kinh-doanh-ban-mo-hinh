<template>
  <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>

    <div 
      class="fixed top-0 right-0 h-screen w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="isFilterPanelOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Bộ lọc người dùng</h2>
          <p class="text-xs text-slate-500">Phân loại theo vai trò và trạng thái</p>
        </div>
        <button @click="isFilterPanelOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div class="space-y-4">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">call</span> Số điện thoại
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">dialpad</span>
            <input v-model="searchPhone" @input="searchPhone = searchPhone.replace(/[^0-9]/g, '')" type="text" placeholder="Nhập SĐT cần tìm..." @keyup.enter="applyFilters" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all font-medium text-slate-700">
          </div>
        </div>

        <div class="space-y-4 mt-4">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">location_on</span> Khu vực / Địa chỉ
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">map</span>
            <input v-model="searchAddress" type="text" placeholder="VD: Hà Nội, Hồ Chí Minh..." @keyup.enter="applyFilters" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all font-medium text-slate-700">
          </div>
        </div>

        <hr class="border-slate-100">
        <div class="space-y-4">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">toggle_on</span> Trạng thái tài khoản
          </label>
          <select v-model="filterStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all font-medium text-slate-700 cursor-pointer">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã bị khóa</option>
          </select>
        </div>

        <hr class="border-slate-100">
        <div class="space-y-4">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">calendar_month</span> Thời gian đăng ký
          </label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-[10px] text-slate-500 mb-1 font-bold">Từ ngày</p>
              <input v-model="fromDate" :max="toDate" type="date" @keyup.enter="applyFilters" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none text-slate-700 cursor-pointer">
            </div>
            <div>
              <p class="text-[10px] text-slate-500 mb-1 font-bold">Đến ngày</p>
              <input v-model="toDate" :min="fromDate" type="date" @keyup.enter="applyFilters" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none text-slate-700 cursor-pointer">
            </div>
          </div>
        </div>

        <hr class="border-slate-100">
        <div class="space-y-4">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span> Phân quyền
          </label>
          <div class="flex flex-col gap-3">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input v-model="filterRoles.Collector" type="checkbox" class="w-4 h-4 text-[#ff8f73] border-slate-300 rounded focus:ring-[#ff8f73] transition-all">
              <span class="text-sm font-medium text-slate-700 group-hover:text-[#ff8f73] transition-colors">Collector (Khách hàng)</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input v-model="filterRoles.Staff" type="checkbox" class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-600 transition-all">
              <span class="text-sm font-medium text-slate-700 group-hover:text-slate-600 transition-colors">Staff (Nhân viên)</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input v-model="filterRoles.Admin" type="checkbox" class="w-4 h-4 text-purple-500 border-slate-300 rounded focus:ring-purple-500 transition-all">
              <span class="text-sm font-medium text-slate-700 group-hover:text-purple-600 transition-colors">Administrator (Quản trị)</span>
            </label>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-slate-100 flex gap-3 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button @click="resetFilters" class="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Đặt lại</button>
        <button @click="applyFilters" class="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-all text-sm">Áp dụng</button>
      </div>
    </div>
    <div 
      class="fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="isViewUserDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="relative bg-slate-800 h-32 shrink-0">
        <button @click="isViewUserDrawerOpen = false" class="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div class="absolute -bottom-10 left-6 flex items-end gap-4">
          <div class="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white overflow-hidden">
            <img :src="viewingUser.avatar" class="w-full h-full object-cover"/>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 pt-14 space-y-8 custom-scrollbar">  
        <div>
          <h2 class="text-xl font-bold text-slate-900 mb-2">{{ viewingUser.name }}</h2>
          <div class="flex items-center gap-2">
            <template v-if="!isDrawerEditMode">
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm" :class="getRoleStyle(viewingUser.role)">
                {{ viewingUser.role }}
              </span>
              <span class="flex items-center gap-1 text-xs font-semibold" :class="getStatusText(viewingUser.status)">
                <span class="w-2 h-2 rounded-full" :class="getStatusDot(viewingUser.status)"></span>
                {{ viewingUser.status }}
              </span>
            </template>

            <template v-else>
              <select v-model="viewingUser.role" disabled class="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-400 bg-slate-100 shadow-sm cursor-not-allowed outline-none" title="Không thể thay đổi quyền">
                <option value="Collector">Collector</option>
                <option value="Nhân viên">Staff</option>
                <option value="Admin">Admin</option>
              </select>
              
              <select v-model="viewingUser.status" :disabled="viewingUser.id === currentAdminId"
                    :title="viewingUser.id === currentAdminId ? 'Bạn không thể thay đổi trạng thái của chính mình' : ''"
                    class="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none bg-white shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bị khóa">Bị khóa</option>
              </select>
            </template>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
            <span class="material-symbols-outlined text-[16px]">manage_accounts</span> Tài khoản hệ thống
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] text-slate-500 mb-1 font-bold">Tên đăng nhập</p>
              <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900">@{{ viewingUser.username }}</p>
              <input v-else v-model="viewingUser.username" disabled type="text" class="w-full border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed rounded-lg px-3 py-1.5 text-sm" title="Không thể thay đổi tên đăng nhập">
            </div>
            <div>
              <p class="text-[11px] text-slate-500 mb-1 font-bold">Email liên hệ</p>
              <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900 truncate" :title="viewingUser.email">{{ viewingUser.email }}</p>
              <input v-else v-model="viewingUser.email" type="email" class="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all text-slate-900">
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
            <span class="material-symbols-outlined text-[16px]">badge</span> Hồ sơ nhân thân
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[11px] text-slate-500 mb-1 font-bold">Họ và tên thực</p>
                <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900">{{ viewingUser.name }}</p>
                <input v-else v-model="viewingUser.name" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all text-slate-900">
              </div>
              <div>
                <p class="text-[11px] text-slate-500 mb-1 font-bold">Số điện thoại</p>
                <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900">{{ viewingUser.phone }}</p>
                <input v-else v-model="viewingUser.phone" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all text-slate-900">
              </div>
            </div>
            <div>
              <p class="text-[11px] text-slate-500 mb-1 font-bold">Địa chỉ cư trú</p>
              <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900">{{ viewingUser.address }}</p>
              <input v-else v-model="viewingUser.address" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all text-slate-900">
            </div>
            <div v-if="viewingUser.role === 'Collector'" class="space-y-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <span class="material-symbols-outlined text-[16px]">shopping_bag</span> Lịch sử mua hàng
              </h3>
              <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p class="text-[11px] text-slate-500 mb-1 font-bold">Số đơn thành công</p>
                  <p class="text-lg font-brand font-bold text-slate-900">{{ viewingUser.orderCount || 0 }} <span class="text-xs font-medium text-slate-500">đơn</span></p>
                </div>
                <div>
                  <p class="text-[11px] text-slate-500 mb-1 font-bold">Tổng chi tiêu</p>
                  <p class="text-lg font-brand font-bold text-[#ff8f73]">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(viewingUser.totalSpent || 0) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4 pb-4 opacity-80">
          <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
            <span class="material-symbols-outlined text-[16px]">security</span> Bảo mật & Hoạt động
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] text-slate-500 mb-1 font-bold">Đăng nhập cuối</p>
              <p class="text-sm font-semibold text-slate-900 cursor-help" :title="viewingUser.lastLoginAbsolute">{{ viewingUser.lastLogin }}</p>
            </div>
            <div>
              <p class="text-[11px] text-slate-500 mb-1 font-bold">Địa chỉ IP</p>
              <p class="text-sm font-semibold text-slate-900">{{ viewingUser.ip }}</p>
            </div>
          </div>
          <div v-if="!isDrawerEditMode" class="pt-4 mt-4 border-t border-slate-100/50 flex flex-col gap-2">
            <button @click="resetPassword(viewingUser.id)" class="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm">
              <span class="material-symbols-outlined text-[16px]">key</span> Đặt lại mật khẩu mặc định
            </button>
            
            <button v-if="viewingUser.status === 'Hoạt động' && viewingUser.id !== currentAdminId" @click="lockUser(viewingUser.id)" class="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-rose-200 shadow-sm">
              <span class="material-symbols-outlined text-[16px]">lock</span> Khóa tài khoản này
            </button>
            
            <button v-else @click="unlockUser(viewingUser.id)" class="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-200 shadow-sm">
              <span class="material-symbols-outlined text-[16px]">lock_open</span> Mở khóa tài khoản
            </button>
          </div>
          <p v-if="isDrawerEditMode" class="text-[10px] text-slate-400 italic mt-2">
            * Dữ liệu bảo mật do hệ thống tạo tự động, không thể chỉnh sửa thủ công.
          </p>
        </div>
      </div>
      
      <div class="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button v-if="!isDrawerEditMode" @click="toggleDrawerEditMode" class="flex-1 py-3 rounded-xl font-bold text-[#ff8f73] bg-[#ff8f73]/10 hover:bg-[#ff8f73]/20 transition-colors text-sm flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">edit</span> Chỉnh sửa tài khoản
        </button>

        <template v-else>
          <button @click="cancelDrawerEdits" class="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors text-sm">
            Hủy bỏ
          </button>
          <button @click="saveDrawerEdits" class="flex-[2] py-3 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] transition-colors text-sm shadow-lg shadow-[#ff8f73]/20">
            Lưu thông tin
          </button>
        </template>
      </div>
    </div>
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-24">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý người dùng</h1>
            <p class="text-slate-500 text-sm font-medium">Hệ thống kiểm soát và phân quyền người dùng trong hệ sinh thái.</p>
          </div>
          <button @click="openAddUserModal" class="bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm">
            <span class="material-symbols-outlined text-[20px]">person_add</span>
            Thêm người dùng mới
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">groups</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Tổng người dùng</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ new Intl.NumberFormat('en-US').format(userStats.TotalUsers) }}</p>
              <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <span class="material-symbols-outlined text-sm">analytics</span> Tính đến thời điểm hiện tại
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">bolt</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Hoạt động hôm nay</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ new Intl.NumberFormat('en-US').format(userStats.ActiveToday) }}</p>
              <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <span class="material-symbols-outlined text-sm">check_circle</span> Trạng thái trực tuyến
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">person_add</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Đăng ký mới</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ userStats.NewThisMonth }}</p>
              <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#ff8f73]">
                <span class="material-symbols-outlined text-sm">calendar_month</span> Trong tháng {{ new Date().getMonth() + 1 }}
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-rose-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">lock_person</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-rose-400 font-bold uppercase tracking-widest mb-2">Trạng thái bảo mật</p>
              <p class="text-3xl font-brand font-bold text-rose-600">{{ userStats.LockedUsers }}</p>
              <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-400">
                Tài khoản đang bị khóa
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">      
          <div class="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div class="flex items-center gap-3">
              <button @click="isFilterPanelOpen = true" class="relative flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all shadow-sm">
                <span class="material-symbols-outlined text-[16px]">tune</span> Bộ lọc nâng cao
                <span v-if="activeFilterCount > 0" class="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white animate-bounce">
                  {{ activeFilterCount }}
                </span>
              </button>
              
              <div class="relative w-full md:w-64 hidden sm:block">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input v-model="searchQuery" @input="debounceSearch" type="text" placeholder="Tìm theo họ tên..." 
                        class="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-600 focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all shadow-sm">
              </div>
            </div>
            <p class="text-xs font-medium text-slate-500">Hiển thị <span class="font-bold text-slate-900">{{ users.length }}</span> trong số <span class="font-bold text-slate-900">{{ totalUsersCount }}</span> người dùng</p>
          </div>

          <div class="overflow-x-auto min-h-[300px]">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Người dùng</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Vai trò</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Trạng thái</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Đăng nhập cuối</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-if="users.length === 0 && !isLoading">
                  <td colspan="5" class="px-8 py-16 text-center">
                    <span class="material-symbols-outlined text-5xl text-slate-300 mb-3 block">search_off</span>
                    <p class="text-sm font-bold text-slate-500">Không tìm thấy người dùng nào phù hợp.</p>
                    <p class="text-xs text-slate-400 mt-1 mb-4">Vui lòng thử nghiệm với các điều kiện lọc khác.</p>
                    <button @click="resetFilters" class="text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-lg transition-colors">
                      Xóa bộ lọc
                    </button>
                  </td>
                </tr>
                <tr v-for="(user, index) in users" :key="user.id" class="transition-colors hover:bg-slate-50/80 group">    
                  <td class="px-8 py-4">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 bg-slate-100">
                        <img :src="user.avatar" class="w-full h-full object-cover"/>
                      </div>
                      <div class="flex flex-col">
                        <p class="font-bold text-slate-900 text-sm group-hover:text-[#ff8f73] transition-colors">{{ user.name }}</p>
                        <p class="text-xs text-slate-500">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-8 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm" :class="getRoleStyle(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  
                  <td class="px-8 py-4">
                    <div class="flex items-center gap-2">
                      <span class="relative flex h-2.5 w-2.5">
                        <span v-if="user.status === 'Hoạt động'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="getStatusDot(user.status)"></span>
                      </span>
                      <span class="text-xs font-semibold" :class="getStatusText(user.status)">{{ user.status }}</span>
                    </div>
                  </td>
                  
                  <td class="px-8 py-4">
                    <p class="text-sm font-semibold text-slate-700 cursor-help" :title="user.lastLoginAbsolute">{{ user.lastLogin }}</p>
                    <p class="text-[11px] text-slate-400 font-medium">{{ user.ip }}</p>
                  </td>
                  
                  <td class="px-8 py-4 relative">
                      <div class="flex justify-end gap-1">
                          <button @click="viewUser(user.id)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all" title="Xem chi tiết">
                              <span class="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          
                          <button @click.stop="toggleUserMenu(user.id)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all" title="Thêm tùy chọn">
                              <span class="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                      </div>

                      <div 
                          v-show="activeMenuId === user.id"
                          @click.stop
                          class="absolute right-12 top-10 w-44 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-slate-100 py-2 z-50 text-left overflow-hidden"
                          :class="index >= users.length - 2 ? 'bottom-8 top-auto' : 'top-10 bottom-auto'"
                      >
                          <button @click="resetPassword(user.id)" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2 font-medium transition-colors">
                              <span class="material-symbols-outlined text-[18px]">key</span> Đặt lại mật khẩu
                          </button>
                          
                          <button v-if="user.status === 'Hoạt động' && user.id !== currentAdminId" @click="lockUser(user.id)" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 font-medium transition-colors">
                              <span class="material-symbols-outlined text-[18px]">lock</span> Khóa tài khoản
                          </button>
                          <button v-else @click="unlockUser(user.id)" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 font-medium transition-colors">
                              <span class="material-symbols-outlined text-[18px]">lock_open</span> Mở khóa
                          </button>
                      </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div class="flex items-center gap-2">
              <button @click="if(currentPage > 1) { currentPage--; fetchUsers(); }" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all text-xs font-bold shadow-sm">Trước</button>
              
              <div class="flex items-center gap-1">
                <button class="w-8 h-8 flex items-center justify-center rounded-xl bg-[#ff8f73] text-white text-xs font-bold shadow-lg shadow-[#ff8f73]/20">
                  {{ currentPage }}
                </button>
                <span class="text-xs font-bold text-slate-400 px-2">/ {{ totalPages }}</span>
              </div>
              
              <button @click="if(currentPage < totalPages) { currentPage++; fetchUsers(); }" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all text-xs font-bold shadow-sm">Tiếp</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">   
          <div class="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex justify-between items-center mb-6">
              <h4 class="font-headline text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-rose-500">security</span> Nhật ký bảo mật gần đây
              </h4>
              <button @click="openAllLogsModal" class="text-[10px] font-bold text-[#ff8f73] uppercase tracking-widest hover:underline hover:text-[#ff3d00] transition-colors">
                Xem tất cả
              </button>
            </div>
            
            <div class="space-y-4">
              <div v-for="log in securityLogs" :key="log.MaLog" class="flex items-start gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                <div class="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-50 text-slate-500 rounded-full border border-slate-200 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                  <span class="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-slate-800 leading-snug">{{ log.NoiDung }}</p>
                  <p class="text-[10px] text-slate-400 mt-2 font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[12px]">schedule</span>
                    {{ new Date(log.ThoiGian).toLocaleString('vi-VN') }}
                  </p>
                </div>
              </div>
              
              <div v-if="securityLogs.length === 0" class="text-center py-8 text-sm text-slate-400 font-medium">
                Hệ thống chưa ghi nhận hoạt động bảo mật nào gần đây.
              </div>
            </div>
          </div>

          <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h4 class="font-headline text-lg font-bold text-slate-900 mb-6">Phân bổ vai trò</h4>
            <div class="space-y-6 flex-1">
              <div>
                <div class="flex justify-between text-xs mb-2">
                  <span class="text-slate-500 font-bold">Collectors (Khách)</span>
                  <span class="text-slate-900 font-bold">{{ new Intl.NumberFormat('en-US').format(userStats.CollectorCount) }} ({{ rolePercentages.collector }}%)</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div class="h-full bg-[#ff8f73] rounded-full transition-all duration-1000" :style="{ width: rolePercentages.collector + '%' }"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between text-xs mb-2">
                  <span class="text-slate-500 font-bold">Staff (Nhân viên)</span>
                  <span class="text-slate-900 font-bold">{{ new Intl.NumberFormat('en-US').format(userStats.StaffCount) }} ({{ rolePercentages.staff }}%)</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div class="h-full bg-slate-400 rounded-full transition-all duration-1000" :style="{ width: rolePercentages.staff + '%' }"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between text-xs mb-2">
                  <span class="text-slate-500 font-bold">Administrators</span>
                  <span class="text-slate-900 font-bold">{{ new Intl.NumberFormat('en-US').format(userStats.AdminCount) }} ({{ rolePercentages.admin }}%)</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div class="h-full bg-purple-500 rounded-full transition-all duration-1000" :style="{ width: rolePercentages.admin + '%' }"></div>
                </div>
              </div>

              <button 
                @click="downloadReport" 
                :disabled="isDownloading"
                class="w-full mt-8 py-3 bg-white text-slate-600 text-xs font-bold uppercase tracking-widest border-2 border-slate-100 hover:border-[#ff8f73] hover:text-[#ff8f73] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="!isDownloading" class="material-symbols-outlined text-[18px]">download</span>
                <span v-else class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                {{ isDownloading ? 'Đang tạo báo cáo...' : 'Tải báo cáo chi tiết' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  <div v-if="isAddUserModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Thêm người dùng mới</h3>
          <p class="text-xs text-slate-500 font-medium">Cấp quyền truy cập vào hệ thống</p>
        </div>
        <button @click="isAddUserModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-8 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên đăng nhập (*)</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">badge</span>
              <input v-model="newUser.username" type="text" placeholder="VD: nguyenvan_a" class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mật khẩu khởi tạo (*)</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">key</span>
              <input v-model="newUser.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
              <button @click="showPassword = !showPassword" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ff8f73]">
                <span class="material-symbols-outlined text-[18px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Họ và Tên (*)</label>
          <input v-model="newUser.name" type="text" placeholder="VD: Nguyễn Văn A" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email (*)</label>
          <input v-model="newUser.email" type="email" placeholder="VD: email@figurecollect.com" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vai trò (Phân quyền)</label>
            <select v-model="newUser.role" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-[#ff8f73] bg-[#ff8f73]/5">
              <option value="Staff">Staff (Nhân viên)</option>
              <option value="Admin">Admin </option>
              <option value="Collector">Collector</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái tài khoản</label>
            <select v-model="newUser.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
              <option value="Hoạt động">Cho phép Hoạt động</option>
              <option value="Bị khóa">Tạm khóa</option>
            </select>
          </div>
        </div>
      </div>

      <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
        <button @click="isAddUserModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
        <button @click="submitNewUser" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 rounded-xl transition-all">Tạo tài khoản</button>
      </div>
    </div>
  </div>

  <div v-if="isAllLogsModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[80vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <h3 class="font-bold text-slate-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-rose-500">history_toggle_off</span> Toàn bộ nhật ký hoạt động hệ thống
        </h3>
        <button @click="isAllLogsModalOpen = false" class="text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined">close</span></button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
        <div v-for="log in allLogsList" :key="'all-'+log.MaLog" class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <span class="material-symbols-outlined text-slate-400 text-[18px] mt-0.5">circle_notifications</span>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-800 leading-normal">{{ log.NoiDung }}</p>
            <p class="text-[10px] text-slate-400 font-bold mt-1.5">{{ new Date(log.ThoiGian).toLocaleString('vi-VN') }}</p>
          </div>
        </div>
      </div>

      <div class="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trang {{ allLogsPagination.currentPage }} / {{ allLogsPagination.totalPage }}</p>
        <div class="flex gap-2">
          <button @click="changeLogPage(allLogsPagination.currentPage - 1)" :disabled="allLogsPagination.currentPage === 1" class="px-3 py-1 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Trước</button>
          <button @click="changeLogPage(allLogsPagination.currentPage + 1)" :disabled="allLogsPagination.currentPage === allLogsPagination.totalPage" class="px-3 py-1 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Sau</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
  import { ref } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast';
  import { useLayoutStore } from '../../stores/layout';
  import { onMounted, watch, computed } from 'vue';
  
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const isFilterPanelOpen = ref(false);
  const showPassword = ref(false);
  const isDownloading = ref(false);

  const users = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalUsersCount = ref(0);
  const isLoading = ref(true);

  const securityLogs = ref([]);
  const isAllLogsModalOpen = ref(false);
  const allLogsList = ref([]);
  const allLogsPagination = ref({ currentPage: 1, totalPage: 1 });
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentAdminId = currentUser.id;
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const searchQuery = ref('');
  let searchTimeout;
  const debounceSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage.value = 1; 
      fetchUsers();
    }, 500); 
  };

  const filterRoles = ref({
    Admin: true,
    Staff: true,
    Collector: true
  });
  const searchPhone = ref('');
  const searchAddress = ref('');
  const filterStatus = ref('all');
  const fromDate = ref('');
  const toDate = ref('');

  const activeFilterCount = computed(() => {
    let count = 0;
    if (searchPhone.value.trim() !== '') count++;
    if (searchAddress.value.trim() !== '') count++;
    if (filterStatus.value !== 'all') count++;
    if (!filterRoles.value.Admin || !filterRoles.value.Staff || !filterRoles.value.Collector) count++;
    if (fromDate.value || toDate.value) count++;
    return count;
  });

  const resetFilters = () => {
    filterRoles.value = { Admin: true, Staff: true, Collector: true };
    searchPhone.value = '';
    searchAddress.value = '';
    filterStatus.value = 'all';
    fromDate.value = '';
    toDate.value = '';
    searchQuery.value = '';
    applyFilters();
  };

  const applyFilters = () => {
    currentPage.value = 1;
    fetchUsers();
    isFilterPanelOpen.value = false; 
  };
  
  const userStats = ref({
    TotalUsers: 0, ActiveToday: 0, NewThisMonth: 0, LockedUsers: 0,
    AdminCount: 0, StaffCount: 0, CollectorCount: 0
  });

  const rolePercentages = computed(() => {
    const total = userStats.value.TotalUsers || 1; 
    return {
      admin: Math.round((userStats.value.AdminCount / total) * 100),
      staff: Math.round((userStats.value.StaffCount / total) * 100),
      collector: Math.round((userStats.value.CollectorCount / total) * 100)
    };
  });
  
  const getRoleStyle = (role) => {
    if (role === 'Admin') return 'bg-purple-50 text-purple-600 border-purple-200';
    if (role === 'Collector') return 'bg-orange-50 text-[#ff3d00] border-orange-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };
  
  const getStatusDot = (status) => {
    if (status === 'Hoạt động') return 'bg-emerald-500';
    if (status === 'Bị khóa') return 'bg-rose-500';
    return 'bg-slate-400'; 
  };
  
  const getStatusText = (status) => {
    if (status === 'Hoạt động') return 'text-emerald-600';
    if (status === 'Bị khóa') return 'text-rose-600';
    return 'text-slate-500'; 
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/account_admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        userStats.value = result.data;
      }
    } 
    catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    isLoading.value = true;
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(`${API_BASE_URL}/api/account_admin?page=${currentPage.value}&limit=10&quyen_admin=${filterRoles.value.Admin}&quyen_nhanvien=${filterRoles.value.Staff}&quyen_khach=${filterRoles.value.Collector}&keyword_hoten=${encodeURIComponent(searchQuery.value)}&keyword_sdt=${encodeURIComponent(searchPhone.value)}&keyword_diachi=${encodeURIComponent(searchAddress.value)}&trang_thai=${filterStatus.value}&tu_ngay=${fromDate.value}&den_ngay=${toDate.value}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();

      if (result.success) {
        users.value = result.data.map(item => {
          const displayName = item.HoTen || item.TenDN || 'Người dùng ẩn danh';
          
          let displayRole = 'Collector';
          if (item.MaQuyen === 1) displayRole = 'Admin';
          else if (item.MaQuyen === 2) displayRole = 'Staff';

          return {
            id: item.MaTK, 
            username: item.TenDN || '', 
            name: displayName,
            email: item.Email || 'Chưa cập nhật',
            phone: item.SDT || '',       
            address: item.DiaChi || '',
            role: displayRole, 
            status: item.Bi_khoa === 1 ? 'Bị khóa' : 'Hoạt động', 
            lastLogin: formatRelativeTime(item.DangNhapCuoi), 
            lastLoginAbsolute: item.DangNhapCuoi ? new Date(item.DangNhapCuoi).toLocaleString('vi-VN') : 'Chưa từng đăng nhập',
            ip: item.IPDangNhap || 'Chưa ghi nhận', 
            avatar: item.AnhDaiDien 
              ? `${API_BASE_URL}/Images_user/${item.AnhDaiDien}` 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f8fafc&color=64748b`
          };
        });
        
        totalPages.value = result.pagination.totalPage;
        totalUsersCount.value = result.pagination.totalItems;
      }
    } 
    catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } 
    finally {
      isLoading.value = false;
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/account_admin/logs/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        securityLogs.value = result.data;
      }
    } 
    catch (error) {
      console.error("Lỗi tải nhật ký bảo mật:", error);
    }
  };

  const fetchAllLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/account_admin/logs/all?page=${allLogsPagination.value.currentPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        allLogsList.value = result.data;
        allLogsPagination.value = result.pagination;
      }
    } 
    catch (error) {
      console.error(error);
    }
  };

  const openAllLogsModal = () => {
    allLogsPagination.value.currentPage = 1;
    fetchAllLogs();
    isAllLogsModalOpen.value = true;
  };

  const changeLogPage = (page) => {
    if (page < 1 || page > allLogsPagination.value.totalPage) return;
    allLogsPagination.value.currentPage = page;
    fetchAllLogs();
  };

  onMounted(() => {
    fetchUsers();
    fetchUserStats();
    fetchSecurityLogs();
  });

  const isAddUserModalOpen = ref(false);
  const newUser = ref({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'Collector',
    status: 'Hoạt động'
  });

  const openAddUserModal = () => {
    newUser.value = {
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'Collector',
      status: 'Hoạt động'
    };
    isAddUserModalOpen.value = true;
  };

  const submitNewUser = async () => {
    if (!newUser.value.name.trim() || !newUser.value.email.trim() || !newUser.value.username.trim() || !newUser.value.password.trim()) {
      toastStore.showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.value.email)) {
      toastStore.showToast("Email không đúng định dạng!", "error");
      return;
    }
    if (newUser.value.password.length < 6) {
      toastStore.showToast("Mật khẩu phải có ít nhất 6 ký tự!", "error");
      return;
    }

    let maQuyen = 3; 
    if (newUser.value.role === 'Admin') maQuyen = 1;
    else if (newUser.value.role === 'Staff') maQuyen = 2;

    try {
      const res = await fetch(`${API_BASE_URL}/api/account_admin/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          TenDN: newUser.value.username,
          MatKhau: newUser.value.password,
          Email: newUser.value.email,
          MaQuyen: maQuyen,
          BiKhoa: newUser.value.status === 'Bị khóa' ? 1 : 0,
          Hovaten: newUser.value.name
        })
      });
      const result = await res.json();
      
      if (res.ok) {
        toastStore.showToast("Tạo tài khoản thành công!", "success");
        isAddUserModalOpen.value = false;
        fetchUsers();
        fetchSecurityLogs();
      } 
      else {
        toastStore.showToast(result.message || "Lỗi khi tạo tài khoản", "error");
      }
    } 
    catch (error) {
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const toggleLockStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/account_admin/lock`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ MaTK: id })
      });
      if (res.ok) {
        toastStore.showToast("Đã thay đổi trạng thái khóa!", "success");
        fetchUsers();
        fetchSecurityLogs();
        if (isViewUserDrawerOpen.value && viewingUser.value.id === id) {
          await viewUser(id);
        }
      }
    } 
    catch (error) {
      toastStore.showToast("Lỗi khi đổi trạng thái", "error");
    } 
    finally {
      activeMenuId.value = null;
    }
  };

  const lockUser = (id) => toggleLockStatus(id);
  const unlockUser = (id) => toggleLockStatus(id);
  // --- LOGIC MENU 3 CHẤM (DROPDOWN) ---
  const activeMenuId = ref(null);
  const toggleUserMenu = (id) => {
    activeMenuId.value = activeMenuId.value === id ? null : id;
  };

  // --- LOGIC XEM CHI TIẾT NGƯỜI DÙNG (DRAWER) ---
  const isViewUserDrawerOpen = ref(false);
  const viewingUser = ref({});

  const viewUser = async (id) => {
    isViewUserDrawerOpen.value = true;
    isDrawerEditMode.value = false;
    activeMenuId.value = null; 
    viewingUser.value = { name: "Đang tải dữ liệu...", email: "", phone: "", address: "" };

    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch(`${API_BASE_URL}/api/account_admin/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        const data = result.data;
        
        let displayRole = 'Collector';
        if (data.MaQuyen === 1) displayRole = 'Admin';
        else if (data.MaQuyen === 2) displayRole = 'Nhân viên';

        const displayName = data.HoTen || data.TenDN || 'Người dùng ẩn danh';

        viewingUser.value = {
          id: id,
          name: displayName,
          username: data.TenDN,
          email: data.Email || 'Chưa cập nhật',
          phone: data.SDT || 'Chưa cập nhật',
          address: data.DiaChi || 'Chưa cập nhật',
          role: displayRole,
          status: data.Bi_khoa === 1 ? 'Bị khóa' : 'Hoạt động',
          lastLogin: formatRelativeTime(data.DangNhapCuoi),
          lastLoginAbsolute: data.DangNhapCuoi ? new Date(data.DangNhapCuoi).toLocaleString('vi-VN') : 'Chưa từng đăng nhập',
          ip: data.IPDangNhap || 'Chưa ghi nhận', 
          avatar: data.AnhDaiDien 
            ? `${API_BASE_URL}/Images_user/${data.AnhDaiDien}` 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f8fafc&color=64748b`,
          orderCount: data.SoDonHang, 
          totalSpent: data.TongChiTieu
        };
      } 
      else {
        toastStore.showToast("Không thể tải thông tin chi tiết", "error");
        isViewUserDrawerOpen.value = false;
      }
    } 
    catch (error) {
      console.error(error);
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
      isViewUserDrawerOpen.value = false;
    }
  };

  const isDrawerEditMode = ref(false);
  const toggleDrawerEditMode = () => {
    if (viewingUser.value.phone === 'Chưa cập nhật') viewingUser.value.phone = '';
    if (viewingUser.value.address === 'Chưa cập nhật') viewingUser.value.address = '';
    if (viewingUser.value.email === 'Chưa cập nhật') viewingUser.value.email = '';
    isDrawerEditMode.value = true;
  };

  const saveDrawerEdits = async () => {
    try {
      if (!viewingUser.value.name.trim()) {
        toastStore.showToast("Họ và tên không được để trống!", "error");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (viewingUser.value.email && viewingUser.value.email !== 'Chưa cập nhật' && !emailRegex.test(viewingUser.value.email)) {
        toastStore.showToast("Định dạng Email không hợp lệ!", "error");
        return;
      }
      const phoneRegex = /^(0|\+84|84)[35789]\d{8}$/;
      if (viewingUser.value.phone && viewingUser.value.phone !== 'Chưa cập nhật' && !phoneRegex.test(viewingUser.value.phone)) {
          toastStore.showToast("Số điện thoại không hợp lệ!", "error");
          return;
      }
      const cleanEmail = viewingUser.value.email === 'Chưa cập nhật' ? '' : viewingUser.value.email;
      const cleanPhone = viewingUser.value.phone === 'Chưa cập nhật' ? '' : viewingUser.value.phone;
      const cleanAddress = viewingUser.value.address === 'Chưa cập nhật' ? '' : viewingUser.value.address;

      const res = await fetch(`${API_BASE_URL}/api/account_admin/update/${viewingUser.value.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          Hovaten: viewingUser.value.name, 
          Email: cleanEmail,
          diachi: cleanAddress,
          SDT: cleanPhone,
          BiKhoa: viewingUser.value.status === 'Bị khóa' ? 1 : 0
        })
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        toastStore.showToast("Đã cập nhật hồ sơ chi tiết!", "success");
        isDrawerEditMode.value = false;
        fetchUsers();
        fetchSecurityLogs();
        await viewUser(viewingUser.value.id); 
      } 
      else {
        toastStore.showToast(result.message || "Lỗi cập nhật", "error");
      }
    } 
    catch (error) {
      toastStore.showToast("Lỗi kết nối", "error");
    }
  };

  const cancelDrawerEdits = () => {
    const originalUser = users.value.find(u => u.id === viewingUser.value.id);
    if (originalUser) {
      viewingUser.value = {
        ...originalUser,
        phone: originalUser.phone || 'Chưa cập nhật',
        address: originalUser.address || 'Chưa cập nhật',
        email: originalUser.email || 'Chưa cập nhật'
      };
    }
    isDrawerEditMode.value = false;
  };

  const downloadReport = async () => {
    isDownloading.value = true;
    toastStore.showToast("Đang tạo báo cáo, vui lòng đợi...", "info");
    
    try {
      const token = localStorage.getItem('token'); 
      const queryParams = new URLSearchParams({
        quyen_admin: filterRoles.value.Admin,
        quyen_nhanvien: filterRoles.value.Staff,
        quyen_khach: filterRoles.value.Collector,
        keyword_hoten: searchQuery.value,
        keyword_sdt: searchPhone.value,
        keyword_diachi: searchAddress.value,
        trang_thai: filterStatus.value,
        tu_ngay: fromDate.value,
        den_ngay: toDate.value
      }).toString();

      const res = await fetch(`${API_BASE_URL}/api/account_admin/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!res.ok) throw new Error("Lỗi tải file");
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `Bao_Cao_Nguoi_Dung_${dateStr}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toastStore.showToast("Tải báo cáo thành công!", "success");
      fetchSecurityLogs(); 
    } 
    catch (e) {
      console.error(e);
      toastStore.showToast("Lỗi khi tải báo cáo", "error");
    } 
    finally {
      isDownloading.value = false;
    }
  };

  const resetPassword = async (id) => {
    if(!confirm("Bạn có chắc chắn muốn đặt lại mật khẩu của người dùng này thành '123456' không?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/account_admin/reset-password/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const result = await res.json();
      
      if(res.ok && result.success) {
        toastStore.showToast("Đã đặt lại mật khẩu thành 123456!", "success");
        fetchSecurityLogs();
      } 
      else {
        toastStore.showToast("Lỗi khi đặt lại mật khẩu", "error");
      }
    } 
    catch(error) {
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
    } 
    finally {
      activeMenuId.value = null; 
    }
  };
  
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Chưa từng đăng nhập';
    
    const now = new Date();
    const loginDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - loginDate) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    
    return loginDate.toLocaleDateString('vi-VN');
  };
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>