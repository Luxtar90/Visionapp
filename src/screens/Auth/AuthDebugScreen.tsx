import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';

const AuthDebugScreen = () => {
  const [storageData, setStorageData] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { isAuthenticated, user, token, login } = useAuth();

  // Cargar datos de AsyncStorage al montar el componente
  useEffect(() => {
    loadStorageData();
  }, []);

  // Función para cargar datos de AsyncStorage
  const loadStorageData = async () => {
    setLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result: {[key: string]: string} = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        result[key] = value || 'null';
      }
      
      setStorageData(result);
    } catch (error) {
      console.error('Error al cargar datos de AsyncStorage:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de AsyncStorage');
    } finally {
      setLoading(false);
    }
  };

  // Función para forzar la autenticación directamente
  const forceAuthentication = async () => {
    try {
      // Verificar si ya hay datos en AsyncStorage
      const token = await AsyncStorage.getItem('@token');
      const userData = await AsyncStorage.getItem('@user');
      
      if (token && userData) {
        Alert.alert(
          'Forzar autenticación',
          'Ya hay datos de autenticación en AsyncStorage. ¿Quieres forzar la actualización del estado?',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Forzar',
              onPress: async () => {
                // Parsear los datos del usuario
                const user = JSON.parse(userData);
                
                // Llamar a la función login con el token y usuario existentes
                login(token, user);
                
                Alert.alert('Estado actualizado', 'Se ha forzado la actualización del estado de autenticación');
                
                // Recargar datos
                loadStorageData();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No hay datos de autenticación en AsyncStorage');
      }
    } catch (error) {
      console.error('Error al forzar autenticación:', error);
      Alert.alert('Error', 'No se pudo forzar la autenticación');
    }
  };

  // Función para limpiar AsyncStorage
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('AsyncStorage limpiado', 'Se han eliminado todos los datos de AsyncStorage');
      loadStorageData();
    } catch (error) {
      console.error('Error al limpiar AsyncStorage:', error);
      Alert.alert('Error', 'No se pudo limpiar AsyncStorage');
    }
  };

  // Función para probar la conexión con el backend
  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const baseURL = 'http://10.0.2.2:3001';
      const response = await axios.get(baseURL);
      Alert.alert('Conexión exitosa', `Respuesta: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Depuración de Autenticación</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado actual de autenticación:</Text>
        <Text style={styles.infoText}>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</Text>
        <Text style={styles.infoText}>Token: {token ? 'Presente' : 'No presente'}</Text>
        <Text style={styles.infoText}>Usuario: {user ? JSON.stringify(user, null, 2) : 'null'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos en AsyncStorage:</Text>
        {Object.entries(storageData).map(([key, value]) => (
          <View key={key} style={styles.storageItem}>
            <Text style={styles.storageKey}>{key}:</Text>
            <Text style={styles.storageValue}>
              {key.includes('token') 
                ? value.substring(0, 20) + '...' 
                : value.length > 100 
                  ? value.substring(0, 100) + '...' 
                  : value}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={loadStorageData} disabled={loading}>
          <Text style={styles.buttonText}>Recargar datos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={forceAuthentication} disabled={loading}>
          <Text style={styles.buttonText}>Forzar autenticación</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testBackendConnection} disabled={loading}>
          <Text style={styles.buttonText}>Probar conexión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearStorage} disabled={loading}>
          <Text style={styles.buttonText}>Limpiar AsyncStorage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  storageItem: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  storageKey: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  storageValue: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AuthDebugScreen;
