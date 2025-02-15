import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#6B46C1',
      },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen 
        name="Users" 
        options={{ 
          title: "Gestionar Usuarios",
        }} 
      />
      <Stack.Screen 
        name="Services" 
        options={{ 
          title: "Gestionar Servicios",
        }} 
      />
      <Stack.Screen 
        name="Products" 
        options={{ 
          title: "Gestionar Productos",
        }} 
      />
      <Stack.Screen 
        name="Stats" 
        options={{ 
          title: "Estadísticas",
        }} 
      />
    </Stack>
  );
} 