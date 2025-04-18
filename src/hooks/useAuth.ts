// src/hooks/useAuth.ts
// Este archivo ahora es un wrapper alrededor del AuthContext
// para mantener compatibilidad con el código existente

import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { Usuario as ApiUsuario } from '../api/auth.api';

// Interfaz de usuario para mantener compatibilidad con el código existente
export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'empleado' | 'cliente';
  tiendaId?: number;
  foto_perfil?: string;
}

// Interfaz del hook para mantener compatibilidad
export interface AuthHookResult {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { nombre: string; email: string; rol?: 'admin' | 'empleado' | 'cliente'; telefono?: string }, password: string, tiendaId?: number) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook personalizado para autenticación
 * Este hook utiliza el AuthContext pero mantiene la interfaz original
 * para asegurar compatibilidad con el código existente
 */
export const useAuth = (): AuthHookResult => {
  // Obtener el contexto de autenticación
  const auth = useAuthContext();
  
  // Mapear el usuario del contexto a la interfaz User si es necesario
  const user = auth.user as User | null;
  
  return {
    user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    token: auth.token,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    updateUser: auth.updateUser,
    checkConnection: auth.checkConnection
  };
};

export default useAuth;
