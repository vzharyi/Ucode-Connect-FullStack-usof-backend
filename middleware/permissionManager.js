import User from '../models/User.js';

class PermissionManager {
    constructor() {
        this.rolePermissions = {
            getUsers: ['admin', 'user'],
            getUserPosts: ['admin', 'user'],
            createUser: ['admin'],
            uploadAvatar: ['admin', 'user'],
            updateProfile: ['admin', 'user'],
            deleteUser: ['admin', 'user'],
            createComment: ['admin', 'user'],
            getLikesForPost: ['admin', 'user'],
            createPost: ['admin', 'user'],
            likePost: ['admin', 'user'],
            getFavorites: ['admin', 'user'],
            addFavorite: ['admin', 'user'],
            updatePost: ['admin', 'user'],
            deletePost: ['admin', 'user'],
            deleteLike: ['admin', 'user'],
            removeFavorite: ['admin', 'user'],
            createCategory: ['admin'],
            updateCategory: ['admin'],
            deleteCategory: ['admin'],
            likeComment: ['admin', 'user'],
            updateComment: ['admin', 'user'],
            deleteComment: ['admin', 'user'],
            deleteLikeForComment: ['admin', 'user'],
        };
    }

    checkPermission(action) {
        return async (req, res, next) => {
            try {
                const userId = req.user.id;
                const user = await User.findByPk(userId);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const userRole = user.role;
                const allowedRoles = this.rolePermissions[action];

                if (allowedRoles && allowedRoles.includes(userRole)) {
                    return next();
                }

                return res.status(403).json({ error: 'Access denied' });
            } catch (error) {
                return res.status(500).json({ error: 'Error checking permissions', details: error.message });
            }
        };
    }

    checkDeletePermission() {
        return async (req, res, next) => {
            try {
                const userId = req.user.id;
                const targetUserId = parseInt(req.params.user_id);
                const user = await User.findByPk(userId);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                if (user.role === 'admin' || userId === targetUserId) {
                    return next();
                }

                return res.status(403).json({ error: 'Access denied' });
            } catch (error) {
                return res.status(500).json({ error: 'Error checking permissions', details: error.message });
            }
        };
    }
}

export default new PermissionManager();
