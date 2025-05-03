const jwt = require('jsonwebtoken');
require('dotenv').config();

// Clé secrète pour la signature des JWT
const JWT_SECRET = process.env.JWT_SECRET || 'smart-meter-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Fonction pour générer un token JWT
function generateToken(userId, username, isAdmin) {
  return jwt.sign(
    { 
      id: userId, 
      username,
      isAdmin
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Fonction pour vérifier un token JWT
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, expired: false, decoded };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      decoded: null
    };
  }
}

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET
};