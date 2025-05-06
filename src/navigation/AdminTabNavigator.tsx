// src/navigation/AdminTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Import screens
import {
  DashboardScreen,
  ClientesScreen,
  EmpleadosScreen,
  ServiciosScreen,
  ProductosScreen,
  ReservasScreen,
  VentasScreen,
  ConfiguracionScreen,
  PerfilScreen,
  CatalogoServiciosScreen,
  ContabilidadScreen,
  InformesFinancierosScreen,
  MarketingScreen
} from '../screens/Admin';

// Import custom tab bar
import CustomTabBar from '../components/Admin/CustomTabBar';

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
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Servicios':
              iconName = focused ? 'cut' : 'cut-outline';
              break;
            case 'Productos':
              iconName = focused ? 'cube' : 'cube-outline';
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
            case 'Perfil':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            case 'CatalogoServicios':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Contabilidad':
              iconName = focused ? 'calculator' : 'calculator-outline';
              break;
            case 'InformesFinancieros':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Marketing':
              iconName = focused ? 'megaphone' : 'megaphone-outline';
              break;
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
      tabBar={(props: any) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Clientes" component={ClientesScreen} />
      <Tab.Screen name="Empleados" component={EmpleadosScreen} />
      <Tab.Screen name="Servicios" component={ServiciosScreen} />
      <Tab.Screen name="Productos" component={ProductosScreen} />
      <Tab.Screen name="Reservas" component={ReservasScreen} />
      <Tab.Screen name="Ventas" component={VentasScreen} />
      <Tab.Screen name="Configuracion" component={ConfiguracionScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen 
        name="CatalogoServicios" 
        component={CatalogoServiciosScreen} 
        options={{ title: 'Catálogo de Servicios' }}
      />
      <Tab.Screen name="Contabilidad" component={ContabilidadScreen} />
      <Tab.Screen 
        name="InformesFinancieros" 
        component={InformesFinancierosScreen}
        options={{ title: 'Informes Financieros' }}
      />
      <Tab.Screen name="Marketing" component={MarketingScreen} />
    </Tab.Navigator>
  );
}