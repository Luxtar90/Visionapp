// src/components/Inventario/MovimientoCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MovimientoInventario } from '../../interfaces/Producto';
import { colors } from '../../theme/colors';

interface MovimientoCardProps {
  movimiento: MovimientoInventario;
  onPress: (movimiento: MovimientoInventario) => void;
}

export const MovimientoCard: React.FC<MovimientoCardProps> = ({
  movimiento,
  onPress,
}) => {
  const getTipoIcon = (tipo: string): string => {
    switch (tipo) {
      case 'entrada':
        return 'arrow-down';
      case 'salida':
        return 'arrow-up';
      case 'ajuste':
        return 'sync';
      default:
        return 'swap-horizontal';
    }
  };

  const getTipoColor = (tipo: string): string => {
    switch (tipo) {
      case 'entrada':
        return colors.success;
      case 'salida':
        return colors.error;
      case 'ajuste':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getTipoTexto = (tipo: string): string => {
    switch (tipo) {
      case 'entrada':
        return 'Entrada';
      case 'salida':
        return 'Salida';
      case 'ajuste':
        return 'Ajuste';
      default:
        return tipo;
    }
  };

  const formatFecha = (fecha: string): string => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === ayer.toDateString()) {
      return `Ayer, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatMoneda = (valor?: number): string => {
    if (valor === undefined) return 'N/A';
    return valor.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(movimiento)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View 
          style={[
            styles.iconContainer, 
            { backgroundColor: getTipoColor(movimiento.tipo) + '20' }
          ]}
        >
          <Ionicons 
            name={getTipoIcon(movimiento.tipo)} 
            size={24} 
            color={getTipoColor(movimiento.tipo)} 
          />
        </View>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.productoNombre} numberOfLines={1}>
              {movimiento.producto?.nombre || 'Producto'}
            </Text>
            
            <View 
              style={[
                styles.tipoBadge, 
                { backgroundColor: getTipoColor(movimiento.tipo) + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.tipoTexto, 
                  { color: getTipoColor(movimiento.tipo) }
                ]}
              >
                {getTipoTexto(movimiento.tipo)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.motivo} numberOfLines={1}>
            {movimiento.motivo}
          </Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.fecha}>
              {formatFecha(movimiento.fecha)}
            </Text>
            
            {movimiento.documento_referencia && (
              <Text style={styles.referencia}>
                Ref: {movimiento.documento_referencia}
              </Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.cantidadContainer}>
          <Text style={styles.cantidadLabel}>Cantidad:</Text>
          <Text 
            style={[
              styles.cantidadValue,
              { color: getTipoColor(movimiento.tipo) }
            ]}
          >
            {movimiento.tipo === 'salida' ? '-' : movimiento.tipo === 'entrada' ? '+' : '±'}
            {movimiento.cantidad}
          </Text>
        </View>
        
        {(movimiento.tipo === 'entrada' || movimiento.tipo === 'ajuste') && movimiento.costo_total !== undefined && (
          <View style={styles.costoContainer}>
            <Text style={styles.costoLabel}>Costo:</Text>
            <Text style={styles.costoValue}>
              {formatMoneda(movimiento.costo_total)}
            </Text>
          </View>
        )}
        
        <View style={styles.usuarioContainer}>
          <Ionicons name="person-outline" size={14} color={colors.text + '80'} />
          <Text style={styles.usuarioText}>
            {movimiento.usuario_nombre || 'Usuario'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tipoTexto: {
    fontSize: 12,
    fontWeight: '500',
  },
  motivo: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fecha: {
    fontSize: 12,
    color: colors.text + '99',
    marginRight: 8,
  },
  referencia: {
    fontSize: 12,
    color: colors.text + '99',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  cantidadValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  costoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costoLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  costoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  usuarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usuarioText: {
    fontSize: 12,
    color: colors.text + '80',
    marginLeft: 4,
  },
});
