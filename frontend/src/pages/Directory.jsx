import React, { useEffect, useState, useMemo } from 'react';
import API from '../services/api';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Filter, 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  BadgeCheck, 
  BookOpen, 
  RefreshCw 
} from 'lucide-react';

const Directory = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'teachers'
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Charger les données depuis le backend
  const loadDirectoryData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, classesRes] = await Promise.all([
        API.get('/users'),
        API.get('/classes')
      ]);
      setUsers(usersRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger l'annuaire des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectoryData();
  }, []);

  // Réinitialiser la page courante quand on change d'onglet ou de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedClassId, selectedSpecialty]);

  // Séparation étudiants / professeurs
  const allStudents = useMemo(() => users.filter(u => u.role === 'student'), [users]);
  const allTeachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users]);

  // Liste unique des spécialités pour le filtre des profs
  const availableSpecialties = useMemo(() => {
    const specs = new Set();
    allTeachers.forEach(t => {
      if (t.specialty) specs.add(t.specialty);
    });
    return Array.from(specs).sort();
  }, [allTeachers]);

  // Filtrage des Étudiants
  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      // Filtre par classe
      if (selectedClassId !== 'all') {
        if (String(student.classId) !== String(selectedClassId)) {
          return false;
        }
      }

      // Filtre par barre de recherche (Matricule, Nom, Prénom, Email)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matriculeMatch = student.matricule ? student.matricule.toLowerCase().includes(query) : false;
        const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(query);
        const emailMatch = student.email.toLowerCase().includes(query);
        const className = student.class ? student.class.name.toLowerCase() : '';
        const classMatch = className.includes(query);

        if (!matriculeMatch && !nameMatch && !emailMatch && !classMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allStudents, selectedClassId, searchQuery]);

  // Filtrage des Professeurs
  const filteredTeachers = useMemo(() => {
    return allTeachers.filter(teacher => {
      // Filtre par spécialité
      if (selectedSpecialty !== 'all') {
        if (teacher.specialty !== selectedSpecialty) {
          return false;
        }
      }

      // Filtre par barre de recherche (Nom, Prénom, Email, Spécialité)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(query);
        const emailMatch = teacher.email.toLowerCase().includes(query);
        const specialtyMatch = teacher.specialty ? teacher.specialty.toLowerCase().includes(query) : false;

        if (!nameMatch && !emailMatch && !specialtyMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allTeachers, selectedSpecialty, searchQuery]);

  // Pagination sur la liste active
  const currentList = activeTab === 'students' ? filteredStudents : filteredTeachers;
  const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentList.slice(start, start + itemsPerPage);
  }, [currentList, currentPage, itemsPerPage]);

  // Réinitialisation des filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClassId('all');
    setSelectedSpecialty('all');
    setCurrentPage(1);
  };

  // Export CSV de la liste filtrée
  const handleExportCSV = () => {
    if (currentList.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === 'students') {
      csvContent += "Matricule,Nom,Prenom,Classe,Email,Statut\n";
      filteredStudents.forEach(s => {
        const cName = s.class ? s.class.name : '';
        csvContent += `"${s.matricule || ''}","${s.lastName}","${s.firstName}","${cName}","${s.email}","Actif"\n`;
      });
    } else {
      csvContent += "Nom,Prenom,Specialite,Email,Statut\n";
      filteredTeachers.forEach(t => {
        csvContent += `"${t.lastName}","${t.firstName}","${t.specialty || ''}","${t.email}","Actif"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kocc_${activeTab}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="timetable-wrapper fade-in">
      
      {/* En-tête de la page */}
      <header className="timetable-header">
        <div>
          <h1 className="welcome-title">Annuaire Scolaire & Académique</h1>
          <p className="welcome-subtitle">
            Consultez, filtrez et recherchez facilement les étudiants et le corps professoral d'ISI SUPTECH.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={loadDirectoryData} 
            className="kocc-btn kocc-btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem' }}
            title="Rafraîchir les données"
          >
            <RefreshCw size={16} />
            <span>Actualiser</span>
          </button>
          <button 
            onClick={handleExportCSV} 
            className="kocc-btn kocc-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem' }}
            title="Exporter la sélection en CSV"
          >
            <Download size={16} />
            <span>Exporter CSV</span>
          </button>
        </div>
      </header>

      {/* Barre de navigation des onglets */}
      <div className="bulletin-filters" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', width: '100%', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('students')}
          className={`sidebar-nav-item ${activeTab === 'students' ? 'active' : ''}`}
          style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
        >
          <GraduationCap size={18} />
          <span>Liste des Étudiants</span>
          <span className="kocc-badge kocc-badge-info" style={{ marginLeft: '0.5rem' }}>
            {allStudents.length}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('teachers')}
          className={`sidebar-nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
          style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
        >
          <Users size={18} />
          <span>Corps Professoral</span>
          <span className="kocc-badge kocc-badge-info" style={{ marginLeft: '0.5rem' }}>
            {allTeachers.length}
          </span>
        </button>
      </div>

      {/* Barre de recherche et de filtrage */}
      <div className="kocc-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Barre de recherche avec icône */}
          <div style={{ flex: '1 1 320px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="kocc-input"
              style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.5rem' : '1rem', width: '100%' }}
              placeholder={activeTab === 'students' 
                ? "Rechercher par matricule, nom, prénom, email..." 
                : "Rechercher par nom, prénom, spécialité, email..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                title="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filtre par classe (si onglet Étudiants) */}
          {activeTab === 'students' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
              <Filter size={18} className="filter-icon" />
              <select
                className="kocc-input filter-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="all">Toutes les classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Classe : {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtre par spécialité (si onglet Professeurs) */}
          {activeTab === 'teachers' && availableSpecialties.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '240px' }}>
              <Filter size={18} className="filter-icon" />
              <select
                className="kocc-input filter-select"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="all">Toutes les spécialités</option>
                {availableSpecialties.map((spec, i) => (
                  <option key={i} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          )}

          {/* Bouton Réinitialiser si un filtre est actif */}
          {(searchQuery || selectedClassId !== 'all' || selectedSpecialty !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="kocc-btn kocc-btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
            >
              <X size={14} />
              <span>Réinitialiser</span>
            </button>
          )}

        </div>

        {/* Ligne d'état du filtrage en temps réel */}
        <div style={{ marginTop: '0.9rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>
            Affichage de <strong>{currentList.length}</strong> {activeTab === 'students' ? 'étudiant(s)' : 'enseignant(s)'}
            {activeTab === 'students' && selectedClassId !== 'all' && (
              <> pour la classe <strong>{classes.find(c => String(c.id) === String(selectedClassId))?.name || selectedClassId}</strong></>
            )}
            {searchQuery && <> correspondant à « <strong>{searchQuery}</strong> »</>}
          </span>

          {currentList.length > 0 && (
            <span>
              Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong> (Lignes {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, currentList.length)})
            </span>
          )}
        </div>
      </div>

      {/* Rendu du Tableau des résultats */}
      {loading ? (
        <div className="kocc-card text-center" style={{ padding: '3rem' }}>
          <p className="loading-placeholder">Chargement de l'annuaire en cours...</p>
        </div>
      ) : error ? (
        <div className="login-error-box">
          <span>{error}</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="kocc-card text-center" style={{ padding: '3rem' }}>
          <p className="empty-placeholder" style={{ marginBottom: '1rem' }}>
            Aucun {activeTab === 'students' ? 'étudiant' : 'enseignant'} ne correspond à vos critères de recherche.
          </p>
          <button onClick={handleResetFilters} className="kocc-btn kocc-btn-outline">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="kocc-card table-container-card">
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                {activeTab === 'students' ? (
                  <tr>
                    <th style={{ width: '170px' }}>Matricule</th>
                    <th>Nom & Prénom</th>
                    <th className="text-center" style={{ width: '110px' }}>Classe</th>
                    <th>Email Institutionnel</th>
                    <th className="text-center" style={{ width: '100px' }}>Statut</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Enseignant</th>
                    <th>Spécialité Académique</th>
                    <th>Email Professionnel</th>
                    <th className="text-center" style={{ width: '100px' }}>Statut</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeTab === 'students' ? (
                  paginatedList.map((student) => (
                    <tr key={student.id}>
                      {/* Matricule permanent */}
                      <td>
                        <span 
                          className="kocc-badge"
                          style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.85rem', 
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
                          <span style={{ fontWeight: '500' }}>
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Classe */}
                      <td className="text-center">
                        <span className="kocc-badge kocc-badge-info" style={{ fontWeight: '600' }}>
                          {student.class ? student.class.name : 'Non affecté'}
                        </span>
                      </td>

                      {/* Email */}
                      <td>
                        <a 
                          href={`mailto:${student.email}`} 
                          style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                          title="Envoyer un email"
                        >
                          <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span>{student.email}</span>
                        </a>
                      </td>

                      {/* Statut */}
                      <td className="text-center">
                        <span className="kocc-badge kocc-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <BadgeCheck size={12} />
                          <span>Inscrit</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  paginatedList.map((teacher) => (
                    <tr key={teacher.id}>
                      {/* Enseignant */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="avatar-placeholder" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                            {teacher.firstName[0]}{teacher.lastName[0]}
                          </div>
                          <span style={{ fontWeight: '500' }}>
                            {teacher.firstName} {teacher.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Spécialité */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <BookOpen size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
                            {teacher.specialty || 'Enseignant général'}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <a 
                          href={`mailto:${teacher.email}`} 
                          style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                          title="Envoyer un email"
                        >
                          <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span>{teacher.email}</span>
                        </a>
                      </td>

                      {/* Statut */}
                      <td className="text-center">
                        <span className="kocc-badge kocc-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <BadgeCheck size={12} />
                          <span>Actif</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Contrôles de Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="kocc-btn kocc-btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem' }}
              >
                <ChevronLeft size={16} />
                <span>Précédent</span>
              </button>

              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Afficher les pages proches de la page courante
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && <span style={{ padding: '0 0.3rem', color: 'var(--text-secondary)' }}>...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`kocc-btn ${currentPage === page ? 'kocc-btn-primary' : 'kocc-btn-outline'}`}
                          style={{ minWidth: '34px', height: '34px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="kocc-btn kocc-btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem' }}
              >
                <span>Suivant</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Directory;
