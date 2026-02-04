const Follow = require('../models/follow.model');
const User = require('../models/user.model');
const APIError = require('../utils/APIError');
const { createNotification } = require('./notification.service');


const followUser = async (followerId, followingId) => {
    // Prevent self-follow
    if (followerId.toString() === followingId.toString()) {
        throw new APIError('You cannot follow yourself', 400);
    }

    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
        throw new APIError('User not found', 404);
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
        throw new APIError('You are already following this user', 400);
    }

    const follow = await Follow.create({ followerId, followingId });

    (async () => {
        try {
            await createNotification({
                userId: followingId,
                type: 'follow',
                relatedUserId: followerId
            });
        } catch (err) {
            console.error('Failed to create follow notification:', err);
        }
    })();

    return follow;
};

const unfollowUser = async (followerId, followingId) => {
    // Prevent self-unfollow
    if (followerId.toString() === followingId.toString()) {
        throw new APIError('You cannot unfollow yourself', 400);
    }

    const follow = await Follow.findOneAndDelete({ followerId, followingId });

    if (!follow) {
        throw new APIError('You are not following this user', 400);
    }

    return follow;
};

const getFollowers = async (userId, query = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = query;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
        throw new APIError('User not found', 404);
    }

    const followers = await Follow.find({ followingId: userId })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('followerId', 'name email profilePicture')
        .lean();

    const total = await Follow.countDocuments({ followingId: userId });

    return {
        followers: followers.map(f => ({
            ...f.followerId,
            followedAt: f.createdAt
        })),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const getFollowing = async (userId, query = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = query;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
        throw new APIError('User not found', 404);
    }

    const following = await Follow.find({ followerId: userId })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('followingId', 'name email profilePicture')
        .lean();

    const total = await Follow.countDocuments({ followerId: userId });

    return {
        following: following.map(f => ({
            ...f.followingId,
            followedAt: f.createdAt
        })),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const getFollowerCount = async (userId) => {
    return await Follow.countDocuments({ followingId: userId });
};

const getFollowingCount = async (userId) => {
    return await Follow.countDocuments({ followerId: userId });
};

const isFollowing = async (followerId, followingId) => {
    const follow = await Follow.findOne({ followerId, followingId });
    return !!follow;
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
    isFollowing
};
