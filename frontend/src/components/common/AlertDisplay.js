import React from 'react';
import { useAlert } from '../../context/AlertContext';
import './AlertDisplay.css';

const AlertDisplay = () => {
  const { alerts, removeAlert } = useAlert();
  
  if (alerts.length === 0) return null;
  
  return (
    <div className="alert-container">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`alert alert-${alert.type}`}
        >
          <div className="alert-content">
            {alert.type === 'success' && <i className="fas fa-check-circle"></i>}
            {alert.type === 'danger' && <i className="fas fa-exclamation-circle"></i>}
            {alert.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
            {alert.type === 'info' && <i className="fas fa-info-circle"></i>}
            <span>{alert.message}</span>
          </div>
          <button 
            className="alert-close"
            onClick={() => removeAlert(alert.id)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertDisplay;