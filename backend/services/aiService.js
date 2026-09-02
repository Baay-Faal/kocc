const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn("[MBENE Warning] La clé GEMINI_API_KEY n'est pas configurée dans le fichier .env. Le service fonctionnera en mode dégradé.");
}

/**
 * Service d'analyse pédagogique - MBENE
 * Génère un rappel intelligent pour le prochain cours.
 */
const getCourseRecall = async (lastSessionSummary, attendanceRate) => {
  if (!genAI) {
    return getFallbackCourseRecall(lastSessionSummary, attendanceRate);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.95
      },
      systemInstruction: `Tu es MBENE, l'assistant virtuel intelligent d'aide à la décision d'ISI SUPTECH.
Ton rôle est d'aider les enseignants dans leur enchaînement pédagogique.
Sois concis, professionnel et direct. Divise impérativement ta réponse en trois sections claires :
1. RÉSUMÉ DU DERNIER COURS (Synthétise le résumé fourni en 2 phrases max).
2. DIFFICULTÉS CONSTATÉES (Déduis les freins possibles à partir du taux d'absences et des concepts abordés).
3. SUGGESTION DE RÉVISION (Propose un exercice ou un rappel ciblé de 5 minutes au tableau).`
    });

    const prompt = `Voici les données de la séance précédente :
- Contenu traité : "${lastSessionSummary || "Aucun résumé fourni"}"
- Taux de présence : ${attendanceRate}%
Génère les recommandations pédagogiques de continuité de cours.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erreur d'appel API Gemini (CourseRecall) :", error);
    return getFallbackCourseRecall(lastSessionSummary, attendanceRate);
  }
};

/**
 * Service d'aide à la décision pour la direction
 * Analyse les profils d'étudiants en situation de décrochage et propose des remédiations.
 */
const getRemediationRecommendations = async (anonymizedStudents) => {
  if (!genAI) {
    return getFallbackRemediations(anonymizedStudents);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        responseMimeType: "application/json"
      },
      systemInstruction: `Tu es MBENE, l'assistant virtuel intelligent d'aide à la décision d'ISI SUPTECH.
Ton rôle est d'analyser la liste anonymisée des étudiants en situation de décrochage scolaire (taux d'assiduité sous le seuil critique de 70 %) et de proposer un diagnostic précis et 3 recommandations concrètes d'actions par étudiant.
Règles strictes :
- N'utilise AUCUN emoji dans tes réponses. Utilise un ton académique, rigoureux et professionnel.
- Réponds impérativement sous forme de tableau JSON valide au format suivant :
[
  {
    "alias": "Etudiant_01",
    "diagnosis": "Diagnostic précis de la situation et du risque d'abandon.",
    "recommendations": [
      "Action prioritaire 1",
      "Action 2",
      "Action 3"
    ]
  }
]`
    });

    const prompt = `Voici la liste anonymisée des étudiants en situation de décrochage (assiduité < 70%) :
${JSON.stringify(anonymizedStudents, null, 2)}
Génère pour chacun son diagnostic et ses 3 recommandations personnalisées sans aucun emoji.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getFallbackRemediations(anonymizedStudents);
  } catch (error) {
    console.error("Erreur d'appel API Gemini (Remediations) :", error);
    return getFallbackRemediations(anonymizedStudents);
  }
};

/**
 * Service de Tutorat pour Étudiant - MBENE
 * Répond à la question de l'élève par rapport au contexte du cours.
 */
const getStudentTutorResponse = async (courseTitle, sessionSummaries, question) => {
  if (!genAI) {
    return getFallbackTutor(question);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.5,
        topP: 0.95
      },
      systemInstruction: `Tu es MBENE, l'assistant et tuteur virtuel intelligent d'ISI SUPTECH.
Ton rôle est d'aider l'étudiant à comprendre la matière "${courseTitle}".
Tu dois répondre à ses questions de manière extrêmement pédagogique, patiente, claire, et constructive. N'utilise aucun emoji.
Voici les résumés des cours réels qui lui ont été dispensés par son professeur pour ce module. Basse-toi dessus en priorité pour rester dans le contexte de son programme :
${sessionSummaries.map((s, i) => `Séance ${i+1}: "${s}"`).join('\n')}`
    });

    const prompt = `Question de l'étudiant : "${question}"
Explique-lui cette notion clairement et de façon adaptée à son programme.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erreur d'appel API Gemini (StudentTutor) :", error);
    return getFallbackTutor(question);
  }
};

// Fallbacks de secours (en cas d'absence de clé API ou d'erreur réseau)
const getFallbackCourseRecall = (summary, rate) => {
  return `[Mode dégradé - Service MBENE hors ligne]
