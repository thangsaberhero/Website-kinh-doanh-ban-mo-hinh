<template>
  <div class="provenance-page">
    <TheHeader />

    <div class="hero-section">
      <div class="overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">TRUY XUẤT BLOCKCHAIN</h1>
        <p class="hero-subtitle">XÁC THỰC NGUỒN GỐC - BẢO VỆ GIÁ TRỊ SƯU TẦM</p>
        
        <div class="hero-stats">
          <div class="stat-item"><span>Nodes:</span> 1,204</div>
          <div class="stat-item"><span>Status:</span> Operational</div>
          <div class="stat-item"><span>Network:</span> FigureChain Mainnet</div>
        </div>
      </div>
    </div>

    <div class="main-container">
      <div class="glass-card search-wrapper">
        <div class="search-box">
          <div class="input-group">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="Nhập mã Serial (VD: SN-001-NEN-MELUSINE)..."
            >
            <button @click="handleSearch" :disabled="isLoadingSearch" class="btn-search">
              {{ isLoadingSearch ? 'Đang tìm...' : 'TRUY XUẤT' }}
            </button>
          </div>
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </div>

      <div v-if="!productData && !isLoadingSearch" class="instruction-wrapper">
        <div class="instruction-section">
          <div class="section-title">
            <span>01</span>
            <h3>Cách thức hoạt động</h3>
          </div>
          <div class="step-grid">
            <div class="step-card">
              <div class="step-number">STEP 1</div>
              <h4>Nhập mã Serial</h4>
              <p>Mã được in trên thẻ chứng thực đi kèm hoặc dưới đế của mô hình Figure.</p>
            </div>
            <div class="step-card">
              <div class="step-number">STEP 2</div>
              <h4>Quét Blockchain</h4>
              <p>Hệ thống sẽ đối chiếu mã định danh với sổ cái phi tập trung thời gian thực.</p>
            </div>
            <div class="step-card">
              <div class="step-number">STEP 3</div>
              <h4>Xác minh kết quả</h4>
              <p>Nhận đầy đủ thông tin về ngày sản xuất, chủ sở hữu và lịch sử vận chuyển.</p>
            </div>
          </div>
        </div>

        <div class="security-info">
          <div class="section-title">
            <span>02</span>
            <h3>Bảo mật & Cốt lõi công nghệ</h3>
          </div>
          <div class="security-grid">
            <div class="security-card">
              <div class="security-icon">🛡️</div>
              <div class="security-text">
                <h4>Dữ liệu Immutable (Không thể thay đổi)</h4>
                <p>Mọi thông tin một khi đã được ghi vào mạng lưới Blockchain sẽ tồn tại vĩnh viễn. Không một cá nhân hay tổ chức nào có thể tự ý can thiệp hay sửa đổi.</p>
              </div>
            </div>
            <div class="security-card">
              <div class="security-icon">💎</div>
              <div class="security-text">
                <h4>Định danh độc bản (Digital Twin)</h4>
                <p>Mỗi mô hình vật lý được liên kết với một chữ ký số duy nhất trên Smart Contract, loại bỏ hoàn toàn rủi ro hàng giả trên thị trường sưu tầm.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="productData" class="dashboard-layout">
          
          <div class="dashboard-panel product-panel">
            <div class="panel-header">
              <h3>📦 Thông tin sản phẩm</h3>
            </div>
            <div class="product-card">
              <div class="product-image-container">
                <img
                    v-if="productData.image",
                    :src="`/Images_product/`+productData.image"
                    alt="Product Image"
                    class="product-image"
                >
                <div v-else class="product-image-placeholder">🤖</div>
              </div>
              <h4 class="product-name">{{ productData.name }}</h4>
              <p class="product-manufacturer">{{ productData.manufacturer }}</p>
              
              <div class="detail-group">
                <label>Mã Serial (Định danh)</label>
                <div class="hash-box serial-text">{{ productData.serialNumber }}</div>
              </div>
              
              <div class="detail-group">
                <label>Trạng thái hiện tại</label>
                <div class="status-badge success">
                  <span class="dot"></span> 
                  {{ productData.history?.length ? productData.history[productData.history.length-1].status : 'Đã xác thực' }}
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-panel timeline-panel">
            <div class="panel-header">
              <h3>✈️ Hành Trình Blockchain</h3>
            </div>
            <div class="timeline-container">
              <div v-if="productData.history && productData.history.length > 0" class="timeline">
                <div v-for="(record, index) in productData.history" :key="index" class="timeline-item">
                  <div class="timeline-dot" :class="{ 'latest': index === productData.history.length - 1 }"></div>
                  <div class="timeline-content">
                    <h4 class="timeline-status">{{ record.status }}</h4>
                    <div class="timeline-meta">
                      <span class="timeline-date">🕒 {{ formatDate(record.timestamp) }}</span>
                      <span class="timeline-location">📍 {{ record.location }}</span>
                    </div>
                    <div class="timeline-hash">
                      TX Wallet: <code>{{ formatAddress(record.updater) }}</code>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="no-data">Sản phẩm chưa có lịch sử hành trình.</p>
            </div>
          </div>

          <div class="dashboard-panel map-panel">
            <div class="panel-header">
              <h3>🗺️ Bản Đồ Vị Trí</h3>
            </div>
            <div class="map-container">
              <div class="map-ui-overlay">
                <div class="live-badge">
                  <span class="pulsing-dot"></span> LIVE TRACKING
                </div>
              </div>
              <div id="real-map" style="width: 100%; height: 100%; min-height: 350px; border-radius: 12px; z-index: 1;"></div>
            </div>
          </div>

        </div>
      </transition>

      <div v-if="isAdmin" class="admin-section">
        <div class="admin-header">
          <span class="admin-icon">🛠️</span>
          <h2>Bảng Điều Khiển Admin</h2>
        </div>
        <div class="admin-grid">
          <div class="admin-card">
            <h3>1. Khởi tạo sản phẩm</h3>
            <div class="form-group">
              <input v-model="mintForm.serialNumber" type="text" placeholder="Mã Serial...">
              <input v-model="mintForm.manufacturer" type="text" placeholder="Nhà sản xuất...">
              <button @click="handleMint" :disabled="isLoadingMint" class="btn-mint">
                {{ isLoadingMint ? 'Đang ghi Blockchain...' : 'KÍCH HOẠT (MINT)' }}
              </button>
            </div>
          </div>

          <div class="admin-card">
            <h3>2. Cập nhật hành trình</h3>
            <div class="form-group">
              <input v-model="updateForm.serialNumber" type="text" placeholder="Mã Serial...">
              <input v-model="updateForm.newStatus" type="text" placeholder="Trạng thái (VD: Đang giao)...">
              <input v-model="updateForm.location" type="text" placeholder="Vị trí (VD: Kho Hải Phòng)...">
              <button @click="handleUpdate" :disabled="isLoadingUpdate" class="btn-update">
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
import { ref, computed,nextTick } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; 
import TheHeader from '@/components/TheHeader.vue';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user !== null && authStore.user.Role === 'Quản lý');

