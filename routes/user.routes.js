const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');

// Create a new user
router.post('/', validate(schemas.users.createUserSchema), userController.createUser);

// Get all users
router.get('/', validate(schemas.users.getAllUsersSchema), userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user by ID
router.patch('/:id', validate(schemas.users.updateUserSchema), userController.updateUser);

// Delete user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;
