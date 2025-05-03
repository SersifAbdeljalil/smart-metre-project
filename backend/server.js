const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { testConnection } = require('./config/db');
require('dotenv').config();

// Création de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Journalisation des requêtes

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Routes
const authRoutes = require('./routes/auth');
const readingsRoutes = require('./routes/readings');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/users', usersRoutes);

// Servir les fichiers statiques de l'application React en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ message: 'Le serveur est opérationnel' });
});

// Port d'écoute
const PORT = process.env.PORT || 5000;

// Démarrage du serveur
async function startServer() {
  try {
    // Tester la connexion à la base de données
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Impossible de se connecter à la base de données. Arrêt du serveur.');
      process.exit(1);
    }
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();