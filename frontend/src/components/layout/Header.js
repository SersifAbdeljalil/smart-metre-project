import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { success } = useAlert();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleLogout = () => {
    logout();
    success('Déconnexion réussie');
    navigate('/login');
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  return (
    <header className="header">
      <div className="logo">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h1>
          <Link to="/dashboard">
            <i className="fas fa-gauge-high"></i> Smart Meter Monitor
          </Link>
        </h1>
      </div>
      
      <div className="user-info">
        <div className="notification-icon">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </div>
        
        <div className="user-profile" onClick={toggleDropdown}>
          <img src="/api/placeholder/40/40" alt="Profil utilisateur" />
          <div className="user-details">
            <div className="username">{currentUser?.username || 'Utilisateur'}</div>
            <div className="user-role">{currentUser?.isAdmin ? 'Administrateur' : 'Utilisateur'}</div>
          </div>
          <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
          
          {showDropdown && (
            <div className="user-dropdown">
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user"></i> Profil
              </Link>
              <Link to="/settings" className="dropdown-item">
                <i className="fas fa-cog"></i> Paramètres
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;