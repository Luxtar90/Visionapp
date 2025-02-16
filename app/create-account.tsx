import { useState } from "react";
import { useRouter } from "expo-router";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, SafeAreaView, Platform, KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import API_URL from "../config/api";
import CustomAlert from "../components/CustomAlert";

export default function CreateAccount() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleRegister = async () => {
    // Validaciones básicas
    if (!email || !password || !name) {
      showAlert(
        "Campos requeridos",
        "Por favor completa todos los campos",
        'warning'
      );
      return;
    }

    setLoading(true);
    try {
      // Preparamos los datos del usuario con rol cliente
      const userData = {
        name,
        email,
        password,
        telefono: null,
        role: "client" // Rol cliente por defecto
      };

      console.log(" Creando usuario...");
      console.log(" Datos del usuario a crear:", {
        ...userData,
        password: "***"
      });

      // Creamos el usuario
      const userResponse = await axios.post(`${API_URL}/auth/register`, userData);
      const userId = userResponse.data.id;
      console.log(" Usuario creado - ID:", userId);

      if (userId) {
        try {
          // Primero creamos el cliente
          console.log(" Creando perfil de cliente...");
          const clientData = {
            id_user: userId,
            nombre: name,
            email: email,
            telefono: null
          };
          console.log(" Datos del cliente a crear:", clientData);
          
          const clientResponse = await axios.post(`${API_URL}/clients`, clientData);
          console.log(" Cliente creado:", clientResponse.data);

          // Luego creamos la relación cliente-tienda
          console.log(" Creando relación cliente-tienda...");
          await axios.post(`${API_URL}/client-stores`, {
            idCliente: userId,
            idTienda: 1,
            puntosAcumulados: 0
          });
          console.log(" Relación cliente-tienda creada");

          showAlert(
            "¡Cuenta creada!", 
            "Tu cuenta ha sido creada exitosamente. Por favor inicia sesión.",
            'success'
          );

          // Esperamos un momento para que el usuario pueda leer el mensaje
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } catch (error: any) {
          console.error(" Error al configurar la cuenta:", error.response?.data || error);
          // Aún así redirigimos al login ya que el usuario fue creado
          showAlert(
            "Cuenta creada parcialmente",
            "Tu cuenta fue creada pero hubo un error al configurar algunos detalles. Por favor, contacta al soporte.",
            'warning'
          );
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } else {
        throw new Error("No se recibió el ID del usuario en la respuesta");
      }
    } catch (error: any) {
      console.error(" Error en el registro:", error);
      console.error("Detalles del error de registro:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      showAlert(
        "Error al crear cuenta",
        error.response?.data?.message || "Hubo un error al crear tu cuenta",
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
              <Ionicons name="person-add-outline" size={40} color="#6B46C1" />
              <View style={styles.logoGlow} />
            </View>
            
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>¡Únete a nuestra comunidad!</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Nombre completo"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  loading && styles.disabledButton,
                  (email && password && name) && styles.primaryButtonActive
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
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
                onPress={() => router.push("/login")}
                disabled={loading}
              >
                <Ionicons name="log-in-outline" size={24} color="#6B46C1" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Ya tengo una cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  }
});
