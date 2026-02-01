const mongoose = require('mongoose');

// schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
    age: { type: Number, required: true, min: 18, max: 150 },
    profilePicture: { type: String, default: null }, // ImageKit URL
    profilePictureId: { type: String, default: null }, // ImageKit file ID for deletion
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date }
}, { timestamps: true });

// model
const User = mongoose.model('User', userSchema);

module.exports = User;