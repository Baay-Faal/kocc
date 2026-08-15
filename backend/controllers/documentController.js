const fs = require('fs');
const path = require('path');
const { Document, Course, User, Session } = require('../models');
const { sendNewDocumentNotification } = require('../services/mailService');

// Téléverser un support de cours (enseignant)
const uploadDocument = async (req, res) => {
  const { title, courseId } = req.body;
  const file = req.file;

  try {
    if (!title || !courseId || !file) {
      // Clean up uploaded file if fields are missing
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ message: "Veuillez fournir un titre, une matière (courseId) et un fichier." });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: "Matière introuvable." });
    }

    // Save metadata to DB
    const newDoc = await Document.create({
      title,
      filePath: file.filename, // We only store the filename or relative path
      fileType: path.extname(file.originalname).substring(1), // e.g. "pdf", "docx"
      courseId: parseInt(courseId, 10),
      teacherId: req.user.id // Taken from JWT
    });

    // Envoyer une notification e-mail aux étudiants de cette matière
    const sessions = await Session.findAll({
      where: { courseId: parseInt(courseId, 10) },
      attributes: ['classId']
    });

    const classIds = [...new Set(sessions.map(s => s.classId))];

    if (classIds.length > 0) {
      const students = await User.findAll({
        where: { classId: classIds, role: 'student' },
        attributes: ['email']
      });

      const emails = students.map(s => s.email).filter(e => e);

      if (emails.length > 0) {
        sendNewDocumentNotification(
          emails,
          `${req.user.firstName} ${req.user.lastName}`,
          course.title,
          title
        );
      }
    }

    return res.status(201).json(newDoc);
  } catch (error) {
    console.error(error);
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({ message: "Erreur lors du téléversement du document." });
  }
};

// Récupérer les documents associés à une matière
const getDocumentsByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Matière introuvable." });
    }

    const documents = await Document.findAll({
      where: { courseId },
      include: [{ model: User, as: 'teacher', attributes: ['firstName', 'lastName'] }]
    });

    return res.json(documents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des documents." });
  }
};

// Supprimer un document (enseignant)
const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: "Document introuvable." });
    }

    // Optional safety check: ensure the teacher who uploads it (or admin) is deleting it
    if (req.user.role !== 'admin' && document.teacherId !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas l'auteur de ce document." });
    }

    // Delete physical file from uploads folder
    const physicalPath = path.join(__dirname, '../uploads', document.filePath);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    // Delete DB entry
    await document.destroy();

    return res.json({ message: "Document supprimé avec succès." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la suppression du document." });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByCourse,
  deleteDocument
};
