const likeService = require('../services/like.service');


exports.toggleLike = async (req, res) => {
    const { targetType, targetId } = req.body;
    const { userId } = req.user;

    const result = await likeService.toggleLike(userId, targetType, targetId);

    res.status(200).json({
        message: result.liked ? 'Liked successfully' : 'Unliked successfully',
        data: result
    });
};

exports.getLikesCount = async (req, res) => {
    const { targetType, targetId } = req.query;

    const count = await likeService.getLikesCount(targetType, targetId);

    res.status(200).json({
        message: 'Likes count fetched successfully',
        data: { count }
    });
};

exports.checkLiked = async (req, res) => {
    const { targetType, targetId } = req.query;
    const { userId } = req.user;

    const isLiked = await likeService.isLikedByUser(userId, targetType, targetId);

    res.status(200).json({
        message: 'Like status fetched successfully',
        data: { isLiked }
    });
};

exports.getUserLikes = async (req, res) => {
    const { userId } = req.params;

    const result = await likeService.getUserLikes(userId, req.query);

    res.status(200).json({
        message: 'User likes fetched successfully',
        data: result.likes,
        pagination: result.pagination
    });
};
