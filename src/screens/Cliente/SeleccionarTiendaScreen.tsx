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
import { useAuth } from '../../contexts/AuthContext';
import { getTiendasByUsuario } from '../../api/tiendas.api';
import { colors } from '../../theme/colors';
import { Tienda } from '../../interfaces/Tienda';

export default function SeleccionarTiendaScreen() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectTienda, logout } = useAuth();

  useEffect(() => {
    const fetchTiendas = async () => {
      try {
        const data = await getTiendasByUsuario();
        setTiendas(data);
      } catch (error) {
        console.error('Error fetching tiendas:', error);
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

  const handleSelectTienda = async (tiendaId: string) => {
    try {
      // Convertir tiendaId a número ya que selectTienda espera un number
      await selectTienda(Number(tiendaId));
      // No need to navigate, the Navigation component will handle this
    } catch (error) {
      console.error('Error selecting tienda:', error);
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
      console.error('Error logging out:', error);
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
        <Text style={styles.emptyText}>No tienes tiendas asignadas.</Text>
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
      </View>

      <FlatList
        data={tiendas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tiendaItem}
            onPress={() => handleSelectTienda(item.id)}
          >
            <View style={styles.tiendaContent}>
              <Text style={styles.tiendaNombre}>{item.nombre}</Text>
              <Text style={styles.tiendaDireccion}>{item.direccion}</Text>
              <Text style={styles.tiendaContacto}>{item.telefono}</Text>
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
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  tiendaItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tiendaContent: {
    flex: 1,
  },
  tiendaNombre: {
    fontSize: 18,
    fontWeight: '600',
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
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});