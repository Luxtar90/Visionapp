import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import authService, { User as AuthUser, UserRole as AuthUserRole } from '../../services/authService';

// Reutilizamos las interfaces del servicio de autenticación
type UserRole = AuthUserRole;
type User = AuthUser;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const getRoleString = (userRole: UserRole | string | undefined): string => {
    if (!userRole) {
      return 'user'; // Valor por defecto
    }
    if (typeof userRole === 'string') {
      return userRole;
    }
    return userRole.nombre;
  };

  async function loadStoredUser() {
    try {
      console.log('🔄 Cargando datos de usuario almacenados...');
      
      // Verificar si hay un token almacenado
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        // Obtener el usuario actual usando el servicio de autenticación
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          console.log('✅ Usuario encontrado:', userData);
          
          setUser(userData);
          const roleStr = getRoleString(userData.role);
          setRole(roleStr);
          
          // Configurar axios con el token
          const token = await AsyncStorage.getItem('token');
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          
          console.log('✅ Estado de autenticación restaurado:', { 
            userId: userData.id,
            userEmail: userData.email,
            role: roleStr,
            hasToken: !!token
          });
        }
      } else {
        console.log('ℹ️ No se encontraron datos de usuario almacenados');
        // Limpiar el estado si no hay datos almacenados
        setUser(null);
        setRole(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('❌ Error al cargar el usuario almacenado:', error);
      // Limpiar todo en caso de error
      await authService.logout();
      setUser(null);
      setRole(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log('🔄 Iniciando sesión con email:', email);
      
      // Usar el servicio de autenticación para iniciar sesión
      const userData = await authService.login(email, password);
      
      // Actualizar el estado
      setUser(userData);
      const roleStr = getRoleString(userData.role);
      setRole(roleStr);
      
      // Configurar axios con el token (que ya fue guardado por authService)
      const token = await AsyncStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      console.log('✅ Inicio de sesión exitoso:', {
        userId: userData.id,
        userEmail: userData.email,
        role: roleStr,
        hasToken: !!token
      });

      // Navegar a tabs
      router.replace("/(tabs)/profile" as any);
    } catch (error) {
      console.error('❌ Error durante el inicio de sesión:', error);
      // Limpiar todo en caso de error
      await authService.logout();
      setUser(null);
      setRole(null);
      delete axios.defaults.headers.common['Authorization'];
      throw error;
    }
  }

  async function signOut() {
    try {
      console.log('🔄 Cerrando sesión...');
      setLoading(true);
      
      // Usar el servicio de autenticación para cerrar sesión
      await authService.logout();
      
      // Limpiar estado
      setUser(null);
      setRole(null);
      delete axios.defaults.headers.common['Authorization'];
      
      router.replace("/login" as any);
      console.log('✅ Cierre de sesión exitoso');
    } catch (error) {
      console.error('❌ Error durante el cierre de sesión:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Función para actualizar los datos del usuario
  async function refreshUserData() {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        const roleStr = getRoleString(userData.role);
        setRole(roleStr);
      }
    } catch (error) {
      console.error('❌ Error al actualizar datos del usuario:', error);
    }
  }

  // Función para verificar si el usuario tiene un rol específico
  function hasRole(roles: string[]): boolean {
    if (!user || !user.role) return false;
    
    const userRoleStr = getRoleString(user.role).toLowerCase();
    return roles.some(role => role.toLowerCase() === userRoleStr);
  }

  const value = {
    user,
    loading,
    role,
    signIn,
    signOut,
    refreshUserData,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
