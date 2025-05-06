// src/components/Admin/AdminProfileHeader.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../hooks/useAuth';
import { getTiendasByUsuario, UsuarioTiendaRelacion } from '../../api/tiendas.api';
import { Tienda } from '../../interfaces/Tienda';

const AdminProfileHeader = () => {
  const [user, setUser] = useState<any>(null);
  const [relaciones, setRelaciones] = useState<UsuarioTiendaRelacion[]>([]);
  const [tiendaActiva, setTiendaActiva] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
        
        // Cargar la tienda activa
        const tiendaId = await AsyncStorage.getItem('selectedTienda');
        if (tiendaId) {
          setTiendaActiva(tiendaId);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    };

    const loadTiendas = async () => {
      try {
        // Obtener las relaciones usuario-tienda
        const relacionesData = await getTiendasByUsuario();
        setRelaciones(relacionesData);
        
        // Si no hay tienda activa pero hay tiendas disponibles, seleccionar la primera
        if (!tiendaActiva && relacionesData.length > 0) {
          const primeraTiendaId = relacionesData[0].tienda.id.toString();
          setTiendaActiva(primeraTiendaId);
          await AsyncStorage.setItem('selectedTienda', primeraTiendaId);
        }
      } catch (error) {
        console.error('Error al cargar tiendas del administrador:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    loadTiendas();
  }, [tiendaActiva]);

  const handleSelectTienda = async (tienda: Tienda) => {
    try {
      const tiendaIdString = tienda.id.toString();
      await AsyncStorage.setItem('selectedTienda', tiendaIdString);
      setTiendaActiva(tiendaIdString);
      Alert.alert('Tienda seleccionada', `Ahora estás administrando: ${tienda.nombre}`);
    } catch (error) {
      console.error('Error al seleccionar tienda:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                user?.foto
                  ? { uri: user.foto }
                  : { uri: 'https://ui-avatars.com/api/?name=' + (user?.nombre || 'Admin') + '&background=random' }
              }
              style={styles.avatar}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nombre || user?.nombre_usuario || 'Administrador'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'admin@example.com'}</Text>
            <Text style={styles.userRole}>Administrador</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tiendasSection}>
        <Text style={styles.sectionTitle}>Mis Tiendas</Text>
        <Text style={styles.sectionSubtitle}>Selecciona la tienda que deseas administrar</Text>
        
        {relaciones.length > 0 ? (
          relaciones.map((relacion) => (
            <TouchableOpacity 
              key={relacion.id} 
              style={[
                styles.tiendaItem,
                tiendaActiva === relacion.tienda.id.toString() && styles.tiendaItemActive
              ]}
              onPress={() => handleSelectTienda(relacion.tienda)}
            >
              <View style={styles.tiendaIconContainer}>
                <Ionicons 
                  name="storefront-outline" 
                  size={24} 
                  color={tiendaActiva === relacion.tienda.id.toString() ? colors.white : colors.primary} 
                />
              </View>
              <View style={styles.tiendaInfo}>
                <Text style={[
                  styles.tiendaNombre,
                  tiendaActiva === relacion.tienda.id.toString() && styles.tiendaTextActive
                ]}>
                  {relacion.tienda.nombre}
                </Text>
                <Text style={[
                  styles.tiendaDireccion,
                  tiendaActiva === relacion.tienda.id.toString() && styles.tiendaTextActive
                ]}>
                  {relacion.tienda.direccion}
                </Text>
                <Text style={[
                  styles.tiendaContacto,
                  tiendaActiva === relacion.tienda.id.toString() && styles.tiendaTextLightActive
                ]}>
                  {relacion.tienda.telefono} • {relacion.tienda.email_contacto || 'Sin email'}
                </Text>
                {relacion.es_administrador && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Administrador</Text>
                  </View>
                )}
              </View>
              {tiendaActiva === relacion.tienda.id.toString() && (
                <View style={styles.tiendaActiveIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.textLight} />
            <Text style={styles.emptyStateText}>No tienes tiendas asignadas</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 4,
    color: colors.danger,
    fontSize: 14,
  },
  tiendasSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  tiendaItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  tiendaItemActive: {
    backgroundColor: colors.primary,
  },
  tiendaIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  tiendaInfo: {
    flex: 1,
  },
  tiendaNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  tiendaDireccion: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  tiendaContacto: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  tiendaTextActive: {
    color: colors.white,
  },
  tiendaTextLightActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tiendaActiveIndicator: {
    marginLeft: 8,
  },
  adminBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyStateText: {
    marginTop: 8,
    color: colors.textLight,
    fontSize: 14,
  },
});

export default AdminProfileHeader;
