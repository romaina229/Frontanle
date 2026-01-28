// src/components/Layout/Sidebar.tsx - CORRECTION DÉBORDEMENT ET MOBILE
import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingCartOutlined,
  ProductOutlined,
  TeamOutlined,
  TruckOutlined,
  TransactionOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LogoutOutlined } from '@ant-design/icons';

import { RootState } from '../../store';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tableau de Bord',
      roles: ['admin', 'gestionnaire', 'caissier']
    },
    {
      key: 'products',
      icon: <ProductOutlined />,
      label: 'Produits',
      roles: ['admin', 'gestionnaire'],
      children: [
        {
          key: '/products',
          icon: <ProductOutlined />,
          label: 'Tous les Produits',
          roles: ['admin', 'gestionnaire']
        },
        {
          key: '/categories',
          icon: <TagOutlined />,
          label: 'Catégories',
          roles: ['admin', 'gestionnaire']
        }
      ]
    },
    {
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      label: 'Ventes',
      roles: ['admin', 'gestionnaire', 'caissier']
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: 'Transactions Mobile',
      roles: ['admin', 'gestionnaire', 'caissier']
    },
    {
      key: '/clients',
      icon: <TeamOutlined />,
      label: 'Clients',
      roles: ['admin', 'gestionnaire']
    },
    {
      key: '/suppliers',
      icon: <TruckOutlined />,
      label: 'Fournisseurs',
      roles: ['admin', 'gestionnaire']
    },
    {
      key: '/invoices',
      icon: <FileTextOutlined />,
      label: 'Factures',
      roles: ['admin', 'gestionnaire', 'caissier']
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Rapports',
      roles: ['admin', 'gestionnaire']
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
      roles: ['admin'],
      children: [
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Paramètres Généraux',
          roles: ['admin']
        },
        {
          key: '/users',
          icon: <UserOutlined />,
          label: 'Utilisateurs',
          roles: ['admin']
        },
        {
          key: '/profile',
          icon: <UserOutlined />,
          label: 'Mon Profil',
          roles: ['admin', 'gestionnaire', 'caissier']
        }
      ]
    },
    {
      key: '/logout',
      icon: <LogoutOutlined />,
      label: 'Déconnexion',
      valuestyle: { color: 'red' },
      roles: ['admin', 'gestionnaire', 'caissier'],
      
    }
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.children) {
      item.children = item.children.filter(child => 
        child.roles.includes(user?.role || 'caissier')
      );
      return item.children.length > 0;
    }
    return item.roles.includes(user?.role || 'caissier');
  });

  const onMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    // Sur mobile, fermer le menu après navigation
    if (window.innerWidth < 992 && onCollapse) {
      onCollapse(true);
    }
  };

  const selectedKeys = [location.pathname];
  const openKeys = collapsed ? [] : [location.pathname.split('/')[1]];

  return (
    <>
      {/* Overlay pour mobile quand le menu est ouvert */}
      {!collapsed && window.innerWidth < 992 && (
        <div
          onClick={() => onCollapse?.(true)}
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: 98,
          }}
        />
      )}

      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        collapsedWidth={0}
        width={250}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          // Auto-collapse sur mobile
          if (broken && onCollapse) {
            onCollapse(true);
          }
        }}
        style={{
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          left: 0,
          top: 64,
          bottom: 0,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          zIndex: 99,
          transition: 'all 0.2s',
          ...(collapsed && window.innerWidth < 992 ? { left: -250 } : {}),
        }}
        className="app-sidebar"
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={filteredItems}
          onClick={onMenuClick}
          style={{ 
            borderRight: 0,
            paddingTop: 16,
            paddingBottom: 16,
            height: '100%'
          }}
        />
      </Sider>
    </>
  );
};

export default Sidebar;
