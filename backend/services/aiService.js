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
        temperature: 0.3,
        topP: 0.95
      },
      systemInstruction: `Tu es MBENE, l'assistant virtuel intelligent d'aide à la décision d'ISI SUPTECH.
Ton rôle est d'analyser la liste anonymisée des étudiants en situation de décrochage scolaire (taux d'assiduité sous le seuil critique de 70 %) et de proposer des recommandations de remédiation pédagogique et de suivi administratif.
Pour chaque étudiant répertorié :
1. Rappelle brièvement son identifiant (ex: Etudiant_01) et sa statistique d'assiduité.
2. Propose 2 à 3 actions de remédiation très ciblées (ex: entretien de motivation, tutorat par les pairs, ou aménagement du temps d'études).`
    });

    const prompt = `Voici la liste anonymisée des étudiants en situation de décrochage (assiduité < 70%) :
${JSON.stringify(anonymizedStudents, null, 2)}
Génère pour chacun des suggestions de remédiation personnalisées et exploitables pour la direction.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
Tu dois répondre à ses questions de manière extrêmement pédagogique, patiente, claire, et constructive.
Utilise des exemples concrets pour expliquer les notions complexes.
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
  let fallbackText = `[Mode dégradé - Service MBENE hors ligne] Recommandations de remédiation génériques :\n`;
  students.forEach(student => {
    fallbackText += `\n- Profil : ${student.alias} (Taux d'assiduité : ${student.attendanceRate}%)\n`;
    fallbackText += `  * Recommandation 1 : Convoquer l'étudiant à un entretien d'explication pédagogique pour identifier la cause de l'absentéisme.\n`;
    fallbackText += `  * Recommandation 2 : Proposer le rattrapage des supports de cours via un tuteur ou la plateforme en ligne.\n`;
  });
  return fallbackText;
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
