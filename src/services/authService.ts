import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import api, { handleApiError, BASE_URL, setAuthToken, clearAuthToken } from '../utils/api';

// Interfaces
export interface UserRole {
  id: number;
  nombre: string;
  descripcion: string;
  creadoEn?: string;
  deletedAt?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  telefono?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthResponse {
  user: User;
}

// Servicio de autenticación
class AuthService {
  private static TOKEN_KEY = '@auth_token';
  private static USER_KEY = '@user_data';

  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const data = await response.json();
      setAuthToken(data.token);
      return data;
    } catch (error) {
      clearAuthToken();
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearAuthToken();
    }
  }

  static async refreshToken(): Promise<string> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Error al refrescar el token');
    }

    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
      return data.token;
    }

    throw new Error('No se recibió un nuevo token');
  }

  static async getCurrentUser(): Promise<User> {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error al obtener el usuario actual');
    }

    const data = await response.json();
    return data.user;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<User>('/auth/me');
      if (!response || !response.data) {
        return null;
      }
      const user = response.data;
      await AsyncStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      return null;
    }
  }

  private async setSession(token: string, user: User): Promise<void> {
    await AsyncStorage.multiSet([
      [AuthService.TOKEN_KEY, token],
      [AuthService.USER_KEY, JSON.stringify(user)],
    ]);
    setAuthToken(token);
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(AuthService.TOKEN_KEY);
  }

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(AuthService.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      return !!token;
    } catch {
      return false;
    }
  }

  // Verificar si el usuario tiene un rol específico
  static hasRole(user: User, roles: string[]): boolean {
    if (!user || !user.role) return false;
    return roles.some(role => role.toLowerCase() === user.role.toLowerCase());
  }
}

export default AuthService;
