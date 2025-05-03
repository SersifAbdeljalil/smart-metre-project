import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, children }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      default:
        return 'status-normal';
    }
  };
  
  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {children}
    </span>
  );
};

export default StatusBadge;