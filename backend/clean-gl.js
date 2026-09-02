const { sequelize, User, Class, Course, Session, Attendance, Evaluation, Grade, Document } = require('./models');
const { Op } = require('sequelize');

const cleanGlData = async () => {
  try {
    console.log('--- DÉBUT DU NETTOYAGE DES DONNÉES GÉNIE LOGICIEL (GL) ---');

    // 1. Identifier les classes GL
    const glClasses = await Class.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.in]: ['GL1', 'GL2', 'GL3'] } },
          { department: 'Informatique & Génie Logiciel' }
        ]
      }
    });
    const glClassIds = glClasses.map(c => c.id);
    console.log(`Classes GL identifiées : ${glClassIds.length} trouvée(s) [${glClasses.map(c => c.name).join(', ')}]`);

    // 2. Identifier les cours GL
    const glCourses = await Course.findAll({
      where: {
        code: {
          [Op.or]: [
            { [Op.like]: 'GL1-%' },
            { [Op.like]: 'GL2-%' },
            { [Op.like]: 'GL3-%' },
            { [Op.like]: 'GL-%' }
          ]
        }
      }
    });
    const glCourseIds = glCourses.map(c => c.id);
    console.log(`Cours GL identifiés : ${glCourseIds.length} cours trouvé(s)`);

    // 3. Identifier les étudiants GL
    const glStudents = await User.findAll({
      where: {
        role: 'student',
        [Op.or]: [
          { classId: { [Op.in]: glClassIds } },
          { matricule: { [Op.like]: 'ISI-202%-%' } }
        ]
      }
    });
    const glStudentIds = glStudents.map(s => s.id);
    console.log(`Étudiants GL identifiés : ${glStudentIds.length} étudiant(s) trouvé(s)`);

    // 4. Identifier les professeurs GL
    const glProfEmails = [
      'amadou.ba@isi.sn', 'fatoukine.diop@isi.sn', 'cheikh.ndiaye@isi.sn',
      'mariama.sarr@isi.sn', 'ousmane.fall@isi.sn', 'ibrahima.konate@isi.sn',
      'awa.seck@isi.sn', 'babacar.cisse@isi.sn', 'mamadou.sow@isi.sn',
      'ndeye.diallo@isi.sn', 'moussa.traore@isi.sn', 'abdoulaye.wade@isi.sn',
      'khady.gueye@isi.sn', 'serigne.sylla@isi.sn', 'samba.camara@isi.sn',
      'aissatou.kane@isi.sn', 'doudou.diagne@isi.sn', 'souleymane.faye@isi.sn'
    ];
    const glTeachers = await User.findAll({
      where: {
        role: 'teacher',
        email: { [Op.in]: glProfEmails }
      }
    });
    const glTeacherIds = glTeachers.map(t => t.id);
    console.log(`Professeurs GL identifiés : ${glTeacherIds.length} professeur(s) trouvé(s)`);

    // 5. Supprimer les Notes (Grades)
    const deletedGrades = await Grade.destroy({
      where: {
        studentId: { [Op.in]: glStudentIds }
      }
    });
    console.log(`✓ Notes supprimées : ${deletedGrades}`);

    // 6. Supprimer les Évaluations
    const deletedEvaluations = await Evaluation.destroy({
      where: {
        [Op.or]: [
          { classId: { [Op.in]: glClassIds } },
          { courseId: { [Op.in]: glCourseIds } },
          { teacherId: { [Op.in]: glTeacherIds } }
        ]
      }
    });
    console.log(`✓ Évaluations supprimées : ${deletedEvaluations}`);

    // 7. Supprimer les Présences (Attendances)
    const deletedAttendances = await Attendance.destroy({
      where: {
        studentId: { [Op.in]: glStudentIds }
      }
    });
    console.log(`✓ Feuilles d'émargement / Présences supprimées : ${deletedAttendances}`);

    // 8. Supprimer les Séances (Sessions)
    const deletedSessions = await Session.destroy({
      where: {
        [Op.or]: [
          { classId: { [Op.in]: glClassIds } },
          { courseId: { [Op.in]: glCourseIds } },
          { teacherId: { [Op.in]: glTeacherIds } }
        ]
      }
    });
    console.log(`✓ Séances d'emploi du temps supprimées : ${deletedSessions}`);

    // 9. Supprimer les Documents
    const deletedDocuments = await Document.destroy({
      where: {
        [Op.or]: [
          { courseId: { [Op.in]: glCourseIds } },
          { teacherId: { [Op.in]: glTeacherIds } }
        ]
      }
    });
    console.log(`✓ Documents de cours supprimés : ${deletedDocuments}`);

    // 10. Supprimer les Étudiants
    const deletedStudents = await User.destroy({
      where: {
        id: { [Op.in]: glStudentIds }
      }
    });
    console.log(`✓ Étudiants GL supprimés : ${deletedStudents}`);

    // 11. Supprimer les Professeurs du jeu de test
    const deletedTeachers = await User.destroy({
      where: {
        id: { [Op.in]: glTeacherIds }
      }
    });
    console.log(`✓ Professeurs GL supprimés : ${deletedTeachers}`);

    // 12. Supprimer les Cours GL
    const deletedCourses = await Course.destroy({
      where: {
        id: { [Op.in]: glCourseIds }
      }
    });
    console.log(`✓ Cours GL supprimés : ${deletedCourses}`);

    // 13. Supprimer les Classes GL
    const deletedClasses = await Class.destroy({
      where: {
        id: { [Op.in]: glClassIds }
      }
    });
    console.log(`✓ Classes GL supprimées : ${deletedClasses}`);

    console.log('\n--- NETTOYAGE TERMINÉ AVEC SUCCÈS. Aucun compte administrateur n\'a été affecté. ---\n');
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage des données GL :', error);
    throw error;
  }
};

if (require.main === module) {
  cleanGlData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = cleanGlData;
