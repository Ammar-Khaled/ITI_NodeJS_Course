const userService = require('../services/user.service');
const APIError = require('../utils/APIError');


exports.signUp = async (req, res) => {
    const { name, email, password, age } = req.body;
    const user = await userService.signUp({ name, email, password, age });
    res.status(201).json({ message: "User created successfully", data: user });
};

exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await userService.signIn({ email, password });
    res.status(200).json({ message: "User signed in successfully", data: { token, user } });
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const [users, total] = await userService.getAllUsers(page, limit);

    res.json({
        message: "Users fetched successfully",
        data: users,
        pagenation: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
};

// Get user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
        throw new APIError("User not found", 404);
    }

    res.json({ message: "User fetched successfully", data: user });
};

// Update user by ID
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const updatedUser = await userService.updateUser(id, { name, email, age });

    if (!updatedUser) {
        throw new APIError("User not found", 404);
    }

    res.json({ message: "User updated successfully", data: updatedUser });
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const deletedUser = await userService.deleteUser(id);
    res.json({ message: "User deleted successfully", deletedUser });
};

// Request password reset (forgot password)
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const result = await userService.forgotPassword(email);
    res.json(result);
};

// Reset password with token
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const result = await userService.resetPassword(token, password);
    res.json(result);
};

// Change password when logged in
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;

    const result = await userService.changePassword(userId, currentPassword, newPassword);
    res.json(result);
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    const { userId } = req.user;

    if (!req.file) {
        throw new APIError('No file uploaded', 400);
    }

    const result = await userService.uploadProfilePicture(userId, req.file);
    res.json({ message: 'Profile picture uploaded successfully', data: result });
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
    const { userId } = req.user;

    const result = await userService.deleteProfilePicture(userId);
    res.json(result);
};
