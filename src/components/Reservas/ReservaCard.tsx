// src/components/Reservas/ReservaCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Reserva } from '../../interfaces/Reserva';

interface ReservaCardProps {
  reserva: Reserva;
  onPress: (reserva: Reserva) => void;
}

export const ReservaCard = ({ reserva, onPress }: ReservaCardProps) => {
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
    <TouchableOpacity 
      style={styles.reservaCard}
      onPress={() => onPress(reserva)}
    >
      <View style={styles.reservaHeader}>
        <View style={styles.reservaFecha}>
          <Ionicons name="calendar-outline" size={16} color="#777" />
          <Text style={styles.reservaFechaText}>
            {formatFecha(reserva.fecha)}
          </Text>
        </View>
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
      
      <View style={styles.reservaContent}>
        <View style={styles.reservaInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#777" />
            <Text style={styles.infoText}>{reserva.hora}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#777" />
            <Text style={styles.infoText}>
              {reserva.cliente.nombre} {reserva.cliente.apellido}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#777" />
            <Text style={styles.infoText}>{reserva.cliente.telefono}</Text>
          </View>
        </View>
        
        <View style={styles.reservaDetalles}>
          <View style={styles.detalleRow}>
            <Text style={styles.detalleLabel}>Servicio:</Text>
            <Text style={styles.detalleText}>{reserva.servicio.nombre}</Text>
          </View>
          
          <View style={styles.detalleRow}>
            <Text style={styles.detalleLabel}>Empleado:</Text>
            <Text style={styles.detalleText}>
              {reserva.empleado.nombre} {reserva.empleado.apellido}
            </Text>
          </View>
          
          <View style={styles.detalleRow}>
            <Text style={styles.detalleLabel}>Duración:</Text>
            <Text style={styles.detalleText}>{reserva.servicio.duracion} min</Text>
          </View>
          
          <View style={styles.detalleRow}>
            <Text style={styles.detalleLabel}>Precio:</Text>
            <Text style={styles.detalleText}>${reserva.servicio.precio.toFixed(2)}</Text>
          </View>
        </View>
      </View>
      
      {reserva.notas && (
        <View style={styles.notasContainer}>
          <Text style={styles.notasLabel}>Notas:</Text>
          <Text style={styles.notasText}>{reserva.notas}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  reservaCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reservaFecha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reservaFechaText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
  reservaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reservaInfo: {
    flex: 1,
    marginRight: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  reservaDetalles: {
    flex: 1,
  },
  detalleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#777',
    width: 80,
  },
  detalleText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  notasContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notasLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notasText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
});
