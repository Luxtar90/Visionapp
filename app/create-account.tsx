import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import API_URL from "../src/constants/config"; // 🛠 Importar la URL del backend

export default function CreateAccount() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      console.log("📡 Enviando solicitud a:", `${API_URL}/auth/register`);
      console.log("📤 Datos enviados:", { name, email, password });

      // 1. Primero registramos el usuario
      const userResponse = await axios.post(`${API_URL}/auth/register`, { 
        name, 
        email, 
        password,
        role: 'client'
      });

      console.log("✅ Usuario registrado:", userResponse.data);

      if (userResponse.status === 201) {
        // La respuesta viene directamente con los datos del usuario
        const userId = userResponse.data.id;

        // 3. Creamos el cliente con el mismo ID
        try {
          const clientResponse = await axios.post(`${API_URL}/clients`, {
            userId: userId,
            name: name
          });

          console.log("✅ Cliente creado:", clientResponse.data);

          Alert.alert(
            "Éxito", 
            "Cuenta creada correctamente. Por favor inicia sesión.",
            [
              {
                text: "OK",
                onPress: () => router.push("/login")
              }
            ]
          );
        } catch (clientError) {
          console.error("❌ Error al crear el cliente:", clientError);
          Alert.alert(
            "Error", 
            "La cuenta se creó pero hubo un error al registrar el cliente. Por favor, contacta al soporte."
          );
        }
      }
    } catch (error) {
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

      Alert.alert(
        "Error", 
        (error as any).response?.data?.message || 
        "No se pudo crear la cuenta. Por favor, intenta de nuevo."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Nombre completo"
              placeholderTextColor="#718096"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Correo electrónico"
              placeholderTextColor="#718096"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#718096" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Contraseña"
              placeholderTextColor="#718096"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/login")}>
            <Text style={styles.loginLinkText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLinkTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#6B46C1" },
  header: { padding: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", justifyContent: "center", alignItems: "center" },
  content: { flex: 1, backgroundColor: "#FAF5FF", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  titleContainer: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: "bold", color: "#2D3748", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#718096" },
  form: { gap: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 16, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#2D3748" },
  registerButton: { backgroundColor: "#6B46C1", height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 16, shadowColor: "#6B46C1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  registerButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  loginLink: { alignItems: "center", marginTop: 16 },
  loginLinkText: { color: "#718096", fontSize: 14 },
  loginLinkTextBold: { color: "#6B46C1", fontWeight: "bold" },
});
