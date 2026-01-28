import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ConfigProvider } from 'antd';


import store from './store';
import frFR from 'antd/locale/fr_FR';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
//import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LogoutPage from './pages/auth/LogoutPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductFormPage from './pages/products/ProductFormPage';
import CategoriesPage from './pages/products/CategoriesPage';
import SalesPage from './pages/sales/SalesPage';
import SaleFormPage from './pages/sales/SaleFormPage';
import SaleDetailPage from './pages/sales/SaleDetailPage';
import MobileTransactionsPage from './pages/transactions/MobileTransactionsPage';
import TransactionFormPage from './pages/transactions/TransactionFormPage';
import TransactionViewPage from './pages/transactions/TransactionViewPage';
import ClientsPage from './pages/clients/ClientsPage';
import ClientFormPage from './pages/clients/ClientFormPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import SupplierFormPage from './pages/suppliers/SupplierFormPage';
import ReportsPage from './pages/reports/ReportsPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import UsersPage from './pages/settings/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/settings/ProfilePage';

// Styles
import './styles/globals.css';
import './styles/antd-custom.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={frFR} theme={theme}>
          <Router>
            <div className="App">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#333',
                  },
                }}
              />
              <Routes>
                {/* Routes publiques */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Routes protégées */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path='auth/logout' element={<LogoutPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/new" element={<ProductFormPage />} />
                  <Route path="/products/:id/edit" element={<ProductFormPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/sales/new" element={<SaleFormPage />} />
                  <Route path="/sales/:id" element={<SaleDetailPage />} />
                  <Route path="/transactions" element={<MobileTransactionsPage />} />
                  <Route path="/transactions/new" element={<TransactionFormPage />} />
                  <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
                  <Route path="/transactions/:id/view" element={<TransactionViewPage />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/clients/new" element={<ClientFormPage />} />
                  <Route path="/clients/:id/edit" element={<ClientFormPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/suppliers/new" element={<SupplierFormPage />} />
                  <Route path="/suppliers/:id/edit" element={<SupplierFormPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/users" element={<UsersPage />} />
                </Route>
                
                {/* Redirection par défaut */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Router>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
