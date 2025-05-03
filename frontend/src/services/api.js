import axios from 'axios';

// Créer une instance axios avec une configuration de base
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Gérer l'expiration du token ou l'authentification invalide
    if (response && response.status === 401) {
      // Si le token est expiré, rediriger vers la page de connexion
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    
    // Stocker le token et les infos utilisateur
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },
  
  verifyToken: async () => {
    return api.get('/auth/verify-token');
  }
};

// Services pour les lectures de manomètres
export const readingsService = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    // Construire les paramètres de requête
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    return api.get(`/readings?${params.toString()}`);
  },
  
  getById: async (id) => {
    return api.get(`/readings/${id}`);
  },
  
  getStats: async () => {
    return api.get('/readings/stats');
  },
  
  getLatest: async () => {
    return api.get('/readings/latest');
  },
  
  create: async (readingData) => {
    // Pour l'upload d'image, nous devons utiliser FormData
    const formData = new FormData();
    
    // Ajouter les champs de données textuelles
    Object.keys(readingData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, readingData[key]);
      }
    });
    
    // Ajouter l'image si présente
    if (readingData.image) {
      formData.append('image', readingData.image);
    }
    
    return api.post('/readings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  delete: async (id) => {
    return api.delete(`/readings/${id}`);
  }
};

// Services pour la gestion des utilisateurs
export const usersService = {
  getAll: async () => {
    return api.get('/users');
  },
  
  getById: async (id) => {
    return api.get(`/users/${id}`);
  },
  
  getProfile: async () => {
    return api.get('/users/profile/me');
  },
  
  create: async (userData) => {
    return api.post('/users', userData);
  },
  
  update: async (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },
  
  delete: async (id) => {
    return api.delete(`/users/${id}`);
  }
};

export default api;