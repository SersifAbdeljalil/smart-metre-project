import React, { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaRadiation, 
  FaSpinner 
} from 'react-icons/fa';
import { readingsService } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import './StatsCards.css';

const StatsCards = () => {
  const [stats, setStats] = useState({
    total: 0,
    normal: 0,
    warning: 0,
    critical: 0
  });
  const [loading, setLoading] = useState(true);
 
  const { error } = useAlert();
 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await readingsService.getStats();
       
        if (response.data && response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Erreur de chargement des statistiques:', err);
        error('Impossible de charger les statistiques des manomètres');
      } finally {
        setLoading(false);
      }
    };
   
    fetchStats();
   
    // Actualiser les statistiques toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
   
    return () => clearInterval(interval);
  }, [error]);
 
  if (loading) {
    return (
      <div className="stats-cards">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="card stat-card loading">
            <div className="card-icon skeleton"></div>
            <h3 className="skeleton"></h3>
            <p className="skeleton"></p>
          </div>
        ))}
      </div>
    );
  }
 
  return (
    <div className="stats-cards">
      <div className="card stat-card">
        <div className="card-icon icon-blue">
          <FaChartBar className="stat-icon" />
        </div>
        <div className="stat-content">
          <h3>{stats.total}</h3>
          <p>Relevés Totaux</p>
        </div>
      </div>
     
      <div className="card stat-card">
        <div className="card-icon icon-green">
          <FaCheckCircle className="stat-icon" />
        </div>
        <div className="stat-content">
          <h3>{stats.normal}</h3>
          <p>Mesures Normales</p>
        </div>
      </div>
     
      <div className="card stat-card">
        <div className="card-icon icon-orange">
          <FaExclamationTriangle className="stat-icon" />
        </div>
        <div className="stat-content">
          <h3>{stats.warning}</h3>
          <p>Avertissements</p>
        </div>
      </div>
     
      <div className="card stat-card">
        <div className="card-icon icon-red">
          <FaRadiation className="stat-icon" />
        </div>
        <div className="stat-content">
          <h3>{stats.critical}</h3>
          <p>Alertes Critiques</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;