const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const dotenv = require('dotenv');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const donationRouter = require('./routes/donation.routes');
const helmet = require('helmet');
const { sanitizeMongoInput } = require('express-v5-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const rateLimiter = require('./middlewares/rateLimiter');

dotenv.config();

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

// Routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/donations', donationRouter);
app.use('/comments', commentRoutes);

// Global Error Handler
app.use(errorHandler);

port = process.env.PORT || 3000;
mongoUri = process.env.MONGODB_URI;
app.listen(port, () => {
    mongoose.connect(mongoUri).then(() => {
        console.log('✅✅ Connected to MongoDB')
    }).catch((err) => {
        console.log('❌❌ Connected to MongoDB')
        console.log(err)
    });
    console.log('✅✅ Server is running on Port:3000');
});