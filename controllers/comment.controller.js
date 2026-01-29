const commentService = require('../services/comment.service');


exports.createComment = async (req, res) => {
    const { content, postId, parentCommentId } = req.body;
    const { userId } = req.user;

    const comment = await commentService.createComment(
        { content, postId, parentCommentId },
        userId
    );

    res.status(201).json({
        message: "Comment created successfully",
        data: comment
    });
};

// Get all comments with optional postId filter
exports.getAllComments = async (req, res) => {
    const { postId } = req.query;
    const { userId } = req.user;

    const result = await commentService.getAllComments(req.query, postId, userId);

    res.json({
        message: "Comments fetched successfully",
        data: result.comments,
        pagination: result.pagination
    });
};

// Get comment by ID
exports.getCommentById = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const comment = await commentService.getCommentById(id, userId);

    res.json({
        message: "Comment fetched successfully",
        data: comment
    });
};

// Update comment by ID (author only)
exports.updateComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const { userId } = req.user;

    const updatedComment = await commentService.updateCommentById(
        id,
        { content },
        userId
    );

    res.json({
        message: "Comment updated successfully",
        data: updatedComment
    });
};

// Delete comment by ID (author or post author)
exports.deleteComment = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const result = await commentService.deleteCommentById(id, userId);

    res.json(result);
};

// Get comments for a specific post
exports.getCommentsByPost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    const comments = await commentService.getCommentsByPost(postId, userId);

    res.json({
        message: "Post comments fetched successfully",
        data: comments
    });
};
