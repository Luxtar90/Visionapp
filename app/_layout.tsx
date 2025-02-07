import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Oculta los headers de navegación
      }}
    />
  );
}

