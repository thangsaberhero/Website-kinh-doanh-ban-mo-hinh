<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
    <AdminSidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <AdminHeader />

      <main class="p-6 flex-1 overflow-y-auto space-y-6">

        <div>
          <h1 class="text-2xl font-bold text-slate-900">Quản lý Blockchain</h1>
          <p class="text-sm text-slate-500 mt-1">Kích hoạt định danh mã vạch mô hình và cập nhật hành trình trực tiếp lên Smart Contract.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng số Mô Hình</span>
              <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ totalModels }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-xl">📦</div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đã Mint vĩnh viễn</span>
              <h3 class="text-2xl font-bold text-emerald-600 mt-1">{{ mintedCount }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl">⛓️</div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chờ kích hoạt</span>
              <h3 class="text-2xl font-bold text-amber-600 mt-1">{{ pendingCount }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 text-xl">⏳</div>
          </div>
        </div>

        <section class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">📋 Danh Sách Mô Hình Hệ Thống</h3>
            <div class="relative w-full sm:w-64">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Tìm tên mô hình, mã serial..."
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
              >
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
                  <th class="p-4">STT</th>
                  <th class="p-4">Mã Serial</th>
                  <th class="p-4">Tên Mô Hình Figure</th>
                  <th class="p-4">Giá Bán</th>
                  <th class="p-4 text-center">Trạng Thái Blockchain</th>
                  <th class="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="(item, index) in filteredMohinhList"
                  :key="item.MaVach_Serial"
                  :class="[
                    'cursor-pointer transition-colors hover:bg-slate-50/80',
                    selectedSerial === item.MaVach_Serial ? 'bg-orange-50/50 font-medium' : ''
                  ]"
                  @click="selectModel(item)"
                >
                  <td class="p-4 text-slate-400">{{ index + 1 }}</td>
                  <td class="p-4 font-mono font-bold text-orange-600">
                    {{ item.MaVach_Serial || '---' }}
                  </td>
                  <td class="p-4 max-w-[300px] truncate text-slate-700">{{ item.TenMH }}</td>
                  <td class="p-4 font-medium text-slate-900">{{ formatPrice(item.DonGia) }}</td>
                  <td class="p-4 text-center">
                    <span v-if="Number(item.Is_Minted) === 1" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Đã Mint
                    </span>
                    <span v-else class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                      Chưa Kích Hoạt
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <button class="bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-600 text-xs px-3 py-1.5 rounded-xl shadow-sm transition-colors" @click.stop="quickFill(item)">
                      Xử lý
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="filteredMohinhList.length === 0" class="text-center py-8 text-slate-400 text-sm">
              🚫 Không tìm thấy mô hình nào khớp với dữ liệu tìm kiếm!
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-1">1. Khởi tạo mô hình (Mint NFT)</h3>
            <p class="text-xs text-slate-400 mb-4">Đăng ký thông tin định danh của sản phẩm này lên Blockchain.</p>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-slate-500 block mb-1">Mã Serial Mô Hình</label>
                <input v-model="mintForm.serialNumber" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Mã định danh...">
              </div>
              <div>
                <label class="text-xs font-semibold text-slate-500 block mb-1">Nhà sản xuất / Đối tác (Thông tin định danh)</label>
                <input v-model="mintForm.manufacturer" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Ví dụ: Good Smile Company, Hot Toys...">
              </div>

              <div v-if="isCurrentSerialMinted" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 font-medium animate-fadeIn">
                <span>⚠️ Mã serial này đã được khởi tạo (Mint) vĩnh viễn trên Blockchain rồi!</span>
              </div>

              <button 
                @click="handleMint" 
                :disabled="isCurrentSerialMinted"
                :class="[
                  'w-full font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm',
                  isCurrentSerialMinted 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70 shadow-none border border-slate-200' 
                    : 'text-white bg-emerald-600 hover:bg-emerald-500'
                ]"
              >
                KÍCH HOẠT MINT BLOCKCHAIN
              </button>
            </div>
          </div>

          <div class="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-1">2. Cập nhật vị trí & Hành trình</h3>
            <p class="text-xs text-slate-400 mb-4">Cập nhật tọa độ lưu kho hoặc các điểm trung chuyển thực tế của mô hình.</p>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-slate-500 block mb-1">Mã Serial Đối Tượng</label>
                <input v-model="updateForm.serialNumber" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-orange-500">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-slate-500 block mb-1">Trạng thái mới</label>
                  <input v-model="updateForm.newStatus" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-orange-500" placeholder="Ví dụ: Lưu kho...">
                </div>

                <div class="relative">
                  <label class="text-xs font-semibold text-slate-500 block mb-1">Địa điểm tọa lạc</label>
                  <div class="relative">
                    <input
                      v-model="locationSearchQuery"
                      @input="onLocationInput"
                      @focus="showSuggestions = true"
                      @blur="hideSuggestionsWithDelay"
                      type="text"
                      class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-sm focus:outline-none focus:border-orange-500 transition-all"
                      placeholder="Gõ tìm địa chỉ thật..."
                    >
                    <div v-if="isSearchingLocation" class="absolute right-3 top-3.5 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>

                  <div v-if="showSuggestions && locationSuggestions.length > 0" class="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                    <button
                      v-for="(suggestion, idx) in locationSuggestions"
                      :key="idx"
                      type="button"
                      @click="selectLocation(suggestion)"
                      class="w-full text-left px-4 py-2.5 hover:bg-orange-50/60 transition-colors text-xs flex flex-col gap-0.5"
                    >
                      <span class="font-bold text-slate-800">{{ suggestion.mainText }}</span>
                      <span class="text-slate-500 text-[11px] truncate">📍 {{ suggestion.secondaryText }}</span>
                    </button>
                  </div>
                </div>

              </div>
              <button @click="handleUpdate" class="w-full font-bold py-2.5 rounded-xl text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm text-sm">
                CẬP NHẬT TRẠNG THÁI HÀNH TRÌNH
              </button>
            </div>
          </div>
        </div>

        <section class="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-bold text-slate-900">🔍 Live Tracking Preview</h3>
            <span class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center">
              <div v-if="productData" class="w-full">
                <div class="w-32 h-32 bg-white border border-slate-200 rounded-2xl mx-auto overflow-hidden shadow-sm mb-3">
                  <img
                    v-if="productData && productData.image"
                    :src="getImageUrl(productData.image)"
                    alt="Product Image"
                    class="w-full h-full object-cover product-image"
                  >
                </div>
                <h4 class="text-sm font-bold text-slate-800 px-2 line-clamp-2">{{ productData.name }}</h4>
                <p class="text-xs text-slate-500 mt-0.5 text-center font-semibold">Hãng: {{ productData.manufacturer }}</p>
                <p class="text-xs text-orange-600 mt-1 font-mono font-bold bg-orange-50 py-0.5 px-2 rounded-lg inline-block">{{ productData.serialNumber }}</p>
              </div>
              <div v-else class="text-slate-400 text-xs">Chọn một mô hình để xem thử</div>
            </div>

            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-y-auto max-h-[260px]">
              <div v-if="productData && productData.history && productData.history.length" class="space-y-4 pl-2 relative">
                <div class="flex gap-3 text-xs" v-for="(log, idx) in productData.history" :key="idx">
                  <div class="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0 shadow"></div>
                  <div>
                    <h5 class="font-bold text-slate-800">{{ log.status }}</h5>
                    <p class="text-[11px] text-slate-500">📍 {{ log.location }} - {{ log.timestamp }}</p>
                    <p v-if="log.updater" class="font-mono text-[10px] text-blue-600 mt-0.5 truncate max-w-[180px]">Người cập nhật: {{ log.updater }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-slate-400 text-xs text-center py-4">Chưa có dữ liệu lịch sử hành trình</div>
            </div>

            <div class="bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden min-h-[260px] h-full flex flex-col items-center justify-center">
              <div v-show="mapInstance" id="admin-map" class="w-full h-full absolute inset-0 z-0"></div>
              
              <div v-if="!mapInstance" class="text-slate-400 text-xs text-center p-4 z-10 space-y-2">
                <p class="text-2xl mb-1">📦</p>
                <p class="font-medium text-slate-500 text-sm">Sản phẩm đã khởi tạo định danh thành công</p>
                <p class="text-[11px] text-slate-400">Vui lòng cập nhật "Trạng thái & Hành trình" để kích hoạt bản đồ Live Tracking.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>

    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'p-4 rounded-xl shadow-xl border flex items-start gap-3 text-sm font-medium transition-all duration-300 pointer-events-auto',
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100/40' : '',
            toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100/40' : '',
            toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-100/40' : '',
            toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100/40' : ''
          ]"
        >
          <span class="text-base mt-0.5 shrink-0">
            <span v-if="toast.type === 'success'">✅</span>
            <span v-else-if="toast.type === 'error'">❌</span>
            <span v-else-if="toast.type === 'warning'">⚠️</span>
            <span v-else>ℹ️</span>
          </span>
          <div class="flex-1 leading-snug whitespace-pre-line">{{ toast.message }}</div>
          <button @click="removeToast(toast.id)" class="text-slate-400 hover:text-slate-600 transition-colors px-1">✕</button>
        </div>
      </TransitionGroup>
    </div>

  </div>
