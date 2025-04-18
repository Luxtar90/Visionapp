// src/components/Servicios/ServicioDetalleModal.tsx
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
import { Servicio } from '../../interfaces/Servicio';
import { ServicioForm } from './ServicioForm';
import { ActionButton } from '../common/ActionButton';

interface ServicioDetalleModalProps {
  visible: boolean;
  servicio: Servicio | null;
  onClose: () => void;
  onUpdate: (servicio: Partial<Servicio>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const ServicioDetalleModal = ({
  visible,
  servicio,
  onClose,
  onUpdate,
  onDelete,
  isLoading
}: ServicioDetalleModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const formatPrecio = (precio: number) => {
    return precio.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const formatDuracion = (duracion: number) => {
    if (duracion < 60) {
      return `${duracion} minutos`;
    } else {
      const horas = Math.floor(duracion / 60);
      const minutos = duracion % 60;
      return minutos > 0 ? `${horas} hora(s) y ${minutos} minutos` : `${horas} hora(s)`;
    }
  };
  
  const handleDelete = () => {
    if (!servicio) return;
    
    Alert.alert(
      'Eliminar Servicio',
      `¿Estás seguro de que deseas eliminar el servicio "${servicio.nombre}"?`,
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
              await onDelete(servicio.id);
              onClose();
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo eliminar el servicio. Inténtalo de nuevo.'
              );
            }
          }
        }
      ]
    );
  };
  
  const handleUpdate = async (data: Partial<Servicio>) => {
    await onUpdate(data);
    setIsEditing(false);
  };
  
  if (!servicio) return null;
  
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
              {isEditing ? 'Editar Servicio' : 'Detalles del Servicio'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#777" />
            </TouchableOpacity>
          </View>
          
          {isEditing ? (
            <ServicioForm
              servicio={servicio}
              onSubmit={handleUpdate}
              isLoading={isLoading}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ScrollView style={styles.detailsContainer}>
              <View style={styles.imageContainer}>
                {servicio.imagen_url ? (
                  <Image 
                    source={{ uri: servicio.imagen_url }} 
                    style={styles.imagen} 
                  />
                ) : (
                  <View style={styles.imagenPlaceholder}>
                    <Ionicons name="cut-outline" size={50} color={colors.primary} />
                  </View>
                )}
              </View>
              
              <View style={styles.serviceHeader}>
                <Text style={styles.nombre}>{servicio.nombre}</Text>
                <View style={styles.categoriaContainer}>
                  <Text style={styles.categoria}>{servicio.categoria}</Text>
                </View>
                <View 
                  style={[
                    styles.statusBadge,
                    servicio.activo ? styles.activeBadge : styles.inactiveBadge
                  ]}
                >
                  <Ionicons 
                    name={servicio.activo ? 'checkmark-circle' : 'close-circle'} 
                    size={16} 
                    color={servicio.activo ? '#2ecc71' : '#e74c3c'} 
                  />
                  <Text 
                    style={[
                      styles.statusText,
                      servicio.activo ? styles.activeText : styles.inactiveText
                    ]}
                  >
                    {servicio.activo ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <Text style={styles.descripcion}>{servicio.descripcion}</Text>
              </View>
              
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Detalles</Text>
                
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="cash-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Precio</Text>
                    <Text style={styles.infoText}>{formatPrecio(servicio.precio)}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Duración</Text>
                    <Text style={styles.infoText}>{formatDuracion(servicio.duracion)}</Text>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagen: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  imagenPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  categoriaContainer: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoria: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
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
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
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
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 24,
  },
});
