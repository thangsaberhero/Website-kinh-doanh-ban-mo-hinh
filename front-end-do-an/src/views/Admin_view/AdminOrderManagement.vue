<template>
  <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 h-screen overflow-hidden font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>

    <div class="flex-1 flex flex-col h-screen w-full relative">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-32">
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý đơn hàng</h1>
            <p class="text-slate-500 text-sm font-medium">Quản lý và xử lý quy trình vận chuyển cho các đơn hàng Figure.</p>
          </div>
          
          <div class="flex gap-3 w-full xl:w-auto">
            <button @click="exportExcelReport" class="flex-1 xl:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
              <span class="material-symbols-outlined text-[20px]" :class="{'animate-bounce': isExporting}">file_download</span>
              {{ isExporting ? 'Đang tạo file...' : 'Xuất báo cáo' }}
            </button>
            <button @click="isCreateExternalOrderOpen = true" class="flex-1 xl:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm">
                <span class="material-symbols-outlined text-[20px]">add_box</span>
                Tạo đơn ngoài
              </button>
            <button @click="openBulkUpdateModal" class="flex-1 xl:flex-none bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm">
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
                          
                          <button @click="openUpdateModalFromRow(order)" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Cập nhật trạng thái">
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
                              <button @click="cancelOrder(order)" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">cancel</span> Hủy đơn
                              </button>
                              <button @click="returnOrder(order)" class="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px]">assignment_return</span> Hoàn hàng
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
      <div v-if="isDetailModalOpen && selectedOrder" class="print:hidden fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col animate-[fadeIn_0.2s_ease-out]">         
          <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
            <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
              Chi tiết đơn hàng <span class="text-[#ff8f73]">{{ selectedOrder.ThongTinGiaoHang?.MaDonHangHienThi }}</span>
            </h3>
            <button @click="isDetailModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="p-8 space-y-6 flex-1">
            
            <div class="relative">
              
              <button v-if="getCurrentStatusCode() < 3" 
                      @click="openEditInfoModal" 
                      class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-sky-500 hover:border-sky-300 rounded-lg shadow-sm transition-all z-10" 
                      title="Sửa thông tin nhận hàng">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>

              <div class="border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-sm">
                <div class="p-4 bg-slate-50/50">
                  <p class="text-slate-400 font-medium mb-1">Ngày đặt</p>
                  <p class="font-semibold text-slate-800">{{ new Date(selectedOrder.ThongTinGiaoHang?.NgayLapDon).toLocaleString('vi-VN') }}</p>
                </div>
                <div class="p-4 bg-slate-50/50">
                  <p class="text-slate-400 font-medium mb-1">Trạng thái đơn</p>
                  <span :class="`text-xs font-bold px-2.5 py-1 rounded-full border ${getOrderStatusBadge(selectedOrder.TrangThaiHienTai?.TenTrangThai).class}`">
                    {{ getOrderStatusBadge(selectedOrder.TrangThaiHienTai?.TenTrangThai).text }}
                  </span>
                </div>
                <div class="p-4 bg-slate-50/50">
                  <p class="text-slate-400 font-medium mb-1">Khách hàng</p>
                  <p class="font-bold text-slate-800">{{ selectedOrder.ThongTinGiaoHang?.TenNguoiNhan || 'Khách vãng lai' }}</p>
                </div>
                <div class="p-4 bg-slate-50/50">
                  <p class="text-slate-400 font-medium mb-1">Số điện thoại</p>
                  <p class="font-semibold text-slate-800">{{ selectedOrder.ThongTinGiaoHang?.SDTNguoiNhan || 'N/A' }}</p>
                </div>
                <div class="p-4 md:col-span-2">
                  <p class="text-slate-400 font-medium mb-1">Địa chỉ giao hàng</p>
                  <p class="font-medium text-slate-700">{{ selectedOrder.ThongTinGiaoHang?.DiaChiGiao || 'N/A' }}</p>
                </div>
                <div class="p-4 md:col-span-2">
                  <p class="text-slate-400 font-medium mb-1">Ghi chú</p>
                  <p class="text-rose-600 font-medium italic">{{ selectedOrder.ThongTinGiaoHang?.Note || 'Không có ghi chú.' }}</p>
                </div>
              </div>
              
            </div>

            <div v-if="selectedOrder.ThongTinGiaoHang?.MaVanDon" class="flex items-center justify-between bg-sky-50/80 border border-sky-100 rounded-xl p-4 animate-[fadeIn_0.3s_ease-out]">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-sky-200 shadow-sm shrink-0">
                  <span class="material-symbols-outlined text-sky-500 text-2xl">local_shipping</span>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-0.5">Thông tin vận chuyển</p>
                  <p class="text-sm font-bold text-slate-800">{{ selectedOrder.ThongTinGiaoHang?.HangVanChuyen }}</p>
                </div>
              </div>
              
              <div class="text-right">
                <p class="text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-widest">Mã tra cứu vận đơn</p>
                <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-sky-200 shadow-sm">
                  <span class="font-black text-sky-700 tracking-wider text-sm">{{ selectedOrder.ThongTinGiaoHang?.MaVanDon }}</span>
                  <button @click="copyTrackingCode(selectedOrder.ThongTinGiaoHang?.MaVanDon)" class="text-slate-400 hover:text-sky-600 transition-colors flex items-center justify-center" title="Copy mã vận đơn">
                    <span class="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-end mb-2">
                <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400">Lịch sử giao dịch</h4>
                <div class="flex gap-2">
                  <button v-if="!selectedOrder.ThongTinGiaoHang?.TrangThaiThanhToan?.includes('Đã thanh toán') && !selectedOrder.TrangThaiHienTai?.TenTrangThai?.toUpperCase().includes('HỦY') && !selectedOrder.TrangThaiHienTai?.TenTrangThai?.toUpperCase().includes('HOÀN')"
                          @click="confirmPayment(selectedOrder)"
                          class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95">
                    <span class="material-symbols-outlined text-[16px]">price_check</span> Thu thêm tiền
                  </button>
                  <button v-if="selectedOrder.ThongTinGiaoHang?.TrangThaiThanhToan === 'Chờ hoàn tiền'"
                          @click="confirmRefund(selectedOrder.MaDH, selectedOrder.ThongTinGiaoHang?.MaDonHangHienThi)"
                          class="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95">
                    <span class="material-symbols-outlined text-[16px]">currency_exchange</span> Xác nhận hoàn tiền
                  </button>
                </div>
              </div>

              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-left text-sm">
                  <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th class="p-3 text-center">Thời gian</th>
                      <th class="p-3">Phương thức</th>
                      <th class="p-3">Loại giao dịch</th>
                      <th class="p-3 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-if="!selectedOrder.ThanhToan || selectedOrder.ThanhToan.length === 0">
                      <td colspan="4" class="p-6 text-center text-slate-400 italic">Chưa có giao dịch thu/chi nào được ghi nhận.</td>
                    </tr>
                    <tr v-for="(tx, idx) in selectedOrder.ThanhToan" :key="idx" class="text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                      <td class="p-3 text-center text-xs text-slate-500">{{ new Date(tx.NgayThanhToan).toLocaleString('vi-VN') }}</td>
                      <td class="p-3 font-bold" :class="tx.SoTienGiaoDich < 0 ? 'text-purple-600' : 'text-blue-600'">{{ tx.TenPhuongThuc || 'Thu hộ COD' }}</td>
                      <td class="p-3 text-xs">{{ tx.LoaiGiaoDich }}</td>
                      <td class="p-3 text-right font-bold" :class="tx.SoTienGiaoDich < 0 ? 'text-purple-600' : 'text-emerald-600'">
                        {{ tx.SoTienGiaoDich > 0 ? '+' : '' }}{{ formatPrice(tx.SoTienGiaoDich) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Danh sách sản phẩm mô hình</h4>
              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-left text-sm">
                  <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th class="p-4 text-center">Sản phẩm</th>
                      <th class="p-4">Phân loại</th>
                      <th class="p-4 text-right">Đơn giá</th>
                      <th class="p-4 text-center">SL</th>
                      <th class="p-4 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="(item, index) in selectedOrder.DanhSachHang" :key="item.MaPhanLoai || index" class="text-slate-700 font-medium">
                      <td class="p-4">
                        <div class="flex items-center gap-4">
                          <img v-if="item.AnhDaiDien" 
                              :src="item.AnhDaiDien.startsWith('http') ? item.AnhDaiDien : `${API_BASE_URL}/Images_product/${item.AnhDaiDien}`" 
                              class="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0 bg-slate-50" 
                              alt="Thumbnail" />
                          <div v-else class="w-12 h-12 bg-slate-100 rounded-xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center text-slate-400">
                            <span class="material-symbols-outlined text-xl">image_not_supported</span>
                          </div>
                          <div class="flex flex-col">
                            <p class="font-bold text-slate-900 leading-snug">{{ item.TenMH }}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Mã MH: #{{ item.MaMoHinh }}</p>
                            <span v-if="item.LaHangKhuyenMai === 1" class="text-[9px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 mt-1 w-fit">FLASH SALE</span>
                          </div>
                        </div>
                      </td>
                      <td class="p-4"><span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{{ item.ChiTietPhanLoai || 'Mặc định' }}</span></td>
                      <td class="p-4 text-right">
                        <p :class="item.LaHangKhuyenMai === 1 ? 'line-through text-slate-400 text-xs' : ''">{{ formatPrice(item.DonGiaGoc) }}</p>
                        <p v-if="item.LaHangKhuyenMai === 1" class="text-rose-500">{{ formatPrice(item.DonGiaBan) }}</p>
                      </td>
                      <td class="p-4 text-center font-bold">{{ item.SoLuong }}</td>
                      <td class="p-4 text-right text-rose-500 font-bold">{{ formatPrice(item.DonGiaBan * item.SoLuong) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex justify-end">
              <div class="w-80 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
                <div class="flex justify-between text-slate-500">
                  <span>Tổng tiền hàng hóa:</span>
                  <span class="font-semibold text-slate-800">{{ formatPrice(selectedOrder.ThongTinGiaoHang?.TongTien) }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                  <span>Giảm giá/Voucher:</span>
                  <span class="font-semibold text-emerald-600">-{{ formatPrice((selectedOrder.ThongTinGiaoHang?.TongTien || 0) - (selectedOrder.ThongTinGiaoHang?.ThanhTien || 0)) }}</span>
                </div>
                
                <div class="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span class="font-bold text-slate-700">Tổng giá trị đơn:</span>
                  <span class="font-bold text-slate-900">{{ formatPrice(selectedOrder.ThongTinGiaoHang?.ThanhTien) }}</span>
                </div>
                <div class="flex justify-between items-baseline">
                  <span class="font-bold text-slate-700">Đã thanh toán:</span>
                  <span class="font-bold text-emerald-600">
                    {{ formatPrice(selectedOrder.ThanhToan?.reduce((sum, tx) => sum + Number(tx.SoTienGiaoDich), 0) || 0) }}
                  </span>
                </div>
                
                <div class="border-t border-slate-200 pt-3 flex justify-between items-baseline bg-rose-50 -mx-5 px-5 pb-5 -mb-5 rounded-b-xl">
                  <span class="font-bold text-rose-900 text-base mt-2">CÒN PHẢI THU:</span>
                  <span class="font-headline font-black text-rose-600 text-xl">
                    {{ formatPrice(Math.max(0, (selectedOrder.ThongTinGiaoHang?.ThanhTien || 0) - (selectedOrder.ThanhToan?.reduce((sum, tx) => sum + Number(tx.SoTienGiaoDich), 0) || 0))) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
            <button @click="cancelOrder(selectedOrder)" class="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold rounded-lg transition-all flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">cancel</span> Hủy đơn này
            </button>
            <div class="flex gap-2">
              <button @click="handlePrintInvoice(selectedOrder.MaDH)" class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-bold rounded-lg transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px]">print</span> In hóa đơn
              </button>
              <button @click="updateStatusValue = getCurrentStatusCode(); isUpdateModalOpen = true" class="px-5 py-2 bg-[#ff8f73] hover:bg-[#ff7352] text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px]">edit_document</span> Đổi trạng thái
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isEditInfoModalOpen" class="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border-t-4 border-sky-400">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500">edit_square</span> Cập nhật thông tin giao hàng
          </h3>
          <button @click="isEditInfoModalOpen = false" class="text-slate-400 hover:text-rose-500 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tên người nhận <span class="text-rose-500">*</span></label>
            <input v-model="editInfoForm.hoten" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Số điện thoại <span class="text-rose-500">*</span></label>
            <input v-model="editInfoForm.sdt" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Địa chỉ giao hàng <span class="text-rose-500">*</span></label>
            <textarea v-model="editInfoForm.diachi" rows="2" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white resize-none"></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button @click="isEditInfoModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
          <button @click="submitEditInfo" class="px-5 py-2.5 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">save</span> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>

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
          <span class="material-symbols-outlined text-[16px]">price_check</span> Tình trạng thanh toán
        </label>
        <div class="flex flex-col gap-3">
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="all" v-model="advancedFilter.paymentStatus" class="w-4 h-4 text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300">
            <span class="text-sm font-medium text-slate-700">Tất cả</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="Chưa thanh toán" v-model="advancedFilter.paymentStatus" class="w-4 h-4 text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300">
            <span class="text-sm font-medium text-slate-700">Chưa thanh toán (Chờ thu tiền)</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="Đã thanh toán" v-model="advancedFilter.paymentStatus" class="w-4 h-4 text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300">
            <span class="text-sm font-medium text-slate-700">Đã thanh toán thành công</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="radio" value="Chờ hoàn tiền" v-model="advancedFilter.paymentStatus" class="w-4 h-4 text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300">
            <span class="text-sm font-medium text-rose-600 font-bold">Cần hoàn tiền (Đơn hủy/hoàn)</span>
          </label>
        </div>
      </div>

      <div class="space-y-4">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">payments</span> Giá trị đơn hàng (VNĐ)
        </label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] text-slate-500 mb-1">Từ mức giá</label>
            <input type="number" v-model="advancedFilter.minPrice" placeholder="VD: 500000" min="0" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none">
          </div>
          <div>
            <label class="block text-[10px] text-slate-500 mb-1">Đến mức giá</label>
            <input type="number" v-model="advancedFilter.maxPrice" placeholder="VD: 5000000" min="0" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none">
          </div>
        </div>
      </div>
    </div>

    <div class="p-6 border-t border-slate-100 bg-white flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button @click="resetAdvancedFilter" class="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Đặt lại</button>
      <button @click="applyAdvancedFilter" class="flex-[2] py-3 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-all text-sm">Áp dụng</button>
    </div>
  </div>
  
  <div v-if="isCreateExternalOrderOpen" class="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-out]">
        
        <div class="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-500">add_shopping_cart</span>
            Tạo đơn hàng thủ công tại quầy
          </h3>
          <button @click="isCreateExternalOrderOpen = false" class="text-slate-400 hover:text-rose-500 p-1.5 rounded-full hover:bg-slate-200 transition-all flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div class="lg:col-span-5 space-y-5">
              
              <div class="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-4">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">person</span> Thông tin Khách hàng
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-600 mb-1.5">Tên khách hàng <span class="text-rose-500 font-bold">*</span></label>
                    <input v-model="externalOrderForm.TenNguoiNhan" type="text" placeholder="VD: Phùng Thắng" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-600 mb-1.5">Số điện thoại <span class="text-rose-500 font-bold">*</span></label>
                    <input v-model="externalOrderForm.SDTNguoiNhan" type="text" placeholder="VD: 0912345678" class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    Địa chỉ giao hàng
                    <span v-if="isCartContainsOrder" class="text-rose-500 font-bold">*</span>
                    <span v-else class="text-slate-400 font-normal text-[10px]">(Tùy chọn với Hàng có sẵn)</span>
                  </label>
                  <input v-model="externalOrderForm.DiaChiGiao" type="text" placeholder="Nhập địa chỉ chi tiết để giao hàng..." class="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-1">
                  <span class="material-symbols-outlined text-[16px]">payments</span> Thanh toán & Đặt cọc
                </h4>
                <div class="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  
                  <label class="flex items-center gap-2 cursor-pointer w-fit">
                    <input type="checkbox" v-model="externalOrderForm.ThuTienNgay" class="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500">
                    <span class="text-sm font-bold text-slate-700">Khách thanh toán / Đặt cọc ngay</span>
                  </label>

                  <div v-if="externalOrderForm.ThuTienNgay" class="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out] pt-3 border-t border-slate-200/60">
                    
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label :class="externalOrderForm.PhuongThucTT === 5 ? 'bg-emerald-100 text-emerald-700 border-emerald-500' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'" class="border rounded-lg p-2 cursor-pointer transition-all flex flex-col items-center gap-1 text-center">
                        <input type="radio" v-model="externalOrderForm.PhuongThucTT" :value="5" class="hidden">
                        <span class="text-[10px] font-bold">Tiền mặt</span>
                      </label>
                      <label :class="externalOrderForm.PhuongThucTT === 4 ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'" class="border rounded-lg p-2 cursor-pointer transition-all flex flex-col items-center gap-1 text-center">
                        <input type="radio" v-model="externalOrderForm.PhuongThucTT" :value="4" class="hidden">
                        <span class="text-[10px] font-bold">Chuyển khoản</span>
                      </label>
                      <label :class="externalOrderForm.PhuongThucTT === 1 ? 'bg-pink-100 text-pink-700 border-pink-500' : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'" class="border rounded-lg p-2 cursor-pointer transition-all flex flex-col items-center gap-1 text-center">
                        <input type="radio" v-model="externalOrderForm.PhuongThucTT" :value="1" class="hidden">
                        <span class="text-[10px] font-bold">Momo</span>
                      </label>
                      <label :class="externalOrderForm.PhuongThucTT === 2 ? 'bg-cyan-100 text-cyan-700 border-cyan-500' : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300'" class="border rounded-lg p-2 cursor-pointer transition-all flex flex-col items-center gap-1 text-center">
                        <input type="radio" v-model="externalOrderForm.PhuongThucTT" :value="2" class="hidden">
                        <span class="text-[10px] font-bold">Zalo Pay</span>
                      </label>
                    </div>

                    <div>
                      <div class="flex justify-between items-end mb-1.5">
                        <label class="block text-xs font-bold text-slate-600">Số tiền khách đưa (VNĐ) <span class="text-rose-500">*</span></label>
                        <div class="flex gap-2">
                          <span v-if="externalOrderForm.TongCocToiThieu > 0" class="text-[10px] font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 transition-colors px-1.5 py-0.5 rounded cursor-pointer" @click="externalOrderForm.SoTienDaTra = externalOrderForm.TongCocToiThieu">Gợi ý cọc tối thiểu</span>
                          <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 transition-colors px-1.5 py-0.5 rounded cursor-pointer" @click="externalOrderForm.SoTienDaTra = externalOrderForm.ThanhTien">Thu Full</span>
                        </div>
                      </div>
                      <input v-model="externalOrderForm.SoTienDaTra" type="number" min="0" placeholder="Nhập số tiền..." class="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white font-bold text-slate-800">
                      
                      <p v-if="externalOrderForm.TongCocToiThieu > 0 && externalOrderForm.SoTienDaTra > 0 && externalOrderForm.SoTienDaTra < externalOrderForm.TongCocToiThieu" class="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
                        <span class="material-symbols-outlined text-[14px]">warning</span>
                        Chưa đạt mức cọc tối thiểu ({{ externalOrderForm.TongCocToiThieu.toLocaleString('vi-VN') }} ₫)!
                      </p>
                      <p v-else-if="externalOrderForm.SoTienDaTra > 0 && externalOrderForm.SoTienDaTra < externalOrderForm.ThanhTien" class="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
                        <span class="material-symbols-outlined text-[14px]">info</span>
                        Hệ thống sẽ ghi nhận đây là khoản ĐẶT CỌC.
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              <div v-if="availableVouchers.length > 0" class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label class="block text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-emerald-500">local_activity</span> 
                  Áp dụng Mã giảm giá công khai (Tùy chọn)
                </label>
                <select v-model="externalOrderForm.MaGG" @change="recalculateOrderTotal" class="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white font-medium text-slate-700 cursor-pointer">
                  <option :value="null">-- Không áp dụng mã giảm giá --</option>
                  <option v-for="v in availableVouchers" :key="v.MaGG" :value="v.MaGG" :disabled="externalOrderForm.TongTien < v.MucGiaToiThieu">
                    {{ v.MaVoucher }} - Giảm {{ v.LoaiGiamGia === 'TienMat' ? v.ChietKhau.toLocaleString('vi-VN') + 'đ' : v.ChietKhau + '%' }} 
                    (Đơn từ {{ v.MucGiaToiThieu.toLocaleString('vi-VN') }}đ)
                  </option>
                </select>
              </div>

            </div>

            <div class="lg:col-span-7 space-y-5 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
              
              <div class="space-y-3">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">search_insights</span> Tìm sản phẩm vào đơn
                </h4>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search_insights</span>
                  <input v-model="searchProductQuery" @input="debounceSearchProduct" type="text" placeholder="Tìm tên mô hình, nhân vật hoặc series..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-700">
                  <span v-if="isSearchingProducts" class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin">progress_activity</span>
                </div>

                <div v-if="searchResults.length > 0" class="max-h-44 overflow-y-auto custom-scrollbar bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-2">
                  <div v-for="prod in searchResults" :key="prod.MaMoHinh" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div class="flex gap-3 items-start">
                      <div class="w-10 h-10 bg-white rounded border border-slate-200 p-1 shrink-0">
                        <img :src="prod.AnhDaiDien ? (prod.AnhDaiDien.startsWith('http') ? prod.AnhDaiDien : `${API_BASE_URL}/Images_product/${prod.AnhDaiDien}`) : ''" class="w-full h-full object-contain" />
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1.5">
                            <p class="text-xs font-bold text-slate-900 line-clamp-1">{{ prod.TenMH }}</p>
                            <span class="text-[8px] px-1.5 py-0.5 rounded border uppercase font-black tracking-widest whitespace-nowrap"
                                  :class="prod.LoaiHinhBan && prod.LoaiHinhBan.toLowerCase().includes('order') ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'">
                                {{ prod.LoaiHinhBan || 'Có sẵn' }}
                            </span>
                        </div>
                        <p v-if="prod.TienCocToiThieu > 0" class="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 w-fit mb-1.5">
                            Yêu cầu cọc: {{ formatPrice(prod.TienCocToiThieu) }}
                        </p>
                        <div class="space-y-1">
                          <div v-for="variant in prod.PhanLoai" :key="variant.MaPhanLoai" class="flex justify-between items-center bg-white px-2.5 py-1 rounded border border-slate-200/60 text-xs">
                            <div>
                              <span class="font-semibold text-slate-700">{{ variant.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : variant.ChiTietPhanLoai }}</span>
                              <span class="text-[10px] text-slate-400 ml-2">Kho: {{ variant.TonKho }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-[#ff3d00]">{{ variant.DonGia?.toLocaleString('vi-VN') }} ₫</span>
                              <button @click="addVariantToOrder(prod, variant)" class="w-5 h-5 flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded transition-colors">
                                <span class="material-symbols-outlined text-[14px]">add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else-if="searchProductQuery.length > 0 && !isSearchingProducts" class="text-center py-3 text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Không tìm thấy mô hình nào phù hợp.
                </div>
              </div>

              <div v-if="externalOrderForm.DanhSachSanPham.length > 0" class="space-y-3 pt-2">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Sản phẩm đã chọn mua</h4>
                <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  <div v-for="(item, index) in externalOrderForm.DanhSachSanPham" :key="index" class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div class="flex-1">
                      <p class="text-xs font-bold text-slate-800 line-clamp-1" :title="item.TenMH">{{ item.TenMH }}</p>
                      <p class="text-[10px] font-semibold text-slate-500 mt-0.5">Phân loại: {{ item.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : item.ChiTietPhanLoai }}</p>
                      <p class="text-xs font-bold text-[#ff3d00] mt-0.5">{{ item.DonGia?.toLocaleString('vi-VN') }} ₫</p>
                      <p v-if="item.TienCocToiThieu > 0" class="text-[10px] font-bold text-amber-600 mt-0.5 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">monetization_on</span>
                        Mức cọc: {{ formatPrice(item.TienCocToiThieu * item.SoLuong) }}
                      </p>
                    </div>
                    
                    <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0">
                      <button @click="updateItemQuantity(index, -1)" class="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"><span class="material-symbols-outlined text-[12px]">remove</span></button>
                      <span class="text-xs font-bold w-5 text-center text-slate-700">{{ item.SoLuong }}</span>
                      <button @click="updateItemQuantity(index, 1)" :disabled="item.SoLuong >= item.TonKho" class="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors disabled:opacity-30"><span class="material-symbols-outlined text-[12px]">add</span></button>
                    </div>
                    
                    <div class="text-right shrink-0 w-24">
                      <p class="text-xs font-bold text-slate-900">{{ (item.DonGia * item.SoLuong).toLocaleString('vi-VN') }} ₫</p>
                    </div>

                    <button @click="removeVariantFromOrder(index)" class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-2 p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl mt-2">
                  <div class="flex justify-between items-center text-xs">
                      <span class="font-bold text-slate-600">Tổng tiền hàng gốc:</span>
                      <span class="font-bold text-slate-900">{{ externalOrderForm.TongTien?.toLocaleString('vi-VN') }} ₫</span>
                  </div>
                  <div v-if="externalOrderForm.GiamGiaVoucher > 0" class="flex justify-between items-center text-xs">
                      <span class="font-bold text-emerald-600">Khấu trừ giảm giá Voucher:</span>
                      <span class="font-bold text-emerald-600">-{{ externalOrderForm.GiamGiaVoucher?.toLocaleString('vi-VN') }} ₫</span>
                  </div>
                  <div class="border-t border-emerald-200/60 pt-2.5 mt-1 flex justify-between items-center">
                      <span class="text-xs font-bold text-emerald-800">Thành tiền cần thu ({{ externalOrderForm.DanhSachSanPham.reduce((sum, i) => sum + i.SoLuong, 0) }} món)</span>
                      <span class="text-lg font-brand font-black text-emerald-600">{{ externalOrderForm.ThanhTien?.toLocaleString('vi-VN') }} ₫</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button @click="isCreateExternalOrderOpen = false" class="px-5 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors uppercase tracking-wider">Hủy bỏ</button>
          <button @click="submitExternalOrder" class="px-6 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 rounded-xl transition-all uppercase tracking-wider">Lưu đơn hàng</button>
        </div>

      </div>
    </div>

    <div v-if="isCancelModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-rose-500">delete_forever</span>
            Xác nhận hủy đơn hàng
          </h3>
          <button @click="isCancelModalOpen = false" class="text-slate-400 hover:text-rose-500 p-1.5 rounded-full hover:bg-slate-200 transition-all flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-sm text-slate-600 font-medium">
            Bạn có chắc chắn muốn hủy đơn hàng <span class="font-bold text-slate-900">{{ orderCodeToCancel }}</span> không?<br>
            <span class="text-rose-500 font-bold text-xs">* Tồn kho và khuyến mãi sẽ được hoàn lại tự động.</span>
          </p>
          
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Lý do hủy đơn <span class="text-rose-500">*</span></label>
            <textarea 
              v-model="cancelReason" 
              rows="3" 
              placeholder="VD: Khách yêu cầu hủy, Hết hàng thực tế, v.v..." 
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white resize-none"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button @click="isCancelModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Đóng</button>
          <button @click="executeCancelOrder" class="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">delete_forever</span> Xác nhận hủy
          </button>
        </div>
      </div>
    </div>

    <div v-if="isUpdateModalOpen && selectedOrder" class="print:hidden fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border-t-4 border-[#ff8f73] animate-[fadeIn_0.2s_ease-out]">
        <h3 class="text-lg font-bold text-slate-900 mb-2">Cập nhật tiến trình đơn hàng</h3>
        <p class="text-xs text-slate-400 mb-4 font-medium">Thay đổi trạng thái cho mã đơn: {{ selectedOrder.ThongTinGiaoHang?.MaDonHangHienThi }}</p>
        
        <div class="mb-6">
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Chọn trạng thái mới</label>
          <select v-model="updateStatusValue" class="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm focus:border-[#ff8f73] font-semibold text-slate-700 focus:ring-1 focus:ring-[#ff8f73] outline-none cursor-pointer">
            <option value="1" :disabled="getCurrentStatusCode() >= 1">CHỜ DUYỆT (Hệ thống tiếp nhận)</option>
            <option value="2" :disabled="getCurrentStatusCode() >= 2">ĐANG ĐÓNG GÓI (Chuẩn bị hàng trong kho)</option>
            <option value="3" :disabled="getCurrentStatusCode() >= 3">ĐANG VẬN CHUYỂN (Giao cho shipper)</option>
            <option value="4" :disabled="getCurrentStatusCode() >= 4">ĐÃ GIAO (Khách ký nhận thành công)</option>
          </select>
        </div>

        <div v-if="updateStatusValue == 3" class="mb-6 space-y-3 bg-sky-50 p-4 rounded-xl border border-sky-100 animate-[fadeIn_0.2s_ease-out]">
            <p class="text-[11px] font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">local_shipping</span> Thông tin vận chuyển</p>
            
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">Đơn vị vận chuyển <span class="text-rose-500">*</span></label>
                    <select v-model="updateCarrier" class="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:border-sky-500 outline-none bg-white font-medium text-slate-700">
                        <option value="Giao Hàng Nhanh">Giao Hàng Nhanh (GHN)</option>
                        <option value="SPX">SPX</option>
                        <option value="Giao Hàng Tiết Kiệm">Giao Hàng Tiết Kiệm (GHTK)</option>
                        <option value="Viettel Post">Viettel Post</option>
                        <option value="J&T Express">J&T Express</option>
                        <option value="Ninja Van">Ninja Van</option>
                        <option value="Grab / AhaMove">Giao hỏa tốc (Grab/Aha)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">Mã vận đơn <span class="text-rose-500">*</span></label>
                    <input v-model="updateTrackingCode" type="text" placeholder="Nhập mã bill..." class="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:border-sky-500 outline-none bg-white font-bold text-slate-800 uppercase">
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button @click="isUpdateModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Quay lại</button>
          <button @click="submitUpdateStatus" class="px-5 py-2 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff7352] rounded-lg shadow-sm">Xác nhận đổi</button>
        </div>
      </div>
    </div>

    <div v-if="isReturnModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-purple-100 flex justify-between items-center bg-purple-50 shrink-0">
          <h3 class="text-lg font-bold text-purple-600 flex items-center gap-2">
            <span class="material-symbols-outlined">assignment_return</span>
            Xác nhận Hoàn trả đơn
          </h3>
          <button @click="isReturnModalOpen = false" class="text-slate-400 hover:text-purple-600 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-sm text-slate-600 font-medium">
            Xác nhận hàng đã về kho và hoàn tiền cho đơn <span class="font-bold text-slate-900">{{ orderCodeToReturn }}</span>?<br>
            <span class="text-purple-500 font-bold text-xs">* Tồn kho sẽ được cộng lại hệ thống ngay lập tức.</span>
          </p>
          
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Lý do hoàn hàng <span class="text-purple-500">*</span></label>
            <textarea 
              v-model="returnReason" 
              rows="3" 
              placeholder="VD: Khách boom hàng, Sản phẩm lỗi do NSX, v.v..." 
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium text-slate-700 bg-slate-50 focus:bg-white resize-none"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button @click="isReturnModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Đóng</button>
          <button @click="executeReturnOrder" class="px-5 py-2.5 text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">inventory_2</span> Nhập lại kho
          </button>
        </div>
      </div>
    </div>

    <div v-if="isBulkUpdateModalOpen" class="print:hidden fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border-t-4 border-[#ff8f73] animate-[fadeIn_0.2s_ease-out]">
        <h3 class="text-lg font-bold text-slate-900 mb-2">Cập nhật trạng thái hàng loạt</h3>
        <p class="text-sm text-slate-600 mb-4 font-medium">Bạn đang chọn <span class="font-bold text-rose-500">{{ selectedOrders.length }}</span> đơn hàng để chuyển trạng thái.</p>
        
        <div class="mb-6">
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Chọn trạng thái đích chung</label>
          <select v-model="bulkUpdateStatusValue" class="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm focus:border-[#ff8f73] font-semibold text-slate-700 focus:ring-1 focus:ring-[#ff8f73] outline-none cursor-pointer">
            <option value="2">ĐANG ĐÓNG GÓI (Chuẩn bị hàng trong kho)</option>
            <option value="3">ĐANG VẬN CHUYỂN (Giao cho shipper)</option>
            <option value="4">ĐÃ GIAO (Khách ký nhận thành công)</option>
          </select>
          <p class="text-[10px] text-slate-400 mt-2 italic">* Lưu ý: Các đơn hàng không hợp lệ (như đã hủy, hoàn, hoặc đã vượt qua trạng thái này) sẽ bị hệ thống tự động bỏ qua.</p>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button @click="isBulkUpdateModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Hủy bỏ</button>
          <button @click="submitBulkUpdateStatus" :disabled="isBulkUpdating" class="px-5 py-2 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff7352] rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
            <span v-if="isBulkUpdating" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            {{ isBulkUpdating ? 'Đang xử lý...' : 'Xác nhận đổi' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isPaymentConfirmModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-emerald-100 flex justify-between items-center bg-emerald-50 shrink-0">
          <h3 class="text-lg font-bold text-emerald-600 flex items-center gap-2">
            <span class="material-symbols-outlined">price_check</span>
            Xác nhận thanh toán thủ công
          </h3>
          <button @click="isPaymentConfirmModalOpen = false" class="text-slate-400 hover:text-emerald-600 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div class="flex justify-between mb-2 text-sm text-slate-600">
              <span>Tổng giá trị đơn hàng:</span>
              <span class="font-bold text-slate-900">{{ formatPrice(orderToPay?.ThongTinGiaoHang?.ThanhTien) }}</span>
            </div>
            <div class="flex justify-between mb-2 text-sm text-slate-600">
              <span>Đã thanh toán (Cọc):</span>
              <span class="font-bold text-slate-900">{{ formatPrice(alreadyPaidAmount) }}</span>
            </div>
            
            <div class="pt-3 border-t border-emerald-200/50 mt-2">
              <div class="flex justify-between items-end mb-2">
                <span class="font-bold text-emerald-800">Số tiền khách nộp lần này:</span>
                
                <div class="flex gap-2">
                  <button v-if="suggestedDepositAmount > 0" 
                          @click="amountToCollect = suggestedDepositAmount" 
                          class="text-[10px] font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors shadow-sm">
                    Gợi ý cọc ({{ formatPrice(suggestedDepositAmount) }})
                  </button>
                  
                  <button @click="amountToCollect = (orderToPay?.ThongTinGiaoHang?.ThanhTien || 0) - alreadyPaidAmount" 
                          class="text-[10px] font-bold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded transition-colors shadow-sm">
                    Thu Full (Còn lại)
                  </button>
                </div>

              </div>
              <div class="relative">
                <input v-model="amountToCollect" type="number" min="0" :max="(orderToPay?.ThongTinGiaoHang?.ThanhTien || 0) - alreadyPaidAmount" class="w-full border border-emerald-200 rounded-lg p-2.5 text-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white font-black text-emerald-600 text-right pr-8 shadow-inner">
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₫</span>
              </div>
              
              <p v-if="amountToCollect < ((orderToPay?.ThongTinGiaoHang?.ThanhTien || 0) - alreadyPaidAmount)" class="text-[11px] text-amber-600 font-bold mt-2 flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
                <span class="material-symbols-outlined text-[14px]">info</span> Khách đóng thêm cọc. Đơn vẫn giữ trạng thái "Đã đặt cọc".
              </p>
              <p v-else-if="amountToCollect > 0" class="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
                <span class="material-symbols-outlined text-[14px]">check_circle</span> Thu đủ tiền. Đơn sẽ chuyển thành "Đã thanh toán".
              </p>
            </div>
          </div>

          <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Hình thức thu tiền nốt</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <label :class="collectionMethod === 5 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'" class="border rounded-xl p-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center">
                  <input type="radio" v-model="collectionMethod" :value="5" class="hidden">
                  <span class="material-symbols-outlined text-[20px]">payments</span>
                  <span class="text-[10px] font-bold">Tiền mặt</span>
                </label>
                <label :class="collectionMethod === 4 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'" class="border rounded-xl p-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center">
                  <input type="radio" v-model="collectionMethod" :value="4" class="hidden">
                  <span class="material-symbols-outlined text-[20px]">account_balance</span>
                  <span class="text-[10px] font-bold">Chuyển khoản</span>
                </label>
                <label :class="collectionMethod === 1 ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-200 bg-white text-slate-600 hover:border-pink-300'" class="border rounded-xl p-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center">
                  <input type="radio" v-model="collectionMethod" :value="1" class="hidden">
                  <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  <span class="text-[10px] font-bold">Ví Momo</span>
                </label>
                <label :class="collectionMethod === 2 ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300'" class="border rounded-xl p-2.5 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center">
                  <input type="radio" v-model="collectionMethod" :value="2" class="hidden">
                  <span class="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                  <span class="text-[10px] font-bold">Zalo Pay</span>
                </label>

                <label v-if="alreadyPaidAmount > 0" :class="collectionMethod === 3 ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'" class="border rounded-xl p-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 text-center">
                  <input type="radio" v-model="collectionMethod" :value="3" class="hidden">
                  <span class="material-symbols-outlined text-[20px]">local_shipping</span>
                  <span class="text-[10px] font-bold">Thu hộ COD</span>
                </label>
              </div>
            </div>

          <p class="text-[11px] text-slate-500 italic leading-relaxed">* Hệ thống sẽ ghi nhận giao dịch cho mã đơn <span class="font-bold text-slate-700">{{ orderCodeToPay }}</span> và cập nhật trạng thái đơn hàng thành "Đã thanh toán".</p>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button @click="isPaymentConfirmModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Đóng</button>
          <button @click="executeConfirmPayment" class="px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">check_circle</span> Xác nhận đã thu
          </button>
        </div>
      </div>
    </div>

    <div v-if="isRefundConfirmModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-purple-100 flex justify-between items-center bg-purple-50 shrink-0">
          <h3 class="text-lg font-bold text-purple-600 flex items-center gap-2">
            <span class="material-symbols-outlined">currency_exchange</span> Xác nhận hoàn tiền
          </h3>
          <button @click="isRefundConfirmModalOpen = false" class="text-slate-400 hover:text-purple-600 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-sm text-slate-600 font-medium leading-relaxed">
            Bạn xác nhận Kế toán đã chuyển khoản trả lại tiền cho đơn hàng <span class="font-bold text-slate-900">{{ orderCodeToRefund }}</span>?<br>
            <span class="text-purple-500 font-bold text-xs">* Trạng thái sẽ cập nhật thành "Đã hoàn tiền" và ghi nhận giao dịch âm.</span>
          </p>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button @click="isRefundConfirmModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Đóng</button>
          <button @click="executeConfirmRefund" class="px-5 py-2.5 text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">check_circle</span> Xác nhận đã CK
          </button>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { onMounted } from 'vue';
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';

  const route = useRoute();
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const orders = ref([]);
  const isLoading = ref(true);
  
  // --- Quản lý Tìm kiếm & Lọc thời gian ---
  const searchQuery = ref('');
  const filterDate = ref({ from: '', to: '' });
  const isFilterPanelOpen = ref(false); 
  const isSortMenuOpen = ref(false);    

  const totalOrders = ref(0); 
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalPages = ref(1); 
  const summary = ref({});   

  const startItem = computed(() => totalOrders.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
  const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalOrders.value));

  const isExporting = ref(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const exportExcelReport = async () => {
    isExporting.value = true;
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/api/invoice_admin/export-excel`;
      const params = new URLSearchParams();
      if (filterDate.value.from) params.append('NgayBatDau', filterDate.value.from);
      if (filterDate.value.to) params.append('NgayKetThuc', filterDate.value.to);
      if (searchQuery.value) params.append('timkiem', searchQuery.value);

      if (advancedFilter.value.paymentStatus !== 'all') {
        params.append('trangthaitt', advancedFilter.value.paymentStatus);
      }
      if (advancedFilter.value.minPrice) {
        params.append('minPrice', advancedFilter.value.minPrice);
      }
      if (advancedFilter.value.maxPrice) {
        params.append('maxPrice', advancedFilter.value.maxPrice);
      }

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải file từ Server");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Bao_Cao_Don_Hang_FigureCollect_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toastStore.showToast("Xuất báo cáo Excel thành công!", "success");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toastStore.showToast("Không thể xuất báo cáo lúc này!", "error");
    } finally {
      isExporting.value = false;
    }
  };

  const isReturnModalOpen = ref(false);
  const returnReason = ref('');
  const orderToReturn = ref(null);

  const orderCodeToReturn = ref('');
  const returnOrder = (order) => {
    orderToReturn.value = order.id;
    orderCodeToReturn.value = order.code;
    returnReason.value = ''; 
    isReturnModalOpen.value = true;
    activeMenuId.value = null; 
  };

  const executeReturnOrder = async () => {
    if (!returnReason.value.trim()) {
      toastStore.showToast("Vui lòng nhập lý do hoàn hàng!", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/invoice_admin/hoan_hang`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({ 
          MaDH: orderToReturn.value, 
          LyDoHoan: returnReason.value.trim() 
        })
      });
      
      const result = await res.json();
      
      if(result.success) {
        toastStore.showToast("Xác nhận hoàn hàng thành công!", "success");
        isReturnModalOpen.value = false; 
        fetchOrders(); 
      } else {
        toastStore.showToast(result.message, "error");
      }
    } catch(e) { 
      console.error(e);
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const isBulkUpdateModalOpen = ref(false);
  const bulkUpdateStatusValue = ref('2');
  const isBulkUpdating = ref(false);

  const openBulkUpdateModal = () => {
    if (selectedOrders.value.length === 0) {
      toastStore.showToast("Vui lòng tick chọn ít nhất 1 đơn hàng để xử lý!", "error");
      return;
    }
    bulkUpdateStatusValue.value = '2';
    isBulkUpdateModalOpen.value = true;
  };

  const submitBulkUpdateStatus = async () => {
    isBulkUpdating.value = true;
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;

    const updatePromises = selectedOrders.value.map(orderId => {
      return fetch(`${API_BASE_URL}/api/invoice_admin/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          MaDH: orderId,
          TrangThai: bulkUpdateStatusValue.value
        })
      }).then(res => res.json());
    });

    try {
      const results = await Promise.allSettled(updatePromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failCount++;
        }
      });

      if (successCount > 0) {
        toastStore.showToast(`Tuyệt vời! Đã cập nhật thành công ${successCount} đơn hàng.`, "success");
      }
      if (failCount > 0) {
        toastStore.showToast(`Cảnh báo: Có ${failCount} đơn hàng bị bỏ qua do trạng thái không hợp lệ.`, "error");
      }

      isBulkUpdateModalOpen.value = false;
      selectedOrders.value = []; 
      fetchOrders(); 

    } 
    catch (error) {
      console.error("Lỗi khi xử lý hàng loạt:", error);
      toastStore.showToast("Lỗi hệ thống khi cập nhật hàng loạt!", "error");
    } 
    finally {
      isBulkUpdating.value = false;
    }
  };

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      fetchOrders();
    }
  };
    
  const advancedFilter = ref({
    paymentStatus: 'all',
    minPrice: null,
    maxPrice: null
  });

  const applyAdvancedFilter = () => {
    currentPage.value = 1; 
    fetchOrders(); 
    isFilterPanelOpen.value = false;
  };

  const resetAdvancedFilter = () => {
    advancedFilter.value = {
      paymentStatus: 'all',
      minPrice: null,
      maxPrice: null
    };
    currentPage.value = 1;
    fetchOrders();
  };

  const sortBy = ref('date_desc');

  const setSort = (value) => {
    sortBy.value = value;
    isSortMenuOpen.value = false; 
  };
  
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
    if (s.includes('CHỜ DUYỆT')) return { class: 'bg-amber-50 text-amber-600 border-amber-100', text: 'CHỜ DUYỆT' };
    if (s.includes('ĐÓNG GÓI')) return { class: 'bg-indigo-50 text-indigo-600 border-indigo-100', text: 'ĐÓNG GÓI' };
    if (s.includes('VẬN CHUYỂN') || s.includes('ĐANG GIAO')) return { class: 'bg-sky-50 text-sky-600 border-sky-100', text: 'ĐANG GIAO' };
    if (s.includes('HỦY')) return { class: 'bg-rose-50 text-rose-600 border-rose-100', text: 'ĐÃ HỦY' };
    if (s.includes('HOÀN')) return { class: 'bg-purple-50 text-purple-600 border-purple-100', text: 'ĐÃ HOÀN HÀNG' };
    return { class: 'bg-slate-50 text-slate-600 border-slate-100', text: status || 'CHỜ XỬ LÝ' };
  };
  
  const selectedOrders = ref([]); 
  
  const selectAll = computed({
    get: () => orders.value.length > 0 && selectedOrders.value.length === orders.value.length,
    set: (value) => {
      if (value) {
        selectedOrders.value = orders.value.map(o => o.id); 
      } else {
        selectedOrders.value = []; 
      }
    }
  });
  
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
  
  const activeMenuId = ref(null);

  const toggleOrderMenu = (id) => {
    activeMenuId.value = activeMenuId.value === id ? null : id;
  };

  const isDetailModalOpen = ref(false);
  const selectedOrder = ref(null);

  const formatPrice = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  
  const fetchOrders = async () => {
    isLoading.value = true;
    try {
      let statusParam = '';
      if (activeTab.value === 'pending') statusParam = 1;
      else if (activeTab.value === 'packing') statusParam = 2;
      else if (activeTab.value === 'shipping') statusParam = 3;
      else if (activeTab.value === 'completed') statusParam = 4;
      else if (activeTab.value === 'cancelled') statusParam = 5;
      else if (activeTab.value === 'returned') statusParam = 6; 

      let url = `${API_BASE_URL}/api/invoice_admin?page=${currentPage.value}&limit=${itemsPerPage.value}`;      
      if (statusParam) url += `&trangthai=${statusParam}`;
      if (searchQuery.value) url += `&timkiem=${encodeURIComponent(searchQuery.value)}`; 
      if (filterDate.value.from) url += `&ngaybatdau=${filterDate.value.from}`;
      if (filterDate.value.to) url += `&ngayketthuc=${filterDate.value.to}`;
      if (sortBy.value) url += `&sapxep=${sortBy.value}`; 

      if (advancedFilter.value.paymentStatus !== 'all') {
        url += `&trangthaitt=${encodeURIComponent(advancedFilter.value.paymentStatus)}`;
      }
      if (advancedFilter.value.minPrice) {
        url += `&minPrice=${advancedFilter.value.minPrice}`;
      }
      if (advancedFilter.value.maxPrice) {
        url += `&maxPrice=${advancedFilter.value.maxPrice}`;
      }

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
            code: item.MaDonHangHienThi || `#FC-${item.MaDH}`,
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

  let fetchTimeout = null;

  watch(
    [
      activeTab,                   
      searchQuery,                 
      () => filterDate.value.from, 
      () => filterDate.value.to,   
      sortBy                       
    ], 
    () => {
      currentPage.value = 1;
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
      fetchTimeout = setTimeout(() => {
        fetchOrders();
      }, 500); 
    }
  );

  const viewOrderDetails = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/${order.id}`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        selectedOrder.value = result.data;
        selectedOrder.value.MaDH = order.id; 
        
        isDetailModalOpen.value = true;
      } 
      else {
        toastStore.showToast("Lỗi từ CSDL: " + result.message, "error");
      }
    } 
    catch (error) {
      console.error("Lỗi gọi chi tiết đơn:", error);
      toastStore.showToast("Lỗi mạng: Không thể kết nối tới Server.", "error");
    }
    activeMenuId.value = null;
  };

  const getCurrentStatusCode = () => {
    if (!selectedOrder.value || !selectedOrder.value.TrangThaiHienTai) return 0;
    const tenTT = selectedOrder.value.TrangThaiHienTai.TenTrangThai?.toUpperCase() || '';
    if (tenTT.includes('CHỜ')) return 1;
    if (tenTT.includes('GÓI')) return 2;
    if (tenTT.includes('VẬN CHUYỂN')) return 3;
    if (tenTT.includes('ĐÃ GIAO')) return 4;
    return updateStatusValue.value; 
  };

  const openUpdateModalFromRow = async (order) => {
    await viewOrderDetails(order); 
    if (selectedOrder.value) {
      updateStatusValue.value = getCurrentStatusCode();
      isDetailModalOpen.value = false; 
      isUpdateModalOpen.value = true; 
    }
  };

  const submitUpdateStatus = async () => {
    if (updateStatusValue.value == 3 && !updateTrackingCode.value.trim()) {
        toastStore.showToast("Vui lòng nhập Mã vận đơn trước khi giao cho Shipper!", "warning");
        return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          MaDH: selectedOrder.value.MaDH,
          TrangThai: updateStatusValue.value,
          MaVanDon: updateTrackingCode.value.trim().toUpperCase(),
          HangVanChuyen: updateCarrier.value 
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toastStore.showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
        isUpdateModalOpen.value = false;
        isDetailModalOpen.value = false; 
        fetchOrders(); 
      } 
      else {
        toastStore.showToast(result.message || 'Không thể cập nhật trạng thái.', 'error');
      }
    } 
    catch (error) {
      console.error("Lỗi cập nhật tiến trình đơn hàng:", error);
      toastStore.showToast("Lỗi kết nối mạng máy chủ!", "error");
    }
  };

  const isCancelModalOpen = ref(false);
  const isUpdateModalOpen = ref(false);
  const updateStatusValue = ref('');
  const updateTrackingCode = ref(''); // Lưu mã vận đơn
  const updateCarrier = ref('Giao Hàng Nhanh'); // Lưu hãng vận chuyển (Mặc định GHN)
  const cancelReason = ref('');
  const orderToCancel = ref(null);

  const orderCodeToCancel = ref('');
  const cancelOrder = (order) => {
    orderToCancel.value = order.id || order.MaDH;
    orderCodeToCancel.value = order.code || order.ThongTinGiaoHang?.MaDonHangHienThi;
    cancelReason.value = '';
    isCancelModalOpen.value = true;
    activeMenuId.value = null;
  };

  const executeCancelOrder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/invoice_admin/huy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
          },
        body: JSON.stringify({ 
          MaDH: orderToCancel.value,
          LyDoHuy: cancelReason.value.trim()
          })
      });
      const result = await res.json();
      if(result.success) {
        toastStore.showToast("Hủy đơn thành công!", "success");
        isCancelModalOpen.value = false;
        isDetailModalOpen.value = false;
        fetchOrders();
      } else 
      toastStore.showToast(result.message, "error");
    } 
    catch(error) { 
      console.error(error); 
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
    }
  }; 

  // --- QUẢN LÝ SỬA THÔNG TIN ĐƠN HÀNG ---
  const isEditInfoModalOpen = ref(false);
  const editInfoForm = ref({ MaDH: '', hoten: '', sdt: '', diachi: '' });

  const openEditInfoModal = () => {
    // Đổ dữ liệu hiện tại vào form
    editInfoForm.value = {
      MaDH: selectedOrder.value.MaDH,
      hoten: selectedOrder.value.ThongTinGiaoHang?.TenNguoiNhan || '',
      sdt: selectedOrder.value.ThongTinGiaoHang?.SDTNguoiNhan || '',
      diachi: selectedOrder.value.ThongTinGiaoHang?.DiaChiGiao || ''
    };
    isEditInfoModalOpen.value = true;
  };

  const submitEditInfo = async () => {
    // Kiểm tra rỗng
    if (!editInfoForm.value.hoten.trim() || !editInfoForm.value.sdt.trim() || !editInfoForm.value.diachi.trim()) {
      toastStore.showToast("Vui lòng nhập đầy đủ Tên, SĐT và Địa chỉ!", "warning");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // LƯU Ý: Sửa lại đường dẫn API này cho khớp với file router.js ở Backend của bạn
      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/update-info`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editInfoForm.value)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toastStore.showToast("Cập nhật thông tin giao hàng thành công!", "success");
        isEditInfoModalOpen.value = false;
        
        // Cập nhật lại Modal Chi tiết đơn hàng ngay lập tức
        await viewOrderDetails({ id: editInfoForm.value.MaDH });
        
        // Làm mới danh sách phía sau
        fetchOrders(); 
      } else {
        toastStore.showToast(result.message || "Không thể cập nhật thông tin.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi sửa thông tin:", error);
      toastStore.showToast("Lỗi kết nối máy chủ!", "error");
    }
  };
    
  const handlePrintInvoice = async (maDH) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        toastStore.showToast("⚠️ Vui lòng đăng nhập lại!", "error");
        return;
    }

    toastStore.showToast("Đang tạo hóa đơn, vui lòng đợi giây lát...", "info");

    try {
        const res = await fetch(`${API_BASE_URL}/api/invoice_admin/print/${maDH}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Không thể tải hóa đơn từ máy chủ");
        }

        const htmlInvoice = await res.text();
        const printWindow = window.open('', '_blank', 'width=800,height=800');
        
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(htmlInvoice);
            printWindow.document.close();
        } else {
            toastStore.showToast("⚠️ Trình duyệt chặn Popup. Hãy cấp quyền mở Popup cho trang web!", "error");
        }
    } catch (error) {
        console.error("Lỗi khi in hóa đơn:", error);
        toastStore.showToast("Có lỗi xảy ra khi lấy dữ liệu in!", "error");
    }
  };

  // --- Biến cho Modal Tạo đơn ngoài ---
  const isCreateExternalOrderOpen = ref(false);
  const availableVouchers = ref([]);
  
  const externalOrderForm = ref({
    TenNguoiNhan: '',
    SDTNguoiNhan: '',
    DiaChiGiao: '',
    DanhSachSanPham: [],
    TongTien: 0,
    ThanhTien: 0,
    TongCocToiThieu: 0,
    ThuTienNgay: false, 
    PhuongThucTT: 5,
    SoTienDaTra: 0,
    MaGG: null,
    GiamGiaVoucher: 0
  });

  const isCartContainsOrder = computed(() => {
    return externalOrderForm.value.DanhSachSanPham.some(item => 
      item.LoaiHinhBan && item.LoaiHinhBan.toLowerCase().includes('order')
    );
  });

  const fetchVouchersForPOS = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/invoice_admin/get_magg`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        availableVouchers.value = data.data || [];
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách voucher:", error);
    }
  };

  watch(() => externalOrderForm.value.ThuTienNgay, (newVal) => {
    if (newVal) {
      externalOrderForm.value.SoTienDaTra = externalOrderForm.value.ThanhTien;
    } else {
      externalOrderForm.value.SoTienDaTra = 0;
    }
  });

  const searchProductQuery = ref('');
  const searchResults = ref([]);
  const isSearchingProducts = ref(false);
  let searchProductTimeout = null;

  const fetchProductsForOrder = async () => {
    if (!searchProductQuery.value.trim()) {
      searchResults.value = [];
      return;
    }
    
    isSearchingProducts.value = true;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/invoice_admin/search-products?keyword=${encodeURIComponent(searchProductQuery.value)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        searchResults.value = data.data;
      } else {
        searchResults.value = [];
      }
    } catch (error) {
      console.error("Lỗi tìm sản phẩm:", error);
    } finally {
      isSearchingProducts.value = false;
    }
  };

  const debounceSearchProduct = () => {
    clearTimeout(searchProductTimeout);
    searchProductTimeout = setTimeout(fetchProductsForOrder, 500);
  };

  const addVariantToOrder = (product, variant) => {
    const currentItems = externalOrderForm.value.DanhSachSanPham;

    // ========================================================
    // CHỐT CHẶN: KIỂM TRA LOẠI HÌNH BÁN TRƯỚC KHI THÊM
    // ========================================================
    if (currentItems.length > 0) {
      // Nhận diện hàng Order/Pre-order (Chỉ cần có chữ 'order')
      const isNewItemOrder = product.LoaiHinhBan && product.LoaiHinhBan.toLowerCase().includes('order');
      
      // Lấy loại hình của sản phẩm đầu tiên đang có sẵn trong giỏ
      const firstItem = currentItems[0];
      const isCartOrder = firstItem.LoaiHinhBan && firstItem.LoaiHinhBan.toLowerCase().includes('order');

      // Nếu 1 cái là Có sẵn, 1 cái là Order -> Văng lỗi và Dừng ngay lập tức!
      if (isNewItemOrder !== isCartOrder) {
        toastStore.showToast("⚠️ Không thể thêm! Đơn hàng này không được phép trộn lẫn Hàng có sẵn và Hàng Order.", "error");
        return; 
      }
    }

    // ========================================================
    // XỬ LÝ THÊM VÀO GIỎ NHƯ BÌNH THƯỜNG
    // ========================================================
    const existingIndex = currentItems.findIndex(item => item.MaPhanLoai === variant.MaPhanLoai);
    
    if (existingIndex > -1) {
      if (currentItems[existingIndex].SoLuong < variant.TonKho) {
        currentItems[existingIndex].SoLuong++;
      } else {
        toastStore.showToast("Đã đạt giới hạn tồn kho!", "error");
      }
    } else {
      currentItems.push({
        MaMoHinh: product.MaMoHinh,
        TenMH: product.TenMH,
        AnhDaiDien: product.AnhDaiDien,
        MaPhanLoai: variant.MaPhanLoai,
        ChiTietPhanLoai: variant.ChiTietPhanLoai,
        DonGia: variant.DonGia,
        TonKho: variant.TonKho,
        SoLuong: 1,
        TienCocToiThieu: product.TienCocToiThieu || 0,
        LoaiHinhBan: product.LoaiHinhBan // <-- LƯU VÀO ĐỂ LẦN CLICK SAU CÓ DỮ LIỆU ĐỂ KIỂM TRA
      });
    }
    recalculateOrderTotal();
  };

  const removeVariantFromOrder = (index) => {
    externalOrderForm.value.DanhSachSanPham.splice(index, 1);
    recalculateOrderTotal();
  };

  const updateItemQuantity = (index, change) => {
    const item = externalOrderForm.value.DanhSachSanPham[index];
    const newQty = item.SoLuong + change;
    
    if (newQty > 0 && newQty <= item.TonKho) {
      item.SoLuong = newQty;
      recalculateOrderTotal();
    }
  };

  const recalculateOrderTotal = () => {
    let total = 0;
    let totalCoc = 0;
    
    externalOrderForm.value.DanhSachSanPham.forEach(item => {
      total += (item.DonGia * item.SoLuong);
      totalCoc += (item.TienCocToiThieu * item.SoLuong);
    });
    
    externalOrderForm.value.TongTien = total;

    // TÍNH TOÁN VOUCHER
    let giamVoucher = 0;
    if (externalOrderForm.value.MaGG) {
      const voucher = availableVouchers.value.find(v => v.MaGG === externalOrderForm.value.MaGG);
      if (voucher && total >= Number(voucher.MucGiaToiThieu)) {
        if (voucher.LoaiGiamGia === 'TienMat') {
          giamVoucher = Number(voucher.ChietKhau);
        } else if (voucher.LoaiGiamGia === 'ChietKhau') {
          const tinhGiam = total * (Number(voucher.ChietKhau) / 100);
          giamVoucher = Math.min(tinhGiam, Number(voucher.GiaTriGiamToiDa || tinhGiam));
        }
      } else if (total > 0) {
        // Tự động tháo mã nếu nhân viên xóa bớt sản phẩm làm tổng tiền bị tụt
        externalOrderForm.value.MaGG = null;
        toastStore.showToast("Đơn hàng không còn đủ điều kiện áp dụng mã giảm giá này!", "error");
      } else {
        externalOrderForm.value.MaGG = null;
      }
    }

    externalOrderForm.value.GiamGiaVoucher = giamVoucher;
    externalOrderForm.value.ThanhTien = Math.max(0, total - giamVoucher); 
    externalOrderForm.value.TongCocToiThieu = totalCoc;
  };

  watch(isCreateExternalOrderOpen, (newVal) => {
    if (!newVal) {
      externalOrderForm.value = { TenNguoiNhan: '', SDTNguoiNhan: '', DiaChiGiao: '', DanhSachSanPham: [], TongTien: 0, ThanhTien: 0, TongCocToiThieu: 0, ThuTienNgay: false, PhuongThucTT: 5, SoTienDaTra: 0, MaGG: null, GiamGiaVoucher: 0 };
      searchProductQuery.value = '';
      searchResults.value = [];
    } else {
      fetchVouchersForPOS();
    }
  });

  const submitExternalOrder = async () => {
    if (!externalOrderForm.value.TenNguoiNhan || !externalOrderForm.value.SDTNguoiNhan) {
      toastStore.showToast('Vui lòng nhập Tên và Số điện thoại của khách hàng (Bắt buộc để bảo hành)!', 'error');
      return;
    }

    // 2. CHỐT CHẶN 2: Kiểm tra xem trong giỏ đang có hàng Order hay không
    const isOrderProduct = externalOrderForm.value.DanhSachSanPham.some(item => 
      item.LoaiHinhBan && item.LoaiHinhBan.toLowerCase().includes('order')
    );

    // 3. CHỐT CHẶN 3: Nếu là hàng Order thì bắt buộc phải có Địa chỉ
    if (isOrderProduct && !externalOrderForm.value.DiaChiGiao) {
      toastStore.showToast('Vui lòng nhập Địa chỉ giao hàng đối với sản phẩm Order / Pre-order!', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        DanhSachSanPham: externalOrderForm.value.DanhSachSanPham,
        Ten: externalOrderForm.value.TenNguoiNhan,
        SDT: externalOrderForm.value.SDTNguoiNhan,
        DiaChi: externalOrderForm.value.DiaChiGiao,
        MaGG: externalOrderForm.value.MaGG,
        Note: "Đơn tạo thủ công tại quầy",
        ThuTienNgay: externalOrderForm.value.ThuTienNgay,
        PhuongThucTT: externalOrderForm.value.PhuongThucTT,
        SoTienDaTra: externalOrderForm.value.SoTienDaTra
      };
      const res = await fetch(`${API_BASE_URL}/api/invoice_admin/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (res.ok && result.success) {
        toastStore.showToast('Tạo đơn hàng ngoài thành công!', 'success');
        isCreateExternalOrderOpen.value = false;
        fetchOrders(); 
        
        externalOrderForm.value = { TenNguoiNhan: '', SDTNguoiNhan: '', DiaChiGiao: '', DanhSachSanPham: [], ThuTienNgay: false, PhuongThucTT: 5 };
      } else {
        toastStore.showToast(result.message || 'Lỗi khi tạo đơn', 'error');
      }
    } catch (error) {
      console.error(error);
      toastStore.showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  const checkAndOpenOrderFromUrl = () => {
    if (route.query.viewOrderId) {
      viewOrderDetails({ id: parseInt(route.query.viewOrderId) });
    }
  };

  watch(() => route.query.viewOrderId, (newVal) => {
    if (newVal) {
      viewOrderDetails({ id: parseInt(newVal) });
    }
  });

  // --- QUẢN LÝ MODAL XÁC NHẬN THU TIỀN ---
  const isPaymentConfirmModalOpen = ref(false);
  const orderToPay = ref(null);
  const amountToCollect = ref(0);
  const collectionMethod = ref(5); // Mặc định thu Tiền mặt
  const alreadyPaidAmount = ref(0);
  const suggestedDepositAmount = ref(0);

  const orderCodeToPay = ref('');
  const confirmPayment = (order) => {
    orderToPay.value = order;
    orderCodeToPay.value = order.ThongTinGiaoHang?.MaDonHangHienThi;
    
    const listOrder = orders.value.find(o => o.id === order.MaDH);
    alreadyPaidAmount.value = listOrder ? listOrder.transactionAmount : 0; 
    const totalAmount = order.ThongTinGiaoHang?.ThanhTien || 0;

    amountToCollect.value = totalAmount - alreadyPaidAmount.value;
    if (amountToCollect.value < 0) amountToCollect.value = 0; 
    let totalDepositRequired = 0;
    if (selectedOrder.value && selectedOrder.value.DanhSachHang) {
      // Cộng dồn: (Tiền cọc 1 món * Số lượng)
      totalDepositRequired = selectedOrder.value.DanhSachHang.reduce((sum, item) => sum + ((item.TienCocToiThieu || 0) * item.SoLuong), 0);
    }
    // Số tiền cọc cần thu thêm = Tổng cọc yêu cầu của các món - Số tiền khách ĐÃ TRẢ trước đó
    suggestedDepositAmount.value = Math.max(0, totalDepositRequired - alreadyPaidAmount.value);

    collectionMethod.value = 5; 
    isPaymentConfirmModalOpen.value = true;
  };

  const executeConfirmPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const orderId = orderToPay.value.id || orderToPay.value.MaDH; // Lấy đúng ID dù bấm từ ngoài hay trong Modal

      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          MaDH: orderId,
          SoTienThu: amountToCollect.value,
          PhuongThuc: collectionMethod.value
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toastStore.showToast("Xác nhận thu tiền thành công!", "success");
        isPaymentConfirmModalOpen.value = false;
        
        // 🔴 ĐÃ SỬA: Tự động gọi lại API Chi tiết đơn hàng để load ngay Lịch sử giao dịch mới lên UI
        await viewOrderDetails({ id: orderId });
        
        // Làm mới danh sách đơn hàng ở màn hình nền
        fetchOrders(); 
      } 
      else {
        toastStore.showToast(result.message || "Không thể xác nhận thanh toán.", "error");
      }
    } 
    catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error);
      toastStore.showToast("Lỗi kết nối máy chủ!", "error");
    }
  };

  // --- QUẢN LÝ MODAL XÁC NHẬN HOÀN TIỀN ---
  const isRefundConfirmModalOpen = ref(false);
  const orderToRefund = ref(null);

  const orderCodeToRefund = ref('');
  const confirmRefund = (maDH, maHienThi) => {
    orderToRefund.value = maDH;
    orderCodeToRefund.value = maHienThi;
    isRefundConfirmModalOpen.value = true;
  };

  const executeConfirmRefund = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/refund-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ MaDH: orderToRefund.value })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toastStore.showToast("Xác nhận hoàn tiền thành công!", "success");
        isRefundConfirmModalOpen.value = false;
        
        // 🔴 ĐÃ SỬA: Tự động cập nhật Lịch sử giao dịch (dòng hoàn tiền âm)
        await viewOrderDetails({ id: orderToRefund.value });
        
        fetchOrders(); 
      } else {
        toastStore.showToast(result.message || "Không thể xác nhận hoàn tiền.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận hoàn tiền:", error);
      toastStore.showToast("Lỗi kết nối máy chủ!", "error");
    }
  };

  const copyTrackingCode = async (code) => {
    if (!code) return;
    try {
      // Sử dụng API Clipboard của trình duyệt
      await navigator.clipboard.writeText(code);
      toastStore.showToast(`Đã copy mã: ${code}`, "success");
    } catch (err) {
      console.error('Lỗi khi copy: ', err);
      // Fallback cho một số trình duyệt cũ nếu cần
      toastStore.showToast("Trình duyệt không hỗ trợ copy tự động!", "warning");
    }
  };

  const scrollToTopCustom = (duration = 1000) => {
    const startPosition = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      let progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      window.scrollTo(0, startPosition * (1 - easeProgress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  onMounted(() => {
    scrollToTopCustom();
    fetchOrders();
    checkAndOpenOrderFromUrl(); 
  });
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>