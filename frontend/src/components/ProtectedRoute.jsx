import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../services/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    // Redirection vers login si non connecté ou session expirée
    return <Navigate to="/login" replace />;
  }

  // Si des rôles spécifiques sont requis et que le rôle de l'utilisateur n'y figure pas
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Accès refusé pour le rôle: ${user.role}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
