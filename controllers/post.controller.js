const mongoose = require('mongoose');
const postService = require('../services/post.service');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { title, content, author, tags, published, likes } = req.body;

        if (!title || !content || !author || !tags) {
            return res.status(400).json({ message: "Missing requried fields" });
        }

        const post = await postService.createPost({ title, content, author, tags, published, likes });

        res.status(201).json({ message: "Post created successfully", data: post });
    } catch (error) {
        res.status(500).json({ message: "Error creating post", error: error.message });
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
        res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
};

// Get post by ID
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await postService.getPostById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({ message: "Post fetched successfully", data: post });
    } catch (error) {
        res.status(500).json({ message: "Error fetching post", error: error.message });
    }
};

// Update post by ID
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const { title, content, author, tags, published, likes } = req.body;

        const updatedPost = await postService.updatePost(id, { title, content, author, tags, published, likes });

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({ message: "Post updated successfully", data: updatedPost });
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error: error.message });
    }
};

// Delete post by ID
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const deletedPost = await postService.deletePost(id);

        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};
