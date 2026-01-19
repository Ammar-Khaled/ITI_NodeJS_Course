const Post = require('../models/post.model');

// Create a new post
exports.createPost = async (postData) => {
    return await Post.create(postData);
};

// Get all posts with pagination
exports.getAllPosts = async (page, limit) => {
    const postsPromise = Post.find({})
        .skip((page - 1) * limit)
        .limit(limit);
    const totalPromise = Post.countDocuments();

    return await Promise.all([postsPromise, totalPromise]);
};

// Get post by ID
exports.getPostById = async (id) => {
    return await Post.findOne({ _id: id });
};

// Update post by ID
exports.updatePost = async (id, updateData) => {
    return await Post.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true }
    );
};

// Delete post by ID
exports.deletePost = async (id) => {
    return await Post.findOneAndDelete({ _id: id });
};
