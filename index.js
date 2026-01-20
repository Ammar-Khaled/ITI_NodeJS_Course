const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const dotenv = require('dotenv');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');

dotenv.config();

const app = express();

// global middleware
app.use(express.json()); // middleware parses request body and adds it to req.body
app.use(cors());

// Routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

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