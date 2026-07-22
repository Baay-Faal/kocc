# KOCC - Système Intelligent de Gestion Pédagogique (ISI SUPTECH)

**KOCC** est une application web moderne de gestion pédagogique conçue pour l'institut **ISI SUPTECH**, intégrant l'assistant virtuel intelligent **MBENE** alimenté par l'API Google Gemini 1.5 Flash.

L'application permet de centraliser la scolarité, de simplifier la saisie des appels numériques, d'héberger les supports de cours, de proposer des recommandations de remédiation automatisées face au décrochage et de fournir une documentation interactive de ses APIs.

---

## 🚀 Stack Technique

*   **Frontend** : React.js (Single Page Application, React Router v6, Axios).
*   **Backend** : Node.js avec Express.js.
*   **Base de données** : MySQL avec l'ORM Sequelize.
*   **Gestion des Médias** : Multer pour le téléversement de documents locaux.
*   **Sécurité** : Authentification et autorisation par jetons JSON Web Tokens (JWT), hachage des mots de passe avec bcryptjs.
*   **Intelligence Artificielle** : Assistant MBENE connecté au SDK officiel `@google/generative-ai` (Gemini 1.5 Flash).
*   **Documentation** : Swagger UI (génération automatique à l'aide de JSDoc).

---

## 📁 Structure du Projet

```text
kocc-project/
├── backend/
│   ├── config/
│   │   ├── database.js         # Configuration de la connexion Sequelize & MySQL
│   │   └── swagger.js          # Configuration Swagger UI
│   ├── controllers/
│   │   ├── authController.js   # Authentification et gestion de session
│   │   └── studentController.js# Gestion scolaire (utilisateurs, classes, matières)
│   ├── middlewares/
│   │   ├── authMiddleware.js   # Validation du JWT et gestion des rôles
│   │   └── uploadMiddleware.js # Configuration Multer pour les supports de cours
│   ├── models/
│   │   ├── index.js            # Initialisation et associations Sequelize
│   │   ├── User.js             # Modèle Utilisateur (Admin, Prof, Etudiant...)
│   │   ├── Class.js            # Modèle Classe
│   │   ├── Course.js           # Modèle Matière
│   │   ├── Session.js          # Modèle Séance d'appel
│   │   ├── Attendance.js       # Modèle Présence
│   │   ├── Grade.js            # Modèle Note
│   │   └── Document.js         # Modèle Support de cours
│   ├── uploads/                # Répertoire de stockage physique des fichiers de cours
│   ├── .env                    # Fichier de configuration d'environnement local
│   ├── package.json            # Dépendances backend
│   └── server.js               # Point d'entrée de l'API Express
└── frontend/
    # (À venir : Structure de l'application React.js)
```

---

## 🛠️ Installation & Configuration

### Prérequis
*   Node.js (v18 ou supérieur)
*   MySQL installé et en cours d'exécution
*   Une clé d'API Google Gemini

### 1. Configuration du Backend

1. Naviguez dans le dossier `backend` :
   ```bash
   cd backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez une base de données MySQL vide nommée `kocc` sur votre serveur local.
4. Créez un fichier `.env` basé sur le modèle `.env.example` :
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=votre_mot_de_passe_mysql
   DB_NAME=kocc
   JWT_SECRET=votre_cle_secrete_jwt_super_longue
   GEMINI_API_KEY=votre_cle_api_google_gemini
   ```
5. Lancez le serveur en mode développement :
   ```bash
   npm run dev
   ```
6. Accédez à la documentation de l'API interactive (Swagger UI) à l'adresse suivante :
   [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 🔒 Sécurité et Rôles

L'accès à l'API est sécurisé par des jetons JWT. Les rôles supportés sont :
*   `admin` : Accès complet à la gestion scolaire et au CRUD des utilisateurs, classes et matières.
*   `teacher` : Saisie des feuilles d'appels, dépôt de documents et consultation de l'assistant IA MBENE.
*   `student` : Consultation des cours, téléchargement de documents et statistiques d'absences.
*   `direction` / `responsable` : Vue globale des alertes de décrochage scolaire générées par l'IA MBENE.