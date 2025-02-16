import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      // Verificar si estamos en una ruta pública
      const isPublicRoute = segments.length > 0 && 
        (segments[0] === 'login' || segments[0] === 'create-account');

      if (!user && !isPublicRoute) {
        // Si no hay usuario y no estamos en una ruta pública,
        // redirigir a login
        router.replace('/login');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return <>{children}</>;
}
