/**
 * Gestionnaire centralisé d'authentification KOCC
 * Gère intelligemment la persistance (localStorage pour "Se souvenir de moi")
 * et la volatilité (sessionStorage pour la sécurité sur les ordinateurs partagés)
 */

export const setAuth = (token, user, rememberMe = false) => {
  if (rememberMe) {
    // Mode persistant (Ordinateur personnel) : conservé pendant 7 jours
    localStorage.setItem('kocc_token', token);
    localStorage.setItem('kocc_user', JSON.stringify(user));
    localStorage.setItem('kocc_remember', 'true');
    sessionStorage.removeItem('kocc_token');
    sessionStorage.removeItem('kocc_user');
  } else {
    // Mode éphémère (Salle machine / PC partagé) : détruit dès la fermeture du navigateur
    sessionStorage.setItem('kocc_token', token);
    sessionStorage.setItem('kocc_user', JSON.stringify(user));
    localStorage.removeItem('kocc_token');
    localStorage.removeItem('kocc_user');
    localStorage.removeItem('kocc_remember');
  }
};

export const getToken = () => {
  return sessionStorage.getItem('kocc_token') || localStorage.getItem('kocc_token');
};

export const getUser = () => {
  const u = sessionStorage.getItem('kocc_user') || localStorage.getItem('kocc_user');
  if (!u) return null;
  try {
    return JSON.parse(u);
  } catch (e) {
    console.error('Erreur lecture session:', e);
    return null;
  }
};

export const clearAuth = () => {
  sessionStorage.removeItem('kocc_token');
  sessionStorage.removeItem('kocc_user');
  localStorage.removeItem('kocc_token');
  localStorage.removeItem('kocc_user');
  localStorage.removeItem('kocc_remember');
};

export const isAuthenticated = () => {
  return !!getToken() && !!getUser();
};
