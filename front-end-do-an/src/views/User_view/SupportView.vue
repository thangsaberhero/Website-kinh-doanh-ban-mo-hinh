<template>
    <div class="bg-background min-h-screen flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary-fixed">
      <TheHeader />
  
      <div class="flex flex-1 w-full max-w-7xl mx-auto overflow-hidden py-8 px-4 lg:px-8">
        
        <aside class="w-72 hidden md:flex flex-col pr-8 border-r border-outline-variant/20">
          <h2 class="text-xl font-headline font-bold uppercase tracking-widest text-white mb-8">Hỗ trợ khách hàng</h2>
          
          <nav class="space-y-2">
            <button 
              @click="changeTab('guide')"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-left', 
                       activeTab === 'guide' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container hover:text-white']"
            >
              <span class="material-symbols-outlined text-[20px]">local_mall</span>
              Hướng dẫn đặt hàng
            </button>
            
            <button 
              @click="changeTab('shipping')"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-left', 
                       activeTab === 'shipping' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container hover:text-white']"
            >
              <span class="material-symbols-outlined text-[20px]">local_shipping</span>
              Chính sách vận chuyển
            </button>
  
            <button 
              @click="changeTab('return')"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-left', 
                       activeTab === 'return' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container hover:text-white']"
            >
              <span class="material-symbols-outlined text-[20px]">assignment_return</span>
              Chính sách đổi trả
            </button>

            <button 
              @click="changeTab('payment')"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-left', 
                        activeTab === 'payment' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container hover:text-white']"
            >
              <span class="material-symbols-outlined text-[20px]">payments</span>
              Chính sách thanh toán
            </button>
          </nav>
        </aside>
  
        <main class="flex-1 md:pl-10 overflow-y-auto custom-scrollbar relative pb-12">
          <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
  
          <div class="md:hidden mb-8 flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
            <button @click="changeTab('guide')" :class="['px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold', activeTab === 'guide' ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container text-outline']">Đặt hàng</button>
            <button @click="changeTab('shipping')" :class="['px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold', activeTab === 'shipping' ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container text-outline']">Vận chuyển</button>
            <button @click="changeTab('return')" :class="['px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold', activeTab === 'return' ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container text-outline']">Đổi trả</button>
            <button @click="changeTab('payment')" :class="['px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold', activeTab === 'payment' ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container text-outline']">Thanh toán</button>
          </div>
  
          <div class="glass-panel p-5 sm:p-8 md:p-10 rounded-2xl border border-outline-variant/20 shadow-2xl">            
            <article v-if="activeTab === 'guide'" class="space-y-8 text-on-surface-variant leading-relaxed">
              <h1 class="text-2xl md:text-3xl font-headline font-bold text-white mb-6 md:mb-8 uppercase border-b border-outline-variant/15 pb-4">Hướng dẫn đặt hàng</h1>
            
              <div class="space-y-10">
                <section>
                  <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30 shrink-0">1</span>
                    Đăng nhập hoặc Đăng ký tài khoản
                  </h3>
                  <p class="pl-0 md:pl-11 mt-2 md:mt-0">Để bắt đầu hành trình sưu tập và quản lý giỏ hàng dễ dàng, bạn vui lòng Đăng nhập vào hệ thống. Nếu chưa có tài khoản, hãy dành 1 phút để Đăng ký. Việc sở hữu tài khoản sẽ giúp bạn tra cứu lịch sử đơn hàng, tích lũy điểm thưởng và nhận các voucher độc quyền từ FigureCollect.</p>
                </section>

                <section>
                  <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30 shrink-0">2</span>
                    Tìm kiếm và lựa chọn bảo vật
                  </h3>
                  <div class="pl-0 md:pl-11 mt-2 md:mt-0 space-y-3">
                    <p>Bạn có thể săn lùng mô hình qua 2 cách:</p>
                    <ul class="list-disc pl-5 space-y-2">
                      <li>Sử dụng thanh <strong class="text-white">Tìm kiếm</strong> (biểu tượng kính lúp) ở góc trên màn hình nếu bạn đã có sẵn mục tiêu (VD: "Gundam", "Nendoroid", "Naruto").</li>
                      <li>Truy cập mục <strong class="text-white">Cửa hàng</strong> để sử dụng bộ lọc nâng cao, tinh chỉnh theo Danh mục, Mức giá, hoặc Thương hiệu yêu thích.</li>
                    </ul>
                    <p class="text-sm bg-surface-container-highest inline-block px-3 py-1.5 rounded-lg border border-outline-variant/30">
                      💡 <strong class="text-white">Mẹo:</strong> Chú ý trạng thái sản phẩm hiển thị trên ảnh: <span class="text-primary font-bold">Còn hàng</span> (Sẵn sàng giao ngay) hoặc <span class="text-tertiary font-bold">Pre-order</span> (Hàng đặt trước).
                    </p>
                  </div>
                </section>

                <section>
                  <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30 shrink-0">3</span>
                    Kiểm tra Giỏ hàng & Áp dụng ưu đãi
                  </h3>
                  <p class="pl-0 md:pl-11 mt-2 md:mt-0 mb-3">Bấm vào nút <strong class="text-white">"Thêm vào giỏ"</strong> khi đã chốt được sản phẩm. Sau đó, truy cập icon Giỏ hàng (góc phải trên cùng) để:</p>
                  <ul class="list-disc pl-5 md:pl-16 space-y-2 mt-2 md:mt-0">
                    <li>Tăng/giảm số lượng hoặc xóa sản phẩm không cần thiết.</li>
                    <li>Kiểm tra các sản phẩm đang được tự động áp dụng mức giá <strong class="text-error">Flash Sale</strong> (nếu có).</li>
                    <li>Xem trước tổng số tiền Tạm tính trước khi qua bước tiếp theo.</li>
                  </ul>
                </section>

                <section>
                  <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30 shrink-0">4</span>
                    Điền thông tin và Thanh toán
                  </h3>
                  <div class="pl-0 md:pl-11 mt-2 md:mt-0 space-y-3">
                    <p>Nhấp vào nút <strong class="text-primary">"Thanh toán ngay"</strong> và thực hiện các bước cuối cùng:</p>
                    <ul class="list-disc pl-5 space-y-2">
                      <li>Điền đầy đủ và chính xác <strong class="text-white">Thông tin người nhận</strong> (Họ tên, Số điện thoại, Địa chỉ giao hàng chi tiết).</li>
                      <li>Nhập <strong class="text-white">Mã giảm giá/Voucher</strong> (nếu có) vào ô quy định và ấn "Áp dụng" để hệ thống trừ tiền trực tiếp.</li>
                      <li>Lựa chọn phương thức thanh toán phù hợp: Nhận hàng trả tiền (COD) hoặc Thanh toán trực tuyến (MoMo/Chuyển khoản).</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30 shrink-0">5</span>
                    Xác nhận & Theo dõi tiến trình
                  </h3>
                  <p class="pl-0 md:pl-11 mt-2 md:mt-0">Sau khi bấm "Đặt hàng", hệ thống sẽ thông báo giao dịch thành công kèm Mã đơn hàng. Bất cứ lúc nào, bạn cũng có thể click vào Avatar > chọn <strong class="text-white">"Đơn hàng của tôi"</strong> để theo dõi tiến trình: <em class="text-outline">Chờ duyệt → Đang đóng gói → Đang vận chuyển → Đã giao</em>.</p>
                </section>
              </div>

              <div class="mt-12 bg-tertiary/10 border border-tertiary/30 p-5 md:p-8 rounded-2xl flex flex-col md:flex-row gap-3 md:gap-5 items-start relative overflow-hidden shadow-lg shadow-tertiary/5">
                <div class="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8">
                  <span class="material-symbols-outlined text-[120px] text-tertiary">rocket_launch</span>
                </div>
                <span class="material-symbols-outlined text-tertiary text-3xl mt-1 relative z-10">info</span>
                <div class="relative z-10">
                  <h4 class="font-headline text-lg font-bold mb-3 uppercase tracking-widest text-tertiary">Quy định riêng cho hàng Đặt Trước (Pre-order)</h4>
                  <ul class="list-disc pl-5 space-y-2 text-sm text-white/90 leading-relaxed">
                    <li>Hàng Pre-order là những siêu phẩm chưa chính thức phát hành hoặc đang được sản xuất giới hạn.</li>
                    <li>Khi đặt hàng, bạn không cần thanh toán toàn bộ mà chỉ cần thanh toán một khoản <strong class="text-tertiary font-bold">Tiền cọc tối thiểu</strong> để giữ suất mua giá tốt.</li>
                    <li>Đơn hàng sẽ tạm ở trạng thái "Đã cọc". Khi hàng chính thức cập bến kho Việt Nam, nhân viên chăm sóc khách hàng sẽ liên hệ trực tiếp qua SĐT/Email để hướng dẫn bạn thanh toán nốt phần tiền còn lại và nhận hàng.</li>
                  </ul>
                </div>
              </div>
            </article>
  
            <article v-else-if="activeTab === 'shipping'" class="space-y-8 text-on-surface-variant leading-relaxed">
              <h1 class="text-2xl md:text-3xl font-headline font-bold text-white mb-6 md:mb-8 uppercase border-b border-outline-variant/15 pb-4">Chính sách vận chuyển</h1>
            
              <div class="space-y-10">
                <section>
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-2xl">schedule</span>
                      Thời gian giao hàng dự kiến
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="bg-surface-container border border-outline-variant/20 p-5 rounded-xl">
                        <h4 class="font-bold text-white mb-2 border-b border-outline-variant/20 pb-2">Nội thành TP. Hải Phòng & Hà Nội</h4>
                        <p class="text-3xl font-headline font-bold text-primary my-2">1 - 2 <span class="text-sm font-medium text-on-surface-variant">ngày làm việc</span></p>
                        <p class="text-sm">Hỗ trợ giao hỏa tốc (trong ngày) theo yêu cầu qua Hotline.</p>
                      </div>
                      <div class="bg-surface-container border border-outline-variant/20 p-5 rounded-xl">
                        <h4 class="font-bold text-white mb-2 border-b border-outline-variant/20 pb-2">Các tỉnh thành khác</h4>
                        <p class="text-3xl font-headline font-bold text-tertiary my-2">3 - 5 <span class="text-sm font-medium text-on-surface-variant">ngày làm việc</span></p>
                        <p class="text-sm">Thời gian có thể chênh lệch tùy thuộc vào đơn vị vận chuyển.</p>
                      </div>
                    </div>
                    <p class="mt-4 text-sm italic">* Đối với hàng Pre-order, thời gian vận chuyển sẽ được tính từ lúc mô hình chính thức cập bến kho FigureCollect tại Việt Nam.</p>
                </section>

                <section>
                    <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                      Chi phí vận chuyển
                    </h3>
                    <ul class="list-disc pl-6 space-y-2">
                      <li><strong class="text-white">Miễn phí vận chuyển (Freeship)</strong> cho tất cả đơn hàng có tổng giá trị thanh toán từ <strong class="text-primary">2.000.000 VNĐ</strong> trở lên.</li>
                      <li>Đối với đơn hàng dưới 2.000.000 VNĐ, phí vận chuyển đồng giá <strong class="text-white">30.000 VNĐ</strong> áp dụng trên toàn quốc.</li>
                      <li>Phí giao hỏa tốc (nếu khách hàng có nhu cầu) sẽ được tính theo biểu phí của đơn vị vận chuyển (Ahamove, Grab,...) tại thời điểm phát sinh.</li>
                    </ul>
                </section>

                <section>
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-2xl">inventory_2</span>
                      Tiêu chuẩn đóng gói "Chuẩn Collector"
                    </h3>
                    <p class="mb-4">Chúng tôi thấu hiểu rằng đối với dân sưu tập, Box (Hộp đựng mô hình) cũng quan trọng không kém gì bản thân mô hình. Vì vậy, 100% đơn hàng tại FigureCollect đều trải qua quy trình đóng gói nghiêm ngặt:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div class="bg-surface-container-highest p-4 md:p-5 rounded-xl border border-outline-variant/10">
                        <span class="material-symbols-outlined text-4xl text-primary mb-2">layers</span>
                        <h4 class="font-bold text-white text-sm mb-1">Bọc Xốp Foam 3 Lớp</h4>
                        <p class="text-[11px]">Bảo vệ toàn diện, chống va đập trực tiếp vào Artbox.</p>
                      </div>
                      <div class="bg-surface-container-highest p-4 md:p-5 rounded-xl border border-outline-variant/10">
                        <span class="material-symbols-outlined text-4xl text-tertiary mb-2">check_box_outline_blank</span>
                        <h4 class="font-bold text-white text-sm mb-1">Gia Cố Góc Cạnh</h4>
                        <p class="text-[11px]">Sử dụng nẹp góc cứng để chống móp méo 8 góc của hộp.</p>
                      </div>
                      <div class="bg-surface-container-highest p-4 md:p-5 rounded-xl border border-outline-variant/10">
                        <span class="material-symbols-outlined text-4xl text-secondary mb-2">unarchive</span>
                        <h4 class="font-bold text-white text-sm mb-1">Thùng Carton Dày 5 Lớp</h4>
                        <p class="text-[11px]">Lớp áo giáp ngoài cùng vững chắc trước mọi thời tiết.</p>
                      </div>
                    </div>
                </section>

                <div class="mt-8 bg-error/10 border border-error/30 p-6 rounded-xl flex gap-4 items-start shadow-lg shadow-error/5">
                    <span class="material-symbols-outlined text-error text-3xl mt-1 animate-pulse">warning</span>
                    <div>
                    <h4 class="font-headline text-lg font-bold mb-2 uppercase tracking-widest text-error">Quy định Đồng kiểm & Nhận hàng</h4>
                    <ul class="list-disc pl-5 space-y-2 text-sm text-white/90">
                      <li>Quý khách vui lòng <strong class="text-error font-bold">QUAY VIDEO LIỀN MẠCH, KHÔNG CẮT GHÉP</strong> toàn bộ quá trình mở kiện hàng (từ lúc hộp carton còn nguyên băng keo của shop).</li>
                      <li>Video unboxing là bằng chứng <strong class="underline">bắt buộc</strong> để FigureCollect hỗ trợ khiếu nại với đơn vị vận chuyển hoặc đổi trả nếu có rủi ro hư gãy mô hình bên trong.</li>
                      <li>Nếu thấy kiện hàng bên ngoài có dấu hiệu bẹp nát nghiêm trọng, rách thủng hoặc băng keo bị rọc xé, quý khách có quyền <strong>Từ chối nhận hàng</strong> và liên hệ ngay Hotline 0795.209.255 để được hỗ trợ.</li>
                    </ul>
                    </div>
                </div>
              </div>
            </article>
  
            <article v-else-if="activeTab === 'return'" class="space-y-8 text-on-surface-variant leading-relaxed">
              <h1 class="text-2xl md:text-3xl font-headline font-bold text-white mb-6 md:mb-8 uppercase border-b border-outline-variant/15 pb-4">Chính sách đổi trả & Bảo hành</h1>
            
              <div class="space-y-10">
                <section>
                  <h3 class="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-2xl">task_alt</span>
                    1. Các trường hợp ĐƯỢC hỗ trợ đổi/trả
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-surface-container border border-outline-variant/20 p-5 rounded-xl">
                        <h4 class="font-bold text-white mb-2 flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm text-primary">factory</span> Lỗi từ Nhà sản xuất
                        </h4>
                        <ul class="list-disc pl-5 text-sm space-y-1">
                          <li>Gãy, vỡ chi tiết bên trong dù hộp (vỉ blister) vẫn còn nguyên seal.</li>
                          <li>Thiếu part (phụ kiện, đế base, tay thay thế,...).</li>
                          <li>Lỗi sơn lem nhem diện rộng, sai màu nghiêm trọng, lắp ráp sai khớp từ xưởng.</li>
                        </ul>
                    </div>
                    <div class="bg-surface-container border border-outline-variant/20 p-5 rounded-xl">
                        <h4 class="font-bold text-white mb-2 flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm text-primary">local_shipping</span> Lỗi Vận chuyển / Sai đơn
                        </h4>
                        <ul class="list-disc pl-5 text-sm space-y-1">
                          <li>Giao sai mẫu mã, sai phiên bản, hoặc sai nhân vật so với đơn đặt hàng.</li>
                          <li>Mô hình bị gãy vỡ nặng nề do lực tác động mạnh trong quá trình vận chuyển (bắt buộc phải có video unbox chứng minh kiện hàng bên ngoài bị móp rách trước khi khui).</li>
                        </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 class="text-xl font-bold text-error mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-2xl">block</span>
                    2. Các trường hợp KHÔNG hỗ trợ đổi/trả
                  </h3>
                  <ul class="list-disc pl-6 space-y-3 bg-surface-container-highest border border-outline-variant/10 p-6 rounded-xl">
                    <li><strong class="text-white">Không có Video Unbox:</strong> Mọi khiếu nại không kèm video quay liền mạch từ lúc nguyên kiện, chưa rọc rách băng keo sẽ bị từ chối.</li>
                    <li><strong class="text-white">Lỗi ngoại quan nhỏ (Minor Defect):</strong> Các lỗi như chấm sơn nhỏ, xước dăm siêu mờ, lem sơn cực nhẹ ở các góc khuất. (Đây là tình trạng chung của ngành công nghiệp sản xuất hàng loạt, mong quý khách thông cảm).</li>
                    <li><strong class="text-white">Hư hỏng do người dùng:</strong> Bẻ gãy khớp do dùng lực quá mạnh, làm rơi rớt, hoặc bảo quản sai cách (để nơi quá nóng làm chảy nhựa, bay màu).</li>
                    <li><strong class="text-white">Chỉ móp méo Box ngoài:</strong> Nếu hộp carton hoặc Artbox bị móp góc nhẹ nhưng vỉ nhựa và mô hình bên trong hoàn toàn an toàn, FigureCollect xin phép không hỗ trợ đổi trả vì Box chỉ có tác dụng bảo vệ nhân vật.</li>
                  </ul>
                </section>

                <section>
                  <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-2xl">sync</span>
                    3. Quy trình 4 bước xử lý đổi trả
                  </h3>
                  <div class="relative pl-4 border-l-2 border-primary/30 space-y-8">
                    <div class="relative">
                      <span class="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background"></span>
                      <h4 class="font-bold text-white">Bước 1: Báo cáo sự cố (Trong vòng 3 ngày)</h4>
                      <p class="text-sm mt-1">Kể từ khi hệ thống báo giao hàng thành công, quý khách có tối đa 3 ngày để liên hệ với FigureCollect qua Zalo/Fanpage, cung cấp Video Unbox và hình ảnh chụp cận cảnh chỗ bị lỗi.</p>
                    </div>
                    <div class="relative">
                      <span class="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-surface-container border-2 border-primary ring-4 ring-background"></span>
                      <h4 class="font-bold text-white">Bước 2: Chờ xét duyệt</h4>
                      <p class="text-sm mt-1">Đội ngũ Kỹ thuật sẽ xem xét bằng chứng và phản hồi phương án giải quyết (Đổi mới, Hoàn tiền, hoặc Đền bù một phần) trong vòng 24 - 48 giờ làm việc.</p>
                    </div>
                    <div class="relative">
                      <span class="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-surface-container border-2 border-primary ring-4 ring-background"></span>
                      <h4 class="font-bold text-white">Bước 3: Đóng gói hoàn trả</h4>
                      <p class="text-sm mt-1">Nếu được xác nhận đổi/trả, quý khách vui lòng đóng gói lại toàn bộ mô hình, phụ kiện, vỉ nhựa và Artbox cẩn thận như lúc nhận để gửi về kho của Shop. (Shop sẽ chịu 100% phí ship 2 chiều cho kiện hàng này).</p>
                    </div>
                    <div class="relative">
                      <span class="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background"></span>
                      <h4 class="font-bold text-white">Bước 4: Nhận sản phẩm mới / Hoàn tiền</h4>
                      <p class="text-sm mt-1">Ngay khi nhận được hàng hoàn và kiểm tra tình trạng đúng như báo cáo, Shop sẽ lập tức gửi kiện hàng mới hoặc chuyển khoản hoàn tiền 100% giá trị sản phẩm (theo thỏa thuận) cho quý khách.</p>
                    </div>
                  </div>
                </section>
              </div>
            </article>

            <article v-else-if="activeTab === 'payment'" class="space-y-6 text-on-surface-variant">
              <h1 class="text-2xl md:text-3xl font-headline font-bold text-white mb-6 md:mb-8 uppercase border-b border-outline-variant/15 pb-4">Chính sách thanh toán</h1>

              <section>
                <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">account_balance_wallet</span>
                  1. Các phương thức thanh toán
                </h3>
                <p class="mb-3">Để mang đến trải nghiệm mua sắm tiện lợi nhất, FigureCollect hỗ trợ các phương thức thanh toán sau:</p>
                <ul class="list-disc pl-6 space-y-2">
                  <li><strong class="text-white">Thanh toán khi nhận hàng (COD):</strong> Quý khách thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận và kiểm tra sản phẩm. (Chỉ áp dụng cho đơn hàng có sẵn).</li>
                  <li><strong class="text-white">Chuyển khoản Ngân hàng / Ví điện tử (MoMo):</strong> Thanh toán an toàn, nhanh chóng thông qua quét mã QR. Hệ thống sẽ tự động xác nhận đơn hàng sau khi giao dịch thành công.</li>
                </ul>
              </section>

                <section>
                  <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">gavel</span>
                    2. Quy định đối với Hàng Đặt Trước (Pre-order)
                  </h3>
                  <div class="bg-surface-container-highest border border-outline-variant/30 p-5 rounded-xl">
                    <ul class="list-disc pl-4 space-y-2">
                        <li>Khách hàng cần thanh toán <strong>Tiền cọc (Deposit)</strong> theo mức quy định của từng sản phẩm để xác nhận giữ chỗ.</li>
                        <li>Số tiền còn lại sẽ được thanh toán khi hàng cập bến Việt Nam (Shop sẽ gọi điện/gửi email thông báo).</li>
                        <li><span class="text-error font-bold">Lưu ý quan trọng:</span> Tiền cọc sẽ <strong>không được hoàn lại</strong> nếu quý khách tự ý hủy đơn hàng sau khi hãng đã chốt số lượng.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 class="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">security</span>
                    3. Bảo mật thanh toán
                  </h3>
                  <p>FigureCollect cam kết bảo mật tuyệt đối thông tin thanh toán của quý khách. Mọi giao dịch chuyển khoản đều được thực hiện thông qua cổng thanh toán mã hóa an toàn của các đối tác ngân hàng và ví điện tử.</p>
                </section>
            </article>
          </div>
        </main>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import TheHeader from '../../components/TheHeader.vue';
  
  const route = useRoute();
  const router = useRouter();
  
  const activeTab = ref('guide');
  
  const changeTab = (tabName) => {
    activeTab.value = tabName;
    router.push({ path: '/support', query: { tab: tabName } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  watch(() => route.query.tab, (newTab) => {
    if (newTab && ['guide', 'shipping', 'return', 'payment'].includes(newTab)) {
        activeTab.value = newTab;
    }
  });

  const scrollToTopCustom = (duration = 1000) => {
    const startPosition = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      let progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Thực hiện cuộn
      window.scrollTo(0, startPosition * (1 - easeProgress));

      // Nếu chưa hết thời gian thì tiếp tục gọi animation
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  onMounted(() => {
    scrollToTopCustom();
    if (route.query.tab && ['guide', 'shipping', 'return', 'payment'].includes(route.query.tab)) {
        activeTab.value = route.query.tab;
    }
  });
</script>
  
<style scoped>
  .glass-panel {
    background: rgba(28, 31, 43, 0.4);
    backdrop-filter: blur(16px);
  }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #464752; border-radius: 10px; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
</style>