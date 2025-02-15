import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../src/constants/config"; 
import { useAlert } from '../../hooks/useAlert';

export default function ProfileScreen() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
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
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      showSuccess('Has cerrado sesión exitosamente', 'Hasta pronto');
      router.push("/login");
    } catch (error) {
      showError('No se pudo cerrar sesión', 'Error');
    }
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
        {/* Panel de Administración - Solo visible para admins */}
        {user.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Panel de Administración</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push("/(admin)/Users" as any)}
            >
              <Ionicons name="people" size={24} color="#6B46C1" />
              <Text style={styles.menuText}>Gestionar Usuarios</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Asignar Roles</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#718096" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push("/(admin)/Services" as any)}
            >
              <Ionicons name="cut" size={24} color="#6B46C1" />
              <Text style={styles.menuText}>Gestionar Servicios</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Nuevo</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#718096" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push("/(admin)/Products" as any)}
            >
              <Ionicons name="basket" size={24} color="#6B46C1" />
              <Text style={styles.menuText}>Gestionar Productos</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Nuevo</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#718096" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push("/(admin)/Stats" as any)}
            >
              <Ionicons name="stats-chart" size={24} color="#6B46C1" />
              <Text style={styles.menuText}>Estadísticas</Text>
              <Ionicons name="chevron-forward" size={24} color="#718096" />
            </TouchableOpacity>
          </View>
        )}

        {/* Ajustes de cuenta existentes */}
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

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#6B46C1" />
            <Text style={styles.menuText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={24} color="#718096" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
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
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FF"
  },
  header: { 
    backgroundColor: "#6B46C1", 
    padding: 24,
    paddingTop: 60, 
    alignItems: "center", 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  profileImageContainer: { 
    position: "relative", 
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImage: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 4, 
    borderColor: "#FFFFFF" 
  },
  editImageButton: { 
    position: "absolute", 
    right: -4, 
    bottom: -4, 
    backgroundColor: "#6B46C1", 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 3, 
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  name: { 
    fontSize: 26, 
    fontWeight: "700", 
    color: "#FFFFFF", 
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  email: { 
    fontSize: 16, 
    color: "#E9D8FD", 
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  role: { 
    fontSize: 15, 
    color: "#FFFFFF", 
    fontWeight: "600", 
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  content: { 
    padding: 20,
    paddingTop: 30,
  },
  section: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 24,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.08)",
  },
  sectionTitle: { 
    fontSize: 19, 
    fontWeight: "700", 
    color: "#2D3748", 
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  menuItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1, 
    borderBottomColor: "#EDF2F7",
  },
  menuText: { 
    flex: 1, 
    marginLeft: 14, 
    fontSize: 16, 
    color: "#4A5568",
    fontWeight: "500",
  },
  logoutButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#FFF5F5", 
    padding: 18,
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: "#FED7D7",
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: { 
    marginLeft: 10, 
    fontSize: 17, 
    fontWeight: "600", 
    color: "#E53E3E",
    letterSpacing: 0.3,
  },
  badgeContainer: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(107, 70, 193, 0.1)",
  },
  badgeText: {
    color: '#6B46C1',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
