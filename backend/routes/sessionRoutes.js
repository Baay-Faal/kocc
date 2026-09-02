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
router.post('/', protect, authorize('admin', 'direction'), createSession);

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
router.get('/', protect, authorize('admin', 'direction'), getSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Récupérer le détail d'une séance par son ID
 *     tags: [Timetables]
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
 *         description: Séance trouvée.
 *       404:
 *         description: Séance non trouvée.
 */
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

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Mettre à jour une séance d'emploi du temps ou son cahier de textes (Admin / Direction / Prof)
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summary:
 *                 type: string
 *               classroom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Séance mise à jour.
 */
router.put('/:id', protect, authorize('admin', 'direction', 'teacher'), updateSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Supprimer une séance d'emploi du temps (Admin / Direction)
 *     tags: [Timetables]
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
 *         description: Séance supprimée.
 */
router.delete('/:id', protect, authorize('admin', 'direction'), deleteSession);

module.exports = router;
