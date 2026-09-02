import React, { useEffect, useState, useMemo } from 'react';
import API from '../services/api';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  ArrowLeft, 
  Search, 
  CheckSquare, 
  Sliders, 
  Download, 
  GraduationCap, 
  Hash, 
  Mail, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [taughtCourses, setTaughtCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');

  // Filtre et recherche dans la liste des étudiants de la classe
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 1. Charger les classes attribuées à l'enseignant
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get('/teacher/my-classes');
        setAssignedClasses(res.data || []);
      } catch (err) {
        console.error('Erreur chargement classes enseignant:', err);
        setError("Impossible de charger vos classes attribuées.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // 2. Sélectionner une classe et charger ses étudiants
  const handleSelectClass = async (cls) => {
    try {
      setLoadingStudents(true);
      setError('');
      setSelectedClass(cls);
      setSearchQuery('');
      setCurrentPage(1);

      const res = await API.get(`/teacher/my-classes/${cls.id}/students`);
      setClassStudents(res.data.students || []);
      setTaughtCourses(res.data.coursesTaught || []);
    } catch (err) {
      console.error('Erreur chargement étudiants de la classe:', err);
      setError("Impossible de charger les étudiants de cette classe.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Retour à la vue des classes
  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassStudents([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filtrage des étudiants
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const query = searchQuery.toLowerCase().trim();
    return classStudents.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matricule = (student.matricule || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      return fullName.includes(query) || matricule.includes(query) || email.includes(query);
    });
  }, [classStudents, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Export CSV de la classe
  const handleExportCSV = () => {
    if (!selectedClass || filteredStudents.length === 0) return;
    const headers = ['Matricule', 'Nom', 'Prenom', 'Email', 'Classe', 'Statut'];
    const rows = filteredStudents.map(s => [
      s.matricule || '',
      `"${s.lastName}"`,
      `"${s.firstName}"`,
      s.email,
      selectedClass.name,
      s.isActive ? 'Inscrit' : 'Inactif'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `etudiants_${selectedClass.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* VUE 1 : Liste des classes attribuées à l'enseignant */}
      {!selectedClass ? (
        <>
          <header className="dashboard-header">
            <div>
              <h1 className="welcome-title">Mes Classes Attribuées</h1>
              <p className="welcome-subtitle">
                Consultez les effectifs et la liste des étudiants des promotions qui vous sont officiellement affectées.
              </p>
            </div>
            <div className="role-tag-container">
              <span className="role-tag">Espace Enseignant</span>
            </div>
          </header>

          {error && (
            <div className="login-error-box">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <p className="loading-placeholder">Chargement de vos classes affectées...</p>
          ) : assignedClasses.length === 0 ? (
            <div className="kocc-card no-alerts-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 className="card-section-title">Aucune classe attribuée</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Vous n'avez actuellement aucune séance de cours planifiée dans l'emploi du temps. Contactez la direction pédagogique si cela est anormal.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {assignedClasses.map((cls) => (
                <div 
                  key={cls.id}
                  className="kocc-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    padding: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--border-light)'
                  }}
                  onClick={() => handleSelectClass(cls)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span className="kocc-badge kocc-badge-info" style={{ fontSize: '0.9rem', padding: '0.3rem 0.8rem', fontWeight: '800' }}>
                        Classe : {cls.name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={14} />
                        {cls.sessionCount} séances
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                      {cls.department}
                    </h3>

                    {/* Matières dispensées par ce professeur */}
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
                        Vos matières dans cette classe :
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {cls.courses.map((courseTitle, idx) => (
                          <span 
                            key={idx}
                            style={{ 
                              fontSize: '0.75rem', 
                              backgroundColor: 'var(--bg-primary)', 
                              border: '1px solid var(--border-light)', 
                              padding: '0.2rem 0.5rem',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {courseTitle}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={18} color="var(--accent-primary)" />
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{cls.studentCount}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>étudiants inscrits</span>
                    </div>

                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      Voir la liste <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (

        /* VUE 2 : Détail de la classe sélectionnée & liste de ses étudiants */
        <>
          {/* Barre de retour et En-tête */}
          <div>
            <button 
              onClick={handleBackToClasses}
              className="kocc-btn kocc-btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} />
              Retour à mes classes
            </button>

            <header className="dashboard-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h1 className="welcome-title" style={{ margin: 0 }}>
                    Classe : {selectedClass.name}
                  </h1>
                  <span className="kocc-badge kocc-badge-info" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                    {classStudents.length} étudiants inscrits
                  </span>
                </div>
                <p className="welcome-subtitle">
                  {selectedClass.department} • Matière(s) dispensée(s) : <strong>{taughtCourses.join(', ')}</strong>
                </p>
              </div>

              {/* Actions rapides relatives à cette classe */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button 
                  onClick={() => navigate('/attendance')} 
                  className="kocc-btn kocc-btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem' }}
                >
                  <CheckSquare size={16} />
                  Faire l'Appel
                </button>
                <button 
                  onClick={() => navigate('/grades')} 
                  className="kocc-btn kocc-btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem' }}
                >
                  <Sliders size={16} />
                  Saisir les Notes
                </button>
                <button 
                  onClick={handleExportCSV} 
                  className="kocc-btn kocc-btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem' }}
                  disabled={filteredStudents.length === 0}
                >
                  <Download size={16} />
                  Exporter CSV
                </button>
              </div>
            </header>
          </div>

          {/* Barre de recherche d'étudiant */}
          <div className="kocc-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search 
                size={18} 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                type="text"
                placeholder="Rechercher par prénom, nom, matricule ou e-mail..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="kocc-input"
                style={{ paddingLeft: '3rem', width: '100%' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>
                Affichage de <strong>{filteredStudents.length}</strong> étudiant(s) sur {classStudents.length}
              </span>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>

          {/* Tableau des étudiants de la classe */}
          {loadingStudents ? (
            <p className="loading-placeholder">Chargement de la liste des étudiants...</p>
          ) : filteredStudents.length === 0 ? (
            <div className="kocc-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p className="empty-placeholder">
                Aucun étudiant ne correspond à votre recherche dans la classe {selectedClass.name}.
              </p>
            </div>
          ) : (
            <div className="kocc-card table-container-card" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="attendance-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '170px' }}>Matricule</th>
                      <th>Nom & Prénom</th>
                      <th>Email Institutionnel</th>
                      <th className="text-center" style={{ width: '120px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (
                      <tr key={student.id}>
                        {/* Matricule permanent */}
                        <td>
                          <span 
                            style={{ 
                              fontFamily: 'monospace', 
                              fontSize: '0.8rem', 
                              padding: '0.2rem 0.5rem', 
                              backgroundColor: 'var(--bg-secondary)', 
                              border: '1px solid var(--border-light)',
                              letterSpacing: '0.5px',
                              fontWeight: '600'
                            }}
                          >
                            {student.matricule || 'N/A'}
                          </span>
                        </td>

                        {/* Nom & Prénom */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="avatar-placeholder" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        </td>

                        {/* Email institutionnel */}
                        <td>
                          <a 
                            href={`mailto:${student.email}`}
                            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                          >
                            <Mail size={14} color="var(--text-muted)" />
                            {student.email}
                          </a>
                        </td>

                        {/* Statut */}
                        <td className="text-center">
                          <span className={`kocc-badge ${student.isActive ? 'kocc-badge-success' : 'kocc-badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                            {student.isActive ? 'Inscrit' : 'Inactif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="kocc-btn kocc-btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      Précédent
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="kocc-btn kocc-btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
};

export default TeacherClasses;
