<template>
  <div class="min-h-screen bg-[#0d0e12] text-white pb-24">
    <TheHeader />

    <div class="relative h-[450px] bg-[url('https://images8.alphacoders.com/102/1029194.jpg')] bg-cover bg-center flex items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-b from-[#0d0e12]/40 to-[#0d0e12]"></div>
      <div class="relative z-10 px-4">
        <h1 class="text-4xl md:text-6xl font-black tracking-wider text-white my-2.5 drop-shadow-[0_0_20px_rgba(255,107,74,0.5)] uppercase">
          Truy xuất Blockchain
        </h1>
        <p class="text-sm md:text-lg text-[#ff6b4a] tracking-[4px] font-medium uppercase">
          Xác thực nguồn gốc - Bảo vệ giá trị sưu tầm
        </p>

        <div class="flex justify-center gap-7 mt-5 text-xs md:text-sm text-gray-400">
          <div><span class="text-[#ff6b4a] font-bold">Nodes:</span> 1,204</div>
          <div><span class="text-[#ff6b4a] font-bold">Status:</span> Operational</div>
          <div><span class="text-[#ff6b4a] font-bold">Network:</span> FigureChain Mainnet</div>
        </div>
      </div>
    </div>

    <div class="max-w-[1300px] mx-auto -mt-20 px-5 relative z-20">

      <div class="bg-[#1c1d21]/95 border border-[#ff6b4a]/15 rounded-[24px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-md mb-10 max-w-[900px] mx-auto">
        <div class="border border-transparent rounded-full px-2 py-1 focus-within:border-[#ff6b4a] focus-within:shadow-[0_0_8px_rgba(255,107,74,0.3)] transition-all duration-300">
          <div class="flex items-center">
            <span class="text-xl ml-3">🔍</span>
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Nhập mã Serial (VD: SN-001-NEN-MELUSINE)..."
              class="flex-1 bg-transparent border-none text-white text-base outline-none px-4 focus:outline-none focus:ring-0"
            >
            <button
              @click="handleSearch"
              :disabled="isLoadingSearch"
              class="bg-[#ff6b4a] text-white border-none py-3.5 px-10 rounded-full font-extrabold cursor-pointer transition duration-300 hover:bg-[#ff8566] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,74,0.4)] disabled:opacity-50"
            >
              {{ isLoadingSearch ? 'Đang tìm...' : 'TRUY XUẤT' }}
            </button>
          </div>
        </div>
        <p v-if="errorMsg" class="text-red-500 mt-4 text-center font-medium">{{ errorMsg }}</p>
      </div>

      <div v-if="!productData && !isLoadingSearch" class="max-w-[1000px] mx-auto transition-all">
        <div>
          <div class="flex items-center gap-4 mb-8">
            <span class="text-4xl font-black text-[#ff6b4a]/20 italic">01</span>
            <h3 class="text-xl font-bold">Cách thức hoạt động</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="bg-white/[0.02] border border-zinc-800 p-6 rounded-2xl transition duration-300 hover:border-[#ff6b4a] hover:-translate-y-1">
              <div class="text-[#ff6b4a] text-xs font-black mb-2 tracking-widest">STEP 1</div>
              <h4 class="text-lg font-bold mb-1">Nhập mã Serial</h4>
              <p class="text-gray-400 text-sm leading-relaxed">Mã được in trên thẻ chứng thực đi kèm hoặc dưới đế của mô hình Figure.</p>
            </div>
            <div class="bg-white/[0.02] border border-zinc-800 p-6 rounded-2xl transition duration-300 hover:border-[#ff6b4a] hover:-translate-y-1">
              <div class="text-[#ff6b4a] text-xs font-black mb-2 tracking-widest">STEP 2</div>
              <h4 class="text-lg font-bold mb-1">Quét Blockchain</h4>
              <p class="text-gray-400 text-sm leading-relaxed">Hệ thống sẽ đối chiếu mã định danh với sổ cái phi tập trung thời gian thực.</p>
            </div>
            <div class="bg-white/[0.02] border border-zinc-800 p-6 rounded-2xl transition duration-300 hover:border-[#ff6b4a] hover:-translate-y-1">
              <div class="text-[#ff6b4a] text-xs font-black mb-2 tracking-widest">STEP 3</div>
              <h4 class="text-lg font-bold mb-1">Xác minh kết quả</h4>
              <p class="text-gray-400 text-sm leading-relaxed">Nhận đầy đủ thông tin về ngày sản xuất, chủ sở hữu và lịch sử vận chuyển.</p>
            </div>
          </div>
        </div>

        <div class="mt-16">
          <div class="flex items-center gap-4 mb-8">
            <span class="text-4xl font-black text-[#ff6b4a]/20 italic">02</span>
            <h3 class="text-xl font-bold">Bảo mật & Cốt lõi công nghệ</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex items-start gap-5 bg-gradient-to-br from-[#ff6b4a]/5 to-black/20 p-7 rounded-2xl border border-[#ff6b4a]/20">
              <div class="text-4xl bg-[#ff6b4a]/10 p-4 rounded-2xl shrink-0">🛡️</div>
              <div>
                <h4 class="text-[#ff6b4a] font-bold mb-2 text-lg">Dữ liệu Immutable (Không thể thay đổi)</h4>
                <p class="text-gray-400 text-sm leading-relaxed">Mọi thông tin một khi đã được ghi vào mạng lưới Blockchain sẽ tồn tại vĩnh viễn. Không một cá nhân hay tổ chức nào có thể tự ý can thiệp hay sửa đổi.</p>
              </div>
            </div>
            <div class="flex items-start gap-5 bg-gradient-to-br from-[#ff6b4a]/5 to-black/20 p-7 rounded-2xl border border-[#ff6b4a]/20">
              <div class="text-4xl bg-[#ff6b4a]/10 p-4 rounded-2xl shrink-0">💎</div>
              <div>
                <h4 class="text-[#ff6b4a] font-bold mb-2 text-lg">Định danh độc bản (Digital Twin)</h4>
                <p class="text-gray-400 text-sm leading-relaxed">Mỗi mô hình vật lý được liên kết với một chữ ký số duy nhất trên Smart Contract, loại bỏ hoàn toàn rủi ro hàng giả trên thị trường sưu tầm.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="productData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1.5fr] gap-6 mt-5">

          <div class="bg-[#15161a] border border-[#2a2b30] rounded-2xl p-6 flex flex-col md:col-span-2 lg:col-span-1">
            <div class="border-b border-dashed border-zinc-800 pb-4 mb-5">
              <h3 class="text-base font-bold text-white">📦 Thông tin sản phẩm</h3>
            </div>
            <div class="flex flex-col gap-4 items-center text-center">
              <div class="w-[180px] h-[180px] mb-3 flex items-center justify-center bg-[#1c1d21] rounded-2xl overflow-hidden border border-[#ff6b4a]/30">
                <img
                    v-if="productData.image"
                    :src="`/Images_product/` + productData.image"
                    alt="Product Image"
                    class="w-full h-full object-cover transition duration-300 hover:scale-110"
                >
                <div v-else class="text-6xl">🤖</div>
              </div>
              <h4 class="text-xl font-bold text-white uppercase tracking-wide">{{ productData.name }}</h4>
              <p class="text-gray-400 text-sm -mt-2">{{ productData.manufacturer }}</p>

              <div class="w-full text-left mt-3">
                <label class="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Mã Serial (Định danh)</label>
                <div class="bg-[#0d0e12] p-2.5 px-4 rounded-lg border border-zinc-800 font-mono break-all text-[#ff6b4a] font-bold text-lg text-center">
                  {{ productData.serialNumber }}
                </div>
              </div>

              <div class="w-full text-left">
                <label class="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Trạng thái hiện tại</label>
                <div class="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-full font-bold text-sm w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span class="w-2 h-2 bg-current rounded-full animate-pulse"></span>
                  {{ productData.history?.length ? productData.history[productData.history.length-1].status : 'Đã xác thực' }}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-[#15161a] border border-[#2a2b30] rounded-2xl p-6 flex flex-col">
            <div class="border-b border-dashed border-zinc-800 pb-4 mb-5">
              <h3 class="text-base font-bold text-white">✈️ Hành Trình Blockchain</h3>
            </div>
            <div class="flex-1 overflow-y-auto pr-1 max-h-[500px]">
              <div v-if="productData.history && productData.history.length > 0" class="relative">
                <div v-for="(record, index) in productData.history" :key="index" class="flex gap-4 mb-6 relative group last:mb-0">
                  <div class="absolute left-[5px] top-5 bottom-[-24px] w-0.5 bg-zinc-800 z-0 group-last:hidden"></div>

                  <div
                    class="w-3 h-3 rounded-full mt-1.5 z-10 border-2 border-[#15161a] shrink-0 transition-all duration-300"
                    :class="index === productData.history.length - 1 ? 'bg-[#ff6b4a] shadow-[0_0_10px_#ff6b4a]' : 'bg-zinc-600'"
                  ></div>

                  <div class="flex-1 bg-[#1c1d21] p-4 rounded-xl border border-[#2a2b30]">
                    <h4 class="text-base font-bold text-white mb-1">{{ record.status }}</h4>
                    <div class="flex flex-col gap-1 text-xs text-gray-400 mb-2.5">
                      <span class="text-[#ff6b4a]">🕒 {{ formatDate(record.timestamp) }}</span>
                      <span>📍 {{ record.location }}</span>
                    </div>
                    <div class="text-[11px] bg-[#0d0e12] py-1.5 px-2.5 rounded-md text-zinc-500 font-mono">
                      TX Wallet: <code>{{ formatAddress(record.updater) }}</code>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-center text-gray-500 py-10">Sản phẩm chưa có lịch sử hành trình.</p>
            </div>
          </div>

          <div class="bg-[#15161a] border border-[#2a2b30] rounded-2xl p-6 flex flex-col">
            <div class="border-b border-dashed border-zinc-800 pb-4 mb-5">
              <h3 class="text-base font-bold text-white">🗺️ Bản Đồ Vị Trí</h3>
            </div>
            <div class="relative w-full h-full flex-1 min-h-[350px]">
              <div class="absolute top-4 right-4 z-20">
                <div class="bg-[#ff6b4a]/15 border border-[#ff6b4a]/40 text-[#ff6b4a] py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
                  <span class="w-2 h-2 bg-[#ff6b4a] rounded-full animate-ping"></span> LIVE TRACKING
                </div>
              </div>
              <div id="real-map" class="w-full h-full min-h-[350px] rounded-xl z-10"></div>
            </div>
          </div>

        </div>
      </transition>

      <div v-if="isAdmin" class="mt-16 border-t border-zinc-800 pt-10 max-w-[1000px] mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <span class="text-2xl">🛠️</span>
          <h2 class="text-2xl font-bold">Bảng Điều Khiển Admin</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="bg-[#1c1d21] p-6 rounded-2xl border border-dashed border-zinc-700">
            <h3 class="text-base font-bold mb-4 text-gray-200">1. Khởi tạo sản phẩm (Mint NFT)</h3>
            <div class="space-y-3">
              <input v-model="mintForm.serialNumber" type="text" placeholder="Mã Serial..." class="w-full p-3 bg-[#0d0e12] border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-[#ff6b4a] transition-colors">
              <input v-model="mintForm.manufacturer" type="text" placeholder="Nhà sản xuất..." class="w-full p-3 bg-[#0d0e12] border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-[#ff6b4a] transition-colors">
              <button @click="handleMint" :disabled="isLoadingMint" class="w-full p-3 rounded-lg font-bold cursor-pointer border-none bg-[#ff6b4a] text-white hover:bg-[#ff8566] transition-colors disabled:opacity-50">
                {{ isLoadingMint ? 'Đang ghi Blockchain...' : 'KÍCH HOẠT (MINT)' }}
              </button>
            </div>
          </div>

          <div class="bg-[#1c1d21] p-6 rounded-2xl border border-dashed border-zinc-700">
            <h3 class="text-base font-bold mb-4 text-gray-200">2. Cập nhật hành trình</h3>
            <div class="space-y-3">
              <input v-model="updateForm.serialNumber" type="text" placeholder="Mã Serial..." class="w-full p-3 bg-[#0d0e12] border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-[#ff6b4a] transition-colors">
              <input v-model="updateForm.newStatus" type="text" placeholder="Trạng thái (VD: Đang giao)..." class="w-full p-3 bg-[#0d0e12] border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-[#ff6b4a] transition-colors">
              <input v-model="updateForm.location" type="text" placeholder="Vị trí (VD: Kho Hải Phòng)..." class="w-full p-3 bg-[#0d0e12] border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-[#ff6b4a] transition-colors">
              <button @click="handleUpdate" :disabled="isLoadingUpdate" class="w-full p-3 rounded-lg font-bold cursor-pointer border-none bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50">
                {{ isLoadingUpdate ? 'Đang cập nhật...' : 'CẬP NHẬT TRẠNG THÁI' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import TheHeader from '@/components/TheHeader.vue';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const authStore = useAuthStore();
const route = useRoute(); // Định nghĩa route để lắng nghe URL
const isAdmin = computed(() => authStore.user !== null && authStore.user.Role === 'Quản lý');

const searchQuery = ref('');
const productData = ref(null);
const isLoadingSearch = ref(false);
const errorMsg = ref('');

const mintForm = ref({ serialNumber: '', manufacturer: '' });
const updateForm = ref({ serialNumber: '', newStatus: '', location: '' });
const isLoadingMint = ref(false);
const isLoadingUpdate = ref(false);

let mapInstance = null;

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    errorMsg.value = "Vui lòng nhập mã Serial!";
    return;
  }

  isLoadingSearch.value = true;
  errorMsg.value = '';
  productData.value = null;

  try {
    const response = await axios.get(`http://localhost:3000/api/blockchain/history/${searchQuery.value}`);

    if (response.data.success) {
      const historyData = response.data.history || [];
      const product = response.data.product;
      let verifiedManufacturer = response.data.product?.TenHSX || 'Chưa xác định';

      if (historyData.length > 0) {
        verifiedManufacturer = historyData[0].location;
      }

      productData.value = {
        name: product?.TenMH || 'Sản phẩm Blockchain',
        image: product?.AnhDaiDien,
        manufacturer: verifiedManufacturer,
        serialNumber: product?.MaVach_Serial || searchQuery.value,
        history: historyData.map(record => ({
          status: record.status,
          location: record.location,
          timestamp: record.timestamp,
          updater: record.updatedBy,
          // Ưu tiên truyền tọa độ thực tế từ DB để map vẽ chuẩn tuyệt đối
          latitude: record.latitude || record.lat || null,
          longitude: record.longitude || record.lng || record.lon || null
        }))
      };

      await nextTick();
      renderMap(productData.value.history);
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || "Không tìm thấy dữ liệu trên Blockchain";
    console.error("Lỗi tra cứu:", error);
  } finally {
    isLoadingSearch.value = false;
  }
};

// =========================================================================
// 🛡️ HÀM TỰ ĐỘNG TRÍCH XUẤT MÃ SERIAL TỪ URL & KÍCH HOẠT TRA CỨU
// =========================================================================
const extractAndSearch = () => {
  let serial = '';

  // 1. Kiểm tra Route Params (Ví dụ định dạng router: /blockchain/:serial)
  if (route.params) {
    serial = route.params.serial || route.params.serialNumber || route.params.id;
  }

  // 2. Kiểm tra Route Query (Ví dụ định dạng URL: /blockchain?serial=MÃ_SỐ)
  if (!serial && route.query) {
    serial = route.query.serial || route.query.serialNumber || route.query.search;
  }

  // 3. Dự phòng bằng JavaScript thuần (Đề phòng router của Vue chưa kịp đồng bộ)
  if (!serial) {
    const urlParams = new URLSearchParams(window.location.search);
    serial = urlParams.get('serial') || urlParams.get('serialNumber') || urlParams.get('search');
  }

  // 4. Dự phòng quét phân đoạn cuối cùng của đường dẫn (Ví dụ: localhost:5173/blockchain/SN-001)
  if (!serial) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const lastSeg = pathSegments[pathSegments.length - 1];
      if (!['blockchain', 'provenance', 'history'].includes(lastSeg.toLowerCase())) {
        serial = lastSeg;
      }
    }
  }

  // 5. Dự phòng cho chế độ Hash Routing nếu bạn dùng (Ví dụ: #/blockchain?serial=XYZ hoặc #/blockchain/XYZ)
  if (!serial && window.location.hash) {
    const hashPath = window.location.hash.replace('#', '');
    if (hashPath.includes('?')) {
      const hashParams = new URLSearchParams(hashPath.split('?')[1]);
      serial = hashParams.get('serial') || hashParams.get('serialNumber');
    }
    if (!serial) {
      const hashSegments = hashPath.split('?')[0].split('/').filter(Boolean);
      if (hashSegments.length > 0) {
        const lastHashSeg = hashSegments[hashSegments.length - 1];
        if (!['blockchain', 'provenance', 'history'].includes(lastHashSeg.toLowerCase())) {
          serial = lastHashSeg;
        }
      }
    }
  }

  // Tiến hành điền ô tìm kiếm và kích hoạt hàm tra cứu tự động nếu tìm thấy mã
  if (serial && typeof serial === 'string' && serial.trim()) {
    searchQuery.value = decodeURIComponent(serial.trim());
    handleSearch();
  }
};

// Chạy ngay khi giao diện vừa tải xong
onMounted(() => {
  extractAndSearch();
});

// Lắng nghe liên tục sự thay đổi của URL (Xử lý triệt để lỗi đổi sản phẩm liên tục bị kẹt giao diện)
watch(() => route.params, () => { extractAndSearch(); }, { deep: true });
watch(() => route.query, () => { extractAndSearch(); }, { deep: true });
// =========================================================================

const renderMap = async (history) => {
  if (!history || history.length === 0) return;

  if (mapInstance) {
    mapInstance.off();
    mapInstance.remove();
    mapInstance = null;
  }

  await nextTick();

  mapInstance = L.map('real-map', {
    scrollWheelZoom: true,
    dragging: true,
    touchZoom: true
  }).setView([16.0470, 108.2062], 5);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapInstance);

  const latLngs = [];
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (const [index, record] of history.entries()) {
    let coords;

    if (record.latitude && record.longitude) {
      coords = [parseFloat(record.latitude), parseFloat(record.longitude)];
    } else {
      if (index > 0) await sleep(600);
      coords = await getCoordinates(record.location);
    }

    if (!coords) {
      console.warn(`Không tìm thấy tọa độ cho: ${record.location}. Dùng vị trí dự phòng.`);
      coords = [21.0285 + (index * 0.15), 105.8542 + (index * 0.15)];
    }

    latLngs.push(coords);
    const isLatest = index === history.length - 1;

    const markerHtml = isLatest
      ? `<div class="relative flex items-center justify-center w-6 h-6">
          <span class="absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-50 animate-ping"></span>
          <div class="relative w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-full shadow-lg z-10"></div>
         </div>`
      : `<div class="map-marker-history"></div>`;

    const customIcon = L.divIcon({
      className: 'custom-clear-icon',
      html: markerHtml,
      iconSize: isLatest ? [24, 24] : [12, 12],
      iconAnchor: isLatest ? [12, 12] : [6, 6]
    });

    const popupContent = `
      <div class="custom-map-popup" style="color: #1e293b; font-family: sans-serif; padding: 2px;">
        <b style="color: #f97316; font-size: 13px;">Chặng ${index + 1}: ${record.status}</b><br/>
        <span style="font-size: 11px; color: #64748b; display: block; margin-top: 3px;">📍 Vị trí: ${record.location}</span>
      </div>
    `;

    const marker = L.marker(coords, { icon: customIcon })
      .addTo(mapInstance)
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
    }).addTo(mapInstance);

    mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  } else if (latLngs.length === 1) {
    mapInstance.setView(latLngs[0], 13);
  }

  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize();
    }
  }, 500);
};

