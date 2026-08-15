const { Session, Attendance, User, Class, Course } = require('../models');
const { getCourseRecall, getRemediationRecommendations, getStudentTutorResponse } = require('../services/aiService');

// Assistant MBENE pour enseignant : Rappel et continuité de cours
const getCourseRecallHandler = async (req, res) => {
  const { courseId } = req.query;

  try {
    if (!courseId) {
      return res.status(400).json({ message: "Veuillez fournir le paramètre courseId." });
    }

    // Récupérer la dernière séance d'emploi du temps pour cette matière
    const lastSession = await Session.findOne({
      where: { courseId },
      order: [['startTime', 'DESC']]
    });

    if (!lastSession) {
      return res.json({
        message: "Aucune séance précédente enregistrée pour cette matière.",
        aiRecall: "Aucune séance précédente disponible pour générer des recommandations."
      });
    }

    // Calculer le taux de présence de cette séance
    const records = await Attendance.findAll({
      where: { sessionId: lastSession.id }
    });

    let attendanceRate = 100;
    if (records.length > 0) {
      const attending = records.filter(r => r.status === 'present' || r.status === 'late').length;
      attendanceRate = Math.round((attending / records.length) * 100);
    }

    // Appeler le service Gemini
    const aiResponse = await getCourseRecall(lastSession.summaryOfSession, attendanceRate);

    return res.json({
      lastSession: {
        id: lastSession.id,
        startTime: lastSession.startTime,
        classroom: lastSession.classroom,
        summaryOfSession: lastSession.summaryOfSession,
        attendanceRate
      },
      aiRecall: aiResponse
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la génération du rappel intelligent." });
  }
};

// Assistant MBENE pour la direction : Alertes décrochage & Remédiations
const getAlertesHandler = async (req, res) => {
  try {
    // 1. Récupérer tous les étudiants avec leur classe
    const students = await User.findAll({
      where: { role: 'student' },
      include: [{ model: Class, as: 'class', attributes: ['name'] }]
    });

    const atRiskStudents = [];
    let aliasCounter = 1;

    // 2. Calculer le taux d'assiduité de chaque étudiant
    for (const student of students) {
      const records = await Attendance.findAll({
        where: { studentId: student.id }
      });

      if (records.length === 0) continue; // Pas encore de données de présence

      const attending = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const rate = Math.round((attending / records.length) * 100);

      // Seuil d'assiduité critique inférieur à 70%
      if (rate < 70) {
        const alias = `Etudiant_${String(aliasCounter++).padStart(2, '0')}`;
        atRiskStudents.push({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          className: student.class ? student.class.name : "N/A",
          alias,
          attendanceRate: rate
        });
      }
    }

    if (atRiskStudents.length === 0) {
      return res.json({
        message: "Tous les étudiants présentent un taux d'assiduité satisfaisant (supérieur à 70%).",
        atRiskStudents: [],
        aiRecommendations: "Aucune action de remédiation nécessaire pour le moment."
      });
    }

    // 3. Préparer les profils anonymisés pour l'API Gemini
    const anonymizedList = atRiskStudents.map(student => ({
      alias: student.alias,
      attendanceRate: student.attendanceRate
    }));

    // 4. Appeler le service Gemini
    const aiRecommendations = await getRemediationRecommendations(anonymizedList);

    return res.json({
      atRiskStudents, // Contient les vrais noms pour l'affichage de l'interface Direction
      aiRecommendations // Recommandations anonymes générées par l'IA
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des alertes IA." });
  }
};

// Assistant MBENE pour étudiant : Tutorat académique sur une matière
const getStudentTutorHandler = async (req, res) => {
  const { courseId, question } = req.body;

  try {
    if (!courseId || !question) {
      return res.status(400).json({ message: "Veuillez fournir le courseId et votre question." });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    // Récupérer tous les résumés des cours réels dispensés pour ce cours
    const sessions = await Session.findAll({
      where: { courseId },
      order: [['startTime', 'ASC']],
      attributes: ['summaryOfSession']
    });

    const summaries = sessions
      .map(s => s.summaryOfSession)
      .filter(summary => summary && summary.trim() !== "");

    // Appeler le service Gemini
    const aiResponse = await getStudentTutorResponse(course.title, summaries, question);

    return res.json({
      course: {
        id: course.id,
        code: course.code,
        title: course.title
      },
      answer: aiResponse
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la génération de la réponse du tuteur." });
  }
};

module.exports = {
  getCourseRecallHandler,
  getAlertesHandler,
  getStudentTutorHandler
};
