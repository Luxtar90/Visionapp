import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)/shop" />; // Redirige a la pestaña principal
}
