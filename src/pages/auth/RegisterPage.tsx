// src/pages/RegisterPage.tsx
import React from 'react';
import RegisterForm from '../../components/forms/RegisterForm';
import AuthLayout from '../../components/layout/AuthLayout';

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;