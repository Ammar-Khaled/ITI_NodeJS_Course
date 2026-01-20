const mongoose = require('mongoose');
const userService = require('../services/user.service');
const APIError = require('../utils/APIError');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        const user = await userService.createUser({ name, email, password, age });

        res.status(201).json({ message: "User created successfully", data: user });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
    try {
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
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            throw new APIError("User not found", 404);
        }

        res.json({ message: "User fetched successfully", data: user });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Update user by ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, email, age } = req.body;

        const updatedUser = await userService.updateUser(id, { name, email, age });

        if (!updatedUser) {
            throw new APIError("User not found", 404)
        }

        res.json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await userService.deleteUser(id);

        if (!deletedUser) {
            throw new APIError("User not found", 404)
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        throw new APIError(error.message, 500);
    }
};
