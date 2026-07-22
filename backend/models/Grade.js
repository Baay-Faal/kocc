const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 20
    }
  },
  evaluationType: {
    type: DataTypes.ENUM('devoir', 'examen'),
    allowNull: false
  }
});

module.exports = Grade;
