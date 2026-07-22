const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authentifier un utilisateur
 *     description: Permet de se connecter et de récupérer un token JWT.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: prof@isi.sn
 *               password:
 *                 type: string
 *                 example: mon_mot_de_passe
 *     responses:
 *       200:
 *         description: Authentification réussie. Retourne le token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: E-mail ou mot de passe incorrect.
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     description: Décode le token JWT pour obtenir le profil de l'utilisateur.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès. Retourne le profil utilisateur.
 *       401:
 *         description: Non autorisé ou jeton manquant/invalide.
 */
router.get('/me', protect, getMe);

module.exports = router;