1. RÉSUMÉ DU DERNIER COURS :
- Contenu traité : "${summary || 'Aucun résumé disponible'}".
2. DIFFICULTÉS CONSTATÉES :
- Le taux d'absentéisme constaté de la séance précédente est de ${100 - rate}%. Il est probable que certains concepts clés soient à revoir en raison de ces absences.
3. SUGGESTION DE RÉVISION :
- Effectuer un court rappel de 5 minutes sur les points principaux du cours précédent avant d'introduire le nouveau chapitre.`;
};

const getFallbackRemediations = (students) => {
  return students.map((student) => {
    const rate = student.attendanceRate;
    let diagnosis = '';
    let recs = [];

    if (rate < 25) {
      diagnosis = `Situation de décrochage critique extrême (Assiduité : ${rate}%). Rupture quasi-totale d'assiduité signalant un désengagement majeur ou un empêchement sérieux, avec risque imminent d'abandon définitif ou d'exclusion.`;
      recs = [
        "Convocation d'urgence de l'étudiant et de ses tuteurs légaux sous 48 heures pour clarifier la poursuite du cursus.",
        "Signature d'un contrat pédagogique d'assiduité stricte avec pointage physique obligatoire à chaque cours.",
        "Orientation vers la cellule d'écoute médico-sociale et d'accompagnement de l'institut pour lever les freins matériels ou personnels."
      ];
    } else if (rate < 45) {
      diagnosis = `Absentéisme chronique élevé (Assiduité : ${rate}%). L'étudiant a manqué plus de la moitié des enseignements fondamentaux et accumule des lacunes structurelles qui menacent l'obtention de son semestre.`;
      recs = [
        "Binôme de parrainage obligatoire : Affectation d'un étudiant tuteur de GL3 pour la remise à niveau des cours manqués.",
        "Accès prioritaire aux supports de cours numérisés, exercices corrigés et labs sur la plateforme KOCC.",
        "Entretien individuel avec le responsable pédagogique pour évaluer un réaménagement de planning ou un problème d'accès aux transports."
      ];
    } else if (rate < 60) {
      diagnosis = `Érosion d'assiduité modérée mais préoccupante (Assiduité : ${rate}%). L'étudiant décroche progressivement et risque de passer sous les moyennes requises si un redressement n'est pas amorcé.`;
      recs = [
        "Entretien de remédiation ciblé avec les enseignants des matières où les absences sont les plus récurrentes.",
        "Intégration dans un groupe de travail supervisé pour les devoirs continus et projets en équipe.",
        "Bilan d'assiduité bimensuel intermédiaire transmis directement à la direction pour suivi régulier."
      ];
    } else {
      diagnosis = `Vigilance préventive (Assiduité : ${rate}%). L'étudiant se situe juste sous la barre de sécurité des 70%, une réaction rapide permettra de rétablir un parcours serein.`;
      recs = [
        "Avertissement formel par e-mail avec rappel des conditions d'attribution des crédits semestriels LMD.",
        "Régularisation obligatoire des justificatifs d'absence (certificats médicaux ou dispenses) auprès de la scolarité.",
        "Auto-évaluation en ligne sur MBENE Tuteur pour consolider les notions clés abordées durant les séances manquées."
      ];
    }

    return {
      alias: student.alias,
      diagnosis,
      recommendations: recs
    };
  });
};

const getFallbackTutor = (question) => {
  return `[Mode dégradé - Service MBENE hors ligne]
Je suis MBENE, votre tuteur d'ISI SUPTECH. En raison de l'indisponibilité momentanée de l'API intelligente, je ne peux pas formuler de réponse personnalisée à votre question : "${question}".
Néanmoins, je vous conseille de relire attentivement vos supports de cours ou de vous rapprocher de votre professeur pour clarifier ce point.`;
};

module.exports = {
  getCourseRecall,
  getRemediationRecommendations,
  getStudentTutorResponse
};
