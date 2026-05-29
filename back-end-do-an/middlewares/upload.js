// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const createUploader = (folderName) => {
//     const dir = `public/${folderName}/`;
    
//     if (!fs.existsSync(dir)){
//         fs.mkdirSync(dir, { recursive: true });
//     }

//     const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, dir); 
//         },
//         filename: function (req, file, cb) {
//             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//             cb(null, uniqueSuffix + path.extname(file.originalname));
//         }
//     });

//     return multer({ storage: storage });
// };

// module.exports = {
//     uploadNews: createUploader('Images_news'),
//     uploadReview: createUploader('Images_review'),
//     uploadBrand: createUploader('Images_brand')
// };

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Cấu hình chìa khóa kết nối với Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Viết lại hàm tạo Uploader dùng Cloudinary
const createUploader = (folderName) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            // Cloudinary sẽ tự tạo thư mục này trên mây
            folder: `FigureCollect/${folderName}`, 
            // Chỉ cho phép các định dạng ảnh an toàn
            allowedFormats: ['jpg', 'png', 'jpeg', 'webp'], 
        },
    });

    return multer({ storage: storage });
};

// 3. Giữ nguyên hoàn toàn các Export cũ để code ở Route không bị lỗi
module.exports = {
    uploadNews: createUploader('Images_news'),
    uploadReview: createUploader('Images_review'),
    uploadBrand: createUploader('Images_brand'),
    uploadProduct: createUploader('Images_product'), // <--- THÊM DÒNG NÀY ĐỂ CHỨA ẢNH MÔ HÌNH
    uploadUser: createUploader('Images_user')
};