import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Intercepteur de requête : injecte le token JWT de façon transparente et sécurisée
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kocc_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gère de façon centralisée les erreurs d'accès (ex: Token expiré)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expirée ou non autorisée. Redirection vers la connexion.");
      localStorage.removeItem('kocc_token');
      localStorage.removeItem('kocc_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
