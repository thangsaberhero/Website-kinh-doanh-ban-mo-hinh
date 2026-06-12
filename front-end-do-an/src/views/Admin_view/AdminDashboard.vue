<template>
  <div @click="layoutStore.closeMobileMenu; activeMenuId = null; isDropdownOpen = false" class="bg-slate-100 h-screen overflow-hidden font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>
    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>
    <div class="flex-1 flex flex-col h-screen w-full relative">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        
        <section class="flex flex-col md:flex-row justify-between items-end gap-4 relative z-20">
          <div>
            <h2 class="text-3xl font-headline font-bold text-slate-900 tracking-tight">Tổng quan Hệ thống</h2>
            <p class="text-slate-500 mt-1 text-sm font-medium">Dữ liệu được cập nhật mới nhất lúc {{ lastUpdatedTime }}</p>
          </div>
          
          <div class="flex gap-3">
            <div class="relative">
              <button @click.stop="isDropdownOpen = !isDropdownOpen" class="flex items-center gap-2 bg-white text-slate-900 text-xs font-bold px-4 py-2.5 border border-slate-200 border-b-2 border-b-[#ff8f73] rounded shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[16px] text-[#ff8f73]">calendar_today</span>
                {{ currentFilterLabel }}
                <span class="material-symbols-outlined text-[18px] text-slate-400 transition-transform" :class="isDropdownOpen ? 'rotate-180' : ''">expand_more</span>
              </button>

              <div v-show="isDropdownOpen" class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 transition-all duration-200 overflow-hidden z-50">
                <ul class="py-1 text-sm text-slate-700">
                  <li><a href="#" @click.prevent="applyQuickFilter('today')" class="block px-4 py-2 hover:bg-slate-50 hover:text-[#ff8f73]">Hôm nay</a></li>
                  <li><a href="#" @click.prevent="applyQuickFilter('7d')" class="block px-4 py-2 hover:bg-slate-50 hover:text-[#ff8f73]">7 ngày qua</a></li>
                  <li><a href="#" @click.prevent="applyQuickFilter('30d')" class="block px-4 py-2 hover:bg-slate-50 hover:text-[#ff8f73]">30 ngày qua</a></li>
                  <li><a href="#" @click.prevent="applyQuickFilter('month')" class="block px-4 py-2 hover:bg-slate-50 hover:text-[#ff8f73]">Tháng này</a></li>
                  <li class="border-t border-slate-100 mt-1">
                    <a href="#" @click.prevent="openCustomDatePicker" class="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-slate-500 font-medium">
                      Tùy chỉnh...
                      <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <button @click="exportExcelReport" class="flex items-center gap-2 bg-white text-slate-500 text-xs font-bold px-4 py-2.5 border border-slate-200 rounded shadow-sm hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[20px]" :class="{'animate-bounce': isExporting}">file_download</span>
              {{ isExporting ? 'Đang tạo file...' : 'Xuất báo cáo' }}
            </button>
          </div>
        </section>

        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">payments</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Tổng doanh thu</p>
              <h3 class="text-2xl font-headline font-bold text-slate-900">{{ totalRevenue }} <span class="text-lg">{{ revenueUnit }}</span></h3>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50"><div class="h-full bg-[#ff8f73] w-2/3 rounded-r-full"></div></div>
          </div>

          <div class="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">trending_up</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Lợi nhuận ròng</p>
              <h3 class="text-2xl font-headline font-bold text-emerald-600">{{ totalProfit }} <span class="text-lg">{{ profitUnit }}</span></h3>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50"><div class="h-full bg-emerald-400 w-3/4 rounded-r-full"></div></div>
          </div>

          <div class="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">shopping_cart</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Đơn hàng mới</p>
              <h3 class="text-2xl font-headline font-bold text-slate-900">{{ newOrders }}</h3>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50"><div class="h-full bg-purple-400 w-1/2 rounded-r-full"></div></div>
          </div>

          <div class="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">person_add</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Người dùng mới</p>
              <h3 class="text-2xl font-headline font-bold text-slate-900">{{ newUsers }}</h3>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50"><div class="h-full bg-emerald-400 w-3/4 rounded-r-full"></div></div>
          </div>

          <div class="bg-white p-5 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">cancel</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Tỷ lệ hủy đơn</p>
              <h3 class="text-2xl font-headline font-bold text-rose-600">{{ cancelRate }}%</h3>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50"><div class="h-full bg-rose-400 w-1/4 rounded-r-full"></div></div>
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-8 rounded-xl shadow-md border border-slate-100 flex flex-col">
            <div class="flex justify-between items-start mb-8">
              <div>
                <h4 class="text-lg font-headline font-bold text-slate-900">Xu hướng doanh thu</h4>
                <p class="text-[11px] text-slate-400 uppercase tracking-widest mt-1 font-medium">(Đơn vị: Triệu VNĐ)</p>
              </div>
              <div class="flex items-center gap-4 text-xs font-bold text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 bg-[#ff8f73] rounded-full shadow-[0_0_8px_#ff8f73]"></span>
                  <span>THÁNG NÀY</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 bg-slate-200 rounded-full"></span>
                  <span>THÁNG TRƯỚC</span>
                </div>
              </div>
            </div>
            <div class="flex-1 relative min-h-[220px] w-full">
              <div class="absolute inset-0 flex flex-col justify-between z-0 pb-6">
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
              </div>
              <div class="flex-1 relative w-full pt-4">
                <VueApexCharts 
                  type="area" 
                  height="100%" 
                  :options="chartDoanhThuOptions" 
                  :series="chartDoanhThuSeries" 
                />
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-xl shadow-md border border-slate-100 flex flex-col">
            <h4 class="text-lg font-headline font-bold text-slate-900 mb-1">Dòng sản phẩm</h4>
            <p class="text-[11px] text-slate-400 uppercase tracking-widest mb-6 font-medium">Phân bố bán chạy theo danh mục</p>
            <div class="flex-1 w-full flex items-center justify-center">
              <VueApexCharts 
                type="donut" 
                height="100%" 
                :options="chartDanhMucOptions" 
                :series="chartDanhMucSeries" 
              />
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col h-80">
            <h4 class="text-sm font-headline font-bold text-slate-900 mb-2">Top Mô hình bán chạy</h4>
            <div class="flex-1 w-full">
              <VueApexCharts 
                type="bar" 
                height="100%" 
                :options="chartSanPhamOptions" 
                :series="chartSanPhamSeries" 
              />
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col h-80">
            <h4 class="text-sm font-headline font-bold text-slate-900 mb-2">Tỷ trọng Hãng sản xuất</h4>
            <div class="flex-1 w-full flex items-center justify-center">
              <VueApexCharts 
                type="donut" 
                height="100%" 
                :options="chartThuongHieuOptions" 
                :series="chartThuongHieuSeries" 
              />
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col h-80">
            <h4 class="text-sm font-headline font-bold text-slate-900 mb-4">Trạng thái Đơn hàng</h4>
            <div class="flex-1 w-full flex items-center justify-center">
              <VueApexCharts 
                type="pie" 
                height="100%" 
                :options="chartTrangThaiOptions" 
                :series="chartTrangThaiSeries" 
              />
            </div>
          </div>

        </section>

        <section class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h4 class="text-lg font-headline font-bold text-slate-900">Các đơn hàng gần đây</h4>
              <p class="text-[11px] text-slate-400 uppercase tracking-widest mt-1 font-medium">10 giao dịch mới nhất trong hệ thống</p>
            </div>
            <RouterLink to="/admin/orders" class="text-[#ff8f73] hover:text-white bg-white hover:bg-[#ff8f73] text-xs font-bold border border-[#ff8f73]/30 px-5 py-2 rounded transition-all inline-block">
              XEM TẤT CẢ
            </RouterLink>
          </div>
          
          <div class="overflow-x-auto min-h-[250px] pb-4"> <table class="w-full text-left border-collapse">
              <thead class="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th class="px-8 py-4 font-semibold w-32">Mã đơn</th>
                  <th class="px-8 py-4 font-semibold w-48">Khách hàng</th>
                  <th class="px-8 py-4 font-semibold text-center w-40">Trạng thái</th>
                  <th class="px-8 py-4 font-semibold text-right w-40">Tổng tiền</th>
                  <th class="px-8 py-4 font-semibold text-center w-16">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(order, index) in recentOrders" :key="order.id" class="hover:bg-slate-50 transition-colors group">
                  
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-2">
                        <span class="font-headline font-bold text-sm text-slate-900">#{{ order.code }}</span>
                        <span class="text-[8px] px-1.5 py-0.5 rounded border font-black tracking-widest whitespace-nowrap"
                              :class="order.saleType?.toLowerCase().includes('order') ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'">
                          {{ order.saleType?.toLowerCase().includes('order') ? 'ORDER' : 'SẴN' }}
                        </span>
                    </div>
                  </td>
                  
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                        {{ order.avatarText }}
                      </div>
                      <div class="flex flex-col">
                        <p class="text-sm font-bold text-slate-900">{{ order.customerName }}</p>
                        <p class="text-[11px] text-slate-500">{{ order.email }}</p>
                        <p class="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <span class="material-symbols-outlined text-[12px]">badge</span> NV: <span class="font-semibold text-slate-500">{{ order.staffName }}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-8 py-5 text-center">
                    <span :class="`text-[10px] font-bold px-3 py-1.5 rounded-full border ${getOrderStatusBadge(order.status).class}`">
                      {{ getOrderStatusBadge(order.status).text }}
                    </span>
                  </td>
                  
                  <td class="px-8 py-5 text-right font-headline font-bold text-sm text-slate-900">{{ order.total }}</td>
                  
                  <td class="px-8 py-5 text-center">
                    <button 
                      @click.stop="handleOrderAction('detail', order.id)" 
                      class="text-slate-400 hover:text-sky-500 bg-white hover:bg-sky-50 border border-transparent hover:border-sky-100 p-2 rounded-lg transition-all focus:outline-none flex items-center justify-center mx-auto shadow-sm"
                      title="Xem chi tiết đơn hàng"
                    >
                      <span class="material-symbols-outlined text-lg">visibility</span>
                    </button>
                  </td>
                  
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>

  <div v-if="isCustomModalOpen" class="print:hidden fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white p-6 rounded-xl shadow-xl w-96">
      <h3 class="text-lg font-bold text-slate-900 mb-4">Tùy chỉnh thời gian</h3>
      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Từ ngày</label>
          <input type="date" v-model="customStartDate" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Đến ngày</label>
          <input type="date" v-model="customEndDate" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none">
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button @click="isCustomModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Hủy</button>
        <button @click="applyCustomDate" class="px-4 py-2 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] rounded-lg">Áp dụng</button>
      </div>
    </div>
  </div>
  <div v-if="isDetailModalOpen && selectedOrder" class="print:hidden fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col animate-fade-in">
      
      <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
        <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          Chi tiết đơn hàng <span class="text-[#ff8f73]">{{ selectedOrder.ThongTinGiaoHang?.MaDonHangHienThi || `#FC-${selectedOrder.MaDH}` }}</span>
        </h3>
        <button @click="isDetailModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-8 space-y-6 flex-1">
        
        <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div class="bg-slate-50/80 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
            <h4 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">contact_mail</span> Thông tin nhận hàng
            </h4>
            </div>
          <div class="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-sm bg-white">
            <div class="p-4">
              <p class="text-slate-400 font-medium mb-1 text-[11px] uppercase tracking-wider">Ngày đặt</p>
              <p class="font-semibold text-slate-800">{{ new Date(selectedOrder.ThongTinGiaoHang?.NgayLapDon).toLocaleString('vi-VN') }}</p>
            </div>
            <div class="p-4">
              <p class="text-slate-400 font-medium mb-1 text-[11px] uppercase tracking-wider">Trạng thái đơn</p>
              <span :class="`text-xs font-bold px-2.5 py-1 rounded-full border ${getOrderStatusBadge(selectedOrder.TrangThaiHienTai?.TenTrangThai).class}`">
                {{ getOrderStatusBadge(selectedOrder.TrangThaiHienTai?.TenTrangThai).text }}
              </span>
            </div>
            <div class="p-4">
              <p class="text-slate-400 font-medium mb-1 text-[11px] uppercase tracking-wider">Khách hàng</p>
              <p class="font-bold text-slate-800">{{ selectedOrder.ThongTinGiaoHang?.TenNguoiNhan || 'Khách vãng lai' }}</p>
            </div>
            <div class="p-4">
              <p class="text-slate-400 font-medium mb-1 text-[11px] uppercase tracking-wider">Số điện thoại</p>
              <p class="font-semibold text-slate-800">{{ selectedOrder.ThongTinGiaoHang?.SDTNguoiNhan || 'N/A' }}</p>
            </div>
            <div class="p-4 md:col-span-2 border-t border-slate-200">
              <p class="text-slate-400 font-medium mb-1 text-[11px] uppercase tracking-wider">Địa chỉ giao hàng</p>
              <p class="font-medium text-slate-700">{{ selectedOrder.ThongTinGiaoHang?.DiaChiGiao || 'N/A' }}</p>
            </div>
            <div class="p-4 md:col-span-2 border-t border-slate-200">
              <p class="text-slate-400 font-medium mb-1 text-[11px] uppercase tracking-wider">Ghi chú</p>
              <p class="text-rose-600 font-medium italic">{{ selectedOrder.ThongTinGiaoHang?.Note || 'Không có ghi chú.' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-50/60 border border-slate-200/60 rounded-xl p-6">
          <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">timeline</span> Hành trình đơn hàng
          </h4>
          
          <div v-if="getCurrentStatusCode() == 5 || getCurrentStatusCode() == 6" class="flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-xl">
            <span class="material-symbols-outlined text-rose-500 text-2xl animate-bounce">cancel_presentation</span>
            <div>
              <p class="text-sm font-bold text-rose-900">
                {{ getCurrentStatusCode() == 5 ? 'ĐƠN HÀNG ĐÃ BỊ HỦY BỎ' : 'ĐƠN HÀNG ĐÃ HOÀN TRẢ VỀ KHO' }}
              </p>
              <p class="text-xs text-rose-600 mt-0.5 font-medium">
                Ghi nhận vào lúc: {{ selectedOrder.LichSuTrangThai?.find(line => line.MaTrangThai == getCurrentStatusCode()) ? new Date(selectedOrder.LichSuTrangThai.find(line => line.MaTrangThai == getCurrentStatusCode()).Thoigian).toLocaleString('vi-VN') : 'N/A' }}
              </p>
            </div>
          </div>

          <div v-else class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
            <div class="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 hidden md:block z-0"></div>

            <div class="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center flex-1 w-full">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm transition-all"
                    :class="selectedOrder.LichSuTrangThai?.some(l => l.MaTrangThai == 1) ? 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20' : 'bg-white border-slate-200 text-slate-400'">
                <span class="material-symbols-outlined text-[18px]">order_approve</span>
              </div>
              <div class="flex flex-col md:items-center">
                <p class="text-xs font-bold text-slate-800">Chờ duyệt</p>
                <p class="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                  {{ selectedOrder.LichSuTrangThai?.find(l => l.MaTrangThai == 1) ? new Date(selectedOrder.LichSuTrangThai.find(l => l.MaTrangThai == 1).Thoigian).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                </p>
              </div>
            </div>

            <div class="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center flex-1 w-full">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm transition-all"
                    :class="selectedOrder.LichSuTrangThai?.some(l => l.MaTrangThai == 2) ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20' : 'bg-white border-slate-200 text-slate-400'">
                <span class="material-symbols-outlined text-[18px]">package_2</span>
              </div>
              <div class="flex flex-col md:items-center">
                <p class="text-xs font-bold text-slate-800">Đóng gói</p>
                <p class="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                  {{ selectedOrder.LichSuTrangThai?.find(l => l.MaTrangThai == 2) ? new Date(selectedOrder.LichSuTrangThai.find(l => l.MaTrangThai == 2).Thoigian).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                </p>
              </div>
            </div>

            <div class="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center flex-1 w-full">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm transition-all"
                    :class="selectedOrder.LichSuTrangThai?.some(l => l.MaTrangThai == 3) ? 'bg-sky-500 border-sky-500 text-white shadow-sky-500/20' : 'bg-white border-slate-200 text-slate-400'">
                <span class="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <div class="flex flex-col md:items-center">
                <p class="text-xs font-bold text-slate-800">Đang giao</p>
                <p class="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                  {{ selectedOrder.LichSuTrangThai?.find(l => l.MaTrangThai == 3) ? new Date(selectedOrder.LichSuTrangThai.find(l => l.MaTrangThai == 3).Thoigian).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                </p>
              </div>
            </div>

            <div class="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center flex-1 w-full">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm transition-all"
                    :class="selectedOrder.LichSuTrangThai?.some(l => l.MaTrangThai == 4) ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20' : 'bg-white border-slate-200 text-slate-400'">
                <span class="material-symbols-outlined text-[18px]">task_alt</span>
              </div>
              <div class="flex flex-col md:items-center">
                <p class="text-xs font-bold text-slate-800">Đã giao</p>
                <p class="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                  {{ selectedOrder.LichSuTrangThai?.find(l => l.MaTrangThai == 4) ? new Date(selectedOrder.LichSuTrangThai.find(l => l.MaTrangThai == 4).Thoigian).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '--:--' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.ThongTinGiaoHang?.MaVanDon" class="flex items-center justify-between bg-sky-50/80 border border-sky-100 rounded-xl p-4">
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
              <span class="font-black text-sky-700 tracking-wider text-sm uppercase">{{ selectedOrder.ThongTinGiaoHang?.MaVanDon }}</span>
              <button @click="copyTrackingCode(selectedOrder.ThongTinGiaoHang?.MaVanDon)" class="text-slate-400 hover:text-sky-600 transition-colors flex items-center justify-center" title="Copy mã vận đơn">
                <span class="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Lịch sử giao dịch</h4>
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
                           class="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0 bg-slate-50" />
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

      <div class="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
        <RouterLink :to="`/admin/orders?viewOrderId=${selectedOrder.MaDH}`" class="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm font-bold rounded-lg transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">open_in_new</span> Mở trang xử lý đơn
        </RouterLink>
        <div class="flex gap-2">
          </div>
      </div>

    </div>
  </div>

  <div v-if="isUpdateModalOpen && selectedOrder" class="print:hidden fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
      <h3 class="text-lg font-bold text-slate-900 mb-2">Cập nhật tiến trình đơn hàng</h3>
      <p class="text-xs text-slate-400 mb-4 font-medium">Thay đổi trạng thái cho mã đơn: #{{ selectedOrder.MaDH }}</p>
      
      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Chọn trạng thái mới</label>
        <select v-model="updateStatusValue" class="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm focus:border-[#ff8f73] font-semibold text-slate-700 focus:ring-1 focus:ring-[#ff8f73] outline-none cursor-pointer">
          <option value="1" :disabled="getCurrentStatusCode() >= 1">CHỜ DUYỆT (Hệ thống tiếp nhận)</option>
          <option value="2" :disabled="getCurrentStatusCode() >= 2">ĐANG ĐÓNG GÓI (Chuẩn bị hàng trong kho)</option>
          <option value="3" :disabled="getCurrentStatusCode() >= 3">ĐANG VẬN CHUYỂN (Giao cho shipper)</option>
          <option value="4" :disabled="getCurrentStatusCode() >= 4">ĐÃ GIAO (Khách ký nhận thành công)</option>
        </select>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button @click="isUpdateModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Quay lại</button>
        <button @click="submitUpdateStatus" class="px-5 py-2 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff7352] rounded-lg shadow-sm">Xác nhận đổi</button>
      </div>
    </div>
  </div>

  <div v-if="isCancelModalOpen && selectedOrder" class="print:hidden fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border-t-4 border-rose-500 animate-fade-in">
      <div class="flex items-center gap-2 text-rose-600 mb-2">
        <span class="material-symbols-outlined text-2xl font-bold">warning</span>
        <h3 class="text-lg font-bold">Cảnh báo hủy đơn hàng hàng loạt</h3>
      </div>
      <p class="text-sm text-slate-500 mb-4">Bạn đang yêu cầu hủy đơn hàng <span class="font-bold text-slate-800">#{{ selectedOrder.MaDH }}</span>. Hành động này sẽ hoàn kho số lượng figure hiện tại.</p>
      
      <div class="mb-5">
        <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Lý do hủy đơn hàng (Bắt buộc)</label>
        <textarea v-model="cancelReasonValue" rows="3" placeholder="Ví dụ: Khách gọi yêu cầu đổi mẫu, Boom hàng, Lỗi hệ thống thanh toán..." class="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder:text-slate-300 font-medium"></textarea>
      </div>

      <div class="flex justify-end gap-2">
        <button @click="isCancelModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Không hủy nữa</button>
        <button @click="submitCancelOrder" class="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm">Đồng ý hủy đơn</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
  import VueApexCharts from 'vue3-apexcharts';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue"; 

  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const isCustomModalOpen = ref(false);
  const customStartDate = ref('');
  const customEndDate = ref('');
  const lastUpdatedTime = ref('Đang cập nhật...');
  let refreshInterval = null;

  const isDropdownOpen = ref(false);
  const currentFilterLabel = ref('30 NGÀY QUA');
  const currentFilterValue = ref('30d');

  const totalRevenue = ref(0);
  const revenueUnit = ref('Tr');
  const totalProfit = ref(0);
  const profitUnit = ref('Tr');
  const newOrders = ref(0);
  const newUsers = ref(0);
  const cancelRate = ref(0);
  const promoStats = ref([]);

  const isDetailModalOpen = ref(false);
  const isUpdateModalOpen = ref(false);
  const isCancelModalOpen = ref(false);
  
  const selectedOrder = ref(null); 
  const updateStatusValue = ref(''); 
  const cancelReasonValue = ref(''); 
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const formatPrice = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const fetchOrderDetail = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success && result.data) {
        selectedOrder.value = result.data;
        selectedOrder.value.MaDH = id;
      } 
      else {
        toastStore.showToast(result.message || "Không thể lấy thông tin chi tiết đơn hàng.", 'error');
      }
    } catch (error) {
      console.error("Lỗi khi kết nối lấy chi tiết đơn hàng:", error);
    }
  };

  const handleOrderAction = async (action, id, currentStatus = '') => {
    activeMenuId.value = null; 
    await fetchOrderDetail(id);
    if (!selectedOrder.value) return;

    if (action === 'detail') {
      isDetailModalOpen.value = true;
    } 
    else if (action === 'update') {
      updateStatusValue.value = String(getCurrentStatusCode());
      isUpdateModalOpen.value = true;
    } 
    else if (action === 'cancel') {
      cancelReasonValue.value = ''; 
      isCancelModalOpen.value = true;
    } 
    else if (action === 'print') {
      handlePrintInvoice(id);
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
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Không thể tải hóa đơn từ máy chủ");

        const htmlInvoice = await res.text();
        const printWindow = window.open('', '_blank', 'width=800,height=800');
        
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(htmlInvoice);
            printWindow.document.close();
        } else {
            toastStore.showToast("⚠️ Trình duyệt chặn Popup. Hãy cấp quyền mở Popup cho trang web!", "error");
        }
    } 
    catch (error) {
        console.error("Lỗi khi in hóa đơn:", error);
        toastStore.showToast("Có lỗi xảy ra khi lấy dữ liệu in!", "error");
    }
  };

  const submitUpdateStatus = async () => {
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
          TrangThai: updateStatusValue.value
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toastStore.showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
        isUpdateModalOpen.value = false;
        isDetailModalOpen.value = false; 
        fetchRecentOrders(); 
        fetchDashboardData(); 
      } 
      else {
        toastStore.showToast(result.message || 'Không thể cập nhật trạng thái.', 'error');
      }
    } 
    catch (error) {
      console.error(error);
    }
  };

  const submitCancelOrder = async () => {
    if (!cancelReasonValue.value.trim()) {
      toastStore.showToast('Vui lòng nhập lý do cụ thể để tiến hành hủy đơn!', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/huy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          MaDH: selectedOrder.value.MaDH,
          LyDoHuy: cancelReasonValue.value 
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toastStore.showToast('Đã thực hiện hủy đơn hàng thành công!', 'success');
        isCancelModalOpen.value = false;
        isDetailModalOpen.value = false;
        fetchRecentOrders();
        fetchDashboardData();
      } 
      else {
        toastStore.showToast(result.message || 'Thao tác hủy đơn thất bại.', 'error');
      }
    } 
    catch (error) {
      console.error(error);
    }
  };

  // 1. Biểu đồ Xu hướng doanh thu
  const chartDoanhThuSeries = ref([{ name: 'Doanh thu', data: [] }]);
  const chartDoanhThuOptions = ref({
    chart: { type: 'area', height: 220, toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#ff8f73'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: [], labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 700 } } },
    yaxis: { labels: { formatter: (val) => (val / 1000000).toFixed(1) + 'Tr', style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 700 } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: { y: { formatter: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) } }
  });

  // 2. Biểu đồ Top Sản phẩm 
  const chartSanPhamSeries = ref([{ name: 'Số lượng bán', data: [] }]);
  const chartSanPhamOptions = ref({
    chart: { type: 'bar', height: 240, toolbar: { show: false } },
    colors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true, distributed: true, dataLabels: { position: 'right' } } },
    dataLabels: { enabled: true, textAnchor: 'start', style: { colors: ['#333'], fontSize: '11px', fontWeight: 700 }, formatter: (val) => val, offsetX: 10 },
    xaxis: { categories: [] },
    yaxis: { 
      show: true,
      labels: {
        maxWidth: 140, 
        style: { fontSize: '11px', fontWeight: 600, colors: '#64748b' },
        formatter: (val) => (typeof val === 'string' && val.length > 15) ? val.substring(0, 15) + '...' : val // Cắt chữ dài thành ...
      }
    },
    legend: { show: false },
    tooltip: { y: { title: { formatter: () => 'Đã bán: ' } } }
  });

  // 3. Biểu đồ Phân bổ Dòng Sản phẩm theo Danh mục 
  const chartDanhMucSeries = ref([]);
  const chartDanhMucOptions = ref({
    chart: { type: 'donut', height: 240 },
    labels: [],
    colors: ['#ff8f73', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Tổng SP', fontSize: '12px', fontWeight: 700, color: '#64748b' } } } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '11px', fontWeight: 600 },
    tooltip: {
      theme: 'light',
      fillSeriesColor: false,
      y: { formatter: (val) => val + ' sản phẩm' }
    }
  });

  // 4. Biểu đồ Hãng sản xuất
  const chartThuongHieuSeries = ref([]);
  const chartThuongHieuOptions = ref({
    chart: { type: 'donut', height: 240 },
    labels: [],
    colors: ['#ff8f73', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'],
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Tổng SP', fontSize: '12px', fontWeight: 700, color: '#64748b' } } } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '11px', fontWeight: 600, markers: { radius: 12 } },
    tooltip: {
      theme: 'light',
      fillSeriesColor: false, 
      y: { formatter: (val) => val + ' sản phẩm' }
    }
  });

  // 5. Biểu đồ Trạng thái Đơn hàng
  const chartTrangThaiSeries = ref([]);
  const chartTrangThaiOptions = ref({
    chart: { type: 'pie', height: 240 },
    labels: [],
    colors: ['#94a3b8', '#38bdf8', '#f59e0b', '#10b981', '#ef4444'],
    legend: { position: 'bottom', fontSize: '11px', fontWeight: 600 },
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + "%", dropShadow: { enabled: false } },
    tooltip: {
      theme: 'light',
      fillSeriesColor: false,
      y: { formatter: (val) => val + ' đơn hàng' }
    }
  });

  const fetchDashboardData = async (startDate = null, endDate = null) => {
    try {
      const token = localStorage.getItem('token');
      let query = '';
      if (startDate && endDate) {
        const startFmt = startDate.replace(/\//g, '-');
        const endFmt = endDate.replace(/\//g, '-');
        query = `?NgayBatDau=${startFmt}&NgayKetThuc=${endFmt}`;
      }

      // 1. DỮ LIỆU SẢN PHẨM, THƯƠNG HIỆU & DANH MỤC
      const resSanPham = await fetch(`${API_BASE_URL}/api/thongke/sanpham${query}`);
      const dataSanPham = await resSanPham.json();
      if (dataSanPham.success && dataSanPham.data) {
        // Cập nhật Top Mô hình
        const topMH = dataSanPham.data.topMoHinh || [];
        chartSanPhamSeries.value = [{ name: 'Đã bán', data: topMH.map(item => item.TongSoSP) }];
        chartSanPhamOptions.value = { ...chartSanPhamOptions.value, xaxis: { categories: topMH.map(item => item.TenMH) } };

        // Cập nhật Thương hiệu
        const topHSX = dataSanPham.data.topHSX || [];
        chartThuongHieuSeries.value = topHSX.map(item => Number(item.TongSoSP));
        chartThuongHieuOptions.value = { ...chartThuongHieuOptions.value, labels: topHSX.map(item => item.TenHSX) };

        // Cập nhật danh mục động (Thay cho vòng tròn CSS tĩnh)
        const topDM = dataSanPham.data.topDanhMuc || [];
        chartDanhMucSeries.value = topDM.map(item => Number(item.TongSoSP));
        chartDanhMucOptions.value = { ...chartDanhMucOptions.value, labels: topDM.map(item => item.TenDM) };
      }

      // 2. DỮ LIỆU THẺ KPI TỔNG QUAN (DOANH THU & ĐƠN HÀNG & LỢI NHUẬN)
      const resDoanhThu = await fetch(`${API_BASE_URL}/api/thongke/doanhthu${query}`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const dataDoanhThu = await resDoanhThu.json();
      if (dataDoanhThu.success && dataDoanhThu.data) {
        // Doanh thu
        const dtThucTe = dataDoanhThu.data.TongDoanhThu;
        if (dtThucTe >= 1000000000) {
          animateNumber(totalRevenue, dtThucTe / 1000000000, 1500, 2); revenueUnit.value = 'Tỷ';
        } else {
          animateNumber(totalRevenue, dtThucTe / 1000000, 1500, 1); revenueUnit.value = 'Tr';
        }

        // Lợi nhuận ròng
        const lnThucTe = dataDoanhThu.data.TongLoiNhuan;
        if (lnThucTe >= 1000000000) {
          animateNumber(totalProfit, lnThucTe / 1000000000, 1500, 2); profitUnit.value = 'Tỷ';
        } else {
          animateNumber(totalProfit, lnThucTe / 1000000, 1500, 1); profitUnit.value = 'Tr';
        }
      }

      // 3. KHÁCH HÀNG MỚI
      const resKhachHang = await fetch(`${API_BASE_URL}/api/thongke/khachhang${query}`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const dataKhachHang = await resKhachHang.json();
      if (dataKhachHang.success && dataKhachHang.data) {
        const tongKhach = dataKhachHang.data.reduce((sum, item) => sum + item.SoLuongKhach, 0);
        animateNumber(newUsers, tongKhach, 1500, 0);
      }

      // 4. TRẠNG THÁI ĐƠN HÀNG
      const resDonHang = await fetch(`${API_BASE_URL}/api/thongke/donhang${query}`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const dataDonHang = await resDonHang.json();
      if (dataDonHang.success && dataDonHang.data) {
        const dynamicColors = dataDonHang.data.map(item => {
          const ten = item.TenTrangThai.toLowerCase();
          if (ten.includes('giao')) return '#10b981'; 
          if (ten.includes('hủy')) return '#ef4444'; 
          if (ten.includes('đang')) return '#38bdf8';
          if (ten.includes('chờ')) return '#f59e0b'; 
          return '#94a3b8';
        });

        chartTrangThaiSeries.value = dataDonHang.data.map(item => item.SoLuongDon);
        chartTrangThaiOptions.value = { ...chartTrangThaiOptions.value, labels: dataDonHang.data.map(item => item.TenTrangThai), colors: dynamicColors };

        const totalOrdersCount = dataDonHang.data.reduce((sum, item) => sum + item.SoLuongDon, 0);
        const canceledOrders = dataDonHang.data.find(item => item.TenTrangThai.toLowerCase().includes('hủy'))?.SoLuongDon || 0;
        animateNumber(cancelRate, totalOrdersCount > 0 ? (canceledOrders / totalOrdersCount) * 100 : 0, 1500, 1);
        animateNumber(newOrders, totalOrdersCount, 1500, 0);
      }

      // 5. BIỂU ĐỒ XU HƯỚNG DOANH THU (API ĐƯỜNG MỚI VIẾT)
      const resBieuDo = await fetch(`${API_BASE_URL}/api/thongke/bieudo${query}`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const dataBieuDo = await resBieuDo.json();
      if (dataBieuDo.success && dataBieuDo.data) {
        chartDoanhThuSeries.value = [{ name: 'Doanh thu', data: dataBieuDo.data.map(item => item.DoanhThuNgay) }];
        chartDoanhThuOptions.value = { ...chartDoanhThuOptions.value, xaxis: { categories: dataBieuDo.data.map(item => item.Ngay) } };
      }

      // 6. DỮ LIỆU MÃ GIẢM GIÁ KHUYẾN MÃI
      const resKhuyenMai = await fetch(`${API_BASE_URL}/api/thongke/khuyenmai${query}`,{
        headers: {'Authorization': `Bearer ${token}`}
      });
      const dataKhuyenMai = await resKhuyenMai.json();
      if (dataKhuyenMai.success && dataKhuyenMai.data) {
        promoStats.value = dataKhuyenMai.data.topmagg || [];
      }

      const now = new Date();
      const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      lastUpdatedTime.value = timeString;
    } 
    catch (error) {
      console.error("Lỗi khi đồng bộ dữ liệu Dashboard:", error);
    }
  };

  const recentOrders = ref([]);
  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/invoice_admin/?page=1&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401 || response.status === 403) {
        toastStore.showToast("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", "error");
        localStorage.removeItem('token');
        router.push('/login'); 
        return;
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        if (result.success && result.data) {
          recentOrders.value = result.data.map(order => {
            const customerName = order.TenKH || order.TenNguoiNhan || 'Khách vãng lai';
            
            return {
              id: order.MaDH, 
              code: order.MaDonHangHienThi,
              avatarText: customerName.charAt(0).toUpperCase(),
              customerName: customerName,
              email: order.SDTNguoiNhan || 'Không có SĐT', 
              status: order.TrangThai, 
              total: formatPrice(order.ThanhTien),
              staffName: order.TenNV || 'Chưa phân công',
              saleType: order.LoaiHinhBan || 'Có sẵn'
            };
          });
        }
      }
    } catch (error) {
      console.error("Lỗi lấy đơn hàng gần đây:", error);
    }
  };

  const scrollToTopCustom = (duration = 1000) => {
    const startPosition = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      let progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Thực hiện cuộn
      window.scrollTo(0, startPosition * (1 - easeProgress));

      // Nếu chưa hết thời gian thì tiếp tục gọi animation
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  onMounted(() => {
    scrollToTopCustom();
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const start = thirtyDaysAgo.toISOString().slice(0,10);
    const end = today.toISOString().slice(0,10);
    
    fetchDashboardData(start, end);
    fetchRecentOrders();

    refreshInterval = setInterval(() => {
      if (currentFilterValue.value && currentFilterValue.value.includes('_')) {
        const [currentStart, currentEnd] = currentFilterValue.value.split('_');
        
        // Chỉ tự động cập nhật nếu ngày kết thúc của bộ lọc là ngày hôm nay
        const isFilterIncludesToday = currentEnd === new Date().toISOString().slice(0,10);
        
        if (isFilterIncludesToday) {
          fetchDashboardData(currentStart, currentEnd);
          fetchRecentOrders();
          console.log("Đã tự động làm mới dữ liệu Dashboard");
        }
      }
    }, 300000);
  });
  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  const isExporting = ref(false);

  const exportExcelReport = async () => {
    isExporting.value = true;
    try {
      const token = localStorage.getItem('token');
      
      let query = '';
      if (currentFilterValue.value && currentFilterValue.value.includes('_')) {
        const [start, end] = currentFilterValue.value.split('_');
        query = `?NgayBatDau=${start}&NgayKetThuc=${end}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/thongke/xuatExcelDoanhThu${query}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Lỗi khi tải file từ Server");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `DoanhThu_FigureCollect_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toastStore.showToast("Xuất báo cáo Excel thành công!", "success");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toastStore.showToast("Không thể xuất báo cáo lúc này!", "error");
    } finally {
      isExporting.value = false;
    }
  };

  const openCustomDatePicker = () => {
    isDropdownOpen.value = false; 
    isCustomModalOpen.value = true; 
  };

  const applyCustomDate = () => {
    if (customStartDate.value && customEndDate.value) {
      const start = customStartDate.value.split('-').reverse().join('/');
      const end = customEndDate.value.split('-').reverse().join('/');
      
      // Cập nhật chữ trên nút
      currentFilterLabel.value = `${start} - ${end}`; 
      currentFilterValue.value = `${customStartDate.value}_${customEndDate.value}`;
      
      isCustomModalOpen.value = false;
      fetchDashboardData(customStartDate.value, customEndDate.value);
    } else {
      toastStore.showToast("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc!", 'error');
    }
  };

  const applyQuickFilter = (type) => {
    const today = new Date();
    let start = new Date();

    switch (type) {
      case 'today':
        currentFilterLabel.value = 'HÔM NAY';
        break;
      case '7d':
        start.setDate(today.getDate() - 7);
        currentFilterLabel.value = '7 NGÀY QUA';
        break;
      case '30d':
        start.setDate(today.getDate() - 30);
        currentFilterLabel.value = '30 NGÀY QUA';
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày mùng 1 của tháng hiện tại
        currentFilterLabel.value = 'THÁNG NÀY';
        break;
    }

    // Định dạng lại ngày theo yyyy-mm-dd
    const startStr = start.toISOString().slice(0, 10);
    const endStr = today.toISOString().slice(0, 10);

    // Lưu lại mốc thời gian để nút Xuất Excel lấy dùng
    currentFilterValue.value = `${startStr}_${endStr}`;
    
    isDropdownOpen.value = false;
    
    // Gọi API cập nhật toàn bộ bảng
    fetchDashboardData(startStr, endStr);
  };
  // Biến lưu ID của dòng đang mở menu. Nếu null nghĩa là không có menu nào mở.
  const activeMenuId = ref(null);
  const toggleMenu = (id) => {
    // Nếu bấm vào chính dòng đang mở -> đóng lại. Nếu bấm dòng khác -> mở dòng đó lên.
    if (activeMenuId.value === id) {
      activeMenuId.value = null;
    } else {
      activeMenuId.value = id;
    }
  };

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

  const getCurrentStatusCode = () => {
    if (!selectedOrder.value || !selectedOrder.value.TrangThaiHienTai) return 0;
    const tenTT = selectedOrder.value.TrangThaiHienTai.TenTrangThai?.toUpperCase() || '';
    
    if (tenTT.includes('CHỜ')) return 1;
    if (tenTT.includes('GÓI')) return 2;
    if (tenTT.includes('VẬN CHUYỂN')) return 3;
    if (tenTT.includes('ĐÃ GIAO')) return 4;
    return updateStatusValue.value; 
  };

  const animateNumber = (targetRef, endValue, duration = 2000, decimals = 0) => {
    let startTimestamp = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Hiệu ứng Easing (easeOutExpo): Chạy nhanh lúc đầu, chậm dần về cuối
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (endValue - startValue) * ease;

      // Cập nhật giá trị với số thập phân tương ứng
      targetRef.value = currentValue.toFixed(decimals);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  };

  const copyTrackingCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toastStore.showToast(`Đã copy mã vận đơn: ${code}`, "success");
    } catch (err) {
      console.error('Lỗi khi copy: ', err);
      toastStore.showToast("Trình duyệt không hỗ trợ copy tự động!", "warning");
    }
  };
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  :deep(.apexcharts-tooltip) {
    white-space: normal !important;
    max-width: 280px; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
    border: 1px solid #f1f5f9 !important;
  }
  :deep(.apexcharts-tooltip-title) {
    font-family: inherit !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    white-space: normal !important;
    word-wrap: break-word;
    padding: 8px 10px !important;
    background: #f8fafc !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }
  :deep(.apexcharts-tooltip-text-y-value) {
    font-weight: 700 !important;
    color: #ff8f73 !important;
  }
  :deep(.apexcharts-tooltip-marker) {
    border-radius: 50% !important;
    margin-right: 8px !important;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
</style>