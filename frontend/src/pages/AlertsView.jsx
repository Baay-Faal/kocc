import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  AlertTriangle, 
  Sparkles, 
  UserX, 
  TrendingDown, 
  User, 
  BookOpen, 
  PlusCircle, 
  CheckCircle 
} from 'lucide-react';

const AlertsView = () => {
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get('/mbene/alertes');
        
        setAtRiskStudents(res.data.atRiskStudents || []);
        setRecommendations(res.data.aiRecommendations || '');
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
            Analyse d'assiduité critique et actions de remédiation formulées par l'IA MBENE.
          </p>
        </div>
        <div className="role-tag-container">
          <span className="role-tag tag-red">Seuil : &lt; 70%</span>
        </div>
      </header>

      {error && (
        <div className="login-error-box">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="loading-placeholder">Analyse de la base de données par MBENE...</p>
      ) : atRiskStudents.length === 0 ? (
        <div className="kocc-card no-alerts-card">
          <CheckCircle className="check-success-icon" size={48} />
          <h3 className="card-section-title mt-1">Excellente Assiduité Globale</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Tous les étudiants inscrits présentent un taux d'assiduité supérieur ou égal à 70%.
          </p>
        </div>
      ) : (
        <div className="alerts-grid">
          
          {/* Colonne Gauche : Liste des étudiants ciblés */}
          <div className="alerts-column-list">
            <h3 className="card-section-title mb-1-5">Étudiants Sous le Seuil Critique</h3>
            
            <div className="student-alert-cards">
              {atRiskStudents.map((student) => (
                <div key={student.id} className="kocc-card alert-student-card">
                  <div className="alert-card-header">
                    <div className="alert-avatar">
                      <UserX size={20} />
                    </div>
                    <div className="alert-student-details text-left">
                      <h4 className="alert-student-fullname">{student.firstName} {student.lastName}</h4>
                      <p className="alert-student-meta">Classe : {student.className} • Alias : {student.alias}</p>
                    </div>
                  </div>
                  
                  <div className="alert-card-rate-block">
                    <div className="alert-rate-label-group">
                      <TrendingDown size={14} className="trend-icon" />
                      <span>Taux de présence</span>
                    </div>
                    <h3 className="alert-rate-value">{student.attendanceRate}%</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne Droite : Plan de Remédiation IA MBENE */}
          <div className="kocc-card ai-recommendations-card">
            <div className="ai-rec-header">
              <Sparkles className="sparkle-icon" size={24} />
              <h3 className="card-section-title">Analyse et Recommandations de MBENE</h3>
            </div>
            
            <div className="ai-rec-body text-left">
              {recommendations.split('\n').map((line, idx) => {
                if (!line.trim()) return <br key={idx} />;
                
                // Détecter des titres ou puces
                if (line.startsWith('-') || line.startsWith('*')) {
                  return (
                    <div key={idx} className="recommendation-bullet-item">
                      <span className="bullet-dash">▪</span>
                      <p className="recommendation-line">{line.substring(1).trim()}</p>
                    </div>
                  );
                }
                
                if (line.match(/^\d+\./)) {
                  // Ligne numérotée
                  return <p key={idx} className="recommendation-line font-bold mt-1">{line}</p>;
                }

                return <p key={idx} className="recommendation-line">{line}</p>;
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AlertsView;
