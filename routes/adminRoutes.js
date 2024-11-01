import AdminJS from 'adminjs';
import AdminJSSequelize from '@adminjs/sequelize';
import AdminJSExpress from '@adminjs/express';
import Post from '../models/Posts.js';
import Category from '../models/Categories.js';
import Like from '../models/Likes.js';
import Comment from '../models/Comments.js';
import User from '../models/User.js';
import bcrypt from "bcrypt";
import PostCategory from "../models/posts_categories.js";
import FavoritePost from "../models/favorites.js";

AdminJS.registerAdapter(AdminJSSequelize);

const adminJs = new AdminJS({
    resources: [
        {resource: User,
            options: {
                properties: {
                    password: {
                        isVisible: { list: false, edit: false, filter: false, show: false },
                    },
                },
            },
        },
        {
            resource: Post,
            options: {
                properties: {
                    title: {
                        isVisible: { list: true, edit: false, filter: false, show: true },
                    },
                    content: {
                        isVisible: { list: true, edit: false, filter: false, show: true },
                    },
                    author_id: {
                        isVisible: { list: true, edit: false, filter: false, show: true },
                    },
                },
            },
        },
        { resource: PostCategory},
        { resource: Category },
        { resource: Like },
        {
            resource: Comment,
            options: {
                properties: {
                    content: {
                        isVisible: { list: true, edit: false, filter: false, show: true },
                    },
                },
            },
        },
        { resource: FavoritePost },
    ],
    rootPath: '/admin',
});

const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
        const user = await User.findOne({ where: { email } });
        if (!user || user.role !== 'admin') {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'complex_password_here',
});

export default router;
