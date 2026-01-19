const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

// Create a new post
router.post('/', postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get post by ID
router.get('/:id', postController.getPostById);

// Update post by ID
router.patch('/:id', postController.updatePost);

// Delete post by ID
router.delete('/:id', postController.deletePost);

module.exports = router;
