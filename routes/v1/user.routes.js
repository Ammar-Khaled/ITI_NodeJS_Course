const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const bookmarkController = require('../../controllers/bookmark.controller');
const schemas = require('../../schemas');
const validate = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const restrictTo = require('../../middlewares/restrictTo');
const { uploadProfilePicture } = require('../../middlewares/upload');


router.post('/sign-up', validate(schemas.users.signUpSchema), userController.signUp);
router.post('/sign-in', validate(schemas.users.signInSchema), userController.signIn);

// Search users by name/email (authenticated)
router.get('/search', validate(schemas.users.searchUsersSchema), authenticate, userController.searchUsers);

// Password reset routes (public)
router.post('/forgot-password', validate(schemas.users.forgotPasswordSchema), userController.forgotPassword);
router.post('/reset-password', validate(schemas.users.resetPasswordSchema), userController.resetPassword);

// Change password (authenticated)
router.patch('/change-password', validate(schemas.users.changePasswordSchema), authenticate, userController.changePassword);

// Profile picture routes (authenticated)
router.post('/profile-picture', authenticate, uploadProfilePicture, userController.uploadProfilePicture);
router.delete('/profile-picture', authenticate, userController.deleteProfilePicture);

// Bookmarks route (authenticated)
router.get('/bookmarks', authenticate, validate(schemas.bookmarks.getUserBookmarksSchema), bookmarkController.getUserBookmarks);

// Get all users
router.get('/', authenticate, restrictTo(['admin']), validate(schemas.users.getAllUsersSchema), userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, restrictTo(['admin']), userController.getUserById);

// Update user by ID
router.patch('/:id', authenticate, restrictTo(['admin']), validate(schemas.users.updateUserSchema), userController.updateUser);

// Delete user by ID
router.delete('/:id', authenticate, restrictTo(['admin']), userController.deleteUser);

module.exports = router;
