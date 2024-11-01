import User from '../models/user.js';
import Post from '../models/posts.js';
import Category from '../models/categories.js';
import bcrypt from 'bcrypt';
import {Op} from 'sequelize';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import {getPagination, updateUserRating, updatePostRating} from '../utils/utils.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserController {
    async getUsers(req, res) {
        try {
            const {user_id: userId} = req.params;

            if (userId) {
                await updateUserRating(userId);
                const user = await User.findByPk(userId, {
                    attributes: ['id', 'login', 'full_name', 'email', 'profile_picture', 'rating', 'role']
                });

                if (!user) {
                    return res.status(404).json({error: 'User not found'});
                }
                return res.status(200).json(user);
            } else {
                const users = await User.findAll({
                    attributes: ['id', 'login', 'full_name', 'email', 'profile_picture', 'rating', 'role']
                });

                if (!users.length) {
                    return res.status(404).json({error: 'No users found'});
                }

                for (const user of users) {
                    await updateUserRating(user.id);
                }

                return res.status(200).json(users);
            }
        } catch (error) {
            return res.status(500).json({error: 'Failed to retrieve data'});
        }
    }

    async getUserPosts(req, res) {
        try {
            const {user_id: userId} = req.params;
            const requesterId = req.user.id;

            const {page = 1, sort = 'likes', categories, startDate, endDate, status} = req.query;
            const {limit, offset} = getPagination(page, 10);
            const user = await User.findByPk(userId);

            const order = sort === 'date'
                ? [['createdAt', 'DESC']]
                : [['likesCount', 'DESC']];

            let whereCondition = {author_id: userId};

            if (requesterId !== parseInt(userId) && user.role !== 'admin') {
                whereCondition.status = 'active';
            } else if (status) {
                whereCondition.status = status;
            }

            if (startDate || endDate) {
                whereCondition.createdAt = {};

                if (startDate) {
                    whereCondition.createdAt[Op.gte] = new Date(startDate);
                }
                if (endDate) {
                    whereCondition.createdAt[Op.lte] = new Date(endDate);
                }
            }

            let posts;
            if (categories) {
                posts = await Post.findAll({
                    where: whereCondition,
                    limit,
                    offset,
                    order,
                    include: [{
                        model: Category,
                        as: 'categories',
                        where: {
                            id: categories.split(',').map(Number)
                        },
                        required: true
                    }]
                });
            } else {
                posts = await Post.findAll({
                    where: whereCondition,
                    limit,
                    offset,
                    order,
                    include: [{
                        model: Category,
                        as: 'categories',
                        attributes: ['title']
                    }]
                });
            }

            for (const post of posts) {
                await updatePostRating(post.id);
            }

            return res.status(200).json(posts);
        } catch (error) {
            console.error('Error retrieving user posts:', error);
            return res.status(500).json({error: 'Error retrieving user posts', details: error.message});
        }
    }

    async createUser(req, res) {
        try {
            const {login, password, passwordConfirmation, email, role, full_name} = req.body;

            if (!login || !password || !passwordConfirmation || !email || !role || !full_name) {
                return res.status(400).json({error: 'All fields are required'});
            }

            if (password !== passwordConfirmation) {
                return res.status(400).json({error: 'Password and confirmation do not match'});
            }

            const existingUser = await User.findOne({where: {[Op.or]: [{login}, {email}]}});
            if (existingUser) {
                return res.status(400).json({error: 'Username or email already in use'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                login,
                password: hashedPassword,
                email,
                role,
                full_name
            });

            return res.status(201).json(newUser);
        } catch (error) {
            return res.status(500).json({error: 'Error creating user', details: error.message});
        }
    }

    async uploadAvatar(req, res) {
        try {
            const userId = req.user.id;
            const {avatarPath} = req.body;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }

            const filePath = path.resolve(__dirname, avatarPath);
            if (!fs.existsSync(filePath)) {
                return res.status(400).json({error: 'File not found at the specified path'});
            }

            user.profile_picture = avatarPath;
            await user.save();

            return res.status(200).json({message: 'Avatar path updated', avatarPath: user.profile_picture});
        } catch (error) {
            return res.status(500).json({error: 'Error updating avatar', details: error.message});
        }
    }

    async updateProfile(req, res) {
        try {
            const {user_id: userId} = req.params;
            const {login, full_name, profile_picture, role} = req.body;
            const requesterId = req.user.id;
            const requesterUser = await User.findByPk(requesterId);
            const user = await User.findByPk(userId);
            const isAdmin = requesterUser.role === 'admin';

            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }

            if (!isAdmin && requesterId !== parseInt(userId)) {
                return res.status(403).json({error: 'You are not authorized to update this user profile'});
            }

            if (login && login !== user.login) {
                const existingUser = await User.findOne({where: {login}});
                if (existingUser) {
                    return res.status(400).json({error: 'Username is already in use'});
                }
            }

            if (!isAdmin) {
                user.login = login || user.login;
                user.full_name = full_name || user.full_name;
                user.profile_picture = profile_picture || user.profile_picture;
            } else {
                user.role = role || user.role;
            }

            await user.save();
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({error: 'Error updating profile'});
        }
    }

    async deleteUser(req, res) {
        try {
            const {user_id: userId} = req.params;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }

            await user.destroy();
            return res.status(200).json({message: 'User deleted successfully'});
        } catch (error) {
            return res.status(500).json({error: 'Error deleting user'});
        }
    }
}

export default new UserController();
