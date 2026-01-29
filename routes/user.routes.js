const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const schemas = require('../schemas');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const restrictTo = require('../middlewares/restrictTo');

router.post('/sign-up', validate(schemas.users.signUpSchema), userController.signUp);

router.post('/sign-in', validate(schemas.users.signInSchema), userController.signIn);

// Password reset routes (public)
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Change password (authenticated)
router.patch('/change-password', authenticate, userController.changePassword);

// Get all users
router.get('/', authenticate, restrictTo(['admin']), validate(schemas.users.getAllUsersSchema), userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, restrictTo(['admin']), userController.getUserById);

// Update user by ID
router.patch('/:id', authenticate, restrictTo(['admin']), validate(schemas.users.updateUserSchema), userController.updateUser);

// Delete user by ID
router.delete('/:id', authenticate, restrictTo(['admin']), userController.deleteUser);

module.exports = router;
