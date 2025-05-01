// src/navigation/ClienteTabNavigator.tsx
import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Import screens
import {
  NuevaReservaScreen,
  MisReservasScreen,
  PerfilScreen,
  NotificacionesScreen,
  ProductosScreen,
  CarritoScreen,
  CalificarServicioScreen,
  TodasResenasScreen,
  PuntosScreen
} from '../screens/Cliente';

// Import navigators
import PerfilNavigator from './PerfilNavigator';

// Import custom tab bar
import CustomTabBar from '../components/Cliente/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function ClienteTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          display: 'flex'
        }
      }}
    >
      <Tab.Screen 
        name="NuevaReserva" 
        component={NuevaReservaScreen} 
        options={{ title: 'Reservar' }}
      />
      <Tab.Screen 
        name="MisReservas" 
        component={MisReservasScreen} 
        options={{ title: 'Mis Citas' }}
      />
      <Tab.Screen 
        name="Productos" 
        component={ProductosScreen} 
        options={{ title: 'Productos' }}
      />
      <Tab.Screen 
        name="Puntos" 
        component={PuntosScreen} 
        options={{ 
          title: 'Mis Puntos',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="gift" size={size} color={color} />
              <View 
                style={{ 
                  position: 'absolute', 
                  top: -5, 
                  right: -5, 
                  backgroundColor: colors.accent,
                  borderRadius: 10,
                  width: 14,
                  height: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'white'
                }}
              >
                <Ionicons name="star" size={8} color="white" />
              </View>
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="MiPerfil" 
        component={PerfilScreen} 
        options={{ title: 'Mi Perfil', headerShown: false }}
      />
      
      {/* Pantallas que no aparecen en la barra de navegación */}
      <Tab.Screen 
        name="Carrito" 
        component={CarritoScreen} 
        options={{ 
          title: 'Mi Carrito',
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tab.Screen 
        name="Notificaciones" 
        component={NotificacionesScreen} 
        options={{ 
          title: 'Notificaciones',
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
      
      {/* Pantallas del sistema de reseñas (ocultas del tab navigator) */}
      <Tab.Screen 
        name="CalificarServicio" 
        component={CalificarServicioScreen} 
        options={{ 
          title: 'Calificar Servicio',
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
      <Tab.Screen 
        name="TodasResenas" 
        component={TodasResenasScreen} 
        options={{ 
          title: 'Reseñas',
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tab.Navigator>
  );
}