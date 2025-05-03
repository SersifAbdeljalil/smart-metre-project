const express = require('express');
const router = express.Router();
const path = require('path');
const { 
  createReading, 
  getAllReadings, 
  getReadingById, 
  getReadingsStats, 
  getLatestReadings,
  deleteReading 
} = require('../models/readings');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { handleImageUpload } = require('../middleware/upload');

// Obtenir toutes les lectures (avec pagination et filtres)
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Extraire les filtres
    const filters = {};
    if (req.query.deviceId) filters.deviceId = req.query.deviceId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;
    
    const result = await getAllReadings(page, limit, filters);
    res.json(result);
  } catch (error) {
    console.error('Erreur de récupération des lectures:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des lectures' });
  }
});

// Obtenir les statistiques des lectures
router.get('/stats', authenticate, async (req, res) => {
  try {
    const result = await getReadingsStats();
    res.json(result);
  } catch (error) {
    console.error('Erreur de récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques' });
  }
});

// Obtenir les dernières lectures pour chaque dispositif
router.get('/latest', authenticate, async (req, res) => {
  try {
    const result = await getLatestReadings();
    res.json(result);
  } catch (error) {
    console.error('Erreur de récupération des dernières lectures:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des dernières lectures' });
  }
});

// Obtenir une lecture par ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getReadingById(id);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur de récupération de lecture:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la lecture' });
  }
});

// Créer une nouvelle lecture
router.post('/', authenticate, handleImageUpload, async (req, res) => {
  try {
    const { deviceId, value, unit, location, status, description } = req.body;
    
    // Vérifier les données obligatoires
    if (!deviceId || !value) {
      return res.status(400).json({ message: 'ID du dispositif et valeur requis' });
    }
    
    // Récupérer le chemin de l'image si elle a été téléchargée
    let imagePath = null;
    if (req.file) {
      // Chemin relatif pour la base de données
      imagePath = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
    }
    
    // Créer la lecture
    const result = await createReading(
      deviceId,
      parseFloat(value),
      unit || 'bar',
      location,
      imagePath,
      status,
      description
    );
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur de création de lecture:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la lecture' });
  }
});

// Supprimer une lecture (réservé aux administrateurs)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteReading(id);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur de suppression de lecture:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la lecture' });
  }
});

// Route pour accéder aux images des manomètres
router.get('/image/:path', authenticate, (req, res)  => {
  const imagePath = req.params.path;
  const fullPath = path.join(__dirname, '../', imagePath);
  
  // Vérifier si le chemin demandé est dans le dossier uploads
  if (!fullPath.startsWith(path.join(__dirname, '../uploads'))) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  
  res.sendFile(fullPath, (err) => {
    if (err) {
      console.error('Erreur d\'envoi d\'image:', err);
      res.status(404).json({ message: 'Image non trouvée' });
    }
  });
});

module.exports = router;