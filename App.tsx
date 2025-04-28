// src/App.tsx
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import Navigation from './src/navigation';
import { LogBox } from 'react-native';

// Ignorar advertencias específicas
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Warning: Failed prop type',
  'Require cycle',
  'AsyncStorage has been extracted from react-native',
]);

export default function App() {
  // Efecto para registrar cuando la aplicación se inicia
  useEffect(() => {
    console.log('[App] Aplicación iniciada');
    
    // Registrar cuando la aplicación se desmonta (cierra)
    return () => {
      console.log('[App] Aplicación cerrada');
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
