const bcrypt = require('bcryptjs');
const { 
  sequelize, 
  User, 
  Class, 
  Course, 
  Session, 
  Attendance, 
  Evaluation, 
  Grade 
} = require('./models');
const cleanGlData = require('./clean-gl');

// Noms et prénoms réalistes sénégalais pour la génération combinatoire
const FIRST_NAMES = [
  'Mamadou', 'Fatou', 'Ibrahima', 'Aïssatou', 'Cheikh', 'Aminata', 'Ousmane', 'Mariama',
  'Abdoulaye', 'Khady', 'Mouhamed', 'Ndèye', 'Babacar', 'Seynabou', 'Modou', 'Ramatoulaye',
  'Alioune', 'Coumba', 'Papa', 'Astou', 'Moustapha', 'Sokhna', 'Mansour', 'Awa',
  'Djibril', 'Bineta', 'Malick', 'Dior', 'Boubacar', 'Yacine', 'Alassane', 'Binta',
  'Tidiane', 'Salimata', 'Lamine', 'Nogaye', 'Elhadji', 'Adama', 'Gora', 'Korka',
  'Samba', 'Maguette', 'Mor', 'Rokhaya', 'Bassirou', 'Amy', 'Thierno', 'Mame Diarra',
  'Daouda', 'Dieynaba'
];

const LAST_NAMES = [
  'Diop', 'Ndiaye', 'Fall', 'Ba', 'Sow', 'Cissé', 'Diallo', 'Sarr', 'Faye', 'Gueye',
  'Konaté', 'Traoré', 'Seck', 'Kane', 'Diagne', 'Wade', 'Sylla', 'Camara', 'Touré', 'Mendy',
  'Sané', 'Badji', 'Niang', 'Diouf', 'Samb', 'Thiam', 'Diatta', 'Dia', 'Mbaye', 'Gning',
  'Boye', 'Badiane', 'Ndaw', 'Pouye', 'Tall', 'Ka', 'Dieng', 'Lo', 'Ndour', 'Diakhate'
];

