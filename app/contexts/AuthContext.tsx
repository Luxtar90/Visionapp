import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { router } from 'expo-router';

interface UserRole {
  id: number;
  nombre: string;
  descripcion: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole | string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const getRoleString = (userRole: UserRole | string): string => {
    if (typeof userRole === 'string') {
      return userRole;
    }
    return userRole.nombre;
  };

  async function loadStoredUser() {
    try {
      console.log('🔄 Loading stored user data...');
      const [userStr, tokenStr] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token')
      ]);

      if (userStr && tokenStr) {
        const userData = JSON.parse(userStr);
        console.log('✅ Found stored user:', userData);
        
        setUser(userData);
        const roleStr = getRoleString(userData.role);
        setRole(roleStr);
        
        // Configurar axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenStr}`;
        
        console.log('✅ Auth state restored:', { 
          userId: userData.id,
          userEmail: userData.email,
          role: roleStr,
          hasToken: !!tokenStr
        });
      } else {
        console.log('ℹ️ No stored user data found');
        // Limpiar el estado si no hay datos almacenados
        setUser(null);
        setRole(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('❌ Error loading stored user:', error);
      // Limpiar todo en caso de error
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
      setRole(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }

  async function signIn(token: string, userData: User) {
    try {
      console.log('🔄 Signing in user:', userData);
      
      // Primero actualizamos el estado
      setUser(userData);
      const roleStr = getRoleString(userData.role);
      setRole(roleStr);
      
      // Configurar axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Luego guardamos en AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('token', token),
        AsyncStorage.setItem('user', JSON.stringify(userData))
      ]);

      console.log('✅ Sign in successful:', {
        userId: userData.id,
        userEmail: userData.email,
        role: roleStr,
        hasToken: true
      });

      // Navegar a tabs
      router.replace("/(tabs)/profile" as any);
    } catch (error) {
      console.error('❌ Error during sign in:', error);
      // Limpiar todo en caso de error
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
      setRole(null);
      delete axios.defaults.headers.common['Authorization'];
      throw error;
    }
  }

  async function signOut() {
    try {
      console.log('🔄 Signing out...');
      setLoading(true);
      
      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove(['token', 'user']);
      
      // Limpiar estado
      setUser(null);
      setRole(null);
      delete axios.defaults.headers.common['Authorization'];
      
      router.replace("/login" as any);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    role,
    signIn,
    signOut
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
