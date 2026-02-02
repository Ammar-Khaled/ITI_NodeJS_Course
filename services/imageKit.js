const ImageKit = require('@imagekit/nodejs').default;
const sharp = require('sharp');
const APIError = require('../utils/APIError');

// Initialize ImageKit client
const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const compressImage = async (fileBuffer, mimeType, options = {}) => {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 80
    } = options;

    let sharpInstance = sharp(fileBuffer);

    const metadata = await sharpInstance.metadata();

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
        sharpInstance = sharpInstance.resize(maxWidth, maxHeight);
    }

    if (mimeType === 'image/jpg') {
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true, compressionLevel: 9 });
    } else if (mimeType === 'image/png') {
        sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
    } else if (mimeType === 'image/webp') {
        sharpInstance = sharpInstance.webp({ quality, compressionLevel: 9 });
    }

    return sharpInstance.toBuffer();
};

exports.uploadImage = async (fileBuffer, folder, fileName, options = {}) => {
    try {
        const { compress = true, mimeType = 'image/jpeg', compressionOptions = {} } = options;

        let bufferToUpload = fileBuffer;
        if (compress) {
            bufferToUpload = await compressImage(fileBuffer, mimeType, compressionOptions);
        }

        const result = await imageKit.files.upload({
            file: bufferToUpload.toString('base64'),
            fileName: fileName,
            folder: folder,
            useUniqueFileName: true
        });

        return {
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            thumbnailUrl: result.thumbnailUrl
        };
    } catch (error) {
        throw new APIError(`Failed to upload image: ${error.message}`, 500);
    }
};

exports.deleteImage = async (fileId) => {
    try {
        await imageKit.files.delete(fileId);
    } catch (error) {
        throw new APIError(`Failed to delete image: ${error.message}`, 500);
    }
};

exports.getImageUrl = (filePath, transformations = {}) => {
    return imageKit.url({
        path: filePath,
        transformation: [transformations]
    });
};

exports.getThumbnailUrl = (url, width = 150, height = 150) => {
    // Add transformation parameters to ImageKit URL
    if (url && url.includes('imagekit.io')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}tr=w-${width},h-${height},fo-auto`;
    }
    return url;
};

exports.getResizedUrl = (url, width, height = null) => {
    if (url && url.includes('imagekit.io')) {
        const separator = url.includes('?') ? '&' : '?';
        const heightParam = height ? `,h-${height}` : '';
        return `${url}${separator}tr=w-${width}${heightParam},q-80`;
    }
    return url;
};

exports.getLazyLoadPlaceholder = (url) => {
    if (url && url.includes('imagekit.io')) {
        const separator = url.includes('?') ? '&' : '?';
        // Small size, high blur, low quality for fast loading placeholder
        return `${url}${separator}tr=w-50,h-50,bl-30,q-20`;
    }
    return url;
};

exports.getLazyLoadUrls = (url, width = 800, height = null) => {
    return {
        placeholder: exports.getLazyLoadPlaceholder(url),
        full: exports.getResizedUrl(url, width, height),
        original: url
    };
};
