import React, { useEffect, useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import API from '../services/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileEdit, 
  CheckSquare, 
  ChevronRight,
  BookOpen,
  Filter
} from 'lucide-react';

const Timetable = () => {
  const navigate = useNav();
  const userJson = localStorage.getItem('kocc_user');
  
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
  const [summary, setSummary] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  if (!userJson) return null;
  const user = JSON.parse(userJson);
  const { role } = user;

  const isAdminOrDirection = role === 'admin' || role === 'direction' || role === 'responsable';

  useEffect(() => {
    const initTimetable = async () => {
      try {
        setLoading(true);
        if (role === 'teacher') {
          // Charger l'emploi du temps du prof
          const res = await API.get('/sessions/teacher');
          setSessions(res.data);
        } else if (role === 'student' && user.classId) {
          // Charger l'emploi du temps de la classe de l'élève
          const res = await API.get(`/sessions/class/${user.classId}`);
          setSessions(res.data);
        } else if (isAdminOrDirection) {
          // Charger la liste des classes pour le filtre
          const classesRes = await API.get('/classes');
          setClasses(classesRes.data);
          if (classesRes.data.length > 0) {
            setSelectedClassId(classesRes.data[0].id);
          }
        }
      } catch (err) {
        console.error("Erreur d'initialisation de l'emploi du temps :", err);
      } finally {
        setLoading(false);
      }
    };

    initTimetable();
  }, [role, user.classId]);

  // Recharger l'emploi du temps lorsqu'un administrateur/directeur change de classe
  useEffect(() => {
    if (isAdminOrDirection && selectedClassId) {
      const fetchClassSessions = async () => {
        try {
          setLoading(true);
          const res = await API.get(`/sessions/class/${selectedClassId}`);
          setSessions(res.data);
        } catch (err) {
          console.error("Erreur de récupération des séances de la classe :", err);
        } finally {
          setLoading(false);
        }
      };
      fetchClassSessions();
    }
  }, [selectedClassId, isAdminOrDirection]);

  const handleEditClick = (session) => {
    setEditingSession(session);
    setSummary(session.summaryOfSession || '');
  };

  const handleSaveSummary = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await API.put(`/sessions/${editingSession.id}`, { summaryOfSession: summary });
      
      // Mettre à jour l'état local
      setSessions(prev => prev.map(s => s.id === editingSession.id ? { ...s, summaryOfSession: summary } : s));
      setEditingSession(null);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du résumé de séance :", err);
    } finally {
      setEditLoading(false);
    }
  };

  // Grouper les séances par date
  const groupSessionsByDate = () => {
    const groups = {};
    sessions.forEach(session => {
      const dateKey = new Date(session.startTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(session);
    });
    return groups;
  };

  const groupedSessions = groupSessionsByDate();

  return (
    <div className="timetable-wrapper fade-in">
      {/* Header */}
      <header className="timetable-header">
        <div>
          <h1 className="welcome-title">Planning & Emploi du Temps</h1>
          <p className="welcome-subtitle">Consultez l'agenda des séances de cours et gérez vos appels.</p>
        </div>

        {/* Sélecteur de classe pour admin / direction */}
        {isAdminOrDirection && classes.length > 0 && (
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
        )}
      </header>

      {/* Chargement */}
      {loading ? (
        <p className="loading-placeholder">Chargement de l'emploi du temps...</p>
      ) : sessions.length === 0 ? (
        <p className="empty-placeholder">Aucun cours planifié pour le moment.</p>
      ) : (
        <div className="agenda-view">
          {Object.keys(groupedSessions).map((dateKey) => (
            <div key={dateKey} className="agenda-day-group">
              <h3 className="agenda-day-title">{dateKey}</h3>
              <div className="agenda-sessions-grid">
                {groupedSessions[dateKey].map((session) => {
                  const startTime = new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  const endTime = new Date(session.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={session.id} className="kocc-card session-card-item">
                      <div className="session-card-time-block">
                        <Clock size={16} />
                        <span>{startTime} - {endTime}</span>
                      </div>
                      
                      <div className="session-card-details">
                        <h4 className="session-card-course-title">{session.Course?.title}</h4>
                        <p className="session-card-code">{session.Course?.code} • {session.Course?.credits} crédits LMD</p>
                        
                        <div className="session-card-meta">
                          <span className="session-meta-tag">
                            <MapPin size={14} />
                            <span>{session.classroom}</span>
                          </span>
                          
                          {role !== 'student' && (
                            <span className="session-meta-tag">
                              <User size={14} />
                              <span>{session.Class?.name}</span>
                            </span>
                          )}
                          
                          {role === 'student' && session.teacher && (
                            <span className="session-meta-tag">
                              <User size={14} />
                              <span>M. {session.teacher.lastName}</span>
                            </span>
                          )}
                        </div>

                        {session.summaryOfSession && (
                          <div className="session-summary-box">
                            <p className="summary-label">Résumé de séance :</p>
                            <p className="summary-text">"{session.summaryOfSession}"</p>
                          </div>
                        )}
                      </div>

                      {/* Actions selon le rôle */}
                      {role === 'teacher' && (
                        <div className="session-card-actions">
                          <button
                            onClick={() => navigate(`/attendance?sessionId=${session.id}`)}
                            className="kocc-btn kocc-btn-primary action-btn"
                          >
                            <CheckSquare size={16} />
                            <span>Faire l'appel</span>
                          </button>
                          
                          <button
                            onClick={() => handleEditClick(session)}
                            className="kocc-btn kocc-btn-secondary action-btn"
                          >
                            <FileEdit size={16} />
                            <span>Cahier de texte</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Rédaction Résumé (Cahier de texte) */}
      {editingSession && (
        <div className="modal-overlay">
          <div className="kocc-card modal-card fade-in">
            <h3 className="card-section-title">Cahier de Texte - Résumé du cours</h3>
            <p className="modal-subtitle">{editingSession.Course?.title}</p>
            
            <form onSubmit={handleSaveSummary} className="modal-form">
              <div className="input-group">
                <label className="input-label" htmlFor="summary-textarea">Résumé des notions abordées</label>
                <textarea
                  id="summary-textarea"
                  rows="5"
                  className="kocc-input text-area-input"
                  placeholder="Ex: Initiation à Sequelize, définition du modèle User et relations hasMany/belongsTo..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="kocc-btn kocc-btn-secondary"
                  disabled={editLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="kocc-btn kocc-btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? "Enregistrement..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
