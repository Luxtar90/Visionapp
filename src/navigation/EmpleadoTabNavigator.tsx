// src/navigation/EmpleadoTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Import screens
// Importar directamente los componentes individuales
import AgendaScreen from '../screens/Empleado/AgendaScreen';
import MisClientesScreen from '../screens/Empleado/MisClientesScreen';
import RendimientoScreen from '../screens/Empleado/RendimientoScreen';
import { ServiciosAsignadosScreen } from '../screens/Empleado/ServiciosAsignadosScreen';
import { NotificacionesEmpleadoScreen } from '../screens/Empleado/NotificacionesEmpleadoScreen';

const Tab = createBottomTabNavigator();

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

type RouteProps = {
  name: string;
};

export default function EmpleadoTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProps }) => ({
        tabBarIcon: ({ focused, color, size }: TabIconProps) => {
          let iconName: string = 'help-outline';

          switch (route.name) {
            case 'Agenda':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'MisClientes':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'ServiciosAsignados':
              iconName = focused ? 'cut' : 'cut-outline';
              break;
            case 'Rendimiento':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'NotificacionesEmpleado':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Agenda" 
        component={AgendaScreen} 
        options={{ title: 'Mi Agenda' }}
      />
      <Tab.Screen 
        name="MisClientes" 
        component={MisClientesScreen} 
        options={{ title: 'Mis Clientes' }}
      />
      <Tab.Screen 
        name="ServiciosAsignados" 
        component={ServiciosAsignadosScreen} 
        options={{ title: 'Servicios' }}
      />
      <Tab.Screen 
        name="Rendimiento" 
        component={RendimientoScreen} 
        options={{ title: 'Rendimiento' }}
      />
      <Tab.Screen 
        name="NotificacionesEmpleado" 
        component={NotificacionesEmpleadoScreen} 
        options={{ title: 'Notificaciones' }}
      />
    </Tab.Navigator>
  );
}