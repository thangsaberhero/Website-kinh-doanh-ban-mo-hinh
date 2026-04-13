<template>
    <footer class="bg-surface-container-lowest border-t border-outline-variant/15 pt-20 pb-10">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div class="lg:col-span-1">
            <a class="font-headline text-2xl font-bold tracking-tighter text-primary mb-6 block" href="#">FigureCollect</a>
            <p class="text-on-surface-variant text-sm leading-relaxed mb-8">
              Điểm đến hàng đầu cho cộng đồng đam mê sưu tập mô hình tại Việt Nam. Chúng tôi mang đến những artifact giá trị nhất từ khắp nơi trên thế giới.
            </p>
            <div class="flex gap-3">
              <a class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant" href="#">
                <span class="material-symbols-outlined text-xl">social_leaderboard</span>
              </a>
              <a class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant" href="#">
                <span class="material-symbols-outlined text-xl">camera</span>
              </a>
              <a class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors text-on-surface-variant" href="#">
                <span class="material-symbols-outlined text-xl">play_circle</span>
              </a>
            </div>
          </div>
          <div>
            <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Hỗ trợ khách hàng</h4>
            <ul class="space-y-4 text-on-surface-variant text-sm">
              <li><a class="hover:text-primary transition-colors" href="#">Hướng dẫn đặt hàng</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Chính sách vận chuyển</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Chính sách đổi trả</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Tra cứu đơn hàng</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Về chúng tôi</h4>
            <ul class="space-y-4 text-on-surface-variant text-sm">
              <li><a class="hover:text-primary transition-colors" href="#">Về FigureCollect</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a></li>
              <li><a class="hover:text-primary transition-colors" href="#">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-headline font-bold text-lg mb-6 text-on-surface">Đăng ký nhận tin</h4>
            <p class="text-on-surface-variant text-sm mb-6 leading-relaxed">Nhận thông báo sớm nhất về các đợt Pre-order giới hạn.</p>
            <div class="relative">
              <input class="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3.5 pl-4 pr-12 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Email của bạn" type="email"/>
              <button class="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-on-primary px-3 rounded flex items-center justify-center hover:brightness-110 transition-all">
                <span class="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
        <div class="border-t border-outline-variant/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-outline font-bold tracking-widest uppercase">
          <div>© 2026 FigureCollect. All rights reserved.</div>
          <div class="flex gap-6">
            <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" class="hover:text-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
</template>