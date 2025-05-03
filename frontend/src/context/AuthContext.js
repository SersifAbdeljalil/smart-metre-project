import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

// Création du contexte d'authentification
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Vérifier s'il y a un token stocké
        const token = localStorage.getItem('token');
        
        if (token) {
          // Vérifier la validité du token
          const response = await authService.verifyToken();
          setCurrentUser(response.data.user);
        }
      } catch (err) {
        console.error('Erreur d\'authentification:', err);
        // Supprimer le token invalide
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Session expirée ou invalide');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Fonction de connexion
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(username, password);
      setCurrentUser(response.user);
      
      return { success: true };
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const errorMessage = 
        err.response?.data?.message || 
        'Erreur lors de la connexion. Veuillez réessayer.';
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };
  
  // Fonction pour changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      console.error('Erreur de changement de mot de passe:', err);
      const errorMessage = 
        err.response?.data?.message || 
        'Erreur lors du changement de mot de passe. Veuillez réessayer.';
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Valeurs exposées par le contexte
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    changePassword,
    isAdmin: currentUser?.isAdmin || false,
    isAuthenticated: !!currentUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
};

export default AuthContext;