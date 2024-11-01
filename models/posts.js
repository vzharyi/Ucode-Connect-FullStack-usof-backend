import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Posts = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    author_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0
    },
    likesCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0
    },
    locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'posts',
    timestamps: true
});

export default Posts;
