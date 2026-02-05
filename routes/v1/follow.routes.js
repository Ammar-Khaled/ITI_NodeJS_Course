const express = require('express');
const router = express.Router();
const followController = require('../../controllers/follow.controller');
const schemas = require('../../schemas');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');


// Get followers of a user (public)
router.get(
    '/:userId/followers',
    validate(schemas.follows.getFollowersSchema),
    followController.getFollowers
);

// Get users that a user is following (public)
router.get(
    '/:userId/following',
    validate(schemas.follows.getFollowingSchema),
    followController.getFollowing
);

// Get follow counts for a user (public)
router.get(
    '/:userId/follow-counts',
    validate(schemas.follows.getFollowCountsSchema),
    followController.getFollowCounts
);

// Check if authenticated user is following a user (authenticated)
router.get(
    '/:userId/follow/check',
    authenticate,
    validate(schemas.follows.checkFollowingSchema),
    followController.checkFollowing
);

// Follow a user (authenticated)
router.post(
    '/:userId/follow',
    authenticate,
    validate(schemas.follows.followUserSchema),
    followController.followUser
);

// Unfollow a user (authenticated)
router.delete(
    '/:userId/follow',
    authenticate,
    validate(schemas.follows.unfollowUserSchema),
    followController.unfollowUser
);

module.exports = router;
