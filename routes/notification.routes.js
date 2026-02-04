const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');

// All notification routes require authentication
router.use(authenticate);

// Get user's notifications (paginated)
router.get(
    '/',
    validate(schemas.notifications.getNotificationsSchema),
    notificationController.getUserNotifications
);

// Get unread notifications count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark a specific notification as read
router.patch(
    '/:id/read',
    validate(schemas.notifications.markAsReadSchema),
    notificationController.markAsRead
);

// Delete a notification
router.delete(
    '/:id',
    validate(schemas.notifications.deleteNotificationSchema),
    notificationController.deleteNotification
);

module.exports = router;
