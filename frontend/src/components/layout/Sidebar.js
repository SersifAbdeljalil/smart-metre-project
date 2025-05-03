import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { isAdmin } = useAuth();
  
  return (
    <aside className="sidebar">
      <div className="menu">
        <NavLink to="/dashboard" className={({ isActive }) => 
          `menu-item ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-tachometer-alt"></i>
          <span>Tableau de Bord</span>
        </NavLink>
        
        <NavLink to="/history" className={({ isActive }) => 
          `menu-item ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-history"></i>
          <span>Historique</span>
        </NavLink>
        
        <NavLink to="/statistics" className={({ isActive }) => 
          `menu-item ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-chart-line"></i>
          <span>Statistiques</span>
        </NavLink>
        
        {isAdmin && (
          <>
            <NavLink to="/devices" className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }>
              <i className="fas fa-microchip"></i>
              <span>Dispositifs</span>
            </NavLink>
            
            <NavLink to="/users" className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }>
              <i className="fas fa-users"></i>
              <span>Utilisateurs</span>
            </NavLink>
          </>
        )}
        
        <NavLink to="/settings" className={({ isActive }) => 
          `menu-item ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-cog"></i>
          <span>Paramètres</span>
        </NavLink>
        
        <NavLink to="/alerts" className={({ isActive }) => 
          `menu-item ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-bell"></i>
          <span>Alertes</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => 
          `menu-item ${isActive ? 'active' : ''}`
        }>
          <i className="fas fa-user"></i>
          <span>Profil</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;