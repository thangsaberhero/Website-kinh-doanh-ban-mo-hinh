<template>
    <div class="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
        <TheHeader />
  
        <main class="flex-1">
            <section class="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div class="absolute inset-0 z-0">
                    <img class="w-full h-full object-cover brightness-50 contrast-125" alt="Showroom Background" src="https://cdn-media.sforum.vn/storage/app/media/CTVSEO_Maihue/H%C3%ACnh%20n%E1%BB%81n%20Gundam/hinh-nen-gundam-51.jpg"/>
                    <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                </div>
                <div class="relative z-10 text-center px-4 mt-16">
                    <h1 class="font-headline text-5xl md:text-7xl lg:text-8xl font-black italic text-primary tracking-tighter neon-glow mb-4 uppercase">
                        Contact Us
                    </h1>
                    <p class="font-headline text-lg md:text-xl text-on-surface-variant tracking-[0.3em] uppercase font-bold">
                        Kết nối với thế giới sưu tầm
                    </p>
                </div>
            </section>
    
            <section class="relative z-20 -mt-24 px-6 pb-24 max-w-7xl mx-auto">
                <div class="bg-surface rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">         
                    <div class="lg:w-2/5 p-8 md:p-12 bg-white/5 border-r border-white/5 relative overflow-hidden">
                        <div class="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
                        <h2 class="font-headline text-3xl font-bold text-white mb-4 relative z-10">Thông tin liên hệ</h2>
                        <p class="text-on-surface-variant text-sm mb-10 leading-relaxed relative z-10">
                            Chúng tôi luôn sẵn sàng hỗ trợ bạn tìm kiếm những mẫu Figure độc bản và giải đáp mọi thắc mắc về hệ thống.
                        </p>
                    
                        <div class="space-y-8 relative z-10">
                            <div class="flex items-start gap-4 group">
                                <div class="w-12 h-12 shrink-0 rounded-xl bg-background flex items-center justify-center border border-white/10 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(255,61,0,0.3)] transition-all">
                                    <span class="material-symbols-outlined text-primary">location_on</span>
                                </div>
                                <div class="pt-1">
                                    <h4 class="font-headline text-[10px] font-black text-primary tracking-widest uppercase mb-1">Địa chỉ</h4>
                                    <p class="text-white text-sm font-medium">Phường Ngô Quyền, TP. Hải Phòng</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-4 group">
                                <div class="w-12 h-12 shrink-0 rounded-xl bg-background flex items-center justify-center border border-white/10 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(255,61,0,0.3)] transition-all">
                                    <span class="material-symbols-outlined text-primary">call</span>
                                </div>
                                <div class="pt-1">
                                    <h4 class="font-headline text-[10px] font-black text-primary tracking-widest uppercase mb-1">Hotline</h4>
                                    <p class="text-white text-lg font-bold">0795.209.255</p>
                                    <p class="text-on-surface-variant text-xs mt-0.5">Thứ 2 - Chủ Nhật: 08:00 - 22:00</p>
                                </div>
                            </div>
                            
                            <div class="flex items-start gap-4 group">
                                <div class="w-12 h-12 shrink-0 rounded-xl bg-background flex items-center justify-center border border-white/10 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(255,61,0,0.3)] transition-all">
                                    <span class="material-symbols-outlined text-primary">mail</span>
                                </div>
                                <div class="pt-1">
                                    <h4 class="font-headline text-[10px] font-black text-primary tracking-widest uppercase mb-1">Email</h4>
                                    <p class="text-white text-sm font-medium">vuhongphong04@gmail.com</p>
                                </div>
                            </div>
                        </div>
            
                        <div class="mt-12 pt-8 border-t border-white/10 relative z-10">
                            <h4 class="font-headline text-[10px] text-on-surface-variant tracking-widest uppercase font-bold mb-4">Kết nối qua Social</h4>
                            <div class="flex gap-4">
                                <a href="#" class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:border-primary hover:bg-primary/20 transition-all"><span class="material-symbols-outlined text-xl">public</span></a>
                                <a href="#" class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:border-primary hover:bg-primary/20 transition-all"><span class="material-symbols-outlined text-xl">smart_display</span></a>
                                <a href="#" class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:border-primary hover:bg-primary/20 transition-all"><span class="material-symbols-outlined text-xl">camera_alt</span></a>
                            </div>
                        </div>
                    </div>
        
                    <div class="lg:w-3/5 p-8 md:p-12">
                        <h3 class="font-headline text-2xl font-bold text-white mb-8">Gửi tin nhắn cho chúng tôi</h3>
                    
                        <form @submit.prevent="submitForm" class="space-y-8">
                            <div class="grid md:grid-cols-2 gap-8">
                                <div class="relative">
                                    <label class="block text-[14px] font-headline text-primary font-bold tracking-widest uppercase mb-2">Họ và tên *</label>
                                    <input v-model="form.name" required type="text" placeholder="Nhập tên của bạn" 
                                        class="w-full bg-transparent border-0 border-b border-white/20 focus:border-primary focus:ring-0 transition-colors text-white py-2 px-0 placeholder:text-white/20 text-sm"/>
                                </div>
                                <div class="relative">
                                    <label class="block text-[14px] font-headline text-primary font-bold tracking-widest uppercase mb-2">Email *</label>
                                    <input v-model="form.email" required type="email" placeholder="Nhập email của bạn" autocomplete="email"
                                        class="w-full bg-transparent border-0 border-b border-white/20 focus:border-primary focus:ring-0 transition-colors text-white py-2 px-0 placeholder:text-white/20 text-sm"/>
                                </div>
                            </div>
                            
                            <div class="relative">
                                <label class="block text-[14px] font-headline text-primary font-bold tracking-widest uppercase mb-2">Số điện thoại</label>
                                <input v-model="form.phone" type="tel" placeholder="Nhập số điện thoại của bạn" 
                                    class="w-full bg-transparent border-0 border-b border-white/20 focus:border-primary focus:ring-0 transition-colors text-white py-2 px-0 placeholder:text-white/20 text-sm"/>
                            </div>
                            
                            <div class="relative">
                                <label class="block text-[14px] font-headline text-primary font-bold tracking-widest uppercase mb-2">Lời nhắn *</label>
                                <textarea v-model="form.message" required rows="4" placeholder="Nội dung ..." 
                                    class="w-full bg-transparent border-0 border-b border-white/20 focus:border-primary focus:ring-0 transition-colors text-white py-2 px-0 placeholder:text-white/20 resize-none text-sm"></textarea>
                            </div>
                            
                            <div class="pt-6">
                                <button :disabled="isSubmitting" type="submit" 
                                        class="w-full sm:w-auto px-10 py-4 bg-primary text-black font-headline font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group">
                                    <span v-if="!isSubmitting && !submitSuccess">GỬI TIN NHẮN</span>
                                    <span v-if="isSubmitting" class="flex items-center gap-2">
                                        <span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> ĐANG GỬI...
                                    </span>
                                    <span v-if="submitSuccess" class="flex items-center gap-2 text-green-700">
                                        <span class="material-symbols-outlined text-sm">check_circle</span> THÀNH CÔNG
                                    </span>
                                    <span v-if="!isSubmitting && !submitSuccess" class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
    
            <section class="w-full bg-surface py-20 border-t border-white/5">
                <div class="max-w-7xl mx-auto px-6">
                    <div class="flex items-center gap-4 mb-10">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                            <span class="material-symbols-outlined text-primary">explore</span>
                        </div>
                        <h3 class="font-headline text-2xl font-bold tracking-tight uppercase text-white">Hệ thống cửa hàng</h3>
                    </div>
                    
                    <div class="relative h-[450px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-surface-variant">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29825.56967170584!2d106.68348336167409!3d20.8641403195122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a7ac36d54cd99%3A0x744b1317d1a1c23b!2zTmfDtCBRdXnhu4FuLCBI4bqjaSBQaMOybmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1774884746827!5m2!1svi!2s" 
                            class="absolute inset-0 w-full h-full border-0 filter grayscale-[20%] invert-[90%] hue-rotate-[180deg] contrast-[1.1] opacity-80 hover:opacity-100 transition-opacity duration-500" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                        
                        <div class="absolute top-6 left-6 pointer-events-none">
                            <div class="bg-background/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span class="text-white font-headline font-bold text-[10px] tracking-widest uppercase">Ngô Quyền, Hải Phòng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>
  
