import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import LoadingScreen from './LoadingScreen';

export interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  const userRole = user.role 
    ? typeof user.role === 'object' 
      ? user.role.nombre.toLowerCase() 
      : String(user.role).toLowerCase()
    : '';
  
  if (!allowedRoles.includes(userRole)) {
    router.replace('/');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
