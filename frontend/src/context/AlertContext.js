import React, { createContext, useState, useContext } from 'react';

// Création du contexte d'alertes
const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  
  // Ajouter une alerte
  const addAlert = (message, type = 'info', timeout = 5000) => {
    const id = Date.now();
    const newAlert = { id, message, type };
    
    setAlerts(prevAlerts => [...prevAlerts, newAlert]);
    
    // Supprimer automatiquement l'alerte après le délai spécifié
    if (timeout) {
      setTimeout(() => {
        removeAlert(id);
      }, timeout);
    }
    
    return id;
  };
  
  // Supprimer une alerte par son ID
  const removeAlert = (id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  };
  
  // Types d'alertes prédéfinis
  const success = (message, timeout) => addAlert(message, 'success', timeout);
  const error = (message, timeout) => addAlert(message, 'danger', timeout);
  const warning = (message, timeout) => addAlert(message, 'warning', timeout);
  const info = (message, timeout) => addAlert(message, 'info', timeout);
  
  // Valeurs exposées par le contexte
  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info
  };
  
  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'alertes
export const useAlert = () => {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error('useAlert doit être utilisé à l\'intérieur d\'un AlertProvider');
  }
  
  return context;
};

export default AlertContext;