const mongoose = require('mongoose');
const postService = require('../services/post.service');
const APIError = require('../utils/APIError');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { title, content, author, tags, published, likes } = req.body;

        const post = await postService.createPost({ title, content, author, tags, published, likes });

        res.status(201).json({ message: "Post created successfully", data: post });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = Number(page);
        limit = Number(limit);

        const [posts, total] = await postService.getAllPosts(page, limit);

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
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Get post by ID
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await postService.getPostById(id);

        if (!post) {
            throw new APIError("Post not found", 404);
        }

        res.json({ message: "Post fetched successfully", data: post });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Update post by ID
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;

        const { title, content, author, tags, published, likes } = req.body;

        const updatedPost = await postService.updatePost(id, { title, content, author, tags, published, likes });

        if (!updatedPost) {
            throw new APIError("Post not found", 404);
        }

        res.json({ message: "Post updated successfully", data: updatedPost });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Delete post by ID
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPost = await postService.deletePost(id);

        if (!deletedPost) {
            throw new APIError("Post not found", 404);
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};
