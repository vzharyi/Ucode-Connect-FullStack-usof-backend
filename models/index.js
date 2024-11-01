import Post from './posts.js';
import Category from './categories.js';
import Like from './likes.js';
import User from './user.js';
import Comment from './comments.js';
import PostCategories from './posts_categories.js';
import Favorite from "./favorites.js";

Post.belongsToMany(Category, {
    through: PostCategories,
    foreignKey: 'post_id',
    otherKey: 'category_id',
    timestamps: false,
    as: 'categories'
});

Category.belongsToMany(Post, {
    through: PostCategories,
    foreignKey: 'category_id',
    otherKey: 'post_id',
    timestamps: false,
    as: 'posts'
});

Post.hasMany(Like, {
    foreignKey: 'post_id',
    as: 'likes'
});

Like.belongsTo(User, {
    foreignKey: 'author_id',
    as: 'author'
});

Comment.hasMany(Like, {
    foreignKey: 'comment_id',
    as: 'likes'
});

User.hasMany(Post, {
    foreignKey: 'author_id',
    as: 'posts'
});

Post.belongsTo(User, {
    foreignKey: 'author_id',
    as: 'author'
});

User.hasMany(Comment, {
    foreignKey: 'author_id',
    as: 'comments'
});

Comment.belongsTo(User, {
    foreignKey: 'author_id',
    as: 'author'
});

Post.hasMany(Comment, {
    foreignKey: 'post_id',
    as: 'comments'
});

Comment.belongsTo(Post, {
    foreignKey: 'post_id',
    as: 'posts'
});

User.hasMany(Favorite, {
    foreignKey: 'user_id',
    as: 'favorites'
});

Post.hasMany(Favorite, {
    foreignKey: 'post_id',
    as: 'favorites'
});

Favorite.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Favorite.belongsTo(Post, {
    foreignKey: 'post_id',
    as: 'posts'
});

export default {
    Post,
    Category,
    Like,
    Comment,
    User
};
