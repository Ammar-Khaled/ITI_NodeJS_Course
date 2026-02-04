const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const bookmarkController = require('../controllers/bookmark.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');
const { authenticate, optionalAuthenticate } = require('../middlewares/authenticate');
const { uploadPostImages } = require('../middlewares/upload');


// Increment view count for a post (authenticated users get duplicate prevention)
router.post('/:id/view', validate(schemas.posts.viewPostSchema), optionalAuthenticate, postController.viewPost);

// Apply authentication to all routes after
router.use(authenticate);

// full-text Search posts by title/content filters (date range, tags)
router.get('/search', validate(schemas.posts.searchPostsSchema), postController.searchPosts);

// Get user's draft posts
router.get('/drafts', validate(schemas.posts.getDraftsSchema), postController.getDrafts);

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

// Publish a draft post (post author only)
router.post('/:id/publish', validate(schemas.posts.publishPostSchema), postController.publishPost);

// Schedule a post for future publication (post author only)
router.post('/:id/schedule', validate(schemas.posts.schedulePostSchema), postController.schedulePost);

// Post images routes
router.post('/:id/images', uploadPostImages, postController.uploadPostImages);
router.delete('/:id/images/:imageId', postController.deletePostImage);

// Get comments for a specific post
router.get('/:postId/comments', commentController.getCommentsByPost);

// Bookmark routes
router.post('/:postId/bookmark', validate(schemas.bookmarks.bookmarkPostSchema), bookmarkController.bookmarkPost);
router.delete('/:postId/bookmark', validate(schemas.bookmarks.removeBookmarkSchema), bookmarkController.removeBookmark);
router.get('/:postId/bookmark/check', validate(schemas.bookmarks.bookmarkPostSchema), bookmarkController.checkBookmarked);

module.exports = router;
