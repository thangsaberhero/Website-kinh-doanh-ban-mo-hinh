<template>
  <div class="bg-background text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex flex-col font-body">
    <TheHeader />

    <main v-if="product" class="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div class="lg:col-span-7 space-y-6">
          <div ref="imageContainer" class="relative bg-surface-container-low rounded-lg overflow-hidden group border border-outline-variant/20"
              @mousemove="handleMouseMove"
              @mouseenter="isZooming = true"
              @mouseleave="isZooming = false"
              @click="openLightbox(allImages.indexOf(mainImage))"
          >
            <div class="absolute top-4 left-4 z-10 flex gap-2">
              <span class="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                {{ product.LoaiHinhBan }}
              </span>
              <span class="bg-surface-bright text-on-surface text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm border border-outline-variant/30">
                {{ product.TrangThai }}
              </span>
            </div>

            <img :src="`http://localhost:3000/Images_product/${mainImage}` " class="w-full aspect-[4/5] object-cover transform transition-transform duration-700 drop-shadow-2xl"/>

            <div v-show="isZooming"
              class="absolute z-30 pointer-events-none border-2 border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl bg-surface-container-low"
              :style="{
                width: '240px',          /* Chiều rộng khung lúp */
                height: '240px',         /* Chiều cao khung lúp */
                left: `${zoomPosition.x}%`, /* Chạy theo tọa độ X của chuột */
                top: `${zoomPosition.y}%`,  /* Chạy theo tọa độ Y của chuột */
                transform: 'translate(-50%, -50%)', /* Căn giữa khung lúp vào con chuột */
                backgroundImage: `url(http://localhost:3000/Images_product/${mainImage})`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundSize: '400%'
              }"
            ></div>

            <div class="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
              <button class="p-3 bg-surface-bright/80 backdrop-blur rounded-full hover:bg-primary hover:text-on-primary transition-all shadow-xl">
                <span class="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <transition-group
            name="thumbnail"
            tag="div"
            class="flex gap-4 overflow-hidden mt-4 p-1 w-full"
          >
            <button
              v-for="anh in displayImages"
              :key="anh"
              @click="selectImage(anh)"
              class="flex-shrink-0 aspect-square bg-surface-container-high rounded-lg overflow-hidden transition-all duration-300 transform"
              :class="mainImage === anh ? 'border-2 border-primary shadow-[0_0_15px_rgba(255,61,0,0.4)] scale-100' : 'border border-outline-variant/30 hover:border-primary/50 opacity-60 hover:opacity-100 scale-95'"
              style="width: calc((100% - 4rem) / 5);"
            >
              <img :src="`http://localhost:3000/Images_product/${anh}`" class="w-full h-full object-cover"/>
            </button>
          </transition-group>
        </div>

        <div class="lg:col-span-5 flex flex-col">
          <header class="mb-8">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-primary text-xs font-bold tracking-[0.2em] uppercase">{{ product.TenHSX || 'UNKNOWN' }}</span>
              <span class="text-outline-variant">•</span>
              <span class="text-on-surface-variant text-xs font-medium uppercase tracking-wider">Mô Hình</span>
            </div>
            <h1 class="font-headline text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.1] text-white">{{ product.TenMH }}</h1>
            <div class="flex items-baseline gap-4 mt-6">
              <span class="font-headline text-3xl font-bold">
                <div v-if="selectedVariant && Number(selectedVariant.DonGiaKhuyenMai) < Number(selectedVariant.DonGia)">
                  <span class="text-primary font-bold">{{ formatPrice(selectedVariant.DonGiaKhuyenMai) }}</span>
                  <span class="text-outline line-through text-base ml-3">{{ formatPrice(selectedVariant.DonGia) }}</span>
                </div>
                <div v-else-if="selectedVariant">
                    <span class="text-white font-bold">{{ formatPrice(selectedVariant.DonGia) }}</span>
                </div>
                 <div v-else>
                    <span class="text-outline italic text-sm">Đang tải giá...</span>
                </div>
              </span>
            </div>
          </header>

          <div class="space-y-8 flex-1">
            <div class="grid grid-cols-2 gap-px bg-outline-variant/15 rounded overflow-hidden border border-outline-variant/20">
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Thương hiệu</span>
                <span class="text-white font-semibold">{{ product.TenHSX }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Chất liệu</span>
                <span class="text-white font-semibold">{{ product.ChatLieu }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kích thước</span>
                <span class="text-white font-semibold">{{ product.KichThuoc }}</span>
              </div>
              <div class="bg-surface-container-low p-4">
                <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-1">Kho hàng</span>
                <span class="text-white font-semibold">
                  {{ selectedVariant ? (selectedVariant.SoLuong === 0 ? 'Hết hàng' : selectedVariant.SoLuong + ' hộp') : 'Đang tải...' }}
                </span>
              </div>
            </div>

            <div v-if="variants.length > 1" class="pt-6 border-t border-outline-variant/15">
              <span class="block text-[10px] text-outline font-bold tracking-widest uppercase mb-3">CHỌN PHÂN LOẠI</span>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="variant in variants"
                  :key="variant.MaPhanLoai"
                  @click="selectedVariant = variant; buyQuantity = 1;"
                  :class="[
                    'px-5 py-2.5 border-2 rounded-md font-semibold transition-all text-sm',
                    selectedVariant?.MaPhanLoai === variant.MaPhanLoai
                      ? 'border-primary text-primary bg-primary/10 shadow-inner'
                      : 'border-outline-variant/30 text-outline hover:border-primary/50 hover:text-white'
                  ]"
                >
                  {{ variant.ChiTietPhanLoai === 'NONE' ? 'Mặc định' : variant.ChiTietPhanLoai}}
                </button>
              </div>
            </div>

            <div class="space-y-4 pt-6 border-t border-outline-variant/15 mt-auto">
              <div class="flex items-center gap-4">
                <div class="flex items-center bg-surface-container-highest rounded border border-outline-variant/20 h-14">
                  <button @click="buyQuantity > 1 && buyQuantity--" class="px-5 hover:text-primary transition-colors text-outline"><span class="material-symbols-outlined">remove</span></button>
                  <span class="w-10 text-center font-bold text-xl text-white">{{ buyQuantity }}</span>
                  <button @click="buyQuantity < (selectedVariant ? selectedVariant.SoLuong : 0) && buyQuantity++" class="px-5 hover:text-primary transition-colors text-outline"><span class="material-symbols-outlined">add</span></button>
                </div>

                <button
                  @click="addToCart"
                  :disabled="!selectedVariant || selectedVariant.SoLuong === 0"
                  :class="['flex-1 h-14 font-headline font-bold uppercase tracking-widest rounded transition-all text-sm px-4',
                    (!selectedVariant || selectedVariant.SoLuong === 0)
                      ? 'bg-surface-container-high text-outline cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0_0_20px_rgba(255,143,115,0.3)] hover:brightness-110 active:scale-95'
                  ]"
                >
                  {{ (!selectedVariant || selectedVariant.SoLuong === 0) ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG' }}
                </button>

                <button
                    @click="toggleFavorite"
                    title="Thêm/Bỏ yêu thích"
                    :class="['w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                             isFavorite
                             ? 'bg-red-950/50 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-950'
                             : 'bg-surface-container-low border-outline-variant/30 text-outline hover:border-primary/50 hover:text-primary']">
                    <span class="material-symbols-outlined font-bold text-3xl">
                        {{ isFavorite ? 'favorite' : 'favorite_border' }}
                    </span>
                </button>
              </div>
            </div>

            <div class="pt-6 border-t border-outline-variant/15 flex items-center gap-6 text-sm">
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">BẢO HÀNH</span>
                <span class="font-semibold text-on-surface">1 Đổi 1 trong 7 ngày</span>
              </div>
              <div class="h-10 w-px bg-outline-variant/30"></div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] text-outline uppercase font-bold tracking-tighter">VẬN CHUYỂN</span>
                <span class="font-semibold text-on-surface">Miễn phí nội thành Hải Phòng</span>
              </div>
            </div>

            <button
            @click="handleShowQR"
            class="mt-4 flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl border border-orange-500/40 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 font-bold uppercase text-xs tracking-[0.2em]"
          >
            <span>{{ isQRVisible ? '✖ Đóng xác thực' : '🛡️ Truy xuất Blockchain' }}</span>
          </button>

          <transition name="fade">
            <div v-if="isQRVisible && qrCodeImg" class="mt-4 p-5 bg-white/5 border border-orange-500/20 rounded-2xl backdrop-blur-md shadow-2xl">
              <div class="flex flex-col sm:flex-row items-center gap-6">
                <div class="relative group">
                  <div class="w-32 h-32 bg-white p-2 rounded-xl shadow-lg overflow-hidden relative">
                    <img :src="qrCodeImg" alt="Blockchain QR" class="w-full h-full object-contain" />
                    <div class="scan-line absolute left-0 w-full h-0.5 bg-orange-500 shadow-[0_0_10px_#ff6b4a]"></div>
                  </div>

                </div>

                <div class="flex-1 text-center sm:text-left">
                  <h4 class="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Genuine Product</h4>
                  <p class="text-white font-bold text-sm mb-2 font-mono">{{ product.MaVach_Serial }}</p>
                  <p class="text-gray-400 text-[11px] leading-relaxed mb-3">
                    Mã QR chứa chữ ký số định danh sản phẩm trên mạng lưới Blockchain.
                  </p>
                  <button @click="downloadQR" class="text-[10px] text-gray-400 hover:text-white underline">
                    Tải ảnh QR về máy
                  </button>
                </div>
              </div>
            </div>
          </transition>
          <router-link
            v-if="product && product.MaVach_Serial"
            :to="`/truy-xuat/${product.MaVach_Serial}`"
            class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm group"
          >
            <span>Truy xuất nguồn gốc</span>
            <span class="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform duration-200">
              arrow_right_alt
            </span>
          </router-link>
          </div>
        </div>
      </div>

      <section class="max-w-7xl mx-auto px-6 pb-24 w-full border-t border-white/5 pt-16">
        <h3 class="font-headline text-3xl font-bold text-white mb-10 text-center uppercase tracking-widest">Đánh giá từ cộng đồng</h3>
        <div class="bg-surface-container-low rounded-2xl p-8 lg:p-12 border border-white/5 shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-12">
          <div class="text-center md:w-1/3">
            <div class="text-7xl font-headline font-black text-primary drop-shadow-[0_0_15px_rgba(255,61,0,0.3)]">
              {{ reviewStats.avg }}<span class="text-2xl text-on-surface-variant font-bold">/5</span>
            </div>
            <div class="text-xs text-outline uppercase font-bold mt-3 tracking-widest">Dựa trên {{ reviewStats.count }} Đánh giá</div>
          </div>

          <div class="md:w-2/3 w-full space-y-3">
            <div v-for="star in [5,4,3,2,1]" :key="star" class="flex items-center gap-4 text-xs font-bold">
              <span class="text-on-surface-variant w-10 text-right">{{ star }} Sao</span>
              <div class="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div class="h-full bg-primary" :style="{ width: (reviewStats.count ? (reviewStats.stars[star] / reviewStats.count) * 100 : 0) + '%' }"></div>
              </div>
              <span class="text-outline w-8">{{ reviewStats.stars[star] || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-12">

          <div class="lg:w-1/3">
            <div v-if="canReview" class="sticky top-24 ...">
              <h4 class="font-headline text-lg font-bold text-white mb-2">Bạn đã trải nghiệm siêu phẩm này?</h4>

              <form @submit.prevent="submitReview" class="space-y-4">
                <div>
                  <label class="text-[10px] font-bold text-outline uppercase tracking-widest block mb-2">Đánh giá của bạn</label>
                  <div class="flex gap-2 text-outline-variant cursor-pointer hover:text-primary transition-colors">
                    <span v-for="i in 5" :key="i"
                      @click="reviewForm.SoSao = i"
                      @mouseover="hoverStar = i"
                      @mouseleave="hoverStar = 0"
                      :class="[
                        'material-symbols-outlined text-3xl hover:scale-110 transition-all cursor-pointer',
                        /* Nếu đang hover thì so với hoverStar, không thì so với SoSao đã chọn */
                        (hoverStar ? i <= hoverStar : i <= reviewForm.SoSao) ? 'text-primary' : 'text-outline-variant'
                      ]"
                      :style="{
                        fontVariationSettings: (hoverStar ? i <= hoverStar : i <= reviewForm.SoSao) ? `'FILL' 1` : `'FILL' 0`
                      }"> star
                    </span>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] font-bold text-outline uppercase tracking-widest block mb-2">Nhận xét chi tiết</label>
                  <textarea v-model="reviewForm.NoiDung" required rows="4" placeholder="Chất lượng sơn, độ linh hoạt..."
                            class="w-full bg-background border border-white/10 focus:border-primary focus:ring-0 rounded-xl p-4 text-sm text-white resize-none transition-all max-h-32 overflow-y-auto"></textarea>
                </div>
                <div v-if="previewUrls.length > 0" class="flex flex-wrap gap-3 mb-4">
                  <div v-for="(url, index) in previewUrls" :key="index" class="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20 group">
                    <img :src="url" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <button type="button" @click="removeImage(index)" class="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                      <span class="material-symbols-outlined text-[12px] text-white font-bold">close</span>
                    </button>
                  </div>
                </div>

                <input type="file" ref="fileInput" multiple accept="image/*" class="hidden" @change="onFileChange" />

                <button type="button" @click="fileInput.click()" class="w-full py-3 mb-4 border border-dashed border-white/20 rounded-xl text-on-surface-variant text-xs font-bold hover:border-primary hover:text-primary transition-all flex justify-center items-center gap-2">
                  <span class="material-symbols-outlined text-lg">add_a_photo</span>
                  {{ selectedFiles.length > 0 ? `Đã chọn ${selectedFiles.length}/5 ảnh` : 'Đính kèm hình ảnh (Tối đa 5 ảnh)' }}
                </button>

                <button type="submit" :disabled="isSubmittingReview" class="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-black font-headline font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all disabled:opacity-50">
                  {{ isSubmittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ' }}
                </button>
              </form>
            </div>
          </div>

          <div class="lg:w-2/3 space-y-8">
            <div class="flex flex-wrap gap-3 pb-4 border-b border-white/5">
              <button @click="currentFilter = 'all'"
                      :class="['px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all',
                              currentFilter === 'all' ? 'bg-primary text-black shadow-[0_0_15px_rgba(255,61,0,0.3)]' : 'bg-surface-container text-on-surface-variant hover:text-white border border-white/5 hover:border-white/20']">
                Tất cả ({{ reviews.length }})
              </button>

              <button @click="currentFilter = 'withImage'"
                      :class="['px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all',
                              currentFilter === 'withImage' ? 'bg-primary text-black shadow-[0_0_15px_rgba(255,61,0,0.3)]' : 'bg-surface-container text-on-surface-variant hover:text-white border border-white/5 hover:border-white/20']">
                Có hình ảnh ({{ reviewsWithImageCount }})
              </button>

              <button v-for="star in [5, 4, 3, 2, 1]" :key="star"
                      @click="currentFilter = star.toString()"
                      v-show="reviewStats.stars[star] > 0"
                      :class="['px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1',
                              currentFilter === star.toString() ? 'bg-primary text-black shadow-[0_0_15px_rgba(255,61,0,0.3)]' : 'bg-surface-container text-on-surface-variant hover:text-white border border-white/5 hover:border-white/20']">
                {{ star }} <span class="material-symbols-outlined text-[13px]">star</span> ({{ reviewStats.stars[star] }})
              </button>
            </div>

            <div v-for="review in displayedReviews" :key="review.MaDG" class="group border-b border-white/5 pb-8">
              <div class="flex justify-between items-start mb-4">
                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-surface-bright to-surface-container-high border border-white/10 flex items-center justify-center font-headline font-bold text-white">
                    <img v-if="review.AnhDaiDien" :src="'http://localhost:3000/Images_user/' + review.AnhDaiDien" class="w-full h-full object-cover">
                    <span v-else class="material-symbols-outlined text-primary text-xl">person</span>
                  </div>
                  <div>
                    <div class="text-white font-bold text-sm flex items-center gap-2">
                      {{ review.TenKH }}
                      <span class="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase font-black border border-green-500/30 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[10px]">verified</span> Đã mua hàng
                      </span>
                    </div>
                    <div class="flex text-primary text-[10px] mt-1.5">
                      <span v-for="s in 5" :key="s" class="material-symbols-outlined text-[14px]" :style="{ fontVariationSettings: s <= review.SoSao ? `'FILL' 1` : `'FILL' 0` }">star</span>
                      <span v-if="review.ChiTietPhanLoai" class="ml-3 text-on-surface-variant font-medium text-xs">Phân loại: {{ review.ChiTietPhanLoai }}</span>
                    </div>
                  </div>
                </div>
                <span class="text-[10px] text-outline font-bold uppercase bg-surface-container px-2 py-1 rounded">{{ formatDate(review.ThoiGianDG) }}</span>
              </div>

              <p class="text-on-surface-variant text-sm leading-relaxed mb-5 pl-16">
                {{ review.NoiDung }}
              </p>

              <div v-if="review.HinhAnh && review.HinhAnh.length > 0" class="flex flex-wrap gap-3 pl-16 mb-5">
                <div v-for="(img, idx) in review.HinhAnh" :key="idx" class="w-24 h-24 rounded-xl overflow-hidden border border-white/10 hover:border-primary transition-all cursor-zoom-in group/img relative">
                  <img :src="'http://localhost:3000/Images_review/' + img" @click="zoomedImage = img" class="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" />
                </div>
              </div>

              <div v-if="review.PhanHoiShop" class="ml-16 p-5 bg-gradient-to-r from-surface-container to-transparent rounded-2xl border-l-2 border-primary relative overflow-hidden">
                <div class="flex items-center gap-2 mb-2 relative z-10">
                  <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">admin_panel_settings</span>
                  <span class="text-[10px] font-black text-primary tracking-widest uppercase">Phản hồi từ FigureCollect</span>
                </div>
                <p class="text-xs text-white/80 leading-relaxed relative z-10">
                  {{ review.PhanHoiShop }}
                </p>
              </div>
            </div>

            <div v-if="reviews.length === 0" class="text-center py-12 text-on-surface-variant border border-dashed border-white/10 rounded-xl">
              <span class="material-symbols-outlined text-4xl mb-2 opacity-50">forum</span>
              <p class="text-sm">Chưa có đánh giá nào cho siêu phẩm này.<br>Hãy là người đầu tiên để lại cảm nhận!</p>
            </div>
            <div v-if="filteredReviews.length === 0 && reviews.length > 0" class="text-center py-12 text-on-surface-variant">
              <p class="text-sm">Không có đánh giá nào phù hợp với bộ lọc này.</p>
            </div>
            <div class="pt-8 border-t border-white/5 flex justify-center items-center gap-2">
              <div v-if="visibleCount < filteredReviews.length" class="pt-8 flex justify-center items-center">
                <button
                  @click="loadMoreReviews"
                  class="px-8 py-3.5 border border-white/10 rounded-xl font-headline font-bold text-xs text-outline hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all uppercase tracking-[0.2em] shadow-lg flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">expand_more</span>
                  Xem thêm {{ filteredReviews.length - visibleCount }} đánh giá
                </button>
              </div>

              <div v-else class="pt-8 text-center text-outline-variant text-xs font-bold uppercase tracking-widest">
                Đã hiển thị toàn bộ đánh giá
              </div>
            </div>
          </div>
        </div>
      </section>
      <div v-if="zoomedImage" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity" @click="zoomedImage = null">
        <button class="absolute top-6 right-6 text-white/50 hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-4xl">close</span>
        </button>
        <img :src="'http://localhost:3000/Images_review/' + zoomedImage"
            class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-100 animate-[zoomIn_0.2s_ease-out]"
            @click.stop />
      </div>

      <section v-if="relatedProducts.length > 0" class="max-w-7xl mx-auto px-6 py-16 w-full border-t border-white/5">
        <div class="flex items-center gap-4 mb-8">
          <div class="h-8 w-1.5 bg-primary rounded-full"></div>
          <h3 class="text-2xl font-headline font-black text-white uppercase italic tracking-wider">Có thể bạn sẽ thích</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="item in relatedProducts"
            :key="item.MaMoHinh"
            :product="item"
            :hide-cart="true"
          />
        </div>
      </section>
    </main>

    <div v-else class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <span class="material-symbols-outlined animate-spin text-primary text-5xl">settings</span>
        <span class="font-headline text-outline tracking-widest uppercase">Đang tải dữ liệu...</span>
      </div>
    </div>
  </div>
  <div v-if="isLightboxOpen"
    class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-[fadeIn_0.2s_ease-out]"
    @click.self="closeLightbox">

    <div class="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white/70">
      <div class="font-headline font-bold tracking-widest text-sm">
        {{ currentIndex + 1 }} / {{ allImages.length }}
      </div>
      <div class="flex gap-6">
        <button @click="closeLightbox" class="hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-4xl">close</span>
        </button>
      </div>
    </div>

    <button @click="prevImage"
            class="absolute left-4 md:left-8 p-4 text-white/50 hover:text-primary hover:bg-white/5 rounded-full transition-all">
      <span class="material-symbols-outlined text-5xl">chevron_left</span>
    </button>

    <div class="relative w-[90vw] h-[80vh] overflow-hidden">
      <Transition :name="slideDirection">
        <img :key="currentIndex"
            :src="`http://localhost:3000/Images_product/${allImages[currentIndex]}`"
            class="absolute inset-0 m-auto max-w-full max-h-[80vh] object-contain shadow-2xl" />
      </Transition>
    </div>

    <button @click="nextImage"
            class="absolute right-4 md:right-8 p-4 text-white/50 hover:text-primary hover:bg-white/5 rounded-full transition-all">
      <span class="material-symbols-outlined text-5xl">chevron_right</span>
    </button>

    <div class="absolute bottom-10 flex gap-3 px-6 overflow-x-auto max-w-full hide-scrollbar">
      <div v-for="(anh, idx) in allImages" :key="idx"
          @click="currentIndex = idx"
          :class="['w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all border-2 shrink-0',
                    currentIndex === idx ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100']">
        <img :src="`http://localhost:3000/Images_product/${anh}`" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToastStore } from '../../stores/toast';
  import TheHeader from '../../components/TheHeader.vue';
  import ProductCard from '../../components/ProductCard.vue';
  import axios from 'axios';
  const route = useRoute();
  const router = useRouter();
  const toastStore = useToastStore();

  const product = ref(null);
  const allImages = ref([]);
  const mainImage = ref('');
  const buyQuantity = ref(1);
  const relatedProducts = ref([]);

  const variants = ref([]);
  const selectedVariant = ref(null);
  const isFavorite = ref(false);

  const selectedFiles = ref([]);
  const previewUrls = ref([]);
  const fileInput = ref(null);
  const zoomedImage = ref(null);

  const reviews = ref([]);
  const canReview = ref(false);
  const isSubmittingReview = ref(false);
  const hoverStar = ref(0);
  // Biến lưu trạng thái bộ lọc: 'all', 'withImage', '5', '4', '3', '2', '1'
  const currentFilter = ref('all');
  const visibleCount = ref(5);

  const displayImages = ref([]);
  // Biến quản lý Lightbox
  const isLightboxOpen = ref(false);
  const currentIndex = ref(0);
  const slideDirection = ref('slide-right');

  const openLightbox = (index) => {
    currentIndex.value = index;
    isLightboxOpen.value = true;
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    isLightboxOpen.value = false;
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    slideDirection.value = 'slide-right';
    currentIndex.value = (currentIndex.value + 1) % allImages.value.length;
  };

  const prevImage = () => {
    slideDirection.value = 'slide-left';
    currentIndex.value = (currentIndex.value - 1 + allImages.value.length) % allImages.value.length;
};

  const handleKeydown = (e) => {
    if (!isLightboxOpen.value) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeLightbox();
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  const isZooming = ref(false);
  const zoomPosition = ref({ x: 50, y: 50 });
  const imageContainer = ref(null);

  const handleMouseMove = (event) => {
    if (!imageContainer.value) return;
    const { left, top, width, height } = imageContainer.value.getBoundingClientRect();
    const mouseX = ((event.clientX - left) / width) * 100;
    const mouseY = ((event.clientY - top) / height) * 100;

    const radiusX = (120 / width) * 100;
    const radiusY = (120 / height) * 100;

    zoomPosition.value = {
      x: Math.max(radiusX, Math.min(100 - radiusX, mouseX)),
      y: Math.max(radiusY, Math.min(100 - radiusY, mouseY))
    };
  };

  const selectImage = (anh) => {
    mainImage.value = anh;
    const total = displayImages.value.length;
    if (total < 5) return;

    const currentIndex = displayImages.value.indexOf(anh);
    const targetCenterIndex = 2;
    let shiftAmount = currentIndex - targetCenterIndex;

    if (shiftAmount > 0) {
      const itemsToMove = displayImages.value.splice(0, shiftAmount);
      displayImages.value.push(...itemsToMove);
    }
    else if (shiftAmount < 0) {
      const itemsToMove = displayImages.value.splice(shiftAmount);
      displayImages.value.unshift(...itemsToMove);
    }
  };

  const filteredReviews = computed(() => {
    if (currentFilter.value === 'all') {
      return reviews.value;
    }

    if (currentFilter.value === 'withImage') {
      return reviews.value.filter(r => r.HinhAnh && r.HinhAnh.length > 0);
    }

    const starLevel = parseInt(currentFilter.value);
    if (!isNaN(starLevel)) {
      return reviews.value.filter(r => r.SoSao === starLevel);
    }

    return reviews.value;
  });

  const reviewsWithImageCount = computed(() => {
    return reviews.value.filter(r => r.HinhAnh && r.HinhAnh.length > 0).length;
  });

  const displayedReviews = computed(() => {
    return filteredReviews.value.slice(0, visibleCount.value);
  });

  const loadMoreReviews = () => {
    visibleCount.value += 5;
  };

  watch(currentFilter, () => {
    visibleCount.value = 5;
  });

  const fetchProductDetails = async (id) => {
    try {
      // Gọi 1 API duy nhất
      const res = await fetch(`http://localhost:3000/api/products/${id}`);
      const dataJSON = await res.json();
      if (res.ok) {
        product.value = dataJSON.data; // Không cần [0] nữa vì Backend đã lấy ra object chuẩn

        // 1. Xử lý danh sách ảnh
        let images = [product.value.AnhDaiDien];
        // Vì Backend đã split(',') sẵn thành mảng, ta chỉ cần nối vào
        if (product.value.DanhSachAnh && product.value.DanhSachAnh.length > 0) {
          images = [...images, ...product.value.DanhSachAnh];
        }
        allImages.value = [...new Set(images.filter(Boolean))];
        displayImages.value = [...allImages.value];
        mainImage.value = allImages.value[0];

        // 2. Tự động lấy danh sách phân loại từ Object trả về
        variants.value = product.value.DanhSachPhanLoai || [];
        if (variants.value.length > 0) {
          selectedVariant.value = variants.value[0];
        } else {
          selectedVariant.value = null;
        }
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    }
  };

  const checkFavoriteStatus = async (id) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    isFavorite.value = false;

    if (token && userString) {
        try {
            const userObj = JSON.parse(userString);
            const resFav = await fetch(`http://localhost:3000/api/products/check_favorite/${userObj.MaKH}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const favData = await resFav.json();
            if (resFav.ok && favData.isFavorite) {
                isFavorite.value = true;
            }
        } catch (error) {
            console.error("Lỗi kiểm tra trạng thái yêu thích:", error);
        }
    }
  };

  const fetchRelatedProducts = async (spId) => {
    try{
      const res = await fetch(`http://localhost:3000/api/products/related/${spId}`);
      const data = await res.json();
      if(res.ok){
        relatedProducts.value = data.data;
      }
    }catch (error){
      console.error("Lỗi lấy sản phẩm liên quan: ", error);
    }
  }

  const reviewForm = ref({
    SoSao: 5,
    NoiDung: '',
    HinhAnh: []
  });

  const reviewStats = computed(() => {
    if (reviews.value.length === 0) return { avg: 0, count: 0, stars: { 5:0, 4:0, 3:0, 2:0, 1:0 } };

    let totalStars = 0;
    const starsCount = { 5:0, 4:0, 3:0, 2:0, 1:0 };

    reviews.value.forEach(r => {
      totalStars += r.SoSao;
      starsCount[r.SoSao] = (starsCount[r.SoSao] || 0) + 1;
    });

    return {
      avg: (totalStars / reviews.value.length).toFixed(1),
      count: reviews.value.length,
      stars: starsCount
    };
  });

  const fetchReviews = async (maMH) => {
    try {
      const res = await fetch(`http://localhost:3000/api/reviews/product/${maMH}`);
      const data = await res.json();
      if (res.ok) {
        reviews.value = data.data;
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá:", error);
    }
  };

  const checkEligibility = async (maMH) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (!token || !userString) return;

    const userObj = JSON.parse(userString);
    try {
      const res = await fetch(`http://localhost:3000/api/reviews/check-purchase-status?MaKH=${userObj.MaKH}&MaMoHinh=${maMH}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        canReview.value = data.canReview;
      }
    } catch (error) {
      console.error("Lỗi kiểm tra quyền đánh giá:", error);
    }
  };

  const loadAllData = async (id) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    product.value = null;

    await fetchProductDetails(id);
    await checkFavoriteStatus(id);
    await fetchReviews(id);
    await checkEligibility(id);
    await fetchRelatedProducts(id);
  };

  watch(() => route.params.id, async (newId) => {
    if (newId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await loadAllData(newId);
    }
  });

  const submitReview = async () => {
    if (!reviewForm.value.NoiDung.trim()) {
      toastStore.showToast("⚠️ Vui lòng nhập nội dung đánh giá!", "error");
      return;
    }

    isSubmittingReview.value = true;
    const token = localStorage.getItem('token');
    let uploadedImageNames = [];

    try {
      if (selectedFiles.value.length > 0) {
        const formData = new FormData();
        selectedFiles.value.forEach(file => {
          formData.append('images', file);
        });

        const uploadRes = await fetch('http://localhost:3000/api/reviews/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Lỗi upload ảnh");

        uploadedImageNames = uploadData.images;
      }

      const payload = {
        MaMoHinh: product.value.MaMoHinh,
        MaPhanLoai: selectedVariant.value ? selectedVariant.value.MaPhanLoai : null,
        NoiDung: reviewForm.value.NoiDung,
        SoSao: reviewForm.value.SoSao,
        HinhAnh: uploadedImageNames
      };

      const res = await fetch(`http://localhost:3000/api/reviews/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        toastStore.showToast("🎉 " + data.message, "success");

        reviewForm.value.NoiDung = '';
        reviewForm.value.SoSao = 5;
        selectedFiles.value = [];
        previewUrls.value = [];
        canReview.value = false;

        await fetchReviews(product.value.MaMoHinh);
      } else {
        toastStore.showToast("⚠️ Lỗi: " + data.message, "error");
      }
    } catch (error) {
      toastStore.showToast(error.message || "Lỗi mạng khi gửi đánh giá", "error");
    } finally {
      isSubmittingReview.value = false;
    }
  };

  // Hàm phụ trợ định dạng ngày (Ví dụ: 15/04/2026)
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Hàm kích hoạt khi khách hàng chọn ảnh
  const onFileChange = (event) => {
    const files = Array.from(event.target.files);

    // Kiểm tra giới hạn 5 ảnh
    if (selectedFiles.value.length + files.length > 5) {
      toastStore.showToast("⚠️ Chỉ được tải lên tối đa 5 ảnh!", "error");
      return;
    }

    files.forEach(file => {
      selectedFiles.value.push(file);
      previewUrls.value.push(URL.createObjectURL(file)); // Tạo link ảo để hiện ảnh
    });

    // Reset input để có thể chọn lại file cùng tên nếu muốn
    event.target.value = '';
  };

  // Hàm xóa ảnh khỏi danh sách chọn
  const removeImage = (index) => {
    selectedFiles.value.splice(index, 1);
    previewUrls.value.splice(index, 1);
  };

  onMounted(async () => {
    const spId = route.params.id;
    await loadAllData(spId);
  });

  // ================= HÀM MỚI XỬ LÝ KHI BẤM NÚT THẢ TIM ❤️ =================
  const toggleFavorite = async () => {
      // 1. Bóc tách thông tin đăng nhập
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');

      // 2. Kiểm tra nếu chưa đăng nhập -> đá sang trang Login
      if (!token || !userString) {
          toastStore.showToast("💖 Bạn cần đăng nhập để thả tim mô hình nhé!", "error");
          // Ghi nhớ trang hiện tại để login xong thì quay lại đây
          router.push({ path: '/login', query: { redirect: route.fullPath } });
          return;
      }

      const userObj = JSON.parse(userString);

      try {
          // 3. Gửi payload lên API "Toggle" ở Backend
          const payload = {
              MaKH: userObj.MaKH,
              MaMoHinh: product.value.MaMoHinh
          };

          const response = await fetch('http://localhost:3000/api/products/add_remove_favorite', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (response.ok) {
              // 4. Cập nhật UI ngay lập tức dựa trên chữ 'action' từ Backend trả về
              if (data.action === 'added') {
                  isFavorite.value = true; // Tô đỏ
                  toastStore.showToast("💖 " + data.message, "success");
              } else if (data.action === 'removed') {
                  isFavorite.value = false; // Bỏ đỏ (rỗng)
                  toastStore.showToast("💔 " + data.message, "success");
              }
          } else {
              toastStore.showToast("⚠️ Lỗi: " + data.message, "error");
          }

      } catch (error) {
          console.error("Lỗi khi kết nối API yêu thích:", error);
          alert("Có lỗi mạng xảy ra, không thể thao tác mục yêu thích!");
      }
  };

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    let maKH = null;

    if (userString) {
      const userObj = JSON.parse(userString);
      maKH = userObj.MaKH;
    }

    if (!token || !maKH) {
      toastStore.showToast("🛒 Bạn cần đăng nhập để mua mô hình nhé!", "error");
      router.push({ path: '/login', query: { redirect: route.fullPath } })
      return;
    }

    try {
      const payload = {
        MaKH: parseInt(maKH),
        MaPhanLoai: selectedVariant.value.MaPhanLoai,
        soluong: buyQuantity.value
      };

      const response = await fetch('http://localhost:3000/api/don_hang/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toastStore.showToast("🛒 🎉 " + data.message, "success");
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        toastStore.showToast("⚠️ Lỗi: " + data.message, "error");
      }

    } catch (error) {
      console.error("Lỗi khi kết nối API thêm giỏ hàng:", error);
      alert("Có lỗi mạng xảy ra khi thêm vào giỏ!");
    }
  };

  // Truy xuất Blockchain bằng QR
  /*
  onMounted(async () => {
    window.scrollTo(0, 0);
    const spId = route.params.id;

    // 1. Tải thông tin sản phẩm và ảnh
    try {
      const res = await fetch(`http://localhost:3000/api/products/${spId}`);
      const dataJSON = await res.json();

      if (res.ok) {
        product.value = dataJSON.data[0];

        if (product.value && product.value.MaVach_Serial) {
            await fetchProductQR(product.value.MaVach_Serial);
        }

        let images = [product.value.AnhDaiDien];
        if (product.value.DanhSachAnh) {
          const gallery = product.value.DanhSachAnh.split(',');
          images = [...images,...gallery];
        }
        allImages.value = [...new Set(images.filter(Boolean))];
        mainImage.value = allImages.value[0];
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    }

    // 2. Tải danh sách phân loại (Variant)
    try {
      const resVar = await fetch(`http://localhost:3000/api/products/variants/${spId}`);
      const varJSON = await resVar.json();

      if (resVar.ok) {
        variants.value = varJSON.data;
        if (variants.value.length > 0) {
          selectedVariant.value = variants.value[0];
        }
      }
    } catch (error) {
      console.error("Lỗi tải phân loại:", error);
    }

    // ================= 3. [MỚI]: KIỂM TRA TRẠNG THÁI YÊU THÍCH KHI LOAD WEB =================
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
        try {
            const userObj = JSON.parse(userString);
            // Giả sử Backend có API GET /api/favorite/check/:maKH/:maMH để kiểm tra
            const resFav = await fetch(`http://localhost:3000/api/products/check_favorite/${userObj.MaKH}/${spId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const favData = await resFav.json();

            if (resFav.ok && favData.isFavorite) {
                isFavorite.value = true; // Nếu Backend bảo đã thích -> tô đỏ trái tim
            }
        } catch (err) {
            console.error("Lỗi kiểm tra trạng thái yêu thích:", err);
        }
    }
    await fetchReviews(spId);
    await checkEligibility(spId);
  });
  */
  const qrCodeImg = ref('');
  /*
  const showQR = async (serial) => {
      if (!serial) {
          alert("Sản phẩm này không có mã Serial!");
          return;
      }

      console.log("Đang gọi API cho Serial:", serial); // Kiểm tra log ở F12
      try {
          // Hãy chắc chắn port 3000 là port Backend của bạn
          const res = await axios.get(`http://localhost:3000/api/blockchain/generate-qr/${serial}`);

          if (res.data.success) {
              qrCodeImg.value = res.data.qrCodeData;
              console.log("Đã nhận dữ liệu QR thành công");
          } else {
              alert("Backend trả về lỗi: " + res.data.message);
          }
      } catch (err) {
          console.error("Lỗi kết nối API:", err);
          alert("Không thể kết nối đến máy chủ Backend!");
      }
  };
  */
  const fetchProductQR = async (serial) => {
      if (!serial) return; // Nếu không có serial thì bỏ qua

      try {
          const res = await axios.get(`http://localhost:3000/api/blockchain/generate-qr/${serial}`);
          if (res.data.success) {
              qrCodeImg.value = res.data.qrCodeData;
          }
      } catch (err) {
          console.error("Lỗi tự động tạo QR:", err);
          // Không dùng alert ở đây để tránh làm phiền người dùng nếu lỗi mạng nhẹ
      }
  };

  // Thêm hàm tải ảnh QR (để dùng cho nút bấm nếu cần)
  const downloadQR = () => {
    if (!qrCodeImg.value) return;
    const link = document.createElement('a');
    link.href = qrCodeImg.value;
    link.download = `QR_${product.value.MaVach_Serial}.png`;
    link.click();
  };

const isQRVisible = ref(false);

// 2. Hàm xử lý khi bấm nút "Kiểm tra Blockchain"
const handleShowQR = async () => {
  // Nếu đang mở thì đóng lại
  if (isQRVisible.value) {
    isQRVisible.value = false;
    return;
  }

  // Nếu chưa có ảnh QR trong bộ nhớ thì mới gọi API
  if (!qrCodeImg.value && product.value?.MaVach_Serial) {
    try {
      const res = await axios.get(`http://localhost:3000/api/blockchain/generate-qr/${product.value.MaVach_Serial}`);
      if (res.data.success) {
        qrCodeImg.value = res.data.qrCodeData;
      }
    } catch (err) {
      console.error("Lỗi lấy mã QR:", err);
      toastStore.showToast("⚠️ Không thể lấy mã QR lúc này", "error");
      return;
    }
  }

  // Hiện khung QR sau khi đã có dữ liệu
  isQRVisible.value = true;
};
// Truy xuất Blockchain bằng QR và Tải dữ liệu trang
  onMounted(async () => {
    window.scrollTo(0, 0);
    const spId = route.params.id;

    // 1. Tải thông tin sản phẩm và ảnh
    try {
      const res = await fetch(`http://localhost:3000/api/products/${spId}`);
      const dataJSON = await res.json();

      if (res.ok) {
        // ✨ SỬA LỖI 1: Tự động nhận diện Object hoặc Array từ Backend một cách an toàn
        const targetData = Array.isArray(dataJSON.data) ? dataJSON.data[0] : dataJSON.data;

        if (targetData) {
          product.value = targetData;

          // Gọi hàm sinh QR Blockchain nếu có mã vạch
          if (product.value.MaVach_Serial && typeof fetchProductQR === 'function') {
              try {
                await fetchProductQR(product.value.MaVach_Serial);
              } catch (qrErr) {
                console.error("Lỗi chạy hàm QR:", qrErr);
              }
          }

          // ✨ SỬA LỖI 2: Xử lý ảnh thông minh (Mảng thì gộp luôn, Chuỗi thì mới split)
          let images = [product.value.AnhDaiDien];
          if (product.value.DanhSachAnh) {
            if (Array.isArray(product.value.DanhSachAnh)) {
              images = [...images, ...product.value.DanhSachAnh];
            } else if (typeof product.value.DanhSachAnh === 'string') {
              images = [...images, ...product.value.DanhSachAnh.split(',')];
            }
          }
          allImages.value = [...new Set(images.filter(Boolean))];
          mainImage.value = allImages.value[0] || '';
        }
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    }

    // 2. Tải danh sách phân loại (Variant)
    try {
      const resVar = await fetch(`http://localhost:3000/api/products/variants/${spId}`);
      const varJSON = await resVar.json();

      if (resVar.ok) {
        variants.value = varJSON.data;
        if (variants.value.length > 0) {
          selectedVariant.value = variants.value[0];
        }
      }
    } catch (error) {
      console.error("Lỗi tải phân loại:", error);
    }

    // 3. Tải sản phẩm liên quan (Đồng bộ hàm fetchRelatedProducts của bạn)
    if (product.value && product.value.MaLoaiMH) {
      await fetchRelatedProducts(product.value.MaLoaiMH);
    }

    // 4. KIỂM TRA TRẠNG THÁI YÊU THÍCH KHI LOAD WEB
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
        try {
            const userObj = JSON.parse(userString);
            const resFav = await fetch(`http://localhost:3000/api/products/check_favorite/${userObj.MaKH}/${spId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resFav.ok) {
              const favData = await resFav.json();
              if (favData && favData.isFavorite) {
                  isFavorite.value = true;
              }
            }
        } catch (err) {
            console.error("Lỗi kiểm tra trạng thái yêu thích:", err);
        }
    }

    // 5. Tải các thành phần bổ sung (Bọc try-catch phòng hờ hàm chưa khai báo)
    try {
      if (typeof fetchReviews === 'function') await fetchReviews(spId);
      if (typeof checkEligibility === 'function') await checkEligibility(spId);
    } catch (e) {
      console.error("Lỗi tải bổ sung:", e);
    }
  });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap');

.font-headline { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Manrope', sans-serif; }

.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.is-favorite-icon {
    font-variation-settings: 'FILL' 1, 'wght' 600;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.thumbnail-move {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Hiệu ứng quét QR Code */
.scan-line {
  animation: scanning 2.5s infinite linear;
}

@keyframes scanning {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* Hiệu ứng hover nhẹ cho khung QR */
.group:hover .scan-line {
  animation-duration: 1.5s; /* Quét nhanh hơn khi di chuột vào */
}

</style>
