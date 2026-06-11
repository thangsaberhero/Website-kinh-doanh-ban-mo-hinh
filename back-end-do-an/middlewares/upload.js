const multer = require('multer');
const cloudinary = require('cloudinary');
const MulterStorageCloudinary = require('multer-storage-cloudinary');

// 1. Cấu hình chìa khóa Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Hàm tạo kho lưu trữ thông minh (Tự thích ứng mọi phiên bản)
const createUploader = (folderName) => {
    let storage;
    
    if (MulterStorageCloudinary.CloudinaryStorage) {
        storage = new MulterStorageCloudinary.CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: `FigureCollect/${folderName}`,
                allowedFormats: ['jpg', 'png', 'jpeg', 'webp']
            }
        });
    } else {
        storage = MulterStorageCloudinary({
            cloudinary: cloudinary,
            folder: `FigureCollect/${folderName}`,
            allowedFormats: ['jpg', 'png', 'jpeg', 'webp']
        });
    }

    return multer({ storage: storage });
};

// 3. Xuất các cổng upload để Route sử dụng
module.exports = {
    uploadNews: createUploader('Images_news'),
    uploadReview: createUploader('Images_review'),
    uploadBrand: createUploader('Images_brand'),
    uploadProduct: createUploader('Images_product'),
    uploadUser: createUploader('Images_user'),
    uploadCategory: createUploader('Image_category'),
    uploadHomeSlider: createUploader('Image_home'),
    uploadLoginSlider: createUploader('Image_login'),
    uploadRegisterSlider: createUploader('Image_slider'),
    uploadLogo: createUploader('Image_logo'),
    uploadLogoHeader: createUploader('Image_logo_header')
};