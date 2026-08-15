const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createEvaluation,
  getEvaluationsByClass,
  getMyEvaluations
} = require('../controllers/evaluationController');

/**
 * @swagger
 * tags:
 *   - name: Evaluations (Examens & Devoirs)
 *     description: Planification d'examens et de devoirs par les enseignants
 */

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Planifier une nouvelle évaluation (Teacher uniquement)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - date
 *               - courseId
 *               - classId
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [devoir, examen]
 *               date:
 *                 type: string
 *                 format: date-time
 *               coefficient:
 *                 type: number
 *                 format: float
 *               courseId:
 *                 type: integer
 *               classId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Évaluation créée avec succès et notifications e-mails envoyées aux étudiants.
 *       403:
 *         description: Non autorisé (si l'enseignant n'enseigne pas cette matière).
 */
router.post('/', protect, authorize('teacher', 'admin'), createEvaluation);

/**
 * @swagger
 * /api/evaluations/class/{classId}:
 *   get:
 *     summary: Récupérer toutes les évaluations planifiées d'une classe (Tous rôles)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des évaluations.
 */
router.get('/class/:classId', protect, getEvaluationsByClass);

/**
 * @swagger
 * /api/evaluations/my:
 *   get:
 *     summary: Récupérer les évaluations créées par l'enseignant connecté (Teacher uniquement)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des évaluations du professeur.
 */
router.get('/my', protect, authorize('teacher', 'admin'), getMyEvaluations);

module.exports = router;
