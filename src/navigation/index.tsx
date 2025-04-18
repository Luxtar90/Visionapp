import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../hooks/useAuth';
import AuthStack from './AuthStack';
import AdminTabNavigator from './AdminTabNavigator';
import EmpleadoTabNavigator from './EmpleadoTabNavigator';
import ClienteTabNavigator from './ClienteTabNavigator';
import SeleccionarTiendaScreen from '../screens/Cliente/SeleccionarTiendaScreen';
import { Usuario } from '../interfaces/Usuario';

export default function Navigation() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const [tiendaId, setTiendaId] = React.useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);
  const [authChecked, setAuthChecked] = React.useState(false);

  // Para depuración - mostrar el estado actual de forma detallada
  React.useEffect(() => {
    console.log('[Navigation] Estado actual:', {
      isAuthenticated,
      tiendaId,
      userRole: user?.rol || 'no definido',
      initialLoadComplete,
      authChecked,
      userId: user?.id || 'no disponible',
      userEmail: user?.email || 'no disponible',
      tokenPresent: !!token
    });
  }, [isAuthenticated, user, tiendaId, initialLoadComplete, authChecked, token]);

  // Efecto para verificar el estado de autenticación al inicio
  React.useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Verificar si hay un token guardado en AsyncStorage
        const storedToken = await AsyncStorage.getItem('token');
        console.log('[Navigation] Token en AsyncStorage:', storedToken ? 'Presente' : 'No encontrado');
        
        // Verificar si hay datos de usuario guardados
        const storedUser = await AsyncStorage.getItem('@user');
        console.log('[Navigation] Usuario en AsyncStorage:', storedUser ? 'Presente' : 'No encontrado');
        
        // Verificar si el estado de autenticación coincide con los datos almacenados
        if (storedToken && storedUser && !isAuthenticated) {
          console.log('[Navigation] Hay datos de sesión pero isAuthenticated es false');
          console.log('[Navigation] Esto puede indicar que el contexto de autenticación no se ha inicializado correctamente');
        }
        
        if (!storedToken && isAuthenticated) {
          console.log('[Navigation] ADVERTENCIA: isAuthenticated es true pero no hay token guardado');
        }
        
        setAuthChecked(true);
      } catch (error) {
        console.error('[Navigation] Error al verificar el estado de autenticación:', error);
        setAuthChecked(true); // Marcamos como verificado aunque haya error
      }
    };
    
    checkAuthState();
  }, [isAuthenticated]); // Solo se ejecuta cuando cambia isAuthenticated

  // Efecto para cargar la tienda seleccionada cuando el usuario está autenticado
  React.useEffect(() => {
    console.log('[Navigation] Verificando estado de autenticación:', { 
      isAuthenticated, 
      user: user ? `${user.nombre} (${user.email})` : 'null',
      authChecked
    });
    
    const checkTienda = async () => {
      try {
        // Verificar si hay una tienda seleccionada
        const storedTiendaId = await AsyncStorage.getItem('selectedTienda');
        console.log('[Navigation] Tienda almacenada:', storedTiendaId || 'No encontrada');
        
        if (storedTiendaId) {
          setTiendaId(storedTiendaId);
        } else if (user && user.tiendaId) {
          // Si no hay tienda guardada pero el usuario tiene una tienda asignada
          const userTiendaId = String(user.tiendaId);
          console.log(`[Navigation] Usando tienda del usuario: ${userTiendaId}`);
          setTiendaId(userTiendaId);
          await AsyncStorage.setItem('selectedTienda', userTiendaId);
        }
      } catch (error) {
        console.error('[Navigation] Error al obtener la tienda:', error);
      } finally {
        // Marcar que la carga inicial ha terminado
        setInitialLoadComplete(true);
      }
    };
    
    if (isAuthenticated && user) {
      console.log('[Navigation] Usuario autenticado, verificando tienda seleccionada');
      checkTienda();
    } else {
      // Si no está autenticado, también completamos la carga inicial
      console.log('[Navigation] Usuario no autenticado, mostrando pantalla de login');
      setInitialLoadComplete(true);
    }
    
    // Timeout de seguridad para evitar que se quede cargando indefinidamente
    const safetyTimeout = setTimeout(() => {
      if (!initialLoadComplete) {
        console.log('[Navigation] Timeout de seguridad activado');
        setInitialLoadComplete(true);
      }
    }, 3000); // 3 segundos máximo de espera
    
    return () => clearTimeout(safetyTimeout);
  }, [isAuthenticated, user, authChecked]);

  // Mostrar pantalla de carga solo durante la carga inicial y por un tiempo limitado
  if (loading && !initialLoadComplete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  // Determinar qué pantalla mostrar basado en el estado de autenticación
  const renderScreen = () => {
    // Si el usuario no está autenticado, mostrar pantalla de login/registro
    if (!isAuthenticated) {
      console.log('[Navigation] Renderizando AuthStack (no autenticado)');
      return <AuthStack />;
    }
    
    // Si el usuario está autenticado pero no tiene tienda seleccionada
    if (!tiendaId) {
      console.log('[Navigation] Renderizando SeleccionarTiendaScreen (sin tienda)');
      return <SeleccionarTiendaScreen />;
    }
    
    // Si el usuario está autenticado y tiene tienda, mostrar navegador según rol
    console.log('[Navigation] Renderizando navegador para rol:', user?.rol || 'no definido');
    return getRoleNavigator(user?.rol);
  };
  
  return (
    <NavigationContainer>
      {renderScreen()}
    </NavigationContainer>
  );
}

// Función para determinar qué navegador mostrar según el rol del usuario
const getRoleNavigator = (rol: string | undefined) => {
  console.log('[Navigation] Seleccionando navegador para rol:', rol || 'no definido');
  
  // Si el rol no está definido, asumimos que es cliente (comportamiento por defecto)
  if (!rol) {
    console.log('[Navigation] Rol no definido, usando navegador de cliente por defecto');
    return <ClienteTabNavigator />;
  }
  
  // Map roles to their respective navigators
  switch (rol) {
    case 'admin':
      console.log('[Navigation] Usando navegador de administrador');
      return <AdminTabNavigator />;
    case 'empleado':
      console.log('[Navigation] Usando navegador de empleado');
      return <EmpleadoTabNavigator />;
    case 'cliente':
      console.log('[Navigation] Usando navegador de cliente');
      return <ClienteTabNavigator />;
    default:
      console.log('[Navigation] Rol desconocido, usando navegador de cliente por defecto');
      return <ClienteTabNavigator />;
  }
};
