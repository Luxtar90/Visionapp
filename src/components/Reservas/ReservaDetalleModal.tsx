// src/components/Reservas/ReservaDetalleModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Importamos la interfaz Reserva correctamente
import { Reserva } from '../../interfaces';

interface ReservaDetalleModalProps {
  visible: boolean;
  reserva: Reserva | null;
  onClose: () => void;
  onCambiarEstado: (nuevoEstado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada') => void;
  procesando: boolean;
}

export const ReservaDetalleModal = ({ 
  visible, 
  reserva, 
  onClose, 
  onCambiarEstado, 
  procesando 
}: ReservaDetalleModalProps) => {
  if (!reserva) return null;

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '#f39c12'; // Amarillo
      case 'confirmada':
        return '#3498db'; // Azul
      case 'completada':
        return '#2ecc71'; // Verde
      case 'cancelada':
        return '#e74c3c'; // Rojo
      default:
        return '#777';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'time-outline';
      case 'confirmada':
        return 'checkmark-circle-outline';
      case 'completada':
        return 'checkmark-done-outline';
      case 'cancelada':
        return 'close-circle-outline';
      default:
        return 'help-outline';
    }
  };

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
            <Text style={styles.modalTitle}>Detalles de Reserva</Text>
            <TouchableOpacity 
              onPress={onClose}
              disabled={procesando}
            >
              <Ionicons name="close" size={24} color="#777" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Información General</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Fecha:</Text>
                <Text style={styles.modalText}>{formatFecha(reserva.fecha)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Hora:</Text>
                <Text style={styles.modalText}>{reserva.hora}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Estado:</Text>
                <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(reserva.estado) + '20' }]}>
                  <Ionicons 
                    name={getEstadoIcon(reserva.estado)} 
                    size={16} 
                    color={getEstadoColor(reserva.estado)} 
                  />
                  <Text style={[styles.estadoText, { color: getEstadoColor(reserva.estado) }]}>
                    {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Cliente</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Nombre:</Text>
                <Text style={styles.modalText}>
                  {reserva.cliente.nombre} {reserva.cliente.apellido}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Teléfono:</Text>
                <Text style={styles.modalText}>{reserva.cliente.telefono}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Servicio</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Nombre:</Text>
                <Text style={styles.modalText}>{reserva.servicio.nombre}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Duración:</Text>
                <Text style={styles.modalText}>{reserva.servicio.duracion} min</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Precio:</Text>
                <Text style={styles.modalText}>${reserva.servicio.precio.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Empleado</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Nombre:</Text>
                <Text style={styles.modalText}>
                  {reserva.empleado.nombre} {reserva.empleado.apellido}
                </Text>
              </View>
            </View>

            {reserva.notas && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Notas</Text>
                <Text style={styles.modalNotasText}>{reserva.notas}</Text>
              </View>
            )}
          </View>

          <View style={styles.modalActions}>
            <Text style={styles.modalActionsTitle}>Cambiar Estado</Text>
            <View style={styles.estadoBtnsContainer}>
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#f39c12' }]}
                onPress={() => onCambiarEstado('pendiente')}
                disabled={procesando || reserva.estado === 'pendiente'}
              >
                <Ionicons name="time-outline" size={20} color="white" />
                <Text style={styles.estadoBtnText}>Pendiente</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#3498db' }]}
                onPress={() => onCambiarEstado('confirmada')}
                disabled={procesando || reserva.estado === 'confirmada'}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text style={styles.estadoBtnText}>Confirmar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#2ecc71' }]}
                onPress={() => onCambiarEstado('completada')}
                disabled={procesando || reserva.estado === 'completada'}
              >
                <Ionicons name="checkmark-done-outline" size={20} color="white" />
                <Text style={styles.estadoBtnText}>Completar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.estadoBtn, { backgroundColor: '#e74c3c' }]}
                onPress={() => onCambiarEstado('cancelada')}
                disabled={procesando || reserva.estado === 'cancelada'}
              >
                <Ionicons name="close-circle-outline" size={20} color="white" />
                <Text style={styles.estadoBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    padding: 20,
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  modalBody: {
    maxHeight: 350,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    width: 80,
    fontSize: 14,
    color: '#777',
  },
  modalText: {
    fontSize: 14,
    color: colors.text,
  },
  modalNotasText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  modalActions: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  estadoBtnsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  estadoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  estadoBtnText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 6,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  estadoText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});
