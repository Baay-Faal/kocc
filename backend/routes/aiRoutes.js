const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getCourseRecallHandler, getAlertesHandler } = require('../controllers/aiController');

/**
 * @swagger
 * tags:
 *   - name: Assistant IA MBENE
 *     description: Outils d'aide à la décision pédagogique alimentés par Gemini 1.5 Flash
 */

/**
 * @swagger
 * /api/mbene/rappel-cours:
 *   get:
 *     summary: Obtenir des recommandations de continuité et rappel de cours (Teacher uniquement)
 *     tags: [Assistant IA MBENE]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: L'ID de la matière concernée.
 *     responses:
 *       200:
 *         description: Recommandations générées par MBENE.
 *       403:
 *         description: Non autorisé (réservé aux professeurs).
 */
router.get('/rappel-cours', protect, authorize('teacher', 'admin'), getCourseRecallHandler);

/**
 * @swagger
 * /api/mbene/alertes:
 *   get:
 *     summary: Obtenir la liste des étudiants en décrochage et les suggestions de remédiation (Direction & Responsable)
 *     tags: [Assistant IA MBENE]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alertes et recommandations de remédiation pédagogique générées par MBENE.
 *       403:
 *         description: Non autorisé (réservé à la direction et aux responsables).
 */
router.get('/alertes', protect, authorize('direction', 'responsable', 'admin'), getAlertesHandler);

module.exports = router;
