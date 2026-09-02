import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { setAuth } from '../services/auth';
import { Lock, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password, rememberMe });
      
      // Stockage intelligent : persistant (7j) si rememberMe, éphémère (session) sinon
      setAuth(response.data.token, response.data.user, rememberMe);

      // Redirection vers le dashboard
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Impossible de se connecter. Veuillez vérifier votre connexion réseau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="logo-badge">
            <ShieldCheck className="logo-icon" size={32} />
          </div>
          <h1 className="login-logo-title">KOCC.</h1>
          <p className="login-subtitle">Système de Suivi Scolaire & IA Académique</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="login-error-box">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email">E-mail Professionnel</label>
            <div className="input-with-icon">
              <Mail className="field-icon" size={18} />
              <input
                id="email"
                type="email"
                className="kocc-input"
                placeholder="nom@groupeisi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Mot de passe</label>
            <div className="input-with-icon">
              <Lock className="field-icon" size={18} />
              <input
                id="password"
                type="password"
                className="kocc-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--accent-primary)',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span>Se souvenir de moi</span>
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {rememberMe ? 'Session 7 jours' : 'Session éphémère'}
            </span>
          </div>

          <button
            type="submit"
            className="kocc-btn kocc-btn-primary login-btn"
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="login-footer">
          <p>ISI SUPTECH - Licence, Master, Doctorat (LMD)</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
