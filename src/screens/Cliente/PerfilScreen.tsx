// src/screens/Cliente/PerfilScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  avatar?: string;
}

export default function PerfilScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Cargar los datos del perfil del usuario autenticado
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('[PerfilScreen] Cargando datos del perfil...');
        
        // Obtener los datos del usuario desde AsyncStorage
        const userData = await AsyncStorage.getItem('@user');
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log('[PerfilScreen] Datos de usuario obtenidos:', {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
          });
          
          // Crear objeto de perfil con los datos del usuario
          const userProfile: UserProfile = {
            id: user.id.toString(),
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || '',
            telefono: user.telefono || '',
            direccion: user.direccion || '',
            fecha_nacimiento: user.fecha_nacimiento || '',
            avatar: user.avatar || undefined,
          };
          
          setProfile(userProfile);
          setEditedProfile(userProfile);
          console.log('[PerfilScreen] Perfil cargado correctamente');
        } else {
          console.error('[PerfilScreen] No se encontraron datos de usuario en AsyncStorage');
          Alert.alert(
            'Error',
            'No se pudo cargar la información del perfil. Por favor inicie sesión nuevamente.'
          );
        }
      } catch (error) {
        console.error('[PerfilScreen] Error al cargar el perfil:', error);
        Alert.alert(
          'Error',
          'No se pudo cargar la información del perfil. Por favor intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    
    setSaving(true);
    try {
      // Aquí se llamaría a la API para actualizar el perfil
      // await updateUserProfile(editedProfile);
      
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(editedProfile);
      setEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar el perfil. Por favor intente nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('selectedTienda');
              logout();
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
        <Text style={styles.errorText}>No se pudo cargar la información del perfil</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image 
                source={{ uri: profile.avatar }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatar, styles.noAvatar]}>
                <Text style={styles.avatarInitial}>
                  {profile.nombre.charAt(0)}
                </Text>
              </View>
            )}
            {editing && (
              <TouchableOpacity style={styles.changeAvatarButton}>
                <Ionicons name="camera-outline" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.userName}>
            {profile.nombre} {profile.apellido}
          </Text>
          
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            {!editing ? (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditing(false);
                    setEditedProfile(profile);
                  }}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={18} color="white" />
                      <Text style={styles.saveButtonText}>Guardar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre</Text>
              {editing ? (
                <TextInput
                  style={styles.inputField}
                  value={editedProfile?.nombre}
                  onChangeText={(text) => 
                    setEditedProfile(prev => prev ? {...prev, nombre: text} : null)
                  }
                  placeholder="Nombre"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.nombre}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Apellido</Text>
              {editing ? (
                <TextInput
                  style={styles.inputField}
                  value={editedProfile?.apellido}
                  onChangeText={(text) => 
                    setEditedProfile(prev => prev ? {...prev, apellido: text} : null)
                  }
                  placeholder="Apellido"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.apellido}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              {editing ? (
                <TextInput
                  style={styles.inputField}
                  value={editedProfile?.telefono}
                  onChangeText={(text) => 
                    setEditedProfile(prev => prev ? {...prev, telefono: text} : null)
                  }
                  placeholder="Teléfono"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.telefono}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección</Text>
              {editing ? (
                <TextInput
                  style={styles.inputField}
                  value={editedProfile?.direccion}
                  onChangeText={(text) => 
                    setEditedProfile(prev => prev ? {...prev, direccion: text} : null)
                  }
                  placeholder="Dirección"
                />
              ) : (
                <Text style={styles.infoValue}>{profile.direccion}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
              <Text style={styles.infoValue}>
                {formatDate(profile.fecha_nacimiento)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
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
  scrollContent: {
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  noAvatar: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
  },
  cancelButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  inputField: {
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionsContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});