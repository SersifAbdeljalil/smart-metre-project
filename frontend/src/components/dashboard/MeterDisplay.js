import React, { useState, useEffect } from 'react';
import { 
  FaInfoCircle, 
  FaClock, 
  FaThermometerHalf, 
  FaMapMarkerAlt, 
  FaFlask, 
  FaExclamationCircle, 
  FaBatteryThreeQuarters, 
  FaRulerHorizontal,
  FaSpinner
} from 'react-icons/fa';
import { readingsService } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import './UnifiedStyles.css';

const MeterDisplay = ({ deviceId }) => {
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { error } = useAlert();
  
  useEffect(() => {
    const fetchLatestReading = async () => {
      try {
        setLoading(true);
        const response = await readingsService.getLatest();
        
        if (response.data && response.data.success) {
          const readings = response.data.data;
          
          // Filtrer par appareil si un ID est spécifié
          if (deviceId) {
            const filtered = readings.find(r => r.deviceId === deviceId);
            setReading(filtered || null);
          } else if (readings.length > 0) {
            // Sinon, prendre la lecture la plus récente
            setReading(readings[0]);
          }
        }
      } catch (err) {
        console.error('Erreur de chargement des lectures:', err);
        error('Impossible de charger les dernières lectures');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestReading();
    
    // Actualiser les données toutes les minutes
    const interval = setInterval(fetchLatestReading, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [deviceId, error]);
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'warning':
        return 'warning';
      case 'critical':
        return 'danger';
      default:
        return 'success';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculer l'autonomie estimée (exemple simpliste)
  const calculateEstimatedAutonomy = (value) => {
    // Supposons qu'une bouteille pleine (200 bar) dure 10 jours
    const fullPressure = 200; // bar
    const fullDuration = 10 * 24; // heures
    
    // Calcul proportionnel
    const remainingHours = (value / fullPressure) * fullDuration;
    const days = Math.floor(remainingHours / 24);
    const hours = Math.floor(remainingHours % 24);
    
    return `${days} jours ${hours} heures`;
  };
  
  if (loading) {
    return (
      <div className="meter-display">
        <div className="current-image card">
          <div className="card-header">
            <FaSpinner className="loading-icon" />
            <h3>Chargement...</h3>
          </div>
          <div className="image-container skeleton-image"></div>
          <div className="image-info">
            <p className="skeleton"></p>
            <p className="skeleton"></p>
          </div>
        </div>
        
        <div className="meter-info card">
          <h3>Informations du Manomètre</h3>
          {[...Array(8)].map((_, index) => (
            <div key={index} className="info-item">
              <span className="info-label skeleton"></span>
              <span className="info-value skeleton"></span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!reading) {
    return (
      <div className="meter-display">
        <div className="card no-data">
          <FaExclamationCircle className="no-data-icon" />
          <h3>Aucune donnée disponible</h3>
          <p>Aucune lecture récente n'a été trouvée pour ce manomètre.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="meter-display">
      <div className="current-image card">
        <div className="card-header">
          <FaThermometerHalf className="card-header-icon" />
          <h3>Dernière Lecture</h3>
        </div>
        <div className="image-container">
          {reading.imagePath ? (
            <img 
              src={`/api/readings/image/${reading.imagePath}`} 
              alt={`Manomètre ${reading.deviceId}`} 
              onError={(e) => {
                e.target.src = '/api/placeholder/650/400';
                e.target.alt = 'Image non disponible';
              }}
            />
          ) : (
            <img src="/api/placeholder/650/400" alt="Image non disponible" />
          )}
        </div>
        <div className="image-info">
          <p><FaInfoCircle className="info-icon" /> <strong>Description:</strong> {reading.description || 'Aucune description disponible'}</p>
          <p><FaClock className="info-icon" /> <strong>Dernière mise à jour:</strong> {formatDate(reading.timestamp)}</p>
        </div>
      </div>
      
      <div className="meter-info card">
        <div className="card-header">
          <FaInfoCircle className="card-header-icon" />
          <h3>Informations du Manomètre</h3>
        </div>
        <div className="info-item">
          <span className="info-label"><FaInfoCircle className="label-icon" /> ID du Dispositif:</span>
          <span className="info-value">{reading.deviceId}</span>
        </div>
        <div className="info-item">
          <span className="info-label"><FaMapMarkerAlt className="label-icon" /> Emplacement:</span>
          <span className="info-value">{reading.location || 'Non spécifié'}</span>
        </div>
        <div className="info-item">
          <span className="info-label"><FaFlask className="label-icon" /> Type de Bouteille:</span>
          <span className="info-value">Oxygène Médical B50</span>
        </div>
        <div className="info-item">
          <span className="info-label"><FaThermometerHalf className="label-icon" /> Valeur Relevée:</span>
          <span className={`info-value ${getStatusClass(reading.status)}`}>
            {reading.value} {reading.unit}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label"><FaExclamationCircle className="label-icon" /> Seuil d'Alerte:</span>
          <span className="info-value">50 {reading.unit}</span>
        </div>
        <div className="info-item">
          <span className="info-label"><FaInfoCircle className="label-icon" /> État:</span>
          <span className={`info-value ${getStatusClass(reading.status)}`}>
            {reading.status === 'normal' ? 'Normal' : 
              reading.status === 'warning' ? 'Avertissement' : 'Critique'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label"><FaBatteryThreeQuarters className="label-icon" /> Autonomie Estimée:</span>
          <span className="info-value">{calculateEstimatedAutonomy(reading.value)}</span>
        </div>
        <div className="info-item">
          <span className="info-label"><FaRulerHorizontal className="label-icon" /> Précision de Lecture:</span>
          <span className="info-value">±2 {reading.unit}</span>
        </div>
      </div>
    </div>
  );
};

export default MeterDisplay;