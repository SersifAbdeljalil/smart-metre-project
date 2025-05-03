const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Définition du dossier de destination
const uploadDir = path.join(__dirname, '../uploads');

// Créer le dossier d'upload s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Créer un sous-dossier par date
    const today = new Date();
    const dirPath = path.join(uploadDir, `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique basé sur l'horodatage et l'ID du dispositif
    const deviceId = req.body.deviceId || 'unknown-device';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${deviceId}-${timestamp}${extension}`;
    
    cb(null, filename);
  }
});

// Filtre des fichiers pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Seuls JPG et PNG sont acceptés.'), false);
  }
};

// Configuration de l'upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5 MB
  }
});

// Middleware d'upload d'image unique
const uploadImage = upload.single('image');

// Wrapper pour gérer les erreurs
function handleImageUpload(req, res, next) {
  uploadImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Erreur Multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Fichier trop volumineux. La limite est de 5 MB.' });
      }
      return res.status(400).json({ message: `Erreur d'upload: ${err.message}` });
    } else if (err) {
      // Autre erreur
      return res.status(400).json({ message: err.message });
    }
    
    // Pas d'erreur
    next();
  });
}

module.exports = {
  handleImageUpload
};