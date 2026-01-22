const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Post = sequelize.define('Post', {
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    is_published: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Relationship: A Post belongs to a User
User.hasMany(Post, { onDelete: 'CASCADE' });
Post.belongsTo(User);

module.exports = Post;