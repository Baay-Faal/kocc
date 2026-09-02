import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  AlertTriangle, 
  Sparkles, 
  UserX, 
  TrendingDown, 
  Mail, 
  FileText, 
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  GraduationCap,
  Hash,
  Activity,
  Users,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AlertsView = () => {
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Icônes SVG pour chaque étape d'action recommandée
  const stepIcons = [
    <AlertCircle key="icon-1" size={16} color="var(--danger)" />,
    <FileText key="icon-2" size={16} color="var(--warning)" />,
    <Users key="icon-3" size={16} color="var(--info)" />
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get('/mbene/alertes');
        
        const students = res.data.atRiskStudents || [];
        setAtRiskStudents(students);
        
        // Sélectionner automatiquement le 1er étudiant par défaut
        if (students.length > 0) {
          setSelectedStudent(students[0]);
        }
      } catch (err) {
        console.error("Erreur de chargement des alertes :", err);
        setError("Impossible de charger les données d'alerte et de remédiation.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="alerts-wrapper fade-in">
      {/* Header */}
      <header className="alerts-header">
        <div>
          <h1 className="welcome-title">Vigilance & Prévention du Décrochage</h1>
          <p className="welcome-subtitle">
            Diagnostic individuel et plans d'actions de remédiation formulés par l'IA MBENE.
          </p>
        </div>
        <div className="role-tag-container">
          <span className="role-tag tag-red">Seuil Critique : &lt; 70%</span>
        </div>
      </header>

      {error && (
        <div className="login-error-box">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="loading-placeholder">Analyse de l'assiduité par MBENE...</p>
      ) : atRiskStudents.length === 0 ? (
        <div className="kocc-card no-alerts-card">
          <CheckCircle className="check-success-icon" size={48} />
          <h3 className="card-section-title mt-1">Excellente Assiduité Globale</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Tous les étudiants inscrits présentent un taux d'assiduité satisfaisant (supérieur à 70%).
          </p>
        </div>
      ) : (
        <div className="alerts-grid" style={{ gridTemplateColumns: '1fr 1.4fr', alignItems: 'start', gap: '2rem' }}>
          
          {/* Colonne Gauche : Liste des étudiants ciblés */}
          <div className="alerts-column-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-section-title" style={{ margin: 0 }}>
                Étudiants en Alerte ({atRiskStudents.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sélectionnez un profil
              </span>
            </div>
            
            <div className="student-alert-cards" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {atRiskStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <div 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className={`kocc-card alert-student-card ${isSelected ? 'active-selected' : ''}`}
                    style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div className="alert-card-header" style={{ gap: '1rem' }}>
                      <div className="alert-avatar" style={{ borderRadius: '2px' }}>
                        <UserX size={18} />
                      </div>
                      <div className="alert-student-details text-left">
                        <h4 className="alert-student-fullname" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {student.firstName} {student.lastName}
                          {isSelected && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <CheckCircle2 size={11} /> ACTIF
                            </span>
                          )}
                        </h4>
                        <p className="alert-student-meta" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span className="kocc-badge kocc-badge-info" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <GraduationCap size={11} />
                            {student.className}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Hash size={11} />
                            {student.matricule}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="alert-card-rate-block" style={{ textAlign: 'right' }}>
                        <span className={`kocc-badge ${student.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                          {student.severityLabel}
                        </span>
                        <h3 className="alert-rate-value" style={{ fontSize: '1.3rem', marginTop: '0.2rem' }}>
                          {student.attendanceRate}%
                        </h3>
                      </div>
                      <ChevronRight size={18} color={isSelected ? 'var(--text-primary)' : 'var(--text-muted)'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonne Droite : Dossier de Remédiation IA MBENE dédié à l'étudiant sélectionné */}
          {selectedStudent && (
            <div className="kocc-card ai-recommendations-card">
              
              {/* Entête du Dossier de l'élève */}
              <div className="dossier-header-box">
                <div className="dossier-student-info">
                  <div className="dossier-avatar">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </div>
                  <div>
                    <h3 className="dossier-student-name">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h3>
                    <div className="dossier-student-meta">
                      <span className="kocc-badge kocc-badge-info" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <GraduationCap size={13} />
                        Classe : {selectedStudent.className}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Hash size={13} />
                        Matricule : <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedStudent.matricule}</strong>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={13} />
                        {selectedStudent.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                  <span className={`kocc-badge ${selectedStudent.badgeClass}`}>
                    {selectedStudent.severityLabel}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Assiduité constatée : <strong style={{ color: 'var(--danger)' }}>{selectedStudent.attendanceRate}%</strong>
                  </span>
                </div>
              </div>

              {/* Section 1 : Diagnostic IA MBENE */}
              <div className="dossier-diag-box">
                <div className="dossier-diag-header">
                  <Activity size={16} />
                  <span>Diagnostic de Situation • MBENE IA</span>
                </div>
                <p className="dossier-diag-text">
                  {selectedStudent.diagnosis}
                </p>
              </div>

              {/* Section 2 : Plan d'actions de remédiation */}
              <div>
                <h4 className="dossier-actions-title">
                  <ShieldAlert size={16} color="var(--accent-primary)" />
                  Plan d'Action Pédagogique Recommandé
                </h4>
                
                <div className="dossier-steps-list">
                  {selectedStudent.recommendations && selectedStudent.recommendations.map((rec, index) => (
                    <div key={index} className="dossier-step-card">
                      <div className="dossier-step-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                        {stepIcons[index % stepIcons.length]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                          Action Prioritaire {index + 1}
                        </span>
                        <p className="dossier-step-content">
                          {rec}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3 : Actions administratives rapides */}
              <div className="dossier-footer-actions">
                <a 
                  href={`mailto:${selectedStudent.email}?subject=${encodeURIComponent(`[ISI SUPTECH] Convocation d'assiduité - ${selectedStudent.firstName} ${selectedStudent.lastName} (${selectedStudent.matricule})`)}&body=${encodeURIComponent(`Bonjour ${selectedStudent.firstName} ${selectedStudent.lastName},\n\nVotre taux de présence actuel (${selectedStudent.attendanceRate}%) est passé sous le seuil critique fixé par l'institut.\n\nVous êtes convoqué à un entretien pédagogique afin de faire le point sur votre assiduité et vos enseignements.\n\nCordialement,\nLa Direction Pédagogique - ISI SUPTECH`)}`}
                  className="kocc-btn kocc-btn-primary"
                  style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.75rem 1.25rem' }}
                >
                  <Mail size={16} />
                  Convoquer par Email
                </a>

                <Link 
                  to="/bulletin" 
                  className="kocc-btn kocc-btn-secondary"
                  style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.75rem 1.25rem' }}
                >
                  <FileText size={16} />
                  Consulter le Bulletin LMD
                  <ArrowUpRight size={14} />
                </Link>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AlertsView;
