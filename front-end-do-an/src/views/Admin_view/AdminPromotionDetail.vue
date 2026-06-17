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
      <main class="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-24">
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Nội dung chính - chỉ hiển thị khi có data -->
        <template v-else-if="detailData">
          <div class="flex items-center gap-4 border-b border-slate-200 pb-4">
            <button @click="$router.push('/admin/promotion')" class="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-primary transition-all shadow-sm">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider"
                      :class="promoType === 'campaign' ? 'bg-orange-50 text-primary border border-orange-200' : 'bg-purple-50 text-purple-600 border border-purple-200'">
                  {{ promoType === 'campaign' ? 'Khuyến mãi hệ thống' : 'Mã Voucher' }}
                </span>
              </div>
              <h1 class="text-2xl font-brand font-bold text-slate-900 mt-1">
                {{ detailData.TenKM || detailData.TenMaGiamGia || 'Đang tải...' }}
              </h1>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <span class="material-symbols-outlined text-slate-400 text-3xl">calendar_today</span>
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thời gian áp dụng</p>
                <p class="text-xs font-bold text-slate-700 mt-1">Từ: {{ formatDate(detailData.ThoiGianBD) }}</p>
                <p class="text-xs font-bold text-slate-700">Đến: {{ formatDate(detailData.ThoiGianKT) }}</p>
              </div>
            </div>

            <div v-if="promoType === 'voucher'" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <span class="material-symbols-outlined text-purple-400 text-3xl">confirmation_number</span>
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cấu hình mã code</p>
                <p class="text-sm font-black text-slate-900 mt-1">MÃ: {{ detailData.MaVoucher }}</p>
                <p class="text-xs font-medium text-slate-500">Đơn tối thiểu: {{ formatCurrency(detailData.MucGiaToiThieu) }}</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <span class="material-symbols-outlined text-emerald-400 text-3xl">analytics</span>
              <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Trạng thái vận hành</p>
                <p class="text-sm font-bold mt-1" :class="detailData.TrangThaiHoatDong === 1 ? 'text-emerald-600' : 'text-slate-400'">
                  {{ detailData.TrangThaiHoatDong === 1 ? 'Đang kích hoạt' : 'Đang tạm ẩn' }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div class="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <span class="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Doanh thu mang lại</p>
                <h3 class="text-xl font-black text-slate-900 mt-1">
                  {{ formatCurrency(detailData.TongDoanhThuMangLai) }}
                </h3>
                <p class="text-[11px] text-slate-400 font-medium mt-0.5">Từ {{ detailData.TongSoDonHang || 0 }} đơn hàng thành công</p>
              </div>
            </div>

            <div class="bg-gradient-to-br from-rose-50 to-white p-5 rounded-2xl border border-rose-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <span class="material-symbols-outlined text-2xl">price_check</span>
              </div>
              <div>
                <p class="text-[10px] text-rose-600 font-bold uppercase tracking-widest">Chi phí đã giảm (Marketing)</p>
                <h3 class="text-xl font-black text-rose-600 mt-1">
                  -{{ formatCurrency(detailData.TongTienDaGiam) }}
                </h3>
                <p class="text-[11px] text-slate-400 font-medium mt-0.5">Tổng số tiền đã trợ giá</p>
              </div>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                <span class="material-symbols-outlined text-2xl">monitoring</span>
              </div>
              <div>
                <p class="text-[10px] text-purple-600 font-bold uppercase tracking-widest">Tỷ lệ Chi phí / Doanh thu</p>
                <h3 class="text-xl font-black text-purple-700 mt-1">
                  {{ costToRevenueRatio }}%
                </h3>
                
                <p v-if="costToRevenueRatio === 0" class="text-[11px] font-medium mt-0.5 text-slate-400">
                  Chưa có dữ liệu
                </p>
                <p v-else-if="costToRevenueRatio <= 15" class="text-[11px] font-medium mt-0.5 text-emerald-600">
                  ✅ Rất hiệu quả (Chi phí thấp)
                </p>
                <p v-else-if="costToRevenueRatio <= 30" class="text-[11px] font-medium mt-0.5 text-amber-600">
                  ⚠️ Chấp nhận được (Mục tiêu xả kho)
                </p>
                <p v-else class="text-[11px] font-medium mt-0.5 text-rose-600 animate-pulse">
                  🚨 Đang đốt tiền (Cần xem xét lại)
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit border border-slate-200">
            <button @click="activeSubTab = 'products'" :class="activeSubTab === 'products' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'" class="px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">category</span> Sản phẩm áp dụng
            </button>
            <button @click="activeSubTab = 'logs'" :class="activeSubTab === 'logs' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'" class="px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">history</span> Lịch sử sử dụng
            </button>
          </div>

          <!-- Tab Sản phẩm -->
          <div v-if="activeSubTab === 'products'" class="space-y-4">
            <div class="flex justify-end">
              <button @click="openAddProductModal" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
                <span class="material-symbols-outlined text-[16px]">add</span> Thêm sản phẩm vào chiến dịch
              </button>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                  <tr>
                    <th class="py-4 px-6">Sản phẩm áp dụng</th>
                    <th class="py-4 px-6">Giá niêm yết</th>
                    <th class="py-4 px-6">Cấu hình giảm giá</th>
                    <th class="py-4 px-6">Hiệu suất sử dụng</th>
                    <th class="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="sp in productsList" :key="sp.MaPhanLoai" class="transition-colors group hover:bg-slate-50/80">
                    
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden shrink-0">
                          <img v-if="sp.AnhDaiDien" :src="sp.AnhDaiDien" class="w-full h-full object-cover"/>
                          <span v-else class="material-symbols-outlined text-slate-300 flex items-center justify-center h-full">image</span>
                        </div>
                        <div class="flex flex-col min-w-0">
                          <p class="font-bold text-slate-900 text-sm truncate max-w-[200px]" :title="sp.TenMH">{{ sp.TenMH }}</p>
                          <p class="text-[11px] text-slate-500 font-medium mt-0.5">Phân loại: <span class="font-bold">{{ sp.ChiTietPhanLoai || 'Mặc định' }}</span></p>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-6">
                      <p class="text-sm font-bold text-slate-400 line-through">{{ formatCurrency(sp.DonGia) }}</p>
                      <p class="text-xs font-black text-emerald-600 mt-0.5">{{ formatCurrency(sp.DonGiaKhuyenMai) }}</p>
                    </td>

                    <td class="py-4 px-6">
                      <div class="flex flex-col items-start gap-1">
                        <span class="font-bold text-rose-500 text-xs px-2 py-1 rounded bg-rose-50 border border-rose-100">
                          {{ sp.LoaiGiamGia === 'TienMat' ? `-${formatCurrency(sp.ChietKhau || 0)}` : `-${sp.ChietKhau || 0}%` }}
                        </span>
                        <span v-if="sp.LoaiGiamGia === 'ChietKhau' && sp.GiaTriGiamToiDa" class="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Giảm tối đa: {{ formatCurrency(sp.GiaTriGiamToiDa) }}
                        </span>
                      </div>
                    </td>

                    <td class="py-4 px-6">
                      <div class="flex flex-col gap-1.5 w-32">
                        <div class="flex items-center justify-between text-[11px] font-bold">
                          <span :class="(sp.SoLuongKM && (sp.SoLuongDaDung >= sp.SoLuongKM)) ? 'text-rose-500' : 'text-emerald-600'">
                            {{ sp.SoLuongDaDung || 0 }} đã bán
                          </span>
                          <span class="text-slate-400">/ {{ sp.SoLuongKM ? sp.SoLuongKM : 'Không giới hạn' }}</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden" v-if="sp.SoLuongKM">
                          <div class="h-full rounded-full transition-all duration-500" 
                               :class="(sp.SoLuongDaDung / sp.SoLuongKM) > 0.8 ? 'bg-rose-500' : 'bg-emerald-500'"
                               :style="`width: ${Math.min((sp.SoLuongDaDung / sp.SoLuongKM) * 100, 100)}%`">
                          </div>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-6 text-right">
                      <button @click="openDeleteProductModal(sp)" class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Loại khỏi chiến dịch">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="productsList.length === 0">
                    <td colspan="5" class="py-16 border-none">
                      <div class="flex flex-col items-center justify-center text-center w-full mx-auto">
                        <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3">
                          <span class="material-symbols-outlined text-3xl">
                            {{ promoType === 'voucher' ? 'all_inclusive' : 'category' }}
                          </span>
                        </div>
                        
                        <div v-if="promoType === 'voucher'">
                          <p class="text-slate-600 text-sm font-bold">Áp dụng cho toàn bộ cửa hàng</p>
                          <p class="text-slate-400 text-xs mt-1">Mã giảm giá này hiện đang được áp dụng cho mọi đơn hàng thỏa mãn giá trị tối thiểu.</p>
                        </div>
                        
                        <div v-else>
                          <p class="text-slate-600 text-sm font-bold">Chưa có sản phẩm nào tham gia.</p>
                          <p class="text-slate-400 text-xs mt-1">Hãy nhấn nút thêm sản phẩm ở góc phải để bắt đầu chiến dịch.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-slate-400">Hiển thị {{ startItemSP }} - {{ endItemSP }} của {{ paginationSP.totalItems }} sản phẩm</span>
                  <div class="h-4 w-px bg-slate-200"></div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-slate-500">Số dòng:</span>
                    <select v-model="paginationSP.limit" @change="changeLimitSP" class="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer shadow-sm">
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                    </select>
                  </div>
                </div>
                
                <div v-if="paginationSP.totalPage > 1" class="flex items-center gap-1.5">
                  <button @click="changeSPPage(paginationSP.currentPage - 1)" :disabled="paginationSP.currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
                  <template v-for="(p, index) in visiblePagesSP" :key="index">
                    <button v-if="p !== '...'" @click="changeSPPage(p)" :class="paginationSP.currentPage === p ? 'bg-primary text-white border-transparent' : 'bg-white border border-slate-200 text-slate-500 hover:text-primary'" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all">{{ p }}</button>
                    <span v-else class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold cursor-not-allowed">...</span>
                  </template>
                  <button @click="changeSPPage(paginationSP.currentPage + 1)" :disabled="paginationSP.currentPage === paginationSP.totalPage" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Lịch sử -->
          <div v-if="activeSubTab === 'logs'" class="space-y-4">
            <div class="flex justify-end">
              <button @click="exportLogsToExcel" :disabled="isExporting" class="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
                <span class="material-symbols-outlined text-[16px]">{{ isExporting ? 'hourglass_empty' : 'download' }}</span> 
                {{ isExporting ? 'Đang tạo báo cáo...' : 'Xuất báo cáo Excel' }}
              </button>
            </div>
            
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                  <tr>
                    <th class="py-4 px-6">Mã lịch sử</th>
                    <th class="py-4 px-6">Khách hàng</th>
                    <th class="py-4 px-6">Mã đơn hàng</th>
                    <th class="py-4 px-6">Số tiền đã giảm</th>
                    <th class="py-4 px-6">Thời gian dùng</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="log in logsList" :key="log.MaLichSu" class="transition-colors hover:bg-slate-50/80">
                    <td class="py-4 px-6 font-mono text-xs text-slate-400">#{{ log.MaLichSu }}</td>
                    <td class="py-4 px-6 text-sm font-bold text-slate-800">{{ log.TenKH || 'Khách ẩn danh' }}</td>
                    <td class="py-4 px-6 text-xs text-sky-600 font-bold hover:underline cursor-pointer">ĐH #{{ log.MaDH }}</td>
                    <td class="py-4 px-6 text-sm font-black text-rose-500">-{{ formatCurrency(log.SoTienDaGiam) }}</td>
                    <td class="py-4 px-6 text-xs text-slate-500">{{ formatDate(log.ThoiGianSuDung) }}</td>
                  </tr>
                  <tr v-if="logsList.length === 0">
                    <td colspan="5" class="py-12 text-center text-slate-400 text-sm font-medium">Chưa có khách hàng nào áp dụng chương trình này.</td>
                  </tr>
                </tbody>
              </table>
              <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-slate-400">Hiển thị {{ startItemLog }} - {{ endItemLog }} của {{ paginationLog.totalItems }} lượt dùng</span>
                  <div class="h-4 w-px bg-slate-200"></div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-slate-500">Số dòng:</span>
                    <select v-model="paginationLog.limit" @change="changeLimitLog" class="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer shadow-sm">
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                    </select>
                  </div>
                </div>
                
                <div v-if="paginationLog.totalPage > 1" class="flex items-center gap-1.5">
                  <button @click="changeLogPage(paginationLog.currentPage - 1)" :disabled="paginationLog.currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
                  <template v-for="(p, index) in visiblePagesLog" :key="index">
                    <button v-if="p !== '...'" @click="changeLogPage(p)" :class="paginationLog.currentPage === p ? 'bg-primary text-white border-transparent' : 'bg-white border border-slate-200 text-slate-500 hover:text-primary'" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all">{{ p }}</button>
                    <span v-else class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold cursor-not-allowed">...</span>
                  </template>
                  <button @click="changeLogPage(paginationLog.currentPage + 1)" :disabled="paginationLog.currentPage === paginationLog.totalPage" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all disabled:opacity-50"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
                </div>
              </div>
            </div>
            </div>
        </template>
        <div v-else class="text-center text-slate-500 py-12">Không tìm thấy thông tin chương trình.</div>
      </main>
    </div>

    <div v-if="isAddProductModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200">
              <span class="material-symbols-outlined text-emerald-600">add_shopping_cart</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 tracking-wide">Thêm sản phẩm vào Khuyến mãi</h3>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">Tìm kiếm và thiết lập mức giảm giá cho các mô hình</p>
            </div>
          </div>
          <button @click="isAddProductModalOpen = false" class="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-slate-200 transition-colors">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div class="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          <div class="flex-1 min-w-0 flex flex-col border-r border-slate-100 bg-white">
            <div class="p-5 border-b border-slate-100 space-y-3 shrink-0 bg-white">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input v-model="searchProductQuery" @input="debounceSearchProduct" type="text" placeholder="Nhập tên nhân vật, series hoặc mã mô hình..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium">
                <span v-if="isSearchingProducts" class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin">progress_activity</span>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <select v-model="filterCategory" @change="searchProductsWithFilter" class="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="">Tất cả danh mục</option>
                  <option v-for="dm in categories" :key="dm.MaDM" :value="dm.MaDM">{{ dm.TenDM }}</option>
                </select>
                <select v-model="filterBrand" @change="searchProductsWithFilter" class="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="">Tất cả hãng SX</option>
                  <option v-for="hsx in brands" :key="hsx.MaHSX" :value="hsx.MaHSX">{{ hsx.TenHSX }}</option>
                </select>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-5 bg-slate-50/30">
              <div class="flex justify-between items-center mb-4">
                <span class="text-xs font-bold text-slate-500">Tìm thấy <span class="text-emerald-600">{{ searchedProducts.length }}</span> phân loại</span>
                <label v-if="searchedProducts.length > 0" class="flex items-center gap-2 cursor-pointer group bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:border-emerald-300 transition-all">
                  <span class="text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">Chọn tất cả</span>
                  <input type="checkbox" v-model="selectAllProducts" class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 cursor-pointer">
                </label>
              </div>

              <div class="space-y-2.5">
                <label v-for="sp in searchedProducts" :key="sp.MaPhanLoai" 
                      class="flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer shadow-sm"
                      :class="selectedProductIds.includes(sp.MaPhanLoai) ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'">
                  
                  <input type="checkbox" :value="sp.MaPhanLoai" v-model="selectedProductIds" class="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 cursor-pointer ml-1">
                  
                  <div class="w-12 h-12 bg-white rounded-lg p-0.5 shrink-0 border border-slate-100">
                    <img :src="sp.AnhDaiDien ? (sp.AnhDaiDien.startsWith('http') ? sp.AnhDaiDien : `${API_BASE_URL}/Images_product/${sp.AnhDaiDien}`) : ''" class="w-full h-full object-contain rounded-md" />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 line-clamp-2 leading-tight" :title="sp.TenMH">{{ sp.TenMH }}</p>
                    
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span class="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[130px]" :title="sp.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : sp.ChiTietPhanLoai">
                        PL: {{ sp.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : sp.ChiTietPhanLoai }}
                      </span>
                      
                      <span class="text-[11px] font-black text-rose-500 shrink-0">{{ formatCurrency(sp.DonGia) }}</span>
                      <span class="text-[10px] text-slate-500 font-medium border-l border-slate-300 pl-2 shrink-0">Kho: <span class="font-bold text-slate-700">{{ sp.SoLuong }}</span></span>
                    </div>
                  </div>
                </label>
                
                <div v-if="searchedProducts.length === 0" class="text-center py-10 border border-dashed border-slate-300 rounded-2xl bg-white">
                  <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span>
                  <p class="text-sm text-slate-500 font-medium">Chưa có mô hình nào được tìm thấy.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="w-full lg:w-[340px] xl:w-[400px] bg-slate-50 flex flex-col shrink-0">
            
            <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <h4 class="text-[11px] font-black text-emerald-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px]">tune</span> Cấu hình áp dụng chung
              </h4>

              <div class="space-y-5">
                <div>
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Loại giảm giá</label>
                  <select v-model="addProductForm.LoaiGiamGia" class="w-full bg-white border border-slate-200 text-slate-800 font-bold rounded-xl p-3 text-sm focus:border-emerald-500 outline-none cursor-pointer shadow-sm">
                    <option value="TienMat">Số tiền (đ)</option>
                    <option value="ChietKhau">Phần trăm (%)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mức giảm (*)</label>
                  <div class="relative">
                    <input v-model="addProductForm.ChietKhau" type="number" min="0" class="w-full bg-white border border-slate-200 text-rose-600 font-black rounded-xl p-3 text-sm focus:border-rose-500 outline-none shadow-sm">
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{{ addProductForm.LoaiGiamGia === 'ChietKhau' ? '%' : '₫' }}</span>
                  </div>
                </div>

                <div v-if="addProductForm.LoaiGiamGia === 'ChietKhau'" class="animate-[fadeIn_0.2s_ease-out]">
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Giảm tối đa (đ)</label>
                  <div class="relative">
                    <input v-model="addProductForm.GiaTriGiamToiDa" type="number" min="0" placeholder="Không giới hạn" class="w-full bg-white border border-slate-200 text-slate-800 font-bold rounded-xl p-3 text-sm focus:border-emerald-500 outline-none placeholder:text-slate-400 placeholder:font-medium shadow-sm">
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">SL khuyến mãi / Loại</label>
                  <input v-model="addProductForm.SoLuongKM" type="number" min="1" placeholder="Mặc định: Toàn bộ kho" class="w-full bg-white border border-slate-200 text-slate-800 font-bold rounded-xl p-3 text-sm focus:border-emerald-500 outline-none placeholder:text-slate-400 placeholder:font-medium shadow-sm">
                  <p class="text-[10px] text-slate-500 mt-2 flex items-start gap-1 leading-relaxed">
                    <span class="material-symbols-outlined text-[14px] text-amber-500 shrink-0">info</span> 
                    Giới hạn số lượng được bán với giá sale. Nếu trống sẽ áp dụng cho toàn bộ Tồn kho.
                  </p>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div class="flex justify-between items-center mb-4 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                <span class="text-xs text-emerald-800 font-bold">Tổng sản phẩm đã chọn:</span>
                <span class="text-lg font-black text-emerald-600">{{ selectedProductIds.length }}</span>
              </div>
              
              <div class="flex gap-3">
                <button @click="isAddProductModalOpen = false" class="px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex-1">
                  Hủy
                </button>
                <button @click="submitAddProducts" 
                        :disabled="selectedProductIds.length === 0 || isSubmitting"
                        class="px-5 py-3 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex-[2] flex justify-center items-center gap-2 active:scale-95 uppercase tracking-wider">
                  <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  {{ isSubmitting ? 'Đang lưu...' : 'Lưu & Áp dụng' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isDeleteProductModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
      <div class="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-rose-200">
        <span class="material-symbols-outlined text-3xl">warning</span>
      </div>
      <h3 class="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa sản phẩm</h3>
      <p class="text-sm text-slate-500 mb-6">
        Bạn có chắc chắn muốn xóa <br>
        <span class="font-bold text-slate-700">"{{ productToDelete?.TenMH }}"</span> khỏi danh sách áp dụng?
      </p>
      <div class="flex justify-center gap-3">
        <button @click="isDeleteProductModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full">Hủy</button>
        <button @click="confirmDeleteProduct" class="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 rounded-xl transition-all w-full">Xóa</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from '../../stores/toast';
  import { useLayoutStore } from '../../stores/layout';

  const route = useRoute();
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const activeSubTab = ref('products');
  const isLoading = ref(true);
  const isDeleteProductModalOpen = ref(false);
  const productToDelete = ref(null);

  const promoId = route.params.id;
  const promoType = computed(() => route.path.includes('/voucher/') ? 'voucher' : 'campaign');

  const detailData = ref(null);
  const productsList = ref([]);
  const logsList = ref([]);
  const paginationSP = ref({ currentPage: 1, totalPage: 1, totalItems: 0, limit: 10 });
  
  const startItemSP = computed(() => paginationSP.value.totalItems === 0 ? 0 : (paginationSP.value.currentPage - 1) * paginationSP.value.limit + 1);
  const endItemSP = computed(() => Math.min(paginationSP.value.currentPage * paginationSP.value.limit, paginationSP.value.totalItems));
  const visiblePagesSP = computed(() => {
    const current = paginationSP.value.currentPage;
    const total = paginationSP.value.totalPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total - 1, total];
    if (current >= total - 2) return [1, 2, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  const changeLimitSP = () => { paginationSP.value.currentPage = 1; fetchDetailData(); };
  const changeSPPage = (page) => {
    if (page === '...' || page === paginationSP.value.currentPage) return;
    paginationSP.value.currentPage = page;
    fetchDetailData();
  };

  // ==========================================
  // 🔴 THUẬT TOÁN PHÂN TRANG: TAB LỊCH SỬ
  // ==========================================
  const paginationLog = ref({ currentPage: 1, totalPage: 1, totalItems: 0, limit: 10 });

  const startItemLog = computed(() => paginationLog.value.totalItems === 0 ? 0 : (paginationLog.value.currentPage - 1) * paginationLog.value.limit + 1);
  const endItemLog = computed(() => Math.min(paginationLog.value.currentPage * paginationLog.value.limit, paginationLog.value.totalItems));
  const visiblePagesLog = computed(() => {
    const current = paginationLog.value.currentPage;
    const total = paginationLog.value.totalPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total - 1, total];
    if (current >= total - 2) return [1, 2, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  const changeLimitLog = () => { paginationLog.value.currentPage = 1; fetchDetailData(); };
  const changeLogPage = (page) => {
    if (page === '...' || page === paginationLog.value.currentPage) return;
    paginationLog.value.currentPage = page;
    fetchDetailData();
  };

  const selectAllProducts = computed({
    get: () => {
      return searchedProducts.value.length > 0 && 
             searchedProducts.value.every(p => selectedProductIds.value.includes(p.MaPhanLoai));
    },
    set: (value) => {
      const currentDisplayedIds = searchedProducts.value.map(p => p.MaPhanLoai);
      
      if (value) {
        const newIds = currentDisplayedIds.filter(id => !selectedProductIds.value.includes(id));
        selectedProductIds.value.push(...newIds);
      } else {
        selectedProductIds.value = selectedProductIds.value.filter(id => !currentDisplayedIds.includes(id));
      }
    }
  });

  const isAddProductModalOpen = ref(false);
  const searchProductQuery = ref('');
  const searchedProducts = ref([]);
  const selectedProductIds = ref([]);
  const addProductForm = ref({
    MaPhanLoai: '',
    LoaiGiamGia: 'ChietKhau',
    ChietKhau: 0,
    GiaTriGiamToiDa: null,
    SoLuongKM: null
  });
  // Thêm state cho bộ lọc
  const filterCategory = ref('');
  const filterBrand = ref('');
  const categories = ref([]); 
  const brands = ref([]);
  const fetchFiltersData = async () => {
    try {
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
      
      const [resCate, resBrand] = await Promise.all([
        fetch(`${API_BASE_URL}/api/product_admin/get_all_cate?getAll=true`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/product_admin/get_all_brand`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const dataCate = await resCate.json();
      const dataBrand = await resBrand.json();

      if (dataCate.success) categories.value = dataCate.data;
      if (dataBrand.success) brands.value = dataBrand.data;
    } 
    catch (error) {
      console.error("Lỗi khi tải bộ lọc: ", error);
    }
  };

  const searchProductsWithFilter = async () => {
    try {
      const params = new URLSearchParams({
        search: searchProductQuery.value,
        maDM: filterCategory.value,
        maHSX: filterBrand.value
      });

      if (promoType.value === 'campaign') {
        params.append('maKM', promoId);
      } else {
        params.append('maGG', promoId);
      }

      const res = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/search/products?${params}`, {
        headers: { Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      const result = await res.json();
      if (result.success) searchedProducts.value = result.data;
      else searchedProducts.value = [];
    } catch (error) {
      console.error(error);
      searchedProducts.value = [];
    }
  };

  // Cập nhật lại hàm debounce
  let searchTimeout;
  const debounceSearchProduct = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchProductsWithFilter();
    }, 500);
  };

  const openAddProductModal = () => {
    if (!detailData.value) return;

    const now = new Date();
    const startDate = new Date(detailData.value.ThoiGianBD);
    const endDate = new Date(detailData.value.ThoiGianKT);

    // KIỂM TRA LOGIC: Chỉ cho phép thêm/sửa khi chương trình CHƯA BẮT ĐẦU (Sắp diễn ra)
    if (now >= startDate) {
      if (now <= endDate) {
        toastStore.showToast('Không thể thêm sản phẩm! Chương trình này đang diễn ra.', 'error');
      } else {
        toastStore.showToast('Không thể thêm sản phẩm! Chương trình này đã kết thúc.', 'error');
      }
      return; // Dừng, không mở modal
    }

    // Nếu thỏa mãn (chưa tới ngày bắt đầu) -> Mở modal và reset form như cũ
    selectedProductIds.value = []; 
    addProductForm.value = { MaPhanLoai: '', LoaiGiamGia: 'ChietKhau', ChietKhau: 0, GiaTriGiamToiDa: null, SoLuongKM: null };
    searchProductQuery.value = '';
    filterCategory.value = '';
    filterBrand.value = '';
    isAddProductModalOpen.value = true;
    searchProductsWithFilter(); 
  };

  const toggleSelectProduct = (MaPhanLoai) => {
    const index = selectedProductIds.value.indexOf(MaPhanLoai);
    if (index === -1) {
      selectedProductIds.value.push(MaPhanLoai); 
    } else {
      selectedProductIds.value.splice(index, 1); 
    }
  };

  const toggleSelectAll = () => {
    if (searchedProducts.value.length === 0) return;
    const currentSearchIds = searchedProducts.value.map(p => p.MaPhanLoai);
    const isAllSelected = currentSearchIds.every(id => selectedProductIds.value.includes(id));

    if (isAllSelected) {
      selectedProductIds.value = selectedProductIds.value.filter(id => !currentSearchIds.includes(id));
    } 
    else {
      const newIds = currentSearchIds.filter(id => !selectedProductIds.value.includes(id));
      selectedProductIds.value.push(...newIds);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const fetchDetailData = async () => {
    isLoading.value = true;
    try {
      const endpoint = promoType.value === 'campaign'
        ? `${API_BASE_URL}/api/khuyen_mai_admin/${promoId}?page_sp=${paginationSP.value.currentPage}&limit_sp=${paginationSP.value.limit}&page_log=${paginationLog.value.currentPage}&limit_log=${paginationLog.value.limit}`
        : `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/${promoId}?page_sp=${paginationSP.value.currentPage}&limit_sp=${paginationSP.value.limit}&page_log=${paginationLog.value.currentPage}&limit_log=${paginationLog.value.limit}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      const result = await res.json();
      if (result.success) {
        detailData.value = result.data.tt;
        const promoName = detailData.value.TenKM || detailData.value.TenMaGiamGia || 'Chi tiết khuyến mãi';
        document.title = `${promoName} | Admin - FigureCollect`;

        productsList.value = result.data.detail || [];
        logsList.value = result.data.log || [];
        paginationSP.value = {
          currentPage: result.pagination_sp?.currentPage || 1,
          totalPage: result.pagination_sp?.totalPage || 1,
          totalItems: result.pagination_sp?.totalItems || 0,
          limit: paginationSP.value.limit
        };
        paginationLog.value = {
          currentPage: result.pagination_log?.currentPage || 1,
          totalPage: result.pagination_log?.totalPage || 1,
          totalItems: result.pagination_log?.totalItems || 0,
          limit: paginationLog.value.limit
        };
      } else {
        console.error('API error:', result.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const openDeleteProductModal = (product) => {
    productToDelete.value = product;
    isDeleteProductModalOpen.value = true;
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete.value) return;
    const product = productToDelete.value;
    try {
      const endpoint = promoType.value === 'campaign'
        ? `${API_BASE_URL}/api/khuyen_mai_admin/${promoId}/products/${product.MaPhanLoai}`
        : `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/${promoId}/products/${product.MaPhanLoai}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
      });
      if (res.ok) {
        toastStore.showToast('Xóa sản phẩm thành công!', 'success');
        fetchDetailData();
      } 
      else {
        toastStore.showToast('Xóa thất bại', 'error');
      }
    } 
    catch (error) {
      console.error(error);
      toastStore.showToast('Lỗi kết nối máy chủ', 'error');
    } 
    finally {
      isDeleteProductModalOpen.value = false;
      productToDelete.value = null;
    }
  };

  const selectProduct = (product) => {
    selectedProduct.value = product;
    addProductForm.value.MaPhanLoai = product.MaPhanLoai;
    searchProductQuery.value = `${product.TenMH} - ${product.TenPhanLoai || ''}`;
    searchedProducts.value = [];
  };

  const submitAddProduct = async () => {
    if (selectedProductIds.value.length === 0) {
      toastStore.showToast('Vui lòng tích chọn ít nhất một sản phẩm', 'error');
      return;
    }

    let payload = {};
    if (promoType.value === 'campaign') {
      const chietKhau = Number(addProductForm.value.ChietKhau);
      
      if (chietKhau > maxAllowedDiscount.value) {
         toastStore.showToast(`Mức giảm không được vượt quá ${formatCurrency(maxAllowedDiscount.value)} để tránh giá âm!`, 'error');
         return;
      }
      if (isNaN(chietKhau) || chietKhau <= 0) {
        toastStore.showToast('Vui lòng nhập mức giảm giá hợp lệ (>0)', 'error');
        return;
      }
      if (addProductForm.value.LoaiGiamGia === 'ChietKhau' && chietKhau > 100) {
        toastStore.showToast('Mức giảm phần trăm không được vượt quá 100%', 'error');
        return;
      }

      payload = {
        DanhSachMaPhanLoai: selectedProductIds.value,
        LoaiGiamGia: addProductForm.value.LoaiGiamGia,
        ChietKhau: chietKhau,
        GiaTriGiamToiDa: addProductForm.value.GiaTriGiamToiDa ? Number(addProductForm.value.GiaTriGiamToiDa) : null,
        SoLuongKM: addProductForm.value.SoLuongKM ? Number(addProductForm.value.SoLuongKM) : null
      };
    } else {
      payload = {
        DanhSachMaPhanLoai: selectedProductIds.value
      };
    }
    try {
      const endpoint = promoType.value === 'campaign'
        ? `${API_BASE_URL}/api/khuyen_mai_admin/${promoId}/products`
        : `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/${promoId}/products`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      
      if (res.ok && result.success) {
        toastStore.showToast('Thêm sản phẩm thành công!', 'success');
        isAddProductModalOpen.value = false;
        fetchDetailData(); 
      } 
      else {
        if (result.duplicates && result.duplicates.length > 0) {
            toastStore.showToast(result.message, 'error');
            
            selectedProductIds.value = selectedProductIds.value.filter(
                id => !result.duplicates.includes(id)
            );
        } 
        else {
            toastStore.showToast(result.message || 'Thêm thất bại, vui lòng kiểm tra lại dữ liệu', 'error');
        }
      }
    } 
    catch (error) {
      console.error('❌ Lỗi khi gọi API:', error);
      toastStore.showToast('Lỗi kết nối máy chủ', 'error');
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
    fetchDetailData();
    fetchFiltersData();
  });

  const isExporting = ref(false); 

  const exportLogsToExcel = async () => {
    isExporting.value = true;
    try {
      const endpoint = promoType.value === 'campaign'
        ? `${API_BASE_URL}/api/khuyen_mai_admin/export/${promoId}`
        : `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/export/${promoId}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` 
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi xuất file');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_Cao_${promoType.value}_${promoId}.xlsx`); 
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toastStore.showToast('Xuất báo cáo Excel thành công!', 'success');
    } 
    catch (error) {
      console.error("Export error:", error);
      toastStore.showToast(error.message || 'Không thể tải xuống báo cáo', 'error');
    } 
    finally {
      isExporting.value = false;
    }
  };

  const costToRevenueRatio = computed(() => {
    if (!detailData.value) return 0;

    // Ép kiểu về dạng Số (Number), nếu null/undefined thì mặc định là 0
    const doanhThu = Number(detailData.value.TongDoanhThuMangLai) || 0;
    const chiPhi = Number(detailData.value.TongTienDaGiam) || 0;

    // Chặn đứng phép chia cho 0
    if (doanhThu === 0) {
      return 0;
    }

    const ratio = (chiPhi / doanhThu) * 100;
    return Math.round(ratio * 10) / 10; 
  });

  // 1. Tự động tính toán Mức giảm tối đa dựa trên các sản phẩm đã chọn
  const maxAllowedDiscount = computed(() => {
    // Nếu là % -> Tối đa 100
    if (addProductForm.value.LoaiGiamGia === 'ChietKhau') return 100;
    
    // Nếu chưa chọn sản phẩm nào -> 0
    if (selectedProductIds.value.length === 0) return 0;

    // Lấy ra mảng các sản phẩm đang được tick chọn
    const selectedProds = searchedProducts.value.filter(p => selectedProductIds.value.includes(p.MaPhanLoai));
    
    // Tìm Giá trị nhỏ nhất (Món rẻ nhất) trong mảng đó
    const minPrice = Math.min(...selectedProds.map(p => p.DonGia));
    return minPrice;
  });

  // 2. Hàm tự động ép số nếu Admin cố tình gõ lố
  const validateDiscountInput = () => {
    let val = Number(addProductForm.value.ChietKhau);
    
    if (val < 0) val = 0; // Không cho nhập số âm
    
    // Nếu nhập lố giới hạn -> Ép về bằng số Max luôn
    if (val > maxAllowedDiscount.value) {
      val = maxAllowedDiscount.value;
      toastStore.showToast(`Mức giảm tối đa cho phép là ${addProductForm.value.LoaiGiamGia === 'ChietKhau' ? '100%' : formatCurrency(maxAllowedDiscount.value)}`, 'error');
    }
    
    addProductForm.value.ChietKhau = val;
  };

  // 3. Tính toán Tồn kho lớn nhất để gợi ý cho Admin
  const maxAvailableStock = computed(() => {
    if (selectedProductIds.value.length === 0) return 0;
    const selectedProds = searchedProducts.value.filter(p => selectedProductIds.value.includes(p.MaPhanLoai));
    // Tìm số tồn kho lớn nhất trong các món được chọn
    return Math.max(...selectedProds.map(p => p.SoLuong));
  });
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>