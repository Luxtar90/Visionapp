// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, Usuario as AuthUsuario, LoginResponse } from '../api/auth.api';

/**
 * Propiedades del contexto de autenticación
 */
interface AuthContextProps {
  // Estado
  user: AuthUsuario | null;
  token: string | null;
  tiendaId: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Funciones básicas de autenticación
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { 
    nombre: string; 
    email: string; 
    telefono?: string;
  }, password: string, tiendaId?: number) => Promise<void>;
  logout: () => Promise<void>;
  
  // Funciones de gestión de tienda
  selectTienda: (tiendaId: number) => Promise<void>;
  
  // Funciones de utilidad
  updateUser: (userData: Partial<AuthUsuario>) => Promise<void>;
  checkConnection: () => Promise<boolean>;
}
// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  tiendaId: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  selectTienda: async () => {},
  updateUser: async () => {},
  checkConnection: async () => false,
});
  
/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado de autenticación
  const [user, setUser] = useState<AuthUsuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos de usuario al iniciar la aplicación
  useEffect(() => {
    // Iniciar la carga de datos
    loadUserData();
    
    // Timeout de seguridad para evitar que la pantalla se quede cargando indefinidamente
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('[AuthContext] Timeout de seguridad activado para evitar carga indefinida');
        setLoading(false);
      }
    }, 5000); // 5 segundos máximo de carga
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  /**
   * Carga los datos del usuario desde el almacenamiento local
   */
  const loadUserData = async () => {
    console.log('[AuthContext] Cargando datos de usuario desde almacenamiento local');
    setLoading(true);
    
    try {
      // Obtener token
      const storedToken = await AsyncStorage.getItem('token');
      console.log('[AuthContext] Token almacenado:', storedToken ? 'Existe' : 'No existe');
      
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        
        // Obtener datos de usuario
        try {
          // Primero intentamos cargar desde AsyncStorage
          const storedUser = await AsyncStorage.getItem('@user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('[AuthContext] Usuario cargado desde almacenamiento local');
          } else {
            // Si no hay datos en AsyncStorage, los obtenemos del servidor
            try {
              const userData = await authApi.fetchMe();
              setUser(userData);
              console.log('[AuthContext] Usuario cargado desde el servidor');
            } catch (fetchError) {
              console.error('[AuthContext] Error al obtener usuario del servidor:', fetchError);
              // Si falla la obtención del servidor, mantenemos el estado de autenticación pero sin datos de usuario
            }
          }
          
          // Obtener tienda seleccionada
          const storedTienda = await AsyncStorage.getItem('tiendaId');
          if (storedTienda) {
            setTiendaId(Number(storedTienda));
          }
        } catch (e) {
          console.error('[AuthContext] Error al cargar datos de usuario:', e);
          // Si hay un error al obtener los datos, cerramos sesión
          try {
            await logout();
          } catch (logoutError) {
            console.error('[AuthContext] Error al cerrar sesión:', logoutError);
            // Forzamos el reseteo del estado aunque falle el logout
            setToken(null);
            setUser(null);
            setTiendaId(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        console.log('[AuthContext] No hay sesión activa');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error al cargar datos:', error);
      // Aseguramos que el usuario no esté autenticado en caso de error
      setIsAuthenticated(false);
    } finally {
      // Siempre terminamos la carga, independientemente del resultado
      console.log('[AuthContext] Finalizando carga de datos');
      setLoading(false);
    }
  };

  /**
   * Inicia sesión con email y contraseña
   */
  const login = async (email: string, password: string) => {
    console.log(`[AuthContext] Iniciando sesión: ${email}`);
    setLoading(true);
    
    try {
      // Validar que el email y password no estén vacíos
      if (!email || !password) {
        throw new Error('El email y la contraseña son obligatorios');
      }
      
      // Llamar a la API de login - esta llamada lanzará una excepción si las credenciales son inválidas
      // gracias a las validaciones que hemos añadido en auth.api.ts
      const response = await authApi.login(email, password);
      
      // Verificar que la respuesta sea válida
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      // Obtener token y datos de usuario de la respuesta
      const tokenValue = response.access_token || response.accessToken;
      const userData = response.user || response.usuario;
      
      // Verificar que se recibió un token
      if (!tokenValue) {
        throw new Error('No se recibió token de acceso');
      }
      
      // Verificar que se recibieron datos de usuario
      if (!userData) {
        throw new Error('No se recibieron datos de usuario');
      }
      
      // Mostrar detalles completos de la respuesta (ocultando parte del token por seguridad)
      const tokenDisplay = tokenValue ? `${tokenValue.substring(0, 20)}...` : 'No token';
      
      console.log('[AuthContext] Respuesta de login recibida:');
      console.log(`[AuthContext] Token: ${tokenDisplay}`);
      console.log(`[AuthContext] Tipo de token: ${response.tokenType || 'No especificado'}`);
      console.log(`[AuthContext] Expira en: ${response.expiresIn || 'No especificado'} segundos`);
      
      // Mostrar información del usuario
      console.log('[AuthContext] Datos del usuario:');
      console.log(`[AuthContext] ID: ${userData.id}`);
      console.log(`[AuthContext] Nombre: ${userData.nombre}`);
      console.log(`[AuthContext] Email: ${userData.email}`);
      console.log(`[AuthContext] Rol: ${userData.rol}`);
      
      // Guardar token en AsyncStorage
      console.log('[AuthContext] Guardando token en AsyncStorage...');
      await AsyncStorage.setItem('token', tokenValue);
      
      // Guardar datos de usuario en AsyncStorage
      console.log('[AuthContext] Guardando datos de usuario en AsyncStorage...');
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      
      // Actualizar el estado con los datos recibidos
      console.log('[AuthContext] Actualizando estado...');
      setToken(tokenValue);
      setUser(userData);
      
      // IMPORTANTE: Actualizar el estado de autenticación al final
      console.log('[AuthContext] Estableciendo isAuthenticated = true');
      setIsAuthenticated(true);
      
      console.log('[AuthContext] Sesión iniciada correctamente');
      
      // Forzar una actualización del estado para asegurar que la navegación reaccione
      // Usamos un timeout más largo para dar tiempo a que React actualice el estado
      setTimeout(() => {
        console.log('[AuthContext] Verificando estado de autenticación después del login:');
        console.log(`[AuthContext] isAuthenticated: ${isAuthenticated}`);
        console.log(`[AuthContext] user: ${user ? user.nombre : 'null'}`);
        console.log(`[AuthContext] token: ${token ? 'Presente' : 'null'}`);
        
        // Si el estado no se actualizó correctamente, intentar forzar una actualización
        if (!isAuthenticated || !user || !token) {
          console.log('[AuthContext] Estado no actualizado correctamente, forzando actualización...');
          setIsAuthenticated(true);
          setUser(userData);
          setToken(tokenValue);
        }
      }, 1000);
    } catch (error) {
      console.error('[AuthContext] Error al iniciar sesión:', error);
      // Limpiamos cualquier dato parcial que pudiera haberse guardado
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('@user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      console.log('[AuthContext] Finalizando proceso de login');
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   */
  const register = async (
    userData: { 
      nombre: string; 
      email: string; 
      telefono?: string;
    },
    password: string,
    tiendaId?: number
  ) => {
    console.log(`[AuthContext] Registrando nuevo usuario: ${userData.email}`);
    setLoading(true);
    
    try {
      // Validar datos
      if (!userData.nombre || !userData.email || !password) {
        throw new Error('Nombre, email y contraseña son obligatorios');
      }
      
      // Crear el objeto con el formato exacto que espera el endpoint /auth/register
      // Según la documentación: nombre, email, password, tiendaId
      const registerData = {
        nombre: userData.nombre,
        email: userData.email,
        password,
        tiendaId: tiendaId || 1 // Por defecto, tienda 1
      };
      
      // Crear un objeto separado para pasar a la API
      const apiRegisterData: any = {
        ...registerData
      };
      
      // Añadir teléfono solo si existe (es opcional)
      if (userData.telefono) {
        apiRegisterData.telefono = userData.telefono;
      }
      
      console.log(`[AuthContext] Registrando cliente con tiendaId: ${tiendaId || 1}`);
      console.log(`[AuthContext] Datos de registro:`, JSON.stringify(apiRegisterData, null, 2));
      const response = await authApi.register(apiRegisterData);
      console.log('[AuthContext] Respuesta de registro recibida:', { 
        hasAccessToken: !!(response.access_token || response.accessToken),
        hasUser: !!(response.user || response.usuario)
      });
      
      // El token puede venir como access_token o accessToken
      const tokenValue = response.access_token || response.accessToken;
      if (!tokenValue) {
        throw new Error('No se recibió token de acceso');
      }
      
      // Guardar token
      await AsyncStorage.setItem('token', tokenValue);
      setToken(tokenValue);
      
      // El usuario puede venir como user o usuario
      const userInfo = response.user || response.usuario;
      if (userInfo) {
        await AsyncStorage.setItem('@user', JSON.stringify(userInfo));
        setUser(userInfo);
      } else {
        // Si no viene el usuario en la respuesta, lo obtenemos del servidor
        try {
          const fetchedUser = await authApi.fetchMe();
          await AsyncStorage.setItem('@user', JSON.stringify(fetchedUser));
          setUser(fetchedUser);
        } catch (fetchError) {
          console.error('[AuthContext] Error al obtener datos del usuario:', fetchError);
          // Continuamos aunque no podamos obtener los datos del usuario
        }
      }
      
      // Guardar tiendaId seleccionada
      if (tiendaId) {
        await AsyncStorage.setItem('tiendaId', tiendaId.toString());
        setTiendaId(tiendaId);
      }
      
      setIsAuthenticated(true);
      console.log('[AuthContext] Usuario registrado correctamente');
    } catch (error) {
      console.error('[AuthContext] Error al registrar usuario:', error);
      // Limpiamos cualquier dato parcial que pudiera haberse guardado
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('@user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      console.log('[AuthContext] Finalizando proceso de registro');
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const logout = async () => {
    try {
      console.log('[AuthContext] Cerrando sesión');
      setLoading(true); // Indicar que estamos procesando
      
      // Notificar al servidor (opcional)
      try {
        await authApi.logout();
      } catch (e) {
        console.warn('[AuthContext] Error al notificar logout al servidor:', e);
        // Continuamos con el proceso aunque falle la notificación al servidor
      }
      
      // Limpiar almacenamiento local
      const removePromises = [
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('@user'),
        AsyncStorage.removeItem('tiendaId'),
        AsyncStorage.removeItem('selectedTienda') // También limpiamos la tienda seleccionada
      ];
      
      await Promise.all(removePromises);
      
      // Actualizar estado
      setToken(null);
      setUser(null);
      setTiendaId(null);
      setIsAuthenticated(false);
      
      console.log('[AuthContext] Sesión cerrada correctamente');
    } catch (error) {
      console.error('[AuthContext] Error al cerrar sesión:', error);
      // Aún si hay un error, forzamos el reseteo del estado
      setToken(null);
      setUser(null);
      setTiendaId(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Siempre terminamos la carga
    }
  };

  /**
   * Selecciona una tienda para el usuario actual
   */
  const selectTienda = async (id: number) => {
    try {
      console.log(`[AuthContext] Seleccionando tienda: ${id}`);
      await AsyncStorage.setItem('tiendaId', id.toString());
      setTiendaId(id);
      console.log('[AuthContext] Tienda seleccionada correctamente');
    } catch (error) {
      console.error('[AuthContext] Error al seleccionar tienda:', error);
      throw error;
    }
  };

  /**
   * Actualiza los datos del usuario
   */
  const updateUser = async (userData: Partial<AuthUsuario>) => {
    try {
      console.log('[AuthContext] Actualizando datos del usuario');
      setLoading(true);
      
      // Actualizar en el servidor
      if (user?.id) {
        // Aquí iría la llamada a la API para actualizar el usuario
        // const updatedUser = await updateUserApi(user.id, userData);
        
        // Por ahora, solo actualizamos localmente
        const updatedUser = { ...user, ...userData };
        await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      console.log('[AuthContext] Datos de usuario actualizados correctamente');
    } catch (error) {
      console.error('[AuthContext] Error al actualizar usuario:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica la conexión con el servidor
   */
  const checkConnection = async (): Promise<boolean> => {
    try {
      console.log('[AuthContext] Verificando conexión con el servidor');
      const isConnected = await authApi.checkAuthServer();
      console.log(`[AuthContext] Estado de conexión: ${isConnected ? 'Conectado' : 'Desconectado'}`);
      return isConnected;
    } catch (error) {
      console.error('[AuthContext] Error al verificar conexión:', error);
      return false;
    }
  };
  // Proporcionar el contexto a los componentes hijos
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tiendaId,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        selectTienda,
        updateUser,
        checkConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de autenticación
 */
export const useAuth = () => useContext(AuthContext);
  