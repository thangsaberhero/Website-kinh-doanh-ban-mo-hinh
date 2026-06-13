<template>
  <div @click="layoutStore.closeMobileMenu" class="bg-slate-100 h-screen overflow-hidden font-body flex w-full text-slate-800 relative">
    <div 
      v-show="layoutStore.isMobileMenuOpen" 
      @click="layoutStore.isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
    ></div>

    <AdminSideBar :is-collapsed="layoutStore.isSidebarCollapsed" :is-mobile-open="layoutStore.isMobileMenuOpen"/>

    <div 
      class="fixed top-0 right-0 h-screen w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="isFilterPanelOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Bộ lọc nâng cao</h2>
          <p class="text-xs text-slate-500">Tùy chỉnh tiêu chí tìm kiếm sản phẩm</p>
        </div>
        <button @click="isFilterPanelOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
      
              <div class="space-y-4">
                  <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">inventory_2</span> Tình trạng sản phẩm
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                      <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-[#ff8f73] has-[:checked]:bg-[#ff8f73]/5">
                          <input type="radio" name="stock" v-model="stockFilter" value="all" checked class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                          <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Tất cả</span>
                      </label>
                      <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50">
                          <input type="radio" name="stock" v-model="stockFilter" value="low" class="w-4 h-4 text-rose-500 border-slate-300 focus:ring-rose-500">
                          <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Sắp hết (&lt; 3)</span>
                      </label>
                      <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-slate-400 has-[:checked]:bg-slate-100">
                          <input type="radio" name="stock" v-model="stockFilter" value="out" class="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-600">
                          <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Hết hàng</span>
                      </label>
                  </div>
              </div>

              <hr class="border-slate-100">

              <div class="space-y-4">
                  <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">sell</span> Loại hình bán
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                      <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-[#ff8f73] has-[:checked]:bg-[#ff8f73]/5">
                          <input type="radio" v-model="saleTypeFilter" value="all" class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                          <span class="text-xs font-bold text-slate-700">Tất cả</span>
                      </label>
                      <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-[#ff8f73] has-[:checked]:bg-[#ff8f73]/5">
                          <input type="radio" v-model="saleTypeFilter" value="preorder" class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                          <span class="text-xs font-bold text-slate-700">Pre-order</span>
                      </label>
                      <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-[#ff8f73] has-[:checked]:bg-[#ff8f73]/5">
                          <input type="radio" v-model="saleTypeFilter" value="order" class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                          <span class="text-xs font-bold text-slate-700">Order</span>
                      </label>
                      <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-[#ff8f73] has-[:checked]:bg-[#ff8f73]/5">
                          <input type="radio" v-model="saleTypeFilter" value="cosan" class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                          <span class="text-xs font-bold text-slate-700">Có sẵn</span>
                      </label>
                  </div>
              </div>

              <hr class="border-slate-100">

              <div class="space-y-6">
                  <div class="space-y-4">
                      <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <span class="material-symbols-outlined text-[16px]">category</span> Danh mục chính
                      </label>
                      <select v-model="selectedCat" class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-3 focus:border-[#ff8f73] outline-none transition-all">
                          <option value="">-- Tất cả danh mục --</option>
                          <option v-for="cat in filterCategories" :key="cat.MaDM" :value="cat.MaDM">
                              {{ cat.TenDM }}
                          </option>
                      </select>
                  </div>

                  <div v-if="selectedCat" class="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                      <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <span class="material-symbols-outlined text-[16px]">account_tree</span> Loại chi tiết
                      </label>
                      <div class="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <label v-for="sub in detailCategories" :key="sub.MaChiTietDM" class="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-all group">
                              <input type="radio" :value="sub.MaChiTietDM" v-model="selectedDetailCat" class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                              <span class="text-xs font-bold text-slate-600 group-hover:text-slate-900">{{ sub.TenChiTietDM }}</span>
                          </label>
                          <p v-if="detailCategories.length === 0" class="text-[10px] text-slate-400 italic text-center py-2">Không có phân loại con cho mục này</p>
                      </div>
                  </div>
              </div>

              <hr class="border-slate-100">
              <div class="space-y-4">
                  <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">tune</span> Giá
                  </label>

                  <div class="flex items-center gap-2 pt-2">
                      <input type="number" v-model="minprice" placeholder="Giá từ..." class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/50 focus:border-[#ff8f73] transition-all placeholder:text-slate-400 placeholder:font-normal">
                      <span class="text-slate-300">-</span>
                      <input type="number" v-model="maxprice" placeholder="Đến..." class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/50 focus:border-[#ff8f73] transition-all placeholder:text-slate-400 placeholder:font-normal">
                  </div>
              </div>

              <hr class="border-slate-100">
              <div class="space-y-4 pb-4">
                  <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">sort</span> Sắp xếp theo
                  </label>
                  <select v-model="sortBy" class="w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/50 focus:border-[#ff8f73] transition-all cursor-pointer shadow-sm">
                      <option value="newest">Mới cập nhật nhất</option>
                      <option value="price_asc">Giá bán: Thấp đến Cao</option>
                      <option value="price_desc">Giá bán: Cao đến Thấp</option>
                      <option value="date_desc">Giá bán: Cao đến Thấp</option>
                      <option value="stock_asc">Tồn kho: Ít nhất</option>
                  </select>
              </div>
          </div>
      </div>

      <div class="p-6 border-t border-slate-100 flex gap-3 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button @click="resetFilters" class="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Đặt lại</button>
          <button @click="applyAdvancedFilters" class="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-all text-sm">Áp dụng</button>
      </div>
    </div>

    <div class="flex-1 flex flex-col h-screen overflow-hidden w-full">
      <AdminHeader @toggle-sidebar="layoutStore.toggleSidebar" />
      
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-24">
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý sản phẩm</h1>
            <p class="text-slate-500 text-sm font-medium">Theo dõi và cập nhật số lượng mô hình sưu tầm trong hệ thống.</p>
          </div>
          
          <div class="flex gap-3 w-full xl:w-auto">
            <button @click="exportExcelReport" class="flex-1 xl:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
              <span class="material-symbols-outlined text-[20px]" :class="{'animate-bounce': isExporting}">file_download</span>
              {{ isExporting ? 'Đang tạo file...' : 'Xuất báo cáo' }}
            </button>
            <button @click="openAddModal" class="flex-1 xl:flex-none bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm">
              <span class="material-symbols-outlined text-[20px]">add_box</span>
              Thêm sản phẩm
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng mẫu sản phẩm</p>
              <h3 class="text-2xl font-brand font-bold text-slate-900">{{ summary.TongSanPham || 0 }}</h3>
              <p class="text-[11px] text-slate-400 font-medium mt-1">Mẫu mô hình trong danh mục</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 text-blue-500 shadow-inner shrink-0">
              <span class="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Đang dồi dào kho</p>
              <h3 class="text-2xl font-brand font-bold text-emerald-600">{{ summary.DangCoSan || 0 }}</h3>
              <p class="text-[11px] text-emerald-500 font-bold mt-1">Số lượng tồn kho > 3</p>
            </div>
            <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-500 shadow-inner shrink-0">
              <span class="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
          </div>

          <!-- <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Cảnh báo sắp hết</p>
              <h3 class="text-2xl font-brand font-bold text-amber-600">{{ summary.SapHetHang || 0 }}</h3>
              <p class="text-[11px] text-amber-500 font-bold mt-1">Số lượng chỉ còn từ 1 - 3</p>
            </div>
            <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 text-amber-500 shadow-inner shrink-0">
              <span class="material-symbols-outlined text-[24px]">warning</span>
            </div>
          </div> -->

          <!-- <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Đã cháy hàng</p>
              <h3 class="text-2xl font-brand font-bold text-rose-600">{{ summary.HetHang || 0 }}</h3>
              <p class="text-[11px] text-rose-500 font-bold mt-1">Tồn kho bằng 0 (Cần nhập thêm)</p>
            </div>
            <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 text-rose-500 shadow-inner shrink-0">
              <span class="material-symbols-outlined text-[24px]">block</span>
            </div>
          </div> -->
          
          <div class="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-start gap-5 relative overflow-hidden">
            
            <div class="flex flex-col sm:flex-row gap-3 relative z-10">
              
              <div class="flex flex-1 items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-400/20 transition-all shadow-inner">
                <span class="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                <input v-model="searchQuery" type="text" placeholder="Tìm tên SP, nhân vật, anime, quét mã vạch..." class="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400">
              </div>

              <button 
                @click="isFilterPanelOpen = true"
                class="flex items-center justify-center gap-2 bg-[#ff8f73]/10 text-[#ff8f73] px-5 py-3 rounded-xl font-bold hover:bg-[#ff8f73]/20 transition-colors shrink-0 whitespace-nowrap"
              >
                <span class="material-symbols-outlined text-[18px]">tune</span>
                Bộ lọc nâng cao
              </button>
            </div>

            <div class="flex flex-wrap gap-2 relative z-10">
              <button 
                v-for="brand in Brands" :key="brand.MaHSX"
                @click="activeFilter = brand.MaHSX"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm"
                :class="activeFilter === brand.MaHSX 
                  ? 'bg-[#ff8f73] text-white border-[#ff8f73] shadow-[#ff8f73]/20' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700'"
              >
                {{ brand.TenHSX }}
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm custom-scrollbar">
            <table class="w-full text-left border-collapse whitespace-nowrap">
              
              <thead class="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th class="py-4 pl-6 pr-4 font-semibold text-left">
                    <div class="flex items-center gap-3">
                      <div class="w-6 shrink-0"></div> 
                      <span>Tên sản phẩm</span>
                    </div>
                  </th>
                  <th class="px-6 py-4 font-semibold text-left">Loại hình bán</th>
                  <th class="px-6 py-4 font-semibold text-right">Giá nhập</th>
                  <th class="px-6 py-4 font-semibold text-right">Giá bán</th>
                  <th class="px-6 py-4 font-semibold text-center">Tồn kho</th>
                  <th class="px-6 py-4 font-semibold text-center">Hành động</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-50">
                <template v-for="product in products" :key="product.id">
                  
                  <tr class="transition-colors group hover:bg-slate-50/80" 
                      :class="product.variants && product.variants.length > 1 ? 'cursor-pointer' : 'cursor-default'"
                      @click="product.variants && product.variants.length > 1 ? toggleRow(product.id) : null">
                    
                    <td class="py-4 pl-6 pr-4 align-middle">
                      <div class="flex items-center gap-3">
                        
                        <div class="w-6 shrink-0 flex items-center justify-center">
                          <button v-if="product.variants && product.variants.length > 1" 
                                  @click.stop="toggleRow(product.id)"
                                  class="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-[#ff8f73]/10 hover:text-[#ff8f73] transition-colors">
                            <span class="material-symbols-outlined text-[20px] transition-transform duration-200" 
                                  :class="expandedRows.includes(product.id) ? 'rotate-180 text-[#ff8f73]' : ''">
                              expand_more
                            </span>
                          </button>
                        </div>

                        <div class="flex items-center gap-4">
                          <div class="w-11 h-11 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shadow-inner shrink-0 p-[1px]">
                            <img :src="product.thumbnailUrl" class="w-full h-full object-cover rounded-md"/>
                          </div>
                          <div class="flex flex-col">
                            <p class="font-bold text-slate-900 text-[14px] truncate max-w-[220px]" :title="product.name">{{ product.name }}</p>
                            <div class="flex flex-wrap items-center gap-1.5 mt-1">
                              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border shadow-sm" :class="getBrandColor(product.brand)">
                                {{ product.brand }}
                              </span>
                              <span v-if="product.characterName" class="text-[9px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded font-bold border border-sky-100 shadow-sm">{{ product.characterName }}</span>
                              <span v-if="product.series" class="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-bold border border-purple-100 shadow-sm">{{ product.series }}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </td>
                    
                    <td class="px-6 py-4 align-middle">
                      <div class="flex flex-col items-start justify-center gap-1.5">
                        
                        <div class="relative" @click.stop>
                          <select v-model="product.selltype" 
                                  @change="quickUpdateSellType(product.id, product.selltype)"
                                  class="text-xs font-bold pl-2 pr-6 py-1 rounded-md border appearance-none outline-none transition-colors shadow-sm cursor-pointer"
                                  :class="{
                                    'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300 focus:ring-2 focus:ring-purple-100': product.selltype?.toLowerCase().includes('order'),
                                    'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300 focus:ring-2 focus:ring-emerald-100': product.selltype === 'Có sẵn'
                                  }">
                            <option value="Có sẵn" class="text-slate-700 font-medium">Có sẵn</option>
                            <option value="Pre-order" class="text-slate-700 font-medium">Pre-order</option>
                            <option value="Order" class="text-slate-700 font-medium">Order</option>
                          </select>
                          <span class="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none"
                                :class="product.selltype === 'Có sẵn' ? 'text-emerald-500' : 'text-purple-500'">
                            arrow_drop_down
                          </span>
                        </div>

                        <div class="flex items-center gap-1 group/edit bg-slate-50 border border-slate-200 px-2 py-0.5 rounded transition-all" 
                             @click.stop>
                          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cọc:</span>
                          <input type="text" 
                                 v-model="product.rawMinDeposit" 
                                 @keyup.enter="quickUpdateDeposit(product.id, product.rawMinDeposit)"
                                 class="w-14 text-right text-xs font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-400 focus:outline-none transition-colors font-mono"
                                 title="Nhấn Enter để lưu giá cọc">
                          <span class="text-[9px] font-bold text-slate-500">đ</span>
                        </div>

                      </div>
                    </td>

                    <td class="px-6 py-4 align-middle text-right">
                      <p class="font-bold text-slate-500 text-xs font-mono">{{ product.basePrice }} đ</p>
                    </td>
                    
                    <td class="px-6 py-4 align-middle text-right">
                      <div class="flex flex-col items-end justify-center gap-1">
                        
                        <div v-if="product.variants && product.variants.length > 1" class="flex items-center justify-end gap-1">
                          <span class="text-sm font-bold text-slate-900 font-mono">{{ product.sellPrice }}</span>
                          <span class="text-xs font-bold text-slate-600">đ</span>
                        </div>

                        <div v-else class="inline-flex items-center justify-end gap-1 group/edit relative">
                          <input type="text" 
                                 v-model="product.sellPrice" 
                                 @click.stop
                                 @keyup.enter="quickUpdateVariant(product.defaultVariantId, product.sellPrice, product.stock)"
                                 class="w-20 text-right text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none transition-colors py-0.5 font-mono">
                          <span class="text-xs font-bold text-slate-600">đ</span>
                        </div>

                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm"
                              :class="product.variants && product.variants.length > 1 ? 'text-purple-600 bg-purple-50 border border-purple-100' : 'text-slate-400 bg-slate-50 border border-slate-200'">
                          {{ product.variants && product.variants.length > 1 ? 'Nhiều phân loại' : 'Một mức giá' }}
                        </span>
                      </div>
                    </td>
                    
                    <td class="px-6 py-4 align-middle text-center">
                      <div class="flex flex-col items-center justify-center gap-1">
                        
                        <div v-if="product.variants && product.variants.length > 1" class="inline-flex items-center justify-center">
                          <div class="w-16 text-center text-xs font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200 py-0.5 cursor-not-allowed">
                            {{ product.stock }}
                          </div>
                        </div>
                        
                        <div v-else class="inline-flex items-center justify-center">
                          <input type="number" 
                                 v-model="product.stock" 
                                 @click.stop
                                 @keyup.enter="quickUpdateVariant(product.defaultVariantId, product.sellPrice, product.stock)"
                                 class="w-16 text-center text-xs font-bold focus:outline-none transition-all py-0.5 rounded-full border"
                                 :class="product.stock <= 0 ? 'text-rose-600 bg-rose-50 border-rose-200 hover:border-rose-300 focus:border-rose-500' : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300 focus:border-emerald-500'">
                        </div>

                        <span v-if="product.variants && product.variants.length > 1 && product.variants.some(v => v.stock <= 0)" class="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 animate-pulse">
                          <span class="material-symbols-outlined text-[12px]">warning</span> Lệch kho
                        </span>
                        <span v-else-if="product.variants && product.variants.length > 1" class="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">Tổng kho</span>
                        <span v-else-if="product.stock <= 0" class="text-[9px] font-black text-rose-500 tracking-wider">HẾT HÀNG</span>
                        <span v-else class="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shadow-sm">Kho thực tế</span>
                      </div>
                    </td>
                    
                    <td class="px-6 py-4 align-middle text-center">
                      <div class="flex justify-center items-center gap-3">
                        <button @click.stop="openEditModal(product)" class="text-slate-400 hover:text-sky-500 transition-colors flex items-center justify-center" title="Sửa thông tin">
                          <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button @click.stop="toggleVisibility(product.id, product.isVisible)" class="text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center" :title="product.isVisible === 1 ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'">
                          <span class="material-symbols-outlined text-[20px]">{{ product.isVisible === 1 ? 'visibility_off' : 'visibility' }}</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="expandedRows.includes(product.id) && product.variants && product.variants.length > 1" class="bg-slate-50/50 shadow-inner">
                    <td colspan="6" class="p-0 border-b border-slate-200/60">
                      <div class="pl-[96px] pr-8 py-5 animate-[fadeIn_0.2s_ease-out]">
                        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              <tr>
                                <th class="py-3 px-6 w-1/2">Tên phân loại sản phẩm</th>
                                <th class="py-3 px-6 text-right">Giá bán trực tiếp</th>
                                <th class="py-3 px-6 text-center">Tồn kho</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50 bg-white">
                              <tr v-for="variant in product.variants" :key="variant.id" class="hover:bg-slate-50/40 transition-colors">
                                <td class="py-4 px-6">
                                  <span class="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 rounded-full" :class="variant.name === 'Mặc định' ? 'bg-amber-400' : 'bg-sky-400'"></span> 
                                    {{ variant.name }}
                                    <span v-if="variant.name === 'Mặc định'" class="text-[9px] font-medium bg-amber-50 text-amber-600 border border-amber-200/60 px-1.5 py-0.5 rounded scale-90 origin-left">Gốc</span>
                                  </span>
                                </td>
                                
                                <td class="py-3 px-6 text-right">
                                  <div class="flex items-center justify-end gap-1.5">
                                    <input type="text" 
                                           v-model="variant.sellPrice" 
                                           @keyup.enter="quickUpdateVariant(variant.id, variant.sellPrice, variant.stock)"
                                           class="w-28 text-right text-xs font-bold text-sky-600 bg-slate-50/80 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all px-3 py-1.5 rounded-lg font-mono shadow-inner">
                                    <span class="text-xs font-bold text-sky-600">đ</span>
                                  </div>
                                </td>
                                
                                <td class="py-3 px-6 text-center">
                                  <input type="number" 
                                         v-model="variant.stock" 
                                         @keyup.enter="quickUpdateVariant(variant.id, variant.sellPrice, variant.stock)"
                                         class="w-20 text-center text-xs font-bold text-slate-700 bg-slate-50/80 border border-slate-200/80 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all px-2 py-1.5 rounded-lg shadow-inner">
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div class="px-6 py-2.5 bg-slate-50 text-[10px] text-slate-400 font-medium italic text-right border-t border-slate-100">
                            💡 Thay đổi số liệu và nhấn <span class="font-bold text-slate-600">Enter</span> để áp dụng lưu nhanh
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                </template>
              </tbody>
            </table>
          </div>
          
          <div class="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p class="text-xs font-bold text-slate-400">Hiển thị {{ (currentPage - 1)*limit + 1 }} - {{Math.min(currentPage * limit, totalProducts)}} của {{ totalProducts }} sản phẩm</p>
            <div class="flex items-center gap-2">
                <button 
                  @click="if(currentPage > 1) { currentPage--; fetchProducts(); }"
                  :disabled="currentPage === 1"
                  class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                <div class="flex items-center gap-1">
                    <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-[#ff8f73] text-white text-xs font-bold shadow-lg shadow-[#ff8f73]/20">
                      {{ currentPage }}
                    </button>
                    <span class="text-xs font-bold text-slate-400 px-2">/ {{ totalPages }}</span>
                </div>
                
                <button 
                  @click="if(currentPage < totalPages) { currentPage++; fetchProducts(); }"
                  :disabled="currentPage === totalPages"
                  class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <div v-if="isAddProductModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Thêm sản phẩm mới</h3>
          <p class="text-xs text-slate-500 font-medium">Nhập thông tin cho mô hình và phân loại mới</p>
        </div>
        <button @click="isAddProductModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-8 overflow-y-auto flex-1 custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên mô hình (*)</label>
            <input v-model="newProduct.name" type="text" placeholder="VD: Gundam Aerial Rebuild" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
          </div>
          <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tên nhân vật</label>
            <input v-model="newProduct.characterName" type="text" placeholder="VD: Hatsune Miku" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-slate-700">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Series / Anime / Game</label>
            <input v-model="newProduct.series" type="text" placeholder="VD: Vocaloid, Genshin Impact" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-slate-700">
          </div>

          <div class="md:col-span-2"> <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Mã vạch / Số Serial (Quét Scanner)</label>
            <input v-model="newProduct.barcode" type="text" placeholder="Nhập mã vạch in trên hộp sản phẩm..." class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white font-mono text-slate-700">
          </div>

          <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Thương hiệu</label>
        <select v-model="newProduct.brand" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-white cursor-pointer">
          <option value="">-- Chọn Hãng SX --</option>
          <option v-for="brand in Brands.filter(b => b.MaHSX !== 'all')" :key="brand.MaHSX" :value="brand.MaHSX">
            {{ brand.TenHSX }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Danh mục</label>
        <select v-model="newProduct.category" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-white cursor-pointer">
          <option value="">-- Chọn danh mục --</option>
          <option v-for="cat in filterCategories" :key="cat.MaDM" :value="cat.MaDM">
            {{ cat.TenDM }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Loại chi tiết</label>
        <select v-model="newProduct.detailCategory" :disabled="!newProduct.category" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-400">
          <option value="">-- Chọn loại chi tiết --</option>
          <option v-for="detail in modalDetailCategories" :key="detail.MaChiTietDM" :value="detail.MaChiTietDM">
            {{ detail.TenChiTietDM }}
          </option>
        </select>
      </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Chất liệu</label>
          <input v-model="newProduct.material" type="text" placeholder="VD: PVC, ABS" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Kích thước</label>
          <input v-model="newProduct.scale" type="text" placeholder="VD: 25cm, 1/7 Scale" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Loại hình bán</label>
          <select v-model="newProduct.saleType" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
            <option v-for="type in saleTypeOptions" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Trạng thái phát hành</label>
          <select v-model="newProduct.status" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
            <option v-for="st in statusOptions" :key="st" :value="st">
              {{ st }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Ngày phát hành</label>
          <input v-model="newProduct.releaseDate" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tiền cọc tối thiểu (VNĐ)</label>
          <input type="text" :value="formatCurrency(newProduct.minDeposit)" @input="handleCurrencyInput($event, newProduct, 'minDeposit')"  class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Giá nhập (VNĐ) (*)</label>
          <input 
            type="text" 
            :value="formatCurrency(newProduct.costPrice)" 
            @input="handleCurrencyInput($event, newProduct, 'costPrice')"
            class="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-emerald-600 bg-white"
          >
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Giá bán mặc định (VNĐ) (*)</label>
          <input 
            type="text" 
            :value="formatCurrency(newProduct.basePrice)" 
            @input="handleCurrencyInput($event, newProduct, 'basePrice')"
            class="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-sky-600 bg-white"
          >
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Số lượng kho mặc định (*)</label>
          <input v-model.number="newProduct.baseStock" type="number" placeholder="0" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#ff8f73] outline-none transition-all font-bold text-slate-700 bg-white">
        </div>
        <div class="md:col-span-2 border-t border-slate-100 my-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thông tin chi tiết (Mô tả)</label>
            <textarea v-model="newProduct.description" rows="4" placeholder="Nhập thông tin giới thiệu mô hình, chất liệu chi tiết, cốt truyện nhân vật..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none transition-all font-medium text-slate-700 bg-white resize-none"></textarea>
          </div>

          <div class="flex flex-col justify-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Hiển thị trên Web</label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative">
                <input type="checkbox" v-model="newProduct.isVisible" :true-value="1" :false-value="0" class="sr-only">
                <div class="block w-10 h-6 rounded-full transition-colors" :class="newProduct.isVisible === 1 ? 'bg-sky-500' : 'bg-slate-300'"></div>
                <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform" :class="newProduct.isVisible === 1 ? 'transform translate-x-4' : ''"></div>
              </div>
              <span class="text-sm font-bold" :class="newProduct.isVisible === 1 ? 'text-sky-600' : 'text-slate-500'">
                {{ newProduct.isVisible === 1 ? 'Đang bật hiển thị' : 'Đang ẩn' }}
              </span>
            </label>
          </div>
          
        </div>
      </div>

          <div class="md:col-span-2">
            <div class="flex items-center justify-between mb-4 mt-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Phân loại đặc biệt (Tùy chọn)</label>
              <button @click.prevent="addVariant" class="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all flex items-center gap-1 active:scale-95">
                <span class="material-symbols-outlined text-[16px]">add</span> Thêm phân loại
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="(variant, index) in newProduct.variants" :key="index" class="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative group animate-[fadeIn_0.3s_ease-out]">
                <button @click.prevent="removeVariant(index)" class="absolute -top-3 -right-3 w-8 h-8 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-md z-10">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tên phân loại</label>
                    <input v-model="variant.name" type="text" placeholder="VD: Bản Deluxe" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium text-slate-700 bg-white">
                  </div>
                  <!-- <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Giá nhập (VNĐ)</label>
                    <input v-model="variant.costPrice" type="number" placeholder="0" min="0" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium text-slate-700 bg-white">
                  </div> -->
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Giá bán (VNĐ)</label>
                    <input 
                      type="text" 
                      :value="formatCurrency(variant.sellPrice)" 
                      @input="handleCurrencyInput($event, variant, 'sellPrice')"
                      class="w-full border border-sky-200 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-600 bg-white"
                    >
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Số lượng kho</label>
                    <input v-model.number="variant.stock" type="number" min="0" placeholder="0" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-bold text-sky-600 bg-white">
                  </div>
                  <label class="absolute top-4 right-12 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="variant.isVisible" :true-value="1" :false-value="0" class="w-4 h-4 text-sky-500 border-slate-300 rounded focus:ring-sky-500">
                    <span class="text-[10px] font-bold text-slate-500 uppercase">Hiển thị</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="md:col-span-2 border-t border-slate-100 my-2"></div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ảnh đại diện sản phẩm (*)</label>
            
            <input type="file" ref="fileInputRef" class="hidden" accept="image/png, image/jpeg, image/webp" @change="handleFileUpload">
            
            <div 
              @click="triggerFileInput"
              class="border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group relative overflow-hidden"
              :class="newProduct.thumbnailUrl ? 'border-transparent p-0' : 'border-slate-300 hover:border-[#ff8f73] hover:bg-[#ff8f73]/5 bg-slate-50'"
            >
              <template v-if="!newProduct.thumbnailUrl">
                <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#ff8f73] group-hover:scale-110 transition-all mb-1">
                  <span class="material-symbols-outlined text-[24px]">add_photo_alternate</span>
                </div>
                <p class="text-sm font-bold text-slate-600 group-hover:text-[#ff8f73] transition-colors">Nhấp để tải ảnh lên</p>
                <p class="text-[10px] text-slate-400 font-medium">Hỗ trợ JPG, PNG. Tỷ lệ 1:1 (Vuông)</p>
              </template>
              
              <template v-else>
                <img :src="newProduct.thumbnailUrl" class="w-full h-full object-contain bg-white">
                <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button @click.stop="removeThumbnail" class="p-2.5 bg-white rounded-xl text-slate-700 hover:text-rose-500 shadow-xl transform hover:scale-110 transition-all">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </template>
            </div>
          </div>
          <div class="md:col-span-2 mt-4">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Bộ sưu tập ảnh chi tiết</span>
              <span class="text-[10px] text-slate-400 font-medium normal-case">Đã chọn: {{ newProduct.galleryUrls.length }} ảnh</span>
            </label>
            
            <input type="file" ref="galleryInputRef" class="hidden" accept="image/png, image/jpeg, image/webp" multiple @change="handleGalleryUpload">
            
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <button @click="triggerGalleryInput" class="w-full py-3 mb-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                Thêm ảnh vào bộ sưu tập
              </button>

              <div v-if="newProduct.galleryUrls.length > 0" class="grid grid-cols-4 sm:grid-cols-5 gap-3">
                <div v-for="(url, index) in newProduct.galleryUrls" :key="index" class="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-white">
                  <img :src="url" class="w-full h-full object-contain">
                  <div class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button @click.stop="removeGalleryImage(index)" class="w-8 h-8 bg-white rounded-lg text-slate-700 hover:text-rose-500 shadow-md flex items-center justify-center transform hover:scale-110 transition-all">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-4 text-slate-400 text-xs font-medium italic">
                Chưa có ảnh nào trong bộ sưu tập.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
        <button @click="isAddProductModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
        <button @click="submitNewProduct" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 rounded-xl transition-all">Lưu sản phẩm</button>
      </div>
    </div>
  </div>
  <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      
      <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div>
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-sky-500">edit_square</span> 
            Chỉnh sửa sản phẩm
          </h3>
          <p class="text-xs text-slate-500 font-medium mt-1">
            Đang hiệu chỉnh: <span class="text-[#ff8f73] font-bold">#{{ editingProduct.idCode }}</span> - {{ editingProduct.name }}
          </p>
        </div>
        <button @click="isEditModalOpen = false" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên mô hình (*)</label>
            <input v-model="editingProduct.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none transition-all font-medium text-slate-800">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tên nhân vật</label>
            <input v-model="editingProduct.characterName" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-medium bg-white text-slate-800">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Series / Anime / Game</label>
            <input v-model="editingProduct.series" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-medium bg-white text-slate-800">
          </div>

          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Mã vạch / Số Serial</label>
            <input v-model="editingProduct.barcode" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-mono bg-white text-slate-800">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4"> 
            <div>
              <label class="block text-[10px] font-bold text-slate-500 mb-1.5">Giá nhập (VNĐ)</label>
              <input 
                type="text" 
                :value="formatCurrency(editingProduct.costPrice)" 
                @input="handleCurrencyInput($event, editingProduct, 'costPrice')"
                class="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-emerald-600 bg-white"
              >
            </div>
            </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Thương hiệu</label>
            <select v-model="editingProduct.brand" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 outline-none transition-all font-medium bg-white">
              <option value="">-- Chọn Hãng SX --</option>
              <option v-for="brand in Brands.filter(b => b.MaHSX !== 'all')" :key="brand.MaHSX" :value="brand.MaHSX">{{ brand.TenHSX }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Danh mục</label>
            <select v-model="editingProduct.category" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 outline-none transition-all font-medium bg-white">
              <option value="">-- Chọn danh mục --</option>
              <option v-for="cat in filterCategories" :key="cat.MaDM" :value="cat.MaDM">{{ cat.TenDM }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Loại chi tiết</label>
            <select v-model="editingProduct.detailCategory" :disabled="!editingProduct.category" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 outline-none transition-all bg-white disabled:bg-slate-50">
              <option value="">-- Chọn loại chi tiết --</option>
              <option v-for="detail in modalDetailCategories" :key="detail.MaChiTietDM" :value="detail.MaChiTietDM">{{ detail.TenChiTietDM }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Chất liệu</label>
            <input v-model="editingProduct.material" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Kích thước</label>
            <input v-model="editingProduct.scale" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Loại hình bán</label>
            <select v-model="editingProduct.saleType" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
              <option v-for="type in saleTypeOptions" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Trạng thái phát hành</label>
            <select v-model="editingProduct.status" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
              <option v-for="st in statusOptions" :key="st" :value="st">{{ st }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Ngày phát hành</label>
            <input v-model="editingProduct.releaseDate" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tiền cọc tối thiểu (VNĐ)</label>
            <input 
              type="text" 
              :value="formatCurrency(editingProduct.minDeposit)" 
              @input="handleCurrencyInput($event, editingProduct, 'minDeposit')"
              class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none bg-white"
            >
          </div>

          <div class="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 md:col-span-2">
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-3 text-center">Thông tin phân loại mặc định</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1.5">Giá bán mặc định (VNĐ) (*)</label>
                <input 
                  type="text" 
                  :value="formatCurrency(editingProduct.basePrice)" 
                  @input="handleCurrencyInput($event, editingProduct  , 'basePrice')"
                  class="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-sky-600 bg-white"
                >
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1.5">Số lượng kho (*)</label>
                <input v-model.number="editingProduct.baseStock" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-sky-600 bg-white">
              </div>
            </div>
          </div>

          <div class="md:col-span-2 border-t border-slate-100 mt-2 pt-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thông tin chi tiết (Mô tả)</label>
                <textarea v-model="editingProduct.description" rows="4" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none bg-white resize-none"></textarea>
              </div>
              <div class="flex flex-col justify-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Hiển thị trên Web</label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="editingProduct.isVisible" :true-value="1" :false-value="0" class="sr-only">
                    <div class="block w-10 h-6 rounded-full transition-colors" :class="editingProduct.isVisible === 1 ? 'bg-sky-500' : 'bg-slate-300'"></div>
                    <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform" :class="editingProduct.isVisible === 1 ? 'transform translate-x-4' : ''"></div>
                  </div>
                  <span class="text-sm font-bold" :class="editingProduct.isVisible === 1 ? 'text-sky-600' : 'text-slate-500'">
                    {{ editingProduct.isVisible === 1 ? 'Đang bật' : 'Đang ẩn' }}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <div class="flex items-center justify-between mb-4 mt-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest">Phân loại đặc biệt</label>
              <button @click.prevent="editingProduct.variants.push({ name: '', sellPrice: 0, stock: 0, isVisible: 1 })" class="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all">
                + Thêm phân loại
              </button>
            </div>

            <div class="space-y-4">
              <div v-for="(variant, index) in editingProduct.variants" :key="index" class="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative group">
                <button @click.prevent="removeEditVariant(index, variant.id)" class="absolute -top-3 -right-3 w-8 h-8 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-all hover:bg-rose-500 hover:text-white">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1.5">Tên phân loại</label>
                    <input v-model="variant.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1.5">Giá bán (VNĐ)</label>
                    <input 
                      type="text" 
                      :value="formatCurrency(variant.sellPrice)" 
                      @input="handleCurrencyInput($event, variant, 'sellPrice')"
                      class="w-full border border-sky-200 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-600 bg-white"
                    >
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1.5">Số lượng kho</label>
                    <input v-model.number="variant.stock" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white">
                  </div>
                  <label class="absolute bottom-3 right-0 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="variant.isVisible" :true-value="1" :false-value="0" class="w-4 h-4 text-sky-500 border-slate-300 rounded focus:ring-sky-500">
                    <span class="text-[10px] font-bold text-slate-500 uppercase">Hiển thị</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 border-t border-slate-100 my-2"></div>

          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Ảnh đại diện (AnhDaiDien)</label>
            <div class="flex flex-col md:flex-row gap-6 items-start">
              <div class="flex flex-col gap-2">
                <p class="text-[9px] font-bold text-slate-400 uppercase">Ảnh hiện tại</p>
                <div class="w-32 h-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative group">
                  <img :src="editingProduct.thumbnailUrl" class="w-full h-full object-contain">
                  <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button class="p-1.5 bg-white rounded-lg text-slate-700"><span class="material-symbols-outlined text-[18px]">visibility</span></button>
                  </div>
                </div>
              </div>
              <div class="flex-1 w-full">
                <p class="text-[9px] font-bold text-slate-400 uppercase mb-2">Tải ảnh mới (Nếu muốn thay đổi)</p>
                <input type="file" ref="editFileInputRef" class="hidden" accept="image/*" @change="handleEditFileUpload">
                <div @click="triggerEditFileInput" class="border-2 border-dashed border-slate-200 rounded-xl h-32 flex flex-col items-center justify-center gap-1 hover:border-sky-400 hover:bg-sky-50 transition-all cursor-pointer group">
                  <span class="material-symbols-outlined text-slate-300 group-hover:text-sky-500 transition-colors">cloud_upload</span>
                  <span class="text-xs font-bold text-slate-500 group-hover:text-sky-500">Nhấp để thay thế ảnh đại diện</span>
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Bộ sưu tập ảnh chi tiết</span>
              <span class="text-[10px] text-slate-400 font-medium normal-case">Tổng: {{ editingProduct.galleryUrls?.length || 0 }} ảnh</span>
            </label>
            <input type="file" ref="editGalleryInputRef" class="hidden" accept="image/*" multiple @change="handleEditGalleryUpload">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <button @click="triggerEditGalleryInput" class="w-full py-3 mb-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm hover:border-sky-400 hover:text-sky-500 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[20px]">add_photo_alternate</span> Thêm ảnh mới vào bộ sưu tập
              </button>
              <div v-if="editingProduct.galleryUrls?.length > 0" class="grid grid-cols-4 sm:grid-cols-5 gap-3">
                <div v-for="(url, index) in editingProduct.galleryUrls" :key="index" class="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-white shadow-sm">
                  <img :src="url" class="w-full h-full object-contain">
                  <div class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button @click.stop="removeEditGalleryImage(index)" class="w-8 h-8 bg-white rounded-lg text-slate-700 hover:text-rose-500 shadow-md flex items-center justify-center transition-all">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
        <button @click="isEditModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">
          Hủy bỏ
        </button>
        <button @click="saveProductChanges" class="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-black shadow-lg shadow-slate-900/20 rounded-xl transition-all flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">save</span> 
          Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, onMounted, watch} from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
  
  const route = useRoute();
  const router = useRouter();
  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  const fileInputRef = ref(null);
  const galleryInputRef = ref(null);
  const isFilterPanelOpen = ref(false);
  
  const isSidebarCollapsed = ref(false);
  const isMobileMenuOpen = ref(false);

  const products = ref([]);
  const isLoading = ref(true);
  //Số trang
  const currentPage = ref(1);
  let limit = 10;
  const totalPages = ref(1);
  
  
  const totalProducts = ref(0);
  
  const Brands = ref([{ MaHSX: 'all', TenHSX: 'Tất cả' }]);
  const activeFilter = ref('all');
  const searchQuery = ref('');

    // Các biến cho Bộ lọc nâng cao
  const stockFilter = ref('all'); // Tình trạng tồn kho
  const saleTypeFilter = ref('all');
  const selectedCat = ref(''); // Danh mục
  const selectedDetailCat= ref('');
  const minprice = ref(null); // Giá từ
  const maxprice = ref(null); // Giá đến
  const sortBy = ref('newest'); // Sắp xếp mặc định
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token'); // Lấy thẻ
      const response = await fetch(`${API_BASE_URL}/api/product_admin/get_brand`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        Brands.value = [{ MaHSX: 'all', TenHSX: 'Tất cả' }, ...result.data];
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách hãng:", error);
    }
  };

  const filterCategories = ref([]);       
  const detailCategories = ref([]);   
// Các tùy chọn cố định cho Form
  const saleTypeOptions = ['Có sẵn', 'Order', 'Pre-order'];
  const statusOptions = ['Đã phát hành', 'Chưa phát hành'];
  const summary = ref({
    TongSanPham: 0,
    SapHetHang: 0,
    HetHang: 0,
    DangCoSan: 0
  });

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const strVal = String(value).replace(/\D/g, ''); // Bóc tách chỉ lấy số
    if (!strVal) return '';
    return parseInt(strVal, 10).toLocaleString('vi-VN'); 
  };

  // 2. Hàm chuyển ngược về số để lưu Data: "2.000.000" -> 2000000
  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseInt(String(value).replace(/\D/g, ''), 10) || 0;
  };

  // 3. HÀM CHỐNG LỖI NHẢY SỐ (MỚI)
  const handleCurrencyInput = (event, obj, field) => {
    // Lấy số nguyên gốc từ phím người dùng vừa gõ
    const rawValue = parseCurrency(event.target.value);
    
    // Gắn giá trị gốc vào biến của Vue để gửi xuống Backend
    obj[field] = rawValue;
    
    // Ép ô input hiển thị ngay lập tức chuỗi đã có dấu chấm
    event.target.value = formatCurrency(rawValue);
  };
  
  // 1. Hàm lấy danh sách Danh mục lớn
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token'); // Lấy thẻ
      const response = await fetch(`${API_BASE_URL}/api/product_admin/getvariant`,
        {
          headers: {'Authorization': `Bearer ${token}`}
        }
      );
      const result = await response.json();
      if (result.success) filterCategories.value = result.data;
    } catch (error) { console.error("Lỗi lấy danh mục:", error); }
  };

  // 2. Hàm lấy danh sách Danh mục con khi chọn danh mục lớn
  // Giả sử API của bạn nhận MaDM để trả về các danh mục con tương ứng
  const fetchDetailCategories = async (MaDM) => {
    if (!MaDM) {
      detailCategories.value = [];
      return;
    }
    try {
      const token = localStorage.getItem('token'); // Lấy thẻ
      const response = await fetch(`${API_BASE_URL}/api/product_admin/getdetailvariant/${MaDM}`,
        {
          headers: {'Authorization': `Bearer ${token}`}
        }
      );
      const result = await response.json();
      if (result.success) detailCategories.value = result.data;
    } catch (error) { console.error("Lỗi lấy danh mục con:", error); }
  };

  // 3. Theo dõi khi người dùng đổi danh mục lớn thì tự động tải lại danh mục con
  watch(selectedCat, (newVal) => {
    selectedDetailCat.value = ''; // Reset danh mục con
    fetchDetailCategories(newVal);
  });

  let searchTimeout = null;
  watch(searchQuery, () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchProducts();
    }, 500);
  });

  //Liệt kê thông tin sản phẩm
  const fetchProducts = async () => {
    isLoading.value = true;
    try {
      const token = localStorage.getItem('token'); // Lấy thẻ
      let url = `${API_BASE_URL}/api/product_admin?page=${currentPage.value}&limit=${limit}`;
      if (searchQuery.value.trim() !== '') {
        url += `&keyword=${encodeURIComponent(searchQuery.value.trim())}`;
      }
      if (activeFilter.value !== 'all') url += `&hsx=${activeFilter.value}`;
      if (stockFilter.value !== 'all') url += `&TinhTrangTonKho=${stockFilter.value}`;
      if (saleTypeFilter.value !== 'all') url += `&LoaiHinhBan=${saleTypeFilter.value}`;
      if (selectedCat.value) url += `&danhmuc=${selectedCat.value}`;
      if (selectedDetailCat.value) url += `&chitietdanhmuc=${selectedDetailCat.value}`;
      if (minprice.value) url += `&minprice=${minprice.value}`;
      if (maxprice.value) url += `&maxprice=${maxprice.value}`;
      if (sortBy.value) url += `&sapxep=${sortBy.value}`;

      const response = await fetch(url, {headers: {'Authorization': `Bearer ${token}`}});
      const result = await response.json();

      if (result.success) {
        // Mapping dữ liệu từ Database vào UI
        // LƯU Ý: Bạn hãy sửa các tên cột (TenMH, TenThuongHieu...) cho khớp đúng với SQL của bạn nhé!
        products.value = result.data.map(item => {
          return {
            id: item.MaMoHinh, 
            name: item.TenMH,
            anh: item.AnhDaiDien,
            brand: item.TenHSX || 'Chưa cập nhật',
            brandId: item.MaHSX,
            selltype: item.LoaiHinhBan,
            mota: item.ThongTinChiTiet,
            status: item.TrangThai,
            categoryId: item.MaDM,
            detailCategoryId: item.MaChiTietDM,
            variant: item.TenPhanLoai || 'Mặc định',
            scale: item.KichThuoc || 'Trống',
            material: item.ChatLieu || 'Trống',
            characterName: item.TenNhanVat || '',
            series: item.Series || '',
            //Thông tin raw
            rawMinDeposit: parseInt(item.TienCocToiThieu) || 0,
            rawSellPrice: parseInt(item.DonGia) || 0,
            // (Ngày tháng có đuôi T17:00:00Z nên phải dùng split để lấy đúng định dạng yyyy-mm-dd)
            releaseDate: item.NgayPhatHanh ? item.NgayPhatHanh.split('T')[0] : '',
            // Format tiền tệ cho đẹp
            minDeposit: Number(item.TienCocToiThieu || 0).toLocaleString('vi-VN'),
            basePrice: Number(item.GiaNhap || 0).toLocaleString('vi-VN'),
            sellPrice: Number(item.DonGia || 0).toLocaleString('vi-VN'),
            stock: item.SoLuong || 0,
            isVisible: item.HienThi,
            defaultVariantId: item.defaultVariantId, 
            variants: (item.DS_PhanLoai || []).map(v => ({
              id: v.id,
              name: v.name,
              sellPrice: Number(v.sellPrice || 0).toLocaleString('vi-VN'), // Thêm dòng này là hết lỗi!
              stock: v.stock
            })),
            thumbnailUrl: (item.AnhDaiDien && item.AnhDaiDien.startsWith('http')) 
              ? item.AnhDaiDien 
              : `${API_BASE_URL}/Images_product/${item.AnhDaiDien}`
          };
        });
        totalProducts.value = result.pagination?.totalItems || result.data.length; 
        totalPages.value = result.pagination.totalPage;
        currentPage.value = result.pagination?.currentPage;
        summary.value = result.summary || { TongSanPham: 0, SapHetHang: 0, HetHang: 0, DangCoSan: 0 };
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      toastStore.showToast("Không thể kết nối đến máy chủ!", "error");
    } finally {
      isLoading.value = false;
    }
  };

  watch(activeFilter, () => {
    currentPage.value = 1;
    fetchProducts();
  });
  
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) isMobileMenuOpen.value = !isMobileMenuOpen.value;
    else isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };
  const closeAllMenus = () => {};
  
  
  const getBrandColor = (brand) => {
    switch (brand.toLowerCase()) {
      case 'bandai': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'hot toys': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'gsc': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  // MODAL THÊM SẢN PHẨM MỚI
  const isAddProductModalOpen = ref(false);

  const newProduct = ref({
      name: '', brand: '', category: '', detailCategory: '',
      material: '', scale: '',
      characterName: '', // THÊM MỚI: Tên nhân vật
      series: '',        // THÊM MỚI: Series/Anime
      barcode: '',       // THÊM MỚI: Mã vạch
      status: 'Chưa phát hành',
      selltype: 'Có sẵn',
      releaseDate: null,
      description: '',
      isVisible: 0,
      minDeposit: 0, costPrice: 0, basePrice: 0, baseStock: 0,
      thumbnailUrl: '', thumbnailFile: null, galleryUrls: [], galleryFiles: [],
      // Mảng chứa các phân loại
      variants: []
  });

  // 2. HÀM THÊM PHÂN LOẠI
  const addVariant = () => {
    newProduct.value.variants.push({ name: '', costPrice: '', sellPrice: '', stock: 0 });
  };

  // 3. HÀM XÓA PHÂN LOẠI
  const removeVariant = (index) => {
      newProduct.value.variants.splice(index, 1);
  };

  const triggerFileInput = () => {
    if(!newProduct.value.thumbnailUrl && fileInputRef.value) fileInputRef.value.click();
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if(file){
      newProduct.value.thumbnailFile = file;
      newProduct.value.thumbnailUrl = URL.createObjectURL(file);
    }
  }

  const removeThumbnail = () => {
    newProduct.value.thumbnailFile = null;
    newProduct.value.thumbnailUrl = '';
    if(fileInputRef.value) fileInputRef.value.value = '';
  }

  const triggerGalleryInput = () => {
    if (galleryInputRef.value) galleryInputRef.value.click();
  };

  const handleGalleryUpload = (event) => {
    const files = Array.from(event.target.files); 
    if (files.length === 0) return;
    files.forEach(file => {
      newProduct.value.galleryFiles.push(file);
      newProduct.value.galleryUrls.push(URL.createObjectURL(file));
    });
    if (galleryInputRef.value) galleryInputRef.value.value = '';
  };

  const removeGalleryImage = (index) => {
    newProduct.value.galleryFiles.splice(index, 1);
    newProduct.value.galleryUrls.splice(index, 1);
  };
  
  const modalDetailCategories = ref([]);

  // Lắng nghe: Khi người dùng chọn/đổi Danh mục chính trong Modal
  watch(() => newProduct.value.category, async (newMaDM) => {
    // 1. Reset lại danh mục con đang chọn
    newProduct.value.detailCategory = ''; 
    
    // 2. Nếu không có danh mục chính, làm rỗng mảng con
    if (!newMaDM) {
      modalDetailCategories.value = [];
      return;
    }
    
    // 3. Gọi API lấy danh mục con dựa vào MaDM (Dùng chuẩn Params /:MaDM đã sửa trước đó)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/product_admin/getdetailvariant/${newMaDM}`,{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` 
          },
      });
      const result = await response.json();
      if (result.success) {
        modalDetailCategories.value = result.data;
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục con cho modal:", error);
    }
  });


  const openAddModal = () => {
    newProduct.value = {
      name: '', brand: '', category: '', variant: '', material: '', scale: '',
      characterName: '', series: '', barcode: '',
      minDeposit: 0, costPrice: 0, sellPrice: 0, stock: 0, isVisible: 0,
      description: '', 
      thumbnailUrl: '', thumbnailFile: null, galleryUrls: [], galleryFiles: [],
      variants: [
        { name: '', scale: '', costPrice: null, sellPrice: null, stock: 0 }
      ]
    };
    isAddProductModalOpen.value = true;
  };

  // --- KẾT NỐI API: THÊM SẢN PHẨM MỚI ---
  const submitNewProduct = async () => {
      if (!newProduct.value.name.trim()) {
        toastStore.showToast("Vui lòng nhập Tên mô hình!", "error");
        return;
      }

      // Kiểm tra xem phân loại đầu tiên có bị bỏ trống tên không
      // if (newProduct.value.variants.length === 0 || !newProduct.value.variants[0].name.trim()) {
      //   toastStore.showToast("Vui lòng nhập Tên cho ít nhất 1 phân loại!", "error");
      //   return;
      // }

      const formData = new FormData();
      formData.append('TenMH', newProduct.value.name);
      formData.append('MaHSX', newProduct.value.brand);
      formData.append('MaDM', newProduct.value.category);
      formData.append('MaChiTietDM', newProduct.value.detailCategory);
      formData.append('KichThuoc', newProduct.value.scale);
      formData.append('ChatLieu', newProduct.value.material);
      formData.append('TenNhanVat', newProduct.value.characterName);
      formData.append('Series', newProduct.value.series);
      formData.append('MaVach_Serial', newProduct.value.barcode);
      formData.append('NgayPhatHanh', newProduct.value.releaseDate);
      formData.append('LoaiHinhBan', newProduct.value.saleType);
      formData.append('TrangThai', newProduct.value.status);
      formData.append('ThongTinChiTiet', newProduct.value.description);
      formData.append('HienThi', newProduct.value.isVisible);

      formData.append('GiaNhap', newProduct.value.costPrice);
      formData.append('TienCocToiThieu', newProduct.value.minDeposit);
      formData.append('DonGia', newProduct.value.basePrice);
      formData.append('SoLuong', newProduct.value.baseStock);
      
      // 👉 Ép kiểu mảng phân loại thành chuỗi JSON để gửi qua HTTP
      formData.append('DanhSachPhanLoai', JSON.stringify(newProduct.value.variants));

      //Xử lý ảnh
      if(newProduct.value.thumbnailFile) {
        formData.append('AnhDaiDien', newProduct.value.thumbnailFile);
      }
      
      if (newProduct.value.galleryFiles.length > 0) {
        newProduct.value.galleryFiles.forEach((file) => {
          formData.append('BoSuuTapAnh', file);
        });
      }

      // 3. Gửi xuống Backend
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/product_admin/add_product`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}` 
          },
          body: formData // Fetch tự động set header multipart/form-data
        });
        
        const result = await response.json();

        if (result.success) {
          toastStore.showToast("Đã thêm sản phẩm thành công!", "success");
          isAddProductModalOpen.value = false
          fetchProducts(); // Tải lại bảng ngay lập tức để thấy sản phẩm mới
        } else {
          toastStore.showToast(result.message || "Lỗi khi thêm sản phẩm", "error");
        }
      } catch (error) {
        console.error("Lỗi thêm sản phẩm:", error);
        toastStore.showToast("Lỗi máy chủ!", "error");
      }
  };

  //  MODAL CHỈNH SỬA SẢN PHẨM (EDIT)
  const isEditModalOpen = ref(false);
  const editingProduct = ref({
    id: null, name: '', brand: '', category: '', detailCategory: '', material: '', dimensions: '', description: '',
    saleType: '', status: '', isVisible: 1, basePrice: 0, minDeposit: 0, baseStock: 0,
    variants: [], thumbnailUrl: '', thumbnailFile: null,
    deletedVariantIds: []
  });
  const editFileInputRef = ref(null);
  const editGalleryInputRef = ref(null); 

  const openEditModal = async (product) => {
    
    if (!product.id) {
      toastStore.showToast("Lỗi: Không tìm thấy ID sản phẩm!", "error");
      return;
    }

    // Gán thông tin cơ bản
    editingProduct.value = {
      id: product.id,
      idCode: product.id,
      name: product.name,
      characterName: '', 
      series: '',
      barcode: '',
      costPrice: 0,
      brand: product.brandId,
      scale: product.scale,
      basePrice: product.basePrice,
      category: product.categoryId,
      detailCategory: product.detailCategoryId,
      description: product.mota || '',
      material: product.material || '',
      dimensions: product.scale || '',
      saleType: product.selltype || 'Có sẵn',
      status: product.status || 'Sẵn hàng',
      isVisible: Number(product.isVisible),
      thumbnailUrl: product.thumbnailUrl,
      basePrice: product.basePrice || 0,
      minDeposit: product.rawMinDeposit || 0,
      baseStock: product.stock || 0,
      releaseDate: product.releaseDate || '', // Đã thêm ngày tháng
      variants: [],
      galleryUrls: [],
      galleryFiles: [],
      deletedVariantIds: []
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/product_admin/watch/${product.id}`,
        {
          method: 'GET',
          headers: {'Authorization': `Bearer ${token}`}
        }
      );
      const result = await response.json();

      // 🚦 TRẠM 3: Kiểm tra dữ liệu Backend trả về có Phân loại và Ảnh phụ không
      console.log("👉 3. Dữ liệu Chi tiết Backend trả về:", result);

      if (result.success) {
        editingProduct.value.characterName = result.data.TenNhanVat || '';
        editingProduct.value.series = result.data.Series || '';
        editingProduct.value.barcode = result.data.MaVach_Serial || '';
        editingProduct.value.costPrice = parseInt(result.data.GiaNhap, 10) || 0;
        const DanhSachPhanLoai = result.data.DS_PL;
        if (DanhSachPhanLoai && DanhSachPhanLoai.length > 0) {
          DanhSachPhanLoai.forEach(v => {
            if (v.ChiTietPhanLoai === 'Mặc định') {
              editingProduct.value.basePrice = parseInt(v.DonGia, 10) || 0;
              editingProduct.value.baseStock = v.SoLuong;
            } else {
              editingProduct.value.variants.push({
                id: v.MaPhanLoai, 
                name: v.ChiTietPhanLoai,
                sellPrice: parseInt(v.DonGia, 10) || 0, 
                stock: v.SoLuong,
                isVisible: v.HienThi
              });
            }
          });
        }

        // Xử lý Ảnh phụ
        if (result.data.galleryUrls && result.data.galleryUrls.length > 0) {
          editingProduct.value.galleryUrls = result.data.galleryUrls.map(img => 
             img.includes('http') ? img : `${API_BASE_URL}/Images_product/${img}`
          );
        }
      }
    } catch (error) {
      console.error("❌ Lỗi lấy thông tin chi tiết:", error);
    }

    isEditModalOpen.value = true;
  };

  const addEditVariant = () => {
    editingProduct.value.variants.push({ name: '', sellPrice: 0, stock: 0 });
  };

  const removeEditVariant = (index, variantId) => {
    if (confirm("Bạn có chắc muốn dọn dẹp phân loại này khỏi hệ thống?")) {
      // Nếu là phân loại cũ đã có trong DB (có mang theo variant.id)
      if (variantId) {
        // Đẩy ID này vào mảng chờ xóa
        editingProduct.value.deletedVariantIds.push(variantId);
      }
      // Xóa khỏi giao diện hiện tại
      editingProduct.value.variants.splice(index, 1);
    }
  };

  watch(() => editingProduct.value.category, async (newMaDM) => {
    if (!newMaDM) {
      modalDetailCategories.value = [];
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/product_admin/getdetailvariant/${newMaDM}`,{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` 
          },
      });
      const result = await response.json();
      if (result.success) {
        modalDetailCategories.value = result.data;
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục con cho form Edit:", error);
    }
  });

  // --- XỬ LÝ ẢNH ĐẠI DIỆN ---
  const triggerEditFileInput = () => { if (editFileInputRef.value) editFileInputRef.value.click(); };
  const handleEditFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      editingProduct.value.thumbnailFile = file;
      editingProduct.value.thumbnailUrl = URL.createObjectURL(file);
    }
  };

  // --- XỬ LÝ BỘ SƯU TẬP ẢNH (GALLERY) ---
  const triggerEditGalleryInput = () => {
    if (editGalleryInputRef.value) editGalleryInputRef.value.click();
  };

  const handleEditGalleryUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      editingProduct.value.galleryFiles.push(file);
      editingProduct.value.galleryUrls.push(URL.createObjectURL(file));
    });

    if (editGalleryInputRef.value) editGalleryInputRef.value.value = '';
  };

  const removeEditGalleryImage = (index) => {
    const removedUrl = editingProduct.value.galleryUrls[index];
    
    // 1. Xóa khỏi mảng hiển thị UI
    editingProduct.value.galleryUrls.splice(index, 1);
    
    // 2. Nếu là ảnh cũ từ Database (link có chữ localhost)
    if (removedUrl.includes('localhost:3000')) {
      const filename = removedUrl.split('/').pop(); // Lấy tên file gốc
      if(!editingProduct.value.deletedOldImages) editingProduct.value.deletedOldImages = [];
      // Đưa tên file vào danh sách "Sổ đen" chuẩn bị gửi xuống Backend
      editingProduct.value.deletedOldImages.push(filename);
    } 
    // 3. Nếu là ảnh mới vừa chọn từ máy tính (link có chữ blob:)
    else if (removedUrl.startsWith('blob:')) {
      // Tìm lại vị trí thực sự của file mới này trong mảng galleryFiles và xóa đi
      const soLuongAnhCu = editingProduct.value.galleryUrls.filter(u => u.includes('localhost:3000')).length;
      const fileIndex = index - soLuongAnhCu;
      if(fileIndex >= 0) editingProduct.value.galleryFiles.splice(fileIndex, 1);
    }
  };

  // --- LƯU THAY ĐỔI ---
  const saveProductChanges = async () => {
    if (!editingProduct.value.name.trim()) {
        toastStore.showToast("Tên sản phẩm không được để trống!", "error");
        return;
    }

    const formData = new FormData();
    formData.append('TenMH', editingProduct.value.name);
    formData.append('TenNhanVat', editingProduct.value.characterName);
    formData.append('Series', editingProduct.value.series);
    formData.append('MaVach_Serial', editingProduct.value.barcode);
    formData.append('GiaNhap', editingProduct.value.costPrice);
    formData.append('MaHSX', editingProduct.value.brand || '');
    formData.append('MaDM', editingProduct.value.category || '');
    formData.append('MaChiTietDM', editingProduct.value.detailCategory || '');
    formData.append('ChatLieu', editingProduct.value.material || '');
    formData.append('KichThuoc', editingProduct.value.scale || '');
    formData.append('LoaiHinhBan', editingProduct.value.saleType);
    formData.append('TrangThai', editingProduct.value.status);
    formData.append('NgayPhatHanh', editingProduct.value.releaseDate || '');
    formData.append('TienCocToiThieu', editingProduct.value.minDeposit || 0);
    formData.append('ThongTinChiTiet', editingProduct.value.description || '');
    formData.append('HienThi', editingProduct.value.isVisible);
    
    // Đơn giá và Số lượng của bản mặc định
    formData.append('DonGia', editingProduct.value.basePrice);
    formData.append('SoLuong', editingProduct.value.baseStock);
    
    // Mảng phân loại đặc biệt
    formData.append('DanhSachPhanLoai', JSON.stringify(editingProduct.value.variants));


    if (editingProduct.value.deletedVariantIds && editingProduct.value.deletedVariantIds.length > 0) {
      formData.append('PhanLoaiCanXoa', JSON.stringify(editingProduct.value.deletedVariantIds));
    }

    // Ảnh đại diện
    if (editingProduct.value.thumbnailFile) {
        formData.append('AnhDaiDien', editingProduct.value.thumbnailFile);
    }
    
    // Bộ sưu tập ảnh mới
    if (editingProduct.value.galleryFiles && editingProduct.value.galleryFiles.length > 0) {
      editingProduct.value.galleryFiles.forEach(file => {
        formData.append('BoSuuTapAnhMoi', file);
      });
    }

    if (editingProduct.value.deletedOldImages && editingProduct.value.deletedOldImages.length > 0) {
        formData.append('AnhCuCanXoa', JSON.stringify(editingProduct.value.deletedOldImages));
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/product_admin/fix_info/${editingProduct.value.id}`, {
        method: 'PUT',
        headers: {'Authorization': `Bearer ${token}`},
        body: formData
      });
      
      const result = await response.json();

      if (result.success || response.ok) {
        isEditModalOpen.value = false;
        toastStore.showToast("Đã cập nhật thay đổi thành công!", "success");
        fetchProducts(); // Tải lại danh sách
      } else {
        toastStore.showToast(result.message || "Lỗi cập nhật", "error");
      }
    } catch (error) {
      console.error("Lỗi khi lưu chỉnh sửa:", error);
      toastStore.showToast("Lỗi máy chủ!", "error");
    }
  };

  // --- HÀM ẨN/HIỆN NHANH SẢN PHẨM ---
  // --- HÀM ẨN/HIỆN SẢN PHẨM NHANH ---
  const toggleVisibility = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const token = localStorage.getItem('token');

      // Gửi API cập nhật trạng thái
      const response = await fetch(`${API_BASE_URL}/api/product_admin/toggle_visibility/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ HienThi: newStatus })
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        // Cập nhật giao diện thành công
        const productIndex = products.value.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          products.value[productIndex].isVisible = newStatus;
        }
        toastStore.showToast(newStatus === 1 ? "Đã hiển thị sản phẩm!" : "Đã ẩn sản phẩm khỏi cửa hàng!", "success");
      } else {
        toastStore.showToast(result.message || "Lỗi khi đổi trạng thái!", "error");
      }
    } catch (error) {
      console.error("Lỗi toggle visibility:", error);
      toastStore.showToast("Không thể kết nối máy chủ!", "error");
    }
  };

  const applyAdvancedFilters = () => {
    currentPage.value = 1;
    fetchProducts();
    isFilterPanelOpen.value = false; // Đóng ngăn kéo sau khi lọc
  };

  // Hàm Đặt lại toàn bộ (Reset)
  const resetFilters = () => {
    stockFilter.value = 'all';
    saleTypeFilter.value = 'all';
    selectedCat.value = '';
    selectedDetailCat.value = '';
    minprice.value = null;
    maxprice.value = null;
    sortBy.value = 'newest';
    activeFilter.value = 'all'; // Đặt lại cả bộ lọc Hãng SX bên ngoài
    
    currentPage.value = 1;
    fetchProducts();
  };

  // --- HÀM XUẤT EXCEL KHO HÀNG ---
  const isExporting = ref(false);

  const exportExcelReport = async () => {
    isExporting.value = true;
    try {
      const token = localStorage.getItem('token');
      
      // Chú ý: Đảm bảo đường dẫn này khớp với route Backend của bạn
      const url = `${API_BASE_URL}/api/product_admin/export-excel`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải file từ Server");
      }

      // Xử lý tải file Blob
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Bao_Cao_Kho_Hang_FigureCollect_${new Date().toISOString().slice(0,10)}.xlsx`;
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

  const expandedRows = ref([]); // Mảng chứa ID các sản phẩm đang được xổ xuống

  const toggleRow = (productId) => {
    if (expandedRows.value.includes(productId)) {
      expandedRows.value = expandedRows.value.filter(id => id !== productId);
    } else {
      expandedRows.value.push(productId);
    }
  };

  // --- HÀM GỌI API LƯU NHANH KHI NHẤN ENTER ---
  const quickUpdateVariant = async (variantId, newPrice, newStock) => {
    if (!variantId) {
        toastStore.showToast("Lỗi: Không xác định được mã phân loại!", "error");
        return;
    }
    
    try {
      // 1. Loại bỏ các dấu chấm, phẩy (nếu có) trong chuỗi giá tiền (VD: "6.700.000" -> 6700000)
      const numericPrice = Number(String(newPrice).replace(/\D/g, ''));
      const token = localStorage.getItem('token');

      // 2. Bắn dữ liệu xuống API
      const response = await fetch(`${API_BASE_URL}/api/product_admin/quick_update/${variantId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ DonGia: numericPrice, SoLuong: newStock })
      });

      const result = await response.json();

      if (response.ok && result.success) {
          toastStore.showToast("Đã lưu nhanh Giá & Tồn kho!", "success");
      } else {
          toastStore.showToast(result.message || "Lỗi khi lưu nhanh!", "error");
      }
    } catch (error) {
      console.error("Lỗi quick update:", error);
      toastStore.showToast("Không thể kết nối máy chủ!", "error");
    }
  };

  const quickUpdateSellType = async (productId, newSellType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/product_admin/quick_update_selltype/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ LoaiHinhBan: newSellType })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toastStore.showToast("Đã cập nhật loại hình bán!", "success");
      } else {
        toastStore.showToast(result.message || "Lỗi khi cập nhật!", "error");
      }
    } catch (error) {
      console.error("Lỗi quickUpdateSellType:", error);
      toastStore.showToast("Không thể kết nối máy chủ!", "error");
    }
  };

  const quickUpdateDeposit = async (productId, rawDeposit) => {
    try {
      // Ép kiểu: Lọc bỏ hết dấu chấm, chữ cái, chỉ lấy số (VD: "500.000" -> 500000)
      const numericDeposit = Number(String(rawDeposit).replace(/\D/g, ''));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/product_admin/quick_update_deposit/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ TienCocToiThieu: numericDeposit })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toastStore.showToast("Đã lưu nhanh mức giá cọc!", "success");
      } else {
        toastStore.showToast(result.message || "Lỗi khi lưu giá cọc!", "error");
      }
    } catch (error) {
      console.error("Lỗi quickUpdateDeposit:", error);
      toastStore.showToast("Không thể kết nối máy chủ!", "error");
    }
  };

  const checkAndOpenInventoryFromUrl = async () => {
    if (route.query.productId) {
      const pId = parseInt(route.query.productId);
      const targetProduct = products.value.find(p => p.id === pId);
      
      if (targetProduct) {
        openEditModal(targetProduct);
      } 
      else {
        openEditModal({ id: pId });
      }
    }
  };

  watch(isEditModalOpen, (isOpen) => {
    if (!isOpen && route.query.productId) {
      const query = { ...route.query };
      delete query.productId;
      router.replace({ query });
    }
  });

  onMounted(async () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    fetchBrands();
    fetchCategories();
    await fetchProducts();
    checkAndOpenInventoryFromUrl(); 
  });
</script>
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>