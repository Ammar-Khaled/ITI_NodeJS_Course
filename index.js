require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const likeRoutes = require('./routes/like.routes');
const followRoutes = require('./routes/follow.routes');
const notificationRoutes = require('./routes/notification.routes');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const donationRouter = require('./routes/donation.routes');
const helmet = require('helmet');
const { sanitizeMongoInput } = require('express-v5-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const rateLimiter = require('./middlewares/rateLimiter');
const scheduler = require('./services/scheduler');
const logger = require('./utils/logger');

const app = express();

// global middleware
app.set('trust proxy', 1)
app.use(cors());
app.use(express.json());
app.use(helmet())
app.use(sanitizeMongoInput);
app.use(xss());
app.use(hpp());
app.use(rateLimiter);

// Morgan HTTP request logging
app.use(morgan('short', {
    stream: logger.stream,
}));

// Routes
app.use('/users', userRoutes);
app.use('/users', followRoutes);
app.use('/posts', postRoutes);
app.use('/donations', donationRouter);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
app.listen(port, () => {
    mongoose.connect(mongoUri).then(() => {
        logger.info('Connected to MongoDB');
        scheduler.init();
    }).catch((err) => {
        logger.error('Failed to connect to MongoDB', { error: err.message });
    });
    logger.info(`Server is running on Port: ${port}`);
});