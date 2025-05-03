const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { createUser } = require('../models/auth');

// Obtenir tous les utilisateurs (réservé aux administrateurs)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    // Sélectionner tous les utilisateurs mais sans exposer les mots de passe
    const users = await query('SELECT id, username, email, isAdmin, createdAt FROM users');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur de récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});

// Obtenir un utilisateur par ID (réservé aux administrateurs)
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sélectionner l'utilisateur mais sans exposer le mot de passe
    const users = await query(
      'SELECT id, username, email, isAdmin, createdAt FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Erreur de récupération d\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'utilisateur' });
  }
});

// Créer un utilisateur (réservé aux administrateurs)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, password, email, isAdmin } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
    }
    
    const result = await createUser(username, password, email, isAdmin);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur de création d\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'utilisateur' });
  }
});

// Mettre à jour un utilisateur (réservé aux administrateurs)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, isAdmin } = req.body;
    
    // Vérifier si l'utilisateur existe
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour les champs permis
    const result = await query(
      'UPDATE users SET email = ?, isAdmin = ? WHERE id = ?',
      [email, isAdmin, id]
    );
    
    if (result.affectedRows !== 1) {
      throw new Error('Échec de la mise à jour de l\'utilisateur');
    }
    
    res.json({ 
      success: true, 
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: parseInt(id),
        email,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Erreur de mise à jour d\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
});

// Supprimer un utilisateur (réservé aux administrateurs)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur existe
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Empêcher la suppression du dernier administrateur
    if (users[0].isAdmin) {
      const adminCount = await query('SELECT COUNT(*) as count FROM users WHERE isAdmin = TRUE');
      
      if (adminCount[0].count <= 1) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer le dernier administrateur'
        });
      }
    }
    
    // Supprimer l'utilisateur
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows !== 1) {
      throw new Error('Échec de la suppression de l\'utilisateur');
    }
    
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur de suppression d\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'utilisateur' });
  }
});

// Profil de l'utilisateur connecté
router.get('/profile/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les informations de l'utilisateur connecté
    const users = await query(
      'SELECT id, username, email, isAdmin, createdAt FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Erreur de récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
});

module.exports = router;