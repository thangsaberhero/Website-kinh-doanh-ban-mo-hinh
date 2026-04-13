<template>
  <div class="provenance-wrapper">
    <div class="container">
      <h1 class="title">Truy Xuất Nguồn Gốc Blockchain</h1>
      <p class="subtitle">Minh bạch - Chính hãng - An toàn</p>

      <div class="search-box">
        <div class="input-group">
          <i class="search-icon">🔍</i>
          <input 
            v-model="serialNumber" 
            @keyup.enter="fetchProvenance"
            type="text" 
            placeholder="Nhập mã Serial hoặc quét mã QR..." 
          />
          <button @click="fetchProvenance" :disabled="isLoading" class="btn-search">
            {{ isLoading ? 'Đang quét khối...' : 'Truy Xuất' }}
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="error-msg">
        {{ errorMsg }}
      </div>

      <div v-if="productInfo" class="result-card">
        <div class="product-header">
          <div class="product-info">
            <span class="badge">100% Verified on Blockchain</span>
            <h2>{{ productInfo.TenMH }}</h2>
            <p class="brand"><strong>Hãng sản xuất:</strong> {{ productInfo.TenHSX }}</p>
            <p class="serial"><strong>Mã Serial:</strong> {{ productInfo.MaVach_Serial }}</p>
          </div>
        </div>

        <div class="divider"></div>

        <div class="timeline-section">
          <h3>Hành Trình Sản Phẩm</h3>
          <div class="timeline">
            <div v-for="(record, index) in historyData" :key="index" class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDate(record.timestamp) }}</div>
                <h4 class="timeline-status">{{ record.status }}</h4>
                <p class="timeline-location">📍 Vị trí: {{ record.location }}</p>
                <div class="timeline-hash">
                  <span>Ví xác nhận: </span>
                  <a :href="`https://sepolia.etherscan.io/address/${record.updatedBy}`" target="_blank">
                    {{ shortenAddress(record.updatedBy) }}
                  </a>
                </div>
              </div>
            </div>
            <div v-if="historyData.length === 0" class="no-data">
              Chưa có dữ liệu Blockchain cho sản phẩm này.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProvenanceTracking',
  data() {
    return {
      serialNumber: '',
      isLoading: false,
      productInfo: null,
      historyData: [],
      errorMsg: ''
    }
  },
  methods: {
    async fetchProvenance() {
      if (!this.serialNumber.trim()) {
        this.errorMsg = 'Vui lòng nhập mã Serial.';
        return;
      }
      
      this.isLoading = true;
      this.errorMsg = '';
      this.productInfo = null;
      this.historyData = [];

      try {
        const res = await axios.get(`http://localhost:3000/api/blockchain/truy-xuat/${this.serialNumber}`);
        if (res.data.success) {
          this.productInfo = res.data.product;
          this.historyData = res.data.history.reverse(); // Đảo ngược để sự kiện mới nhất lên trên
        }
      } catch (err) {
        this.errorMsg = err.response?.data?.message || 'Lỗi kết nối đến Blockchain. Vui lòng thử lại sau.';
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN');
    },
    shortenAddress(address) {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  }
}
</script>

<style scoped>
.provenance-wrapper {
  background-color: #0d0e12; /* Màu nền web của bạn */
  color: #ffffff;
  min-height: 80vh;
  padding: 50px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  text-align: center;
  color: #ff6b4a; /* Màu cam thương hiệu FigureCollect */
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #a0a0a0;
  margin-bottom: 40px;
}

/* Search Box */
.search-box {
  background: #1c1d21;
  padding: 10px;
  border-radius: 50px;
  border: 1px solid #333;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.input-group {
  display: flex;
  align-items: center;
}

.search-icon {
  margin: 0 15px;
  color: #a0a0a0;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.1rem;
  outline: none;
}

.btn-search {
  background: #ff6b4a;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-search:hover:not(:disabled) {
  background: #e55a3a;
  transform: translateY(-2px);
}

.btn-search:disabled {
  background: #555;
  cursor: not-allowed;
}

.error-msg {
  color: #ff4a4a;
  text-align: center;
  margin-bottom: 20px;
}

/* Result Card */
.result-card {
  background: #1c1d21;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid #2a2a35;
}

.badge {
  background: rgba(255, 107, 74, 0.1);
  color: #ff6b4a;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid #ff6b4a;
  display: inline-block;
  margin-bottom: 15px;
}

.product-info h2 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
}

.brand, .serial {
  color: #c0c0c0;
  margin: 5px 0;
}

.divider {
  height: 1px;
  background: #333;
  margin: 30px 0;
}

/* Timeline */
.timeline-section h3 {
  margin-bottom: 25px;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #333;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-dot {
  position: absolute;
  left: -30px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff6b4a;
  box-shadow: 0 0 10px rgba(255, 107, 74, 0.5);
}

.timeline-content {
  background: #23242a;
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid #333;
}

.timeline-date {
  font-size: 0.85rem;
  color: #ff6b4a;
  margin-bottom: 5px;
}

.timeline-status {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
}

.timeline-location {
  color: #a0a0a0;
  margin: 0 0 8px 0;
  font-size: 0.95rem;
}

.timeline-hash {
  font-size: 0.85rem;
  color: #888;
}

.timeline-hash a {
  color: #4da6ff;
  text-decoration: none;
}

.timeline-hash a:hover {
  text-decoration: underline;
}

.no-data {
  color: #888;
  font-style: italic;
}
</style>