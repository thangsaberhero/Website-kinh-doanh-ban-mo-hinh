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
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 mb-2">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Cấu hình Khuyến mãi</h1>
            <p class="text-slate-500 text-sm font-medium">Quản lý các chiến dịch giảm giá và voucher quà tặng.</p>
          </div>
          
          <div class="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit border border-slate-200">
            <button 
              @click="currentTypeTab = 'promotion'"
              :class="currentTypeTab === 'promotion' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-white/50'"
              class="px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">percent</span> Khuyến mãi tự động
            </button>
            
            <button 
              @click="currentTypeTab = 'voucher'"
              :class="currentTypeTab === 'voucher' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-white/50'"
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
              <input v-model="searchQuery" type="text" placeholder="Tìm tên, mã voucher..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700">
            </div>
            <button @click="openCreateModal" class="bg-primary hover:bg-[#ff3d00] text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all whitespace-nowrap text-sm">
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

          <div class="bg-white p-6 rounded-2xl border-l-4 border-l-primary border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div class="absolute -right-4 -bottom-4 text-primary/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
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
              {{ currentTypeTab === 'promotion' ? 'Danh sách chương trình khuyến mãi' : 'Danh sách mã giảm giá' }}
            </h3>
            <div class="flex items-center gap-3">
              <div class="relative">
                <button @click.stop="isFilterMenuOpen = !isFilterMenuOpen" 
                      class="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border transition-all shadow-sm"
                      :class="isFilterMenuOpen || activeFiltersCount > 0 ? 'bg-primary/10 border-primary text-[#ff3d00]' : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'">
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
            <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30">
              
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-slate-400">
                  Hiển thị {{ startItem }} - {{ endItem }} của {{ totalRecords }} mục
                </span>
                
                <div class="h-4 w-px bg-slate-200"></div>
                
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-slate-500">Số dòng:</span>
                  <select v-model="itemsPerPage" @change="changeItemsPerPage" class="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary cursor-pointer shadow-sm">
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                  </select>
                </div>
              </div>
              
              <div v-if="totalPages > 1" class="flex items-center gap-1.5">
                <button 
                  @click="changePage(currentPage - 1)" 
                  :disabled="currentPage === 1"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                >
                  <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                
                <template v-for="(p, index) in visiblePages" :key="index">
                  <button 
                    v-if="p !== '...'"
                    @click="changePage(p)"
                    :class="currentPage === p 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 border-transparent' 
                      : 'bg-white border-slate-200 text-slate-500 hover:text-primary hover:border-primary'"
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-all"
                  >
                    {{ p }}
                  </button>
                  <span v-else class="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold cursor-not-allowed">
                    ...
                  </span>
                </template>
                
                <button 
                  @click="changePage(currentPage + 1)" 
                  :disabled="currentPage === totalPages"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                >
                  <span class="material-symbols-outlined text-[16px]">chevron_right</span>
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
            <button @click="openAllLogsModal" class="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline hover:text-[#ff3d00] transition-colors">
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
            <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
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
                Thiết lập hệ thống tự động gửi mã <span class="font-bold text-primary px-1 bg-orange-50 rounded">WELCOME</span> cho khách hàng đăng ký mới để tăng tỷ lệ giữ chân lên 15%.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out] flex flex-col border border-slate-200">
      
      <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 class="text-xl font-black text-slate-900 uppercase tracking-tight">
                {{ currentTypeTab === 'promotion' ? 'Thiết lập Khuyến Mãi mới' : 'Tạo Mã Voucher mới' }}
            </h3>
            <p class="text-xs text-slate-500 mt-1 font-medium">Vui lòng điền đầy đủ thông tin để cấu hình chương trình.</p>
          </div>
          <button @click="isModalOpen = false" class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
            <span class="material-symbols-outlined">close</span>
          </button>
      </div>

      <div class="p-8 overflow-y-auto custom-scrollbar max-h-[75vh]">
        
        <div class="space-y-5 mb-8">
          <h4 class="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <span class="w-2 h-2 bg-primary rounded-full"></span> Thông tin cơ bản
          </h4>
          
          <div v-if="currentTypeTab === 'promotion'">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Tên chương trình KM (*)</label>
            <input v-model="promotionForm.TenKM" type="text" placeholder="VD: Flash Sale Mùa Hè rực rỡ" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium bg-slate-50/50 focus:bg-white"/>
          </div>

          <div v-else class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Tên chiến dịch Voucher (*)</label>
              <input v-model="voucherForm.TenMaGiamGia" type="text" placeholder="VD: Tri ân khách hàng thân thiết tháng 6" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium bg-slate-50/50 focus:bg-white"/>
            </div>
            
            <div class="grid grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mã Code (*)</label>
                <div class="relative">
                  <input v-model="voucherForm.MaVoucher" type="text" placeholder="VD: MEGA24" 
                         class="w-full border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm font-mono font-black uppercase focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white"/>
                  <button @click="generateRandomVoucherCode" title="Tạo mã ngẫu nhiên"
                          class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-purple-500 hover:bg-purple-100 rounded-xl transition-all">
                    <span class="material-symbols-outlined text-[20px]">casino</span>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Lượt dùng tối đa</label>
                <input v-model="voucherForm.SoLuongDungToiDa" type="number" min="1" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-bold focus:border-primary outline-none bg-slate-50/50 focus:bg-white transition-all"/>
              </div>
            </div>
          </div>

          <div v-if="currentTypeTab === 'voucher'" class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-6">
              <label class="block text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">person_search</span> Khách hàng áp dụng (Tùy chọn)
              </label>

              <div v-if="selectedCustomer" class="flex items-center justify-between bg-white border border-indigo-200 p-3 rounded-xl shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
                    <img v-if="selectedCustomer.AnhDaiDien" :src="selectedCustomer.AnhDaiDien" class="w-full h-full object-cover"/>
                    <span v-else class="material-symbols-outlined text-indigo-400">person</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">{{ selectedCustomer.TenKH }}</p>
                    <p class="text-[10px] text-slate-500 font-medium">Mã KH: {{ selectedCustomer.MaKH }} | SĐT: {{ selectedCustomer.SDT || 'N/A' }}</p>
                  </div>
                </div>
                <button @click="removeCustomer" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Gỡ bỏ">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div v-else class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300">search</span>
                <input v-model="searchCustomerQuery" @input="debounceSearchCustomer" type="text" placeholder="Tìm theo Mã KH, Tên, SĐT... Nếu bỏ trống mã sẽ dùng chung." 
                       class="w-full border border-indigo-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium bg-white placeholder:text-slate-400"/>
                
                <span v-if="isSearchingCustomers" class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin">progress_activity</span>

                <div v-if="searchedCustomers.length > 0" class="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                  <div v-for="cus in searchedCustomers" :key="cus.MaKH" 
                       @click="selectCustomer(cus)"
                       class="flex items-center gap-3 p-2.5 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-indigo-100">
                    <div class="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      <img v-if="cus.AnhDaiDien" :src="cus.AnhDaiDien" class="w-full h-full object-cover"/>
                      <span v-else class="material-symbols-outlined text-slate-400 text-[16px]">person</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-slate-800 truncate">{{ cus.TenKH }}</p>
                      <p class="text-[10px] text-slate-500 truncate">{{ cus.SDT || cus.Email || 'Chưa cập nhật thông tin' }}</p>
                    </div>
                    <span class="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">Chọn</span>
                  </div>
                </div>
              </div>
            </div>
        </div>

        <div v-if="currentTypeTab === 'voucher'" class="space-y-5 mb-8 pt-8 border-t border-slate-100">
          <h4 class="text-[11px] font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <span class="w-2 h-2 bg-purple-500 rounded-full"></span> Cơ chế giảm giá
          </h4>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Loại hình giảm</label>
                <select v-model="voucherForm.LoaiGiamGia" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-bold focus:border-purple-500 outline-none cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-all">
                  <option value="PhanTram">Giảm theo Phần trăm (%)</option>
                  <option value="TienMat">Giảm Số tiền cố định (đ)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mức giảm chiết khấu</label>
                <div class="relative">
                    <input v-model="displayCreateChietKhau" type="text" placeholder="0" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-black text-rose-500 focus:border-rose-500 outline-none bg-slate-50/50 focus:bg-white transition-all"/>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{{ voucherForm.LoaiGiamGia === 'PhanTram' ? '%' : '₫' }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Giá trị đơn tối thiểu</label>
                <div class="relative">
                    <input v-model="displayCreateMucGiaToiThieu" type="text" placeholder="0" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-bold focus:border-primary outline-none bg-slate-50/50 focus:bg-white transition-all"/>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
                </div>
              </div>
              <div v-show="voucherForm.LoaiGiamGia === 'PhanTram'">
                <label class="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Mức giảm tối đa (CAP)</label>
                <div class="relative">
                    <input v-model="displayCreateGiaTriGiamToiDa" type="text" placeholder="Không giới hạn" class="w-full border border-purple-200 rounded-2xl p-3.5 text-sm font-bold focus:border-purple-500 outline-none bg-purple-50/30 transition-all placeholder:font-normal placeholder:text-slate-400"/>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-5 pt-8 border-t border-slate-100">
          <h4 class="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-500 rounded-full"></span> Lịch trình áp dụng
          </h4>
          
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Thời điểm bắt đầu (*)</label>
              <input v-if="currentTypeTab === 'promotion'" v-model="promotionForm.ThoiGianBD" type="datetime-local" :min="currentDateTimeLocal" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-medium outline-none focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"/>
              <input v-else v-model="voucherForm.ThoiGianBD" type="datetime-local" :min="currentDateTimeLocal" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-medium outline-none focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white"/>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Thời điểm kết thúc (*)</label>
              <input v-if="currentTypeTab === 'promotion'" v-model="promotionForm.ThoiGianKT" type="datetime-local" :min="promotionForm.ThoiGianBD || currentDateTimeLocal" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-medium outline-none focus:border-rose-500 transition-all bg-slate-50/50 focus:bg-white"/>
              <input v-else v-model="voucherForm.ThoiGianKT" type="datetime-local" :min="voucherForm.ThoiGianBD || currentDateTimeLocal" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-medium outline-none focus:border-rose-500 transition-all bg-slate-50/50 focus:bg-white"/>
            </div>
          </div>
        </div>

      </div>

      <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
        <button @click="isModalOpen = false" class="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-all active:scale-95">Hủy bỏ</button>
        <button @click="submitCreateForm"
          :class="isSubmitting ? 'opacity-50 cursor-wait' : 'hover:bg-[#ff3d00] hover:shadow-primary/40'"
          class="px-10 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-wider text-sm">
          {{ isSubmitting ? 'Đang xử lý...' : 'Xác nhận Tạo' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="isEditPromoModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out] flex flex-col border border-slate-200">
      
      <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 class="text-xl font-brand font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500">edit_square</span> 
            {{ currentTypeTab === 'promotion' ? 'Cập nhật Khuyến mãi' : 'Cập nhật Mã Voucher' }}
          </h3>
          <p class="text-xs text-slate-500 mt-1 font-medium">Thay đổi cấu hình chiến dịch. Các mục có dấu (*) là bắt buộc.</p>
        </div>
        <button @click="isEditPromoModalOpen = false" class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
        
        <div class="space-y-5 mb-8">
          <h4 class="text-[11px] font-black text-sky-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <span class="w-2 h-2 bg-sky-500 rounded-full"></span> Thông tin cơ bản
          </h4>

          <template v-if="currentTypeTab === 'promotion'">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Tên chương trình KM (*)</label>
              <input v-model="editingPromo.TenKM" type="text" placeholder="VD: Flash Sale Giáng Sinh" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all font-medium bg-slate-50/50 focus:bg-white"/>
            </div>
          </template>

          <template v-else>
            <div class="grid grid-cols-3 gap-5">
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Tên chiến dịch Voucher (*)</label>
                <input v-model="editingPromo.TenMaGiamGia" type="text" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all font-medium bg-slate-50/50 focus:bg-white"/>
              </div>
              <div class="col-span-1">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">SL tối đa (*)</label>
                <input v-model="editingPromo.SoLuongDungToiDa" type="number" min="1" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-bold focus:border-sky-500 outline-none bg-slate-50/50 focus:bg-white transition-all"/>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mã Code (Cố định)</label>
                <input :value="editingPromo.MaVoucher" type="text" disabled class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-mono font-black uppercase bg-slate-100 text-slate-400 cursor-not-allowed"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Giá trị đơn tối thiểu (*)</label>
                <div class="relative">
                  <input v-model="displayEditMucGiaToiThieu" type="text" placeholder="0" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-bold focus:border-sky-500 outline-none bg-slate-50/50 focus:bg-white transition-all"/>
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl" :class="isEditPromoLocked ? 'opacity-75' : ''">
              <label class="block text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]">person_search</span> Khách hàng áp dụng (Tùy chọn)
                <span v-if="isEditPromoLocked" class="text-[10px] text-amber-600 font-bold normal-case italic">(Khóa: Mã đã chạy)</span>
              </label>

              <div v-if="selectedEditCustomer" class="flex items-center justify-between bg-white border border-indigo-200 p-3 rounded-xl shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
                    <img v-if="selectedEditCustomer.AnhDaiDien" :src="selectedEditCustomer.AnhDaiDien" class="w-full h-full object-cover"/>
                    <span v-else class="material-symbols-outlined text-indigo-400">person</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">{{ selectedEditCustomer.TenKH }}</p>
                    <p class="text-[10px] text-slate-500 font-medium">Mã KH: {{ selectedEditCustomer.MaKH }} | SĐT: {{ selectedEditCustomer.SDT || 'N/A' }}</p>
                  </div>
                </div>
                <button v-if="!isEditPromoLocked" @click="removeEditCustomer" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Gỡ bỏ">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div v-else-if="!isEditPromoLocked" class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300">search</span>
                <input v-model="searchEditCustomerQuery" @input="debounceSearchEditCustomer" type="text" placeholder="Tìm theo Mã KH, Tên, SĐT... Để trống để dùng chung" 
                       class="w-full border border-indigo-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium bg-white placeholder:text-slate-400"/>
                
                <span v-if="isSearchingEditCustomers" class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin">progress_activity</span>

                <div v-if="searchedEditCustomers.length > 0" class="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar p-1.5">
                  <div v-for="cus in searchedEditCustomers" :key="cus.MaKH" 
                       @click="selectEditCustomer(cus)"
                       class="flex items-center gap-3 p-2.5 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-indigo-100">
                    <div class="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      <img v-if="cus.AnhDaiDien" :src="cus.AnhDaiDien" class="w-full h-full object-cover"/>
                      <span v-else class="material-symbols-outlined text-slate-400 text-[16px]">person</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-slate-800 truncate">{{ cus.TenKH }}</p>
                      <p class="text-[10px] text-slate-500 truncate">{{ cus.SDT || cus.Email || 'Chưa cập nhật liên hệ' }}</p>
                    </div>
                    <span class="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded">Chọn</span>
                  </div>
                </div>
              </div>

              <div v-else class="text-xs text-slate-400 font-medium italic p-2.5 bg-slate-100 rounded-xl text-center">
                Mã giảm giá công khai (Không gán đối tượng riêng tư)
              </div>
            </div>
          </template>
        </div>

        <div v-if="currentTypeTab === 'voucher'" class="space-y-5 mb-8 pt-8 border-t border-slate-100">
          <h4 class="text-[11px] font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <span class="w-2 h-2 bg-purple-500 rounded-full"></span> Cơ chế giảm giá
          </h4>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Loại hình giảm</label>
                <select v-model="editingPromo.LoaiGiamGia" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-bold focus:border-purple-500 outline-none cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition-all">
                  <option value="PhanTram">Giảm theo Phần trăm (%)</option>
                  <option value="TienMat">Giảm Số tiền cố định (đ)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mức giảm chiết khấu (*)</label>
                <div class="relative">
                    <input v-model="displayEditChietKhau" type="text" placeholder="0" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-black text-rose-500 focus:border-rose-500 outline-none bg-slate-50/50 focus:bg-white transition-all"/>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{{ editingPromo.LoaiGiamGia === 'PhanTram' ? '%' : '₫' }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-5">
              <div v-show="editingPromo.LoaiGiamGia === 'PhanTram'">
                <label class="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Mức giảm tối đa (CAP)</label>
                <div class="relative">
                    <input v-model="displayEditGiaTriGiamToiDa" type="text" placeholder="Không giới hạn" class="w-full border border-purple-200 rounded-2xl p-3.5 text-sm font-bold focus:border-purple-500 outline-none bg-purple-50/30 transition-all placeholder:font-normal"/>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-5 pt-8 border-t border-slate-100 mb-6">
          <h4 class="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-500 rounded-full"></span> Lịch trình áp dụng
          </h4>
          
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                Thời điểm bắt đầu (*) 
                <span v-if="isEditPromoLocked" class="text-[10px] text-amber-600 font-medium normal-case italic">(Khóa do đang chạy)</span>
              </label>
              <input v-model="editingPromo.ThoiGianBD" type="datetime-local" :disabled="isEditPromoLocked" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-medium outline-none focus:border-emerald-500 transition-all bg-slate-50/50 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"/>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Thời điểm kết thúc (*)</label>
              <input v-model="editingPromo.ThoiGianKT" type="datetime-local" class="w-full border border-slate-200 rounded-2xl p-3.5 text-sm font-medium outline-none focus:border-rose-500 transition-all bg-slate-50/50 focus:bg-white"/>
            </div>
          </div>
        </div>

        <div class="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 p-5 rounded-2xl">
          <div>
            <label class="block text-sm font-black text-slate-900">Trạng thái Kích hoạt</label>
            <p class="text-xs text-slate-500 mt-0.5">Bật để cho phép áp dụng, tắt để tạm dừng chiến dịch ngay lập tức.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="editingPromo.TrangThaiHoatDong" :true-value="1" :false-value="0" class="sr-only peer">
            <div class="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

      </div>

      <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
        <button @click="isEditPromoModalOpen = false" class="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-all active:scale-95">Hủy bỏ</button>
        <button @click="submitEditPromo" :disabled="isSavingEdit" class="px-10 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-black rounded-2xl shadow-xl shadow-sky-500/20 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider text-sm disabled:cursor-wait">
          <span v-if="isSavingEdit" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          <span v-else class="material-symbols-outlined text-lg">save</span> 
          {{ isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi' }}
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

  const searchCustomerQuery = ref('');
  const searchedCustomers = ref([]);
  const isSearchingCustomers = ref(false);
  const selectedCustomer = ref(null);
  let searchCustomerTimeout = null;

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
  const itemsPerPage = ref(10);
  const totalRecords = ref(0);

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
      ThoiGianKT: '',
      MaKH_ApDung: null
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

  const fetchCustomersForVoucher = async () => {
    if (!searchCustomerQuery.value.trim()) {
      searchedCustomers.value = [];
      return;
    }
    isSearchingCustomers.value = true;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/search-customers?keyword=${encodeURIComponent(searchCustomerQuery.value)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        searchedCustomers.value = data.data;
      } else {
        searchedCustomers.value = [];
      }
    } catch (error) {
      console.error("Lỗi tìm khách hàng:", error);
    } finally {
      isSearchingCustomers.value = false;
    }
  };

  const debounceSearchCustomer = () => {
    clearTimeout(searchCustomerTimeout);
    searchCustomerTimeout = setTimeout(fetchCustomersForVoucher, 500);
  };

  const selectCustomer = (customer) => {
    selectedCustomer.value = customer;
    voucherForm.value.MaKH_ApDung = customer.MaKH; // Lưu ID vào form để submit
    searchCustomerQuery.value = '';
    searchedCustomers.value = [];
  };

  const removeCustomer = () => {
    selectedCustomer.value = null;
    voucherForm.value.MaKH_ApDung = null;
  };

  const fetchPromotions = async () => {
    isLoading.value = true;
    try {
      let trangthaiParam = '';
      if (activeStatusFilter.value === 'active') trangthaiParam = 'DangChay';
      else if (activeStatusFilter.value === 'scheduled') trangthaiParam = 'SapToi';
      else if (activeStatusFilter.value === 'expired') trangthaiParam = 'HetHan';

      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
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
        totalRecords.value = result.pagination.totalItems;
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

      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
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
            TrangThaiHoatDong: item.TrangThaiHoatDong,
            MaKH: item.MaKH
          };
        });
        totalPages.value = result.pagination.totalPage;
        totalRecords.value = result.pagination.totalItems;
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
      const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
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
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
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
        headers: { 'Authorization': `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token'))}` }
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
    fetchDashboardStats();
    fetchPromotions();
    fetchVouchers(); 
    fetchSecurityLogs(); 
  });

  // ==================================================
  // TRẠM TRUNG CHUYỂN TIỀN TỆ - MODAL TẠO MỚI (voucherForm)
  // ==================================================
  const displayCreateMucGiaToiThieu = computed({
    get: () => {
      const val = voucherForm.value.MucGiaToiThieu;
      if (val === null || val === undefined || val === '') return '';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    set: (val) => {
      const numericString = val.toString().replace(/[^\d]/g, '');
      voucherForm.value.MucGiaToiThieu = numericString ? Number(numericString) : 0;
    }
  });

  const displayCreateChietKhau = computed({
    get: () => {
      const val = voucherForm.value.ChietKhau;
      if (val === null || val === undefined || val === '') return '';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    set: (val) => {
      const numericString = val.toString().replace(/[^\d]/g, '');
      voucherForm.value.ChietKhau = numericString ? Number(numericString) : 0;
    }
  });

  const displayCreateGiaTriGiamToiDa = computed({
    get: () => {
      const val = voucherForm.value.GiaTriGiamToiDa;
      if (val === null || val === undefined || val === '') return '';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    set: (val) => {
      const numericString = val.toString().replace(/[^\d]/g, '');
      voucherForm.value.GiaTriGiamToiDa = numericString ? Number(numericString) : null; // null để đẩy xuống DB chuẩn "Không giới hạn"
    }
  });

  // ==================================================
  // TRẠM TRUNG CHUYỂN TIỀN TỆ - MODAL CHỈNH SỬA (editingPromo)
  // ==================================================
  const displayEditMucGiaToiThieu = computed({
    get: () => {
      const val = editingPromo.value.MucGiaToiThieu;
      if (val === null || val === undefined || val === '') return '';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    set: (val) => {
      const numericString = val.toString().replace(/[^\d]/g, '');
      editingPromo.value.MucGiaToiThieu = numericString ? Number(numericString) : 0;
    }
  });

  const displayEditChietKhau = computed({
    get: () => {
      const val = editingPromo.value.ChietKhau;
      if (val === null || val === undefined || val === '') return '';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    set: (val) => {
      const numericString = val.toString().replace(/[^\d]/g, '');
      editingPromo.value.ChietKhau = numericString ? Number(numericString) : 0;
    }
  });

  const displayEditGiaTriGiamToiDa = computed({
    get: () => {
      const val = editingPromo.value.GiaTriGiamToiDa;
      if (val === null || val === undefined || val === '') return '';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    set: (val) => {
      const numericString = val.toString().replace(/[^\d]/g, '');
      editingPromo.value.GiaTriGiamToiDa = numericString ? Number(numericString) : null;
    }
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
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
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
              ThoiGianBD: formatDatetimeToUTC(promoForm.value.ThoiGianBD),
              ThoiGianKT: formatDatetimeToUTC(promoForm.value.ThoiGianKT),
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
            ThoiGianBD: formatDatetimeToUTC(voucherForm.value.ThoiGianBD),
            ThoiGianKT: formatDatetimeToUTC(voucherForm.value.ThoiGianKT),
            TrangThaiHoatDong: 1,
            MaKH: selectedCustomer.value ? selectedCustomer.value.MaKH : null,
            GiaTriGiamToiDa: voucherForm.value.LoaiGiamGia === 'PhanTram' && voucherForm.value.GiaTriGiamToiDa ? Number(voucherForm.value.GiaTriGiamToiDa) : null
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
  // --- STATE TÌM KIẾM KHÁCH HÀNG KHI SỬA VOUCHER ---
  const searchEditCustomerQuery = ref('');
  const searchedEditCustomers = ref([]);
  const isSearchingEditCustomers = ref(false);
  const selectedEditCustomer = ref(null);
  const isSavingEdit = ref(false); // Quản lý loading khi lưu sửa
  let searchEditCustomerTimeout = null;

  // Chốt chặn vàng kiểm tra xem chương trình sửa đã chạy chưa
  const isEditPromoLocked = computed(() => {
    // Xét điều kiện dựa trên biến thời gian gốc
    if (!editingPromo.value || !editingPromo.value.originalThoiGianBD) return false;
    
    // Nếu chương trình GỐC đã bắt đầu thì mới khóa
    return new Date(editingPromo.value.originalThoiGianBD) <= new Date();
  });

  const fetchEditCustomers = async () => {
    if (!searchEditCustomerQuery.value.trim()) {
      searchedEditCustomers.value = [];
      return;
    }
    isSearchingEditCustomers.value = true;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/search-customers?keyword=${encodeURIComponent(searchEditCustomerQuery.value)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        searchedEditCustomers.value = data.data;
      } else {
        searchedEditCustomers.value = [];
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm khách hàng khi sửa:", error);
    } finally {
      isSearchingEditCustomers.value = false;
    }
  };

  const debounceSearchEditCustomer = () => {
    clearTimeout(searchEditCustomerTimeout);
    searchEditCustomerTimeout = setTimeout(fetchEditCustomers, 500);
  };

  const selectEditCustomer = (customer) => {
    selectedEditCustomer.value = customer;
    editingPromo.value.MaKH = customer.MaKH; // Đồng bộ ID vào form sửa
    searchEditCustomerQuery.value = '';
    searchedEditCustomers.value = [];
  };

  const removeEditCustomer = () => {
    selectedEditCustomer.value = null;
    editingPromo.value.MaKH = null;
  };

  const formatDatetimeForInput = (utcDateString) => {
    if (!utcDateString) return '';
    const d = new Date(utcDateString); 
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDatetimeToUTC = (localDateString) => {
    if (!localDateString) return null;
    
    // Tạo đối tượng Date từ giờ Việt Nam trên Form
    const d = new Date(localDateString);
    
    // .toISOString() sẽ tự động trừ đi 7 tiếng và gắn thêm đuôi Z chuẩn quốc tế
    return d.toISOString(); 
  };

  const openEditModal = async (item) => {
    // 1. Reset sạch các trường search khách hàng của modal sửa để tránh bị lưu cache từ lần mở trước
    searchEditCustomerQuery.value = '';
    searchedEditCustomers.value = [];
    selectedEditCustomer.value = null;

    if (currentTypeTab.value === 'promotion') {
      editingPromo.value = {
        id: item.id,
        TenKM: item.TenKM,
        ThoiGianBD: formatDatetimeForInput(item.ThoiGianBD),
        ThoiGianKT: formatDatetimeForInput(item.ThoiGianKT),
        TrangThaiHoatDong: item.TrangThaiHoatDong === 1 ? 1 : 0,
        originalThoiGianBD: item.ThoiGianBD
      };
    } 
    else {
      editingPromo.value = {
        id: item.id,
        TenMaGiamGia: item.TenMaGiamGia,
        MaVoucher: item.MaVoucher,
        LoaiGiamGia: item.LoaiGiamGia || 'TienMat',
        ChietKhau: item.GiamGia ? parseInt(item.GiamGia) : 0,
        MucGiaToiThieu: item.MucGiaToiThieu ? parseInt(item.MucGiaToiThieu) : 0,
        SoLuongDungToiDa: item.SoLuong,
        GiaTriGiamToiDa: item.GiaTriGiamToiDa ? parseInt(item.GiaTriGiamToiDa) : null,
        ThoiGianBD: formatDatetimeForInput(item.ThoiGianBD),
        ThoiGianKT: formatDatetimeForInput(item.ThoiGianKT),
        TrangThaiHoatDong: item.TrangThaiHoatDong === 1 ? 1 : 0,
        MaKH: item.MaKH || null,
        originalThoiGianBD: item.ThoiGianBD
      };

      // 2. BỔ SUNG: Nếu mã giảm giá này có gán riêng cho 1 khách hàng (MaKH != null)
      if (item.MaKH) {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          // Tận dụng API tìm kiếm nhanh để lấy profile khách hàng đổ vào Card
          const res = await fetch(`${API_BASE_URL}/api/khuyen_mai_admin/search-customers?keyword=${item.MaKH}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success && data.data.length > 0) {
            // Lọc đúng khách hàng có mã trùng khớp
            const found = data.data.find(c => c.MaKH === item.MaKH);
            if (found) {
              selectedEditCustomer.value = found; // Hiển thị UI Card Avatar + Tên khách
            }
          }
        } catch (err) {
          console.error("Lỗi nạp dữ liệu khách hàng cũ vào modal sửa:", err);
        }
      }
    }
    
    isEditPromoModalOpen.value = true;
  };

  const submitEditPromo = async () => {
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
    
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
            ThoiGianBD: formatDatetimeToUTC(editingPromo.value.ThoiGianBD),
            ThoiGianKT: formatDatetimeToUTC(editingPromo.value.ThoiGianKT),
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
            ThoiGianBD: formatDatetimeToUTC(editingPromo.value.ThoiGianBD),
            ThoiGianKT: formatDatetimeToUTC(editingPromo.value.ThoiGianKT),
            TrangThaiHoatDong: editingPromo.value.TrangThaiHoatDong ? 1 : 0,
            MaKH: selectedEditCustomer.value ? selectedEditCustomer.value.MaKH : null
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
    const token = (localStorage.getItem('token') || sessionStorage.getItem('token'));
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

  // 🔴 THÊM MỚI: Thuật toán tính toán và phân trang thông minh
  const startItem = computed(() => totalRecords.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1);
  const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalRecords.value));

  const visiblePages = computed(() => {
    const current = currentPage.value;
    const total = totalPages.value;
    
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total - 1, total];
    if (current >= total - 2) return [1, 2, '...', total - 3, total - 2, total - 1, total];
    
    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  const changeItemsPerPage = () => {
    currentPage.value = 1;
    if (currentTypeTab.value === 'promotion') fetchPromotions();
    else fetchVouchers();
  };

  const changePage = (page) => {
    if (page === '...' || page === currentPage.value) return;
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      if (currentTypeTab.value === 'promotion') fetchPromotions();
      else fetchVouchers();
    }
  };

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
    return 'bg-primary shadow-[0_0_5px_#ff8f73]'; // Voucher bình thường màu Cam
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