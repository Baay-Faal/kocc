const bcrypt = require('bcryptjs');
const { sequelize, User, Class, Course, Session, Attendance, Evaluation, Grade } = require('./models');

const seedDatabase = async () => {
  try {
    console.log('Connexion et synchronisation de la base de données (force: true)...');
    await sequelize.sync({ force: true });
    console.log('Tables créées avec succès.');

    // 1. Création des classes
    console.log('Peuplement des Classes...');
    const gl3 = await Class.create({
      name: 'GL3',
      department: 'Informatique & Génie Logiciel'
    });
    const ri2 = await Class.create({
      name: 'RI2',
      department: 'Réseaux & Télécoms'
    });

    // 2. Création des cours/matières avec crédits LMD
    console.log('Peuplement des Cours...');
    const net201 = await Course.create({
      code: 'NET201',
      title: 'Développement Web Avancé (Node.js/Express)',
      coefficient: 3,
      credits: 15 // 15 crédits pour ce cours
    });
    const math101 = await Course.create({
      code: 'MATH101',
      title: 'Algèbre Linéaire',
      coefficient: 2,
      credits: 15 // 15 crédits pour ce cours (total semestre = 30 crédits)
    });

    // 3. Cryptage du mot de passe par défaut
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('kocc1234', salt);

    // 4. Création des utilisateurs
    console.log('Peuplement des Utilisateurs...');
    
    const admin = await User.create({
      firstName: 'Alassane',
      lastName: 'Diallo',
      email: 'admin@isi.sn',
      password: defaultPassword,
      role: 'admin'
    });

    const teacher = await User.create({
      firstName: 'Amina',
      lastName: 'Diop',
      email: 'prof@isi.sn',
      password: defaultPassword,
      role: 'teacher'
    });

    const direction = await User.create({
      firstName: 'Ousmane',
      lastName: 'Sow',
      email: 'direction@isi.sn',
      password: defaultPassword,
      role: 'direction'
    });

    const student1 = await User.create({
      firstName: 'Moussa',
      lastName: 'Ndiaye',
      email: 'moussa@isi.sn',
      password: defaultPassword,
      role: 'student',
      classId: gl3.id
    });

    const student2 = await User.create({
      firstName: 'Fatou',
      lastName: 'Cisse',
      email: 'fatou@isi.sn',
      password: defaultPassword,
      role: 'student',
      classId: gl3.id
    });

    const student3 = await User.create({
      firstName: 'Ibrahima',
      lastName: 'Gaye',
      email: 'ibrahima@isi.sn',
      password: defaultPassword,
      role: 'student',
      classId: gl3.id
    });

    // 5. Création de séances d'emploi du temps (Sessions)
    console.log('Peuplement des Séances (Sessions)...');
    
    const session1 = await Session.create({
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      classroom: 'Salle 104',
      classId: gl3.id,
      courseId: net201.id,
      teacherId: teacher.id,
      summaryOfSession: 'Introduction aux architectures Express.js et création des serveurs.'
    });

    const session2 = await Session.create({
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      classroom: 'Salle 104',
      classId: gl3.id,
      courseId: net201.id,
      teacherId: teacher.id,
      summaryOfSession: 'Configuration de Sequelize ORM et écriture des modèles.'
    });

    // 6. Présences (Attendance)
    console.log('Peuplement des Présences...');
    await Attendance.create({ sessionId: session1.id, studentId: student1.id, status: 'present' });
    await Attendance.create({ sessionId: session1.id, studentId: student2.id, status: 'present' });
    await Attendance.create({ sessionId: session1.id, studentId: student3.id, status: 'absent', justification: 'Malade' });

    await Attendance.create({ sessionId: session2.id, studentId: student1.id, status: 'present' });
    await Attendance.create({ sessionId: session2.id, studentId: student2.id, status: 'late' });
    await Attendance.create({ sessionId: session2.id, studentId: student3.id, status: 'absent' });

    // 7. Création des Évaluations LMD
    console.log('Peuplement des Évaluations (Evaluations)...');
    const devoirNet = await Evaluation.create({
      title: 'Devoir Continu Express.js',
      type: 'devoir',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      coefficient: 1.0,
      courseId: net201.id,
      classId: gl3.id,
      teacherId: teacher.id
    });

    const examenNet = await Evaluation.create({
      title: 'Examen Semestriel Express.js',
      type: 'examen',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      coefficient: 1.0,
      courseId: net201.id,
      classId: gl3.id,
      teacherId: teacher.id
    });

    const devoirMath = await Evaluation.create({
      title: 'Devoir Matrices',
      type: 'devoir',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      coefficient: 1.0,
      courseId: math101.id,
      classId: gl3.id,
      teacherId: teacher.id
    });

    const examenMath = await Evaluation.create({
      title: 'Examen Algèbre Linéaire',
      type: 'examen',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      coefficient: 1.0,
      courseId: math101.id,
      classId: gl3.id,
      teacherId: teacher.id
    });

    // 8. Peuplement des Notes (Grades)
    console.log('Peuplement des Notes (Grades)...');
    
    // Notes de Moussa (Matières validées -> 30 crédits acquis)
    await Grade.create({ score: 14, studentId: student1.id, evaluationId: devoirNet.id });
    await Grade.create({ score: 12, studentId: student1.id, evaluationId: examenNet.id }); // Moyenne NET201 = 12.8 -> Validé (+15 credits)
    await Grade.create({ score: 15, studentId: student1.id, evaluationId: devoirMath.id });
    await Grade.create({ score: 10, studentId: student1.id, evaluationId: examenMath.id }); // Moyenne MATH101 = 12 -> Validé (+15 credits) -> Total 30/30 credits

    // Notes de Fatou (Matière NET201 échouée -> 15 crédits acquis -> Semestre non validé)
    await Grade.create({ score: 8, studentId: student2.id, evaluationId: devoirNet.id });
    await Grade.create({ score: 6, studentId: student2.id, evaluationId: examenNet.id }); // Moyenne NET201 = 6.8 -> Rattrapage (0 credits)
    await Grade.create({ score: 12, studentId: student2.id, evaluationId: devoirMath.id });
    await Grade.create({ score: 11, studentId: student2.id, evaluationId: examenMath.id }); // Moyenne MATH101 = 11.4 -> Validé (+15 credits) -> Total 15/30 credits

    console.log('\n=========================================');
    console.log('Base de données peuplée avec succès !');
    console.log('Utilisateurs créés (mot de passe : kocc1234) :');
    console.log('- Admin:      admin@isi.sn');
    console.log('- Professeur:  prof@isi.sn');
    console.log('- Direction:  direction@isi.sn');
    console.log('- Étudiants:  moussa@isi.sn (Moyenne OK - 30/30 crédits - SEMESTRE VALIDÉ)');
    console.log('              fatou@isi.sn (Échec Web - 15/30 crédits - SEMESTRE NON VALIDÉ)');
    console.log('              ibrahima@isi.sn (Pas de notes - Absent 100% - Décrochage IA)');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du peuplement de la base de données :', error);
    process.exit(1);
  }
};

seedDatabase();
