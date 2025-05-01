// src/components/Cliente/ReservaItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Interfaces
interface Reserva {
  id: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  clienteId: number;
  empleadoId: number;
  servicioId: number;
  tiendaId: number;
  // Campos adicionales para mostrar en la UI
  servicio?: string;
  empleado?: string;
}

interface ReservaItemProps {
  reserva: Reserva;
  onCancelar?: (reservaId: number) => void;
  onReprogramar?: (reservaId: number) => void;
  onCalificar?: (reservaId: number) => void;
}

const ReservaItem: React.FC<ReservaItemProps> = ({ 
  reserva, 
  onCancelar, 
  onReprogramar,
  onCalificar
}) => {
  // Obtener el color del estado
  const getEstadoColor = (): string => {
    switch (reserva.estado) {
      case 'pendiente':
        return colors.warning;
      case 'confirmada':
        return colors.primary;
      case 'cancelada':
        return colors.error;
      case 'completada':
        return colors.success;
      default:
        return colors.textLight;
    }
  };

  // Obtener el icono del estado
  const getEstadoIcon = () => {
    switch (reserva.estado) {
      case 'pendiente':
        return 'time-outline' as const;
      case 'confirmada':
        return 'checkmark-circle-outline' as const;
      case 'cancelada':
        return 'close-circle-outline' as const;
      case 'completada':
        return 'checkmark-done-circle-outline' as const;
      default:
        return 'help-circle-outline' as const;
    }
  };

  // Formatear la fecha
  const formatearFecha = (fecha: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', options);
    } catch (error) {
      return fecha;
    }
  };

  return (
    <View style={styles.reservaItem}>
      <View style={styles.reservaHeader}>
        <View style={styles.fechaContainer}>
          <Ionicons name="calendar-outline" size={16} color={colors.textLight} style={styles.icon} />
          <Text style={styles.fechaText}>
            {formatearFecha(reserva.fecha)}
          </Text>
        </View>
        
        <View style={[styles.estadoBadge, { backgroundColor: `${getEstadoColor()}20` }]}>
          <Ionicons name={getEstadoIcon()} size={14} color={getEstadoColor()} style={styles.estadoIcon} />
          <Text style={[styles.estadoText, { color: getEstadoColor() }]}>
            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.reservaBody}>
        <View style={styles.servicioContainer}>
          <Text style={styles.servicioLabel}>Servicio:</Text>
          <Text style={styles.servicioText}>{reserva.servicio || 'No especificado'}</Text>
        </View>
        
        <View style={styles.empleadoContainer}>
          <Text style={styles.empleadoLabel}>Profesional:</Text>
          <Text style={styles.empleadoText}>{reserva.empleado || 'No especificado'}</Text>
        </View>
        
        <View style={styles.horaContainer}>
          <Text style={styles.horaLabel}>Hora:</Text>
          <Text style={styles.horaText}>{reserva.hora}</Text>
        </View>
      </View>
      
      {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
        <View style={styles.accionesContainer}>
          {onCancelar && (
            <TouchableOpacity
              style={[styles.accionButton, styles.cancelarButton]}
              onPress={() => onCancelar(reserva.id)}
            >
              <Ionicons name="close-circle-outline" size={16} color="white" style={styles.accionIcon} />
              <Text style={styles.accionText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          
          {onReprogramar && (
            <TouchableOpacity
              style={[styles.accionButton, styles.reprogramarButton]}
              onPress={() => onReprogramar(reserva.id)}
            >
              <Ionicons name="calendar-outline" size={16} color="white" style={styles.accionIcon} />
              <Text style={styles.accionText}>Reprogramar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {reserva.estado === 'completada' && onCalificar && (
        <View style={styles.accionesContainer}>
          <TouchableOpacity
            style={[styles.accionButton, styles.calificarButton]}
            onPress={() => onCalificar(reserva.id)}
          >
            <Ionicons name="star-outline" size={16} color="white" style={styles.accionIcon} />
            <Text style={styles.accionText}>Calificar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reservaItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  fechaText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoIcon: {
    marginRight: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reservaBody: {
    marginBottom: 12,
  },
  servicioContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  servicioLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 90,
  },
  servicioText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  empleadoContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  empleadoLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 90,
  },
  empleadoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  horaContainer: {
    flexDirection: 'row',
  },
  horaLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 90,
  },
  horaText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  accionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  accionIcon: {
    marginRight: 4,
  },
  accionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  cancelarButton: {
    backgroundColor: colors.error,
  },
  reprogramarButton: {
    backgroundColor: colors.primary,
  },
  calificarButton: {
    backgroundColor: colors.warning,
  },
});

export default ReservaItem;
