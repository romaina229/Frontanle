// src/components/Layout/Header.tsx - CORRIGÉ
import React from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, notification } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import api from '../../services/api';
import logo = '/src/assets/images/logo.png';


const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const AppHeader: React.FC<HeaderProps> = ({ collapsed, onToggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      dispatch(logout() as any);
      navigate('/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon Profil',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
      onClick: handleLogout,
      danger: true
    }
  ];

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '64px',
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s'
      }}
    >
      {/* Partie gauche - Toggle + Logo + Titre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleSidebar}
          style={{
            fontSize: '18px',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
        
        {/* Logo + Nom de l'application */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <img src={logo} alt="Logo AquaGestion" style={{ maxHeight: '50px', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 20, 
              fontWeight: 700,
              color: '#1890ff',
              lineHeight: '24px'
            }}>
              AquaGestion
            </h1>
            <div style={{ 
              fontSize: 12, 
              color: '#8c8c8c',
              lineHeight: '16px'
            }}>
              Système de gestion de poissonnerie
            </div>
          </div>
        </div>


      {/* Partie droite - Notifications + Menu utilisateur */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notifications */}
        <Badge count={0} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            shape="circle"
            size="large"
            onClick={() => {
              notification.info({
                message: 'Notifications',
                description: 'Fonctionnalité en développement',
                placement: 'topRight'
              });
            }}
          />
        </Badge>

        {/* Menu utilisateur */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            padding: '6px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'background 0.3s',
            border: '1px solid #d9d9d9'
          } as React.CSSProperties}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar 
              size="default"
              style={{ 
                backgroundColor: '#52c41a',
                flexShrink: 0
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ lineHeight: 'normal' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#262626' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default AppHeader;
