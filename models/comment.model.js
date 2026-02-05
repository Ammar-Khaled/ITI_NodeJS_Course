const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 1000,
            trim: true
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        parentCommentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null
        },
        likes: {
            type: Number,
            default: 0,
            min: 0
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

commentSchema.index({ postId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;