// src/screens/Admin/PerfilScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminProfileHeader from '../../components/Admin/AdminProfileHeader';
import AdminProfileEditMode from '../../components/Admin/AdminProfileEditMode';
import { client } from '../../api/client';

const PerfilScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastLogin, setLastLogin] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }

        // Obtener la fecha del último acceso
        const lastLoginDate = await AsyncStorage.getItem('@lastLogin');
        if (lastLoginDate) {
          setLastLogin(lastLoginDate);
        } else {
          // Si no existe, guardar la fecha actual
          const now = new Date().toLocaleString();
          await AsyncStorage.setItem('@lastLogin', now);
          setLastLogin(now);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    };

    loadUserData();
  }, []);

  const handleEditProfile = () => {
    setEditedProfile({...user});
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedProfile(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Validar campos requeridos
      if (!editedProfile.nombre && !editedProfile.nombre_usuario) {
        Alert.alert('Error', 'El nombre es obligatorio');
        setSaving(false);
        return;
      }
      
      if (!editedProfile.email) {
        Alert.alert('Error', 'El email es obligatorio');
        setSaving(false);
        return;
      }
      
      // Actualizar perfil en el backend
      const response = await client.put(`/usuarios/${user.id}`, editedProfile);
      
      if (response.status === 200) {
        // Actualizar datos en AsyncStorage
        await AsyncStorage.setItem('@user', JSON.stringify(editedProfile));
        
        // Actualizar estado
        setUser(editedProfile);
        setEditing(false);
        setEditedProfile(null);
        
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Cambiar contraseña",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido", style: "default" }]
    );
  };

  const handleToggle2FA = () => {
    Alert.alert(
      "Autenticación de dos factores",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido", style: "default" }]
    );
  };

  const handleToggleNotifications = () => {
    Alert.alert(
      "Configuración de notificaciones",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido", style: "default" }]
    );
  };

  const handleChangeLanguage = () => {
    Alert.alert(
      "Cambiar idioma",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <AdminProfileHeader />
          
          {editing ? (
            <AdminProfileEditMode 
              editedProfile={editedProfile}
              handleInputChange={handleInputChange}
              handleCancel={handleCancelEdit}
              handleSave={handleSaveProfile}
              saving={saving}
            />
          ) : (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Información de la cuenta</Text>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={handleEditProfile}
                >
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>{user?.nombre || user?.nombre_usuario || 'Administrador'}</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'admin@example.com'}</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user?.telefono || 'No especificado'}</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{user?.direccion || 'No especificada'}</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Rol</Text>
                <Text style={styles.infoValue}>Administrador</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>ID de usuario</Text>
                <Text style={styles.infoValue}>{user?.id || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Último acceso</Text>
                <Text style={styles.infoValue}>{lastLogin || new Date().toLocaleString()}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Seguridad</Text>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleChangePassword}>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Contraseña</Text>
                <Text style={styles.actionValue}>********</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleToggle2FA}>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Autenticación de dos factores</Text>
                <Text style={styles.actionValue}>No activada</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Sesiones activas</Text>
              <Text style={styles.infoValue}>1 dispositivo</Text>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preferencias</Text>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleToggleNotifications}>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Notificaciones</Text>
                <Text style={styles.actionValue}>Activadas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleChangeLanguage}>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Idioma</Text>
                <Text style={styles.actionValue}>Español</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Zona horaria</Text>
              <Text style={styles.infoValue}>América/Bogotá (UTC-5)</Text>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Información del sistema</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Versión de la aplicación</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Plataforma</Text>
              <Text style={styles.infoValue}>Android</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Última actualización</Text>
              <Text style={styles.infoValue}>05/05/2025</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}> 2025 Multitienda. Todos los derechos reservados.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  sectionContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  actionValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default PerfilScreen;
