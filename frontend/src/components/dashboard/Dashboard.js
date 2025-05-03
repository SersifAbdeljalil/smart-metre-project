import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaRegClock, 
  FaCalendarAlt 
} from 'react-icons/fa';
import StatsCards from './StatsCards';
import MeterDisplay from './MeterDisplay';
import History from './History';
import './UnifiedStyles.css';

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
 
  // Mettre à jour la date et l'heure toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60 * 1000);
   
    return () => clearInterval(interval);
  }, []);
 
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
 
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <FaChartLine className="dashboard-icon" />
          <h2>Tableau de Bord</h2>
        </div>
        <div className="date">
          <FaCalendarAlt className="date-icon" />
          <FaRegClock className="time-icon" />
          <span>{formatDate(currentDateTime)}</span>
        </div>
      </div>
     
      <StatsCards />
      <MeterDisplay />
      <History limit={7} />
    </div>
  );
};

export default Dashboard;