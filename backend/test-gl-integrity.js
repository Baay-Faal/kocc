const { sequelize, User, Class, Course, Session, Attendance, Evaluation, Grade } = require('./models');
const { Op } = require('sequelize');

async function verifyIntegrity() {
  console.log('=== VÉRIFICATION DE L\'INTÉGRITÉ DU JEU DE DONNÉES GL ===\n');
  let errors = 0;

  try {
    // 1. Classes
    const glClasses = await Class.findAll({
      where: { name: { [Op.in]: ['GL1', 'GL2', 'GL3'] } }
    });
    console.log(`[Test 1] Classes GL : ${glClasses.length}/3`);
    if (glClasses.length !== 3) {
      console.error('❌ Nombre de classes incorrect');
      errors++;
    } else {
      console.log('✓ 3 classes GL1, GL2, GL3 confirmées.');
    }

    const classMap = {};
    glClasses.forEach(c => { classMap[c.name] = c.id; });

    // 2. Étudiants par classe
    const countGL1 = await User.count({ where: { role: 'student', classId: classMap['GL1'] } });
    const countGL2 = await User.count({ where: { role: 'student', classId: classMap['GL2'] } });
    const countGL3 = await User.count({ where: { role: 'student', classId: classMap['GL3'] } });
    const totalStudents = countGL1 + countGL2 + countGL3;

    console.log(`\n[Test 2] Étudiants : GL1=${countGL1} (attendu: 100), GL2=${countGL2} (attendu: 80), GL3=${countGL3} (attendu: 60) | Total=${totalStudents}`);
    if (countGL1 !== 100 || countGL2 !== 80 || countGL3 !== 60 || totalStudents !== 240) {
      console.error('❌ Décompte des étudiants incorrect');
      errors++;
    } else {
      console.log('✓ Décompte exact des 240 étudiants validé.');
    }

    // 3. Unicité et conformité des matricules
    const students = await User.findAll({
      where: { role: 'student', classId: { [Op.in]: Object.values(classMap) } },
      attributes: ['id', 'matricule', 'email', 'classId']
    });

    const matricules = students.map(s => s.matricule);
    const uniqueMatricules = new Set(matricules);
    console.log(`\n[Test 3] Matricules : ${uniqueMatricules.size} uniques pour ${matricules.length} étudiants`);
    if (uniqueMatricules.size !== matricules.length) {
      console.error('❌ Des doublons de matricules existent !');
      errors++;
    } else {
      console.log('✓ Aucun doublon de matricule.');
    }

    // Format matricule permanent : ISI-AAAA-XXXXX
    const invalidMatricules = matricules.filter(m => !/^ISI-\d{4}-\d{5}$/.test(m));
    if (invalidMatricules.length > 0) {
      console.error(`❌ Format de matricule invalide pour : ${invalidMatricules.slice(0, 3).join(', ')}`);
      errors++;
    } else {
      console.log('✓ Format des matricules permanent conforme (ex: ISI-2026-00001).');
    }

    // 4. Unicité des emails
    const emails = students.map(s => s.email);
    const uniqueEmails = new Set(emails);
    console.log(`\n[Test 4] Emails : ${uniqueEmails.size} uniques pour ${emails.length} étudiants`);
    if (uniqueEmails.size !== emails.length) {
      console.error('❌ Des doublons d\'emails existent !');
      errors++;
    } else {
      console.log('✓ Tous les emails étudiants sont strictement uniques.');
    }

    // 5. Professeurs
    const glTeachers = await User.findAll({
      where: {
        role: 'teacher',
        email: { [Op.like]: '%@isi.sn' }
      }
    });
    console.log(`\n[Test 5] Professeurs : ${glTeachers.length} professeur(s) actif(s)`);
    if (glTeachers.length < 15) {
      console.error('❌ Nombre de professeurs inférieur à 15');
      errors++;
    } else {
      console.log(`✓ ${glTeachers.length} professeurs trouvés avec spécialités.`);
    }

    // 6. Taux d'assiduité & Décrochage (< 70%)
    console.log('\n[Test 6] Vérification des profils de décrochage scolaire...');
    const dropoutsFound = [];
    for (const s of students.slice(0, 30)) { // Échantillon de test
      const attendances = await Attendance.findAll({ where: { studentId: s.id } });
      if (attendances.length === 0) continue;
      const presentCount = attendances.filter(a => a.status === 'present').length;
      const rate = Math.round((presentCount / attendances.length) * 100);
      if (rate < 70) {
        dropoutsFound.push({ id: s.id, matricule: s.matricule, email: s.email, rate });
      }
    }
    console.log(`✓ Profils en décrochage identifiés sur l'échantillon : ${dropoutsFound.length}`);
    dropoutsFound.forEach(d => {
      console.log(`   - ${d.email} (${d.matricule}) : Taux d'assiduité = ${d.rate}% (< 70%)`);
    });
    if (dropoutsFound.length === 0) {
      console.error('❌ Aucun profil en décrochage n\'a été détecté pour MBENE !');
      errors++;
    }

    // 7. Évaluations et Notes LMD
    const evalCount = await Evaluation.count({
      where: { classId: { [Op.in]: Object.values(classMap) } }
    });
    const gradeCount = await Grade.count();
    console.log(`\n[Test 7] Évaluations et Notes : ${evalCount} épreuves, ${gradeCount} notes enregistrées`);
    if (evalCount === 0 || gradeCount === 0) {
      console.error('❌ Aucune note ou évaluation trouvée');
      errors++;
    } else {
      console.log('✓ Évaluations et notes LMD prêtes pour les bulletins.');
    }

    // 8. Comptes d'administration principaux
    const adminUser = await User.findOne({ where: { email: 'admin@isi.sn' } });
    const dirUser = await User.findOne({ where: { email: 'direction@isi.sn' } });
    console.log('\n[Test 8] Préservation des comptes clés :');
    console.log(`- Compte Admin (admin@isi.sn) : ${adminUser ? 'PRÉSENT ✓' : 'MANQUANT ❌'}`);
    console.log(`- Compte Direction (direction@isi.sn) : ${dirUser ? 'PRÉSENT ✓' : 'MANQUANT ❌'}`);

    if (!adminUser || !dirUser) {
      console.error('❌ Un compte d\'administration clé est manquant');
      errors++;
    }

    console.log('\n===============================================================');
    if (errors === 0) {
      console.log('🌟 TOUS LES TESTS D\'INTÉGRITÉ ONT RÉUSSI AVEC SUCCÈS (0 ERREUR) 🌟');
    } else {
      console.error(`⚠️ ${errors} ERREUR(S) DÉTECTÉE(S) LORS DES VÉRIFICATIONS`);
    }
    console.log('===============================================================\n');

    process.exit(errors === 0 ? 0 : 1);
  } catch (err) {
    console.error('Erreur lors du test d\'intégrité :', err);
    process.exit(1);
  }
}

verifyIntegrity();
