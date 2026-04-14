<template>
    <div @click="closeAllMenus" class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800 relative">
      
      <div 
        v-show="isMobileMenuOpen || isFilterPanelOpen" 
        @click="isMobileMenuOpen = false; isFilterPanelOpen = false" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
      ></div>
  
      <AdminSideBar :is-collapsed="isSidebarCollapsed" :is-mobile-open="isMobileMenuOpen" />
  
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
                            <input type="radio" name="stock" value="all" checked class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                            <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Tất cả</span>
                        </label>
                        <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-[#ff8f73] has-[:checked]:bg-[#ff8f73]/5">
                            <input type="radio" name="stock" value="preorder" class="w-4 h-4 text-[#ff8f73] border-slate-300 focus:ring-[#ff8f73]">
                            <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Hàng Pre-order</span>
                        </label>
                        <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50">
                            <input type="radio" name="stock" value="low" class="w-4 h-4 text-rose-500 border-slate-300 focus:ring-rose-500">
                            <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Sắp hết (&lt; 5)</span>
                        </label>
                        <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group has-[:checked]:border-slate-400 has-[:checked]:bg-slate-100">
                            <input type="radio" name="stock" value="out" class="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-600">
                            <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">Hết hàng</span>
                        </label>
                    </div>
                </div>

                <hr class="border-slate-100">

                <div class="space-y-4">
                    <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">category</span> Danh mục Mô hình
                    </label>
                    <div class="flex flex-col gap-3">
                        <label v-for="cat in filterCategories" :key="cat.id" class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" :value="cat.id" v-model="selectedCategories" class="w-4 h-4 text-[#ff8f73] border-slate-300 rounded focus:ring-[#ff8f73] transition-all">
                            <span class="text-sm font-medium text-slate-700 group-hover:text-[#ff8f73] transition-colors">{{ cat.name }}</span>
                        </label>
                    </div>
                </div>

                <hr class="border-slate-100">
                <div class="space-y-4">
                    <label class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">tune</span> Thông số kỹ thuật
                    </label>
                
                    <div class="grid grid-cols-2 gap-3">
                        <select class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/50 focus:border-[#ff8f73] transition-all cursor-pointer">
                            <option>Scale (Tất cả)</option>
                            <option>1/6 Scale</option>
                            <option>1/7 Scale</option>
                            <option>Non-scale</option>
                        </select>
                        <select class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/50 focus:border-[#ff8f73] transition-all cursor-pointer">
                            <option>Chất liệu (Tất cả)</option>
                            <option>PVC / ABS</option>
                            <option>Resin / Polystone</option>
                            <option>Die-cast (Kim loại)</option>
                        </select>
                    </div>

                    <div class="flex items-center gap-2 pt-2">
                        <input type="number" placeholder="Giá từ..." class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/50 focus:border-[#ff8f73] transition-all placeholder:text-slate-400 placeholder:font-normal">
                        <span class="text-slate-300">-</span>
                        <input type="number" placeholder="Đến..." class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ff8f73]/50 focus:border-[#ff8f73] transition-all placeholder:text-slate-400 placeholder:font-normal">
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
                        <option value="stock_asc">Tồn kho: Ít nhất</option>
                    </select>
                </div>
            </div>
        </div>
  
        <div class="p-6 border-t border-slate-100 flex gap-3 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button class="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">Đặt lại</button>
            <button class="flex-[2] py-3 px-4 rounded-xl font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 transition-all text-sm">Áp dụng</button>
        </div>
      </div>
  
      <div class="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
        <AdminHeader @toggle-sidebar="handleToggleSidebar" />
        
        <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-24">
          
          <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
            <div>
              <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Quản lý kho hàng</h1>
              <p class="text-slate-500 text-sm font-medium">Theo dõi và cập nhật số lượng mô hình sưu tầm trong hệ thống.</p>
            </div>
            
            <div class="flex gap-3 w-full xl:w-auto">
              <button class="flex-1 xl:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                Nhập kho
              </button>
              <button @click="openAddModal" class="flex-1 xl:flex-none bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ff8f73]/20 transition-all active:scale-95 text-sm">
                <span class="material-symbols-outlined text-[20px]">add_box</span>
                Thêm sản phẩm
              </button>
            </div>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div class="relative z-10">
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Tổng biến thể</p>
                <p class="text-3xl font-brand font-bold text-slate-900">1,248</p>
                <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <span class="material-symbols-outlined text-sm">trending_up</span> +24 tháng này
                </div>
              </div>
              <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner">
                <span class="material-symbols-outlined text-[#ff8f73]">inventory</span>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border border-rose-50 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div class="relative z-10">
                <p class="text-[11px] text-rose-400 font-bold uppercase tracking-widest mb-2">Sắp hết hàng</p>
                <p class="text-3xl font-brand font-bold text-rose-600">14</p>
                <div class="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-400 italic">
                  Cần nhập thêm ngay
                </div>
              </div>
              <div class="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner">
                <span class="material-symbols-outlined text-rose-500">report_problem</span>
              </div>
            </div>
            
            <div class="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-3 relative overflow-hidden">
              <div class="flex justify-between items-center relative z-10">
                <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Lọc theo nhà sản xuất</p>
                <button 
                  @click="isFilterPanelOpen = true"
                  class="flex items-center gap-1 text-[11px] bg-[#ff8f73]/10 text-[#ff8f73] px-3 py-1.5 rounded-lg font-bold hover:bg-[#ff8f73]/20 transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px]">tune</span>
                  Bộ lọc nâng cao
                </button>
              </div>
              <div class="flex flex-wrap gap-2 relative z-10">
                <button 
                  v-for="brand in filterBrands" :key="brand.id"
                  @click="activeFilter = brand.id"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm"
                  :class="activeFilter === brand.id 
                    ? 'bg-[#ff8f73] text-white border-[#ff8f73] shadow-[#ff8f73]/20' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700'"
                >
                  {{ brand.name }}
                </button>
              </div>
            </div>
          </div>
  
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto min-h-[300px]">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr class="bg-slate-50/50 border-b border-slate-100">
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Tên sản phẩm</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Phân loại</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Giá nhập</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Giá bán</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center">Tồn kho</th>
                    <th class="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-center w-24">Hành động</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="product in products" :key="product.id" 
                      class="transition-colors group"
                      :class="product.stock <= 5 ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50/80'">
                    
                    <td class="px-8 py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner shrink-0 p-0.5">
                          <img :src="'/Images_product/' + product.anh" class="w-full h-full object-cover rounded-lg"/>
                        </div>
                        <div class="flex flex-col">
                          <p class="font-bold text-slate-900 text-[15px] mb-1.5 truncate max-w-[250px]" :title="product.name">{{ product.name }}</p>
                          <div class="flex items-center gap-2">
                            <span class="text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase border shadow-sm inline-block"
                                  :class="getBrandColor(product.brand)">
                              {{ product.brand }}
                            </span>
                            <span class="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              {{ product.category }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td class="px-8 py-4">
                      <p class="font-bold text-slate-700 text-sm mb-1">{{ product.variant }}</p>
                      <p class="text-[11px] font-semibold text-slate-400">Scale: <span class="text-slate-500">{{ product.scale }}</span></p>
                    </td>
                    
                    <td class="px-8 py-4 text-sm font-semibold text-slate-400 text-right">{{ product.costPrice }}đ</td>
                    <td class="px-8 py-4 text-sm font-bold text-slate-900 text-right">{{ product.sellPrice }}đ</td>
                    
                    <td class="px-8 py-4 text-center">
                      <div v-if="product.stock > 5">
                        <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">{{ product.stock }}</span>
                      </div>
                      <div v-else class="flex flex-col items-center">
                        <span class="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold border border-rose-200 shadow-sm">{{ product.stock }}</span>
                        <span class="text-[9px] text-rose-400 font-bold mt-1 uppercase tracking-tighter">Sắp hết!</span>
                      </div>
                    </td>
                    
                    <td class="px-8 py-4">
                      <div class="flex justify-center gap-2">
                        <button @click="openEditModal(product)" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#ff8f73] hover:bg-[#ff8f73]/10 rounded-xl transition-all border border-transparent hover:border-[#ff8f73]/20" title="Sửa thông tin">
                          <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button @click="openDeleteConfirm(product)" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100" title="Xóa sản phẩm">
                          <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p class="text-xs font-bold text-slate-400">Hiển thị 1 - 4 của 1,248 sản phẩm</p>
              <div class="flex items-center gap-2">
                <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
                <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-[#ff8f73] text-white text-xs font-bold shadow-lg shadow-[#ff8f73]/20">1</button>
                <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73] text-xs transition-all">2</button>
                <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#ff8f73] text-xs transition-all">3</button>
                <button class="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#ff8f73] hover:border-[#ff8f73] transition-all"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
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
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thương hiệu</label>
              <select v-model="newProduct.brand" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
                <option value="Bandai">Bandai</option>
                <option value="Hot Toys">Hot Toys</option>
                <option value="GSC">Good Smile Company</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Danh mục</label>
              <select v-model="newProduct.category" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
                <option value="Action Figure">Action Figure</option>
                <option value="Model Kit">Model Kit (Lắp ráp)</option>
                <option value="Statue (Tĩnh)">Statue (Tĩnh)</option>
                <option value="Chibi Figure">Chibi Figure</option>
              </select>
            </div>

            <div class="md:col-span-2 border-t border-slate-100 my-2"></div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên phân loại (Variant)</label>
              <input v-model="newProduct.variant" type="text" placeholder="VD: Bản Standard" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dòng (Scale)</label>
              <input v-model="newProduct.scale" type="text" placeholder="VD: 1/144 HG" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá nhập (VNĐ)</label>
              <input v-model="newProduct.costPrice" type="text" placeholder="VD: 350.000" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá bán (VNĐ)</label>
              <input v-model="newProduct.sellPrice" type="text" placeholder="VD: 550.000" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Số lượng tồn kho ban đầu</label>
              <input v-model.number="newProduct.stock" type="number" min="0" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-[#ff8f73]">
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
              <input v-model="editingProduct.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all font-medium text-slate-800">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thương hiệu</label>
              <select v-model="editingProduct.brand" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none transition-all font-bold text-slate-700 bg-white">
                <option value="Bandai">Bandai</option>
                <option value="Hot Toys">Hot Toys</option>
                <option value="GSC">Good Smile Company</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Danh mục</label>
              <select v-model="editingProduct.category" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none transition-all font-bold text-slate-700 bg-white">
                <option value="Action Figure">Action Figure</option>
                <option value="Model Kit">Model Kit</option>
                <option value="Statue">Statue</option>
                <option value="Chibi Figure">Chibi Figure</option>
              </select>
            </div>

            <div class="md:col-span-2 border-t border-slate-100 my-2"></div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên phân loại (Variant)</label>
              <input v-model="editingProduct.variant" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dòng (Scale)</label>
              <input v-model="editingProduct.scale" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá nhập (VNĐ)</label>
              <input v-model="editingProduct.costPrice" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none font-medium">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá bán (VNĐ) (*)</label>
              <input v-model="editingProduct.sellPrice" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none font-bold text-slate-900">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tồn kho hiện tại</label>
              <input v-model.number="editingProduct.stock" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-sky-600 focus:border-sky-500 outline-none">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
              <select v-model="editingProduct.status" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 bg-white shadow-sm">
                <option value="Sẵn hàng">Sẵn hàng</option>
                <option value="Pre-order">Pre-order</option>
                <option value="Hết hàng">Hết hàng</option>
              </select>
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
    <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        <div class="bg-rose-50 p-6 flex flex-col items-center justify-center border-b border-rose-100">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
            <span class="material-symbols-outlined text-4xl text-rose-500">warning</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Xác nhận xóa sản phẩm</h3>
        </div>

        <div class="p-6 text-center">
          <p class="text-sm text-slate-600 mb-2">Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống không?</p>
          <p class="font-bold text-slate-900 bg-slate-50 py-2 px-4 rounded-lg border border-slate-100 line-clamp-2">
            "{{ productToDelete?.name }}"
          </p>
          <p class="text-[11px] font-medium text-rose-500 mt-4 bg-rose-50 py-1.5 px-3 rounded-md inline-block">
            Lưu ý: Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác!
          </p>
        </div>

        <div class="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button @click="isDeleteModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm">
            Hủy bỏ
          </button>
          <button @click="executeDeleteProduct" class="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 rounded-xl transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">delete_forever</span> Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from "../../stores/toast";
  
  const toastStore = useToastStore();
  const fileInputRef = ref(null);
  const galleryInputRef = ref(null);
  const isFilterPanelOpen = ref(false);
  
  const isSidebarCollapsed = ref(false);
  const isMobileMenuOpen = ref(false);

  import { onMounted, watch } from 'vue';

  // --- KẾT NỐI API: LIỆT KÊ SẢN PHẨM ---
  const products = ref([]);
  const isLoading = ref(true);
  const currentPage = ref(1);

  const fetchProducts = async () => {
    isLoading.value = true;
    try {
      const response = await fetch(`http://localhost:3000/api/product_admin?page=${currentPage.value}&limit=10`);
      const result = await response.json();

      if (result.success) {
        // Mapping dữ liệu từ Database vào UI
        // LƯU Ý: Bạn hãy sửa các tên cột (TenMH, TenThuongHieu...) cho khớp đúng với SQL của bạn nhé!
        products.value = result.data.map(item => {
          return {
            id: item.MaMH, 
            name: item.TenMH,
            anh: item.AnhDaiDien,
            brand: item.TenThuongHieu || 'Chưa cập nhật',
            category: item.TenDanhMuc || 'Mô hình',
            variant: item.TenPhanLoai || 'Mặc định',
            scale: item.TyLe || 'N/A',
            // Format tiền tệ cho đẹp
            costPrice: Number(item.GiaNhap || 0).toLocaleString('vi-VN'),
            sellPrice: Number(item.GiaBan || 0).toLocaleString('vi-VN'),
            stock: item.SoLuongTon || 0,
            thumbnailUrl: item.AnhDaiDien || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.TenMH)}&background=random&color=fff&size=128`
          };
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      toastStore.showToast("Không thể kết nối đến máy chủ!", "error");
    } finally {
      isLoading.value = false;
    }
  };

  // Gọi API ngay khi Load trang
  onMounted(() => {
    fetchProducts();
  });
  
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) isMobileMenuOpen.value = !isMobileMenuOpen.value;
    else isSidebarCollapsed.value = !isSidebarCollapsed.value;
  };
  const closeAllMenus = () => {};
  
  const filterBrands = [
    { id: 'all', name: 'Tất cả' },
    { id: 'bandai', name: 'Bandai' },
    { id: 'gsc', name: 'GSC' },
    { id: 'hottoys', name: 'Hot Toys' },
    { id: 'goodsmile', name: 'Good Smile' },
  ];
  const activeFilter = ref('all');
  
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
      name: '', brand: 'Bandai', category: 'Action Figure', variant: '', scale: '', costPrice: '', sellPrice: '', stock: 0,
      thumbnailUrl: '', thumbnailFile: null, galleryUrls: [], galleryFiles: []
  });

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
  
  const openAddModal = () => {
    newProduct.value = {
      name: '', brand: 'Bandai', category: 'Action Figure', variant: '', scale: '', costPrice: '', sellPrice: '', stock: 0,
      thumbnailUrl: '', thumbnailFile: null, galleryUrls: [], galleryFiles: []
    };
    isAddProductModalOpen.value = true;
  };

  // --- KẾT NỐI API: THÊM SẢN PHẨM MỚI ---
  const submitNewProduct = async () => {
      // 1. Kiểm tra đầu vào
      if (!newProduct.value.name.trim()) {
        toastStore.showToast("Vui lòng nhập Tên mô hình!", "error");
        return;
      }

      // 2. Đóng gói dữ liệu (Vì có file ảnh nên phải dùng FormData)
      const formData = new FormData();
      formData.append('TenMH', newProduct.value.name);
      formData.append('ThuongHieu', newProduct.value.brand);
      formData.append('DanhMuc', newProduct.value.category);
      formData.append('PhanLoai', newProduct.value.variant);
      formData.append('TyLe', newProduct.value.scale);
      formData.append('GiaNhap', newProduct.value.costPrice);
      formData.append('GiaBan', newProduct.value.sellPrice);
      formData.append('SoLuong', newProduct.value.stock);

      // Gắn file ảnh đại diện (nếu có)
      if(newProduct.value.thumbnailFile) {
        formData.append('AnhDaiDien', newProduct.value.thumbnailFile);
      }
      
      // Gắn nhiều file ảnh bộ sưu tập (nếu có)
      newProduct.value.galleryFiles.forEach(file => {
        formData.append('BoSuuTapAnh', file);
      });

      // 3. Gửi xuống Backend
      try {
        const response = await fetch('http://localhost:3000/api/product_admin/add_product', {
          method: 'POST',
          body: formData // Fetch tự động set header multipart/form-data
        });
        
        const result = await response.json();

        if (result.success) {
          isAddProductModalOpen.value = false;
          toastStore.showToast("Đã thêm sản phẩm thành công!", "success");
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
  const editingProduct = ref({});
  const editFileInputRef = ref(null);
  const editGalleryInputRef = ref(null); 

  const openEditModal = (product) => {
    editingProduct.value = {
      ...product, 
      idCode: product.id,
      thumbnailUrl: product.thumbnailUrl || `https://ui-avatars.com/api/?name=${product.name.charAt(0)}`, 
      thumbnailFile: null,
      galleryUrls: product.galleryUrls ? [...product.galleryUrls] : [], 
      galleryFiles: [] 
    };
    isEditModalOpen.value = true;
  } 

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
    editingProduct.value.galleryUrls.splice(index, 1);
  };

  // --- LƯU THAY ĐỔI ---
  const saveProductChanges = () => {
    if (!editingProduct.value.name.trim()) {
        toastStore.showToast("Tên sản phẩm không được để trống!", "error");
        return;
    }

    const formData = new FormData();
    formData.append('TenMH', editingProduct.value.name);
    
    // Gắn ảnh đại diện mới (nếu có)
    if (editingProduct.value.thumbnailFile) {
        formData.append('AnhDaiDien', editingProduct.value.thumbnailFile);
    }
    
    //  Gắn mảng ảnh Gallery mới (nếu có)
    if (editingProduct.value.galleryFiles && editingProduct.value.galleryFiles.length > 0) {
      editingProduct.value.galleryFiles.forEach(file => {
        formData.append('BoSuuTapAnhMoi', file);
      });
    }

    // Cập nhật giao diện
    const index = products.value.findIndex(p => p.id === editingProduct.value.id);
    if (index !== -1) {
      products.value[index] = { ...editingProduct.value };
    }

    isEditModalOpen.value = false;
    toastStore.showToast("Đã cập nhật thay đổi thành công!", "success");
  };

  // XÓA SẢN PHẨM (DELETE)
  const isDeleteModalOpen = ref(false);
  const productToDelete = ref(null);

  // Mở modal xác nhận
  const openDeleteConfirm = (product) => {
    productToDelete.value = product; 
    isDeleteModalOpen.value = true;
  };

  // Thực thi xóa
  const executeDeleteProduct = async () => {
    if (!productToDelete.value) return;

    try {
      /*
      const response = await fetch(`http://localhost:3000/api/products/${productToDelete.value.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Lỗi khi xóa sản phẩm');
      */

      products.value = products.value.filter(p => p.id !== productToDelete.value.id);

      isDeleteModalOpen.value = false;
      toastStore.showToast("Đã xóa sản phẩm thành công!", "success");
      
      productToDelete.value = null; 

    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      toastStore.showToast("Xảy ra lỗi khi xóa sản phẩm!", "error");
    }
  };

  const filterCategories = ref([
    { id: 'cat_action', name: 'Action Figure (Khớp động)' },
    { id: 'cat_statue', name: 'Statue (Tượng tĩnh)' },
    { id: 'cat_modelkit', name: 'Model Kit (Lắp ráp)' },
    { id: 'cat_chibi', name: 'Chibi / Nendoroid' }
  ]);

  const selectedCategories = ref([]);
  const sortBy = ref('newest');

  const resetFilters = () => {
        selectedCategories.value = [];
        sortBy.value = 'newest';
        activeFilter.value = 'all';
   };
</script>
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>