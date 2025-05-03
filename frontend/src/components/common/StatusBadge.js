import React from 'react';
import '../dashboard/UnifiedStyles.css'; // Assurez-vous que le chemin est correct

const StatusBadge = ({ status, children }) => {
  return (
    <span className={`status-badge ${status}`}>
      {children}
    </span>
  );
};

export default StatusBadge;