const { DataTypes } = require('@sequelize/core');
const sequelize = require('../config/database'); // Make sure you have this file for DB connection

const User = sequelize.define('User', {
  customer_account_id: {
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true,
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  customer_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  reset_token_expiration: {
        type: DataTypes.DATE,
        allowNull: true, 
  },
}, {
  tableName: 'customer_account', // Optional: This specifies the table name in PostgreSQL
  timestamps: false,  // If you are not using timestamps like createdAt/updatedAt
});

module.exports = User;
