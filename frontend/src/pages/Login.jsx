import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Lock, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      
      // Enregistrer les données de session éphémère (effacé automatiquement à la fermeture du navigateur)
      sessionStorage.setItem('kocc_token', response.data.token);
      sessionStorage.setItem('kocc_user', JSON.stringify(response.data.user));
      // Nettoyer l'ancien stockage persistant
      localStorage.removeItem('kocc_token');
      localStorage.removeItem('kocc_user');

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
