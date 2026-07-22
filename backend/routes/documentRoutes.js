const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  uploadDocument,
  getDocumentsByCourse,
  deleteDocument
} = require('../controllers/documentController');

/**
 * @swagger
 * tags:
 *   - name: Documents (Supports de cours)
 *     description: Téléversement et gestion des fichiers de cours (.pdf, .docx, .pptx)
 */

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Téléverser un support de cours (Enseignant uniquement, max 10 Mo)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - courseId
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               courseId:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document téléversé avec succès.
 *       400:
 *         description: Requête ou format de fichier incorrect.
 */
router.post('/', protect, authorize('teacher', 'admin'), upload.single('file'), uploadDocument);

/**
 * @swagger
 * /api/documents/course/{courseId}:
 *   get:
 *     summary: Récupérer tous les documents associés à une matière/cours (Tous rôles)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des documents de la matière.
 */
router.get('/course/:courseId', protect, getDocumentsByCourse);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Supprimer un support de cours (Enseignant auteur ou Admin uniquement)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document supprimé avec succès.
 *       403:
 *         description: Non autorisé (si non-auteur et non-admin).
 */
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteDocument);

module.exports = router;
