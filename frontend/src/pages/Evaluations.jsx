import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle,
  Award,
  Users
} from 'lucide-react';

const Evaluations = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('devoir');
  const [date, setDate] = useState('');
  const [coefficient, setCoefficient] = useState('1.0');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Initialiser la liste des matières et classes de l'enseignant
  useEffect(() => {
    const fetchTeacherMetadata = async () => {
      try {
        setLoading(true);
        // Charger les séances du prof pour extraire ses matières et classes affectées
        const sessionsRes = await API.get('/sessions/teacher');
        
        const uniqueCourses = {};
        const uniqueClasses = {};
        
        sessionsRes.data.forEach(session => {
          if (session.Course) {
            uniqueCourses[session.Course.id] = session.Course;
          }
          if (session.Class) {
            uniqueClasses[session.Class.id] = session.Class;
          }
        });

        const coursesList = Object.values(uniqueCourses);
        const classesList = Object.values(uniqueClasses);

        setCourses(coursesList);
        setClasses(classesList);

        if (coursesList.length > 0) setSelectedCourseId(coursesList[0].id);
        if (classesList.length > 0) setSelectedClassId(classesList[0].id);

        // Charger les épreuves déjà planifiées par ce prof
        const evaluationsRes = await API.get('/evaluations/my');
        setEvaluations(evaluationsRes.data);

      } catch (err) {
        console.error("Erreur de chargement des métadonnées d'évaluation :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherMetadata();
  }, []);

  const handlePlanify = async (e) => {
    e.preventDefault();
    if (!title || !type || !date || !selectedCourseId || !selectedClassId || submitLoading) return;

    setSubmitLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await API.post('/evaluations', {
        title,
        type,
        date: new Date(date).toISOString(),
        coefficient: parseFloat(coefficient),
        courseId: parseInt(selectedCourseId, 10),
        classId: parseInt(selectedClassId, 10)
      });

      setMessage({ type: 'success', text: `L'évaluation "${title}" a été planifiée. Les étudiants ont été notifiés.` });
      
      // Réinitialiser le formulaire
      setTitle('');
      setDate('');
      setCoefficient('1.0');

      // Recharger la liste
      const evaluationsRes = await API.get('/evaluations/my');
      setEvaluations(evaluationsRes.data);

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ type: 'danger', text: err.response.data.message });
      } else {
        setMessage({ type: 'danger', text: "Erreur lors de la planification de l'épreuve." });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="timetable-wrapper fade-in">
      <header className="timetable-header">
        <div>
          <h1 className="welcome-title">Évaluations (Devoirs & Examens)</h1>
          <p className="welcome-subtitle">Planifiez de nouvelles épreuves et gérez la saisie des notes.</p>
        </div>
      </header>

      {message.text && (
        <div className={`login-error-box ${message.type === 'success' ? 'success-box' : ''}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <p className="loading-placeholder">Chargement...</p>
      ) : (
        <div className="documents-grid-layout">
          
          {/* Formulaire de Planification */}
          <div className="kocc-card upload-form-card">
            <div className="upload-header">
              <PlusCircle size={20} className="filter-icon" />
              <h3 className="card-section-title">Planifier une Épreuve</h3>
            </div>

            <form onSubmit={handlePlanify} className="upload-form">
              <div className="input-group">
                <label className="input-label" htmlFor="eval-title">Intitulé de l'épreuve</label>
                <input
                  id="eval-title"
                  type="text"
                  className="kocc-input"
                  placeholder="Ex: Devoir de mi-semestre..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="eval-type">Type d'évaluation</label>
                <select
                  id="eval-type"
                  className="kocc-input filter-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ border: '1px solid var(--border-light) !important', backgroundColor: 'var(--bg-primary) !important', padding: '1rem !important' }}
                >
                  <option value="devoir">Devoir (Continu)</option>
                  <option value="examen">Examen (Semestriel)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="eval-date">Date & Heure de l'épreuve</label>
                <input
                  id="eval-date"
                  type="datetime-local"
                  className="kocc-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="eval-coeff">Coefficient</label>
                <input
                  id="eval-coeff"
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="kocc-input"
                  value={coefficient}
                  onChange={(e) => setCoefficient(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="eval-course">Matière</label>
                <select
                  id="eval-course"
                  className="kocc-input filter-select"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{ border: '1px solid var(--border-light) !important', backgroundColor: 'var(--bg-primary) !important', padding: '1rem !important' }}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="eval-class">Classe visée</label>
                <select
                  id="eval-class"
                  className="kocc-input filter-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  style={{ border: '1px solid var(--border-light) !important', backgroundColor: 'var(--bg-primary) !important', padding: '1rem !important' }}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="kocc-btn kocc-btn-primary full-width-btn"
                disabled={submitLoading || courses.length === 0}
              >
                {submitLoading ? "Planification..." : "Planifier l'évaluation"}
              </button>
            </form>
          </div>

          {/* Liste des épreuves créées */}
          <div className="documents-list-section">
            <h3 className="card-section-title text-left mb-1-5">Vos Épreuves Planifiées</h3>

            {evaluations.length === 0 ? (
              <p className="empty-placeholder">Aucune épreuve planifiée.</p>
            ) : (
              <div className="doc-cards-grid">
                {evaluations.map((evalItem) => (
                  <div key={evalItem.id} className="kocc-card doc-item-card" style={{ flexWrap: 'wrap' }}>
                    <div className="doc-card-icon-box">
                      <Award size={24} />
                    </div>

                    <div className="doc-card-body text-left">
                      <h4 className="doc-card-title">{evalItem.title}</h4>
                      <p className="doc-card-meta">
                        Type: {evalItem.type.toUpperCase()} • Coeff: {evalItem.coefficient} • Classe : {evalItem.Class?.name}
                      </p>
                      <p className="doc-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <Calendar size={12} />
                        <span>{new Date(evalItem.date).toLocaleDateString('fr-FR')} à {new Date(evalItem.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>

                    <div className="doc-card-actions" style={{ width: '100%', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <button
                        onClick={() => navigate(`/grades?evaluationId=${evalItem.id}`)}
                        className="kocc-btn kocc-btn-primary action-btn"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                      >
                        <span>Saisir les notes</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Evaluations;
