<template>
  <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>

    <div class="flex-1 flex flex-col min-h-screen overflow-hidden w-full relative">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-32">
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Hoàn tất đơn hàng</h1>
            <p class="text-slate-500 text-sm font-medium">Quản lý và xử lý quy trình vận chuyển cho các đơn hàng Figure.</p>
          </div>
          
          <div class="flex gap-3 w-full xl:w-auto">
            <button @click="exportExcelReport" class="flex-1 xl:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
              <span class="material-symbols-outlined text-[20px]" :class="{'animate-bounce': isExporting}">file_download</span>
              {{ isExporting ? 'Đang tạo file...' : 'Xuất báo cáo' }}
            </button>
            <button class="flex-1 xl:flex-none bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm">
              <span class="material-symbols-outlined text-[20px]">inventory</span>
              Xử lý hàng loạt
              <span v-if="selectedOrders.length > 0" class="bg-white text-[#ff3d00] text-[10px] px-1.5 py-0.5 rounded-md ml-1">{{ selectedOrders.length }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-orange-200 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">pending_actions</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Chờ xác nhận</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ summary[1] || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 shadow-inner relative z-10">
              <span class="material-symbols-outlined text-orange-500">pending_actions</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-sky-200 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">package_2</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Đang đóng gói</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ summary[2] || 0 }}</p>
          </div>
            <div class="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100 shadow-inner relative z-10">
              <span class="material-symbols-outlined text-sky-500">package_2</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-amber-200 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">local_shipping</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Đang giao</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ summary[3] || 0 }}</p>
          </div>
            <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-inner relative z-10">
              <span class="material-symbols-outlined text-amber-500">local_shipping</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-emerald-200 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
            <div class="relative z-10">
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Hoàn thành</p>
              <p class="text-3xl font-brand font-bold text-slate-900">{{ summary[4] || 0 }}</p>
          </div>
            <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-inner relative z-10">
              <span class="material-symbols-outlined text-emerald-500">check_circle</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div class="flex items-center border-b border-slate-100 bg-slate-50/50 px-6 overflow-x-auto custom-scrollbar">
            <button 
              v-for="tab in tabs" :key="tab.id"
              @click="activeTab = tab.id"
              class="px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2"
              :class="activeTab === tab.id ? 'border-[#ff8f73] text-[#ff3d00]' : 'border-transparent text-slate-500 hover:text-slate-900'"
            >
              {{ tab.name }}
            </button>
          </div>

          <div class="p-6 flex flex-col xl:flex-row justify-between gap-6 items-start xl:items-center border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-500 shadow-sm whitespace-nowrap">
                <span>Hiển thị {{ startItem }} - {{ endItem }} / {{ totalOrders }} đơn hàng</span>
              </div>
              
              <label class="flex items-center gap-2 cursor-pointer group bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:border-[#ff8f73] transition-all">
                <input v-model="selectAll" type="checkbox" class="w-4 h-4 rounded text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300 cursor-pointer transition-colors"/>
                <span class="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Chọn tất cả</span>
              </label>
            </div>

            <div class="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
              <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-0.5 shadow-sm w-full md:w-auto">
                <span class="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                <input type="date" v-model="filterDate.from" class="bg-transparent border-none text-[12px] font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none py-1.5">
                <span class="text-slate-300">-</span>
                <input type="date" v-model="filterDate.to" class="bg-transparent border-none text-[12px] font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none py-1.5">
              </div>

              <div class="relative w-full md:w-60">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input type="text" v-model="searchQuery" placeholder="Mã đơn, khách hàng..." class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-[#ff8f73] focus:ring-4 focus:ring-[#ff8f73]/10 outline-none transition-all font-medium text-slate-700 shadow-sm">
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button @click="isFilterPanelOpen = true" class="w-10 h-10 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all shadow-sm" title = "Bộ lọc">
                  <span class="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
                <div class="relative">
                  <button 
                    @click="isSortMenuOpen = !isSortMenuOpen" 
                    class="w-10 h-10 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all shadow-sm"
                    :class="{ 'border-[#ff8f73] text-[#ff8f73] bg-[#ff8f73]/5': isSortMenuOpen }"
                  >
                    <span class="material-symbols-outlined text-[20px]">sort</span>
                  </button>

                  <div 
                    v-show="isSortMenuOpen"
                    class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 animate-[fadeIn_0.2s_ease-out]"
                  >
                    <p class="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sắp xếp theo</p>
                    
                    <button @click="setSort('date_desc')" class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors hover:bg-slate-50">
                      <span class="font-medium text-slate-700 group-hover:text-[#ff8f73]">Mới nhất (Mặc định)</span>
                      <span v-if="sortBy === 'date_desc'" class="material-symbols-outlined text-[#ff8f73] text-[18px]">check</span>
                    </button>

                    <button @click="setSort('date_asc')" class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors hover:bg-slate-50">
                      <span class="font-medium text-slate-700 group-hover:text-[#ff8f73]">Cũ nhất trước</span>
                      <span v-if="sortBy === 'date_asc'" class="material-symbols-outlined text-[#ff8f73] text-[18px]">check</span>
                    </button>

                    <div class="border-t border-slate-50 my-1"></div>

                    <button @click="setSort('total_desc')" class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors hover:bg-slate-50">
                      <span class="font-medium text-slate-700 group-hover:text-[#ff8f73]">Tổng tiền: Cao đến Thấp</span>
                      <span v-if="sortBy === 'total_desc'" class="material-symbols-outlined text-[#ff8f73] text-[18px]">check</span>
                    </button>

                    <button @click="setSort('total_asc')" class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors hover:bg-slate-50">
                      <span class="font-medium text-slate-700 group-hover:text-[#ff8f73]">Tổng tiền: Thấp đến Cao</span>
                      <span v-if="sortBy === 'total_asc'" class="material-symbols-outlined text-[#ff8f73] text-[18px]">check</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto min-h-[300px]">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr class="bg-slate-50/50 border-y border-slate-100">
                  <th class="px-6 py-5 w-12 text-center"></th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mã đơn & Khách</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Trạng thái & Ngày</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Giá trị đơn</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Giao dịch TT (Thực tế)</th>
                  <th class="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(order, index) in orders" :key="order.id" 
                    class="transition-colors group"
                    :class="selectedOrders.includes(order.id) ? 'bg-[#ff8f73]/5 hover:bg-[#ff8f73]/10' : 'hover:bg-slate-50/80'">
                  
                  <td class="px-6 py-4 text-center">
                    <input v-model="selectedOrders" :value="order.id" type="checkbox" class="w-4 h-4 rounded text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300 cursor-pointer"/>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 text-sm">{{ order.code }}</span>
                      <span class="text-[11px] font-semibold text-slate-600 mt-0.5">{{ order.customer }}</span>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="flex flex-col items-start gap-1.5">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border shadow-sm" :class="getOrderStatusBadge(order.orderStatus).class">
                        {{ getOrderStatusBadge(order.orderStatus).text }}
                      </span>
                      <span class="text-[11px] font-medium text-slate-400">{{ order.time }} - {{ order.date }}</span>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="flex flex-col items-start">
                      <span class="text-sm font-bold text-[#ff3d00]">{{ order.total?.toLocaleString('vi-VN') }} ₫</span>
                      <span class="text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded" 
                            :class="order.paymentStatus?.includes('Đã thanh toán') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'">
                        {{ order.paymentStatus }}
                      </span>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="flex flex-col gap-0.5">
                      <p class="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]" :class="order.paymentMethod?.includes('COD') ? 'text-sky-500' : 'text-purple-500'">
                          {{ order.paymentMethod?.includes('COD') ? 'local_shipping' : 'account_balance' }}
                        </span>
                        {{ order.paymentMethod }} 
                        <span class="text-slate-300 font-normal">|</span> 
                        <span class="text-indigo-600 text-[11px]">{{ order.paymentType }}</span>
                      </p>
                      <p class="text-[11px] font-bold text-emerald-600 mt-1">GD: {{ order.transactionAmount?.toLocaleString('vi-VN') }} ₫</p>
                      <p class="text-[10px] text-slate-400 font-medium">Lúc: {{ order.transactionDate }}</p>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 relative">
                      <div class="flex justify-end gap-1 relative">
                          <button @click="viewOrderDetails(order)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all" title="Xem chi tiết đơn">
                              <span class="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          
                          <button @click="updateOrderStatus(order.id)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Cập nhật trạng thái">
                              <span class="material-symbols-outlined text-[18px]">check_circle</span>
                          </button>
                          
                          <button @click.stop="toggleOrderMenu(order.id)" class="w-8 h-8 flex items-center justify-center rounded-xl transition-all" :class="activeMenuId === order.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'">
                              <span class="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>

                          <div v-show="activeMenuId === order.id" @click.stop class="absolute right-8 top-10 w-40 bg-white rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-slate-100 py-1 z-50 text-left overflow-hidden">
                              <button @click="handlePrintInvoice(order.id)" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">print</span> In hóa đơn
                              </button>
                              <div class="border-t border-slate-100 my-1"></div>
                              <button @click="cancelOrder(order.id)" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">cancel</span> Hủy đơn
                              </button>
                          </div>
                      </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="p-6 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
            <span class="text-xs font-bold text-slate-400">
              Hiển thị {{ startItem }} - {{ endItem }} của {{ totalOrders }} đơn hàng
            </span>
            
            <div v-if="totalPages > 1" class="flex items-center gap-2">
              <button 
                @click="changePage(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
              >
                <span class="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              <button 
                v-for="p in totalPages" 
                :key="p" 
                @click="changePage(p)"
                :class="currentPage === p 
                  ? 'bg-[#ff8f73] text-white shadow-lg shadow-[#ff8f73]/20 border-transparent' 
                  : 'bg-white border-slate-200 text-slate-500 hover:text-[#ff8f73] hover:border-[#ff8f73]'"
                class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold border transition-all"
              >
                {{ p }}
              </button>
              
              <button 
                @click="changePage(currentPage + 1)" 
                :disabled="currentPage === totalPages"
                class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
              >
                <span class="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

      </main>
      <div 
          class="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
          :class="isViewOrderDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
      >
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-lg font-bold text-slate-900">Chi tiết đơn hàng</h2>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">{{ viewingOrder.code }}</span>
          </div>
          <p class="text-xs text-slate-500 font-medium">Đặt lúc: {{ viewingOrder.time }}, {{ viewingOrder.date }}</p>
        </div>
        <button @click="isViewOrderDrawerOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        
        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
            <span class="material-symbols-outlined text-[16px]">local_shipping</span> Giao hàng tới
          </h3>
          
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-slate-300 text-[18px] mt-0.5">person</span>
              <div>
                <p class="text-sm font-bold text-slate-900">{{ viewingOrder.customer }}</p>
                <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ viewingOrder.phone }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-slate-300 text-[18px] mt-0.5">location_on</span>
              <p class="text-xs font-medium text-slate-700 leading-relaxed">{{ viewingOrder.address }}</p>
            </div>
            <div class="flex items-center gap-3 pt-2 border-t border-slate-50">
              <span class="material-symbols-outlined text-slate-300 text-[18px]">inventory_2</span>
              <p class="text-xs font-medium text-slate-600">
                ĐVVC: <span class="font-bold text-slate-900">{{ viewingOrder.carrier }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div class="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">category</span> Sản phẩm ({{ viewingOrder.products?.length || 0 }})
            </h3>
          </div>
          
          <div class="space-y-4">
            <div v-for="(prod, index) in viewingOrder.products" :key="index" class="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0">
              
              <div class="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 p-1">
                <img v-if="prod.image" :src="'http://localhost:3000/Images_product/' + prod.image" class="w-full h-full object-contain"/>
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  <span class="material-symbols-outlined">image_not_supported</span>
                </div>
              </div>
              
              <div class="flex-1 flex flex-col justify-between h-full">
                <div>
                  <div v-if="prod.isSale" class="mb-1">
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200">
                      <span class="material-symbols-outlined text-[10px]">local_fire_department</span> Flash Sale
                    </span>
                  </div>
                  
                  <p class="text-sm font-bold text-slate-900 line-clamp-2 leading-tight" :title="prod.name">{{ prod.name }}</p>
                </div>
                
                <div class="flex justify-between items-end mt-2">
                  <p class="text-xs font-semibold text-slate-500">Số lượng: x{{ prod.quantity }}</p>
                  
                  <div class="text-right">
                    <p v-if="prod.isSale" class="text-[10px] text-slate-400 line-through mb-0.5">
                      {{ (prod.originalPrice * prod.quantity).toLocaleString('vi-VN') }} ₫
                    </p>
                    <p class="text-sm font-bold text-[#ff3d00]">
                      {{ prod.totalPrice.toLocaleString('vi-VN') }} ₫
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div class="flex justify-between items-center text-xs font-medium text-slate-500">
              <span>Tạm tính sản phẩm:</span>
              <span class="text-slate-900 font-semibold">{{ viewingOrder.subtotal?.toLocaleString('vi-VN') }} ₫</span>
            </div>
            <div class="flex justify-between items-center text-xs font-medium text-slate-500 border-b border-slate-50 pb-3">
              <span>Khuyến mãi, mã giảm giá:</span>
              <span class="text-slate-900 font-semibold">{{ viewingOrder.discount?.toLocaleString('vi-VN') }} ₫</span>
            </div>
            <div class="flex justify-between items-center pt-1">
              <span class="text-xs font-bold text-slate-900 uppercase">Tổng thu:</span>
              <span class="text-lg font-brand font-bold text-[#ff3d00]">{{ viewingOrder.total?.toLocaleString('vi-VN') }} ₫</span>
            </div>
            <div class="pt-2">
              <span class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide bg-slate-100 text-slate-600 border border-slate-200 w-full text-center">
                Phương thức: {{ viewingOrder.paymentStatus }}
              </span>
            </div>
        </div>
      </div>
      
      <div class="p-6 border-t border-slate-100 bg-white shrink-0 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button class="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">print</span> In nhãn
        </button>
        <button @click="updateOrderStatus(viewingOrder.id)" class="flex-[2] py-3 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-colors text-sm flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">check_circle</span> Xác nhận đóng gói
        </button>
      </div>
    </div>

      <footer class="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-between items-center px-8 py-4 z-40">
        <div class="flex items-center gap-6">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">© 2024 FigureCollect. Phiên bản 2.4.0-Technical.</span>
        </div>
        <div class="flex items-center gap-4">
          <a href="#" class="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#ff8f73] transition-colors">Tài liệu kỹ thuật</a>
          <a href="#" class="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#ff8f73] transition-colors">Nhật ký thay đổi</a>
        </div>
      </footer>
    </div>
  </div>
  <div 
    class="fixed top-0 right-0 h-screen w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
    :class="isFilterPanelOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
        <p class="text-xs text-slate-500">Tìm kiếm đơn hàng chuẩn xác hơn</p>
      </div>
      <button @click="isFilterPanelOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
      
      <div class="space-y-4">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">local_shipping</span> Đơn vị vận chuyển
        </label>
        <div class="flex flex-col gap-2">
          <label v-for="c in carriers" :key="c" class="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" :value="c" v-model="advancedFilter.carriers" class="w-4 h-4 text-[#ff8f73] border-slate-300 rounded focus:ring-[#ff8f73]">
            <span class="text-sm font-medium text-slate-700 group-hover:text-[#ff8f73] transition-colors">{{ c }}</span>
          </label>
        </div>
      </div>

      <div class="space-y-4">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">payments</span> Hình thức thanh toán
        </label>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="all" v-model="advancedFilter.payment" class="text-[#ff8f73] focus:ring-[#ff8f73]">
            <span class="text-sm font-medium text-slate-700">Tất cả</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="banking" v-model="advancedFilter.payment" class="text-[#ff8f73] focus:ring-[#ff8f73]">
            <span class="text-sm font-medium text-slate-700">Chuyển khoản (Banking)</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="cod" v-model="advancedFilter.payment" class="text-[#ff8f73] focus:ring-[#ff8f73]">
            <span class="text-sm font-medium text-slate-700">Thanh toán khi nhận hàng (COD)</span>
          </label>
        </div>
      </div>

    </div>

    <div class="p-6 border-t border-slate-100 bg-white flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button @click="resetAdvancedFilter" class="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Đặt lại</button>
      <button @click="applyAdvancedFilter" class="flex-[2] py-3 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-all text-sm">Áp dụng</button>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, computed, watch } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { onMounted } from 'vue';
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';

  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const orders = ref([]);
  const isLoading = ref(true);
  
  // --- Quản lý Tìm kiếm & Lọc thời gian ---
  const searchQuery = ref('');
  const filterDate = ref({ from: '', to: '' });
  const isFilterPanelOpen = ref(false); // Trạng thái mở Sidebar Lọc
  const isSortMenuOpen = ref(false);    // Trạng thái mở Menu Sắp xếp

  const totalOrders = ref(0); 
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalPages = ref(1); // Thêm biến tổng số trang
  const summary = ref({});   // Hứng dữ liệu summary từ API

  // Sửa lại để không bị lỗi hiển thị "1 - 10 của 0" khi không có đơn nào
  const startItem = computed(() => totalOrders.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
  const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalOrders.value));

  const isExporting = ref(false);

