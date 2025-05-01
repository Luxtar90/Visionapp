// src/navigation/PerfilNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import screens
import { PerfilScreen, NotificacionesScreen } from '../screens/Cliente';
import { colors } from '../theme/colors';

// Definir los tipos de pantallas para este navegador
export type PerfilStackParamList = {
  Perfil: undefined;
  Notificaciones: undefined;
};

const Stack = createNativeStackNavigator();

export default function PerfilNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <NotificationButton />,
      }}
    >
      <Stack.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{
          title: 'Mi Perfil',
        }}
      />
      <Stack.Screen 
        name="Notificaciones" 
        component={NotificacionesScreen} 
        options={{
          title: 'Notificaciones',
          headerRight: undefined,
        }}
      />
    </Stack.Navigator>
  );
}

// Componente separado para el botón de notificaciones
function NotificationButton() {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity
      style={{ marginRight: 15 }}
      onPress={() => {
        // @ts-ignore - Ignoramos el error de tipado ya que sabemos que esta pantalla existe
        navigation.navigate('Notificaciones');
      }}
    >
      <Ionicons name="notifications-outline" size={24} color="white" />
    </TouchableOpacity>
  );
}
