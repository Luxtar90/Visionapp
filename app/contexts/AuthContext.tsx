import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from '../constants/constants';

interface User {
  id: number;
  email: string;
  nombre: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        
        // Configurar el token para todas las solicitudes futuras
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${Constants.API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { token, user: userData } = response.data;

      // Guardar token y datos del usuario
      await Promise.all([
        AsyncStorage.setItem('token', token),
        AsyncStorage.setItem('user', JSON.stringify(userData))
      ]);

      // Configurar el token para todas las solicitudes futuras
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('❌ Error during sign in:', err);
      setError(err instanceof Error ? err.message : 'Error during sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Limpiar todos los datos de autenticación
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('currentStoreId')
      ]);

      // Limpiar el token de las solicitudes
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('❌ Error during sign out:', err);
      setError(err instanceof Error ? err.message : 'Error during sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signOut,
      }}
    >
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

export default AuthProvider;
