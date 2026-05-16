<template>
    <div @click="closeAllMenus" class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800 relative">     
      <div 
        v-show="isMobileMenuOpen" 
        @click="isMobileMenuOpen = false" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
      ></div> 
      <AdminSideBar :is-collapsed="isSidebarCollapsed" :is-mobile-open="isMobileMenuOpen" />
      <div class="flex-1 flex flex-col min-h-screen overflow-hidden w-full relative">
        <AdminHeader @toggle-sidebar="handleToggleSidebar" />
        <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-24">
          <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
            <div>
              <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Cấu hình Khuyến mãi</h1>
              <p class="text-slate-500 text-sm font-medium">Quản lý các chiến dịch giảm giá và voucher quà tặng.</p>
            </div>
            
            <div class="flex gap-3 w-full xl:w-auto">
              <div class="relative w-full xl:w-64">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input type="text" placeholder="Tìm kiếm chiến dịch..." class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-white">
              </div>
              <button @click="openAddPromoModal" class="flex-none bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm uppercase tracking-wider">
                <span class="material-symbols-outlined text-[20px]">add_circle</span>
                Tạo mã mới
              </button>
            </div>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-[#ff8f73] border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div class="absolute -right-4 -bottom-4 text-[#ff8f73]/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                 <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">local_activity</span>
              </div>
              <div class="relative z-10">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng khuyến mãi đang chạy</p>
                <div class="flex items-end gap-3">
                  <h3 class="text-3xl font-brand font-bold text-slate-900">24</h3>
                  <span class="text-emerald-500 text-xs font-bold pb-1.5 flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span> +12%
                  </span>
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-purple-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div class="absolute -right-4 -bottom-4 text-purple-400/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                 <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">payments</span>
              </div>
              <div class="relative z-10">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng doanh thu giảm giá</p>
                <div class="flex items-end gap-3">
                  <h3 class="text-3xl font-brand font-bold text-slate-900">450tr</h3>
                  <span class="text-emerald-500 text-xs font-bold pb-1.5 flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span> +8%
                  </span>
                </div>
              </div>
            </div>
  
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div class="absolute -right-4 -bottom-4 text-emerald-400/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                 <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
              </div>
              <div class="relative z-10">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng lượt sử dụng</p>
                <div class="flex items-end gap-3">
                  <h3 class="text-3xl font-brand font-bold text-slate-900">1,240</h3>
                  <span class="text-emerald-500 text-xs font-bold pb-1.5 flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[14px]">trending_up</span> +15%
                  </span>
                </div>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-rose-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div class="absolute -right-4 -bottom-4 text-rose-400/10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out z-0 pointer-events-none">
                 <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">percent</span>
              </div>
              <div class="relative z-10">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Giá trị giảm trung bình</p>
                <div class="flex items-end gap-3">
                  <h3 class="text-3xl font-brand font-bold text-slate-900">15%</h3>
                  <span class="text-rose-500 text-xs font-bold pb-1.5 flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[14px]">trending_down</span> -2%
                  </span>
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
                <div class="flex bg-slate-100 p-1 rounded-xl">
                  <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                    class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all"
                    :class="activeTab === tab.id ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500 hover:text-slate-900'">
                    {{ tab.name }}
                  </button>
                </div>
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
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse whitespace-nowrap">
                  <thead class="bg-slate-50/50">
                    <tr>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Tên mã / Chiến dịch</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Loại</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Giá trị</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Sử dụng</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Trạng thái</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody v-if="isLoading" class="divide-y divide-slate-50">
                    <tr v-for="i in 4" :key="`skeleton-${i}`" class="animate-pulse">
                        <td class="px-6 py-4">
                            <div class="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                            <div class="h-3 w-24 bg-slate-100 rounded"></div>
                        </td>
                        <td class="px-6 py-4"><div class="h-4 w-16 bg-slate-200 rounded"></div></td>
                        <td class="px-6 py-4"><div class="h-5 w-12 bg-slate-200 rounded"></div></td>
                        <td class="px-6 py-4 flex flex-col items-center">
                            <div class="h-1.5 w-24 bg-slate-200 rounded-full mb-2"></div>
                            <div class="h-3 w-12 bg-slate-100 rounded"></div>
                        </td>
                        <td class="px-6 py-4"><div class="h-5 w-20 bg-slate-200 rounded-full"></div></td>
                        <td class="px-6 py-4">
                            <div class="flex justify-end gap-1">
                                <div class="h-8 w-8 bg-slate-200 rounded-xl"></div>
                                <div class="h-8 w-8 bg-slate-200 rounded-xl"></div>
                                <div class="h-8 w-8 bg-slate-200 rounded-xl"></div>
                            </div>
                        </td>
                    </tr>
                  </tbody>
                  <tbody v-else-if="promotions.length > 0" class="divide-y divide-slate-50">
                    <tr v-for="promo in promotions" :key="promo.id" class="hover:bg-slate-50/80 transition-colors group" :class="{'opacity-50': promo.status === 'Đã hết hạn'}">                   
                      <td class="px-6 py-4">
                        <div class="flex flex-col">
                          <span class="text-sm font-bold text-slate-900 tracking-tight uppercase group-hover:text-[#ff8f73] transition-colors">{{ promo.code }}</span>
                          <span class="text-[11px] text-slate-500 font-medium">{{ promo.name }}</span>
                          <span class="flex items-center gap-1 text-[10px] text-slate-400">
                            <span class="material-symbols-outlined text-[12px]">schedule</span>
                            {{ promo.timeString }}
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-xs text-slate-600 font-medium">{{ promo.type }}</td>
                      <td class="px-6 py-4 text-sm font-bold text-slate-900">{{ promo.value }}</td>

                      <td class="px-6 py-4">
                        <div class="flex flex-col items-center gap-1.5">
                          <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div class="h-full rounded-full transition-all duration-500" 
                                 :class="getProgressBarColor(promo)" 
                                 :style="{ width: getProgressWidth(promo) }"></div>
                          </div>
                          <span class="text-[10px] font-bold" :class="promo.status === 'Đã hết hạn' ? 'text-rose-500' : 'text-slate-500'">
                            {{ promo.limit === 'unlimited' ? 'Không giới hạn' : `${promo.used} / ${promo.limit}` }}
                          </span>
                        </div>
                      </td>
                      
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <span class="relative flex h-2.5 w-2.5">
                            <span v-if="promo.status === 'Đang chạy'" class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="getStatusPingColor(promo.status)"></span>
                            <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="getStatusDotColor(promo.status)"></span>
                          </span>
                          <span class="text-xs font-bold" :class="getStatusTextColor(promo.status)">{{ promo.status }}</span>
                        </div>
                      </td>
                      
                      <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-1">
                          <button @click="openEditPromoModal(promo)" class="size-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all text-slate-400 shadow-sm" title="Chỉnh sửa">
                            <span class="material-symbols-outlined text-[18px]">edit_square</span>
                          </button>
                          <button class="size-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:text-sky-500 hover:border-sky-500 transition-all text-slate-400 shadow-sm" title="Phân tích hiệu quả">
                            <span class="material-symbols-outlined text-[18px]">monitoring</span>
                          </button>
                          <button class="size-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:text-rose-500 hover:border-rose-500 hover:bg-rose-50 transition-all text-slate-400 shadow-sm" title="Xóa mã">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                        <td colspan="6" class="py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <div class="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <span class="material-symbols-outlined text-[40px] text-slate-300" style="font-variation-settings: 'FILL' 1;">redeem</span>
                                </div>
                                <h4 class="text-slate-900 font-bold mb-2">Không tìm thấy chiến dịch nào</h4>
                                <p class="text-xs text-slate-500 mb-6 leading-relaxed">Hiện tại chưa có chiến dịch nào được tạo, hoặc không có dữ liệu phù hợp với bộ lọc tìm kiếm của bạn.</p>
                                <button @click="openAddPromoModal" class="bg-white border border-slate-200 text-slate-600 hover:text-[#ff8f73] hover:border-[#ff8f73] hover:bg-[#ff8f73]/5 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">add_circle</span> Tạo mã mới ngay
                                </button>
                            </div>
                        </td>
                    </tr>
                  </tbody>
                </table>
              </div>
  
              <div v-show="!isLoading && promotions.length > 0" class="px-6 py-4 flex items-center justify-between bg-slate-50/30 border-t border-slate-100">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hiển thị 1 - 4 trong 24 khuyến mãi</p>
                <div class="flex items-center gap-2">
                <button @click="if(currentPage > 1) { currentPage--; fetchPromotions(); }" class="...">
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                <button class="bg-[#ff8f73] text-white...">{{ currentPage }}</button>
                
                <button @click="if(currentPage < totalPages) { currentPage++; fetchPromotions(); }" class="...">
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
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
    <div v-if="isAddPromoModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#ff8f73]">campaign</span> Cấu hình Chiến dịch mới
            </h3>
            <p class="text-xs text-slate-500 font-medium mt-1">Thiết lập linh hoạt Voucher hoặc Khuyến mãi tự động</p>
          </div>
          <button @click="isAddPromoModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">1. Hình thức khuyến mãi</label>
            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all" :class="newPromo.applyType === 'Voucher' ? 'border-[#ff8f73] bg-[#ff8f73]/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
                <input type="radio" v-model="newPromo.applyType" value="Voucher" class="mt-0.5 w-4 h-4 text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300">
                <div>
                  <p class="text-sm font-bold" :class="newPromo.applyType === 'Voucher' ? 'text-[#ff3d00]' : 'text-slate-700'">Mã Voucher</p>
                  <p class="text-xs text-slate-500 font-medium mt-1">Khách hàng phải nhập mã thủ công ở bước thanh toán.</p>
                </div>
              </label>
              <label class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all" :class="newPromo.applyType === 'Auto' ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
                <input type="radio" v-model="newPromo.applyType" value="Auto" class="mt-0.5 w-4 h-4 text-purple-500 focus:ring-purple-500 border-slate-300">
                <div>
                  <p class="text-sm font-bold" :class="newPromo.applyType === 'Auto' ? 'text-purple-700' : 'text-slate-700'">Khuyến mãi Tự động</p>
                  <p class="text-xs text-slate-500 font-medium mt-1">Hệ thống tự động gạch ngang giá, áp dụng trực tiếp.</p>
                </div>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên chiến dịch (*)</label>
              <input v-model="newPromo.name" type="text" placeholder="VD: Siêu Sale Black Friday" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>

            <div v-if="newPromo.applyType === 'Voucher'" class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mã nhập (Code) (*)</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#ff8f73] text-[20px]">sell</span>
                <input v-model="newPromo.code" @input="newPromo.code = newPromo.code.toUpperCase().replace(/\s/g, '')" type="text" placeholder="VD: BLACKFRIDAY2024" class="w-full border border-[#ff8f73]/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-900 tracking-wider bg-white">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="grid grid-cols-2 gap-4 md:col-span-2">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Loại mức giảm</label>
                <select v-model="newPromo.type" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-700 bg-white">
                  <option value="Phần trăm (%)">Phần trăm (%)</option>
                  <option value="Cố định (đ)">Số tiền (VNĐ)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá trị (*)</label>
                <div class="relative">
                  <input v-model.number="newPromo.rawValue" type="number" min="1" placeholder="Nhập số..." class="w-full border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-[#ff3d00]">
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    {{ newPromo.type === 'Phần trăm (%)' ? '%' : '₫' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="newPromo.type === 'Phần trăm (%)'" class="md:col-span-2 border-t border-slate-200 pt-4">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giảm tối đa (GiaTriGiamToiDa)</label>
              <div class="relative w-full md:w-1/2">
                <input v-model.number="newPromo.maxDiscount" type="number" min="0" placeholder="VD: 50.000" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] outline-none font-bold text-slate-700">
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">VNĐ</span>
              </div>
              <p class="text-[10px] text-slate-400 mt-1 italic">Để trống nếu không giới hạn số tiền giảm.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="newPromo.applyType === 'Voucher'">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Đơn tối thiểu </label>
              <div class="relative">
                <input v-model.number="newPromo.minOrderValue" type="number" min="0" placeholder="VD: 200.000" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] outline-none font-bold text-slate-700">
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">VNĐ</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phạm vi áp dụng</label>
              <select v-model="newPromo.applyScope" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-700 bg-white">
                <option value="All">Toàn bộ đơn hàng</option>
                <option value="Category">Danh mục cụ thể</option>
                <option value="Product">Sản phẩm cụ thể</option>
              </select>
            </div>

            <div v-if="newPromo.applyScope !== 'All'">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Chọn {{ newPromo.applyScope === 'Category' ? 'Danh mục' : 'Sản phẩm' }}
              </label>
              <select class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all font-medium text-slate-700 bg-white">
                <option v-if="newPromo.applyScope === 'Category'">Gundam / Mecha</option>
                <option v-if="newPromo.applyScope === 'Category'">Anime Figures</option>
                <option v-if="newPromo.applyScope === 'Product'">Luffy Gear 5 Sun God</option>
                <option v-if="newPromo.applyScope === 'Product'">Gundam RX-78-2 Ver 2.0</option>
              </select>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Từ ngày (*)</label>
                <input v-model="newPromo.startDate" type="datetime-local" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Đến ngày (*)</label>
                <input v-model="newPromo.endDate" type="datetime-local" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-white">
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Giới hạn sử dụng</label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input v-model="newPromo.isUnlimited" type="checkbox" class="w-3.5 h-3.5 rounded text-[#ff8f73] focus:ring-[#ff8f73] border-slate-300 transition-colors cursor-pointer">
                  <span class="text-[10px] font-bold text-slate-400 hover:text-slate-700">Vô hạn</span>
                </label>
              </div>
              <input v-model.number="newPromo.rawLimit" :disabled="newPromo.isUnlimited" type="number" min="1" placeholder="VD: 100" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái khởi tạo</label>
              <select v-model="newPromo.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-700 bg-white">
                <option value="Đang chạy">Bắt đầu chạy ngay</option>
                <option value="Đã lên lịch">Lên lịch (Tạm dừng)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button @click="isAddPromoModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
          <button @click="submitNewPromo" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">publish</span> Xuất bản chiến dịch
          </button>
        </div>
      </div>
    </div>
    <div v-if="isEditPromoModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-sky-500">edit_square</span> Chỉnh sửa Chiến dịch
            </h3>
            <p class="text-xs text-slate-500 font-medium mt-1">
              Đang chỉnh sửa: <span class="font-bold text-[#ff8f73]">{{ editingPromo.code }}</span>
            </p>
          </div>
          <button @click="isEditPromoModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên chiến dịch (*)</label>
              <input v-model="editingPromo.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-medium text-slate-700 bg-white">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mã nhập (Code)</label>
              <input :value="editingPromo.code" disabled type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 bg-slate-100 cursor-not-allowed">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
              <select v-model="editingPromo.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-bold text-slate-700 bg-white">
                <option value="Đang chạy">Đang chạy</option>
                <option value="Đã lên lịch">Đã lên lịch</option>
                <option value="Đã hết hạn">Đã hết hạn (Khóa)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Loại mức giảm</label>
              <select v-model="editingPromo.type" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-bold text-slate-700 bg-white">
                <option value="Phần trăm (%)">Phần trăm (%)</option>
                <option value="Cố định (đ)">Số tiền (VNĐ)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá trị (*)</label>
              <div class="relative">
                <input v-model.number="editingPromo.rawValue" type="number" min="1" class="w-full border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-bold text-sky-600">
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {{ editingPromo.type === 'Phần trăm (%)' ? '%' : '₫' }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Từ ngày</label>
              <input v-model="editingPromo.startDate" :disabled="editingPromo.status === 'Đang chạy'" type="datetime-local" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-medium text-slate-700 bg-white disabled:bg-slate-50 disabled:text-slate-400">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Đến ngày (*)</label>
              <input v-model="editingPromo.endDate" type="datetime-local" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-medium text-slate-700 bg-white">
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Nâng/Hạ Giới hạn sử dụng</label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input v-model="editingPromo.isUnlimited" type="checkbox" class="w-3.5 h-3.5 rounded text-sky-500 focus:ring-sky-500 border-slate-300 transition-colors cursor-pointer">
                <span class="text-[10px] font-bold text-slate-400">Vô hạn</span>
              </label>
            </div>
            <input v-model.number="editingPromo.rawLimit" :disabled="editingPromo.isUnlimited" type="number" min="1" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed">
            <p class="text-[10px] text-slate-400 mt-2 font-medium">Hiện tại đã có <span class="font-bold text-slate-700">{{ editingPromo.used }}</span> lượt sử dụng.</p>
          </div>
        </div>
        
        <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button @click="isEditPromoModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
          <button @click="submitEditPromo" class="px-6 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-black shadow-lg shadow-slate-800/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">save</span> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, computed } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast';
  import { onMounted, watch } from 'vue';
  
  const toastStore = useToastStore();
  const isSidebarCollapsed = ref(false);
  const isMobileMenuOpen = ref(false);
  const isLoading = ref(true);

  // Dữ liệu Mảng Tab
  const tabs = [
    { id: 'all', name: 'Tất cả' },
    { id: 'active', name: 'Đang chạy' },
    { id: 'scheduled', name: 'Sắp tới' },
    { id: 'expired', name: 'Đã hết hạn' }
  ];
  const activeTab = ref('all');

// (Giữ nguyên các biến tabs, promotions... ở dưới của bạn)
  // --- LOGIC MODAL TẠO CHIẾN DỊCH KHUYẾN MÃI ---
  const isAddPromoModalOpen = ref(false);

  // Khởi tạo mảng rỗng để chứa dữ liệu thật từ Server
  const promotions = ref([]);
  const currentPage = ref(1);
  const totalPages = ref(1);

  // Hàm gọi API từ Backend
  const fetchPromotions = async () => {
    isLoading.value = true;
    try {
      // Chuyển đổi Tab của UI thành tham số API (Khớp với if-else ở Backend)
      let trangthaiParam = '';
      if (activeTab.value === 'active') trangthaiParam = 'DangChay';
      else if (activeTab.value === 'scheduled') trangthaiParam = 'SapToi';
      else if (activeTab.value === 'expired') trangthaiParam = 'HetHan';

      // Gọi thẳng xuống API của bạn
      const response = await fetch(`http://localhost:3000/api/khuyen_mai?page=${currentPage.value}&limit=10&trangthai=${trangthaiParam}`);
      const result = await response.json();

      if (result.success) {
        // Mapping dữ liệu từ DB cho khớp với các trường trên UI
        promotions.value = result.data.map(item => {
          
          const now = new Date();
          const start = new Date(item.ThoiGianBD);
          const end = new Date(item.ThoiGianKT);
          
          let currentStatus = 'Đang chạy';
          if (now < start) currentStatus = 'Đã lên lịch';
          else if (now > end) currentStatus = 'Đã hết hạn';

          const formatTime = (d) => {
             const pad = (n) => n.toString().padStart(2, '0');
             return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${pad(d.getDate())}/${pad(d.getMonth()+1)}`;
          };

          return {
            id: item.MaKM,
            code: 'AUTO-SALE',         
            name: item.TenKM,          
            type: item.LoaiKM || 'Tự động', 
            value: item.DieuKien || 'Theo sản phẩm',    
            timeString: `${formatTime(start)} - ${formatTime(end)}`, 
            used: 0,                   
            limit: 'unlimited',        
            status: currentStatus      
          };
        });
        
        totalPages.value = result.pagination.totalPage;
      }
    } catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Tự động gọi API ngay khi Load trang
  onMounted(() => {
    fetchPromotions();
  });

  // Lắng nghe: Khi click chuyển Tab thì gọi lại API
  watch(activeTab, () => {
    currentPage.value = 1;
    fetchPromotions();
  });


// State chứa toàn bộ dữ liệu của Form
  const newPromo = ref({
    applyType: 'Voucher', // 'Voucher' hoặc 'Auto'
    name: '',
    code: '',
    type: 'Phần trăm (%)',
    rawValue: '',
    applyScope: 'All', // 'All', 'Category', 'Product'
    startDate: '',
    endDate: '',
    isUnlimited: false,
    rawLimit: '',
    status: 'Đang chạy'
  });

  const openAddPromoModal = () => {
    // Reset form khi mở
    newPromo.value = {
        applyType: 'Voucher',
        name: '',
        code: '',
        type: 'Phần trăm (%)',
        rawValue: '',
        applyScope: 'All',
        startDate: '',
        endDate: '',
        isUnlimited: false,
        rawLimit: '',
        status: 'Đang chạy'
    };
    isAddPromoModalOpen.value = true;
  };

  const submitNewPromo = () => {
    // 1. Validation Nghiệp vụ (Rất quan trọng)
    if (!newPromo.value.name.trim()) {
        toastStore.showToast("Vui lòng nhập Tên chiến dịch!", 'error');
        return;
    }
    
    if (newPromo.value.applyType === 'Voucher' && !newPromo.value.code.trim()) {
        toastStore.showToast("Vui lòng tạo Mã Voucher (Code)!", 'error');
        return;
    }
    
    if (!newPromo.value.rawValue) {
        toastStore.showToast("Vui lòng nhập Giá trị giảm!", 'error');
        return;
    }

    if (!newPromo.value.startDate || !newPromo.value.endDate) {
        toastStore.showToast("Vui lòng thiết lập Thời gian áp dụng (Từ ngày - Đến ngày)!", 'error');
        return;
    }

    if (new Date(newPromo.value.endDate) <= new Date(newPromo.value.startDate)) {
        toastStore.showToast("Ngày kết thúc phải diễn ra sau Ngày bắt đầu!", 'error');
        return;
    }

    // 2. Format Giá trị hiển thị
    let formattedValue = '';
    if (newPromo.value.type === 'Phần trăm (%)') {
        const val = Math.min(newPromo.value.rawValue, 100);
        formattedValue = `-${val}%`;
    } else {
        formattedValue = `-${newPromo.value.rawValue.toLocaleString('vi-VN')}₫`;
    }

    // 3. Xử lý "Mã code hiển thị"
    // Nếu là Auto-Discount, hiển thị nhãn [Tự động] thay vì mã Code
    const displayCode = newPromo.value.applyType === 'Voucher' 
                        ? newPromo.value.code 
                        : '⚡ AUTO DISCOUNT';

    const finalLimit = newPromo.value.isUnlimited ? 'unlimited' : (newPromo.value.rawLimit || 1);

    // 4. Thêm vào bảng (Giao diện bảng hiện tại)
    promotions.value.unshift({
        id: Date.now(),
        code: displayCode, // Mã hiển thị linh hoạt
        name: newPromo.value.name,
        type: newPromo.value.type,
        value: formattedValue,
        used: 0,
        limit: finalLimit,
        status: newPromo.value.status
    });

    isAddPromoModalOpen.value = false;
  };
  // --- LOGIC MODAL CHỈNH SỬA KHUYẾN MÃI ---
const isEditPromoModalOpen = ref(false);
const editingPromo = ref({});

const openEditPromoModal = (promo) => {
  // THUẬT TOÁN "DỊCH NGƯỢC" DỮ LIỆU
  // 1. Tách con số ra khỏi chuỗi "-15%" hoặc "-100.000₫"
  // Dùng Regex (Biểu thức chính quy) để lấy tất cả các chữ số
  const extractedValue = parseInt(promo.value.replace(/\D/g, '')); 

  // 2. Kiểm tra xem giới hạn có phải là 'unlimited' không
  const isUnlimit = promo.limit === 'unlimited';

  // 3. Gán dữ liệu vào biến editingPromo
  editingPromo.value = {
    ...promo, // Copy toàn bộ dữ liệu cũ
    rawValue: extractedValue,
    isUnlimited: isUnlimit,
    rawLimit: isUnlimit ? '' : promo.limit
  };

  isEditPromoModalOpen.value = true;
};

const submitEditPromo = () => {
  // 1. Validation
  if (!editingPromo.value.name.trim()) {
    toastStore.showToast("Vui lòng nhập Tên chiến dịch!", 'error');
    return;
  }
  
  // Kiểm tra không cho phép giới hạn mới nhỏ hơn số lượt đã dùng
  if (!editingPromo.value.isUnlimited && editingPromo.value.rawLimit < editingPromo.value.used) {
    toastStore.showToast(`Không hợp lệ! Mã này đã được dùng ${editingPromo.value.used} lần. Giới hạn mới phải lớn hơn hoặc bằng ${editingPromo.value.used}.`, 'error');
    return;
  }

  // 2. Format lại chuỗi Giá trị hiển thị
  let formattedValue = '';
  if (editingPromo.value.type === 'Phần trăm (%)') {
    const val = Math.min(editingPromo.value.rawValue, 100);
    formattedValue = `-${val}%`;
  } else {
    formattedValue = `-${editingPromo.value.rawValue.toLocaleString('vi-VN')}₫`;
  }

  const finalLimit = editingPromo.value.isUnlimited ? 'unlimited' : editingPromo.value.rawLimit;

  // 3. Tìm và cập nhật vào mảng gốc
  const index = promotions.value.findIndex(p => p.id === editingPromo.value.id);
  if (index !== -1) {
    promotions.value[index] = {
      ...editingPromo.value,
      value: formattedValue,
      limit: finalLimit
    };
  }

  // Đóng Modal
  isEditPromoModalOpen.value = false;
};
  
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) isMobileMenuOpen.value = !isMobileMenuOpen.value;
    else isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };
  
  
  // --- LOGIC BỘ LỌC NÂNG CAO ---
  const isFilterMenuOpen = ref(false);

  // Object chứa các tiêu chí lọc
  const filters = ref({
    type: 'all',  // 'all', 'Phần trăm', 'Cố định'
    limit: 'all'  // 'all', 'limited', 'unlimited'
  });

  // Đếm số lượng bộ lọc đang được dùng (để hiện con số nhỏ trên nút)
  const activeFiltersCount = computed(() => {
    let count = 0;
    if (filters.value.type !== 'all') count++;
    if (filters.value.limit !== 'all') count++;
    return count;
  });

  // Hàm Xóa bộ lọc (Reset)
  const resetFilters = () => {
    filters.value.type = 'all';
    filters.value.limit = 'all';
  };

  // Cập nhật lại hàm ẩn Menu nếu click ra ngoài trang
  const closeAllMenus = () => {
    isFilterMenuOpen.value = false;
  };
  // Dữ liệu Mock
  
  
  // // Lọc dữ liệu
  // const filteredPromotions = computed(() => {
  //   let result = promotions.value;
  //   // TẦNG 1: Lọc theo Tab (Trạng thái)
  //   if (activeTab.value === 'active') {
  //       result = result.filter(p => p.status === 'Đang chạy');
  //   } else if (activeTab.value === 'scheduled') {
  //       result = result.filter(p => p.status === 'Đã lên lịch');
  //   } else if (activeTab.value === 'expired') {
  //       result = result.filter(p => p.status === 'Đã hết hạn');
  //   }

  //   // TẦNG 2: Lọc theo Loại (Phần trăm hay Tiền mặt)
  //   if (filters.value.type !== 'all') {
  //       result = result.filter(p => p.type.includes(filters.value.type));
  //   }

  //   // TẦNG 3: Lọc theo Giới hạn sử dụng
  //   if (filters.value.limit === 'unlimited') {
  //       result = result.filter(p => p.limit === 'unlimited');
  //   } else if (filters.value.limit === 'limited') {
  //       result = result.filter(p => p.limit !== 'unlimited');
  //   }
  //   return result;
  // });
  
  // --- CÁC HÀM XỬ LÝ LOGIC UI ---
  // 1. Tính độ dài thanh Progress Bar (%)
  const getProgressWidth = (promo) => {
    if (promo.limit === 'unlimited') return '100%';
    const percentage = (promo.used / promo.limit) * 100;
    return `${percentage}%`;
  };
  
  // 2. Màu của Progress Bar (Nếu hết hạn hoặc dùng hết thì đỏ, Vô hạn thì Xanh, Đang chạy thì Cam)
  const getProgressBarColor = (promo) => {
    if (promo.status === 'Đã hết hạn' || promo.used === promo.limit) return 'bg-rose-500';
    if (promo.limit === 'unlimited') return 'bg-purple-400 opacity-50'; // Giống ý tưởng HTML cũ
    return 'bg-[#ff8f73]';
  };
  
  // 3. Hệ thống Màu Trạng thái (Dots & Text)
  const getStatusTextColor = (status) => {
    if (status === 'Đang chạy') return 'text-emerald-600';
    if (status === 'Đã lên lịch') return 'text-amber-600';
    if (status === 'Đã hết hạn') return 'text-rose-600';
    return 'text-slate-500';
  };
  
  const getStatusDotColor = (status) => {
    if (status === 'Đang chạy') return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
    if (status === 'Đã lên lịch') return 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
    if (status === 'Đã hết hạn') return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
    return 'bg-slate-400';
  };
  
  const getStatusPingColor = (status) => {
    if (status === 'Đang chạy') return 'bg-emerald-400';
    return '';
  };
  
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>