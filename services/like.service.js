const Like = require('../models/like.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const APIError = require('../utils/APIError');
const { createNotification } = require('./notification.service');


const toggleLike = async (userId, targetType, targetId) => {
    // Verify the target exists
    const Model = targetType === 'Post' ? Post : Comment;
    const target = await Model.findById(targetId);

    if (!target) {
        throw new APIError(`${targetType} not found`, 404);
    }

    // Check if like already exists
    const existingLike = await Like.findOne({ userId, targetType, targetId });

    let liked;
    let likesCount;
    let updatedTarget;
    if (existingLike) {
        // Unlike: remove the like
        await Like.findByIdAndDelete(existingLike._id);

        // Decrement likes count on target
        updatedTarget = await Model.findByIdAndUpdate(targetId, { $inc: { likes: -1 } }, { new: true });
        console.log(updatedTarget);
        likesCount = updatedTarget.likes;
        liked = false;
    } else {
        // Like: create new like
        await Like.create({ userId, targetType, targetId });

        // Increment likes count on target
        updatedTarget = await Model.findByIdAndUpdate(targetId, { $inc: { likes: 1 } }, { new: true });
        console.log(updatedTarget);
        likesCount = updatedTarget.likes;
        liked = true;

        (async () => {
            try {
                const ownerId = targetType === 'Post' ? target.userId : target.userId;
                
                await createNotification({
                    userId: ownerId,
                    type: 'like',
                    relatedUserId: userId,
                    relatedPostId: targetType === 'Post' ? targetId : target.postId,
                    relatedCommentId: targetType === 'Comment' ? targetId : null
                });
            } catch (err) {
                console.error('Failed to create like notification:', err);
            }
        })();
    }

    return {
        liked,
        likesCount
    };
};

const getLikesCount = async (targetType, targetId) => {
    const Model = targetType === 'Post' ? Post : Comment;
    const target = await Model.findById(targetId);
    return target ? target.likes : 0;
};

const isLikedByUser = async (userId, targetType, targetId) => {
    const like = await Like.findOne({ userId, targetType, targetId });
    return !!like;
};

const getUserLikes = async (userId, query = {}) => {
    const { page = 1, limit = 10, targetType, targetId, sort = '-createdAt' } = query;
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (targetType) {
        filter.targetType = targetType;
    }
    if (targetId) {
        filter.targetId = targetId;
    }

    const likes = await Like.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Populate target details
    const populatedLikes = await Promise.all(
        likes.map(async (like) => {
            const Model = like.targetType === 'Post' ? Post : Comment;
            const target = await Model.findById(like.targetId)
                .lean();

            return {
                ...like,
                target: target || null
            };
        })
    );

    const total = await Like.countDocuments(filter);

    return {
        likes: populatedLikes,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    toggleLike,
    getLikesCount,
    isLikedByUser,
    getUserLikes
};
