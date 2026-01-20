const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');

// Create a new post
router.post('/', validate(schemas.posts.createPostSchema), postController.createPost);

// Get all posts
router.get('/', validate(schemas.posts.getAllPostsSchema), postController.getAllPosts);

// Get post by ID
router.get('/:id', postController.getPostById);

// Update post by ID
router.patch('/:id', validate(schemas.posts.updatePostSchema), postController.updatePost);

// Delete post by ID
router.delete('/:id', postController.deletePost);

module.exports = router;
