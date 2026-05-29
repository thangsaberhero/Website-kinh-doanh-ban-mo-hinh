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
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff8f73]"></div>
        </div>

        <!-- Nội dung chính - chỉ hiển thị khi có data -->
        <template v-else-if="detailData">
          <div class="flex items-center gap-4 border-b border-slate-200 pb-4">
            <button @click="$router.push('/admin/promotion')" class="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all shadow-sm">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider"
                      :class="promoType === 'campaign' ? 'bg-orange-50 text-[#ff8f73] border border-orange-200' : 'bg-purple-50 text-purple-600 border border-purple-200'">
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
            <button @click="activeSubTab = 'products'" :class="activeSubTab === 'products' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500'" class="px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">category</span> Sản phẩm áp dụng
            </button>
            <button @click="activeSubTab = 'logs'" :class="activeSubTab === 'logs' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500'" class="px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
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
                          <img v-if="sp.AnhDaiDien" :src="`${API_BASE_URL}/Images_product/${sp.AnhDaiDien}`" class="w-full h-full object-cover"/>
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
              <div v-if="paginationSP.totalPage > 1" class="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
                <button @click="changeSPPage(paginationSP.currentPage - 1)" :disabled="paginationSP.currentPage === 1" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Trước</button>
                <button @click="changeSPPage(paginationSP.currentPage + 1)" :disabled="paginationSP.currentPage === paginationSP.totalPage" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Sau</button>
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
              <tbody>
                <tr v-for="log in logsList" :key="log.MaLichSu" class="border-b border-slate-100 hover:bg-slate-50/50">
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
            <div v-if="paginationLog.totalPage > 1" class="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <button @click="changeLogPage(paginationLog.currentPage - 1)" :disabled="paginationLog.currentPage === 1" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Trước</button>
              <button @click="changeLogPage(paginationLog.currentPage + 1)" :disabled="paginationLog.currentPage === paginationLog.totalPage" class="px-3 py-1.5 text-xs font-bold border rounded-lg bg-white disabled:opacity-50">Sau</button>
            </div>
          </div>
        </template>
        <div v-else class="text-center text-slate-500 py-12">Không tìm thấy thông tin chương trình.</div>
      </main>
    </div>

    <div v-if="isAddProductModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">

      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-500">add_shopping_cart</span>
            Thêm sản phẩm vào {{ promoType === 'campaign' ? 'Khuyến mãi' : 'Voucher' }}
          </h3>
          <button @click="isAddProductModalOpen = false" class="text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 bg-slate-50/50">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div class="md:col-span-2 relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input v-model="searchProductQuery" @input="debounceSearchProduct" type="text" placeholder="Nhập tên mô hình..."
                    class="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 outline-none">
            </div>
            
            <div>
              <select v-model="filterCategory" @change="searchProductsWithFilter" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 outline-none bg-white cursor-pointer">
                <option value="">Tất cả danh mục</option>
                <option v-for="cat in categories" :key="cat.MaDM" :value="cat.MaDM">{{ cat.TenDM }}</option>
              </select>
            </div>

            <div>
              <select v-model="filterBrand" @change="searchProductsWithFilter" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 outline-none bg-white cursor-pointer">
                <option value="">Tất cả hãng SX</option>
                <option v-for="brand in brands" :key="brand.MaHSX" :value="brand.MaHSX">{{ brand.TenHSX }}</option>
              </select>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[300px]">
            <div class="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <span class="text-xs font-bold text-slate-500">Tìm thấy <span class="text-emerald-600">{{ searchedProducts.length }}</span> phân loại</span>
              <button @click="toggleSelectAll" class="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                {{ selectedProductIds.length === searchedProducts.length && searchedProducts.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
              </button>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
              <div v-for="prod in searchedProducts" :key="prod.MaPhanLoai"
                  @click="toggleSelectProduct(prod.MaPhanLoai)"
                  class="px-3 py-2.5 mb-1 rounded-lg border border-transparent cursor-pointer hover:bg-emerald-50 flex items-center gap-3 transition-all"
                  :class="selectedProductIds.includes(prod.MaPhanLoai) ? 'bg-emerald-50 border-emerald-200' : ''">
                
                <div class="w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0"
                    :class="selectedProductIds.includes(prod.MaPhanLoai) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'">
                  <span v-if="selectedProductIds.includes(prod.MaPhanLoai)" class="material-symbols-outlined text-[14px] font-bold">check</span>
                </div>

                <div class="w-10 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                  <img v-if="prod.AnhDaiDien" :src="`${API_BASE_URL}/Images_product/${prod.AnhDaiDien}`" class="w-full h-full object-cover"/>
                  <span v-else class="material-symbols-outlined text-slate-300 flex items-center justify-center h-full">image</span>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="font-bold text-slate-800 text-sm truncate" :title="prod.TenMH">{{ prod.TenMH }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      {{ prod.ChiTietPhanLoai || 'Mặc định' }}
                    </span>
                    <span class="text-[11px] font-bold text-[#ff8f73]">
                      {{ formatCurrency(prod.DonGia) }}
                    </span>
                    
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded" 
                          :class="prod.SoLuong > 0 ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-rose-50 text-rose-600 border border-rose-100'">
                      Tồn kho: {{ prod.SoLuong || 0 }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="searchedProducts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                <p class="text-sm font-medium">Không có sản phẩm nào phù hợp</p>
              </div>
            </div>
          </div>

          <div v-if="selectedProductIds.length > 0 && promoType === 'campaign'" class="p-4 bg-orange-50 rounded-xl border border-orange-100 animate-[fadeIn_0.2s_ease-out]">
            <h4 class="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">
              Cấu hình áp dụng chung cho {{ selectedProductIds.length }} sản phẩm
            </h4>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Loại giảm giá</label>
                <select v-model="addProductForm.LoaiGiamGia" class="w-full border border-orange-200 rounded-lg p-2.5 text-sm outline-none focus:border-orange-400">
                  <option value="ChietKhau">Phần trăm (%)</option>
                  <option value="TienMat">Số tiền (đ)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Mức giảm (*)</label>
                <input 
                  v-model="addProductForm.ChietKhau" 
                  type="number" 
                  min="0" 
                  :max="maxAllowedDiscount"
                  @input="validateDiscountInput" 
                  class="w-full border border-orange-200 rounded-lg p-2.5 text-sm outline-none focus:border-orange-400 font-bold text-rose-500"
                >
                <p class="text-[9px] font-medium text-slate-400 mt-1">
                  Tối đa: <span class="font-bold text-slate-600">{{ addProductForm.LoaiGiamGia === 'ChietKhau' ? '100%' : formatCurrency(maxAllowedDiscount) }}</span>
                </p>
              </div>
              
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Giảm tối đa (đ)</label>
                <input v-model="addProductForm.GiaTriGiamToiDa" :disabled="addProductForm.LoaiGiamGia === 'TienMat'" type="number" min="0" placeholder="Không giới hạn" class="w-full border border-orange-200 rounded-lg p-2.5 text-sm disabled:bg-orange-50/50 outline-none focus:border-orange-400">
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1" title="Số lượng tối đa được bán với giá KM cho MỖI loại">
                  SL khuyến mãi / Loại
                </label>
                <input 
                  v-model="addProductForm.SoLuongKM" 
                  type="number" 
                  min="1" 
                  placeholder="Toàn bộ kho" 
                  class="w-full border border-orange-200 rounded-lg p-2.5 text-sm outline-none focus:border-orange-400 font-bold text-orange-600 placeholder:font-normal"
                >
                <p class="text-[9px] font-medium text-slate-400 mt-1">
                  Kho nhiều nhất: <span class="font-bold text-slate-600">{{ maxAvailableStock }} cái</span>
                </p>
              </div>
            </div>
            
            <p class="text-[10px] text-orange-500 italic mt-3">
              * Cấu hình này sẽ được áp dụng giống hệt nhau cho tất cả các phân loại bạn đã đánh dấu tick.
            </p>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button @click="isAddProductModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl">Hủy</button>
          <button @click="submitAddProduct" :disabled="selectedProductIds.length === 0" class="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 rounded-xl disabled:opacity-50">Lưu</button>
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
  const paginationSP = ref({ currentPage: 1, totalPage: 1 });
  const paginationLog = ref({ currentPage: 1, totalPage: 1 });

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
      const token = localStorage.getItem('token');
      
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
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
        ? `${API_BASE_URL}/api/khuyen_mai_admin/${promoId}?page_sp=${paginationSP.value.currentPage}&page_log=${paginationLog.value.currentPage}`
        : `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/${promoId}?page_sp=${paginationSP.value.currentPage}&page_log=${paginationLog.value.currentPage}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      if (result.success) {
        detailData.value = result.data.tt;
        productsList.value = result.data.detail || [];
        logsList.value = result.data.log || [];
        paginationSP.value = {
          currentPage: result.pagination_sp?.currentPage || 1,
          totalPage: result.pagination_sp?.totalPage || 1
        };
        paginationLog.value = {
          currentPage: result.pagination_log?.currentPage || 1,
          totalPage: result.pagination_log?.totalPage || 1
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

  // Phân trang
  const changeSPPage = (page) => {
    if (page < 1 || page > paginationSP.value.totalPage) return;
    paginationSP.value.currentPage = page;
    fetchDetailData();
  };
  const changeLogPage = (page) => {
    if (page < 1 || page > paginationLog.value.totalPage) return;
    paginationLog.value.currentPage = page;
    fetchDetailData();
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
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  onMounted(() => {
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
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
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