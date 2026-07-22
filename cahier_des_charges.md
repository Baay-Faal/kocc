# CAHIER DES CHARGES TECHNIQUE ET GUIDE DE DÉVELOPPEMENT : KOCC
## Système Intelligent de Gestion Pédagogique pour ISI SUPTECH avec Assistant IA MBENE

Ce document définit les spécifications fonctionnelles, techniques et architecturales pour le développement complet de l'application **KOCC**. Il contient l'arborescence des fichiers, les schémas de base de données Sequelize, les endpoints de l'API Express.js, la configuration Swagger et la structure React.js afin qu'un développeur (ou un agent IA comme Antigravity IDE) puisse implémenter l'intégralité de l'application sans ambiguïté.

---

## 1. CONTEXTE, OBJECTIFS & STACK TECHNIQUE

### 1.1 Objectifs du projet
*   **Centralisation** : Gestion de la scolarité (utilisateurs, classes, matières, notes).
*   **Feuille d'appel numérique** : Saisie rapide des présences/absences par séance et calcul automatisé des statistiques d'assiduité.
*   **Aide à la décision (IA MBENE)** : Un assistant intelligent connecté à l'API Gemini 1.5 Flash pour suggérer des rappels de cours ciblés (enseignants) et des actions de remédiation face au décrochage étudiant (direction).
*   **Gestion documentaire** : Possibilité pour les enseignants d'insérer/téléverser des supports de cours physiques (PDF, DOCX) liés aux matières.
*   **Documentation interactive (Swagger)** : Mise à disposition d'une interface Swagger UI pour documenter et tester l'ensemble des endpoints en temps réel.

### 1.2 Stack Technique Imposée
*   **Frontend** : **React.js** (Single Page Application, React Router v6, Axios).
*   **Backend** : Node.js avec **Express.js**.
*   **Base de données** : **MySQL** avec l'ORM **Sequelize**.
*   **Upload de fichiers** : Middleware **Multer** pour Express.
*   **Sécurité** : Authentification par Tokens **JWT**, hachage des mots de passe avec **bcryptjs**.
*   **Intelligence Artificielle** : SDK officiel `@google/generative-ai` (Modèle : **Gemini 1.5 Flash**).
*   **Documentation API** : **Swagger UI** (via les modules `swagger-ui-express` et `swagger-jsdoc` en Express.js).
*   **Gestion de variables d'environnement** : `dotenv`.

---

## 2. STRUCTURE DU PROJET (Arborescence des fichiers)

Le projet doit être structuré dans un dossier unique composé d'un dossier `frontend/` (React) et d'un dossier `backend/` (Express/MySQL) :

```text
kocc-project/
├── backend/
│   ├── config/
│   │   ├── database.js         # Configuration de la connexion Sequelize & MySQL
│   │   └── swagger.js          # Configuration et spécifications Swagger UI
│   ├── controllers/
│   │   ├── authController.js   # Contrôleur d'authentification
│   │   ├── studentController.js# Contrôleur pour la gestion scolaire
│   │   ├── attendanceController.js # Contrôleur pour les présences et alertes
│   │   ├── documentController.js # Contrôleur pour l'upload de supports de cours
│   │   └── aiController.js       # Contrôleur d'appel à l'IA MBENE (Gemini)
│   ├── middlewares/
│   │   ├── authMiddleware.js   # Validation du JWT et rôles
│   │   └── uploadMiddleware.js # Configuration de Multer pour le stockage local
│   ├── models/
│   │   ├── index.js            # Initialisation et associations Sequelize
│   │   ├── User.js             # Modèle Utilisateur (Admin, Prof, Etudiant, Direction)
│   │   ├── Class.js            # Modèle Classe (RI2, GL3, etc.)
│   │   ├── Course.js           # Modèle Matière (NET201, etc.)
│   │   ├── Session.js          # Modèle Séance d'emploi du temps
│   │   ├── Attendance.js       # Modèle Présence (présent, absent, retard)
│   │   ├── Grade.js            # Modèle Note
│   │   └── Document.js         # Modèle Fichier de cours
│   ├── uploads/                # Dossier où Multer stockera les fichiers physiques (PDF)
│   ├── .env                    # Fichier de variables d'environnement backend
│   ├── package.json            # Dépendances backend
│   └── server.js               # Point d'entrée de l'API Express
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/             # Images, styles globaux
    │   ├── components/
    │   │   ├── Navbar.jsx      # Barre de navigation
    │   │   ├── Sidebar.jsx     # Menu latéral selon le rôle
    │   │   └── ProtectedRoute.jsx # Route sécurisée par rôle
    │   ├── pages/
    │   │   ├── Login.jsx       # Page de connexion
    │   │   ├── Dashboard.jsx   # Tableau de bord dynamique (Prof / Direction / Etudiant)
    │   │   ├── MarkAttendance.jsx # Saisie de l'appel pour les profs
    │   │   ├── CourseDocuments.jsx # Téléchargement et dépôt de documents
    │   │   └── AlertsView.jsx  # Vue des alertes de décrochage pour la direction
    │   ├── services/
    │   │   └── api.js          # Instance Axios configurée avec interceptor de Token
    │   ├── App.jsx             # Configuration des routes React Router
    │   ├── index.css           # Design system (Times New Roman, couleurs sobres)
    │   └── main.jsx
    ├── package.json            # Dépendances frontend
    └── vite.config.js          # Configuration Vite
```

