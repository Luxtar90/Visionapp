import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)/search" />; // Redirige a la pestaña de búsqueda
}
