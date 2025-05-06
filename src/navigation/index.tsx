import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navegadores
import AuthStack from './AuthStack';
import AdminTabNavigator from './AdminTabNavigator';
import EmpleadoTabNavigator from './EmpleadoTabNavigator';
import ClienteTabNavigator from './ClienteTabNavigator';

// Pantallas
import SeleccionarTiendaScreen from '../screens/Cliente/SeleccionarTiendaScreen';
import { DetalleClienteScreen } from '../screens/Admin';

// Contexto de autenticación
import useAuth from '../hooks/useAuth';

// Crear el stack de navegación principal
const Stack = createNativeStackNavigator();

// Definir las rutas disponibles
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  SeleccionarTienda: undefined;
  DetalleCliente: { cliente: any };
  // Añadir más rutas según sea necesario
};

// Componente para pantalla de carga
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={{ marginTop: 10 }}>Cargando...</Text>
  </View>
);

// Componente de navegación principal
const Navigation = () => {
  // Estado para controlar la carga inicial
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedTienda, setSelectedTienda] = useState<string | null>(null);
  
  // Obtener el estado de autenticación del contexto
  const { isAuthenticated, user, token, updateAuthState } = useAuth();
  
  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('[Navigation] Cargando datos iniciales...');
        
        // Verificar si hay una navegación pendiente
        const pendingNavigation = await AsyncStorage.getItem('@pendingNavigation');
        if (pendingNavigation) {
          console.log('[Navigation] Navegación pendiente detectada:', pendingNavigation);
          // Limpiar la bandera de navegación pendiente
          await AsyncStorage.removeItem('@pendingNavigation');
        }
        
        // Obtener token y datos de usuario de AsyncStorage
        const storedToken = await AsyncStorage.getItem('@token');
        const storedUserData = await AsyncStorage.getItem('@user');
        const storedTienda = await AsyncStorage.getItem('selectedTienda');
        
        console.log('[Navigation] Datos obtenidos de AsyncStorage:', {
          token: storedToken ? 'Presente' : 'No presente',
          userData: storedUserData ? 'Presente' : 'No presente',
          tienda: storedTienda,
          pendingNavigation
        });
        
        // Actualizar el estado de tienda seleccionada
        setSelectedTienda(storedTienda);
        
        // Si hay token y datos de usuario, actualizar el estado de autenticación
        if (storedToken && storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('[Navigation] Actualizando estado de autenticación con datos:', {
              id: userData.id,
              nombre: userData.nombre,
              email: userData.email,
              rol: userData.rol
            });
            
            // Actualizar el estado de autenticación
            updateAuthState(storedToken, userData);
          } catch (error) {
            console.error('[Navigation] Error al parsear datos de usuario:', error);
          }
        }
      } catch (error) {
        console.error('[Navigation] Error al cargar datos iniciales:', error);
      } finally {
        // Marcar la carga inicial como completada
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    // Cargar datos iniciales
    loadInitialData();
  }, []);
  
  // Efecto para monitorear cambios en el estado de autenticación
  useEffect(() => {
    if (initialLoadComplete) {
      console.log('[Navigation] Estado de autenticación actualizado:', {
        isAuthenticated,
        userRole: user?.rol,
        selectedTienda
      });
    }
  }, [isAuthenticated, user, initialLoadComplete, selectedTienda]);
  
  // Efecto para monitorear cambios en la tienda seleccionada en AsyncStorage
  useEffect(() => {
    const checkSelectedTienda = async () => {
      try {
        const storedTienda = await AsyncStorage.getItem('selectedTienda');
        if (storedTienda !== selectedTienda) {
          console.log('[Navigation] Tienda seleccionada actualizada en AsyncStorage:', storedTienda);
          setSelectedTienda(storedTienda);
        }
      } catch (error) {
        console.error('[Navigation] Error al verificar tienda seleccionada:', error);
      }
    };
    
    // Verificar la tienda seleccionada cada 1 segundo
    const interval = setInterval(checkSelectedTienda, 1000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [selectedTienda]);
  
  // Función para determinar qué navegador mostrar según el rol del usuario
  const getRoleNavigator = (rol: string | undefined) => {
    console.log('[Navigation] Seleccionando navegador para rol:', rol || 'no definido');
    
    // Si el rol no está definido, asumimos que es cliente (comportamiento por defecto)
    if (!rol) {
      console.log('[Navigation] Rol no definido, usando navegador de cliente por defecto');
      return <ClienteTabNavigator />;
    }
    
    // Map roles to their respective navigators
    const rolLowerCase = rol.toLowerCase();
    console.log('[Navigation] Rol en minúsculas:', rolLowerCase);
    
    // Según la memoria del proyecto, estos son los mapeos de roles:
    // - "admin" o "administrador" → AdminTabNavigator
    // - "empleado" o "vendedor" → EmpleadoTabNavigator
    // - "cliente" o "user" → ClienteTabNavigator
    switch (rolLowerCase) {
      case 'admin':
      case 'administrador':
        console.log('[Navigation] Usando navegador de administrador');
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={AdminTabNavigator} />
            <Stack.Screen name="DetalleCliente" component={DetalleClienteScreen} />
          </Stack.Navigator>
        );
      case 'empleado':
      case 'vendedor':
        console.log('[Navigation] Usando navegador de empleado');
        return <EmpleadoTabNavigator />;
      case 'cliente':
      case 'user':  
        console.log('[Navigation] Usando navegador de cliente');
        return <ClienteTabNavigator />;
      default:
        console.log('[Navigation] Rol desconocido:', rolLowerCase);
        console.log('[Navigation] Usando navegador de cliente por defecto');
        return <ClienteTabNavigator />;
    }
  };
  
  // Renderizar la pantalla según el estado de autenticación
  const renderScreen = () => {
    // Si está cargando, mostrar pantalla de carga
    if (loading) {
      console.log('[Navigation] Mostrando pantalla de carga');
      return <LoadingScreen />;
    }
    
    console.log('[Navigation] Determinando qué pantalla mostrar...');
    console.log('[Navigation] Estado de autenticación:', isAuthenticated);
    console.log('[Navigation] Usuario:', user ? `ID: ${user.id}, Rol: ${user.rol}` : 'No hay usuario');
    console.log('[Navigation] Tienda seleccionada:', selectedTienda);
    
    // Verificar si el usuario está autenticado
    if (isAuthenticated && token && user) {
      console.log('[Navigation] Usuario autenticado');
      
      // Verificar si hay una tienda seleccionada
      if (selectedTienda) {
        console.log('[Navigation] Tienda seleccionada, mostrando navegador según rol');
        
        // Mostrar el navegador según el rol del usuario
        return getRoleNavigator(user.rol);
      } else {
        console.log('[Navigation] No hay tienda seleccionada, mostrando pantalla de selección de tienda');
        
        // Si no hay tienda seleccionada, mostrar pantalla de selección de tienda
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SeleccionarTienda" component={SeleccionarTiendaScreen} />
            <Stack.Screen name="DetalleCliente" component={DetalleClienteScreen} />
          </Stack.Navigator>
        );
      }
    } else {
      console.log('[Navigation] Usuario no autenticado, mostrando stack de autenticación');
      
      // Si no está autenticado, mostrar stack de autenticación
      return <AuthStack />;
    }
  };
  
  // Renderizar el contenedor de navegación
  return (
    <NavigationContainer>
      {renderScreen()}
    </NavigationContainer>
  );
};

export default Navigation;
