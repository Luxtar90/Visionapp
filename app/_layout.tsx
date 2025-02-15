import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../utils/toast';

export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Oculta los headers de navegación
        }}
      />
      <Toast config={toastConfig} />
    </>
  );
}
