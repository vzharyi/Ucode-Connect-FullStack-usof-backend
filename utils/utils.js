import { Op } from 'sequelize';
import cron from 'node-cron';
import User from '../models/user.js';
import Post from '../models/posts.js';
import Like from '../models/likes.js';
import Comment from '../models/comments.js';
import '../models/index.js';

export async function updateEntityRating(entity) {
    let rating = 0;

    entity.likes?.forEach(like => {
        if (like.type === 'like') {
            rating += 1;
        } else if (like.type === 'dislike' && rating > 0) {
            rating -= 1;
        }
    });

    entity.rating = rating;
    await entity.save();
}

export async function updateEntityExistingRating(entity) {
    let rating = 0;

    entity.likes?.forEach(like => {
        if (like.type === 'like') {
            rating += 2;
        } else if (like.type === 'dislike' && rating > 0) {
            rating -= 2;
        }
    });

    entity.rating = rating;
    await entity.save();
}

export async function updateUserRating(userId, isExistingLike = false) {
    try {
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Post,
                    as: 'posts',
                    include: [{ model: Like, as: 'likes', attributes: ['type'] }]
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [{ model: Like, as: 'likes', attributes: ['type'] }]
                }
            ]
        });

        let userRating = 0;

        const updateFunction = isExistingLike ? updateEntityExistingRating : updateEntityRating;

        user.posts?.forEach(post => {
            updateFunction(post);
            userRating += post.rating || 0;
        });

        user.comments?.forEach(comment => {
            updateFunction(comment);
            userRating += comment.rating || 0;
        });

        user.rating = userRating;
        await user.save();
    } catch (error) {
        console.error('Error updating user rating:', error);
    }
}

export async function updatePostRating(postId, isExistingLike = false) {
    try {
        const post = await Post.findByPk(postId, {
            include: [{ model: Like, as: 'likes', attributes: ['type'] }]
        });
        const updateFunction = isExistingLike ? updateEntityExistingRating : updateEntityRating;
        await updateFunction(post);
    } catch (error) {
        console.error('Error updating post rating:', error);
    }
}

export async function updateCommentRating(commentId, isExistingLike = false) {
    try {
        const comment = await Comment.findByPk(commentId, {
            include: [{ model: Like, as: 'likes', attributes: ['type'] }]
        });
        const updateFunction = isExistingLike ? updateEntityExistingRating : updateEntityRating;
        await updateFunction(comment);
    } catch (error) {
        console.error('Error updating comment rating:', error);
    }
}

export function getPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return { limit, offset };
}

export async function lockOldPosts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Post.update(
        { locked: true },
        { where: { createdAt: { [Op.lt]: thirtyDaysAgo }, locked: false } }
    );
}

cron.schedule('0 * * * *', async () => {
    console.log('Running job to lock old posts every minute');
    await lockOldPosts();
});
