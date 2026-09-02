const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createUser, getUsers, getUserById, updateUser, deleteUser,
  createClass, getClasses, getClassById, updateClass, deleteClass,
  createCourse, getCourses, getCourseById, updateCourse, deleteCourse,
  getStudentsByClass, importStudentsBulk
} = require('../controllers/studentController');

/**
 * @swagger
 * tags:
 *   - name: Administration (Users)
 *     description: CRUD Utilisateurs (Admin uniquement)
 *   - name: School Administration (Classes & Courses)
 *     description: Gestion scolaire des Classes et Matières
 */

// --- USERS CRUD (Admin uniquement) ---

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur (Admin)
 *     tags: [Administration (Users)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student, direction, responsable]
 *               classId:
 *                 type: integer
 *                 description: Obligatoire uniquement pour les étudiants.
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       403:
 *         description: Non autorisé (non-admin).
 */
router.post('/users', protect, authorize('admin', 'direction'), createUser);

/**
 * @swagger
 * /api/users/bulk:
 *   post:
 *     summary: Importer des étudiants en masse (Admin & Direction)
 *     tags: [Administration (Users)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - students
 *             properties:
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - firstName
 *                     - lastName
 *                     - email
 *                     - classId
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     classId:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Étudiants importés avec succès.
 *       403:
 *         description: Non autorisé (réservé admin et direction).
 */
router.post('/users/bulk', protect, authorize('admin', 'direction'), importStudentsBulk);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (Admin)
 *     tags: [Administration (Users)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les utilisateurs.
 */
router.get('/users', protect, authorize('admin', 'direction'), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID (Admin)
 *     tags: [Administration (Users)]
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
 *         description: Utilisateur trouvé.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.get('/users/:id', protect, authorize('admin', 'direction'), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur (Admin)
 *     tags: [Administration (Users)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour.
 */
router.put('/users/:id', protect, authorize('admin'), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin)
 *     tags: [Administration (Users)]
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
 *         description: Utilisateur supprimé.
 */
router.delete('/users/:id', protect, authorize('admin', 'direction'), deleteUser);


// --- CLASSES CRUD ---

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Créer une classe (Admin)
 *     tags: [School Administration (Classes & Courses)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - department
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Classe créée.
 */
router.post('/classes', protect, authorize('admin', 'direction'), createClass);

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Récupérer toutes les classes
 *     tags: [School Administration (Classes & Courses)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les classes.
 */
router.get('/classes', protect, getClasses);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Récupérer une classe par son ID
 *     tags: [School Administration (Classes & Courses)]
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
 *         description: Classe trouvée.
 *       404:
 *         description: Classe non trouvée.
 */
router.get('/classes/:id', protect, getClassById);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Mettre à jour une classe (Admin & Direction)
 *     tags: [School Administration (Classes & Courses)]
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
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Classe mise à jour.
 */
router.put('/classes/:id', protect, authorize('admin', 'direction'), updateClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Supprimer une classe (Admin & Direction)
 *     tags: [School Administration (Classes & Courses)]
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
 *         description: Classe supprimée.
 */
router.delete('/classes/:id', protect, authorize('admin', 'direction'), deleteClass);


// --- COURSES CRUD ---

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Créer une matière/cours (Admin)
 *     tags: [School Administration (Classes & Courses)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - title
 *             properties:
 *               code:
 *                 type: string
 *               title:
 *                 type: string
 *               coefficient:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Cours créé.
 */
router.post('/courses', protect, authorize('admin', 'direction'), createCourse);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Récupérer tous les cours
 *     tags: [School Administration (Classes & Courses)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les cours.
 */
router.get('/courses', protect, getCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Récupérer un cours/matière par son ID
 *     tags: [School Administration (Classes & Courses)]
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
 *         description: Cours trouvé.
 *       404:
 *         description: Cours non trouvé.
 */
router.get('/courses/:id', protect, getCourseById);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Mettre à jour un cours/matière (Admin & Direction)
 *     tags: [School Administration (Classes & Courses)]
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
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               credits:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cours mis à jour.
 */
router.put('/courses/:id', protect, authorize('admin', 'direction'), updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Supprimer un cours/matière (Admin & Direction)
 *     tags: [School Administration (Classes & Courses)]
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
 *         description: Cours supprimé.
 */
router.delete('/courses/:id', protect, authorize('admin', 'direction'), deleteCourse);


// --- GET STUDENTS BY CLASS ---

/**
 * @swagger
 * /api/classes/{classId}/students:
 *   get:
 *     summary: Récupérer les étudiants inscrits dans une classe donnée
 *     tags: [School Administration (Classes & Courses)]
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
 */
router.get('/classes/:classId/students', protect, getStudentsByClass);

module.exports = router;