const searchQuery = ref('');
const productData = ref(null);
const isLoadingSearch = ref(false);
const errorMsg = ref('');

const mintForm = ref({ serialNumber: '', manufacturer: '' });
const updateForm = ref({ serialNumber: '', newStatus: '', location: '' });
const isLoadingMint = ref(false);
const isLoadingUpdate = ref(false);

let mapInstance = null; // Biến lưu trữ bản đồ

// TỪ ĐIỂN TỌA ĐỘ (MOCK GEOLOCATION)
// Vì Blockchain thường chỉ lưu text ("Kho Hải Phòng"), ta cần map text sang Tọa độ (Lat, Lng)
const coordinateMap = {
  "Kiến An": [20.8001, 106.6331],
  "Hải Phòng": [20.8449, 106.6881],
  "Hà Nội": [21.0285, 105.8542],
  "Hồ Chí Minh": [10.8231, 106.6297],
  "Đà Nẵng": [16.0470, 108.2062]
};
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
      let verifiedManufacturer = response.data.product.TenHSX; 
      
      if (historyData.length > 0) {
        verifiedManufacturer = historyData[0].location; 
      }
      // 1. HIỂN THỊ THÔNG TIN SẢN PHẨM: Dữ liệu này sẽ tự động map lên UI
      productData.value = {
        name: product.TenMH,
        image: product.AnhDaiDien,
        manufacturer: verifiedManufacturer,
        serialNumber: response.data.product.MaVach_Serial,
        history: historyData.map(record => ({
          status: record.status,
          location: record.location,
          timestamp: record.timestamp,
          updater: record.updatedBy
        }))
      };

      // 2. VẼ BẢN ĐỒ: Chờ DOM cập nhật (hiển thị div #real-map) rồi mới vẽ
      await nextTick();
      renderMap(productData.value.history);
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || "Không tìm thấy dữ liệu trên Blockchain";
    console.error("Lỗi:", error);
  } finally { 
    isLoadingSearch.value = false; 
  }
};

