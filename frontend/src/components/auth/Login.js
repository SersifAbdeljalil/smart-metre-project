import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  FaTachometerAlt, // Remplace FaGauge qui n'existe pas
  FaChartLine, 
  FaUser, 
  FaUserCircle, 
  FaKey, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle, 
  FaQuestionCircle, 
  FaSignInAlt, 
  FaSpinner,
  FaExclamationCircle,
  FaCopyright
} from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const { error } = useAlert();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setShowError(true);
      return;
    }
    
    try {
      setIsLoading(true);
      setShowError(false);
      
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setShowError(true);
        error(result.message || 'Échec de la connexion');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setShowError(true);
      error('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo">
          <FaTachometerAlt className="logo-icon" />
          <span>Smart Meter Monitor</span>
        </div>
        <p>
          <FaChartLine className="header-icon" />
          Système de surveillance des manomètres d'oxygène
        </p>
      </div>
      
      <div className="login-form">
        <div className={`error-message ${showError ? 'show' : ''}`} id="error-message">
          <FaExclamationCircle className="error-icon" />
          <span>Identifiant ou mot de passe incorrect. Veuillez réessayer.</span>
        </div>
        
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <FaUserCircle className="label-icon" /> Identifiant
            </label>
            <div className="input-group">
              <input 
                type="text" 
                id="username" 
                className="form-control" 
                placeholder="Entrez votre identifiant" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
              <FaUser className="input-icon" />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaKey className="label-icon" /> Mot de passe
            </label>
            <div className="input-group">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                className="form-control" 
                placeholder="Entrez votre mot de passe" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <FaLock className="input-icon" />
              <span 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          
          <div className="form-options">
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                id="remember-me" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">
                <FaCheckCircle className="checkbox-icon" /> Se souvenir de moi
              </label>
            </div>
            <a href="#" className="forgot-link">
              <FaQuestionCircle className="forgot-icon" /> Mot de passe oublié?
            </a>
          </div>
          
          <button 
            type="submit" 
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-content">
                <FaSpinner className="spinner" /> Connexion en cours...
              </span>
            ) : (
              <span className="btn-content">
                <FaSignInAlt className="login-icon" /> Se connecter
              </span>
            )}
          </button>
        </form>
      </div>
      
      <div className="login-footer">
        <FaCopyright className="footer-icon" /> {new Date().getFullYear()} Smart Meter Monitor - Tous droits réservés
      </div>
    </div>
  );
};

export default Login;