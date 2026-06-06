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
      
      <main class="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-24">
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 mb-2">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Báo cáo & Thống kê</h1>
            <p class="text-slate-500 text-sm font-medium">Phân tích chi tiết hiệu suất kinh doanh và chiến dịch marketing.</p>
          </div>
          
          <button @click="isExportModalOpen = true" class="w-full xl:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm">
            <span class="material-symbols-outlined text-[20px]">file_download</span>
            Xuất Excel Báo Cáo
          </button>
        </div>

        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">             
          <div class="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-fit border border-slate-200">
            <button @click="setFilterMode('month')" :class="{'bg-white text-[#ff8f73] shadow-sm': filterMode === 'month', 'text-slate-500 hover:bg-white/50': filterMode !== 'month'}" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all">Tháng</button>
            <button @click="setFilterMode('quarter')" :class="{'bg-white text-[#ff8f73] shadow-sm': filterMode === 'quarter', 'text-slate-500 hover:bg-white/50': filterMode !== 'quarter'}" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all">Quý</button>
            <button @click="setFilterMode('year')" :class="{'bg-white text-[#ff8f73] shadow-sm': filterMode === 'year', 'text-slate-500 hover:bg-white/50': filterMode !== 'year'}" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all">Năm</button>
            <button @click="setFilterMode('custom')" :class="{'bg-white text-[#ff8f73] shadow-sm': filterMode === 'custom', 'text-slate-500 hover:bg-white/50': filterMode !== 'custom'}" class="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all">Tùy chỉnh</button>
          </div>

          <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select v-if="filterMode !== 'custom'" v-model="selectedYear" @change="applyTimeFilter" class="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#ff8f73] cursor-pointer">
              <option v-for="y in availableYears" :key="y" :value="y">Năm {{ y }}</option>
            </select>

            <select v-if="filterMode === 'quarter'" v-model="selectedQuarter" @change="applyTimeFilter" class="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#ff8f73] cursor-pointer">
              <option :value="1">Quý 1 (Tháng 1-3)</option>
              <option :value="2">Quý 2 (Tháng 4-6)</option>
              <option :value="3">Quý 3 (Tháng 7-9)</option>
              <option :value="4">Quý 4 (Tháng 10-12)</option>
            </select>

            <select v-if="filterMode === 'month'" v-model="selectedMonth" @change="applyTimeFilter" class="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#ff8f73] cursor-pointer">
              <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
            </select>

            <div v-if="filterMode === 'custom'" class="flex items-center gap-2 animate-fade-in">
              <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <span class="text-xs font-bold text-slate-400 uppercase">Từ</span>
                <input type="date" v-model="startDate" @change="handleDateChange" class="text-sm font-semibold text-slate-700 focus:outline-none"/>
              </div>
              <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <span class="text-xs font-bold text-slate-400 uppercase">Đến</span>
                <input type="date" v-model="endDate" @change="handleDateChange" class="text-sm font-semibold text-slate-700 focus:outline-none"/>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeIn_0.2s_ease-out]" :class="{ 'opacity-50 pointer-events-none transition-opacity': isLoading }">
          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-sky-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">payments</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Tổng Doanh Thu</p>
              <h3 class="text-3xl font-brand font-bold text-slate-900">{{ formatPrice(metrics.totalRevenue) }}</h3>
              <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                Tổng giá trị đơn hàng hoàn thành.
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">trending_up</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">Lợi Nhuận Gộp</p>
              <h3 class="text-3xl font-brand font-bold text-emerald-600">{{ formatPrice(metrics.totalProfit) }}</h3>
              <div class="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Tỷ suất lợi nhuận:</span>
                <span class="text-emerald-500">{{ profitMargin }}%</span>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-purple-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">local_shipping</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Đơn Hoàn Thành</p>
              <h3 class="text-3xl font-brand font-bold text-slate-900">{{ metrics.totalOrders }}</h3>
              <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                Giao dịch ở trạng thái Đã Giao.
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-amber-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">analytics</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Giá Trị Đơn Trung Bình</p>
              <h3 class="text-3xl font-brand font-bold text-slate-900">{{ formatPrice(averageOrderValue) }}</h3>
              <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                Doanh thu bình quân/đơn.
              </div>
            </div>
          </div>
        </div>

        <section class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-[fadeIn_0.2s_ease-out]" :class="{ 'opacity-50 pointer-events-none': isLoading }">
          <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
            <div>
              <h4 class="text-lg font-brand font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73]">monitoring</span> Phân Tích Xu Hướng Tài Chính
              </h4>
              <p class="text-xs text-slate-500 mt-1 font-medium">Tương quan biến động giữa dòng tiền Doanh thu và Biên độ Lợi nhuận gộp.</p>
            </div>
          </div>
          <div class="h-80 w-full">
            <VueApexCharts :key="chartType" :type="chartType" height="100%" :options="chartFinanceOptions" :series="chartFinanceSeries" />
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out]" :class="{ 'opacity-50 pointer-events-none': isLoading }">  
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h4 class="text-sm font-bold text-slate-900">Thống Kê Theo Danh Mục</h4>
              <p class="text-xs text-slate-500 font-medium mt-1">Xếp hạng sản lượng tiêu thụ và lợi nhuận.</p>
            </div>
            <div class="overflow-x-auto flex-1 custom-scrollbar">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Tên Danh Mục</th>
                    <th class="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">SL Bán</th>
                    <th class="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Lợi Nhuận</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="dm in productData.categories" :key="dm.MaDM" class="hover:bg-slate-50/80 transition-colors">
                    <td class="px-8 py-4 font-bold text-slate-900 text-sm">{{ dm.TenDM }}</td>
                    <td class="px-8 py-4 text-center">
                      <span class="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{{ dm.TongSoSP }}</span>
                    </td>
                    <td class="px-8 py-4 text-right font-bold text-emerald-500 text-sm">{{ formatPrice(dm.TongLoiNhuan) }}</td>
                  </tr>
                  <tr v-if="productData.categories.length === 0">
                    <td colspan="3" class="px-8 py-8 text-center text-slate-500 font-medium italic text-sm">Không có dữ liệu trong kỳ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
              <h4 class="text-sm font-bold text-slate-900">Thống Kê Theo Thương Hiệu</h4>
              <p class="text-xs text-slate-500 font-medium mt-1">Sức hút thương mại của các hãng Figure.</p>
            </div>
            <div class="overflow-x-auto flex-1 custom-scrollbar">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Thương Hiệu</th>
                    <th class="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">SL Bán</th>
                    <th class="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Lợi Nhuận</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="hsx in productData.brands" :key="hsx.MaHSX" class="hover:bg-slate-50/80 transition-colors">
                    <td class="px-8 py-4 font-bold text-slate-900 text-sm">{{ hsx.TenHSX }}</td>
                    <td class="px-8 py-4 text-center">
                      <span class="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{{ hsx.TongSoSP }}</span>
                    </td>
                    <td class="px-8 py-4 text-right font-bold text-emerald-500 text-sm">{{ formatPrice(hsx.TongLoiNhuan) }}</td>
                  </tr>
                  <tr v-if="productData.brands.length === 0">
                    <td colspan="3" class="px-8 py-8 text-center text-slate-500 font-medium italic text-sm">Không có dữ liệu trong kỳ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8" :class="{ 'opacity-50 pointer-events-none': isLoading }">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h4 class="text-base font-bold text-slate-900">Cảnh Báo Tồn Kho</h4>
                <p class="text-xs text-slate-400 font-medium">Sản phẩm có mức tồn kho thấp (dưới 5) cần nhập gấp.</p>
              </div>
              <span class="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-lg">inventory_2</span>
            </div>
            <div class="p-0 overflow-y-auto overflow-x-auto custom-scrollbar flex-1"> 
              <table class="w-full text-left border-collapse relative">
                <thead class="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th class="p-3 font-semibold">Sản Phẩm</th>
                    <th class="p-3 font-semibold text-center w-24">Phân Loại</th>
                    <th class="p-3 font-semibold text-right w-20">Tồn Kho</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr v-for="item in inventoryWarnings" :key="item.MaPhanLoai" class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-3">
                      <div class="flex items-center gap-3">
                        <img :src="(item.AnhDaiDien && item.AnhDaiDien.startsWith('http')) ? item.AnhDaiDien : '${API_BASE_URL}/Images_product/' + item.AnhDaiDien" class="w-10 h-10 rounded object-cover border border-slate-200 shadow-sm" alt="IMG">
                        <p class="font-bold text-slate-900 text-xs line-clamp-2 max-w-[200px]" :title="item.TenMH">{{ item.TenMH }}</p>
                      </div>
                    </td>
                    <td class="p-3 text-center">
                      <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] uppercase tracking-wider">{{ item.ChiTietPhanLoai }}</span>
                    </td>
                    <td class="p-3 text-right">
                      <span class="font-bold px-2 py-1 rounded" :class="item.SoLuong === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'">
                        {{ item.SoLuong }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!inventoryWarnings || inventoryWarnings.length === 0">
                    <td colspan="3" class="text-center p-6 text-slate-400">
                      Tình trạng kho ổn định.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h4 class="text-base font-bold text-slate-900">Sản Phẩm Yêu Thích Nhất</h4>
                <p class="text-xs text-slate-400 font-medium">Bảng xếp hạng dựa trên điểm đánh giá của khách hàng.</p>
              </div>
              <span class="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-lg">star</span>
            </div>
            
            <div class="flex-1 space-y-3 mb-6 overflow-y-auto custom-scrollbar pr-2">
              <div v-for="(review, index) in topReviews" :key="review.MaMoHinh" class="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div class="font-headline font-bold text-slate-300 text-xl w-4">{{ index + 1 }}</div>
                
                <img :src="(review.AnhDaiDien && review.AnhDaiDien.startsWith('http')) ? review.AnhDaiDien : '${API_BASE_URL}/Images_product/' + review.AnhDaiDien" class="w-12 h-12 rounded object-cover border border-slate-200">
                <div class="flex-1">
                  <p class="text-xs font-bold text-slate-900 line-clamp-1" :title="review.TenMH">{{ review.TenMH }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex items-center text-amber-400 text-[14px]">
                      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
                      <span class="text-slate-700 font-bold ml-1">{{ review.DiemTB }}</span>
                    </div>
                    <span class="text-[10px] text-slate-400">({{ review.LuotDanhGia }} lượt đánh giá)</span>
                  </div>
                </div>
              </div>
              <div v-if="!topReviews || topReviews.length === 0" class="text-center text-sm text-slate-400 py-6">
                Chưa có đánh giá nào trong kỳ.
              </div>
            </div>

            <div class="mt-auto">
              <h5 class="text-sm font-bold text-slate-800 mb-3 border-t border-slate-100 pt-4">Tỷ Lệ Thất Thoát Đơn Hàng</h5>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 border border-rose-100 bg-rose-50/50 rounded-lg">
                  <p class="text-xs font-bold text-rose-600 uppercase mb-1">Hủy bởi khách</p>
                  <div class="flex items-end gap-2">
                    <span class="text-xl font-headline font-bold text-rose-600">{{ orderStats.cancelRate || 0 }}%</span>
                    <span class="text-xs text-slate-500 font-medium mb-1">({{ orderStats.cancelCount || 0 }} đơn)</span>
                  </div>
                </div>
                <div class="p-3 border border-amber-100 bg-amber-50/50 rounded-lg">
                  <p class="text-xs font-bold text-amber-600 uppercase mb-1">Hoàn hàng / Trả hàng</p>
                  <div class="flex items-end gap-2">
                    <span class="text-xl font-headline font-bold text-amber-600">{{ orderStats.returnRate || 0 }}%</span>
                    <span class="text-xs text-slate-500 font-medium mb-1">({{ orderStats.returnCount || 0 }} đơn)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section> 
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div class="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h3 class="text-lg font-bold text-slate-900">Top mô hình bán chạy nhất</h3>
                    <p class="text-xs text-slate-400 font-medium">Xếp hạng theo số lượng sản phẩm tiêu thụ thực tế</p>
                  </div>
                </div>

                <div class="overflow-x-auto overflow-y-auto max-h-[310px] custom-scrollbar pr-1 relative">
                  <table class="w-full text-left border-collapse relative">
                    <thead class="sticky top-0 bg-white z-10 shadow-sm">
                      <tr class="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th class="pb-3 pl-2">Mô hình</th>
                        <th class="pb-3 text-center">Số lượng bán</th>
                        <th class="pb-3 text-right pr-2">Doanh thu thu về</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                      <tr v-for="product in topProducts" :key="product.id" class="group hover:bg-slate-50/50 transition-colors">
                        <td class="py-3.5 pl-2 flex items-center gap-3">
                          <img :src="product.image" class="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm" />
                          <div>
                            <p class="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#ff8f73] transition-colors">{{ product.name }}</p>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 mt-0.5">{{ product.categoryName }}</span>
                          </div>
                        </td>
                        <td class="py-3.5 text-center font-semibold text-slate-700">{{ product.quantity }}</td>
                        <td class="py-3.5 text-right font-bold text-emerald-600 pr-2">{{ formatPrice(product.revenue) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">Cơ cấu trạng thái đơn hàng</h3>
                <p class="text-xs text-slate-400 font-medium mb-6">Tỷ lệ phần trăm và số lượng trạng thái xử lý đơn</p>
                
                <div class="relative flex justify-center items-center min-h-[260px]">
                  <div v-if="isStatusLoading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <div class="w-8 h-8 border-4 border-[#ff8f73] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  
                  <VueApexCharts 
                    v-if="orderChartSeries.length > 0"
                    width="100%" 
                    type="donut" 
                    :options="orderChartOptions" 
                    :series="orderChartSeries"
                  ></VueApexCharts>
                  
                  <div v-else class="text-center text-slate-400 py-12 text-sm font-medium">
                    Không có dữ liệu đơn hàng trong kỳ này
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]" :class="{ 'opacity-50 pointer-events-none': isLoading }">
          <div class="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
            <h4 class="text-lg font-brand font-bold text-slate-900">Hiệu Quả Chiến Dịch Ưu Đãi</h4>
            <p class="text-xs text-slate-500 mt-1 font-medium">Bóc tách doanh thu, số tiền thất thoát và lợi nhuận ròng thu về từ mã giảm giá.</p>
          </div>
          
          <div class="overflow-x-auto min-h-[200px] custom-scrollbar">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Chương Trình / Mã Code</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">Lượt Dùng</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Tổng Tiền Đã Giảm</th>
                  <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Lợi Nhuận Sau Giảm</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="promo in marketingData" :key="promo.MaGG" class="hover:bg-slate-50/80 transition-colors group">
                  <td class="px-8 py-4">
                    <p class="font-bold text-slate-900 text-sm">{{ promo.TenMaGiamGia }}</p>
                  </td>
                  <td class="px-8 py-4 text-center">
                    <span class="text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">{{ promo.TongDonHang }}</span>
                  </td>
                  <td class="px-8 py-4 text-right">
                    <span class="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">-{{ formatPrice(promo.TongTienDaGiam) }}</span>
                  </td>
                  <td class="px-8 py-4 text-right font-bold text-emerald-500 text-sm">{{ formatPrice(promo.LoiNhuanRong) }}</td>
                </tr>
                <tr v-if="marketingData.length === 0">
                  <td colspan="4" class="px-8 py-10 text-center">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <span class="material-symbols-outlined text-3xl text-slate-300">loyalty</span>
                    </div>
                    <p class="text-sm text-slate-500 font-medium">Không có dữ liệu ghi nhận chiến dịch marketing nào trong kỳ này.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
  <div v-if="isExportModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 class="font-bold text-lg text-slate-900">Tùy chọn xuất dữ liệu</h3>
          <p class="text-xs text-slate-500 font-medium">Chọn các trang (sheet) bạn muốn đưa vào báo cáo</p>
        </div>
        <button @click="isExportModalOpen = false" class="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-6 space-y-3">
        <label v-for="option in reportOptions" :key="option.id" 
              class="flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all"
              :class="selectedReports.includes(option.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-300'">
          
          <input type="checkbox" :value="option.id" v-model="selectedReports" 
                class="mt-1 w-5 h-5 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" />
          
          <div class="flex-1">
            <p class="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-slate-400">{{ option.icon }}</span>
              {{ option.label }}
            </p>
            <p class="text-xs text-slate-500 mt-0.5">{{ option.desc }}</p>
          </div>
        </label>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button @click="isExportModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          Hủy bỏ
        </button>
        <button @click="exportExcelReport" class="px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Bắt đầu xuất
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import VueApexCharts from 'vue3-apexcharts';
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";

  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const topProducts = ref([]);
  const inventoryWarnings = ref([]); 
  const topReviews = ref([]);
  const orderStats = ref({ cancelRate: 0, cancelCount: 0, returnRate: 0, returnCount: 0 });
  const orderStatusData = ref([]);
  const isStatusLoading = ref(false);

  const isLoading = ref(false);
  const startDate = ref('');
  const endDate = ref('');

  const metrics = ref({ totalRevenue: 0, totalProfit: 0, totalOrders: 0 });
  const productData = ref({ categories: [], brands: [] });
  const marketingData = ref([]);
  const filterMode = ref('month'); 
  
  const currentYearObj = new Date().getFullYear();
  const availableYears = ref(Array.from({ length: 5 }, (_, i) => currentYearObj - i));
  
  const selectedYear = ref(currentYearObj);
  const selectedMonth = ref(new Date().getMonth() + 1);
  const selectedQuarter = ref(Math.ceil((new Date().getMonth() + 1) / 3));
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const setFilterMode = (mode) => {
    filterMode.value = mode;
    applyTimeFilter();
  };

  const applyTimeFilter = () => {
    let start = '';
    let end = '';

    if (filterMode.value === 'year') {
      start = `${selectedYear.value}-01-01`;
      end = `${selectedYear.value}-12-31`;
    } 
    else if (filterMode.value === 'quarter') {
      const q = selectedQuarter.value;
      const startMonth = (q - 1) * 3 + 1; 
      const endMonth = q * 3;             
      const lastDay = new Date(selectedYear.value, endMonth, 0).getDate();
      
      start = `${selectedYear.value}-${String(startMonth).padStart(2, '0')}-01`;
      end = `${selectedYear.value}-${String(endMonth).padStart(2, '0')}-${lastDay}`;
    } 
    else if (filterMode.value === 'month') {
      const m = selectedMonth.value;
      const lastDay = new Date(selectedYear.value, m, 0).getDate();
      
      start = `${selectedYear.value}-${String(m).padStart(2, '0')}-01`;
      end = `${selectedYear.value}-${String(m).padStart(2, '0')}-${lastDay}`;
    }

    if (filterMode.value !== 'custom') {
      startDate.value = start;
      endDate.value = end;
      loadReportsData(); 
    }
  };

  const handleCustomDateChange = () => {
    if (startDate.value && endDate.value) {
      if (new Date(startDate.value) > new Date(endDate.value)) {
        toastStore.showToast("Ngày bắt đầu không được lớn hơn ngày kết thúc!", "error");
        return;
      }
      loadReportsData();
    }
  };

  // Các state quản lý Modal xuất file
  const isExportModalOpen = ref(false);
  const selectedReports = ref(['doanhthu', 'sanpham', 'marketing', 'tonkho']);

  const reportOptions = [
    { id: 'doanhthu', label: 'Tổng quan & Tài chính', icon: 'payments', desc: 'Bao gồm KPI doanh thu, lợi nhuận và biểu đồ.' },
    { id: 'sanpham', label: 'Danh mục & Thương hiệu', icon: 'category', desc: 'Sản lượng và cơ cấu sinh lời theo danh mục/hãng.' },
    { id: 'marketing', label: 'Hiệu quả Marketing', icon: 'campaign', desc: 'Thống kê hiệu quả chiến dịch và mã giảm giá.' },
    { id: 'tonkho', label: 'Cảnh báo vận hành', icon: 'inventory_2', desc: 'Cảnh báo tồn kho thấp và sản phẩm yêu thích.' }
  ];

  const chartType = computed(() => {
    if (filterMode.value === 'year') {
      return 'area';
    }
    
    if (filterMode.value === 'custom' && startDate.value && endDate.value) {
      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        return 'area';
      }
    }
    return 'bar';
  });

  watch(chartType, (newType) => {
    if (chartFinanceOptions.value && chartFinanceOptions.value.chart) {
      chartFinanceOptions.value.chart.type = newType;
    }
  });

  const chartFinanceSeries = ref([
    { name: 'Doanh thu ngày', data: [] },
    { name: 'Lợi nhuận ngày', data: [] }
  ]);
  const chartFinanceOptions = ref({
    chart: { type: 'bar', height: 320, toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#ff8f73', '#10b981'], 
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, curve: 'smooth' },
    xaxis: { categories: [], labels: { style: { colors: '#94a3b8', fontWeight: 600 } } },
    yaxis: { 
      labels: { 
        formatter: (val) => new Intl.NumberFormat('vi-VN').format(Math.round(val)), 
        style: { colors: '#94a3b8', fontWeight: 600 } 
      } 
    },   
    fill: { opacity: 1 },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    tooltip: { y: { formatter: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) } }
  });

  const orderChartOptions = ref({
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: [], 
    colors: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#64748b', '#8b5cf6'], 
    legend: { position: 'bottom', fontSize: '13px', fontWeight: 500, labels: { colors: '#475569' } },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%";
      },
      style: {
        fontSize: '11px',
        fontWeight: '700',
        colors: ['#fff']
      },
      dropShadow: { enabled: false },
      minAngleToShowLabel: 15
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Tổng đơn',
              color: '#1e293b',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    tooltip: { y: { formatter: function (val) { return val + " đơn hàng"; }}}
  });

  const orderChartSeries = ref([]);

  const profitMargin = computed(() => {
    if (!metrics.value.totalRevenue) return 0;
    return ((metrics.value.totalProfit / metrics.value.totalRevenue) * 100).toFixed(1);
  });

  const averageOrderValue = computed(() => {
    if (!metrics.value.totalOrders) return 0;
    return (metrics.value.totalRevenue / metrics.value.totalOrders);
  });

  const loadReportsData = async () => {
    isLoading.value = true;
    try {
      const token = localStorage.getItem('token');
      let query = '';
      if (startDate.value && endDate.value) {
        query = `?NgayBatDau=${startDate.value}&NgayKetThuc=${endDate.value}`;
      }

      const resRevenue = await fetch(`${API_BASE_URL}/api/thongke/doanhthu${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataRevenue = await resRevenue.json();
      if (dataRevenue.success && dataRevenue.data) {
        metrics.value.totalRevenue = dataRevenue.data.TongDoanhThu;
        metrics.value.totalProfit = dataRevenue.data.TongLoiNhuan;
        metrics.value.totalOrders = dataRevenue.data.TongSoDonHang;
      }

      const resProducts = await fetch(`${API_BASE_URL}/api/thongke/sanpham${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataProducts = await resProducts.json();
      if (dataProducts.success && dataProducts.data) {
        productData.value.categories = dataProducts.data.topDanhMuc || [];
        productData.value.brands = dataProducts.data.topHSX || [];
      }

      const resPromo = await fetch(`${API_BASE_URL}/api/thongke/khuyenmai${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataPromo = await resPromo.json();
      if (dataPromo.success && dataPromo.data) {
        marketingData.value = dataPromo.data.topmagg || [];
      }

      const resChart = await fetch(`${API_BASE_URL}/api/thongke/bieudo${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataChart = await resChart.json();
      if (dataChart.success && dataChart.data) {
        const categories = dataChart.data.map(item => item.Ngay);
        const revenues = dataChart.data.map(item => item.DoanhThuNgay);
        const profits = dataChart.data.map(item => item.LoiNhuanNgay);

        chartFinanceSeries.value = [
          { name: 'Doanh thu', data: revenues },
          { name: 'Lợi nhuận gộp', data: profits }
        ];
        chartFinanceOptions.value = { ...chartFinanceOptions.value, xaxis: { categories } };
      }

      const resExtra = await fetch(`${API_BASE_URL}/api/thongke/bosung${query}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const dataExtra = await resExtra.json();
      
      if (dataExtra.success && dataExtra.data) {
        inventoryWarnings.value = dataExtra.data.inventoryWarnings || [];
        topReviews.value = dataExtra.data.topReviews || []; 
        orderStats.value = dataExtra.data.orderStats || { cancelRate: 0, cancelCount: 0, returnRate: 0, returnCount: 0 };
      }

      const resTop = await fetch(`${API_BASE_URL}/api/thongke/top-san-pham${query}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (resTop.ok) {
        const dataTop = await resTop.json();
        topProducts.value = dataTop.data || [];
      }

      const res = await fetch(`${API_BASE_URL}/api/thongke/donhang${query}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();

      if (result.success && result.data) {
        orderStatusData.value = result.data;
        
        orderChartSeries.value = result.data.map(item => item.SoLuongDon);
        orderChartOptions.value = {
          ...orderChartOptions.value,
          labels: result.data.map(item => item.TenTrangThai)
        };
      }
    } 
    catch (error) {
      console.error("Lỗi khi tải báo cáo hệ thống:", error);
      toastStore.showToast("Không thể tải toàn bộ dữ liệu thống kê lúc này!", "error");
    } 
    finally {
      isLoading.value = false;
    }
  };

  const exportExcelReport = async () => {
    if (selectedReports.value.length === 0) {
      toastStore.showToast("Vui lòng chọn ít nhất một loại báo cáo để xuất!", "warning");
      return;
    }

    try {
      toastStore.showToast("Đang tạo file Excel, vui lòng đợi...", "info"); // Có thể thêm trạng thái loading
      const token = localStorage.getItem('token');
      
      // Gắn thời gian
      let query = '';
      if (startDate.value && endDate.value) {
        query = `NgayBatDau=${startDate.value}&NgayKetThuc=${endDate.value}&`;
      }
      
      // Nối các loại báo cáo thành chuỗi (vd: types=doanhthu,marketing)
      const typesParam = selectedReports.value.join(',');
      query += `types=${typesParam}`;

      const response = await fetch(`${API_BASE_URL}/api/thongke/xuat-excel-tuy-chinh?${query}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Thất bại");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_TBC_FigureCollect_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toastStore.showToast("Đã tải tệp Excel báo cáo thành công!", "success");
      isExportModalOpen.value = false; 
    } 
    catch (error) {
      toastStore.showToast("Gặp sự cố khi kết nối server xuất file!", "error");
    }
  };

  const formatPrice = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
    applyTimeFilter();
  });
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>