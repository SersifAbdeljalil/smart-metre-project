const { query } = require('../config/db');
const path = require('path');

// Enregistrer une nouvelle lecture
async function createReading(deviceId, value, unit, location, imagePath, status, description) {
  try {
    // Déterminer le statut en fonction de la valeur
    if (!status) {
      if (value <= 30) {
        status = 'critical';
      } else if (value <= 50) {
        status = 'warning';
      } else {
        status = 'normal';
      }
    }

    // Insérer la nouvelle lecture
    const result = await query(
      'INSERT INTO readings (deviceId, value, unit, location, imagePath, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [deviceId, value, unit, location, imagePath, status, description]
    );

    if (result.affectedRows !== 1) {
      throw new Error('Échec de l\'enregistrement de la lecture');
    }

    return {
      success: true,
      readingId: result.insertId,
      message: 'Lecture enregistrée avec succès'
    };
  } catch (error) {
    console.error('Erreur d\'enregistrement de lecture:', error);
    throw new Error('Erreur lors de l\'enregistrement de la lecture');
  }
}

// Récupérer toutes les lectures avec pagination
async function getAllReadings(page = 1, limit = 10, filters = {}) {
  try {
    const offset = (page - 1) * limit;
    
    // Construire la requête de base
    let sql = 'SELECT * FROM readings';
    const queryParams = [];
    
    // Ajouter les filtres si présents
    if (Object.keys(filters).length > 0) {
      sql += ' WHERE';
      
      // Filtrer par ID de dispositif
      if (filters.deviceId) {
        sql += ' deviceId = ?';
        queryParams.push(filters.deviceId);
      }
      
      // Filtrer par statut
      if (filters.status) {
        if (queryParams.length > 0) sql += ' AND';
        sql += ' status = ?';
        queryParams.push(filters.status);
      }
      
      // Filtrer par plage de dates
      if (filters.startDate && filters.endDate) {
        if (queryParams.length > 0) sql += ' AND';
        sql += ' timestamp BETWEEN ? AND ?';
        queryParams.push(filters.startDate, filters.endDate);
      }
    }
    
    // Ajouter le tri par date décroissante et la pagination
    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    // Exécuter la requête
    const readings = await query(sql, queryParams);
    
    // Récupérer le compte total pour la pagination
    let countSql = 'SELECT COUNT(*) as total FROM readings';
    const countQueryParams = [];
    
    if (Object.keys(filters).length > 0) {
      countSql += ' WHERE';
      
      if (filters.deviceId) {
        countSql += ' deviceId = ?';
        countQueryParams.push(filters.deviceId);
      }
      
      if (filters.status) {
        if (countQueryParams.length > 0) countSql += ' AND';
        countSql += ' status = ?';
        countQueryParams.push(filters.status);
      }
      
      if (filters.startDate && filters.endDate) {
        if (countQueryParams.length > 0) countSql += ' AND';
        countSql += ' timestamp BETWEEN ? AND ?';
        countQueryParams.push(filters.startDate, filters.endDate);
      }
    }
    
    const totalResult = await query(countSql, countQueryParams);
    const total = totalResult[0].total;
    
    return {
      success: true,
      data: readings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Erreur de récupération des lectures:', error);
    throw new Error('Erreur lors de la récupération des lectures');
  }
}

// Récupérer une lecture par ID
async function getReadingById(id) {
  try {
    const readings = await query('SELECT * FROM readings WHERE id = ?', [id]);
    
    if (readings.length === 0) {
      return { success: false, message: 'Lecture non trouvée' };
    }
    
    return { success: true, data: readings[0] };
  } catch (error) {
    console.error('Erreur de récupération de lecture:', error);
    throw new Error('Erreur lors de la récupération de la lecture');
  }
}

// Récupérer les statistiques des lectures
async function getReadingsStats() {
  try {
    // Total des relevés
    const totalResult = await query('SELECT COUNT(*) as total FROM readings');
    const total = totalResult[0].total;
    
    // Nombre de lectures par statut
    const statusResult = await query(
      'SELECT status, COUNT(*) as count FROM readings GROUP BY status'
    );
    
    // Créer un objet de statistiques par défaut
    const stats = {
      total,
      normal: 0,
      warning: 0,
      critical: 0
    };
    
    // Remplir avec les données réelles
    statusResult.forEach(item => {
      stats[item.status] = item.count;
    });
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Erreur de récupération des statistiques:', error);
    throw new Error('Erreur lors de la récupération des statistiques');
  }
}

// Récupérer la dernière lecture pour chaque dispositif
async function getLatestReadings() {
  try {
    // Cette requête SQL utilise une sous-requête pour obtenir l'ID de la lecture la plus récente pour chaque dispositif
    const sql = `
      SELECT r.* 
      FROM readings r
      JOIN (
        SELECT deviceId, MAX(timestamp) as latest_time
        FROM readings
        GROUP BY deviceId
      ) latest ON r.deviceId = latest.deviceId AND r.timestamp = latest.latest_time
      ORDER BY r.timestamp DESC
    `;
    
    const latestReadings = await query(sql);
    
    return { success: true, data: latestReadings };
  } catch (error) {
    console.error('Erreur de récupération des dernières lectures:', error);
    throw new Error('Erreur lors de la récupération des dernières lectures');
  }
}

// Supprimer une lecture
async function deleteReading(id) {
  try {
    // D'abord récupérer la lecture pour obtenir le chemin de l'image
    const reading = await getReadingById(id);
    
    if (!reading.success) {
      return reading; // Renvoie déjà un message d'erreur approprié
    }
    
    // Supprimer l'enregistrement
    const result = await query('DELETE FROM readings WHERE id = ?', [id]);
    
    if (result.affectedRows !== 1) {
      return { success: false, message: 'Échec de la suppression de la lecture' };
    }
    
    // Remarque: vous pourriez également supprimer le fichier image ici si nécessaire
    
    return { success: true, message: 'Lecture supprimée avec succès' };
  } catch (error) {
    console.error('Erreur de suppression de lecture:', error);
    throw new Error('Erreur lors de la suppression de la lecture');
  }
}

module.exports = {
  createReading,
  getAllReadings,
  getReadingById,
  getReadingsStats,
  getLatestReadings,
  deleteReading
};