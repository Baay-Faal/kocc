import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('kocc_user');
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!userJson) return null;
  const user = JSON.parse(userJson);
  const { role, firstName, lastName } = user;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Charger les séances récentes
        if (role === 'teacher') {
          const response = await API.get('/sessions/teacher');
          setRecentSessions(response.data.slice(0, 3));
        } else if (role === 'student' && user.classId) {
          const response = await API.get(`/sessions/class/${user.classId}`);
          setRecentSessions(response.data.slice(0, 3));
          
          // Charger le taux d'assiduité de l'étudiant
          const statsResponse = await API.get(`/attendance/stats/student/${user.id}`);
          setStats(statsResponse.data);
        } else if (role === 'direction' || role === 'responsable' || role === 'admin') {
          // Pour l'administration, on peut charger les alertes de décrochage
          const alertsResponse = await API.get('/mbene/alertes');
          setStats({ atRiskCount: alertsResponse.data.atRiskStudents?.length || 0 });
        }
      } catch (err) {
        console.error("Erreur de chargement du dashboard :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role, user.id, user.classId]);

  const getGreetingMessage = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Bonjour";
    if (hours < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="dashboard-container fade-in">
      {/* Header Accueil */}
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-title">{getGreetingMessage()}, {firstName} !</h1>
          <p className="welcome-subtitle">
            Ravi de vous revoir. Voici un aperçu de vos activités à ISI SUPTECH.
          </p>
        </div>
        <div className="role-tag-container">
          <span className="role-tag">{role}</span>
        </div>
      </header>

      {/* Rendu dynamique des statistiques selon le rôle */}
      <section className="stats-grid">
        {role === 'student' && stats && (
          <>
            <div className="kocc-card stat-card">
              <div className="stat-icon-wrapper progress-blue">
                <TrendingUp size={24} />
              </div>
              <div className="stat-data">
                <p className="stat-label">Taux d'Assiduité</p>
                <h3 className="stat-value">{stats.attendanceRate}%</h3>
                <span className={`kocc-badge ${stats.attendanceRate >= 70 ? 'kocc-badge-success' : 'kocc-badge-danger'}`}>
                  {stats.attendanceRate >= 70 ? 'Satisfaisant' : 'Alerte Décrochage'}
                </span>
              </div>
            </div>
            
            <div className="kocc-card stat-card">
              <div className="stat-icon-wrapper progress-warning">
                <Clock size={24} />
              </div>
              <div className="stat-data">
                <p className="stat-label">Absences / Retards</p>
                <h3 className="stat-value">{stats.stats?.absent || 0} Abs. / {stats.stats?.late || 0} Ret.</h3>
                <p className="stat-subtext">Total séances : {stats.stats?.total || 0}</p>
              </div>
            </div>
          </>
        )}

        {role === 'teacher' && (
          <>
            <div className="kocc-card stat-card">
              <div className="stat-icon-wrapper progress-blue">
                <BookOpen size={24} />
              </div>
              <div className="stat-data">
                <p className="stat-label">Séances à animer</p>
                <h3 className="stat-value">{recentSessions.length}</h3>
                <p className="stat-subtext">Cette semaine</p>
              </div>
            </div>
          </>
        )}

        {(role === 'direction' || role === 'responsable') && stats && (
          <>
            <div className="kocc-card stat-card">
              <div className="stat-icon-wrapper progress-danger">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-data">
                <p className="stat-label">Élèves en décrochage</p>
                <h3 className="stat-value">{stats.atRiskCount}</h3>
                <span className="kocc-badge kocc-badge-danger">Détectés par IA</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Corps Principal */}
      <div className="dashboard-grid">
        {/* Colonne gauche : Séances récentes / Emploi du temps */}
        <div className="kocc-card column-card">
          <div className="column-card-header">
            <h3 className="card-section-title">Prochaines Séances</h3>
            <button onClick={() => navigate('/timetable')} className="kocc-btn kocc-btn-secondary icon-btn">
              <span>Voir tout</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <p className="loading-placeholder">Chargement des séances...</p>
          ) : recentSessions.length === 0 ? (
            <p className="empty-placeholder">Aucune séance programmée.</p>
          ) : (
            <div className="session-list">
              {recentSessions.map((session, idx) => (
                <div key={session.id || idx} className="session-item">
                  <div className="session-time">
                    <Calendar size={16} />
                    <span>{new Date(session.startTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="divider">•</span>
                    <Clock size={16} />
                    <span>{new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="session-title">{session.Course?.title || "Séance de cours"}</h4>
                  <div className="session-meta">
                    <span className="session-room">{session.classroom}</span>
                    <span className="session-class">{session.Class?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite : Raccourcis ou Assistant IA MBENE */}
        <div className="kocc-card column-card highlight-card">
          <div className="highlight-header">
            <Sparkles className="sparkle-icon" size={24} />
            <h3 className="card-section-title text-white">Assistant IA MBENE</h3>
          </div>
          
          {role === 'student' ? (
            <div className="highlight-content">
              <p className="highlight-text">
                Besoin d'aide pour réviser un cours ? Posez vos questions à MBENE. Notre assistant virtuel génère des résumés et des explications basés exactement sur les résumés saisis par vos professeurs.
              </p>
              <button onClick={() => navigate('/tutor')} className="kocc-btn kocc-btn-primary full-width-btn">
                <span>Discuter avec mon tuteur</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : role === 'teacher' ? (
            <div className="highlight-content">
              <p className="highlight-text">
                Obtenez des suggestions pédagogiques et de rappel de cours basées sur les retours d'absences et les concepts du dernier cours avant de démarrer votre séance.
              </p>
              <button onClick={() => navigate('/timetable')} className="kocc-btn kocc-btn-primary full-width-btn">
                <span>Consulter mes matières</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="highlight-content">
              <p className="highlight-text">
                Consultez le rapport d'assiduité intelligent pour identifier les élèves en situation de décrochage scolaire et obtenir des propositions de remédiation automatisées.
              </p>
              <button onClick={() => navigate('/alerts')} className="kocc-btn kocc-btn-primary full-width-btn">
                <span>Voir les alertes IA</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
