const express = require('express');
require('dotenv').config();
const { sequelize } = require('./models');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test
/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Tester si l'API est en ligne
 *     description: Retourne un message de succès simple.
 *     responses:
 *       200:
 *         description: Succès.
 */
app.get('/api/test', (req, res) => {
  res.json({ message: "L'API KOCC fonctionne !" });
});

// Import des routes
const authRoutes = require('./routes/authRoutes');

// Enregistrement des routes
app.use('/api/auth', authRoutes);

// Route Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test de connexion à la base de données, synchronisation des tables et lancement du serveur
sequelize.authenticate()
  .then(() => {
    console.log('Connexion à la base de données MySQL établie avec succès.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Base de données synchronisée avec les modèles.');
    app.listen(PORT, () => {
      console.log(`Le serveur écoute sur le port ${PORT}`);
      console.log(`Swagger UI disponible sur http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('Impossible de se connecter ou de synchroniser la base de données:', err);
  });
