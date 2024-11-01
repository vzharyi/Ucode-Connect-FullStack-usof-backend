import Like from '../models/likes.js';
import Comment from '../models/comments.js';
import User from '../models/user.js';
import { updateCommentRating, updateUserRating} from "../utils/utils.js";
import Post from "../models/posts.js";

class CommentController {
    async getComment(req, res) {
        try {
            const { comment_id: commentId } = req.params;

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            await updateCommentRating(commentId);
            res.status(200).json(comment);
        } catch (error) {
            res.status(500).json({ error: 'Error retrieving comment', details: error.message });
        }
    }

    async getLikesForComment(req, res) {
        try {
            const { comment_id: commentId } = req.params;

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const likes = await Like.findAll({
                where: { comment_id: commentId },
                include: {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'login']
                }
            });

            return res.status(200).json({
                message: `Found ${likes.length} likes for comment with ID ${commentId}`,
                likes: likes
            });
        } catch (error) {
            console.error('Error retrieving likes for comment:', error);
            return res.status(500).json({ error: 'Error retrieving likes for comment', details: error.message });
        }
    }

    async likeComment(req, res) {
        try {
            const { comment_id: commentId } = req.params;
            const userId = req.user.id;
            const { type } = req.body;

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const existingLike = await Like.findOne({
                where: { author_id: userId, comment_id: commentId },
            });

            if (existingLike) {
                if (existingLike.type === type) {
                    return res.status(400).json({ error: 'You have already set this like type' });
                } else {
                    existingLike.type = type;
                    await existingLike.save();
                    await updateUserRating(comment.author_id);
                    await updateCommentRating(commentId);
                    return res.status(200).json({
                        message: 'Like type successfully updated',
                        like: existingLike
                    });
                }
            }

            const newLike = await Like.create({
                author_id: userId,
                comment_id: commentId,
                type
            });
            await updateUserRating(comment.author_id);
            await updateCommentRating(commentId);
            return res.status(201).json({ message: 'Like successfully added', like: newLike });
        } catch (error) {
            console.error('Error adding like:', error);
            return res.status(500).json({ error: 'Error adding like', details: error.message });
        }
    }

    async updateComment(req, res) {
        try {
            const userId = req.user.id;
            const { comment_id: commentId } = req.params;
            const { content } = req.body;

            const comment = await Comment.findByPk(commentId, {
                include: { model: Post, as: 'posts', attributes: ['locked'] }
            });
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            if (comment.posts && comment.posts.locked) {
                return res.status(403).json({ error: 'This post is locked and cannot be modified' });
            }

            if (comment.author_id === userId) {
                if (content) {
                    comment.content = content;
                    await comment.save();
                }
                return res.status(200).json({ message: 'Comment successfully updated', comment });
            } else {
                return res.status(403).json({ error: 'You cannot edit this comment' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Error updating comment', details: error.message });
        }
    }

    async deleteComment(req, res) {
        try {
            const userId = req.user.id;
            const { comment_id: commentId } = req.params;

            const comment = await Comment.findByPk(commentId, {
                include: { model: Post, as: 'posts', attributes: ['locked'] }
            });

            const user = await User.findByPk(userId);

            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            if (comment.posts && comment.posts.locked) {
                return res.status(403).json({ error: 'This post is locked and cannot be modified' });
            }

            const isAuthorOrAdmin = comment.author_id === userId || user.role === 'admin';

            if (!isAuthorOrAdmin) {
                return res.status(403).json({ error: 'You do not have permission to delete this comment' });
            }

            await comment.destroy();
            return res.status(200).json({ message: 'Comment successfully deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting comment', details: error.message });
        }
    }

    async deleteLikeForComment(req, res) {
        try {
            const { comment_id: commentId } = req.params;
            const userId = req.user.id;

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const like = await Like.findOne({
                where: {
                    author_id: userId,
                    comment_id: commentId,
                },
            });

            if (!like) {
                return res.status(404).json({ error: 'Like not found' });
            }

            await like.destroy();
            await updateUserRating(comment.author_id);
            await updateCommentRating(commentId);
            return res.status(200).json({ message: 'Like/Dislike successfully removed' });
        } catch (error) {
            res.status(500).json({ error: 'Error deleting like', details: error.message });
        }
    }
}

export default new CommentController();
