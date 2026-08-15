const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { inputGrades, getStudentBulletin } = require('../controllers/gradeController');

/**
 * @swagger
 * tags:
 *   - name: Grades & Bulletins (Notes)
 *     description: Saisie des notes et calcul des bulletins semestriels LMD
 */

/**
 * @swagger
 * /api/grades:
 *   post:
 *     summary: Enregistrer ou modifier les notes d'une évaluation (Teacher uniquement)
 *     tags: [Grades & Bulletins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evaluationId
 *               - records
 *             properties:
 *               evaluationId:
 *                 type: integer
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - score
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                     score:
 *                       type: number
 *                       format: float
 *     responses:
 *       200:
 *         description: Notes enregistrées avec succès.
 *       403:
 *         description: Non autorisé (si l'enseignant n'est pas le créateur de l'épreuve).
 */
router.post('/', protect, authorize('teacher', 'admin'), inputGrades);

/**
 * @swagger
 * /api/grades/bulletin/student/{studentId}:
 *   get:
 *     summary: Récupérer le bulletin semestriel LMD détaillé d'un étudiant (Tous rôles)
 *     tags: [Grades & Bulletins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bulletin LMD calculé (moyennes, crédits, verdict de validation).
 */
router.get('/bulletin/student/:studentId', protect, getStudentBulletin);

module.exports = router;
