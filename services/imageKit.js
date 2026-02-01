const ImageKit = require('@imagekit/nodejs').default;
const APIError = require('../utils/APIError');

// Initialize ImageKit client
const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

exports.uploadImage = async (fileBuffer, folder, fileName) => {
    try {
        const result = await imageKit.files.upload({
            file: fileBuffer.toString('base64'),
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
