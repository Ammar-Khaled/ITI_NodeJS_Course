const Bookmark = require('../models/bookmark.model');
const Post = require('../models/post.model');
const APIError = require('../utils/APIError');


const bookmarkPost = async (userId, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError('Post not found', 404);
    }

    const existingBookmark = await Bookmark.findOne({ userId, postId });
    if (existingBookmark) {
        throw new APIError('Post is already bookmarked', 400);
    }

    const bookmark = await Bookmark.create({ userId, postId });

    return bookmark;
};

const removeBookmark = async (userId, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError('Post not found', 404);
    }

    const bookmark = await Bookmark.findOneAndDelete({ userId, postId });

    if (!bookmark) {
        throw new APIError('Bookmark not found', 404);
    }

    return bookmark;
};

const getUserBookmarks = async (userId, query = {}) => {
    const { page = 1, limit = 10, sort = '-createdAt' } = query;
    const skip = (page - 1) * limit;

    const bookmarks = await Bookmark.find({ userId })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
            path: 'postId',
            select: 'title content images status views likes createdAt'
        })
        .lean();

    const total = await Bookmark.countDocuments({ userId });

    return {
        bookmarks: bookmarks.map(b => ({
            _id: b._id,
            post: b.postId,
            bookmarkedAt: b.createdAt
        })),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const isBookmarked = async (userId, postId) => {
    const bookmark = await Bookmark.findOne({ userId, postId });
    return !!bookmark;
};


module.exports = {
    bookmarkPost,
    removeBookmark,
    getUserBookmarks,
    isBookmarked,
};