const getCoordinates = async (address) => {
  if (!address) return null;

  const MAPBOX_TOKEN = "pk.eyJ1IjoidG9hbjI0IiwiYSI6ImNtcGpsMjk3ZjFubHUycHExZzB1bzl1NmgifQ.Mly4KRU649MW2dy0tDwHgA";

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return [lat, lng];
    }
  } catch (error) {
    console.error("Lỗi tự động định vị Mapbox:", error);
  }
  return null;
};

const handleMint = async () => {
  if (!mintForm.value.serialNumber.trim() || !mintForm.value.manufacturer.trim()) {
    alert("Vui lòng điền đầy đủ mã Serial và Nhà sản xuất!");
    return;
  }
  isLoadingMint.value = true;
  try {
    const response = await axios.post('http://localhost:3000/api/blockchain/mint', {
      serialNumber: mintForm.value.serialNumber,
      manufacturer: mintForm.value.manufacturer
    });
    if (response.data.success) {
      alert("Kích hoạt (Mint) mô hình lên Blockchain thành công!");
      mintForm.value = { serialNumber: '', manufacturer: '' };
    } else {
      alert(response.data.message || "Khởi tạo trên Blockchain thất bại!");
    }
  } catch (error) {
    console.error("Lỗi Mint:", error);
    alert(error.response?.data?.message || "Lỗi kết nối API khởi tạo!");
  } finally {
    isLoadingMint.value = false;
  }
};

