import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// Importamos desde la versión TypeScript sin incluir la extensión
import API_URL from '../config/api';
import apiService from '../utils/api';

// Interfaces
export interface UserRole {
  id: number;
  nombre: string;
  descripcion: string;
  creadoEn?: string;
  deletedAt?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  telefono?: string | null;
  role?: UserRole;
  profileImage?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nombre?: string;
  };
}

// Servicio de autenticación
const authService = {
  // Iniciar sesión
  login: async (email: string, password: string): Promise<User> => {
    try {
      // Realizar la solicitud de inicio de sesión
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
        email,
        password,
      });

      // Guardar el token
      await AsyncStorage.setItem('token', response.data.token);
      
      // Guardar userId
      await AsyncStorage.setItem('userId', response.data.user.id.toString());

      // Limpiar la caché para asegurar datos frescos
      apiService.clearCache(`/users/${response.data.user.id}`);
      
      // Obtener los datos completos del usuario, incluyendo su rol real
      const userResponse = await axios.get(`${API_URL}/users/${response.data.user.id}`, {
        headers: {
          Authorization: `Bearer ${response.data.token}`
        }
      });
      
      // Crear objeto de usuario con los datos completos
      const userData: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.nombre || userResponse.data.name || '',
        // Usar el rol real obtenido del endpoint /users
        role: userResponse.data.role || { nombre: 'client', id: 2 },
        profileImage: userResponse.data.profileImage || 'https://via.placeholder.com/100',
        telefono: userResponse.data.telefono
      };
      
      return userData;
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return false;
    }
  },

  // Obtener el usuario actual
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return null;
      
      // Forzar la actualización para obtener los datos más recientes
      const userData = await apiService.get<User>(`/users/${userId}`, {}, { forceRefresh: true });
      
      return {
        id: userData.id,
        name: userData.name || 'Usuario',
        email: userData.email || 'Correo no disponible',
        role: userData.role,
        profileImage: userData.profileImage || 'https://via.placeholder.com/100',
        telefono: userData.telefono
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  // Verificar si el usuario tiene un rol específico
  hasRole: (user: User | null, roles: string[]): boolean => {
    if (!user || !user.role) return false;
    
    let userRoleStr = '';
    if (typeof user.role === 'string' && user.role) {
      userRoleStr = String(user.role).toLowerCase();
    } else if (typeof user.role === 'object' && user.role && user.role.nombre) {
      userRoleStr = user.role.nombre.toLowerCase();
    }
    
    return roles.some(role => role.toLowerCase() === userRoleStr);
  }
};

export default authService;
