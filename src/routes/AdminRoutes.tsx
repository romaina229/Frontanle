// src/routes/AdminRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UsersPage from '../pages/admin/UsersPage';
import UserDetailPage from '../pages/admin/UserDetailPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import SettingsPage from '../pages/settings/SettingsPage';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/users/:id" element={<UserDetailPage />} />
      <Route path="/users/new" element={<UsersPage />} />
    </Routes>
  );
};

<Route path="/settings" element={
  <ProtectedRoute allowedRoles={['admin']}>
      <SettingsPage />
    </ProtectedRoute>
} />

export default AdminRoutes;