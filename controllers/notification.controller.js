const notificationService = require('../services/notification.service');


exports.getUserNotifications = async (req, res) => {
    const { userId } = req.user;

    const result = await notificationService.getUserNotifications(userId, req.query);

    res.json({
        message: 'Notifications fetched successfully',
        data: result.notifications,
        unreadCount: result.unreadCount,
        pagination: result.pagination
    });
};

exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    const notification = await notificationService.markAsRead(id, userId);

    res.json({
        message: 'Notification marked as read',
        data: notification
    });
};

exports.markAllAsRead = async (req, res) => {
    const { userId } = req.user;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
        message: result.message,
        modifiedCount: result.modifiedCount
    });
};

exports.deleteNotification = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    await notificationService.deleteNotification(id, userId);

    res.json({
        message: 'Notification deleted successfully'
    });
};

exports.getUnreadCount = async (req, res) => {
    const { userId } = req.user;

    const count = await notificationService.getUnreadCount(userId);

    res.json({
        message: 'Unread count fetched successfully',
        unreadCount: count
    });
};
