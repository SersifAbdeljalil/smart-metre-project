import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import AlertDisplay from '../common/AlertDisplay';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="container">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar />
        </aside>
        
        <main className="main-content">
          <AlertDisplay />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;