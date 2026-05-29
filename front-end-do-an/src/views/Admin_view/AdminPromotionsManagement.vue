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
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Cấu hình Khuyến mãi</h1>
            <p class="text-slate-500 text-sm font-medium">Quản lý các chiến dịch giảm giá và voucher quà tặng.</p>
          </div>
          
          <div class="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit border border-slate-200">
            <button 
              @click="currentTypeTab = 'promotion'"
              :class="currentTypeTab === 'promotion' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500 hover:bg-white/50'"
              class="px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">percent</span> Khuyến mãi tự động
            </button>
            
            <button 
              @click="currentTypeTab = 'voucher'"
              :class="currentTypeTab === 'voucher' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500 hover:bg-white/50'"
              class="px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">confirmation_number</span> Mã Voucher
            </button>
          </div>
        </div>

        <div class="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex gap-1">
            <button v-for="status in ['all', 'active', 'scheduled', 'expired']" :key="status" @click="activeStatusFilter = status"
              :class="['px-5 py-2 text-xs font-bold rounded-lg transition-all', 
                      activeStatusFilter === status ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100']">
              {{ status === 'all' ? 'Tất cả' : status === 'active' ? 'Đang chạy' : status === 'scheduled' ? 'Sắp tới' : 'Đã hết hạn' }}
            </button>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div class="relative w-full sm:w-64">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input v-model="searchQuery" type="text" placeholder="Tìm tên, mã voucher..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>
            <button @click="openCreateModal" class="bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all whitespace-nowrap text-sm">
              <span class="material-symbols-outlined text-[20px]">add_circle</span>
              {{ currentTypeTab === 'promotion' ? 'Tạo Khuyến mãi' : 'Tạo Voucher' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-sky-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-sky-400/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">dataset</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                {{ currentTypeTab === 'promotion' ? 'Tổng chiến dịch KM' : 'Tổng mã Voucher' }}
              </p>
              <div class="flex items-end gap-3">
                <h3 class="text-3xl font-brand font-bold text-slate-900">{{ displayStats.total }}</h3>
                <span class="text-slate-400 text-xs font-medium pb-1.5 flex items-center gap-0.5">Trên toàn hệ thống</span>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-[#ff8f73] border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-[#ff8f73]/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">local_activity</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Trạng thái Đang chạy</p>
              <div class="flex items-end gap-3">
                <h3 class="text-3xl font-brand font-bold text-slate-900">{{ displayStats.active }}</h3>
                <span class="text-emerald-500 text-xs font-bold pb-1.5 flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[14px]">bolt</span> Toàn hệ thống
                </span>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-emerald-400/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Đã áp dụng thành công</p>
              <div class="flex items-end gap-3">
                <h3 class="text-3xl font-brand font-bold text-slate-900">{{ displayStats.usage }}</h3>
                <span class="text-slate-400 text-xs font-medium pb-1.5 flex items-center gap-0.5">Lượt</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-purple-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-purple-400/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">sell</span>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1"> {{ displayStats.avgLabel }}</p>
              <div class="flex items-end gap-3">
                <h3 class="text-3xl font-brand font-bold text-slate-900">
                  {{ displayStats.avgValue }}
                </h3>
              </div>
            </div>
          </div>   
        </div>

        <div class="flex flex-col gap-4 mt-4">
          <div class="flex items-center justify-between">
            <h3 class="font-headline text-lg font-bold text-slate-900 flex items-center gap-2">
              Danh sách mã giảm giá
            </h3>
            <div class="flex items-center gap-3">
              <div class="relative">
                <button @click.stop="isFilterMenuOpen = !isFilterMenuOpen" 
                      class="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition-all shadow-sm"
                      :class="isFilterMenuOpen || activeFiltersCount > 0 ? 'bg-[#ff8f73]/10 border-[#ff8f73] text-[#ff3d00]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#ff8f73] hover:text-[#ff8f73]'">
                  <span class="material-symbols-outlined text-sm">filter_list</span> 
                      Bộ lọc
                  <span v-if="activeFiltersCount > 0" class="flex w-4 h-4 items-center justify-center bg-[#ff3d00] text-white rounded-full text-[9px] ml-1">{{ activeFiltersCount }}</span>
                </button>

                <div v-show="isFilterMenuOpen" @click.stop
                    class="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-5 z-50 cursor-default animate-[fadeIn_0.2s_ease-out]">
                
                  <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <h4 class="font-bold text-slate-900 text-sm">Lọc nâng cao</h4>
                      <button @click="resetFilters" class="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors">Xóa lọc</button>
                  </div>

                  <div class="space-y-2 mb-4">
                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại mức giảm</label>
                      <select v-model="filters.type" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-sky-500 transition-all bg-slate-50 cursor-pointer">
                      <option value="all">Tất cả loại</option>
                      <option value="Phần trăm">Giảm theo Phần trăm (%)</option>
                      <option value="Cố định">Giảm Số tiền (VNĐ)</option>
                      </select>
                  </div>

                  <div class="space-y-2 mb-4">
                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới hạn sử dụng</label>
                      <select v-model="filters.limit" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-sky-500 transition-all bg-slate-50 cursor-pointer">
                      <option value="all">Tất cả giới hạn</option>
                      <option value="limited">Có giới hạn số lượng</option>
                      <option value="unlimited">Không giới hạn (Vô hạn)</option>
                      </select>
                  </div>

                  <button @click="isFilterMenuOpen = false" class="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-md">
                      Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse">        
              <thead v-if="currentTypeTab === 'promotion'" class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                <tr>
                  <th class="py-4 px-6">Tên chiến dịch</th>
                  <th class="py-4 px-6">Thời gian áp dụng</th>
                  <th class="py-4 px-6">Lượt sử dụng</th>
                  <th class="py-4 px-6">Trạng thái</th>
                  <th class="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              
              <thead v-else class="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                <tr>
                  <th class="py-4 px-6">Tên mã / Chiến dịch</th>
                  <th class="py-4 px-6">Loại</th>
                  <th class="py-4 px-6">Giá trị</th>
                  <th class="py-4 px-6 text-center">Sử dụng</th>
                  <th class="py-4 px-6">Trạng thái</th>
                  <th class="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in filteredData" :key="item.id" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">          
                  <template v-if="currentTypeTab === 'promotion'">
                    <td class="py-4 px-6 font-semibold text-slate-900 text-sm">{{ item.TenKM }}</td>
                    <td class="py-4 px-6 text-xs text-slate-500">
                      {{ formatDate(item.ThoiGianBD) }} - <br> {{ formatDate(item.ThoiGianKT) }}
                    </td>
                    <td class="py-4 px-6 text-sm text-slate-600">{{ item.SoLuongSP || 0 }} sản phẩm</td>
                  </template>

                  <template v-else>
                    <td class="py-4 px-6">
                      <div class="flex flex-col">
                        <span class="font-black text-slate-900 tracking-wide text-sm">{{ item.MaVoucher }}</span>
                        <span class="text-[11px] text-slate-500 font-medium">{{ item.TenMaGiamGia }}</span>
                      </div>
                    </td>

                    <td class="py-4 px-6">
                      <span class="text-sm font-medium text-slate-600">
                        {{ item.LoaiGiamGia === 'PhanTram' ? 'Phần trăm (%)' : 'Cố định (đ)' }}
                      </span>
                    </td>

                    <td class="py-4 px-6">
                      <span class="font-bold text-slate-900 text-sm">
                        {{ item.LoaiGiamGia === 'PhanTram' ? `-${parseFloat(item.GiamGia)}%` : `-${formatCurrency(item.GiamGia)}` }}
                      </span>
                    </td>

                    <td class="py-4 px-6">
                      <div class="flex flex-col items-center justify-center gap-1.5 w-28 mx-auto">
                        <div class="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div class="h-full rounded-full transition-all duration-500"
                              :class="getProgressBarColor(item)"
                              :style="{ width: getProgressWidth(item) }"></div>
                        </div>
                        <span class="text-[10px] font-bold text-slate-500 tracking-wider">
                          {{ (!item.SoLuong || item.SoLuong === 0) ? 'Không giới hạn' : `${item.DaDung || 0} / ${item.SoLuong}` }}
                        </span>
                      </div>
                    </td>
                  </template>

                  <td class="py-4 px-6">
                    <div class="flex items-center gap-2">
                      <span class="relative flex h-2.5 w-2.5">
                        <span v-if="getStatusPingColor(item.status)" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="getStatusPingColor(item.status)"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="getStatusDotColor(item.status)"></span>
                      </span>
                      <span class="text-xs font-bold" :class="getStatusTextColor(item.status)">{{ item.status }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button @click="goToDetail(item)" class="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Xem chi tiết & Quản lý sản phẩm">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                      </button>

                      <button @click="openEditModal(item)" class="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all" title="Chỉnh sửa">
                        <span class="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      <button @click="confirmDelete(item)" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Xóa">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredData.length === 0">
                  <td colspan="6" class="py-16 text-center text-slate-500 bg-slate-50/30">
                    <div class="flex flex-col items-center justify-center">
                      <span class="material-symbols-outlined text-5xl mb-3 text-slate-300">inventory_2</span>
                      <p class="font-bold text-slate-600">Không tìm thấy dữ liệu</p>
                      <p class="text-xs mt-1">Thử thay đổi bộ lọc hoặc thêm mới chương trình.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>            
            <div v-if="totalPages >= 1 && filteredData.length > 0" class="flex items-center justify-between bg-white p-4 border-t border-slate-100">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                Đang hiển thị trang {{ currentPage }} / {{ totalPages }}
              </p>
              <div class="flex items-center gap-1.5 ml-auto">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-50 disabled:pointer-events-none">
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                <template v-for="item in visiblePages" :key="item">
                  <span v-if="item === '...'" class="w-8 h-8 flex items-center justify-center text-slate-400 font-bold tracking-widest">...</span>
                  <button v-else @click="changePage(item)"
                          :class="currentPage === item ? 'bg-[#ff8f73] text-white shadow-md shadow-[#ff8f73]/20 border-transparent' : 'bg-white border border-slate-200 text-slate-600 hover:text-[#ff8f73] hover:border-[#ff8f73]'"
                          class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all">
                    {{ item }}
                  </button>
                </template>

                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-50 disabled:pointer-events-none">
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-6">
          <div class="flex justify-between items-center mb-6">
            <h4 class="font-headline text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-sky-500">history_edu</span> Nhật ký thao tác Khuyến mãi
            </h4>
            <button @click="openAllLogsModal" class="text-[10px] font-bold text-[#ff8f73] uppercase tracking-widest hover:underline hover:text-[#ff3d00] transition-colors">
              Xem tất cả
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-for="log in securityLogs" :key="log.MaLog" class="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
              <div class="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-50 text-slate-500 rounded-full border border-slate-200 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                <span class="material-symbols-outlined text-[20px]">edit_note</span>
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
              Hệ thống chưa ghi nhận hoạt động nào gần đây.
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow group">
            <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff8f73] group-hover:scale-110 transition-transform shrink-0">
              <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">tips_and_updates</span>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">Mẹo tối ưu hóa</h4>
              <p class="text-xs text-slate-500 leading-relaxed font-medium">
                Mã giảm giá theo <span class="font-bold text-purple-500">Phần trăm</span> thường có tỷ lệ chuyển đổi cao hơn 25% cho các đơn hàng giá trị thấp (dưới 500k). Thử nghiệm ngay hôm nay!
              </p>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow group">
            <div class="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shrink-0">
              <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">Tự động hóa</h4>
              <p class="text-xs text-slate-500 leading-relaxed font-medium">
                Thiết lập hệ thống tự động gửi mã <span class="font-bold text-[#ff8f73] px-1 bg-orange-50 rounded">WELCOME</span> cho khách hàng đăng ký mới để tăng tỷ lệ giữ chân lên 15%.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
      <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold text-slate-900">
              {{ currentTypeTab === 'promotion' ? 'Tạo Khuyến Mãi (Tự động)' : 'Tạo Mã Voucher' }}
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined">close</span></button>
      </div>

      <div v-if="currentTypeTab === 'promotion'" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Tên chương trình KM (*)</label>
          <input v-model="promotionForm.TenKM" type="text" placeholder="VD: Flash Sale Mùa Hè" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 focus:ring-2 outline-none"/>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Tên chiến dịch Voucher (*)</label>
          <input v-model="voucherForm.TenMaGiamGia" type="text" placeholder="VD: Tri ân khách hàng tháng 5" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Mã Code (*)</label>
            <div class="relative">
              <input v-model="voucherForm.MaVoucher" type="text" placeholder="VD: MEGA24" 
                     class="w-full border border-slate-200 rounded-xl pl-3 pr-10 py-3 text-sm font-mono uppercase focus:border-sky-500 outline-none"/>
              <button @click="generateRandomVoucherCode" title="Tạo mã ngẫu nhiên"
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all">
                <span class="material-symbols-outlined text-[18px]">casino</span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Lượt dùng tối đa</label>
            <input v-model="voucherForm.SoLuongDungToiDa" type="number" min="1" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <div class="col-span-1">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Loại giảm</label>
            <select v-model="voucherForm.LoaiGiamGia" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none">
              <option value="PhanTram">Phần trăm (%)</option>
              <option value="TienMat">Số tiền (đ)</option>
            </select>
          </div>
          <div class="col-span-1">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Mức giảm</label>
            <input v-model="voucherForm.ChietKhau" type="number" min="0" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
          </div>
          <div class="col-span-1">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Đơn tối thiểu (đ)</label>
            <input v-model="voucherForm.MucGiaToiThieu" type="number" min="0" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
          </div>
          <div class="col-span-1" v-show="voucherForm.LoaiGiamGia === 'PhanTram'">
            <label class="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Giảm tối đa (đ)</label>
            <input v-model="voucherForm.GiaTriGiamToiDa" type="number" min="0" placeholder="Bỏ trống = Vô hạn" class="w-full border border-purple-200 rounded-xl p-3 text-sm focus:border-purple-500 outline-none bg-purple-50/30"/>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Thời gian bắt đầu (*)</label>
          <input v-if="currentTypeTab === 'promotion'" v-model="promotionForm.ThoiGianBD" type="datetime-local" :min="currentDateTimeLocal" class="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"/>
          <input v-else v-model="voucherForm.ThoiGianBD" type="datetime-local" :min="currentDateTimeLocal" class="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"/>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Thời gian kết thúc (*)</label>
          <input v-if="currentTypeTab === 'promotion'" v-model="promotionForm.ThoiGianKT" type="datetime-local" :min="promotionForm.ThoiGianBD || currentDateTimeLocal" class="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"/>
          <input v-else v-model="voucherForm.ThoiGianKT" type="datetime-local" :min="voucherForm.ThoiGianBD || currentDateTimeLocal" class="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"/>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button @click="isModalOpen = false" class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">Hủy</button>
        <button @click="submitCreateForm"
          :class="isSubmitting ? 'opacity-50 cursor-wait' : 'hover:bg-[#ff3d00]'"
          class="px-6 py-2.5 bg-[#ff8f73] text-white font-bold rounded-xl shadow-lg transition-colors">
          {{ isSubmitting ? 'Đang tạo...' : 'Xác nhận Tạo' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="isEditPromoModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500">edit_square</span> 
            {{ currentTypeTab === 'promotion' ? 'Chỉnh sửa Khuyến mãi' : 'Chỉnh sửa Voucher' }}
          </h3>
        </div>
        <button @click="isEditPromoModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <template v-if="currentTypeTab === 'promotion'">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Tên chương trình KM (*)</label>
            <input v-model="editingPromo.TenKM" type="text" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
          </div>
        </template>

        <template v-else>
          <div class="grid grid-cols-3 gap-4">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Tên chiến dịch Voucher (*)</label>
              <input v-model="editingPromo.TenMaGiamGia" type="text" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
            </div>
            <div class="col-span-1">
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Lượt dùng tối đa</label>
              <input v-model="editingPromo.SoLuongDungToiDa" type="number" min="1" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-1">
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Loại giảm</label>
              <select v-model="editingPromo.LoaiGiamGia" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none">
                <option value="PhanTram">Phần trăm (%)</option>
                <option value="TienMat">Số tiền (đ)</option>
              </select>
            </div>
            <div class="col-span-1">
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Mức giảm</label>
              <input v-model="editingPromo.ChietKhau" type="number" min="0" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
            </div>
            <div class="col-span-1">
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Đơn tối thiểu</label>
              <input v-model="editingPromo.MucGiaToiThieu" type="number" min="0" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
            </div>
            
            <div class="col-span-1" v-show="editingPromo.LoaiGiamGia === 'PhanTram'">
              <label class="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Giảm tối đa (đ)</label>
              <input v-model="editingPromo.GiaTriGiamToiDa" type="number" min="0" placeholder="Bỏ trống = Vô hạn" class="w-full border border-purple-200 rounded-xl p-3 text-sm focus:border-purple-500 outline-none bg-purple-50/30"/>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Thời gian bắt đầu (*)</label>
            <input v-model="editingPromo.ThoiGianBD" type="datetime-local" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Thời gian kết thúc (*)</label>
            <input v-model="editingPromo.ThoiGianKT" type="datetime-local" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-sky-500 outline-none"/>
          </div>
        </div>
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label class="block text-sm font-bold text-slate-900">Trạng thái Kích hoạt</label>
            <p class="text-xs text-slate-500">Bật để cho phép áp dụng, tắt để tạm dừng chiến dịch.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="editingPromo.TrangThaiHoatDong" class="sr-only peer">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
        <button @click="isEditPromoModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
        <button @click="submitEditPromo" class="px-6 py-2.5 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20 rounded-xl transition-all flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">save</span> Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
  <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
      <div class="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-rose-200">
        <span class="material-symbols-outlined text-3xl">warning</span>
      </div>
      <h3 class="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
      <p class="text-sm text-slate-500 mb-6">
        Bạn có chắc chắn muốn xóa chiến dịch <br>
        <span class="font-bold text-slate-700">"{{ itemToDelete?.TenKM || itemToDelete?.TenMaGiamGia || itemToDelete?.MaVoucher }}"</span> không? <br>
        Hành động này không thể hoàn tác.
      </p>
      <div class="flex justify-center gap-3">
        <button @click="isDeleteModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors w-full">Hủy</button>
        <button @click="executeDelete" class="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 rounded-xl transition-all w-full">Xóa ngay</button>
      </div>
    </div>
  </div>

  <div v-if="isAllLogsModalOpen" class="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[80vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <h3 class="font-bold text-slate-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-sky-500">history</span> Toàn bộ nhật ký thao tác
        </h3>
        <button @click="isAllLogsModalOpen = false" class="text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined">close</span></button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
        <div v-for="log in allLogsList" :key="'all-'+log.MaLog" class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <span class="material-symbols-outlined text-slate-400 text-[18px] mt-0.5">adjust</span>
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
  import { ref, computed, onMounted, watch } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast';
  import { useLayoutStore } from '../../stores/layout';
  
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  const isLoading = ref(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const currentTypeTab = ref('promotion'); 
  const activeStatusFilter = ref('all'); 

  const promotionsList = ref([]); 
  const vouchersList = ref([]); 

  const promotionForm = ref({
    TenKM: '',
    ThoiGianBD: '',
    ThoiGianKT: '',
    DanhSachSanPham: [] 
  });

  const voucherForm = ref({
    TenMaGiamGia: '', 
    MaVoucher: '',
    LoaiGiamGia: 'PhanTram', 
    ChietKhau: 0,
    MucGiaToiThieu: 0,
    GiaTriGiamToiDa: null,
    SoLuongDungToiDa: 100,
    ThoiGianBD: '',
    ThoiGianKT: ''
  });

  const promotions = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);

  // 1. Biến tìm kiếm
  const searchQuery = ref('');
  const isModalOpen = ref(false);
  const serverStats = ref({
    promotion: { total: 0, active: 0, usage: 0, totalProducts: 0 },
    voucher: { total: 0, active: 0, usage: 0, avgPercent: 0, avgCash: 0 }
  });

  const openCreateModal = () => {
    isModalOpen.value = true;
    promotionForm.value = { TenKM: '', ThoiGianBD: '', ThoiGianKT: '', DanhSachSanPham: [] };
    voucherForm.value = { 
      TenMaGiamGia: '', 
      MaVoucher: '', 
      LoaiGiamGia: 'PhanTram', 
      ChietKhau: 0, 
      MucGiaToiThieu: 0,
      GiaTriGiamToiDa: null, 
      SoLuongDungToiDa: 100, 
      ThoiGianBD: '', 
      ThoiGianKT: '' 
    };
  };

  const generateRandomVoucherCode = () => {
    const prefixes = ['SUMMER', 'SALE', 'VOUCHER', 'MUAHE', 'GIAMGIA', 'FLASH', 'HOT', 'DEAL', 'FREESHIP', 'WELCOME', 'MEGA', 'FIGURECOLLECT'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(Math.random() * 900 + 100);     
    let code = `${randomPrefix}${randomNum}`;
    if (code.length > 20) code = code.slice(0, 20);
    voucherForm.value.MaVoucher = code.toUpperCase();
  };
  const currentDateTimeLocal = computed(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatCurrency = (money) => {
    if (!money || isNaN(money)) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(money) + 'đ';
  };

  const getStatusClass = (status) => {
    if (status === 'Đang chạy') return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    if (status === 'Đã lên lịch') return 'bg-amber-50 text-amber-600 border border-amber-200';
    if (status === 'Đã hết hạn') return 'bg-rose-50 text-rose-600 border border-rose-200';
    return 'bg-slate-50 text-slate-500 border border-slate-200';
  };

  const fetchPromotions = async () => {
    isLoading.value = true;
    try {
      let trangthaiParam = '';
      if (activeStatusFilter.value === 'active') trangthaiParam = 'DangChay';
      else if (activeStatusFilter.value === 'scheduled') trangthaiParam = 'SapToi';
      else if (activeStatusFilter.value === 'expired') trangthaiParam = 'HetHan';

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin?page=${currentPage.value}&limit=10&trangthai=${trangthaiParam}&keyword=${searchQuery.value}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await response.json();

      if (result.success) {
        promotionsList.value = result.data.map(item => {
          const now = new Date();
          const start = new Date(item.ThoiGianBD);
          const end = new Date(item.ThoiGianKT);
          
          let currentStatus = 'Đang chạy';
          if (now > end) {
            currentStatus = 'Đã hết hạn';
          } 
          else if (item.TrangThaiHoatDong === 0) {
            currentStatus = 'Tạm dừng';
          } 
          else if (now < start) {
            currentStatus = 'Đã lên lịch';
          }

          return {
            id: item.MaKM,
            TenKM: item.TenKM,
            ThoiGianBD: item.ThoiGianBD,
            ThoiGianKT: item.ThoiGianKT,
            SoLuongSP: item.SoLuotDung || 0, 
            status: currentStatus,
            LoaiGiamGia: item.LoaiGiamGia || 'PhanTram',
            ChietKhau: item.ChietKhau || 0,
            status: currentStatus,
            TrangThaiHoatDong: item.TrangThaiHoatDong 
          };
        });
        totalPages.value = result.pagination.totalPage;
      }
    } 
    catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
    } 
    finally {
      isLoading.value = false;
    }
  };

  const fetchVouchers = async () => {
    isLoading.value = true;
    try {
      let trangthaiParam = '';
      if (activeStatusFilter.value === 'active') trangthaiParam = 'DangChay';
      else if (activeStatusFilter.value === 'scheduled') trangthaiParam = 'SapToi';
      else if (activeStatusFilter.value === 'expired') trangthaiParam = 'HetHan';

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/vouchers/list?page=${currentPage.value}&limit=10&trangthai=${trangthaiParam}&keyword=${searchQuery.value}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await response.json();

      if (result.success) {
        vouchersList.value = result.data.map(item => {
          const now = new Date();
          const start = new Date(item.ThoiGianBD);
          const end = new Date(item.ThoiGianKT);
          
          let currentStatus = 'Đang chạy';
          if (now > end) {
            currentStatus = 'Đã hết hạn';
          } 
          else if (item.TrangThaiHoatDong === 0) {
            currentStatus = 'Tạm dừng';
          } 
          else if (now < start) {
            currentStatus = 'Đã lên lịch';
          }

          return {
            id: item.MaGG,
            MaVoucher: item.MaVoucher,
            TenMaGiamGia: item.TenMaGiamGia,
            LoaiGiamGia: item.LoaiGiamGia,
            GiamGia: item.ChietKhau,
            MucGiaToiThieu: item.MucGiaToiThieu,
            GiaTriGiamToiDa: item.GiaTriGiamToiDa,
            DaDung: item.SoLuotDung || 0,
            ThoiGianBD: item.ThoiGianBD,
            SoLuong: item.SoLuongDungToiDa,
            ThoiGianKT: item.ThoiGianKT,
            status: currentStatus,
            TrangThaiHoatDong: item.TrangThaiHoatDong
          };
        });
        totalPages.value = result.pagination.totalPage;
      }
    } 
    catch (error) {
      console.error("Lỗi khi tải voucher:", error);
    } 
    finally {
      isLoading.value = false;
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        serverStats.value = result.data;
      }
    } 
    catch (error) {
      console.error("Lỗi tải thống kê:", error);
    }
  };

  const displayStats = computed(() => {
    if (currentTypeTab.value === 'promotion') {
      return {
        total: serverStats.value.promotion.total,
        active: serverStats.value.promotion.active,
        usage: serverStats.value.promotion.usage,
        avgLabel: 'Sản phẩm đang sale', 
        avgValue: `${serverStats.value.promotion.totalProducts} SP` 
      };
    } 
    else {
      const showPercent = serverStats.value.voucher.avgPercent > 0;
      return {
        total: serverStats.value.voucher.total,
        active: serverStats.value.voucher.active,
        usage: serverStats.value.voucher.usage,
        avgLabel: showPercent ? 'Giảm trung bình (%)' : 'Giảm trung bình (đ)',
        avgValue: showPercent 
            ? `${serverStats.value.voucher.avgPercent}%` 
            : formatCurrency(serverStats.value.voucher.avgCash)
      };
    }
  });

  const securityLogs = ref([]);
  const isAllLogsModalOpen = ref(false);
  const allLogsList = ref([]);
  const allLogsPagination = ref({ currentPage: 1, totalPage: 1 });

  const fetchSecurityLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/logs/recent`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      if (result.success) securityLogs.value = result.data;
    } 
    catch (error) { 
      console.error(error); 
    }
  };

  const fetchAllLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/logs/all?page=${allLogsPagination.value.currentPage}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
    fetchDashboardStats();
    fetchPromotions();
    fetchVouchers(); 
    fetchSecurityLogs(); 
  });

  // Lắng nghe khi chuyển bộ lọc trạng thái
  watch(activeStatusFilter, () => {
    currentPage.value = 1;
    if (currentTypeTab.value === 'promotion') fetchPromotions();
    else fetchVouchers();
  });

  let searchTimeout;
  watch(searchQuery, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      if (currentTypeTab.value === 'promotion') fetchPromotions();
      else fetchVouchers();
    }, 500);
  });

  // Lắng nghe khi chuyển đổi Tab Lớn (Khuyến mãi <-> Voucher)
  watch(currentTypeTab, () => {
    currentPage.value = 1;
    searchQuery.value = ''; 
    activeStatusFilter.value = 'all'; 
    if (currentTypeTab.value === 'promotion') fetchPromotions();
    else fetchVouchers();
  });

  const submitCreateForm = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        toastStore.showToast("Bạn chưa đăng nhập hoặc mất phiên làm việc", "error");
        return;
    }

    try {
        let url = '';
        let payload = {};
        if (currentTypeTab.value === 'promotion') {
          if (!promotionForm.value.TenKM || !promotionForm.value.ThoiGianBD || !promotionForm.value.ThoiGianKT) {
            toastStore.showToast("Vui lòng điền đầy đủ các trường bắt buộc (*)", "error");
            return;
          }
          if (new Date(promotionForm.value.ThoiGianKT) <= new Date(promotionForm.value.ThoiGianBD)) {
            toastStore.showToast("Ngày kết thúc phải lớn hơn ngày bắt đầu", "error");
            return;
          }
          if (new Date(promotionForm.value.ThoiGianKT) <= new Date()) { 
              toastStore.showToast("Ngày kết thúc không được nằm trong quá khứ!", "error");
              return;
          }

          url = `${API_BASE_URL}/api/khuyen_mai_admin`;
          payload = {
              TenKM: promotionForm.value.TenKM,
              ThoiGianBD: promotionForm.value.ThoiGianBD,
              ThoiGianKT: promotionForm.value.ThoiGianKT,
              TrangThaiHoatDong: 1, 
              danhsachchitiet: [] 
          };
        } 
        else {
          if (!voucherForm.value.TenMaGiamGia || !voucherForm.value.MaVoucher || !voucherForm.value.ThoiGianBD || !voucherForm.value.ThoiGianKT) {
            toastStore.showToast("Vui lòng điền đầy đủ các trường bắt buộc (*)", "error");
            return;
          }
          if (new Date(voucherForm.value.ThoiGianKT) <= new Date(voucherForm.value.ThoiGianBD)) {
            toastStore.showToast("Ngày kết thúc phải lớn hơn ngày bắt đầu", "error");
            return;
          }
          if (new Date(voucherForm.value.ThoiGianKT) <= new Date()) { 
              toastStore.showToast("Ngày kết thúc không được nằm trong quá khứ!", "error");
              return;
          }

          url = `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/create`;
          payload = {
            TenMaGiamGia: voucherForm.value.TenMaGiamGia,
            MaVoucher: voucherForm.value.MaVoucher.toUpperCase(),
            LoaiGiamGia: voucherForm.value.LoaiGiamGia,
            ChietKhau: Number(voucherForm.value.ChietKhau),
            MucGiaToiThieu: Number(voucherForm.value.MucGiaToiThieu),
            SoLuongDungToiDa: Number(voucherForm.value.SoLuongDungToiDa),
            ThoiGianBD: voucherForm.value.ThoiGianBD,
            ThoiGianKT: voucherForm.value.ThoiGianKT,
            TrangThaiHoatDong: 1,
            MaKH: null,
            GiaTriGiamToiDa: voucherForm.value.LoaiGiamGia === 'PhanTram' && voucherForm.value.GiaTriGiamToiDa ? Number(voucherForm.value.GiaTriGiamToiDa) : null,
            danhsachchitiet: [] 
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          toastStore.showToast(data.message || "Tạo mới thành công!", "success");
          isModalOpen.value = false;
          fetchDashboardStats();
          
          if (currentTypeTab.value === 'promotion') fetchPromotions();
          else fetchVouchers();
          fetchSecurityLogs();
        } 
        else {
          toastStore.showToast(data.message || "Có lỗi xảy ra khi tạo", "error");
        }

    } 
    catch (error) {
      console.error("Lỗi khi tạo mới:", error);
      toastStore.showToast("Lỗi kết nối đến máy chủ", "error");
    }
  };
  
  const isEditPromoModalOpen = ref(false);
  const editingPromo = ref({});

  const formatDatetimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const openEditModal = (item) => {
    if (currentTypeTab.value === 'promotion') {
      editingPromo.value = {
        id: item.id,
        TenKM: item.TenKM,
        ThoiGianBD: formatDatetimeForInput(item.ThoiGianBD),
        ThoiGianKT: formatDatetimeForInput(item.ThoiGianKT),
        TrangThaiHoatDong: item.TrangThaiHoatDong === 1 ? true : false
      };
    } 
    else {
      editingPromo.value = {
        id: item.id,
        TenMaGiamGia: item.TenMaGiamGia,
        MaVoucher: item.MaVoucher,
        LoaiGiamGia: item.LoaiGiamGia || 'TienMat',
        ChietKhau: item.GiamGia,
        MucGiaToiThieu: item.MucGiaToiThieu,
        SoLuongDungToiDa: item.SoLuong,
        GiaTriGiamToiDa: item.GiaTriGiamToiDa || null,
        ThoiGianBD: formatDatetimeForInput(item.ThoiGianBD),
        ThoiGianKT: formatDatetimeForInput(item.ThoiGianKT),
        TrangThaiHoatDong: item.TrangThaiHoatDong === 1 ? true : false 
      };
    }
    isEditPromoModalOpen.value = true;
  };

  const submitEditPromo = async () => {
    const token = localStorage.getItem('token');
    
    try {
        let url = '';
        let payload = {};

        if (currentTypeTab.value === 'promotion') {
          if (!editingPromo.value.TenKM || !editingPromo.value.ThoiGianBD || !editingPromo.value.ThoiGianKT) {
            toastStore.showToast("Vui lòng điền đủ thông tin (*)", "error"); return;
          }
          url = `${API_BASE_URL}/api/khuyen_mai_admin/${editingPromo.value.id}`;
          payload = {
            TenKM: editingPromo.value.TenKM,
            ThoiGianBD: editingPromo.value.ThoiGianBD,
            ThoiGianKT: editingPromo.value.ThoiGianKT,
            TrangThaiHoatDong: editingPromo.value.TrangThaiHoatDong ? 1 : 0 
          };
        } 
        else {
          if (!editingPromo.value.TenMaGiamGia || !editingPromo.value.ThoiGianBD || !editingPromo.value.ThoiGianKT) {
            toastStore.showToast("Vui lòng điền đủ thông tin (*)", "error"); return;
          }
          url = `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/update/${editingPromo.value.id}`;
          payload = {
            TenMaGiamGia: editingPromo.value.TenMaGiamGia,
            MaVoucher: editingPromo.value.MaVoucher, 
            LoaiGiamGia: editingPromo.value.LoaiGiamGia,
            ChietKhau: Number(editingPromo.value.ChietKhau),
            MucGiaToiThieu: Number(editingPromo.value.MucGiaToiThieu),
            SoLuongDungToiDa: Number(editingPromo.value.SoLuongDungToiDa),
            GiaTriGiamToiDa: editingPromo.value.LoaiGiamGia === 'PhanTram' && editingPromo.value.GiaTriGiamToiDa ? Number(editingPromo.value.GiaTriGiamToiDa) : null,
            ThoiGianBD: editingPromo.value.ThoiGianBD,
            ThoiGianKT: editingPromo.value.ThoiGianKT,
            TrangThaiHoatDong: editingPromo.value.TrangThaiHoatDong ? 1 : 0
          };
        }

        if (new Date(payload.ThoiGianKT) <= new Date(payload.ThoiGianBD)) {
          toastStore.showToast("Ngày kết thúc phải lớn hơn ngày bắt đầu", "error");
          return;
        }

        const res = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          toastStore.showToast("Cập nhật thành công!", "success");
          isEditPromoModalOpen.value = false;
          fetchDashboardStats();
          if (currentTypeTab.value === 'promotion') fetchPromotions();
          else fetchVouchers();
          fetchSecurityLogs();
        } 
        else {
          toastStore.showToast(data.message || "Lỗi khi cập nhật", "error");
        }
    } 
    catch (error) {
      console.error("Lỗi:", error);
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
    }
  };
  
  const isDeleteModalOpen = ref(false);
  const itemToDelete = ref(null);

  const confirmDelete = (item) => {
    itemToDelete.value = item;
    isDeleteModalOpen.value = true;
  };

  const executeDelete = async () => {
    if (!itemToDelete.value) return;
    const token = localStorage.getItem('token');
    const url = currentTypeTab.value === 'promotion' 
                ? `${API_BASE_URL}/api/khuyen_mai_admin/${itemToDelete.value.id}` 
                : `${API_BASE_URL}/api/khuyen_mai_admin/vouchers/delete/${itemToDelete.value.id}`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json(); 

      if (res.ok && data.success) {
        toastStore.showToast(data.message, data.isSoftDeleted ? "warning" : "success");
        isDeleteModalOpen.value = false;
        fetchDashboardStats();
        if (currentTypeTab.value === 'promotion') fetchPromotions();
        else fetchVouchers();
        fetchSecurityLogs();
      } 
      else {
        toastStore.showToast(data.message || "Xóa thất bại", "error");
      }
    } 
    catch (error) {
      console.error(error);
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
    }
  };
    
  const isFilterMenuOpen = ref(false);
  const filters = ref({
    type: 'all',  
    limit: 'all'  
  });

  const activeFiltersCount = computed(() => {
    let count = 0;
    if (filters.value.type !== 'all') count++;
    if (filters.value.limit !== 'all') count++;
    return count;
  });

  const resetFilters = () => {
    filters.value.type = 'all';
    filters.value.limit = 'all';
  };

  const filteredData = computed(() => {
    let baseData = currentTypeTab.value === 'promotion' ? promotionsList.value : vouchersList.value;

    if (filters.value.type !== 'all') {
      baseData = baseData.filter(item => {
        if (filters.value.type === 'Phần trăm') return item.LoaiGiamGia === 'PhanTram';
        if (filters.value.type === 'Cố định') return item.LoaiGiamGia === 'TienMat';
        return true;
      });
    }

    if (currentTypeTab.value === 'voucher' && filters.value.limit !== 'all') {
      baseData = baseData.filter(item => {
        const limitVal = item.SoLuong;
        const isUnlimited = !limitVal || limitVal === 0;
        if (filters.value.limit === 'unlimited') return isUnlimited;
        if (filters.value.limit === 'limited') return !isUnlimited;
        return true;
      });
    }

    return baseData;
  });

  const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    if (currentTypeTab.value === 'promotion') fetchPromotions();
    else fetchVouchers();
  };

  const visiblePages = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    const delta = 2;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    
    const pages = [1];
    if (current - delta > 2) pages.push('...');
    
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);
    for (let i = start; i <= end; i++) pages.push(i);
    
    if (current + delta < total - 1) pages.push('...');
    pages.push(total);
    return pages;
  });

  const goToDetail = (item) => {
    if (currentTypeTab.value === 'promotion') {
      router.push(`/admin/promotion/campaign/${item.id}`);
    } else {
      router.push(`/admin/promotion/voucher/${item.id}`);
    }
  };

  watch(() => voucherForm.value.LoaiGiamGia, (newType) => {
    if (newType === 'TienMat') {
      voucherForm.value.GiaTriGiamToiDa = null;
    }
  });

  watch(() => editingPromo.value.LoaiGiamGia, (newType) => {
    if (newType === 'TienMat') {
      editingPromo.value.GiaTriGiamToiDa = null;
    }
  });
  // 1. Tính độ dài thanh Progress Bar (%)
  const getProgressWidth = (item) => {
    if (!item.SoLuong || item.SoLuong === 0) return '100%';
    const percentage = ((item.DaDung || 0) / item.SoLuong) * 100;
    return `${Math.min(percentage, 100)}%`;
  };
  
  // 2. Màu của Progress Bar
  const getProgressBarColor = (item) => {
    if (item.status === 'Đã hết hạn' || (item.SoLuong && item.DaDung >= item.SoLuong)) return 'bg-rose-500 shadow-[0_0_5px_#f43f5e]';
    if (!item.SoLuong || item.SoLuong === 0) return 'bg-purple-500 shadow-[0_0_5px_#a855f7]'; // Voucher vô hạn màu Tím
    return 'bg-[#ff8f73] shadow-[0_0_5px_#ff8f73]'; // Voucher bình thường màu Cam
  };
  
  // 3. Hệ thống Màu Trạng thái (Dots & Text)
  const getStatusTextColor = (status) => {
    if (status === 'Đang chạy') return 'text-emerald-600';
    if (status === 'Đã lên lịch') return 'text-amber-600';
    if (status === 'Đã hết hạn') return 'text-rose-600';
    if (status === 'Tạm dừng') return 'text-slate-500'; 
    return 'text-slate-500';
  };
  const getStatusDotColor = (status) => {
    if (status === 'Đang chạy') return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
    if (status === 'Đã lên lịch') return 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
    if (status === 'Đã hết hạn') return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
    if (status === 'Tạm dừng') return 'bg-slate-400'; 
    return 'bg-slate-400';
  };
  const getStatusPingColor = (status) => {
    if (status === 'Đang chạy') return 'bg-emerald-400';
    if (status === 'Đã lên lịch') return 'bg-amber-500';
    if (status === 'Đã hết hạn') return 'bg-rose-500';
    if (status === 'Tạm dừng') return 'bg-slate-400'; 
    return 'bg-slate-400';
  };
  
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>