---

## 3. MODÈLES DE DONNÉES ET ASSOCIATIONS (Sequelize JS)

Les définitions de modèles suivantes doivent être respectées de manière stricte lors de l'implémentation.

### 3.1 Définition des Tables et Champs
1.  **User** : `id` (PK, Auto-increment), `firstName` (String), `lastName` (String), `email` (String, Unique), `password` (String), `role` (Enum : `'admin'`, `'teacher'`, `'student'`, `'direction'`, `'responsable'`).
2.  **Class** : `id` (PK, Auto-increment), `name` (String, unique, ex: "GL3"), `department` (String, ex: "Informatique").
3.  **Course** : `id` (PK, Auto-increment), `code` (String, unique, ex: "NET201"), `title` (String), `coefficient` (Integer, par défaut 2).
4.  **Session** : `id` (PK, Auto-increment), `startTime` (DateTime), `endTime` (DateTime), `classroom` (String), `summaryOfSession` (Text, nullable).
5.  **Attendance** : `id` (PK, Auto-increment), `status` (Enum : `'present'`, `'absent'`, `'late'`, `'excused'`), `justification` (String, nullable).
6.  **Grade** : `id` (PK, Auto-increment), `score` (Float, de 0 à 20), `evaluationType` (Enum : `'devoir'`, `'examen'`).
7.  **Document** : `id` (PK, Auto-increment), `title` (String), `filePath` (String), `fileType` (String).

### 3.2 Associations entre les modèles (`models/index.js`)
```javascript
// Relations d'Utilisateurs
Class.hasMany(User, { foreignKey: 'classId', as: 'students' });
User.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Relations de Séances (Session)
Class.hasMany(Session, { foreignKey: 'classId' });
Session.belongsTo(Class, { foreignKey: 'classId' });

Course.hasMany(Session, { foreignKey: 'courseId' });
Session.belongsTo(Course, { foreignKey: 'courseId' });

User.hasMany(Session, { foreignKey: 'teacherId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// Relations de Présences (Attendance)
Session.hasMany(Attendance, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
Attendance.belongsTo(Session, { foreignKey: 'sessionId' });

User.hasMany(Attendance, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// Relations de Notes (Grade)
User.hasMany(Grade, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Grade.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(Grade, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Grade.belongsTo(Course, { foreignKey: 'courseId' });

// Relations de Documents
Course.hasMany(Document, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Document.belongsTo(Course, { foreignKey: 'courseId' });

User.hasMany(Document, { foreignKey: 'teacherId', onDelete: 'CASCADE' });
Document.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
```

---

## 4. SPÉCIFICATIONS DES ENDPOINTS API (Express.js)

Toutes les routes d'API à l'exception de `/api/auth/login` et `/api-docs` doivent exiger l'en-tête `Authorization: Bearer <JWT_TOKEN>` de manière obligatoire.

### 4.1 Authentification (`/api/auth`)
*   `POST /api/auth/login` : Authentifie l'utilisateur.
    *   *Payload* : `{ email: "prof@isi.sn", password: "secure_password" }`
    *   *Réponse* : `{ token: "jwt_token_string", user: { id: 1, firstName: "Amina", role: "teacher" } }`
*   `GET /api/auth/me` : Décode le JWT et renvoie les infos de session de l'utilisateur connecté.

