require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const helmet = require('helmet');
const { sanitizeMongoInput } = require('express-v5-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const { generalLimiter } = require('./middlewares/rateLimiter');
const scheduler = require('./services/scheduler');
const logger = require('./utils/logger');

// API version routers
const v1Router = require('./routes/v1');

const app = express();

// global middleware
app.set('trust proxy', 1)
app.use(cors());
app.use(express.json());
app.use(helmet())
app.use(sanitizeMongoInput);
app.use(xss());
app.use(hpp());
app.use(generalLimiter);

// Morgan HTTP request logging
app.use(morgan('short', {
    stream: logger.stream,
}));

// Routes - API v1
app.use('/api/v1', v1Router);

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