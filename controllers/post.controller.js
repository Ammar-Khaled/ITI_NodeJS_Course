const postService = require('../services/post.service');
const APIError = require('../utils/APIError');

// Create a new post
exports.createPost = async (req, res) => {
    const { title, content, tags, published, likes } = req.body;
    const { userId } = req.user;

    const post = await postService.createPost({ title, content, tags, published, likes, userId });

    res.status(201).json({ message: "Post created successfully", data: post });
};

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);
    const { userId } = req.user;

    const [posts, total] = await postService.getAllPosts(page, limit, userId);

    res.json({
        message: "Posts fetched successfully",
        data: posts,
        pagenation: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
};

// Get post by ID
exports.getPostById = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const post = await postService.getPostById(id, userId);

    if (!post) {
        throw new APIError("Post not found", 404);
    }

    res.json({ message: "Post fetched successfully", data: post });
};

// Update post by ID
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { title, content, tags, published, likes } = req.body;

    const updatedPost = await postService.updatePost(id, { title, content, tags, published, likes }, userId);

    if (!updatedPost) {
        throw new APIError("Post not found", 404);
    }

    res.json({ message: "Post updated successfully", data: updatedPost });
};

// Delete post by ID
exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const deletedPost = await postService.deletePost(id, userId);

    if (!deletedPost) {
        throw new APIError("Post not found", 404);
    }

    res.json({ message: "Post deleted successfully" });
};

// Upload images to post
exports.uploadPostImages = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    if (!req.files || req.files.length === 0) {
        throw new APIError("No files uploaded", 400);
    }

    const result = await postService.uploadPostImages(id, userId, req.files);
    res.json({ message: "Images uploaded successfully", data: result });
};

// Delete post image
exports.deletePostImage = async (req, res) => {
    const { id, imageId } = req.params;
    const { userId } = req.user;

    const result = await postService.deletePostImage(id, imageId, userId);
    res.json(result);
};
