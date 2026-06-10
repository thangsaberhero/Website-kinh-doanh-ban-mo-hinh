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
      
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-24">
        
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
          <div>
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Cài đặt hệ thống</h1>
            <p class="text-slate-500 text-sm font-medium">Quản lý nhận diện thương hiệu, thông tin liên hệ và giao diện hiển thị.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">        
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73]">info</span>
                Thông tin chung
              </h2>
              <p class="text-xs text-slate-500 mt-1">Tên website, hotline và email liên hệ.</p>
            </div>
            <div class="p-6 space-y-5 flex-1">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên thương hiệu (Shop Name)</label>
                <input v-model="formText.shop_name" type="text" placeholder="VD: FigureCollect" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-bold text-slate-800">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hotline</label>
                  <input v-model="formText.contact_phone" type="text" placeholder="VD: 0123456789" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-800">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email hỗ trợ</label>
                  <input v-model="formText.contact_email" type="email" placeholder="VD: hotro@shop.com" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-800">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Địa chỉ cửa hàng</label>
                <textarea v-model="formText.shop_address" rows="2" placeholder="VD: Số 123 Đà Nẵng, Phường Ngô Quyền, TP. Hải Phòng" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-800 resize-none"></textarea>
              </div>
            </div>
            <div class="p-6 pt-0">
              <button @click="saveTextSettings" :disabled="isSavingText" class="w-full py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                <span v-if="isSavingText" class="material-symbols-outlined animate-spin">autorenew</span>
                <span v-else class="material-symbols-outlined text-[18px]">save</span>
                Lưu thông tin
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73]">branding_watermark</span>
                Nhận diện thương hiệu
              </h2>
              <p class="text-xs text-slate-500 mt-1">Cập nhật Logo hiển thị trên thanh điều hướng và Favicon.</p>
            </div>
            
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div class="space-y-8"> <div class="flex items-start gap-6">
                  <div class="w-40 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-800 shrink-0 relative group">
                    <img v-if="previews.logo_header" :src="previews.logo_header" class="max-w-full max-h-full object-contain p-2" />
                    <span v-else class="text-xs font-medium text-slate-400">Trống</span>
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm font-bold text-slate-800 mb-1">Logo Header (Ngang)</label>
                    <p class="text-[10px] text-slate-500 mb-4">Hiển thị ở góc trái thanh điều hướng.</p>
                    <div class="flex gap-2">
                      <input type="file" accept="image/*" @change="e => handleSingleFile(e, 'logo_header')" class="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-[#ff8f73]/10 file:text-[#ff8f73] hover:file:bg-[#ff8f73]/20 cursor-pointer">
                      <button v-if="files.logo_header" @click="saveSingleImage('logo_header', '/update_logo_header')" class="shrink-0 bg-[#ff8f73] hover:bg-[#ff3d00] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">Lưu ảnh</button>
                    </div>
                  </div>
                </div>

                <div class="h-px bg-slate-100 w-full"></div>

                <div class="flex items-start gap-6">
                  <div class="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0 relative group">
                    <img v-if="previews.logo_favicon" :src="previews.logo_favicon" class="w-full h-full object-cover p-1" />
                    <span v-else class="text-xs font-medium text-slate-400">Trống</span>
                  </div>
                  <div class="flex-1">
                    <label class="block text-sm font-bold text-slate-800 mb-1">Logo Vuông (Favicon)</label>
                    <p class="text-[10px] text-slate-500 mb-4">Dùng làm biểu tượng trên Tab trình duyệt.</p>
                    <div class="flex gap-2">
                      <input type="file" accept="image/*" @change="e => handleSingleFile(e, 'logo_favicon')" class="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer">
                      <button v-if="files.logo_favicon" @click="saveSingleImage('logo_favicon', '/update_logo_favicon')" class="shrink-0 bg-slate-800 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">Lưu ảnh</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <span class="material-symbols-outlined text-blue-500 mt-0.5 text-[20px]">lightbulb</span>
                <div>
                  <h4 class="text-xs font-bold text-blue-800 mb-1">Mẹo tối ưu hình ảnh</h4>
                  <p class="text-[11px] text-blue-600/80 leading-relaxed">
                    Nên dùng định dạng <strong class="text-blue-700">.PNG</strong> hoặc <strong class="text-blue-700">.WEBP</strong> không nền. Dung lượng mỗi ảnh nên dưới <strong class="text-blue-700">2MB</strong> để website tải nhanh nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:col-span-2 mt-8">
          <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73]">share</span>
                Liên kết Mạng xã hội
              </h2>
              <p class="text-xs text-slate-500 mt-1">Đường dẫn tới Fanpage và kênh truyền thông của cửa hàng (Để trống nếu không muốn hiển thị).</p>
            </div>
            <button @click="saveTextSettings" :disabled="isSavingText" class="shrink-0 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
              <span v-if="isSavingText" class="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
              <span v-else class="material-symbols-outlined text-[18px]">save</span>
              Lưu liên kết
            </button>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">       
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <img src="https://api.iconify.design/logos:facebook.svg"> Facebook
                </label>
                <input v-model="formText.social_facebook" type="url" placeholder="https://facebook.com/..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1877F2] outline-none">
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <img src="https://api.iconify.design/logos:youtube-icon.svg"> YouTube
                </label>
                <input v-model="formText.social_youtube" type="url" placeholder="https://youtube.com/..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#FF0000] outline-none">
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <img src="https://api.iconify.design/skill-icons:instagram.svg"> Instagram
                </label>
                <input v-model="formText.social_instagram" type="url" placeholder="https://instagram.com/..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#E4405F] outline-none">
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">          
          <!-- KHỐI 3: SLIDER ẢNH NỀN ĐĂNG NHẬP -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#ff8f73]">wallpaper</span>
                  Slider nền Đăng nhập
                </h2>
                <p class="text-xs text-slate-500 mt-1">Danh sách các ảnh nền luân phiên ở trang Login.</p>
              </div>
              <button @click="saveLoginBanners" class="bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">cloud_upload</span> Lưu Slider
              </button>
            </div>
            
            <div class="p-6">
              <p class="text-sm font-bold text-slate-800 mb-4">Quản lý ảnh (Kéo thả để sắp xếp thứ tự)</p>
              
              <draggable 
                v-model="existingLoginBanners" 
                item-key="id" 
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
                animation="250"
                ghost-class="opacity-40"
              >
                <template #item="{ element: banner, index: idx }">
                  <div class="relative group w-full aspect-[9/16] rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm cursor-move hover:border-[#ff8f73] transition-all">
                    <img :src="banner.url" class="w-full h-full object-cover" />
                    
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <span class="material-symbols-outlined text-white text-3xl mb-2">drag_pan</span>
                      <button @click.stop="removeExistingLoginBanner(idx)" class="bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-600 shadow-lg" title="Xóa ảnh này">
                        <span class="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <span class="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm z-10">Slide {{ idx + 1 }}</span>
                  </div>
                </template>

                <template #footer>
                  <div v-for="(preview, idx) in previews.login_bg" :key="'new_login'+idx" class="relative group w-full aspect-[9/16] rounded-xl overflow-hidden border-2 border-[#ff8f73] shadow-sm">
                    <img :src="preview" class="w-full h-full object-cover" />
                    <button @click="removeNewLoginBanner(idx)" class="absolute top-2 right-2 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-rose-600 shadow-lg z-10">
                      <span class="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <div class="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center text-white py-1 font-medium">Chờ lưu</div>
                  </div>

                  <label class="w-full aspect-[9/16] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-[#ff8f73] transition-colors group">
                    <span class="material-symbols-outlined text-3xl text-slate-400 group-hover:text-[#ff8f73] mb-1">add_photo_alternate</span>
                    <span class="text-xs font-bold text-slate-500 group-hover:text-[#ff8f73]">Thêm ảnh</span>
                    <input type="file" multiple accept="image/*" @change="handleLoginBannerFiles" class="hidden" />
                  </label>
                </template>
              </draggable>              
            </div>
          </div>
          
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#ff8f73]">payments</span>
                Cổng thanh toán
              </h2>
              <p class="text-xs text-slate-500 mt-1">Bật/Tắt các phương thức thanh toán hiển thị cho khách hàng.</p>
            </div>
            <div class="p-0">
              <ul class="divide-y divide-slate-100">
                <li v-for="method in paymentMethods" :key="method.MaPT" class="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" 
                        :class="method.TrangThaiHoatDong ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'">
                      <span class="material-symbols-outlined">{{ method.TenPhuongThuc.toLowerCase().includes('momo') ? 'account_balance_wallet' : (method.TenPhuongThuc.toLowerCase().includes('cod') ? 'local_shipping' : 'account_balance') }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">{{ method.TenPhuongThuc }}</p>
                      <p class="text-[10px] font-semibold mt-0.5" :class="method.TrangThaiHoatDong ? 'text-emerald-500' : 'text-slate-400'">
                        {{ method.TrangThaiHoatDong ? 'Đang hoạt động' : 'Tạm khóa' }}
                      </p>
                    </div>
                  </div>
                  
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" :checked="method.TrangThaiHoatDong === 1" @change="togglePaymentMethod(method)">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:col-span-2">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#ff8f73]">view_carousel</span>
                  Dữ liệu Slider Trang chủ
                </h2>
                <p class="text-xs text-slate-500 mt-1">Quản lý hình ảnh và nội dung Text, Link cho từng Banner.</p>
              </div>
              <button @click="saveHomeBanners" class="bg-[#ff8f73] hover:bg-[#ff3d00] shadow-lg shadow-[#ff8f73]/20 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">save</span> Lưu cấu hình Slider
              </button>
            </div>
            
            <div class="p-6 space-y-6">
              
              <!-- DANH SÁCH BANNER HIỆN TẠI ĐỂ SỬA TEXT -->
              <p class="text-sm font-bold text-slate-800 mb-2">Sắp xếp thứ tự hiển thị bằng cách kéo thả biểu tượng <span class="material-symbols-outlined text-[14px] align-middle">drag_indicator</span></p>
              
              <draggable 
                v-model="existingBanners" 
                handle=".drag-handle" 
                item-key="id" 
                class="space-y-6"
                animation="250"
                ghost-class="opacity-50"
              >
                <template #item="{ element: slide, index: idx }">
                  <div class="flex flex-col md:flex-row gap-6 p-5 border border-slate-200 rounded-xl bg-slate-50/30 relative group transition-all hover:border-[#ff8f73]/40 hover:shadow-md pl-10">
                    
                    <div class="drag-handle absolute left-0 top-0 bottom-0 w-8 bg-slate-100 border-r border-slate-200 flex items-center justify-center cursor-move rounded-l-xl group-hover:bg-[#ff8f73]/20 transition-colors z-10" title="Kéo để đổi vị trí">
                      <span class="material-symbols-outlined text-slate-400 group-hover:text-[#ff8f73]">drag_indicator</span>
                    </div>

                    <button @click="removeExistingBanner(idx)" class="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-all">
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>

                    <div class="w-full md:w-1/3 shrink-0">
                      <div class="w-full h-40 rounded-xl overflow-hidden shadow-sm border border-slate-200 relative">
                        <img :src="slide.image" class="w-full h-full object-cover" />
                        <span class="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-bold backdrop-blur-sm">Slide {{ idx + 1 }}</span>
                      </div>
                    </div>

                    <div class="w-full md:w-2/3 grid grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tag / Nhãn</label>
                        <input v-model="slide.tag" type="text" placeholder="VD: LIMITED EDITION" class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:border-[#ff8f73] outline-none bg-white">
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">Link<span class="text-[9px] text-[#ff8f73] italic">* Đúp chuột</span></label>
                        <input v-model="slide.link" list="link-suggestions" type="text" placeholder="Chọn link..." class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:border-[#ff8f73] outline-none bg-white">
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tiêu đề chính</label>
                        <input v-model="slide.title" type="text" class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white text-slate-800">
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-[#ff8f73] uppercase tracking-widest">Chữ Cam</label>
                        <input v-model="slide.titleAccent" type="text" class="w-full text-sm border border-[#ff8f73]/50 rounded-lg px-3 py-2 font-bold text-[#ff8f73] bg-white">
                      </div>
                      <div class="space-y-1.5 col-span-2">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mô tả ngắn</label>
                        <textarea v-model="slide.desc" rows="2" class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none bg-white"></textarea>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>

              <!-- KHU VỰC THÊM ẢNH MỚI (TẢI TỪ MÁY TÍNH LÊN) -->
              <div class="border-t border-slate-200 pt-6">
                <p class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span class="material-symbols-outlined text-slate-400">add_photo_alternate</span>
                  Tải thêm ảnh mới
                </p>
                <div class="flex flex-wrap gap-4">
                  
                  <div v-for="(preview, idx) in previews.home_banner" :key="'new'+idx" class="relative w-36 h-24 rounded-xl overflow-hidden border-2 border-[#ff8f73] shadow-sm">
                    <img :src="preview" class="w-full h-full object-cover" />
                    <button @click="removeNewBanner(idx)" class="absolute top-1 right-1 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-rose-600 shadow-lg"><span class="material-symbols-outlined text-[14px]">close</span></button>
                    <div class="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-white py-0.5">Chờ lưu</div>
                  </div>

                  <label class="w-36 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-[#ff8f73] transition-colors">
                    <span class="material-symbols-outlined text-2xl text-slate-400">upload</span>
                    <span class="text-[10px] font-bold text-slate-500 mt-1">Chọn ảnh</span>
                    <input type="file" multiple accept="image/*" @change="handleHomeBannerFiles" class="hidden" />
                  </label>
                  
                </div>
                <p class="text-[11px] text-slate-400 mt-3 max-w-md italic">
                  * Mẹo: Sau khi bạn chọn ảnh mới từ máy tính và bấm <strong>"Lưu cấu hình Slider"</strong>, bức ảnh sẽ được tải lên máy chủ và hiển thị ở danh sách bên trên để bạn điền Tiêu đề và Link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import draggable from 'vuedraggable';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from "../../stores/toast";
  import { useLayoutStore } from '../../stores/layout';
  import { useSystemStore } from '../../stores/system';

  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();
  const systemStore = useSystemStore();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const categoriesList = ref([]);
  const brandsList = ref([]);

  // Hàm tải dữ liệu Danh mục & Hãng để làm gợi ý Link
  const fetchDropdownData = async () => {
    try {
      // 1. Lấy danh mục
      const resCat = await fetch(`${API_BASE_URL}/api/products/danhmuc`);
      const catData = await resCat.json();
      if (resCat.ok) categoriesList.value = catData.data;

      // 2. Lấy hãng sản xuất
      const resBrand = await fetch(`${API_BASE_URL}/api/products/hsx`);
      const brandData = await resBrand.json();
      if (resBrand.ok) brandsList.value = brandData.data;
    } 
    catch (error) {
      console.error("Lỗi lấy dữ liệu gợi ý link:", error);
    }
  };

  // State lưu trữ dữ liệu
  const formText = ref({
    shop_name: '',
    contact_phone: '',
    contact_email: '',
    shop_address: '',
    social_facebook: '',
    social_youtube: '',
    social_instagram: ''
  });

  // State cho File đang chờ Upload và File Preview hiển thị
  const files = ref({
    logo_header: null,
    logo_favicon: null,
    login_bg: [],
    home_banner: [] // Chứa các File object thật
  });

  const previews = ref({
    logo_header: null,
    logo_favicon: null,
    login_bg: [],
    home_banner: [] // Chứa blob URL để preview ảnh mới
  });

  const existingBanners = ref([]); 
  const existingLoginBanners = ref([]);
  const isSavingText = ref(false);

  const formatBanners = (rawArray) => {
    if (!Array.isArray(rawArray)) return [];
    return rawArray.map((item, idx) => {
      const uniqueId = 'home_' + idx + '_' + Date.now();
      if (typeof item === 'string') {
        return { 
          id: uniqueId, image: item, tag: 'NEW ARRIVAL', 
          title: 'SẢN PHẨM', titleAccent: 'MỚI', 
          desc: 'Nâng tầm bộ sưu tập của bạn với những kiệt tác giới hạn.', link: '/category' 
        };
      }
      return { id: item.id || uniqueId, ...item }; 
    });
  };

  // --- 1. LẤY TOÀN BỘ CÀI ĐẶT TỪ DB KHI LOAD TRANG ---
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/setting/admin`);
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        
        // Gán dữ liệu Văn bản
        formText.value.shop_name = data.shop_name || '';
        formText.value.contact_phone = data.contact_phone || '';
        formText.value.contact_email = data.contact_email || '';
        formText.value.shop_address = data.shop_address || '';
        formText.value.social_facebook = data.social_facebook || '';
        formText.value.social_youtube = data.social_youtube || '';
        formText.value.social_instagram = data.social_instagram || '';

        // Gán dữ liệu Hình ảnh hiện tại vào Preview
        previews.value.logo_header = data.logo_header || null;
        previews.value.logo_favicon = data.logo_favicon || null;
        
        // Mảng Banner
        existingLoginBanners.value = Array.isArray(data.login_bg) 
          ? data.login_bg.map((url, i) => ({ id: 'login_' + i + '_' + Date.now(), url })) 
          : [];
        existingBanners.value = formatBanners(data.home_banner);
      }
    } catch (error) {
      console.error("Lỗi khi tải cài đặt:", error);
      toastStore.showToast("Không thể kết nối đến máy chủ!", "error");
    }
  };

  // --- 2. CẬP NHẬT CÀI ĐẶT VĂN BẢN ---
  const saveTextSettings = async () => {
    isSavingText.value = true;
    const token = localStorage.getItem('token');
    
    try {
      // Vì API cap_nhat_van_ban nhận từng Key một, ta dùng Promise.all để gọi đồng thời
      const updatePromises = Object.keys(formText.value).map(key => {
        return fetch(`${API_BASE_URL}/api/setting/admin/update_text`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ keyCaiDat: key, giaTri: formText.value[key] })
        });
      });

      await Promise.all(updatePromises);
      toastStore.showToast("Đã lưu thông tin cơ bản thành công!", "success");
      await systemStore.fetchSettings(true);
    } 
    catch (error) {
      console.error("Lỗi cập nhật văn bản:", error);
      toastStore.showToast("Lỗi khi lưu thông tin!", "error");
    } finally {
      isSavingText.value = false;
    }
  };

  // --- 3. XỬ LÝ ẢNH FILE ĐƠN ---
  const handleSingleFile = (event, fieldKey) => {
    const file = event.target.files[0];
    if (file) {
      files.value[fieldKey] = file;
      // Tạo link ảo để preview lập tức
      previews.value[fieldKey] = URL.createObjectURL(file);
    }
  };

  const saveSingleImage = async (fieldKey, endpoint) => {
    if (!files.value[fieldKey]) return;
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('keyCaiDat', fieldKey);
    formData.append(fieldKey, files.value[fieldKey]); // Tên trường file trùng với tên khai báo ở Backend Route

    try {
      const response = await fetch(`${API_BASE_URL}/api/setting/admin${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        toastStore.showToast("Đã cập nhật hình ảnh!", "success");
        files.value[fieldKey] = null; // Xóa file bộ nhớ đệm đi để ẩn nút "Tải lên"
      } else {
        toastStore.showToast(result.message || "Lỗi cập nhật ảnh!", "error");
      }
    } catch (error) {
      console.error("Lỗi cập nhật file:", error);
      toastStore.showToast("Lỗi máy chủ!", "error");
    }
  };

  // --- 4. XỬ LÝ MẢNG ẢNH BANNER TRANG CHỦ ---
  const handleHomeBannerFiles = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    selectedFiles.forEach(file => {
      files.value.home_banner.push(file);
      previews.value.home_banner.push(URL.createObjectURL(file));
    });
    
    // Xóa nội dung input để có thể chọn lại cùng 1 file nếu cần
    event.target.value = ''; 
  };

  const removeExistingBanner = (index) => {
    existingBanners.value.splice(index, 1);
  };

  const removeNewBanner = (index) => {
    files.value.home_banner.splice(index, 1);
    previews.value.home_banner.splice(index, 1);
  };

  const handleLoginBannerFiles = (event) => {
    const selectedFiles = Array.from(event.target.files);
    selectedFiles.forEach(file => {
      files.value.login_bg.push(file);
      previews.value.login_bg.push(URL.createObjectURL(file));
    });
    event.target.value = ''; 
  };

  const removeExistingLoginBanner = (index) => {
    existingLoginBanners.value.splice(index, 1);
  };

  const removeNewLoginBanner = (index) => {
    files.value.login_bg.splice(index, 1);
    previews.value.login_bg.splice(index, 1);
  };

  const saveLoginBanners = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('keyCaiDat', 'login_bg');
    const oldUrls = existingLoginBanners.value.map(item => item.url);
    formData.append('oldImages', JSON.stringify(oldUrls));
    
    files.value.login_bg.forEach(file => {
      // Chú ý: Tên append phải khớp với tên trong uploadLoginSlider.array('login_bg', 5)
      formData.append('login_bg', file); 
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/setting/admin/update_login_bg`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        toastStore.showToast("Cập nhật Slider Đăng nhập thành công!", "success");
        existingLoginBanners.value = Array.isArray(result.data) 
          ? result.data.map((url, i) => ({ id: 'login_' + i + '_' + Date.now(), url })) 
          : [];
        files.value.login_bg = [];
        previews.value.login_bg = [];
      } else {
        toastStore.showToast(result.message || "Lỗi cập nhật slider!", "error");
      }
    } catch (error) {
      console.error("Lỗi cập nhật slider login:", error);
      toastStore.showToast("Lỗi kết nối máy chủ!", "error");
    }
  };

  const saveHomeBanners = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('keyCaiDat', 'home_banner');
    // Ép mảng ảnh cũ còn giữ lại thành JSON
    formData.append('oldImages', JSON.stringify(existingBanners.value));
    
    // Đính kèm các ảnh mới vừa chọn
    files.value.home_banner.forEach(file => {
      formData.append('home_banner', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/setting/admin/update_home_banner`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        toastStore.showToast("Cập nhật toàn bộ Slider thành công!", "success");
        
        // Làm mới dữ liệu
        existingBanners.value = formatBanners(result.data); // <--- Sửa dòng này
        files.value.home_banner = [];
        previews.value.home_banner = [];
      } else {
        toastStore.showToast(result.message || "Lỗi cập nhật slider!", "error");
      }
    } catch (error) {
      console.error("Lỗi cập nhật slider:", error);
      toastStore.showToast("Lỗi kết nối máy chủ!", "error");
    }
  };

  // Khai báo state
  const paymentMethods = ref([]);

  // Hàm tải dữ liệu
  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/setting/admin/payment-methods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        paymentMethods.value = data.data;
      }
    } catch (error) {
      console.error("Lỗi lấy cổng TT:", error);
    }
  };

  // Hàm gạt công tắc Bật/Tắt
  const togglePaymentMethod = async (method) => {
    const newStatus = method.TrangThaiHoatDong === 1 ? 0 : 1;
    const token = localStorage.getItem('token');
    
    // Tạm cập nhật UI cho mượt
    method.TrangThaiHoatDong = newStatus;

    try {
      const res = await fetch(`${API_BASE_URL}/api/setting/admin/payment-methods/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ MaPT: method.MaPT, TrangThaiHoatDong: newStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        toastStore.showToast(`${newStatus ? 'Đã BẬT' : 'Đã TẮT'} ${method.TenPhuongThuc}`, "success");
      } else {
        // Rollback UI nếu lỗi
        method.TrangThaiHoatDong = newStatus === 1 ? 0 : 1; 
        toastStore.showToast("Cập nhật thất bại!", "error");
      }
    } catch (error) {
      method.TrangThaiHoatDong = newStatus === 1 ? 0 : 1; 
      toastStore.showToast("Lỗi mạng!", "error");
    }
  };

  onMounted(() => {
    fetchSettings();
    fetchDropdownData();
    fetchPaymentMethods();
  });
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>