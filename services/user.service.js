const User = require('../models/user.model');

// Create a new user
exports.createUser = async (userData) => {
    return await User.create(userData);
};

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
