// src/screens/Auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import useAuth from '../../hooks/useAuth';

const LoginScreen = () => {
  // Estados para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateAuthState, isAuthenticated, user } = useAuth();
  const navigation = useNavigation();

  // Verificar si hay una sesión activa al cargar la pantalla
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('@token');
        const userData = await AsyncStorage.getItem('@user');
        
        if (token && userData) {
          console.log('[LoginScreen] Sesión activa detectada');
          
          // Forzar la actualización del estado de autenticación
          try {
            const parsedUser = JSON.parse(userData);
            updateAuthState(token, parsedUser);
            
            // Esperar un momento y luego verificar si el estado se actualizó
            setTimeout(() => {
              if (isAuthenticated) {
                console.log('[LoginScreen] Estado de autenticación actualizado correctamente');
              } else {
                console.log('[LoginScreen] El estado de autenticación no se actualizó correctamente');
              }
            }, 500);
          } catch (error) {
            console.error('[LoginScreen] Error al parsear datos de usuario:', error);
          }
        }
      } catch (error) {
        console.error('[LoginScreen] Error al verificar sesión:', error);
      }
    };
    
    checkSession();
  }, []);

  // Manejar el inicio de sesión
  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validar campos
      if (!email || !password) {
        setError('Por favor, completa todos los campos');
        setIsLoading(false);
        return;
      }

      console.log('[LoginScreen] Intentando login con email:', email);

      // Usar axios directamente para el login
      const baseURL = 'http://10.0.2.2:3001';
      const loginData = { email, password };

      console.log('[LoginScreen] Enviando solicitud de login a:', `${baseURL}/auth/login`);

      const response = await axios.post(`${baseURL}/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('[LoginScreen] Respuesta de login recibida:', {
        accessToken: response.data.accessToken ? 'Presente' : 'No presente',
        status: response.status,
        usuario: response.data.usuario ? JSON.stringify(response.data.usuario) : 'No presente'
      });

      if (response.data.accessToken && response.data.usuario) {
        // Parsear los datos del usuario
        let userData = response.data.usuario;
        if (typeof userData === 'string') {
          userData = JSON.parse(userData);
        }

        // Normalizar el rol según la estructura de la base de datos
        let normalizedRole = userData.rol ? userData.rol.toLowerCase() : '';
        
        // Mapear 'user' a 'cliente' según la memoria del proyecto
        if (normalizedRole === 'user') {
          normalizedRole = 'cliente';
        }
        
        // Asegurarse de que tiendaId sea un string
        const tiendaId = userData.clienteId ? String(userData.clienteId) : '1';
        
        // Crear objeto de usuario normalizado
        const normalizedUser = {
          ...userData,
          rol: normalizedRole,
          clienteId: tiendaId
        };

        console.log('[LoginScreen] Login exitoso:', {
          rol: normalizedRole,
          tiendaId: tiendaId
        });

        try {
          // Guardar directamente en AsyncStorage antes de actualizar el estado
          await AsyncStorage.setItem('@token', response.data.accessToken);
          await AsyncStorage.setItem('@user', JSON.stringify(normalizedUser));
          await AsyncStorage.setItem('selectedTienda', tiendaId);
          
          // Guardar una bandera para forzar la navegación directa
          await AsyncStorage.setItem('@forceNavigation', 'true');
          
          // Actualizar el estado de autenticación en el contexto
          updateAuthState(response.data.accessToken, normalizedUser);
          
          // Mostrar mensaje de éxito
          Alert.alert(
            'Inicio de sesión exitoso',
            `Has iniciado sesión como ${normalizedUser.nombre || normalizedUser.email} (${normalizedRole}).`,
            [
              {
                text: 'Continuar',
                onPress: () => {
                  // Forzar un reinicio completo de la aplicación
                  console.log('[LoginScreen] Forzando reinicio de la aplicación');
                  
                  // Obtener el rol del usuario para navegar correctamente
                  const userRolLowerCase = normalizedRole.toLowerCase();
                  console.log('[LoginScreen] Navegando según rol:', userRolLowerCase);
                  
                  // Intentar navegar directamente
                  try {
                    if (userRolLowerCase === 'admin' || userRolLowerCase === 'administrador') {
                      console.log('[LoginScreen] Navegando a pantalla de administrador');
                      // Resetear la navegación a la pantalla de autenticación
                      // Esto forzará a la aplicación a reevaluar el estado de autenticación
                      // y mostrar el navegador correcto según el rol
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    } else if (userRolLowerCase === 'empleado' || userRolLowerCase === 'vendedor') {
                      console.log('[LoginScreen] Navegando a pantalla de empleado');
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    } else {
                      console.log('[LoginScreen] Navegando a pantalla de cliente');
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    }
                  } catch (navError) {
                    console.error('[LoginScreen] Error al navegar:', navError);
                    
                    // Si hay un error de navegación, intentar con un enfoque alternativo
                    setTimeout(() => {
                      console.log('[LoginScreen] Intentando navegación alternativa');
                      try {
                        // Forzar un reinicio completo de la aplicación
                        navigation.navigate('Login');
                      } catch (e) {
                        console.error('[LoginScreen] Error en navegación alternativa:', e);
                      }
                    }, 100);
                  }
                }
              }
            ]
          );
        } catch (storageError) {
          console.error('[LoginScreen] Error al guardar datos:', storageError);
          setError('Error al guardar los datos de sesión');
        }
      } else {
        setError('Respuesta del servidor incompleta');
      }
    } catch (error) {
      console.error('[LoginScreen] Error de login:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        // Error con respuesta del servidor
        const statusCode = error.response.status;
        
        if (statusCode === 401) {
          setError('Credenciales incorrectas');
        } else if (statusCode === 404) {
          setError('Usuario no encontrado');
        } else {
          setError(`Error del servidor: ${statusCode}`);
        }
      } else {
        // Error de red u otro tipo de error
        setError('Error de conexión. Verifica tu conexión a internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navegar a la pantalla de registro
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.registerButton}
            onPress={navigateToRegister}
          >
            <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
