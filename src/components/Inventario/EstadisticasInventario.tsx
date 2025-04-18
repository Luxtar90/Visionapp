// src/components/Inventario/EstadisticasInventario.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '../common/ProgressBar';
import { colors } from '../../theme/colors';

interface EstadisticasInventarioProps {
  estadisticas: {
    total_productos: number;
    valor_inventario: number;
    productos_agotados: number;
    productos_bajo_stock: number;
    movimientos_recientes: number;
  };
  onVerProductosBajoStock?: () => void;
  onVerProductosAgotados?: () => void;
  onVerMovimientos?: () => void;
}

export const EstadisticasInventario: React.FC<EstadisticasInventarioProps> = ({
  estadisticas,
  onVerProductosBajoStock,
  onVerProductosAgotados,
  onVerMovimientos,
}) => {
  const formatMoneda = (valor: number): string => {
    return valor.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
  };

  const getPorcentajeBajoStock = (): number => {
    if (estadisticas.total_productos === 0) return 0;
    return estadisticas.productos_bajo_stock / estadisticas.total_productos;
  };

  const getPorcentajeAgotados = (): number => {
    if (estadisticas.total_productos === 0) return 0;
    return estadisticas.productos_agotados / estadisticas.total_productos;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resumen de Inventario</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="cube" size={20} color={colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Total Productos</Text>
            <Text style={styles.statValue}>{estadisticas.total_productos}</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="cash" size={20} color={colors.success} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Valor Inventario</Text>
            <Text style={styles.statValue}>{formatMoneda(estadisticas.valor_inventario)}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={onVerMovimientos}
          disabled={!onVerMovimientos}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="swap-horizontal" size={20} color={colors.info} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabel}>Movimientos Recientes</Text>
            <Text style={styles.statValue}>{estadisticas.movimientos_recientes}</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.alertasContainer}>
        <Text style={styles.alertasTitulo}>Alertas de Inventario</Text>
        
        <TouchableOpacity 
          style={styles.alertaItem}
          onPress={onVerProductosBajoStock}
          disabled={!onVerProductosBajoStock}
        >
          <View style={styles.alertaHeader}>
            <Text style={styles.alertaLabel}>Productos con Stock Bajo</Text>
            <Text style={[styles.alertaValue, { color: colors.warning }]}>
              {estadisticas.productos_bajo_stock}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={getPorcentajeBajoStock()} 
              color={colors.warning}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(getPorcentajeBajoStock() * 100)}% del total
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.alertaItem}
          onPress={onVerProductosAgotados}
          disabled={!onVerProductosAgotados}
        >
          <View style={styles.alertaHeader}>
            <Text style={styles.alertaLabel}>Productos Agotados</Text>
            <Text style={[styles.alertaValue, { color: colors.error }]}>
              {estadisticas.productos_agotados}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={getPorcentajeAgotados()} 
              color={colors.error}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(getPorcentajeAgotados() * 100)}% del total
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.accionesContainer}>
        <TouchableOpacity 
          style={styles.accionBoton}
          onPress={onVerProductosBajoStock}
          disabled={!onVerProductosBajoStock}
        >
          <Ionicons name="alert-circle" size={16} color={colors.warning} />
          <Text style={styles.accionTexto}>Ver Stock Bajo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.accionBoton}
          onPress={onVerProductosAgotados}
          disabled={!onVerProductosAgotados}
        >
          <Ionicons name="close-circle" size={16} color={colors.error} />
          <Text style={styles.accionTexto}>Ver Agotados</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.accionBoton}
          onPress={onVerMovimientos}
          disabled={!onVerMovimientos}
        >
          <Ionicons name="swap-horizontal" size={16} color={colors.info} />
          <Text style={styles.accionTexto}>Ver Movimientos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
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
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text + '99',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  alertasContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  alertasTitulo: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  alertaItem: {
    marginBottom: 12,
  },
  alertaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertaLabel: {
    fontSize: 14,
    color: colors.text,
  },
  alertaValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.text + '80',
    textAlign: 'right',
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  accionBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
  },
  accionTexto: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
});
