import api from './api';
import { ApiResponse, User, LoginFormValues, RegisterFormValues } from '@/types';

export const authService = {
  // Connexion
  login: async (credentials: LoginFormValues): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Inscription
  register: async (data: RegisterFormValues): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  // Déconnexion
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/logout');
    return response.data;
  },

  // Récupérer les informations de l'utilisateur connecté
  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/me');
    return response.data;
  }
};
