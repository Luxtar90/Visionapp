// src/screens/Cliente/SeleccionarTiendaScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { colors } from '../../theme/colors';

// Interfaz para la estructura de tienda según la respuesta de la API
interface Tienda {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  fecha_registro: string;
}

// Interfaz para la respuesta paginada de la API
interface TiendasResponse {
  items: Tienda[];
  total: number;
}

export default function SeleccionarTiendaScreen() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout, updateAuthState } = useAuth();
  
  // URL base para las solicitudes a la API
  const baseURL = 'http://10.0.2.2:3001';

  useEffect(() => {
    const fetchTiendas = async () => {
      try {
        setLoading(true);
        
        // Obtener el token de autenticación
        const token = await AsyncStorage.getItem('@token');
        
        if (!token) {
          console.error('[SeleccionarTiendaScreen] No se encontró token de autenticación');
          Alert.alert('Error', 'No se pudo autenticar. Por favor inicie sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        console.log('[SeleccionarTiendaScreen] Obteniendo tiendas de la API...');
        
        // Realizar la solicitud con el token de autenticación
        const response = await axios.get<TiendasResponse>(`${baseURL}/tiendas?limit=0&offset=0`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
        
        console.log('[SeleccionarTiendaScreen] Tiendas obtenidas:', response.data.items.length);
        
        // Actualizar el estado con las tiendas obtenidas
        setTiendas(response.data.items);
      } catch (error) {
        console.error('[SeleccionarTiendaScreen] Error al obtener tiendas:', error);
        Alert.alert(
          'Error',
          'No se pudieron cargar las tiendas. Por favor intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTiendas();
  }, []);

  const handleSelectTienda = async (tienda: Tienda) => {
    try {
      console.log('[SeleccionarTiendaScreen] Seleccionando tienda:', tienda.id);
      
      // Guardar el ID de la tienda seleccionada en AsyncStorage
      await AsyncStorage.setItem('selectedTienda', tienda.id.toString());
      
      // Obtener el usuario actual para actualizar el estado de autenticación
      const userDataString = await AsyncStorage.getItem('@user');
      const token = await AsyncStorage.getItem('@token');
      
      if (userDataString && token) {
        const userData = JSON.parse(userDataString);
        
        // Actualizar el estado de autenticación con la tienda seleccionada
        console.log('[AuthContext] Tienda guardada:', tienda.id);
        console.log('[AuthContext] Datos guardados en AsyncStorage correctamente');
        
        // Forzar una actualización del estado de autenticación
        updateAuthState(token, userData);
        
        // Forzar una segunda actualización después de un breve retraso
        setTimeout(() => {
          console.log('[AuthContext] Forzando segunda actualización del estado');
          updateAuthState(token, userData);
        }, 300);
      }
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Tienda Seleccionada',
        `Has seleccionado la tienda "${tienda.nombre}".`,
        [{ text: 'Continuar' }]
      );
      
      // No es necesario navegar, el componente Navigation se encargará de esto
      // basado en la presencia de 'selectedTienda' en AsyncStorage
    } catch (error) {
      console.error('[SeleccionarTiendaScreen] Error al seleccionar tienda:', error);
      Alert.alert(
        'Error',
        'No se pudo seleccionar la tienda. Por favor intente nuevamente.'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[SeleccionarTiendaScreen] Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando tiendas...</Text>
      </View>
    );
  }

  if (tiendas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay tiendas disponibles.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Selecciona una Tienda</Text>
        <Text style={styles.subtitle}>Elige la tienda donde deseas realizar tus reservas</Text>
      </View>

      <FlatList
        data={tiendas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tiendaItem}
            onPress={() => handleSelectTienda(item)}
          >
            <View style={styles.tiendaContent}>
              <Text style={styles.tiendaNombre}>{item.nombre}</Text>
              <Text style={styles.tiendaDireccion}>{item.direccion}</Text>
              <Text style={styles.tiendaContacto}>{item.telefono}</Text>
              <Text style={styles.tiendaEmail}>{item.email_contacto}</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  tiendaItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tiendaContent: {
    flex: 1,
  },
  tiendaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  tiendaDireccion: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  tiendaContacto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tiendaEmail: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  arrowContainer: {
    paddingLeft: 8,
  },
  arrow: {
    fontSize: 24,
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});