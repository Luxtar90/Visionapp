// src/components/Empleados/EmpleadoDetalleModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Empleado } from './EmpleadoCard';
import { EmpleadoForm } from './EmpleadoForm';
import { ActionButton } from '../common/ActionButton';

interface EmpleadoDetalleModalProps {
  visible: boolean;
  empleado: Empleado | null;
  onClose: () => void;
  onUpdate: (empleado: Partial<Empleado>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const EmpleadoDetalleModal = ({
  visible,
  empleado,
  onClose,
  onUpdate,
  onDelete,
  isLoading
}: EmpleadoDetalleModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleDelete = () => {
    if (!empleado) return;
    
    Alert.alert(
      'Eliminar Empleado',
      `¿Estás seguro de que deseas eliminar a ${empleado.nombre} ${empleado.apellido}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(empleado.id);
              onClose();
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo eliminar el empleado. Inténtalo de nuevo.'
              );
            }
          }
        }
      ]
    );
  };
  
  const handleUpdate = async (data: Partial<Empleado>) => {
    await onUpdate(data);
    setIsEditing(false);
  };
  
  if (!empleado) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Empleado' : 'Detalles del Empleado'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#777" />
            </TouchableOpacity>
          </View>
          
          {isEditing ? (
            <EmpleadoForm
              empleado={empleado}
              onSubmit={handleUpdate}
              isLoading={isLoading}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ScrollView style={styles.detailsContainer}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {empleado.foto_url ? (
                    <Image 
                      source={{ uri: empleado.foto_url }} 
                      style={styles.avatar} 
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.nameContainer}>
                  <Text style={styles.nombre}>
                    {empleado.nombre} {empleado.apellido}
                  </Text>
                  <Text style={styles.especialidad}>{empleado.especialidad}</Text>
                  <View 
                    style={[
                      styles.statusBadge,
                      empleado.activo ? styles.activeBadge : styles.inactiveBadge
                    ]}
                  >
                    <Ionicons 
                      name={empleado.activo ? 'checkmark-circle' : 'close-circle'} 
                      size={16} 
                      color={empleado.activo ? '#2ecc71' : '#e74c3c'} 
                    />
                    <Text 
                      style={[
                        styles.statusText,
                        empleado.activo ? styles.activeText : styles.inactiveText
                      ]}
                    >
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Información de Contacto</Text>
                
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="mail-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoText}>{empleado.email}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="call-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoText}>{empleado.telefono}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.actionsContainer}>
                <ActionButton
                  label="Editar"
                  onPress={() => setIsEditing(true)}
                  variant="primary"
                  icon="create-outline"
                  fullWidth={false}
                />
                
                <ActionButton
                  label="Eliminar"
                  onPress={handleDelete}
                  variant="danger"
                  icon="trash-outline"
                  fullWidth={false}
                  disabled={isLoading}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  detailsContainer: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  nameContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  especialidad: {
    fontSize: 16,
    color: '#777',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#2ecc7120',
  },
  inactiveBadge: {
    backgroundColor: '#e74c3c20',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#2ecc71',
  },
  inactiveText: {
    color: '#e74c3c',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 24,
  },
});
