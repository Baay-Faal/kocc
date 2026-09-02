const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getMyClasses, getClassStudents } = require('../controllers/teacherController');

/**
 * @swagger
 * tags:
 *   - name: Teacher (Espace Enseignant)
 *     description: Gestion des classes attribuées et consultations pédagogiques
 */

/**
 * @swagger
 * /api/teacher/my-classes:
 *   get:
 *     summary: Récupérer les classes attribuées à l'enseignant connecté
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des classes attribuées.
 */
router.get('/my-classes', protect, authorize('teacher', 'admin', 'direction'), getMyClasses);

/**
 * @swagger
 * /api/teacher/my-classes/{classId}/students:
 *   get:
 *     summary: Récupérer la liste des étudiants d'une classe attribuée
 *     tags: [Teacher]
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
 *         description: Liste des étudiants de la classe.
 *       403:
 *         description: Accès refusé (classe non attribuée).
 */
router.get('/my-classes/:classId/students', protect, authorize('teacher', 'admin', 'direction'), getClassStudents);

module.exports = router;
