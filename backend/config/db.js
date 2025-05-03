const mysql = require('mysql2/promise');
require('dotenv').config();

// Création d'un pool de connexions MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_meter_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction pour tester la connexion à la base de données
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Base de données connectée avec succès');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error.message);
    return false;
  }
}

// Fonction pour exécuter des requêtes SQL
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erreur d\'exécution de la requête:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};