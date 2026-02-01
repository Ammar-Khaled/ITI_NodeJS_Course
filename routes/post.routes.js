const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const { uploadPostImages } = require('../middlewares/upload');

// Apply authentication to all routes
router.use(authenticate);

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

// Post images routes
router.post('/:id/images', uploadPostImages, postController.uploadPostImages);
router.delete('/:id/images/:imageId', postController.deletePostImage);

// Get comments for a specific post
router.get('/:postId/comments', commentController.getCommentsByPost);

module.exports = router;
