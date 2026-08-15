const { Grade, Evaluation, Course, User, Class } = require('../models');

// Saisie groupée des notes pour une évaluation (Enseignant)
const inputGrades = async (req, res) => {
  const { evaluationId, records } = req.body;
  const teacherId = req.user.id;

  try {
    if (!evaluationId || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: "Données de notes invalides ou manquantes." });
    }

    const evaluation = await Evaluation.findByPk(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: "Évaluation introuvable." });
    }

    // --- CONTRÔLE DE SÉCURITÉ : Le prof est-il le créateur de cette évaluation ? ---
    if (evaluation.teacherId !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Accès interdit : Vous ne pouvez saisir les notes que pour vos propres évaluations."
      });
    }

    const savedGrades = [];
    for (const record of records) {
      const { studentId, score } = record;

      if (!studentId || score === undefined || score === null) {
        continue;
      }

      // Upsert grade
      let grade = await Grade.findOne({
        where: { evaluationId, studentId }
      });

      if (grade) {
        grade.score = score;
        await grade.save();
      } else {
        grade = await Grade.create({
          evaluationId,
          studentId,
          score
        });
      }
      savedGrades.push(grade);
    }

    return res.json({
      message: "Notes enregistrées avec succès.",
      count: savedGrades.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement des notes." });
  }
};

// Moteur de calcul du Bulletin Semestriel LMD
const getStudentBulletin = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await User.findByPk(studentId, {
      include: [{ model: Class, as: 'class', attributes: ['name', 'department'] }]
    });

    if (!student) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }

    // 1. Récupérer toutes les notes de l'étudiant avec l'évaluation et la matière associée
    const grades = await Grade.findAll({
      where: { studentId },
      include: [
        {
          model: Evaluation,
          include: [{ model: Course }]
        }
      ]
    });

    // 2. Grouper les notes par matière (courseId)
    const gradesByCourse = {};
    grades.forEach(g => {
      const evaluation = g.Evaluation;
      if (!evaluation || !evaluation.Course) return;

      const courseId = evaluation.courseId;
      if (!gradesByCourse[courseId]) {
        gradesByCourse[courseId] = {
          course: evaluation.Course,
          devoirs: [],
          examens: []
        };
      }

      if (evaluation.type === 'devoir') {
        gradesByCourse[courseId].devoirs.push({
          score: g.score,
          coefficient: evaluation.coefficient
        });
      } else if (evaluation.type === 'examen') {
        gradesByCourse[courseId].examens.push({
          score: g.score,
          coefficient: evaluation.coefficient
        });
      }
    });

    // 3. Calculer la moyenne et valider les crédits pour chaque matière
    let totalCreditsAcquired = 0;
    let totalCreditsAttempted = 0;
    let weightedScoreSum = 0;
    let coefficientSum = 0;
    const coursesBulletins = [];

    for (const courseId in gradesByCourse) {
      const { course, devoirs, examens } = gradesByCourse[courseId];

      // Moyenne des devoirs
      let devoirAvg = 0;
      if (devoirs.length > 0) {
        const sum = devoirs.reduce((acc, curr) => acc + (curr.score * curr.coefficient), 0);
        const coeffSum = devoirs.reduce((acc, curr) => acc + curr.coefficient, 0);
        devoirAvg = sum / coeffSum;
      }

      // Moyenne des examens
      let examenAvg = 0;
      if (examens.length > 0) {
        const sum = examens.reduce((acc, curr) => acc + (curr.score * curr.coefficient), 0);
        const coeffSum = examens.reduce((acc, curr) => acc + curr.coefficient, 0);
        examenAvg = sum / coeffSum;
      }

      // Note finale de la matière : Standard LMD (40% Devoirs / 60% Examen)
      let finalGrade = 0;
      if (devoirs.length > 0 && examens.length > 0) {
        finalGrade = (devoirAvg * 0.4) + (examenAvg * 0.6);
      } else if (devoirs.length > 0) {
        finalGrade = devoirAvg; // Si pas d'examen
      } else if (examens.length > 0) {
        finalGrade = examenAvg; // Si pas de devoir
      }

      finalGrade = Math.round(finalGrade * 100) / 100; // Arrondi à deux décimales

      // Validation de la matière (note >= 10)
      const isCourseValidated = finalGrade >= 10;
      const creditsAcquired = isCourseValidated ? course.credits : 0;

      totalCreditsAttempted += course.credits;
      totalCreditsAcquired += creditsAcquired;

      // Calcul pour la moyenne générale pondérée
      weightedScoreSum += finalGrade * course.coefficient;
      coefficientSum += course.coefficient;

      coursesBulletins.push({
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        credits: course.credits,
        coefficient: course.coefficient,
        devoirAverage: devoirs.length > 0 ? Math.round(devoirAvg * 100) / 100 : null,
        examenAverage: examens.length > 0 ? Math.round(examenAvg * 100) / 100 : null,
        finalGrade,
        status: isCourseValidated ? 'Validé' : 'Rattrapage',
        creditsAcquired
      });
    }

    // Calcul de la moyenne générale semestrielle
    const semesterAverage = coefficientSum > 0 ? Math.round((weightedScoreSum / coefficientSum) * 100) / 100 : 0;

    // Règle de validation LMD : Avoir obtenu au moins 30 crédits sur le semestre
    // (Dans notre simulation, si l'étudiant a validé toutes les matières ou atteint 30 crédits)
    const isSemesterValidated = totalCreditsAcquired >= 30;

    return res.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        class: student.class ? student.class.name : 'N/A',
        department: student.class ? student.class.department : 'N/A'
      },
      courses: coursesBulletins,
      summary: {
        totalCreditsAttempted,
        totalCreditsAcquired,
        semesterAverage,
        status: isSemesterValidated ? 'SEMESTRE VALIDÉ' : 'SEMESTRE NON VALIDÉ'
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors du calcul du bulletin LMD." });
  }
};

module.exports = {
  inputGrades,
  getStudentBulletin
};
