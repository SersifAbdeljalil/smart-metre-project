const express = require('express');
const router = express.Router();
const { authenticateUser, createUser, changePassword } = require('../models/auth');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
    }
    
    const result = await authenticateUser(username, password);
    
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

// Route de création d'utilisateur (réservée aux administrateurs)
router.post('/register', authenticate, requireAdmin, async (req, res) => {
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

// Route de changement de mot de passe
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis' });
    }
    
    const result = await changePassword(req.user.id, currentPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur de changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe' });
  }
});

// Route pour vérifier la validité du token
router.get('/verify-token', authenticate, (req, res) => {
  // Si l'authentification middleware a passé, le token est valide
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      username: req.user.username,
      isAdmin: req.user.isAdmin
    }
  });
});

module.exports = router;