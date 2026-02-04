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

exports.incrementView = async (postId, userId) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new APIError('Post not found', 404);
    }

    if (userId && post.viewedBy.includes(userId)) {
        return {
            message: 'Already viewed',
            views: post.views,
            alreadyViewed: true
        };
    }

    const updateQuery = { $inc: { views: 1 } };
    if (userId) {
        updateQuery.$addToSet = { viewedBy: userId };
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        updateQuery,
        { new: true }
    );

    return {
        message: 'View recorded',
        views: updatedPost.views,
        alreadyViewed: false
    };
};

// Search posts by title/content with filters
exports.searchPosts = async (query, filters, page, limit, userId) => {
    const searchQuery = {};

    // Full-text search on title and content
    if (query) {
        searchQuery.$text = { $search: query };
    }

    if (filters.startDate || filters.endDate) {
        searchQuery.createdAt = {};
        if (filters.startDate) {
            searchQuery.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            searchQuery.createdAt.$lte = new Date(filters.endDate);
        }
    }

    if (filters.tags && filters.tags.length > 0) {
        searchQuery.tags = { $in: filters.tags };
    }

    if (filters.status) {
        searchQuery.status = filters.status;
    }


    console.log(searchQuery);
    let postsQuery = Post.find(searchQuery);

    // Add text score projection and sort by relevance if text search is used
    if (query) {
        postsQuery = postsQuery
            .select({ score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } });
    } else {
        postsQuery = postsQuery.sort({ createdAt: -1 });
    }

    const posts = await postsQuery
        .populate('userId', 'name email')
        .skip((page - 1) * limit)
        .limit(limit);

    console.log(posts);
    const postsWithOwnership = posts.map(post => {
        post.isOwner = post.userId._id.toString() === userId;
        return post;
    });

    const total = await Post.countDocuments(searchQuery);

    return [postsWithOwnership, total];
};

// Get user's draft posts
exports.getUserDrafts = async (userId, page, limit) => {
    const query = { userId, status: 'draft' };

    const drafts = await Post.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email');

    const total = await Post.countDocuments(query);

    return [drafts, total];
};

// Publish a draft post
exports.publishPost = async (postId, userId) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new APIError('Post not found', 404);
    }

    if (post.userId.toString() !== userId) {
        throw new APIError('Only the post author can publish this post', 403);
    }

    if (post.status === 'published') {
        throw new APIError('Post is already published', 400);
    }

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    return post;
};

// Schedule a post for future publication
exports.schedulePost = async (postId, userId, publishedAt) => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new APIError('Post not found', 404);
    }

    if (post.userId.toString() !== userId) {
        throw new APIError('Only the post author can schedule this post', 403);
    }

    if (post.status === 'published') {
        throw new APIError('Cannot schedule an already published post', 400);
    }

    if (publishedAt <= new Date()) {
        throw new APIError('Scheduled date must be in the future', 400);
    }

    post.status = 'scheduled';
    post.publishedAt = publishedAt;  // TBD
    await post.save();

    return post;
};
