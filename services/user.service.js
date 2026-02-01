const User = require('../models/user.model');
const util = require('util');
const crypto = require('crypto');
const APIError = require('../utils/APIError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../services/email.js');
const imageKitService = require('./imageKit');


const jwtSign = util.promisify(jwt.sign);

exports.signUp = async (userData) => {
    const { email, password } = userData;
    // verfiy email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new APIError("User already exists", 400);
    }

    // extract plain password and hash it
    const hashedPassword = await bcrypt.hash(password, 12);


    // create user with hashed password
    const user = await User.create({ ...userData, password: hashedPassword });

    await mailer.sendWelcomeEmail(user);

    return user;
}


exports.signIn = async ({ email, password }) => {
    // find user by email
    const user = await User.findOne({ email }, { createdAt: 0, updatedAt: 0, __v: 0 });

    if (!user) {
        throw new APIError("Invalid email or password", 401);
    }

    // compare hashed password with the plain password
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new APIError("Invalid email or password", 401);
    }

    const payload = {
        userId: user._id,
        role: user.role
    }

    // generate token 
    const token = await jwtSign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token, user: { ...user.toObject(), password: undefined } };

}

// Get all users with pagination
exports.getAllUsers = async (page, limit) => {
    const usersPromise = User.find({}, { password: 0 })
        .skip((page - 1) * limit)
        .limit(limit);
    const totalPromise = User.countDocuments();

    return await Promise.all([usersPromise, totalPromise]);
};

// Get user by ID
exports.getUserById = async (id) => {
    return await User.findOne({ _id: id }, { password: 0 });
};

// Update user by ID
exports.updateUser = async (id, updateData) => {
    return await User.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true }
    );
};

// Delete user by ID
exports.deleteUser = async (id) => {
    return await User.findOneAndDelete({ _id: id });
};

// Generate password reset token
exports.generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash the token for storage (security best practice)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    return { resetToken, hashedToken };
};

// Request password reset (forgot password)
exports.forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if email exists or not (security)
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const { resetToken, hashedToken } = exports.generateResetToken();

    // Save hashed token and expiry to user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send password reset email
    await mailer.sendPasswordResetEmail(user, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
};

// Verify reset token and return user
exports.verifyResetToken = async (token) => {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new APIError('Invalid or expired reset token', 400);
    }

    return user;
};

// Reset password with token
exports.resetPassword = async (token, newPassword) => {
    const user = await exports.verifyResetToken(token);

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 12);

    // Clear reset token fields
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    // Send confirmation email
    await mailer.sendPasswordResetConfirmation(user);

    return { message: 'Password has been reset successfully' };
};

// Change password (when logged in)
exports.changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new APIError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        throw new APIError('Current password is incorrect', 401);
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Send confirmation email
    await mailer.sendPasswordResetConfirmation(user);

    return { message: 'Password changed successfully' };
};

// Upload profile picture
exports.uploadProfilePicture = async (userId, file) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new APIError('User not found', 404);
    }

    if (user.profilePictureId) {
        try {
            await imageKitService.deleteImage(user.profilePictureId);
        } catch (error) {
            console.error('Failed to delete old profile picture:', error.message);
        }
    }

    const fileName = `profile-${userId}-${Date.now()}`;
    const result = await imageKitService.uploadImage(file.buffer, 'profile-pictures', fileName);

    user.profilePicture = result.url;
    user.profilePictureId = result.fileId;
    await user.save();

    return {
        profilePicture: result.url,
        thumbnailUrl: imageKitService.getThumbnailUrl(result.url)
    };
};

// Delete profile picture
exports.deleteProfilePicture = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new APIError('User not found', 404);
    }

    if (!user.profilePictureId) {
        throw new APIError('No profile picture to delete', 400);
    }

    await imageKitService.deleteImage(user.profilePictureId);

    user.profilePicture = null;
    user.profilePictureId = null;
    await user.save();

    return { message: 'Profile picture deleted successfully' };
};
