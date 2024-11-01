import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Favorite = sequelize.define('Favorite', {
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    post_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'posts',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'favorite_post',
    timestamps: false
});

export default Favorite;
