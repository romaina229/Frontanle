import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'caissier';
  telephone?: string;
  active: boolean;
  last_login?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  permissions: string[];
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  permissions: []
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', credentials);

      // sécuriser l'accès aux données
      const data = response.data?.data || response.data;
      const { token, user, permissions } = data;

      if (!token || !user) {
        return rejectWithValue('Réponse invalide du serveur');
      }

      localStorage.setItem('token', token);
      return { token, user, permissions: permissions || [] };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de connexion');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/register', userData);
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur d\'inscription');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de déconnexion');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/me');
      return response.data?.data || response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de chargement');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.permissions = action.payload.permissions;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur inconnue';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur inconnue';
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.permissions = [];
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erreur inconnue';
      })
      
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.permissions = action.payload.permissions || [];
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      });
  }
});

export const { clearError, setToken } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.token && !!state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectUserPermissions = (state: { auth: AuthState }) => state.auth.permissions;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
