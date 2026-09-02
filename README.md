# KOCC. - Système Intelligent de Gestion Académique & ERP Scolaire (ISI SUPTECH)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-blue.svg)](https://sequelize.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4.svg)](https://ai.google.dev/)
[![Licence](https://img.shields.io/badge/Licence-ISI_SUPTECH-black.svg)]()

**KOCC** est une plateforme web moderne et complète d'administration scolaire et de gestion pédagogique conçue pour l'institut **ISI SUPTECH**, intégrant l'assistant virtuel intelligent **MBENE** (propulsé par Google Gemini 1.5 Flash et un moteur analytique adaptatif).

L'application centralise l'intégralité du cycle de vie académique : planification hebdomadaire des emplois du temps, feuilles d'émargement numériques, téléversement de supports pédagogiques, bulletins conformes au système LMD (Crédits ECTS), et un module d'aide à la décision pour prévenir le décrochage scolaire.

---

## 🌟 Fonctionnalités Clés par Rôle

### 🏛️ Direction Pédagogique & Administration
* **Tableau de Bord Décisionnel** : Synthèse de l'assiduité globale de l'institut, alertes et tendances d'absentéisme.
* **Vigilance & Prévention du Décrochage (MBENE IA)** :
  * Vue interactive *Master-Detail* listant les étudiants sous le seuil critique d'assiduité (< 70%).
  * Dossier individuel de remédiation par étudiant : diagnostic contextuel de l'IA, échelle de criticité (*Critique, Élevé, Modéré, Vigilance*) et 3 actions prioritaires ciblées.
  * Bouton d'envoi immédiat de convocation officielle par e-mail (`mailto:`) pré-remplie.
* **Annuaire Académique Centralisé (`/directory`)** :
  * Consultation et recherche multi-critères en temps réel (Nom, Prénom, Matricule, E-mail institutionnel).
  * Filtrage instantané par classe (`GL1`, `GL2`, `GL3`) et par spécialité pour le corps professoral.
  * Export de la base au format CSV.
* **Gestion des Structures & Emplois du Temps** :
  * Création de classes, de modules/matières et planification de séances avec attribution de salles.
  * Import/Export CSV massif d'utilisateurs.

### 👨‍🏫 Espace Enseignant (Cloisonnement Sécurisé)
* **Mes Classes Attribuées (`/my-classes`)** :
  * Accès strictement restreint aux seules classes où l'enseignant a des cours planifiés (confidentialité garantie).
  * Trombinoscope et liste des étudiants de chaque classe affectée avec recherche instantanée.
* **Feuille d'Émargement Numérique (`/attendance`)** :
  * Pointage d'assiduité en un clic : *Présent*, *En retard*, *Absent*, ou *Excusé* (avec enregistrement du motif justificatif).
* **Gestion des Évaluations & Saisie des Notes LMD (`/evaluations`, `/grades`)** :
  * Programmation des épreuves (Contrôles Continus 40% et Examens Semestriels 60%).
  * Saisie fluide des notes sur 20 alimentant directement les bulletins.
* **Supports de Cours (`/documents`)** :
  * Dépôt et partage de documents (PDF, TP, diapositives) rattachés à ses modules.
* **Cahier de Textes & MBENE Rappel** :
  * Saisie du résumé de chaque séance tenue, analysé par MBENE pour suggérer des rappels de début de cours.

### 🎓 Espace Étudiant
* **Mon Emploi du Temps** : Planning hebdomadaire des cours en temps réel avec indication des salles.
* **Mon Bulletin LMD (`/bulletin`)** : Consultation des notes, calcul des moyennes semestrielles et validation des crédits ECTS.
* **Supports Pédagogiques** : Téléchargement des cours et ressources mis à disposition par les professeurs.
* **MBENE Tuteur IA (`/tutor`)** : Assistant d'aide aux révisions répondant aux questions des étudiants en se basant fidèlement sur le programme réel dispensé par leurs professeurs.

---

## 🚀 Stack Technique

| Domaine | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Axios, Lucide React (100% Vectoriel SVG), Vanilla CSS Tokens (Nike-Style Dark Mode). |
| **Backend** | Node.js, Express.js (Architecture REST modulaire). |
| **Base de Données** | MySQL 8.0, ORM Sequelize (Relations complexes, intégrité référentielle en cascade). |
| **Sécurité & RBAC** | Authentification JWT (JSON Web Tokens), hachage bcryptjs, middleware de contrôle des rôles (`authorize`). |
| **Intelligence Artificielle** | Google Generative AI SDK (`gemini-1.5-flash`) + Moteur local de secours gradué (100% fonctionnel hors ligne). |
| **Documentation API** | Swagger UI / OpenAPI 3.0 intégrée (`/api-docs`). |

---

## 📁 Structure du Projet

```text
KOCC/
├── backend/
│   ├── config/
│   │   ├── database.js          # Connexion Sequelize MySQL
│   │   └── swagger.js           # Configuration Swagger OpenAPI
│   ├── controllers/
│   │   ├── adminController.js   # Administration des utilisateurs, classes, matières
│   │   ├── aiController.js      # Diagnostic de décrochage MBENE & rappels
│   │   ├── attendanceController.js # Émargements et feuilles d'appel
│   │   ├── authController.js    # Connexion et génération des tokens JWT
│   │   ├── documentController.js# Téléversement de cours via Multer
│   │   ├── evaluationController.js# Épreuves d'évaluation (Devoirs, Examens)
│   │   ├── gradeController.js   # Saisie et calcul des notes LMD
│   │   ├── sessionController.js # Séances d'emploi du temps et cahiers de textes
│   │   └── teacherController.js # Espace réservé : classes et étudiants affectés
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Vérification JWT et RBAC
│   │   └── uploadMiddleware.js  # Upload de fichiers
│   ├── models/
│   │   ├── index.js             # Relations et associations Sequelize
│   │   ├── User.js              # Modèle Utilisateur (Matricule, Rôle, Spécialité)
│   │   ├── Class.js             # Modèle Classe (GL1, GL2, GL3...)
│   │   ├── Course.js            # Modèle Matière (Crédits LMD)
│   │   ├── Session.js           # Modèle Séance d'emploi du temps
│   │   ├── Attendance.js        # Modèle Émargement (Présence/Absence/Justificatif)
│   │   ├── Evaluation.js        # Modèle Évaluation
│   │   ├── Grade.js             # Modèle Note LMD
│   │   └── Document.js          # Modèle Support pédagogique
│   ├── routes/                  # Routeurs Express pour chaque ressource
│   ├── seed-gl.js               # Script d'alimentation réaliste (240 étudiants)
│   ├── clean-gl.js              # Script de purge ciblée et réversible
│   ├── test-gl-integrity.js     # Suite de tests d'intégrité automatisée
│   ├── .env.example             # Modèle d'environnement sans secrets
│   └── server.js                # Point d'entrée de l'API backend
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation adaptative selon le rôle
│   │   │   └── ProtectedRoute.jsx# Gardien de routes par rôle
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Page de connexion
│   │   │   ├── Dashboard.jsx    # Tableau de bord principal
│   │   │   ├── Timetable.jsx    # Emploi du temps hebdomadaire
│   │   │   ├── MarkAttendance.jsx# Feuille d'émargement / Appel
│   │   │   ├── CourseDocuments.jsx# Gestion des supports de cours
│   │   │   ├── Evaluations.jsx  # Programmation des épreuves
│   │   │   ├── Grades.jsx       # Saisie numérique des notes
│   │   │   ├── LmdBulletin.jsx  # Bulletins de notes LMD
│   │   │   ├── Directory.jsx    # Annuaire centralisé (Direction/Admin)
│   │   │   ├── TeacherClasses.jsx# Mes Classes (Enseignants)
│   │   │   ├── AlertsView.jsx   # Vigilance Décrochage MBENE (Master-Detail)
│   │   │   ├── MbeneTutor.jsx   # Tuteur intelligent pour étudiants
│   │   │   └── AdminManagement.jsx# Console d'administration
│   │   ├── services/
│   │   │   └── api.js           # Instance Axios pré-configurée
│   │   ├── App.jsx              # Routage central
│   │   └── index.css            # Charte graphique Nike-Style (Dark Minimalist)
│   └── vite.config.js
│
├── .gitignore                   # Protection contre la fuite des secrets (.env)
└── README.md
```

---

## 🛠️ Installation & Démarrage Rapide

### Prérequis
* **Node.js** (v18 ou version ultérieure)
* **MySQL** (v8.0 ou supérieur) en cours d'exécution
* Un navigateur web moderne

### 1. Configuration du Backend

```bash
# 1. Accéder au répertoire backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement local
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres locaux :
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=votre_mot_de_passe_mysql
DB_NAME=kocc
JWT_SECRET=votre_cle_secrete_jwt_super_longue
GEMINI_API_KEY=votre_cle_api_facultative
```

> **Note sur MBENE IA :** La clé `GEMINI_API_KEY` est facultative pour le développement. En son absence, le backend active automatiquement son **moteur analytique de secours**, qui génère des diagnostics et des recommandations graduées selon la gravité des absences.

Créez la base de données MySQL :
```sql
CREATE DATABASE kocc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Démarrez le serveur :
```bash
npm run dev
# Le serveur démarre sur http://localhost:5000
# La documentation Swagger est accessible sur http://localhost:5000/api-docs
```

---

### 2. Alimentation en Données Réalistes (Génie Logiciel)

Le projet intègre un générateur de données haute fidélité pour tester l'application en conditions réelles :

```bash
# Dans le dossier backend :
npm run seed:gl
```

Cette commande injecte en quelques secondes :
* **3 Classes** : `GL1` (L1), `GL2` (L2), `GL3` (L3).
* **30 Matières** réparties sur les 6 semestres (Norme LMD : 30 crédits par semestre).
* **18 Professeurs spécialistes** avec leurs matières et spécialités déclarées.
* **240 Étudiants** avec **matricules permanents immuables** (`ISI-AAAA-XXXXX`) et e-mails propres (`prenom.nom@isi.sn`).
* **60 Séances d'emploi du temps** avec résumés de cours renseignés.
* **4 240 Émargements** incluant 4 cas de décrochage ciblés pour tester l'IA MBENE.
* **12 Évaluations & 960 Notes** pour les bulletins LMD.

Pour réinitialiser proprement sans toucher aux comptes administrateurs :
```bash
npm run clean:gl
```

Pour vérifier l'intégrité de la base de données :
```bash
node test-gl-integrity.js
```

---

### 3. Démarrage du Frontend

```bash
# Ouvrez un second terminal dans le dossier frontend :
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement Vite
npm run dev
# L'application s'ouvre sur http://localhost:5173
```

---

## 🔑 Comptes de Démonstration Pré-configurés

Tous les comptes créés partagent le mot de passe universel : **`kocc1234`**.

| Rôle | E-mail | Particularités |
| :--- | :--- | :--- |
| **Administrateur** | `admin@isi.sn` | Accès complet, gestion des utilisateurs, classes, matières. |
| **Direction Pédagogique** | `direction@isi.sn` | Alertes décrochage MBENE, annuaire global, bulletins. |
| **Enseignant (GL1)** | `amadou.ba@isi.sn` | Spécialiste Algorithmique & C. Vue dédiée sur sa classe GL1. |
| **Enseignant (GL2)** | `cheikh.ndiaye@isi.sn` | Spécialiste Technologies Web. Vue dédiée sur sa classe GL2. |
| **Étudiant GL1 (Assidu)** | `fatou.ndiaye@isi.sn` | Matricule `ISI-2026-00001` (Excellente assiduité). |
| **Étudiant GL1 (Décrocheur)** | `cheikh.sow@isi.sn` | Matricule `ISI-2026-00004` (Assiduité critique pour tester MBENE). |
| **Étudiant GL2** | `fatou.diouf@isi.sn` | Matricule `ISI-2025-00001`. |
| **Étudiant GL3** | `binta.samb@isi.sn` | Matricule `ISI-2024-00001`. |

---

## 🔒 Sécurité & Bonnes Pratiques

* **Protection des Données Personnelles** : Séparation stricte des accès : les professeurs ne peuvent consulter que leurs promotions d'affectation (`403 Forbidden` sur toute tentative d'accès non autorisé).
* **Secret Management** : Le fichier `backend/.env` est déréférencé de Git et systématiquement ignoré par le [`.gitignore`](.gitignore). Seul `.env.example` sans secrets est partagé.
* **Archivage Pérenne** : Les matricules étudiants (`ISI-AAAA-XXXXX`) et e-mails (`prenom.nom@isi.sn`) sont immuables et indépendants de la classe d'inscription, garantissant l'intégrité des archives sur plus de 10 ans.

---

## 👥 Auteur & Remerciements

Développé pour l'institut **ISI SUPTECH** - Département Informatique & Génie Logiciel.
Propulsé par la vision d'une éducation numérique moderne, accessible et intelligente au Sénégal.