const mongoose = require('mongoose');

// schema
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    tags: { type: [String], required: false },
    published: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
// model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;