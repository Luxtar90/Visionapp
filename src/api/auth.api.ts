// src/api/auth.api.ts
import { client, ApiService } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces para las respuestas de la API
export interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
  expiresIn?: number;
  refresh_token?: string;
  user?: Usuario;
  usuario?: Usuario;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'empleado' | 'cliente';
  foto_perfil?: string;
}

// Clase para manejar la autenticación
class AuthApi {
  /**
   * Iniciar sesión con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Respuesta con token y datos del usuario
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log(`===== INICIO DEL PROCESO DE LOGIN =====`);
      console.log(`[Auth] Intentando iniciar sesión con email: ${email}`);
      console.log(`[Auth] URL del backend: ${client.defaults.baseURL}`);
      
      // Validar que el email y password no estén vacíos
      if (!email || !password) {
        console.error('[Auth] Email o contraseña vacíos');
        throw new Error('El email y la contraseña son obligatorios');
      }
      
      // Crear el objeto con el formato exacto que espera el endpoint /auth/login
      const loginData = {
        email,
        password
      };
      
      console.log(`[Auth] Intentando login con endpoint: /auth/login`);
      console.log(`[Auth] Datos enviados:`, JSON.stringify(loginData, null, 2));
      
      // Verificar la conexión con el backend antes de intentar el login
      try {
        console.log('[Auth] Verificando conexión con el backend...');
        const connected = await ApiService.checkConnection();
        console.log(`[Auth] Conexión con el backend: ${connected ? 'EXITOSA' : 'FALLIDA'}`);
      } catch (connectionError) {
        console.error('[Auth] Error al verificar la conexión:', connectionError);
        // Continuamos con el login aunque falle la verificación
      }
      
      // Intentar hacer login con el backend
      try {
        console.log(`\n[Auth] ENVIANDO SOLICITUD DE LOGIN AL BACKEND`);
        console.log(`[Auth] URL completa: ${client.defaults.baseURL}/auth/login`);
        console.log(`[Auth] Método: POST`);
        console.log(`[Auth] Datos: ${JSON.stringify(loginData, null, 2)}`);
        
        // Hacer la petición al backend con timeout más largo para dar tiempo a la respuesta
        console.log(`[Auth] Iniciando petición HTTP...`);
        const response = await client.post<LoginResponse>('/auth/login', loginData, {
          timeout: 15000, // 15 segundos
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log(`\n[Auth] RESPUESTA RECIBIDA DEL BACKEND`);
        console.log(`[Auth] Código de estado: ${response.status}`);
        console.log(`[Auth] Headers:`, response.headers);
        
        // Verificar que la respuesta sea válida
        if (!response || !response.data) {
          console.error('[Auth] Respuesta vacía del servidor');
          throw new Error('No se recibió respuesta del servidor');
        }
        
        const data = response.data;
        console.log(`\n[Auth] DATOS DE LA RESPUESTA:`);
        console.log(JSON.stringify(data, null, 2));
        
        // Verificar que la respuesta tenga un token
        if (!data.accessToken && !data.access_token) {
          console.error('[Auth] No se recibió token en la respuesta');
          throw new Error('No se recibió token de acceso');
        }
        
        // Verificar que la respuesta tenga datos de usuario
        if (!data.user && !data.usuario) {
          console.error('[Auth] No se recibieron datos de usuario en la respuesta');
          throw new Error('No se recibieron datos de usuario');
        }
        
        // Mostrar respuesta completa para depuración
        console.log(`\n[Auth] LOGIN EXITOSO!`);
        
        // Mostrar cada parte importante por separado
        const tokenValue = data.accessToken || data.access_token;
        const tokenDisplay = tokenValue ? `${tokenValue.substring(0, 15)}...` : 'No token';
        console.log(`[Auth] Token recibido: ${tokenDisplay}`);
        console.log(`[Auth] Tipo de token: ${data.tokenType || 'No especificado'}`);
        console.log(`[Auth] Expira en: ${data.expiresIn || 'No especificado'} segundos`);
        
        if (data.user || data.usuario) {
          const user = data.user || data.usuario;
          if (user) {
            console.log(`\n[Auth] DATOS DEL USUARIO:`);
            console.log(`[Auth] ID: ${user.id}`);
            console.log(`[Auth] Nombre: ${user.nombre}`);
            console.log(`[Auth] Email: ${user.email}`);
            console.log(`[Auth] Rol: ${user.rol}`);
            if ((user as any).clienteId) {
              console.log(`[Auth] Cliente ID: ${(user as any).clienteId}`);
            }
          }
        }
        
        // Guardar datos y retornar
        console.log(`\n[Auth] Guardando datos de autenticación...`);
        await this.saveAuthData(data);
        console.log(`[Auth] Datos guardados correctamente`);
        console.log(`===== FIN DEL PROCESO DE LOGIN =====`);
        return data;
      } catch (error: any) {
        console.error(`\n[Auth] ERROR EN EL PROCESO DE LOGIN:`, error);
        
        // Manejar errores específicos
        if (error.response) {
          console.error(`[Auth] Error de respuesta HTTP: ${error.response.status}`);
          console.error(`[Auth] Datos de error:`, JSON.stringify(error.response.data, null, 2));
          
          if (error.response.status === 401) {
            throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
          } else if (error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
          } else {
            throw new Error(`Error del servidor: ${error.response.status}`);
          }
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error('[Auth] Error de solicitud (no hubo respuesta del servidor)');
          console.error('[Auth] Detalles:', error.request);
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
          // Error al configurar la petición
          console.error('[Auth] Error general:', error.message);
          throw new Error(`Error al iniciar sesión: ${error.message}`);
        }
        console.log(`===== FIN DEL PROCESO DE LOGIN (CON ERROR) =====`);
      }
    } catch (error) {
      console.error('[Auth] Error al iniciar sesión:', error);
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
    rol?: 'admin' | 'empleado' | 'cliente';
  }): Promise<LoginResponse> {
    try {
      console.log(`[Auth] Registrando nuevo usuario: ${userData.email}`);
      
      // Formatear los datos según los requisitos del backend
      // Basado en la documentación de la API, sabemos que existe el endpoint /usuarios
      // Creamos diferentes formatos de datos para probar con diferentes endpoints
      
      // Formato exacto para /auth/register según la documentación
      // El backend espera: nombre, email, password, tiendaId
      const registerData: Record<string, any> = {
        nombre: userData.nombre,
        email: userData.email,
        password: this.ensureStrongPassword(userData.password),
        tiendaId: userData.tiendaId || 1 // Siempre enviamos tiendaId, por defecto 1
      };
      
      // Si hay teléfono, lo incluimos (aunque no es requerido por el backend)
      if (userData.telefono) {
        registerData.telefono = userData.telefono;
      }
      
      // El rol no se envía en el registro, se asigna automáticamente en el backend
      
      // Para depuración: mostrar los datos que estamos enviando
      console.log('[Auth] Preparando registro de usuario:', userData.email);
      
      // Intentamos el registro con diferentes endpoints posibles
      // Endpoint correcto para registro según la documentación actualizada
      const registerEndpoints = [
        '/auth/register'  // Este es el endpoint correcto según la documentación
      ];
      
      // Usar el endpoint correcto con el formato exacto
      try {
        console.log(`[Auth] Intentando registro con endpoint: /auth/register`);
        console.log(`[Auth] Datos enviados:`, JSON.stringify(registerData, null, 2));
        
        const { data } = await client.post<LoginResponse>('/auth/register', registerData);
        console.log(`[Auth] Registro exitoso`);
        await this.saveAuthData(data);
        return data;
      } catch (error: any) {
        console.error(`[Auth] Error en registro:`, error);
        
        // Manejar errores específicos
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          if (errorData.message === "El correo electrónico ya está registrado") {
            throw new Error("Este correo electrónico ya está registrado. Por favor, utiliza otro o inicia sesión.");
          } else if (errorData.message) {
            throw new Error(errorData.message);
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error('[Auth] Error al registrar usuario:', error);
      throw new Error('No se pudo registrar el usuario. Verifica la conexión con el servidor y los datos ingresados.');
    }
  }
  
  /**
   * Asegura que la contraseña cumpla con los requisitos de seguridad
   * @param password Contraseña original
   * @returns Contraseña que cumple con los requisitos
   */
  private ensureStrongPassword(password: string): string {
    // Si la contraseña ya cumple con los requisitos, la devolvemos tal cual
    if (password.length >= 8 && 
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) && 
        /[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return password;
    }
    
    // Si no, creamos una contraseña que cumpla con los requisitos
    console.log('[Auth] Fortaleciendo contraseña para cumplir requisitos');
    
    // Asegurar que tenga al menos 8 caracteres
    let strongPassword = password;
    while (strongPassword.length < 8) {
      strongPassword += '1';
    }
    
    // Asegurar que tenga al menos una mayúscula
    if (!/[A-Z]/.test(strongPassword)) {
      strongPassword += 'A';
    }
    
    // Asegurar que tenga al menos una minúscula
    if (!/[a-z]/.test(strongPassword)) {
      strongPassword += 'a';
    }
    
    // Asegurar que tenga al menos un número o carácter especial
    if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(strongPassword)) {
      strongPassword += '1';
    }
    
