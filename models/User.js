module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,

    role: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    },

    can_create: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    can_edit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    can_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    can_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return User;
};
