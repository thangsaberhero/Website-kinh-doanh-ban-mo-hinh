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
const MulterStorageCloudinary = require('multer-storage-cloudinary');

// 1. Cấu hình chìa khóa Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Hàm tạo kho lưu trữ thông minh (Tự thích ứng mọi phiên bản)
const createUploader = (folderName) => {
    let storage;
    
    if (MulterStorageCloudinary.CloudinaryStorage) {
        // Cú pháp dành cho thư viện phiên bản mới (v4+)
        storage = new MulterStorageCloudinary.CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: `FigureCollect/${folderName}`,
                allowedFormats: ['jpg', 'png', 'jpeg', 'webp']
            }
        });
    } else {
        // Cú pháp dành cho thư viện phiên bản cũ (v2)
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
    uploadUser: createUploader('Images_user')
};