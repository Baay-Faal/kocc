const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  markAttendance,
  getStudentStats,
  getClassStats
} = require('../controllers/attendanceController');

/**
 * @swagger
 * tags:
 *   - name: Attendance (Présences)
 *     description: Gestion de l'appel et des statistiques d'assiduité
 */

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Enregistrer la feuille d'appel d'une séance (Teacher uniquement)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - records
 *             properties:
 *               sessionId:
 *                 type: integer
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - status
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late, excused]
 *                     justification:
 *                       type: string
 *     responses:
 *       200:
 *         description: Feuille d'appel enregistrée.
 *       403:
 *         description: Non autorisé (Réservé aux profs).
 */
router.post('/', protect, authorize('teacher', 'admin'), markAttendance);

/**
 * @swagger
 * /api/attendance/stats/student/{studentId}:
 *   get:
 *     summary: Taux d'assiduité et statistiques détaillées d'un étudiant (Tous rôles)
 *     tags: [Attendance]
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
 *         description: Statistiques renvoyées.
 */
router.get('/stats/student/:studentId', protect, getStudentStats);

/**
 * @swagger
 * /api/attendance/stats/class/{classId}:
 *   get:
 *     summary: Taux d'absentéisme et statistiques globales d'une classe (Prof / Direction / Responsable / Admin)
 *     tags: [Attendance]
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
 *         description: Statistiques de la classe renvoyées.
 */
router.get('/stats/class/:classId', protect, authorize('teacher', 'direction', 'responsable', 'admin'), getClassStats);

module.exports = router;
