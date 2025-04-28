// src/screens/Auth/RegisterScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaz para las tiendas
interface Tienda {
  id: number;
  nombre: string;
  direccion: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Tienda por defecto (siempre será la tienda 1)
  const defaultTiendaId = 1;
  
  const { updateAuthState } = useAuth();
  const navigation = useNavigation();
  
  // Verificar la conexión al cargar la pantalla
  useEffect(() => {
    checkServerConnection();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validar que todos los campos obligatorios estén completos
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingrese un correo electrónico válido');
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    // Validar requisitos de contraseña
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumberOrSpecial) {
      Alert.alert('Error', 'La contraseña debe contener al menos una letra mayúscula, una minúscula, y un número o carácter especial');
      return false;
    }

    return true;
  };

  // Función para verificar la conexión con el servidor
  const checkServerConnection = async () => {
    try {
      // Usar la ruta raíz (/) que sabemos que funciona según los logs
      const baseURL = 'http://10.0.2.2:3001';
      const connected = await axios.get(baseURL);
      setIsConnected(connected.status === 200);
    } catch (error) {
      console.error('[RegisterScreen] Error al verificar conexión:', error);
      setIsConnected(false);
    }
  };

  // Función para manejar el registro
  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Verificar conexión antes de intentar registrar
      if (!isConnected) {
        try {
          const baseURL = 'http://10.0.2.2:3001';
          const connected = await axios.get(baseURL);
          
          if (connected.status !== 200) {
            throw new Error('No hay conexión con el servidor. Verifica tu conexión a internet.');
          }
          
          setIsConnected(true);
        } catch (error) {
          console.error('[RegisterScreen] Error al verificar conexión:', error);
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        }
      }

      console.log(`[RegisterScreen] Registrando cliente con tiendaId: ${defaultTiendaId}`);
      console.log(`[RegisterScreen] Datos de registro:`, {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password.substring(0, 1) + '***', // Solo mostramos el primer carácter por seguridad
        tiendaId: defaultTiendaId
      });
      
      // Usar axios directamente para registro
      try {
        console.log('[RegisterScreen] Usando axios directamente para registro...');
        
        // Crear el objeto con los datos para el registro
        const baseURL = 'http://10.0.2.2:3001';
        const registerData = {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: 'cliente', // Siempre 'cliente' según las memorias del sistema
          tiendaId: defaultTiendaId || 1 // Por defecto, tienda 1
        };
        
        console.log('[RegisterScreen] Enviando solicitud de registro a:', `${baseURL}/auth/register`);
        console.log('[RegisterScreen] Datos de registro:', {
          ...registerData,
          password: '***' // No mostrar la contraseña en los logs
        });
        
        // Hacer la petición HTTP directamente
        const response = await axios.post(`${baseURL}/auth/register`, registerData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('[RegisterScreen] Respuesta del registro recibida:', {
          status: response.status,
          accessToken: response.data.accessToken ? 'Presente' : 'No presente',
          usuario: response.data.usuario ? JSON.stringify(response.data.usuario) : 'No presente'
        });
        
        // Verificar si el usuario ya viene como string (doble serialización)
        let userData = response.data.usuario;
        if (typeof userData === 'string') {
          try {
            // Intentar parsear el string a objeto
            userData = JSON.parse(userData);
            console.log('[RegisterScreen] Usuario parseado correctamente:', userData);
          } catch (parseError) {
            console.error('[RegisterScreen] Error al parsear usuario (posiblemente ya es un objeto):', parseError);
          }
        }
        
        // Guardar el token y los datos de usuario en AsyncStorage
        await AsyncStorage.setItem('@token', response.data.accessToken);
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        
        // Actualizar el estado de autenticación directamente
        updateAuthState(response.data.accessToken, userData);

        Alert.alert(
          'Registro exitoso', 
          'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } catch (registerError: any) {
        console.error('[RegisterScreen] Error específico de registro:', registerError);
        
        // Mostrar mensaje de error más detallado
        let errorMessage = 'Error al registrar usuario. Por favor intenta nuevamente.';
        
        if (registerError.response) {
          console.error('[RegisterScreen] Error de respuesta:', {
            status: registerError.response.status,
            data: registerError.response.data
          });
          
          if (registerError.response.data && registerError.response.data.message) {
            errorMessage = registerError.response.data.message;
          }
        } else if (registerError.message) {
          errorMessage = registerError.message;
        }
        
        Alert.alert(
          'Error de registro',
          errorMessage,
          [{ text: 'OK' }]
        );
        
        throw registerError;
      }
    } catch (error) {
      console.error('[RegisterScreen] Error de registro:', error);
      setError(error instanceof Error ? error.message : 'Error al registrar usuario');
      
      // Mostrar mensaje de error
      Alert.alert(
        'Error de registro',
        error instanceof Error ? error.message : 'Error al registrar usuario',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
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
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Crear cuenta</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <Text style={styles.label}>Nombre de Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su nombre de usuario"
            value={formData.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
            autoCapitalize="words"
          />
          <Text style={styles.helperText}>Este nombre se usará para identificarte en la aplicación. Los datos personales se solicitarán más adelante.</Text>

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            secureTextEntry
          />

          {/* Botón de registro */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes una cuenta? <Text style={styles.loginTextBold}>Iniciar sesión</Text>
            </Text>
          </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
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
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: colors.text,
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 15,
    fontStyle: 'italic',
  },
});
