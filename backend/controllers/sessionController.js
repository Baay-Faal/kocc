const { Session, Class, Course, User } = require('../models');

// Créer une séance d'emploi du temps (Admin)
const createSession = async (req, res) => {
  const { startTime, endTime, classroom, classId, courseId, teacherId } = req.body;

  try {
    if (!startTime || !endTime || !classroom || !classId || !courseId || !teacherId) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const session = await Session.create({
      startTime,
      endTime,
      classroom,
      classId,
      courseId,
      teacherId
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la création de la séance." });
  }
};

// Récupérer toutes les séances (Admin)
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: [
        { model: Class, attributes: ['id', 'name'] },
        { model: Course, attributes: ['id', 'code', 'title'] },
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['startTime', 'ASC']]
    });
    return res.json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des séances." });
  }
};

// Récupérer une séance par son ID
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id, {
      include: [
        { model: Class, attributes: ['id', 'name'] },
        { model: Course, attributes: ['id', 'code', 'title'] },
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!session) {
      return res.status(404).json({ message: "Séance introuvable." });
    }

    return res.json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Récupérer les séances d'une classe (Emploi du temps classe)
const getSessionsByClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const sessions = await Session.findAll({
      where: { classId },
      include: [
        { model: Course, attributes: ['id', 'code', 'title'] },
        { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['startTime', 'ASC']]
    });

    return res.json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération de l'emploi du temps." });
  }
};

// Récupérer les séances d'un enseignant (Pour faire l'appel)
const getSessionsByTeacher = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const sessions = await Session.findAll({
      where: { teacherId },
      include: [
        { model: Class, attributes: ['id', 'name'] },
        { model: Course, attributes: ['id', 'code', 'title'] }
      ],
      order: [['startTime', 'ASC']]
    });

    return res.json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des séances du professeur." });
  }
};

// Mettre à jour une séance (Admin)
const updateSession = async (req, res) => {
  const { startTime, endTime, classroom, classId, courseId, teacherId, summaryOfSession } = req.body;

  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Séance introuvable." });
    }

    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (classroom) session.classroom = classroom;
    if (classId) session.classId = classId;
    if (courseId) session.courseId = courseId;
    if (teacherId) session.teacherId = teacherId;
    if (summaryOfSession !== undefined) session.summaryOfSession = summaryOfSession;

    await session.save();
    return res.json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
};

// Supprimer une séance (Admin)
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Séance introuvable." });
    }

    await session.destroy();
    return res.json({ message: "Séance supprimée avec succès de l'emploi du temps." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  getSessionsByClass,
  getSessionsByTeacher,
  updateSession,
  deleteSession
};
