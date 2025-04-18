// src/components/Tiendas/TiendaDetalleModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tienda } from '../../interfaces/Tienda';
import { TiendaForm } from './TiendaForm';
import { ActionButton } from '../common/ActionButton';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { colors } from '../../theme/colors';

interface TiendaDetalleModalProps {
  visible: boolean;
  tienda: Tienda | null;
  onClose: () => void;
  onUpdate: (data: Partial<Tienda>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const TiendaDetalleModal: React.FC<TiendaDetalleModalProps> = ({
  visible,
  tienda,
  onClose,
  onUpdate,
  onDelete,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    if (!tienda) return;
    
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar la tienda ${tienda.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          onPress: () => tienda.id && onDelete(tienda.id),
          style: 'destructive'
        }
      ]
    );
  };

  const handleUpdate = (data: Partial<Tienda>) => {
    if (!tienda) return;
    onUpdate({ ...data, id: tienda.id });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleCallPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleSendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleOpenMaps = (direccion: string) => {
    const query = encodeURIComponent(direccion);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  if (!tienda) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {isLoading ? (
          <LoadingIndicator message="Procesando..." />
        ) : isEditing ? (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Editar Tienda</Text>
              <View style={styles.headerRight} />
            </View>
            
            <TiendaForm
              tienda={tienda}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isLoading}
            />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detalles de la Tienda</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Ionicons name="create-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.content}>
              <View style={styles.profileHeader}>
                <View style={styles.logoContainer}>
                  {tienda.logo_url ? (
                    <Image source={{ uri: tienda.logo_url }} style={styles.logo} />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Text style={styles.logoText}>
                        {tienda.nombre.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{tienda.nombre}</Text>
                  <View style={styles.statusBadge}>
                    <View 
                      style={[
                        styles.statusIndicator, 
                        { backgroundColor: tienda.activa ? colors.success : colors.error }
                      ]} 
                    />
                    <Text style={styles.statusText}>
                      {tienda.activa ? 'Activa' : 'Inactiva'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información de contacto</Text>
                
                <TouchableOpacity 
                  style={styles.infoItem}
                  onPress={() => handleOpenMaps(tienda.direccion)}
                >
                  <Ionicons name="location-outline" size={20} color={colors.text} style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <Text style={styles.infoValue}>{tienda.direccion}</Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.infoItem}
                  onPress={() => handleCallPhone(tienda.telefono)}
                >
                  <Ionicons name="call-outline" size={20} color={colors.text} style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{tienda.telefono}</Text>
                  </View>
                  <Ionicons name="call" size={18} color={colors.primary} />
                </TouchableOpacity>
                
                {tienda.email && (
                  <TouchableOpacity 
                    style={styles.infoItem}
                    onPress={() => handleSendEmail(tienda.email || '')}
                  >
                    <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{tienda.email}</Text>
                    </View>
                    <Ionicons name="mail" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
                
                {tienda.horario && (
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={20} color={colors.text} style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Horario</Text>
                      <Text style={styles.infoValue}>{tienda.horario}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información adicional</Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.text} style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Fecha de registro</Text>
                    <Text style={styles.infoValue}>{formatDate(tienda.fecha_registro)}</Text>
                  </View>
                </View>
                
                {tienda.descripcion && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.infoLabel}>Descripción</Text>
                    <Text style={styles.notesText}>{tienda.descripcion}</Text>
                  </View>
                )}
                
                {tienda.ubicacion && (
                  <View style={styles.infoItem}>
                    <Ionicons name="map-outline" size={20} color={colors.text} style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Coordenadas</Text>
                      <Text style={styles.infoValue}>
                        Lat: {tienda.ubicacion.latitud}, Long: {tienda.ubicacion.longitud}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.deleteButtonContainer}>
                <ActionButton
                  label="Eliminar Tienda"
                  onPress={handleDelete}
                  type="danger"
                  icon="trash-outline"
                />
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: colors.text + 'CC',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text + '80',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  deleteButtonContainer: {
    padding: 16,
    marginBottom: 24,
  },
});
