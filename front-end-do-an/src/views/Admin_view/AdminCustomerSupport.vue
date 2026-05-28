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
            <h1 class="text-3xl font-brand font-bold text-slate-900 mb-1 tracking-tight">Hỗ trợ khách hàng</h1>
            <p class="text-slate-500 text-sm font-medium">Theo dõi, kiểm duyệt đánh giá và phản hồi liên hệ từ khách hàng.</p>
          </div>
          
          <div class="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit border border-slate-200">
            <button @click="activeTab = 'reviews'" 
                    :class="activeTab === 'reviews' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500 hover:bg-white/50'"
                    class="px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">star</span> Đánh giá sản phẩm
            </button>
            <button @click="activeTab = 'contacts'" 
                    :class="activeTab === 'contacts' ? 'bg-white text-[#ff8f73] shadow-sm' : 'text-slate-500 hover:bg-white/50'"
                    class="px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative">
              <span class="material-symbols-outlined text-[18px]">mail</span> Tin nhắn liên hệ
              </button>
          </div>
        </div>

        <div v-if="activeTab === 'reviews'" class="space-y-6 animate-[fadeIn_0.2s_ease-out]">           
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">            
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-yellow-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Đánh giá trung bình</p>
                <div class="flex items-end gap-2">
                  <h3 class="text-4xl font-brand font-black text-slate-900">{{ stats.avg }}</h3>
                  <span class="text-slate-400 font-bold mb-1">/ 5</span>
                  <span class="material-symbols-outlined text-amber-400 mb-1" style="font-variation-settings: 'FILL' 1;">star</span>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-rose-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <p class="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">warning</span> Cần xử lý ngay (1-2 Sao)
                </p>
                <h3 class="text-4xl font-brand font-black text-rose-600">{{ stats.bad }}</h3>
            </div>
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-slate-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Mới trong tháng này</p>
                <div class="flex items-end justify-between">
                  <h3 class="text-4xl font-brand font-black text-slate-700">{{ stats.newThisMonth }}</h3>
                  <div class="text-right">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Tỷ lệ phản hồi</p>
                    <p class="text-sm font-bold" :class="stats.replyRateThisMonth >= 80 ? 'text-emerald-500' : 'text-amber-500'">
                      {{ stats.replyRateThisMonth }}%
                    </p>
                  </div>
                </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">             
            <div class="relative w-full md:w-80">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input v-model="searchQuery" type="text" placeholder="Tìm tên khách, sản phẩm, nội dung..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>
            <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select v-model="filterStar" class="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#ff8f73] cursor-pointer">
                  <option value="all">Tất cả số sao</option>
                  <option value="5">5 Sao (Tuyệt vời)</option>
                  <option value="4">4 Sao (Tốt)</option>
                  <option value="3">3 Sao (Bình thường)</option>
                  <option value="1-2">1-2 Sao (Cần xử lý)</option>
              </select>
              <label class="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                  <input type="checkbox" v-model="filterUnreplied" class="rounded text-[#ff8f73] focus:ring-[#ff8f73] w-4 h-4">
                  Chỉ hiện chưa phản hồi
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6">
            <div v-for="review in reviews" :key="review.id" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">    
              <div class="md:w-1/4 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#ff8f73] overflow-hidden border border-slate-200 shadow-inner">
                    <img v-if="review.customerAvatar" :src="review.customerAvatar" class="w-full h-full object-cover">
                    <span v-else>{{ review.customerName ? review.customerName.charAt(0).toUpperCase() : '?' }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 text-sm">{{ review.customerName }}</p>
                    <p class="text-[10px] text-slate-400">{{ review.date }}</p>
                  </div>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sản phẩm đánh giá</p>
                  <p class="font-bold text-slate-700 text-xs line-clamp-2 hover:text-[#ff8f73] cursor-pointer" title="Xem sản phẩm">{{ review.productName }}</p>
                  <p v-if="review.variant" class="text-[10px] text-slate-500 mt-1">Phân loại: {{ review.variant }}</p>
                </div>
              </div>

              <div class="flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex text-amber-400">
                    <span v-for="s in 5" :key="s" class="material-symbols-outlined text-[18px]" :style="{ fontVariationSettings: s <= review.stars ? `'FILL' 1` : `'FILL' 0` }">star</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="review.status === 0" class="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200">Đã Ẩn</span>
                    <button @click="toggleReviewStatus(review)" class="p-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100" :title="review.status === 1 ? 'Ẩn đánh giá' : 'Hiện đánh giá'">
                      <span class="material-symbols-outlined text-[20px]">{{ review.status === 1 ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                </div>
                <p class="text-slate-700 text-sm leading-relaxed mb-4">{{ review.content }}</p>
                <div v-if="review.images && review.images.length > 0" class="flex gap-2 mb-6">
                  <div v-for="(img, idx) in review.images" :key="idx" class="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden cursor-zoom-in hover:border-[#ff8f73]">
                    <img :src="img" @click="zoomedImage = img" class="w-full h-full object-cover">
                  </div>
                </div>
                
                <div class="mt-auto">
                  <div v-if="review.shopReply" class="bg-orange-50/50 border border-orange-100 p-4 rounded-xl relative group">
                    <div class="flex justify-between items-center mb-1">
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-[#ff8f73] text-[16px]" style="font-variation-settings: 'FILL' 1;">admin_panel_settings</span>
                            <span class="text-[10px] font-bold text-[#ff8f73] uppercase tracking-widest">Phản hồi của Shop</span>
                        </div>
                        <span v-if="review.responderName" class="text-[10px] text-red-500 font-bold italic">
                            Xử lý bởi: {{ review.responderName }}
                        </span>
                    </div>
                    <p class="text-xs text-slate-600 font-medium">{{ review.shopReply }}</p>
                    <button @click="openReplyModal(review)" class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#ff8f73] transition-all">
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                  
                  <div v-else class="flex gap-3">
                    <button @click="openReplyModal(review)" class="flex-1 border-2 border-dashed border-slate-200 hover:border-[#ff8f73] hover:bg-[#ff8f73]/5 text-slate-500 hover:text-[#ff8f73] py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined text-[16px]">reply</span> Nhấn để viết phản hồi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="reviews.length > 0" class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-6">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Hiển thị trang {{ currentPage }} / {{ totalPages }} (Tổng {{ totalItems }} đánh giá)
              </p>
              <div class="flex items-center gap-2">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" 
                        class="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:text-slate-500">
                  <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <template v-for="(item, index) in visiblePages" :key="index">
                  <span v-if="item === '...'" class="w-8 h-8 flex items-center justify-center text-slate-400 font-bold tracking-widest">...</span>
                  <button v-else 
                          @click="changePage(item)"
                          class="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm"
                          :class="currentPage === item ? 'bg-[#ff8f73] text-white shadow-lg shadow-[#ff8f73]/20' : 'bg-white border border-slate-200 text-slate-600 hover:text-[#ff8f73]'">
                    {{ item }}
                  </button>
                </template>
                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                        class="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:text-slate-500">
                  <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            <div v-if="reviews.length === 0" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
              <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                  <span class="material-symbols-outlined text-4xl text-slate-300">speaker_notes_off</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-1">Không có đánh giá nào</h3>
              <p class="text-sm text-slate-500">Hiện tại không có đánh giá nào phù hợp với bộ lọc của bạn.</p>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'contacts'" class="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">            
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-rose-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <p class="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">mark_email_unread</span> Chờ xử lý
                </p>
                <h3 class="text-4xl font-brand font-black text-rose-600">{{ contactStats.pending }}</h3>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">mark_email_read</span> Đã giải quyết
                </p>
                <h3 class="text-4xl font-brand font-black text-emerald-600">{{ contactStats.resolved }}</h3>
            </div>

            <div class="bg-white p-6 rounded-2xl border-l-4 border-l-slate-400 border-y border-r border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Tổng tin nhắn nhận được</p>
                <div class="flex items-end justify-between">
                  <h3 class="text-4xl font-brand font-black text-slate-700">{{ contactStats.total }}</h3>
                </div>
            </div>
          </div>           
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">             
            <div class="relative w-full md:w-80">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input v-model="searchContactQuery" type="text" placeholder="Tìm tên, email, SĐT khách hàng..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700">
            </div>
            <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select v-model="filterContactStatus" class="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#ff8f73] cursor-pointer">
                  <option value="all">Tất cả tin nhắn</option>
                  <option value="pending">Chờ xử lý (Cần trả lời)</option>
                  <option value="resolved">Đã xử lý</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div v-for="item in contacts" :key="item.MaLH" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-inner border border-slate-200">
                    {{ item.HoTen.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2 mb-0.5">
                      <h4 class="font-bold text-slate-900 text-sm">{{ item.HoTen }}</h4>
                      <span class="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        {{ formatDate(item.NgayGui) }}
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-500">{{ item.Email }} | {{ item.SDT || 'Không có SĐT' }}</p>
                  </div>
                </div>
                <span v-if="item.TrangThai === 1" class="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 border border-emerald-100 rounded-lg">ĐÃ XỬ LÝ</span>
                <button v-else @click="openEmailModal(item)" class="text-[10px] font-bold text-white bg-[#ff8f73] px-4 py-2 rounded-xl hover:bg-[#ff3d00] flex items-center gap-1 shadow-lg shadow-[#ff8f73]/20 transition-all">
                  <span class="material-symbols-outlined text-[14px]">mail</span> TRẢ LỜI EMAIL
                </button>
              </div>
              <div class="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 italic border border-slate-100">
                "{{ item.NoiDung }}"
              </div>
              <div v-if="item.PhanHoiShop" class="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <p class="text-[10px] font-bold text-[#ff8f73] uppercase tracking-widest mb-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">forward_to_inbox</span> Đã gửi qua Email
                </p>
                <p class="text-xs text-slate-600 font-medium whitespace-pre-line">{{ item.PhanHoiShop }}</p>
              </div>
              <p v-if="item.TenNV_XuLy" class="text-[10px] text-slate-400 text-right italic font-medium">Xử lý bởi: {{ item.TenNV_XuLy }} lúc {{ formatDate(item.NgayXuLy) }}</p>
            </div>
            
            <div v-if="contacts.length === 0" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
              <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <span class="material-symbols-outlined text-4xl text-slate-300">inbox</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-1">Không tìm thấy tin nhắn</h3>
              <p class="text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
            </div>
          </div>
          <div v-if="contacts.length > 0" class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-6">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Hiển thị trang {{ currentContactPage }} / {{ totalContactPages }} (Tổng {{ totalContactItems }} tin nhắn)
            </p>
            <div class="flex items-center gap-2">
              <button @click="changeContactPage(currentContactPage - 1)" :disabled="currentContactPage === 1" 
                      class="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:text-slate-500">
                <span class="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <template v-for="(item, index) in visibleContactPages" :key="index">
                <span v-if="item === '...'" class="w-8 h-8 flex items-center justify-center text-slate-400 font-bold tracking-widest">...</span>
                <button v-else 
                        @click="changeContactPage(item)"
                        class="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm"
                        :class="currentContactPage === item ? 'bg-[#ff8f73] text-white shadow-lg shadow-[#ff8f73]/20' : 'bg-white border border-slate-200 text-slate-600 hover:text-[#ff8f73]'">
                  {{ item }}
                </button>
              </template>
              <button @click="changeContactPage(currentContactPage + 1)" :disabled="currentContactPage === totalContactPages"
                      class="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#ff8f73] transition-all disabled:opacity-50 disabled:hover:text-slate-500">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="isReplyModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#ff8f73]">reply</span> Phản hồi Khách hàng
          </h3>
          <button @click="isReplyModalOpen = false" class="text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ reviewToReply.customerName }} đánh giá:</p>
            <p class="text-sm text-slate-700 italic">"{{ reviewToReply.content }}"</p>
          </div>
          
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nội dung phản hồi</label>
          <textarea v-model="replyContent" rows="4" placeholder="Cảm ơn bạn đã ủng hộ FigureCollect..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 resize-none"></textarea>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button @click="isReplyModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl">Hủy</button>
          <button @click="submitReply" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] rounded-xl shadow-lg shadow-[#ff8f73]/20">Gửi phản hồi</button>
        </div>
      </div>
    </div>

    <div v-if="isEmailModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#ff8f73]">forward_to_inbox</span> Gửi Email Trả Lời
          </h3>
          <button @click="isEmailModalOpen = false" class="text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="p-6">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex flex-col gap-2">
            <div class="flex justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người nhận:</span>
              <span class="text-xs font-bold text-slate-700">{{ contactToReply.HoTen }} &lt;{{ contactToReply.Email }}&gt;</span>
            </div>
            <div class="flex flex-col mt-2 pt-2 border-t border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nội dung thắc mắc:</span>
              <p class="text-sm text-slate-600 italic">"{{ contactToReply.NoiDung }}"</p>
            </div>
          </div>
          
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nội dung Email (Shop gửi đi)</label>
          <textarea v-model="emailContent" rows="6" placeholder="Kính gửi quý khách..." class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#ff8f73] focus:ring-2 focus:ring-[#ff8f73]/20 outline-none transition-all font-medium text-slate-700 resize-none"></textarea>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button @click="isEmailModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl">Hủy</button>
          <button @click="submitEmailReply" :disabled="isSendingEmail" class="px-6 py-2.5 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] rounded-xl shadow-lg shadow-[#ff8f73]/20 flex items-center gap-2 disabled:opacity-70">
              <span v-if="isSendingEmail" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              {{ isSendingEmail ? 'Đang gửi...' : 'Gửi Email ngay' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="zoomedImage" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]" @click="zoomedImage = null">
    <button class="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
      <span class="material-symbols-outlined text-4xl">close</span>
    </button>
    <img :src="zoomedImage" class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" @click.stop>
  </div>
</template>
  
<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue";
  import { useToastStore } from '../../stores/toast';
  import { useLayoutStore } from '../../stores/layout';

  const toastStore = useToastStore();
  const layoutStore = useLayoutStore();

  const searchQuery = ref(''); 
  const filterStar = ref('all');
  const filterUnreplied = ref(false);
  const reviews = ref([]);
  const zoomedImage = ref(null);

  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const itemsPerPage = 5;
  const stats = ref({ avg: 0, bad: 0, newThisMonth: 0, replyRateThisMonth: 0 });
  const contactStats = ref({ total: 0, pending: 0, resolved: 0 });

  const activeTab = ref('reviews'); 
  const contacts = ref([]);
  const searchContactQuery = ref('');
  const filterContactStatus = ref('all');
  
  const currentContactPage = ref(1);
  const totalContactPages = ref(1);
  const totalContactItems = ref(0); 

  const isEmailModalOpen = ref(false);
  const contactToReply = ref(null);
  const emailContent = ref('');
  const isSendingEmail = ref(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const openEmailModal = (contact) => {
      contactToReply.value = contact;
      emailContent.value = ''; 
      isEmailModalOpen.value = true;
  };

  const submitEmailReply = async () => {
    if (!emailContent.value.trim()) {
      toastStore.showToast("Vui lòng nhập nội dung Email", "error");
      return;
    }

    isSendingEmail.value = true;
    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch(`${API_BASE_URL}/api/contact/admin/reply/${contactToReply.value.MaLH}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ replyContent: emailContent.value })
      });

      if (res.ok) {
        toastStore.showToast("Đã gửi Email cho khách hàng", "success");
        isEmailModalOpen.value = false;
        fetchAdminContacts(); 
      } 
      else {
        toastStore.showToast("Gửi Email thất bại", "error");
      }
    } 
    catch (error) {
      console.error(error);
      toastStore.showToast("Lỗi kết nối máy chủ", "error");
    } 
    finally {
      isSendingEmail.value = false;
    }
  };

  const fetchAdminReviews = async () => {
    try {
      const url = new URL(`${API_BASE_URL}/api/reviews/admin/list`);
      url.searchParams.append('page', currentPage.value);
      url.searchParams.append('limit', itemsPerPage);
      url.searchParams.append('search', searchQuery.value);
      url.searchParams.append('star', filterStar.value);
      url.searchParams.append('unreplied', filterUnreplied.value);

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await res.json();

      if (res.ok) {
        reviews.value = result.data.map(item => {
            const dateObj = new Date(item.ThoiGianDG);
            return {
              id: item.MaDG,
              customerName: item.TenKH || 'Khách hàng', 
              customerAvatar: item.AnhDaiDien ? `http://localhost:3000/Images_user/${item.AnhDaiDien}` : null,
              date: `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`,
              productName: item.TenMH,
              variant: item.ChiTietPhanLoai,
              stars: item.SoSao,
              content: item.NoiDung,
              images: item.HinhAnh || [],
              shopReply: item.PhanHoiShop,
              responderName: item.TenNVPhanHoi,
              status: item.TrangThai
            };
        });
        
        totalPages.value = result.pagination.totalPages;
        totalItems.value = result.pagination.totalItems;

        if (result.stats) {
          const s = result.stats;
          const replyRate = s.newThisMonth > 0 ? Math.round((s.repliedThisMonth / s.newThisMonth) * 100) : 0;
          stats.value = {
            avg: s.avgRating || 0,
            bad: s.badReviews || 0,
            newThisMonth: s.newThisMonth || 0,
            replyRateThisMonth: replyRate
          };
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const fetchAdminContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`${API_BASE_URL}/api/contact/admin/list`);
      url.searchParams.append('page', currentContactPage.value);
      url.searchParams.append('limit', itemsPerPage);
      url.searchParams.append('search', searchContactQuery.value);
      url.searchParams.append('status', filterContactStatus.value);

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) {
        contacts.value = result.data;
        totalContactPages.value = result.pagination.totalPages;
        totalContactItems.value = result.pagination.totalItems;

        if (result.stats) {
          contactStats.value = {
            total: result.stats.totalContacts || 0,
            pending: result.stats.pendingContacts || 0,
            resolved: result.stats.resolvedContacts || 0
          };
        }
      }
    } 
    catch (error) {
      console.error("Lỗi tải danh sách liên hệ:", error);
    }
  };

  onMounted(() => {
      fetchAdminReviews();
      fetchAdminContacts();
  });

  watch([filterStar, filterUnreplied], () => {
      currentPage.value = 1;
      fetchAdminReviews();
  });

  let searchTimeout;
  watch(searchQuery, () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
          currentPage.value = 1;
          fetchAdminReviews();
      }, 500);
  });

  watch(filterContactStatus, () => {
      currentContactPage.value = 1;
      fetchAdminContacts();
  });

  let searchContactTimeout;
  watch(searchContactQuery, () => {
      clearTimeout(searchContactTimeout);
      searchContactTimeout = setTimeout(() => {
          currentContactPage.value = 1;
          fetchAdminContacts();
      }, 500);
  });

  const changePage = (page) => {
      currentPage.value = page;
      fetchAdminReviews();
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

  const changeContactPage = (page) => {
    currentContactPage.value = page;
    fetchAdminContacts();
  };
  
  const visibleContactPages = computed(() => {
    const current = currentContactPage.value;
    const total = totalContactPages.value;
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

  const isReplyModalOpen = ref(false);
  const reviewToReply = ref(null);
  const replyContent = ref('');

  const openReplyModal = (review) => {
      reviewToReply.value = review;
      replyContent.value = review.shopReply || '';
      isReplyModalOpen.value = true;
  };

  const submitReply = async () => {
      if (!replyContent.value.trim()) {
          toastStore.showToast("Vui lòng nhập nội dung phản hồi", "error");
          return;
      }

      try {
          const token = localStorage.getItem('token'); 
          const res = await fetch(`${API_BASE_URL}/api/reviews/admin/${reviewToReply.value.id}`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ PhanHoiShop: replyContent.value, TrangThai: null })
          });

          if (res.ok) {
              toastStore.showToast("Đã gửi phản hồi thành công", "success");
              isReplyModalOpen.value = false;
              fetchAdminReviews();
          } 
          else {
              toastStore.showToast("Lỗi khi gửi phản hồi", "error");
          }
      } catch (error) {
          console.error(error);
          toastStore.showToast("Lỗi kết nối máy chủ", "error");
      }
  };

  const toggleReviewStatus = async (review) => {
      const newStatus = review.status === 1 ? 0 : 1;
      try {
          const token = localStorage.getItem('token'); 
          const res = await fetch(`${API_BASE_URL}/api/reviews/admin/${review.id}`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ TrangThai: newStatus, PhanHoiShop: null })
          });

          if (res.ok) {
              review.status = newStatus;
              toastStore.showToast(newStatus === 1 ? "Đã hiện đánh giá" : "Đã ẩn đánh giá", "success");
          }
      } catch (error) {
          console.error(error);
          toastStore.showToast("Lỗi khi thay đổi trạng thái", "error");
      }
  };

  const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ngày ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
</script>
  
<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
</style>