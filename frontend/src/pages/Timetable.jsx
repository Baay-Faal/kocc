import React, { useEffect, useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import API from '../services/api';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  FileEdit, 
  CheckSquare, 
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

import { getUser } from '../services/auth';

const Timetable = () => {
  const navigate = useNav();
  const user = getUser();
  
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
  const [summary, setSummary] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Semaine de navigation
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = Semaine en cours, -1 = Précédente, +1 = Suivante

  if (!user) return null;
  const { role } = user;

  const isAdminOrDirection = role === 'admin' || role === 'direction' || role === 'responsable';

  // Récupérer le début et fin de la semaine ciblée (Lundi à Samedi)
  const getWeekRange = (offset) => {
    const today = new Date();
    const day = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    
    // Calculer le décalage pour obtenir le Lundi de cette semaine
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    
    const startOfWeek = new Date(today.setDate(diffToMonday + offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5); // Samedi
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekRange(currentWeekOffset);

  // Charger les données initiales
  useEffect(() => {
    const initTimetable = async () => {
      try {
        setLoading(true);
        if (role === 'teacher') {
          const res = await API.get('/sessions/teacher');
          setSessions(res.data);
        } else if (role === 'student' && user.classId) {
          const res = await API.get(`/sessions/class/${user.classId}`);
          setSessions(res.data);
        } else if (isAdminOrDirection) {
          const classesRes = await API.get('/classes');
          setClasses(classesRes.data);
          if (classesRes.data.length > 0) {
            setSelectedClassId(classesRes.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initTimetable();
  }, [role, user.classId]);

  // Charger les cours d'une classe spécifique
  useEffect(() => {
    if (isAdminOrDirection && selectedClassId) {
      const fetchClassSessions = async () => {
        try {
          setLoading(true);
          const res = await API.get(`/sessions/class/${selectedClassId}`);
          setSessions(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchClassSessions();
    }
  }, [selectedClassId, isAdminOrDirection]);

  // Enregistrer résumé
  const handleSaveSummary = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await API.put(`/sessions/${editingSession.id}`, { summaryOfSession: summary });
      setSessions(prev => prev.map(s => s.id === editingSession.id ? { ...s, summaryOfSession: summary } : s));
      setEditingSession(null);
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  // Liste des jours de la semaine (Lundi à Samedi)
  const weekdays = [
    { label: 'Lundi', value: 1 },
    { label: 'Mardi', value: 2 },
    { label: 'Mercredi', value: 3 },
    { label: 'Jeudi', value: 4 },
    { label: 'Vendredi', value: 5 },
    { label: 'Samedi', value: 6 }
  ];

  // Créneaux horaires standards ISI
  const timeSlots = [
    { label: '08h00 - 10h00', startHour: 8, endHour: 10 },
    { label: '10h00 - 12h00', startHour: 10, endHour: 12 },
    { label: '12h00 - 14h00', startHour: 12, endHour: 14 },
    { label: '14h00 - 16h00', startHour: 14, endHour: 16 },
    { label: '16h00 - 18h00', startHour: 16, endHour: 18 }
  ];

  // Filtrer les séances qui tombent dans la semaine courante
  const currentWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
  });

  // Trouver une séance pour un jour et un créneau donné
  const getSessionForSlot = (dayValue, startHour) => {
    return currentWeekSessions.find(session => {
      const sessionDate = new Date(session.startTime);
      const sessionDay = sessionDate.getDay();
      const sessionHour = sessionDate.getHours();
      return sessionDay === dayValue && sessionHour === startHour;
    });
  };

  return (
    <div className="timetable-wrapper fade-in">
      {/* Header */}
      <header className="timetable-header">
        <div>
          <h1 className="welcome-title">Planning Hebdomadaire</h1>
          <p className="welcome-subtitle">
            Emploi du temps du <strong>{startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</strong> au <strong>{endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
          </p>
        </div>

        <div className="bulletin-filters">
          {/* Navigation semaine */}
          <div className="class-filter" style={{ padding: '0.25rem' }}>
            <button 
              onClick={() => setCurrentWeekOffset(prev => prev - 1)} 
              className="kocc-btn kocc-btn-secondary" 
              style={{ padding: '0.5rem', border: 'none' }}
              title="Semaine précédente"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', padding: '0 0.5rem' }}>
              {currentWeekOffset === 0 ? "Semaine en cours" : `Semaine ${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset}`}
            </span>
            <button 
              onClick={() => setCurrentWeekOffset(prev => prev + 1)} 
              className="kocc-btn kocc-btn-secondary" 
              style={{ padding: '0.5rem', border: 'none' }}
              title="Semaine suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Filtre classe Administration */}
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
        </div>
      </header>

      {/* Grille Hebdomadaire sous forme de tableau (Nike style) */}
      {loading ? (
        <p className="loading-placeholder">Mise à jour de l'emploi du temps...</p>
      ) : (
        <div className="kocc-card table-container-card" style={{ padding: '0px' }}>
          <div className="table-responsive">
            <table className="attendance-table" style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ width: '120px', borderRight: '1px solid var(--border-light)' }}>Créneau</th>
                  {weekdays.map(day => (
                    <th key={day.value} className="text-center" style={{ width: '14.28%', borderRight: '1px solid var(--border-light)' }}>
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.label}>
                    {/* Colonne heure */}
                    <td className="text-center font-bold" style={{ verticalAlign: 'middle', borderRight: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} className="text-muted" />
                        <span>{slot.label}</span>
                      </div>
                    </td>

                    {/* Cellules des jours */}
                    {weekdays.map(day => {
                      const session = getSessionForSlot(day.value, slot.startHour);
                      
                      return (
                        <td 
                          key={day.value} 
                          style={{ 
                            borderRight: '1px solid var(--border-light)', 
                            borderBottom: '1px solid var(--border-light)',
                            verticalAlign: 'top',
                            height: '140px',
                            padding: '0.75rem',
                            backgroundColor: session ? 'var(--bg-secondary)' : 'transparent'
                          }}
                        >
                          {session ? (
                            <div className="grid-session-card fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', textAlign: 'left' }}>
                              <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: '120%' }}>
                                  {session.Course?.title}
                                </h4>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
                                  {session.Course?.code} • {session.Course?.credits} creds
                                </p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    <MapPin size={10} className="text-muted" />
                                    <span>{session.classroom}</span>
                                  </span>
                                  
                                  {role === 'student' && session.teacher && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                      <User size={10} className="text-muted" />
                                      <span>M. {session.teacher.lastName}</span>
                                    </span>
                                  )}

                                  {role !== 'student' && session.Class && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                      <User size={10} className="text-muted" />
                                      <span>Classe: {session.Class.name}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions enseignant dans la cellule */}
                              {role === 'teacher' && (
                                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.75rem' }}>
                                  <button
                                    onClick={() => navigate(`/attendance?sessionId=${session.id}`)}
                                    className="kocc-btn kocc-btn-primary"
                                    style={{ padding: '0.35rem', flex: 1 }}
                                    title="Faire l'appel"
                                  >
                                    <CheckSquare size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingSession(session);
                                      setSummary(session.summaryOfSession || '');
                                    }}
                                    className="kocc-btn kocc-btn-secondary"
                                    style={{ padding: '0.35rem', flex: 1 }}
                                    title="Cahier de texte"
                                  >
                                    <FileEdit size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.03)' }}>Vide</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
