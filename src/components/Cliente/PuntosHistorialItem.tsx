// src/components/Cliente/PuntosHistorialItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Interfaces
interface PuntosHistorial {
  id: string;
  fecha: string;
  descripcion: string;
  puntos: number;
  tipo: 'ganado' | 'canjeado';
}

interface PuntosHistorialItemProps {
  item: PuntosHistorial;
}

const PuntosHistorialItem: React.FC<PuntosHistorialItemProps> = ({ item }) => {
  // Determinar el icono según el tipo
  const getIconName = () => {
    if (item.tipo === 'ganado') {
      return 'add-circle-outline' as const;
    } else {
      return 'remove-circle-outline' as const;
    }
  };

  // Determinar el color según el tipo
  const getIconColor = (): string => {
    if (item.tipo === 'ganado') {
      return 'green';
    } else {
      return 'red';
    }
  };

  return (
    <View style={styles.puntosItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.tipo === 'ganado' ? '#e6f7e6' : '#ffebeb' }]}>
        <Ionicons name={getIconName()} size={24} color={getIconColor()} />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.descripcionText}>{item.descripcion}</Text>
          <Text style={[styles.puntosText, { color: getIconColor() }]}>
            {item.tipo === 'ganado' ? '+' : '-'}{item.puntos} pts
          </Text>
        </View>
        
        <Text style={styles.fechaText}>{item.fecha}</Text>
        
        <View style={styles.badgeContainer}>
          <View style={[styles.puntosHistorialBadge, { backgroundColor: item.tipo === 'ganado' ? '#e6f7e6' : '#ffebeb' }]}>
            <Text style={[styles.puntosHistorialBadgeText, { color: getIconColor() }]}>
              {item.tipo === 'ganado' ? 'Ganado' : 'Canjeado'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  puntosItem: {
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
  descripcionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  puntosText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fechaText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  puntosHistorialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  puntosHistorialBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PuntosHistorialItem;
