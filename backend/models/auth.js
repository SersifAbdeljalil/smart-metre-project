const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { generateToken } = require('../config/auth');

// Nombre de tours pour le hachage bcrypt
const SALT_ROUNDS = 10;

// Authentifier un utilisateur
async function authenticateUser(username, password) {
  try {
    // Rechercher l'utilisateur dans la base de données
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return { success: false, message: 'Identifiant ou mot de passe incorrect' };
    }
    
    const user = users[0];
    
    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return { success: false, message: 'Identifiant ou mot de passe incorrect' };
    }
    
    // Générer un token JWT
    const token = generateToken(user.id, user.username, user.isAdmin);
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    };
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    throw new Error('Erreur lors de l\'authentification');
  }
}

// Créer un nouvel utilisateur
async function createUser(username, password, email, isAdmin = false) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUsers = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existingUsers.length > 0) {
      return { success: false, message: 'Cet identifiant est déjà utilisé' };
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insérer le nouvel utilisateur
    const result = await query(
      'INSERT INTO users (username, password, email, isAdmin) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, isAdmin]
    );
    
    if (result.affectedRows !== 1) {
      throw new Error('Échec de création de l\'utilisateur');
    }
    
    // Retourner le succès sans exposer le mot de passe
    return {
      success: true,
      user: {
        id: result.insertId,
        username,
        email,
        isAdmin
      }
    };
  } catch (error) {
    console.error('Erreur de création d\'utilisateur:', error);
    throw new Error('Erreur lors de la création de l\'utilisateur');
  }
}

// Changer le mot de passe d'un utilisateur
async function changePassword(userId, currentPassword, newPassword) {
  try {
    // Récupérer l'utilisateur
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return { success: false, message: 'Utilisateur non trouvé' };
    }
    
    const user = users[0];
    
    // Vérifier le mot de passe actuel
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordMatch) {
      return { success: false, message: 'Mot de passe actuel incorrect' };
    }
    
    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Mettre à jour le mot de passe
    const result = await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    if (result.affectedRows !== 1) {
      throw new Error('Échec de la mise à jour du mot de passe');
    }
    
    return { success: true, message: 'Mot de passe mis à jour avec succès' };
  } catch (error) {
    console.error('Erreur de changement de mot de passe:', error);
    throw new Error('Erreur lors du changement de mot de passe');
  }
}

module.exports = {
  authenticateUser,
  createUser,
  changePassword
};