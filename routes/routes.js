import express from 'express';
import authenticationController from '../controllers/authenticationController.js';
import userController from '../controllers/userController.js';
import postController from '../controllers/postController.js';
import categoriesController from '../controllers/categoriesController.js';
import commentsController from '../controllers/commentsController.js';
import authenticateToken from '../middleware/authMiddleware.js';
import permissionManager from '../middleware/permissionManager.js';
const router = express.Router();

// Authentication module
router.post('/api/auth/register', authenticationController.register);
router.post('/api/auth/verify-email/:confirm_token', authenticationController.verifyEmail);
router.post('/api/auth/login', authenticationController.login);
router.post('/api/auth/logout', authenticationController.logout);
router.post('/api/auth/password-reset', authenticateToken, authenticationController.sendPasswordResetEmail);
router.post('/api/auth/password-reset/:confirm_token', authenticateToken, authenticationController.confirmNewPassword);

// User module
router.get('/api/users', authenticateToken, permissionManager.checkPermission('getUsers'), userController.getUsers);
router.get('/api/users/:user_id', authenticateToken, permissionManager.checkPermission('getUsers'), userController.getUsers);
router.get('/api/users/:user_id/posts', authenticateToken, permissionManager.checkPermission('getUserPosts'), userController.getUserPosts);
router.post('/api/users', authenticateToken, permissionManager.checkPermission('createUser'), userController.createUser);
router.patch('/api/users/avatar', authenticateToken, permissionManager.checkPermission('uploadAvatar'), userController.uploadAvatar);
router.patch('/api/users/:user_id', authenticateToken, permissionManager.checkPermission('updateProfile'), userController.updateProfile);
router.delete('/api/users/:user_id', authenticateToken, permissionManager.checkDeletePermission('deleteUser') ,userController.deleteUser);

// Post module
router.get('/api/posts', postController.getPosts);
router.get('/api/posts/:post_id', postController.getPosts);
router.get('/api/posts/:post_id/comments', postController.getCommentsForPost);
router.post('/api/posts/:post_id/comments', authenticateToken, permissionManager.checkPermission('createComment'), postController.createComment);
router.get('/api/posts/:post_id/categories', postController.getCategoriesForPost);
router.get('/api/posts/:post_id/like', authenticateToken, permissionManager.checkPermission('getLikesForPost'), postController.getLikesForPost);
router.post('/api/posts', authenticateToken, permissionManager.checkPermission('createPost'), postController.createPost);
router.post('/api/posts/:post_id/like', authenticateToken, permissionManager.checkPermission('likePost'), postController.likePost);
router.get('/api/favorites', authenticateToken, permissionManager.checkPermission('getFavorites'), postController.getFavorites);
router.post('/api/favorites/:post_id', authenticateToken, permissionManager.checkPermission('addFavorite'), postController.addFavorite);
router.patch('/api/posts/:post_id', authenticateToken, permissionManager.checkPermission('updatePost'), postController.updatePost);
router.delete('/api/posts/:post_id', authenticateToken, permissionManager.checkPermission('deletePost'), postController.deletePost);
router.delete('/api/posts/:post_id/like', authenticateToken, permissionManager.checkPermission('deleteLike'), postController.deleteLike);
router.delete('/api/favorites/:post_id', authenticateToken, permissionManager.checkPermission('removeFavorite'), postController.removeFavorite);

// Categories module
router.get('/api/categories', categoriesController.getCategories);
router.get('/api/categories/:category_id', categoriesController.getCategories);
router.get('/api/categories/:category_id/posts', categoriesController.getPostsByCategory);
router.post('/api/categories', authenticateToken, permissionManager.checkPermission('createCategory'), categoriesController.createCategory);
router.patch('/api/categories/:category_id', authenticateToken, permissionManager.checkPermission('updateCategory'), categoriesController.updateCategory);
router.delete('/api/categories/:category_id', authenticateToken, permissionManager.checkPermission('deleteCategory'), categoriesController.deleteCategory);

// Comments module
router.get('/api/comments/:comment_id', commentsController.getComment);
router.get('/api/comments/:comment_id/like', commentsController.getLikesForComment);
router.post('/api/comments/:comment_id/like', authenticateToken, permissionManager.checkPermission('likeComment'), commentsController.likeComment);
router.patch('/api/comments/:comment_id', authenticateToken, permissionManager.checkPermission('updateComment'), commentsController.updateComment);
router.delete('/api/comments/:comment_id', authenticateToken, permissionManager.checkPermission('deleteComment'), commentsController.deleteComment);
router.delete('/api/comments/:comment_id/like', authenticateToken, permissionManager.checkPermission('deleteLikeForComment'), commentsController.deleteLikeForComment);

export default router;
