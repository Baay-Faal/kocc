const cron = require('node-cron');
const { Op } = require('sequelize');
const { Session, Course, Class, User } = require('../models');
const { sendTeacherEveBriefing } = require('./mailService');

/**
 * Service de génération et d'envoi du "Briefing de la Veille" par MBENE
 * Analyse les cours du lendemain et expédie un récapitulatif intelligent à chaque professeur.
 */
const generateAndSendEveBriefings = async (customDate = null) => {
  try {
    // Déterminer la date cible (demain par défaut)
    let target = customDate ? new Date(customDate) : new Date();
    if (!customDate) {
      target.setDate(target.getDate() + 1);
    }

    const startOfDay = new Date(target);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(target);
    endOfDay.setHours(23, 59, 59, 999);

    const formattedDate = target.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    console.log(`\n[MBENE Reminder] Analyse des cours pour le ${formattedDate}...`);

    // Récupérer toutes les séances de cette journée
    const sessions = await Session.findAll({
      where: {
        startTime: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [
        { model: Course },
        { model: Class },
        { model: User, as: 'teacher' }
      ],
      order: [['startTime', 'ASC']]
    });

    if (sessions.length === 0) {
      console.log(`[MBENE Reminder] Aucune séance planifiée pour le ${formattedDate}.`);
      return {
        success: true,
        date: formattedDate,
        teachersNotified: 0,
        message: `Aucune séance planifiée pour le ${formattedDate}.`,
        details: []
      };
    }

    // Regrouper par professeur
    const sessionsByTeacher = {};
    for (const session of sessions) {
      if (!session.teacher || !session.teacher.email) continue;

      const tId = session.teacher.id;
      if (!sessionsByTeacher[tId]) {
        sessionsByTeacher[tId] = {
          teacher: session.teacher,
          sessions: []
        };
      }
      sessionsByTeacher[tId].sessions.push(session);
    }

    const reportDetails = [];

    // Pour chaque enseignant, préparer et envoyer son briefing
    for (const tId in sessionsByTeacher) {
      const { teacher, sessions: teacherSessions } = sessionsByTeacher[tId];
      const preparedSessions = [];

      for (const s of teacherSessions) {
        const startH = new Date(s.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const endH = new Date(s.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Chercher la séance précédente du même cours avec la même classe pour extraire le cahier de textes
        const prevSession = await Session.findOne({
          where: {
            courseId: s.courseId,
            classId: s.classId,
            startTime: { [Op.lt]: s.startTime }
          },
          order: [['startTime', 'DESC']]
        });

        // Effectif de la classe
        const studentCount = await User.count({
          where: { role: 'student', classId: s.classId }
        });

        let mbeneAdvice = '';
        if (prevSession && prevSession.summary && prevSession.summary.trim()) {
          mbeneAdvice = `Lors de votre dernière séance (${new Date(prevSession.startTime).toLocaleDateString('fr-FR')}), vous aviez abordé : « ${prevSession.summary} ». MBENE vous conseille de prévoir 5 à 10 minutes d'introduction pour valider l'acquisition de ces concepts avant de poursuivre.`;
        } else {
          mbeneAdvice = `Séance d'ouverture ou de reprise pour ce module. MBENE vous suggère d'exposer clairement les objectifs de la séance, le cadre méthodologique et de rappeler les prérequis.`;
        }

        preparedSessions.push({
          time: `${startH} - ${endH}`,
          courseTitle: s.Course?.title || 'Cours sans titre',
          className: s.Class?.name || 'Classe non définie',
          classroom: s.classroom || 'Salle non assignée',
          studentCount,
          mbeneAdvice
        });
      }

      // Envoyer l'e-mail de briefing
      const teacherFullName = `${teacher.firstName} ${teacher.lastName}`;
      await sendTeacherEveBriefing(teacher.email, teacherFullName, formattedDate, preparedSessions);

      reportDetails.push({
        teacher: teacherFullName,
        email: teacher.email,
        sessionCount: preparedSessions.length,
        courses: preparedSessions.map(p => `${p.courseTitle} (${p.time})`)
      });

      console.log(`[MBENE Reminder] ✓ Briefing envoyé à ${teacherFullName} (${teacher.email}) - ${preparedSessions.length} cours`);
    }

    return {
      success: true,
      date: formattedDate,
      teachersNotified: Object.keys(sessionsByTeacher).length,
      details: reportDetails
    };

  } catch (error) {
    console.error("[MBENE Reminder Error] Erreur lors de la génération des rappels :", error);
    throw error;
  }
};

/**
 * Initialise le planificateur CRON automatique
 * S'exécute automatiquement chaque soir à 20h00
 */
const initDailyCron = () => {
  // '0 20 * * *' = tous les soirs à 20h00
  cron.schedule('0 20 * * *', async () => {
    console.log('\n[CRON] Déclenchement automatique du Briefing de la Veille MBENE (20h00)...');
    try {
      await generateAndSendEveBriefings();
    } catch (err) {
      console.error('[CRON Error] Échec du cron de rappel MBENE :', err);
    }
  });

  console.log('✓ Planificateur CRON MBENE activé (Envoi quotidien des briefings enseignants programmé à 20h00).');
};

module.exports = {
  generateAndSendEveBriefings,
  initDailyCron
};
