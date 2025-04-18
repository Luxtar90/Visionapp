// src/navigation/ClienteTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Import screens
import {
  NuevaReservaScreen,
  MisReservasScreen,
  HistorialScreen,
  PerfilScreen,
  NotificacionesScreen
} from '../screens/Cliente';

const Tab = createBottomTabNavigator();

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

type RouteProps = {
  name: string;
};

export default function ClienteTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProps }) => ({
        tabBarIcon: ({ focused, color, size }: TabIconProps) => {
          let iconName: string = 'help-outline';

          if (route.name === 'NuevaReserva') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'MisReservas') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Notificaciones') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="NuevaReserva" 
        component={NuevaReservaScreen} 
        options={{ title: 'Nueva Reserva' }}
      />
      <Tab.Screen 
        name="MisReservas" 
        component={MisReservasScreen} 
        options={{ title: 'Mis Reservas' }}
      />
      <Tab.Screen 
        name="Historial" 
        component={HistorialScreen} 
        options={{ title: 'Historial' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{ title: 'Mi Perfil' }}
      />
      <Tab.Screen 
        name="Notificaciones" 
        component={NotificacionesScreen} 
        options={{ title: 'Notificaciones' }}
      />
    </Tab.Navigator>
  );
}