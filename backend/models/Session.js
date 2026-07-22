const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  classroom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  summaryOfSession: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Session;
