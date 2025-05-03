const { verifyToken } = require('../config/auth');

// Middleware pour vérifier l'authentification
function authenticate(req, res, next) {
  // Récupérer le token d'autorisation de l'en-tête
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }

  // Extraire le token
  const token = authHeader.split(' ')[1];

  // Vérifier le token
  const { valid, expired, decoded } = verifyToken(token);

  if (!valid) {
    return res.status(401).json({ 
      message: expired ? 'Session expirée, veuillez vous reconnecter.' : 'Token invalide.' 
    });
  }

  // Ajouter les informations utilisateur au request
  req.user = decoded;
  next();
}

// Middleware pour vérifier les droits administrateur
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Accès interdit. Droits administrateur requis.' });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin
};