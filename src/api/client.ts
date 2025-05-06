// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API
interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// Entorno de la aplicación (desarrollo, producción, etc.)
type Environment = 'development' | 'production' | 'test';

// Clase para manejar la configuración de la API según el entorno
class ApiConfigManager {
  private static instance: ApiConfigManager;
  private environment: Environment = 'development';
  
  // URL base por defecto para emuladores Android (10.0.2.2 apunta al localhost de la máquina host)
  // Esta URL funciona correctamente con el backend y es la que debemos usar siempre
  private readonly DEFAULT_BASE_URL = 'http://10.0.2.2:3001';

  // URLs alternativas para probar si la principal no funciona
  // Comentado porque sabemos que la URL por defecto funciona
  private readonly ALTERNATIVE_URLS = [
    // Mantener la URL principal como primera opción
    'http://10.0.2.2:3001',
    'http://localhost:3001',
    'http://192.168.1.100:3001',
    'http://192.168.0.100:3001',
    'http://127.0.0.1:3001'
  ];

  // URLs de la API para diferentes entornos
  private apiUrls: Record<Environment, string> = {
    development: this.DEFAULT_BASE_URL, // Para emulador Android
    production: 'https://api.multitienda.com',
    test: 'http://localhost:3001'
  };
  
  // Lista de URLs alternativas para probar en caso de fallo
  private alternativeUrls: string[] = this.ALTERNATIVE_URLS;
  
  // URL personalizada (si se configura)
  private customUrl: string | null = null;

  private constructor() {}

  public static getInstance(): ApiConfigManager {
    if (!ApiConfigManager.instance) {
      ApiConfigManager.instance = new ApiConfigManager();
    }
    return ApiConfigManager.instance;
  }

  // Obtener la configuración de la API según el entorno
  public getConfig(): ApiConfig {
    return {
      baseURL: this.customUrl || this.apiUrls[this.environment],
      timeout: 15000, // 15 segundos
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
  }
  
  // Establecer una URL personalizada
  public setCustomUrl(url: string | null): void {
    this.customUrl = url;
    console.log(`[API] URL personalizada configurada: ${url || 'ninguna'}`);
  }

  // Cambiar el entorno (útil para testing)
  public setEnvironment(env: Environment): void {
    this.environment = env;
    console.log(`[API] Entorno cambiado a: ${env}`);
  }

  // Obtener la URL base actual
  public getBaseUrl(): string {
    return this.customUrl || this.apiUrls[this.environment];
  }
  
  // Obtener las URLs alternativas
  public getAlternativeUrls(): string[] {
    return this.alternativeUrls;
  }
}

// Clase para manejar los logs de la API
class ApiLogger {
  private static instance: ApiLogger;
  private isEnabled: boolean = true;

  private constructor() {}

  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  // Habilitar/deshabilitar logs
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Log de solicitud
  public logRequest(config: AxiosRequestConfig): void {
    if (!this.isEnabled) return;
    
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      config.params || config.data || ''
    );
  }

