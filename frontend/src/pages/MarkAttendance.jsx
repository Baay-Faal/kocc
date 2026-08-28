import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle, 
  Save, 
  UserCheck 
} from 'lucide-react';

const MarkAttendance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: { status, justification } }
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!sessionId) {
      setMessage({ type: 'danger', text: "Aucune séance de cours n'a été spécifiée pour faire l'appel." });
      setLoading(false);
      return;
    }

    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // 1. Récupérer toutes les séances du prof pour trouver celle demandée
        const sessionsRes = await API.get('/sessions/teacher');
        const currentSession = sessionsRes.data.find(s => s.id === parseInt(sessionId, 10));

        if (!currentSession) {
          setMessage({ type: 'danger', text: "Séance de cours introuvable ou vous n'y êtes pas affecté." });
          return;
        }
        setSession(currentSession);

        // 2. Charger les étudiants inscrits dans la classe de cette séance
        const studentsRes = await API.get(`/classes/${currentSession.classId}/students`);
        setStudents(studentsRes.data);

        // 3. Initialiser les enregistrements de présences par défaut à 'present'
        const initialRecords = {};
        studentsRes.data.forEach(student => {
          initialRecords[student.id] = {
            status: 'present',
            justification: ''
          };
        });

        // Optionnel: Charger les présences existantes si l'appel a déjà été fait
        // (Le backend retournera les présences si on implémente un GET, sinon on démarre à 'present' par défaut)
        setAttendanceRecords(initialRecords);

      } catch (err) {
        console.error("Erreur lors de la récupération des données d'appel :", err);
        setMessage({ type: 'danger', text: "Erreur lors du chargement de la liste des étudiants." });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [sessionId]);

  // Changer le statut d'un étudiant
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Modifier la justification
  const handleJustificationChange = (studentId, justification) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        justification
      }
    }));
  };

  // Bouton rapide : Tout le monde présent
  const handleMarkAllPresent = () => {
    setAttendanceRecords(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(studentId => {
        updated[studentId] = {
          ...updated[studentId],
          status: 'present'
        };
      });
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const recordsPayload = Object.keys(attendanceRecords).map(studentId => ({
        studentId: parseInt(studentId, 10),
        status: attendanceRecords[studentId].status,
        justification: attendanceRecords[studentId].justification
      }));

      await API.post('/attendance', {
        sessionId: parseInt(sessionId, 10),
        records: recordsPayload
      });

      setMessage({ type: 'success', text: "Feuille d'appel enregistrée avec succès. Notifications e-mails envoyées." });
      
      // Retour à l'emploi du temps après 1.5 secondes
      setTimeout(() => {
        navigate('/timetable');
      }, 1500);

    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: "Erreur lors de la sauvegarde de la feuille d'appel." });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="attendance-wrapper fade-in">
      {/* Header */}
      <header className="attendance-page-header">
        <button onClick={() => navigate('/timetable')} className="kocc-btn kocc-btn-secondary back-btn">
          <ArrowLeft size={16} />
          <span>Retour</span>
        </button>
        {session && (
          <div className="attendance-session-info text-left">
            <h1 className="welcome-title">Appel Numérique</h1>
            <p className="welcome-subtitle">
              Matière : <strong>{session.Course?.title}</strong> ({session.Class?.name}) • Salle : {session.classroom}
            </p>
          </div>
        )}
      </header>

      {message.text && (
        <div className={`login-error-box ${message.type === 'success' ? 'success-box' : ''}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <p className="loading-placeholder">Chargement de la feuille d'appel...</p>
      ) : students.length === 0 ? (
        <p className="empty-placeholder">Aucun étudiant inscrit dans cette classe.</p>
      ) : (
        <form onSubmit={handleSubmit} className="attendance-form-container">
          
          {/* Actions rapides */}
          <div className="attendance-actions-bar">
            <button 
              type="button" 
              onClick={handleMarkAllPresent}
              className="kocc-btn kocc-btn-secondary quick-action-btn"
            >
              <UserCheck size={16} />
              <span>Tout le monde présent</span>
            </button>
          </div>

          {/* Tableau d'appel */}
          <div className="attendance-table-card kocc-card">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th className="text-center">Présent</th>
                  <th className="text-center">En retard</th>
                  <th className="text-center">Absent</th>
                  <th className="text-center">Excusé</th>
                  <th>Justification (Optionnel)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const record = attendanceRecords[student.id] || { status: 'present', justification: '' };
                  
                  return (
                    <tr key={student.id} className="attendance-row">
                      <td className="student-cell">
                        <div className="student-avatar">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div className="student-name-block">
                          <p className="student-fullname">{student.firstName} {student.lastName}</p>
                          <p className="student-email">{student.email}</p>
                        </div>
                      </td>

                      {/* Options radio discrètes et plates */}
                      <td className="text-center option-cell">
                        <label className={`radio-label ${record.status === 'present' ? 'status-present' : ''}`}>
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            checked={record.status === 'present'}
                            onChange={() => handleStatusChange(student.id, 'present')}
                            className="hidden-radio"
                          />
                          <span className="status-indicator-box">
                            <Check size={14} />
                          </span>
                        </label>
                      </td>

                      <td className="text-center option-cell">
                        <label className={`radio-label ${record.status === 'late' ? 'status-late' : ''}`}>
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            checked={record.status === 'late'}
                            onChange={() => handleStatusChange(student.id, 'late')}
                            className="hidden-radio"
                          />
                          <span className="status-indicator-box">
                            <Clock size={14} />
                          </span>
                        </label>
                      </td>

                      <td className="text-center option-cell">
                        <label className={`radio-label ${record.status === 'absent' ? 'status-absent' : ''}`}>
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            checked={record.status === 'absent'}
                            onChange={() => handleStatusChange(student.id, 'absent')}
                            className="hidden-radio"
                          />
                          <span className="status-indicator-box">
                            <X size={14} />
                          </span>
                        </label>
                      </td>

                      <td className="text-center option-cell">
                        <label className={`radio-label ${record.status === 'excused' ? 'status-excused' : ''}`}>
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            checked={record.status === 'excused'}
                            onChange={() => handleStatusChange(student.id, 'excused')}
                            className="hidden-radio"
                          />
                          <span className="status-indicator-box">
                            <AlertCircle size={14} />
                          </span>
                        </label>
                      </td>

                      {/* Champ de justification */}
                      <td className="justification-cell">
                        <input
                          type="text"
                          className="kocc-input justification-input"
                          placeholder="Ex: Certificat médical..."
                          value={record.justification}
                          onChange={(e) => handleJustificationChange(student.id, e.target.value)}
                          disabled={record.status === 'present'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bouton de validation */}
          <div className="form-submit-block">
            <button
              type="submit"
              className="kocc-btn kocc-btn-primary submit-btn"
              disabled={submitLoading}
            >
              <Save size={18} />
              <span>{submitLoading ? "Enregistrement..." : "Valider l'appel numérique"}</span>
            </button>
          </div>

        </form>
      )}
    </div>
  );
};

export default MarkAttendance;
