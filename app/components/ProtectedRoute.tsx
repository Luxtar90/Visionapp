import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import LoadingScreen from '../screens/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();

  useEffect(() => {
    console.log('ProtectedRoute - Checking access:', {
      userEmail: user?.email,
      userRole: role,
      allowedRoles,
      hasAccess: allowedRoles ? allowedRoles.includes(role?.toLowerCase() || '') : true
    });

    if (!loading && !user) {
      console.log('ProtectedRoute - No user, redirecting to login');
      router.replace('/login');
      return;
    }

    if (!loading && role && allowedRoles && !allowedRoles.includes(role.toLowerCase())) {
      console.log('ProtectedRoute - User does not have required role, redirecting to home');
      router.replace('/');
      return;
    }
  }, [user, loading, role, allowedRoles]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role.toLowerCase())) {
    return null;
  }

  return <>{children}</>;
}
