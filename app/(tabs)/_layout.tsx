import { Tabs, useRouter } from "expo-router"; // ✅ Importamos useRouter
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function Layout() {
  const router = useRouter(); // ✅ Usamos router para manejar la navegación

  return (
    <Tabs>
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Citas"
        options={{
          title: "Citas",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          headerRight: () => ( // ✅ Eliminamos `navigation` y usamos `router.push`
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => router.push("/listappointments")} // ✅ Ahora funciona sin errores
            >
              <Ionicons name="list" size={24} color="#6B46C1" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="listappointments"
        options={{
          href: null, // ✅ Oculta la tab sin dañar el diseño
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
