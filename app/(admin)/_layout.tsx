import { Stack } from "expo-router";
import { TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdminLayout() {
  return (
    <Stack 
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6B46C1',
          elevation: Platform.OS === 'android' ? 4 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        animation: 'slide_from_right',
        headerBackTitleVisible: false,
        headerLeft: ({ canGoBack }) => canGoBack ? (
          <TouchableOpacity
            style={{
              marginLeft: 8,
              padding: 8,
              borderRadius: 8,
            }}
            accessibilityLabel="Volver atrás"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null,
      }}
    >
      <Stack.Screen 
        name="Users" 
        options={{ 
          title: "Gestionar Usuarios",
          headerRight: () => (
            <TouchableOpacity
              style={{
                marginRight: 15,
                padding: 8,
                borderRadius: 8,
              }}
              accessibilityLabel="Añadir nuevo usuario"
              accessibilityRole="button"
            >
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen 
        name="Services" 
        options={{ 
          title: "Gestionar Servicios",
          headerRight: () => (
            <TouchableOpacity
              style={{
                marginRight: 15,
                padding: 8,
                borderRadius: 8,
              }}
              accessibilityLabel="Añadir nuevo servicio"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen 
        name="Products" 
        options={{ 
          title: "Gestionar Productos",
          headerRight: () => (
            <TouchableOpacity
              style={{
                marginRight: 15,
                padding: 8,
                borderRadius: 8,
              }}
              accessibilityLabel="Añadir nuevo producto"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen 
        name="Stats" 
        options={{ 
          title: "Estadísticas",
          headerRight: () => (
            <TouchableOpacity
              style={{
                marginRight: 15,
                padding: 8,
                borderRadius: 8,
              }}
              accessibilityLabel="Filtrar estadísticas"
              accessibilityRole="button"
            >
              <Ionicons name="filter" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }} 
      />
    </Stack>
  );
}