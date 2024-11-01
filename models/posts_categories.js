import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PostCategories = sequelize.define('PostCategories', {
    post_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'posts',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'post_categories',
    timestamps: false
});

export default PostCategories;
