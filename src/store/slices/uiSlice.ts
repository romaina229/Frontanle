import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  duration?: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: boolean;
  modal: {
    open: boolean;
    type: string;
    data: any;
  };
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'light',
  notifications: [],
  loading: false,
  modal: {
    open: false,
    type: '',
    data: null
  },
  toast: {
    message: '',
    type: 'info',
    visible: false
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString()
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null
      };
    },
    closeModal: (state) => {
      state.modal = {
        open: false,
        type: '',
        data: null
      };
    },
    showToast: (state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'info' | 'warning' }>) => {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        visible: true
      };
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },
    clearToast: (state) => {
      state.toast = {
        message: '',
        type: 'info',
        visible: false
      };
    }
  }
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleTheme,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  openModal,
  closeModal,
  showToast,
  hideToast,
  clearToast
} = uiSlice.actions;

export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;

export default uiSlice.reducer;