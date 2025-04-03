/**
 * API Service Utility
 * Centralized API service for making HTTP requests
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Constantes
const getBaseUrl = () => {
  // Verificar si estamos en un emulador o dispositivo físico
  if (__DEV__) {
    // En desarrollo
    if (Platform.OS === 'android') {
      if (Platform.constants.Brand === 'generic') {
        // Emulador Android
        return 'http://10.0.2.2:3000/api';
      } else {
        // Dispositivo físico Android
        return 'http://192.168.100.129:3000/api';
      }
    } else if (Platform.OS === 'ios') {
      if (Platform.constants.isTesting) {
        // Simulador iOS
        return 'http://localhost:3000/api';
      } else {
        // Dispositivo físico iOS
        return 'http://192.168.100.129:3000/api';
      }
    }
  }
  // Por defecto, usar la IP local
  return 'http://192.168.100.129:3000/api';
};

export const BASE_URL = getBaseUrl();

// Imprimir la URL base para debugging
console.log('🌐 Base URL configurada:', BASE_URL);

// Configuración de Axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Aumentado a 30 segundos
  // Configuración adicional para manejo de errores de red
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
  maxRedirects: 5,
  // Configuración adicional para debugging
  proxy: false, // Deshabilitar proxy
});

// Interceptor para manejar tokens y logging
api.interceptors.request.use(
  async (config) => {
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers
    });
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    if (response.data.error) {
      throw new Error(response.data.message || 'Error al obtener las citas');
    }
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response
    });
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// In-memory cache for API responses
const apiCache: Record<string, { data: any; timestamp: number }> = {};

// Cache expiration time in milliseconds (1 minute)
const CACHE_EXPIRATION = 1 * 60 * 1000;

// Function to clear cache for specific endpoints or patterns
const clearCache = (pattern?: string) => {
  if (!pattern) {
    // Clear all cache
    Object.keys(apiCache).forEach(key => delete apiCache[key]);
    console.log('Cleared entire API cache');
    return;
  }
  
  // Clear cache for keys matching the pattern
  Object.keys(apiCache).forEach(key => {
    if (key.includes(pattern)) {
      delete apiCache[key];
      console.log(`Cleared cache for: ${key}`);
    }
  });
};

// Check if a URL is a user endpoint that might cause 404 errors
const isUserEndpoint = (url: string): boolean => {
  return url.includes('/users/') && !url.includes('/users/me');
};

// Force refresh for user endpoints
const shouldForceRefresh = (url: string): boolean => {
  // Always force refresh for user endpoints to ensure we have the latest data
  return isUserEndpoint(url);
};

// Get user data from AsyncStorage
const getUserFromStorage = async (): Promise<any | null> => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

// Generic API service methods
export const apiService = {
  /**
   * GET request
   * @param url - API endpoint
   * @param params - Query parameters
   * @param config - Additional axios config
   */
  // Method to clear cache
  clearCache: clearCache,
  
  get: async <T>(url: string, params = {}, config: { forceRefresh?: boolean } = {}): Promise<T> => {
    // Check if we should force a refresh for this endpoint
    const forceRefresh = shouldForceRefresh(url) || config.forceRefresh;
    
    // Check cache first (if not forcing refresh)
    const cacheKey = `${url}?${JSON.stringify(params)}`;
    const cachedItem = apiCache[cacheKey];
    
    if (!forceRefresh && cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_EXPIRATION) {
      console.log(`Using cached data for ${url}`);
      return cachedItem.data as T;
    }
    
    // Special handling for user endpoints that might cause 404 errors
    if (isUserEndpoint(url)) {
      try {
        console.log(`Special handling for user endpoint: ${url}`);
        // Try to get user data from storage first
        const userData = await getUserFromStorage();
        
        if (userData && !forceRefresh) {
          // If the URL contains the current user's ID, return the stored user data
          // but only if we're not forcing a refresh
          const userId = url.split('/').pop();
          if (userId && userData.id.toString() === userId) {
            console.log('Using stored user data instead of API call');
            
            // Cache the response
            apiCache[cacheKey] = {
              data: userData,
              timestamp: Date.now()
            };
            
            return userData as unknown as T;
          }
        }
        
        // If we can't use stored data, proceed with API call
        const response: AxiosResponse<T> = await api.get(url, { 
          params, 
          ...config 
        });
        
        // Cache the response
        apiCache[cacheKey] = {
          data: response.data,
          timestamp: Date.now()
        };
        
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        
        // If it's a 404 error for a user endpoint, handle gracefully
        if (axiosError.response?.status === 404) {
          console.warn(`User endpoint 404 error: ${url}. Using fallback data.`);
          
          // Create a fallback user object
          const fallbackData = {
            id: url.split('/').pop(),
            name: 'Usuario',
            email: '',
            role: 'user'
          };
          
          // Cache the fallback data
          apiCache[cacheKey] = {
            data: fallbackData,
            timestamp: Date.now()
          };
          
          return fallbackData as unknown as T;
        }
        
        handleApiError(axiosError);
        throw error;
      }
    }
    
    // Normal API call for non-user endpoints
    try {
      const response: AxiosResponse<T> = await api.get(url, { 
        params, 
        ...config 
      });
      
      // Cache the response
      apiCache[cacheKey] = {
        data: response.data,
        timestamp: Date.now()
      };
      
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  /**
   * POST request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Additional axios config
   */
  post: async <T>(url: string, data = {}, config = {}): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  /**
   * PUT request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Additional axios config
   */
  put: async <T>(url: string, data = {}, config = {}): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },

  /**
   * DELETE request
   * @param url - API endpoint
   * @param config - Additional axios config
   */
  delete: async <T>(url: string, config = {}): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await api.delete(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

// Función para manejar errores de API
export const handleApiError = (error: AxiosError): void => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Show user-friendly error message for common status codes
    switch (error.response.status) {
      case 400:
        Alert.alert('Error de solicitud', 'Los datos enviados no son válidos');
        break;
      case 401:
        Alert.alert('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        break;
      case 403:
        Alert.alert('Acceso denegado', 'No tienes permisos para realizar esta acción');
        break;
      case 404:
        Alert.alert('No encontrado', 'El recurso solicitado no existe');
        break;
      case 500:
      case 502:
      case 503:
        Alert.alert('Error del servidor', 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.');
        break;
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', {
      error: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      }
    });
    Alert.alert(
      'Error de conexión',
      `No se pudo conectar con el servidor (${error.message}). Verifica tu conexión a internet y que el servidor esté funcionando en ${BASE_URL}.`
    );
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error Setup:', {
      message: error.message,
      code: error.code,
      config: error.config
    });
    Alert.alert('Error', `Ha ocurrido un error inesperado: ${error.message}`);
  }
};

// Función para establecer el token de autenticación
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Función para limpiar el token de autenticación
export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default api;
