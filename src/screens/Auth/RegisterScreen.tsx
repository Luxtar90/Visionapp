// src/screens/Auth/RegisterScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { ApiService } from '../../api/client';

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
  const [statusMessage, setStatusMessage] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Tienda por defecto (siempre será la tienda 1)
  const defaultTiendaId = 1;
  
  const { register } = useAuth();
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
    setStatusMessage('Verificando conexión con el servidor...');
    try {
      const connected = await ApiService.checkConnection();
      setIsConnected(connected);
      
      if (connected) {
        setStatusMessage('Conexión establecida con el servidor');
      } else {
        setStatusMessage('No se pudo conectar con el servidor');
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsConnected(false);
      setStatusMessage('Error al verificar la conexión');
      console.error('[RegisterScreen] Error al verificar conexión:', error);
    }
  };

  // Función para probar el registro directamente con Axios
  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    setStatusMessage('Preparando registro...');

    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Verificar conexión antes de intentar registrar
      if (!isConnected) {
        setStatusMessage('Verificando conexión con el servidor...');
        const connected = await ApiService.checkConnection();
        if (!connected) {
          throw new Error('No hay conexión con el servidor. Verifica tu conexión a internet.');
        }
        setIsConnected(true);
      }

      setStatusMessage('Enviando datos de registro...');
      console.log(`[RegisterScreen] Registrando cliente con tiendaId: ${defaultTiendaId}`);
      
      // Llamar a la función de registro centralizada del AuthContext
      await register({
        nombre: formData.nombre,
        email: formData.email,
        // No necesitamos especificar el rol, ya que todos los nuevos usuarios son clientes
      }, formData.password, defaultTiendaId);
      
      setStatusMessage('Registro completado con éxito');
      console.log('[RegisterScreen] Registro exitoso');

      Alert.alert(
        'Registro exitoso', 
        'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('[RegisterScreen] Error de registro:', error);
      setStatusMessage('Error en el registro');
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
          <Text style={styles.title}>Crear Cuenta</Text>
        </View>

        <View style={styles.formContainer}>
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
  statusMessage: {
    color: '#2196F3',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  connectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  connectionText: {
    fontSize: 12,
    color: '#666',
  },
  // Se eliminaron los estilos del picker ya que ya no se usa
});
