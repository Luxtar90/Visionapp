// src/components/Clientes/ClienteDetalleModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cliente } from '../../interfaces/Cliente';
import { ClienteForm } from './ClienteForm';
import { ActionButton } from '../common/ActionButton';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { colors } from '../../theme/colors';

interface ClienteDetalleModalProps {
  visible: boolean;
  cliente: Cliente | null;
  onClose: () => void;
  onUpdate: (data: Partial<Cliente>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const ClienteDetalleModal: React.FC<ClienteDetalleModalProps> = ({
  visible,
  cliente,
  onClose,
  onUpdate,
  onDelete,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    if (!cliente) return;
    
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar a ${cliente.nombre} ${cliente.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          onPress: () => cliente.id && onDelete(cliente.id),
          style: 'destructive'
        }
      ]
    );
  };

  const handleUpdate = (data: Partial<Cliente>) => {
    if (!cliente) return;
    onUpdate({ ...data, id: cliente.id });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!cliente) return null;

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
              <Text style={styles.headerTitle}>Editar Cliente</Text>
              <View style={styles.headerRight} />
            </View>
            
            <ClienteForm
              cliente={cliente}
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
              <Text style={styles.headerTitle}>Detalles del Cliente</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Ionicons name="create-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.content}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {cliente.foto_url ? (
                    <Image source={{ uri: cliente.foto_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {cliente.nombre.charAt(0)}
                        {cliente.apellido.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>
                    {cliente.nombre} {cliente.apellido}
                  </Text>
                  <View style={styles.statusBadge}>
                    <View 
                      style={[
                        styles.statusIndicator, 
                        { backgroundColor: cliente.activo ? colors.success : colors.error }
                      ]} 
                    />
                    <Text style={styles.statusText}>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información de contacto</Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{cliente.email}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="call-outline" size={20} color={colors.text} style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{cliente.telefono}</Text>
                  </View>
                </View>
                
                {cliente.direccion && (
                  <View style={styles.infoItem}>
                    <Ionicons name="location-outline" size={20} color={colors.text} style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Dirección</Text>
                      <Text style={styles.infoValue}>{cliente.direccion}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información personal</Text>
                
                {cliente.fecha_nacimiento && (
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color={colors.text} style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
                      <Text style={styles.infoValue}>{formatDate(cliente.fecha_nacimiento)}</Text>
                    </View>
                  </View>
                )}
                
                {cliente.genero && (
                  <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={20} color={colors.text} style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Género</Text>
                      <Text style={styles.infoValue}>
                        {cliente.genero.charAt(0).toUpperCase() + cliente.genero.slice(1)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos adicionales</Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={20} color={colors.text} style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Fecha de registro</Text>
                    <Text style={styles.infoValue}>{formatDate(cliente.fecha_registro)}</Text>
                  </View>
                </View>
                
                {cliente.ultima_visita && (
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color={colors.text} style={styles.infoIcon} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Última visita</Text>
                      <Text style={styles.infoValue}>{formatDate(cliente.ultima_visita)}</Text>
                    </View>
                  </View>
                )}
                
                {cliente.notas && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.infoLabel}>Notas</Text>
                    <Text style={styles.notesText}>{cliente.notas}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.deleteButtonContainer}>
                <ActionButton
                  title="Eliminar Cliente"
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
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
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