const handleUpdate = async () => {
  if (!updateForm.value.serialNumber.trim() || !updateForm.value.newStatus.trim() || !updateForm.value.location.trim()) {
    alert("Vui lòng nhập đầy đủ các thông tin hành trình!");
    return;
  }
  isLoadingUpdate.value = true;
  try {
    const response = await axios.post('http://localhost:3000/api/blockchain/update', {
      serialNumber: updateForm.value.serialNumber,
      status: updateForm.value.newStatus,
      location: updateForm.value.location
    });
    if (response.data.success) {
      alert("Cập nhật hành trình trực tiếp lên Blockchain thành công!");
      if (productData.value && productData.value.serialNumber === updateForm.value.serialNumber) {
        searchQuery.value = updateForm.value.serialNumber;
        await handleSearch();
      }
      updateForm.value = { serialNumber: '', newStatus: '', location: '' };
    } else {
      alert(response.data.message || "Cập nhật hành trình thất bại!");
    }
  } catch (error) {
    console.error("Lỗi cập nhật:", error);
    alert(error.response?.data?.message || "Lỗi kết nối API hành trình!");
  } finally {
    isLoadingUpdate.value = false;
  }
};

const formatDate = (ts) => (ts && ts != 0) ? new Date(Number(ts) * 1000).toLocaleString('vi-VN') : '---';
const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
</script>>

<style scoped>
/* Xóa nền mặc định của Leaflet */
:deep(.custom-clear-icon) {
  background: transparent !important;
  border: none !important;
}

/* Chấm tròn lịch sử cũ (Màu xám đá tối, kích thước 12px, hover to lên) */
:deep(.map-marker-history) {
  width: 12px;
  height: 12px;
  background-color: #475569;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}
:deep(.map-marker-history:hover) {
  transform: scale(1.4);
  background-color: #f97316;
}

/* Popup nền trắng chữ tối */
:deep(.leaflet-popup-content-wrapper) {
  background: #ffffff !important;
  color: #1e293b !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 0 !important;
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.08) !important;
}
:deep(.leaflet-popup-tip) {
  background: #ffffff !important;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05) !important;
}
:deep(.leaflet-popup-content) {
  margin: 8px 12px !important;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from { opacity: 0; transform: translateY(20px); }
</style>
