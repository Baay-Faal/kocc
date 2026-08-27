const http = require('http');

const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log("=== DÉBUT DES TESTS DU BACKEND KOCC ===\n");

  try {
    // 1. Test Authentification Professeur
    console.log("[Test 1] Authentification Professeur...");
    const profLogin = await request('POST', '/api/auth/login', {}, {
      email: 'prof@isi.sn',
      password: 'kocc1234'
    });

    if (profLogin.statusCode !== 200 || !profLogin.body.token) {
      throw new Error(`Échec login Professeur: ${JSON.stringify(profLogin.body)}`);
    }
    const profToken = profLogin.body.token;
    console.log("✓ Login Professeur réussi. Token récupéré.");

    // 2. Test Authentification Étudiant (Moussa)
    console.log("\n[Test 2] Authentification Étudiant (Moussa)...");
    const studentLogin = await request('POST', '/api/auth/login', {}, {
      email: 'moussa@isi.sn',
      password: 'kocc1234'
    });

    if (studentLogin.statusCode !== 200 || !studentLogin.body.token) {
      throw new Error(`Échec login Étudiant: ${JSON.stringify(studentLogin.body)}`);
    }
    const studentToken = studentLogin.body.token;
    const studentId = studentLogin.body.user.id;
    console.log(`✓ Login Étudiant réussi. ID étudiant: ${studentId}`);

    // 3. Test Récupération de Bulletin LMD pour Moussa (Doit valider 30 crédits)
    console.log("\n[Test 3] Bulletin LMD - Moussa (30 crédits attendus)...");
    const moussaBulletin = await request('GET', `/api/grades/bulletin/student/${studentId}`, {
      'Authorization': `Bearer ${studentToken}`
    });

    if (moussaBulletin.statusCode !== 200) {
      throw new Error(`Erreur récupération bulletin Moussa: ${JSON.stringify(moussaBulletin.body)}`);
    }

    const mSummary = moussaBulletin.body.summary;
    console.log(`- Moyenne Générale: ${mSummary.semesterAverage}/20`);
    console.log(`- Crédits acquis: ${mSummary.totalCreditsAcquired}/${mSummary.totalCreditsAttempted}`);
    console.log(`- Statut: ${mSummary.status}`);

    if (mSummary.totalCreditsAcquired !== 30 || mSummary.status !== 'SEMESTRE VALIDÉ') {
      throw new Error("Erreur de calcul des crédits de Moussa");
    }
    console.log("✓ Calcul du bulletin de Moussa correct !");

    // 4. Test Récupération de Bulletin LMD pour Fatou (Doit avoir 15 crédits et NON VALIDÉ)
    console.log("\n[Test 4] Bulletin LMD - Fatou (15 crédits attendus)...");
    // Connectons-nous en tant que Fatou ou utilisons le token étudiant existant (les étudiants peuvent voir leur bulletin, utilisons le token prof pour voir le bulletin de Fatou)
    // Chercher l'ID de Fatou via le bulletin (ou on sait que Fatou est l'étudiant ID 5 si on regarde le seed, faisons l'appel pour l'ID 5)
    // Récupérons d'abord la liste des étudiants pour être sûr des IDs
    const fatouBulletin = await request('GET', `/api/grades/bulletin/student/5`, {
      'Authorization': `Bearer ${profToken}`
    });

    if (fatouBulletin.statusCode !== 200) {
      // Si Fatou n'est pas ID 5, essayons ID 2
      console.log("ID 5 introuvable, tentative avec ID 2...");
      const fatouBulletinAlt = await request('GET', `/api/grades/bulletin/student/2`, {
        'Authorization': `Bearer ${profToken}`
      });
      if (fatouBulletinAlt.statusCode === 200) {
        checkFatou(fatouBulletinAlt.body);
      } else {
        throw new Error("Impossible de récupérer le bulletin de Fatou");
      }
    } else {
      checkFatou(fatouBulletin.body);
    }

    function checkFatou(body) {
      const fSummary = body.summary;
      console.log(`- Étudiante: ${body.student.firstName} ${body.student.lastName}`);
      console.log(`- Moyenne Générale: ${fSummary.semesterAverage}/20`);
      console.log(`- Crédits acquis: ${fSummary.totalCreditsAcquired}/${fSummary.totalCreditsAttempted}`);
      console.log(`- Statut: ${fSummary.status}`);
      if (fSummary.totalCreditsAcquired !== 15 || fSummary.status !== 'SEMESTRE NON VALIDÉ') {
        throw new Error("Erreur de calcul des crédits de Fatou");
      }
      console.log("✓ Calcul du bulletin de Fatou correct !");
    }

    // 5. Test Assistant IA MBENE Alertes (Mode dégradé sans clé API)
    console.log("\n[Test 5] Test des alertes MBENE (Mode dégradé)...");
    const directionLogin = await request('POST', '/api/auth/login', {}, {
      email: 'direction@isi.sn',
      password: 'kocc1234'
    });
    const dirToken = directionLogin.body.token;

    const mbeneAlerts = await request('GET', '/api/mbene/alertes', {
      'Authorization': `Bearer ${dirToken}`
    });

    if (mbeneAlerts.statusCode !== 200) {
      throw new Error(`Échec appel alertes MBENE: ${JSON.stringify(mbeneAlerts.body)}`);
    }
    console.log(`- Message reçu: ${mbeneAlerts.body.message || 'Ok'}`);
    console.log(`- Nombre d'étudiants en décrochage détectés: ${mbeneAlerts.body.atRiskStudents.length}`);
    console.log(`- Recommandations IA: \n${mbeneAlerts.body.aiRecommendations}`);
    console.log("✓ MBENE a répondu avec succès en mode dégradé (sans planter) !");

    // 6. Test d'envoi d'e-mail simulé (Appel / Absence)
    console.log("\n[Test 6] Saisie de présence & Notification E-mail...");
    // Récupérer une séance existante (ID 1)
    const attendancePayload = {
      sessionId: 1,
      records: [
        { studentId: studentId, status: "absent", justification: "Test de notification" }
      ]
    };
    
    console.log("- Soumission de l'appel (Moussa marqué absent)...");
    const attendanceResult = await request('POST', '/api/attendance', {
      'Authorization': `Bearer ${profToken}`
    }, attendancePayload);

    if (attendanceResult.statusCode !== 200) {
      throw new Error(`Échec saisie présences: ${JSON.stringify(attendanceResult.body)}`);
    }
    console.log("✓ Feuille d'appel enregistrée.");
    console.log("⚠️ VÉRIFIEZ LA CONSOLE DU SERVEUR BACKEND : vous devez y voir le bloc '[E-mail simulé envoyé]' imprimé !");

    console.log("\n=========================================");
    console.log("🏆 TOUS LES TESTS DU BACKEND SONT RÉUSSIS !");
    console.log("=========================================\n");

  } catch (error) {
    console.error("\n❌ TEST ÉCHOUÉ :", error.stack || error);
  }
}

runTests();