// HÀM VẼ BẢN ĐỒ LEAFLET
const renderMap = async (history) => {
  if (!history || history.length === 0) return;

  if (mapInstance) {
    mapInstance.remove();
  }

  // Khởi tạo bản đồ với các tính năng tương tác đầy đủ
  mapInstance = L.map('real-map', {
    scrollWheelZoom: true, // Cho phép zoom bằng chuột
    dragging: true,        
    touchZoom: true        
  }).setView([16.0470, 108.2062], 5); // Vị trí trung tâm ban đầu

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapInstance);

  const latLngs = []; 

  // Dùng vòng lặp for...of thay cho forEach để dùng được await
  for (const [index, record] of history.entries()) {
    // TỰ ĐỘNG LẤY TỌA ĐỘ TỪ ĐỊA CHỈ
    let coords = await getCoordinates(record.location);
    
    // Nếu không tìm thấy, dùng tọa độ mặc định (Hà Nội) để tránh lỗi
    if (!coords) {
      console.warn(`Không tìm thấy tọa độ cho: ${record.location}. Dùng vị trí mặc định.`);
      coords = [21.0285, 105.8542]; 
    }

    latLngs.push(coords);
    const isLatest = index === history.length - 1;
    
    // Giữ nguyên thiết kế Icon của bạn
    const markerHtml = isLatest 
      ? `<div class="map-marker-live"><div class="pulse-ring"></div><div class="pulse-dot"></div></div>`
      : `<div class="map-marker-history"></div>`;
    
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: markerHtml,
      iconSize: isLatest ? [24, 24] : [12, 12],
      iconAnchor: isLatest ? [12, 12] : [6, 6]
    });

    const popupContent = `
      <div class="custom-map-popup">
        <span class="popup-status ${isLatest ? 'text-orange' : 'text-gray'}">${record.status}</span>
        <span class="popup-location">📍 ${record.location}</span>
      </div>
    `;

    const marker = L.marker(coords, { icon: customIcon })
      .addTo(mapInstance)
      .bindPopup(popupContent, {
        closeButton: false,
        offset: [0, isLatest ? -10 : -5]
      });

    if (isLatest) {
      marker.openPopup();
    }
  }

  // TỰ ĐỘNG CĂN CHỈNH BẢN ĐỒ ĐỂ HIỆN TẤT CẢ CÁC ĐIỂM
  if (latLngs.length > 1) {
    // Vẽ đường nối hành trình
    const polyline = L.polyline(latLngs, {
      color: '#ff6b4a',
      weight: 2,
      dashArray: '5, 10',
      opacity: 0.6
    }).addTo(mapInstance);

    // Tự động zoom bản đồ sao cho vừa khít tất cả các điểm tọa độ
    mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  } else if (latLngs.length === 1) {
    // Nếu chỉ có 1 điểm, zoom vào điểm đó
    mapInstance.setView(latLngs[0], 12);
  }
};

