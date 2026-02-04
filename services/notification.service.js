const Notification = require('../models/notification.model');
const APIError = require('../utils/APIError');


const createNotification = async (notificationData) => {
    const { userId, type, relatedUserId, relatedPostId, relatedCommentId } = notificationData;

    // Don't create notification if user is notifying themselves
    if (userId.toString() === relatedUserId.toString()) {
        return null;
    }

    const notification = await Notification.create({
        userId,
        type,
        relatedUserId,
        relatedPostId: relatedPostId || null,
        relatedCommentId: relatedCommentId || null
    });

    return notification;
};


const getUserNotifications = async (userId, query = {}) => {
    const { page = 1, limit = 10, read = false, sort = '-createdAt' } = query;
    const skip = (page - 1) * limit;

    const filter = { userId, read };

    const notifications = await Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedUserId', 'name email')
        .populate('relatedPostId', 'title')
        .populate('relatedCommentId', 'content')
        .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return {
        notifications,
        unreadCount,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new APIError('Notification not found', 404);
    }

    // Ensure the notification belongs to the user
    if (notification.userId.toString() !== userId.toString()) {
        throw new APIError('You are not authorized to update this notification', 403);
    }

    notification.read = true;
    await notification.save();

    return notification;
};

const markAllAsRead = async (userId) => {
    const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
    );

    return {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} notifications marked as read`
    };
};

const deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new APIError('Notification not found', 404);
    }

    // Ensure the notification belongs to the user
    if (notification.userId.toString() !== userId.toString()) {
        throw new APIError('You are not authorized to delete this notification', 403);
    }

    await Notification.findByIdAndDelete(notificationId);

    return notification;
};

const getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
};
