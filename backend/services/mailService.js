const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter;

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || '"KOCC ISI SUPTECH" <no-reply@groupeisi.com>';

if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port == 465,
    auth: {
      user,
      pass
    }
  });
} else {
  console.warn("[Mail Warning] SMTP non configuré dans .env. Les e-mails seront simulés et affichés dans la console.");
  transporter = {
    sendMail: async (options) => {
      console.log("\n=========================================");
      console.log(`[E-mail simulé envoyé]`);
      console.log(`De: ${options.from}`);
      console.log(`À: ${options.to}`);
      console.log(`Objet: ${options.subject}`);
      console.log(`Contenu: \n${options.text}`);
      console.log("=========================================\n");
      return { messageId: "mock-id-" + Date.now() };
    }
  };
}

// 1. Notification d'absence à un étudiant
const sendAbsenceNotification = async (studentEmail, studentName, courseTitle, date) => {
  const mailOptions = {
    from,
    to: studentEmail,
    subject: `[ISI SUPTECH] Notification d'absence - ${courseTitle}`,
    text: `Bonjour ${studentName},\n\nVous avez été marqué comme ABSENT lors de la séance du cours "${courseTitle}" le ${date}.\n\nMerci de justifier votre absence dans les plus brefs délais via la plateforme KOCC en y téléversant un certificat médical ou une pièce justificative valable.\n\nCordialement,\nL'administration d'ISI SUPTECH.`,
    html: `<p>Bonjour <strong>${studentName}</strong>,</p>
           <p>Vous avez été marqué comme <strong>ABSENT</strong> lors de la séance du cours "<em>${courseTitle}</em>" le ${date}.</p>
           <p>Merci de justifier votre absence dans les plus brefs délais via la plateforme KOCC en y téléversant un certificat médical ou une pièce justificative valable.</p>
           <p>Cordialement,<br>L'administration d'ISI SUPTECH.</p>`
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail d'absence :", error);
  }
};

// 2. Alerte décrochage à la direction
const sendDropoutWarning = async (directorEmail, studentName, attendanceRate) => {
  const mailOptions = {
    from,
    to: directorEmail,
    subject: `[Alerte Décrochage] Seuil critique d'assiduité franchi - ${studentName}`,
    text: `Bonjour,\n\nCe mail automatique est généré par l'assistant IA MBENE.\n\nL'étudiant ${studentName} a franchi le seuil critique d'assiduité de 70% (Taux d'assiduité actuel : ${attendanceRate}%).\n\nL'assistant conseille de planifier un entretien ou de proposer des cours de soutien dans les meilleurs délais.\n\nCordialement,\nMBENE - ISI SUPTECH.`,
    html: `<p>Bonjour,</p>
           <p>Ce mail automatique est généré par l'assistant IA <strong>MBENE</strong>.</p>
           <p>L'étudiant <strong>${studentName}</strong> a franchi le seuil critique d'assiduité de 70% (Taux d'assiduité actuel : <strong>${attendanceRate}%</strong>).</p>
           <p>L'assistant conseille de planifier un entretien de remédiation ou de proposer un tutorat dans les meilleurs délais.</p>
           <p>Cordialement,<br>MBENE - ISI SUPTECH.</p>`
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail d'alerte décrochage :", error);
  }
};

// 3. Notification de nouveau support de cours aux étudiants de la classe
const sendNewDocumentNotification = async (studentsEmails, teacherName, courseTitle, documentTitle) => {
  if (!studentsEmails || studentsEmails.length === 0) return;

  const mailOptions = {
    from,
    to: studentsEmails.join(','),
    subject: `[ISI SUPTECH] Nouveau support de cours disponible - ${courseTitle}`,
    text: `Bonjour,\n\nVotre enseignant ${teacherName} a mis en ligne un nouveau support de cours intitulé "${documentTitle}" pour le cours de "${courseTitle}".\n\nVous pouvez le télécharger dès maintenant sur votre portail étudiant KOCC.\n\nCordialement,\nL'administration d'ISI SUPTECH.`,
    html: `<p>Bonjour,</p>
           <p>Votre enseignant <strong>${teacherName}</strong> a mis en ligne un nouveau support de cours intitulé "<strong>${documentTitle}</strong>" pour la matière "<em>${courseTitle}</em>".</p>
           <p>Vous pouvez le télécharger dès maintenant sur votre portail étudiant KOCC.</p>
           <p>Cordialement,<br>L'administration d'ISI SUPTECH.</p>`
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail de support de cours :", error);
  }
};

// 4. Notification de nouvelle évaluation planifiée aux étudiants de la classe
const sendNewEvaluationNotification = async (studentsEmails, teacherName, courseTitle, evaluationTitle, type, date) => {
  if (!studentsEmails || studentsEmails.length === 0) return;

  const typeStr = type === 'examen' ? 'un examen' : 'un devoir';
  const mailOptions = {
    from,
    to: studentsEmails.join(','),
    subject: `[ISI SUPTECH] Nouvelle évaluation planifiée - ${courseTitle}`,
    text: `Bonjour,\n\nVotre enseignant ${teacherName} a planifié ${typeStr} intitulé "${evaluationTitle}" pour le cours de "${courseTitle}".\nDate de l'épreuve : ${date}.\n\nPréparez-vous bien !\n\nCordialement,\nL'administration d'ISI SUPTECH.`,
    html: `<p>Bonjour,</p>
           <p>Votre enseignant <strong>${teacherName}</strong> a planifié <strong>${typeStr}</strong> intitulé "<strong>${evaluationTitle}</strong>" pour la matière "<em>${courseTitle}</em>".</p>
           <p><strong>Date de l'épreuve :</strong> ${date}</p>
           <p>Préparez-vous bien !</p>
           <p>Cordialement,<br>L'administration d'ISI SUPTECH.</p>`
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail de planification d'évaluation :", error);
  }
};

module.exports = {
  sendAbsenceNotification,
  sendDropoutWarning,
  sendNewDocumentNotification,
  sendNewEvaluationNotification
};
