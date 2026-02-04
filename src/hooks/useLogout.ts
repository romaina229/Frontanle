// src/hooks/useLogout.ts - VERSION CORRIGÉE
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // Appel API pour invalider le token côté serveur
      await api.post('/auth/logout');
      
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    onSuccess: () => {
      // Nettoyer toutes les requêtes en cache
      queryClient.clear();
      
      // Rediriger vers la page de connexion
      navigate('/login');
    },
    onError: (error) => {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, nettoyer localement et rediriger
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.clear();
      navigate('/login');
    },
  });
};