</template>

<script>
import AdminSidebar from "../../components/Admin/AdminSidebar.vue";
import AdminHeader from "../../components/Admin/AdminHeader.vue";
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export default {
  name: "AdminBlockchain",
  components: {
    AdminSidebar,
    AdminHeader
  },
  data() {
    return {
      mohinhList: [],
      searchQuery: "",
      selectedSerial: "",
      productData: null,
      mintForm: { serialNumber: "", manufacturer: "" },
      updateForm: { serialNumber: "", newStatus: "", location: "" },
      mapInstance: null,
      toasts: [],

      locationSearchQuery: "",
      locationSuggestions: [],
      isSearchingLocation: false,
      showSuggestions: false,
      debounceTimer: null
    };
  },
  computed: {
    filteredMohinhList() {
      let list = [...this.mohinhList];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        list = list.filter((item) => {
          const matchName = item.TenMH ? item.TenMH.toLowerCase().includes(query) : false;
          const matchSerial = item.MaVach_Serial ? item.MaVach_Serial.toLowerCase().includes(query) : false;
          return matchName || matchSerial;
        });
      }

      // Sắp xếp tự động: Đã mint lên trước (Serial tăng dần), Chưa kích hoạt theo tên (A-Z)
      return list.sort((a, b) => {
        if (Number(a.Is_Minted) !== Number(b.Is_Minted)) {
          return Number(b.Is_Minted) - Number(a.Is_Minted);
        }
        if (Number(a.Is_Minted) === 1) {
          const serialA = a.MaVach_Serial || "";
          const serialB = b.MaVach_Serial || "";
          return serialA.localeCompare(serialB, undefined, { numeric: true, sensitivity: 'base' });
        }
        const nameA = a.TenMH || "";
        const nameB = b.TenMH || "";
        return nameA.localeCompare(nameB, 'vi', { numeric: true, sensitivity: 'base' });
      });
    },
    totalModels() {
      return this.mohinhList.length;
    },
    mintedCount() {
      return this.mohinhList.filter(item => Number(item.Is_Minted) === 1).length;
    },
    pendingCount() {
      return this.mohinhList.filter(item => !item.Is_Minted || Number(item.Is_Minted) === 0).length;
    },
    isCurrentSerialMinted() {
      if (!this.mintForm.serialNumber) return false;
      const model = this.mohinhList.find(
        item => item.MaVach_Serial && item.MaVach_Serial.trim() === this.mintForm.serialNumber.trim()
      );
      return model ? (Number(model.Is_Minted) === 1) : false;
    }
  },
  mounted() {
    this.fetchMohinhFromDB();
  },
  methods: {
    showToast(message, type = 'success', duration = 3500) {
      const id = Date.now();
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    onLocationInput() {
      clearTimeout(this.debounceTimer);
      if (!this.locationSearchQuery.trim()) {
        this.locationSuggestions = [];
        this.updateForm.location = "";
        return;
      }
      this.isSearchingLocation = true;
      this.debounceTimer = setTimeout(() => {
        this.fetchLocationSuggestions();
      }, 500);
    },

    async fetchLocationSuggestions() {
      try {
        const query = encodeURIComponent(this.locationSearchQuery);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${query}`;

        const response = await fetch(url);
        const data = await response.json();

        this.locationSuggestions = data.map(item => {
          const addr = item.address || {};
          const addressPart = addr.road || addr.suburb || addr.quarter || addr.amenity || addr.industrial || "";
          const cityPart = addr.city || addr.town || addr.village || addr.state || "";
          const countryPart = addr.country || "";

          const formattedArray = [addressPart, cityPart, countryPart].filter(str => str.trim() !== "");
          const concatenatedString = formattedArray.join(", ") || item.display_name;

          return {
            mainText: addressPart || cityPart || countryPart || "Địa điểm không rõ",
            secondaryText: concatenatedString
          };
        });
      } catch (error) {
        console.error("Lỗi khi kết nối dữ liệu địa điểm toàn cầu:", error);
      } finally {
        this.isSearchingLocation = false;
      }
    },

    selectLocation(suggestion) {
      this.locationSearchQuery = suggestion.secondaryText;
      this.updateForm.location = suggestion.secondaryText; 
      this.locationSuggestions = [];
      this.showSuggestions = false;
      this.showToast("Đã xác thực và ghép địa chỉ thành công!", "info");
    },

    hideSuggestionsWithDelay() {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 300);
    },

    async fetchMohinhFromDB() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/blockchain/get-serials`);
        if (response.data && response.data.success) {
          this.mohinhList = response.data.data || response.data;

          if (this.mohinhList.length > 0) {
            this.selectModel(this.mohinhList[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API Backend lấy danh sách từ SQL:", error);
        this.showToast("Không thể tải danh sách mô hình từ cơ sở dữ liệu SQL!", "error");
      }
    },

    getImageUrl(image) {
      if (!image) return '';
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      return `http://localhost:3000/Images_product/${image}`;
    },

    async selectModel(product) {
      this.selectedSerial = product.MaVach_Serial;
      let historyData = [];
      let verifiedManufacturer = "Đang cập nhật...";

      try {
        const response = await axios.get(`${API_BASE_URL}/api/blockchain/history/${product.MaVach_Serial}`);
        if (response.data && response.data.success) {
          const chainData = response.data.data || response.data;
          verifiedManufacturer = chainData.manufacturer || chainData.nhaSanXuat || product.TenHSX || "Good Smile Company";

          if (chainData.history && chainData.history.length > 0) {
            historyData = chainData.history;
          } else if (chainData.lichSu && chainData.lichSu.length > 0) {
            historyData = chainData.lichSu;
          }
        }
      } catch (error) {
        console.error("Lỗi hoặc chưa có dữ liệu Blockchain cho mã này:", error);
      }

      this.productData = {
        name: product.TenMH,
        image: product.AnhDaiDien,
        manufacturer: verifiedManufacturer,
        serialNumber: product.MaVach_Serial,
        history: historyData.map(record => ({
          status: record.status || record.trangThai || record.description || "Cập nhật hành trình",
          location: record.location || record.diaDiem || record.locationName || "Không rõ vị trí",
          timestamp: record.timestamp || record.thoiGian || record.time || "Vừa xong",
          updater: record.updatedBy || record.updater || record.txWallet || record.walletAddress || "Hệ thống"
        }))
      };

      await this.$nextTick();
      if (this.productData.history.length > 0) {
        this.renderMap(this.productData.history);
      } else {
        if (this.mapInstance) {
          this.mapInstance.off();
          this.mapInstance.remove();
          this.mapInstance = null;
        }
      }
    },

    async getCoordinates(address) {
      if (!address) return null;
      try {
        // Sử dụng OpenStreetMap Nominatim API đồng bộ với gợi ý tìm kiếm địa điểm công cộng
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
        const response = await fetch(url, {
          headers: { 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        return null;
      } catch (err) {
        console.error("Lỗi Geocoding OpenStreetMap:", err);
        return null;
      }
    },

    async renderMap(history) {
      // 🌟 FIX CHÍNH: Bộ lọc thông minh loại bỏ hoàn toàn các chặng mang tính chất khởi tạo/metadata kĩ thuật
      const validHistory = history.filter(record => {
        if (!record.location || record.location.trim() === "") return false;

        const locText = record.location.toLowerCase();
        const statusText = record.status ? record.status.toLowerCase() : "";

        // Kiểm tra từ khóa rác kĩ thuật và loại bỏ chúng
        if (
          locText.includes("metadata") || 
          locText.includes("không rõ") || 
          locText.includes("bắt đầu sản xuất") || 
          locText.includes("bat dau san xuat")
        ) {
          return false;
        }

        if (
          statusText.includes("khoi tao") || 
          statusText.includes("khởi tạo") || 
          statusText.includes("mint")
        ) {
          return false;
        }

        return true;
      });

      // Nếu không có chặng logistics vật lý nào, dọn bản đồ để đưa giao diện về trạng thái "Chờ hành trình"
      if (!validHistory || validHistory.length === 0) {
        if (this.mapInstance) {
          this.mapInstance.off();
          this.mapInstance.remove();
          this.mapInstance = null;
        }
        return;
      }

      if (this.mapInstance) {
        this.mapInstance.off();
        this.mapInstance.remove();
        this.mapInstance = null;
      }

      await this.$nextTick();

      this.mapInstance = L.map('admin-map', {
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true
      }).setView([16.0470, 108.2062], 5);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.mapInstance);

      const latLngs = [];
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (const [index, record] of validHistory.entries()) {
        if (index > 0) await sleep(600); // Tránh spam API của OpenStreetMap công cộng

        let coords = await this.getCoordinates(record.location);
        if (!coords) {
          coords = [21.0285 + (index * 0.15), 105.8542 + (index * 0.15)];
        }

        latLngs.push(coords);
        const isLatest = index === validHistory.length - 1;

        const markerHtml = isLatest
          ? `<div class="map-marker-live">
              <div class="pulse-ring"></div>
              <div class="live-number-inner">${index + 1}</div>
             </div>`
          : `<div class="map-marker-history">${index + 1}</div>`;

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: markerHtml,
          iconSize: isLatest ? [26, 26] : [22, 22],
          iconAnchor: isLatest ? [13, 13] : [11, 11]
        });

        const popupContent = `
          <div class="custom-map-popup" style="color: #1e293b; font-family: sans-serif; padding: 2px;">
            <b style="color: #f97316; font-size: 13px;">Chặng ${index + 1}: ${record.status}</b><br/>
            <span style="font-size: 11px; color: #64748b;">📍 Vị trí: ${record.location}</span>
          </div>
        `;

        const marker = L.marker(coords, { icon: customIcon })
          .addTo(this.mapInstance)
          .bindPopup(popupContent, {
            closeButton: false,
            offset: [0, isLatest ? -5 : -2]
          });

        if (isLatest) {
          marker.openPopup();
        }
      }

      if (latLngs.length > 1) {
        const polyline = L.polyline(latLngs, {
          color: '#f97316',
          weight: 4,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(this.mapInstance);

        this.mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      } else if (latLngs.length === 1) {
        this.mapInstance.setView(latLngs[0], 13);
      }

      setTimeout(() => {
        if (this.mapInstance) {
          this.mapInstance.invalidateSize();
        }
      }, 500);
    },

    quickFill(model) {
      this.mintForm.serialNumber = model.MaVach_Serial;
      this.mintForm.manufacturer = model.TenHSX || "Good Smile Company";
      this.updateForm.serialNumber = model.MaVach_Serial;
      this.selectModel(model);
      this.showToast(`Đã nạp nhanh mã ${model.MaVach_Serial} vào các form xử lý!`, "info");
    },
    formatPrice(value) {
      if(!value) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    },
    async handleMint() {
      if (!this.mintForm.serialNumber || !this.mintForm.manufacturer) {
        this.showToast("Vui lòng điền mã vạch và thông tin nhà sản xuất!", "warning");
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/api/blockchain/mint`, {
          serialNumber: this.mintForm.serialNumber,
          manufacturer: this.mintForm.manufacturer
        });
        if (response.data.success) {
          this.showToast(`Mint Blockchain thành công!\nHash: ${response.data.hash}`, "success", 5000);
          this.mintForm = { serialNumber: '', manufacturer: '' };
          this.fetchMohinhFromDB();
        }
      } catch (error) {
        this.showToast("Lỗi kích hoạt Blockchain: " + (error.response?.data?.message || error.message), "error");
      }
    },
    async handleUpdate() {
      if (!this.updateForm.serialNumber || !this.updateForm.newStatus || !this.updateForm.location) {
        this.showToast("Vui lòng nhập đầy đủ thông tin hành trình của mô hình!", "warning");
        return;
      }
      try {
        const response = await axios.post('${API_BASE_URL}/api/blockchain/update', {
          serialNumber: this.updateForm.serialNumber,
          newStatus: this.updateForm.newStatus,
          location: this.updateForm.location
        });
        if (response.data.success) {
          this.showToast(`Cập nhật vị trí lên Smart Contract thành công!\nHash: ${response.data.hash}`, "success", 5000);

          this.updateForm = { serialNumber: '', newStatus: '', location: '' };
          this.locationSearchQuery = ""; 

          const currentProduct = this.mohinhList.find(p => p.MaVach_Serial === this.selectedSerial);
          if (currentProduct) this.selectModel(currentProduct);
        }
      } catch (error) {
        this.showToast("Cập nhật thất bại: " + (error.response?.data?.message || error.message), "error");
      }
    }
  }
};
</script>

<style scoped>
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}

:deep(.custom-div-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.map-marker-history) {
  width: 22px;
  height: 22px;
  background-color: #1e293b;
  border: 2px solid #ffffff;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
}

:deep(.map-marker-live) {
  position: relative;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.live-number-inner) {
  width: 22px;
  height: 22px;
  background-color: #ef4444; 
  border: 2px solid #ffffff;
  color: white;
  font-size: 11px;
  font-weight: 800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}
:deep(.pulse-ring) {
  border: 3px solid #ef4444;
  border-radius: 50%;
  height: 32px;
  width: 32px;
  position: absolute;
  top: -3px;
  left: -3px;
  animation: mapMarkerPulse-data 1.6s ease-out infinite;
  opacity: 0;
  z-index: 1;
}

@keyframes mapMarkerPulse-data {
  0% { transform: scale(0.4); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}
</style>