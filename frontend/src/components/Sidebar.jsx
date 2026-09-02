import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Sparkles, 
  AlertOctagon, 
  LogOut, 
  Award, 
  Users, 
  BookOpen, 
  Sliders,
  GraduationCap 
} from 'lucide-react';

import { getUser, clearAuth } from '../services/auth';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  
  if (!user) return null;
  
  const { role, firstName, lastName } = user;

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  // Définition des éléments de menu selon le rôle
  const menuItems = [
    { label: 'Accueil', path: '/', icon: Home, roles: ['admin', 'teacher', 'student', 'direction', 'responsable'] },
    { label: 'Emploi du Temps', path: '/timetable', icon: Calendar, roles: ['admin', 'teacher', 'student', 'direction', 'responsable'] },
    
    // Professeur
    { label: 'Mes Classes', path: '/my-classes', icon: Users, roles: ['teacher'] },
    { label: 'Faire l\'Appel', path: '/attendance', icon: CheckSquare, roles: ['teacher'] },
    { label: 'Supports de Cours', path: '/documents', icon: FileText, roles: ['teacher', 'student'] },
    { label: 'Évaluations', path: '/evaluations', icon: BookOpen, roles: ['teacher'] },
    { label: 'Saisir les Notes', path: '/grades', icon: Sliders, roles: ['teacher'] },
    
    // Étudiant
    { label: 'Mon Bulletin LMD', path: '/bulletin', icon: Award, roles: ['student'] },
    { label: 'MBENE Tuteur', path: '/tutor', icon: Sparkles, roles: ['student'] },
    
    // Direction & Responsable
    { label: 'Alertes Décrochage', path: '/alerts', icon: AlertOctagon, roles: ['direction', 'responsable', 'admin'] },
    
    // Annuaire Étudiants & Enseignants (Admin & Direction uniquement)
    { label: 'Étudiants & Professeurs', path: '/directory', icon: GraduationCap, roles: ['admin', 'direction'] },

    // Admin & Direction
    { label: 'Classes & Matières', path: '/admin/management', icon: BookOpen, roles: ['admin', 'direction'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <h2 className="sidebar-logo">KOCC.</h2>
        <span className="kocc-badge kocc-badge-info">{role}</span>
      </div>

      <div className="sidebar-user">
        <div className="avatar-placeholder">
          {firstName[0]}{lastName[0]}
        </div>
        <div className="user-details">
          <p className="user-name">{firstName} {lastName}</p>
          <p className="user-email">{user.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-item-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
