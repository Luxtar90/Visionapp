import { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, 
  ActivityIndicator, Modal, Platform, KeyboardAvoidingView, ScrollView 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import API_URL from "../src/constants/config";
import CustomAlert from "../src/components/CustomAlert";

export default function CreateAccount() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState<'name' | 'email' | 'password' | null>(null);
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

  const openModal = (field: 'name' | 'email' | 'password') => {
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

  const validateName = (name: string) => {
    return name.length >= 2;
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showAlert(
        "Campos requeridos", 
        "Por favor, completa todos los campos.",
        'warning'
      );
      return;
    }

    if (!validateName(name)) {
      showAlert(
        "Nombre inválido",
        "El nombre debe tener al menos 2 caracteres",
        'error'
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

    if (password.length < 6) {
      showAlert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 6 caracteres",
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const userResponse = await axios.post(`${API_URL}/auth/register`, { 
        name, 
        email, 
        password,
        role: 'client'
      });

      if (userResponse.status === 201) {
        const userId = userResponse.data.id;

        try {
          const clientResponse = await axios.post(`${API_URL}/clients`, {
            userId: userId,
            name: name
          });

          showAlert(
            "¡Cuenta creada!", 
            "Tu cuenta ha sido creada exitosamente. Por favor inicia sesión.",
            'success'
          );

          // Redirigir después de que se cierre la alerta
          setTimeout(() => {
            router.push("/login");
          }, 1500);

        } catch (clientError) {
          console.error(" Error al crear el cliente:", clientError);
          showAlert(
            "Error", 
            "La cuenta se creó pero hubo un error al registrar el cliente. Por favor, contacta al soporte.",
            'error'
          );
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let errorMessage = "No se pudo crear la cuenta. Por favor, intenta de nuevo.";
        let errorTitle = "Error";

        if (error.response?.status === 409) {
          errorMessage = "El correo electrónico ya está registrado";
          errorTitle = "Cuenta existente";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        showAlert(errorTitle, errorMessage, 'error');
      } else {
        showAlert(
          "Error", 
          "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
          'error'
        );
      }
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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add-outline" size={40} color="#6B46C1" />
                <View style={styles.iconGlow} />
              </View>
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
            </View>

            <View style={styles.form}>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => openModal('name')}
              >
                <Ionicons name="person-outline" size={24} color="#666" />
                <Text style={[styles.input, name ? styles.filledInput : styles.placeholderText]}>
                  {name || "Nombre completo"}
                </Text>
              </TouchableOpacity>

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
                  styles.registerButton,
                  loading && styles.registerButtonDisabled,
                  name.length > 0 && email.length > 0 && password.length > 0 && styles.registerButtonActive
                ]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons 
                      name="checkmark-circle-outline" 
                      size={24} 
                      color="#FFFFFF" 
                      style={styles.buttonIcon} 
                    />
                    <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginLink} 
                onPress={() => router.push("/login")}
                disabled={loading}
              >
                <Text style={styles.loginLinkText}>
                  ¿Ya tienes cuenta? <Text style={styles.loginLinkTextBold}>Inicia sesión</Text>
                </Text>
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
                {currentField === 'name' ? "Nombre completo" : 
                 currentField === 'email' ? "Correo electrónico" : "Contraseña"}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputContainer}>
              <Ionicons 
                name={
                  currentField === 'name' ? "person-outline" :
                  currentField === 'email' ? "mail-outline" : "lock-closed-outline"
                } 
                size={24} 
                color="#6B46C1" 
              />
              <TextInput
                style={styles.modalInput}
                placeholder={
                  currentField === 'name' ? "Nombre completo" :
                  currentField === 'email' ? "Correo electrónico" : "Contraseña"
                }
                value={
                  currentField === 'name' ? name :
                  currentField === 'email' ? email : password
                }
                onChangeText={
                  currentField === 'name' ? setName :
                  currentField === 'email' ? setEmail : setPassword
                }
                keyboardType={currentField === 'email' ? "email-address" : "default"}
                secureTextEntry={currentField === 'password' && !showPassword}
                autoCapitalize={currentField === 'email' ? "none" : "words"}
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
    backgroundColor: "#6B46C1" 
  },
  header: { 
    padding: 16 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  content: { 
    flex: 1, 
    backgroundColor: "#FAF5FF", 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 24 
  },
  titleContainer: { 
    alignItems: "center",
    marginBottom: 32 
  },
  iconContainer: {
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
  iconGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6B46C1",
    opacity: 0.15,
    transform: [{ scale: 1.2 }],
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#2D3748", 
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#718096",
    letterSpacing: 0.3,
  },
  form: { 
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
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
    color: "#2D3748" 
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
  registerButton: { 
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
  registerButtonActive: {
    backgroundColor: "#6B46C1",
    shadowOpacity: 0.3,
    elevation: 6,
  },
  registerButtonDisabled: {
    backgroundColor: "#E9D8FD",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButtonText: { 
    color: "#FFFFFF", 
    fontSize: 17, 
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  loginLink: { 
    alignItems: "center", 
    marginTop: 24 
  },
  loginLinkText: { 
    color: "#718096", 
    fontSize: 15 
  },
  loginLinkTextBold: { 
    color: "#6B46C1", 
    fontWeight: "600" 
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
