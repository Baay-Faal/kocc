const sequelize = require('../config/database');
const User = require('./User');
const Class = require('./Class');
const Course = require('./Course');
const Session = require('./Session');
const Attendance = require('./Attendance');
const Grade = require('./Grade');
const Document = require('./Document');

// Relations d'Utilisateurs
Class.hasMany(User, { foreignKey: 'classId', as: 'students' });
User.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Relations de Séances (Session)
Class.hasMany(Session, { foreignKey: 'classId' });
Session.belongsTo(Class, { foreignKey: 'classId' });

Course.hasMany(Session, { foreignKey: 'courseId' });
Session.belongsTo(Course, { foreignKey: 'courseId' });

User.hasMany(Session, { foreignKey: 'teacherId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// Relations de Présences (Attendance)
Session.hasMany(Attendance, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
Attendance.belongsTo(Session, { foreignKey: 'sessionId' });

User.hasMany(Attendance, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// Relations de Notes (Grade)
User.hasMany(Grade, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Grade.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(Grade, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Grade.belongsTo(Course, { foreignKey: 'courseId' });

// Relations de Documents
Course.hasMany(Document, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Document.belongsTo(Course, { foreignKey: 'courseId' });

User.hasMany(Document, { foreignKey: 'teacherId', onDelete: 'CASCADE' });
Document.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

module.exports = {
  sequelize,
  User,
  Class,
  Course,
  Session,
  Attendance,
  Grade,
  Document
};
