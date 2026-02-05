const express = require('express');
const router = express.Router();

const usersRouter = require('./user.routes');
const postsRouter = require('./post.routes');
const commentsRouter = require('./comment.routes');
const likesRouter = require('./like.routes');
const followsRouter = require('./follow.routes');
const notificationsRouter = require('./notification.routes');
const donationsRouter = require('./donation.routes');


router.use('/users', usersRouter);
router.use('/users', followsRouter);
router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);
router.use('/likes', likesRouter);
router.use('/notifications', notificationsRouter);
router.use('/donations', donationsRouter);

module.exports = router;
