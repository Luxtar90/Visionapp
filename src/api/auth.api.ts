// src/api/auth.api.ts
import { client, ApiService } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Interfaces para las respuestas de la API - actualizadas según el backend real
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: Usuario;
}

export interface Usuario {
  id: number; // Cambiado a number para coincidir con el backend
  nombre: string;
  email: string;
  rol: string; // Cambiado a string para ser más flexible
  tiendaId?: number;
  clienteId?: number; // Añadido para coincidir con la respuesta del backend
}

// Clase para manejar la autenticación
class AuthApi {
  private baseURL: string;
  
  constructor() {
    // El emulador de Android usa 10.0.2.2 para referirse a localhost del host
    this.baseURL = 'http://10.0.2.2:3001';
    console.log(`[AuthApi] Inicializado con URL base: ${this.baseURL}`);
  }
  
  /**
   * Iniciar sesión con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Respuesta con token y datos del usuario
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log(`===== INICIO DEL PROCESO DE LOGIN =====`);
      console.log(`[Auth] Iniciando sesión para: ${email}`);
      
      // Datos para el login
      const loginData = {
        email,
        password
      };
      
      console.log(`[Auth] Enviando solicitud de login a: ${this.baseURL}/auth/login`);
      
      // Realizar la petición HTTP directamente
      const response = await axios.post(`${this.baseURL}/auth/login`, loginData, {
        timeout: 10000, // 10 segundos
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`[Auth] Respuesta de login recibida: ${response.status}`);
      console.log(`[Auth] Datos de respuesta:`, {
        accessToken: response.data.accessToken ? 'Presente' : 'No presente',
        usuario: response.data.usuario ? JSON.stringify(response.data.usuario) : 'No presente'
      });
      
      // La respuesta del backend ya tiene el formato correcto según auth-response.dto.ts
      const loginResponse: LoginResponse = response.data;
      
      // Guardar datos de autenticación
      await this.saveAuthData(loginResponse);
      
      console.log(`===== FIN DEL PROCESO DE LOGIN (EXITOSO) =====`);
      return loginResponse;
    } catch (error: any) {
      console.error(`[Auth] Error en login:`, error);
      
      if (error.response) {
        console.error(`[Auth] Detalles del error de respuesta:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      // Relanzar el error para que sea manejado por el componente
      throw error;
    }
  }

  /**
   * Registrar un nuevo usuario
   * @param userData Datos del usuario a registrar
   * @returns Respuesta con token y datos del usuario
   */
  async register(userData: { 
    nombre: string; 
    email: string; 
    password: string; 
    telefono?: string;
    tiendaId?: number;
    rol?: string;
  }): Promise<LoginResponse> {
    try {
      console.log(`===== INICIO DEL PROCESO DE REGISTRO =====`);
      console.log(`[Auth] Registrando nuevo usuario: ${userData.email}`);
      
      // Formatear los datos según los requisitos del backend
      const registerData = {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        rol: userData.rol || 'cliente', // Siempre 'cliente' según las memorias del sistema
        tiendaId: userData.tiendaId || 1 // Por defecto, tienda 1
      };
      
      // Añadir teléfono solo si existe (es opcional)
      if (userData.telefono) {
        (registerData as any).telefono = userData.telefono;
      }
      
      console.log(`[Auth] Enviando solicitud de registro a: ${this.baseURL}/auth/register`);
      console.log(`[Auth] Datos de registro:`, {
        ...registerData,
        password: '***' // No mostrar la contraseña en los logs
      });
      
      // Realizar la petición HTTP directamente
      const response = await axios.post(`${this.baseURL}/auth/register`, registerData, {
        timeout: 10000, // 10 segundos
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`[Auth] Respuesta de registro recibida: ${response.status}`);
      console.log(`[Auth] Datos de respuesta:`, {
        accessToken: response.data.accessToken ? 'Presente' : 'No presente',
        usuario: response.data.usuario ? JSON.stringify(response.data.usuario) : 'No presente'
      });
      
      // La respuesta del backend ya tiene el formato correcto según auth-response.dto.ts
      const registerResponse: LoginResponse = response.data;
      
      // Guardar datos de autenticación
      await this.saveAuthData(registerResponse);
      
      console.log(`===== FIN DEL PROCESO DE REGISTRO (EXITOSO) =====`);
      return registerResponse;
    } catch (error: any) {
      console.error(`[Auth] Error en registro:`, error);
      
      if (error.response) {
        console.error(`[Auth] Detalles del error de respuesta:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      // Relanzar el error para que sea manejado por el componente
      throw error;
    }
  }

  /**
   * Obtener datos del usuario actual
   * @returns Datos del usuario
   */
  async fetchMe(): Promise<Usuario> {
    try {
      console.log('[Auth] Obteniendo datos del usuario actual');
      
      // Obtener el token de autenticación
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      console.log(`[Auth] Intentando obtener perfil de usuario con endpoint: /auth/profile`);
      console.log(`[Auth] URL completa: ${this.baseURL}/auth/profile`);
      
      // Hacer la petición al backend
      const response = await axios.get(`${this.baseURL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log(`[Auth] Respuesta recibida: ${response.status}`);
      console.log(`[Auth] Datos:`, JSON.stringify(response.data, null, 2));
      
      // La respuesta del backend debe coincidir con UserProfileDto
      const userData: Usuario = {
        id: response.data.userId || response.data.id,
        nombre: response.data.nombre || '',
        email: response.data.email || '',
        rol: response.data.rol || 'cliente',
        tiendaId: response.data.tiendaId,
        clienteId: response.data.clienteId
      };
      
      return userData;
    } catch (error) {
      console.error('[Auth] Error al obtener datos del usuario:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      console.log('[Auth] Cerrando sesión');
      // Opcional: notificar al backend sobre el cierre de sesión
      try {
        await axios.post(`${this.baseURL}/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('@token')}`,
          }
        });
      } catch (e) {
        // Si falla, solo lo registramos pero continuamos con el proceso
        console.warn('[Auth] Error al notificar logout al servidor:', e);
      }
      
      // Eliminar TODOS los datos relacionados con el usuario del almacenamiento local
      console.log('[Auth] Limpiando todos los datos de usuario de AsyncStorage');
      
      // Lista de claves a eliminar
      const keysToRemove = [
        '@token',
        '@refresh_token',
        '@user',
        '@userId',
        '@clienteId',
        '@tiendaId',
        '@carrito',
        '@lastSearch',
        '@favorites'
      ];
      
      // Eliminar todas las claves
      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
        console.log(`[Auth] Eliminado ${key} de AsyncStorage`);
      }
      
      console.log('[Auth] Sesión cerrada completamente, todos los datos de usuario eliminados');
    } catch (error) {
      console.error('[Auth] Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns true si hay un token válido
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('@token');
      return !!token;
    } catch (error) {
      console.error('[Auth] Error al verificar autenticación:', error);
      return false;
    }
  }

  /**
   * Guardar datos de autenticación en AsyncStorage
   * @param data Respuesta de login/register
   */
  private async saveAuthData(authData: LoginResponse): Promise<void> {
    try {
      console.log('[AuthApi] Guardando datos de autenticación en AsyncStorage');
      
      // Guardar el token
      if (authData.accessToken) {
        console.log('[AuthApi] Guardando token en AsyncStorage');
        await AsyncStorage.setItem('@token', authData.accessToken);
      } else {
        console.error('[AuthApi] No se recibió token para guardar');
      }
      
      // Guardar los datos del usuario
      if (authData.usuario) {
        console.log('[AuthApi] Guardando datos de usuario en AsyncStorage');
        await AsyncStorage.setItem('@user', JSON.stringify(authData.usuario));
      } else {
        console.error('[AuthApi] No se recibieron datos de usuario para guardar');
      }
    } catch (error) {
      console.error('[AuthApi] Error al guardar datos de autenticación:', error);
      throw error;
    }
  }

  /**
   * Función para probar la conexión con diferentes endpoints del backend
   * Esta función es solo para diagnóstico
   */
  async testBackendConnection(): Promise<void> {
    console.log(`===== INICIANDO PRUEBA DE CONEXIÓN CON BACKEND =====`);
    
    // Lista de URLs a probar
    const baseURLs = [
      'http://10.0.2.2:3001',      // URL correcta sin prefijo /api
      'http://localhost:3001',     // URL local sin prefijo /api
      'http://127.0.0.1:3001'      // Alternativa a localhost sin prefijo /api
    ];
    
    // Lista de endpoints a probar
    const endpoints = [
      '', // Raíz
      '/auth',
      '/auth/login',
      '/auth/register',
      '/api',
      '/api/auth'
    ];
    
    // Probar cada combinación
    for (const baseURL of baseURLs) {
      for (const endpoint of endpoints) {
        const url = `${baseURL}${endpoint}`;
        try {
          console.log(`[Auth Test] Probando conexión a: ${url}`);
          const response = await axios.get(url, {
            timeout: 5000,
            headers: {
              'Accept': 'application/json'
            }
          }).catch(error => {
            if (error.response) {
              // Si recibimos una respuesta aunque sea de error, la conexión funciona
              return error.response;
            }
            throw error;
          });
          
          console.log(`[Auth Test] ✅ Conexión exitosa a ${url} - Status: ${response.status}`);
          console.log(`[Auth Test] Headers:`, response.headers);
          console.log(`[Auth Test] Datos:`, typeof response.data === 'string' ? response.data.substring(0, 100) : response.data);
        } catch (error: any) {
          console.log(`[Auth Test] ❌ Error al conectar a ${url}:`, error.message);
        }
      }
    }
    
    console.log(`===== FIN DE PRUEBA DE CONEXIÓN CON BACKEND =====`);
  }

  /**
   * Función para probar diferentes endpoints de autenticación
   * Esta función es solo para diagnóstico
   */
  async testAuthEndpoints(): Promise<void> {
    console.log(`===== INICIANDO PRUEBA DE ENDPOINTS DE AUTENTICACIÓN =====`);
    
    // Base URL que sabemos que funciona
    const baseURL = 'http://10.0.2.2:3001';
    
    // Usuario de prueba
    const testUser = {
      nombre: 'usuarioprueba',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      rol: 'cliente',
      tiendaId: 1
    };
    
    // Posibles endpoints para registro
    const registerEndpoints = [
      '/usuarios',
      '/api/usuarios',
      '/usuarios/register',
      '/api/usuarios/register',
      '/auth/register',
      '/api/auth/register',
      '/register',
      '/api/register',
      '/signup',
      '/api/signup'
    ];
    
    // Probar cada endpoint de registro
    for (const endpoint of registerEndpoints) {
      try {
        console.log(`[Auth Test] Probando registro en: ${baseURL}${endpoint}`);
        const response = await axios.post(`${baseURL}${endpoint}`, testUser, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).catch(error => {
          if (error.response) {
            return error.response;
          }
          throw error;
        });
        
        console.log(`[Auth Test] Respuesta de ${endpoint}: ${response.status}`);
        
        if (response.status === 201 || response.status === 200) {
          console.log(`[Auth Test] ✅ ÉXITO con ${endpoint}`);
          console.log(`[Auth Test] Datos: ${JSON.stringify(response.data, null, 2)}`);
          break;
        } else {
          console.log(`[Auth Test] Mensaje: ${JSON.stringify(response.data, null, 2)}`);
        }
      } catch (error: any) {
        console.log(`[Auth Test] ❌ Error con ${endpoint}: ${error.message}`);
      }
    }
    
    console.log(`===== FIN DE PRUEBA DE ENDPOINTS DE AUTENTICACIÓN =====`);
  }
}

// Exportar una instancia única de AuthApi
export const authApi = new AuthApi();

// Exportar funciones individuales para mantener compatibilidad con el código existente
export const login = (email: string, password: string) => authApi.login(email, password);
export const register = async (userData: { nombre: string; email: string; telefono?: string }, password: string, tiendaId?: number) => {
  // Adaptar la interfaz del hook a la interfaz de la API
  console.log(`[AUTH API WRAPPER] Recibiendo llamada al método register con:`, {
    userData: { ...userData, password: '***' },
    tiendaId
  });
  
  // Crear el objeto de datos para el registro según lo que espera el backend
  const apiData = {
    nombre: userData.nombre,
    email: userData.email,
    password: password,
    telefono: userData.telefono,
    tiendaId: tiendaId || 1,
    rol: 'cliente'
  };
  
  console.log(`[AUTH API WRAPPER] Llamando a authApi.register con datos:`, {
    ...apiData,
    password: '***'
  });
  
  // Llamar directamente a la API sin try/catch para que los errores se propaguen
  // al componente que llama a esta función
  return await authApi.register(apiData);
};
export const fetchMe = () => authApi.fetchMe();
export const logout = () => authApi.logout();
export const isAuthenticated = () => authApi.isAuthenticated();
export const testBackendConnection = () => authApi.testBackendConnection();
export const testAuthEndpoints = () => authApi.testAuthEndpoints();