### 4.2 Administration (`/api/users`, `/api/classes`, `/api/courses`)
*(Accessibles uniquement pour le rôle `'admin'`)*
*   CRUD pour les utilisateurs (création d'élèves, affectation de rôles).
*   CRUD pour les classes et les matières.
*   `GET /api/classes/:classId/students` : Retourne la liste des élèves inscrits dans une classe donnée.

### 4.3 Feuille d'Appel (`/api/attendance`)
*   `POST /api/attendance` *(Rôle `'teacher'`)* : Enregistre les présences pour une séance d'emploi du temps.
    *   *Payload* :
        ```json
        {
          "sessionId": 4,
          "records": [
            { "studentId": 12, "status": "present", "justification": "" },
            { "studentId": 14, "status": "absent", "justification": "Certificat médical" }
          ]
        }
        ```
*   `GET /api/attendance/stats/student/:studentId` *(Tous rôles)* : Retourne le taux d'assiduité d'un étudiant.
*   `GET /api/attendance/stats/class/:classId` *(Rôles `'teacher'`, `'direction'`)* : Statistiques globales d'absentéisme d'une classe.

### 4.4 Supports de Cours (`/api/documents`)
*   `POST /api/documents` *(Rôle `'teacher'`)* : Téléverse un fichier (limité à 10 Mo, extensions `.pdf`, `.docx`, `.pptx`). Utilise **Multer** configuré pour renommer le fichier de manière unique et le stocker dans `uploads/`.
    *   *Headers* : `Content-Type: multipart/form-data`
    *   *Payload* : FormData contenant `title` (String), `courseId` (Int) et `file` (le fichier brut).
*   `GET /api/documents/course/:courseId` *(Rôles `'teacher'`, `'student'`)* : Retourne la liste des documents associés à une matière.
*   `DELETE /api/documents/:id` *(Rôle `'teacher'`)* : Supprime le fichier sur le disque et son entrée dans MySQL.

### 4.5 Assistant IA MBENE (`/api/mbene`)
*   `GET /api/mbene/rappel-cours?courseId=:courseId` *(Rôle `'teacher'`)* :
    1.  Récupère en base de données le dernier cours et le résumé (`summaryOfSession`) rédigé par le professeur pour cette matière.
    2.  Récupère le taux d'absentéisme de cette séance de cours précédente.
    3.  Appelle l'API Gemini 1.5 Flash avec le prompt structuré (voir Section 5).
    4.  Retourne la réponse formatée à l'enseignant.
*   `GET /api/mbene/alertes` *(Rôles `'direction'`, `'responsable'`)* :
    1.  Identifie les étudiants dont le taux d'assiduité est inférieur à 70 %.
    2.  Envoie ces profils anonymisés (`Etudiant_01`, `Etudiant_02`) et leurs statistiques d'absences à l'API Gemini.
    3.  Retourne une liste d'alertes enrichie de recommandations pédagogiques de remédiation générées par l'IA.

### 4.6 Documentation Swagger (`/api-docs`)
*   `GET /api-docs` *(Tous rôles)* : Expose l'interface interactive de documentation Swagger UI qui permet d'exécuter en direct des appels de test sur chaque route de l'API.

---

## 5. PROMPT ENGINEERING & INTÉGRATION GEMINI (aiService.js)

Le service d'IA du backend Express.js doit implémenter de manière sécurisée le code suivant pour communiquer avec l'API de Google :

```javascript
const { GoogleGenAI } = require("@google/generative-ai");

// Lecture sécurisée de la clé d'API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("La variable d'environnement GEMINI_API_KEY n'est pas configurée.");
}

const genAI = new GoogleGenAI({ apiKey });

/**
 * Service d'analyse pédagogique - MBENE
 */
const getCourseRecall = async (lastSessionSummary, attendanceRate) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.2, // Très bas pour maximiser la factualité logique et éviter l'hallucination
                topP: 0.95
            },
            systemInstruction: `Tu es MBENE, l'assistant virtuel intelligent d'aide à la décision d'ISI SUPTECH.
            Ton rôle est d'aider les enseignants dans leur enchaînement pédagogique.
            Sois concis, professionnel et direct. Divise impérativement ta réponse en trois sections claires :
            1. RÉSUMÉ DU DERNIER COURS (Synthétise le résumé fourni en 2 phrases max).
            2. DIFFICULTÉS CONSTATÉES (Déduis les freins possibles à partir du taux d'absences et des concepts abordés).
            3. SUGGESTION DE RÉVISION (Propose un exercice ou un rappel ciblé de 5 minutes au tableau).`
        });

        const prompt = `Voici les données de la séance précédente :
        - Contenu traité : "${lastSessionSummary}"
        - Taux de présence : ${attendanceRate}%
        Génère les recommandations pédagogiques de continuité de cours.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Erreur d'appel API Gemini :", error);
        // Fallback sécurisé en mode dégradé (sans planter)
        return `[Mode dégradé] L'assistant IA MBENE est temporairement hors ligne.
        Résumé local : ${lastSessionSummary}.
        Taux d'absence constaté : ${100 - attendanceRate}%.`;
    }
};

