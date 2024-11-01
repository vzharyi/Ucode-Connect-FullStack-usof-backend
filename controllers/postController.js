import {Op} from 'sequelize';
import Post from '../models/posts.js';
import Category from '../models/categories.js';
import Like from '../models/likes.js';
import Comment from '../models/comments.js';
import User from '../models/user.js';
import {
    getPagination,
    updatePostRating,
    updateUserRating
} from '../utils/utils.js';
import Favorite from "../models/favorites.js";


class PostController {
    async getPosts(req, res) {
        try {
            const { post_id: postId } = req.params;
            let posts;

            if (postId) {
                await updatePostRating(postId);
                posts = await Post.findOne({
                    where: { id: postId, status: 'active' },
                    include: [{
                        model: Category,
                        as: 'categories',
                        attributes: ['title']
                    }]
                });
                if (!posts) {
                    return res.status(404).json({ error: 'Active post not found' });
                }
            } else {
                const { page = 1, sort = 'likes', categories, startDate, endDate } = req.query;
                const { limit, offset } = getPagination(page, 10);

                const order = sort === 'date'
                    ? [['createdAt', 'DESC']]
                    : [['likesCount', 'DESC']];

                const where = { status: 'active' };

                if (startDate || endDate) {
                    where.createdAt = {};

                    if (startDate) {
                        where.createdAt[Op.gte] = new Date(startDate);
                    }
                    if (endDate) {
                        where.createdAt[Op.lte] = new Date(endDate);
                    }
                }

                if (categories) {
                    posts = await Post.findAll({
                        include: [{
                            model: Category,
                            as: 'categories',
                            where: {
                                id: categories.split(',').map(Number)
                            },
                            required: true
                        }],
                        limit,
                        offset,
                        order,
                        where,
                    });
                } else {
                    posts = await Post.findAll({
                        limit,
                        offset,
                        order,
                        where,
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
            }

            return res.status(200).json(posts);
        } catch (error) {
            return res.status(500).json({ error: 'Error fetching posts', details: error.message });
        }
    }

    async getCommentsForPost(req, res) {
        try {
            const { post_id: postId } = req.params;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const comments = await Comment.findAll({ where: { post_id: postId } });

            return res.status(200).json(comments);
        } catch (error) {
            return res.status(500).json({ error: 'Error fetching comments', details: error.message });
        }
    }

    async createComment(req, res) {
        try {
            const userId = req.user.id;
            const { post_id: postId } = req.params;
            const { content } = req.body;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            if (post.locked) {
                return res.status(403).json({ error: 'This post is locked and cannot be modified' });
            }

            const newComment = await Comment.create({
                author_id: userId,
                post_id: postId,
                content,
            });

            return res.status(201).json(newComment);
        } catch (error) {
            return res.status(500).json({ error: 'Error creating comment', details: error.message });
        }
    }

    async getCategoriesForPost(req, res) {
        try {
            const { post_id: postId } = req.params;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const categories = await post.getCategories();

            return res.status(200).json(categories);
        } catch (error) {
            return res.status(500).json({ error: 'Error fetching categories', details: error.message });
        }
    }

    async getLikesForPost(req, res) {
        try {
            const { post_id: postId } = req.params;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const likes = await Like.findAll({
                where: {
                    post_id: postId
                },
                include: {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'login']
                }
            });

            return res.status(200).json({
                message: `Found ${likes.length} likes for post with ID ${postId}`,
                likes: likes
            });
        } catch (error) {
            console.error('Error fetching likes for post:', error);
            return res.status(500).json({ error: 'Error fetching likes for post', details: error.message });
        }
    }

    async createPost(req, res) {
        try {
            const userId = req.user.id;
            const { title, content, categories } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: 'All fields (title, content, categories) are required, and categories should be an array' });
            }

            const newPost = await Post.create({
                author_id: userId,
                title,
                content
            });

            const categoriesArray = typeof categories === 'string' ? categories.split(',').map(Number) : [];

            if (categoriesArray.length > 0) {
                const categoryInstances = await Category.findAll({
                    where: { id: categoriesArray }
                });
                await newPost.addCategories(categoryInstances);
            }

            return res.status(201).json({
                message: 'Post created successfully',
                post: newPost
            });
        } catch (error) {
            console.error('Error creating post:', error);
            return res.status(500).json({ error: 'Error creating post', details: error.message });
        }
    }

    async likePost(req, res) {
        try {
            const userId = req.user.id;
            const { post_id: postId } = req.params;
            const { type } = req.body;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const existingLike = await Like.findOne({
                where: {
                    author_id: userId,
                    post_id: postId
                }
            });

            if (existingLike) {
                if (existingLike.type === type) {
                    return res.status(400).json({ error: 'You have already given this type of like' });
                } else {
                    existingLike.type = type;
                    await existingLike.save();

                    if (type === 'like') {
                        post.likesCount += 1;
                    } else if (type === 'dislike') {
                        post.likesCount -= 1;
                    }
                    await post.save();
                    await updatePostRating(postId);
                    await updateUserRating(post.author_id);
                    return res.status(200).json({
                        message: 'Like type successfully updated',
                        like: existingLike
                    });
                }
            }

            const newLike = await Like.create({
                author_id: userId,
                post_id: postId,
                type
            });
            await updateUserRating(post.author_id);

            post.likesCount += 1;
            await post.save();

            await updatePostRating(postId);
            return res.status(201).json({
                message: 'Like added successfully',
                like: newLike
            });

        } catch (error) {
            console.error('Error adding like:', error);
            return res.status(500).json({ error: 'Error adding like', details: error.message });
        }
    }

    async updatePost(req, res) {
        try {
            const userId = req.user.id;
            const { post_id: postId } = req.params;
            const { title, content, categories, status } = req.body;
            const user = await User.findByPk(userId);

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            if (post.locked) {
                return res.status(403).json({ error: 'This post is locked and cannot be modified' });
            }

            if (post.author_id === userId) {
                if (title) post.title = title;
                if (content) post.content = content;
                if (categories && Array.isArray(categories)) {
                    const categoryInstances = await Category.findAll({
                        where: { id: categories }
                    });
                    await post.setCategories(categoryInstances);
                }
                if (status === 'inactive') post.status = status;
                await post.save();
            } else if (user.role === 'admin' && (status === 'active' || status === 'inactive')) {
                post.status = status;
                await post.save();
            } else {
                return res.status(403).json({ error: 'You do not have permission to edit this post' });
            }
            return res.status(200).json(post);
        } catch (error) {
            return res.status(500).json({ error: 'Error updating post', details: error.message });
        }
    }

    async deletePost(req, res) {
        try {
            const { post_id: postId } = req.params;
            const userId = req.user.id;
            const user = await User.findByPk(userId);
            const post = await Post.findByPk(postId);

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            if (post.locked) {
                return res.status(403).json({ error: 'This post is locked and cannot be modified' });
            }

            if (post.author_id !== userId && user.role !== 'admin') {
                return res.status(403).json({ error: 'You do not have permission to delete this post' });
            }

            await post.destroy();
            return res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Error deleting post', details: error.message });
        }
    }

    async deleteLike(req, res) {
        try {
            const { post_id: postId } = req.params;
            const userId = req.user.id;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const like = await Like.findOne({
                where: {
                    author_id: userId,
                    post_id: postId
                }
            });

            if (!like) {
                return res.status(404).json({ error: 'Like not found' });
            }

            await like.destroy();
            await updateUserRating(post.author_id);

            post.likesCount -= 1;
            await post.save();

            await updatePostRating(postId);
            return res.status(200).json({ message: 'Like deleted successfully' });
        } catch (error) {
            console.error('Error deleting like:', error);
            return res.status(500).json({ error: 'Error deleting like', details: error.message });
        }
    }

    async addFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { post_id: postId } = req.params;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const existingFavorite = await Favorite.findOne({
                where: {
                    user_id: userId,
                    post_id: postId
                }
            });

            if (existingFavorite) {
                return res.status(400).json({ error: 'Post is already in favorites' });
            }

            const favorite = await Favorite.create({
                user_id: userId,
                post_id: postId
            });

            return res.status(201).json({ message: 'Post added to favorites', favorite });
        } catch (error) {
            return res.status(500).json({ message: 'Error adding to favorites', details: error.message });
        }
    }

    async removeFavorite(req, res) {
        const userId = req.user.id;
        const { post_id: postId } = req.params;

        try {
            const favorite = await Favorite.findOne({
                where: {
                    user_id: userId,
                    post_id: postId
                }
            });

            if (!favorite) {
                return res.status(404).json({ message: 'Favorite record not found' });
            }

            await favorite.destroy();

            return res.status(200).json({ message: 'Post removed from favorites' });
        } catch (error) {
            return res.status(500).json({ message: 'Error removing from favorites', details: error.message });
        }
    }

    async getFavorites(req, res) {
        const userId = req.user.id;

        try {
            const favorites = await Favorite.findAll({
                where: { user_id: userId },
                include: {
                    model: Post,
                    as: 'posts',
                    attributes: ['id', 'title', 'content']
                }
            });
            res.status(200).json(favorites);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching favorites', error });
        }
    }
}

export default new PostController();
