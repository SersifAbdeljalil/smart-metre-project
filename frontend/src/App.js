import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

// Pages (à implémenter)
const History = () => <div className="page">Page Historique - À implémenter</div>;
const Statistics = () => <div className="page">Page Statistiques - À implémenter</div>;
const Devices = () => <div className="page">Page Dispositifs - À implémenter</div>;
const Users = () => <div className="page">Page Utilisateurs - À implémenter</div>;
const Settings = () => <div className="page">Page Paramètres - À implémenter</div>;
const Alerts = () => <div className="page">Page Alertes - À implémenter</div>;
const Profile = () => <div className="page">Page Profil - À implémenter</div>;

// Route protégée qui vérifie l'authentification
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Route protégée qui vérifie les droits administrateur
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="statistics" element={<Statistics />} />
          
          <Route 
            path="devices" 
            element={
              <AdminRoute>
                <Devices />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="users" 
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } 
          />
          
          <Route path="settings" element={<Settings />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </AuthProvider>
  );
};

export default App;