const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const APIError = require('../utils/APIError');
const { sendCommentNotification, sendReplyNotification } = require('./email');
const { createNotification } = require('./notification.service');

const MAX_COMMENT_DEPTH = 2; // Max nesting level (0 = root, 1 = reply, 2 = reply to reply)

const getCommentDepth = async (commentId) => {
    let depth = -1;

    while (commentId) {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            break;
        }
        depth++;
        commentId = comment.parentComment;
    }

    return depth;
};

const createComment = async (commentData, userId) => {
    const { parentCommentId } = commentData;

    // If it's a reply, check depth
    if (parentCommentId) {
        const depth = await getCommentDepth(parentCommentId);
        if (depth >= MAX_COMMENT_DEPTH) {
            throw new APIError(`Maximum comment nesting depth (${MAX_COMMENT_DEPTH} levels) exceeded`);
        }
    }

    const comment = await Comment.create({
        ...commentData,
        userId
    });

    // Send notification emails (non-blocking)
    (async () => {
        try {
            const commenter = await User.findById(userId);
            const post = await Post.findById(comment.postId).populate('userId');

            if (parentCommentId) {
                // This is a reply to a comment
                const parentComment = await Comment.findById(parentCommentId).populate('userId');
                if (parentComment && parentComment.userId) {
                    await sendReplyNotification(
                        parentComment.userId,  // commentAuthor
                        commenter,             // replier
                        parentComment,         // original comment
                        comment,               // reply
                        post                   // post
                    );

                    // Create in-app notification for reply
                    await createNotification({
                        userId: parentComment.userId._id,
                        type: 'reply',
                        relatedUserId: userId,
                        relatedPostId: comment.postId,
                        relatedCommentId: comment._id
                    });
                }
            } else {
                // This is a new comment on a post
                if (post && post.userId) {
                    await sendCommentNotification(
                        post.userId,  // postAuthor
                        commenter,    // commenter
                        post,         // post
                        comment       // comment
                    );

                    // Create in-app notification for comment
                    await createNotification({
                        userId: post.userId._id,
                        type: 'comment',
                        relatedUserId: userId,
                        relatedPostId: post._id,
                        relatedCommentId: comment._id
                    });
                }
            }
        } catch (err) {
            console.error('Failed to send comment notification:', err);
        }
    })();

    return await comment.populate('userId', 'name email');
};

const getAllComments = async (query, postId, userId) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = query;
    const skip = (page - 1) * limit;

    const filter = postId ? { post: postId } : {};

    const comments = await Comment.find(filter)
        .populate('userId', 'name email')
        .populate('postId', 'title')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const total = await Comment.countDocuments(filter);

    // Add isOwner flag
    const commentsWithOwner = comments.map(comment => ({
        ...comment,
        isOwner: comment.userId._id.toString() === userId
    }));

    return {
        comments: commentsWithOwner,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get single comment by ID with isOwner flag
 */
const getCommentById = async (id, userId) => {
    const comment = await Comment.findById(id)
        .populate('userId', 'name email')
        .populate('postId', 'title')
        .lean();

    if (!comment) {
        throw new APIError('Comment not found');
    }

    return {
        ...comment,
        isOwner: comment.userId._id.toString() === userId
    };
};

/**
 * Update comment by ID (author only)
 */
const updateCommentById = async (id, commentData, userId) => {
    const comment = await Comment.findById(id);

    if (!comment) {
        throw new APIError('Comment not found');
    }

    // Check if user is the author
    if (comment.userId.toString() !== userId) {
        throw new APIError('Unauthorized: Only the author can update this comment');
    }

    comment.content = commentData.content || comment.content;
    await comment.save();

    return await comment.populate('userId', 'name email');
};

/**
 * Delete comment by ID (author or post author)
 */
const deleteCommentById = async (id, userId) => {
    const comment = await Comment.findById(id).populate('postId');

    if (!comment) {
        throw new APIError('Comment not found');
    }

    const isCommentAuthor = comment.userId.toString() === userId;
    const isPostAuthor = comment.postId.userId.toString() === userId;

    if (!isCommentAuthor && !isPostAuthor) {
        throw new APIError('Unauthorized: Only the comment author or post author can delete this comment');
    }

    await Comment.findByIdAndDelete(id);

    return { message: 'Comment deleted successfully' };
};

/**
 * Get all comments for a specific post
 */
const getCommentsByPost = async (postId, userId) => {
    const comments = await Comment.find({ postId: postId })
        .populate('userId', 'name email')
        .sort('-createdAt')
        .lean();

    // Add isOwner flag
    const commentsWithOwner = comments.map(comment => ({
        ...comment,
        isOwner: comment.userId._id.toString() === userId
    }));

    return commentsWithOwner;
};

module.exports = {
    createComment,
    getAllComments,
    getCommentById,
    updateCommentById,
    deleteCommentById,
    getCommentsByPost
};