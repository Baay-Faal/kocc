const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('devoir', 'examen'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  coefficient: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0
  }
});

module.exports = Evaluation;