const getCoordinates = async (address) => {
  try {
    // Gọi API của OpenStreetMap để tìm tọa độ
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      // Trả về [lat, lon]
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (error) {
    console.error("Lỗi lấy tọa độ:", error);
  }
  return null; // Trả về null nếu không tìm thấy
};


const handleMint = async () => { /* Giữ nguyên logic Admin của bạn */ };
const handleUpdate = async () => { /* Giữ nguyên logic Admin của bạn */ };
const formatDate = (ts) => (ts && ts != 0) ? new Date(Number(ts) * 1000).toLocaleString('vi-VN') : '---';
const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
</script>

<style scoped>
/* =========================================
   BASE STYLES & LAYOUT
========================================= */
.provenance-page {
  background-color: #0d0e12;
  color: #ffffff;
  min-height: 100vh;
  padding-bottom: 100px;
}

.main-container {
  max-width: 1300px; /* Mở rộng max-width để chứa 3 cột */
  margin: -80px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 20;
}

/* =========================================
   HERO SECTION
========================================= */
.hero-section {
  position: relative;
  height: 450px;
  background-image: url('https://images8.alphacoders.com/102/1029194.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(13, 14, 18, 0.4), rgba(13, 14, 18, 1));
}

.hero-content {
  position: relative;
  z-index: 10;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: #ffffff;
  margin: 10px 0;
  text-shadow: 0 0 20px rgba(255, 107, 74, 0.5);
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #ff6b4a;
  letter-spacing: 4px;
  font-weight: 500;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #ccc;
}
.hero-stats span { color: #ff6b4a; font-weight: bold; }

/* =========================================
   SEARCH BOX
========================================= */
.glass-card {
  background: rgba(28, 29, 33, 0.95);
  border: 1px solid rgba(255, 107, 74, 0.15);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  margin-bottom: 40px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.search-box:focus-within {
  border-color: #ff6b4a; /* Đổi viền của cả hộp search thành màu cam */
  box-shadow: 0 0 8px rgba(255, 107, 74, 0.3); /* Thêm hiệu ứng hào quang nhẹ */
  transition: all 0.3s ease;
}

.input-group {
  display: flex;
  align-items: center;
  outline: none;
}

.input-group input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
  padding: 0 15px;
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

.btn-search {
  background: #ff6b4a;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 50px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.3s;
}

.btn-search:hover {
  background: #ff8566;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 107, 74, 0.4);
}
.error-msg { color: #ff4a4a; margin-top: 15px; text-align: center; }

/* =========================================
   INSTRUCTIONS (01 & 02)
========================================= */
.instruction-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  animation: fadeIn 1s ease-in;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.section-title span {
  font-size: 2.5rem;
  font-weight: 900;
  color: rgba(255, 107, 74, 0.2);
  font-style: italic;
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.step-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #222;
  padding: 25px;
  border-radius: 16px;
  transition: 0.3s;
}
.step-card:hover { border-color: #ff6b4a; transform: translateY(-5px); }

.step-number {
  color: #ff6b4a;
  font-size: 0.7rem;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.security-info { margin-top: 60px; }
.security-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.security-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: linear-gradient(135deg, rgba(255, 107, 74, 0.05), rgba(0, 0, 0, 0.2));
  padding: 30px;
  border-radius: 20px;
  border: 1px solid rgba(255, 107, 74, 0.2);
}
.security-icon {
  font-size: 2.5rem;
  background: rgba(255, 107, 74, 0.1);
  padding: 15px;
  border-radius: 16px;
}
.security-text h4 { color: #ff6b4a; margin-bottom: 10px; }
.security-text p { color: #a0a0a0; font-size: 0.95rem; line-height: 1.6; }

/* =========================================
   DASHBOARD RESULTS (3 COLUMNS)
========================================= */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr; /* Chia tỉ lệ 3 cột */
  gap: 25px;
  margin-top: 20px;
}

@media (max-width: 1024px) {
  .dashboard-layout { grid-template-columns: 1fr 1fr; }
  .product-panel { grid-column: span 2; } /* Cột 1 full ngang trên màn vừa */
}

@media (max-width: 768px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .product-panel { grid-column: span 1; }
}

.dashboard-panel {
  background: #15161a;
  border: 1px solid #2a2b30;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  flex-direction: column;
}

.panel-header h3 {
  font-size: 1.1rem;
  color: #fff;
  margin-bottom: 20px;
  border-bottom: 1px dashed #333;
  padding-bottom: 15px;
}

/* Col 1: Product Card */
.product-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  text-align: center;
}

.product-image-placeholder {
  width: 120px;
  height: 120px;
  background: #1c1d21;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  border: 2px dashed #ff6b4a;
  margin-bottom: 10px;
}
.product-image-container {
  width: 180px; /* Tăng kích thước so với placeholder cũ */
  height: 180px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1c1d21;
  border-radius: 16px;
  overflow: hidden; /* Cắt phần ảnh thừa nếu ảnh không vuông */
  border: 1px solid rgba(255, 107, 74, 0.3);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ảnh sẽ lấp đầy khung mà không bị méo */
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.1); /* Hiệu ứng phóng to nhẹ khi di chuột vào */
}

/* Điều chỉnh lại tên sản phẩm cho nổi bật */
.product-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 5px;
  text-transform: uppercase;
}
.product-name { font-size: 1.2rem; font-weight: 700; }
.product-manufacturer { color: #a0a0a0; font-size: 0.9rem; margin-top: -10px; }

.detail-group { width: 100%; text-align: left; margin-top: 15px; }
.detail-group label { font-size: 0.8rem; color: #777; text-transform: uppercase; margin-bottom: 5px; display: block;}

.hash-box {
  background: #0d0e12;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #333;
  font-family: monospace;
  word-break: break-all;
}
.serial-text { color: #ff6b4a; font-weight: bold; font-size: 1.1rem; text-align: center; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 0.95rem;
  width: 100%;
  justify-content: center;
}
.status-badge.success { background: rgba(46, 213, 115, 0.1); color: #2ed573; border: 1px solid rgba(46, 213, 115, 0.3); }
.status-badge .dot { width: 8px; height: 8px; background: currentColor; border-radius: 50%; }

/* Col 2: Timeline */
.timeline-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.timeline-item {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 20px;
  bottom: -25px;
  width: 2px;
  background: #333;
  z-index: 1;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  background: #555;
  border-radius: 50%;
  margin-top: 5px;
  z-index: 2;
  border: 2px solid #15161a;
}
.timeline-dot.latest { background: #ff6b4a; box-shadow: 0 0 10px #ff6b4a; }

.timeline-content {
  flex: 1;
  background: #1c1d21;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #2a2b30;
}

.timeline-status { font-size: 1.1rem; color: #fff; margin-bottom: 8px; }
.timeline-meta { display: flex; flex-direction: column; gap: 5px; font-size: 0.85rem; color: #a0a0a0; margin-bottom: 10px;}
.timeline-date { color: #ff6b4a; }
.timeline-hash { font-size: 0.75rem; background: #0d0e12; padding: 6px 10px; border-radius: 6px; color: #777; }

/* =========================================
   CUSTOM LEAFLET MAP UI
========================================= */
/* Hiệu ứng chuyển động cho đường nét đứt (Lộ trình) */
:deep(.animated-route) {
  stroke-dashoffset: 1000;
  animation: dash-animation 50s linear infinite;
}

@keyframes dash-animation {
  to {
    stroke-dashoffset: 0;
  }
}

/* Marker Lịch sử (Chấm nhỏ xám) */
:deep(.map-marker-history) {
  width: 12px;
  height: 12px;
  background-color: #555;
  border: 2px solid #15161a;
  border-radius: 50%;
  transition: all 0.3s;
}
:deep(.map-marker-history:hover) {
  background-color: #fff;
  transform: scale(1.2);
}

/* Marker Hiện tại (Chấm cam nhịp đập) */
:deep(.map-marker-live) {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.pulse-dot) {
  width: 14px;
  height: 14px;
  background-color: #ff6b4a;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 10px #ff6b4a;
}

:deep(.pulse-ring) {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: transparent;
  border: 2px solid #ff6b4a;
  border-radius: 50%;
  z-index: 1;
  animation: radar-pulse 1.5s ease-out infinite;
}

@keyframes radar-pulse {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* Custom Popup đẹp mắt hợp với Dark Theme */
:deep(.leaflet-popup-content-wrapper) {
  background: #1c1d21 !important; /* Màu nền giống các card khác */
  color: #fff !important;
  border: 1px solid rgba(255, 107, 74, 0.3) !important;
  border-radius: 8px !important;
  padding: 0 !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5) !important;
}

:deep(.leaflet-popup-tip) {
  background: #1c1d21 !important;
  border-bottom: 1px solid rgba(255, 107, 74, 0.3) !important;
  border-right: 1px solid rgba(255, 107, 74, 0.3) !important;
}

:deep(.leaflet-popup-content) {
  margin: 10px 15px !important;
}

/* Nội dung bên trong Popup */
:deep(.custom-map-popup) {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: inherit;
}

:deep(.popup-status) {
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

:deep(.popup-location) {
  font-size: 0.8rem;
  color: #a0a0a0;
}

:deep(.text-orange) { color: #ff6b4a; }
:deep(.text-gray) { color: #d1d1d1; }


.map-ui-overlay { position: absolute; top: 15px; right: 15px; z-index: 10; }
.live-badge {
  background: rgba(255, 107, 74, 0.15);
  border: 1px solid rgba(255, 107, 74, 0.4);
  color: #ff6b4a;
  padding: 6px 12px;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(5px);
}

.pulsing-dot {
  width: 8px;
  height: 8px;
  background-color: #ff6b4a;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.map-background {
  width: 100%;
  height: 100%;
  background-image: url('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.6;
  filter: grayscale(100%) contrast(1.2) brightness(0.4);
  position: absolute;
  inset: 0;
}

.map-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}
.map-point.current {
  background: #ff6b4a;
  box-shadow: 0 0 15px #ff6b4a;
  width: 16px;
  height: 16px;
}

.point-1 { top: 80%; left: 30%; }
.point-2 { top: 60%; left: 50%; }
.point-3 { top: 35%; left: 75%; }

.map-route {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%; z-index: 4;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 74, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 107, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 74, 0); }
}

/* =========================================
   ADMIN SECTION
========================================= */
.admin-section { margin-top: 60px; border-top: 1px solid #333; padding-top: 40px; max-width: 1000px; margin-left: auto; margin-right: auto;}
.admin-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
.admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.admin-card { background: #1c1d21; padding: 25px; border-radius: 20px; border: 1px dashed #444; }
.admin-card input { width: 100%; padding: 12px; margin-bottom: 10px; background: #0d0e12; border: 1px solid #333; border-radius: 8px; color: white; }
.btn-mint, .btn-update { width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; }
.btn-mint { background: #ff6b4a; color: white; }
.btn-update { background: #3b82f6; color: white; }

/* ANIMATION */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from { opacity: 0; transform: translateY(20px); }
</style>