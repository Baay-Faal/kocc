const { Evaluation, Course, Class, User, Session } = require('../models');
const { sendNewEvaluationNotification } = require('../services/mailService');

// Planifier une évaluation (Enseignant)
const createEvaluation = async (req, res) => {
  const { title, type, date, coefficient, courseId, classId } = req.body;
  const teacherId = req.user.id; // Déduit du JWT

  try {
    if (!title || !type || !date || !courseId || !classId) {
      return res.status(400).json({ message: "Veuillez fournir tous les champs obligatoires." });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    const targetClass = await Class.findByPk(classId);
    if (!targetClass) {
      return res.status(404).json({ message: "Classe introuvable." });
    }

    // --- CONTRÔLE DE SÉCURITÉ : Le prof enseigne-t-il cette matière ? ---
    const isTaught = await Session.findOne({
      where: { teacherId, courseId }
    });

    if (!isTaught && req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Accès interdit : Vous ne pouvez pas planifier d'évaluation pour une matière que vous n'enseignez pas."
      });
    }

    // Créer l'évaluation
    const evaluation = await Evaluation.create({
      title,
      type,
      date,
      coefficient: coefficient || 1.0,
      courseId,
      classId,
      teacherId
    });

    // --- ENVOI DE NOTIFICATIONS MAIL ---
    // Récupérer les mails de tous les étudiants de la classe
    const students = await User.findAll({
      where: { classId, role: 'student' },
      attributes: ['email']
    });

    const emails = students.map(s => s.email).filter(e => e);

    if (emails.length > 0) {
      const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      sendNewEvaluationNotification(
        emails,
        `${req.user.firstName} ${req.user.lastName}`,
        course.title,
        title,
        type,
        formattedDate
      );
    }

    return res.status(201).json(evaluation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la planification de l'évaluation." });
  }
};

// Récupérer toutes les évaluations d'une classe
const getEvaluationsByClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const evaluations = await Evaluation.findAll({
      where: { classId },
      include: [
        { model: Course, attributes: ['code', 'title'] },
        { model: User, as: 'teacher', attributes: ['firstName', 'lastName'] }
      ],
      order: [['date', 'ASC']]
    });
    return res.json(evaluations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des évaluations." });
  }
};

// Récupérer les évaluations créées par l'enseignant connecté
const getMyEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.findAll({
      where: { teacherId: req.user.id },
      include: [
        { model: Class, attributes: ['name'] },
        { model: Course, attributes: ['code', 'title'] }
      ],
      order: [['date', 'DESC']]
    });
    return res.json(evaluations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
  createEvaluation,
  getEvaluationsByClass,
  getMyEvaluations
};
