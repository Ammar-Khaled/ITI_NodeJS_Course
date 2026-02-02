const Post = require('../models/post.model');
const APIError = require('../utils/APIError');
const imageKitService = require('./imageKit');

// Create a new post
exports.createPost = async (postData) => {
    return await Post.create(postData);
};

// Get all posts with pagination
exports.getAllPosts = async (page, limit, userId) => {
    const posts = await Post.find({}).populate('userId', 'name email')
        .skip((page - 1) * limit)
        .limit(limit);

    // Convert to plain objects and add isOwner flag
    const postsWithOwnership = posts.map(post => {
        const postObj = post.toObject();
        postObj.isOwner = postObj.userId._id.toString() === userId;
        return postObj;
    });

    const total = await Post.countDocuments();

    return [postsWithOwnership, total];
};

// Get post by ID
exports.getPostById = async (id, userId) => {
    const post = await Post.findOne({ _id: id }).populate('userId', 'name email');
    if (!post) {
        return null;
    }

    const postObj = post.toObject();
    postObj.isOwner = postObj.userId._id.toString() === userId;
    return postObj;
};

// Update post by ID
exports.updatePost = async (id, updateData, userId) => {
    const post = await Post.findOne({ _id: id });
    if (!post) {
        return null;
    }

    if (post.userId.toString() !== userId) {
        throw new APIError('Not the author', 403);
    }

    const updatedPost = await Post.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true }
    ).populate('userId', 'name email');

    const postObj = updatedPost.toObject();
    postObj.isOwner = postObj.userId._id.toString() === userId;

    return postObj;
}


// Delete post by ID
exports.deletePost = async (id, userId) => {
    const post = await Post.findOne({ _id: id });
    if (!post) {
        return null;
    }

    if (post.userId.toString() !== userId) {
        throw new APIError('Not the author', 403);
    }

    return await Post.findOneAndDelete({ _id: id });
};

// Upload images to post
exports.uploadPostImages = async (postId, userId, files) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new APIError('Post not found', 404);
    }

    if (post.userId.toString() !== userId) {
        throw new APIError('Only post author can upload images', 403);
    }

    const uploadedImages = [];

    for (const file of files) {
        const fileName = `post-${postId}-${Date.now()}`;
        const result = await imageKitService.uploadImage(file.buffer, 'post-images', fileName, {
            compress: true,
            mimeType: file.mimetype,
            compressionOptions: { maxWidth: 1920, maxHeight: 1080, quality: 80 }
        });

        uploadedImages.push({
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            lazyLoad: imageKitService.getLazyLoadUrls(result.url, 800),
        });
    }

    // Not saving the lazyLoad
    const imagesToSave = uploadedImages.map(({ url, fileId, name }) => ({ url, fileId, name }));
    post.images.push(...imagesToSave);
    await post.save();

    return {
        images: uploadedImages,
        totalImages: post.images.length
    };
};

// Delete post image
exports.deletePostImage = async (postId, imageId, userId) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new APIError('Post not found', 404);
    }

    if (post.userId.toString() !== userId) {
        throw new APIError('Only post author can delete images', 403);
    }

    const imageIndex = post.images.findIndex(img => img._id.toString() === imageId);

    if (imageIndex === -1) {
        throw new APIError('Image not found in post', 404);
    }

    const image = post.images[imageIndex];

    await imageKitService.deleteImage(image.fileId);

    post.images.splice(imageIndex, 1);
    await post.save();

    return { message: 'Image deleted successfully', remainingImages: post.images.length };
};
