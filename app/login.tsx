import { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../src/constants/config";  // ✅ Importar la URL de la API

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, ingresa correo y contraseña.");
      return;
    }

    try {
      console.log("📡 Enviando solicitud a:", `${API_URL}/auth/login`);
      console.log("📤 Datos enviados:", { email, password });

      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      console.log("✅ Respuesta del servidor:", response.data);

      if (response.status === 200) {
        const { token, user } = response.data;

        // Guardar `token` y `userId` en AsyncStorage
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("userId", String(user.id));

        console.log("🔐 Token guardado:", token);
        console.log("👤 ID Usuario guardado:", user.id);

        Alert.alert("Bienvenido", "Inicio de sesión exitoso");
        router.push("/(tabs)/search");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Error en la petición Axios:");
        console.error("🔗 URL:", error.config?.url);
        console.error("📡 Método:", error.config?.method);
        console.error("📤 Datos enviados:", error.config?.data);
        console.error("🔴 Código de error:", error.response?.status || "No disponible");
        console.error("📩 Mensaje del servidor:", error.response?.data || "No disponible");
      } else {
        console.error("⚠️ Error desconocido:", error);
      }

      Alert.alert("Error", error.response?.data?.message || "No se pudo conectar con el servidor. Revisa los logs.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="eye-outline" size={40} color="#6B46C1" />
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Correo Electrónico" 
              placeholderTextColor="#718096"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Contraseña" 
              secureTextEntry 
              placeholderTextColor="#718096"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/create-account")}>
            <Text style={styles.secondaryButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5FF" },
  content: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#2D3748", marginTop: 16 },
  subtitle: { fontSize: 16, color: "#718096", marginTop: 8 },
  form: { width: "100%", marginTop: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 16, height: 50, marginBottom: 10 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#2D3748" },
  primaryButton: { backgroundColor: "#6B46C1", height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 16 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  secondaryButton: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#6B46C1", marginTop: 12 },
  secondaryButtonText: { color: "#6B46C1", fontSize: 16, fontWeight: "bold" },
});
