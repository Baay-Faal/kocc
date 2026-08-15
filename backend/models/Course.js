const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coefficient: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4
  }
});

module.exports = Course;
