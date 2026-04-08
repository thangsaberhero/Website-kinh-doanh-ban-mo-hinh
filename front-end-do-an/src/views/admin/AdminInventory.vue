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
                          <img :src="`https://ui-avatars.com/api/?name=${product.name.charAt(0)}&background=random&color=fff&size=128`" class="w-full h-full object-cover rounded-lg"/>
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
                        <button class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#ff8f73] hover:bg-[#ff8f73]/10 rounded-xl transition-all border border-transparent hover:border-[#ff8f73]/20" title="Sửa thông tin">
                          <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100" title="Xóa sản phẩm">
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
          </div>
        </div>

        <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button @click="isAddProductModalOpen = false" class="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
          <button @click="submitNewProduct" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 rounded-xl transition-all">Lưu sản phẩm</button>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref } from 'vue';
  import AdminSideBar from "@/components/AdminSidebar.vue";
  import AdminHeader from "@/components/AdminHeader.vue";
  
  const isFilterPanelOpen = ref(false);
  
  const isSidebarCollapsed = ref(false);
  const isMobileMenuOpen = ref(false);
  
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
  // --- BƯỚC 3: LOGIC QUẢN LÝ MODAL THÊM SẢN PHẨM ---
    const isAddProductModalOpen = ref(false);

    // Object chứa dữ liệu form
    const newProduct = ref({
        name: '',
        brand: 'Bandai',
        category: 'Action Figure',
        variant: '',
        scale: '',
        costPrice: '',
        sellPrice: '',
        stock: 0
    });

    // Hàm mở Modal và reset form cho sạch sẽ
    const openAddModal = () => {
        newProduct.value = {
            name: '', brand: 'Bandai', category: 'Action Figure', variant: '', scale: '', costPrice: '', sellPrice: '', stock: 0
        };
        isAddProductModalOpen.value = true;
    };

    // Hàm xử lý khi bấm "Lưu sản phẩm"
    const submitNewProduct = () => {
    // Validate cơ bản: Bắt buộc nhập tên
        if (!newProduct.value.name.trim()) {
            alert("Vui lòng nhập Tên mô hình!");
            return;
        }

        // Đẩy dữ liệu mới vào ĐẦU mảng products bằng unshift
        // (Dùng unshift để sản phẩm mới hiện ngay trên cùng của bảng)
        products.value.unshift({
            id: Date.now(), // Tạo ID giả bằng timestamp
            name: newProduct.value.name,
            brand: newProduct.value.brand,
            category: newProduct.value.category,
            variant: newProduct.value.variant || 'Mặc định',
            scale: newProduct.value.scale || 'N/A',
            costPrice: newProduct.value.costPrice || '0',
            sellPrice: newProduct.value.sellPrice || '0',
            stock: newProduct.value.stock
        });

        // Đóng Modal   
        isAddProductModalOpen.value = false;
    };
  // DATA ĐÃ ĐƯỢC CHUẨN HÓA VỚI CƠ SỞ DỮ LIỆU
  const products = ref([
    { id: 1, name: 'Gundam Exia Repair IV', brand: 'Bandai', category: 'Action Figure', variant: 'Bản Tiêu Chuẩn', scale: 'Metal Build', costPrice: '4.200.000', sellPrice: '5.850.000', stock: 42 },
    { id: 2, name: 'Iron Man Mark LXXXV', brand: 'Hot Toys', category: 'Figure Tỷ Lệ', variant: 'Bản Deluxe', scale: '1/6 Scale', costPrice: '8.500.000', sellPrice: '11.200.000', stock: 3 },
    { id: 3, name: 'Hatsune Miku: Magical Mirai', brand: 'GSC', category: 'Chibi Figure', variant: 'Nendoroid No. 1200', scale: 'Non-scale', costPrice: '1.100.000', sellPrice: '1.650.000', stock: 12 },
    { id: 4, name: 'Super Saiyan Son Goku', brand: 'Bandai', category: 'Statue (Tĩnh)', variant: 'Masterlise', scale: 'Ichiban Kuji', costPrice: '850.000', sellPrice: '1.350.000', stock: 8 },
  ]);

    // 1. Dữ liệu danh mục để render ra checkbox
  const filterCategories = ref([
    { id: 'cat_action', name: 'Action Figure (Khớp động)' },
    { id: 'cat_statue', name: 'Statue (Tượng tĩnh)' },
    { id: 'cat_modelkit', name: 'Model Kit (Lắp ráp)' },
    { id: 'cat_chibi', name: 'Chibi / Nendoroid' }
  ]);

    // 2. Mảng lưu trữ các danh mục người dùng đã tick chọn
  const selectedCategories = ref([]);

    // 3. Biến lưu trạng thái sắp xếp
  const sortBy = ref('newest');

    // 4. (Tùy chọn) Hàm reset bộ lọc khi bấm nút "Đặt lại"
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