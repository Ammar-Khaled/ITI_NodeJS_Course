const mongoose = require('mongoose');
const userService = require('../services/user.service');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!name || !email || !password || !age) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await userService.createUser({ name, email, password, age });

        res.status(201).json({ message: "User created successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
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
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User fetched successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

// Update user by ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const { name, email, age } = req.body;

        const updatedUser = await userService.updateUser(id, { name, email, age });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const deletedUser = await userService.deleteUser(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};