<script setup>
    import { ref } from 'vue';
    import TheHeader from '../../components/TheHeader.vue';
    import { useToastStore } from '../../stores/toast'

    const toastStore = useToastStore();
    const form = ref({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const isSubmitting = ref(false);
    const submitSuccess = ref(false);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const submitForm = async () => {
        isSubmitting.value = true;

        try {
            const res = await fetch('${API_BASE_URL}/api/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.value.name,
                    email: form.value.email,
                    phone: form.value.phone,
                    message: form.value.message
                })
            });

            const data = await res.json();

            if (res.ok) {
                submitSuccess.value = true;
                form.value = { name: '', email: '', phone: '', message: '' };
                toastStore.showToast("Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ trả lời bạn sớm nhất có thể.", "success");

                setTimeout(() => { 
                    submitSuccess.value = false; 
                }, 3000);
            } else {
                toastStore.showToast(data.message || "Có lỗi xảy ra khi gửi", "error");
            }
        } catch (error) {
            console.error("Lỗi gửi liên hệ:", error);
            toastStore.showToast("Lỗi kết nối đến máy chủ", "error");
        } finally {
            isSubmitting.value = false;
        }
    };
</script>

<style scoped>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&display=swap');

    .font-headline { font-family: 'Space Grotesk', sans-serif; }
    .font-body { font-family: 'Manrope', sans-serif; }

    .neon-glow {
        text-shadow: 0 0 10px rgba(255, 61, 0, 0.5), 0 0 30px rgba(255, 61, 0, 0.3);
    }
</style>