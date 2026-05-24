<template>
  <div @click="activeMenuId = null" class="bg-slate-100 min-h-screen font-body flex w-full text-slate-800">
    <AdminSideBar :is-collapsed="isSidebarCollapsed" />
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
      <AdminHeader @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />
      <main class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        
        <section class="flex flex-col md:flex-row justify-between items-end gap-4 relative z-20">
          <div>
            <h2 class="text-3xl font-headline font-bold text-slate-900 tracking-tight">Tổng quan Hệ thống</h2>
            <p class="text-slate-500 mt-1 text-sm font-medium">Dữ liệu được cập nhật mới nhất lúc 14:30 hôm nay.</p>
          </div>
          
          <div class="flex gap-3">
            <div class="relative">
              <button @click.stop="isDropdownOpen = !isDropdownOpen" class="flex items-center gap-2 bg-white text-slate-900 text-xs font-bold px-4 py-2.5 border border-slate-200 border-b-2 border-b-[#ff8f73] rounded shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                <span class="material-symbols-outlined text-[16px] text-[#ff8f73]">calendar_today</span>
                {{ currentFilterLabel }}
                <span class="material-symbols-outlined text-[18px] text-slate-400 transition-transform" :class="isDropdownOpen ? 'rotate-180' : ''">expand_more</span>
              </button>

              <div v-show="isDropdownOpen" class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 transition-all duration-200 overflow-hidden z-50">
                <ul class="py-1 text-sm text-slate-700">
                  <li><a href="#" @click.prevent="isDropdownOpen = false" class="block px-4 py-2 hover:bg-slate-50 hover:text-[#ff8f73]">Hôm nay</a></li>
                  <li><a href="#" @click.prevent="isDropdownOpen = false" class="block px-4 py-2 hover:bg-slate-50 hover:text-[#ff8f73]">7 ngày qua</a></li>
                  <li><a href="#" @click.prevent="isDropdownOpen = false" class="block px-4 py-2 bg-[#ff8f73]/10 text-[#ff8f73] font-bold">30 ngày qua</a></li>
                  <li><a href="#" @click.prevent="isDropdownOpen = false" class="block px-4 py-2 hover:bg-slate-50 hover:text-[#ff8f73]">Tháng này</a></li>
                  <li class="border-t border-slate-100 mt-1">
                    <a href="#" @click.prevent="openCustomDatePicker" class="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-slate-500 font-medium">
                      Tùy chỉnh...
                      <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <button @click="exportExcelReport" class="flex items-center gap-2 bg-white text-slate-500 text-xs font-bold px-4 py-2.5 border border-slate-200 rounded shadow-sm hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[20px]" :class="{'animate-bounce': isExporting}">file_download</span>
              {{ isExporting ? 'Đang tạo file...' : 'Xuất báo cáo' }}
            </button>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">payments</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Tổng doanh thu</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-headline font-bold text-slate-900">{{ totalRevenue }}B</h3>
                <span class="text-xs text-[#ff8f73] font-bold">+12.5%</span>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50">
              <div class="h-full bg-[#ff8f73] w-2/3 rounded-r-full"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">shopping_cart</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Đơn hàng mới</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-headline font-bold text-slate-900">{{ newOrders }}</h3>
                <span class="text-xs text-purple-500 font-bold">+5.2%</span>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50">
              <div class="h-full bg-purple-400 w-1/2 rounded-r-full"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">person_add</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Người dùng mới</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-headline font-bold text-slate-900">{{ newUsers }}</h3>
                <span class="text-xs text-emerald-500 font-bold">+18.0%</span>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50">
              <div class="h-full bg-emerald-400 w-3/4 rounded-r-full"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
            <div class="absolute -right-4 -top-4 text-slate-50 group-hover:text-slate-100 transition-colors z-0">
              <span class="material-symbols-outlined text-8xl" style="font-variation-settings: 'FILL' 1;">cancel</span>
            </div>
            <div class="relative z-10">
              <p class="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">Tỷ lệ hủy</p>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-headline font-bold text-slate-900">{{ cancelRate }}%</h3>
                <span class="text-xs text-rose-500 font-bold">-0.8%</span>
              </div>
            </div>
            <div class="absolute bottom-0 left-0 h-1.5 w-full bg-slate-50">
              <div class="h-full bg-rose-400 w-1/4 rounded-r-full"></div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-8 rounded-xl shadow-md border border-slate-100 flex flex-col">
            <div class="flex justify-between items-start mb-8">
              <div>
                <h4 class="text-lg font-headline font-bold text-slate-900">Xu hướng doanh thu</h4>
                <p class="text-[11px] text-slate-400 uppercase tracking-widest mt-1 font-medium">Biểu đồ 30 ngày qua (Đơn vị: Triệu VNĐ)</p>
              </div>
              <div class="flex items-center gap-4 text-xs font-bold text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 bg-[#ff8f73] rounded-full shadow-[0_0_8px_#ff8f73]"></span>
                  <span>THÁNG NÀY</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 bg-slate-200 rounded-full"></span>
                  <span>THÁNG TRƯỚC</span>
                </div>
              </div>
            </div>
            <div class="flex-1 relative min-h-[220px] w-full">
              <div class="absolute inset-0 flex flex-col justify-between z-0 pb-6">
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
                <div class="border-t border-slate-100 border-dashed w-full h-0"></div>
              </div>
              <svg class="absolute bottom-6 left-0 w-full h-[calc(100%-24px)] z-10" preserveAspectRatio="none" viewBox="0 0 1000 100">
                <defs>
                  <linearGradient id="chartGradientLight" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#ff8f73" stop-opacity="0.25"></stop>
                    <stop offset="100%" stop-color="#ff8f73" stop-opacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0 80 Q 100 70, 200 85 T 400 60 T 600 75 T 800 40 T 1000 50 L 1000 100 L 0 100 Z" fill="url(#chartGradientLight)"></path>
                <path d="M0 80 Q 100 70, 200 85 T 400 60 T 600 75 T 800 40 T 1000 50" fill="none" stroke="#ff8f73" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linecap="round"></path>
              </svg>
              <div class="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] text-slate-400 font-bold z-10">
                <span>01 TH04</span><span>07 TH04</span><span>14 TH04</span><span>21 TH04</span><span>28 TH04</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-8 rounded-xl shadow-md border border-slate-100 flex flex-col">
            <h4 class="text-lg font-headline font-bold text-slate-900 mb-1">Dòng sản phẩm</h4>
            <p class="text-[11px] text-slate-400 uppercase tracking-widest mb-8 font-medium">Phân bố bán chạy nhất</p>
            <div class="flex flex-col items-center justify-center space-y-8 mt-2">
              <div class="relative w-44 h-44">
                <div class="absolute inset-0 rounded-full border-[14px] border-slate-100"></div>
                <div class="absolute inset-0 rounded-full border-[14px] border-[#ff8f73] border-t-transparent border-l-transparent transition-transform" style="transform: rotate(45deg);"></div>
                <div class="absolute inset-0 rounded-full border-[14px] border-purple-400 border-b-transparent border-r-transparent transition-transform" style="transform: rotate(-30deg);"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-[14px] shadow-inner">
                  <span class="text-3xl font-headline font-bold text-slate-900">2.4k</span>
                  <span class="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Vật phẩm</span>
                </div>
              </div>
              <div class="w-full space-y-4">
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <span class="w-3 h-3 bg-[#ff8f73] rounded-sm group-hover:scale-110 transition-transform"></span>
                    <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900">Gundam Series</span>
                  </div>
                  <span class="text-sm font-bold text-slate-900">45%</span>
                </div>
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <span class="w-3 h-3 bg-purple-400 rounded-sm group-hover:scale-110 transition-transform"></span>
                    <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900">Action Figure</span>
                  </div>
                  <span class="text-sm font-bold text-slate-900">32%</span>
                </div>
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <span class="w-3 h-3 bg-slate-200 rounded-sm group-hover:scale-110 transition-transform"></span>
                    <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900">Mecha & Others</span>
                  </div>
                  <span class="text-sm font-bold text-slate-900">23%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col h-72">
            <h4 class="text-sm font-headline font-bold text-slate-900 mb-4">Top Sản phẩm bán chạy</h4>
            <div class="flex-1 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
              <span class="text-slate-400 font-medium text-xs">Khu vực Bar Chart (Ngang)</span>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col h-72">
            <h4 class="text-sm font-headline font-bold text-slate-900 mb-4">Doanh thu theo Thương hiệu</h4>
            <div class="flex-1 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
              <span class="text-slate-400 font-medium text-xs">Khu vực Doughnut Chart</span>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col h-72">
            <h4 class="text-sm font-headline font-bold text-slate-900 mb-4">Trạng thái Kho / Đơn hàng</h4>
            <div class="flex-1 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
              <span class="text-slate-400 font-medium text-xs">Khu vực Radar/Polar Chart</span>
            </div>
          </div>
        </section>

        <section class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h4 class="text-lg font-headline font-bold text-slate-900">Các đơn hàng gần đây</h4>
              <p class="text-[11px] text-slate-400 uppercase tracking-widest mt-1 font-medium">10 giao dịch mới nhất trong hệ thống</p>
            </div>
            <RouterLink to="/admin/orders" class="text-[#ff8f73] hover:text-white bg-white hover:bg-[#ff8f73] text-xs font-bold border border-[#ff8f73]/30 px-5 py-2 rounded transition-all inline-block">
              XEM TẤT CẢ
            </RouterLink>
          </div>
          
          <div class="overflow-x-auto min-h-[250px]"> <table class="w-full text-left border-collapse">
              <thead class="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th class="px-8 py-4 font-semibold w-32">Mã đơn</th>
                  <th class="px-8 py-4 font-semibold w-48">Khách hàng</th>
                  <th class="px-8 py-4 font-semibold text-center w-40">Trạng thái</th>
                  <th class="px-8 py-4 font-semibold text-right w-40">Tổng tiền</th>
                  <th class="px-8 py-4 font-semibold text-center w-16">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                
                <tr v-for="(order, index) in recentOrders" :key="order.id" class="hover:bg-slate-50 transition-colors group">
                  <td class="px-8 py-5 font-headline font-bold text-sm text-slate-900">#{{ order.id }}</td>
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600">
                        {{ order.avatarText }}
                      </div>
                      <div>
                        <p class="text-sm font-bold text-slate-900">{{ order.customerName }}</p>
                        <p class="text-[11px] text-slate-500">{{ order.email }}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-8 py-5 text-center">
                    <span v-if="order.status === 'ĐÃ GIAO'" class="bg-purple-50 text-purple-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-purple-100">ĐÃ GIAO</span>
                    <span v-else-if="order.status === 'ĐANG XỬ LÝ'" class="bg-[#ff8f73]/10 text-[#e65c3b] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#ff8f73]/20">ĐANG XỬ LÝ</span>
                    <span v-else-if="order.status === 'ĐÃ HỦY'" class="bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-full border border-rose-100">ĐÃ HỦY</span>
                  </td>
                  
                  <td class="px-8 py-5 text-right font-headline font-bold text-sm text-slate-900">{{ order.total }}</td>
                  
                  <td class="px-8 py-5 text-center relative">
                    <button 
                      @click.stop="toggleMenu(order.id)" 
                      class="text-slate-400 hover:text-[#ff8f73] p-1 rounded transition-colors focus:outline-none focus:bg-slate-100"
                    >
                      <span class="material-symbols-outlined text-lg">more_vert</span>
                    </button>

                    <div 
                      v-show="activeMenuId === order.id"
                      class="absolute right-8 w-40 bg-white rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-slate-100 py-1 z-50 text-left overflow-hidden"
                      :class="index >= recentOrders.length - 2 ? 'bottom-8' : 'top-10'"
                    >
                      <button @click="viewOrder(order.id); activeMenuId = null" class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">visibility</span> Xem chi tiết
                      </button>
                      <button class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">edit_document</span> Cập nhật
                      </button>
                      <button class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ff8f73] flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">print</span> In hóa đơn
                      </button>
                      <div class="border-t border-slate-100 my-1"></div>
                      <button class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2">
                        <span class="material-symbols-outlined text-[16px]">cancel</span> Hủy đơn
                      </button>
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </section>
    
        <footer class="pt-4 border-t border-slate-200 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="font-body text-[11px] uppercase tracking-widest text-slate-400">© 2024 FigureCollect. Phiên bản 2.4.0-Technical. Trạng thái hệ thống: Hoạt động bình thường.</p>
          <div class="flex gap-6">
            <a href="#" class="font-body text-[11px] uppercase tracking-widest text-slate-400 hover:text-[#ff8f73] font-bold transition-colors">Tài liệu kỹ thuật</a>
            <a href="#" class="font-body text-[11px] uppercase tracking-widest text-slate-400 hover:text-[#ff8f73] font-bold transition-colors">Nhật ký thay đổi</a>
          </div>
        </footer>

      </main>
    </div>
  </div>

  <div v-if="isCustomModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white p-6 rounded-xl shadow-xl w-96">
      <h3 class="text-lg font-bold text-slate-900 mb-4">Tùy chỉnh thời gian</h3>
      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Từ ngày</label>
          <input type="date" v-model="customStartDate" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Đến ngày</label>
          <input type="date" v-model="customEndDate" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ff8f73] focus:ring-1 focus:ring-[#ff8f73] outline-none">
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button @click="isCustomModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Hủy</button>
        <button @click="applyCustomDate" class="px-4 py-2 text-sm font-bold text-white bg-[#ff8f73] hover:bg-[#ff3d00] rounded-lg">Áp dụng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import AdminSideBar from "../../components/Admin/AdminSidebar.vue";
  import AdminHeader from "../../components/Admin/AdminHeader.vue"; 

  const isSidebarCollapsed = ref(false);
  const isCustomModalOpen = ref(false);
  const customStartDate = ref('');
  const customEndDate = ref('');

  // --- Các biến cho menu thời gian ---
  const isDropdownOpen = ref(false);
  const currentFilterLabel = ref('30 NGÀY QUA');
  const currentFilterValue = ref('30d');


  const isExporting = ref(false);

  const exportExcelReport = async () => {
    isExporting.value = true;
    try {
      // 1. Gọi API (Nhớ thêm Token nếu Route của bạn cần xác thực Admin)
      const response = await fetch('http://localhost:3000/api/thong_ke/admin/export-excel', {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Bỏ comment nếu có check token
        }
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tải file từ Server");
      }

      // 2. Chuyển dữ liệu binary trả về thành dạng Blob
      const blob = await response.blob();
      
      // 3. Tạo một URL ảo cho cục Blob này
      const url = window.URL.createObjectURL(blob);
      
      // 4. Tạo 1 thẻ <a> ẩn, gán link và kích hoạt click để tải xuống
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_FigureCollect_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // 5. Dọn dẹp
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Không thể xuất báo cáo lúc này!");
    } finally {
      isExporting.value = false;
    }
  };
  // --- Hàm mô phỏng lấy dữ liệu ---
  const fetchDashboardData = (range) => {
    console.log("Đang tải dữ liệu mới cho mốc thời gian:", range);
    // Sau này  sẽ gọi API ở đây 
  };

  const openCustomDatePicker = () => {
    isDropdownOpen.value = false; // Đóng cái menu cũ đi
    isCustomModalOpen.value = true; // Hiện modal lịch lên
  };

  const applyCustomDate = () => {
    if (customStartDate.value && customEndDate.value) {
      const start = customStartDate.value.split('-').reverse().join('/');
      const end = customEndDate.value.split('-').reverse().join('/');
      
      // Cập nhật chữ trên nút
      currentFilterLabel.value = `${start} - ${end}`; 
      currentFilterValue.value = `${customStartDate.value}_${customEndDate.value}`;
      
      isCustomModalOpen.value = false;
      fetchDashboardData(currentFilterValue.value);
    } else {
      alert("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc!");
    }
  };
  // Biến lưu ID của dòng đang mở menu. Nếu null nghĩa là không có menu nào mở.
  const activeMenuId = ref(null);
  const toggleMenu = (id) => {
    // Nếu bấm vào chính dòng đang mở -> đóng lại. Nếu bấm dòng khác -> mở dòng đó lên.
    if (activeMenuId.value === id) {
      activeMenuId.value = null;
    } else {
      activeMenuId.value = id;
    }
  };

  // Hàm mô phỏng chức năng khi bấm "Xem chi tiết"
  const viewOrder = (id) => {
    console.log("Đang chuyển hướng đến trang chi tiết của đơn hàng: ", id);
    // router.push(`/admin/orders/${id}`);
  };

  // --- DỮ LIỆU ĐƠN HÀNG MÔ PHỎNG ---
  // Chuyển HTML tĩnh thành mảng dữ liệu để code gọn gàng và dễ cập nhật
  const recentOrders = ref([
    { id: 'FC-9021', avatarText: 'TA', customerName: 'Trần Anh', email: 'trananh@email.com', status: 'ĐÃ GIAO', total: '2.450.000đ' },
    { id: 'FC-9022', avatarText: 'LV', customerName: 'Lê Văn Vũ', email: 'levvu@email.com', status: 'ĐANG XỬ LÝ', total: '5.120.000đ' },
    { id: 'FC-9023', avatarText: 'HH', customerName: 'Hoàng Hà', email: 'hha@email.com', status: 'ĐÃ HỦY', total: '890.000đ' },
    { id: 'FC-9024', avatarText: 'MN', customerName: 'Minh Nhật', email: 'mnhat@email.com', status: 'ĐÃ GIAO', total: '12.600.000đ' },
  ]);

  // Khai báo các biến lưu trữ giá trị của 4 thẻ thống kê (ban đầu bằng 0)
  const totalRevenue = ref(0);
  const newOrders = ref(0);
  const newUsers = ref(0);
  const cancelRate = ref(0);

  /**
   * Hàm tạo hiệu ứng đếm số
   * @param {Ref} targetRef - Biến ref cần cập nhật
   * @param {Number} endValue - Giá trị đích cần đếm tới
   * @param {Number} duration - Thời gian chạy hiệu ứng (ms), vd: 2000 = 2 giây
   * @param {Number} decimals - Số chữ số thập phân (mặc định = 0)
   */
  const animateNumber = (targetRef, endValue, duration = 2000, decimals = 0) => {
    let startTimestamp = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Hiệu ứng Easing (easeOutExpo): Chạy nhanh lúc đầu, chậm dần về cuối
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (endValue - startValue) * ease;

      // Cập nhật giá trị với số thập phân tương ứng
      targetRef.value = currentValue.toFixed(decimals);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  };

  // Gọi hiệu ứng khi trang vừa load xong
  onMounted(() => {
    // Chạy hiệu ứng cho từng thông số
    // (Biến ref, Số đích, Thời gian ms, Số chữ số thập phân)
    animateNumber(totalRevenue, 1.284, 2000, 3); // Doanh thu: 1.284 (3 số lẻ)
    animateNumber(newOrders, 842, 2000, 0);      // Đơn hàng: 842 (0 số lẻ)
    animateNumber(newUsers, 156, 2000, 0);       // Người dùng: 156 (0 số lẻ)
    animateNumber(cancelRate, 2.4, 2000, 1);     // Tỷ lệ hủy: 2.4 (1 số lẻ)
  });
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>