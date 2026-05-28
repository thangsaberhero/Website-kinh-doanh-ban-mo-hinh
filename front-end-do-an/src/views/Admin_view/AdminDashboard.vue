<template>
  <div @click="layoutStore.closeMobileMenu; activeMenuId = null; isDropdownOpen = false" class="print:hidden bg-slate-100 min-h-screen font-body flex w-full text-slate-800">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>
    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
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
                  <td class="px-8 py-5 font-headline font-bold text-sm text-slate-900">#{{ order.id }}</td>
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600">
                        {{ order.avatarText }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-slate-900">{{ order.customerName }}</p>
                        <p class="text-[11px] text-slate-500">{{ order.email }}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-8 py-5 text-center">
                    <span :class="`text-[10px] font-bold px-3 py-1.5 rounded-full border ${getOrderStatusBadge(order.status).class}`">
                      {{ getOrderStatusBadge(order.status).text }}
                    </span>
                  </td>
                  
                  <td class="px-8 py-5 text-right font-headline font-bold text-sm text-slate-900">{{ order.total }}</td>
                  
                  <td class="px-8 py-5 text-center relative">
                    <button 
                      @click.stop="toggleMenu(order.id)" 
                      class="text-slate-400 hover:text-[#ff8f73] p-1 rounded transition-colors focus:outline-none focus:bg-slate-100"
                    >
                      <span class="material-symbols-outlined text-lg">more_vert</span>
                    </button>

                    <div 
                      v-show="activeMenuId === order.id"
                      class="absolute right-8 w-40 bg-white rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-slate-100 py-1 z-50 text-left overflow-hidden"
                      :class="index >= recentOrders.length - 2 ? 'bottom-8' : 'top-10'"
                    >
                      <button @click="handleOrderAction('detail', order.id)" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">visibility</span> Xem chi tiết
                      </button>
                      <button @click="handleOrderAction('update', order.id, order.status)" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">edit_document</span> Cập nhật
                      </button>
                      <button @click="handleOrderAction('print', order.id)" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">print</span> In hóa đơn
                      </button>
                      <div class="border-t border-slate-100 my-1"></div>
                      <button @click="handleOrderAction('cancel', order.id)" class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">cancel</span> Hủy đơn
                      </button>
                    </div>
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
          Chi tiết đơn hàng <span class="text-[#ff8f73]">#{{ selectedOrder.MaDH }}</span>
        </h3>
        <button @click="isDetailModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-8 space-y-6 flex-1">
        <div class="border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-sm">
          <div class="p-4 bg-slate-50/50">
            <p class="text-slate-400 font-medium mb-1">Ngày đặt</p>
            <p class="font-semibold text-slate-800">{{ new Date(selectedOrder.ThongTinGiaoHang?.NgayLapDon).toLocaleString('vi-VN') }}</p>
          </div>
          <div class="p-4 bg-slate-50/50">
            <p class="text-slate-400 font-medium mb-1">Trạng thái đơn</p>
            <span :class="`text-xs font-bold px-2.5 py-1 rounded-full border ${getOrderStatusBadge(selectedOrder.Trang_thai_don_hang?.[0]?.TenTrangThai).class}`">
              {{ getOrderStatusBadge(selectedOrder.Trang_thai_don_hang?.[0]?.TenTrangThai).text }}
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

        <div>
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Lịch sử thanh toán</h4>
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th class="p-4">Mã tham chiếu</th>
                  <th class="p-4">Đối tác</th>
                  <th class="p-4 text-right">Số tiền</th>
                  <th class="p-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="text-slate-700 font-medium">
                  <td class="p-4 text-slate-400">{{ selectedOrder.ThongTinGiaoHang?.MaVoucher || 'Không áp dụng mã' }}</td>
                  <td class="p-4 font-bold text-blue-600">COD / MOMO</td>
                  <td class="p-4 text-right font-bold">{{ formatPrice(selectedOrder.ThongTinGiaoHang?.ThanhTien) }}</td>
                  <td class="p-4 text-center">
                    <span class="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] px-2 py-0.5 rounded font-bold">SUCCESS</span>
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
                  <th class="p-4">Sản phẩm</th>
                  <th class="p-4">Phân loại</th>
                  <th class="p-4 text-right">Đơn giá</th>
                  <th class="p-4 text-center">SL</th>
                  <th class="p-4 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, index) in selectedOrder.DanhSachHang" :key="item.MaMH || index" class="text-slate-700 font-medium">
                  <td class="p-4 font-bold text-slate-900">{{ item.TenMH }}</td>
                  <td class="p-4"><span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{{ item.ChiTietPhanLoai || 'Tiêu chuẩn' }}</span></td>
                  <td class="p-4 text-right">{{ formatPrice(item.DonGiaBan) }}</td>
                  <td class="p-4 text-center font-bold">{{ item.SoLuong }}</td>
                  <td class="p-4 text-right text-rose-500 font-bold">{{ formatPrice(item.DonGiaBan * item.SoLuong) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex justify-end">
          <div class="w-80 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
            <div class="flex justify-between text-slate-500"><span>Tổng tiền hàng:</span><span class="font-semibold text-slate-800">{{ formatPrice(selectedOrder.ThongTinGiaoHang?.TongTien) }}</span></div>
            <div class="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span class="font-bold text-slate-900 text-base">Tổng thanh toán:</span>
              <span class="font-headline font-bold text-rose-600 text-xl">{{ formatPrice(selectedOrder.ThongTinGiaoHang?.ThanhTien) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
        <button @click="isCancelModalOpen = true; cancelReasonValue = ''" class="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold rounded-lg transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[18px]">cancel</span> Hủy đơn này
        </button>
        <div class="flex gap-2">
          <button @click="handleOrderAction('print', order.id)" class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-bold rounded-lg transition-all flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">print</span> In hóa đơn
          </button>
          <button @click="updateStatusValue = selectedOrder.TrangThaiDonHang; isUpdateModalOpen = true" class="px-4 py-2 bg-[#ff8f73] hover:bg-[#ff7352] text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">edit_document</span> Đổi trạng thái
          </button>
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

  <div v-if="selectedOrder" class="hidden print:block print-container p-10 font-sans text-slate-900">
    <div class="text-center border-b-2 border-slate-900 pb-4 mb-6">
      <h1 class="text-2xl font-bold uppercase tracking-wider">Hóa Đơn Bán Hàng FigureCollect</h1>
      <p class="text-xs mt-1">Đơn vị chuyên mô hình Anime & Hobby chính hãng</p>
      <p class="text-sm font-bold mt-2">Mã Đơn Hàng: #{{ selectedOrder.MaDH }}</p>
    </div>
    
    <div class="grid grid-cols-2 gap-4 text-sm mb-6">
      <div>
        <p><span class="font-bold">Khách hàng:</span> {{ selectedOrder.ThongTinGiaoHang?.TenNguoiNhan }}</p>
        <p><span class="font-bold">Số điện thoại:</span> {{ selectedOrder.ThongTinGiaoHang?.SDTNguoiNhan }}</p>
      </div>
      <div>
        <p><span class="font-bold">Ngày lập:</span> {{ new Date(selectedOrder.ThongTinGiaoHang?.NgayLapDon).toLocaleString('vi-VN') }}</p>
        <p><span class="font-bold">Địa chỉ:</span> {{ selectedOrder.ThongTinGiaoHang?.DiaChiGiao }}</p>
      </div>
    </div>

    <table class="w-full text-left border-collapse border border-slate-400 text-sm mb-6">
      <tbody>
        <tr v-for="(item, index) in selectedOrder.DanhSachHang" :key="item.MaMH || index">
          <td class="p-2 border border-slate-400 font-bold">{{ item.TenMH }}</td>
          <td class="p-2 border border-slate-400 text-right">{{ formatPrice(item.DonGiaBan) }}</td>
          <td class="p-2 border border-slate-400 text-center font-bold">{{ item.SoLuong }}</td>
          <td class="p-2 border border-slate-400 text-right font-bold">{{ formatPrice(item.DonGiaBan * item.SoLuong) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-end text-sm">
      <div class="w-64 space-y-2 border-t border-slate-900 pt-2">
        <div class="flex justify-between"><span>Tiền hàng:</span><span>{{ formatPrice(selectedOrder.ThongTinGiaoHang?.TongTien) }}</span></div>
        <div class="flex justify-between font-bold text-base border-t border-dashed pt-1"><span>Thành tiền:</span><span>{{ formatPrice(selectedOrder.ThongTinGiaoHang?.ThanhTien) }}</span></div>
      </div>
    </div>
    
    <div class="text-center text-xs italic mt-20 border-t border-slate-200 pt-4">
      Cảm ơn bạn đã ủng hộ FigureCollect! Chúc bạn có những phút giây trải nghiệm mô hình tuyệt vời.
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
      updateStatusValue.value = currentStatus; 
      isUpdateModalOpen.value = true;
    } 
    else if (action === 'cancel') {
      cancelReasonValue.value = ''; 
      isCancelModalOpen.value = true;
    } 
    else if (action === 'print') {
      setTimeout(() => {
        window.print();
      }, 300);
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
        method: 'PUT',
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

        animateNumber(newOrders, dataDoanhThu.data.TongSoDonHang, 1500, 0);
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
              avatarText: customerName.charAt(0).toUpperCase(),
              customerName: customerName,
              email: order.SDTNguoiNhan || 'Không có SĐT', 
              status: order.TrangThai, 
              total: formatPrice(order.ThanhTien)
            };
          });
        }
      }
    } catch (error) {
      console.error("Lỗi lấy đơn hàng gần đây:", error);
    }
  };

  onMounted(() => {
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

  const viewOrder = (id) => {
    router.push(`/admin/orders/${id}`);
  };

  const cancelOrder = async (id) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${id} không? Hành động này không thể hoàn tác.`)) {
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
        body: JSON.stringify({ MaDH: id }) 
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toastStore.showToast('Đã hủy đơn hàng thành công', 'success');
        fetchRecentOrders();
      } 
      else {
        toastStore.showToast(result.message || "Lỗi khi hủy đơn hàng!", 'error');
      }
    } 
    catch (error) {
      console.error("Lỗi hủy đơn:", error);
      toastStore.showToast("Không thể kết nối đến máy chủ.", 'error');
    }
  };

  const getOrderStatusBadge = (status) => {
    const s = status?.toUpperCase() || '';
    
    if (s === 'ĐÃ GIAO') return { class: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: 'ĐÃ GIAO' };
    if (s === 'CHỜ DUYỆT' || s === 'ĐANG ĐÓNG GÓI') return { class: 'bg-amber-50 text-amber-600 border-amber-100', text: 'ĐANG XỬ LÝ' };
    if (s === 'ĐANG VẬN CHUYỂN') return { class: 'bg-sky-50 text-sky-600 border-sky-100', text: 'ĐANG GIAO' };
    if (s === 'ĐÃ HỦY') return { class: 'bg-rose-50 text-rose-600 border-rose-100', text: 'ĐÃ HỦY' };
    
    return { class: 'bg-slate-50 text-slate-600 border-slate-100', text: status };
  };

  const getCurrentStatusCode = () => {
    if (!selectedOrder.value) return 0;
    if (selectedOrder.value.Trang_thai_don_hang && selectedOrder.value.Trang_thai_don_hang.length > 0) {
       const tenTT = selectedOrder.value.Trang_thai_don_hang[0].TenTrangThai?.toUpperCase() || '';
       if (tenTT.includes('CHỜ')) return 1;
       if (tenTT.includes('GÓI')) return 2;
       if (tenTT.includes('VẬN CHUYỂN')) return 3;
       if (tenTT.includes('ĐÃ GIAO')) return 4;
    }
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