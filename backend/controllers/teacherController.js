const { Session, Class, Course, User } = require('../models');

/**
 * Récupère uniquement les classes attribuées à l'enseignant connecté
 */
const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Récupérer toutes les séances de cet enseignant avec la classe et la matière
    const sessions = await Session.findAll({
      where: { teacherId },
      include: [
        { model: Class, attributes: ['id', 'name', 'department'] },
        { model: Course, attributes: ['id', 'title', 'code'] }
      ]
    });

    // Regrouper par classe unique
    const classMap = {};
    for (const s of sessions) {
      if (!s.Class) continue;
      const cId = s.Class.id;
      if (!classMap[cId]) {
        classMap[cId] = {
          id: s.Class.id,
          name: s.Class.name,
          department: s.Class.department,
          coursesMap: {},
          sessionCount: 0
        };
      }
      classMap[cId].sessionCount++;
      if (s.Course) {
        classMap[cId].coursesMap[s.Course.id] = s.Course.title;
      }
    }

    const assignedClasses = [];
    for (const cId in classMap) {
      const item = classMap[cId];
      // Compter le nombre d'étudiants inscrits dans cette classe
      const studentCount = await User.count({
        where: { role: 'student', classId: item.id }
      });

      assignedClasses.push({
        id: item.id,
        name: item.name,
        department: item.department,
        sessionCount: item.sessionCount,
        studentCount,
        courses: Object.values(item.coursesMap)
      });
    }

    // Trier par nom de classe
    assignedClasses.sort((a, b) => a.name.localeCompare(b.name));

    return res.json(assignedClasses);
  } catch (error) {
    console.error('Erreur getMyClasses:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des classes affectées.' });
  }
};

/**
 * Récupère les étudiants d'une classe attribuée, avec vérification stricte des droits
 */
const getClassStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;

    // Vérification de sécurité : vérifier que cette classe est bien attribuée à l'enseignant
    if (req.user.role === 'teacher') {
      const hasSession = await Session.findOne({
        where: { teacherId, classId }
      });
      if (!hasSession) {
        return res.status(403).json({ message: "Accès refusé : cette classe ne vous est pas attribuée." });
      }
    }

    const targetClass = await Class.findByPk(classId, {
      attributes: ['id', 'name', 'department']
    });

    if (!targetClass) {
      return res.status(404).json({ message: 'Classe introuvable.' });
    }

    // Récupérer les étudiants de cette classe
    const students = await User.findAll({
      where: { role: 'student', classId },
      attributes: ['id', 'firstName', 'lastName', 'matricule', 'email', 'isActive'],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    // Récupérer les matières enseignées par ce professeur dans cette classe
    const sessions = await Session.findAll({
      where: { teacherId, classId },
      include: [{ model: Course, attributes: ['id', 'title', 'code'] }]
    });

    const coursesTaught = Array.from(new Set(sessions.map(s => s.Course?.title).filter(Boolean)));

    return res.json({
      class: targetClass,
      coursesTaught,
      studentCount: students.length,
      students
    });
  } catch (error) {
    console.error('Erreur getClassStudents:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des étudiants de la classe.' });
  }
};

module.exports = {
  getMyClasses,
  getClassStudents
};
