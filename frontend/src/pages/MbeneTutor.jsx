import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  MessageSquare,
  HelpCircle,
  Clock
} from 'lucide-react';

const MbeneTutor = () => {
  const userJson = sessionStorage.getItem('kocc_user');
  
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  if (!userJson) return null;
  const user = JSON.parse(userJson);

  useEffect(() => {
    const fetchStudentCourses = async () => {
      try {
        setInitLoading(true);
        if (user.classId) {
          // Extraire les matières depuis les séances d'emploi du temps de la classe
          const res = await API.get(`/sessions/class/${user.classId}`);
          
          const uniqueCoursesMap = {};
          res.data.forEach(session => {
            if (session.Course) {
              uniqueCoursesMap[session.Course.id] = session.Course;
            }
          });
          
          const coursesList = Object.values(uniqueCoursesMap);
          setCourses(coursesList);
          
          if (coursesList.length > 0) {
            setSelectedCourseId(coursesList[0].id);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des cours :", err);
      } finally {
        setInitLoading(false);
      }
    };

    fetchStudentCourses();
  }, [user.classId]);

  // Réinitialiser la discussion quand la matière change
  useEffect(() => {
    if (selectedCourseId) {
      const course = courses.find(c => c.id === parseInt(selectedCourseId, 10));
      setMessages([
        {
          sender: 'mbene',
          text: `Bonjour ${user.firstName}, je suis MBENE, votre tuteur virtuel d'ISI SUPTECH.
                 Je me baserai sur les cours réels de "${course ? course.title : 'cette matière'}" dispensés par votre enseignant pour répondre à vos questions et vous aider à réviser. 
                 Quelle notion ou formule souhaitez-vous que je vous explique aujourd'hui ?`
        }
      ]);
    }
  }, [selectedCourseId, courses]);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || !selectedCourseId || loading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');
    
    // Ajouter le message de l'étudiant
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      // Envoyer la question au backend
      const res = await API.post('/mbene/tutor', {
        courseId: parseInt(selectedCourseId, 10),
        question: userText
      });

      // Ajouter la réponse de MBENE
      setMessages(prev => [...prev, { sender: 'mbene', text: res.data.answer }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'mbene', 
          text: "Désolé, j'ai rencontré une erreur réseau lors de l'analyse de votre question. Veuillez réessayer dans quelques instants." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutor-wrapper fade-in">
      {/* Header */}
      <header className="tutor-header">
        <div>
          <h1 className="welcome-title">MBENE - Tuteur Virtuel Académique</h1>
          <p className="welcome-subtitle">
            Posez des questions contextualisées sur vos cours réels à l'IA d'ISI SUPTECH.
          </p>
        </div>

        {/* Sélecteur de Matière */}
        {courses.length > 0 && (
          <div className="class-filter">
            <BookOpen size={18} className="filter-icon" />
            <select 
              value={selectedCourseId} 
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="kocc-input filter-select"
              disabled={loading}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {initLoading ? (
        <p className="loading-placeholder">Chargement des matières...</p>
      ) : courses.length === 0 ? (
        <p className="empty-placeholder">Aucune matière n'est actuellement rattachée à votre classe dans l'emploi du temps.</p>
      ) : (
        <div className="tutor-workspace">
          
          {/* Zone de Discussion */}
          <div className="kocc-card chat-card-container">
            <div className="chat-history">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'user-align' : 'mbene-align'}`}>
                  
                  {msg.sender === 'mbene' && (
                    <div className="bubble-avatar-mbene">
                      <Sparkles size={16} />
                    </div>
                  )}

                  <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-mbene'}`}>
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className="bubble-text">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Indicateur de chargement / écriture de MBENE */}
              {loading && (
                <div className="chat-bubble-wrapper mbene-align">
                  <div className="bubble-avatar-mbene writing-animation">
                    <Sparkles size={16} />
                  </div>
                  <div className="chat-bubble bubble-mbene loading-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Formulaire de Saisie */}
            <form onSubmit={handleSendQuestion} className="chat-input-bar">
              <input
                type="text"
                className="kocc-input chat-input-field"
                placeholder="Posez votre question sur ce cours..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="submit"
                className="kocc-btn kocc-btn-primary send-btn"
                disabled={loading || !inputQuestion.trim()}
              >
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Raccourcis / Questions Fréquentes de Révision */}
          <div className="kocc-card suggestions-card">
            <div className="suggestions-header">
              <HelpCircle size={20} className="help-icon" />
              <h4 className="card-section-title">Suggestions de Révision</h4>
            </div>
            <p className="suggestions-info">Cliquez pour interroger MBENE sur ces sujets classiques :</p>
            <div className="suggestions-list">
              <button 
                onClick={() => setInputQuestion("Fais-moi un résumé synthétique des séances passées.")}
                className="kocc-btn kocc-btn-secondary suggestion-item-btn"
                disabled={loading}
              >
                Résumé global des séances
              </button>
              <button 
                onClick={() => setInputQuestion("Quels sont les concepts clés les plus importants à maîtriser pour l'examen ?")}
                className="kocc-btn kocc-btn-secondary suggestion-item-btn"
                disabled={loading}
              >
                Concepts clés pour l'examen
              </button>
              <button 
                onClick={() => setInputQuestion("Donne-moi un petit exercice d'entraînement sur le dernier chapitre.")}
                className="kocc-btn kocc-btn-secondary suggestion-item-btn"
                disabled={loading}
              >
                Exercice d'entraînement rapide
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default MbeneTutor;
