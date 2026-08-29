import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  Award, 
  BookOpen, 
  Users, 
  CheckCircle, 
  XCircle, 
  ListOrdered,
  FileText,
  Filter
} from 'lucide-react';

const LmdBulletin = () => {
  const userJson = localStorage.getItem('kocc_user');
  
  const [bulletin, setBulletin] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [bulletinLoading, setBulletinLoading] = useState(false);

  if (!userJson) return null;
  const user = JSON.parse(userJson);
  const { role } = user;

  const isStudent = role === 'student';
  const hasAccessToAll = role === 'admin' || role === 'direction' || role === 'responsable' || role === 'teacher';

  useEffect(() => {
    const initBulletin = async () => {
      try {
        setLoading(true);
        if (isStudent) {
          // Charger directement le bulletin de l'élève connecté
          const res = await API.get(`/grades/bulletin/student/${user.id}`);
          setBulletin(res.data);
        } else if (hasAccessToAll) {
          // Charger les classes pour sélection
          const classesRes = await API.get('/classes');
          setClasses(classesRes.data);
          if (classesRes.data.length > 0) {
            setSelectedClassId(classesRes.data[0].id);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des données de bulletin :", err);
      } finally {
        setLoading(false);
      }
    };

    initBulletin();
  }, [role, user.id, isStudent]);

  // Charger les élèves lorsque la classe sélectionnée change
  useEffect(() => {
    if (hasAccessToAll && selectedClassId) {
      const fetchStudents = async () => {
        try {
          const res = await API.get(`/classes/${selectedClassId}/students`);
          setStudents(res.data);
          if (res.data.length > 0) {
            setSelectedStudentId(res.data[0].id);
          } else {
            setSelectedStudentId('');
            setBulletin(null);
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des élèves :", err);
        }
      };
      fetchStudents();
    }
  }, [selectedClassId, hasAccessToAll]);

  // Charger le bulletin de l'élève sélectionné par l'admin/prof/direction
  useEffect(() => {
    if (hasAccessToAll && selectedStudentId) {
      const fetchStudentBulletin = async () => {
        try {
          setBulletinLoading(true);
          const res = await API.get(`/grades/bulletin/student/${selectedStudentId}`);
          setBulletin(res.data);
        } catch (err) {
          console.error("Erreur de chargement du bulletin de l'étudiant :", err);
          setBulletin(null);
        } finally {
          setBulletinLoading(false);
        }
      };
      fetchStudentBulletin();
    }
  }, [selectedStudentId, hasAccessToAll]);

  return (
    <div className="bulletin-wrapper fade-in">
      {/* Header */}
      <header className="bulletin-header">
        <div>
          <h1 className="welcome-title">Bulletin de Notes Semestriel</h1>
          <p className="welcome-subtitle">
            Système LMD (30 crédits requis pour valider le semestre).
          </p>
        </div>

        {/* Filtres de sélection pour l'administration/professeurs */}
        {hasAccessToAll && classes.length > 0 && (
          <div className="bulletin-filters">
            <div className="class-filter">
              <Filter size={18} className="filter-icon" />
              <select 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="kocc-input filter-select"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Classe : {c.name}</option>
                ))}
              </select>
            </div>

            {students.length > 0 && (
              <div className="class-filter">
                <Users size={18} className="filter-icon" />
                <select 
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="kocc-input filter-select"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Rendu principal */}
      {loading ? (
        <p className="loading-placeholder">Chargement...</p>
      ) : bulletinLoading ? (
        <p className="loading-placeholder">Calcul du bulletin LMD en cours...</p>
      ) : !bulletin ? (
        <p className="empty-placeholder">Aucune note enregistrée ou aucun étudiant sélectionné.</p>
      ) : (
        <div className="bulletin-content">
          
          {/* Fiche récapitulative de l'étudiant */}
          <div className="kocc-card student-info-card">
            <div className="student-profile-header">
              <div className="avatar-placeholder big-avatar">
                {bulletin.student.firstName[0]}{bulletin.student.lastName[0]}
              </div>
              <div className="student-header-details text-left">
                <h3 className="student-header-fullname">{bulletin.student.firstName} {bulletin.student.lastName}</h3>
                <p className="student-header-meta">Classe : {bulletin.student.class} • Département : {bulletin.student.department}</p>
                <p className="student-header-email">{bulletin.student.email}</p>
              </div>
            </div>

            {/* Pastille de validation finale LMD (Nike style) */}
            <div className="bulletin-verdict-block">
              <div className="verdict-data">
                <p className="verdict-label">Verdict Semestriel</p>
                <h2 className="verdict-status-title">{bulletin.summary.status}</h2>
              </div>
              <div className="verdict-badge-box">
                {bulletin.summary.totalCreditsAcquired >= 30 ? (
                  <div className="verdict-badge-circle success-circle">
                    <CheckCircle size={32} />
                  </div>
                ) : (
                  <div className="verdict-badge-circle danger-circle">
                    <XCircle size={32} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synthèse des crédits (Nike Grid) */}
          <div className="bulletin-stats-grid">
            <div className="kocc-card stat-card">
              <div className="stat-data">
                <p className="stat-label">Moyenne Générale</p>
                <h3 className="stat-value">{bulletin.summary.semesterAverage} / 20</h3>
                <p className="stat-subtext">Pondérée par coefficients</p>
              </div>
            </div>

            <div className="kocc-card stat-card">
              <div className="stat-data">
                <p className="stat-label">Crédits acquis</p>
                <h3 className="stat-value">{bulletin.summary.totalCreditsAcquired} / {bulletin.summary.totalCreditsAttempted}</h3>
                <p className="stat-subtext">Cible de validation : 30 crédits</p>
              </div>
            </div>
          </div>

          {/* Tableau détaillé des matières (UE) */}
          <div className="kocc-card table-container-card">
            <h3 className="card-section-title text-left mb-1-5">Détail des Unités d'Enseignement (UE)</h3>
            
            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th className="text-center">Coefficient</th>
                    <th className="text-center">Crédits</th>
                    <th className="text-center">Moy. Devoirs</th>
                    <th className="text-center">Moy. Examen</th>
                    <th className="text-center">Moy. Finale</th>
                    <th className="text-center">Statut</th>
                    <th className="text-center">Crédits Acquis</th>
                  </tr>
                </thead>
                <tbody>
                  {bulletin.courses.map((c) => (
                    <tr key={c.courseId} className="attendance-row">
                      <td className="text-left font-bold">
                        <div className="course-title-cell">
                          <BookOpen size={16} className="course-icon" />
                          <div>
                            <p className="course-fullname">{c.courseTitle}</p>
                            <p className="course-code-sub">{c.courseCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">{c.coefficient}</td>
                      <td className="text-center">{c.credits}</td>
                      <td className="text-center font-mono">{c.devoirAverage !== null ? `${c.devoirAverage}/20` : '-'}</td>
                      <td className="text-center font-mono">{c.examenAverage !== null ? `${c.examenAverage}/20` : '-'}</td>
                      <td className="text-center font-mono font-bold">{c.finalGrade}/20</td>
                      <td className="text-center">
                        <span className={`kocc-badge ${c.status === 'Validé' ? 'kocc-badge-success' : 'kocc-badge-danger'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-center font-bold font-mono">{c.creditsAcquired}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default LmdBulletin;
