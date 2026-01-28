import { useMutation, useQueryClient } from '@tanstack/react-query';
import  logout  from '../pages/auth/LogoutPage';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
};
