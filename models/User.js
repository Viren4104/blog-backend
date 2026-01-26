const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { 
        type: DataTypes.ENUM('user', 'manager', 'admin'), 
        defaultValue: 'user' 
    },
    // Granular Permissions (Admin can toggle these)
    can_create: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_read: { type: DataTypes.BOOLEAN, defaultValue: true },
    can_edit: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_delete: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = User;