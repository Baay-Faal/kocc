import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem('kocc_token');
  const userJson = sessionStorage.getItem('kocc_user');

  if (!token || !userJson) {
    // Redirection vers login si non connecté ou si le navigateur a été fermé
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);

    // Si des rôles spécifiques sont requis et que le rôle de l'utilisateur n'y figure pas
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.warn(`Accès refusé pour le rôle: ${user.role}`);
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Erreur de lecture de session utilisateur :", error);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
