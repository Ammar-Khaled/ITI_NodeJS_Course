const mongoose = require('mongoose');

// schema
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], required: false },
    status: { 
        type: String, 
        enum: ['draft', 'scheduled', 'published'], 
        default: 'draft' 
    },
    publishedAt: { type: Date, default: null },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{
        url: { type: String, required: true },
        fileId: { type: String, required: true }, // ImageKit file ID for deletion
        name: { type: String }
    }]
}, { timestamps: true });

// Text index for full-text search on title and content
postSchema.index({ title: 'text', content: 'text' });

postSchema.index({ userId: 1, status: 1 })
postSchema.index({ createdAt: -1 })

// model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;