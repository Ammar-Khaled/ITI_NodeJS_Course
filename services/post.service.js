const Post = require('../models/post.model');
const APIError = require('../utils/APIError');

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