    return strongPassword;
  }

  /**
   * Obtener datos del usuario actual
   * @returns Datos del usuario
   */
  async fetchMe(): Promise<Usuario> {
    try {
      console.log('[Auth] Obteniendo datos del usuario actual');
      const { data } = await client.get<Usuario>('/auth/me');
      return data;
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
        await client.post('/auth/logout');
      } catch (e) {
        // Si falla, solo lo registramos pero continuamos con el proceso
        console.warn('[Auth] Error al notificar logout al servidor:', e);
      }
      
      // Eliminar datos de autenticación del almacenamiento local
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@refresh_token');
      await AsyncStorage.removeItem('@user');
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
  private async saveAuthData(data: LoginResponse): Promise<void> {
    try {
      // El token puede venir como access_token o accessToken
      const token = data.access_token || data.accessToken;
      if (!token) {
        throw new Error('No se recibió token de acceso');
      }
      
      await AsyncStorage.setItem('@token', token);
      
      if (data.refresh_token) {
        await AsyncStorage.setItem('@refresh_token', data.refresh_token);
      }
      
      // El usuario puede venir como user o usuario
      const userData = data.user || data.usuario;
      if (!userData) {
        throw new Error('No se recibieron datos de usuario');
      }
      
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      console.log('[Auth] Datos guardados correctamente:', { token, userData });
    } catch (error) {
      console.error('[Auth] Error al guardar datos de autenticación:', error);
      throw error;
    }
  }

  /**
   * Verificar la conexión con el servidor de autenticación
   * @returns true si la conexión es exitosa
   */
  async checkAuthServer(): Promise<boolean> {
    try {
      await client.get('/auth/health');
      console.log('[Auth] Conexión exitosa con el servidor de autenticación');
      return true;
    } catch (error) {
      console.error('[Auth] Error de conexión con el servidor de autenticación:', error);
      return false;
    }
  }
}

// Exportar una instancia única de AuthApi
export const authApi = new AuthApi();

// Exportar funciones individuales para mantener compatibilidad con el código existente
export const login = (email: string, password: string) => authApi.login(email, password);
export const register = (userData: any) => authApi.register(userData);
export const fetchMe = () => authApi.fetchMe();
export const logout = () => authApi.logout();
export const isAuthenticated = () => authApi.isAuthenticated();
