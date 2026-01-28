// src/components/Layout/Layout.tsx - CORRECTION COMPLÈTE
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout, theme } from 'antd';

import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const { Content } = AntLayout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

 

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Header fixe en haut */}
      <Header 
        collapsed={collapsed}
        onToggleSidebar={toggleSidebar}
      />
      
      <AntLayout style={{ 
        minHeight: '100vh',
        marginTop: 64, // Compense la hauteur du header fixe
      }}>
        {/* Sidebar */}
        <Sidebar 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
        />
        
        {/* Contenu principal */}
        <AntLayout style={{ marginLeft: isMobile ? 0 : (collapsed ? 0 : 250),
            transition: 'margin-left 0.2s',
            minHeight: 'calc(100vh - 64px)',}}>
          <Content
            style={{
            marginTop: '5px',
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
            overflow: 'auto',
            }}
          >
            <div style={{ 
              maxWidth: 1400, 
              margin: '0 auto',
              width: '100%',
            }}>
              <Outlet />
            </div>
          </Content>
          
          {/* Footer */}
          <Footer />
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};

export default AppLayout;