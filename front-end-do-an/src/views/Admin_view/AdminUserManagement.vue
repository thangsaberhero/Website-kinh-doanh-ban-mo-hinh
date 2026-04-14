<template>
    <div @click="closeAllMenus" class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800 relative">
      
       <div 
        v-show="isMobileMenuOpen || isFilterPanelOpen || isViewUserDrawerOpen" 
        @click="isMobileMenuOpen = false; isFilterPanelOpen = false; isViewUserDrawerOpen = false" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
      ></div>
  
      <AdminSideBar :is-collapsed="isSidebarCollapsed" :is-mobile-open="isMobileMenuOpen" />
  
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
            <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
              <span class="material-symbols-outlined text-[16px]">badge</span> Hồ sơ nhân thân
            </h3>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[11px] text-slate-500 mb-1 font-bold">Họ và tên thực</p>
                  <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900">{{ viewingUser.name }}</p>
                  <input v-else v-model="viewingUser.name" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all">
                </div>
                
                <div>
                  <p class="text-[11px] text-slate-500 mb-1 font-bold">Số điện thoại</p>
                  <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900">{{ viewingUser.phone }}</p>
                  <input v-else v-model="viewingUser.phone" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all">
                </div>
              </div>
              
              <div>
                <p class="text-[11px] text-slate-500 mb-1 font-bold">Địa chỉ cư trú</p>
                <p v-if="!isDrawerEditMode" class="text-sm font-semibold text-slate-900">{{ viewingUser.address }}</p>
                <input v-else v-model="viewingUser.address" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none transition-all">
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
                <input type="checkbox" value="Collector" class="w-4 h-4 text-[#ff8f73] border-slate-300 rounded focus:ring-[#ff8f73] transition-all">
                <span class="text-sm font-medium text-slate-700 group-hover:text-[#ff8f73] transition-colors">Collector (Khách hàng)</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" value="Staff" class="w-4 h-4 text-[#ff8f73] border-slate-300 rounded focus:ring-[#ff8f73] transition-all">
                <span class="text-sm font-medium text-slate-700 group-hover:text-[#ff8f73] transition-colors">Staff (Nhân viên)</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" value="Admin" class="w-4 h-4 text-purple-500 border-slate-300 rounded focus:ring-purple-500 transition-all">
                <span class="text-sm font-medium text-slate-700 group-hover:text-purple-600 transition-colors">Administrator (Quản trị)</span>
              </label>
            </div>
          </div>
        </div>
  
        <div class="p-6 border-t border-slate-100 flex gap-3 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button class="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Đặt lại</button>
          <button class="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-all text-sm">Áp dụng</button>
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
                <select v-model="viewingUser.role" class="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none bg-white shadow-sm cursor-pointer">
                  <option value="Collector">Collector</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
                <select v-model="viewingUser.status" class="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none bg-white shadow-sm cursor-pointer">
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
            </div>
          </div>

          <div class="space-y-4 pb-4 opacity-80">
            <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
              <span class="material-symbols-outlined text-[16px]">security</span> Bảo mật & Hoạt động
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[11px] text-slate-500 mb-1 font-bold">Đăng nhập cuối</p>
                <p class="text-sm font-semibold text-slate-900">{{ viewingUser.lastLogin }}</p>
              </div>
              <div>
                <p class="text-[11px] text-slate-500 mb-1 font-bold">Địa chỉ IP</p>
                <p class="text-sm font-semibold text-slate-900">{{ viewingUser.ip }}</p>
              </div>
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
        <AdminHeader @toggle-sidebar="handleToggleSidebar" />
        
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
                <p class="text-3xl font-brand font-bold text-slate-900">12,842</p>
                <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <span class="material-symbols-outlined text-sm">trending_up</span> +12% so với tháng trước
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">bolt</span>
              </div>
              <div class="relative z-10">
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Hoạt động hôm nay</p>
                <p class="text-3xl font-brand font-bold text-slate-900">3,105</p>
                <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  Tỉ lệ duy trì: 84.2%
                </div>
              </div>
            </div>
  
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">person_add</span>
              </div>
              <div class="relative z-10">
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Đăng ký mới</p>
                <p class="text-3xl font-brand font-bold text-slate-900">142</p>
                <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#ff8f73]">
                  <span class="material-symbols-outlined text-sm">update</span> Cập nhật 5 phút trước
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border border-rose-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">verified_user</span>
              </div>
              <div class="relative z-10">
                <p class="text-[11px] text-rose-400 font-bold uppercase tracking-widest mb-2">Trạng thái bảo mật</p>
                <p class="text-3xl font-brand font-bold text-rose-600">28 <span class="text-sm font-medium text-rose-400">bị khóa</span></p>
                <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-400 italic">
                  <span class="material-symbols-outlined text-sm">gpp_maybe</span> Yêu cầu kiểm tra ngay
                </div>
              </div>
            </div>
          </div>
  
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div class="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div class="flex items-center gap-3">
                <button @click="isFilterPanelOpen = true" class="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">tune</span> Bộ lọc nâng cao
                </button>
                
                <button class="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">sort</span> Sắp xếp: Mới nhất
                </button>
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
                      <p class="text-sm font-semibold text-slate-700">{{ user.lastLogin }}</p>
                      <p class="text-[11px] text-slate-400 font-medium">{{ user.ip }}</p>
                    </td>
                    
                    <td class="px-8 py-4 relative">
                        <div class="flex justify-end gap-1">
                            <button @click="viewUser(user.id)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all" title="Xem chi tiết">
                                <span class="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            
                            <button @click="openEditModal(user)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#ff8f73] hover:bg-[#ff8f73]/10 rounded-xl transition-all" title="Chỉnh sửa">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            
                            <button @click.stop="toggleUserMenu(user.id)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all" title="Thêm tùy chọn">
                                <span class="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                        </div>

                        <div 
                            v-show="activeMenuId === user.id"
                            @click.stop
                            class="absolute right-12 top-10 w-44 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-slate-100 py-2 z-50 text-left overflow-hidden"
                            :class="index >= users.length - 2 ? 'bottom-8' : 'top-10'"
                        >
                            <button class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2 font-medium transition-colors">
                                <span class="material-symbols-outlined text-[18px]">key</span> Đặt lại mật khẩu
                            </button>
                            
                            <button v-if="user.status === 'Hoạt động'" @click="lockUser(user.id)" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 font-medium transition-colors">
                                <span class="material-symbols-outlined text-[18px]">lock</span> Khóa tài khoản
                            </button>
                            <button v-else @click="unlockUser(user.id)" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 font-medium transition-colors">
                                <span class="material-symbols-outlined text-[18px]">lock_open</span> Mở khóa
                            </button>
                            
                            <div class="border-t border-slate-100 my-1"></div>
                            <button @click="deleteUser(user.id)" class="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold transition-colors">
                                <span class="material-symbols-outlined text-[18px]">delete</span> Xóa người dùng
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
                <a href="#" class="text-[10px] font-bold text-[#ff8f73] uppercase tracking-widest hover:underline">Xem tất cả</a>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                  <div class="w-10 h-10 shrink-0 flex items-center justify-center bg-rose-50 text-rose-500 rounded-full border border-rose-100">
                    <span class="material-symbols-outlined text-[20px]">lock_person</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 mb-1">Tài khoản <span class="text-rose-600">user_9921</span> đã bị khóa tự động</p>
                    <p class="text-xs text-slate-500 font-medium">Phát hiện 5 lần thử đăng nhập thất bại</p>
                    <p class="text-[10px] text-slate-400 mt-2 font-semibold">12:45 CH • Hôm nay</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                  <div class="w-10 h-10 shrink-0 flex items-center justify-center bg-purple-50 text-purple-500 rounded-full border border-purple-100">
                    <span class="material-symbols-outlined text-[20px]">key</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 mb-1">Thay đổi mật khẩu hệ thống bởi <span class="text-purple-600">Admin_Phong</span></p>
                    <p class="text-xs text-slate-500 font-medium">Chính sách bảo mật hàng quý được cập nhật thành công.</p>
                    <p class="text-[10px] text-slate-400 mt-2 font-semibold">09:12 SA • Hôm nay</p>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h4 class="font-headline text-lg font-bold text-slate-900 mb-6">Phân bổ vai trò</h4>
              
              <div class="space-y-6 flex-1">
                <div>
                  <div class="flex justify-between text-xs mb-2">
                    <span class="text-slate-500 font-bold">Collectors</span>
                    <span class="text-slate-900 font-bold">11,200 (87%)</span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div class="h-full bg-[#ff8f73] rounded-full" style="width: 87%"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between text-xs mb-2">
                    <span class="text-slate-500 font-bold">Staff</span>
                    <span class="text-slate-900 font-bold">1,540 (12%)</span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div class="h-full bg-slate-400 rounded-full" style="width: 12%"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between text-xs mb-2">
                    <span class="text-slate-500 font-bold">Administrators</span>
                    <span class="text-slate-900 font-bold">102 (1%)</span>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div class="h-full bg-purple-500 rounded-full" style="width: 1%"></div>
                  </div>
                </div>
              </div>
              
              <button class="w-full mt-8 py-3 bg-white text-slate-600 text-xs font-bold uppercase tracking-widest border-2 border-slate-100 hover:border-[#ff8f73] hover:text-[#ff8f73] rounded-xl transition-all shadow-sm">
                Tải báo cáo chi tiết
              </button>
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
                <input v-model="newUser.password" type="password" placeholder="••••••••" class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
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
    <div v-if="isEditUserModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Chỉnh sửa thông tin</h3>
            <p class="text-xs text-slate-500 font-medium">Đang sửa: <span class="text-[#ff8f73] font-bold">{{ editingUser.name }}</span></p>
          </div>
          <button @click="isEditUserModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-8 space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên đăng nhập</label>
            <input v-model="editingUser.username" type="text" disabled class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-100 text-slate-400 cursor-not-allowed font-medium">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Họ và Tên (*)</label>
            <input v-model="editingUser.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Địa chỉ Email</label>
            <input v-model="editingUser.email" type="email" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vai trò</label>
              <select v-model="editingUser.role" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-[#ff8f73] bg-[#ff8f73]/5">
                <option value="Collector">Collector</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
              <select v-model="editingUser.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bị khóa">Bị khóa</option>
                <option value="Ngoại tuyến">Ngoại tuyến</option>
              </select>
            </div>
          </div>
        </div>

        <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button @click="isEditUserModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
          <button @click="submitEditUser" class="px-6 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-black shadow-lg shadow-slate-800/20 rounded-xl transition-all">Lưu thay đổi</button>
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
  import { onMounted, watch } from 'vue';
  
  const isFilterPanelOpen = ref(false);
  const isSidebarCollapsed = ref(false);
  const isMobileMenuOpen = ref(false);
  
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) isMobileMenuOpen.value = !isMobileMenuOpen.value;
    else isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };
  const closeAllMenus = () => {
    activeMenuId.value = null; 
  };
  
  // Logic render giao diện tự động cho các loại Badge
  const getRoleStyle = (role) => {
    if (role === 'Admin') return 'bg-purple-50 text-purple-600 border-purple-200';
    if (role === 'Collector') return 'bg-orange-50 text-[#ff3d00] border-orange-200';
    return 'bg-slate-100 text-slate-600 border-slate-200'; // Cho Staff
  };
  
  const getStatusDot = (status) => {
    if (status === 'Hoạt động') return 'bg-emerald-500';
    if (status === 'Bị khóa') return 'bg-rose-500';
    return 'bg-slate-400'; // Ngoại tuyến
  };
  
  const getStatusText = (status) => {
    if (status === 'Hoạt động') return 'text-emerald-600';
    if (status === 'Bị khóa') return 'text-rose-600';
    return 'text-slate-500'; // Ngoại tuyến
  };
  const users = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalUsersCount = ref(0);
  const isLoading = ref(true);

  const fetchUsers = async () => {
    isLoading.value = true;
    try {
      // Gọi API liệt kê tài khoản của bạn
      const response = await fetch(`http://localhost:3000/api/account_admin?page=${currentPage.value}&limit=10`);
      const result = await response.json();

      if (result.success) {
        // Mapping dữ liệu từ Database vào UI
        // (Lưu ý: Bạn nhớ sửa lại các chữ item.MaTK, item.HoTen... cho khớp với tên cột trong bảng CSDL của bạn nhé)
        users.value = result.data.map(item => {
          
          // Lấy tên hiển thị, nếu không có thì lấy tên đăng nhập
          const displayName = item.HoTen || item.TenDangNhap || 'Người dùng ẩn danh';
          
          return {
            id: item.MaTK, 
            username: item.TenDangNhap || '',
            name: displayName,
            email: item.Email || 'Chưa cập nhật',
            
            // Xử lý logic hiển thị Vai trò và Trạng thái
            role: item.Quyen || 'Collector', 
            status: item.TrangThai || 'Hoạt động', 
            
            // Fix cứng tạm thời các thông số chưa có trong DB để UI không bị vỡ
            lastLogin: item.ThoiGianDangNhapCuoi || 'Chưa rõ',
            ip: '192.168.1.1',
            
            // Tự động tạo Avatar từ tên người dùng
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f8fafc&color=64748b`
          };
        });
        
        totalPages.value = result.pagination.totalPage;
        totalUsersCount.value = result.pagination.totalItems;
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchUsers();
  });
  // --- BƯỚC 3: LOGIC MODAL THÊM NGƯỜI DÙNG ---
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
  // Reset form mỗi khi mở lại modal
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

const submitNewUser = () => {
  // Ràng buộc (Validation) cơ bản
  if (!newUser.value.name.trim() || !newUser.value.email.trim()) {
    alert("Vui lòng điền đầy đủ Họ tên và Email!");
    return;
  }

  // Tự động tạo Avatar từ tên người dùng (UI-Avatars API)
  const autoAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.value.name)}&background=f8fafc&color=64748b`;
  
  // Tạo giả lập một địa chỉ IP ngẫu nhiên cho chân thực
  const randomIP = `192.168.1.${Math.floor(Math.random() * 255)}`;

  // Đẩy người dùng mới lên ĐẦU danh sách
  users.value.unshift({
    id: Date.now(), // Tạo ID ngẫu nhiên bằng Timestamp
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role,
    status: newUser.value.status,
    lastLogin: 'Chưa đăng nhập', // Tài khoản mới nên chưa từng đăng nhập
    ip: randomIP,
    avatar: autoAvatar
  });

  isAddUserModalOpen.value = false;
};
// --- LOGIC MENU 3 CHẤM (DROPDOWN) ---
const activeMenuId = ref(null);

const toggleUserMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

// --- LOGIC SỬA NGƯỜI DÙNG ---
const isEditUserModalOpen = ref(false);
const editingUser = ref({});

const openEditModal = (user) => {
  // LƯU Ý QUAN TRỌNG: Phải dùng spread operator {...user} để copy dữ liệu.
  // Nếu không copy, khi bạn gõ chữ vào Modal, chữ trong Bảng sẽ bị đổi theo ngay lập tức dù chưa ấn Lưu.
  editingUser.value = { ...user };
  isEditUserModalOpen.value = true;
  activeMenuId.value = null; // Đóng menu 3 chấm nếu nó đang mở
};

const submitEditUser = () => {
  // Tìm vị trí của người dùng đang sửa trong mảng
  const index = users.value.findIndex(u => u.id === editingUser.value.id);
  
  if (index !== -1) {
    // Ghi đè dữ liệu mới vào mảng
    users.value[index] = { ...editingUser.value };
    
    // Đóng modal
    isEditUserModalOpen.value = false;
    
    // Có thể thêm thông báo (Toast) thành công ở đây
    console.log("Đã cập nhật thành công!");
  }
};

// --- CÁC HÀM THAO TÁC NHANH  ---
// --- LOGIC XEM CHI TIẾT NGƯỜI DÙNG (DRAWER) ---
const isViewUserDrawerOpen = ref(false);
const viewingUser = ref({});

const viewUser = (id) => {
  const user = users.value.find(u => u.id === id);
  if (user) {
    // Sau này sẽ gọi API backend để lấy các trường này từ bảng "NhanVien" hoặc "KhachHang"
    viewingUser.value = {
      ...user,
      username: user.email.split('@')[0], // Tạo tên đăng nhập giả định từ email
      phone: '09' + Math.floor(Math.random() * 100000000), // SĐT giả định
      address: 'Phường A, Quận B, TP. Hồ Chí Minh', // Địa chỉ giả định
    };
    isDrawerEditMode.value = false;
    isViewUserDrawerOpen.value = true;
    activeMenuId.value = null; // Tự động đóng menu 3 chấm nếu nó đang mở
  }
};

const lockUser = (id) => {
  const user = users.value.find(u => u.id === id);
  if(user) user.status = 'Bị khóa';
  activeMenuId.value = null;
};

const unlockUser = (id) => {
  const user = users.value.find(u => u.id === id);
  if(user) user.status = 'Hoạt động';
  activeMenuId.value = null;
};

const deleteUser = (id) => {
  if(confirm("Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.")) {
    users.value = users.value.filter(u => u.id !== id);
    activeMenuId.value = null;
  }
};
// Khai báo biến kiểm soát chế độ sửa trong Ngăn kéo
const isDrawerEditMode = ref(false);

// Hàm toggle chế độ sửa
const toggleDrawerEditMode = () => {
  isDrawerEditMode.value = true;
};

// Hàm lưu khi sửa xong trong ngăn kéo
const saveDrawerEdits = () => {
  // Thực hiện lưu viewingUser.value vào mảng users (tương tự như hàm submitEditUser)
  const index = users.value.findIndex(u => u.id === viewingUser.value.id);
  if (index !== -1) {
    users.value[index] = { ...viewingUser.value };
  }
  
  // Tắt chế độ sửa, quay về chế độ xem
  isDrawerEditMode.value = false;
  console.log("Đã cập nhật hồ sơ chi tiết!");
};

// Hàm hủy sửa (Quay về như cũ)
const cancelDrawerEdits = () => {
  // Lấy lại dữ liệu gốc từ mảng để reset các thay đổi chưa lưu
  const originalUser = users.value.find(u => u.id === viewingUser.value.id);
  viewingUser.value = { ...originalUser };
  isDrawerEditMode.value = false;
};
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>