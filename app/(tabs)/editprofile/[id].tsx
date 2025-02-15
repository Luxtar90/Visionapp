import { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../../../src/constants/config";

export default function EditProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const [userId, setUserId] = useState<string | null>(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    telefono: "",
    role: "", // Se mantiene el rol del usuario
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userIdToUse = id;

        if (!userIdToUse) {
          const storedUserId = await AsyncStorage.getItem("userId");
          if (!storedUserId) {
            Alert.alert("Error", "No se encontró el ID del usuario.");
            router.push("/login");
            return;
          }
          userIdToUse = storedUserId;
        }

        setUserId(Array.isArray(userIdToUse) ? userIdToUse[0] : userIdToUse);
        const token = await AsyncStorage.getItem("token");

        console.log(" Cargando datos del usuario con ID:", userIdToUse);

        const response = await axios.get(`${API_URL}/users/${userIdToUse}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          console.log(" Datos del usuario recibidos:", response.data);

          setUser({
            name: response.data.name || "",
            email: response.data.email || "",
            telefono: response.data.telefono || "",
            role: response.data.role?.nombre || "Sin rol", // Se mantiene el rol
          });
        } else {
          throw new Error(`Error en la API: ${response.status}`);
        }
      } catch (error: any) {
        console.error(" Error al obtener datos del usuario:", error.response?.data || error);
        Alert.alert("Error", "No se pudo cargar la información del usuario.");
      }
    };

    fetchUserData();
  }, [id]);

  const handleSave = async () => {
    if (!user.name || !user.email) {
      Alert.alert("Error", "El nombre y el correo son obligatorios.");
      return;
    }

    try {
      console.log(" Enviando actualización a:", `${API_URL}/users/${userId}`);
      console.log(" Datos enviados:", { name: user.name, email: user.email, telefono: user.telefono, role: user.role });

      const token = await AsyncStorage.getItem("token");

      // Se mantiene el rol sin modificarlo
      await axios.put(`${API_URL}/users/${userId}`, {
        name: user.name,
        email: user.email,
        telefono: user.telefono,
        role: user.role, 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(" Usuario actualizado correctamente.");
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
      
      router.push("/(tabs)/profile");

    } catch (error: any) {
      console.error(" Error al actualizar el usuario:", error.response?.data || error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/profile")}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Nombre"
              placeholderTextColor="#718096"
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Correo electrónico"
              placeholderTextColor="#718096"
              value={user.email}
              onChangeText={(text) => setUser({ ...user, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Teléfono (opcional)"
              placeholderTextColor="#718096"
              value={user.telefono}
              onChangeText={(text) => setUser({ ...user, telefono: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>Rol: {user.role}</Text> 
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#6B46C1" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#6B46C1" },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.2)" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginLeft: 12 },
  content: { flex: 1, backgroundColor: "#FAF5FF", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  form: { gap: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 16, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#2D3748" },
  roleContainer: { alignItems: "center", marginVertical: 10 },
  roleText: { fontSize: 16, fontWeight: "bold", color: "#4A5568" },
  saveButton: { backgroundColor: "#6B46C1", height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 16 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
