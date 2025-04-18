// src/navigation/AdminTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Import screens directamente
import { ClientesScreen } from '../screens/Admin/ClientesScreen';
import EstadisticasScreen from '../screens/Admin/EstadisticasScreen';
import { InventarioScreen } from '../screens/Admin/InventarioScreen';
import NuevoEmpleadosScreen from '../screens/Admin/NuevoEmpleadosScreen';
import NuevoServiciosScreen from '../screens/Admin/NuevoServiciosScreen';
import NuevoReservasScreen from '../screens/Admin/NuevoReservasScreen';
import TiendasScreen from '../screens/Admin/TiendasScreen';

// Crear alias para las pantallas
const DashboardScreen = EstadisticasScreen;
const EmpleadosScreen = NuevoEmpleadosScreen;
const ServiciosScreen = NuevoServiciosScreen;
const ProductosScreen = InventarioScreen;
const ReservasScreen = NuevoReservasScreen;
const VentasScreen = EstadisticasScreen;
const ConfiguracionScreen = TiendasScreen;

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: string = 'help-outline';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Clientes':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Empleados':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Servicios':
              iconName = focused ? 'cut' : 'cut-outline';
              break;
            case 'Productos':
              iconName = focused ? 'pricetag' : 'pricetag-outline';
              break;
            case 'Reservas':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Ventas':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Configuracion':
              iconName = focused ? 'settings' : 'settings-outline';
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
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Clientes" 
        component={ClientesScreen} 
        options={{ title: 'Clientes' }}
      />
      <Tab.Screen 
        name="Empleados" 
        component={EmpleadosScreen} 
        options={{ title: 'Empleados' }}
      />
      <Tab.Screen 
        name="Servicios" 
        component={ServiciosScreen} 
        options={{ title: 'Servicios' }}
      />
      <Tab.Screen 
        name="Productos" 
        component={ProductosScreen} 
        options={{ title: 'Productos' }}
      />
      <Tab.Screen 
        name="Reservas" 
        component={ReservasScreen} 
        options={{ title: 'Reservas' }}
      />
      <Tab.Screen 
        name="Ventas" 
        component={VentasScreen} 
        options={{ title: 'Ventas' }}
      />
      <Tab.Screen 
        name="Configuracion" 
        component={ConfiguracionScreen} 
        options={{ title: 'Configuración' }}
      />
    </Tab.Navigator>
  );
}