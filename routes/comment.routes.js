const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');

// Apply authentication to all routes
router.use(authenticate);

// Create a new comment
router.post('/', authenticate, validate(schemas.comments.createCommentSchema), commentController.createComment);

// Get all comments (with optional postId filter)
router.get('/', validate(schemas.comments.getAllCommentsSchema), commentController.getAllComments);

// Get comment by ID
router.get('/:id', commentController.getCommentById);

// Update comment by ID (author only)
router.patch('/:id', validate(schemas.comments.updateCommentSchema), commentController.updateComment);

// Delete comment by ID (author or post author)
router.delete('/:id', commentController.deleteComment);

module.exports = router;
