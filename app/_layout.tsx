import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../utils/toast';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function Layout() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Rutas públicas */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="create-account" options={{ headerShown: false }} />

          {/* Rutas protegidas */}
          <ProtectedRoute>
            <Stack.Screen 
              name="(tabs)" 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="(profile)" 
              options={{ headerShown: false, presentation: 'modal' }} 
            />
            <Stack.Screen 
              name="(admin)" 
              options={{ headerShown: false }} 
            />
          </ProtectedRoute>
        </Stack>
        <Toast config={toastConfig} />
      </StoreProvider>
    </AuthProvider>
  );
}
