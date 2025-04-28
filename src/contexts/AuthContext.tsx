// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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
  authReady: boolean;
  
  // Funciones básicas de autenticación
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { 
    nombre: string; 
    email: string; 
    telefono?: string;
  }, password: string, tiendaId?: number) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  
  // Funciones de gestión de tienda
  selectTienda: (tiendaId: number) => Promise<void>;
  
  // Funciones de utilidad
  updateUser: (userData: Partial<AuthUsuario>) => Promise<void>;
  checkConnection: () => Promise<boolean>;
  updateAuthState: (tokenValue: string, userData: AuthUsuario) => void;
}
// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  tiendaId: null,
  isAuthenticated: false,
  loading: true,
  authReady: false,
  login: async () => {},
  register: async () => ({ 
    accessToken: '', 
    tokenType: '', 
    expiresIn: 0, 
    usuario: { id: 0, nombre: '', email: '', rol: '', tiendaId: 1 } 
  }),
  logout: async () => {},
  selectTienda: async () => {},
  updateUser: async () => {},
  checkConnection: async () => false,
  updateAuthState: () => {}
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
  const [authReady, setAuthReady] = useState(false);

  // Efecto para cargar los datos de usuario al inicio
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('[AuthContext] Cargando datos de usuario desde AsyncStorage...');
        
        // Obtener token de AsyncStorage
        const storedToken = await AsyncStorage.getItem('@token');
        console.log('[AuthContext] Token almacenado:', storedToken ? 'Existe' : 'No existe');
        
        if (storedToken) {
          // Establecer el token en el estado
          setToken(storedToken);
          
          // Obtener datos de usuario
          const storedUser = await AsyncStorage.getItem('@user');
          console.log('[AuthContext] Usuario almacenado:', storedUser ? 'Existe' : 'No existe');
          
          if (storedUser) {
            try {
              let userData = JSON.parse(storedUser);
              
              // Verificar si el usuario es un string (doble serialización)
              if (typeof userData === 'string') {
                console.log('[AuthContext] Usuario almacenado es un string, intentando parsear nuevamente');
                userData = JSON.parse(userData);
              }
              
              console.log('[AuthContext] Datos de usuario cargados:', {
                id: userData.id,
                email: userData.email,
                rol: userData.rol,
                clienteId: userData.clienteId
              });
              
              // Establecer los datos de usuario en el estado
              setUser(userData);
              
              // IMPORTANTE: Establecer isAuthenticated como true DESPUÉS de cargar los datos
              console.log('[AuthContext] Estableciendo estado de autenticación como true');
              setIsAuthenticated(true);
              
              // Cargar tienda seleccionada
              const selectedTienda = await AsyncStorage.getItem('selectedTienda');
              if (selectedTienda) {
                setTiendaId(Number(selectedTienda));
              } else if (userData.clienteId) {
                setTiendaId(Number(userData.clienteId));
                await AsyncStorage.setItem('selectedTienda', String(userData.clienteId));
              }
            } catch (parseError) {
              console.error('[AuthContext] Error al parsear datos de usuario:', parseError);
              // Limpiar datos inválidos
              await AsyncStorage.removeItem('@token');
              await AsyncStorage.removeItem('@user');
              setToken(null);
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            console.log('[AuthContext] No hay datos de usuario almacenados');
            setIsAuthenticated(false);
          }
        } else {
          console.log('[AuthContext] No hay token almacenado');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[AuthContext] Error al cargar datos de usuario:', error);
        setIsAuthenticated(false);
      } finally {
        // Indicar que la carga inicial ha terminado
        setLoading(false);
        setAuthReady(true);
      }
    };
    
    loadUserData();
  }, []);

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
      
      // Usar axios directamente para garantizar la conexión
      console.log(`[AuthContext] Usando axios directamente para login...`);
      const baseURL = 'http://10.0.2.2:3001';
      
      const response = await axios.post(`${baseURL}/auth/login`, { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`[AuthContext] Respuesta de login recibida: ${response.status}`);
      console.log(`[AuthContext] Datos de respuesta:`, {
        accessToken: response.data.accessToken ? 'Presente' : 'No presente',
        usuario: response.data.usuario ? JSON.stringify(response.data.usuario) : 'No presente'
      });
      
      // Verificar que la respuesta sea válida
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      // Obtener token y datos de usuario de la respuesta
      const tokenValue = response.data.accessToken;
      const userData = response.data.usuario;
      
      // Verificar que se recibió un token
      if (!tokenValue) {
        throw new Error('No se recibió token de acceso');
      }
      
      // Verificar que se recibieron datos de usuario
      if (!userData) {
        throw new Error('No se recibieron datos de usuario');
      }
      
      // Guardar token en AsyncStorage
      console.log('[AuthContext] Guardando token en AsyncStorage...');
      await AsyncStorage.setItem('@token', tokenValue);
      
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
    } catch (error) {
      console.error('[AuthContext] Error al iniciar sesión:', error);
      // Limpiamos cualquier dato parcial que pudiera haberse guardado
      await AsyncStorage.removeItem('@token');
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
      // Según la documentación: nombre, email, password, rol, tiendaId
      const registerData = {
        nombre: userData.nombre,
        email: userData.email,
        password,
        rol: 'cliente', // Siempre 'cliente' según las memorias del sistema
        tiendaId: tiendaId || 1 // Por defecto, tienda 1
      };
      
      // Añadir teléfono solo si existe (es opcional)
      if (userData.telefono) {
        (registerData as any).telefono = userData.telefono;
      }
      
      console.log(`[AuthContext] Registrando cliente con tiendaId: ${tiendaId || 1}`);
      console.log(`[AuthContext] Datos de registro:`, {
        ...registerData,
        password: '***' // No mostrar la contraseña en los logs
      });
      
      // Usar axios directamente para garantizar la conexión
      console.log(`[AuthContext] Usando axios directamente para registro...`);
      const baseURL = 'http://10.0.2.2:3001';
      
      const response = await axios.post(`${baseURL}/auth/register`, registerData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`[AuthContext] Respuesta de registro recibida: ${response.status}`);
      console.log(`[AuthContext] Datos de respuesta:`, {
        accessToken: response.data.accessToken ? 'Presente' : 'No presente',
        usuario: response.data.usuario ? JSON.stringify(response.data.usuario) : 'No presente'
      });
      
      // El token viene como accessToken según auth-response.dto.ts
      const tokenValue = response.data.accessToken;
      if (!tokenValue) {
        throw new Error('No se recibió token de acceso');
      }
      
      // Guardar token
      await AsyncStorage.setItem('@token', tokenValue);
      setToken(tokenValue);
      
      // El usuario viene como usuario según auth-response.dto.ts
      const userInfo = response.data.usuario;
      if (userInfo) {
        await AsyncStorage.setItem('@user', JSON.stringify(userInfo));
        setUser(userInfo);
      }
      
      // Actualizar estado de autenticación
      setIsAuthenticated(true);
      
      console.log('[AuthContext] Registro completado con éxito');
      return response.data;
    } catch (error) {
      console.error('[AuthContext] Error al registrar usuario:', error);
      // Limpiamos cualquier dato parcial que pudiera haberse guardado
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
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
        AsyncStorage.removeItem('@token'),
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
   * Verificar la conexión con el servidor
   * @returns true si hay conexión con el servidor
   */
  const checkConnection = async (): Promise<boolean> => {
    try {
      console.log('[AuthContext] Verificando conexión con el servidor');
      
      // Usar axios directamente para verificar la conexión
      const axios = require('axios');
      const baseURL = 'http://10.0.2.2:3001';
      
      try {
        const response = await axios.get(baseURL, {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const isConnected = response.status === 200;
        console.log(`[AuthContext] Estado de conexión: ${isConnected ? 'Conectado' : 'Desconectado'}`);
        return isConnected;
      } catch (error) {
        console.error('[AuthContext] Error al verificar conexión:', error);
        return false;
      }
    } catch (error) {
      console.error('[AuthContext] Error al verificar conexión:', error);
      return false;
    }
  };

  /**
   * Actualiza el estado de autenticación directamente
   * Esta función es útil para forzar la autenticación desde fuera del contexto
   */
  const updateAuthState = (tokenValue: string, userData: AuthUsuario) => {
    console.log('[AuthContext] Actualizando estado de autenticación manualmente');
    console.log('[AuthContext] Datos de usuario:', {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      clienteId: userData.clienteId
    });
    
    // Actualizar el estado inmediatamente
    setToken(tokenValue);
    setUser(userData);
    setIsAuthenticated(true);
    setAuthReady(true);
    
    // Guardar los datos en AsyncStorage
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('@token', tokenValue);
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        
        // Guardar la tienda seleccionada si existe clienteId
        if (userData.clienteId) {
          const tiendaIdToUse = String(userData.clienteId);
          await AsyncStorage.setItem('selectedTienda', tiendaIdToUse);
          setTiendaId(Number(tiendaIdToUse)); // Actualizar el estado de tiendaId inmediatamente
          console.log('[AuthContext] Tienda guardada:', tiendaIdToUse);
        }
        
        console.log('[AuthContext] Datos guardados en AsyncStorage correctamente');
        
        // Forzar una segunda actualización del estado después de guardar los datos
        setTimeout(() => {
          console.log('[AuthContext] Forzando segunda actualización del estado');
          setToken(tokenValue);
          setUser(userData);
          if (userData.clienteId) {
            setTiendaId(Number(userData.clienteId)); // Asegurar que tiendaId esté actualizado
          }
          setIsAuthenticated(true);
          setAuthReady(true);
        }, 300);
      } catch (error) {
        console.error('[AuthContext] Error al guardar datos en AsyncStorage:', error);
      }
    };
    
    // Ejecutar la función de guardado
    saveData();
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
        authReady,
        login,
        register,
        logout,
        selectTienda,
        updateUser,
        checkConnection,
        updateAuthState
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