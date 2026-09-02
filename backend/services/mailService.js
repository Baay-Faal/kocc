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

// 5. Briefing de la veille envoyé au professeur par MBENE
const sendTeacherEveBriefing = async (teacherEmail, teacherName, targetDateFormatted, sessions) => {
  const sessionsText = sessions.map((s, idx) => {
    return `${idx + 1}. [${s.time}] ${s.courseTitle}
   - Classe : ${s.className} (${s.studentCount || 'Tous'} étudiants)
   - Salle : ${s.classroom}
   - Rappel MBENE : ${s.mbeneAdvice}`;
  }).join('\n\n');

  const sessionsHtml = sessions.map((s) => `
    <div style="background-color: #1a1a1a; border: 1px solid #333333; padding: 16px; margin-bottom: 16px; border-radius: 6px;">
      <div style="margin-bottom: 8px;">
        <span style="background-color: #ffffff; color: #000000; font-weight: bold; font-size: 12px; padding: 3px 8px; border-radius: 3px; display: inline-block;">
          ${s.time}
        </span>
        <span style="color: #888888; font-size: 13px; margin-left: 10px;">
          Salle : <strong style="color: #ffffff;">${s.classroom}</strong> • Classe : <strong style="color: #ffffff;">${s.className}</strong>
        </span>
      </div>
      <h3 style="color: #ffffff; margin: 8px 0; font-size: 16px;">${s.courseTitle}</h3>
      <div style="background-color: #111111; border-left: 3px solid #3b82f6; padding: 10px 12px; margin-top: 10px; font-size: 13px; color: #cccccc; line-height: 1.5;">
        <strong style="color: #60a5fa; display: block; margin-bottom: 4px;">🧠 Conseil Pédagogique MBENE :</strong>
        ${s.mbeneAdvice}
      </div>
    </div>
  `).join('');

  const mailOptions = {
    from,
    to: teacherEmail,
    subject: `[KOCC ISI SUPTECH] 📅 Vos cours de demain (${targetDateFormatted}) - Briefing MBENE`,
    text: `Bonjour ${teacherName},\n\nVoici le récapitulatif de vos cours prévus demain (${targetDateFormatted}) à ISI SUPTECH :\n\n${sessionsText}\n\nBonne préparation de séance !\n\nCordialement,\nL'assistant IA MBENE & La Direction des Études.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 24px; max-width: 650px; margin: 0 auto; border-radius: 8px;">
        <div style="border-bottom: 1px solid #262626; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: -0.5px;">KOCC.</h1>
          <p style="color: #888888; margin: 4px 0 0; font-size: 13px;">Briefing Pédagogique Quotidien • ISI SUPTECH</p>
        </div>

        <p style="font-size: 15px; color: #e5e5e5;">Bonjour <strong>${teacherName}</strong>,</p>
        <p style="font-size: 14px; color: #aaaaaa; line-height: 1.5;">
          Voici le planning et les conseils pédagogiques de l'assistant IA <strong>MBENE</strong> pour vos cours prévus demain, <strong>${targetDateFormatted}</strong> :
        </p>

        <div style="margin: 24px 0;">
          ${sessionsHtml}
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #262626;">
          <a href="http://localhost:5173/attendance" style="background-color: #ffffff; color: #000000; text-decoration: none; padding: 10px 20px; font-weight: bold; font-size: 13px; border-radius: 4px; display: inline-block; margin-right: 10px;">
            Faire l'Appel
          </a>
          <a href="http://localhost:5173/documents" style="background-color: #262626; color: #ffffff; text-decoration: none; padding: 10px 20px; font-weight: bold; font-size: 13px; border-radius: 4px; display: inline-block;">
            Supports de Cours
          </a>
        </div>

        <p style="font-size: 12px; color: #666666; margin-top: 30px; text-align: center;">
          Ce message automatique est envoyé la veille de vos cours par votre assistant pédagogique MBENE pour ISI SUPTECH.
        </p>
      </div>
    `
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur lors de l'envoi du briefing de la veille :", error);
  }
};

module.exports = {
  sendAbsenceNotification,
  sendDropoutWarning,
  sendNewDocumentNotification,
  sendNewEvaluationNotification,
  sendTeacherEveBriefing
};
