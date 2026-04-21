const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploader = (folderName) => {
    const dir = `public/${folderName}/`;
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, dir); 
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

    return multer({ storage: storage });
};

module.exports = {
    uploadNews: createUploader('Images_news'),
    uploadReview: createUploader('Images_review'),
};