module.exports = { getCourseRecall };
```

---

## 6. CONFIGURATION SWAGGER POUR L'API (swagger.js)

Le backend doit inclure un fichier de configuration pour exposer la documentation interactive sur la route `/api-docs` :

### 6.1 Fichier de configuration `backend/config/swagger.js`
```javascript
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API KOCC - Système Intelligent de Gestion Pédagogique',
      version: '1.0.0',
      description: 'Documentation interactive des API REST de l\'application KOCC pour ISI SUPTECH avec l\'assistant IA MBENE.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement local (Express)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Scan les commentaires JSDoc des routes et contrôleurs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
```

### 6.2 Exemple d'annotation JSDoc Swagger pour une route Express
Chaque route du projet doit être documentée avec des commentaires standardisés comme ci-dessous pour alimenter automatiquement Swagger UI :
```javascript
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
router.post('/login', authController.login);
```

---

## 7. FRONTEND REACT (Composants principaux)

L'interface React.js doit être soignée et respecter la charte sobre demandée par le guide de rédaction (police Times New Roman par défaut, interface claire, responsive et lisible).

1.  **Page de connexion (Login.jsx)** : Formulaire demandant e-mail et mot de passe, stockant le token JWT reçu dans le `localStorage` ou les cookies, puis redirigeant l'utilisateur vers le Dashboard.
2.  **Feuille d'appel (MarkAttendance.jsx)** : Affiche la liste des élèves sous forme de tableau. Pour chaque élève, des boutons d'options radio ou boutons d'état rapide (Présent, Absent, Retard, Excusé) permettent de renseigner les présences en un clic. Un bouton de soumission envoie la feuille au backend.
3.  **Dépôt de supports de cours (CourseDocuments.jsx)** : 
    *   *Vue Professeur* : Formulaire de téléversement Drag-and-Drop avec champ Titre pour envoyer des PDF dans la matière sélectionnée.
    *   *Vue Étudiant / Professeur* : Grille de fichiers téléchargeables en un clic avec icônes de fichiers selon l'extension.
4.  **Tableau de bord IA (Dashboard.jsx & AlertsView.jsx)** :
    *   *Prof* : Affiche un panneau "Assistant MBENE" avec un bouton "Charger le rappel intelligent" qui appelle l'API Gemini et affiche de manière esthétique les conseils de révision de 5 minutes.
    *   *Direction* : Affiche la liste des étudiants en dessous de 70% de présence avec une icône d'alerte rouge et les conseils de remédiation générés par l'IA MBENE en face de chaque étudiant en situation de décrochage.

---

## 8. PROTOCOLE D'INSTALLATION ET DE DÉPLOIEMENT

### 8.1 Configuration initiale
1.  Créer une base de données MySQL vide nommée `kocc_db`.
2.  Dans le dossier `backend/`, créer un fichier `.env` contenant :
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=votre_mot_de_passe_mysql
    DB_NAME=kocc_db
    JWT_SECRET=votre_cle_secrete_jwt_super_longue
    GEMINI_API_KEY=votre_cle_api_google_gemini
    ```

### 8.2 Lancement du projet
*   **Backend** :
    ```bash
    cd backend
    npm install
    # Sequelize synchronise automatiquement les tables avec la base de données
    npm start
    ```
*   **Frontend** :
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### 8.3 Critères de validation pour considérer le projet comme achevé
*   Aucun mot de passe n'est écrit en clair dans la base de données (tous hachés avec bcryptjs).
*   L'anonymisation est effective : aucun nom réel n'est envoyé à l'API Gemini.
*   L'upload de documents de cours stocke proprement les fichiers dans le dossier `uploads/` du serveur et enregistre le chemin en base de données.
*   Toutes les requêtes de saisie d'appel ou de consultation de l'IA retournent une erreur `401 Unauthorized` si le token JWT n'est pas envoyé dans l'en-tête HTTP.
*   La route `/api-docs` affiche proprement l'interface Swagger UI avec la liste interactive des endpoints.
