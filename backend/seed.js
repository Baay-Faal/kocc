const bcrypt = require('bcryptjs');
const { sequelize, User, Class, Course, Session, Attendance } = require('./models');

const seedDatabase = async () => {
  try {
    console.log('Connexion et synchronisation de la base de données (force: true)...');
    // Force true recrée toutes les tables pour partir sur une base propre
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

    // 2. Création des cours/matières
    console.log('Peuplement des Cours...');
    const net201 = await Course.create({
      code: 'NET201',
      title: 'Développement Web Avancé (Node.js/Express)',
      coefficient: 3
    });
    const math101 = await Course.create({
      code: 'MATH101',
      title: 'Algèbre Linéaire',
      coefficient: 2
    });

    // 3. Cryptage du mot de passe par défaut
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('kocc1234', salt);

    // 4. Création des utilisateurs
    console.log('Peuplement des Utilisateurs...');
    
    // Admin
    const admin = await User.create({
      firstName: 'Alassane',
      lastName: 'Diallo',
      email: 'admin@isi.sn',
      password: defaultPassword,
      role: 'admin'
    });

    // Enseignant
    const teacher = await User.create({
      firstName: 'Amina',
      lastName: 'Diop',
      email: 'prof@isi.sn',
      password: defaultPassword,
      role: 'teacher'
    });

    // Direction
    const direction = await User.create({
      firstName: 'Ousmane',
      lastName: 'Sow',
      email: 'direction@isi.sn',
      password: defaultPassword,
      role: 'direction'
    });

    // Étudiant 1 (GL3)
    const student1 = await User.create({
      firstName: 'Moussa',
      lastName: 'Ndiaye',
      email: 'moussa@isi.sn',
      password: defaultPassword,
      role: 'student',
      classId: gl3.id
    });

    // Étudiant 2 (GL3)
    const student2 = await User.create({
      firstName: 'Fatou',
      lastName: 'Cisse',
      email: 'fatou@isi.sn',
      password: defaultPassword,
      role: 'student',
      classId: gl3.id
    });

    // Étudiant 3 (GL3 - avec assiduité faible pour tester le décrochage)
    const student3 = await User.create({
      firstName: 'Ibrahima',
      lastName: 'Gaye',
      email: 'ibrahima@isi.sn',
      password: defaultPassword,
      role: 'student',
      classId: gl3.id
    });

    // 5. Création de séances d'emploi du temps passées (Sessions)
    console.log('Peuplement des Séances (Sessions)...');
    
    // Séance 1 (Semaine dernière)
    const session1 = await Session.create({
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // il y a 7 jours
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      classroom: 'Salle 104',
      classId: gl3.id,
      courseId: net201.id,
      teacherId: teacher.id,
      summaryOfSession: 'Introduction aux architectures Express.js et création des premiers serveurs HTTP basiques.'
    });

    // Séance 2 (Il y a 3 jours)
    const session2 = await Session.create({
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // il y a 3 jours
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      classroom: 'Salle 104',
      classId: gl3.id,
      courseId: net201.id,
      teacherId: teacher.id,
      summaryOfSession: 'Configuration de Sequelize ORM, connexion à MySQL et écriture des premiers modèles.'
    });

    // 6. Peuplement des présences (Attendance)
    console.log('Peuplement des Présences (Attendance)...');
    
    // Présences Séance 1
    await Attendance.create({ sessionId: session1.id, studentId: student1.id, status: 'present' });
    await Attendance.create({ sessionId: session1.id, studentId: student2.id, status: 'present' });
    await Attendance.create({ sessionId: session1.id, studentId: student3.id, status: 'absent', justification: 'Panne de transport' }); // absent

    // Présences Séance 2
    await Attendance.create({ sessionId: session2.id, studentId: student1.id, status: 'present' });
    await Attendance.create({ sessionId: session2.id, studentId: student2.id, status: 'late' }); // présent (en retard)
    await Attendance.create({ sessionId: session2.id, studentId: student3.id, status: 'absent' }); // absent non excusé (taux final d'Ibrahima = 0%)

    console.log('\n=========================================');
    console.log('Base de données peuplée avec succès !');
    console.log('Utilisateurs créés (mot de passe : kocc1234) :');
    console.log('- Admin:      admin@isi.sn');
    console.log('- Professeur:  prof@isi.sn');
    console.log('- Direction:  direction@isi.sn');
    console.log('- Étudiants:  moussa@isi.sn (100% assiduité)');
    console.log('              fatou@isi.sn (100% assiduité)');
    console.log('              ibrahima@isi.sn (0% assiduité - Décrochage IA)');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du peuplement de la base de données :', error);
    process.exit(1);
  }
};

seedDatabase();
