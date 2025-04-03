/**
 * API Service Utility
 * Centralized API service for making HTTP requests
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/app/constants/api';
import { Alert } from 'react-native';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // You could implement token refresh logic here
      // For now, we'll just clear the token and redirect to login
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // Navigation to login would be handled by the auth context
      } catch (err) {
        console.error('Error clearing auth data:', err);
      }
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
        const response: AxiosResponse<T> = await apiClient.get(url, { 
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
      const response: AxiosResponse<T> = await apiClient.get(url, { 
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
      const response: AxiosResponse<T> = await apiClient.post(url, data, config);
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
      const response: AxiosResponse<T> = await apiClient.put(url, data, config);
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
      const response: AxiosResponse<T> = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  },
};

/**
 * Handle API errors
 * @param error - Axios error
 */
const handleApiError = (error: AxiosError): void => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    console.error('API Error Status:', error.response.status);
    console.error('API Error Headers:', error.response.headers);
    
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
        // Don't show alert for 404 on user endpoints as we handle those specially
        if (!isUserEndpoint(error.config?.url || '')) {
          Alert.alert('No encontrado', 'El recurso solicitado no existe');
        }
        break;
      case 500:
      case 502:
      case 503:
        Alert.alert('Error del servidor', 'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.');
        break;
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error Message:', error.message);
    Alert.alert('Error', 'Ha ocurrido un error inesperado');
  }
};

export default apiService;
