const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');

router.use(authenticate);

// Toggle like on post or comment (authenticated)
router.post(
    '/',
    validate(schemas.likes.toggleLikeSchema),
    likeController.toggleLike
);

// Get likes count
router.get(
    '/count',
    validate(schemas.likes.getLikesCountSchema),
    likeController.getLikesCount
);

// Check if user liked
router.get(
    '/check',
    validate(schemas.likes.checkLikedSchema),
    likeController.checkLiked
);

// Get all likes by a user
router.get(
    '/users/:userId',
    validate(schemas.likes.getUserLikesSchema),
    likeController.getUserLikes
);

module.exports = router;
