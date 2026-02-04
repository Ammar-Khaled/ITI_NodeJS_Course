const bookmarkService = require('../services/bookmark.service');


exports.bookmarkPost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    const bookmark = await bookmarkService.bookmarkPost(userId, postId);

    res.status(201).json({
        message: 'Post bookmarked successfully',
        data: bookmark
    });
};

exports.removeBookmark = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    await bookmarkService.removeBookmark(userId, postId);

    res.status(200).json({
        message: 'Bookmark removed successfully'
    });
};

exports.getUserBookmarks = async (req, res) => {
    const { userId } = req.user;

    const result = await bookmarkService.getUserBookmarks(userId, req.query);

    res.status(200).json({
        message: 'Bookmarks fetched successfully',
        data: result.bookmarks,
        pagination: result.pagination
    });
};

exports.checkBookmarked = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.user;

    const isBookmarked = await bookmarkService.isBookmarked(userId, postId);

    res.status(200).json({
        message: 'Bookmark status fetched successfully',
        data: { isBookmarked }
    });
};
