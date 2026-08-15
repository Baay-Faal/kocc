const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createSession,
  getSessions,
  getSessionById,
  getSessionsByClass,
  getSessionsByTeacher,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');

/**
 * @swagger
 * tags:
 *   - name: Timetables (Emploi du temps)
 *     description: Gestion des séances de cours et planification scolaire
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Créer une nouvelle séance d'emploi du temps (Admin)
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *               - classroom
 *               - classId
 *               - courseId
 *               - teacherId
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               classroom:
 *                 type: string
 *               classId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *               teacherId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Séance créée.
 *       403:
 *         description: Accès interdit (admin uniquement).
 */
router.post('/', protect, authorize('admin'), createSession);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Récupérer toutes les séances de cours (Admin)
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les séances.
 */
router.get('/', protect, authorize('admin'), getSessions);

router.get('/:id', protect, getSessionById);

/**
 * @swagger
 * /api/sessions/class/{classId}:
 *   get:
 *     summary: Récupérer l'emploi du temps d'une classe (Tous rôles)
 *     tags: [Timetables]
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
 *         description: Liste des séances de la classe.
 */
router.get('/class/:classId', protect, getSessionsByClass);

/**
 * @swagger
 * /api/sessions/teacher/{teacherId}:
 *   get:
 *     summary: Récupérer les séances planifiées d'un enseignant (Prof / Admin)
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des séances du professeur.
 */
router.get('/teacher/:teacherId', protect, authorize('teacher', 'admin'), getSessionsByTeacher);

router.put('/:id', protect, authorize('admin'), updateSession);
router.delete('/:id', protect, authorize('admin'), deleteSession);

module.exports = router;