  // Log de respuesta exitosa
  public logResponse(response: AxiosResponse): void {
    if (!this.isEnabled) return;
    
    console.log(
      `[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data
    );
  }

  // Log de error
  public logError(error: AxiosError): void {
    if (!this.isEnabled) return;
    
    if (error.response) {
      // Error con respuesta del servidor
      console.error(
        `[API Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response.data
      );
    } else if (error.request) {
      // Error sin respuesta (no se pudo conectar)
      console.error(
        `[API Network Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.message
      );
    } else {
      // Error en la configuración
      console.error('[API Config Error]', error.message);
    }
  }
}

// Inicializar el gestor de configuración y el logger
const apiConfig = ApiConfigManager.getInstance();
const apiLogger = ApiLogger.getInstance();

// Variable global para almacenar la función de logout
let globalLogoutFunction: (() => Promise<void>) | null = null;

// Función para establecer la función de logout global
export const setGlobalLogoutFunction = (logoutFn: () => Promise<void>) => {
  console.log('[API] Configurando función global de logout');
  globalLogoutFunction = logoutFn;
};

// Función para ejecutar el logout global
export const executeGlobalLogout = async (reason: string) => {
  console.log(`[API] Ejecutando logout global. Razón: ${reason}`);
  
  // Mostrar alerta al usuario
  import('react-native').then(({ Alert }) => {
    Alert.alert(
      'Sesión expirada',
      'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      [{ text: 'Aceptar' }]
    );
  }).catch(err => {
    console.error('[API] Error al importar Alert:', err);
  });
  
  if (globalLogoutFunction) {
    try {
      await globalLogoutFunction();
      console.log('[API] Logout global ejecutado correctamente');
    } catch (error) {
      console.error('[API] Error al ejecutar logout global:', error);
    }
  } else {
    console.warn('[API] No hay función de logout global configurada');
  }
};

// Forzar la URL correcta para el emulador Android antes de crear el cliente
console.log('[API] Configurando URL base fija para el backend: http://10.0.2.2:3001');
apiConfig.setCustomUrl('http://10.0.2.2:3001');

// Mostrar todas las URLs alternativas para depuración
console.log('[API] URLs alternativas disponibles:');
[
  'http://10.0.2.2:3001',
  'http://localhost:3001',
  'http://192.168.1.100:3001',
  'http://192.168.0.100:3001',
  'http://127.0.0.1:3001'
].forEach(url => {
  console.log(`[API] - ${url}`);
});

// Crear el cliente Axios con la configuración
export const client = axios.create(apiConfig.getConfig());

// Mostrar la configuración actual
console.log('[API] Cliente API creado con la siguiente configuración:');
console.log(`[API] URL base: ${apiConfig.getBaseUrl()}`);
console.log(`[API] Timeout: ${apiConfig.getConfig().timeout}ms`);

// Función para refrescar el token
const refreshAuthToken = async (): Promise<string | null> => {
  try {
    console.log('[API] Intentando refrescar token...');
    
    // Obtener el token actual
    const currentToken = await AsyncStorage.getItem('@token');
    
    if (!currentToken) {
      console.log('[API] No hay token para refrescar');
      return null;
    }
    
    // Llamar al endpoint de refresh token
    const response = await axios.post(
      `${apiConfig.getBaseUrl()}/auth/refresh-token`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.accessToken) {
      const newToken = response.data.accessToken;
      
      // Guardar el nuevo token
      await AsyncStorage.setItem('@token', newToken);
      console.log('[API] Token refrescado correctamente');
      
      return newToken;
    } else {
      console.log('[API] No se pudo obtener un nuevo token');
      return null;
    }
  } catch (error) {
    console.error('[API] Error al refrescar token:', error);
    return null;
  }
};

// Interceptor para las solicitudes
client.interceptors.request.use(async config => {
  try {
    // Agregar token de autenticación si existe
    // Usamos la clave '@token' que es la que se usa en AuthContext.tsx
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Token agregado a la solicitud');
    } else {
      console.warn('[API] No se encontró token para la solicitud');
    }

    // Agregar ID de tienda si existe
    // Intentar obtener el ID de tienda de varias claves posibles para mayor compatibilidad
    let tiendaId = await AsyncStorage.getItem('@tiendaId');
    if (!tiendaId) {
      tiendaId = await AsyncStorage.getItem('selectedTienda');
    }
    if (!tiendaId) {
      tiendaId = await AsyncStorage.getItem('tiendaPrincipal');
    }
    
    if (tiendaId) {
      config.headers['X-Store-ID'] = tiendaId;
      console.log(`[API] ID de tienda agregado a la solicitud: ${tiendaId}`);
    }

    // Registrar la solicitud en los logs
    apiLogger.logRequest(config);
    
    return config;
  } catch (error) {
    console.error('[API Request Interceptor Error]', error);
    return Promise.reject(error);
  }
}, error => {
  console.error('[API Request Config Error]', error);
  return Promise.reject(error);
});

// Interceptor para las respuestas
client.interceptors.response.use(
  response => {
    // Registrar la respuesta en los logs con más detalles
    console.log(`\n[API] RESPUESTA RECIBIDA:`);
    console.log(`[API] URL: ${response.config.url}`);
    console.log(`[API] Método: ${response.config.method?.toUpperCase()}`);
    console.log(`[API] Estado: ${response.status} ${response.statusText}`);
    console.log(`[API] Headers relevantes: ${JSON.stringify({
      'content-type': response.headers['content-type']
    })}`);
    console.log(`[API] Datos de la respuesta: ${JSON.stringify(response.data, null, 2)}`);
    
    // Log resumido para la consola
    apiLogger.logResponse(response);
    
    return response;
  },
  async (error: AxiosError) => {
    // Registrar el error en los logs con más detalles
    console.log(`\n[API] ERROR EN LA SOLICITUD:`);
    console.log(`[API] URL: ${error.config?.url}`);
    console.log(`[API] Método: ${error.config?.method?.toUpperCase()}`);
    console.log(`[API] Datos enviados: ${error.config?.data ? JSON.stringify(JSON.parse(error.config.data), null, 2) : 'Ninguno'}`);
    
    if (error.response) {
      console.log(`[API] Código de estado: ${error.response.status} ${error.response.statusText}`);
      console.log(`[API] Datos del error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.log(`[API] No se recibió respuesta del servidor`);
      console.log(`[API] Detalles: ${error.message}`);
    } else {
      console.log(`[API] Error al configurar la solicitud: ${error.message}`);
    }
    
    // Log resumido para la consola
    apiLogger.logError(error);
    
    // Manejar errores específicos
    if (error.response) {
      // Procesar el error según su código de estado
      console.log(`[API] Procesando error con código ${error.response.status}`);
      
      // Error 401: No autorizado (token inválido o expirado)
      if (error.response.status === 401) {
        // Verificar si tenemos la configuración original de la solicitud
        const originalRequest = error.config;
        
        // Verificar si ya intentamos refrescar el token para esta solicitud
        // @ts-ignore
        if (originalRequest && !originalRequest._retry) {
          try {
            // Marcar que estamos intentando refrescar el token
            // @ts-ignore
            originalRequest._retry = true;
            
            // Intentar refrescar el token
            const newToken = await refreshAuthToken();
            
            if (newToken) {
              // Actualizar el token en la solicitud original
              // @ts-ignore
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              
              // Reintentar la solicitud original con el nuevo token
              console.log('[API] Reintentando solicitud con nuevo token');
              return client(originalRequest);
            }
          } catch (refreshError) {
            console.error('[API] Error al refrescar token y reintentar:', refreshError);
          }
        }
        
        // Si llegamos aquí, no pudimos refrescar el token o ya lo intentamos
        // Intentar obtener información sobre el error
        let errorMessage = 'Credenciales inválidas o sesión expirada';
        
        if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          const message = error.response.data.message;
          if (typeof message === 'string') {
            errorMessage = message;
          }
        }
        
        // Crear un error personalizado
        const authError = new Error(errorMessage) as AxiosError;
        authError.response = error.response;
        authError.request = error.request;
        authError.config = error.config;
        
        // Notificar al usuario sobre el error de autenticación
        console.error('[API Error]', `${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, JSON.stringify(error.response.data));
        
        // Ejecutar logout global
        await executeGlobalLogout('Token expirado o inválido');
        
        // Devolver el error para que pueda ser manejado por el código que hizo la solicitud
        return Promise.reject(authError);
      }
      
      // Error 403: Prohibido (no tiene permisos)
      if (error.response.status === 403) {
        let errorMessage = 'No tienes permisos para realizar esta acción';
        
        if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          const message = error.response.data.message;
          if (typeof message === 'string') {
            errorMessage = message;
          } else if (Array.isArray(message) && message.length > 0 && typeof message[0] === 'string') {
            errorMessage = message.join(', ');
          }
        }
        
        const customError = new Error(errorMessage) as AxiosError;
        customError.response = error.response;
        customError.config = error.config;
        return Promise.reject(customError);
      }
      
      // Error 404: No encontrado
      if (error.response.status === 404) {
        let errorMessage = 'El recurso solicitado no existe';
        
        if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          const message = error.response.data.message;
          if (typeof message === 'string') {
            errorMessage = message;
          } else if (Array.isArray(message) && message.length > 0 && typeof message[0] === 'string') {
            errorMessage = message.join(', ');
          }
        }
        
        const customError = new Error(errorMessage) as AxiosError;
        customError.response = error.response;
        customError.config = error.config;
        return Promise.reject(customError);
      }
      
      // Error 400: Bad Request
      if (error.response.status === 400) {
        let errorMessage = 'Datos inválidos en la solicitud';
        
        // Intentar extraer mensajes de error específicos
        if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          const message = error.response.data.message;
          if (Array.isArray(message) && message.length > 0 && typeof message[0] === 'string') {
            errorMessage = message.join(', ');
          } else if (typeof message === 'string') {
            errorMessage = message;
          }
        }
        
        const customError = new Error(errorMessage) as AxiosError;
        customError.response = error.response;
        customError.config = error.config;
        return Promise.reject(customError);
      }
      
      // Error 500: Error del servidor
      if (error.response.status >= 500) {
        let errorMessage = 'Error interno del servidor';
        
        if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          const message = error.response.data.message;
          if (typeof message === 'string') {
            errorMessage = message;
          } else if (Array.isArray(message) && message.length > 0 && typeof message[0] === 'string') {
            errorMessage = message.join(', ');
          }
        }
        
        const customError = new Error(errorMessage) as AxiosError;
        customError.response = error.response;
        customError.config = error.config;
        return Promise.reject(customError);
      }

      // Otros errores
      return Promise.reject(error);
    } else if (error.request) {
      // Error de red (no se recibió respuesta)
      const networkError = new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.') as AxiosError;
      networkError.request = error.request;
      networkError.config = error.config;
      return Promise.reject(networkError);
    }
    
    // Otros errores
    return Promise.reject(error);
  }
);

// Funciones de utilidad para la API
export const configureApiUrl = (url: string | null) => {
  apiConfig.setCustomUrl(url);
  // Recrear el cliente con la nueva configuración
  Object.assign(client.defaults, apiConfig.getConfig());
  console.log(`[API] URL base configurada a: ${url || apiConfig.getBaseUrl()}`);
};

export const ApiService = {
  // Obtener la configuración actual
  getConfig: () => apiConfig.getConfig(),
  
  // Cambiar el entorno
  setEnvironment: (env: Environment) => apiConfig.setEnvironment(env),
  
  // Habilitar/deshabilitar logs
  enableLogs: (enabled: boolean) => apiLogger.setEnabled(enabled),
  
  // Obtener la URL base actual
  getBaseUrl: () => apiConfig.getBaseUrl(),
  
  // Función para verificar la conexión con el backend
  checkConnection: async (): Promise<boolean> => {
    try {
      // Asegurarnos de que estamos usando la URL correcta para el emulador Android
      const currentUrl = apiConfig.getBaseUrl();
      if (currentUrl !== 'http://10.0.2.2:3001') {
        console.log('[API] Restaurando URL correcta para el emulador Android: http://10.0.2.2:3001');
        configureApiUrl('http://10.0.2.2:3001');
      }
      
      console.log('[API] Verificando conexión con el backend usando URL: http://10.0.2.2:3001');
      
      // Intentar con diferentes endpoints para verificar la conexión
      try {
        // Primero intentar con una solicitud simple
        await client.get('/');
        console.log('[API] Conexión exitosa con la ruta raíz');
        return true;
      } catch (rootError) {
        console.log('[API] No se pudo conectar con la ruta raíz, probando endpoints alternativos');
        
        // Probar con endpoints alternativos
        const endpoints = ['/health', '/auth/health', '/api/health', '/status'];
        
        for (const endpoint of endpoints) {
          try {
            await client.get(endpoint);
            console.log(`[API] Conexión exitosa con endpoint: ${endpoint}`);
            return true;
          } catch (e) {
            console.warn(`[API] No se pudo conectar con endpoint: ${endpoint}`);
          }
        }
        
        // Si todos los endpoints fallan, intentar una solicitud directa con axios
        try {
          console.log('[API] Intentando conexión directa con axios...');
          await axios.get('http://10.0.2.2:3001', { timeout: 5000 });
          console.log('[API] Conexión directa exitosa');
          return true;
        } catch (error: any) {
          console.error('[API] Fallo en conexión directa:', error.message || 'Error desconocido');
        }
      }
      
      console.error('[API] No se pudo establecer conexión con el backend');
      return false;
    } catch (error) {
      console.error('[API] Error general al verificar conexión:', error);
      return false;
    }
  }
};
