// src/components/Cliente/ServicioItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Interfaces
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  tiempo_estimado: number;
  costo: number;
  precio: any;
  categoria: string;
  tiendaId: number;
}

interface ServicioItemProps {
  servicio: Servicio;
  selected: boolean;
  onSelect: (servicioId: number) => void;
}

// Función para formatear el precio
const formatPrice = (price: any): string => {
  if (typeof price === 'number') {
    return price.toFixed(2);
  } else if (typeof price === 'string') {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? price : numPrice.toFixed(2);
  } else {
    return '0.00';
  }
};

const ServicioItem: React.FC<ServicioItemProps> = ({ servicio, selected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.servicioItem, selected && styles.servicioSeleccionado]}
      onPress={() => onSelect(servicio.id)}
    >
      <View style={styles.servicioInfo}>
        <Text style={styles.servicioNombre}>{servicio.nombre}</Text>
        <Text style={styles.servicioDescripcion} numberOfLines={2}>
          {servicio.descripcion}
        </Text>
        <View style={styles.servicioDetalles}>
          <Text style={styles.servicioPrecio}>
            ${formatPrice(servicio.precio)}
          </Text>
          <Text style={styles.servicioTiempo}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            {' '}{servicio.tiempo_estimado} min
          </Text>
        </View>
      </View>
      {selected && (
        <View style={styles.checkContainer}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  servicioItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  servicioSeleccionado: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  servicioDescripcion: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  servicioDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicioPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  servicioTiempo: {
    fontSize: 14,
    color: colors.textLight,
  },
  checkContainer: {
    justifyContent: 'center',
    marginLeft: 12,
  },
});

export default ServicioItem;
