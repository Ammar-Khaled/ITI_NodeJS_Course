const multer = require('multer');
const APIError = require('../utils/APIError');


const storage = multer.memoryStorage();

const profilePictureFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new APIError('Only JPG and PNG images are allowed for profile pictures', 400), false);
    }
};

const uploadProfilePicture = multer({
    storage: storage,
    fileFilter: profilePictureFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1
    }
}).single('profilePicture');

const postImageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new APIError('Only JPG, PNG, and WebP images are allowed for posts', 400), false);
    }
};

const uploadPostImages = multer({
    storage: storage,
    fileFilter: postImageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10 // Maximum 10 images per upload
    }
}).array('images', 10);


module.exports = {
    uploadProfilePicture,
    uploadPostImages
};
