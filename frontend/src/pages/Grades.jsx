import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

const Grades = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const evaluationId = searchParams.get('evaluationId');

  const [evaluation, setEvaluation] = useState(null);
  const [students, setStudents] = useState([]);
  const [gradesInput, setGradesInput] = useState({}); // { studentId: score }
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!evaluationId) {
      setMessage({ type: 'danger', text: "Aucune évaluation n'a été spécifiée." });
      setLoading(false);
      return;
    }

    const fetchEvaluationAndStudents = async () => {
      try {
        setLoading(true);
        // 1. Récupérer l'évaluation
        const evaluationsRes = await API.get('/evaluations/my');
        const currentEval = evaluationsRes.data.find(e => e.id === parseInt(evaluationId, 10));

        if (!currentEval) {
          setMessage({ type: 'danger', text: "Évaluation introuvable ou vous n'en êtes pas le créateur." });
          return;
        }
        setEvaluation(currentEval);

        // 2. Charger les étudiants inscrits
        const studentsRes = await API.get(`/classes/${currentEval.classId}/students`);
        setStudents(studentsRes.data);

        // 3. Charger les notes déjà saisies pour cette évaluation
        const gradesRes = await API.get(`/grades/evaluation/${evaluationId}`);
        const existingGrades = {};
        gradesRes.data.forEach(grade => {
          existingGrades[grade.studentId] = grade.score;
        });

        // Initialiser l'état des inputs
        const initialInput = {};
        studentsRes.data.forEach(student => {
          initialInput[student.id] = existingGrades[student.id] !== undefined ? existingGrades[student.id] : '';
        });
        setGradesInput(initialInput);

      } catch (err) {
        console.error("Erreur de chargement des données :", err);
        setMessage({ type: 'danger', text: "Erreur de communication avec le serveur." });
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationAndStudents();
  }, [evaluationId]);

  const handleScoreChange = (studentId, value) => {
    // Permettre la saisie vide ou limiter à l'intervalle [0, 20]
    if (value === '') {
      setGradesInput(prev => ({ ...prev, [studentId]: '' }));
      return;
    }

    const numeric = parseFloat(value);
    if (isNaN(numeric)) return;

    if (numeric >= 0 && numeric <= 20) {
      setGradesInput(prev => ({ ...prev, [studentId]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const records = Object.keys(gradesInput)
        .filter(studentId => gradesInput[studentId] !== '')
        .map(studentId => ({
          studentId: parseInt(studentId, 10),
          score: parseFloat(gradesInput[studentId])
        }));

      if (records.length === 0) {
        setMessage({ type: 'danger', text: "Veuillez saisir au moins une note." });
        setSubmitLoading(false);
        return;
      }

      await API.post('/grades', {
        evaluationId: parseInt(evaluationId, 10),
        records
      });

      setMessage({ type: 'success', text: "Les notes ont été enregistrées avec succès. Bulletins LMD mis à jour." });
      
      setTimeout(() => {
        navigate('/evaluations');
      }, 1500);

    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: "Erreur lors de la sauvegarde des notes." });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="attendance-wrapper fade-in">
      {/* Header */}
      <header className="attendance-page-header">
        <button onClick={() => navigate('/evaluations')} className="kocc-btn kocc-btn-secondary back-btn">
          <ArrowLeft size={16} />
          <span>Retour</span>
        </button>
        {evaluation && (
          <div className="attendance-session-info text-left">
            <h1 className="welcome-title">Saisie des Notes</h1>
            <p className="welcome-subtitle">
              Évaluation : <strong>{evaluation.title}</strong> ({evaluation.type.toUpperCase()}) • Matière : {evaluation.Course?.title} • Coefficient : {evaluation.coefficient}
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
        <p className="loading-placeholder">Chargement de la liste d'évaluation...</p>
      ) : students.length === 0 ? (
        <p className="empty-placeholder">Aucun étudiant inscrit dans cette classe.</p>
      ) : (
        <form onSubmit={handleSubmit} className="attendance-form-container">
          
          <div className="attendance-table-card kocc-card">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>E-mail</th>
                  <th style={{ width: '200px' }}>Note (Sur 20)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="attendance-row">
                    <td className="student-cell">
                      <div className="student-avatar">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <span className="student-fullname">{student.firstName} {student.lastName}</span>
                    </td>
                    <td>{student.email}</td>
                    <td className="justification-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          className="kocc-input"
                          placeholder="Note / 20"
                          value={gradesInput[student.id]}
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          required
                          style={{ maxWidth: '120px', textAlign: 'center' }}
                        />
                        <span className="font-bold text-muted">/ 20</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-submit-block">
            <button
              type="submit"
              className="kocc-btn kocc-btn-primary submit-btn"
              disabled={submitLoading}
            >
              <Save size={18} />
              <span>{submitLoading ? "Enregistrement..." : "Enregistrer les notes"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Grades;
