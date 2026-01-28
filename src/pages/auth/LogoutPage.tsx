// src/pages/auth/LogoutPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Result, Spin } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';


import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Appel API pour invalider le token côté serveur
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Erreur lors de la déconnexion API:', error);
        // Continue même si l'API échoue
      } finally {
        // Nettoyer l'état Redux
        dispatch(logout());
        
        // Nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Afficher un message de succès
        toast.success('Déconnexion réussie');
        
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
      }
    };

    performLogout();
  }, [dispatch, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Result
        icon={<Spin size="large" />}
        title="Déconnexion en cours..."
        subTitle="Vous allez être redirigé vers la page de connexion"
        extra={
          <div style={{ marginTop: 20 }}>
            <LogoutOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </div>
        }
      />
    </div>
  );
};

export default LogoutPage;