const exportExcelReport = async () => {
  isExporting.value = true;
  try {
    // 1. Gọi API (Nhớ thêm Token nếu Route của bạn cần xác thực Admin)
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/invoice_admin/export-excel', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Lỗi khi tải file từ Server");
    }

    // 2. Chuyển dữ liệu binary trả về thành dạng Blob
    const blob = await response.blob();
    
    // 3. Tạo một URL ảo cho cục Blob này
    const url = window.URL.createObjectURL(blob);
    
    // 4. Tạo 1 thẻ <a> ẩn, gán link và kích hoạt click để tải xuống
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_FigureCollect_${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    
    // 5. Dọn dẹp
    a.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Lỗi xuất Excel:", error);
    alert("Không thể xuất báo cáo lúc này!");
  } finally {
    isExporting.value = false;
  }
};

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchOrders();
    }
  };
    
  // --- QUẢN LÝ BỘ LỌC NÂNG CAO ---
  const carriers = ['Giao Hàng Nhanh', 'Viettel Post', 'J&T Express', 'GrabExpress'];

  const advancedFilter = ref({
    carriers: [],
    payment: 'all',
    minPrice: null,
    maxPrice: null
  });

  // Hàm áp dụng bộ lọc
  const applyAdvancedFilter = () => {
    console.log("Dữ liệu lọc gửi xuống API:", advancedFilter.value);
    // Thực tế: gọi hàm fetchOrders() để tải lại danh sách theo tiêu chí mới
    isFilterPanelOpen.value = false;
  };

  // Hàm đặt lại (Reset)
  const resetAdvancedFilter = () => {
    advancedFilter.value = {
      carriers: [],
      payment: 'all',
      minPrice: null,
      maxPrice: null
    };
  };

  // --- QUẢN LÝ SẮP XẾP ---
  const sortBy = ref('date_desc'); // Giá trị mặc định

  const setSort = (value) => {
    sortBy.value = value;
    isSortMenuOpen.value = false; // Đóng menu sau khi chọn
    // fetchOrders();
  };

  const sortedOrders = computed(() => {
    let result = [...orders.value];
    
    switch (sortBy.value) {
      case 'total_desc':
        return result.sort((a, b) => b.total - a.total);
      case 'total_asc':
        return result.sort((a, b) => a.total - b.total);
      case 'date_desc':
        return result.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
      default:
        return result;
    }
  });
  
  /* const fetchOrders = async () => {
    isLoading.value = true;
    try {
      // Gửi kèm tiêu chí sắp xếp và tìm kiếm lên server
      const response = await fetch(`http://localhost:3000/api/orders?sort=${sortBy.value}&search=${searchQuery.value}`);
      const data = await response.json();
      orders.value = data; // Dữ liệu nhận về đã được server sắp xếp sẵn
    } finally {
      isLoading.value = false;
    }
  };

  // Theo dõi sự thay đổi của biến sortBy để gọi lại API
  watch(sortBy, () => {
    fetchOrders();
  });*/
  // --- Quản lý Tabs ---
  const tabs = [
    { id: 'all', name: 'Tất cả' },
    { id: 'pending', name: 'Chờ xác nhận' },
    { id: 'packing', name: 'Đang đóng gói' },
    { id: 'shipping', name: 'Đang giao' },
    { id: 'completed', name: 'Đã hoàn thành' },
    { id: 'cancelled', name: 'Đã hủy' },
    { id: 'returned', name: 'Hoàn hàng' }
  ];
  const activeTab = ref('all');

  const getOrderStatusBadge = (status) => {
    const s = status?.toUpperCase() || '';
    if (s.includes('ĐÃ GIAO') || s.includes('HOÀN THÀNH')) return { class: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: 'ĐÃ GIAO' };
    if (s.includes('CHỜ DUYỆT') || s.includes('ĐÓNG GÓI')) return { class: 'bg-amber-50 text-amber-600 border-amber-100', text: 'ĐANG XỬ LÝ' };
    if (s.includes('VẬN CHUYỂN') || s.includes('ĐANG GIAO')) return { class: 'bg-sky-50 text-sky-600 border-sky-100', text: 'ĐANG GIAO' };
    if (s.includes('HỦY')) return { class: 'bg-rose-50 text-rose-600 border-rose-100', text: 'ĐÃ HỦY' };
    if (s.includes('HOÀN')) return { class: 'bg-purple-50 text-purple-600 border-purple-100', text: 'ĐÃ HOÀN HÀNG' };
    return { class: 'bg-slate-50 text-slate-600 border-slate-100', text: status || 'CHỜ XỬ LÝ' };
  };
  
  
  // --- Logic Checkbox & Xử lý hàng loạt ---
  const selectedOrders = ref([]); // Mảng chứa ID các đơn hàng đang được tick
  
  // Computed property để xử lý nút "Chọn tất cả"
  const selectAll = computed({
    get: () => orders.value.length > 0 && selectedOrders.value.length === orders.value.length,
    set: (value) => {
      if (value) {
        selectedOrders.value = orders.value.map(o => o.id); // Chọn hết
      } else {
        selectedOrders.value = []; // Bỏ chọn hết
      }
    }
  });
  
  // --- Hàm tạo màu động ---
  const getCarrierColor = (carrier) => {
    if (carrier.includes('Giao Hàng')) return 'text-orange-500';
    if (carrier.includes('Viettel')) return 'text-emerald-600';
    if (carrier.includes('J&T')) return 'text-rose-600';
    return 'text-sky-600';
  };
  
  const getPaymentStyle = (status) => {
    if (status.includes('Đã thanh toán')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (status.includes('COD')) return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };
  // --- LOGIC MENU 3 CHẤM (DROPDOWN) ---
  // Biến lưu trữ ID của đơn hàng đang được mở menu
  const activeMenuId = ref(null);

  // Hàm bật/tắt menu cho từng dòng
  const toggleOrderMenu = (id) => {
    // Nếu bấm lại vào chính menu đang mở thì đóng nó đi, nếu bấm chỗ khác thì mở menu mới
    activeMenuId.value = activeMenuId.value === id ? null : id;
  };

  // --- CÁC HÀM XỬ LÝ HÀNH ĐỘNG CỦA MENU ---
  // Khai báo biến quản lý Ngăn kéo
    const isViewOrderDrawerOpen = ref(false);
    const viewingOrder = ref({});
    // 1. GỌI API LẤY DANH SÁCH ĐƠN HÀNG
  const fetchOrders = async () => {
    isLoading.value = true;
    try {
      // Ánh xạ tab sang mã trạng thái
      let statusParam = '';
      if (activeTab.value === 'pending') statusParam = 1;
      else if (activeTab.value === 'packing') statusParam = 2;
      else if (activeTab.value === 'shipping') statusParam = 3;
      else if (activeTab.value === 'completed') statusParam = 4;
      else if (activeTab.value === 'cancelled') statusParam = 5;
      else if (activeTab.value === 'returned') statusParam = 6; 

      // Xây dựng URL với các tham số Tối ưu
      let url = `http://localhost:3000/api/invoice_admin?page=${currentPage.value}&limit=${itemsPerPage.value}`;
      
      if (statusParam) url += `&trangthai=${statusParam}`;
      if (searchQuery.value) url += `&timkiem=${encodeURIComponent(searchQuery.value)}`; 
      if (filterDate.value.from) url += `&ngaybatdau=${filterDate.value.from}`;
      if (filterDate.value.to) url += `&ngayketthuc=${filterDate.value.to}`;
      if (sortBy.value) url += `&sapxep=${sortBy.value}`; // Truyền thẳng biến: date_desc, total_asc...

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
      });
      const result = await response.json();

      if (result.success) {
        totalOrders.value = result.pagination.totalItems;
        totalPages.value = result.pagination.totalPage;
        summary.value = result.summary || {};
        
        orders.value = result.data.map(item => {
          const d = new Date(item.NgayLapDon);
          return {
            id: item.MaDH,
            code: `#FC-${item.MaDH}`,
            carrier: 'Giao Hàng Nhanh',
            customer: item.TenNguoiNhan || `Khách hàng (Mã KH: ${item.MaKH})`,
            staffName: item.TenNV || 'Chưa phân công',
            orderStatus: item.TrangThai || 'Chờ duyệt',
            time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            date: d.toLocaleDateString('vi-VN'),
            paymentStatus: item.TrangThaiThanhToan,
            total: Number(item.ThanhTien),
            statusId: item.MaTT,
            paymentMethod: item.TenPhuongThuc || 'COD',
            paymentType: item.LoaiGiaoDich || 'Thanh toán toàn bộ',
            transactionAmount: Number(item.SoTienGiaoDich) || 0,
            transactionDate: item.NgayThanhToan ? new Date(item.NgayThanhToan).toLocaleString('vi-VN') : 'Chưa thu tiền'
          };
        });
      }
    } catch (error) {
      console.error("Lỗi tải danh sách đơn hàng:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Tự động tải khi mở trang & đổi Tab
  onMounted(() => fetchOrders());
  // --- KỸ THUẬT DEBOUNCE & GỘP WATCHER TỐI ƯU ---
  let fetchTimeout = null;

  watch(
    [
      activeTab,                   // Theo dõi thay đổi Tab (Tất cả, Chờ duyệt...)
      searchQuery,                 // Theo dõi người dùng gõ tìm kiếm
      () => filterDate.value.from, // Theo dõi ngày bắt đầu
      () => filterDate.value.to,   // Theo dõi ngày kết thúc
      sortBy                       // Theo dõi kiểu sắp xếp
    ], 
    () => {
      // 1. Luôn reset về trang 1 mỗi khi thay đổi điều kiện lọc
      currentPage.value = 1;

      // 2. Clear timeout cũ nếu người dùng vẫn đang gõ/click liên tục
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }

      // 3. Đợi 500ms (0.5 giây) sau khi người dùng DỪNG thao tác thì mới gọi API
      fetchTimeout = setTimeout(() => {
        fetchOrders();
      }, 500); 
    }
  );

  // 2. GỌI API XEM CHI TIẾT ĐƠN HÀNG
  const viewOrderDetails = async (order) => {
    try {
      const token = localStorage.getItem('token');
      console.log("Đang gọi API lấy chi tiết mã đơn:", order.id); // Log ra để kiểm tra
      const response = await fetch(`http://localhost:3000/api/invoice_admin/${order.id}`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const result = await response.json();
      
      if (result.success) {
        const info = result.data.ThongTinGiaoHang;
        const productsList = result.data.DanhSachHang;
        
        viewingOrder.value = {
          id: order.id,
          code: order.code,
          time: order.time,
          date: order.date,
          // Dùng toán tử (||) để chống lỗi nếu tên cột DB của bạn khác
          customer: info.TenNguoiNhan || info.TenKH || 'Khách hàng',
          phone: info.SDTNguoiNhan || info.SDT || 'Chưa cập nhật',
          address: info.DiaChiGiao || info.DiaChi || 'Chưa cập nhật',
          carrier: info.DonViVanChuyen || 'Giao Hàng Nhanh',
          paymentStatus: info.TrangThaiThanhToan || 'Chưa thanh toán',
          subtotal: info.TongTien || 0,
          total: info.ThanhTien || 0,
          discount: (info.TongTien || 0) - (info.ThanhTien || 0),
          products: productsList.map(p => ({
            name: p.TenMH || 'Mô hình',
            quantity: p.SoLuong || 1,
            price: p.DonGiaBan || 0,
            image: p.AnhDaiDien || '', 
            isSale: p.LaHangKhuyenMai === 1,
            originalPrice: p.DonGiaGoc || p.DonGiaBan || 0,
            totalPrice: p.ThanhTienItem || (p.SoLuong * p.DonGiaBan) || 0
          }))
        };
        isViewOrderDrawerOpen.value = true;
      } else {
        // NẾU BACKEND LỖI, BẬT CẢNH BÁO LÊN MÀN HÌNH NGAY
        alert("Lỗi từ CSDL: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi gọi chi tiết đơn:", error);
      alert("Lỗi mạng: Không thể kết nối tới Server. Hãy bật F12 xem Console.");
    }
    activeMenuId.value = null;
  };

  // 3. GỌI API CẬP NHẬT TRẠNG THÁI (Duyệt/Đóng gói/Giao)
  const updateOrderStatus = async (orderId) => {
    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch(`http://localhost:3000/api/invoice_admin/update`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({ MaDH: orderId })
      });
      const result = await res.json();
      if(result.success) {
        alert("Đã chuyển trạng thái thành công!");
        fetchOrders(); // Tải lại bảng
      } else alert(result.message);
    } catch (error) { console.error(error); }
    activeMenuId.value = null;
  };

  // 4. GỌI API HỦY ĐƠN HÀNG
  const cancelOrder = async (id) => {
    if(confirm("Bạn có chắc chắn muốn hủy đơn hàng này và hoàn lại tồn kho không?")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/invoice_admin/huy`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
           },
          body: JSON.stringify({ MaDH: id })
        });
        const result = await res.json();
        if(result.success) {
          alert("Hủy đơn thành công!");
          fetchOrders();
        } else alert(result.message);
      } catch(e) { console.error(e); }
    }
    activeMenuId.value = null;
  };
  const handlePrintInvoice = (maDHGoc) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        toastStore.showToast("⚠️ Vui lòng đăng nhập lại!", "error");
        return;
    }

    // Đường dẫn trỏ trực tiếp đến API in hóa đơn vừa tạo ở Backend
    const printUrl = `http://localhost:3000/api/orders/print/${maDHGoc}`;

    // Mở một popup/tab ẩn của trình duyệt để load giao diện HTML hóa đơn
    const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');
    
    if (printWindow) {
        printWindow.focus();
    } else {
        toastStore.showToast("⚠️ Trình duyệt đã chặn cửa sổ Popup. Vui lòng cấp quyền mở Popup cho trang web!", "error");
    }
};
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>