const seedGl = async () => {
  console.log('===============================================================');
  console.log('🌱 ALIMENTATION EN DONNÉES RÉALISTES : GÉNIE LOGICIEL (KOCC) 🌱');
  console.log('===============================================================\n');

  try {
    // 0. Synchronisation du modèle (ajoute matricule, specialty, isActive si besoin)
    await sequelize.sync({ alter: true });
    console.log('✓ Modèles Sequelize synchronisés avec la base de données.');

    // 1. Nettoyage préalable des données GL existantes pour idempotence
    await cleanGlData();

    // 2. Création des Classes (Niveaux L1, L2, L3)
    console.log('\n--- 1. CRÉATION DES CLASSES GL ---');
    const glClasses = await Class.bulkCreate([
      { name: 'GL1', department: 'Informatique & Génie Logiciel' },
      { name: 'GL2', department: 'Informatique & Génie Logiciel' },
      { name: 'GL3', department: 'Informatique & Génie Logiciel' }
    ]);
    const classMap = {};
    glClasses.forEach(c => { classMap[c.name] = c; });
    console.log(`✓ 3 Classes créées : GL1 (id: ${classMap['GL1'].id}), GL2 (id: ${classMap['GL2'].id}), GL3 (id: ${classMap['GL3'].id})`);

    // 3. Création des 22 Matières (Course) avec crédits LMD (30 crédits par semestre)
    console.log('\n--- 2. CRÉATION DES 22 MATIÈRES PAR NIVEAU ---');
    const coursesData = [
      // === L1 (GL1) ===
      // S1 (30 crédits)
      { code: 'GL1-S1-ALGO', title: 'Algorithmique et programmation', coefficient: 3, credits: 6 },
      { code: 'GL1-S1-MATH', title: 'Mathématiques appliquées', coefficient: 3, credits: 6 },
      { code: 'GL1-S1-SYS',  title: 'Systèmes d\'exploitation', coefficient: 2, credits: 6 },
      { code: 'GL1-S1-RES',  title: 'Réseaux informatiques', coefficient: 2, credits: 6 },
      { code: 'GL1-S1-PROG', title: 'Programmation C', coefficient: 3, credits: 6 },
      // S2 (30 crédits)
      { code: 'GL1-S2-BDD',  title: 'Bases de données relationnelles', coefficient: 3, credits: 6 },
      { code: 'GL1-S2-ALG2', title: 'Algorithmique avancée et structures', coefficient: 3, credits: 6 },
      { code: 'GL1-S2-WEB',  title: 'Technologies Web fondamentaux', coefficient: 2, credits: 6 },
      { code: 'GL1-S2-ARCH', title: 'Architecture des ordinateurs', coefficient: 2, credits: 6 },
      { code: 'GL1-S2-MOD',  title: 'Programmation modulaire', coefficient: 3, credits: 6 },

      // === L2 (GL2) ===
      // S3 (30 crédits)
      { code: 'GL2-S3-WEB',   title: 'Technologies Web', coefficient: 3, credits: 5 },
      { code: 'GL2-S3-SI',    title: 'Systèmes d\'information', coefficient: 2, credits: 5 },
      { code: 'GL2-S3-BDDA',  title: 'Bases de données avancées', coefficient: 3, credits: 5 },
      { code: 'GL2-S3-ARCHS', title: 'Architecture des systèmes', coefficient: 2, credits: 5 },
      { code: 'GL2-S3-POO',   title: 'Programmation Orientée Objet', coefficient: 3, credits: 5 },
      { code: 'GL2-S3-RESA',  title: 'Réseaux et protocoles avancés', coefficient: 2, credits: 5 },
      // S4 (30 crédits)
      { code: 'GL2-S4-DEVWEB', title: 'Développement Web', coefficient: 3, credits: 6 },
      { code: 'GL2-S4-CONC',   title: 'Conception des systèmes', coefficient: 3, credits: 6 },
      { code: 'GL2-S4-GL',     title: 'Génie logiciel', coefficient: 3, credits: 6 },
      { code: 'GL2-S4-API',    title: 'Conception des API REST', coefficient: 2, credits: 6 },
      { code: 'GL2-S4-TEST',   title: 'Tests et validation logicielle', coefficient: 2, credits: 6 },

      // === L3 (GL3) ===
      // S5 (30 crédits)
      { code: 'GL3-S5-DEVAPP', title: 'Développement d\'applications', coefficient: 3, credits: 6 },
      { code: 'GL3-S5-GLA',    title: 'Génie logiciel avancé', coefficient: 3, credits: 6 },
      { code: 'GL3-S5-CI',     title: 'Intégration continue', coefficient: 3, credits: 6 },
      { code: 'GL3-S5-MOB',    title: 'Développement mobile', coefficient: 3, credits: 6 },
      { code: 'GL3-S5-EMB',    title: 'Systèmes embarqués', coefficient: 2, credits: 6 },
      // S6 (30 crédits)
      { code: 'GL3-S6-AGL',    title: 'Atelier Génie Logiciel', coefficient: 2, credits: 5 },
      { code: 'GL3-S6-GP',     title: 'Gestion de projet', coefficient: 2, credits: 5 },
      { code: 'GL3-S6-PRO',    title: 'Professionnalisation', coefficient: 2, credits: 5 },
      { code: 'GL3-S6-PFE',    title: 'Projet de fin d\'études', coefficient: 5, credits: 15 }
    ];

    const createdCourses = await Course.bulkCreate(coursesData);
    const courseMap = {};
    createdCourses.forEach(c => { courseMap[c.code] = c; });
    console.log(`✓ ${createdCourses.length} Matières créées avec succès (réparties sur L1/L2/L3 et 30 crédits/semestre).`);

    // Pré-hachage unique du mot de passe pour les performances d'insertion
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('kocc1234', salt);

    // 4. Création des 18 Professeurs avec spécialités
    console.log('\n--- 3. CRÉATION DES 18 PROFESSEURS SPÉCIALISTES ---');
    const teachersData = [
      { firstName: 'Amadou', lastName: 'Ba', email: 'amadou.ba@isi.sn', specialty: 'Algorithmique & Programmation C' },
      { firstName: 'Fatou Kiné', lastName: 'Diop', email: 'fatoukine.diop@isi.sn', specialty: 'Bases de données & Systèmes d\'information' },
      { firstName: 'Cheikh Tidiane', lastName: 'Ndiaye', email: 'cheikh.ndiaye@isi.sn', specialty: 'Technologies Web & Développement Web' },
      { firstName: 'Mariama', lastName: 'Sarr', email: 'mariama.sarr@isi.sn', specialty: 'Génie logiciel & Conception des systèmes' },
      { firstName: 'Ousmane', lastName: 'Fall', email: 'ousmane.fall@isi.sn', specialty: 'Réseaux informatiques & Télécoms' },
      { firstName: 'Ibrahima', lastName: 'Konaté', email: 'ibrahima.konate@isi.sn', specialty: 'Systèmes d\'exploitation & Linux' },
      { firstName: 'Awa', lastName: 'Seck', email: 'awa.seck@isi.sn', specialty: 'Mathématiques appliquées & Statistiques' },
      { firstName: 'Babacar', lastName: 'Cissé', email: 'babacar.cisse@isi.sn', specialty: 'Architecture des systèmes & Ordinateurs' },
      { firstName: 'Mamadou Lamine', lastName: 'Sow', email: 'mamadou.sow@isi.sn', specialty: 'Développement mobile (Flutter & React Native)' },
      { firstName: 'Ndèye Coumba', lastName: 'Diallo', email: 'ndeye.diallo@isi.sn', specialty: 'Intégration continue, Docker & DevOps' },
      { firstName: 'Moussa', lastName: 'Traoré', email: 'moussa.traore@isi.sn', specialty: 'Systèmes embarqués & Objets Connectés (IoT)' },
      { firstName: 'Abdoulaye', lastName: 'Wade', email: 'abdoulaye.wade@isi.sn', specialty: 'Gestion de projet informatique & ITIL' },
      { firstName: 'Khady', lastName: 'Gueye', email: 'khady.gueye@isi.sn', specialty: 'Tests logiciels et validation' },
      { firstName: 'Serigne Mbacké', lastName: 'Sylla', email: 'serigne.sylla@isi.sn', specialty: 'Bases de données avancées & NoSQL' },
      { firstName: 'Samba', lastName: 'Camara', email: 'samba.camara@isi.sn', specialty: 'Conception des API REST & Microservices' },
      { firstName: 'Aïssatou', lastName: 'Kane', email: 'aissatou.kane@isi.sn', specialty: 'Programmation Orientée Objet & Modulaire' },
      { firstName: 'Doudou', lastName: 'Diagne', email: 'doudou.diagne@isi.sn', specialty: 'Atelier Génie Logiciel & Génie logiciel avancé' },
      { firstName: 'Souleymane', lastName: 'Faye', email: 'souleymane.faye@isi.sn', specialty: 'Encadrement PFE & Professionnalisation' }
    ].map(t => ({
      ...t,
      password: hashedPassword,
      role: 'teacher',
      isActive: true
    }));

    const createdTeachers = await User.bulkCreate(teachersData);
    const teacherMap = {};
    createdTeachers.forEach(t => { teacherMap[t.email] = t; });
    console.log(`✓ ${createdTeachers.length} Professeurs créés avec spécialités.`);

    // 5. Création des 240 Étudiants avec matricule permanent immuable
    console.log('\n--- 4. CRÉATION DES 240 ÉTUDIANTS (100 L1, 80 L2, 60 L3) ---');
    const studentsData = [];
    const usedStudentEmails = new Set(teachersData.map(t => t.email));
    usedStudentEmails.add('admin@isi.sn');
    usedStudentEmails.add('direction@isi.sn');

    const generateStudentBatch = (count, className, year, startId) => {
      const classId = classMap[className].id;
      for (let i = 1; i <= count; i++) {
        const globalIndex = startId + i;
        const fn = FIRST_NAMES[globalIndex % FIRST_NAMES.length];
        const ln = LAST_NAMES[(globalIndex + Math.floor(globalIndex / FIRST_NAMES.length)) % LAST_NAMES.length];
        
        // Matricule permanent : ISI-AAAA-XXXXX (ex: ISI-2026-00042)
        const matricule = `ISI-${year}-${String(i).padStart(5, '0')}`;
        
        // Email institutionnel propre (sans .gl1, .gl2, .gl3 - permanent pour l'étudiant)
        const cleanFn = fn.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
        const cleanLn = ln.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
        
        const baseEmail = `${cleanFn}.${cleanLn}`;
        let email = `${baseEmail}@isi.sn`;
        let counter = 2;
        while (usedStudentEmails.has(email)) {
          email = `${baseEmail}${counter}@isi.sn`;
          counter++;
        }
        usedStudentEmails.add(email);

        studentsData.push({
          matricule,
          firstName: fn,
          lastName: ln,
          email,
          password: hashedPassword,
          role: 'student',
          classId,
          isActive: true
        });
      }
    };

    // GL1 : 100 étudiants (Promotion 2026)
    generateStudentBatch(100, 'GL1', 2026, 0);
    // GL2 : 80 étudiants (Promotion 2025)
    generateStudentBatch(80, 'GL2', 2025, 100);
    // GL3 : 60 étudiants (Promotion 2024)
    generateStudentBatch(60, 'GL3', 2024, 180);

    const createdStudents = await User.bulkCreate(studentsData);
    console.log(`✓ ${createdStudents.length} Étudiants créés au total :`);
    console.log(`   - GL1 : 100 étudiants (Matricules ISI-2026-00001 à ISI-2026-00100)`);
    console.log(`   - GL2 :  80 étudiants (Matricules ISI-2025-00001 à ISI-2025-00080)`);
    console.log(`   - GL3 :  60 étudiants (Matricules ISI-2024-00001 à ISI-2024-00060)`);

    // Grouper les étudiants créés par classe
    const studentsByClass = {
      GL1: createdStudents.filter(s => s.classId === classMap['GL1'].id),
      GL2: createdStudents.filter(s => s.classId === classMap['GL2'].id),
      GL3: createdStudents.filter(s => s.classId === classMap['GL3'].id)
    };

    // 6. Planification de l'Emploi du temps (Séances récurrentes)
    console.log('\n--- 5. PLANIFICATION DE L\'EMPLOI DU TEMPS & SÉANCES ---');
    const sessionsToCreate = [];
    const now = new Date();

    // Définition des matières actives pour chaque niveau
    const activeAssignments = [
      // GL1
      { className: 'GL1', courseCode: 'GL1-S1-ALGO', teacherEmail: 'amadou.ba@isi.sn', room: 'Salle 101', dayOffset: 1, startHour: 8, summary: 'Complexité algorithmique et notation grand O.' },
      { className: 'GL1', courseCode: 'GL1-S1-MATH', teacherEmail: 'awa.seck@isi.sn', room: 'Amphi A', dayOffset: 2, startHour: 10, summary: 'Espaces vectoriels et applications linéaires.' },
      { className: 'GL1', courseCode: 'GL1-S1-SYS',  teacherEmail: 'ibrahima.konate@isi.sn', room: 'Labo Info 1', dayOffset: 3, startHour: 8, summary: 'Processus, ordonnancement et threads Linux.' },
      { className: 'GL1', courseCode: 'GL1-S1-RES',  teacherEmail: 'ousmane.fall@isi.sn', room: 'Salle 102', dayOffset: 4, startHour: 14, summary: 'Modèle OSI, TCP/IP et adressage IPv4.' },
      { className: 'GL1', courseCode: 'GL1-S1-PROG', teacherEmail: 'amadou.ba@isi.sn', room: 'Labo Info 2', dayOffset: 5, startHour: 10, summary: 'Pointeurs, allocation dynamique et structures en C.' },

      // GL2
      { className: 'GL2', courseCode: 'GL2-S3-WEB',   teacherEmail: 'cheikh.ndiaye@isi.sn', room: 'Labo Info 1', dayOffset: 1, startHour: 10, summary: 'Architectures web asynchrones, Node.js et Express.' },
      { className: 'GL2', courseCode: 'GL2-S3-SI',    teacherEmail: 'fatoukine.diop@isi.sn', room: 'Salle 201', dayOffset: 2, startHour: 8, summary: 'Modélisation des processus métier et flux d\'information.' },
      { className: 'GL2', courseCode: 'GL2-S3-BDDA',  teacherEmail: 'serigne.sylla@isi.sn', room: 'Labo Info 2', dayOffset: 3, startHour: 14, summary: 'Indexation B-Tree, optimisation de requêtes SQL et NoSQL.' },
      { className: 'GL2', courseCode: 'GL2-S3-POO',   teacherEmail: 'aissatou.kane@isi.sn', room: 'Salle 202', dayOffset: 4, startHour: 10, summary: 'Héritage, polymorphisme et interfaces en Java.' },
      { className: 'GL2', courseCode: 'GL2-S3-ARCHS', teacherEmail: 'babacar.cisse@isi.sn', room: 'Amphi B', dayOffset: 5, startHour: 8, summary: 'Architectures n-tiers et patrons de conception (MVC).' },

      // GL3
      { className: 'GL3', courseCode: 'GL3-S5-DEVAPP', teacherEmail: 'cheikh.ndiaye@isi.sn', room: 'Labo Info 3', dayOffset: 1, startHour: 14, summary: 'Applications distribuées et microservices avec Spring Boot & Node.' },
      { className: 'GL3', courseCode: 'GL3-S5-GLA',    teacherEmail: 'doudou.diagne@isi.sn', room: 'Salle 301', dayOffset: 2, startHour: 14, summary: 'Design Patterns GoF : Singleton, Factory, Observer.' },
      { className: 'GL3', courseCode: 'GL3-S5-CI',     teacherEmail: 'ndeye.diallo@isi.sn', room: 'Labo Info 1', dayOffset: 3, startHour: 10, summary: 'Pipelines GitHub Actions, Docker et déploiement continu.' },
      { className: 'GL3', courseCode: 'GL3-S5-MOB',    teacherEmail: 'mamadou.sow@isi.sn', room: 'Labo Info 2', dayOffset: 4, startHour: 8, summary: 'State management avec Redux / Provider sur mobile.' },
      { className: 'GL3', courseCode: 'GL3-S5-EMB',    teacherEmail: 'moussa.traore@isi.sn', room: 'Atelier IoT', dayOffset: 5, startHour: 14, summary: 'Microcontrôleurs ESP32, capteurs et communication MQTT.' }
    ];

    // Créer les séances pour les 3 dernières semaines (passées) et la semaine en cours (active)
    const weeksToGenerate = [-3, -2, -1, 0];

    weeksToGenerate.forEach(weekOffset => {
      activeAssignments.forEach(assign => {
        const classObj = classMap[assign.className];
        const courseObj = courseMap[assign.courseCode];
        const teacherObj = teacherMap[assign.teacherEmail];

        const sessionDate = new Date(now);
        // Ajuster la date au jour de la semaine correspondant
        sessionDate.setDate(now.getDate() + (weekOffset * 7) + (assign.dayOffset - now.getDay()));
        sessionDate.setHours(assign.startHour, 0, 0, 0);

        const endDate = new Date(sessionDate);
        endDate.setHours(assign.startHour + 2, 0, 0, 0);

        sessionsToCreate.push({
          startTime: sessionDate,
          endTime: endDate,
          classroom: assign.room,
          classId: classObj.id,
          courseId: courseObj.id,
          teacherId: teacherObj.id,
          summaryOfSession: weekOffset <= 0 ? assign.summary : null
        });
      });
    });

    const createdSessions = await Session.bulkCreate(sessionsToCreate);
    console.log(`✓ ${createdSessions.length} Séances d'emploi du temps générées sur 4 semaines pour GL1, GL2 et GL3.`);

    // 7. Génération des Présences / Feuilles d'émargement (Attendance)
    console.log('\n--- 6. GÉNÉRATION DES ÉMARGEMENTS & DÉCROCHAGE IA ---');
    const pastSessions = createdSessions.filter(s => new Date(s.endTime) < now);
    const attendancesToCreate = [];

    // Sélection de 4 étudiants ciblés en situation critique de décrochage (< 70%)
    // 2 en GL1, 1 en GL2, 1 en GL3
    const dropoutStudentIds = new Set([
      studentsByClass['GL1'][3].id,  // ex: 4ème étudiant GL1
      studentsByClass['GL1'][12].id, // ex: 13ème étudiant GL1
      studentsByClass['GL2'][7].id,  // ex: 8ème étudiant GL2
      studentsByClass['GL3'][4].id   // ex: 5ème étudiant GL3
    ]);

    pastSessions.forEach(session => {
      const studentsInClass = createdStudents.filter(s => s.classId === session.classId);

      studentsInClass.forEach(student => {
        const isDropout = dropoutStudentIds.has(student.id);
        let status = 'present';
        let justification = null;

        if (isDropout) {
          // L'étudiant décrocheur est absent 70% du temps
          const rand = Math.random();
          if (rand < 0.65) {
            status = 'absent';
          } else if (rand < 0.75) {
            status = 'late';
          } else {
            status = 'present';
          }
        } else {
          // Les étudiants normaux sont présents 92% du temps
          const rand = Math.random();
          if (rand < 0.05) {
            status = 'absent';
            justification = rand < 0.02 ? 'Raison familiale ou médicale' : null;
          } else if (rand < 0.09) {
            status = 'late';
          } else {
            status = 'present';
          }
        }

        attendancesToCreate.push({
          sessionId: session.id,
          studentId: student.id,
          status,
          justification
        });
      });
    });

    await Attendance.bulkCreate(attendancesToCreate);
    console.log(`✓ ${attendancesToCreate.length} Enregistrements de présences générés.`);
    console.log(`✓ 4 Profils en décrochage d'assiduité (< 70%) configurés pour tester immédiatement l'assistant IA MBENE.`);

    // 8. Création des Évaluations et des Notes LMD
    console.log('\n--- 7. ÉVALUATIONS ET NOTES DU BULLETIN LMD ---');
    const evaluationsToCreate = [];

    // On planifie 1 Devoir (coeff 1.0) et 1 Examen (coeff 1.0) pour quelques matières phares
    const evalConfigs = [
      { className: 'GL1', courseCode: 'GL1-S1-ALGO', teacherEmail: 'amadou.ba@isi.sn', title: 'Devoir Algorithmes Récursifs', type: 'devoir' },
      { className: 'GL1', courseCode: 'GL1-S1-ALGO', teacherEmail: 'amadou.ba@isi.sn', title: 'Examen Semestriel Algorithmique', type: 'examen' },
      { className: 'GL1', courseCode: 'GL1-S1-SYS',  teacherEmail: 'ibrahima.konate@isi.sn', title: 'Devoir Processus & Bash', type: 'devoir' },
      { className: 'GL1', courseCode: 'GL1-S1-SYS',  teacherEmail: 'ibrahima.konate@isi.sn', title: 'Examen Semestriel Systèmes', type: 'examen' },

      { className: 'GL2', courseCode: 'GL2-S3-WEB', teacherEmail: 'cheikh.ndiaye@isi.sn', title: 'Devoir Node.js API', type: 'devoir' },
      { className: 'GL2', courseCode: 'GL2-S3-WEB', teacherEmail: 'cheikh.ndiaye@isi.sn', title: 'Examen Fullstack Web', type: 'examen' },
      { className: 'GL2', courseCode: 'GL2-S3-POO', teacherEmail: 'aissatou.kane@isi.sn', title: 'Devoir Conception Java', type: 'devoir' },
      { className: 'GL2', courseCode: 'GL2-S3-POO', teacherEmail: 'aissatou.kane@isi.sn', title: 'Examen Semestriel Java', type: 'examen' },

      { className: 'GL3', courseCode: 'GL3-S5-DEVAPP', teacherEmail: 'cheikh.ndiaye@isi.sn', title: 'Devoir Microservices', type: 'devoir' },
      { className: 'GL3', courseCode: 'GL3-S5-DEVAPP', teacherEmail: 'cheikh.ndiaye@isi.sn', title: 'Examen Architecture Logicielle', type: 'examen' },
      { className: 'GL3', courseCode: 'GL3-S5-CI',     teacherEmail: 'ndeye.diallo@isi.sn', title: 'Devoir CI/CD Pipeline', type: 'devoir' },
      { className: 'GL3', courseCode: 'GL3-S5-CI',     teacherEmail: 'ndeye.diallo@isi.sn', title: 'Examen DevOps & Docker', type: 'examen' }
    ];

    evalConfigs.forEach((cfg, idx) => {
      evaluationsToCreate.push({
        title: cfg.title,
        type: cfg.type,
        date: new Date(now.getTime() - (10 - idx) * 24 * 60 * 60 * 1000),
        coefficient: 1.0,
        classId: classMap[cfg.className].id,
        courseId: courseMap[cfg.courseCode].id,
        teacherId: teacherMap[cfg.teacherEmail].id
      });
    });

    const createdEvaluations = await Evaluation.bulkCreate(evaluationsToCreate);
    console.log(`✓ ${createdEvaluations.length} Évaluations planifiées (Devoirs et Examens).`);

    // Saisie des notes pour tous les étudiants de ces classes
    const gradesToCreate = [];

    createdEvaluations.forEach(evaluation => {
      const studentsInClass = createdStudents.filter(s => s.classId === evaluation.classId);

      studentsInClass.forEach((student, sIdx) => {
        let baseScore;
        // Étudiant 0 : excellent élève (> 15/20 partout, valide le semestre avec mention)
        if (sIdx === 0) {
          baseScore = evaluation.type === 'devoir' ? 16.5 : 17.0;
        } 
        // Étudiant 1 : élève moyen (11-13/20, valide ses matières et ses crédits)
        else if (sIdx === 1) {
          baseScore = evaluation.type === 'devoir' ? 12.0 : 11.5;
        } 
        // Étudiant 2 : élève en difficulté (< 10/20, va en rattrapage)
        else if (sIdx === 2) {
          baseScore = evaluation.type === 'devoir' ? 7.5 : 8.0;
        } 
        // Les autres : distribution réaliste gaussienne entre 9 et 16
        else {
          const pseudoRandom = ((student.id * 17 + evaluation.id * 31) % 100) / 100;
          baseScore = Math.round((9 + pseudoRandom * 7.5) * 2) / 2;
        }

        gradesToCreate.push({
          score: baseScore,
          studentId: student.id,
          evaluationId: evaluation.id
        });
      });
    });

    await Grade.bulkCreate(gradesToCreate);
    console.log(`✓ ${gradesToCreate.length} Notes semestrielles enregistrées.`);

    console.log('\n===============================================================');
    console.log('🎉 SUCCÈS ! LE JEU DE DONNÉES GÉNIE LOGICIEL EST OPÉRATIONNEL 🎉');
    console.log('===============================================================');
    console.log('Résumé des données créées :');
    console.log(`- 3 Classes : GL1 (L1), GL2 (L2), GL3 (L3)`);
    console.log(`- 22 Matières réparties sur 6 semestres avec 30 crédits/semestre`);
    console.log(`- 18 Professeurs spécialistes (mot de passe : kocc1234)`);
    console.log(`- 240 Étudiants avec matricules permanents immuables (ISI-AAAA-XXXXX)`);
    console.log(`- ${createdSessions.length} Séances d'emploi du temps avec cahiers de textes`);
    console.log(`- ${attendancesToCreate.length} Émargements (dont 4 cas ciblés de décrochage pour l'IA MBENE)`);
    console.log(`- ${createdEvaluations.length} Évaluations & ${gradesToCreate.length} Notes pour les Bulletins LMD`);
    console.log('\nExemples de comptes étudiants de test :');
    console.log(`- GL1 Excellent : ${studentsByClass['GL1'][0].email} (Matricule : ${studentsByClass['GL1'][0].matricule})`);
    console.log(`- GL1 Décrocheur : ${studentsByClass['GL1'][3].email} (Matricule : ${studentsByClass['GL1'][3].matricule})`);
    console.log(`- GL2 : ${studentsByClass['GL2'][0].email} (Matricule : ${studentsByClass['GL2'][0].matricule})`);
    console.log(`- GL3 : ${studentsByClass['GL3'][0].email} (Matricule : ${studentsByClass['GL3'][0].matricule})`);
    console.log('Mot de passe universel : kocc1234\n');

    return true;
  } catch (error) {
    console.error('Erreur critique lors de l\'alimentation des données GL :', error);
    throw error;
  }
};

if (require.main === module) {
  seedGl()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedGl;
