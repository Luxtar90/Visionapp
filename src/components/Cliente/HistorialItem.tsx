// src/components/Cliente/HistorialItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Interfaces
interface HistorialItem {
  id: string;
  fecha: string;
  tipo: 'servicio' | 'producto';
  nombre: string;
  precio: number;
  empleado?: string;
  cantidad?: number;
  puntos?: number;
}

interface HistorialItemProps {
  item: HistorialItem;
}

// Función para formatear el precio
const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

const HistorialItemComponent: React.FC<HistorialItemProps> = ({ item }) => {
  // Determinar el icono según el tipo
  const getIconName = () => {
    if (item.tipo === 'servicio') {
      return 'cut-outline' as const;
    } else {
      return 'basket-outline' as const;
    }
  };

  return (
    <View style={styles.historialItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIconName()} size={24} color={colors.primary} />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.nombreText}>{item.nombre}</Text>
          <Text style={styles.precioText}>${formatPrice(item.precio)}</Text>
        </View>
        
        <View style={styles.detallesContainer}>
          <Text style={styles.fechaText}>{item.fecha}</Text>
          
          {item.empleado && (
            <Text style={styles.empleadoText}>
              Profesional: {item.empleado}
            </Text>
          )}
          
          {item.cantidad && (
            <Text style={styles.cantidadText}>
              Cantidad: {item.cantidad}
            </Text>
          )}
          
          {item.puntos && (
            <View style={styles.puntosContainer}>
              <Text style={styles.puntosText}>
                +{item.puntos} puntos
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.badgeContainer}>
          <View style={styles.historialBadge}>
            <Text style={styles.historialBadgeText}>
              {item.tipo === 'servicio' ? 'Servicio' : 'Producto'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  historialItem: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nombreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  precioText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  detallesContainer: {
    marginBottom: 8,
  },
  fechaText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  empleadoText: {
    fontSize: 14,
    color: colors.text,
  },
  cantidadText: {
    fontSize: 14,
    color: colors.text,
  },
  puntosContainer: {
    marginTop: 4,
  },
  puntosText: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  historialBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  historialBadgeText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default HistorialItemComponent;
