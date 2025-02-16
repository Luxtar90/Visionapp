import { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, 
  ActivityIndicator, Modal, Platform, KeyboardAvoidingView, ScrollView 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_URL from "../config/api";
import CustomAlert from "../components/CustomAlert";

interface Store {
  id: number;
  nombre: string;
  direccion: string;
  numero_celular: string;
  email: string;
  puntos_acumulados: number;
  ultima_visita: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nombre: string;
  };
  client_id?: number;
  tiendas?: Store[];
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<'email' | 'password' | null>(null);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlert({
      visible: true,
      title,
      message,
      type
    });
  };

  const openModal = (field: 'email' | 'password') => {
    setCurrentField(field);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentField(null);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert(
        "Campos requeridos", 
        "Por favor, ingresa tu correo y contraseña",
        'warning'
      );
      return;
    }

    if (!validateEmail(email)) {
      showAlert(
        "Correo inválido",
        "Por favor, ingresa un correo electrónico válido",
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Intentando iniciar sesión...");
      
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("✅ Inicio de sesión exitoso");

      // Guardar token y datos del usuario
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('userId', response.data.user.id.toString());
      
      console.log("✅ Datos del usuario recibidos:", response.data);
      console.log("📡 Enviando solicitud a:", `${API_URL}/users/${response.data.user.id}`);

      // Obtener datos adicionales del usuario
      const userResponse = await axios.get(`${API_URL}/users/${response.data.user.id}`, {
        headers: {
          Authorization: `Bearer ${response.data.token}`,
        },
      });

      console.log("✅ Datos del usuario recibidos:", userResponse.data);

      // Si es un cliente, obtenemos las tiendas asociadas
      console.log("📝 Obteniendo tiendas asociadas...");
      const storesResponse = await axios.get(
        `${API_URL}/client-stores/client/${response.data.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${response.data.token}`,
          },
        }
      );

      console.log("✅ Tiendas obtenidas:", storesResponse.data);

      if (!storesResponse.data || storesResponse.data.length === 0) {
        console.log("⚠️ No se encontraron tiendas para este usuario");
        showAlert(
          "Sin tiendas asignadas",
          "No tienes tiendas asignadas a tu cuenta",
          'warning'
        );
        return;
      }

      // Extraemos las tiendas de la respuesta
      const firstClientStore = storesResponse.data[0];
      const firstStore = firstClientStore.store;

      console.log("📝 Primera tienda encontrada:", firstStore);

      if (!firstStore || !firstStore.id) {
        console.error("❌ Error: La tienda no tiene un ID válido");
        showAlert(
          "Error",
          "Error al obtener los datos de la tienda",
          'error'
        );
        return;
      }

      // Guardamos la primera tienda como actual
      await AsyncStorage.setItem("currentStoreId", firstStore.id.toString());
      await AsyncStorage.setItem("currentStoreName", firstStore.name);

      console.log("✅ Tienda actual guardada:", {
        id: firstStore.id,
        name: firstStore.name
      });

      showAlert(
        "¡Bienvenido!",
        "Has iniciado sesión correctamente",
        'success'
      );

      // Redirigimos a la pantalla principal
      setTimeout(() => {
        router.replace("/(tabs)/profile");
      }, 1000);

    } catch (error: any) {
      console.error("❌ Error en el inicio de sesión:", error);
      console.error("Detalles del error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      showAlert(
        "Error de inicio de sesión",
        error.response?.data?.message || "Credenciales incorrectas",
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="eye-outline" size={40} color="#6B46C1" />
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

            <View style={styles.form}>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => openModal('email')}
              >
                <Ionicons name="mail-outline" size={24} color="#666" />
                <Text style={[styles.input, email ? styles.filledInput : styles.placeholderText]}>
                  {email || "Correo electrónico"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => openModal('password')}
              >
                <Ionicons name="lock-closed-outline" size={24} color="#666" />
                <Text style={[styles.input, password ? styles.filledInput : styles.placeholderText]}>
                  {password ? "••••••••" : "Contraseña"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  loading && styles.disabledButton,
                  email.length > 0 && password.length > 0 && styles.primaryButtonActive
                ]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>O</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => router.push("/create-account")}
                disabled={loading}
              >
                <Ionicons name="person-add-outline" size={24} color="#6B46C1" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Crear Nueva Cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentField === 'email' ? "Correo electrónico" : "Contraseña"}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputContainer}>
              <Ionicons 
                name={currentField === 'email' ? "mail-outline" : "lock-closed-outline"} 
                size={24} 
                color="#6B46C1" 
              />
              <TextInput
                style={styles.modalInput}
                placeholder={currentField === 'email' ? "Correo electrónico" : "Contraseña"}
                value={currentField === 'email' ? email : password}
                onChangeText={currentField === 'email' ? setEmail : setPassword}
                keyboardType={currentField === 'email' ? "email-address" : "default"}
                secureTextEntry={currentField === 'password' && !showPassword}
                autoCapitalize="none"
                autoFocus={true}
              />
              {currentField === 'password' && (
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.modalEyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={closeModal}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAF5FF" 
  },
  content: { 
    flex: 1, 
    padding: 24, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3EAFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 5,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6B46C1",
    opacity: 0.15,
    transform: [{ scale: 1.2 }],
  },
  title: { 
    fontSize: 36,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: { 
    fontSize: 17,
    color: "#718096",
    letterSpacing: 0.3,
  },
  form: { 
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: 32,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  inputContainer: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
  },
  passwordInput: {
    flex: 1,
    marginRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
  primaryButton: { 
    flexDirection: "row",
    backgroundColor: "#9F7AEA",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonActive: {
    backgroundColor: "#6B46C1",
    shadowOpacity: 0.3,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#E9D8FD",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: { 
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    color: "#718096",
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "500",
  },
  secondaryButton: { 
    flexDirection: "row",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E9D8FD",
    backgroundColor: "#FAF5FF",
  },
  secondaryButtonText: { 
    color: "#6B46C1",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  modalInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  modalEyeIcon: {
    padding: 5,
  },
  modalButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#718096',
  },
  filledInput: {
    color: '#2D3748',
  },
});
