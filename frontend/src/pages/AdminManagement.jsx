import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle,
  FileText,
  UserPlus,
  Compass,
  MapPin,
  Clock,
  Layers,
  FileSpreadsheet,
  Search,
  Filter
} from 'lucide-react';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [userFilterQuery, setUserFilterQuery] = useState('');
  const [userFilterClass, setUserFilterClass] = useState('all');
  
  // Lists data
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Creation States
  // 1. Class
  const [className, setClassName] = useState('');
  const [classDept, setClassDept] = useState('');
  
  // 2. Course
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCoeff, setCourseCoeff] = useState('1.0');
  const [courseCredits, setCourseCredits] = useState('15');
  
  // 3. User
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('kocc1234');
  const [userRole, setUserRole] = useState('student');
  const [userClassId, setUserClassId] = useState('');

  // 4. Session (Timetable)
  const [sessionRoom, setSessionRoom] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionStartHour, setSessionStartHour] = useState('08:00');
  const [sessionEndHour, setSessionEndHour] = useState('10:00');
  const [sessionClassId, setSessionClassId] = useState('');
  const [sessionCourseId, setSessionCourseId] = useState('');
  const [sessionTeacherId, setSessionTeacherId] = useState('');
  const [sessionWeeksCount, setSessionWeeksCount] = useState('1');

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Récupérer les données pour l'onglet actif
  const loadData = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (activeTab === 'classes') {
        const res = await API.get('/classes');
        setClasses(res.data);
      } else if (activeTab === 'courses') {
        // En supposant qu'on a un GET /api/courses
        const res = await API.get('/courses');
        setCourses(res.data);
      } else if (activeTab === 'users') {
        const res = await API.get('/users');
        setUsers(res.data);
        const classesRes = await API.get('/classes');
        setClasses(classesRes.data);
        if (classesRes.data.length > 0) setUserClassId(classesRes.data[0].id);
      } else if (activeTab === 'sessions') {
        const classesRes = await API.get('/classes');
        setClasses(classesRes.data);
        const coursesRes = await API.get('/courses');
        setCourses(coursesRes.data);
        const usersRes = await API.get('/users');
        const teachersList = usersRes.data.filter(u => u.role === 'teacher');
        setTeachers(teachersList);

        if (classesRes.data.length > 0) setSessionClassId(classesRes.data[0].id);
        if (coursesRes.data.length > 0) setSessionCourseId(coursesRes.data[0].id);
        if (teachersList.length > 0) setSessionTeacherId(teachersList[0].id);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: "Erreur lors du chargement des données administratives." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Submit Handlers
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await API.post('/classes', { name: className, department: classDept });
      setMessage({ type: 'success', text: `Classe "${className}" créée avec succès.` });
      setClassName('');
      setClassDept('');
      loadData();
    } catch (err) {
      setMessage({ type: 'danger', text: "Erreur lors de la création de la classe." });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await API.post('/courses', {
        title: courseTitle,
        code: courseCode,
        coefficient: parseFloat(courseCoeff),
        credits: parseInt(courseCredits, 10)
      });
      setMessage({ type: 'success', text: `Matière "${courseTitle}" créée avec succès.` });
      setCourseTitle('');
      setCourseCode('');
      setCourseCoeff('1.0');
      setCourseCredits('15');
      loadData();
    } catch (err) {
      setMessage({ type: 'danger', text: "Erreur lors de la création de la matière." });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        password: userPass,
        role: userRole
      };
      if (userRole === 'student' && userClassId) {
        payload.classId = parseInt(userClassId, 10);
      }
      await API.post('/users', payload);
      setMessage({ type: 'success', text: `Compte de ${userFirstName} (${userRole}) créé.` });
      setUserFirstName('');
      setUserLastName('');
      setUserEmail('');
      setUserPass('kocc1234');
      loadData();
    } catch (err) {
      setMessage({ type: 'danger', text: "Erreur lors de la création du compte." });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const parsedStudents = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Gérer les séparateurs virgule ou point-virgule
        const separator = line.includes(';') ? ';' : ',';
        const parts = line.split(separator);

        if (parts.length >= 4) {
          const [firstName, lastName, email, className] = parts;
          parsedStudents.push({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            className: className.trim()
          });
        }
      }

      if (parsedStudents.length === 0) {
        setMessage({ type: 'danger', text: "Le fichier CSV est vide ou mal formaté (entête attendue: prenom,nom,email,classe)." });
        return;
      }

      setSubmitLoading(true);
      setMessage({ type: 'info', text: `Lecture du fichier : ${parsedStudents.length} étudiants détectés. Envoi au serveur...` });

      try {
        const res = await API.post('/users/bulk', { students: parsedStudents });
        const { createdCount, errors } = res.data;
        let msg = `${createdCount} étudiants importés avec succès.`;
        if (errors && errors.length > 0) {
          msg += ` (${errors.length} échecs détectés, ex: ${errors[0].email} - ${errors[0].message})`;
        }
        setMessage({ 
          type: errors && errors.length > 0 ? 'warning' : 'success', 
          text: msg 
        });
        loadData();
      } catch (err) {
        console.error(err);
        setMessage({ type: 'danger', text: "Erreur réseau ou format de fichier incorrect." });
      } finally {
        setSubmitLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const startTime = new Date(`${sessionDate}T${sessionStartHour}:00`).toISOString();
      const endTime = new Date(`${sessionDate}T${sessionEndHour}:00`).toISOString();

      await API.post('/sessions', {
        classroom: sessionRoom,
        startTime,
        endTime,
        classId: parseInt(sessionClassId, 10),
        courseId: parseInt(sessionCourseId, 10),
        teacherId: parseInt(sessionTeacherId, 10),
        weeksCount: parseInt(sessionWeeksCount, 10)
      });
      setMessage({ type: 'success', text: "Séance(s) de cours ajoutée(s) à l'emploi du temps." });
      setSessionRoom('');
      setSessionDate('');
      setSessionStartHour('08:00');
      setSessionEndHour('10:00');
      setSessionWeeksCount('1');
    } catch (err) {
      setMessage({ type: 'danger', text: "Erreur lors de la planification de la séance." });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="timetable-wrapper fade-in">
      <header className="timetable-header">
        <div>
          <h1 className="welcome-title">Console d'Administration</h1>
          <p className="welcome-subtitle">Configurez et gérez les classes, les cours, les utilisateurs et l'emploi du temps.</p>
        </div>
      </header>

      {/* Onglets d'administration */}
      <div className="bulletin-filters" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', width: '100%' }}>
        <button 
          onClick={() => setActiveTab('classes')}
          className={`sidebar-nav-item ${activeTab === 'classes' ? 'active' : ''}`}
          style={{ width: 'auto', display: 'inline-flex' }}
        >
          <Layers size={16} />
          <span>Classes</span>
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          className={`sidebar-nav-item ${activeTab === 'courses' ? 'active' : ''}`}
          style={{ width: 'auto', display: 'inline-flex' }}
        >
          <BookOpen size={16} />
          <span>Matières</span>
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          style={{ width: 'auto', display: 'inline-flex' }}
        >
          <Users size={16} />
          <span>Comptes</span>
        </button>
        <button 
          onClick={() => setActiveTab('sessions')}
          className={`sidebar-nav-item ${activeTab === 'sessions' ? 'active' : ''}`}
          style={{ width: 'auto', display: 'inline-flex' }}
        >
          <Calendar size={16} />
          <span>Planifier un cours</span>
        </button>
      </div>

      {message.text && (
        <div className={`login-error-box ${message.type === 'success' ? 'success-box' : ''}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="documents-grid-layout" style={{ marginTop: '1rem' }}>
        
        {/* Colonne Gauche : Formulaire de création selon l'onglet */}
        <div className="kocc-card upload-form-card">
          
          {activeTab === 'classes' && (
            <>
              <div className="upload-header">
                <PlusCircle size={20} className="filter-icon" />
                <h3 className="card-section-title">Créer une Classe</h3>
              </div>
              <form onSubmit={handleCreateClass} className="upload-form">
                <div className="input-group">
                  <label className="input-label">Nom de la classe</label>
                  <input
                    type="text"
                    className="kocc-input"
                    placeholder="Ex: GL3, RI2..."
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Département</label>
                  <input
                    type="text"
                    className="kocc-input"
                    placeholder="Ex: Génie Logiciel..."
                    value={classDept}
                    onChange={(e) => setClassDept(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="kocc-btn kocc-btn-primary full-width-btn" disabled={submitLoading}>
                  Créer la classe
                </button>
              </form>
            </>
          )}

          {activeTab === 'courses' && (
            <>
              <div className="upload-header">
                <PlusCircle size={20} className="filter-icon" />
                <h3 className="card-section-title">Créer une Matière</h3>
              </div>
              <form onSubmit={handleCreateCourse} className="upload-form">
                <div className="input-group">
                  <label className="input-label">Nom du cours</label>
                  <input
                    type="text"
                    className="kocc-input"
                    placeholder="Ex: Node.js, Réseaux..."
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Code unique</label>
                  <input
                    type="text"
                    className="kocc-input"
                    placeholder="Ex: NET201..."
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Coefficient</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="kocc-input"
                    value={courseCoeff}
                    onChange={(e) => setCourseCoeff(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Crédits LMD</label>
                  <input
                    type="number"
                    min="1"
                    className="kocc-input"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="kocc-btn kocc-btn-primary full-width-btn" disabled={submitLoading}>
                  Créer la matière
                </button>
              </form>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="upload-header">
                <UserPlus size={20} className="filter-icon" />
                <h3 className="card-section-title">Enregistrer un Utilisateur</h3>
              </div>
              <form onSubmit={handleCreateUser} className="upload-form">
                <div className="input-group">
                  <label className="input-label">Prénom</label>
                  <input
                    type="text"
                    className="kocc-input"
                    placeholder="Prénom..."
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Nom</label>
                  <input
                    type="text"
                    className="kocc-input"
                    placeholder="Nom de famille..."
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">E-mail</label>
                  <input
                    type="email"
                    className="kocc-input"
                    placeholder="Ex: eleve@isi.sn..."
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Mot de passe (par défaut)</label>
                  <input
                    type="text"
                    className="kocc-input"
                    value={userPass}
                    onChange={(e) => setUserPass(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Rôle</label>
                  <select
                    className="kocc-input filter-select"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    <option value="student">Étudiant (Student)</option>
                    <option value="teacher">Enseignant (Teacher)</option>
                    <option value="direction">Direction / Administration</option>
                    <option value="admin">Administrateur Système</option>
                  </select>
                </div>

                {userRole === 'student' && classes.length > 0 && (
                  <div className="input-group">
                    <label className="input-label">Affecter à une classe</label>
                    <select
                      className="kocc-input filter-select"
                      value={userClassId}
                      onChange={(e) => setUserClassId(e.target.value)}
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="kocc-btn kocc-btn-primary full-width-btn" disabled={submitLoading}>
                  Créer le compte
                </button>
              </form>

              {/* Import CSV groupé */}
              <div className="upload-header" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '2.5rem' }}>
                <FileSpreadsheet size={20} className="filter-icon" />
                <h3 className="card-section-title">Importation CSV groupée</h3>
              </div>
              <div className="upload-form">
                <p className="highlight-text" style={{ fontSize: '0.8rem', margin: 0 }}>
                  Sélectionnez un fichier <code>.csv</code> pour importer des étudiants en masse.
                  <br />
                  Format attendu : <code>prenom,nom,email,classe</code> (ex: <code>Moussa,Diop,moussa@isi.sn,GL3</code>)
                </p>
                <div className="input-group">
                  <input
                    type="file"
                    accept=".csv"
                    className="kocc-input file-input"
                    onChange={handleCSVImport}
                    disabled={submitLoading}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'sessions' && (
            <>
              <div className="upload-header">
                <PlusCircle size={20} className="filter-icon" />
                <h3 className="card-section-title">Planifier un Cours</h3>
              </div>
              <form onSubmit={handleCreateSession} className="upload-form">
                <div className="input-group">
                  <label className="input-label">Salle de classe</label>
                  <input
                    type="text"
                    className="kocc-input"
                    placeholder="Ex: Salle A102..."
                    value={sessionRoom}
                    onChange={(e) => setSessionRoom(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Date du premier cours</label>
                  <input
                    type="date"
                    className="kocc-input"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Heure de début</label>
                  <input
                    type="time"
                    className="kocc-input"
                    value={sessionStartHour}
                    onChange={(e) => setSessionStartHour(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Heure de fin</label>
                  <input
                    type="time"
                    className="kocc-input"
                    value={sessionEndHour}
                    onChange={(e) => setSessionEndHour(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Classe concernée</label>
                  <select
                    className="kocc-input filter-select"
                    value={sessionClassId}
                    onChange={(e) => setSessionClassId(e.target.value)}
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Matière</label>
                  <select
                    className="kocc-input filter-select"
                    value={sessionCourseId}
                    onChange={(e) => setSessionCourseId(e.target.value)}
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Enseignant affecté</label>
                  <select
                    className="kocc-input filter-select"
                    value={sessionTeacherId}
                    onChange={(e) => setSessionTeacherId(e.target.value)}
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Nombre de semaines (Répétition)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="kocc-input"
                    value={sessionWeeksCount}
                    onChange={(e) => setSessionWeeksCount(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="kocc-btn kocc-btn-primary full-width-btn" disabled={submitLoading || classes.length === 0 || courses.length === 0 || teachers.length === 0}>
                  Ajouter au planning
                </button>
              </form>
            </>
          )}

        </div>

        {/* Colonne Droite : Vue liste des entités existantes */}
        <div className="documents-list-section">
          <h3 className="card-section-title text-left mb-1-5">Registres Actuels ({activeTab})</h3>

          {loading ? (
            <p className="loading-placeholder">Chargement...</p>
          ) : activeTab === 'classes' && classes.length === 0 ? (
            <p className="empty-placeholder">Aucune classe répertoriée.</p>
          ) : activeTab === 'classes' ? (
            <div className="doc-cards-grid">
              {classes.map(c => (
                <div key={c.id} className="kocc-card doc-item-card">
                  <div className="doc-card-icon-box"><Layers size={20} /></div>
                  <div className="doc-card-body text-left">
                    <h4 className="doc-card-title">{c.name}</h4>
                    <p className="doc-card-meta">Département: {c.department}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'courses' && courses.length === 0 ? (
            <p className="empty-placeholder">Aucune matière répertoriée.</p>
          ) : activeTab === 'courses' ? (
            <div className="doc-cards-grid">
              {courses.map(c => (
                <div key={c.id} className="kocc-card doc-item-card">
                  <div className="doc-card-icon-box"><BookOpen size={20} /></div>
                  <div className="doc-card-body text-left">
                    <h4 className="doc-card-title">{c.title}</h4>
                    <p className="doc-card-meta">Code: {c.code} • Coeff: {c.coefficient} • Crédits: {c.credits}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'users' && users.length === 0 ? (
            <p className="empty-placeholder">Aucun utilisateur enregistré.</p>
          ) : activeTab === 'users' ? (
            <div>
              {/* Barre de recherche et filtre rapide */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="kocc-input"
                    style={{ paddingLeft: '2.2rem', paddingRight: '0.8rem', width: '100%', fontSize: '0.85rem' }}
                    placeholder="Filtrer par nom, matricule..."
                    value={userFilterQuery}
                    onChange={(e) => setUserFilterQuery(e.target.value)}
                  />
                </div>
                <select
                  className="kocc-input filter-select"
                  style={{ width: 'auto', minWidth: '130px', fontSize: '0.85rem' }}
                  value={userFilterClass}
                  onChange={(e) => setUserFilterClass(e.target.value)}
                >
                  <option value="all">Toutes classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="doc-cards-grid">
                {users
                  .filter(u => {
                    if (userFilterClass !== 'all' && String(u.classId) !== String(userFilterClass)) {
                      return false;
                    }
                    if (userFilterQuery.trim() !== '') {
                      const q = userFilterQuery.toLowerCase();
                      const matchName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
                      const matchMat = u.matricule ? u.matricule.toLowerCase().includes(q) : false;
                      const matchEmail = u.email.toLowerCase().includes(q);
                      return matchName || matchMat || matchEmail;
                    }
                    return true;
                  })
                  .slice(0, 50)
                  .map(u => (
                    <div key={u.id} className="kocc-card doc-item-card">
                      <div className="doc-card-icon-box"><Users size={20} /></div>
                      <div className="doc-card-body text-left">
                        <h4 className="doc-card-title">{u.firstName} {u.lastName}</h4>
                        <p className="doc-card-meta">
                          Rôle: <strong>{u.role.toUpperCase()}</strong>
                          {u.matricule && <> • Matricule: <strong>{u.matricule}</strong></>}
                          {u.class && <> • Classe: <strong>{u.class.name}</strong></>}
                          {u.specialty && <> • Spécialité: <em>{u.specialty}</em></>}
                          <br />
                          Email: {u.email}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="empty-placeholder">Veuillez utiliser le formulaire de gauche pour planifier de nouvelles heures.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminManagement;
