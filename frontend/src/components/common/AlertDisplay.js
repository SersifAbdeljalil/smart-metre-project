import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';
import { useAlert } from '../../context/AlertContext';
import '../dashboard/UnifiedStyles.css'; // Assurez-vous que le chemin est correct

const AlertDisplay = () => {
  const { alerts, removeAlert } = useAlert();
  const [exitingAlerts, setExitingAlerts] = useState({});
  
  // Fonction pour gérer l'animation de sortie avant de supprimer l'alerte
  const handleRemoveAlert = (id) => {
    setExitingAlerts(prev => ({ ...prev, [id]: true }));
    
    setTimeout(() => {
      removeAlert(id);
      setExitingAlerts(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }, 300); // Correspond à la durée de l'animation
  };
  
  // Suppression automatique des alertes après un délai
  useEffect(() => {
    const timers = alerts.map(alert => {
      return setTimeout(() => {
        handleRemoveAlert(alert.id);
      }, alert.autoClose || 5000); // 5 secondes par défaut
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [alerts]);
  
  if (alerts.length === 0) return null;
  
  return (
    <div className="alert-container">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`alert alert-${alert.type} ${exitingAlerts[alert.id] ? 'exiting' : ''}`}
        >
          <div className="alert-content">
            {alert.type === 'success' && <FaCheckCircle />}
            {alert.type === 'danger' && <FaExclamationCircle />}
            {alert.type === 'warning' && <FaExclamationTriangle />}
            {alert.type === 'info' && <FaInfoCircle />}
            <span>{alert.message}</span>
          </div>
          <button
            className="alert-close"
            onClick={() => handleRemoveAlert(alert.id)}
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertDisplay;