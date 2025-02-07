import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../src/constants/config"; 

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({
    id: null,
    name: "Cargando...",
    email: "Cargando...",
    role: "Cargando...",
    profileImage: "https://via.placeholder.com/100",
  });

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userIdString = await AsyncStorage.getItem("userId");

      if (!token || !userIdString) {
        console.error("🚨 No hay token o userId almacenado");
        Alert.alert("Error", "No has iniciado sesión. Redirigiendo...");
        router.push("/login");
        return;
      }

      const userId = Number(userIdString);
      console.log("📡 Enviando solicitud a:", `${API_URL}/users/${userId}`);

      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Datos del usuario recibidos:", response.data);

      setUser({
        id: response.data.id || userId,
        name: response.data.name || "Usuario",
        email: response.data.email || "Correo no disponible",
        role: response.data.role?.nombre || "Sin rol",
        profileImage: response.data.profileImage || "https://via.placeholder.com/100",
      });
    } catch (error: any) {
      console.error("❌ Error al obtener datos del usuario:", error.response?.data || error);
      Alert.alert("Error", "No se pudo cargar la información del usuario.");
    }
  };

  // ✅ Ejecutar fetchUserData cada vez que la pantalla de perfil se enfoque
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    console.log("🚪 Cerrando sesión...");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editImageButton} onPress={() => alert("Editar Foto")}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>Rol: {user.role}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes de Cuenta</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => user.id && router.push(`/editprofile/${user.id}`)}
          >
            <Ionicons name="person-outline" size={24} color="#6B46C1" />
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={24} color="#718096" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => alert("Configuración de Notificaciones")}>
            <Ionicons name="notifications-outline" size={24} color="#6B46C1" />
            <Text style={styles.menuText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={24} color="#718096" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => alert("Configuración de Privacidad")}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#6B46C1" />
            <Text style={styles.menuText}>Privacidad</Text>
            <Ionicons name="chevron-forward" size={24} color="#718096" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  header: { backgroundColor: "#6B46C1", padding: 20, paddingTop: 60, alignItems: "center", borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileImageContainer: { position: "relative", marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#FFFFFF" },
  editImageButton: { position: "absolute", right: 0, bottom: 0, backgroundColor: "#6B46C1", width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#FFFFFF" },
  name: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 4 },
  email: { fontSize: 16, color: "#E9D8FD", marginBottom: 4 },
  role: { fontSize: 16, color: "#E9D8FD", fontWeight: "bold", marginBottom: 20 },
  content: { padding: 20 },
  section: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: "#6B46C1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2D3748", marginBottom: 16 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  menuText: { flex: 1, marginLeft: 12, fontSize: 16, color: "#4A5568" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF5F5", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#FED7D7" },
  logoutText: { marginLeft: 8, fontSize: 16, fontWeight: "600", color: "#E53E3E" },
});
