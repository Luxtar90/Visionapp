// src/screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigation = useNavigation();
  
  // Mostrar información de depuración sobre el estado de autenticación
  React.useEffect(() => {
    const authStatus = isAuthenticated ? 'Autenticado' : 'No autenticado';
    const userInfo = user ? `${user.nombre} (${user.rol})` : 'No hay usuario';
    setDebugInfo(`Estado: ${authStatus}\nUsuario: ${userInfo}`);
    
    console.log('[LoginScreen] Estado de autenticación actualizado:', { isAuthenticated, user });
    
    // Si el usuario está autenticado, intentar navegar a la pantalla principal
    if (isAuthenticated && user) {
      console.log('[LoginScreen] Usuario autenticado, intentando navegar...');
      // Intentar navegar después de un breve retraso para asegurar que el estado se ha actualizado
      setTimeout(() => {
        console.log('[LoginScreen] Navegando a la pantalla principal...');
        // No es necesario navegar explícitamente, el componente Navigation lo hará
      }, 1000);
    }
  }, [isAuthenticated, user]);

  // Función para verificar la conexión con el backend (solo para desarrollo)
  const checkBackendConnection = async () => {
    try {
      // Intentar hacer una solicitud simple al backend
      const axios = require('axios').default;
      const baseURL = 'http://10.0.2.2:3001'; // URL para emulador Android
      
      const response = await axios.get(baseURL, { timeout: 5000 });
      return true;
    } catch (error) {
      // Intentar con URL alternativa
      try {
        const alternativeURL = 'http://localhost:3001';
        const axios = require('axios').default;
        const response = await axios.get(alternativeURL, { timeout: 5000 });
        return true;
      } catch (altError) {
        return false;
      }
    }
  };

  // La función directLogin ya no es necesaria, usaremos el método centralizado del AuthContext

  const handleLogin = async () => {
    // Validar campos requeridos
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingrese email y contraseña');
      return;
    }

    try {
      setIsLoading(true);
      
      // Verificar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('El formato del email no es válido');
      }
      
      // Verificar longitud mínima de contraseña
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      console.log('[LoginScreen] Iniciando sesión con el método centralizado...');
      // Usar el método centralizado del AuthContext
      await login(email, password);
      
      console.log('[LoginScreen] Sesión iniciada correctamente');
      
      // Si por alguna razón el contexto no se actualiza, mostrar un mensaje
      setTimeout(() => {
        // Verificar si seguimos en la pantalla de login
        if (!isAuthenticated) {
          console.log('[LoginScreen] El estado de autenticación no se actualizó correctamente');
          // Mostrar mensaje informativo
          Alert.alert(
            'Sesión iniciada',
            'Has iniciado sesión correctamente. Redirigiendo...',
            [{ text: 'OK' }]
          );
        }
      }, 1500);
    } catch (error) {
      console.error('[LoginScreen] Error de inicio de sesión:', error);
      
      // Mensaje de error más descriptivo basado en el tipo de error
      let errorMessage = 'Credenciales incorrectas. Por favor intente nuevamente.';
      let errorTitle = 'Error de inicio de sesión';
      
      if (error instanceof Error) {
        // Mensajes específicos basados en el error
        if (error.message.includes('formato del email')) {
          errorTitle = 'Email inválido';
          errorMessage = 'El formato del email no es válido. Debe ser ejemplo@dominio.com';
        } else if (error.message.includes('contraseña debe tener')) {
          errorTitle = 'Contraseña inválida';
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (error.message.includes('inválidas') || error.message.includes('Credenciales')) {
          errorTitle = 'Credenciales inválidas';
          errorMessage = 'Email o contraseña incorrectos. Por favor verifica tus credenciales.';
        } else if (error.message.includes('No se recibió token')) {
          errorTitle = 'Error de autenticación';
          errorMessage = 'El servidor no proporcionó un token de acceso. Por favor contacta al administrador.';
        } else if (error.message.includes('No se recibieron datos de usuario')) {
          errorTitle = 'Error de datos';
          errorMessage = 'No se pudieron obtener los datos del usuario. Por favor contacta al administrador.';
        } else if (error.message.includes('Network') || error.message.includes('network') || error.message.includes('conexión')) {
          errorTitle = 'Error de conexión';
          errorMessage = 'No se pudo conectar con el servidor. Por favor verifica tu conexión a internet.';
        } else if (error.message.includes('404') || error.message.includes('encontró')) {
          errorTitle = 'Servidor no disponible';
          errorMessage = 'El servidor no está disponible en este momento. Por favor intenta más tarde.';
        } else {
          // Usar el mensaje de error original si es específico
          errorMessage = error.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage);
      
      // Actualizar información de depuración
      setDebugInfo(`Estado: No autenticado\nÚltimo error: ${errorTitle} - ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>MultiTienda</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={navigateToRegister}
          >
            <Text style={styles.registerText}>
              ¿No tienes una cuenta? <Text style={styles.registerTextBold}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
          
          {/* Información de depuración - solo visible durante el desarrollo */}
          {__DEV__ && process.env.NODE_ENV === 'development' && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Información de depuración</Text>
              <Text style={styles.debugText}>{debugInfo}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: colors.text,
    fontSize: 14,
  },
  registerTextBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});
