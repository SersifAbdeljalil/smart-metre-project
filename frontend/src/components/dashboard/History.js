import React, { useState, useEffect } from 'react';
import { readingsService } from '../../services/api';
import { useAlert } from '../../context/AlertContext';
import StatusBadge from '../common/StatusBadge';
import './UnifiedStyles.css';

const History = ({ limit = 7, showControls = true }) => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const { error } = useAlert();
  
  useEffect(() => {
    fetchReadings();
  }, [pagination.page, pagination.limit, filters]);
  
  const fetchReadings = async () => {
    try {
      setLoading(true);
      
      const response = await readingsService.getAll(
        pagination.page,
        pagination.limit,
        filters
      );
      
      if (response.data && response.data.success) {
        setReadings(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Erreur de chargement des lectures:', err);
      error('Impossible de charger l\'historique des lectures');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
  
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilterModal(false);
  };
  
  const handleExport = () => {
    // Téléchargement des données en CSV (exemple simplifié)
    const headers = [
      'ID',
      'Date/Heure',
      'Dispositif',
      'Valeur',
      'Unité',
      'Emplacement',
      'État',
      'Description'
    ];
    
    const rows = readings.map(reading => [
      reading.id,
      new Date(reading.timestamp).toLocaleString('fr-FR'),
      reading.deviceId,
      reading.value,
      reading.unit,
      reading.location || '',
      reading.status,
      reading.description || ''
    ]);
    
    // Générer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Créer un blob et lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lectures-manometres-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
  
  const getStatusText = (status) => {
    switch (status) {
      case 'warning':
        return 'Avertissement';
      case 'critical':
        return 'Critique';
      default:
        return 'Normal';
    }
  };
  
  if (loading && readings.length === 0) {
    return (
      <div className="history-section">
        <div className="section-header">
          <h3 className="section-title">Historique des Relevés</h3>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-row header"></div>
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="skeleton-row"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="history-section">
      <div className="section-header">
        <h3 className="section-title">Historique des Relevés</h3>
        
        {showControls && (
          <div className="history-controls">
            <button 
              className="history-control"
              onClick={() => setShowFilterModal(true)}
            >
              <i className="fas fa-filter"></i> Filtrer
            </button>
            <button 
              className="history-control"
              onClick={handleExport}
            >
              <i className="fas fa-download"></i> Exporter
            </button>
          </div>
        )}
      </div>
      
      <div className="table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date/Heure</th>
              <th>Image</th>
              <th>Dispositif</th>
              <th>Valeur</th>
              <th>État</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {readings.length > 0 ? (
              readings.map(reading => (
                <tr key={reading.id}>
                  <td>{formatDate(reading.timestamp)}</td>
                  <td>
                    {reading.imagePath ? (
                      <img 
                        src={`/api/readings/image/${reading.imagePath}`} 
                        alt="Thumbnail" 
                        className="thumbnail"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/40';
                          e.target.alt = 'Image non disponible';
                        }}
                      />
                    ) : (
                      <img src="/api/placeholder/60/40" alt="Thumbnail" className="thumbnail" />
                    )}
                  </td>
                  <td>{reading.deviceId}</td>
                  <td>{reading.value} {reading.unit}</td>
                  <td>
                    <StatusBadge status={reading.status}>
                      {getStatusText(reading.status)}
                    </StatusBadge>
                  </td>
                  <td>{reading.description || 'Aucune description'}</td>
                  <td>
                    <button className="action-btn" title="Voir les détails">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn" title="Télécharger l'image">
                      <i className="fas fa-download"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Aucune donnée disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={pagination.page === 1}
            onClick={() => handleChangePage(1)}
          >
            <i className="fas fa-angle-double-left"></i>
          </button>
          <button
            className="pagination-btn"
            disabled={pagination.page === 1}
            onClick={() => handleChangePage(pagination.page - 1)}
          >
            <i className="fas fa-angle-left"></i>
          </button>
          
          <span className="pagination-info">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          
          <button
            className="pagination-btn"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handleChangePage(pagination.page + 1)}
          >
            <i className="fas fa-angle-right"></i>
          </button>
          <button
            className="pagination-btn"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handleChangePage(pagination.totalPages)}
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      )}
      
      {/* Modal de filtrage (esquisse) */}
      {showFilterModal && (
        <div className="filter-modal-overlay">
          <div className="filter-modal">
            <div className="filter-modal-header">
              <h3>Filtrer les lectures</h3>
              <button
                className="close-btn"
                onClick={() => setShowFilterModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="filter-modal-body">
              {/* Formulaire de filtrage (à implémenter) */}
              <p>Interface de filtrage à développer...</p>
            </div>
            <div className="filter-modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowFilterModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={() => handleApplyFilters({})}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;